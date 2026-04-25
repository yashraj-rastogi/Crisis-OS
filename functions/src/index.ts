// ============================================================
// Crisis OS — Cloud Functions Entry Point
// ============================================================

import { initializeApp } from 'firebase-admin/app';

initializeApp();

// BE-01: Auth triggers + role management
export { onUserCreated } from './auth/onUserCreated';
export { setUserRole } from './auth/setUserRole';

// BE-04: Gemini AI structuring (Day 2)
// export * from './gemini/structureIncident';

// BE-05: Broadcast (Day 2)
// export * from './broadcasts/sendBroadcast';

// BE-06: Aggregate counters (Day 2)
// export * from './aggregates/updateCounters';

// BE-07: Handoff summary (Day 3)
// export * from './handoff/generateHandoff';
