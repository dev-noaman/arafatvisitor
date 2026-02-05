# Tasks: TailAdmin Migration

**Input**: Design documents from `/specs/006-tailadmin-migration/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests are NOT explicitly requested in the specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Admin app**: `admin/src/` (new React application)
- **Backend**: `backend/src/` (existing NestJS, minimal changes)
- **Template reference**: `tailadmin-react-pro-222/` (read-only reference)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and TailAdmin component setup

- [ ] T001 Create admin project with Vite + React + TypeScript in admin/
- [ ] T002 [P] Configure Vite with base path `/admin/` in admin/vite.config.ts
- [ ] T003 [P] Configure TypeScript with path aliases in admin/tsconfig.json
- [ ] T004 [P] Configure TailwindCSS 4 with PostCSS in admin/postcss.config.js
- [ ] T005 [P] Install dependencies (react-router, sonner, apexcharts, react-dropzone, flatpickr) in admin/package.json
- [ ] T006 [P] Copy TailwindCSS theme from tailadmin-react-pro-222/src/index.css to admin/src/index.css
- [ ] T007 [P] Copy UI primitives (Button, Input, Badge, Card, Modal) from tailadmin-react-pro-222/src/components/ui/ to admin/src/components/ui/
- [ ] T008 [P] Copy icon components from tailadmin-react-pro-222/src/icons/ to admin/src/icons/
- [ ] T009 Create utility functions (cn, formatDate) in admin/src/utils/index.ts

**Checkpoint**: Project structure ready for foundational components

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T010 Create TypeScript types for all entities in admin/src/types/index.ts
- [ ] T011 [P] Create API client wrapper with auth token injection in admin/src/services/api.ts
- [ ] T012 [P] Create AuthContext with login/logout/user state in admin/src/context/AuthContext.tsx
- [ ] T013 [P] Create ThemeContext with light/dark mode persistence in admin/src/context/ThemeContext.tsx
- [ ] T014 [P] Create SidebarContext for navigation state in admin/src/context/SidebarContext.tsx
- [ ] T015 Create useAuth hook in admin/src/hooks/useAuth.ts
- [ ] T016 [P] Create useApi hook for data fetching in admin/src/hooks/useApi.ts
- [ ] T017 [P] Create useToast hook wrapping Sonner in admin/src/hooks/useToast.ts
- [ ] T018 Create ProtectedRoute component for auth guards in admin/src/components/common/ProtectedRoute.tsx
- [ ] T019 [P] Create RoleGuard component for role-based access in admin/src/components/common/RoleGuard.tsx
- [ ] T020 Create main App component with React Router setup in admin/src/App.tsx
- [ ] T021 Create React entry point in admin/src/main.tsx
- [ ] T022 Create index.html with proper base path in admin/index.html

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Admin Login (Priority: P1) 🎯 MVP

**Goal**: Users can log in with existing credentials and see a basic dashboard shell

**Independent Test**: Navigate to /admin/login, enter credentials, verify redirect to dashboard

### Implementation for User Story 1

- [ ] T023 [P] [US1] Copy and adapt SignIn form component from tailadmin-react-pro-222/src/components/auth/ to admin/src/components/auth/SignInForm.tsx
- [ ] T024 [P] [US1] Create login API service method in admin/src/services/auth.ts
- [ ] T025 [US1] Create SignIn page with form integration in admin/src/pages/auth/SignIn.tsx
- [ ] T026 [US1] Add login route to App.tsx for /admin/login
- [ ] T027 [US1] Implement login handler in AuthContext with localStorage token storage in admin/src/context/AuthContext.tsx
- [ ] T028 [US1] Add logout functionality to AuthContext
- [ ] T029 [US1] Create minimal Dashboard placeholder page in admin/src/pages/Dashboard.tsx
- [ ] T030 [US1] Add protected dashboard route to App.tsx for /admin
- [ ] T031 [US1] Implement redirect to login on 401 response in admin/src/services/api.ts

**Checkpoint**: User Story 1 complete - login flow works end-to-end

---

## Phase 4: User Story 2 - Dashboard Overview (Priority: P1)

**Goal**: Authenticated users see KPIs, pending approvals, and deliveries on dashboard

**Independent Test**: Log in and verify KPI cards, pending approvals list, and deliveries list display

### Implementation for User Story 2

- [ ] T032 [P] [US2] Create KPI Card component in admin/src/components/dashboard/KpiCard.tsx
- [ ] T033 [P] [US2] Create Pending Approvals List component in admin/src/components/dashboard/PendingApprovalsList.tsx
- [ ] T034 [P] [US2] Create Received Deliveries List component in admin/src/components/dashboard/ReceivedDeliveriesList.tsx
- [ ] T035 [P] [US2] Create Current Visitors List component in admin/src/components/dashboard/CurrentVisitorsList.tsx
- [ ] T036 [P] [US2] Create dashboard API service methods in admin/src/services/dashboard.ts
- [ ] T037 [US2] Implement full Dashboard page with all widgets in admin/src/pages/Dashboard.tsx
- [ ] T038 [US2] Add quick approve/reject actions to PendingApprovalsList
- [ ] T039 [US2] Add checkout action to CurrentVisitorsList
- [ ] T040 [US2] Add role-based data filtering (hosts see only their data)

**Checkpoint**: User Story 2 complete - dashboard fully functional

---

## Phase 5: User Story 3 - Password Reset (Priority: P2)

**Goal**: Users can request and complete password reset via email

**Independent Test**: Click forgot password, enter email, receive link, reset password, login works

### Implementation for User Story 3

- [ ] T041 [P] [US3] Create ForgotPassword form component in admin/src/components/auth/ForgotPasswordForm.tsx
- [ ] T042 [P] [US3] Create ResetPassword form component in admin/src/components/auth/ResetPasswordForm.tsx
- [ ] T043 [P] [US3] Create password reset API service methods in admin/src/services/auth.ts
- [ ] T044 [US3] Create ForgotPassword page in admin/src/pages/auth/ForgotPassword.tsx
- [ ] T045 [US3] Create ResetPassword page with token handling in admin/src/pages/auth/ResetPassword.tsx
- [ ] T046 [US3] Add forgot-password and reset-password routes to App.tsx
- [ ] T047 [US3] Add "Forgot Password?" link to SignIn page

**Checkpoint**: User Story 3 complete - password reset flow works end-to-end

---

## Phase 6: User Story 4 - Sidebar Navigation (Priority: P2)

**Goal**: Responsive sidebar with role-based menu items

**Independent Test**: Log in as different roles, verify correct menu items appear, navigation works

### Implementation for User Story 4

- [ ] T048 [P] [US4] Copy and adapt AppLayout from tailadmin-react-pro-222/src/layout/ to admin/src/layout/AppLayout.tsx
- [ ] T049 [P] [US4] Copy and adapt AppSidebar from tailadmin-react-pro-222/src/layout/ to admin/src/layout/AppSidebar.tsx
- [ ] T050 [P] [US4] Copy and adapt AppHeader from tailadmin-react-pro-222/src/layout/ to admin/src/layout/AppHeader.tsx
- [ ] T051 [US4] Define navigation items with role visibility in admin/src/config/navigation.ts
- [ ] T052 [US4] Implement role-based menu filtering in AppSidebar
- [ ] T053 [US4] Add mobile hamburger menu toggle functionality
- [ ] T054 [US4] Add active item highlighting based on current route
- [ ] T055 [US4] Add user dropdown menu with profile and logout in AppHeader
- [ ] T056 [US4] Integrate AppLayout as parent route wrapper in App.tsx

**Checkpoint**: User Story 4 complete - navigation works for all roles

---

## Phase 7: User Story 5 - Hosts Management (Priority: P3)

**Goal**: CRUD operations for host records with bulk import

**Independent Test**: View hosts table, create/edit/delete host, bulk import from file

### Implementation for User Story 5

- [ ] T057 [P] [US5] Create DataTable component with sorting/filtering/pagination in admin/src/components/tables/DataTable.tsx
- [ ] T058 [P] [US5] Create HostForm component in admin/src/components/forms/HostForm.tsx
- [ ] T059 [P] [US5] Create BulkImportModal component in admin/src/components/modals/BulkImportModal.tsx
- [ ] T060 [P] [US5] Create ConfirmDialog component in admin/src/components/modals/ConfirmDialog.tsx
- [ ] T061 [P] [US5] Create hosts API service methods in admin/src/services/hosts.ts
- [ ] T062 [US5] Create Hosts page with DataTable in admin/src/pages/Hosts.tsx
- [ ] T063 [US5] Implement create host modal and handler
- [ ] T064 [US5] Implement edit host modal and handler
- [ ] T065 [US5] Implement delete host with confirmation
- [ ] T066 [US5] Implement bulk import with file upload and validation preview
- [ ] T067 [US5] Add hosts route to App.tsx for /admin/hosts

**Checkpoint**: User Story 5 complete - hosts CRUD fully functional

---

## Phase 8: User Story 6 - Visitors Management (Priority: P3)

**Goal**: View and manage visitors with checkout and Send QR actions

**Independent Test**: View visitors table, perform checkout, send QR via email/WhatsApp

### Implementation for User Story 6

- [ ] T068 [P] [US6] Create SendQrModal component in admin/src/components/modals/SendQrModal.tsx
- [ ] T069 [P] [US6] Create visitors API service methods in admin/src/services/visitors.ts
- [ ] T070 [US6] Create Visitors page with DataTable in admin/src/pages/Visitors.tsx
- [ ] T071 [US6] Implement checkout action with confirmation
- [ ] T072 [US6] Implement Send QR modal with email/WhatsApp options
- [ ] T073 [US6] Add role-based data filtering (hosts see only their visitors)
- [ ] T074 [US6] Add visitors route to App.tsx for /admin/visitors

**Checkpoint**: User Story 6 complete - visitors management works

---

## Phase 9: User Story 7 - Pre-Registration Management (Priority: P3)

**Goal**: View and approve/reject pre-registered visits

**Independent Test**: View pre-registrations, approve visit, reject visit, verify role restrictions

### Implementation for User Story 7

- [ ] T075 [P] [US7] Create pre-register API service methods in admin/src/services/preregister.ts
- [ ] T076 [US7] Create PreRegister page with DataTable in admin/src/pages/PreRegister.tsx
- [ ] T077 [US7] Implement approve action with confirmation
- [ ] T078 [US7] Implement reject action with confirmation
- [ ] T079 [US7] Hide approve/reject buttons for RECEPTION role
- [ ] T080 [US7] Add pre-register route to App.tsx for /admin/pre-register

**Checkpoint**: User Story 7 complete - pre-registration approval works

---

## Phase 10: User Story 8 - Deliveries Management (Priority: P3)

**Goal**: View and manage deliveries with pickup action

**Independent Test**: View deliveries table, mark as picked up, verify role restrictions

### Implementation for User Story 8

- [ ] T081 [P] [US8] Create deliveries API service methods in admin/src/services/deliveries.ts
- [ ] T082 [US8] Create Deliveries page with DataTable in admin/src/pages/Deliveries.tsx
- [ ] T083 [US8] Implement mark picked up action with confirmation
- [ ] T084 [US8] Hide pickup button for RECEPTION role
- [ ] T085 [US8] Add deliveries route to App.tsx for /admin/deliveries

**Checkpoint**: User Story 8 complete - deliveries management works

---

## Phase 11: User Story 9 - Reports Page (Priority: P4)

**Goal**: View charts and statistics for visitors and deliveries

**Independent Test**: View reports page, verify charts display correct data

### Implementation for User Story 9

- [ ] T086 [P] [US9] Create LineChart component wrapper in admin/src/components/charts/LineChart.tsx
- [ ] T087 [P] [US9] Create PieChart component wrapper in admin/src/components/charts/PieChart.tsx
- [ ] T088 [P] [US9] Create reports API service methods in admin/src/services/reports.ts
- [ ] T089 [US9] Create Reports page with chart widgets in admin/src/pages/Reports.tsx
- [ ] T090 [US9] Implement date range filter for reports
- [ ] T091 [US9] Implement export to CSV/Excel functionality
- [ ] T092 [US9] Add role-based data filtering (hosts see only their data)
- [ ] T093 [US9] Add reports route to App.tsx for /admin/reports

**Checkpoint**: User Story 9 complete - reports page works

---

## Phase 12: User Story 10 - Settings Page (Priority: P4)

**Goal**: Admin can configure SMTP and WhatsApp settings

**Independent Test**: View settings, update SMTP config, test email, test WhatsApp

### Implementation for User Story 10

- [ ] T094 [P] [US10] Create settings API service methods in admin/src/services/settings.ts
- [ ] T095 [P] [US10] Create SmtpSettingsForm component in admin/src/components/forms/SmtpSettingsForm.tsx
- [ ] T096 [P] [US10] Create WhatsAppSettingsForm component in admin/src/components/forms/WhatsAppSettingsForm.tsx
- [ ] T097 [US10] Create Settings page with tabbed forms in admin/src/pages/Settings.tsx
- [ ] T098 [US10] Implement test email button with result feedback
- [ ] T099 [US10] Implement test WhatsApp button with result feedback
- [ ] T100 [US10] Add settings route with admin-only guard to App.tsx for /admin/settings

**Checkpoint**: User Story 10 complete - settings page works

---

## Phase 13: User Story 11 - User Management (Priority: P4)

**Goal**: Admin can manage user accounts

**Independent Test**: View users table, create user, edit user, delete user

### Implementation for User Story 11

- [ ] T101 [P] [US11] Create UserForm component in admin/src/components/forms/UserForm.tsx
- [ ] T102 [P] [US11] Create users API service methods in admin/src/services/users.ts
- [ ] T103 [US11] Create Users page with DataTable in admin/src/pages/Users.tsx
- [ ] T104 [US11] Implement create user modal and handler
- [ ] T105 [US11] Implement edit user modal and handler
- [ ] T106 [US11] Implement delete user with confirmation
- [ ] T107 [US11] Add users route with admin-only guard to App.tsx for /admin/users

**Checkpoint**: User Story 11 complete - user management works

---

## Phase 14: Profile & Theme

**Purpose**: User profile page and theme toggle

- [ ] T108 [P] Create ChangePasswordForm component in admin/src/components/forms/ChangePasswordForm.tsx
- [ ] T109 Create Profile page with password change in admin/src/pages/Profile.tsx
- [ ] T110 Add profile route to App.tsx for /admin/profile
- [ ] T111 Add theme toggle button to AppHeader
- [ ] T112 Implement theme persistence in localStorage

**Checkpoint**: Profile and theme features complete

---

## Phase 15: Backend Integration & Deployment

**Purpose**: Configure backend to serve admin static files

- [ ] T113 Update backend/src/main.ts to serve static files from public/admin/
- [ ] T114 Add SPA fallback route for /admin/* in backend/src/main.ts
- [ ] T115 Create build script to copy admin build to backend/public/admin/
- [ ] T116 Update backend package.json with admin build step
- [ ] T117 Test production build serves correctly at /admin

**Checkpoint**: Backend serves admin panel correctly

---

## Phase 16: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and AdminJS removal

- [X] T118 [P] Add loading states to all pages
- [X] T119 [P] Add error states with retry for API failures
- [X] T120 [P] Add empty states for tables with no data
- [X] T121 Implement session expiry redirect with message
- [X] T122 Add responsive breakpoint testing for mobile/tablet/desktop
- [X] T123 Run quickstart.md validation checklist
- [X] T124 Remove AdminJS dependencies from backend/package.json
- [X] T125 Remove backend/src/admin/admin.config.ts
- [X] T126 Remove backend/src/admin/components/*.tsx
- [X] T127 Remove backend/public/admin-custom.css and admin-scripts.js
- [X] T128 Update AdminJS setup removal in backend/src/main.ts
- [X] T129 Final integration test - all features working without AdminJS

**Checkpoint**: Migration complete - AdminJS fully removed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-13)**: All depend on Foundational phase completion
  - US1 (Login) and US2 (Dashboard) are both P1 - complete first
  - US3-4 (Password Reset, Navigation) are P2 - complete after P1
  - US5-8 (CRUD pages) are P3 - complete after P2
  - US9-11 (Reports, Settings, Users) are P4 - complete last
- **Profile & Theme (Phase 14)**: Depends on Navigation (US4)
- **Backend Integration (Phase 15)**: Depends on all pages complete
- **Polish (Phase 16)**: Depends on all features complete

### User Story Dependencies

| Story | Priority | Dependencies | Can Start After |
|-------|----------|--------------|-----------------|
| US1 Login | P1 | Foundational | Phase 2 |
| US2 Dashboard | P1 | Foundational | Phase 2 |
| US3 Password Reset | P2 | US1 (login page exists) | US1 |
| US4 Navigation | P2 | Foundational | Phase 2 |
| US5 Hosts | P3 | US4 (layout) | US4 |
| US6 Visitors | P3 | US4, DataTable from US5 | US5 |
| US7 Pre-Register | P3 | US4, DataTable from US5 | US5 |
| US8 Deliveries | P3 | US4, DataTable from US5 | US5 |
| US9 Reports | P4 | US4 (layout) | US4 |
| US10 Settings | P4 | US4 (layout) | US4 |
| US11 Users | P4 | US4, DataTable from US5 | US5 |

### Parallel Opportunities

**Within Phase 1 (Setup):**
```
T002, T003, T004, T005, T006, T007, T008 can all run in parallel
```

**Within Phase 2 (Foundational):**
```
T011, T012, T013, T014 can run in parallel (all context files)
T016, T017, T019 can run in parallel (all hooks/components)
```

**Within Each User Story Phase:**
- All model/component creation tasks marked [P] can run in parallel
- API service methods can run in parallel with component creation
- Page implementation must wait for components

---

## Parallel Example: User Story 2 (Dashboard)

```bash
# Launch all dashboard components in parallel:
Task: "Create KPI Card component in admin/src/components/dashboard/KpiCard.tsx"
Task: "Create Pending Approvals List in admin/src/components/dashboard/PendingApprovalsList.tsx"
Task: "Create Received Deliveries List in admin/src/components/dashboard/ReceivedDeliveriesList.tsx"
Task: "Create Current Visitors List in admin/src/components/dashboard/CurrentVisitorsList.tsx"
Task: "Create dashboard API service in admin/src/services/dashboard.ts"

