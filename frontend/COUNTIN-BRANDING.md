# Countin Branding Guide

## Brand Identity

**Name**: Countin  
**Design Philosophy**: Minimalistic black & white with soft grays

## Color Palette

### Primary Colors
- **Black**: `#000000` - Primary brand color, text, and accents
- **White**: `#ffffff` - Backgrounds and inverse text

### Gray Scale (Industry Standard Soft Grays)
Used for borders, subtle backgrounds, and secondary elements:

- **Gray 50**: `#fafafa` - Very light backgrounds
- **Gray 100**: `#f5f5f5` - Light backgrounds
- **Gray 200**: `#e5e5e5` - **Primary border color** (industry standard)
- **Gray 300**: `#d4d4d4` - Medium-light borders
- **Gray 400**: `#a3a3a3` - Medium gray (disabled states)
- **Gray 500**: `#737373` - Neutral gray
- **Gray 600**: `#525252` - Secondary text
- **Gray 700**: `#404040` - Dark gray
- **Gray 800**: `#262626` - Very dark gray
- **Gray 900**: `#171717` - Almost black

### Semantic Colors (Minimal Use)
Used sparingly for status indicators:

- **Success**: Green tones (for success messages)
- **Warning**: Yellow/Orange tones (for warnings)
- **Error**: Red tones (for errors)
- **Info**: Blue tones (for informational messages)

## Typography

**Primary Font**: Inter (system fallback)
- Clean, modern, highly readable
- Excellent for UI and data display

## Logo Usage

### Logo Variants
- **Black Logo**: Use on light backgrounds (white, light gray)
- **White Logo**: Use on dark backgrounds (black, dark gray)

### Logo Placement
- Sidebar navigation
- Login page
- Email templates (future)
- Documentation

## Branding Rules

1. **Always Show "Countin"**
   - Base branding is always "Countin"
   - Tenants can add their company name/logo
   - "Countin" branding remains visible

2. **Minimalistic Design**
   - Clean, uncluttered interfaces
   - Generous white space
   - Focus on content and functionality

3. **Consistent Borders**
   - Use `gray-200` (#e5e5e5) for most borders
   - Subtle, professional appearance
   - Industry-standard soft gray

4. **High Contrast**
   - Black text on white backgrounds
   - WCAG 2.1 AA compliant
   - Excellent readability

## Tenant Customization (Future)

Tenants will be able to:
- Add their company logo (alongside Countin logo)
- Customize company name display
- "Countin" branding will always remain visible

## Implementation

All branding is configured in:
- `src/theme/brand.config.ts` - Brand assets and name
- `src/theme/theme.config.ts` - Color system
- `src/components/BrandLogo.tsx` - Logo component

## Resources

- Logo files: `public/logo-black.svg`, `public/logo-white.svg`
- Favicon: `public/favicon.svg`
- See `THEMING.md` for detailed theming guide

