# Arafat Visitor Management System Development Guidelines

Last updated: 2026-02-07 (HOST demo user, host selector in user form, field aliasing fixes)

## Active Technologies

- **Language**: TypeScript 5.7 (admin), TypeScript 5.1 (backend), ES2022 target
- **Admin Panel**: React 19, React Router 7, TailwindCSS 4, ApexCharts, Vite 6
- **Frontend (Reception)**: React 19, TailwindCSS 4.1, Vite 7.2
- **Forms**: React Hook Form + Zod validation
- **Backend**: NestJS 10 + Prisma 4 ORM + PostgreSQL 16
- **Real-time**: Socket.io (WebSocket gateway for dashboard)
- **Security**: Helmet (CSP headers), cookie-parser (httpOnly JWT), sanitize-html (XSS prevention)
- **Performance**: @nestjs/cache-manager (response caching), compression (gzip)
- **Reliability**: @nestjs/terminus (health checks), @nestjs/schedule (cron cleanup tasks)
- **Notifications**: Sonner (toast), nodemailer (email), wbiztool API (WhatsApp)
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library (frontend), Jest (backend)

## Project Structure

```text
.
├── admin/                         # TailAdmin SPA (React 19 + TailwindCSS 4)
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   │   ├── auth/              # SignInForm, etc.
│   │   │   ├── common/            # ErrorBoundary, ErrorState, RoleGuard
│   │   │   ├── dashboard/         # KPI cards, charts, visitor lists
│   │   │   ├── layout/            # Sidebar, Header, AppLayout
│   │   │   └── ui/                # Buttons, inputs, modals, tables
│   │   ├── context/               # AuthContext, ThemeContext, SidebarContext
│   │   ├── hooks/                 # useAuth, useToast, useDashboardSocket, useDebounce
│   │   ├── pages/                 # Route pages (Dashboard, Visitors, etc.)
│   │   ├── services/              # API service functions
│   │   ├── types/                 # TypeScript interfaces
│   │   └── utils/                 # Utility functions (formatDate, etc.)
│   ├── package.json
│   └── vite.config.ts
├── backend/                       # NestJS API server
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema (incl. RefreshToken model)
│   │   └── seed.ts                # Test data seeding
│   ├── src/
│   │   ├── main.ts                # App entry, Helmet, compression, cookie-parser
│   │   ├── admin/
│   │   │   └── admin.controller.ts # Admin API endpoints (cached, parallelized)
│   │   ├── auth/                  # JWT auth (httpOnly cookies, refresh tokens)
│   │   ├── common/
│   │   │   ├── filters/           # AllExceptionsFilter (global error handler)
│   │   │   ├── middleware/        # RequestIdMiddleware (UUID per request)
│   │   │   └── pipes/             # SanitizePipe (HTML/XSS stripping)
│   │   ├── dashboard/             # DashboardGateway (WebSocket real-time events)
│   │   ├── health/                # HealthController (DB + email status)
│   │   ├── tasks/                 # CleanupService (scheduled cron jobs)
│   │   ├── hosts/                 # Host management
│   │   ├── visits/                # Visit management
│   │   ├── deliveries/            # Delivery management
│   │   └── notifications/
│   │       ├── email.service.ts   # SMTP email sending (with CID attachments)
│   │       └── whatsapp.service.ts # WhatsApp via wbiztool (text + images)
│   └── public/
│       └── admin/                 # Built admin SPA served here
├── src/                           # Reception frontend (Vite + React)
│   ├── hooks/
│   │   └── useIdleTimeout.ts      # Kiosk idle timeout with warning countdown
│   └── lib/
│       └── api.ts                 # API client with network retry + backoff
└── specs/                         # Feature specifications (speckit)
```

## Commands

### Admin SPA Commands
```bash
cd admin
npm run dev        # Start dev server (http://localhost:5174) with proxy to backend
npm run build      # Build SPA to backend/public/admin (production)
npm run lint       # ESLint
npm test           # Run all unit tests once (Vitest)
```

### Backend Commands
```bash
cd backend
npm run start      # Start backend server
npm run start:dev  # Start with watch mode
npm run build      # Compile TypeScript (nest build)
npm test           # Run all unit tests once (Jest)
npm run test:cov   # Run tests with coverage report
npm run lint       # ESLint
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma migrate dev --name <name>  # Create and apply migration
```

