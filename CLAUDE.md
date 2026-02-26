> ⚠️ BEFORE writing any code, read the relevant files in `read/` directory. See `read/workflow.md` for guidance.


# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Arafat Visitor Management System (VMS) — a multi-app platform for managing visitor check-in/out, deliveries, host directory, and pre-registration at Arafat Group offices.

## Architecture

| Directory | Stack | Purpose |
|-----------|-------|---------|
| `backend/` | NestJS 10, Prisma 4.16, PostgreSQL 16 | REST API + WebSocket server |
| `admin/` | React 18, Vite, Tailwind | Admin dashboard (builds to `backend/public/admin/`) |
| `src/` (root) | React 19, Vite, Tailwind | Kiosk check-in/out interface |
| `MOBILE/` | React Native (Expo 54), NativeWind, Zustand, React Query v5 | Mobile app for staff/hosts |

## Common Commands

### Backend
```bash
cd backend && npm run start:dev          # Dev server (:3000)
cd backend && npm run build              # Production build
cd backend && npm run test               # Jest tests
cd backend && npm run test:e2e           # E2E tests
cd backend && npx prisma generate        # Regenerate client (no DB needed)
cd backend && npx prisma migrate dev     # Run migrations
cd backend && npx prisma studio          # DB GUI
```

### Admin Dashboard
```bash
cd admin && npm run dev                  # Vite dev (:5173)
cd admin && npm run build               # Build → backend/public/admin/
```

### Kiosk Frontend
```bash
npm run dev                              # Vite dev (:5173)
npm run build                           # tsc + vite build
```

### Mobile (`MOBILE/`)
```bash
cd MOBILE && npm run start               # Expo dev server
cd MOBILE && npm run android             # expo run:android
cd MOBILE && npm run build:android       # Prebuild + Gradle assembleRelease → app-visitor.apk
cd MOBILE && npm run build:ios           # Prebuild + xcodebuild archive
cd MOBILE && npm run lint                # TypeScript check (tsc --noEmit)
```
Environment: set `API_URL` before starting (defaults to `http://localhost:3000`):
```bash
API_URL=https://arafatvisitor.cloud npx expo start
```

### Docker (PostgreSQL)
```bash
docker-compose up                        # Start PostgreSQL 16 on :5432
```

## Backend Architecture

### Guards (applied globally via APP_GUARD in app.module.ts)
- **JwtAuthGuard**: Validates Bearer tokens. Public routes whitelisted in guard.
- **RolesGuard**: Checks `@Roles()` decorator against `request.user.role`.
- **ThrottlerGuard**: Three strategies — `default` (60/min), `login-account` (5/15min), `login-ip` (20/15min).

### Role Permissions
- **ADMIN**: Full access to everything
- **RECEPTION**: Create visitors/deliveries, cannot approve/reject, manages sub-members on behalf of hosts via "My Team"
- **HOST**: Company-scoped CRUD (auto-filtered by hostId), manages sub-members via "My Team"
- **STAFF**: Limited access, company-scoped, auto-linked to "Arafat Group"

### Key Modules
`auth/` `users/` `hosts/` `visits/` `deliveries/` `dashboard/` `lookups/` `notifications/` (email + WhatsApp) `reports/` `tasks/` (OfficeRND hourly cron sync) `audit/` `tickets/`

### Database Schema (`backend/prisma/schema.prisma`)
Core models: User, Host, Visit, Delivery, QrToken, CheckEvent, RefreshToken, AuditLog, Lookup tables.

Key enums: `Role` (ADMIN/RECEPTION/HOST/STAFF), `HostType` (EXTERNAL/STAFF), `VisitStatus` (PRE_REGISTERED → PENDING_APPROVAL → APPROVED → CHECKED_IN → CHECKED_OUT), `DeliveryStatus` (RECEIVED/PICKED_UP).

## Mobile App Architecture (`MOBILE/`)

