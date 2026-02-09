# Arafat Visitor Management System Development Guidelines

Last updated: 2026-02-09 (Kiosk navbar button, medium action icons, date defaults + min validation)

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
│   │   └── seed.ts                # Production seed (admin user only)
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
- **Auto-Login**: /admin/auto-login?token=JWT_TOKEN (exchanges kiosk 15-min token for 24h admin session via `POST /admin/api/token-login`)

### Default Admin Account
| Email | Password | Role |
|-------|----------|------|
| admin@arafatvisitor.cloud | admin123 | ADMIN |

This is the only seed user. All other users are created via the admin panel or bulk import.
No demo login buttons on the sign-in page — production login only.

### Admin Navbar
- Left: hamburger (mobile) + "Welcome, {name}"
- Right: **Kiosk** button (monitor icon, opens `/` in new tab) + user avatar/email dropdown
- Kiosk button: `<a href="/" target="_blank">` with monitor SVG icon, "Kiosk" text hidden on mobile
- Component: `admin/src/layout/AppHeader.tsx`

### Admin Panel Sections
- **Dashboard**: KPIs, charts, pending approvals, current visitors (real-time via WebSocket). Total Hosts KPI counts only `type=EXTERNAL` hosts (not STAFF host records).
- **Visitors**: Manage visitors (APPROVED, CHECKED_IN, CHECKED_OUT)
- **Visitors filters**: Only APPROVED, CHECKED_IN, CHECKED_OUT — no PENDING or REJECTED (those belong on Pre Register page)
- **Pre Register**: Pre-registered visits (PENDING_APPROVAL, REJECTED)
- **Deliveries**: Package tracking with timeline view
- **Hosts**: Manage external companies and host contacts (with Bulk Import button)
- **Users**: System user management — create/edit users with roles: Staff, Reception, Administrator. Bulk Import for all roles. Password edit (blank = keep current). HOST role users are auto-created from Hosts page, not from Users.
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
- **Kiosk → Admin auto-login**: Kiosk login generates 15-min token stored in `sessionStorage`. Admin button opens `/admin/auto-login?token=JWT`. The auto-login page calls `POST /admin/api/token-login` to exchange it for a new 24h admin token with httpOnly cookie. Falls back to client-side JWT decode if endpoint unavailable.

### Rate Limiting
- All auth-protected controllers use `@SkipThrottle({ default: true, 'login-account': true, 'login-ip': true })` — only the auth controller is rate-limited
- **Login-account**: 5 attempts per 15 minutes per account
- **Login-IP**: 20 attempts per 15 minutes per IP address
- **Default fallback**: 60 requests per 60 seconds (for any endpoint without `@SkipThrottle()`)
- Configured via `@nestjs/throttler` v5 with named throttler groups in `app.module.ts`
- `@Throttle()` decorator uses Record syntax: `@Throttle({ name: { limit, ttl } })`
- **CRITICAL**: `@SkipThrottle()` with no args only skips the `default` throttler in v5! Named throttlers (`login-account`, `login-ip`) are still applied globally. Must pass all throttler names explicitly or every endpoint gets the 5-req/15min login limit.

### Security Headers
- Helmet with CSP: `defaultSrc: ['self']`, `scriptSrc: ['self', 'static.cloudflareinsights.com']`, `styleSrc: ['self', 'unsafe-inline', 'fonts.googleapis.com']`, `imgSrc: ['self', 'data:']`, `fontSrc: ['self', 'fonts.gstatic.com']`, `connectSrc: ['self', 'cloudflareinsights.com']`
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

