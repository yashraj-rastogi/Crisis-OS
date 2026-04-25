<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.

---

# Crisis OS — Agent Operating Rules

## Product Context

Project: `Crisis OS` | Theme: Rapid Crisis Response | Domain: Hospitality
Core flow: `Report → Analyze → Broadcast → Track → Respond`
Stack: React + Vite + TypeScript · Tailwind CSS v3 · Firebase · Gemini API

## Canonical Source of Truth

Always read before coding:
- `references/README.md` — full product spec
- `references/docs/architecture/mvp-architecture.md`
- `references/docs/flows/mvp-screen-by-screen-app-flow.md`
- `references/docs/roadmaps/teammate-1-execution-roadmap.md`
- `references/docs/roadmaps/teammate-2-execution-roadmap.md`
- `src/lib/types.ts` — shared data contracts (DO NOT change without updating both FE+BE)
- `src/lib/constants.ts` — all enums, labels, color maps

## Design System Tokens

### Colors (Tailwind classes)
- **Primary / Crisis red**: `primary-{50..950}` — use `primary-600` for actions, `primary-400` for text on dark
- **Safe status**: `green-400` / `bg-green-900/30 border-green-700`
- **Help status**: `amber-400` / `bg-amber-900/30 border-amber-700`
- **Unable status**: `red-400` / `bg-red-900/30 border-red-700`
- **Pending**: `slate-400` / `bg-slate-800/30 border-slate-700`
- **Background**: `bg-slate-950` (page), `bg-slate-900` (card), `bg-slate-800` (elevated)
- **Borders**: `border-slate-800` (default), `border-slate-700` (elevated)

### Typography (Inter font)
- **Page titles**: `text-2xl font-bold text-white`
- **Section headers**: `text-lg font-semibold text-slate-100`
- **Body**: `text-sm text-slate-300`
- **Labels/captions**: `text-xs text-slate-400 uppercase tracking-wide`
- **Crisis labels**: `text-gradient-crisis` (CSS utility class)

### Component Patterns
- **Card surface**: use `.glass-card` CSS class → `bg-slate-900/70 border border-slate-800 backdrop-blur-sm rounded-xl`
- **Status indicator dots**: use `.status-dot` + `.status-dot-{safe|help|unable|pending|active|resolved}`
- **Mobile action buttons**: use `.action-btn-mobile` for full-width guest/staff CTAs
- **Page container**: use `.page-container` for consistent horizontal padding

### Spacing & Sizing
- Mobile screens: `p-4` container padding, `py-4` button padding, touch targets ≥ 44px
- Desktop screens: `px-6 lg:px-8` container, standard `p-6` card padding
- Rounded corners: `rounded-xl` for cards, `rounded-lg` for inputs/buttons, `rounded-md` for badges

## Component Naming Conventions

| Pattern | Example |
|---------|---------|
| Feature pages | `{Role}{Feature}Page.tsx` e.g. `GuestJoinPage.tsx` |
| Shared UI atoms | `src/components/ui/{Name}.tsx` e.g. `Button.tsx` |
| Crisis domain components | `src/components/crisis/{Name}.tsx` e.g. `IncidentCard.tsx` |
| Role layouts | `src/components/layout/{Role}Layout.tsx` |
| Contexts | `src/contexts/{Name}Context.tsx` |
| Services | `src/services/{name}.service.ts` |
| Realtime hooks | `src/services/realtime.hooks.ts` |

## Routing Rules

Route pattern: `/{role}/{feature}[/:id/{action}]`
- Admin: `/admin/setup/{organization|property|layout|guest-access}`, `/admin/drill`
- Manager: `/manager/dashboard`, `/manager/incidents/{new|:id/{review|broadcast|live|handoff|resolve}}`
- Staff: `/staff/{home|report}`, `/staff/incidents/:id/{checklist|update}`
- Guest: `/guest/{join|home}`, `/guest/incidents/:id/{alert|check-in}`
- Responder: `/responder/incidents/:id/view`

All role routes use `<ProtectedRoute allowedRoles={[...]} />` wrapper.
Guest `/guest/join` is public (no auth required).
Responder view is public (read-only via secure link).

## Data Contract Rules

- **NEVER** change `src/lib/types.ts` without updating both the frontend service consuming it and any Cloud Function writing it.
- Incident state transitions are one-way: `draft → active → resolved`
- Responder role has **NO write access** anywhere in MVP
- Guest access is **scoped to their propertyId** only
- Every critical action must emit a `TimelineEvent` to `COLLECTIONS.TIMELINE`

## UI State Requirements (per AGENTS.md spec)

Every form action MUST have:
1. `loading` — disable submit button, show spinner
2. `error` — inline error message, recoverable
3. `success` — toast notification + redirect or state update

Never hide unresolved critical guest statuses (`need_help`, `unable_to_move`).

## AI Output Rules

- Always normalize Gemini output through the `AIStructuredOutput` type before storing
- Use fallback templates from `src/lib/constants.ts → AI_FALLBACK_TEMPLATES` if model call fails
- Never display raw Gemini output to users

## Scope Guardrails (MVP)

Do NOT implement unless explicitly requested:
- IoT/hardware integrations
- Real-time push notifications (FCM) — polling/Firestore listeners only in MVP
- Hospital workflow
- Enterprise analytics
- Multi-agent orchestration
- PWA/offline mode

## Incident Lifecycle Sequence (enforce this order)

1. incident created (`draft`)
2. AI structuring generated
3. manager approval
4. broadcast sent → state becomes `active`
5. guest check-ins collected
6. live aggregates updated
7. responder handoff generated
8. manager resolves → state becomes `resolved`
