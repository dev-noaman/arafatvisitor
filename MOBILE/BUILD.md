# Mobile App Build Instructions

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **Expo CLI** via npx (no global install needed)
- **Expo Go** app on a physical device (iOS or Android) for development testing
- For native builds: Android Studio (Android) or Xcode 15+ (iOS/macOS only)

## Setup

```bash
cd mobile
npm install
```

## Development

Start the Metro bundler:

```bash
npx expo start
```

This launches the Expo dev server. Scan the QR code with:
- **Android**: Expo Go app
- **iOS**: Camera app (opens Expo Go automatically)

Platform-specific shortcuts:

```bash
npx expo start --android    # Open in Android emulator/device
npx expo start --ios        # Open in iOS simulator (macOS only)
```

## Environment Configuration

The app reads `API_URL` from environment variables at build time, configured in `app.config.ts`:

| Variable | Default | Description |
|----------|---------|-------------|
| `API_URL` | `http://localhost:3000` | Backend API base URL |
| `VERSION` | `1.0.0` | App version string |

Set environment variables before starting:

```bash
# Linux/macOS
API_URL=https://arafatvisitor.cloud npx expo start

# Windows (PowerShell)
$env:API_URL="https://arafatvisitor.cloud"; npx expo start
```

The value is accessed at runtime via `expo-constants`:
```ts
import Constants from 'expo-constants';
const API_URL = Constants.expoConfig?.extra?.API_URL;
```

## Building APK (Android)

### Local Build (requires Android SDK)

```bash
npx expo run:android
```

### EAS Build (cloud)

Install EAS CLI and authenticate:

```bash
npx eas-cli login
eas build --platform android --profile preview   # APK
eas build --platform android --profile production # AAB (Play Store)
```

### Android Identifiers

- **Package**: `com.arafat.visitor`
- **Adaptive icon background**: `#465fff`

## Building IPA (iOS)

### Local Build (requires Xcode on macOS)

```bash
npx expo run:ios
```

### EAS Build (cloud)

```bash
eas build --platform ios --profile production
```

### iOS Identifiers

- **Bundle ID**: `com.arafat.visitor`
- Requires Apple Developer Program membership for distribution builds

## App Configuration

Key settings in `app.config.ts`:

| Setting | Value |
|---------|-------|
| Name | Arafat Visitor |
| Slug | arafat-visitor |
| Orientation | Portrait only |
| New Architecture | Enabled |
| Dark mode | Automatic (system preference) |

### Expo Plugins

- **expo-camera** -- QR code scanning (camera permission prompt)
- **expo-secure-store** -- Encrypted JWT token storage (Face ID permission on iOS)
- **expo-notifications** -- Push notification support

## Testing

Currently manual testing via Expo Go on physical devices. No automated test runner is configured yet.

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| expo | ~54.0 | Framework and build tooling |
| react-native | 0.81.5 | UI runtime |
| react | 19.1.0 | Component model |
| @tanstack/react-query | ^5.90 | Server state and caching |
| zustand | ^5.0 | Client state management |
| @react-navigation/native | ^7.1 | Navigation framework |
| axios | ^1.13 | HTTP client |
| expo-camera | ^17.0 | QR code scanning |
| expo-secure-store | ^15.0 | Encrypted token storage |
| zod | ^4.3 | Schema validation |
| nativewind | 4.1.x | Tailwind CSS for React Native |