| Feature | ADMIN | RECEPTION | HOST | STAFF |
|---------|-------|-----------|------|-------|
| **Dashboard** (KPIs, charts, lists) | Full | Full | Company-scoped | Company-scoped |
| **Approve/Reject visits** | All | No | Own company only | Own company only |
| **Checkout visitors** | Yes | Yes | No | No |
| **Create visitors** | Yes | Yes | Yes (auto-sets hostId) | Yes (auto-sets hostId, company-scoped) |
| **Update visitors** | Yes | Yes | Yes (company-scoped) | Yes (company-scoped) |
| **Delete visitors** | Yes | No | No | No |
| **Create/Update deliveries** | Yes | Yes | No | No |
| **Mark delivery picked up** | Yes | Yes | Yes (company-scoped) | Yes (company-scoped) |
| **Delete deliveries** | Yes | No | No | No |
| **Deliveries list** | Yes | Yes | Yes | Yes (company-scoped) |
| **Create pre-registrations** | Yes | Yes | No | No |
| **Update pre-registrations** | Yes | Yes | No | No |
| **Delete pre-registrations** | Yes | No | No | No |
| **Approve/Reject pre-regs** | All | No | Own company only | Own company only |
| **Hosts CRUD** | Full | View only | Company-scoped view | Company-scoped view |
| **Staff CRUD** | Full (via Users page) | No | No | No |
| **Bulk import hosts** | Yes | No | No | No |
| **Bulk import users** (all roles) | Yes | No | No | No |
| **Users CRUD** | Yes | No | No | No |
| **Settings** | Yes | No | No | No |
| **Reports** | Yes | No | Yes (company-scoped) | No |
| **Send QR** | Yes | Yes | No | No |
| **Profile/Change password** | Yes | Yes | Yes | Yes |
| **Lookups** | Yes | Yes | Yes | Yes |

### HOST/STAFF Company Scoping
- HOST and STAFF users only see data belonging to their company
- Implemented via `getHostScope()` helper in `admin.controller.ts`
- Checks `req.user?.role !== 'HOST' && req.user?.role !== 'STAFF'` to determine scoping
- Looks up user's company from `req.user.hostId` → host record → `company` field
- Filters all list queries by `host.company` match
- Detail/action endpoints verify ownership: throws `ForbiddenException` if company doesn't match
- HOST/STAFF creating pre-registrations or visitors: `hostId` is auto-set from their user account

### User Creation with Staff Linking
- Users form role options: **Staff (Internal)**, **Reception**, **Administrator** — no HOST option (HOST users are auto-created from Hosts page)
- Default role: STAFF
- **No Linked Host/Company dropdown** — STAFF users are automatically linked to "Arafat Group"
- Backend auto-creates a Host record (type=STAFF, company="Arafat Group") when creating a STAFF user (same logic as bulk import)
- Components: `admin/src/components/users/UserForm.tsx`, `UserModal.tsx`, `admin/src/pages/Users.tsx`
- Backend: `POST /admin/api/users` auto-creates Host record for STAFF role if no `hostId` provided

### User Password Edit (Admin)
- When editing a user, the password field is visible with label **"New Password"**
- Placeholder: "Leave blank to keep current password"
- **Blank** → existing password is unchanged (frontend strips empty value, backend ignores)
- **Non-empty** → password is hashed (bcrypt 12 rounds) and updated
- Backend: `PUT /admin/api/users/:id` only updates password when `body.password` is non-empty

### Auto-Create User on Host/Staff Creation
- **Single host create** (`POST /admin/api/hosts`): Auto-creates a User with role=HOST, status=ACTIVE, random password, and linked `hostId`
- **Single staff create** (`POST /admin/api/staff`): Auto-creates a User with role=STAFF, status=ACTIVE, random password, and linked `hostId`
- **Bulk import** (CSV/XLSX for hosts or staff): Same auto-creation logic per imported record
- If record has a real email (not `@system.local`), a **welcome email** is sent with a 72h password reset link
- Welcome email: `emailService.sendHostWelcome()` — "Welcome to Arafat VMS" template with "Set Password" button
- Records without email get a fallback `host_{id}@system.local` or `staff_{id}@system.local` user (no email sent)
- Duplicate checks: skips if email already exists or hostId already linked to a user

### Host Type (EXTERNAL/STAFF)
- Host model has `type` field (enum: `EXTERNAL` | `STAFF`, default: `EXTERNAL`)
- **EXTERNAL**: Traditional external host/contact person at a company
- **STAFF**: Internal staff member (sales rep, etc.) who can receive visitors
- Hosts page filters by `type=EXTERNAL`; Staff page filters by `type=STAFF`
- Host dropdowns in visitor/pre-registration forms show both types; staff prefixed with `[Staff]`
- Staff CRUD endpoints mirror hosts but with `type: 'STAFF'`

### Kiosk Delivery Staff Sub-Dropdown
- When "Arafat Group" is selected as host company in the kiosk delivery form, a **Staff Member** dropdown appears
- Lists all hosts with `type=STAFF` and `company="Arafat Group"`
- The selected staff member's `hostId` is used when creating the delivery
- For other companies, behavior is unchanged (first matching host is used)
- Backend hosts API (`GET /hosts`) includes `type` field in response for EXTERNAL/STAFF distinction

