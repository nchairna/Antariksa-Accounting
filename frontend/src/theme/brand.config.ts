/**
 * Antariksa Accounting - Brand Configuration
 * 
 * Configure your brand assets here:
 * - Logo files (SVG, PNG)
 * - Brand colors
 * - Typography preferences
 */

export interface BrandConfig {
  // Logo configuration
  logo: {
    // Path to logo file (place in public/ folder)
    // Example: '/logo.svg' or '/logo.png'
    primary: string
    // Optional: Logo for dark mode
    dark?: string
    // Optional: Icon/favicon version
    icon?: string
    // Alt text for accessibility
    alt: string
  }
  
  // Brand name
  name: string
  
  // Brand tagline (optional)
  tagline?: string
  
  // Primary brand color (should match theme.colors.primary[500])
  primaryColor: string
  
  // Font preferences
  fonts: {
    // Primary font family (should match theme.typography.fontFamily.primary)
    primary: string
    // Optional: Secondary font for headings
    heading?: string
    // Optional: Monospace font for code/data
    mono?: string
  }
  
  // Favicon path
  favicon?: string
}

// TODO: Update these values with your actual brand assets
export const brandConfig: BrandConfig = {
  logo: {
    primary: '/logo.svg', // TODO: Add your logo file to public/logo.svg
    alt: 'Antariksa Accounting Logo',
  },
  name: 'Antariksa Accounting',
  tagline: 'Streamline your accounting operations',
  primaryColor: '#3b82f6', // TODO: Update with your brand color
  fonts: {
    primary: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    // Optional: heading: '"Poppins", sans-serif',
    // Optional: mono: '"Fira Code", monospace',
  },
  favicon: '/favicon.svg', // TODO: Add your favicon to public/favicon.svg
}

