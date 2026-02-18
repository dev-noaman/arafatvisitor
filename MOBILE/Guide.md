# Arafat Visitor - App Publishing Guide

---

## Part 1: Publish to Google Play Store (Android)

### Prerequisites

- Google Play Developer account ($25 one-time fee) — [Register here](https://play.google.com/console/signup)
- Signed release APK or AAB (Android App Bundle)
- App icon (512x512 PNG)
- Feature graphic (1024x500 PNG)
- At least 2 screenshots (phone), optionally tablet screenshots
- Privacy policy URL

### Step 1: Generate a Signing Key

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore arafat-visitor.keystore \
  -alias arafat-visitor \
  -keyalg RSA -keysize 2048 -validity 10000
```

It will ask you:

| Question | Answer |
|----------|--------|
| Enter keystore password | Choose a strong password (save it!) |
| Re-enter new password | Same password |
| What is your first and last name? | `Arafat Group` |
| What is the name of your organizational unit? | `IT` |
| What is the name of your organization? | `Arafat Group` |
| What is the name of your City or Locality? | `Doha` |
| What is the name of your State or Province? | `Doha` |
| What is the two-letter country code? | `QA` |
| Is CN=Arafat Group, OU=IT, O=Arafat Group, L=Doha, ST=Doha, C=QA correct? | `yes` |

Save the keystore file and password securely. You need them for every future update. If you lose the keystore, you cannot update the app — you would have to publish a new app.

### Step 2: Configure Signing in Expo

Create `MOBILE/eas.json` (or update existing):

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

Or sign manually by adding to `MOBILE/android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file("arafat-visitor.keystore")
            storePassword "YOUR_STORE_PASSWORD"
            keyAlias "arafat-visitor"
            keyPassword "YOUR_KEY_PASSWORD"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### Step 3: Build the Signed APK/AAB

```bash
cd MOBILE
npx expo prebuild --platform android --clean
cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

### Step 4: Create App on Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **Create app**

You will be asked:

| Question | Answer |
|----------|--------|
| App name | `Arafat Visitor` |
| Default language | `English (United States)` |
| App or game | **App** |
| Free or paid | **Free** |
| Developer Program Policies | Check the box (accept) |
| US export laws | Check the box (accept) |

Click **Create app**.

### Step 5: Complete Store Listing

Go to **Grow > Store listing** and fill in:

| Field | What to enter |
|-------|---------------|
| App name | `Arafat Visitor` |
| Short description (max 80 chars) | `Visitor management and delivery tracking for Arafat Group` |
| Full description | See below |
| App icon | Upload 512x512 PNG |
| Feature graphic | Upload 1024x500 PNG |
| Phone screenshots | Upload at least 2 screenshots (take them from a real device or emulator) |
| Tablet screenshots | Optional — skip if you don't have them |

**Full description to copy-paste:**

```
Arafat Visitor is the official visitor management app for Arafat Group properties.

Features:
- Dashboard with real-time visitor and delivery statistics
- Pre-register visitors before they arrive
- Approve or reject visitor requests
- Track visitor check-in and check-out
- QR code generation for fast kiosk check-in
- Delivery tracking and pickup management
- Host and staff directory

Built for administrators, receptionists, hosts, and staff at Arafat Group.
```

### Step 6: Complete Content Rating Questionnaire

Go to **Policy > App content > Content rating > Start questionnaire**.

**Category:** Select **Utility, Productivity, Communication, or Other**

Then answer ALL these questions:

| Question | Answer |
|----------|--------|
| Does the app contain violence? | **No** |
| Does the app contain sexual content? | **No** |
| Does the app contain profanity or crude humor? | **No** |
| Does the app contain drug references? | **No** |
| Does the app allow users to interact or exchange information? | **No** (it's internal company use only) |
| Does the app share the user's current location? | **No** |
| Does the app allow purchases? | **No** |
| Does the app contain ads? | **No** |
| Is the app a game? | **No** |
| Does the app allow gambling? | **No** |
| Does the app contain horror content? | **No** |

Click **Save > Next > Submit**. You should get a rating of **Everyone** or **PEGI 3**.

### Step 7: Complete Data Safety Form

Go to **Policy > App content > Data safety > Start**.

**Overview questions:**

| Question | Answer |
|----------|--------|
| Does your app collect or share any of the required user data types? | **Yes** |
| Does your app collect any user data? | **Yes** |
| Is all of the user data collected by your app encrypted in transit? | **Yes** (we use HTTPS) |
| Do you provide a way for users to request that their data is deleted? | **Yes** (admin can delete accounts) |

**Data types collected — check these:**

| Data type | Collected | Shared | Purpose | Optional? |
|-----------|-----------|--------|---------|-----------|
| Name | Yes | No | App functionality | No |
| Email address | Yes | No | App functionality, Account management | No |
| Phone number | Yes | No | App functionality | No |
| Other (company name) | Yes | No | App functionality | No |

**For each data type above, answer:**

| Question | Answer |
|----------|--------|
| Is this data collected, shared, or both? | **Collected** |
| Is this data processed ephemerally? | **No** (it's stored on our server) |
| Is this data required or can users choose? | **Required** |
| Why is this data collected? | **App functionality** |

**Data types NOT collected (leave unchecked):**
- Financial info, Health info, Messages, Photos/videos, Audio, Files
- Calendar, Contacts, App activity, Web browsing, Location
- App interactions (analytics), Crash logs, Device ID, Advertising ID

Click **Save > Submit**.

### Step 8: Target Audience & Content

Go to **Policy > App content > Target audience and content**.

| Question | Answer |
|----------|--------|
| Target age group | Select **18 and over** only |
| Does this app appeal to children? | **No** |
| Does this app contain ads? | **No** |

### Step 9: News App / COVID-19 / Government App

| Question | Answer |
|----------|--------|
| Is this a news app? | **No** |
| Is this a COVID-19 contact tracing or status app? | **No** |
| Is this a government app? | **No** |

### Step 10: Upload the AAB and Submit

1. Go to **Release > Production**
2. Click **Create new release**
3. If asked about Play App Signing: **Accept** (let Google manage your signing key — recommended)
4. Upload `app-release.aab`
5. Release name: `1.0.0`
6. Release notes:
```
Initial release of Arafat Visitor.
- Visitor management dashboard
- Pre-registration and approvals
- QR code check-in/check-out
- Delivery tracking
```
7. Click **Review release**
8. Click **Start rollout to Production**

Google review takes 1-3 days (sometimes up to 7 for first app).

### Common Google Play Rejection Reasons & Fixes

| Rejection reason | What to do |
|-----------------|------------|
| "App requires login but no test credentials" | Provide test account in **App access** section: email `admin@arafatvisitor.cloud` + password |
| "Privacy policy missing or invalid" | Add a working privacy policy URL to store listing |
| "Screenshots don't match app" | Take fresh screenshots from the actual app |
| "App does not provide core functionality" | Make sure the test account actually works and the backend is running |
| "Metadata contains misleading info" | Don't say features exist that aren't in the app |

**App Access (important!):** Go to **Policy > App content > App access**. Select **"All or some functionality is restricted"**. Then click **Manage** and add:

| Field | Value |
|-------|-------|
| Name | `Test Admin Account` |
| Username/email | `admin@arafatvisitor.cloud` |
| Password | Your admin password |
| Instructions | `This is an internal company visitor management app. Use the provided admin credentials to log in and access all features.` |

---

## Part 2: Publish to Apple App Store (iOS)

### Prerequisites

- Apple Developer account ($99/year) — [Enroll here](https://developer.apple.com/programs/enroll/)
- Mac with Xcode installed
- App icon (1024x1024 PNG, no alpha/transparency)
- At least 3 screenshots for 6.7" and 6.5" displays
- Privacy policy URL

### Step 1: Create App ID & Certificates

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Go to **Certificates, Identifiers & Profiles**

**Create App ID:**
1. Click **Identifiers > +**
2. Select **App IDs** > Continue
3. Select **App** > Continue
4. Fill in:

| Field | Value |
|-------|-------|
| Description | `Arafat Visitor` |
| Bundle ID | Explicit: `com.arafatgroup.visitor` |

5. Capabilities — leave defaults (you don't need special capabilities)
6. Click **Continue > Register**

**Create Distribution Certificate:**
1. Click **Certificates > +**
2. Select **Apple Distribution** > Continue
3. You need a CSR file. On your Mac:
   - Open **Keychain Access** (search in Spotlight)
   - Menu: **Keychain Access > Certificate Assistant > Request a Certificate from a Certificate Authority**
   - Email: your Apple ID email
   - Common Name: `Arafat Group`
   - Select **Saved to disk**
   - Click **Continue** and save the `.certSigningRequest` file
4. Upload the CSR file
5. Download the certificate and double-click to install

**Create Provisioning Profile:**
1. Click **Profiles > +**
2. Select **App Store Connect** > Continue
3. Select your App ID (`com.arafatgroup.visitor`) > Continue
4. Select your distribution certificate > Continue
5. Profile name: `Arafat Visitor App Store`
6. Click **Generate** > Download

### Step 2: Configure Signing in Xcode

```bash
cd MOBILE
npx expo prebuild --platform ios --clean
open ios/*.xcworkspace
```

In Xcode:
1. Select the project in the left navigator
2. Select the main target (not "Tests")
3. Go to **Signing & Capabilities** tab
4. For **Release** configuration:
   - Uncheck **Automatically manage signing** (or keep it checked if you prefer — automatic is easier)
   - If manual: select your Provisioning Profile
   - Set **Team** to your Apple Developer team
   - Bundle Identifier: `com.arafatgroup.visitor`

### Step 3: Build the Archive

**Option A — Xcode (easier):**
1. In Xcode, set target to **Any iOS Device (arm64)** (NOT a simulator)
2. Menu: **Product > Archive**
3. Wait for build (5-15 minutes)
4. Organizer window opens with your archive

**Option B — Command line:**
```bash
cd MOBILE/ios
xcodebuild -workspace *.xcworkspace \
  -scheme ArafatVisitor \
  -sdk iphoneos \
  -configuration Release \
  -archivePath ~/ArafatVisitor.xcarchive \
  archive
```

### Step 4: Create App on App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** > **+** > **New App**

| Field | Value |
|-------|-------|
| Platforms | **iOS** |
| Name | `Arafat Visitor` |
| Primary language | `English (U.S.)` |
| Bundle ID | Select `com.arafatgroup.visitor` |
| SKU | `arafat-visitor-001` |
| User Access | **Full Access** |

Click **Create**.

### Step 5: App Information Questions

Go to **App Information** in the sidebar:

| Field | Answer |
|-------|--------|
| Subtitle (optional) | `Visitor Management for Arafat Group` |
| Category | **Business** |
| Secondary Category (optional) | **Productivity** |
| Content Rights | **This app does not contain, show, or access third-party content** |
| Age Rating | Click **Edit** — see questionnaire below |

### Step 6: Age Rating Questionnaire

Click **Edit** next to Age Rating. Answer:

| Question | Answer |
|----------|--------|
| Made for Kids | **No** |
| Cartoon or Fantasy Violence | **None** |
| Realistic Violence | **None** |
| Prolonged Graphic or Sadistic Realistic Violence | **None** |
| Profanity or Crude Humor | **None** |
| Mature/Suggestive Themes | **None** |
| Horror/Fear Themes | **None** |
| Medical/Treatment Information | **None** |
| Alcohol, Tobacco, or Drug Use or References | **None** |
| Simulated Gambling | **None** |
| Sexual Content or Nudity | **None** |
| Graphic Sexual Content and Nudity | **None** |
| Unrestricted Web Access | **No** |
| Gambling with Real Currency | **No** |

Result should be **4+** rating. Click **Done**.

### Step 7: App Privacy Questions

Go to **App Privacy** in the sidebar. Click **Get Started**.

**Question: Does your app collect data?**
Answer: **Yes, we collect data**

**Select the data types you collect:**

Check these:
- **Contact Info > Name** — Yes
- **Contact Info > Email Address** — Yes
- **Contact Info > Phone Number** — Yes
- **Identifiers > User ID** — Yes

Leave everything else unchecked (no location, health, financial, browsing, diagnostics, etc.)

**For Name, answer:**

| Question | Answer |
|----------|--------|
| Is this data linked to the user's identity? | **Yes** |
| Is this data used to track users across apps/websites? | **No** |
| Why do you collect this data? | **App Functionality** |

**For Email Address, answer:**

| Question | Answer |
|----------|--------|
| Is this data linked to the user's identity? | **Yes** |
| Is this data used to track users across apps/websites? | **No** |
| Why do you collect this data? | **App Functionality** |

**For Phone Number, answer:**

| Question | Answer |
|----------|--------|
| Is this data linked to the user's identity? | **Yes** |
| Is this data used to track users across apps/websites? | **No** |
| Why do you collect this data? | **App Functionality** |

**For User ID, answer:**

| Question | Answer |
|----------|--------|
| Is this data linked to the user's identity? | **Yes** |
| Is this data used to track users across apps/websites? | **No** |
| Why do you collect this data? | **App Functionality** |

Click **Publish**.

### Step 8: Pricing and Availability

Go to **Pricing and Availability**:

| Field | Answer |
|-------|--------|
| Price | **Free** |
| Availability | **Available in all territories** (or select just Qatar if internal only) |
| Pre-Orders | **No** |

### Step 9: Prepare Version Information

Go to your app version (e.g., **1.0 Prepare for Submission**):

**Screenshots:**
You need screenshots for at least these sizes:
- **6.7" Display** (iPhone 15 Pro Max) — 1290 x 2796 px
- **6.5" Display** (iPhone 11 Pro Max) — 1242 x 2688 px

Take screenshots of: Login screen, Dashboard, Visitors list, Pre-registrations, Deliveries

**Version Information:**

| Field | What to enter |
|-------|---------------|
| Promotional Text (optional) | `Streamline visitor management at Arafat Group` |
| Description | See below |
| Keywords | `visitor,management,check-in,delivery,reception,security,arafat,QR` |
| Support URL | Your support URL or company website |
| Marketing URL (optional) | Company website |
| Version | `1.0.0` |
| Copyright | `2026 Arafat Group` |

**Description to copy-paste:**

```
Arafat Visitor is the official visitor management app for Arafat Group properties.

Features:
- Dashboard with real-time visitor and delivery statistics
- Pre-register visitors before they arrive
- Approve or reject visitor requests
- Track visitor check-in and check-out
- QR code generation for fast kiosk check-in
- Delivery tracking and pickup management
- Host and staff directory

Built for administrators, receptionists, hosts, and staff at Arafat Group.
```

**What's New:**
```
Initial release of Arafat Visitor.
```

### Step 10: App Review Information

This section is critical — Apple reviewers use this to test your app.

| Field | Value |
|-------|-------|
| Sign-In Required | **Yes** |
| Username | `admin@arafatvisitor.cloud` |
| Password | Your admin password |
| Contact First Name | Your first name |
| Contact Last Name | Your last name |
| Contact Phone | Your phone number |
| Contact Email | Your email |
| Notes | See below |

**Review Notes to copy-paste:**
```
This is an internal company visitor management app for Arafat Group employees.

To test the app:
1. Log in with the provided admin credentials
2. The dashboard shows visitor and delivery statistics
3. Navigate to Visitors to see the visitor list
4. Navigate to Pre-Registrations to see pending approvals
5. Navigate to Deliveries to see delivery tracking
6. The app connects to our production server at arafatvisitor.cloud

The app requires authentication as it manages sensitive visitor data for our company properties.
```

### Step 11: Export Compliance Questions

When you submit, Apple will ask:

| Question | Answer |
|----------|--------|
| Does your app use encryption? | **Yes** (we use HTTPS) |
| Does your app qualify for any encryption exemptions? | **Yes** |
| Does your app implement any encryption algorithms itself? | **No** |
| Does your app only use encryption from the OS (iOS/HTTPS/TLS)? | **Yes** |

If asked about export compliance documentation: select **"My app only uses standard HTTPS/TLS encryption"** — this qualifies for the exemption and no documentation is needed.

### Step 12: Upload Build and Submit

**Upload from Xcode:**
1. In Organizer (Window > Organizer), select your archive
2. Click **Distribute App**
3. Select **App Store Connect** > Next
4. Select **Upload** > Next
5. Keep default options (include symbols, manage version) > Next
6. Select your distribution certificate and profile > Next
7. Click **Upload**
8. Wait 15-30 minutes for Apple to process

**Back in App Store Connect:**
1. Go to your app version
2. Under **Build**, click **+**
3. Select your uploaded build (it appears after processing)
4. Scroll down and click **Submit for Review**

Apple review takes 1-2 days (sometimes hours, sometimes up to 5 days for first app).

### Common Apple Rejection Reasons & Fixes

| Rejection reason | What to do |
|-----------------|------------|
| "We were unable to review because we need a demo account" | Make sure review credentials work and the server is running |
| "Guideline 4.2 - Minimum Functionality" | Apple may say the app is too simple or just a website wrapper. Reply explaining it's a company internal tool with specific native features (QR scanning, push notifications) |
| "Guideline 5.1.1 - Data Collection and Storage" | Make sure privacy policy URL works and covers all data collected |
| "Guideline 2.1 - App Completeness - performance" | App crashed during review. Test thoroughly on a real device before submitting |
| "Guideline 4.0 - Design - login wall" | Apple wants to see what the app does without login. Add a brief description/screenshot on the login screen showing what the app offers |
| "Missing Push Notification entitlement" | If you don't use push notifications, make sure no code references them. If you do, add the capability in Xcode |
| "IPv6 network compatibility" | Apple tests on IPv6. This should work automatically with standard networking libraries |

**If rejected, don't panic:** Read Apple's message carefully, fix the issue, and resubmit. Most rejections are resolved in 1-2 rounds. You can also reply to the reviewer in the Resolution Center to ask for clarification.

---

## Quick Reference

| Item | Android | iOS |
|------|---------|-----|
| Developer account | Google Play ($25 once) | Apple Developer ($99/year) |
| Build output | `.aab` (preferred) or `.apk` | `.xcarchive` then `.ipa` |
| Upload tool | Google Play Console (web) | Xcode Organizer |
| Review time | 1-3 days | 1-2 days |
| Bundle ID | Set in `app.config.ts` | Set in `app.config.ts` |
| Signing | Keystore file | Certificate + Provisioning Profile |
| Test credentials | App Access section | App Review Information section |
| Age rating result | Everyone / PEGI 3 | 4+ |
| Category | Business | Business |
| Price | Free | Free |
