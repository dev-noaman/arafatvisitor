# 🚀 GitHub Actions - Flutter Build Automation

This guide explains the automated build workflows for the Arafat VMS Flutter mobile app.

---

## 📋 Overview

The repository includes a comprehensive GitHub Actions workflow that automatically builds:
- **APK** (Android Package) for Android devices
- **IPA** (iOS App Package) for iOS devices
- **AAB** (Android App Bundle) for Google Play Store distribution

**Workflow File**: `.github/workflows/flutter-build-release.yml`

---

## 🎯 Trigger Methods

### 1. **Manual Trigger (Recommended for Testing)**

Go to **Actions** → **Flutter Build APK & IPA** → **Run workflow**

Options:
- **Build APK**: Toggle to build Android APK
- **Build IPA**: Toggle to build iOS IPA

Both default to `true`, but you can disable either if needed.

### 2. **Automatic on Push**

Builds automatically when code is pushed to:
- `main` branch
- `008-flutter-mobile-app` branch

**Only if changes affect**:
- `MOBILE/**` directory
- `.github/workflows/flutter-build-release.yml` file

### 3. **Automatic on Tag**

When you create a release tag (e.g., `v1.0.0`), the workflow:
1. Builds APK, IPA, and AAB
2. Automatically uploads them to GitHub Releases
3. Creates release notes with download links

**Example**:
```bash
git tag v1.0.0
git push origin v1.0.0
```

---

## 📱 Build Jobs

### Job 1: Android APK Build
- **Runner**: `ubuntu-latest`
- **Time**: ~30 minutes
- **Output**: `app-release.apk`
- **Uses**: Flutter SDK + Java 11 + Gradle

**What it does**:
1. Checks out code
2. Installs Flutter and Java
3. Gets dependencies (`flutter pub get`)
4. Builds release APK (`flutter build apk --release`)
5. Verifies APK integrity
6. Uploads as artifact

### Job 2: iOS IPA Build
- **Runner**: `macos-latest`
- **Time**: ~40 minutes
- **Output**: `FlutterIpaExport.ipa`
- **Uses**: Flutter SDK + Xcode + CocoaPods

**What it does**:
1. Checks out code
2. Installs Flutter
3. Updates CocoaPods
4. Builds iOS release (`flutter build ios --release --no-codesign`)
5. Packages into IPA format
6. Verifies IPA integrity
7. Uploads as artifact

### Job 3: Android App Bundle (AAB)
- **Runner**: `ubuntu-latest`
- **Time**: ~30 minutes
- **Output**: `app-release.aab`
- **Uses**: Flutter SDK + Java 11 + Gradle

**What it does**:
1. Checks out code
2. Installs Flutter and Java
3. Gets dependencies
4. Builds app bundle (`flutter build appbundle --release`)
5. Uploads as artifact

### Job 4: Build Notification
- Runs after all builds complete
- Displays summary of all build results
- Shows artifact names and locations

---

## 📦 Artifacts

All build artifacts are stored in GitHub for 30 days and can be downloaded:

1. Go to **Actions** → Click the workflow run
2. Scroll down to **Artifacts** section
3. Download desired build(s)

**Artifacts naming**:
- `arafat-vms-apk-{build-number}` → Android APK
- `arafat-vms-ipa-{build-number}` → iOS IPA
- `arafat-vms-aab-{build-number}` → Android App Bundle

---

## 📥 Installation Instructions

### Android APK

**On Android Device**:
```bash
# Using adb
adb install app-release.apk

# Or manually
# Download APK → Transfer to device → Tap to install
```

**Requirements**:
- Android API 23+ (Android 6.0+)
- USB debugging enabled (for adb)

### iOS IPA

**This build is UNSIGNED** - requires code signing for device installation.

**Option 1: TestFlight (Recommended)**
1. Sign with Apple Distribution certificate
2. Upload via Xcode: `Product` → `Archive` → `Distribute App`
3. Select TestFlight distribution
4. Invite testers via App Store Connect

**Option 2: Direct Device Installation**
1. Open in Xcode: `File` → `Open` → Select `MOBILE/ios`
2. Select your team and provisioning profile
3. Connect iOS device
4. Build and run from Xcode

**Option 3: Apple Configurator 2**
1. Prepare signed IPA with Apple Developer certificate
2. Use Apple Configurator 2 to install on device

### Android App Bundle (AAB)

**For Google Play Store**:
1. Go to Google Play Console
2. Create new release
3. Upload `app-release.aab`
4. Fill in release notes, screenshots, etc.
5. Submit for review

**Size**:
- AAB is smaller than APK (dynamic feature delivery)
- Google Play generates optimized APKs for each device

---

## 🔐 Security & Code Signing

### Current Configuration

**APK & AAB**: Built unsigned (debug keystore)
- **Not suitable for production distribution**
- Good for testing

**IPA**: Built unsigned (no code signature)
- **Requires manual signing for App Store/TestFlight**

### Setting Up Code Signing (Optional)

To enable automatic code signing, add these GitHub Secrets:

#### For Android (Google Play signing)

1. Create/export keystore file:
```bash
# Create keystore
keytool -genkey -v -keystore arafat-vms.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias arafat-vms
```

2. Add to GitHub Secrets (`.github/settings/secrets/actions`):
```
ANDROID_KEYSTORE_BASE64=<base64-encoded-jks>
ANDROID_KEYSTORE_PASSWORD=<password>
ANDROID_KEY_ALIAS=arafat-vms
ANDROID_KEY_PASSWORD=<password>
```

