# Tasks: Visitor & Delivery Management Kiosk UI - Structural Reorganization

**Input**: Design documents from `/specs/001-visitor-kiosk-ui/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not requested. Test tasks excluded.

**Organization**: Tasks are grouped by user story to enable independent validation. This task list covers **structural reorganization only** - moving files from `UI/` to repo root with feature-based folder organization. No new logic or behavior is introduced.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Current Structure → Target Structure

```text
CURRENT:                                    TARGET:
UI/                                         (repo root)
├── index.html                              ├── index.html
├── package.json                            ├── package.json
├── package-lock.json                       ├── package-lock.json
├── .gitignore                              ├── .gitignore (merged)
├── eslint.config.js                        ├── eslint.config.js
├── postcss.config.js                       ├── postcss.config.js
├── vite.config.ts                          ├── vite.config.ts
├── tsconfig.json                           ├── tsconfig.json
├── tsconfig.app.json                       ├── tsconfig.app.json
├── tsconfig.node.json                      ├── tsconfig.node.json
├── public/vite.svg                         ├── public/vite.svg
└── src/                                    └── src/
    ├── main.tsx                                ├── main.tsx
    ├── App.tsx                                 ├── App.tsx
    ├── App.css                                 ├── App.css
    ├── index.css                               ├── index.css
    ├── assets/react.svg                        ├── assets/react.svg
    ├── components/                             ├── features/
    │   ├── LoginForm.tsx                       │   ├── auth/
    │   ├── WalkInForm.tsx                      │   │   └── LoginForm.tsx
    │   ├── QRScanner.tsx                       │   ├── visitors/
    │   ├── DeliveriesPanel.tsx                 │   │   ├── WalkInForm.tsx
    │   └── ui/                                 │   │   └── QRScanner.tsx
    │       ├── button.tsx                      │   └── deliveries/
    │       ├── card.tsx                        │       └── DeliveriesPanel.tsx
    │       ├── input.tsx                       ├── components/
    │       ├── label.tsx                       │   └── ui/
    │       └── tabs.tsx                        │       ├── button.tsx
    └── lib/                                    │       ├── card.tsx
        ├── api.ts                              │       ├── input.tsx
        ├── notifications.ts                    │       ├── label.tsx
        └── utils.ts                            │       └── tabs.tsx
                                                └── lib/
                                                    ├── api.ts
                                                    ├── notifications.ts
                                                    └── utils.ts
```

## Path Conventions

- **Source root**: `src/` at repo root (moved from `UI/src/`)
- **Feature components**: `src/features/<feature-name>/` (one folder per domain)
- **Reusable UI primitives**: `src/components/ui/` (Shadcn-style shared components)
- **Library/utilities**: `src/lib/` (API client, notifications, utils)
- **Path alias**: `@/` → `./src/` (unchanged, already configured in tsconfig and vite)

---

## Phase 1: Setup (Scaffold Target Directories)

**Purpose**: Create the target directory structure at repo root before moving files

- [x] T001 Create target directory structure at repo root: `src/features/auth/`, `src/features/visitors/`, `src/features/deliveries/`, `src/components/ui/`, `src/lib/`, `src/assets/`, `public/`
- [x] T002 [P] Copy build config files from `UI/` to repo root: `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `eslint.config.js`, `postcss.config.js`, `index.html`

---

## Phase 2: Foundational (Move Shared Infrastructure)

**Purpose**: Move reusable primitives, libraries, and core app files that ALL features depend on

**CRITICAL**: These must be moved first since feature components import from these paths

- [x] T003 Move `UI/src/lib/utils.ts` to `src/lib/utils.ts` (no import path changes needed - `@/lib/utils` stays the same)
- [x] T004 [P] Move `UI/src/lib/api.ts` to `src/lib/api.ts` (no import path changes needed - `@/lib/api` stays the same)
- [x] T005 [P] Move `UI/src/lib/notifications.ts` to `src/lib/notifications.ts` (no import path changes needed - `@/lib/notifications` stays the same)
- [x] T006 Move all UI primitives from `UI/src/components/ui/` to `src/components/ui/`: `button.tsx`, `card.tsx`, `input.tsx`, `label.tsx`, `tabs.tsx` (no import path changes needed - `@/lib/utils` import inside each file stays the same)
- [x] T007 Move `UI/src/main.tsx` to `src/main.tsx` (no changes needed)
- [x] T008 [P] Move `UI/src/App.tsx` to `src/App.tsx` - update imports from `@/components/LoginForm` to `@/features/auth/LoginForm`, from `@/components/QRScanner` to `@/features/visitors/QRScanner`, from `@/components/WalkInForm` to `@/features/visitors/WalkInForm`, from `@/components/DeliveriesPanel` to `@/features/deliveries/DeliveriesPanel`. Keep `@/components/ui/button` import unchanged.
- [x] T009 [P] Move `UI/src/App.css` to `src/App.css` (no changes needed)
- [x] T010 [P] Move `UI/src/index.css` to `src/index.css` (no changes needed)
- [x] T011 [P] Move `UI/src/assets/react.svg` to `src/assets/react.svg` (no changes needed)
- [x] T012 [P] Move `UI/public/vite.svg` to `public/vite.svg` (no changes needed)
- [x] T013 Merge `UI/.gitignore` rules into the repo root `.gitignore` file, adding `node_modules/`, `dist/`, and any UI-specific ignores not already present

