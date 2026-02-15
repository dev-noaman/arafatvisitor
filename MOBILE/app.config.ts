import { ExpoConfig, ConfigContext } from '@expo/config';

const config: ExpoConfig = {
  name: 'Arafat Visitor',
  slug: 'arafat-visitor',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic', // Support both light and dark mode
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#465fff', // brand-500
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.arafat.visitor',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#465fff',
    },
    package: 'com.arafat.visitor',
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  extra: {
    // Environment variables exposed to the app
    API_URL: process.env.API_URL || 'https://arafatvisitor.cloud',
    VERSION: process.env.VERSION || '1.0.0',
  },
  plugins: [
    [
      'expo-camera',
      {
        cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera to scan QR codes.',
        microphonePermission: 'Allow $(PRODUCT_NAME) to access your microphone.',
      },
    ],
    [
      'expo-secure-store',
      {
        faceIDPermission: 'Allow $(PRODUCT_NAME) to access your Face ID biometric data.',
      },
    ],
    [
      'expo-notifications',
      {
        color: '#465fff',
        sounds: [],
      },
    ],
  ],
};

export default config;
