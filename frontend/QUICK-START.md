# Quick Start Guide - Adding Your Brand Assets

## Step 1: Add Your Logo

1. **Place your logo file** in the `public/` folder:
   - Recommended: `public/logo.svg` (scalable vector)
   - Alternative: `public/logo.png` (high resolution, e.g., 512x512px)

2. **Update brand config** (`src/theme/brand.config.ts`):
   ```typescript
   logo: {
     primary: '/logo.svg', // or '/logo.png'
     alt: 'Antariksa Accounting Logo',
   }
   ```

## Step 2: Set Your Brand Color

1. **Update primary color** in `src/theme/theme.config.ts`:
   ```typescript
   primary: {
     500: '#YOUR_HEX_COLOR', // e.g., '#3b82f6'
     // The other shades (50-900) will be auto-generated
   }
   ```

2. **Update brand config** (`src/theme/brand.config.ts`):
   ```typescript
   primaryColor: '#YOUR_HEX_COLOR',
   ```

## Step 3: Customize Fonts (Optional)

If you want to use a custom font:

1. **Add font import** in `src/index.css`:
   ```css
   @import url('https://fonts.googleapis.com/css2?family=YourFont:wght@300;400;500;600;700&display=swap');
   ```

2. **Update theme** (`src/theme/theme.config.ts`):
   ```typescript
   fontFamily: {
     primary: '"YourFont", sans-serif',
   }
   ```

3. **Update brand config** (`src/theme/brand.config.ts`):
   ```typescript
   fonts: {
     primary: '"YourFont", sans-serif',
   }
   ```

## Step 4: Add Favicon

1. **Place favicon** in `public/favicon.svg` (or `.ico`)
2. Already configured in `index.html` - just add the file!

## Step 5: Test Everything

```bash
cd frontend
npm run dev
```

Visit http://localhost:3000 and verify:
- ✅ Logo appears in sidebar
- ✅ Brand colors are applied
- ✅ Fonts load correctly
- ✅ Favicon shows in browser tab

## Need Help?

- See `THEMING.md` for detailed theming guide
- See `PHASE9-SUMMARY.md` for complete Phase 9.1 status
- See `TESTING.md` for testing between phases

