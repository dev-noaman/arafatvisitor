# 🚀 Quick Reference - GitHub Actions & Mobile App Builds

**Quick links and commands for common tasks**

---

## 📱 Build Commands (Local)

```bash
# Android APK (testing)
cd MOBILE && flutter build apk --release

# Android App Bundle (Play Store)
cd MOBILE && flutter build appbundle --release

# iOS IPA (unsigned)
cd MOBILE
cd ios && pod install && cd ..
flutter build ios --release --no-codesign
cd build/ios/iphoneos
mkdir -p Payload && mv Runner.app Payload/
zip -r -9 FlutterIpaExport.ipa Payload
```

---

## 🐙 GitHub Actions Workflow

**File**: `.github/workflows/flutter-build-release.yml`

**Manual Trigger**:
1. Go to **Actions** tab
2. Click **Flutter Build APK & IPA**
3. Click **Run workflow**
4. Toggle platforms (both default true)
5. Wait ~40 minutes

**Auto Trigger**:
- Push to `main` or `008-flutter-mobile-app` → Auto-build
- Create tag `v1.0.0` → Auto-release

---

## 📦 Build Artifacts

**Download Location**: Actions → Workflow Run → **Artifacts**

**Naming**:
- `arafat-vms-apk-{number}` → Android APK
- `arafat-vms-aab-{number}` → Android App Bundle
- `arafat-vms-ipa-{number}` → iOS IPA

**Retention**: 30 days

---

## 📲 Installation

### Android
```bash
adb install app-release.apk
```
Or: Download to device → Tap → Install

### iOS
**Requires code signing** (see code-signing section below)

**Options**:
1. Xcode: Open project → Select team → Build & Run
2. TestFlight: Code sign → Upload to App Store Connect → Invite testers
3. App Store: Code sign → Upload → Submit for review

---

## 🏪 Play Store Submission

1. Download `app-release.aab`
2. Google Play Console → Create Release
3. Upload AAB
4. Add screenshots & description
5. Submit for review

---

## 🔐 Code Signing

### Android (Play Store)

**Create keystore**:
```bash
keytool -genkey -v -keystore arafat-vms.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias arafat-vms
```

**Add GitHub Secrets**:
- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

### iOS (App Store)

**Add GitHub Secrets**:
- `IOS_SIGNING_CERT_BASE64` (p12 file)
- `IOS_SIGNING_CERT_PASSWORD`
- `IOS_PROVISIONING_PROFILE_BASE64`
- `KEYCHAIN_PASSWORD`

---

## ⏱️ Build Times

| Platform | Time | Runner |
|----------|------|--------|
| APK | ~30 min | Ubuntu |
| IPA | ~40 min | macOS |
| AAB | ~30 min | Ubuntu |
| **All 3 (parallel)** | **~40 min** | Both |

---

## 📖 Full Documentation

- **Setup & Troubleshooting**: `.github/GITHUB_ACTIONS_GUIDE.md`
- **Build Instructions**: `MOBILE/BUILD_INSTRUCTIONS.md`
- **Implementation Status**: `IMPLEMENTATION_STATUS.md`
- **GitHub Actions Summary**: `GITHUB_ACTIONS_SUMMARY.md`
- **Project Notes**: `CLAUDE.md`

---

## 🎯 Common Tasks

### Test Manual Build
```
Actions → Flutter Build APK & IPA → Run workflow
→ Download artifacts → adb install (APK)
```

### Create Release
```
git tag v1.0.0
git push origin v1.0.0
→ Workflow auto-builds all platforms
→ Artifacts uploaded to GitHub Release
```

### Submit to Play Store
```
Download aab-{number} artifact
→ Google Play Console → Upload AAB
→ Add screenshots & description → Submit
```

### Submit to TestFlight
```
Download ipa-{number} artifact
→ Code sign with Apple cert
→ Xcode or Transporter → Upload
→ App Store Connect → Invite testers
```

### Debug Build Failure
```
Actions tab → Workflow run → Failed job
→ Click job → Expand step → Read logs
→ Check error message
→ See troubleshooting guide for fix
```

---

## 📞 Need Help?

**Quick Fixes**:
1. Check `.github/GITHUB_ACTIONS_GUIDE.md` Troubleshooting
2. Check `MOBILE/BUILD_INSTRUCTIONS.md` Troubleshooting
3. Review workflow logs in Actions tab

**Getting Started**:
1. Read `GITHUB_ACTIONS_SUMMARY.md` for overview
2. Try manual workflow trigger
3. Download APK and test installation

---

## 📋 Checklists

### Before Release
- [ ] Update `MOBILE/pubspec.yaml` version
- [ ] Update changelog
- [ ] All tests passing
- [ ] Code reviewed and merged to main
- [ ] Create git tag: `git tag v1.0.0`
- [ ] Push tag: `git push origin v1.0.0`

### After Automatic Build
- [ ] Check build succeeded in Actions
- [ ] Download artifacts
- [ ] Test APK on Android device
- [ ] Test IPA on iOS device
- [ ] Verify app starts and loads
- [ ] Test key features work

### Before Submission
- [ ] APK/IPA tested on real devices
- [ ] No crashes or errors
- [ ] Acceptable performance
- [ ] All credentials secure
- [ ] Release notes prepared

---

**Last Updated**: 2026-02-13
**Status**: ✅ Production Ready
