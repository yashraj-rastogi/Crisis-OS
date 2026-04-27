# 🚨 Crisis OS

> **AI-powered rapid crisis coordination platform for hospitality venues.**

[![Firebase](https://img.shields.io/badge/Firebase-10.x-orange?logo=firebase)](https://firebase.google.com)
[![React](https://img.shields.io/badge/React-18.x-61dafb?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.x-646cff?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v3-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Gemini API](https://img.shields.io/badge/Gemini-API-4285f4?logo=google)](https://ai.google.dev)

---

## Table of Contents

1. [Overview](#overview)
2. [Problem Statement](#problem-statement)
3. [Core Workflow](#core-workflow)
4. [Features](#features)
5. [Roles & Access Model](#roles--access-model)
6. [Architecture](#architecture)
7. [Tech Stack](#tech-stack)
8. [Project Structure](#project-structure)
9. [Getting Started](#getting-started)
10. [Environment Variables](#environment-variables)
11. [Firebase Setup](#firebase-setup)
12. [Deployment](#deployment)
13. [Firestore Security Rules](#firestore-security-rules)
14. [Design System](#design-system)
15. [References](#references)

---

## Overview

**Crisis OS** is a role-based crisis response platform for hotels and hostels. It creates a single synchronized workflow for emergencies so that **staff, managers, guests, and emergency responders** can coordinate in real time.

Theme: `Rapid Crisis Response — Synchronizing the Hospitality Bridge`

The platform merges three concepts into one product:
- **Hospitality Guard** — instant SOS alerting for guests and staff
- **RespondeSync** — centralized live command dashboard for managers
- **SafetyAgents** — AI-assisted next actions and escalation guidance via Gemini

---

## Problem Statement

Hospitality venues face high-pressure incidents — fire, gas leaks, food poisoning, power outages, security threats. Existing workflows are fragmented:

| Pain Point | Impact |
|---|---|
| Incident details scattered across calls, WhatsApp, verbal updates | Slower coordinated response |
| Guests receive delayed/unclear safety instructions | Higher panic, avoidable harm |
| Managers lack a single live command view | Decisions made on incomplete data |
| Staff field updates are hard to aggregate by floor/room | Critical gaps in situational awareness |
| Responder handoff is incomplete | Emergency services respond blindly |

---

## Core Workflow

```
Report → Analyze → Broadcast → Track → Respond
```

1. **Staff/Manager** reports incident with type, location, and details
2. **Gemini AI** structures the raw report into severity, guest instructions, and staff checklists
3. **Manager** reviews the AI draft and broadcasts a targeted alert
4. **Guests** submit safety status: `Safe` / `Need Help` / `Unable to Move`
5. **Manager Dashboard** updates live by room, floor, and zone
6. **Staff** execute checklists and post field updates
7. **Manager** shares a responder handoff summary with emergency services
8. **Manager** resolves the incident and publishes all-clear

---

## Features

### MVP A (Core)
- ✅ Role-based authentication with Firebase Auth
- ✅ Protected routes with role guards
- ✅ Admin setup: organization, property, floor/room layout, guest access
- ✅ Property join code + room QR guest onboarding
- ✅ Incident creation with Gemini AI structuring
- ✅ Targeted broadcast (all guests / by floor / by zone / staff-only)
- ✅ Guest safety check-in flow (Safe / Need Help / Unable to Move)
- ✅ Live manager response board with real-time counters
- ✅ Responder handoff summary (read-only secure view)
- ✅ Incident resolve + all-clear publication
- ✅ Incident timeline/audit trail

### MVP B (Enhancements)
- ✅ Floor/zone map overlay guidance
- ✅ Voice-to-text staff reporting
- ✅ Multilingual support (EN / HI)
- ✅ PWA manifest configuration
- ✅ AI fallback templates when Gemini is unavailable

---

## Roles & Access Model

| Role | Device | Access |
|------|--------|--------|
| `org_admin` | Desktop | Full setup: org, property, layout, guest access, drill console |
| `manager` | Desktop (mobile-safe) | Command center: incident lifecycle, broadcast, live board, handoff, resolve |
| `staff` | Mobile | Field: report incidents, execute checklists, post updates |
| `guest` | Mobile | Safety: join property, receive alerts, submit status check-in |
| `responder` | Mobile / Desktop | Read-only: secure handoff view via shared link (no auth required) |

### Route Map

```
/login                                    ← Public
/guest/join                               ← Public

/admin/setup/organization
/admin/setup/property
/admin/setup/layout
/admin/setup/guest-access
/admin/drill

/manager/dashboard
/manager/incidents/new
/manager/incidents/:id/review
/manager/incidents/:id/broadcast
/manager/incidents/:id/live
/manager/incidents/:id/handoff
/manager/incidents/:id/resolve

/staff/home
/staff/report
/staff/incidents/:id/checklist
/staff/incidents/:id/update

/guest/home
/guest/incidents/:id/alert
/guest/incidents/:id/check-in

/responder/incidents/:id/view            ← Public (read-only)
```

---

## Architecture

```
┌─────────────────────────────────────────────┐
│            React + Vite SPA                 │
│   Role-based routing · Tailwind CSS UI      │
│                                             │
│  features/  →  components/  →  services/   │
└───────────────────┬─────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
  Firebase Auth  Firestore   Cloud Functions
  (Role claims)  (Realtime)  (Auth triggers,
                              Role mgmt)
                    │
                    ▼
              Gemini API
          (AI structuring,
           severity, instructions)
```

### Incident Lifecycle

```
draft ──(manager approves)──▶ active ──(manager resolves)──▶ resolved
```

- `draft`: Created by staff/manager, AI structuring generated, awaiting review
- `active`: Broadcast sent, guests checking in, live board running
- `resolved`: All-clear published, incident becomes read-only

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite 5 |
| Styling | Tailwind CSS v3, custom CSS utilities |
| Routing | React Router DOM v6 |
| Forms | React Hook Form + Zod |
| State | React Context API + Firestore listeners |
| Backend | Firebase Firestore, Firebase Auth, Cloud Functions (Node.js) |
| AI | Google Gemini API (`@google/generative-ai`) |
| Hosting | Firebase Hosting |
| PWA | vite-plugin-pwa + Workbox |
| Toasts | react-hot-toast |
| Icons | lucide-react |

---

## Project Structure

```
crisis-os/
├── src/
│   ├── app/
│   │   └── Router.tsx              # Central route definitions
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx  # Role-based route guard
│   │   ├── crisis/
│   │   │   └── MapOverlay.tsx      # Floor/zone map overlay
│   │   ├── layout/
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── ManagerLayout.tsx
│   │   │   ├── StaffLayout.tsx
│   │   │   └── GuestLayout.tsx
│   │   └── ui/                     # Shared design system atoms
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Badge.tsx
│   │       ├── Input.tsx / Select.tsx / Textarea.tsx
│   │       ├── Modal.tsx
│   │       ├── AlertBanner.tsx
│   │       ├── LoadingScreen.tsx / Spinner.tsx / Skeleton.tsx
│   │       ├── EmptyState.tsx
│   │       ├── OfflineBanner.tsx
│   │       ├── LanguageSwitcher.tsx
│   │       └── DemoTools.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx          # Auth state + role provider
│   ├── features/                    # Page-level components by role
│   │   ├── admin/
│   │   │   ├── OrgSetupPage.tsx
│   │   │   ├── PropertySetupPage.tsx
│   │   │   ├── LayoutSetupPage.tsx
│   │   │   ├── GuestAccessPage.tsx
│   │   │   └── DrillConsolePage.tsx
│   │   ├── auth/
│   │   │   └── LoginPage.tsx
│   │   ├── manager/
│   │   │   ├── ManagerDashboard.tsx
│   │   │   ├── CreateIncidentPage.tsx
│   │   │   ├── ReviewIncidentPage.tsx
│   │   │   ├── BroadcastPage.tsx
│   │   │   ├── LiveResponseBoard.tsx
│   │   │   ├── HandoffPage.tsx
│   │   │   └── ResolveIncidentPage.tsx
│   │   ├── staff/
│   │   │   ├── StaffHomePage.tsx
│   │   │   ├── StaffReportPage.tsx
│   │   │   ├── ChecklistPage.tsx
│   │   │   └── StaffUpdatePage.tsx
│   │   ├── guest/
│   │   │   ├── GuestJoinPage.tsx
│   │   │   ├── GuestHomePage.tsx
│   │   │   ├── AlertDetailPage.tsx
│   │   │   └── CheckInPage.tsx
│   │   └── responder/
│   │       └── ResponderViewPage.tsx
│   ├── hooks/
│   │   └── useVoiceInput.ts        # Browser speech-to-text hook
│   ├── lib/
│   │   ├── types.ts                # Shared data contracts (source of truth)
│   │   ├── constants.ts            # Enums, labels, color maps, AI fallbacks
│   │   └── utils.ts                # Shared helpers
│   ├── services/                   # Firebase + AI service layer
│   │   ├── firebase.ts             # Firebase app init
│   │   ├── auth.service.ts
│   │   ├── incident.service.ts
│   │   ├── broadcast.service.ts
│   │   ├── guestResponse.service.ts
│   │   ├── timeline.service.ts
│   │   ├── ai.service.ts           # Gemini AI structuring
│   │   ├── org.service.ts
│   │   ├── property.service.ts
│   │   ├── layout.service.ts
│   │   ├── hazardPin.service.ts
│   │   └── demo.service.ts         # Demo/seed data utilities
│   ├── index.css                   # Global design tokens + Tailwind base
│   ├── main.tsx                    # App entry point
│   └── vite-env.d.ts
├── functions/                      # Firebase Cloud Functions (Node.js)
│   └── src/
│       ├── auth/
│       │   ├── onUserCreated.ts    # Auto-assign role on signup
│       │   └── setUserRole.ts      # Callable: set/update user role
│       └── index.ts
├── references/                     # Product documentation
│   ├── README.md                   # Full product spec
│   ├── AGENT.md                    # AI agent operating guide
│   └── docs/
│       ├── architecture/
│       ├── flows/
│       ├── prd/
│       └── roadmaps/
├── AGENTS.md                       # AI coding agent rules (canonical)
├── firebase.json                   # Firebase project config
├── firestore.rules                 # Firestore security rules
├── firestore.indexes.json          # Composite indexes
├── tailwind.config.js              # Tailwind design tokens
├── vite.config.ts                  # Vite + PWA config
├── tsconfig.json
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Firebase CLI: `npm install -g firebase-tools`
- A Firebase project with Firestore, Auth, and Functions enabled
- A Gemini API key from [Google AI Studio](https://aistudio.google.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/crisis-os.git
cd crisis-os

# Install frontend dependencies
npm install

# Install Cloud Functions dependencies
cd functions && npm install && cd ..
```

### Running Locally

```bash
# Start the Vite dev server
npm run dev
```

The app runs at `http://localhost:5173`.

To use Firebase Emulators for local development (recommended):

```bash
firebase emulators:start
```

Then set `VITE_USE_EMULATORS=true` in your `.env.local`.

---

## Environment Variables

Create a `.env.local` file in the project root (never commit this file):

```env
# Firebase Web SDK config (from Firebase Console → Project Settings → Web App)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Gemini API key (from Google AI Studio)
VITE_GEMINI_API_KEY=your_gemini_api_key

# Optional: use Firebase Emulators locally
VITE_USE_EMULATORS=false
```

> ⚠️ **Security note**: The Gemini API key is used client-side in this MVP. For production, move AI calls behind a Cloud Function with server-side key management.

---

## Firebase Setup

### 1. Enable Firebase Services

In the [Firebase Console](https://console.firebase.google.com):
- **Authentication** → Enable Email/Password provider
- **Firestore Database** → Create database (production mode)
- **Cloud Functions** → Upgrade to Blaze plan (required for Functions)
- **Hosting** → Enable Firebase Hosting

### 2. Deploy Firestore Rules & Indexes

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

### 3. Deploy Cloud Functions

```bash
firebase deploy --only functions
```

### 4. Set Custom Claims for Admin

After the first user signs up, assign the `org_admin` role via Firebase Admin SDK or the `setUserRole` callable function.

---

## Deployment

### Build & Deploy to Firebase Hosting

```bash
# Build the production bundle
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### Deploy Everything

```bash
firebase deploy
```

This deploys: Hosting, Firestore rules + indexes, and Cloud Functions.

### Continuous Deployment

For CI/CD (e.g., GitHub Actions), add the Firebase service account as a secret and use:

```yaml
- run: npm run build
- run: firebase deploy --only hosting --token $FIREBASE_TOKEN
```

---

## Firestore Security Rules

The full rules are in [`firestore.rules`](./firestore.rules). Key principles:

- **Org Admins** can manage organizations, properties, layouts, and user roles
- **Managers** can create/update incidents, broadcast, and resolve
- **Staff** can read active incidents, create reports, update checklists
- **Guests** are scoped strictly to their `propertyId` — no cross-property access
- **Responders** have read-only access to incident data via a shared document reference
- **All** critical write actions require a corresponding `TimelineEvent` entry

---

## Design System

The design system is defined via Tailwind tokens in `tailwind.config.js` and global utilities in `src/index.css`.

### Color Palette

| Token | Usage |
|-------|-------|
| `primary-600` | Primary actions, buttons |
| `primary-400` | Text on dark backgrounds |
| `slate-950` | Page background |
| `slate-900` | Card surface |
| `slate-800` | Elevated elements |
| `green-400` | Safe status |
| `amber-400` | Need Help status |
| `red-400` | Unable to Move / critical status |
| `slate-400` | Pending / neutral status |

### CSS Utility Classes

| Class | Description |
|-------|-------------|
| `.glass-card` | Standard card surface with glassmorphism |
| `.page-container` | Consistent horizontal page padding |
| `.status-dot` | Small status indicator circle |
| `.action-btn-mobile` | Full-width CTA button for guest/staff mobile |
| `.text-gradient-crisis` | Crisis-red gradient text |

### Typography

- Font: **Inter** (loaded via Google Fonts)
- Page titles: `text-2xl font-bold text-white`
- Section headers: `text-lg font-semibold text-slate-100`
- Body: `text-sm text-slate-300`
- Labels: `text-xs text-slate-400 uppercase tracking-wide`

---

## References

Internal documentation is in the `references/` folder:

| Document | Description |
|----------|-------------|
| [`references/README.md`](./references/README.md) | Full product specification |
| [`references/AGENT.md`](./references/AGENT.md) | AI agent operating guide |
| [`references/docs/architecture/mvp-architecture.md`](./references/docs/architecture/mvp-architecture.md) | System architecture |
| [`references/docs/flows/`](./references/docs/flows/) | Screen-by-screen app flow |
| [`references/docs/roadmaps/`](./references/docs/roadmaps/) | Teammate execution roadmaps |

---

## Contributing

1. Read [`AGENTS.md`](./AGENTS.md) before making changes — it contains data contract rules and scope guardrails
2. Never change `src/lib/types.ts` without updating all consuming services
3. Keep incident state transitions strictly one-way: `draft → active → resolved`
4. Every critical action must emit a `TimelineEvent` to Firestore

---

## License

This project is private and not licensed for public distribution.
