# Tasks: Fullstack Unit Testing

**Input**: Design documents from `/specs/004-fullstack-unit-testing/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md

**Tests**: This feature IS about testing infrastructure, so example tests ARE included as part of deliverables.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `src/` at repository root (Vite/React)
- **Backend**: `backend/src/` (NestJS)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create base configuration files

- [x] T001 [P] Install frontend testing dependencies: `npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event @testing-library/jest-dom happy-dom`
- [x] T002 [P] Install backend testing dependencies: `cd backend && npm install -D jest-mock-extended`
- [x] T003 Create Vitest configuration in vitest.config.ts at repository root
- [x] T004 Create frontend test setup file in src/test/setup.ts
- [x] T005 Update package.json with test scripts (test, test:watch, test:cov)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create shared test utilities that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create frontend test utilities with custom render in src/lib/test-utils.tsx
- [x] T007 Create backend Prisma mock factory in backend/src/test-utils/prisma.mock.ts
- [x] T008 Create backend NestJS module factory helpers in backend/src/test-utils/module.factory.ts
- [x] T009 Create backend Jest setup file in backend/test/setup.ts
- [x] T010 Update backend jest.config.js with setup file and coverage thresholds (80%)

**Checkpoint**: Foundation ready - test utilities available for all user stories

---

## Phase 3: User Story 1 - Developer Runs Frontend Tests (Priority: P1) 🎯 MVP

**Goal**: Frontend developers can run `npm test` and see passing tests with clear output

**Independent Test**: Run `npm test` in project root, verify tests execute and pass with timing output

### Implementation for User Story 1

- [x] T011 [P] [US1] Create Button component test in src/components/ui/button.test.tsx
- [x] T012 [P] [US1] Create LoginForm component test in src/features/auth/LoginForm.test.tsx
- [x] T013 [P] [US1] Create WalkInForm component test in src/features/visitors/WalkInForm.test.tsx
- [x] T014 [US1] Verify all frontend tests pass with `npm test`
- [x] T015 [US1] Verify test output shows clear pass/fail status with file locations

**Checkpoint**: Frontend testing is fully functional - developers can run and write tests

---

## Phase 4: User Story 2 - Developer Runs Backend Tests (Priority: P1)

**Goal**: Backend developers can run `npm test` in backend/ and see passing tests with mocked dependencies

**Independent Test**: Run `cd backend && npm test`, verify tests execute with mocked Prisma/services

### Implementation for User Story 2

- [x] T016 [P] [US2] Create AuthService test in backend/src/auth/auth.service.spec.ts
- [x] T017 [P] [US2] Create VisitsService test in backend/src/visits/visits.service.spec.ts
- [x] T018 [P] [US2] Create HostsController test in backend/src/hosts/hosts.controller.spec.ts
- [x] T019 [US2] Verify all backend tests pass with `cd backend && npm test`
- [x] T020 [US2] Verify tests use mocked Prisma client (no real database connection)

**Checkpoint**: Backend testing is fully functional - developers can run and write tests

---

## Phase 5: User Story 3 - Developer Views Test Coverage Report (Priority: P2)

**Goal**: Developers can generate and view coverage reports showing 80%+ coverage

**Independent Test**: Run `npm run test:cov`, verify HTML report generates at coverage/index.html

### Implementation for User Story 3

- [x] T021 [P] [US3] Configure frontend coverage thresholds (80%) in vitest.config.ts
- [x] T022 [P] [US3] Verify backend coverage thresholds (80%) in backend/jest.config.js
- [x] T023 [US3] Run frontend coverage and verify HTML report at coverage/index.html
- [x] T024 [US3] Run backend coverage and verify HTML report at backend/coverage/lcov-report/index.html
- [x] T025 [US3] Verify coverage meets 80% threshold for example modules

**Checkpoint**: Coverage reporting is fully functional with enforced thresholds

---

## Phase 6: User Story 4 - CI Pipeline Runs Tests Automatically (Priority: P2)

**Goal**: Tests run automatically in CI with proper exit codes on failure

**Independent Test**: Manually break a test, run `npm test`, verify non-zero exit code

### Implementation for User Story 4

- [x] T026 [US4] Verify frontend tests exit with code 1 on test failure
- [x] T027 [US4] Verify backend tests exit with code 1 on test failure
- [x] T028 [US4] Verify frontend coverage failure exits with code 1 when below threshold
- [x] T029 [US4] Verify backend coverage failure exits with code 1 when below threshold
- [x] T030 [US4] Document CI test commands in specs/004-fullstack-unit-testing/quickstart.md

**Checkpoint**: CI integration is ready - tests fail builds appropriately

---

## Phase 7: User Story 5 - Developer Runs Tests in Watch Mode (Priority: P3)

**Goal**: Tests re-run automatically when files change during development

**Independent Test**: Start `npm run test:watch`, modify a file, verify tests re-run within 5 seconds

### Implementation for User Story 5

- [x] T031 [P] [US5] Verify frontend watch mode works with `npm run test:watch`
- [x] T032 [P] [US5] Verify backend watch mode works with `cd backend && npm run test:watch`
- [x] T033 [US5] Verify file changes trigger test re-runs within 5 seconds

**Checkpoint**: Watch mode is fully functional for rapid development feedback

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Documentation and final validation

- [x] T034 [P] Update CLAUDE.md with test commands and conventions
- [x] T035 [P] Ensure all example tests have descriptive comments for template guidance
- [x] T036 Run full test suite and verify no flaky tests (run 3 times)
- [x] T037 Validate quickstart.md instructions work for new developers
- [x] T038 Final verification: all acceptance criteria from spec.md are met

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 priority and can run in parallel
  - US3 and US4 are both P2 priority and can run in parallel
  - US5 is P3 priority, can start after foundational
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Frontend tests - independent, no cross-story dependencies
- **User Story 2 (P1)**: Backend tests - independent, no cross-story dependencies
- **User Story 3 (P2)**: Coverage - requires US1 and US2 tests to exist for meaningful coverage
- **User Story 4 (P2)**: CI integration - requires tests from US1 and US2 to verify exit codes
- **User Story 5 (P3)**: Watch mode - requires test configuration from US1 and US2

### Within Each User Story

- Example tests can be created in parallel (different files)
- Verification tasks depend on test creation completing

### Parallel Opportunities

**Phase 1 (all parallel)**:
```bash
# Can run simultaneously:
npm install -D vitest @vitest/coverage-v8 ...  # T001
cd backend && npm install -D jest-mock-extended  # T002
```

**Phase 2 (T006-T008 parallel after setup)**:
```bash
# Can run simultaneously:
# T006: src/lib/test-utils.tsx
# T007: backend/src/test-utils/prisma.mock.ts
# T008: backend/src/test-utils/module.factory.ts
```

**Phase 3 US1 (T011-T013 parallel)**:
```bash
# Can run simultaneously:
# T011: src/components/ui/button.test.tsx
# T012: src/features/auth/LoginForm.test.tsx
# T013: src/features/visitors/WalkInForm.test.tsx
```

**Phase 4 US2 (T016-T018 parallel)**:
```bash
# Can run simultaneously:
# T016: backend/src/auth/auth.service.spec.ts
# T017: backend/src/visits/visits.service.spec.ts
# T018: backend/src/hosts/hosts.controller.spec.ts
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (install dependencies)
2. Complete Phase 2: Foundational (create test utilities)
3. Complete Phase 3: User Story 1 (frontend tests)
4. Complete Phase 4: User Story 2 (backend tests)
5. **STOP and VALIDATE**: Both `npm test` and `cd backend && npm test` pass
6. Developers can now write tests!

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. Add US1 (frontend) + US2 (backend) → **MVP: Testing works!**
3. Add US3 (coverage) → Coverage reports available
4. Add US4 (CI) → CI integration ready
5. Add US5 (watch) → Developer experience complete
6. Polish → Documentation and validation

### Parallel Team Strategy

With multiple developers:
1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (frontend tests)
   - Developer B: User Story 2 (backend tests)
3. After US1 + US2:
   - Developer A: User Story 3 (coverage)
   - Developer B: User Story 4 (CI integration)
4. Either developer: User Story 5 (watch mode)

---

## Task Summary

| Phase | Story | Task Count | Parallel Tasks |
|-------|-------|------------|----------------|
| 1: Setup | - | 5 | 2 |
| 2: Foundational | - | 5 | 3 |
| 3: US1 Frontend | US1 | 5 | 3 |
| 4: US2 Backend | US2 | 5 | 3 |
| 5: US3 Coverage | US3 | 5 | 2 |
| 6: US4 CI | US4 | 5 | 0 |
| 7: US5 Watch | US5 | 3 | 2 |
| 8: Polish | - | 5 | 2 |
| **Total** | | **38** | **17** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- US1 and US2 are both P1 and can be done in parallel by different developers