### Frontend (Reception) Commands
```bash
npm run dev       # Start dev server (http://localhost:5173)
npm run build     # Type-check + production build
npm run lint      # ESLint
npm test          # Run all unit tests once (Vitest)
```

**Note:** After building the admin SPA, restart the backend to serve the new static files.

## Admin Panel

### URLs
- **Production**: https://arafatvisitor.cloud/admin
- **Local Dev**: http://localhost:5174 (proxies API to backend)
- **Login**: /admin/login
- **Auto-Login**: /admin/auto-login?token=JWT_TOKEN

### Test Login Credentials
| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Admin | admin@arafatvisitor.cloud | admin123 | Full access |
| Reception | reception@arafatvisitor.cloud | reception123 | No Reports/Users/Settings |
| Host | host@arafatvisitor.cloud | host123 | Company-scoped (linked to first active host) |

### Quick Demo Login
The login page has quick demo login buttons for Admin, Reception, and Host roles.

**HOST user setup**: The HOST demo user requires a `hostId` linking to an existing Host record. Created in `seed.ts` (`seedHostUser()`) and idempotently in `deploy.yml`. The user is linked to the first active host in the database, and all data is scoped to that host's company.

### Admin Panel Sections
- **Dashboard**: KPIs, charts, pending approvals, current visitors (real-time via WebSocket)
- **Visitors**: Manage visitors (APPROVED, CHECKED_IN, CHECKED_OUT)
- **Pre Register**: Pre-registered visits (PENDING_APPROVAL, REJECTED)
- **Deliveries**: Package tracking with timeline view
- **Hosts**: Manage companies and host contacts (with Bulk Import button)
- **Users**: System user management (Admin only)
- **Reports**: Visit and delivery reports with export
- **Settings**: SMTP and WhatsApp configuration
- **Profile**: User profile and password change

## Visit Workflow

```
                    Pre Register Panel              Visitors Panel
                    ──────────────────              ──────────────
PRE_REGISTERED → PENDING_APPROVAL ─────→ APPROVED → CHECKED_IN → CHECKED_OUT
                        ↓                    ↑
                    REJECTED ───────────────┘
                    (re-approve)
```

| Status | Panel | Description |
|--------|-------|-------------|
| PRE_REGISTERED | (initial) | Visit scheduled |
| PENDING_APPROVAL | Pre Register | Visitor arrived, waiting for host approval |
| REJECTED | Pre Register | Host rejected (can be re-approved) |
| APPROVED | Visitors | Host approved, ready for check-in |
| CHECKED_IN | Visitors | Visitor currently on-site |
| CHECKED_OUT | Visitors | Visitor has left |

## Delivery Workflow

```
RECEIVED → PICKED_UP
```

| Status | Description |
|--------|-------------|
| RECEIVED | Package received at reception, awaiting pickup |
| PICKED_UP | Package collected by recipient |

## Authentication & Security

### Authentication Flow (httpOnly Cookies)
- Login returns JWT access token (15min) and refresh token (7 days) in httpOnly cookies
- Access token: `access_token` cookie (httpOnly, Secure, SameSite=Strict)
- Refresh token: `refresh_token` cookie (httpOnly, Secure, SameSite=Strict, path=/api/auth)
- On 401 response, client automatically calls `/api/auth/refresh` to get new access token
- Logout revokes refresh token in database and clears cookies
- JWT strategy extracts token from cookies first, falls back to Bearer header for backwards compatibility

### Rate Limiting
- **Default**: 10 requests per 60 seconds (all endpoints)
- **Login-account**: 5 attempts per 15 minutes per account
- **Login-IP**: 20 attempts per 15 minutes per IP address
- Configured via `@nestjs/throttler` v5 with named throttler groups in `app.module.ts`
- `@Throttle()` decorator uses Record syntax: `@Throttle({ name: { limit, ttl } })`

### Security Headers
- Helmet with CSP: `defaultSrc: ['self']`, `styleSrc: ['self', 'unsafe-inline']`, `imgSrc: ['self', 'data:']`
- Response compression via `compression` middleware
- Input sanitization via `SanitizePipe` (strips HTML tags from all string inputs)
- Request ID tracking via `RequestIdMiddleware` (X-Request-Id header)

### Global Error Handling
- `AllExceptionsFilter` catches all errors, logs with request context
- Returns sanitized error responses (no stack traces or internal details in production)
- `ErrorBoundary` React component wraps admin panel (prevents white screen of death)

