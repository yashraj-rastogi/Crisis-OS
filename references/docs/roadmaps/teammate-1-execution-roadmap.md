# Crisis OS - Execution Roadmap (Teammate 1)

Owner: Teammate 1  
Primary role: Frontend + UX + Client-side integration  
Duration: 3 days (MVP sprint)

## 1) Ownership Boundaries

You own:
- App shell, routes, role-based navigation
- Guest, staff, manager, and admin frontend screens
- Realtime UI state rendering
- Form validation and UX states (loading/error/empty/success)
- Responsive behavior (mobile-first guest screens, desktop-first command views)

You do not own:
- Backend business logic
- Gemini prompt orchestration
- Notification delivery service implementation
- Incident persistence/query logic

## 2) Dependencies From Teammate 2

Need these contracts by Day 1 end:
- Auth payload shape (`role`, `orgId`, `propertyId`)
- Incident object read/write contract
- Guest check-in update contract
- AI summary response contract
- Broadcast action contract

## 3) Manual Setup Steps (Day 0 / Hour 0)

1. Pull latest code and verify branch naming.
2. Create `.env.local` with frontend-safe keys only.
3. Install dependencies and run local app.
4. Confirm route protection works for all roles.
5. Create demo test users:
   - `org_admin_demo`
   - `manager_demo`
   - `staff_demo`
   - `guest_demo`
6. Validate mobile viewport behavior before screen work starts.

## 4) Day-by-Day Plan

## Day 1 - Foundation UI + Role Flows

Goals:
- Complete all role entry flows and core screen skeletons.
- Prepare frontend to consume live data with mock adapters.

Tasks:
- Build auth entry and role redirect.
- Build Admin setup screens:
  - Organization setup
  - Property setup
  - Floor/room/zone config (simple form-based)
  - Guest access config (property code + QR placeholder)
- Build Manager dashboard skeleton.
- Build Guest join and guest safety home screens.
- Add shared components: cards, status chips, alert banners, toasts.

Manual QA checklist:
- Every role can login and land on correct home screen.
- No dead routes.
- Basic error states visible for invalid form actions.

AI-agent task cards:
- `FE-01`: Build route guards and role-based layout.
- `FE-02`: Build Admin setup wizard screens.
- `FE-03`: Build Guest join and safety home screens.

## Day 2 - Incident Workflow UI + Realtime UX

Goals:
- Complete incident workflow screens.
- Wire client to backend contracts (from Teammate 2).

Tasks:
- Build `Create Incident` screen with crisis type and location.
- Build `AI Draft Review` screen (summary + severity + recommended messages).
- Build `Broadcast Center` with audience filters.
- Build `Live Response Board`:
  - safe count
  - help count
  - unable to move count
  - pending response count
- Build Staff checklist and update status screens.
- Build Guest alert detail and check-in action screens.

Manual QA checklist:
- Incident can be created from UI and visible on dashboard.
- Guest status actions update UI in near real time.
- Dashboard counters refresh without manual reload.

AI-agent task cards:
- `FE-04`: Incident creation + AI draft review pages.
- `FE-05`: Live response board + status widgets.
- `FE-06`: Staff checklist + guest alert/check-in screens.

## Day 3 - Polish, Accessibility, and Demo Readiness

Goals:
- Production-feel polish for demo.
- Responsive QA and accessibility fixes.

Tasks:
- Build `Responder Handoff` viewer screen.
- Build `All Clear` / incident resolved state.
- Add loading skeletons and empty states.
- Add accessibility labels and keyboard support for critical actions.
- Add final copy polish for English/Hindi UI labels.
- Create demo mode toggles for stable presentation flow.

Manual QA checklist:
- Mobile-first guest journey fully usable on phone viewport.
- Desktop manager dashboard readable on 1366x768.
- Crisis scenario demo can run end-to-end without manual DB edits.

AI-agent task cards:
- `FE-07`: Responder handoff + all-clear UI.
- `FE-08`: Responsive cleanup + accessibility pass.
- `FE-09`: Demo-mode UI reliability improvements.

## 5) Deliverables At End of Sprint

- All MVP frontend screens implemented and wired
- Stable role-based navigation
- Demo-ready responsive UX for manager/staff/guest/admin paths
- UI acceptance checklist document updated

## 6) Definition of Done (Frontend)

- No blocker UI bugs in critical flows
- All core actions have success/error/loading states
- Role-based access redirects correctly
- Guest flow works fully on mobile viewport
- Manager command flow works fully on desktop viewport

## 7) Figma Design System Rules Integration

To keep AI-generated frontend code consistent, run the Figma design system rules workflow early in Day 1 and commit the agent rules file used by Codex.

Reference skill requested for this project:
- `$figma:figma-create-design-system-rules`
- Source: `C:\Users\Yashraj Rastogi\.codex\plugins\cache\openai-curated\figma\f09cfd210e21e96a0031f4d247be5f2e416d23b1\skills\figma-create-design-system-rules\SKILL.md`

Expected output for Codex projects:
- `AGENTS.md` with project-specific Figma-to-code rules

## 8) Recommended Commit Sequence

1. `feat(frontend): role auth routes and base layouts`
2. `feat(frontend): admin setup and guest join flows`
3. `feat(frontend): incident and broadcast workflow screens`
4. `feat(frontend): live response board and staff checklist`
5. `feat(frontend): responder handoff and final polish`

