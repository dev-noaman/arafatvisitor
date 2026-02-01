# Implementation Plan: Fullstack Unit Testing

**Branch**: `004-fullstack-unit-testing` | **Date**: 2026-01-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-fullstack-unit-testing/spec.md`

## Summary

Implement comprehensive unit testing infrastructure for both frontend (React/Vite) and backend (NestJS) systems. This includes configuring test runners (Vitest for frontend, Jest for backend), setting up mocking utilities, creating test helpers, establishing coverage thresholds (80% minimum), and providing example tests for 2-3 key modules in each layer to serve as templates.

## Technical Context

**Language/Version**: TypeScript 5.9 (frontend), TypeScript 5.1 (backend)
**Primary Dependencies**:
- Frontend: Vitest, React Testing Library, @testing-library/user-event, jsdom
- Backend: Jest (already in devDependencies), @nestjs/testing, jest-mock-extended
**Storage**: N/A (tests use mocked Prisma client)
**Testing**: Vitest (frontend), Jest (backend)
**Target Platform**: Node.js development environment, CI/CD pipelines
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Test suites complete in under 60 seconds each
**Constraints**: 80% minimum line coverage threshold, tests must be isolated and non-flaky
**Scale/Scope**: ~24 frontend components/modules, ~50 backend source files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution template has not been customized for this project. Applying standard best practices:

| Principle | Status | Notes |
|-----------|--------|-------|
| Test-First | ✅ PASS | This feature establishes testing infrastructure |
| Simplicity | ✅ PASS | Using standard tools (Vitest, Jest) already in ecosystem |
| Observability | ✅ PASS | Coverage reports provide visibility into test quality |
| Library-First | N/A | Infrastructure feature, not a library |

**Gate Status**: PASSED - No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/004-fullstack-unit-testing/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (minimal for this feature)
├── quickstart.md        # Phase 1 output
├── contracts/           # N/A for testing infrastructure
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
# Frontend Testing Structure
src/
├── test/
│   └── setup.ts                    # Vitest setup, global mocks
├── lib/
│   └── test-utils.tsx              # Custom render with providers
├── components/ui/
│   └── button.test.tsx             # Example: UI component test
├── features/auth/
│   └── LoginForm.test.tsx          # Example: Feature component test
└── features/visitors/
    └── WalkInForm.test.tsx         # Example: Form with validation test

# Backend Testing Structure
backend/
├── test/
│   ├── jest-e2e.json               # E2E config (existing)
│   └── setup.ts                    # Jest global setup
├── src/
│   ├── test-utils/
│   │   ├── prisma.mock.ts          # Prisma client mock factory
│   │   └── module.factory.ts       # NestJS test module helpers
│   ├── auth/
│   │   └── auth.service.spec.ts    # Example: Service with JWT test
│   ├── visits/
│   │   └── visits.service.spec.ts  # Example: Service with Prisma test
│   └── hosts/
│       └── hosts.controller.spec.ts # Example: Controller test
```

**Structure Decision**: Tests are colocated with source files following community conventions. Frontend uses `.test.tsx` suffix, backend uses `.spec.ts` suffix (NestJS standard). Shared test utilities are placed in dedicated directories.

## Complexity Tracking

> No violations - table not needed.

## Post-Design Constitution Re-Check

| Principle | Status | Post-Design Notes |
|-----------|--------|-------------------|
| Test-First | ✅ PASS | Infrastructure enables TDD workflow |
| Simplicity | ✅ PASS | Minimal new dependencies, standard patterns |
| Observability | ✅ PASS | Coverage reports + clear test output |
| Library-First | N/A | Not applicable |

**Final Gate Status**: PASSED

## Generated Artifacts

| Artifact | Path | Description |
|----------|------|-------------|
| Plan | `specs/004-fullstack-unit-testing/plan.md` | This implementation plan |
| Research | `specs/004-fullstack-unit-testing/research.md` | Technical decisions and rationale |
| Data Model | `specs/004-fullstack-unit-testing/data-model.md` | Conceptual test entities |
| Quickstart | `specs/004-fullstack-unit-testing/quickstart.md` | Developer guide for running/writing tests |

## Next Steps

Run `/speckit.tasks` to generate the implementation task list.
