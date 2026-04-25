# Crisis OS - Execution Roadmap (Teammate 2)

Owner: Teammate 2  
Primary role: Backend + AI + Realtime workflow orchestration  
Duration: 3 days (MVP sprint)

## 1) Ownership Boundaries

You own:
- Authentication and role claims wiring
- Incident lifecycle APIs / service layer
- Gemini prompt orchestration and response shaping
- Realtime data updates for dashboards and guest check-ins
- Broadcast delivery orchestration
- Responder handoff summary generation

You do not own:
- UI component styling and responsive layout
- Final frontend interaction details

## 2) Dependencies From Teammate 1

Need these inputs by Day 1 end:
- Route map and role-based screen list
- Frontend action contracts for:
  - create incident
  - approve broadcast
  - submit guest status
  - resolve incident
- Required response fields for each view

## 3) Manual Setup Steps (Day 0 / Hour 0)

1. Create cloud project and environment variables.
2. Enable required cloud services for auth, database, hosting, and server functions.
3. Configure local secrets management for AI key.
4. Create role-based seed users and one demo property.
5. Create a seeded test scenario:
   - property with floors and rooms
   - 10 mock guests
6. Verify local emulator or development environment is working.

## 4) Day-by-Day Plan

## Day 1 - Core Backend Foundation

Goals:
- Establish secure auth + role model.
- Ship core incident and property services.

Tasks:
- Implement auth claims for `org_admin`, `manager`, `staff`, `guest`, `responder`.
- Implement org/property setup service endpoints.
- Implement room/zone indexing for targeted broadcasts.
- Implement incident creation service with lifecycle states:
  - `draft`
  - `active`
  - `resolved`
- Define response contracts and share with Teammate 1.

Manual QA checklist:
- Role claims resolve correctly for all test users.
- Incident create/read works for authorized roles only.
- Unauthorized role calls are blocked.

AI-agent task cards:
- `BE-01`: Auth + role claims + guard middleware.
- `BE-02`: Org/property setup service.
- `BE-03`: Incident service core (create/read/update state).

## Day 2 - AI and Realtime Incident Orchestration

Goals:
- Integrate Gemini and realtime flow.
- Enable guest status updates and manager command visibility.

Tasks:
- Implement prompt templates for:
  - incident structuring
  - guest-safe alert copy
  - staff checklist
  - escalation recommendation
- Implement AI response normalizer to predictable JSON payload.
- Implement broadcast orchestration by scope:
  - all guests
  - floor/zone subset
  - staff only
- Implement guest check-in update endpoint and event stream.
- Implement manager dashboard aggregate counters service.

Manual QA checklist:
- Same input produces valid structured response each time.
- Guest status updates reflect in dashboard in near real time.
- Broadcast scopes target correct recipients.

AI-agent task cards:
- `BE-04`: Gemini prompt orchestration service.
- `BE-05`: Broadcast targeting + delivery service.
- `BE-06`: Guest check-in and realtime aggregates.

## Day 3 - Responder Handoff + Reliability + Demo Stability

Goals:
- Complete handoff flow and harden reliability for demo.

Tasks:
- Implement responder handoff summary payload generator.
- Implement incident timeline history log.
- Implement all-clear flow and incident closure action.
- Add fallback templates when AI output fails.
- Add request validation, rate limits, and critical error handling.
- Seed deterministic demo data path.

Manual QA checklist:
- Full crisis scenario runs without direct database edits.
- AI fallback path works when model call fails.
- Resolved incident cannot be modified by unauthorized roles.

AI-agent task cards:
- `BE-07`: Responder handoff summary + timeline service.
- `BE-08`: Reliability layer (validation, fallback, error strategy).
- `BE-09`: Deterministic demo data and scenario script.

## 5) Deliverables At End of Sprint

- Stable role-based backend services
- AI-structured incident outputs and recommendation payloads
- Realtime guest-status-to-dashboard pipeline
- Responder handoff payload and final incident closure flow

## 6) Definition of Done (Backend/AI)

- Critical APIs enforce auth + role access
- Incident lifecycle transitions are valid and predictable
- AI output is normalized to a fixed contract
- Realtime updates visible to manager dashboard
- Handoff summary generated for every active incident
- Fallback responses cover model failure cases

## 7) Figma Design System Rules Integration

Even though frontend owns visual work, backend prompts and contracts should align with design system naming and UX labels consumed by UI agents.

Reference skill requested for this project:
- `$figma:figma-create-design-system-rules`
- Source: `C:\Users\Yashraj Rastogi\.codex\plugins\cache\openai-curated\figma\f09cfd210e21e96a0031f4d247be5f2e416d23b1\skills\figma-create-design-system-rules\SKILL.md`

Coordination requirement:
- Keep API field names and status enums aligned with frontend design-system copy tokens defined in `AGENTS.md`.

## 8) Recommended Commit Sequence

1. `feat(backend): auth roles and access guards`
2. `feat(backend): org property and incident services`
3. `feat(ai): incident parsing and response normalizer`
4. `feat(realtime): guest check-in and dashboard aggregates`
5. `feat(backend): responder handoff and incident closure`
6. `chore(backend): reliability fallback and demo fixtures`

