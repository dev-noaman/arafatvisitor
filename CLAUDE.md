# Arafat Visitor Management System Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-28

## Active Technologies
- TypeScript 5.9, NestJS (Node.js backend) + NestJS, Prisma ORM, AdminJS, bcrypt (002-host-user-sync)
- TypeScript 5.9 (frontend), TypeScript 5.1 (backend) (004-fullstack-unit-testing)
- N/A (tests use mocked Prisma client) (004-fullstack-unit-testing)

- **Language**: TypeScript 5.9, React 19, ES2022 target
- **Build**: Vite 7.2
- **Styling**: TailwindCSS 4.1 with Shadcn-style UI primitives (class-variance-authority 0.7, tailwind-merge, clsx)
- **Forms**: React Hook Form 7.71 + Zod 4.3
- **Animation**: Framer Motion 12
- **QR Scanning**: jsQR 1.4 + react-webcam 7.2
- **Notifications**: Sonner 2.0 (toast)
- **Icons**: Lucide React
- **Backend**: NestJS + Prisma + PostgreSQL 16 (separate system)
- **Testing**: Vitest + React Testing Library

## Project Structure

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
        ├── api.ts                  # REST API client
        ├── notifications.ts        # Email + WhatsApp dispatch
        └── utils.ts                # cn() utility
```

## Commands

### Frontend Commands
```bash
npm run dev       # Start dev server (http://localhost:5173)
npm run build     # Type-check + production build
npm run lint      # ESLint
npm run preview   # Preview production build
npm test          # Run all unit tests once (Vitest)
npm run test:watch # Run tests in watch mode (re-runs on file change)
npm run test:cov  # Run tests with coverage report (v8 provider)
```

### Backend Commands
```bash
cd backend
npm run start      # Start backend server
npm run start:dev  # Start with watch mode
npm test           # Run all unit tests once (Jest)
npm run test:watch # Run tests in watch mode
npm run test:cov   # Run tests with coverage report
npm run test:e2e   # Run end-to-end tests
```

## Code Style

- TypeScript strict mode enabled
- Path alias: `@/` maps to `./src/`
- Components use named exports (not default)
- UI primitives use forwardRef pattern with cn() for className merging
- Forms use React Hook Form with Zod schema validation
- State management via React hooks (useState, useEffect, useMemo) - no external state library
- Toast notifications via Sonner's `toast` function
- Touch-friendly: minimum 44px tap targets, `touch-manipulation` class on interactive elements

## Testing

### Frontend Testing
- **Framework**: Vitest 4.0 with React Testing Library
- **Environment**: happy-dom (lightweight DOM simulator)
- **Coverage**: v8 provider with 80% minimum threshold (lines, branches, functions, statements)
- **Test Files**: Colocated with source using `.test.tsx` / `.test.ts` suffix
- **Setup**: `src/test/setup.ts` provides global mocks (matchMedia, IntersectionObserver, etc.)
- **Utilities**: `src/lib/test-utils.tsx` exports custom render with providers + all RTL exports
- **Writing Tests**:
  ```typescript
  import { describe, it, expect, vi } from 'vitest'
  import { render, screen } from '@/lib/test-utils'
  import { Button } from './button'

  describe('Button', () => {
    it('renders with text', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })
  ```

### Backend Testing
- **Framework**: Jest 29.5 with NestJS testing utilities
- **Runner**: ts-jest for TypeScript transformation
- **Coverage**: istanbul provider with 80% minimum threshold
- **Test Files**: Colocated with source using `.spec.ts` suffix (NestJS convention)
- **Setup**: `backend/test/setup.ts` provides global configuration
- **Mocking**:
  - `backend/src/test-utils/prisma.mock.ts` - Prisma client mocking (no database)
  - `backend/src/test-utils/module.factory.ts` - NestJS module creation helpers
- **Writing Tests**:
  ```typescript
  import { Test, TestingModule } from '@nestjs/testing'
  import { AuthService } from './auth.service'
  import { PrismaService } from '../prisma/prisma.service'

  describe('AuthService', () => {
    let service: AuthService
    let module: TestingModule

    beforeEach(async () => {
      module = await Test.createTestingModule({
        providers: [AuthService, { provide: PrismaService, useValue: mockDeep() }],
      }).compile()
      service = module.get(AuthService)
    })

    it('should login user', async () => {
      const result = await service.login({ email: 'test@example.com', password: 'pass' })
      expect(result).toHaveProperty('token')
    })
  })
  ```

### Coverage Thresholds
- **Target**: 80% line coverage minimum
- **Metrics**: Lines, branches, functions, statements all measured
- **CI Enforcement**: Builds fail if coverage drops below threshold
- **Reports**: HTML reports generated at `coverage/` (frontend) and `backend/coverage/`

### Test Isolation
- Mocks reset before each test via `beforeEach`
- No shared state between tests
- Each test is independently testable and executable

## Recent Changes
- 004-fullstack-unit-testing: Added TypeScript 5.9 (frontend), TypeScript 5.1 (backend)
- 002-host-user-sync: Added TypeScript 5.9, NestJS (Node.js backend) + NestJS, Prisma ORM, AdminJS, bcrypt
- **001-visitor-kiosk-ui**: Initial kiosk UI with walk-in check-in, QR scanning, delivery management, authentication, and role-based dashboard

<!-- MANUAL ADDITIONS START -->

## Admin Panel

### URLs
- **Admin Panel**: http://localhost:3000/admin
- **Quick Login**: http://localhost:3000/admin/quick-login

### Test Login Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@arafatvisitor.cloud | admin123 |
| GM | gm@arafatvisitor.cloud | gm123 |
| Host | host@arafatvisitor.cloud | host123 |
| Reception | reception@arafatvisitor.cloud | reception123 |

### Admin Panel Sections
- **Hosts**: Manage host/employee records
- **Deliveries**: Track package deliveries
- **Visitors**: Currently checked-in visitors (CHECKED_IN, CHECKED_OUT)
- **Pre Register**: Pre-registered visits awaiting approval (PRE_REGISTERED, PENDING_APPROVAL, APPROVED, REJECTED)
- **Users**: System user management (Admin only)
- **Reports**: Visit and delivery reports
- **Settings**: System configuration (SMTP, WhatsApp)

### Custom AdminJS Theme

The admin panel uses custom styling to override the default AdminJS theme.

#### Theme Files
```
backend/public/
├── admin-custom.css   # Custom CSS overrides
└── admin-scripts.js   # Custom JavaScript behavior
```

#### Custom CSS (`admin-custom.css`)
- **Forced Light Mode**: Dark mode variables remapped to light colors
- **Always-Visible Sidebar**: Sidebar remains open and visible at all times
- **Hidden Theme Toggle**: Dark mode toggle button is hidden
- **Compact Tables**: Reduced padding and font sizes for better data density
- **Custom Colors**: Brand-aligned color scheme

Key CSS customizations:
```css
/* Force light mode */
:root, [data-theme="dark"] {
  --color-bg: #ffffff;
  --color-text: #1e1e2d;
}

/* Sidebar always visible */
aside[data-css="sidebar"] {
  transform: translateX(0) !important;
  width: 240px !important;
}

/* Hide dark mode toggle */
[data-testid="theme-toggle"],
button[title*="theme"],
button[title*="Theme"] {
  display: none !important;
}

/* Compact table rows */
.adminjs_TableRow td {
  padding: 8px 12px !important;
  font-size: 13px !important;
}
```

#### Custom JavaScript (`admin-scripts.js`)
- **Force Light Mode**: Removes dark mode attributes on page load
- **Prevent Theme Changes**: Overrides localStorage to block theme switching
- **Sidebar Auto-Open**: Ensures sidebar is always expanded
- **Navigation Cleanup**: Removes unwanted labels from navigation items

Key JS customizations:
```javascript
// Force light mode on load
document.documentElement.removeAttribute('data-theme');
document.body.classList.remove('dark-theme');

// Override localStorage to prevent dark mode
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  if (key === 'adminjs-theme' && value === 'dark') {
    return; // Block dark mode
  }
  originalSetItem.call(this, key, value);
};

