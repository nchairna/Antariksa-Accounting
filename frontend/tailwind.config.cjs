/** @type {import('tailwindcss').Config} */
const { theme: defaultTheme } = require('./src/theme/theme.config.ts');

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Use theme colors
      colors: {
        primary: defaultTheme.colors.primary,
        success: defaultTheme.colors.success,
        warning: defaultTheme.colors.warning,
        error: defaultTheme.colors.error,
        info: defaultTheme.colors.info,
        gray: defaultTheme.colors.gray,
      },
      // Use theme typography
      fontFamily: {
        sans: defaultTheme.typography.fontFamily.primary.split(',').map(f => f.trim()),
        mono: defaultTheme.typography.fontFamily.mono.split(',').map(f => f.trim()),
      },
      fontSize: defaultTheme.typography.fontSize,
      fontWeight: defaultTheme.typography.fontWeight,
      lineHeight: defaultTheme.typography.lineHeight,
      // Use theme spacing
      spacing: defaultTheme.spacing,
      // Use theme border radius
      borderRadius: defaultTheme.borderRadius,
      // Use theme shadows
      boxShadow: {
        sm: defaultTheme.shadows.sm,
        md: defaultTheme.shadows.md,
        lg: defaultTheme.shadows.lg,
        xl: defaultTheme.shadows.xl,
      },
      // Use theme transitions
      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
        slow: '350ms',
      },
    },
  },
  plugins: [],
};