## Role-Based Access Control (RBAC)

### Architecture
- Global `RolesGuard` registered as `APP_GUARD` in `app.module.ts`
- Guard execution order: `JwtAuthGuard` → `RolesGuard` → `ThrottlerGuard`
- Endpoints use `@Roles(Role.ADMIN, Role.RECEPTION, Role.HOST)` decorator
- Endpoints without `@Roles()` are accessible to any authenticated user
- Guard source: `backend/src/common/guards/roles.guard.ts`
- Decorator source: `backend/src/common/decorators/roles.decorator.ts`

### Role Permissions Matrix

| Feature | ADMIN | RECEPTION | HOST |
|---------|-------|-----------|------|
| **Dashboard** (KPIs, charts, lists) | Full | Full | Company-scoped |
| **Approve/Reject visits** | All | All | Own company only |
| **Checkout visitors** | Yes | Yes | No |
| **Create/Update visitors** | Yes | Yes | No |
| **Delete visitors** | Yes | No | No |
| **Create/Update deliveries** | Yes | Yes | No |
| **Mark delivery picked up** | Yes | Yes | No |
| **Delete deliveries** | Yes | No | No |
| **Create pre-registrations** | Yes | Yes | Yes (auto-sets hostId, notifies host) |
| **Update pre-registrations** | Yes | Yes | No |
| **Delete pre-registrations** | Yes | No | No |
| **Approve/Reject pre-regs** | All | All | Own company only |
| **Hosts CRUD** | Full | View only | Company-scoped view |
| **Bulk import hosts** | Yes | No | No |
| **Users CRUD** | Yes | No | No |
| **Settings** | Yes | No | No |
| **Reports** | Yes | No | Yes (company-scoped) |
| **Send QR** | Yes | Yes | No |
| **Profile/Change password** | Yes | Yes | Yes |
| **Lookups** | Yes | Yes | Yes |

### HOST Company Scoping
- HOST users only see data belonging to their company
- Implemented via `getHostScope()` helper in `admin.controller.ts`
- Looks up HOST user's company from `req.user.hostId` → host record → `company` field
- Filters all list queries by `host.company` match
- Detail/action endpoints verify ownership: throws `ForbiddenException` if company doesn't match
- HOST creating pre-registrations: `hostId` is auto-set from their user account

### User Creation with Host Linking
- When creating a user with role=HOST, a **Linked Host/Company** dropdown appears in the form
- The dropdown lists all hosts; the selected host's `id` is saved as `hostId` on the User record
- This links the HOST user to a company, enabling company-scoped data access
- Components: `admin/src/components/users/UserForm.tsx`, `UserModal.tsx`, `admin/src/pages/Users.tsx`
- Backend: `POST /admin/api/users` accepts optional `hostId` field (string, converted to BigInt)

### Frontend Role-Based UI
- Delete buttons hidden for non-ADMIN users (Visitors, Deliveries, Pre-registrations, Hosts)
- Edit/Delete buttons on Hosts page hidden for non-ADMIN
- "Add Host" and "Bulk Import" buttons hidden for non-ADMIN on Hosts page
- Sidebar navigation: Reports visible to ADMIN+HOST, Users/Settings to ADMIN only
- Implemented via `useAuth()` hook checking `user.role === 'ADMIN'`

## Caching

- Dashboard KPIs and chart data: 60-second TTL (`@UseInterceptors(CacheInterceptor)`)
- Lookup tables (purposes, delivery types, couriers, locations): 1-hour TTL
- Cache is global via `CacheModule.register({ isGlobal: true })`
- WebSocket `dashboard:refresh` event triggers client-side data refetch

## Real-time WebSocket (Dashboard)

### Gateway
- Namespace: `/dashboard`
- Auth: JWT token via `socket.handshake.auth.token`
- Module: `backend/src/dashboard/dashboard.gateway.ts`

### Events Emitted
| Event | Trigger |
|-------|---------|
| `visitor:checkin` | Visitor checks in |
| `visitor:approved` | Visit approved by host |
| `visitor:rejected` | Visit rejected by host |
| `visitor:checkout` | Visitor checks out |
| `delivery:received` | New delivery received |
| `delivery:pickedup` | Delivery picked up |
| `dashboard:refresh` | General dashboard data refresh |

