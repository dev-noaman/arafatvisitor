# Arafat Visitor — Mobile App Build

## Context
Read my entire codebase and `CLAUDE.md` thoroughly. This is a Visitor Management System with:
- A React/TypeScript admin dashboard (TailAdmin + Tailwind)
- A Tailwind-based kiosk interface
- Both connected to an existing backend API

**Your task:** Build a complete React Native mobile app for this system using **Expo + TypeScript**.

---

## FILE READING ORDER
Read files in this exact order **before doing anything else**:

1. `CLAUDE.md`
2. `tailwind.config.js` / `tailwind.config.ts`
3. `/src/services/` (all API service files, axios instances)
4. `/src/types/` (all TypeScript interfaces)
5. `/src/hooks/` (all custom hooks)
6. Key page components: Dashboard, Visitors List, Visitor Detail, Login, Kiosk screens
7. Shared UI components (buttons, badges, cards, modals, inputs)
8. `package.json`
9. `.env` or any config showing API base URL

---

## PHASE 1: ANALYSIS (show results then proceed to Phase 2 immediately)

Present both summaries below as **concise tables** (not prose) to conserve context. Then proceed to Phase 2 immediately without waiting for confirmation.

### 1) Design Extraction
- Read `tailwind.config` and scan all components/pages
- Extract every color:
  - primary, secondary, accent
  - backgrounds, card background
  - text colors (heading, body, muted)
  - borders, input styles, focus/hover states
  - **dark mode colors** (extract all `dark:` variant colors from Tailwind config and component usage)
- Extract status badge colors for every visitor status:
  - expected, checked-in, checked-out, overstay, cancelled, and any others found
- Extract success/warning/error/info colors
- Extract sidebar and header colors
- Extract font family, weight scale, size scale
- Extract button styles: primary, secondary, outline, danger — all sizes and states
- Extract card styles: border radius, shadows, padding patterns
- Extract spacing rhythm and layout patterns
- Extract any logo or brand asset paths
- Present all of this as a **structured Design System Summary (use tables)**

### 2) API Extraction
- Read all API service files, axios instances, hooks, types, route definitions
- Map every endpoint (use a table):
  - method, URL, request body/params, response shape, auth requirement
- Identify auth flow:
  - login, token storage, refresh mechanism, logout
- Identify pagination pattern:
  - page/limit, cursor, offset (use what exists)
- Identify error response format
- Identify any WebSocket or real-time subscription patterns
- Identify what the **QR code payload contains** (check kiosk scan screen code for the expected format — visitor ID, token, URL, etc.)
- Present all of this as a **structured API Map (use tables)**

**After presenting both summaries, proceed to Phase 2 immediately without waiting for confirmation.**

---

## PHASE 2: BUILD

Create a new `/mobile` directory at project root with a complete Expo + TypeScript app.

### Stack (pinned versions)
| Package | Version |
|---------|---------|
| Expo SDK | **52** |
| NativeWind | **4.1.x** (NOT v4.2+, NOT v5 preview) |
| React Navigation | **v6** |
| TanStack React Query | latest stable |
| Zustand | latest stable |
| expo-camera | SDK 52 compatible |
| expo-secure-store | SDK 52 compatible |
| expo-notifications | SDK 52 compatible |
| expo-haptics | SDK 52 compatible |
| react-native-reanimated | SDK 52 compatible |

- No external component library — build all components from scratch using NativeWind classes, matching the exact design system extracted from the dashboard.

---

## Build Order (follow this sequence)

### Step 1 — Foundation
- `/mobile/src/theme/` — design tokens mapped **exactly** from Phase 1 analysis, including both light and dark palettes
- `/mobile/src/types/` — all TypeScript interfaces matching existing API response shapes
- NativeWind v4 `tailwind.config.js` using **exact extracted colors** (both light and dark)

### Step 2 — Services & State
- `/mobile/src/services/api.ts`
  - axios instance with base URL
  - **Use `app.config.ts` with `expo-constants` to read API base URL from environment** (not hardcoded)
  - bearer token interceptor
  - 401 handling
  - refresh logic (only if it exists in backend; do not invent)
- All API endpoint functions matching the **API Map** from Phase 1
- `/mobile/src/store/authStore.ts`
  - Zustand store for auth state
  - `expo-secure-store` persistence

### Step 3 — Hooks
- `/mobile/src/hooks/` — implement:
  - `useVisitors`
  - `useCheckIn`
  - `useCheckOut`
  - `useDashboard`
  - `useNotifications` (only if a notifications endpoint exists — see fallback rules below)
  - `useHosts`
  - and any others needed (only if backed by existing endpoints)
- All hooks use TanStack React Query with:
  - proper cache keys
  - refetch patterns
  - mutation patterns

### Step 4 — Shared Components
Create `/mobile/src/components/` with complete components:
- `StatusBadge`
- `VisitorCard`
- `StatCard`
- `SearchBar`
- `FilterChips`
- `SkeletonLoader`
- `EmptyState`
- `OfflineBanner`
- `Toast`
- `LoadingButton`
- `FormInput`
- `AvatarPlaceholder`

