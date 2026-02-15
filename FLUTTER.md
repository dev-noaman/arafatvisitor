# Flutter Mobile App Development Guidelines

Last updated: 2026-02-13 (Feature-complete - 71/77 tasks)

## Active Technologies

### 📱 Mobile App (Flutter - 008-flutter-mobile-app branch)
- **Language**: Dart 3.10.8+
- **Framework**: Flutter SDK (latest stable)
- **State Management**: flutter_riverpod 3.1.0 (AsyncNotifier pattern)
- **HTTP**: dio 5.4.0 + dio_smart_retry (auth interceptor with 401 refresh)
- **Navigation**: go_router 17.1.0 (bottom-tab shell with auth redirect)
- **QR Scanning**: mobile_scanner 7.1.4 + qr_flutter 4.1.0
- **Forms**: flutter_form_builder 10.3.0 + form_builder_validators 11.3.0
- **Models**: freezed 3.2.3 + json_serializable 6.7.1 (type-safe codegen)
- **Storage**: flutter_secure_storage 10.0.0 (JWT on Keychain/Keystore)
- **Utilities**: intl 0.20.2 (date formatting), shimmer 3.0.0 (loading states)
- **Testing**: flutter_test + mocktail 1.0.2
- **Status**: ✅ Feature-complete (71/77 tasks) - Ready for Phase 13 Polish

## Project Structure

```text
flutter/                       # Flutter Mobile App (Dart 3.10.8+)
├── lib/
│   ├── main.dart              # App entry with ProviderScope
│   ├── app/
│   │   ├── app.dart           # MaterialApp.router with theme
│   │   ├── router.dart        # GoRouter: bottom-tab shell + auth redirect
│   │   └── theme.dart         # Material 3 theme (Arafat blue palette)
│   ├── core/
│   │   ├── api/
│   │   │   ├── api_client.dart         # Dio + AuthInterceptor
│   │   │   ├── api_endpoints.dart      # Endpoint path constants
│   │   │   └── auth_interceptor.dart   # Bearer token + 401 refresh
│   │   ├── models/            # 7 freezed models (user, host, visit, delivery, lookup, dashboard, paginated_response)
│   │   ├── storage/
│   │   │   └── secure_storage.dart # Keychain/Keystore JWT persistence
│   │   ├── providers/         # Riverpod providers (dio, storage, lookups, etc.)
│   │   └── utils/             # Date formatting, role utilities
│   ├── features/              # 8 feature modules
│   │   ├── auth/              # Login, forgot password, auth flow
│   │   ├── dashboard/         # KPIs, pending approvals, current visitors
│   │   ├── visitors/          # CRUD with pagination, search, form validation
│   │   ├── pre_register/      # Approve/reject/re-approve workflow
│   │   ├── deliveries/        # Mark picked up action, CRUD
│   │   ├── qr_scan/           # Check-in/checkout with countdown badges
│   │   ├── hosts/             # Directory with search (ADMIN only)
│   │   ├── profile/           # User profile, change password
│   │   └── more/              # Menu navigation with role-based items
│   └── shared/
│       └── widgets/           # Reusable: LoadingIndicator, ErrorWidget, EmptyState, PaginatedListView, ConfirmDialog
├── pubspec.yaml               # Dependencies (riverpod 3.1.0, dio 5.4.0, go_router 17.1.0, etc.)
├── analysis_options.yaml       # Lint rules
├── build.yaml                 # Build runner config
└── BUILD_INSTRUCTIONS.md       # Local build guide
```

## Commands

### Mobile App (Flutter) Commands
```bash
cd flutter
flutter pub get              # Get dependencies
flutter pub cache repair     # Fix dependency issues
flutter analyze              # Lint analysis
flutter test                 # Run unit tests
flutter run                  # Run on connected device
flutter build apk --release  # Build Android APK (release)
flutter build appbundle --release # Build Android App Bundle
flutter build ios --release --no-codesign # Build iOS IPA (unsigned)
dart run build_runner build --delete-conflicting-outputs # Generate models
```

**Note:** iOS builds require macOS. For Android, use `flutter build apk --debug` for faster dev builds.

## Local Building

**Android APK**:
```bash
cd flutter && flutter build apk --release
# Output: flutter/build/app/outputs/flutter-apk/app-release.apk
```

**iOS IPA**:
```bash
cd flutter
cd ios && pod install && cd ..
flutter build ios --release --no-codesign
cd build/ios/iphoneos
mkdir -p Payload && mv Runner.app Payload/
zip -r -9 FlutterIpaExport.ipa Payload
# Output: flutter/build/ios/iphoneos/FlutterIpaExport.ipa
```

**Android App Bundle**:
```bash
cd flutter && flutter build appbundle --release
# Output: flutter/build/app/outputs/bundle/release/app-release.aab
```

### Documentation

- **Build Instructions**: `flutter/BUILD_INSTRUCTIONS.md` (local builds, installation methods)

### Code Signing (Production)

Builds are unsigned. For production:
- **Android (Play Store)**: Create keystore, configure `key.properties`, run `flutter build appbundle`
- **iOS (App Store)**: Use Xcode with Apple Developer certificate and provisioning profile

### Installation Methods

**Android APK**:
```bash
adb install app-release.apk
# Or download → tap on device
```

**iOS IPA**:
- Requires Xcode for direct installation (unsigned)
- TestFlight for testing (requires code signing)
- App Store for production (requires code signing)

**Play Store (AAB)**:
- Upload to Google Play Console
- Automatic optimization for device configurations

### Common Build Issues

- **macOS pods**: Run `cd ios && pod install && pod repo update`
- **gradle timeout**: Increase timeout in `android/gradle.properties` or run locally with `--no-daemon`
- **Java not found**: Ensure Java 17+ is installed (`java -version`)
