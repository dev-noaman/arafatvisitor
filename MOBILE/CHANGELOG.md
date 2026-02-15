# Changelog

## v1.0.0 (2026-02-13)

### Features
- Login/Logout with JWT authentication (httpOnly cookies)
- Forgot Password flow with email reset
- Dashboard with KPIs, pending approvals, current visitors
- Visitors list with search and status filter (APPROVED, CHECKED_IN, CHECKED_OUT)
- Visitor detail with check-in/check-out actions
- QR code scanning for quick check-in/check-out (expo-camera)
- Manual session ID entry fallback for QR scanner
- Pre-registration list with create form
- Pre-registration detail with approve/reject/re-approve actions
- Dark mode support (system preference + manual toggle)
- Offline detection with banner and cached data display
- Role-based UI (ADMIN, RECEPTION, HOST, STAFF)
- Profile screen with password change

### Tech Stack
- Expo SDK 54, React Native 0.81
- React Navigation 7 (bottom tabs + stack navigators)
- TanStack React Query v5 (server state)
- Zustand v5 (client state)
- Axios (API client with interceptors)
- expo-camera (QR scanning)
- expo-secure-store (token storage)

### Known Limitations
- Push notifications not yet implemented (backend webhook support needed)
- No biometric authentication
- No offline queue for mutations (online-only for write operations)

### Future Work
- Push notification integration
- Biometric login (Face ID / Fingerprint)
- Offline mutation queue with sync
- Advanced analytics dashboard
- Multi-language support (Arabic/English)
