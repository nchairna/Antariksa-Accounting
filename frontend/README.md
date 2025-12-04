# Antariksa Accounting - Frontend

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios

## Project Structure

```
frontend/
├── src/
│   ├── layouts/          # Layout components (DashboardLayout)
│   ├── pages/            # Page components (LoginPage, DashboardPage)
│   ├── stores/           # Zustand stores (authStore)
│   ├── lib/              # Utilities (API client)
│   ├── App.tsx           # Main app component with routing
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration
├── tailwind.config.cjs   # Tailwind configuration
└── tsconfig.json         # TypeScript configuration
```

## Getting Started

### Install Dependencies
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Runs on http://localhost:3000

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Features Implemented

### ✅ Phase 9.1: Frontend Foundation
- [x] React + TypeScript setup
- [x] Vite build tool configured
- [x] Tailwind CSS for styling
- [x] React Router for navigation
- [x] Zustand for state management
- [x] React Hook Form + Zod for forms
- [x] Axios API client with interceptors
- [x] Authentication store with persistence
- [x] Login page with form validation
- [x] Dashboard layout with sidebar navigation
- [x] Responsive design (mobile-friendly sidebar)
- [x] Protected routes with auth guards

## Next Steps (Phase 9.2-9.5)

### Phase 9.2: Application Shell & Navigation
- [ ] Complete navigation menu with all routes
- [ ] Search functionality in header
- [ ] Notifications dropdown
- [ ] User profile menu

### Phase 9.3: Core Desktop Dashboards & Screens
- [ ] Master Data pages (Items, Customers, Suppliers)
- [ ] Inventory management pages
- [ ] Purchase Order pages
- [ ] Sales Order pages
- [ ] Invoice pages
- [ ] Payment pages
- [ ] Report pages

### Phase 9.4: Mobile Optimization
- [ ] Mobile-friendly forms
- [ ] Touch-optimized tables
- [ ] Mobile navigation patterns

### Phase 9.5: UI/UX Polish
- [ ] Loading states
- [ ] Error boundaries
- [ ] Toast notifications
- [ ] Empty states
- [ ] Accessibility improvements

## API Integration

The frontend is configured to proxy API requests to the backend:
- API base URL: `/api` (proxied to `http://localhost:5000`)
- Authentication: JWT tokens stored in Zustand store
- Auto-logout on 401 responses

## Environment Variables

Create a `.env` file for environment-specific configuration:
```
VITE_API_URL=http://localhost:5000
```