### User Status (ACTIVE/INACTIVE)
- User model has `status` field (default: `ACTIVE`)
- **INACTIVE users are blocked from login** — returns "Account is deactivated" error
- Admin can activate/deactivate users via `POST /admin/api/users/:id/activate` and `/deactivate`
- Users page: **Activate button only shown for INACTIVE users**; hidden for ACTIVE users
- Status filter (Active/Inactive) available on Users list page
- All auto-created HOST users default to ACTIVE

### Frontend Role-Based UI
- Delete buttons hidden for non-ADMIN users (Visitors, Deliveries, Pre-registrations, Hosts)
- Edit/Delete buttons on Hosts page hidden for non-ADMIN
- "Add Host" and "Bulk Import" buttons hidden for non-ADMIN on Hosts page
- Staff page still exists at `/admin/staff` (route accessible) but removed from sidebar navigation
- Sidebar navigation: Dashboard/Visitors/Pre-Register/Deliveries visible to all roles; Hosts visible to ADMIN+HOST+RECEPTION; Users/Settings to ADMIN only; Reports to ADMIN+HOST
- Staff sidebar item removed — staff users managed via Users page
- STAFF sees: Dashboard, Visitors, Pre Register, Deliveries, Profile
- "Add Pre-Registration" button hidden for HOST/STAFF (create is ADMIN/RECEPTION only)
- "Record Delivery" and "Edit" buttons on Deliveries hidden for HOST/STAFF (they only see "Mark Picked Up")
- "Edit" button on Pre-Registrations hidden for HOST/STAFF (update is ADMIN/RECEPTION only)
- Implemented via `useAuth()` hook checking `user.role === 'ADMIN'`

### Action Button Style Convention
- All action buttons use icon-only style with medium size: `p-2 rounded-lg` and `w-5 h-5` SVGs with `strokeWidth={2.5}`
- Pattern: `className="inline-flex items-center p-2 rounded-lg text-{color}-600 hover:bg-{color}-50 transition"`
- Colors: green (Approve/checkmark), red (Reject/X, Delete/trash), blue (Edit/pencil, Re-Approve/refresh), indigo (QR Code), orange (Checkout/logout)
- Dashboard (Pending Approvals + Current Visitors) and Pre-Register table all use the same sizing
- Spinner state: when `actioningId` matches, show `w-5 h-5 animate-spin` SVG instead of action icon

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

### Login
- Production login only — no debug/quick-login buttons
- `VITE_SHOW_DEBUG_LOGIN` set to `"false"` in deploy workflow
- Debug login constants and buttons removed from `src/features/auth/LoginForm.tsx`

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
- The check-in endpoint rejects already-checked-in or checked-out visitors (400 error)
- Notifications only trigger on new check-ins (APPROVED → CHECKED_IN)

### QR Check-Out Goodbye Badge
- When a visitor scans their QR code on the kiosk (Check Out > Scan QR), the system auto-checks them out
- Flow: QR scan → auto-call `POST /visits/:sessionId/checkout` → display full-screen goodbye badge
- Badge shows: "Thank You For Visiting Us", visitor name, company, host details, check-out time
- 5-second countdown timer then auto-returns to home screen
- Component: `src/features/visitors/CheckOutBadge.tsx`
- Phone/email search checkout also shows the badge via `onCheckout` callback
- Duplicate check-out attempts are rejected with 400 error and toast message

## Code Splitting (Admin)

All admin pages are lazy-loaded via `React.lazy()` with `<Suspense>` fallbacks:
- Dashboard, Hosts, Staff, Visitors, PreRegister, Deliveries, Users, Reports, Settings, Profile
- `useDebounce` hook (400ms default) for search input optimization

## Send QR Feature

### Functionality
Send QR codes to visitors via Email or WhatsApp from multiple admin pages.

### How to Use
- **Dashboard** → Current Visitors → QR button (CHECKED_IN visitors)
- **Visitors** page → QR button (CHECKED_IN visitors)
- **Pre-Register** page → QR button (APPROVED pre-registrations)
- Modal opens with QR code, visitor info, and WhatsApp/Email send buttons

