/**
 * Countin - Theme Configuration
 * 
 * Minimalistic black & white design with industry-standard soft grays for borders.
 * Following:
 * - Material Design 3 principles
 * - WCAG 2.1 AA accessibility standards
 * - Responsive design best practices
 */

export interface ThemeColors {
  // Primary brand colors
  primary: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string // Main brand color
    600: string
    700: string
    800: string
    900: string
  }
  
  // Semantic colors
  success: {
    50: string
    100: string
    500: string
    600: string
    700: string
  }
  
  warning: {
    50: string
    100: string
    500: string
    600: string
    700: string
  }
  
  error: {
    50: string
    100: string
    500: string
    600: string
    700: string
  }
  
  info: {
    50: string
    100: string
    500: string
    600: string
    700: string
  }
  
  // Neutral colors
  gray: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
  }
  
  // Background colors
  background: {
    default: string
    paper: string
    elevated: string
  }
  
  // Text colors
  text: {
    primary: string
    secondary: string
    disabled: string
    inverse: string
  }
  
  // Border colors
  border: {
    default: string
    light: string
    dark: string
  }
}

export interface ThemeTypography {
  fontFamily: {
    primary: string
    secondary: string
    mono: string
  }
  fontSize: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
  }
  fontWeight: {
    light: number
    normal: number
    medium: number
    semibold: number
    bold: number
  }
  lineHeight: {
    tight: number
    normal: number
    relaxed: number
  }
}

export interface ThemeSpacing {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
}

export interface ThemeBreakpoints {
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
}

export interface Theme {
  colors: ThemeColors
  typography: ThemeTypography
  spacing: ThemeSpacing
  breakpoints: ThemeBreakpoints
  borderRadius: {
    sm: string
    md: string
    lg: string
    xl: string
    full: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
  }
  transitions: {
    fast: string
    normal: string
    slow: string
  }
}

// Default theme - Minimalistic black & white with soft grays
export const defaultTheme: Theme = {
  colors: {
    primary: {
      50: '#f9fafb', // Very light gray
      100: '#f3f4f6', // Light gray
      200: '#e5e7eb', // Soft gray for borders
      300: '#d1d5db', // Medium-light gray
      400: '#9ca3af', // Medium gray
      500: '#000000', // Black - main brand color (minimalistic)
      600: '#111827', // Very dark gray (almost black)
      700: '#1f2937', // Dark gray
      800: '#374151', // Darker gray
      900: '#000000', // Pure black
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
    gray: {
      50: '#fafafa',   // Very light gray (almost white)
      100: '#f5f5f5',  // Light gray
      200: '#e5e5e5',  // Soft gray for borders (industry standard)
      300: '#d4d4d4',  // Medium-light gray
      400: '#a3a3a3',  // Medium gray
      500: '#737373',  // Neutral gray
      600: '#525252',  // Medium-dark gray
      700: '#404040',  // Dark gray
      800: '#262626',  // Very dark gray
      900: '#171717',  // Almost black
    },
    background: {
      default: '#ffffff', // White background
      paper: '#ffffff',   // White paper/cards
      elevated: '#fafafa', // Slightly elevated surfaces
    },
    text: {
      primary: '#000000',   // Black text
      secondary: '#525252',  // Dark gray for secondary text
      disabled: '#a3a3a3',  // Medium gray for disabled
      inverse: '#ffffff',   // White text (for dark backgrounds)
    },
    border: {
      default: '#e5e5e5', // Soft gray border (industry standard)
      light: '#f5f5f5',  // Very light border
      dark: '#d4d4d4',    // Slightly darker border
    },
  },
  typography: {
    fontFamily: {
      primary: '"Outfit", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      secondary: '"Outfit", sans-serif',
      mono: '"Fira Code", "Courier New", monospace',
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  borderRadius: {
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  transitions: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },
}

// Export theme for use in components
export const theme = defaultTheme