### Client Hook
- `admin/src/hooks/useDashboardSocket.ts` - auto-connects on Dashboard mount, disconnects on unmount
- Reconnection with exponential backoff (1s to 5s, max 5 attempts)

## Scheduled Tasks (Cron)

| Task | Schedule | Description |
|------|----------|-------------|
| QR Token Cleanup | Daily 2:00 AM | Deletes QR tokens expired > 30 days |
| Refresh Token Cleanup | Daily 2:15 AM | Deletes revoked/expired refresh tokens |

Module: `backend/src/tasks/cleanup.service.ts`

## Health Checks

- **Endpoint**: `GET /health` (public, no auth required)
- Checks: database connectivity (Prisma ping), email service availability
- Returns: `{ status, info, details }` per @nestjs/terminus format

## Kiosk Features

### Idle Timeout
- 2-minute inactivity threshold with 30-second warning countdown
- Tracks: mousedown, keydown, touchstart, click events
- On timeout: resets to dashboard view
- Hook: `src/hooks/useIdleTimeout.ts`

### Network Retry
- Checks `navigator.onLine` before API calls
- Exponential backoff: 1s, 3s, 5s delays (max 3 retries)
- Dispatches `networkRetry` custom events for UI notifications

### QR Check-In Welcome Badge
- When a visitor scans their QR code on the kiosk (Check In > Scan QR), the system auto-checks them in
- Flow: QR scan → auto-call `POST /visits/:sessionId/checkin` → display full-screen welcome badge
- Badge shows: visitor name, company, host details, purpose, location, check-in time, badge ID
- 5-second countdown timer then auto-returns to home screen
- On check-in, host is notified via WhatsApp and email with visitor arrival details
- Component: `src/features/visitors/CheckInBadge.tsx`
- Backend endpoint: `POST /visits/:sessionId/checkin` (ADMIN/RECEPTION roles)
- The check-in endpoint accepts APPROVED or already-CHECKED_IN visits
- Notifications only trigger on new check-ins (APPROVED → CHECKED_IN), not re-scans

## Code Splitting (Admin)

All admin pages are lazy-loaded via `React.lazy()` with `<Suspense>` fallbacks:
- Dashboard, Hosts, Visitors, PreRegister, Deliveries, Users, Reports, Settings, Profile
- `useDebounce` hook (400ms default) for search input optimization

## Send QR Feature

### Functionality
Send QR codes to visitors via Email or WhatsApp from the Admin Panel Dashboard.

### How to Use
1. Go to **Dashboard** → **Current Visitors** section
2. Click **QR** button on any visitor row
3. Modal opens with QR code display
4. Click **WhatsApp** or **Email** to send

### WhatsApp QR Code
WhatsApp sends a **QR code image** with caption containing:
- "VISITOR PASS" header (bold)
- Visitor name and company
- Host name and company
- Purpose of visit
- Check-in instructions
- Separator line (───────────────────)
- "Powered by Arafat Visitor Management System" footer (italic)

Generated using `qrcode` library (toDataURL) and sent via wbiztool API using native FormData (`msg_type: 1` for images).

### Email Template
Professional HTML email with:
- Gradient header with "VISITOR PASS" branding
- Inline QR code image (CID attachment for email client compatibility)
- Visitor details table (Host, Company, Purpose)
- Styled footer with Arafat VMS branding

## Forgot Password Feature

### How it Works
1. User clicks "Forgot password?" link on login page
2. Enter email address and click "Send Reset Link"
3. System sends password reset email with secure token (expires in 1 hour)
4. User clicks link in email to access reset password page
5. User enters new password and submits

### Password Reset Email Template
Professional HTML email matching QR email design:
- Gradient header (blue) with "PASSWORD RESET" branding
- Styled "Reset Password" button
- Fallback URL for copy/paste
- Expiry notice (1 hour)
- Security message for unexpected requests
- "Powered by Arafat Visitor Management System" footer

### Pages
- `/admin/forgot-password` - Request reset link
- `/admin/reset-password?token=xxx` - Set new password

## Notification Services

### Email (SMTP)
Configured in `.env`:
```
SMTP_HOST=smtp.emailit.com
SMTP_PORT=587
SMTP_USER=<username>
SMTP_PASS=<secret>
SMTP_FROM=info@abcgroup.cloud
```

### WhatsApp (wbiztool)
Configured in `.env`:
```
WHATSAPP_ENDPOINT=https://wbiztool.com/api/v1/
WHATSAPP_CLIENT_ID=11158
WHATSAPP_CLIENT=5219
WHATSAPP_API_KEY=<secret>
```

