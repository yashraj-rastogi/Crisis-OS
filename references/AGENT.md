# Crisis OS - Agent Operating Guide

Purpose: project rules for AI coding agents implementing the Crisis OS MVP.

Compatibility note:
- This file is authored as `AGENT.md` per project request.
- Claude tools typically read `CLAUDE.md`.
- Keep both files in sync.

## 1) Product Context

Project: `Crisis OS`  
Theme: Rapid Crisis Response  
Domain: Hospitality crisis coordination for hotel and hostel operations  
MVP timeline: 3-day sprint, 2 teammates

Core workflow:

`Report -> Analyze -> Broadcast -> Track -> Respond`

MVP baseline (must ship):
- Role-based access (`org_admin`, `manager`, `staff`, `guest`, `responder`)
- Org setup and property onboarding
- Guest join using property code or room QR
- Incident creation and AI structuring
- Targeted broadcast flow
- Guest safety check-in
- Live manager response board
- Responder handoff summary
- Incident resolution and all-clear

## 2) Canonical Documents

Use these docs as source of truth before coding:

- `README.md`
- `Project Draft.txt`
- `docs/architecture/mvp-architecture.md`
- `docs/flows/mvp-screen-by-screen-app-flow.md`
- `docs/roadmaps/teammate-1-execution-roadmap.md`
- `docs/roadmaps/teammate-2-execution-roadmap.md`

## 3) Scope Guardrails

Do not add these in MVP unless explicitly requested:
- IoT hardware integration
- Direct building speaker integration
- Full hospital workflow implementation
- Enterprise analytics suite
- Autonomous multi-agent infrastructure orchestration

If a requested change risks the 3-day timeline, propose a staged fallback:
1. MVP-safe version
2. Post-MVP upgrade

## 4) Frontend Rules

Use one web app with role-based routes, not separate apps.

Device priorities:
- Guest: mobile-first
- Staff: mobile-first
- Manager: desktop-first (mobile-safe)
- Org admin: desktop-first
- Responder: read-only mobile/desktop

Required role routes:
- Admin: `/admin/setup/organization`, `/admin/setup/property`, `/admin/setup/layout`, `/admin/setup/guest-access`, `/admin/drill`
- Manager: `/manager/dashboard`, `/manager/incidents/new`, `/manager/incidents/:id/review`, `/manager/incidents/:id/broadcast`, `/manager/incidents/:id/live`, `/manager/incidents/:id/handoff`, `/manager/incidents/:id/resolve`
- Staff: `/staff/home`, `/staff/report`, `/staff/incidents/:id/checklist`, `/staff/incidents/:id/update`
- Guest: `/guest/join`, `/guest/home`, `/guest/incidents/:id/alert`, `/guest/incidents/:id/check-in`
- Responder: `/responder/incidents/:id/view`

UI quality requirements:
- Every critical action must have loading, error, and success states.
- Keep copy clear and action-focused for crisis conditions.
- Do not hide unresolved critical guest statuses.

## 5) Backend and AI Rules

Incident lifecycle states:
- `draft`
- `active`
- `resolved`

Enforce:
- strict role-based authorization on all protected actions
- predictable response contracts for frontend
- normalized AI output shape before returning to UI
- fallback templates if model generation fails

Broadcast scopes:
- all
- floor
- zone
- staff-only

Guest status actions:
- `Safe`
- `Need Help`
- `Unable to Move`

## 6) Data and Workflow Rules

Always preserve this sequence:
1. incident created
2. AI structuring generated
3. manager approval
4. broadcast sent
5. guest check-ins collected
6. live aggregates updated
7. responder handoff generated
8. manager resolves incident

Never allow:
- incident resolution before approval flow completion
- responder write access in MVP
- guest access outside property scope

## 7) Testing and Validation Rules

Minimum validation for each merged feature:
- role authorization checks pass
- happy path works
- error path is visible and recoverable
- critical event appears in timeline/audit stream

Run at least one deterministic scenario end-to-end:
- `Gas leak in kitchen on floor 2`

## 8) Collaboration Rules for AI Agents

- Keep tasks small and atomic (`FE-*` and `BE-*` style splits).
- Do not change contracts without updating both teammate docs.
- If changing a shared contract, update all impacted screens in same PR or clearly gate with fallback handling.
- Prefer incremental commits with clear scope.

## 9) Figma Design System Rules (Required)

This project should use the Figma design system rules workflow so generated UI code remains consistent.

Skill reference:
- `$figma:figma-create-design-system-rules`
- `C:\Users\Yashraj Rastogi\.codex\plugins\cache\openai-curated\figma\f09cfd210e21e96a0031f4d247be5f2e416d23b1\skills\figma-create-design-system-rules\SKILL.md`

Expected output:
- Maintain project-level rules in `AGENTS.md` for Codex usage
- Mirror equivalent guidance in `CLAUDE.md` for Claude usage

When Figma MCP is available:
1. generate design system rules
2. align component, token, and naming conventions
3. apply consistently across all UI PRs

## 10) Definition of Done (MVP)

MVP is done when:
- all role flows are operational
- incident flow is fully end-to-end
- dashboard updates reflect guest/staff changes in near real time
- responder handoff can be generated and shared
- all-clear closure works with audit trail
- demo can run without manual database edits

