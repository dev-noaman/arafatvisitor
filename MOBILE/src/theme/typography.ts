/**
 * Design tokens for typography
 * Font sizes, weights, and line heights matching the admin dashboard
 */

export const fontSizes = {
  title: {
    '2xl': 72,
    xl: 60,
    lg: 48,
    md: 36,
    sm: 30,
  },
  theme: {
    xl: 20,
    sm: 14,
    xs: 12,
  },
  body: {
    lg: 16,
    md: 14,
    sm: 12,
  },
};

export const lineHeights = {
  title: {
    '2xl': 90,
    xl: 72,
    lg: 60,
    md: 44,
    sm: 38,
  },
  theme: {
    xl: 30,
    sm: 20,
    xs: 18,
  },
  body: {
    lg: 24,
    md: 20,
    sm: 16,
  },
};

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
};

export const typography = {
  // Font family
  fontFamily: {
    outfit: 'Outfit',
  },
  // Font sizes
  fontSize: {
    ...fontSizes.title,
    ...fontSizes.theme,
    ...fontSizes.body,
  },
  // Line heights
  lineHeight: {
    ...lineHeights.title,
    ...lineHeights.theme,
    ...lineHeights.body,
  },
  // Font weights
  fontWeight: fontWeights,
  // Letter spacing
  letterSpacing,
};
