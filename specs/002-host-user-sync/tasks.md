# Tasks: Host-User Auto-Sync

**Input**: Design documents from `/specs/002-host-user-sync/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, quickstart.md

**Tests**: Not explicitly requested - tests are manual per quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`
- **AdminJS Components**: `backend/src/admin/components/`

---

## Phase 1: Setup

**Purpose**: No setup required - extending existing codebase

This feature extends existing functionality. No new project initialization, dependencies, or schema changes needed.

- [ ] T001 Verify existing schema supports User.hostId and HOST role in `backend/prisma/schema.prisma`

**Checkpoint**: Schema verified - proceed to implementation

---

## Phase 2: Foundational

**Purpose**: No foundational blocking tasks required

All required infrastructure (Prisma, bcrypt, AdminJS) already exists. User stories can proceed directly.

**Checkpoint**: Foundation ready - user story implementation can begin

---

## Phase 3: User Story 1 + 2 - Bulk Add Hosts with Auto User Creation + Duplicate Prevention (Priority: P1) 🎯 MVP

**Goal**: When admin bulk-imports hosts via CSV, automatically create linked User accounts with role=HOST for each new Host. Skip duplicates.

**Independent Test**: Upload CSV with 5 new hosts → verify 5 Host records AND 5 User records (role=HOST) created. Re-upload same CSV → verify 0 new records created.

> **Note**: US1 (auto-create users) and US2 (prevent duplicates) are implemented together as they modify the same code path in `importHosts`.

### Implementation for User Story 1 + 2

- [ ] T002 [US1] Add crypto import for random password generation in `backend/src/admin/admin.controller.ts`
- [ ] T003 [US1] Add usersCreated and usersSkipped counter variables in `importHosts` method in `backend/src/admin/admin.controller.ts`
- [ ] T004 [US1] [US2] Implement User creation logic after Host insert with duplicate checks in `backend/src/admin/admin.controller.ts`:
  - Generate email (use host.email or `host_{id}@system.local`)
  - Check if User with email already exists (skip if yes)
  - Check if User with hostId already exists (skip if yes)
  - Generate random 32-char password with `crypto.randomBytes(16).toString('hex')`
  - Hash password with bcrypt (12 rounds)
  - Create User with role=HOST and hostId
  - Increment usersCreated or usersSkipped counters
- [ ] T005 [US1] Update return object to include usersCreated and usersSkipped in `backend/src/admin/admin.controller.ts`
- [ ] T006 [P] [US1] Update BulkImportHosts component to display usersCreated and usersSkipped in results in `backend/src/admin/components/BulkImportHosts.tsx`

**Checkpoint**: Bulk import now creates Host + User pairs automatically. Duplicates are skipped.

---

## Phase 4: User Story 3 - Filter Users List by Role (Priority: P2)

**Goal**: Admin can filter Users list by role. Default shows only ADMIN and RECEPTION roles. Dropdown allows selecting HOST to see all users.

**Independent Test**: Open Users list → verify only ADMIN/RECEPTION shown by default. Select HOST in filter → verify HOST users appear.

### Implementation for User Story 3

- [ ] T007 [US3] Add filterProperties array with role to Users resource configuration in `backend/src/main.ts`
- [ ] T008 [US3] Add role property configuration with availableValues and filter visibility in `backend/src/main.ts`
- [ ] T009 [US3] Add list.before hook to set default filter `['ADMIN', 'RECEPTION']` when no role filter specified in `backend/src/main.ts`:
  - Check if `request.query?.['filters.role']` is not set
  - If not set, add `'filters.role': ['ADMIN', 'RECEPTION']` to request.query
  - This excludes HOST users by default; admin can clear filter to see all

**Checkpoint**: Users list shows role filter dropdown. Default excludes HOST users.

---

## Phase 5: Polish & Validation

**Purpose**: Final verification and documentation

- [ ] T010 Run manual test per quickstart.md: bulk import → verify users created
- [ ] T011 Run manual test per quickstart.md: re-import → verify no duplicates
- [ ] T012 Run manual test per quickstart.md: Users filter → verify default excludes HOST
- [ ] T013 Verify import response includes usersCreated and usersSkipped fields

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - verification only
- **Foundational (Phase 2)**: No tasks - existing infrastructure
- **User Story 1+2 (Phase 3)**: Can start immediately after Phase 1
- **User Story 3 (Phase 4)**: Can start in parallel with Phase 3 (different file)
- **Polish (Phase 5)**: Depends on Phases 3 and 4 completion

### User Story Dependencies

- **User Story 1+2 (P1)**: No dependencies - modifies `admin.controller.ts` and `BulkImportHosts.tsx`
- **User Story 3 (P2)**: No dependencies - modifies only `main.ts`
- **US1+2 and US3 are independent** - can be implemented in parallel

### Within Each User Story

- US1+2: T002 → T003 → T004 → T005 (sequential in same file), T006 can run in parallel
- US3: T007 → T008 → T009 (sequential in same file section)

### Parallel Opportunities

After Phase 1 verification:
- **T006** (BulkImportHosts.tsx) can run in parallel with T002-T005 (admin.controller.ts)
- **US3 (T007-T009)** can run entirely in parallel with US1+2 (different files)

---

## Parallel Example: Full Parallel Execution

```bash
# After Phase 1 verification, launch in parallel:

# Stream 1: User Story 1+2 - Backend logic
Task: "Add crypto import in backend/src/admin/admin.controller.ts"
Task: "Add counter variables in importHosts"
Task: "Implement User creation logic with duplicate checks"
Task: "Update return object"

# Stream 2: User Story 1 - Frontend component (parallel with Stream 1)
Task: "Update BulkImportHosts.tsx to display user counts"

# Stream 3: User Story 3 - AdminJS config (parallel with Streams 1 & 2)
Task: "Add filterProperties to Users resource in main.ts"
Task: "Add role property configuration"
Task: "Add list.before hook for default filter"
```

---

## Implementation Strategy

### MVP First (User Story 1+2)

1. Complete T001 (verify schema)
2. Complete T002-T005 (backend import logic)
3. Complete T006 (UI results display)
4. **STOP and VALIDATE**: Test bulk import creates users
5. Deploy/demo as MVP

### Incremental Delivery

1. T001 → Schema verified
2. T002-T006 → US1+2 complete → Manual test → **MVP Ready!**
3. T007-T009 → US3 complete → Manual test → **Full Feature Ready!**
4. T010-T013 → All validation complete

### Single Developer Strategy

1. Complete Phase 1 (T001)
2. Complete Phase 3 in order: T002 → T003 → T004 → T005 → T006
3. Complete Phase 4 in order: T007 → T008 → T009
4. Complete Phase 5 validation

---

## Notes

- No schema changes required - existing User.hostId and HOST role support the feature
- US1 and US2 are combined as they share the same code path
- US3 is fully independent and can be implemented in parallel
- Tests are manual per quickstart.md (no automated test tasks)
- Total: 13 tasks across 3 user stories
- Commit after each task or logical group (T002-T005, T007-T009)