3. Modify workflow to use signing keys (see commented section)

#### For iOS (Apple Developer signing)

1. Export signing certificate and provisioning profile
2. Add to GitHub Secrets:
```
IOS_SIGNING_CERT_BASE64=<base64-encoded-p12>
IOS_SIGNING_CERT_PASSWORD=<password>
IOS_PROVISIONING_PROFILE_BASE64=<base64-encoded>
KEYCHAIN_PASSWORD=<password>
```

3. The workflow includes a `build-app-store` job that uses these secrets

---

## 🐛 Troubleshooting

### Build Fails on Ubuntu (APK/AAB)

**Issue**: "Java not found"
```
Fix: Workflow includes Setup Java step, usually works fine
```

**Issue**: "Gradle timeout"
```
Fix: Increase timeout-minutes in workflow (default: 45)
```

**Issue**: "Permission denied for gradle"
```
chmod +x android/gradlew
```

### Build Fails on macOS (IPA)

**Issue**: "Pod install fails"
```
Run manually:
cd MOBILE/ios
rm -rf Pods Podfile.lock
pod install
```

**Issue**: "Xcode command not found"
```
xcode-select --install
xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

**Issue**: "CocoaPods timeout"
```
Increase timeout-minutes in workflow
or add to workflow: pod repo update --silent
```

### Artifact Not Generated

1. Check **Actions** → **Logs** for error messages
2. Common causes:
   - Build failed (check logs)
   - Wrong file path
   - Missing dependencies

---

## 📊 Monitoring Builds

### View Build Status

1. Go to **Actions** tab
2. Click **Flutter Build APK & IPA**
3. See list of all workflow runs

### Status Indicators

- 🟢 **Success**: All jobs passed
- 🔴 **Failed**: One or more jobs failed
- ⏳ **In Progress**: Currently building
- ⏭️ **Skipped**: Build not triggered (no file changes)

### View Logs

1. Click specific workflow run
2. Click specific job
3. Expand steps to see details
4. Search logs for errors

---

## 🔄 Integration with CI/CD

### Pull Requests

When you open a PR to `main`:
1. Workflow **automatically triggers**
2. Builds APK and IPA
3. Results shown in PR checks
4. Must pass before merging (optional, configure branch protection)

### Main Branch

Every push to `main` triggers automatic builds (if files changed).

### Release Tags

When you tag a release:
```bash
git tag v1.0.0
git push origin v1.0.0
```

The workflow:
1. Builds all platforms
2. Creates GitHub Release
3. Uploads artifacts automatically
4. Includes release notes

---

## 📝 Workflow Customization

### Change Build Target Android Version

Edit `.github/workflows/flutter-build-release.yml`:
```yaml
- run: flutter build apk --release --target-platform android-arm64
```

### Change Build Output Filename

Create a script in `MOBILE/` to rename outputs:
```bash
mv build/app/outputs/flutter-apk/app-release.apk arafat-vms-v1.0.0.apk
```

### Add Custom Release Notes

Edit the GitHub Release section in workflow:
```yaml
body: |
  # Release Notes
  - Feature 1
  - Feature 2
```

### Skip Certain Platforms

Disable in workflow dispatch:
- Toggle `build_apk` to false → Skip APK/AAB
- Toggle `build_ipa` to false → Skip IPA

Or modify workflow conditions:
```yaml
if: github.event_name != 'workflow_dispatch' || inputs.build_apk
```

---

## 🚀 Best Practices

1. **Test Locally First**
   ```bash
   cd MOBILE
   flutter build apk --release
   flutter build ios --release --no-codesign
   ```

2. **Use Descriptive Tags**
   ```bash
   git tag v1.0.0-beta.1
   git tag v1.0.0-rc.1
   git tag v1.0.0
   ```

3. **Monitor Build Times**
   - macOS builds take longest (~40 min)
   - Ubuntu APK builds ~30 min
   - Plan accordingly for release day

4. **Store Releases Safely**
   - Download production builds from GitHub Releases
   - Don't rely on 30-day artifact expiration
   - Archive important versions

5. **Version Control**
   - Update `pubspec.yaml` version before tagging
   - Keep version in sync across platforms

---

## 📚 References

- [Flutter Build Documentation](https://flutter.dev/docs/deployment)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Android App Bundle Guide](https://developer.android.com/guide/app-bundle)
- [iOS Code Signing Guide](https://developer.apple.com/support/code-signing/)

---

## ❓ FAQ

**Q: Can I build both APK and IPA simultaneously?**
A: Yes! The workflow runs both jobs in parallel. Total time = slower of the two (usually IPA at ~40 min)

**Q: Are these builds production-ready?**
A: APK/AAB are production-ready for testing. IPA requires code signing for App Store submission.

**Q: How long do builds take?**
A:
- APK: ~30 minutes
- IPA: ~40 minutes
- Both in parallel: ~40 minutes total

**Q: Where do I download the builds?**
A: Actions tab → Click workflow run → Scroll to Artifacts → Download

**Q: Can I use these for App Store/Play Store submission?**
A:
- **Android**: Yes, use AAB for Play Store
- **iOS**: No, requires code signing first

**Q: How do I sign builds for production?**
A: See "Setting Up Code Signing" section above, or sign manually in Xcode/Android Studio

---

**Last Updated**: 2026-02-13
**Maintained By**: Development Team
