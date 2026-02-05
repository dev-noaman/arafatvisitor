# Arafat Visitor Management System Development Guidelines

Last updated: 2026-02-05 (Database-driven lookups for all dropdowns)

## Active Technologies

- **Language**: TypeScript 5.7 (admin), TypeScript 5.1 (backend), ES2022 target
- **Admin Panel**: React 19, React Router 7, TailwindCSS 4, ApexCharts, Vite 6
- **Frontend (Reception)**: React 19, TailwindCSS 4.1, Vite 7.2
- **Forms**: React Hook Form + Zod validation
- **Backend**: NestJS + Prisma ORM + PostgreSQL 16
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
│   │   │   ├── dashboard/         # KPI cards, charts, visitor lists
│   │   │   ├── layout/            # Sidebar, Header, AppLayout
│   │   │   └── ui/                # Buttons, inputs, modals, tables
│   │   ├── contexts/              # AuthContext, ToastContext
│   │   ├── hooks/                 # useAuth, useToast, etc.
│   │   ├── pages/                 # Route pages (Dashboard, Visitors, etc.)
│   │   ├── services/              # API service functions
│   │   ├── types/                 # TypeScript interfaces
│   │   └── utils/                 # Utility functions (formatDate, etc.)
│   ├── package.json
│   └── vite.config.ts
├── backend/                       # NestJS API server
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── seed.ts                # Test data seeding
│   ├── src/
│   │   ├── main.ts                # App entry, static file serving
│   │   ├── admin/
│   │   │   └── admin.controller.ts # Admin API endpoints
│   │   ├── auth/                  # JWT authentication
│   │   ├── hosts/                 # Host management
│   │   ├── visits/                # Visit management
│   │   ├── deliveries/            # Delivery management
│   │   └── notifications/
│   │       ├── email.service.ts   # SMTP email sending (with CID attachments)
│   │       └── whatsapp.service.ts # WhatsApp via wbiztool (text + images)
│   └── public/
│       └── admin/                 # Built admin SPA served here
└── src/                           # Reception frontend (Vite + React)
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
npm test           # Run all unit tests once (Jest)
npm run test:cov   # Run tests with coverage report
npm run lint       # ESLint
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
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@arafatvisitor.cloud | admin123 |
| Reception | reception@arafatvisitor.cloud | reception123 |
| Host | host@arafatvisitor.cloud | host123 |

### Quick Demo Login
The login page has quick demo login buttons for Admin, Reception, and Host roles.

### Admin Panel Sections
- **Dashboard**: KPIs, charts, pending approvals, current visitors
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
- "VISITOR PASS" header
- Visitor name and company
- Host name and company
- Purpose of visit
- Check-in instructions

Generated using `qrcode` library (toDataURL) and sent via wbiztool API using native FormData (`msg_type: 1` for images).

### Email Template
Professional HTML email with:
- Gradient header with "VISITOR PASS" branding
- Inline QR code image (CID attachment for email client compatibility)
- Visitor details table (Host, Company, Purpose)
- Styled footer with Arafat VMS branding

### API Endpoints
```
GET  /admin/api/qr/:visitId     # Get QR code data URL
POST /admin/api/send-qr         # Send QR via email/whatsapp
     Body: { visitId: string, method: 'email' | 'whatsapp' }
```

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

## Code Style

- TypeScript strict mode enabled
- Path alias: `@/` maps to `./src/`
- Components use named exports (not default)
- Forms use React Hook Form with Zod schema validation
- State management via React hooks (useState, useEffect, useMemo) - no external state library
- Toast notifications via Sonner
- TailwindCSS for styling with utility-first approach

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

### Admin API (JWT token-based)
```
POST /admin/api/login                     # Login, get JWT token
GET  /admin/api/dashboard/kpis            # Dashboard statistics
GET  /admin/api/dashboard/pending-approvals # Pending visits
GET  /admin/api/dashboard/received-deliveries # Pending deliveries
GET  /admin/api/dashboard/charts          # Chart data
GET  /admin/api/dashboard/current-visitors # Active visitors
POST /admin/api/dashboard/approve/:id     # Approve visit
POST /admin/api/dashboard/reject/:id      # Reject visit
POST /admin/api/dashboard/checkout/:sessionId # Check out visitor
GET  /admin/api/qr/:visitId               # Get QR code
POST /admin/api/send-qr                   # Send QR email/whatsapp
POST /admin/api/change-password           # Change user password
GET  /admin/api/settings                  # Get system settings
POST /admin/api/settings/test-email       # Test SMTP
POST /admin/api/settings/test-whatsapp    # Test WhatsApp
POST /admin/api/hosts/import              # Bulk import hosts (CSV/XLSX)
GET  /admin/api/visitors                  # List visitors with filters
GET  /admin/api/pre-register              # List pre-registered visits
GET  /admin/api/deliveries                # List deliveries
GET  /admin/api/hosts                     # List hosts
GET  /admin/api/users                     # List users (Admin only)
GET  /admin/api/lookups/purposes          # Purpose of visit dropdown values
GET  /admin/api/lookups/delivery-types    # Delivery type dropdown values
GET  /admin/api/lookups/couriers          # Courier dropdown values
GET  /admin/api/lookups/locations         # Location dropdown values
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

### QrToken
- id, visitId, token, expiresAt, usedAt

### Delivery
- id, deliveryType, recipient, hostId, courier, location, status, notes
- receivedAt, pickedUpAt

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
