# Mobile App Architecture

## Project Structure

```
mobile/
  App.tsx                          # Root component (QueryClient, SafeAreaProvider, StatusBar)
  app.config.ts                    # Expo config (API_URL, plugins, identifiers)
  index.ts                         # Entry point
  src/
    components/
      auth/
        LoginForm.tsx              # Email/password login form
      common/
        DateTimePicker.tsx          # Cross-platform date/time picker
        EmptyState.tsx              # Empty list placeholder
        ErrorBoundary.tsx           # React error boundary wrapper
        FormInput.tsx               # Styled text input with validation
        LoadingButton.tsx           # Button with spinner (primary/secondary/danger/success)
        OfflineBanner.tsx           # Network status banner
        SkeletonLoader.tsx          # Content placeholder shimmer
        Toast.tsx                   # Animated toast notifications + ToastManager singleton
      visitor/
        StatusBadge.tsx             # Color-coded visit status label
        VisitorCard.tsx             # Visitor list item card
    hooks/
      useAuth.ts                   # Login/logout orchestration
      useLogin.ts                  # Login mutation hook
      useCheckIn.ts                # QR check-in mutation
      useCheckOut.ts               # QR check-out mutation
      useVisitors.ts               # Visitor list query with pagination
      useDashboard.ts              # KPI, pending, current visitors queries + actions
      usePreRegistrations.ts       # Pre-reg list, create, approve/reject/re-approve
      useHosts.ts                  # Host list query with search
      useDeliveries.ts             # Delivery list query + mark picked up
      useLookups.ts                # Purposes, delivery types, couriers, locations
      useChangePassword.ts         # Password change mutation
      useNetworkStatus.ts          # Online/offline detection via @react-native-community/netinfo
    navigation/
      RootNavigator.tsx            # Auth guard: Login stack vs Main tabs
      TabNavigator.tsx             # 5-tab bottom navigation with nested stacks
      types.ts                     # Navigation param type definitions
    screens/
      auth/
        LoginScreen.tsx            # Login page
        ForgotPasswordScreen.tsx   # Password reset request page
      main/
        DashboardScreen.tsx        # KPIs, pending approvals, current visitors
        VisitorsListScreen.tsx     # Paginated visitor list with status filter
        VisitorDetailScreen.tsx    # Single visitor detail view
        PreRegisterScreen.tsx      # Pre-registration list
        PreRegDetailScreen.tsx     # Pre-reg detail with approve/reject actions
        ProfileScreen.tsx          # User profile view
        NotificationsScreen.tsx    # Notification list
      modals/
        QRScannerScreen.tsx        # Camera QR scanner + manual ID entry fallback
        QRGeneratorModal.tsx       # QR code display modal
        ChangePasswordScreen.tsx   # Password change form
    services/
      api.ts                       # Axios instance with interceptors
      endpoints/
        auth.ts                    # login, logout, refreshToken, forgotPassword, resetPassword
        visitors.ts                # getVisitors, getVisitBySessionId, checkIn, checkOut
        dashboard.ts               # getKpis, getPendingApprovals, getCurrentVisitors, approve/reject
        preregistrations.ts        # CRUD + approve/reject/re-approve
        deliveries.ts              # CRUD + markPickedUp
        hosts.ts                   # getHosts with type/search filters
        lookups.ts                 # purposes, deliveryTypes, couriers, locations
        profile.ts                 # changePassword
    store/
      authStore.ts                 # Zustand auth state (tokens, user, login/logout)
      uiStore.ts                   # Zustand UI state (dark mode, filters)
    theme/
      colors.ts                    # Light/dark palettes, status colors, brand scale
      spacing.ts                   # Spacing scale, border radius, icon sizes, touch targets
      typography.ts                # Font sizes, weights, line heights, letter spacing
      index.ts                     # Re-exports all theme tokens
    types/
      api.ts                       # Request/response type definitions
      index.ts                     # Shared type exports (User, Visit, Host, etc.)
    utils/
      qrParser.ts                  # QR code payload parsing and validation
      validation.ts                # Form validation helpers (ValidationResult pattern)
```