### QrModal Reuse Pattern
- Component: `admin/src/components/dashboard/QrModal.tsx`
- Accepts `CurrentVisitor` type from `@/services/dashboard`
- Pages with different entity types (Visit, PreRegistration) map fields in a `handleQr` function
- Key mapping: `id`, `visitorName`, `visitorPhone`, `visitorEmail`, `hostName` (from `entity.host?.name`), `hostCompany` (from `entity.host?.company`)

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
5. User enters new password (minimum 6 characters) and submits
6. On success, redirects to `/admin/login` after 2 seconds

### One-Time Reset Token
- JWT includes a tail of the current password hash (`ph` claim)
- On reset, backend verifies `ph` matches current password hash
- If password was already changed (token reused), returns "This reset link has already been used"
- No database schema change needed — password hash change invalidates the token

### Password Validation
- **Frontend**: Zod schema `z.string().min(6)` — shows error below field
- **Backend**: DTO `@MinLength(6)` — returns 400 if too short
- Confirm password field must match (Zod `.refine()`)

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

### Auth Page Design Pattern (Unified)
All auth pages (SignIn, ForgotPassword, ResetPassword) use the same split layout:
- **Left side**: Form with "Back to sign in" link, `max-w-md` centered, inputs with left icons (`pl-10`), `bg-gray-50 hover:bg-white`, blue shadow submit button with spinner
- **Right side** (desktop only): Dark blue branding panel (`from-blue-900 via-blue-800 to-indigo-900`) with grid pattern, decorative blur circles, logo, and contextual tagline
- Form components: `admin/src/components/auth/` — page wrappers: `admin/src/pages/auth/`
- **Placeholders**: Email → `"Enter your Email"`, Password → `"Enter your Password"` (both admin and kiosk)

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

### Email Template Style (Unified)
All emails use the same branded layout matching the QR VISITOR PASS email:
- Blue gradient header (`#1E3A8A → #3B82F6`) with title + "Arafat Group"
- Compact body (`30px` padding) with simple table (`10px` row padding, bottom borders)
- Small gray footer (`15px` padding, `12px` font) — "Powered by Arafat Visitor Management System"
- Templates: `sendVisitorArrival`, `sendVisitorCheckin`, `sendHostWelcome`, `sendPasswordReset`, QR email (inline in controller)

### Notification Triggers
| Event | Email | WhatsApp | Recipient |
|-------|-------|----------|-----------|
| Walk-in visit created | Visitor arrival | Visitor arrival | Host |
| Pre-registration created | Visitor arrival | Visitor arrival | Host |
| QR check-in (APPROVED → CHECKED_IN) | Visitor check-in with details | Visitor arrival with details | Host |
| Password reset requested | Reset link (one-time token) | — | User |
| QR code sent from admin | QR email template | QR image + caption | Visitor |
| Host created (single or bulk import) | Welcome email with 72h reset link | — | Host |
| Staff created (single or bulk import) | Welcome email with 72h reset link | — | Staff |

## Backend API Response Format (Visits)

- All visit endpoints must return nested `visitor: { name, company, phone, email }` object (not flat `visitorName`, `visitorPhone` fields)
- `findBySessionId()`, `getActive()`, `checkout()`, `checkin()` all return this format
- Frontend `VisitSession` type expects nested `visitor` object — flat fields will break client-side filtering (e.g., phone search)

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

## Date Field Defaults & Validation

Both the Visitor form (`VisitForm.tsx`) and Pre-Registration form (`PreRegistrationForm.tsx`) use:
- **Default value**: Current date/time via `getCurrentDateTimeLocal()` helper
- **Min attribute**: `min={getCurrentDateTimeLocal()}` prevents selecting past dates
- Helper function converts local time to `datetime-local` format: `YYYY-MM-DDTHH:MM`
- When editing an existing record, `initialData` overrides the default (pre-fills the saved date)

## Shared Host/Staff Components (entityLabel Pattern)

The Staff page reuses host components with an `entityLabel` prop to customize labels:

| Component | Prop | Default | Staff Page Value |
|-----------|------|---------|------------------|
| `HostForm` | `entityLabel` | `'Host'` | `'Staff'` |
| `HostModal` | `entityLabel` | `'Host'` | `'Staff'` |
| `HostsList` | `entityLabel` | `'hosts'` | `'staff'` |
| `DeleteConfirmationDialog` | `entityLabel` | `'Host'` | `'Staff'` |
| `BulkImportModal` | `importEndpoint`, `title`, `expectedColumns`, `entityLabel` | hosts defaults | Users page: `'/admin/api/users/import'`, `'Bulk Import Users'` |