# Then implement page (depends on above):
Task: "Implement full Dashboard page with all widgets in admin/src/pages/Dashboard.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Login)
4. Complete Phase 4: User Story 2 (Dashboard)
5. **STOP and VALIDATE**: Login and dashboard work
6. Can demo/test basic functionality

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 (Login) + US2 (Dashboard) → Demo (MVP!)
3. Add US3 (Password Reset) + US4 (Navigation) → Demo
4. Add US5-US8 (CRUD pages) → Demo
5. Add US9-US11 (Reports, Settings, Users) → Demo
6. Backend Integration + Polish → Final release
7. Remove AdminJS → Migration complete

### Sequential Path (Solo Developer)

1. Phase 1: Setup (T001-T009)
2. Phase 2: Foundational (T010-T022)
3. Phase 3: US1 Login (T023-T031)
4. Phase 4: US2 Dashboard (T032-T040)
5. Phase 5: US3 Password Reset (T041-T047)
6. Phase 6: US4 Navigation (T048-T056)
7. Phase 7-10: US5-US8 CRUD pages (T057-T085)
8. Phase 11-13: US9-US11 (T086-T107)
9. Phase 14: Profile & Theme (T108-T112)
10. Phase 15: Backend Integration (T113-T117)
11. Phase 16: Polish & AdminJS Removal (T118-T129)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Total tasks: 129
- Tests not included (not requested in spec)
