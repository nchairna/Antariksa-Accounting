# Antariksa Accounting - Theming Guide

## Overview

This project uses a centralized theming system following industry-standard practices:
- **Design Tokens**: Centralized color, typography, and spacing values
- **Tailwind CSS**: Utility-first CSS framework with custom theme extension
- **Type Safety**: TypeScript interfaces for theme configuration
- **Accessibility**: WCAG 2.1 AA compliant color contrasts
- **Responsive**: Mobile-first breakpoints

## Brand Configuration

### Adding Your Logo

1. **Place your logo files** in the `public/` folder:
   - `public/logo.svg` (recommended) or `public/logo.png`
   - `public/favicon.svg` or `public/favicon.ico`

2. **Update** `src/theme/brand.config.ts`:
   ```typescript
   logo: {
     primary: '/logo.svg', // Path to your logo
     alt: 'Your Company Logo',
   }
   ```

3. **Use the logo** in components:
   ```tsx
   import BrandLogo from '@/components/BrandLogo'
   
   <BrandLogo showText={true} size="lg" />
   ```

### Customizing Brand Colors

1. **Update primary color** in `src/theme/theme.config.ts`:
   ```typescript
   primary: {
     500: '#YOUR_BRAND_COLOR', // Main brand color
     // ... other shades
   }
   ```

2. **Update brand config** in `src/theme/brand.config.ts`:
   ```typescript
   primaryColor: '#YOUR_BRAND_COLOR',
   ```

3. **Regenerate Tailwind classes** (if needed):
   ```bash
   npm run dev
   ```

### Customizing Fonts

1. **Add font import** in `src/index.css`:
   ```css
   @import url('https://fonts.googleapis.com/css2?family=YourFont:wght@300;400;500;600;700&display=swap');
   ```

2. **Update theme** in `src/theme/theme.config.ts`:
   ```typescript
   fontFamily: {
     primary: '"YourFont", sans-serif',
   }
   ```

3. **Update brand config** in `src/theme/brand.config.ts`:
   ```typescript
   fonts: {
     primary: '"YourFont", sans-serif',
   }
   ```

## Theme Structure

### Colors

The theme includes:
- **Primary**: Brand colors (50-900 shades)
- **Semantic**: Success, Warning, Error, Info
- **Neutral**: Gray scale (50-900)
- **Background**: Default, paper, elevated
- **Text**: Primary, secondary, disabled, inverse
- **Border**: Default, light, dark

### Typography

- **Font Families**: Primary, secondary, mono
- **Font Sizes**: xs (12px) to 4xl (36px)
- **Font Weights**: Light (300) to Bold (700)
- **Line Heights**: Tight, normal, relaxed

### Spacing

Consistent spacing scale: xs (4px) to 3xl (64px)

### Breakpoints

- **sm**: 640px (mobile)
- **md**: 768px (tablet)
- **lg**: 1024px (desktop)
- **xl**: 1280px (large desktop)
- **2xl**: 1536px (extra large)

## Usage Examples

### Using Theme Colors

```tsx
// In Tailwind classes
<div className="bg-primary-500 text-white">
  Brand colored element
</div>

// In inline styles (if needed)
import { theme } from '@/theme'
<div style={{ backgroundColor: theme.colors.primary[500] }}>
  Themed element
</div>
```

### Using Typography

```tsx
<h1 className="text-3xl font-bold text-gray-900">
  Heading
</h1>
<p className="text-base text-gray-600">
  Body text
</p>
```

### Responsive Design

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  Responsive grid
</div>
```

## Dark Mode (Future)

Dark mode support is prepared but not yet implemented. To enable:

1. Add dark mode classes to Tailwind config
2. Create `darkTheme` in `theme.config.ts`
3. Add theme toggle component
4. Use `dark:` prefix in Tailwind classes

## Best Practices

1. **Use Tailwind classes** instead of inline styles when possible
2. **Follow the design system** - use theme tokens, not arbitrary values
3. **Maintain consistency** - use semantic color names (primary, success, error)
4. **Test accessibility** - ensure color contrast meets WCAG AA standards
5. **Keep it simple** - don't override theme values unless necessary

## Testing Theme Changes

After updating theme configuration:

1. Restart dev server: `npm run dev`
2. Check components render correctly
3. Verify colors meet accessibility standards
4. Test responsive breakpoints
5. Validate logo displays correctly

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG Color Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Material Design 3](https://m3.material.io/)