**Checkpoint**: All shared infrastructure is in place. The `@/` alias resolves to `./src/` which contains `lib/`, `components/ui/`, and core app files.

---

## Phase 3: User Story 1 - Walk-in Visitor Check-in (Priority: P1) MVP

**Goal**: Move `WalkInForm.tsx` to its feature directory and update its imports.

**Independent Test**: Run `npm run build` - `WalkInForm` renders with correct imports from `@/components/ui/*` and `@/lib/*`.

### Implementation for User Story 1

- [x] T014 [US1] Move `UI/src/components/WalkInForm.tsx` to `src/features/visitors/WalkInForm.tsx` - update imports from `@/components/ui/button` to `@/components/ui/button`, from `@/components/ui/input` to `@/components/ui/input`, from `@/components/ui/label` to `@/components/ui/label`, from `@/components/ui/card` to `@/components/ui/card` (these stay the same), from `@/lib/notifications` to `@/lib/notifications` (same), from `@/lib/api` to `@/lib/api` (same). No import path changes needed since `@/` alias points to `src/`.

**Checkpoint**: Walk-in form is in `src/features/visitors/` and all imports resolve correctly.

---

## Phase 4: User Story 2 - QR-Based Visitor Check-out (Priority: P2)

**Goal**: Move `QRScanner.tsx` to the visitors feature directory.

**Independent Test**: Run `npm run build` - `QRScanner` renders with correct imports.

### Implementation for User Story 2

- [x] T015 [US2] Move `UI/src/components/QRScanner.tsx` to `src/features/visitors/QRScanner.tsx` - no import path changes needed since all imports use `@/components/ui/*` which resolves to `src/components/ui/` (unchanged path).

**Checkpoint**: QR scanner is in `src/features/visitors/` alongside `WalkInForm.tsx`.

---

## Phase 5: User Story 3 - Delivery Logging and Tracking (Priority: P3)

**Goal**: Move `DeliveriesPanel.tsx` to its own feature directory.

**Independent Test**: Run `npm run build` - `DeliveriesPanel` renders with correct imports.

### Implementation for User Story 3

- [x] T016 [US3] Move `UI/src/components/DeliveriesPanel.tsx` to `src/features/deliveries/DeliveriesPanel.tsx` - no import path changes needed since all imports use `@/components/ui/*` which resolves to `src/components/ui/` (unchanged path).

**Checkpoint**: Deliveries panel is in `src/features/deliveries/`.

---

## Phase 6: User Story 4 - Employee Authentication (Priority: P4)

**Goal**: Move `LoginForm.tsx` to the auth feature directory.

**Independent Test**: Run `npm run build` - `LoginForm` renders with correct imports.

### Implementation for User Story 4

- [x] T017 [US4] Move `UI/src/components/LoginForm.tsx` to `src/features/auth/LoginForm.tsx` - no import path changes needed since all imports use `@/components/ui/*` and `@/lib/*` which resolve to unchanged paths under `src/`.

**Checkpoint**: Login form is in `src/features/auth/`.

---

## Phase 7: User Story 5 - Role-Based Dashboard Navigation (Priority: P5)

**Goal**: Verify `App.tsx` (already moved in T008) correctly imports all feature components from their new locations.

**Independent Test**: Run `npm run build` - App renders dashboard with all 3 action buttons, navigation works between views.

### Implementation for User Story 5

- [x] T018 [US5] Verify all imports in `src/App.tsx` resolve correctly: `@/features/auth/LoginForm`, `@/features/visitors/QRScanner`, `@/features/visitors/WalkInForm`, `@/features/deliveries/DeliveriesPanel`, `@/components/ui/button`. Fix any remaining broken references.

**Checkpoint**: All feature components load from their new `features/` paths. Dashboard navigation works.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Clean up old directory, validate build, update documentation

