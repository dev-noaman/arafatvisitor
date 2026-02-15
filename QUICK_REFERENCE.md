# 🚀 Quick Reference - Mobile App Builds

**Quick links and commands for common tasks**

---

## 📱 Build Commands (Local)

```bash
# Android APK (testing)
cd flutter && flutter build apk --release

# Android App Bundle (Play Store)
cd flutter && flutter build appbundle --release

# iOS IPA (unsigned)
cd flutter
cd ios && pod install && cd ..
flutter build ios --release --no-codesign
cd build/ios/iphoneos
mkdir -p Payload && mv Runner.app Payload/
zip -r -9 FlutterIpaExport.ipa Payload
```

---

## 📲 Installation

### Android
```bash
adb install app-release.apk
```
Or: Download to device → Tap → Install

### iOS
**Requires code signing** for device installation.

**Options**:
1. Xcode: Open project → Select team → Build & Run
2. TestFlight: Code sign → Upload to App Store Connect → Invite testers
3. App Store: Code sign → Upload → Submit for review

---

## 🏪 Play Store Submission

1. Run `flutter build appbundle --release`
2. Google Play Console → Create Release
3. Upload `app-release.aab`
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

Configure signing in `android/app/build.gradle`.

### iOS (App Store)

1. Register with Apple Developer
2. Create App ID and Distribution certificate
3. Create provisioning profile
4. Configure in Xcode and build/archive

---

## ⏱️ Build Times (Local)

| Platform | Time |
|----------|------|
| APK | 10-15 min |
| IPA | 15-20 min |
| AAB | 10-15 min |

---

## 📖 Full Documentation

- **Build Instructions**: `flutter/BUILD_INSTRUCTIONS.md`
- **Flutter Guidelines**: `FLUTTER.md`
- **Project Notes**: `CLAUDE.md`

---

## 📋 Checklists

### Before Release
- [ ] Update `flutter/pubspec.yaml` version
- [ ] Update changelog
- [ ] All tests passing
- [ ] Code reviewed and merged to main
- [ ] Run local builds (APK, IPA, AAB)
- [ ] Test on real devices

### Before Submission
- [ ] APK/IPA tested on real devices
- [ ] No crashes or errors
- [ ] Acceptable performance
- [ ] All credentials secure
- [ ] Release notes prepared

---

**Last Updated**: 2026-02-15