### Mobile API Contract Gotchas (verified 2026-02-18)
- **Dashboard KPIs** — backend `/admin/api/dashboard/kpis` returns `{ totalHosts, visitsToday, deliveriesToday }` — NOT `todaysVisitors/checkedIn/expected`. Mobile `DashboardKPIs` type must match exactly.
- **Dashboard pending-approvals** — returns a **plain array** (not `PaginatedResponse`). Access as `data.map(...)`, not `data.data.map(...)`. Response includes `{ id, sessionId, visitorName, visitorPhone, hostName, hostCompany, expectedDate }`.
- **sessionId is required for navigation** — `VisitorDetailScreen` always calls `/visits/pass/:sessionId`. Any backend endpoint that feeds navigation (e.g. pending-approvals) MUST include `sessionId` in the response, not just `id`.
- **Pre-registrations endpoint** — GET list is `/admin/api/pre-registrations` (with 's'). Easy to typo as `pre-register`.
- **TypeScript check for mobile**: `cd MOBILE && npx tsc --noEmit` — run this after any type changes to catch mismatches early.
- **Lookups** — `/admin/api/lookups/*` returns **plain arrays** of `{ id: number, code: string, label: string }`. NOT wrapped objects like `{ purposes: [...] }`. Use `p.label` (not `p.name`) for display and value. Type: `LookupItem[]` in `MOBILE/src/types/api.ts`.
- **Admin list endpoints** (visitors, pre-registrations) return raw Prisma with **nested `host: { name }`** — NOT a flat `hostName` string. Always access as `item.host?.name || item.hostName || 'N/A'` in mobile components.
- **`/visits/pass/:sessionId`** (public, used by `VisitorDetailScreen`) returns a **different shape** than the admin visitors list:
  - Nested visitor: `visitor.visitor.name`, `visitor.visitor.company`, `visitor.visitor.phone`
  - Timestamps: `checkInTimestamp` / `checkOutTimestamp` (NOT `checkInAt` / `checkOutAt`)
  - Type: `VisitorPassResponse` in `MOBILE/src/types/api.ts`
- **Pre-registration date field** — backend only accepts `expectedDate` (or `scheduledDate`). Do NOT send `expectedArrivalDate` — it is silently dropped and the date saves as null in the DB.
- **Change password** — backend reads `req.user.sub` from JWT; does NOT require `userEmail` in the request body.

### Stack
React Native 0.81 + Expo 54, React 19, Zustand 5 (state), TanStack React Query v5 (server state), Axios (HTTP), NativeWind (styling), React Navigation 7.

### Key Directories
- `src/services/api.ts` — Axios instance with auth interceptor (Bearer token from Zustand store), 401 handling, retry with exponential backoff (3 retries)
- `src/services/endpoints/` — Typed API modules: `auth.ts`, `visitors.ts`, `dashboard.ts`, `deliveries.ts`, `hosts.ts`, `lookups.ts`, `profile.ts`, `preregistrations.ts`
- `src/store/authStore.ts` — Zustand: user, tokens, isAuthenticated. Persists to `expo-secure-store` (encrypted)
- `src/store/uiStore.ts` — Zustand: dark mode, filters. Persists to `AsyncStorage`
- `src/hooks/` — React Query wrappers: `useVisitors()`, `useDashboard()`, `usePreRegistrations()`, `useDeliveries()`, `useHosts()`, `useLookups()`, `useCheckIn()`, `useCheckOut()`, `useChangePassword()`
- `src/navigation/` — `RootNavigator` (auth guard) → `TabNavigator` (5 tabs: Dashboard, Visitors, PreRegister, QR Scan, Profile)
- `src/theme/` — Token-based design system: `colors.ts` (light/dark palettes, brand scale, status colors), `spacing.ts`, `typography.ts`
- `src/components/common/` — `Toast` (singleton ToastManager), `LoadingButton` (variants: primary/secondary/danger/success), `FormInput`, `OfflineBanner`, `SkeletonLoader`, `ErrorBoundary`

### QR Scanner (Mobile)
Uses `expo-camera` CameraView with barcode scanning → parses sessionId → fetches visitor → validates APPROVED status → POST check-in → success overlay with haptic feedback → auto-reset after 5s. Manual ID entry fallback available.

**Two sessionId formats exist** — `MOBILE/src/utils/qrParser.ts` `validateQRPayload` must accept both:
- `VMS-NNNNNN` — kiosk walk-in visits (via `qrTokenService.generateSessionId()`)
- UUID `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` — admin panel / mobile-created visits (via `crypto.randomUUID()`)

Do NOT validate with only one regex — admin-created visit QR codes will be silently rejected.