// Force sidebar open
const sidebar = document.querySelector('aside[data-css="sidebar"]');
if (sidebar) {
  sidebar.style.transform = 'translateX(0)';
}
```

#### How Theme is Loaded
In `backend/src/main.ts`, static files are served from `backend/public/`:
```typescript
expressApp.use('/admin/public', express.static(join(__dirname, '..', 'public')));
```

AdminJS config in `backend/src/admin/admin.config.ts` includes the custom assets:
```typescript
assets: {
  styles: ['/admin/public/admin-custom.css'],
  scripts: ['/admin/public/admin-scripts.js'],
}
```

## Visit Workflow

```
Pre Register Panel                    Visitors Panel
────────────────────────────────────────────────────
PRE_REGISTERED → PENDING_APPROVAL → APPROVED → CHECKED_IN → CHECKED_OUT
                        ↓
                    REJECTED
```

| Status | Panel | Description |
|--------|-------|-------------|
| PRE_REGISTERED | Pre Register | Visit scheduled, awaiting approval |
| PENDING_APPROVAL | Pre Register | Visitor arrived, waiting for host |
| APPROVED | Pre Register | Host approved, ready for check-in |
| REJECTED | Pre Register | Host rejected the visit |
| CHECKED_IN | Visitors | Visitor currently on-site |
| CHECKED_OUT | Visitors | Visitor has left |

## Test Seed Data

### Seeding Commands
```bash
cd backend
npx prisma db seed     # Run seed script (clears and recreates test data)
npx prisma studio      # Open database GUI
```

### Test Data Details
**IMPORTANT**: Seed script clears existing test data before creating new records to avoid duplicates.

All test data uses:
- **Phone**: +97450707317 (for WhatsApp testing)
- **Email**: adel.noaman@arafatgroup.com (for email testing)

Test data is identified by:
- Hosts: `externalId` starting with `TEST-`
- Visitors: `visitorPhone` = +97450707317

### Test Hosts (10)
| Name | Company | Location |
|------|---------|----------|
| Ahmed Al-Rashid | Qatar Petroleum | Barwa Towers |
| Sarah Johnson | Ooredoo Qatar | Marina 50 |
| Mohammed Hassan | Qatar Airways | Element Mariott |
| Fatima Al-Thani | QNB Group | Barwa Towers |
| John Smith | Ashghal | Marina 50 |
| Noura Al-Sulaiti | Vodafone Qatar | Element Mariott |
| David Wilson | Qatar Foundation | Barwa Towers |
| Maryam Al-Kuwari | Katara Hospitality | Marina 50 |
| Khalid Ibrahim | Qatar Energy | Element Mariott |
| Lisa Brown | Hamad Medical Corp | Barwa Towers |

### Test Visitors (10)
**Pre Register Panel (5):**
| Name | Status |
|------|--------|
| Michael Chen | PRE_REGISTERED |
| Aisha Al-Mahmoud | PENDING_APPROVAL |
| Robert Garcia | APPROVED |
| Huda Al-Baker | REJECTED |
| James Wilson | PRE_REGISTERED |

**Visitors Panel (5):**
| Name | Status |
|------|--------|
| Layla Hassan | CHECKED_IN |
| Thomas Anderson | CHECKED_IN |
| Reem Al-Naimi | CHECKED_OUT |
| Daniel Lee | CHECKED_IN |
| Salma Youssef | CHECKED_OUT |

### Test Deliveries (10)
One delivery per host via DHL, FedEx, Aramex, Qatar Post, UPS, TNT Express.

## Send QR Feature

### Functionality
Send QR codes to visitors via Email or WhatsApp from the Admin Panel.

### How to Use
1. Go to **Visitors** or **Pre Register** panel
2. Click on a visitor record
3. Click **Send QR** button
4. Choose **Email** or **WhatsApp**

### API Endpoints
```
GET  /admin/api/qr/:visitId     # Get QR code data URL
POST /admin/api/send-qr         # Send QR via email/whatsapp
     Body: { visitId: string, method: 'email' | 'whatsapp' }