### Notification Triggers
| Event | Email | WhatsApp | Recipient |
|-------|-------|----------|-----------|
| Walk-in visit created | Visitor arrival | Visitor arrival | Host |
| Pre-registration created | Visitor arrival | Visitor arrival | Host |
| QR check-in (APPROVED → CHECKED_IN) | Visitor arrival with details | Visitor arrival with details | Host |
| Password reset requested | Reset link | — | User |
| QR code sent from admin | QR email template | QR image + caption | Visitor |

## Admin API Field Aliasing

The admin create endpoints accept frontend field names and map them to database column names. This prevents 500 errors when frontend forms use different field names than the Prisma schema.

### Create Visitor (`POST /admin/api/visitors`)
- Accepts `visitDate` → mapped to `expectedDate` (DB column)
- `location` is optional — derived from host record if not provided (falls back to `BARWA_TOWERS`)
- `purpose` is optional

### Create Pre-Registration (`POST /admin/api/pre-registrations`)
- Accepts `scheduledDate` → mapped to `expectedDate` (DB column)
- `location` is optional — derived from host record if not provided (falls back to `BARWA_TOWERS`)
- `purpose` is optional
- Fire-and-forget host notification (email + WhatsApp) after creation

### Test WhatsApp (`POST /admin/api/settings/test-whatsapp`)
- Accepts both `{ phone }` and `{ recipientPhone }` field names

**Pattern**: When frontend sends a field alias (e.g., `visitDate`), the backend resolves it:
```typescript
const expectedDate = body.expectedDate || body.visitDate;
```

## Code Style

- TypeScript strict mode enabled
- Path alias: `@/` maps to `./src/`
- Components use named exports (not default)
- Forms use React Hook Form with Zod schema validation
- State management via React hooks (useState, useEffect, useMemo) - no external state library
- Toast notifications via Sonner
- TailwindCSS for styling with utility-first approach
- Backend uses `esModuleInterop: true` - use default imports for CJS packages (helmet, compression, sanitize-html)
- Avoid Lucide icons in React class components (type conflict with React 19) - use inline SVGs instead

## Test Seed Data

### Seeding Commands
```bash
cd backend
npx prisma db seed     # Run seed script (clears and recreates test data)
npx prisma studio      # Open database GUI
```

### Test Data Details
All test data uses:
- **Phone**: +97450707317 (for WhatsApp testing)
- **Email**: adel.noaman@arafatgroup.com (for email testing)

Test data is identified by:
- Hosts: `externalId` starting with `TEST-`
- Visitors: `visitorPhone` = +97450707317

### Default Users (created by seed + deploy)
| ID | Email | Password | Role | hostId |
|----|-------|----------|------|--------|
| 999001 | admin@arafatvisitor.cloud | admin123 | ADMIN | — |
| 999002 | gm@arafatvisitor.cloud | gm123 | ADMIN | — |
| 999003 | reception@arafatvisitor.cloud | reception123 | RECEPTION | — |
| 999004 | host@arafatvisitor.cloud | host123 | HOST | First active host |

The HOST user is created by `seedHostUser()` in seed.ts and idempotently by a Node.js script in `deploy.yml`. It links to the first active host in the database.

## Production Deployment

### GitHub Secrets Required
| Secret | Description |
|--------|-------------|
| `VPS_IP` | VPS server IP address |
| `VPS_USER` | SSH username (usually root) |
| `VPS_PASSWORD` | SSH password |
| `VPS_DOMAIN` | Domain name (arafatvisitor.cloud) |
| `DB_PASSWORD` | PostgreSQL database password |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP port (587) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `SMTP_FROM` | From email address |
| `WHATSAPP_ENDPOINT` | wbiztool API endpoint |
| `WHATSAPP_CLIENT_ID` | wbiztool client ID |
| `WHATSAPP_CLIENT` | wbiztool WhatsApp client |
| `WHATSAPP_API_KEY` | wbiztool API key |

### Deployment Flow
1. Push to `main` branch triggers deployment
2. Admin SPA built and uploaded to VPS
3. Backend uploaded, dependencies installed
4. Prisma schema sync (`prisma db push`)
5. Lookup data populated (idempotent INSERT statements)
6. Backend built and PM2 restarts