## API Client

**File**: `src/services/api.ts`

Axios instance configured with:

- **Base URL**: Read from `expo-constants` (`API_URL` in `app.config.ts`), defaults to `http://localhost:3000`
- **Timeout**: 30 seconds
- **Request interceptor**: Attaches `Authorization: Bearer <token>` header from auth store
- **Response interceptor**: Two behaviors:
  - **Network errors** (no response): Retries up to 3 times with exponential backoff (1s, 3s, 5s delays)
  - **401 Unauthorized**: Returns error to be handled by auth store (triggers token refresh or logout)
- **Error extraction**: Maps HTTP status codes to user-friendly messages (400, 401, 403, 404, 409, 422, 429, 500, 502/503/504)

Endpoint modules in `src/services/endpoints/` call `apiClient.get/post/put/delete` and return typed response data. Each module maps to a backend resource (auth, visitors, dashboard, deliveries, hosts, lookups, profile, pre-registrations).

## State Management

### Zustand v5 Stores

Two stores handle all client-side state:

**authStore** (`src/store/authStore.ts`):
- Stores `user`, `accessToken`, `refreshToken`, `isAuthenticated`, `isLoading`, `error`
- Persists tokens and user to `expo-secure-store` (encrypted, hardware-backed on iOS)
- `setAuth()` saves to SecureStore and sets `Authorization` header on the Axios instance
- `clearAuth()` removes from SecureStore and deletes the header
- `loadAuth()` called on app start to restore session from storage

**uiStore** (`src/store/uiStore.ts`):
- Stores `colorScheme` (light/dark), `isDarkMode`, `visitorFilter`, `isGlobalLoading`
- Persists preferences to `@react-native-async-storage/async-storage`
- `loadPreferences()` called on app start to restore theme and filter settings

### Why Two Storage Backends

- **SecureStore** for sensitive data (JWT tokens, user credentials) -- encrypted, not backed up
- **AsyncStorage** for non-sensitive preferences (theme, filters) -- simple key-value, persists across reinstalls

## Navigation

**Library**: React Navigation 7

### Structure

```
RootNavigator (native stack, headerless)
  |-- !isAuthenticated:
  |     Login
  |     ForgotPassword
  |
  |-- isAuthenticated:
        TabNavigator (bottom tabs, 5 tabs)
          |-- DashboardTab (stack)
          |     DashboardHome
          |     VisitorDetail
          |
          |-- VisitorsTab (stack)
          |     VisitorsList
          |     VisitorDetail
          |
          |-- PreRegisterTab (stack)
          |     PreRegisterList
          |     PreRegDetail
          |
          |-- QRScanTab (no stack, direct screen)
          |     QRScannerScreen
          |
          |-- ProfileTab (stack)
                ProfileHome
                ChangePassword
```

The `RootNavigator` acts as an auth guard: it conditionally renders the auth screens or the main tab navigator based on `isAuthenticated` from the auth store. Navigation type definitions live in `src/navigation/types.ts`.

## Data Fetching

**Library**: TanStack React Query v5

Configured in `App.tsx` with global defaults:
- **Queries**: 2 retries, 30s stale time, no refetch on window focus
- **Mutations**: 0 retries (fail immediately)

Each feature has custom hooks in `src/hooks/` that wrap `useQuery` and `useMutation`:
- `useVisitors()` -- paginated list with status filter
- `useDashboardKPIs()` -- dashboard statistics
- `usePendingApprovals()` -- pending visit approvals
- `useCurrentVisitors()` -- active visitors on-site
- `usePreRegistrations()` -- pre-registration list
- `useDeliveries()` -- delivery list with status filter
- `useHosts()`, `useSearchHosts()` -- host lookups
- `usePurposes()`, `useDeliveryTypes()`, `useCouriers()`, `useLocations()` -- dropdown lookups

