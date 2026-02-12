# 📱 Arafat VMS - Build Instructions

Quick reference for building the Flutter mobile app locally or via GitHub Actions.

---

## 🚀 Quick Start

### Local Build (Recommended for Development)

```bash
cd MOBILE

# Get dependencies
flutter pub get

# Build APK (Android)
flutter build apk --release

# Build IPA (iOS - macOS only)
flutter build ios --release --no-codesign

# Build App Bundle (Android Play Store)
flutter build appbundle --release
```

### GitHub Actions (CI/CD)

1. Go to **Actions** tab → **Flutter Build APK & IPA**
2. Click **Run workflow**
3. Toggle platforms (APK/IPA) as needed
4. Wait for build to complete
5. Download from **Artifacts** section

---

## 📋 Prerequisites

### Local Building

**All Platforms**:
- Flutter SDK 3.10.8+
- Dart 3.10.8+
- Git

**Android (APK/AAB)**:
- Java 11+ (JDK)
- Android SDK API 23+
- Gradle 8.0+

**iOS (IPA)**:
- macOS 12+ (Monterey or later)
- Xcode 13+
- CocoaPods

### GitHub Actions

No local setup needed! Everything runs on GitHub servers:
- Ubuntu runners for Android builds
- macOS runners for iOS builds

---

## 📦 Build Outputs

### Local Builds

```
MOBILE/build/
├── app/
│   ├── outputs/
│   │   ├── flutter-apk/
│   │   │   └── app-release.apk           (Android APK)
│   │   └── bundle/release/
│   │       └── app-release.aab           (Android App Bundle)
└── ios/
    └── iphoneos/
        ├── Runner.app/                   (iOS app bundle)
        └── FlutterIpaExport.ipa          (Packaged IPA)
```

### GitHub Actions Artifacts

Available in **Actions** → **[Workflow Run]** → **Artifacts** (30-day retention):
- `arafat-vms-apk-{number}` - Android APK
- `arafat-vms-ipa-{number}` - iOS IPA
- `arafat-vms-aab-{number}` - Android App Bundle

---

## 🔧 Detailed Build Instructions

### Android APK (Local)

```bash
cd MOBILE

# Clean previous builds
flutter clean

# Get dependencies
flutter pub get

# Build release APK
flutter build apk --release

# Output location
# MOBILE/build/app/outputs/flutter-apk/app-release.apk

# Verify APK
file build/app/outputs/flutter-apk/app-release.apk
du -h build/app/outputs/flutter-apk/app-release.apk
```

**Install on Device**:
```bash
# Enable USB debugging on Android device
adb devices                        # List connected devices
adb install build/app/outputs/flutter-apk/app-release.apk
```

### Android App Bundle (Local)

```bash
cd MOBILE

# Build App Bundle (for Google Play Store)
flutter build appbundle --release

# Output location
# MOBILE/build/app/outputs/bundle/release/app-release.aab

# Upload to Google Play Console for distribution
```

### iOS IPA (Local - macOS only)

```bash
cd MOBILE

# Update CocoaPods
cd ios
pod repo update
pod install
cd ..

# Build iOS release (unsigned)
flutter build ios --release --no-codesign

# Package into IPA
cd build/ios/iphoneos
mkdir -p Payload
mv Runner.app Payload/
zip -r -9 FlutterIpaExport.ipa Payload

# Output location
# MOBILE/build/ios/iphoneos/FlutterIpaExport.ipa
```

**Install on Device** (requires code signing):
1. Open Xcode: `File` → `Open` → Select `MOBILE/ios`
2. Select your Apple Developer team
3. Connect iOS device
4. Build & Run: `Product` → `Run` (or `Cmd+R`)

---

## 🐳 Build Variants

### Debug Build (Local Testing)

```bash
# Faster, larger, more debug info
flutter build apk --debug      # Android
flutter build ios --debug      # iOS
```

### Release Build (Production)

```bash
# Optimized, smaller, obfuscated
flutter build apk --release    # Android
flutter build ios --release    # iOS
```

### Profile Build (Performance Testing)

