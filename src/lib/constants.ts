// ============================================================
// Crisis OS — Shared Constants
// ============================================================

import type { Role, IncidentType, SeverityLevel, GuestStatus, BroadcastScope } from './types';

// ------ Roles -----------------------------------------------
export const ROLES: Role[] = ['org_admin', 'manager', 'staff', 'guest', 'responder'];

export const ROLE_LABELS: Record<Role, string> = {
  org_admin:  'Organization Admin',
  manager:    'Manager',
  staff:      'Staff',
  guest:      'Guest',
  responder:  'Responder',
};

export const ROLE_HOME_ROUTES: Record<Role, string> = {
  org_admin:  '/admin/setup/organization',
  manager:    '/manager/dashboard',
  staff:      '/staff/home',
  guest:      '/guest/home',
  responder:  '/responder',          // will be redirected to specific incident
};

// ------ Incident Types --------------------------------------
export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  fire:          'Fire',
  gas_leak:      'Gas Leak',
  flood:         'Flood / Water Damage',
  power_outage:  'Power Outage',
  food_poisoning:'Food Poisoning',
  medical:       'Medical Emergency',
  security:      'Security Threat',
  structural:    'Structural Damage',
  other:         'Other',
};

export const INCIDENT_TYPES: IncidentType[] = [
  'fire', 'gas_leak', 'flood', 'power_outage',
  'food_poisoning', 'medical', 'security', 'structural', 'other',
];

// ------ Severity --------------------------------------------
export const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  low:      'Low',
  medium:   'Medium',
  high:     'High',
  critical: 'Critical',
};

export const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  low:      'text-green-400 bg-green-900/30 border-green-700',
  medium:   'text-amber-400 bg-amber-900/30 border-amber-700',
  high:     'text-red-400 bg-red-900/30 border-red-700',
  critical: 'text-purple-400 bg-purple-900/30 border-purple-700',
};

// ------ Guest Status ----------------------------------------
export const GUEST_STATUS_LABELS: Record<GuestStatus, string> = {
  safe:          'Safe',
  need_help:     'Needs Help',
  unable_to_move:'Cannot Move',
  pending:       'Not Responded',
};

export const GUEST_STATUS_COLORS: Record<GuestStatus, string> = {
  safe:          'text-green-400 bg-green-900/30 border-green-700',
  need_help:     'text-amber-400 bg-amber-900/30 border-amber-700',
  unable_to_move:'text-red-400 bg-red-900/30 border-red-700',
  pending:       'text-slate-400 bg-slate-800/30 border-slate-700',
};

// ------ Broadcast Scope -------------------------------------
export const BROADCAST_SCOPE_LABELS: Record<BroadcastScope, string> = {
  all:         'All Guests & Staff',
  floor:       'Specific Floor',
  zone:        'Specific Zone',
  'staff-only':'Staff Only',
};

// ------ Incident State Colors -------------------------------
export const INCIDENT_STATE_COLORS = {
  draft:    'text-slate-400 bg-slate-800/30 border-slate-700',
  active:   'text-blue-400 bg-blue-900/30 border-blue-700',
  resolved: 'text-emerald-400 bg-emerald-900/30 border-emerald-700',
};

// ------ Firestore Collection Names --------------------------
export const COLLECTIONS = {
  ORGANIZATIONS:     'organizations',
  PROPERTIES:        'properties',
  FLOORS:            'floors',
  ROOMS:             'rooms',
  USERS:             'users',
  INCIDENTS:         'incidents',
  GUEST_RESPONSES:   'guestResponses',
  BROADCASTS:        'broadcasts',
  TIMELINE:          'timeline',
  HANDOFFS:          'handoffs',
  CHECKLISTS:        'checklists',
  AGGREGATES:        'aggregates',
  HAZARD_PINS:       'hazardPins',
} as const;

// ------ Hazard Pin Types ------------------------------------
import type { HazardPinType } from './types';

export const HAZARD_PIN_LABELS: Record<HazardPinType, string> = {
  danger:         '🔴 Danger Zone',
  caution:        '🟡 Caution Area',
  safe_zone:      '🟢 Safe Zone',
  exit:           '🚪 Exit Route',
  assembly_point: '📍 Assembly Point',
};

export const HAZARD_PIN_COLORS: Record<HazardPinType, { bg: string; border: string; text: string; dot: string }> = {
  danger:         { bg: 'bg-red-900/40',    border: 'border-red-600',    text: 'text-red-400',    dot: 'bg-red-500'    },
  caution:        { bg: 'bg-amber-900/40',  border: 'border-amber-600',  text: 'text-amber-400',  dot: 'bg-amber-500'  },
  safe_zone:      { bg: 'bg-green-900/40',  border: 'border-green-600',  text: 'text-green-400',  dot: 'bg-green-500'  },
  exit:           { bg: 'bg-blue-900/40',   border: 'border-blue-600',   text: 'text-blue-400',   dot: 'bg-blue-500'   },
  assembly_point: { bg: 'bg-purple-900/40', border: 'border-purple-600', text: 'text-purple-400', dot: 'bg-purple-500' },
};

// ------ Join Code -------------------------------------------
export const JOIN_CODE_LENGTH = 6;

// ------ AI Fallback Templates -------------------------------
export const AI_FALLBACK_TEMPLATES = {
  fire: {
    summary: 'A fire emergency has been reported. All occupants must evacuate immediately.',
    severity: 'critical' as SeverityLevel,
    guestInstructions: {
      en: 'FIRE EMERGENCY: Evacuate immediately using the nearest staircase. Do not use elevators. Proceed to the designated muster point outside.',
      hi: 'अग्नि आपातकाल: तुरंत निकटतम सीढ़ी का उपयोग करके निकासी करें। लिफ्ट का उपयोग न करें। बाहर निर्धारित स्थान पर जाएं।',
    },
    staffChecklist: [
      'Sound fire alarm on your floor',
      'Check all rooms and announce evacuation',
      'Assist guests who need help moving',
      'Do not use elevators',
      'Account for all guests at muster point',
    ],
    escalationRecommendation: 'Contact fire department immediately. Alert all floors.',
    doNotList: ['Do not use elevators', 'Do not re-enter the building', 'Do not stop to collect belongings'],
  },
  gas_leak: {
    summary: 'A gas leak has been detected. Immediate evacuation and ventilation required.',
    severity: 'critical' as SeverityLevel,
    guestInstructions: {
      en: 'GAS LEAK: Do not switch any electrical switches. Leave doors open as you exit. Evacuate immediately and do not return until cleared.',
      hi: 'गैस रिसाव: कोई भी बिजली का स्विच न छुएं। निकलते समय दरवाजे खुले छोड़ें। तुरंत निकासी करें और अनुमति मिलने तक वापस न आएं।',
    },
    staffChecklist: [
      'Do not switch any electrical items on or off',
      'Open all windows and doors',
      'Evacuate all guests immediately',
      'Turn off gas supply at main valve if safe to do so',
      'Call emergency services',
    ],
    escalationRecommendation: 'Contact gas emergency services and fire department immediately.',
    doNotList: ['Do not use any electrical switches', 'Do not use mobile phones near leak area', 'Do not use elevators'],
  },
};

// ------ Demo Scenario Data ----------------------------------
export const DEMO_SCENARIO = {
  incident: {
    type: 'gas_leak' as IncidentType,
    location: { floorLabel: 'Floor 2', zone: 'Kitchen', freeText: 'Gas leak detected near kitchen stoves on Floor 2' },
    details: 'Strong smell of gas detected near the kitchen area on Floor 2. Several guests have reported the smell.',
  },
};
