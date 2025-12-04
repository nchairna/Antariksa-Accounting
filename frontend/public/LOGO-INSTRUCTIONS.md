# Logo Placement Instructions

## Where to Put Your Logos

Place your logo files directly in the `frontend/public/` folder:

```
frontend/
└── public/
    ├── logo-black.svg    ← Place your BLACK logo here
    ├── logo-white.svg    ← Place your WHITE logo here
    └── favicon.svg       ← Place your favicon here (optional)
```

## Logo Requirements

### Black Logo (`logo-black.svg`)
- **Use for**: Light backgrounds (white, light gray)
- **Format**: SVG (recommended) or PNG
- **Color**: Black (#000000)
- **Size**: Any size (SVG scales automatically)

### White Logo (`logo-white.svg`)
- **Use for**: Dark backgrounds (black, dark gray)
- **Format**: SVG (recommended) or PNG
- **Color**: White (#ffffff)
- **Size**: Any size (SVG scales automatically)

### Favicon (`favicon.svg`)
- **Format**: SVG (recommended) or ICO
- **Size**: 32x32px or 64x64px recommended
- **Color**: Can be black or white (will be visible on browser tab)

## File Naming

Make sure your files are named exactly:
- `logo-black.svg` (or `.png`)
- `logo-white.svg` (or `.png`)
- `favicon.svg` (or `.ico`)

## After Adding Logos

1. **Restart dev server**:
   ```bash
   npm run dev
   ```

2. **Verify logos appear**:
   - Check sidebar logo
   - Check favicon in browser tab
   - Test both light and dark backgrounds if applicable

## Notes

- The system automatically uses the black logo by default
- You can manually specify `variant="white"` in BrandLogo component for dark backgrounds
- SVG format is recommended for scalability
- Logos are already configured in `src/theme/brand.config.ts`

