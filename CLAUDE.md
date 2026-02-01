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
<!-- MANUAL ADDITIONS END -->