- [x] T019 Update the `index.html` at repo root: ensure the `<script>` tag points to `/src/main.tsx` (matching Vite convention for root-level projects)
- [x] T020 Update `vite.config.ts` at repo root: ensure the `@` path alias resolves to `path.resolve(__dirname, "./src")` (should already be correct since it's relative)
- [x] T021 Run `npm install` at repo root to verify `package.json` and `package-lock.json` are valid and dependencies resolve
- [x] T022 Run `npm run build` at repo root to verify TypeScript compilation and Vite build succeed with zero errors
- [x] T023 Run `npm run dev` at repo root to verify the dev server starts and the kiosk UI loads correctly in the browser
- [x] T024 Delete the `UI/` directory after confirming all files have been migrated and the build succeeds at repo root
- [x] T025 Update `specs/001-visitor-kiosk-ui/plan.md` Project Structure section to reflect the new repo-root layout with `src/features/`, `src/components/ui/`, and `src/lib/`
- [x] T026 Update `specs/001-visitor-kiosk-ui/quickstart.md` to remove `cd UI` steps - commands now run from repo root
- [x] T027 Update `CLAUDE.md` Project Structure section and Commands section to reflect the new layout (no `cd UI` prefix, feature-based paths)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (directories must exist before moving files)
- **User Stories (Phase 3-7)**: All depend on Phase 2 (shared infrastructure must be in place)
  - US1-US4 can proceed in parallel (different source files)
  - US5 depends on US1-US4 (verifies all imports)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Walk-in)**: Move `WalkInForm.tsx` - independent, no dependency on other stories
- **US2 (QR Check-out)**: Move `QRScanner.tsx` - independent
- **US3 (Deliveries)**: Move `DeliveriesPanel.tsx` - independent
- **US4 (Auth)**: Move `LoginForm.tsx` - independent
- **US5 (Dashboard)**: Verify `App.tsx` imports - depends on US1-US4 files being in final locations

### Import Path Analysis

The `@/` alias maps to `./src/`. Since the internal structure under `src/` changes only for feature components (moved from `components/` to `features/<name>/`), the only file requiring import path updates is **`App.tsx`** (T008). All other files import from `@/components/ui/*` and `@/lib/*` which remain at the same relative paths.

### Parallel Opportunities

- T002, T004, T005, T009, T010, T011, T012 can all run in parallel (independent files)
- T014, T015, T016, T017 can all run in parallel (different feature files, no cross-dependencies)
- T025, T026, T027 can all run in parallel (different documentation files)

---

## Parallel Example: Feature Component Migration

```text
# These can all run in parallel (different source files):
T014: Move WalkInForm.tsx → src/features/visitors/WalkInForm.tsx
T015: Move QRScanner.tsx → src/features/visitors/QRScanner.tsx
T016: Move DeliveriesPanel.tsx → src/features/deliveries/DeliveriesPanel.tsx
T017: Move LoginForm.tsx → src/features/auth/LoginForm.tsx
```

---

## Parallel Example: Documentation Updates

```text
# These can all run in parallel (different doc files):
T025: Update plan.md project structure
T026: Update quickstart.md (remove cd UI)
T027: Update CLAUDE.md (new layout)
```

---

## Implementation Strategy

### MVP First (Phases 1-2 + App.tsx)

1. Complete Phase 1: Create directories (T001-T002)
2. Complete Phase 2: Move shared infra (T003-T013)
3. **STOP and VALIDATE**: `src/lib/` and `src/components/ui/` exist with all files
4. Move `App.tsx` with updated imports (T008)

### Incremental Delivery

1. Create directories + move shared infra → Foundation ready
2. Move each feature component one at a time → Build after each
3. Verify `App.tsx` imports → Full app works
4. Delete `UI/` → Clean structure
5. Update docs → Ready for team

### Single Developer Strategy

Recommended sequential order for safest migration:

1. T001 → T002 (scaffold)
2. T003-T013 (all shared infrastructure)
3. T008 (App.tsx with new import paths - this is the critical change)
4. T014-T017 (move all feature components - parallel)
5. T018 (verify imports)
6. T019-T023 (validate build chain)
7. T024 (delete UI/)
8. T025-T027 (update docs)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- This is a **structural migration only** - no new logic, no behavior changes
- The `@/` path alias (`./src/`) means most imports stay unchanged
- The only file with import path changes is `App.tsx` (features moved from `components/` to `features/<name>/`)
- All UI primitive imports (`@/components/ui/*`) and lib imports (`@/lib/*`) remain unchanged
- Commit after each phase to enable safe rollback
- Run `npm run build` after each phase to catch broken imports early