### Production URLs
- **Frontend**: https://arafatvisitor.cloud
- **Admin Panel**: https://arafatvisitor.cloud/admin
- **API**: https://arafatvisitor.cloud/api

## Key API Endpoints

### Auth API (Public)
```
POST /api/auth/login                      # Login, returns JWT in httpOnly cookies
POST /api/auth/refresh                    # Refresh access token using refresh cookie
POST /api/auth/logout                     # Revoke refresh token, clear cookies
POST /api/auth/forgot-password            # Request password reset email
POST /api/auth/reset-password             # Reset password with token
```

### Health API (Public)
```
GET  /health                              # Database + email service health check
```

### Admin API (JWT cookie-based, role-enforced)
```
# Dashboard (ADMIN, RECEPTION, HOST — HOST is company-scoped)
GET  /admin/api/dashboard/kpis            # Dashboard statistics (cached 60s)
GET  /admin/api/dashboard/pending-approvals # Pending visits
GET  /admin/api/dashboard/received-deliveries # Pending deliveries
GET  /admin/api/dashboard/charts          # Chart data (cached 60s)
GET  /admin/api/dashboard/current-visitors # Active visitors (limit 50)
POST /admin/api/dashboard/approve/:id     # Approve visit (ADMIN, RECEPTION, HOST)
POST /admin/api/dashboard/reject/:id      # Reject visit (ADMIN, RECEPTION, HOST)
POST /admin/api/dashboard/checkout/:sessionId # Checkout (ADMIN, RECEPTION only)

# QR & Notifications (ADMIN, RECEPTION)
GET  /admin/api/qr/:visitId               # Get QR code
POST /admin/api/send-qr                   # Send QR email/whatsapp

# Profile (ADMIN, RECEPTION, HOST)
POST /admin/api/change-password           # Change user password

# Settings (ADMIN only)
GET  /admin/api/settings                  # Get system settings
POST /admin/api/settings/test-email       # Test SMTP
POST /admin/api/settings/test-whatsapp    # Test WhatsApp (accepts {phone} or {recipientPhone})

# Hosts (ADMIN for CRUD, all roles can view — HOST company-scoped)
POST /admin/api/hosts/import              # Bulk import (ADMIN only)
GET  /admin/api/hosts                     # List hosts
POST /admin/api/hosts                     # Create host (ADMIN only)
PUT  /admin/api/hosts/:id                 # Update host (ADMIN only)
DELETE /admin/api/hosts/:id               # Delete host (ADMIN only)

# Visitors (ADMIN, RECEPTION for CRUD — ADMIN only for delete)
GET  /admin/api/visitors                  # List visitors
POST /admin/api/visitors                  # Create visitor (ADMIN, RECEPTION)
PUT  /admin/api/visitors/:id              # Update visitor (ADMIN, RECEPTION)
DELETE /admin/api/visitors/:id            # Delete visitor (ADMIN only)

# Pre-registrations (all roles can view — HOST company-scoped)
GET  /admin/api/pre-register              # List pre-registrations
POST /admin/api/pre-registrations         # Create (ADMIN, RECEPTION, HOST) — notifies host via email+WhatsApp
PUT  /admin/api/pre-registrations/:id     # Update (ADMIN, RECEPTION)
DELETE /admin/api/pre-registrations/:id   # Delete (ADMIN only)
POST /admin/api/pre-registrations/:id/approve    # Approve (all roles, HOST scoped)
POST /admin/api/pre-registrations/:id/reject     # Reject (all roles, HOST scoped)
POST /admin/api/pre-registrations/:id/re-approve # Re-approve (all roles, HOST scoped)

# Deliveries (ADMIN, RECEPTION for CRUD — ADMIN only for delete)
GET  /admin/api/deliveries                # List deliveries
POST /admin/api/deliveries                # Create delivery (ADMIN, RECEPTION)
PUT  /admin/api/deliveries/:id            # Update delivery (ADMIN, RECEPTION)
DELETE /admin/api/deliveries/:id          # Delete delivery (ADMIN only)

# Users (ADMIN only)
GET  /admin/api/users                     # List users
POST /admin/api/users                     # Create user
PUT  /admin/api/users/:id                 # Update user
DELETE /admin/api/users/:id               # Delete user

# Reports (ADMIN, HOST — HOST company-scoped)
GET  /admin/api/reports/visits            # Visit reports
GET  /admin/api/reports/deliveries        # Delivery reports

# Lookups (ADMIN, RECEPTION, HOST)
GET  /admin/api/lookups/purposes          # Purpose of visit (cached 1h)
GET  /admin/api/lookups/delivery-types    # Delivery types (cached 1h)
GET  /admin/api/lookups/couriers          # Couriers (cached 1h)
GET  /admin/api/lookups/locations         # Locations (cached 1h)
```