This avoids duplicating components. The `entityLabel` changes form labels ("Staff Name"), button text ("Create Staff"), empty states ("No staff found"), and pagination ("Showing X of Y staff").

**Note**: Staff sidebar item removed. Staff members are created via the Users page (single-add with role=STAFF, or bulk import with Role=STAFF in CSV). The Staff page route still exists but is not linked in navigation.

## Bulk User Import (`POST /admin/api/users/import`)

CSV/XLSX import on the Users page supporting all roles (ADMIN, RECEPTION, STAFF, HOST).

**Expected CSV columns**: Name, Email, Phone, Role
- `id` column is ignored if present (IDs are auto-generated)
- Passwords are auto-generated; welcome email with 72h reset link sent to each user
- Demo accounts (`@arafatvisitor.cloud`) and duplicate emails are automatically skipped
- STAFF users get an auto-created Host record (type=STAFF, company="Arafat Group") linked via `hostId`
- HOST users get an auto-created Host record (type=EXTERNAL) linked via `hostId`
- Existing Host records are reused if email matches (no duplicates)

## Windowed Pagination

All 5 list components (Hosts, Visitors, Deliveries, PreRegistrations, Users) use windowed pagination:
- Shows: `Previous [1] ... [4] [5] [6] ... [68] Next`
- If 7 or fewer total pages, shows all page numbers without ellipsis
- Always shows first page, last page, and a 3-page window around the current page

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

## Seed Data (Production)

### Seeding Commands
```bash
cd backend
npx prisma db seed     # Creates admin user if not exists (idempotent)
npx prisma studio      # Open database GUI
```

### Seed User
The seed script only creates one admin user (`admin@arafatvisitor.cloud` / `admin123`). All other users are managed via the admin panel or bulk CSV import.

No test data is seeded. The deploy workflow does not run seeds — it's a simple build-and-deploy flow. Seeds are only used for local development or manual one-time bootstrap.

### Mock Data (GitHub Actions Manual Workflow)
- **Workflow**: `.github/workflows/mock-data.yml` — triggered manually via `workflow_dispatch`
- **Actions**: "Insert Mock Data" or "Delete Mock Data"
- **Script**: `backend/prisma/mock-data.ts`
- **Insert** uses full `upsert` — re-running resets all mock records back to original state (reverts status changes, approvals, etc.)
- **Delete** removes all mock records by known ID prefixes (`mock-visit-*`, `mock-prereg-*`, `mock-delivery-*`, host IDs 900001–900010)
- Creates: 10 hosts, 10 visitors (mixed APPROVED/CHECKED_IN/CHECKED_OUT), 10 pre-registrations (mixed PENDING_APPROVAL/REJECTED), 10 deliveries (mixed RECEIVED/PICKED_UP)

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
1. Push to `main` branch triggers deployment (or manual via `workflow_dispatch`)
2. Kiosk frontend and admin SPA built locally in CI
3. Both uploaded to VPS via rsync
4. Backend: `npm install` → `prisma generate` → `prisma db push`
5. Lookup data populated (idempotent INSERT statements)
6. Backend built (`nest build`) and PM2 restarts
7. Nginx config updated and reloaded
8. Health check verified

No initial setup step, no seeds, no demo users. Single deploy flow for all pushes.

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
POST /admin/api/dashboard/approve/:id     # Approve visit (ADMIN, HOST, STAFF — not RECEPTION)
POST /admin/api/dashboard/reject/:id      # Reject visit (ADMIN, HOST, STAFF — not RECEPTION)
POST /admin/api/dashboard/checkout/:sessionId # Checkout (ADMIN, RECEPTION only)

# Token Login (Public — used by kiosk auto-login)
POST /admin/api/token-login               # Exchange valid JWT for new 24h admin token + httpOnly cookie

# QR & Notifications (ADMIN, RECEPTION)
GET  /admin/api/qr/:visitId               # Get QR code
POST /admin/api/send-qr                   # Send QR email/whatsapp

# Profile (ADMIN, RECEPTION, HOST)
POST /admin/api/change-password           # Change user password

# Settings (ADMIN only)
GET  /admin/api/settings                  # Get system settings
POST /admin/api/settings/test-email       # Test SMTP
POST /admin/api/settings/test-whatsapp    # Test WhatsApp (accepts {phone} or {recipientPhone})