```bash
# Optimized but with profiling enabled
flutter build apk --profile    # Android
flutter build ios --profile    # iOS
```

---

## 🔍 Troubleshooting

### Common Issues

#### "Flutter command not found"
```bash
# Add Flutter to PATH
export PATH="$PATH:/path/to/flutter/bin"

# Or use full path
/path/to/flutter/bin/flutter build apk --release
```

#### "gradle: permission denied"
```bash
# Fix permissions
chmod +x android/gradlew
flutter build apk --release
```

#### "pod: command not found" (macOS)
```bash
# Install CocoaPods
sudo gem install cocoapods
cd MOBILE/ios
pod install
```

#### "xcrun: error: unable to find utility"
```bash
# Select Xcode
xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

#### "Insufficient space" during build
```bash
# Clean old builds
flutter clean
rm -rf build/
# Retry build
```

#### "Module not found" errors
```bash
cd MOBILE
flutter clean
flutter pub get
flutter pub cache repair
# Retry build
```

---

## 📊 Build Times

**Local Builds** (first build):
- APK: 10-15 minutes
- IPA: 15-20 minutes
- AAB: 10-15 minutes

**GitHub Actions** (first build):
- APK: ~30 minutes
- IPA: ~40 minutes
- Both parallel: ~40 minutes

*Subsequent builds are faster due to caching.*

---

## 📥 Installation Methods

### Android

**Method 1: ADB (Android Debug Bridge)**
```bash
adb install app-release.apk
```

**Method 2: Direct Installation**
1. Download APK to Android device
2. Open file manager
3. Tap APK file
4. Follow prompts

**Method 3: Play Store**
1. Upload `app-release.aab` to Google Play Console
2. Configure screenshots, description
3. Submit for review

### iOS

**Method 1: Xcode (Development)**
1. Open `MOBILE/ios/Runner.xcworkspace`
2. Select your team
3. Connect device
4. `Product` → `Run`

**Method 2: TestFlight (Testing)**
1. Sign with Apple Distribution cert
2. Upload to App Store Connect
3. Invite testers
4. Testers download from TestFlight app

**Method 3: App Store (Production)**
1. Code sign with Apple Distribution cert
2. Create App Store listing
3. Upload signed IPA or App Bundle
4. Submit for review

---

## ✅ Verification Checklist

Before distributing builds:

- [ ] APK/IPA installs without errors
- [ ] App starts and loads dashboard
- [ ] Login works with test account
- [ ] Basic features function (visitors, QR scan)
- [ ] No crashes or crashes logged
- [ ] Performance acceptable
- [ ] No sensitive data in logs

---

## 🔐 Code Signing (Production)

### Android (Play Store)

```bash
# Create or use existing keystore
keytool -genkey -v -keystore arafat-vms.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias arafat-vms

# Configure signing in android/app/build.gradle
# Then builds will be signed automatically
```

### iOS (App Store)

1. Register with Apple Developer
2. Create App ID
3. Create Distribution certificate
4. Create distribution provisioning profile
5. Configure in Xcode:
   - Select team
   - Select provisioning profile
   - Build and archive
   - Upload to App Store Connect

---

## 📝 Release Checklist

Before releasing to production:

- [ ] Version updated in `pubspec.yaml`
- [ ] Changelog updated
- [ ] All tests passing
- [ ] Code reviewed and merged to main
- [ ] Create git tag: `git tag v1.0.0`
- [ ] Push tag: `git push origin v1.0.0`
- [ ] Wait for GitHub Actions to complete
- [ ] Download artifacts from Releases
- [ ] Test builds on real devices
- [ ] Submit to app stores if ready

---

## 📚 Additional Resources

- [Flutter Build Documentation](https://flutter.dev/docs/deployment)
- [GitHub Actions Guide](.github/GITHUB_ACTIONS_GUIDE.md)
- [Google Play Console](https://play.google.com/console)
- [App Store Connect](https://appstoreconnect.apple.com)

---

**Last Updated**: 2026-02-13
**Flutter Version**: 3.10.8+
**Dart Version**: 3.10.8+