### App Config
`app.config.ts`: package `com.arafat.visitor`, portrait-only, New Architecture enabled, dark mode follows system. Plugins: expo-camera (QR), expo-secure-store (encrypted tokens, Face ID on iOS), expo-notifications.

### APK Output
Gradle configured to output `app-visitor.apk` via `applicationVariants` in `MOBILE/android/app/build.gradle`.

## My Team (Host Sub-Members)

HOST users manage company contacts ("sub-members") directly from the Hosts page via the "Manage Team" modal. Sub-members are standard Host records scoped by company name — no separate table.

### Endpoints (`backend/src/admin/admin.controller.ts`)
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/admin/api/my-team` | Create sub-member (uses `CreateSubMemberDto`, auto-inherits company/location) |
| GET | `/admin/api/my-team` | List company's hosts (paginated, searchable) |
| PATCH | `/admin/api/my-team/:id` | Edit name/email/phone |
| PATCH | `/admin/api/my-team/:id/status` | Toggle active/inactive (self-deactivation blocked) |

All endpoints use `@Roles(Role.ADMIN, Role.HOST, Role.RECEPTION)` + `getHostScope(req)` for company isolation and `@UseInterceptors(AuditInterceptor)` for audit logging.

### Validation Rules
- **Email**: Required, unique case-insensitively across all hosts (`prisma.host.findFirst`)
- **Company cap**: Max 50 active hosts per company (`prisma.host.count`)
- **Type**: Hardcoded `EXTERNAL` — HOST cannot create STAFF records
- **Creator tracking**: `Host.createdById` (Int?, FK → User.id) set on create

### Reception-to-Host Delegation
RECEPTION and ADMIN users can manage sub-members on behalf of any host company. The `hostId` parameter determines company scope:
- **POST**: `hostId` in request body (required for RECEPTION/ADMIN, ignored for HOST)
- **GET**: `hostId` as query parameter (required for RECEPTION/ADMIN, ignored for HOST)
- **PATCH/PATCH-status**: No `hostId` needed — target identified by `:id`

`getHostScope(req)` returns `null` for RECEPTION (no `hostId` on JWT). Each endpoint has inline role-checking: HOST uses `getHostScope()`, RECEPTION/ADMIN resolves company from provided `hostId`.

### Frontend Files (Integrated into Hosts Page)
- `admin/src/components/hosts/TeamMembersModal.tsx` — Modal for managing team members of a specific host (opened from HostsList "Manage Team" button)
- `admin/src/components/hosts/TeamMemberForm.tsx` — Form for creating/editing team members with react-hook-form + Zod validation
- `admin/src/services/myTeam.ts` — API service (getMyTeam, createTeamMember, updateTeamMember, toggleTeamMemberStatus) — all accept optional `hostId`
- `admin/src/components/hosts/HostsList.tsx` — Added `onManageTeam` and `showTeamAction` props for team management button (purple team icon)

### HostsList Component Props (`admin/src/components/hosts/HostsList.tsx`)
- `entityLabel` — Display name ("hosts" vs "team member")
- `hideCompany` — Hides company column (My Team: same company)
- `showActions` — Force-show edit button for non-ADMIN (default: ADMIN-only)
- `onToggleStatus` — Renders clickable Active/Inactive status badge column
- `showAddedBy` — Renders "Added by" column with Host/Sync/Admin badge (optional; Hosts page omits it)
- `onManageTeam` — Callback for "Manage Team" button click (receives Host object)
- `showTeamAction` — Shows team management button (purple icon) when true

### Role Permissions for My Team
- **HOST**: Add, edit, deactivate/reactivate (toggle status) — **no delete**, auto-scoped to own company
- **RECEPTION**: Same as HOST but manages team via modal from Hosts page — **no delete**
- **ADMIN**: Full CRUD including soft delete (sets `deletedAt`)
- Deactivated hosts (status=0) are excluded from all host dropdowns via `hosts.service.ts` `findAll()` filtering `status: 1`

## Ticket System

Staff/hosts submit complaints and suggestions via the Tickets page (`admin/src/pages/Tickets.tsx`).

### Backend (`backend/src/tickets/`)
- `tickets.controller.ts` — `GET /admin/api/tickets/stats` and `GET /admin/api/tickets/badge-count` MUST appear before `GET /admin/api/tickets/:id` to avoid NestJS route conflict.
- `tickets.service.ts` — `notifyStatusChange()` sends email via SMTP for ALL status transitions (not WhatsApp — user preference). Do NOT add WhatsApp back.
- `getBadgeCount(userId, role)` — ADMIN sees all non-terminal tickets; others see own only. Terminal statuses: CLOSED, REJECTED, REVIEWED, DISMISSED.

### Frontend
- `admin/src/components/tickets/` — `TicketForm`, `TicketsList`, `TicketDetail`, `CommentTimeline`, `TicketModal`
- `admin/src/services/tickets.ts` — `getTickets`, `getTicket`, `createTicket`, `updateTicket`, `addComment`, `uploadAttachment`, `reopenTicket`, `getTicketStats`, `downloadAttachment`
- **TicketForm** — visit/delivery linking dropdowns (complaint only) use `SearchableSelect` with lazy fetch triggered when `selectedType === 'COMPLAINT'`
- **AppSidebar** — polls `GET /admin/api/tickets/badge-count` every 60s, renders red pill when count > 0
- **Dashboard** — ADMIN-only "Ticket Overview" section using `getTicketStats()` (7 KPI cards)

### Ticket Status Flows
- **Complaint**: OPEN → IN_PROGRESS → RESOLVED → CLOSED (or REJECTED at OPEN/IN_PROGRESS; creator can reopen RESOLVED → OPEN)
- **Suggestion**: SUBMITTED → REVIEWED or DISMISSED

## Critical Gotchas

### Rate Limiting
`@SkipThrottle()` only skips the `default` throttler. To skip all three:
```typescript
@SkipThrottle({ default: true, 'login-account': true, 'login-ip': true })
```
Without this, the login-account limit (5 req/15min) blocks ALL endpoints after 5 requests.

### Visit Response Format
All visit endpoints MUST return nested `visitor: { name, company, phone, email }` — NOT flat fields like `visitorName`. Frontend `VisitSession` type and `matchesQuery()` depend on the nested structure.

### Admin Login 401 Handling
`admin/src/services/api.ts`: AUTH_ENDPOINTS (`/admin/api/login`, `/admin/api/token-login`) return 401 for invalid credentials or expired token — do NOT trigger `handleSessionExpired()`. Only non-auth 401s redirect to login with "session expired" message.

### Admin Forms: Searchable Dropdowns
- **SearchableSelect** (`admin/src/components/common/SearchableSelect.tsx`) — Type-to-search autocomplete for dropdowns
- **Visitors** (`VisitForm`): Company → Host/Contact Person (two-step), Purpose — all searchable
- **Pre Register** (`PreRegistrationForm`): Company → Host/Contact Person (two-step) — searchable
- **Deliveries** (`DeliveryForm`): Type of Delivery, Courier — searchable; Host uses HostLookup (already searchable)
- **HostLocationType** in `admin/src/types/index.ts` — shared type for host location (BARWA_TOWERS, MARINA_50, ELEMENT_MARIOTT)

### Field Aliasing (Common 500 Error Source)
Frontend forms use different field names than Prisma schema:
- `visitDate` / `scheduledDate` → maps to `expectedDate`
- `recipientPhone` → maps to `phone`
- `location` is optional — derived from host record (fallback: `BARWA_TOWERS`)

### NestJS 10 + Throttler v5
`@Throttle()` uses Record syntax: `@Throttle({ name: { limit, ttl } })`, NOT string args.

### TypeScript Imports in Backend
`tsconfig.json` has `esModuleInterop: true`. Use `import helmet from 'helmet'`, NOT `import * as helmet from 'helmet'`.

### Prisma Regeneration
After modifying `schema.prisma`, always run `npx prisma generate` before building. Works without a DB connection.

### Host `createdById` Field
`Host.createdById` (nullable FK → User.id) tracks who created a host record. Set automatically by `POST /admin/api/my-team` via `createdById: req.user?.sub`. Used by admin Hosts page "Added by" column: `createdById` present → "Host", `externalId` present → "Sync", neither → "Admin".

### Audit Interceptor Entity ID Extraction
`AuditInterceptor` extracts `entityId` from URL path segments (e.g., `/my-team/123` → `"123"`, `/my-team/123/status` → `"123"`). Entity mapping: `/visits` → Visit, `/my-team` → Host (before `/hosts`), `/hosts` → Host, `/deliveries` → Delivery, `/users` → User. Applied per-endpoint via `@UseInterceptors(AuditInterceptor)`, NOT globally.

### Kiosk Timer Types
Use `ReturnType<typeof setTimeout>` instead of `NodeJS.Timeout` (Vite browser context, not Node).

### Admin Users List — STAFF in Role Filter
`admin/src/components/users/UsersList.tsx` ROLES array must include `'STAFF'` — otherwise staff users are hidden when filtering by role. Current: `['ADMIN', 'RECEPTION', 'HOST', 'STAFF']`.

### Kiosk CORS & API Base (www vs non-www)
When users visit `https://www.arafatvisitor.cloud` but the build's `VITE_API_BASE` points to `https://arafatvisitor.cloud`, fetches are cross-origin → CORS blocks them (login, hosts, lookups fail). Fix:
1. **Backend** (`main.ts`): CORS `origin` MUST include both `https://arafatvisitor.cloud` and `https://www.arafatvisitor.cloud`.
2. **Kiosk** (`src/lib/api.ts`): `getApiBase()` prefers `VITE_API_BASE` (build-time), then `sessionStorage.vms_config.apiBase`. Use `window.location.origin` when not localhost so production stays same-origin.
3. **main.tsx** default vms_config: Uses `window.location.origin` for apiBase when hostname is NOT localhost (production). On localhost, uses `http://localhost:3000`.
4. **Hosts/Lookups**: CheckInRegister, WalkInForm, DeliveryForm fetch hosts and lookups on mount. Show toast on failure (`toast.error("Could not load hosts", ...)`) so users get feedback instead of empty dropdowns.