```

### Email Template
Sends HTML email with embedded QR code image, visitor name, host info, and purpose.

### WhatsApp Message
Sends a **visitor pass card image** with:
- Header: "VISITOR PASS"
- Visitor name and company
- QR code (centered)
- Host name and company
- Purpose of visit
- Date

The card is generated using `node-canvas` and sent as an image via wbiztool API (`msg_type: 1`).

## Notification Services

### Email (SMTP)
Configured in `.env`:
```
SMTP_HOST=smtp.emailit.com
SMTP_PORT=587
SMTP_USER=emailit
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

## Key API Endpoints

### Admin API (no JWT, session-based)
```
GET  /admin/api/dashboard/kpis              # Dashboard statistics
GET  /admin/api/dashboard/pending-approvals # Pending visits
GET  /admin/api/dashboard/received-deliveries # Pending deliveries
GET  /admin/api/dashboard/charts            # Chart data
GET  /admin/api/dashboard/current-visitors  # Active visitors
POST /admin/api/dashboard/approve/:id       # Approve visit
POST /admin/api/dashboard/reject/:id        # Reject visit
POST /admin/api/dashboard/checkout/:sessionId # Check out visitor
GET  /admin/api/qr/:visitId                 # Get QR code
POST /admin/api/send-qr                     # Send QR email/whatsapp
POST /admin/api/change-password             # Change user password
GET  /admin/api/settings                    # Get system settings
POST /admin/api/settings/test-email         # Test SMTP
POST /admin/api/settings/test-whatsapp      # Test WhatsApp
POST /admin/api/hosts/import                # Bulk import hosts (CSV/XLSX)
```

### Public API (JWT required)
```
POST /auth/login                # Login, get JWT
POST /auth/forgot-password      # Request password reset
POST /auth/reset-password       # Reset password with token
GET  /visits/active             # Active visitors
GET  /visits/history            # Visit history
POST /visits                    # Create walk-in visit
POST /visits/pre-register       # Pre-register visit
GET  /visits/:sessionId         # Get visit by session
POST /visits/:sessionId/checkout # Check out visitor
GET  /deliveries                # List deliveries
POST /deliveries                # Create delivery
```

## Database Schema (Key Models)

### User
- id, email, password, name, role (ADMIN/RECEPTION/HOST), hostId

### Host
- id, externalId, name, company, email, phone, location, status

### Visit
- id, sessionId, visitorName, visitorCompany, visitorPhone, visitorEmail
- hostId, purpose, location, status, expectedDate
- checkInAt, checkOutAt, approvedAt, rejectedAt

### QrToken
- id, visitId, token, expiresAt, usedAt

### Delivery
- id, recipient, hostId, courier, location, status, notes
- receivedAt, pickedUpAt

### Location Enum
- BARWA_TOWERS, MARINA_50, ELEMENT_MARIOTT

<!-- MANUAL ADDITIONS END -->
