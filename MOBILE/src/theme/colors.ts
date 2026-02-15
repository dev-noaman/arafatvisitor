/**
 * Design tokens for colors extracted from the admin dashboard
 * Matches the exact color palette used in the web application
 */

export const colors = {
  light: {
    primary: '#465fff',        // brand-500
    secondary: '#7a5af8',      // theme-purple-500
    success: '#12b76a',        // success-500
    warning: '#f79009',        // warning-500
    error: '#f04438',          // error-500
    background: '#f9fafb',      // gray-50
    card: '#ffffff',           // white
    border: '#e4e7ec',        // gray-200
    text: {
      primary: '#101828',      // gray-900
      secondary: '#667085',    // gray-500
      muted: '#98a2b3',       // gray-400
      disabled: '#d0d5dd',     // gray-300
    },
    overlay: 'rgba(16, 24, 40, 0.5)',
  },
  dark: {
    primary: '#465fff',        // brand-500 (same in dark)
    secondary: '#a78bfa',      // theme-purple-400
    success: '#32d583',        // success-400
    warning: '#fdb022',        // warning-400
    error: '#f97066',          // error-400
    background: '#1a2231',     // gray-dark
    card: '#1d2939',          // gray-800
    border: '#344054',        // gray-700
    text: {
      primary: '#f9fafb',      // gray-50
      secondary: '#d1d5db',    // gray-300
      muted: '#6b7280',       // gray-500
      disabled: '#475467',     // gray-600
    },
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  status: {
    pending: '#f79009',        // warning-500 (amber)
    approved: '#12b76a',       // success-500 (green)
    checkedIn: '#465fff',      // brand-500 (blue)
    checkedOut: '#667085',     // gray-500
    rejected: '#f04438',       // error-500 (red)
    pendingApproval: '#f79009', // warning-500
    received: '#12b76a',       // success-500 (for deliveries)
    pickedUp: '#667085',      // gray-500 (for deliveries)
  },
  brand: {
    25: '#f2f7ff',
    50: '#ecf3ff',
    100: '#dde9ff',
    200: '#c2d6ff',
    300: '#9cb9ff',
    400: '#7592ff',
    500: '#465fff',
    600: '#3641f5',
    700: '#2a31d8',
    800: '#252dae',
    900: '#262e89',
    950: '#161950',
  },
  gray: {
    25: '#fcfcfd',
    50: '#f9fafb',
    100: '#f2f4f7',
    200: '#e4e7ec',
    300: '#d0d5dd',
    400: '#98a2b3',
    500: '#667085',
    600: '#475467',
    700: '#344054',
    800: '#1d2939',
    900: '#101828',
    950: '#0c111d',
    dark: '#1a2231',
  },
  success: {
    25: '#f6fef9',
    50: '#ecfdf3',
    100: '#d1fadf',
    200: '#a6f4c5',
    300: '#6ce9a6',
    400: '#32d583',
    500: '#12b76a',
    600: '#039855',
    700: '#027a48',
    800: '#05603a',
    900: '#054f31',
    950: '#053321',
  },
  warning: {
    25: '#fffcf5',
    50: '#fffaeb',
    100: '#fef0c7',
    200: '#fedf89',
    300: '#fec84b',
    400: '#fdb022',
    500: '#f79009',
    600: '#dc6803',
    700: '#b54708',
    800: '#93370d',
    900: '#7a2e0e',
    950: '#4e1d09',
  },
  error: {
    25: '#fffbfa',
    50: '#fef3f2',
    100: '#fee4e2',
    200: '#fecdca',
    300: '#fda29b',
    400: '#f97066',
    500: '#f04438',
    600: '#d92d20',
    700: '#b42318',
    800: '#912018',
    900: '#7a271a',
    950: '#55160c',
  },
};

export type ColorScheme = 'light' | 'dark';
export type ColorPalette = typeof colors.light | typeof colors.dark;