Every component uses **exact design tokens** from Phase 1.

### Step 5 — Navigation
Create `/mobile/src/navigation/`:
- `RootNavigator` (auth guard)
- `TabNavigator` (bottom tabs)
- nested stack navigators per tab

Auth flow:
- If no token → Login screen
- If token → Tab navigator

---

## Step 6 — Screens (build one by one, verify imports after each)

1) **Login**
- Branded login with logo
- email + password inputs
- validation, error display
- loading state
- secure token storage on success
- auto-login check on mount

2) **Dashboard**
- stat cards: today's visitors, checked-in, expected, overstay
- recent activity list with timestamps
- quick action buttons (Scan QR, Pre-register)
- pull-to-refresh

3) **Visitors List**
- search bar
- filter tabs/chips by status
- color-coded status badges using exact extracted colors
- visitor cards with name/company/host/status/time
- pull-to-refresh
- infinite scroll pagination (use Phase 1 pattern)
- empty state when no results

4) **Visitor Detail**
- full visitor info: name, email, phone, company, photo
- host info
- visit purpose
- timestamps: expected, checked-in, checked-out
- visit history if available
- action buttons change by status:
  - Check In / Check Out / Already Completed
- call host and email host buttons

5) **Pre-Register Visitor**
- form fields:
  - visitor name, email, phone, company
  - searchable host dropdown
  - date-time picker for expected arrival
  - purpose selector
  - notes field
- validation on all required fields
- submit with loading state
- success/error feedback

6) **QR Scan**
- full-screen camera scanner using `expo-camera`
- scan overlay with guide frame
- **QR payload format:** determine from kiosk code in Phase 1 (visitor ID, token, URL, etc.) and parse accordingly
- on successful scan:
  - auto-lookup visitor
  - confirm dialog for check-in or check-out
- manual ID entry fallback button
- haptic feedback on successful scan (`expo-haptics`)
- flashlight toggle

7) **Notifications**
- **If a notifications endpoint exists in the API:**
  - notification list with read/unread visual distinction
  - notification icon with unread count badge in tab bar
  - tap notification navigates to relevant visitor detail
  - mark as read on tap
  - mark all as read button
  - pull-to-refresh
  - empty state
- **If NO notifications endpoint exists:**
  - show a placeholder screen with a message: "Notifications coming soon"
  - disable push registration
  - add a comment in code noting the missing endpoint
  - still include the tab with a disabled badge

8) **Profile / Settings**
- current user info: name, email, role
- dark mode toggle switching theme using extracted dark palette (from `dark:` variants)
- notification preferences toggle
- app version display
- logout button with confirmation

---

## Required Behaviors
- Auth guard: redirect to Login if no valid token, protect all screens
- Auto-login: check `expo-secure-store` for token on app launch, validate it, skip login if valid
- Token interceptor: attach Bearer token to every API request, on 401 clear token and redirect to Login
- Pull-to-refresh: Dashboard, Visitors List, Notifications
- Infinite scroll: Visitors List using the pagination pattern from Phase 1
- Skeleton loaders: show while data is fetching on every screen
- Toast/snackbar:
  - success feedback for check-in, check-out, pre-registration, settings changes
  - error feedback for all failed actions
- Offline banner: detect network status, show persistent banner at top when offline
- Dark mode: full dark mode support using `dark:` variants of extracted colors from Tailwind config
- Keyboard avoidance: Login and Pre-Register forms keep inputs visible above keyboard
- Haptic feedback: QR scan success and check-in/check-out confirmation (use `expo-haptics`)
- Error boundaries: graceful error screens instead of crashes

---

## RULES
- Do NOT ask me questions. Analyze what you find and make smart decisions.
- Do NOT use placeholder code. Every file must be complete and functional.
  - No `// TODO`, no "add logic here", no empty function bodies.
- Do NOT invent API endpoints. Use ONLY endpoints that exist in my codebase.
  - If a feature needs an endpoint that doesn't exist:
    - add a comment noting the missing endpoint (e.g., `// MISSING ENDPOINT: GET /api/notifications — feature disabled`)
    - implement a graceful fallback (placeholder screen, disabled UI) instead of fake data
- Do NOT use generic colors. Use ONLY the exact colors extracted from my Tailwind config and components.
  - Zero defaults, zero hardcoded hex values that aren't from my system.
- Use NativeWind v4 patterns:
  - `className` prop
  - v4 config setup
  - not v2 StyleSheet wrapping
- Match the visual identity of my existing dashboard and kiosk as closely as possible in mobile form.
- After building each screen, verify it imports correctly from services, hooks, components, and types.
  - No broken imports.
- Include complete `package.json` with all dependencies and their **pinned versions**.
- Include `app.config.ts` (not `app.json`) with:
  - Expo SDK 52 config
  - API base URL via `process.env.EXPO_PUBLIC_API_URL` or `expo-constants`
  - App name, slug, version, icon placeholders
- Do NOT generate tests unless explicitly asked. Focus entirely on production code.
