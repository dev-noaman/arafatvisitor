# Arafat Visitor Management System - Mobile App

A React Native mobile application built with Expo SDK 52 for managing visitors, check-ins, QR scanning, and pre-registrations on the go.

## 🚀 Features

- **Check-In/Check-Out**: Quickly check visitors in and out with status updates
- **QR Code Scanning**: Fast QR code scanning for instant check-in
- **Dashboard Overview**: Real-time KPIs and recent activity
- **Visitor Search**: Search and filter visitors by name, company, phone
- **Pre-Registration**: Pre-register visitors with validation
- **Dark Mode**: Full dark mode support matching the web dashboard
- **Offline Capability**: View cached data when offline
- **Profile Management**: Manage user profile and change password

## 📋 Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Expo CLI**: Latest version (installed via npm)
- **iOS**: macOS with Xcode (for iOS development)
- **Android**: Android Studio with Android SDK (for Android development)

## 🛠️ Installation

1. **Clone the repository and navigate to the mobile directory**:
   ```bash
   cd mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```
   
   Required environment variables:
   ```env
   API_URL=http://localhost:3000
   VERSION=1.0.0
   ```

## 🚦 Development

### Start the Development Server

```bash
npm start
```

This will start the Expo development server. You can then:

- **Press `i`** to open in iOS Simulator (macOS only)
- **Press `a`** to open in Android Emulator
- **Scan the QR code** with Expo Go app on your physical device

### Run on Specific Platform

```bash
# iOS
npm run ios

# Android
npm run android

# Web (for testing only)
npm run web
```

### Run Tests

```bash
npm test
```

### Lint Code

```bash
npm run lint
```

## 📦 Build for Production

### Using EAS Build (Recommended)

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both platforms
eas build --platform all
```

### Using Local Build

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

## 🏗️ Project Structure

```
mobile/
├── src/
│   ├── theme/              # Design tokens (colors, spacing, typography)
│   ├── types/             # TypeScript type definitions
│   ├── services/          # API client and endpoints
│   ├── store/             # Zustand state management
│   ├── hooks/             # Custom React hooks
│   ├── components/        # Reusable UI components
│   ├── screens/           # Screen components
│   ├── navigation/        # Navigation configuration
│   ├── utils/             # Utility functions
│   └── config/           # App configuration
├── assets/               # Images, fonts, icons
├── app.config.ts         # Expo configuration
├── babel.config.js       # Babel configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## 🎨 Tech Stack

- **Framework**: React Native with Expo SDK 52
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: NativeWind 4.1.x (Tailwind CSS for React Native)
- **Navigation**: React Navigation 6.x
- **State Management**: Zustand (global state) + TanStack React Query (server state)
- **HTTP Client**: Axios
- **Storage**: expo-secure-store (tokens), AsyncStorage (preferences)
- **QR Scanning**: expo-camera
- **Notifications**: expo-notifications
- **Haptics**: expo-haptics
- **Animations**: react-native-reanimated

## 🔐 Security

- JWT tokens stored securely using `expo-secure-store`
- Automatic token refresh on 401 responses
- Exponential backoff retry for network failures
- Secure API communication over HTTPS

## 🌐 API Integration

The mobile app connects to the Arafat Visitor Management System backend API:

- **Base URL**: Configured via `API_URL` environment variable
- **Authentication**: JWT Bearer tokens
- **Endpoints**:
  - `/api/auth/*` - Authentication
  - `/admin/api/dashboard/*` - Dashboard data
  - `/admin/api/visitors/*` - Visitor management
  - `/admin/api/pre-register/*` - Pre-registrations
  - `/admin/api/hosts/*` - Host management
  - `/admin/api/deliveries/*` - Delivery management
  - `/admin/api/notifications/*` - Notifications
  - `/admin/api/lookups/*` - Lookup data

## 📱 Platform Support

- **iOS**: 14.0+
- **Android**: 8.0+ (API level 26+)

## 🎯 Performance Targets

- Dashboard load time: < 3 seconds on 4G
- Search results: < 2 seconds
- Check-in/out action: < 30 seconds round-trip
- QR scan to check-in: < 10 seconds total
- Smooth 60 fps animations on low-end devices

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler cache issues**:
   ```bash
   npx expo start -c
   ```

2. **Node modules issues**:
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **iOS build issues**:
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Android build issues**:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

## 📄 License

Proprietary - Arafat Visitor Management System

## 👥 Support

For issues, questions, or feature requests, please contact the development team.
