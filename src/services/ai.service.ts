// ============================================================
// Crisis OS — AI Service (BE-04)
// Calls Gemini to structure an incident report into a
// predictable AIStructuredOutput. Always normalizes output
// and falls back to AI_FALLBACK_TEMPLATES on failure.
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  doc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { COLLECTIONS, AI_FALLBACK_TEMPLATES } from '@/lib/constants';
import type { AIStructuredOutput, IncidentType, Role } from '@/lib/types';
import { addTimelineEvent } from '@/services/timeline.service';

// ── Gemini client ────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY as string,
);

const MODEL = 'gemini-1.5-flash';

// ── Prompt template ──────────────────────────────────────────
function buildPrompt(
  type: IncidentType,
  location: string,
  details: string,
): string {
  return `You are an expert crisis response coordinator for a hospitality property (hotel/hostel).
A ${type.replace('_', ' ')} emergency has been reported.

Location: ${location}
Staff report: "${details}"

Respond ONLY with a valid JSON object (no markdown, no explanation) matching this exact schema:
{
  "summary": "<2-3 sentence factual situation summary for internal use>",
  "severity": "<one of: low | medium | high | critical>",
  "guestInstructions": {
    "en": "<calm, clear 1-2 sentence instruction for guests in English, max 60 words>",
    "hi": "<same instruction translated to Hindi>"
  },
  "staffChecklist": [
    "<immediate action 1>",
    "<immediate action 2>",
    "<immediate action 3>",
    "<immediate action 4>",
    "<immediate action 5>"
  ],
  "escalationRecommendation": "<one sentence on whether/how to escalate to external services>",
  "doNotList": [
    "<thing guests/staff must NOT do 1>",
    "<thing guests/staff must NOT do 2>",
    "<thing guests/staff must NOT do 3>"
  ]
}`;
}

// ── Normalizer ───────────────────────────────────────────────
function normalizeOutput(raw: unknown): AIStructuredOutput {
  const r = raw as Record<string, unknown>;

  const severity = ['low', 'medium', 'high', 'critical'].includes(
    r.severity as string,
  )
    ? (r.severity as AIStructuredOutput['severity'])
    : 'high';

  const instructions = r.guestInstructions as Record<string, string> | undefined;

  return {
    summary:                 typeof r.summary === 'string' ? r.summary : 'Emergency situation in progress. Please follow staff instructions.',
    severity,
    guestInstructions: {
      en: instructions?.en ?? 'Please remain calm and follow staff instructions.',
      hi: instructions?.hi ?? 'कृपया शांत रहें और कर्मचारियों के निर्देशों का पालन करें।',
    },
    staffChecklist:          Array.isArray(r.staffChecklist) ? r.staffChecklist.filter(Boolean) : ['Assess situation', 'Alert management', 'Assist guests as needed'],
    escalationRecommendation:typeof r.escalationRecommendation === 'string' ? r.escalationRecommendation : 'Contact relevant emergency services as appropriate.',
    doNotList:               Array.isArray(r.doNotList) ? r.doNotList.filter(Boolean) : [],
  };
}

// ── Fallback ─────────────────────────────────────────────────
function getFallback(type: IncidentType): AIStructuredOutput {
  const known = AI_FALLBACK_TEMPLATES[type as keyof typeof AI_FALLBACK_TEMPLATES];
  if (known) return known as AIStructuredOutput;

  return {
    summary:                 `A ${type.replace('_', ' ')} emergency has been reported. All occupants should follow staff instructions.`,
    severity:                'high',
    guestInstructions: {
      en: 'An emergency has been reported. Please remain calm, stay where you are, and follow all instructions from staff.',
      hi: 'एक आपात स्थिति की सूचना मिली है। कृपया शांत रहें और कर्मचारियों के निर्देशों का पालन करें।',
    },
    staffChecklist: [
      'Alert management immediately',
      'Assess and secure the affected area',
      'Assist any guests requiring help',
      'Document the situation with photos if safe',
      'Stand by for manager instructions',
    ],
    escalationRecommendation: 'Contact relevant emergency services if situation warrants.',
    doNotList: ['Do not put yourself in danger', 'Do not spread unverified information'],
  };
}

// ── Main export ───────────────────────────────────────────────

export interface StructureIncidentParams {
  incidentId: string;
  type: IncidentType;
  location: string;   // human-readable e.g. "Floor 2 – Kitchen Area"
  details: string;
  actorUid: string;
  actorRole: Role;
}

/**
 * Calls Gemini to structure an incident report, stores the result
 * on the incident doc, and emits a timeline event.
 * Always resolves — never throws. Falls back on any failure.
 */
export async function structureIncident(
  params: StructureIncidentParams,
): Promise<AIStructuredOutput> {
  const { incidentId, type, location, details, actorUid, actorRole } = params;

  let output: AIStructuredOutput;

  try {
    const model = genAI.getGenerativeModel({ model: MODEL });
    const prompt = buildPrompt(type, location, details);
    const result = await model.generateContent(prompt);
    const text   = result.response.text().trim();

    // Strip possible markdown code fences
    const jsonText = text.startsWith('```')
      ? text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      : text;

    const parsed = JSON.parse(jsonText);
    output = normalizeOutput(parsed);
  } catch (err) {
    console.warn('[AI] Gemini call failed, using fallback:', err);
    output = getFallback(type);
  }

  // Persist to Firestore
  try {
    const incidentRef = doc(db, COLLECTIONS.INCIDENTS, incidentId);
    await updateDoc(incidentRef, {
      aiOutput:       output,
      aiGeneratedAt:  serverTimestamp(),
    });

    await addTimelineEvent({
      incidentId,
      type: 'ai_generated',
      actorUid,
      actorRole,
      message: `AI structured output generated (severity: ${output.severity})`,
    });
  } catch (storeErr) {
    console.error('[AI] Failed to persist AI output:', storeErr);
  }

  return output;
}