### Visits API (JWT, ADMIN/RECEPTION)
```
POST /visits                              # Create visit (walk-in check-in)
GET  /visits/:sessionId                   # Get visit by session ID
POST /visits/:sessionId/checkin           # Check in visitor by session ID
POST /visits/:sessionId/checkout          # Check out visitor by session ID
GET  /visits/pass/:sessionId              # Get visit pass (public, no auth)
```

### Public API (for Reception Kiosk)
```
GET  /lookups/purposes                    # Purpose of visit dropdown values
GET  /lookups/delivery-types              # Delivery type dropdown values
GET  /lookups/couriers                    # Courier dropdown values
GET  /lookups/locations                   # Location dropdown values
```

## Database Schema (Key Models)

### User
- id, email, password, name, role (ADMIN/RECEPTION/HOST), hostId

### Host
A **contact person at a company** who can receive visitors or deliveries (NOT internal employees).
- id, externalId, name, company, email, phone, location, status
- Each host belongs to one location; a company can have hosts across multiple locations
- Bulk Import: CSV/XLSX upload via "Bulk Add" button on /admin/hosts

### Visit
- id, sessionId, visitorName, visitorCompany, visitorPhone, visitorEmail
- hostId, purpose, location, status, expectedDate
- checkInAt, checkOutAt, approvedAt, rejectedAt
- **Indexes**: status, hostId, location, checkInAt, expectedDate, composite (status+location)

### QrToken
- id, visitId, token, expiresAt, usedAt

### RefreshToken
- id, userId, token (unique), expiresAt, revokedAt, createdAt
- **Indexes**: token (unique), userId

### Delivery
- id, deliveryType, recipient, hostId, courier, location, status, notes
- receivedAt, pickedUpAt
- **Indexes**: status, hostId, location, receivedAt, composite (status+location)

### Location Enum
- BARWA_TOWERS, MARINA_50, ELEMENT_MARIOTT

### Lookup Tables (Configurable Dropdowns)
Lookup tables store values for dropdown menus, fetched from the database.
**LookupPurpose** - Purpose of Visit options: Meeting, Interview, Delivery, Maintenance, Other

**LookupDeliveryType** - Type of Delivery options: Document, Food, Gift

**LookupCourier** - Courier options: DHL, FedEx, Aramex, Qatar Post, UPS, TNT Express

**LookupLocation** - Location options: Barwa Towers, Marina 50, Element Mariott

**Note**: Lookup data is auto-populated during deployment via the GitHub Actions workflow.

## Database Migrations

All migrations are consolidated into a single clean init file:
```
backend/prisma/migrations/20260205000000_init/migration.sql
```

This includes all enums, tables, indexes, foreign keys, and lookup data INSERT statements.

**Important**: The seed script (`backend/prisma/seed.ts`) only contains mock/test data for development/testing.

**After schema changes**: Run `npx prisma generate` to regenerate the Prisma client, then `npx prisma migrate dev` to create and apply migration.

## Dropdown Implementation

### Purpose of Visit (Admin Panel)
- Location: `admin/src/components/visitors/VisitForm.tsx`
- Fetches from: `/admin/api/lookups/purposes`
- Service: `admin/src/services/lookups.ts`

### Admin Deliveries Form
- Location: `admin/src/components/deliveries/DeliveryForm.tsx`
- Three dropdowns: Type of Delivery, Host, Courier
- Fetches from: `/admin/api/lookups/delivery-types`, `/admin/api/hosts`, `/admin/api/lookups/couriers`
- Backend derives recipient name and location from selected host

### Type of Delivery (Reception Kiosk)
- Location: `src/features/deliveries/DeliveryForm.tsx`
- Fetches from: `/lookups/delivery-types`
- Uses Radix UI Select component

### Backend Lookups Module
- Controller: `backend/src/lookups/lookups.controller.ts`
- Module: `backend/src/lookups/lookups.module.ts`
- Public endpoints (no auth required) for reception kiosk access
- Cached for 1 hour via `@CacheTTL(3600)`
