/**
 * Countin - Brand Configuration
 * 
 * Configure your brand assets here:
 * - Logo files (SVG, PNG)
 * - Brand colors
 * - Typography preferences
 * 
 * Note: Base branding is "Countin". Tenants can customize their company name/logo later,
 * but "Countin" branding will always be present.
 */

export interface BrandConfig {
  // Logo configuration
  logo: {
    // Black logo (for light backgrounds) - place in public/logo-black.svg
    black: string
    // White logo (for dark backgrounds) - place in public/logo-white.svg
    white: string
    // Optional: Icon/favicon version
    icon?: string
    // Alt text for accessibility
    alt: string
  }
  
  // Brand name (always "Countin" - tenants can add their company name separately)
  name: string
  
  // Brand tagline (optional)
  tagline?: string
  
  // Primary brand color (black for minimalistic design)
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

// Countin brand configuration
export const brandConfig: BrandConfig = {
  logo: {
    black: '/logo-black.svg', // Place your black logo here: public/logo-black.svg
    white: '/logo-white.svg', // Place your white logo here: public/logo-white.svg
    alt: 'Countin Logo',
  },
  name: 'Countin',
  tagline: 'Streamline your accounting operations',
  primaryColor: '#000000', // Black - minimalistic design
  fonts: {
    primary: '"Outfit", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  favicon: '/favicon.svg', // Place your favicon here: public/favicon.svg
}

