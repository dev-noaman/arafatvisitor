# Quickstart: Fullstack Unit Testing

**Feature**: 004-fullstack-unit-testing
**Date**: 2026-01-30

## Prerequisites

- Node.js 18+ installed
- npm installed
- Repository cloned and dependencies installed

## Running Tests

### Frontend Tests

```bash
# Run all frontend tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:cov

# Run specific test file
npm test -- src/features/auth/LoginForm.test.tsx
```

### Backend Tests

```bash
cd backend

# Run all backend tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:cov

# Run specific test file
npm test -- src/auth/auth.service.spec.ts
```

## Writing Tests

### Frontend Component Test Example

```typescript
// src/components/ui/button.test.tsx
import { render, screen } from '@/lib/test-utils'
import { userEvent } from '@testing-library/user-event'
import { Button } from './button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Frontend Form Test Example

```typescript
// src/features/auth/LoginForm.test.tsx
import { render, screen, waitFor } from '@/lib/test-utils'
import { userEvent } from '@testing-library/user-event'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    render(<LoginForm onSubmit={vi.fn()} />)

    await user.type(screen.getByLabelText(/email/i), 'invalid')
    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
    })
  })
})
```

### Backend Service Test Example

```typescript
// src/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import { mockDeep } from 'jest-mock-extended'

describe('AuthService', () => {
  let service: AuthService
  let jwtService: JwtService
  let usersService: UsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockDeep<JwtService>() },
        { provide: UsersService, useValue: mockDeep<UsersService>() },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    jwtService = module.get<JwtService>(JwtService)
    usersService = module.get<UsersService>(UsersService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
```

### Backend Controller Test Example

```typescript
// src/hosts/hosts.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { HostsController } from './hosts.controller'
import { HostsService } from './hosts.service'
import { mockDeep } from 'jest-mock-extended'

describe('HostsController', () => {
  let controller: HostsController
  let hostsService: HostsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HostsController],
      providers: [
        { provide: HostsService, useValue: mockDeep<HostsService>() },
      ],
    }).compile()

    controller = module.get<HostsController>(HostsController)
    hostsService = module.get<HostsService>(HostsService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
```

## Test Utilities

### Frontend: Custom Render

Use `@/lib/test-utils` instead of direct `@testing-library/react` import:

```typescript
import { render, screen, waitFor } from '@/lib/test-utils'
```

This wrapper provides:
- All React Testing Library exports
- Pre-configured providers (if any)
- Extended matchers from `@testing-library/jest-dom`

### Backend: Prisma Mock

Use `createMockPrisma()` for database mocking:

```typescript
import { createMockPrisma } from '../test-utils/prisma.mock'

const prisma = createMockPrisma()
prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'test@example.com' })
```

## Coverage Thresholds

Both frontend and backend enforce 80% minimum coverage:

- Lines: 80%
- Branches: 80%
- Functions: 80%
- Statements: 80%

CI builds will fail if coverage drops below these thresholds.

## Troubleshooting

### Tests not finding modules
Ensure path aliases are configured in test config:
- Frontend: Check `vitest.config.ts` has `resolve.alias` matching `vite.config.ts`
- Backend: Check `jest.config.js` has `moduleNameMapper` for `@/*` paths

### Async tests timing out
Increase timeout for slow operations:
```typescript
it('slow operation', async () => {
  // ...
}, 10000) // 10 second timeout
```

### Mock not resetting between tests
Add to test file or setup:
```typescript
beforeEach(() => {
  vi.clearAllMocks() // Vitest
  jest.clearAllMocks() // Jest
})
```