Mutation hooks handle cache invalidation after successful actions (approve, reject, check-in, mark picked up).

## QR Scanning

**Library**: `expo-camera` CameraView with barcode scanning

**Screen**: `src/screens/modals/QRScannerScreen.tsx`

Flow:
1. Request camera permission on mount
2. CameraView renders with `barcodeScannerSettings: { barcodeTypes: ['qr'] }`
3. On scan, `handleBarCodeScanned` parses the QR payload via `qrParser.ts`
4. Extracts `sessionId`, fetches visitor data, validates status is `APPROVED`
5. Calls `POST /visits/:sessionId/checkin`
6. Shows success/error overlay with haptic feedback (`expo-haptics`)
7. Auto-resets to scanner after 5s (success) or 3s (error)

**Manual fallback**: "Enter ID Manually" button opens a modal for typing a session ID directly, sharing the same `processSessionId()` logic.

Visual elements: animated scan line (Animated.loop), corner brackets on scan box, semi-transparent overlay.

## Theming

**Files**: `src/theme/colors.ts`, `spacing.ts`, `typography.ts`

Custom token-based theme system (not NativeWind classes for core layout):

### Colors (`colors.ts`)
- **Light and dark palettes**: `colors.light.*` and `colors.dark.*` with primary, secondary, success, warning, error, background, card, border, text (primary/secondary/muted/disabled), overlay
- **Status colors**: `colors.status.*` for visit states (pending, approved, checkedIn, checkedOut, rejected, received, pickedUp)
- **Brand scale**: `colors.brand[25..950]` -- 12-step blue scale matching admin dashboard
- **Semantic scales**: `colors.gray`, `colors.success`, `colors.warning`, `colors.error` (25 to 950)

### Spacing (`spacing.ts`)
- Named scale: `xs` (4px) through `6xl` (64px)
- `borderRadius`: `sm` (4) to `full` (9999)
- `iconSizes`: `xs` (12) to `3xl` (48)
- `touchTarget.min`: 44pt (accessibility minimum)
- `screenPadding`: 16px horizontal and vertical

### Typography (`typography.ts`)
- Font sizes: title scale (30-72), theme scale (12-20), body scale (12-16)
- Font weights: regular (400) to black (900)
- Line heights matching each size category
- Letter spacing: tight (-0.5) to wider (1)

Components read `isDarkMode` from the UI store to select the appropriate palette.

## Key Patterns

### ValidationResult Objects
Form validation uses a `ValidationResult` type (`src/utils/validation.ts`):
```ts
interface ValidationResult {
  isValid: boolean;
  error?: string;
}
```
Validators return this for each field. `validateForm()` runs all rules, `hasValidationErrors()` checks if any failed. Available validators: `validateEmail`, `validatePhone`, `validatePassword`, `validateRequired`, `validateMinLength`, `validateMaxLength`, `validateUUID`, `validateFutureDate`, `validateURL`.

### Toast Notifications
Singleton `ToastManager` class (`src/components/common/Toast.tsx`):
```ts
import { toast } from '../components/common/Toast';
toast.show('Visitor checked in!', 'success');
toast.show('Network error', 'error');
```
Types: `success`, `error`, `info`, `warning`. Animated slide-in from top, auto-dismisses after 3 seconds.

### LoadingButton
Reusable submit button with loading state (`src/components/common/LoadingButton.tsx`):
- Variants: `primary` (brand blue), `secondary` (gray), `danger` (red), `success` (green)
- Shows `ActivityIndicator` spinner when `isLoading` is true
- Auto-disables during loading or when `disabled` prop is set
- Respects dark mode for disabled state colors

### Offline Banner
`OfflineBanner` component uses `useNetworkStatus()` hook (wraps `@react-native-community/netinfo`) to show a persistent banner when the device loses connectivity. Rendered at the top level in `App.tsx`.

### Error Boundary
`ErrorBoundary` class component wraps screen content to catch rendering errors and display a fallback UI instead of crashing the app.
