// ============================================================
// Crisis OS — Shared Type Contracts
// Source of truth for all frontend and backend data shapes.
// Any change here must be reflected in both FE and BE.
// ============================================================

// ------ Roles -----------------------------------------------
export type Role =
  | 'org_admin'
  | 'manager'
  | 'staff'
  | 'guest'
  | 'responder';

// ------ Incident --------------------------------------------
export type IncidentState = 'draft' | 'active' | 'resolved';

export type IncidentType =
  | 'fire'
  | 'gas_leak'
  | 'flood'
  | 'power_outage'
  | 'food_poisoning'
  | 'medical'
  | 'security'
  | 'structural'
  | 'other';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

// ------ Broadcast -------------------------------------------
export type BroadcastScope = 'all' | 'floor' | 'zone' | 'staff-only';

// ------ Guest Status ----------------------------------------
export type GuestStatus = 'safe' | 'need_help' | 'unable_to_move' | 'pending';

// ------ Language --------------------------------------------
export type SupportedLanguage = 'en' | 'hi' | 'es' | 'fr';

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: '🇬🇧 English',
  hi: '🇮🇳 हिन्दी',
  es: '🇪🇸 Español',
  fr: '🇫🇷 Français',
};

// ------ Property --------------------------------------------
export type PropertyType = 'hotel' | 'hostel';

// ============================================================
// Entity Interfaces
// ============================================================

export interface Organization {
  id: string;
  name: string;
  contactEmail: string;
  emergencyPhone: string;
  createdAt: Date;
  createdBy: string; // uid of org_admin
}

export interface Property {
  id: string;
  orgId: string;
  name: string;
  type: PropertyType;
  address: string;
  defaultLanguage: SupportedLanguage;
  joinCode: string;        // 6-char property join code
  isActive: boolean;
  createdAt: Date;
}

export interface Floor {
  id: string;
  propertyId: string;
  label: string;           // e.g. "Floor 1", "Ground Floor"
  order: number;
  mapImageUrl?: string;    // URL to floor plan image for map overlay
}

// ------ Hazard Pins (Map Overlay) ----------------------------
export type HazardPinType = 'danger' | 'caution' | 'safe_zone' | 'exit' | 'assembly_point';

export interface HazardPin {
  id: string;
  incidentId: string;
  floorId: string;
  label: string;             // e.g. "Gas Leak Source", "Exit Route"
  type: HazardPinType;
  /** Percentage-based coordinates on the floor plan image (0-100) */
  x: number;
  y: number;
  createdBy: string;
  createdAt: Date;
}

export interface Room {
  id: string;
  floorId: string;
  propertyId: string;
  label: string;           // e.g. "101", "A1"
  zone: string;            // e.g. "North Wing", "Kitchen Area"
  type: 'room' | 'suite' | 'common_area' | 'bed';
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  orgId?: string;
  propertyId?: string;
  roomId?: string;         // for guests
  joinedAt: Date;
}

// ============================================================
// Incident + AI Contracts
// ============================================================

export interface AIStructuredOutput {
  summary: string;
  severity: SeverityLevel;
  guestInstructions: Partial<Record<SupportedLanguage, string>>;
  staffChecklist: string[];
  escalationRecommendation: string;
  doNotList: string[];         // things guests/staff should NOT do
}

export interface Incident {
  id: string;
  propertyId: string;
  orgId: string;
  type: IncidentType;
  location: {
    floorId?: string;
    floorLabel?: string;
    zone?: string;
    freeText: string;        // e.g. "Kitchen area near gas stoves"
  };
  details: string;           // raw input from reporter
  state: IncidentState;
  aiOutput?: AIStructuredOutput;
  aiGeneratedAt?: Date;
  broadcastSentAt?: Date;
  broadcastScope?: BroadcastScope;
  hazardPins?: HazardPin[];  // map overlay pins for this incident
  createdBy: string;         // uid
  createdByRole: Role;
  createdAt: Date;
  resolvedAt?: Date;
  closureNote?: string;
}

// ============================================================
// Guest Response
// ============================================================

export interface GuestResponse {
  id: string;
  incidentId: string;
  propertyId: string;
  guestUid: string;
  guestName: string;
  roomLabel: string;
  floorLabel: string;
  zone?: string;
  status: GuestStatus;
  note?: string;
  respondedAt: Date;
  updatedAt: Date;
}

// ============================================================
// Live Dashboard Aggregates (real-time counters)
// ============================================================

export interface IncidentAggregates {
  incidentId: string;
  total: number;
  safe: number;
  needHelp: number;
  unableToMove: number;
  pending: number;
  lastUpdated: Date;
}

// ============================================================
// Broadcast
// ============================================================

export interface BroadcastMessage {
  id: string;
  incidentId: string;
  propertyId: string;
  scope: BroadcastScope;
  targetFloorId?: string;
  targetZone?: string;
  messageEn: string;
  messageHi?: string;
  sentBy: string;           // manager uid
  sentAt: Date;
}

// ============================================================
// Timeline / Audit
// ============================================================

export type TimelineEventType =
  | 'incident_created'
  | 'ai_generated'
  | 'manager_approved'
  | 'broadcast_sent'
  | 'guest_response'
  | 'staff_update'
  | 'responder_viewed'
  | 'incident_resolved'
  | 'handoff_generated';

export interface TimelineEvent {
  id: string;
  incidentId: string;
  type: TimelineEventType;
  actorUid: string;
  actorRole: Role;
  message: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

// ============================================================
// Responder Handoff
// ============================================================

export interface HandoffSummary {
  id: string;
  incidentId: string;
  propertyId: string;
  summary: string;
  severity: SeverityLevel;
  affectedZones: string[];
  unresolvedCritical: GuestResponse[]; // need_help + unable_to_move
  timeline: TimelineEvent[];
  totalGuests: number;
  safeCount: number;
  helpCount: number;
  unableCount: number;
  pendingCount: number;
  generatedAt: Date;
  generatedBy: string;     // manager uid
  responderLink: string;   // secure read-only URL
}

// ============================================================
// Staff Checklist
// ============================================================

export interface ChecklistItem {
  id: string;
  incidentId: string;
  assignedTo: string;       // staff uid
  task: string;
  floorId?: string;
  zone?: string;
  isComplete: boolean;
  isBlocked: boolean;
  blockNote?: string;
  completedAt?: Date;
}

// ============================================================
// Auth Context Shape
// ============================================================

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  orgId?: string;
  propertyId?: string;
}

// ============================================================
// API Response Wrapper (for Cloud Functions)
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
