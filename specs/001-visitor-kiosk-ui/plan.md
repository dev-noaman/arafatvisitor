# Implementation Plan: Visitor & Delivery Management Kiosk UI

**Branch**: `001-visitor-kiosk-ui` | **Date**: 2026-01-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-visitor-kiosk-ui/spec.md`

## Summary

Build the reception kiosk UI for a multi-location visitor and delivery management system. The existing React + TypeScript + Vite + TailwindCSS codebase has working component shells (LoginForm, WalkInForm, QRScanner, DeliveriesPanel) with simulated data. This plan upgrades the kiosk to integrate with a live backend API for visit session persistence, location-filtered host loading, QR-based check-out with server lookup, delivery CRUD via API, and JWT-based authentication - while preserving the existing UI component architecture and design system.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19, ES2022 target
**Primary Dependencies**: Vite 7.2, TailwindCSS 4.1, React Hook Form 7.71, Zod 4.3, Framer Motion 12, jsQR 1.4, react-webcam 7.2, Sonner 2.0, Lucide React, class-variance-authority 0.7
**Storage**: Backend PostgreSQL 16 via REST API (NestJS + Prisma); browser sessionStorage for kiosk config
**Testing**: Vitest (to be added) + React Testing Library for component tests
**Target Platform**: Web browser on reception PCs/tablets (768px+ width), Chrome/Edge/Safari
**Project Type**: Single-page web application (kiosk frontend only)
**Performance Goals**: Check-in form submission < 2s round-trip; QR scan detection < 5s; host notification dispatch < 30s
**Constraints**: No auto-logout timeout; kiosk location fixed at deployment; touch-friendly (44px+ tap targets); no offline mode required
**Scale/Scope**: 3 locations, ~700 hosts, 5 UI views (login, dashboard, walk-in, QR scanner, deliveries)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution is currently a placeholder template with no concrete principles defined. No gate violations exist. Plan proceeds without constraints.

**Post-Phase 1 re-check**: No constitution violations. The design uses direct API calls (no unnecessary abstraction layers), keeps the single-project structure, and avoids over-engineering.

## Project Structure

### Documentation (this feature)

```text
specs/001-visitor-kiosk-ui/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api-contracts.yaml
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
.
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
└── src/
    ├── main.tsx                    # React root entry
    ├── App.tsx                     # Main app shell, routing, auth state
    ├── App.css                     # App-level styles
    ├── index.css                   # TailwindCSS theme + base styles
    ├── assets/                     # Static assets (e.g. react.svg)
    ├── features/                   # Domain-bounded functional modules
    │   ├── auth/
    │   │   └── LoginForm.tsx       # Email/password login + forgot password
    │   ├── visitors/
    │   │   ├── WalkInForm.tsx      # Walk-in visitor registration form
    │   │   └── QRScanner.tsx       # Camera-based QR scanning + check-out
    │   └── deliveries/
    │       └── DeliveriesPanel.tsx # Delivery log, search, status management
    ├── components/
    │   └── ui/                     # Shadcn-style reusable primitives
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── input.tsx
    │       ├── label.tsx
    │       └── tabs.tsx
    └── lib/
        ├── api.ts                  # REST API client (hosts, visits, deliveries, auth)
        ├── notifications.ts        # Email + WhatsApp notification dispatch
        └── utils.ts                # cn() utility
```

**Structure Decision**: The frontend project is moved to the repository root for streamlined development. Components are organized by feature domain (`features/`) to improve maintainability as the system grows. Shared UI primitives remain in `components/ui/`. The `lib/api.ts` module is expanded to cover all backend endpoints (visits, deliveries, auth). No router library is needed - the current state-based view switching (`currentView`) is sufficient for a kiosk with 5 views.

## Complexity Tracking

No complexity violations to justify. The implementation uses the existing component structure without adding abstractions, state management libraries, or routing frameworks.
