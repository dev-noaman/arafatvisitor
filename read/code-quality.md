# read/code-quality.md

## Core Principles

- Simplicity first — minimal code impact
- DRY — flag repetition aggressively (extract at 3+ uses)
- Explicit over clever — readable beats smart
- Handle edge cases — err on the side of more, not fewer
- Engineered enough — not hacky, not over-abstracted

## Backend (NestJS)

- Controllers are thin — business logic lives in services
- Always use DTOs for request validation (`class-validator` decorators)
- Use guards and decorators for auth, not manual checks in controllers
- Prisma queries: always `select` or `include` explicitly, never return full models
- New endpoints: add to `@SkipThrottle()` if not login-related
- Handle Prisma errors (`P2002` unique constraint, `P2025` not found)
- TypeScript strict — no `any` unless documented why

## Frontend (React / Kiosk)

- Functional components only, hooks for state
- Co-locate: component + hook + types in same directory
- React Query for server state, local state only for UI
- Always show loading and error states — never blank screens
- Forms: controlled inputs with validation before submit
- API calls through `api.ts` only — never raw `fetch`

## Mobile (React Native / Expo)

- Follow existing patterns in `src/services/endpoints/` for new API modules
- Use `useQuery`/`useMutation` hooks from `src/hooks/`
- Zustand: auth in `authStore`, UI in `uiStore`
- NativeWind for styling — avoid inline `style` objects
- Type check: `cd MOBILE && npx tsc --noEmit` after any type edit
- Both QR formats must work: `VMS-NNNNNN` and UUID

## Database (Prisma)

- Migrations: `npx prisma migrate dev --name descriptive-name`
- After schema changes: `npx prisma generate` before building
- Soft deletes preferred (add `deletedAt DateTime?`)
- Index frequently queried columns (foreign keys, status fields)

## Code Review Checklist

**Architecture:** component boundaries, coupling, data flow, security boundaries
**Quality:** DRY violations, error handling gaps, tech debt
**Tests:** coverage gaps, assertion strength, missing edge cases
**Performance:** N+1 queries, memory concerns, caching opportunities
