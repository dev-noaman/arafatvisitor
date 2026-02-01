# Research: Fullstack Unit Testing

**Feature**: 004-fullstack-unit-testing
**Date**: 2026-01-30

## Research Summary

This document captures technical decisions and best practices for implementing unit testing infrastructure across the frontend (React/Vite) and backend (NestJS) systems.

---

## 1. Frontend Test Runner Selection

**Decision**: Vitest

**Rationale**:
- Native integration with Vite build system (already used in project)
- Near-identical API to Jest (low learning curve)
- Significantly faster than Jest for Vite projects due to native ESM support
- Built-in coverage via v8 or istanbul
- Watch mode with instant HMR-like feedback

**Alternatives Considered**:
- **Jest**: Industry standard but requires additional configuration for Vite/ESM, slower transformation
- **Testing Library only**: Not a test runner, needs a runner

---

## 2. Frontend Testing Library Selection

**Decision**: React Testing Library + @testing-library/user-event

**Rationale**:
- Encourages testing user behavior over implementation details
- Official recommendation from React team
- Works seamlessly with Vitest
- `user-event` simulates real user interactions more accurately than `fireEvent`

**Alternatives Considered**:
- **Enzyme**: Deprecated, React 19 not supported
- **React Test Renderer**: Lower-level, more verbose, less user-centric

---

## 3. Frontend DOM Environment

**Decision**: jsdom via happy-dom

**Rationale**:
- happy-dom is faster than jsdom for most use cases
- Sufficient DOM implementation for React component testing
- Can fall back to jsdom for edge cases requiring fuller implementation

**Alternatives Considered**:
- **jsdom only**: Slower but more complete DOM implementation
- **Browser testing (Playwright)**: Overkill for unit tests, better suited for E2E

---

## 4. Backend Test Runner

**Decision**: Jest (already configured)

**Rationale**:
- NestJS official testing utilities built for Jest
- Already in project devDependencies
- Mature ecosystem with extensive mocking capabilities
- `ts-jest` handles TypeScript transformation

**Alternatives Considered**:
- **Vitest for backend**: Would work but NestJS tooling is Jest-centric
- **Mocha/Chai**: Requires more manual setup, less integrated with NestJS

---

## 5. Backend Mocking Strategy

**Decision**: jest-mock-extended + custom Prisma mock factory

**Rationale**:
- `jest-mock-extended` provides type-safe deep mocks with `mockDeep<T>()`
- Prisma client can be fully mocked without database connection
- NestJS `@nestjs/testing` module provides `Test.createTestingModule()` for DI mocking

**Alternatives Considered**:
- **In-memory database (SQLite)**: Slower, not true unit tests, harder to control state
- **Manual mocks**: More boilerplate, easy to miss type changes

---

## 6. Coverage Tool Configuration

**Decision**:
- Frontend: Vitest native coverage with v8 provider
- Backend: Jest built-in coverage with istanbul

**Rationale**:
- Both tools have mature, built-in coverage support
- v8 coverage is faster for frontend
- Istanbul is standard for Jest/backend

**Configuration for 80% threshold**:
```javascript
// vitest.config.ts (frontend)
coverage: {
  provider: 'v8',
  reporter: ['text', 'html', 'lcov'],
  thresholds: {
    lines: 80,
    branches: 80,
    functions: 80,
    statements: 80
  }
}

// jest.config.js (backend)
coverageThreshold: {
  global: {
    lines: 80,
    branches: 80,
    functions: 80,
    statements: 80
  }
}
```

---

## 7. Test File Naming Convention

**Decision**:
- Frontend: `*.test.tsx` / `*.test.ts` (colocated with source)
- Backend: `*.spec.ts` (colocated with source, NestJS convention)

**Rationale**:
- Industry standard conventions
- NestJS generators create `.spec.ts` files by default
- Colocated tests improve discoverability and maintenance

---

## 8. Example Test Modules Selection

**Decision**:

**Frontend (3 modules)**:
1. `button.tsx` - Simple UI component, demonstrates basic rendering and interaction
2. `LoginForm.tsx` - Form with validation, demonstrates React Hook Form + Zod testing
3. `WalkInForm.tsx` - Complex form with multiple fields, demonstrates comprehensive form testing

**Backend (3 modules)**:
1. `auth.service.ts` - Service with JWT operations, demonstrates mocking external dependencies
2. `visits.service.ts` - Service with Prisma queries, demonstrates database mocking
3. `hosts.controller.ts` - Controller with guards, demonstrates HTTP/auth testing

**Rationale**:
- Covers different testing patterns (components, forms, services, controllers)
- High-value modules that touch authentication and core business logic
- Provides templates for the most common test scenarios developers will encounter

---

## 9. CI Integration Approach

**Decision**: npm scripts with proper exit codes

**Rationale**:
- Both Vitest and Jest exit with code 1 on test failure by default
- Coverage threshold violations also cause non-zero exit
- No special CI configuration needed beyond running `npm test`

**Scripts**:
```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:cov": "vitest run --coverage"
}
```

---

## 10. Test Isolation Strategy

**Decision**:
- Reset mocks between tests via `beforeEach`
- Use `vi.clearAllMocks()` (Vitest) / `jest.clearAllMocks()` (Jest)
- Avoid shared state in test utilities

**Rationale**:
- Prevents test pollution and ordering dependencies
- Each test starts with clean mock state
- Easier to debug failures

---

## Dependencies to Install

### Frontend
```bash
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event @testing-library/jest-dom happy-dom
```

### Backend
```bash
npm install -D jest-mock-extended @types/jest
```

Note: `jest`, `ts-jest`, `@nestjs/testing`, `@types/jest` are already in backend devDependencies.
