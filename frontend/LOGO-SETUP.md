# Logo Setup Guide - Countin

## 📍 Where to Put Your Logos

Place your logo files directly in the `frontend/public/` folder:

```
frontend/
└── public/
    ├── logo-black.svg    ← Place your BLACK logo here
    ├── logo-white.svg    ← Place your WHITE logo here
    └── favicon.svg       ← Place your favicon here (optional)
```

## ✅ What's Already Configured

Everything is ready! You just need to add the logo files:

1. ✅ **Brand name**: "Countin" (configured)
2. ✅ **Colors**: Black (#000000) and White (#ffffff) (configured)
3. ✅ **Logo paths**: Already set in `src/theme/brand.config.ts`
4. ✅ **Logo component**: Ready to use both black and white variants
5. ✅ **Soft grays**: Industry-standard border colors configured

## 📝 File Requirements

### Black Logo (`logo-black.svg`)
- **Location**: `frontend/public/logo-black.svg`
- **Color**: Pure black (#000000)
- **Use for**: Light backgrounds (white, light gray)
- **Format**: SVG (recommended) or PNG

### White Logo (`logo-white.svg`)
- **Location**: `frontend/public/logo-white.svg`
- **Color**: Pure white (#ffffff)
- **Use for**: Dark backgrounds (black, dark gray)
- **Format**: SVG (recommended) or PNG

### Favicon (`favicon.svg`)
- **Location**: `frontend/public/favicon.svg`
- **Size**: 32x32px or 64x64px recommended
- **Format**: SVG (recommended) or ICO

## 🎨 Color System

### Primary Colors
- **Black**: `#000000` - Text, logos, primary buttons
- **White**: `#ffffff` - Backgrounds

### Borders (Soft Grays)
- **Primary**: `#e5e5e5` (gray-200) - Most borders
- **Light**: `#f5f5f5` (gray-100) - Subtle borders
- **Dark**: `#d4d4d4` (gray-300) - Stronger borders

## 🚀 After Adding Logos

1. **Restart dev server** (if running):
   ```bash
   npm run dev
   ```

2. **Verify logos appear**:
   - ✅ Sidebar logo (black logo on white background)
   - ✅ Login page logo
   - ✅ Favicon in browser tab

3. **Test logo variants**:
   - The system automatically uses black logo by default
   - You can manually use white logo: `<BrandLogo variant="white" />`

## 📋 Branding Rules

1. **Always Show "Countin"**
   - Base branding is always "Countin"
   - Tenants can add their company name/logo later
   - "Countin" branding remains visible

2. **Minimalistic Design**
   - Clean black & white aesthetic
   - Soft gray borders only
   - Generous white space

## 🔍 Verification Checklist

After adding logos, check:
- [ ] Black logo appears in sidebar
- [ ] Logo scales properly (SVG recommended)
- [ ] Favicon shows in browser tab
- [ ] Text says "Countin" (not "Antariksa Accounting")
- [ ] Colors are black/white (not blue)
- [ ] Borders are soft gray (#e5e5e5)

## 📚 Related Files

- `src/theme/brand.config.ts` - Brand configuration
- `src/theme/theme.config.ts` - Color system
- `src/components/BrandLogo.tsx` - Logo component
- `COUNTIN-BRANDING.md` - Complete branding guide
- `QUICK-START.md` - Quick setup guide

## ❓ Need Help?

If logos don't appear:
1. Check file names are exact: `logo-black.svg`, `logo-white.svg`
2. Check files are in `frontend/public/` folder
3. Restart dev server: `npm run dev`
4. Clear browser cache
5. Check browser console for errors

