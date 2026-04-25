# Crisis OS

AI-powered rapid crisis coordination for hospitality venues.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Problem Statement](#problem-statement)
3. [Updated Solution Scope](#updated-solution-scope)
4. [Role Model and Dashboard Strategy](#role-model-and-dashboard-strategy)
5. [Device Strategy](#device-strategy)
6. [Organization Onboarding Workflow](#organization-onboarding-workflow)
7. [Crisis Response Workflow](#crisis-response-workflow)
8. [MVP Options](#mvp-options)
9. [MVP Screen Coverage](#mvp-screen-coverage)
10. [Recommended Tech Stack](#recommended-tech-stack)
11. [3-Day Execution Snapshot](#3-day-execution-snapshot)
12. [Manual Operations Checklist](#manual-operations-checklist)
13. [Architecture and Data Flow Summary](#architecture-and-data-flow-summary)
14. [Scope Control and Risks](#scope-control-and-risks)
15. [Linked Project Documents](#linked-project-documents)

## Project Overview

`Crisis OS` is a role-based crisis response platform for hotels and hostels, with hospital support marked as future scope.

It creates one synchronized workflow for emergencies so staff, managers, guests, and responders can coordinate in real time.

Theme alignment: `Rapid Crisis Response (Synchronizing the Hospitality Bridge)`

## Problem Statement

Hospitality venues face high-pressure incidents such as fire, gas leaks, food poisoning, power outages, and security threats.

Current workflow gaps:

- Incident details are fragmented across calls, WhatsApp, and verbal updates.
- Guests receive delayed or unclear safety instructions.
- Managers lack a single live command view.
- Staff updates are hard to aggregate by floor and room.
- Responder handoff is often incomplete.

Impact: slower response, higher panic, and avoidable operational and reputational damage.

## Updated Solution Scope

Crisis OS merges the three concept tracks into one product:

- `Hospitality Guard` layer: instant SOS and alerts
- `RespondeSync` layer: centralized command dashboard
- `SafetyAgents` layer: AI-assisted next actions and escalation guidance

Unified flow:

`Report -> Analyze -> Broadcast -> Track -> Respond`

## Role Model and Dashboard Strategy

Crisis OS runs as one web app with role-based views, not separate products.

Roles:

- `Org Admin`: organization and property setup
- `Manager`: command center during incidents
- `Staff`: field reporting and checklist execution
- `Guest`: alert reception and safety check-in
- `Responder` (read-only): incident handoff view

Dashboard strategy:

- Admin setup dashboard for onboarding and configuration
- Manager command dashboard for live incident control
- Staff mobile task dashboard for checklists and updates
- Guest safety pages for join, alerts, and status actions
- Responder read-only dashboard via secure link

## Device Strategy

- `Guest`: mobile-first web experience
- `Staff`: mobile-first web experience
- `Manager`: desktop-first dashboard with mobile-safe controls
- `Org Admin`: desktop-first setup workflows
- `Responder`: mobile and desktop read-only access

## Organization Onboarding Workflow

1. Org admin creates organization.
2. Org admin adds property (`hotel` or `hostel`; `hospital` label optional for future use).
3. Org admin sets floors, rooms, and zones.
4. Org admin uploads floor map image for guidance views.
5. Org admin adds manager and staff accounts.
6. Org admin enables guest join options:
   - property join code
   - room QR
7. Front desk asks guests to join Crisis OS during check-in.
8. Org admin runs drill test and activates property.

## Crisis Response Workflow

1. Staff or manager creates incident draft.
2. Gemini generates structured summary, severity, and role instructions.
3. Manager reviews and broadcasts targeted alert.
4. Guests submit status: `Safe`, `Need Help`, `Unable to Move`.
5. Manager dashboard updates live by room, floor, and zone.
6. Staff executes checklist and posts field updates.
7. Manager shares responder handoff summary.
8. Manager resolves incident and publishes all-clear.

## MVP Options

### MVP A (Recommended Baseline)

Goal: reliable 3-day submission build.

Included:

- Role-based login and route guards
- Admin setup basics (org, property, layout, guest access)
- Property code and room QR guest join flow
- Incident creation and AI draft generation
- Targeted broadcast workflow
- Guest safety check-in flow
- Live response dashboard counters
- Responder handoff summary
- Incident resolve and all-clear action

### MVP B (Impact Upgrade After Stability)

Add only if MVP A is stable early:

- Floor/zone map overlay guidance
- Voice-to-text staff reporting
- Expanded multilingual support
- AI escalation suggestion panel
- Mock sensor-triggered incident input
- PWA/offline resilience

## MVP Screen Coverage

Common/Auth:

- `/login`

Org Admin:

- `/admin/setup/organization`
- `/admin/setup/property`
- `/admin/setup/layout`
- `/admin/setup/guest-access`
- `/admin/drill`

Manager:

- `/manager/dashboard`
- `/manager/incidents/new`
- `/manager/incidents/:id/review`
- `/manager/incidents/:id/broadcast`
- `/manager/incidents/:id/live`
- `/manager/incidents/:id/handoff`
- `/manager/incidents/:id/resolve`

Staff:

- `/staff/home`
- `/staff/report`
- `/staff/incidents/:id/checklist`
- `/staff/incidents/:id/update`

Guest:

- `/guest/join`
- `/guest/home`
- `/guest/incidents/:id/alert`
- `/guest/incidents/:id/check-in`

Responder:

- `/responder/incidents/:id/view`

## Recommended Tech Stack

Primary stack:

- Frontend: `React + Vite`
- UI: `Tailwind CSS`
- Backend: `Firebase`
- AI: `Gemini API`
- Hosting: `Firebase Hosting` or `Vercel`

Optional upgrades:

- Notifications: `Firebase Cloud Messaging`
- Map context: `Google Maps API` or a simple image-based floor map overlay for MVP
- Voice input: browser speech-to-text

## 3-Day Execution Snapshot

Day 1:

- Freeze MVP A scope
- Build role routing and key setup screens
- Finalize service contracts between frontend and backend

Day 2:

- Complete incident to broadcast to guest-check-in flow
- Wire realtime dashboard updates
- Run simulated crisis scenarios

Day 3:

- Add handoff and resolution flow
- Apply reliability fallback and UI polish
- Record demo and finalize pitch narrative

## Manual Operations Checklist

- Front desk requests guest join at check-in (code or QR).
- Manager runs drill test once per shift.
- Staff performs room and zone checklist during active incident.
- Manager verifies unresolved guest count before all-clear.
- If AI fails, manager uses fallback alert templates.
- If digital broadcast fails, staff uses manual PA script.

## Architecture and Data Flow Summary

Core data workflow:

`Incident Input -> AI Structuring -> Manager Approval -> Broadcast -> Guest Check-ins -> Live Aggregation -> Responder Handoff -> Resolution`

Lifecycle states:

- `draft`
- `active`
- `resolved`

Security model:

- Role-based protected actions
- Property-scoped guest access
- Read-only secure responder view
- Timeline logs for critical actions

## Scope Control and Risks

Not in MVP:

- Direct hardware speaker integration
- Real IoT sensor integrations
- Full autonomous multi-agent cloud orchestration
- Enterprise analytics suite
- Full hospital workflow implementation

Main delivery risks and controls:

- AI output inconsistency -> use strict response normalization and fallback templates.
- Realtime mismatch -> lock contracts by end of Day 1.
- Overscoping -> MVP A is mandatory baseline, MVP B only after stability.

## Linked Project Documents

- `docs/roadmaps/teammate-1-execution-roadmap.md`
- `docs/roadmaps/teammate-2-execution-roadmap.md`
- `docs/architecture/mvp-architecture.md`
- `docs/flows/mvp-screen-by-screen-app-flow.md`
- `docs/prd/Crisis-OS-PRD.docx` (next rename candidate)