### Kiosk Login & Session Restore (avoid endless loading)
- **Session restore** (`App.tsx`): 8s timeout; always calls `setRestoring(false)` via `.finally()`. On timeout/reject, clears token so login form appears.
- **apiFetch** (`src/lib/api.ts`): `fetchWithTimeout` with 10s default; validateSession uses 6s timeout. Network retries: 800ms, 2s, 4s (not 1s/3s/5s).
- **Restoring state bug**: If `validateSession()` hangs or rejects, `setRestoring(false)` must still run — use `.catch().finally()`.

### NestJS Named Sub-Routes Before `:id`
Sub-routes like `/stats` and `/badge-count` MUST be declared **before** `@Get(':id')` in the controller class. NestJS matches routes top-to-bottom; if `/:id` comes first, `/stats` is treated as an ID lookup and throws a 400/404.

## Deployment

- **CI/CD**: GitHub Actions (`.github/workflows/deploy.yml` for VPS, `build.yml` for mobile APK/IPA)
- **Production**: PM2 process on VPS, Nginx reverse proxy with Let's Encrypt SSL
- **Domain**: arafatvisitor.cloud (and www.arafatvisitor.cloud — both must work; CORS allows both)
- **Nginx routes**: `/api/*`, `/admin`, `/hosts`, `/visits`, `/deliveries`, `/lookups`, `/health`, `/socket.io` → backend:3000; `/` → kiosk static files

## QR Check-In/Out Flow (Kiosk)
1. Scan QR → fetches visit; auto check-in/out requires `getApiBase()` AND `getAuthToken()` (both truthy)
2. If no token/API: shows manual "Confirm Check-in" / "Clock Out Visitor" — clicking performs API call and navigates to badge
3. POST `/visits/:sessionId/checkin` or `/checkout` (requires ADMIN/RECEPTION auth)
4. Full-screen CheckInBadge/CheckOutBadge with 5-second countdown → auto-navigate home
5. Badge `onComplete` callback must use `useRef` pattern to avoid re-render loop from App.tsx clock
6. **QRScanner** (`src/features/visitors/QRScanner.tsx`): `decodePayload` checks `getApiBase() && getAuthToken()` for auto flow; `onScanSuccess` also attempts API + `onCheckedIn`/`onCheckedOut` when user clicks Confirm

## OfficeRND Integration
Hourly cron in `backend/src/tasks/officernd-sync.service.ts` syncs external hosts. Only inserts NEW companies, never updates existing. Phone cleaning: strips formatting, adds country prefixes (974 for Qatar 8-digit, 2 for Egypt 11-digit).
