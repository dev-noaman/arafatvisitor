/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          25: "#F2F7FF",
          50: "#ECF3FF",
          100: "#DDE9FF",
          200: "#C2D6FF",
          300: "#9CB9FF",
          400: "#7592FF",
          500: "#465FFF", // main primary
          600: "#3641F5",
          700: "#2A31D8",
          800: "#252DAE",
          900: "#262E89",
          950: "#161950",
        },
        "blue-light": {
          50: "#F0F9FF",
          200: "#B9E6FE",
          500: "#0BA5EC", // main secondary
          700: "#026AA2",
          950: "#062C41",
        },
        success: {
          500: "#12B76A",
        },
        error: {
          500: "#F04438",
        },
        warning: {
          500: "#F79009",
        },
        orange: {
          500: "#FB6514",
        },
        gray: {
          50: "#F9FAFB",
          100: "#F3F4F6", // Input bg
          200: "#E5E7EB", // Border
          400: "#9CA3AF", // Text muted
          600: "#4B5563", // Text body
          900: "#1A1C1E", // Text heading
        },
        dark: {
          bg: "#1A1C2E",
          card: "#252A3A",
          text: "#E5E7EB",
          muted: "#9CA3AF",
          border: "#374151",
        },
      },
      fontFamily: {
        outfit: ["Outfit_400Regular", "System"],
        "outfit-medium": ["Outfit_500Medium", "System"],
        "outfit-bold": ["Outfit_700Bold", "System"],
      },
      spacing: {
        // Add Stitch spacing tokens here if needed, keeping defaults for now
      },
      borderRadius: {
        // Add Stitch radius tokens here if needed
      },
      boxShadow: {
        // Add Stitch shadow tokens here if needed
      },
    },
  },
  plugins: [],
};