# Hosts (ADMIN for CRUD, all roles can view — HOST/STAFF company-scoped)
POST /admin/api/hosts/import              # Bulk import (ADMIN only)
GET  /admin/api/hosts                     # List hosts (supports ?type=EXTERNAL|STAFF filter)
POST /admin/api/hosts                     # Create host (ADMIN only) — auto-creates HOST user + welcome email
PUT  /admin/api/hosts/:id                 # Update host (ADMIN only)
DELETE /admin/api/hosts/:id               # Delete host (ADMIN only)

# Staff (ADMIN only — uses Host model with type=STAFF)
GET  /admin/api/staff                     # List staff members
POST /admin/api/staff                     # Create staff — auto-creates STAFF user + welcome email
PUT  /admin/api/staff/:id                 # Update staff member
DELETE /admin/api/staff/:id               # Delete staff member

# Visitors (ADMIN, RECEPTION, HOST, STAFF for create — ADMIN only for delete)
GET  /admin/api/visitors                  # List visitors
POST /admin/api/visitors                  # Create visitor (ADMIN, RECEPTION, HOST, STAFF — HOST/STAFF auto-set hostId)
PUT  /admin/api/visitors/:id              # Update visitor (ADMIN, RECEPTION, HOST — HOST company-scoped)
DELETE /admin/api/visitors/:id            # Delete visitor (ADMIN only)

# Pre-registrations (all roles can view — HOST/STAFF company-scoped)
GET  /admin/api/pre-register              # List pre-registrations
POST /admin/api/pre-registrations         # Create (ADMIN, RECEPTION only) — notifies host via email+WhatsApp
PUT  /admin/api/pre-registrations/:id     # Update (ADMIN, RECEPTION)
DELETE /admin/api/pre-registrations/:id   # Delete (ADMIN only)
POST /admin/api/pre-registrations/:id/approve    # Approve (ADMIN, HOST, STAFF — not RECEPTION)
POST /admin/api/pre-registrations/:id/reject     # Reject (ADMIN, HOST, STAFF — not RECEPTION)
POST /admin/api/pre-registrations/:id/re-approve # Re-approve (ADMIN, HOST, STAFF — not RECEPTION)

# Deliveries (ADMIN, RECEPTION for CRUD — HOST/STAFF can view + mark picked up)
GET  /admin/api/deliveries                # List deliveries (ADMIN, RECEPTION, HOST, STAFF — HOST/STAFF company-scoped)
POST /admin/api/deliveries                # Create delivery (ADMIN, RECEPTION)
PUT  /admin/api/deliveries/:id            # Update delivery (ADMIN, RECEPTION)
DELETE /admin/api/deliveries/:id          # Delete delivery (ADMIN only)
POST /admin/api/deliveries/:id/mark-picked-up  # Mark picked up (ADMIN, RECEPTION, HOST, STAFF — HOST/STAFF company-scoped)

# Users (ADMIN only)
GET  /admin/api/users                     # List users (supports ?status=ACTIVE|INACTIVE filter)
POST /admin/api/users                     # Create user (status defaults to ACTIVE)
POST /admin/api/users/import              # Bulk import users from CSV/XLSX (all roles)
PUT  /admin/api/users/:id                 # Update user
DELETE /admin/api/users/:id               # Delete user
POST /admin/api/users/:id/activate        # Set user status to ACTIVE
POST /admin/api/users/:id/deactivate      # Set user status to INACTIVE

# Reports (ADMIN, HOST — HOST company-scoped)
GET  /admin/api/reports/visits            # Visit reports
GET  /admin/api/reports/deliveries        # Delivery reports

# Lookups (ADMIN, RECEPTION, HOST, STAFF)
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
- id, email, password, name, role (ADMIN/RECEPTION/HOST/STAFF), status (ACTIVE/INACTIVE), hostId

### Host
A **contact person at a company** (external host or internal staff) who can receive visitors or deliveries.
- id, externalId, name, company, email, phone, location, status, **type** (EXTERNAL/STAFF)
- `type` field distinguishes external hosts from internal staff members (default: EXTERNAL)
- Each host belongs to one location; a company can have hosts across multiple locations
- Bulk Import: CSV/XLSX upload via "Bulk Import" button on /admin/hosts (external hosts only)

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

**Important**: The seed script (`backend/prisma/seed.ts`) only creates the initial admin user for production bootstrap.

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
