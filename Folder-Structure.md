# Antariksa Accounting - Folder Structure

## 1. Project Root Structure

```
antariksa-accounting/
├── backend/                 # Backend application
├── frontend/                # Frontend application
├── mobile/                  # Mobile application (optional)
├── docs/                    # Documentation
├── scripts/                 # Utility scripts
├── tests/                   # Test files
├── .gitignore              # Git ignore file
├── README.md               # Project README
├── Requirements.md         # Main requirements document
├── Features.md             # Features specification
├── UI-Navigation.md        # UI navigation structure
├── Folder-Structure.md     # This file
├── package.json            # Root package.json (if monorepo)
└── docker-compose.yml      # Docker compose configuration
```

---

## 2. Backend Structure

```
backend/
├── src/
│   ├── config/             # Configuration files
│   │   ├── database.js     # Database configuration
│   │   ├── auth.js         # Authentication configuration
│   │   ├── env.js          # Environment variables
│   │   └── constants.js    # Constants
│   │
│   ├── models/             # Database models
│   │   ├── User.js         # User model
│   │   ├── Role.js         # Role model
│   │   ├── Item.js         # Item model
│   │   ├── Customer.js     # Customer model
│   │   ├── Supplier.js     # Supplier model
│   │   ├── PurchaseOrder.js # PO model
│   │   ├── SalesOrder.js   # SO model
│   │   ├── SalesInvoice.js # Sales invoice model
│   │   ├── PurchaseInvoice.js # Purchase invoice model
│   │   ├── Payment.js      # Payment model
│   │   ├── StockMovement.js # Stock movement model
│   │   └── index.js        # Model exports
│   │
│   ├── controllers/        # Controllers
│   │   ├── auth/           # Authentication controllers
│   │   │   ├── auth.controller.js
│   │   │   └── session.controller.js
│   │   ├── users/          # User controllers
│   │   │   └── user.controller.js
│   │   ├── items/          # Item controllers
│   │   │   └── item.controller.js
│   │   ├── customers/      # Customer controllers
│   │   │   └── customer.controller.js
│   │   ├── suppliers/      # Supplier controllers
│   │   │   └── supplier.controller.js
│   │   ├── purchase-orders/ # PO controllers
│   │   │   └── po.controller.js
│   │   ├── sales-orders/   # SO controllers
│   │   │   └── so.controller.js
│   │   ├── invoices/       # Invoice controllers
│   │   │   ├── sales-invoice.controller.js
│   │   │   └── purchase-invoice.controller.js
│   │   ├── payments/       # Payment controllers
│   │   │   └── payment.controller.js
│   │   ├── inventory/      # Inventory controllers
│   │   │   └── inventory.controller.js
│   │   └── reports/        # Report controllers
│   │       └── report.controller.js
│   │
│   ├── services/           # Business logic services
│   │   ├── auth/           # Authentication services
│   │   │   ├── auth.service.js
│   │   │   └── token.service.js
│   │   ├── users/          # User services
│   │   │   └── user.service.js
│   │   ├── items/          # Item services
│   │   │   └── item.service.js
│   │   ├── customers/      # Customer services
│   │   │   └── customer.service.js
│   │   ├── suppliers/      # Supplier services
│   │   │   └── supplier.service.js
│   │   ├── orders/         # Order services
│   │   │   ├── po.service.js
│   │   │   └── so.service.js
│   │   ├── invoices/       # Invoice services
│   │   │   ├── sales-invoice.service.js
│   │   │   └── purchase-invoice.service.js
│   │   ├── payments/       # Payment services
│   │   │   └── payment.service.js
│   │   ├── inventory/      # Inventory services
│   │   │   └── inventory.service.js
│   │   ├── reports/        # Report services
│   │   │   └── report.service.js
│   │   └── email/          # Email services
│   │       └── email.service.js
│   │
│   ├── routes/             # API routes
│   │   ├── auth.routes.js  # Authentication routes
│   │   ├── users.routes.js # User routes
│   │   ├── items.routes.js # Item routes
│   │   ├── customers.routes.js # Customer routes
│   │   ├── suppliers.routes.js # Supplier routes
│   │   ├── purchase-orders.routes.js # PO routes
│   │   ├── sales-orders.routes.js # SO routes
│   │   ├── invoices.routes.js # Invoice routes
│   │   ├── payments.routes.js # Payment routes
│   │   ├── inventory.routes.js # Inventory routes
│   │   ├── reports.routes.js # Report routes
│   │   └── index.js        # Route aggregator
│   │
│   ├── middleware/         # Middleware
│   │   ├── auth.middleware.js # Authentication middleware
│   │   ├── authorization.middleware.js # Authorization middleware
│   │   ├── validation.middleware.js # Validation middleware
│   │   ├── error.middleware.js # Error handling middleware
│   │   ├── audit.middleware.js # Audit logging middleware
│   │   └── rate-limit.middleware.js # Rate limiting middleware
│   │
│   ├── utils/              # Utility functions
│   │   ├── validators/     # Validation functions
│   │   │   ├── item.validator.js
│   │   │   ├── customer.validator.js
│   │   │   ├── invoice.validator.js
│   │   │   └── ...
│   │   ├── helpers/        # Helper functions
│   │   │   ├── date.helper.js
│   │   │   ├── number.helper.js
│   │   │   ├── string.helper.js
│   │   │   └── ...
│   │   ├── generators/     # Code generators
│   │   │   ├── invoice-number.generator.js
│   │   │   ├── po-number.generator.js
│   │   │   └── ...
│   │   └── formatters/     # Formatters
│   │       ├── date.formatter.js
│   │       ├── currency.formatter.js
│   │       └── ...
│   │
│   ├── validations/        # Validation schemas
│   │   ├── auth.validation.js
│   │   ├── item.validation.js
│   │   ├── customer.validation.js
│   │   ├── invoice.validation.js
│   │   └── ...
│   │
│   ├── migrations/         # Database migrations
│   │   ├── 001_create_users_table.js
│   │   ├── 002_create_items_table.js
│   │   ├── 003_create_customers_table.js
│   │   └── ...
│   │
│   ├── seeds/              # Database seeds
│   │   ├── users.seed.js
│   │   ├── roles.seed.js
│   │   └── ...
│   │
│   ├── tests/              # Backend tests
│   │   ├── unit/           # Unit tests
│   │   │   ├── services/
│   │   │   ├── controllers/
│   │   │   └── utils/
│   │   ├── integration/    # Integration tests
│   │   │   ├── api/
│   │   │   └── database/
│   │   └── e2e/            # End-to-end tests
│   │
│   ├── app.js              # Express app setup
│   └── server.js           # Server entry point
│
├── uploads/                # Uploaded files
│   ├── images/             # Item images
│   ├── documents/          # Documents
│   └── exports/            # Exported files
│
├── logs/                   # Log files
│   ├── app.log
│   ├── error.log
│   └── audit.log
│
├── .env                    # Environment variables (not in git)
├── .env.example            # Example environment variables
├── package.json            # Backend dependencies
├── package-lock.json       # Lock file
└── README.md               # Backend README
```

---

## 3. Frontend Structure

```
frontend/
├── public/                 # Public assets
│   ├── favicon.ico
│   ├── logo.png
│   └── index.html
│
├── src/
│   ├── assets/             # Static assets
│   │   ├── images/         # Images
│   │   ├── icons/          # Icons
│   │   ├── fonts/          # Fonts
│   │   └── styles/         # Global styles
│   │
│   ├── components/         # Reusable components
│   │   ├── common/         # Common components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Table/
│   │   │   ├── Modal/
│   │   │   ├── Card/
│   │   │   ├── Loading/
│   │   │   └── ...
│   │   ├── layout/         # Layout components
│   │   │   ├── Header/
│   │   │   ├── Sidebar/
│   │   │   ├── Footer/
│   │   │   └── Layout/
│   │   └── forms/          # Form components
│   │       ├── FormInput/
│   │       ├── FormSelect/
│   │       ├── FormDatePicker/
│   │       └── ...
│   │
│   ├── pages/              # Page components
│   │   ├── auth/           # Authentication pages
│   │   │   ├── Login/
│   │   │   └── Register/
│   │   ├── dashboard/      # Dashboard
│   │   │   └── Dashboard.jsx
│   │   ├── items/          # Item pages
│   │   │   ├── ItemList/
│   │   │   ├── ItemDetail/
│   │   │   └── ItemForm/
│   │   ├── customers/      # Customer pages
│   │   │   ├── CustomerList/
│   │   │   ├── CustomerDetail/
│   │   │   └── CustomerForm/
│   │   ├── suppliers/      # Supplier pages
│   │   │   ├── SupplierList/
│   │   │   ├── SupplierDetail/
│   │   │   └── SupplierForm/
│   │   ├── purchase-orders/ # PO pages
│   │   │   ├── POList/
│   │   │   ├── PODetail/
│   │   │   └── POForm/
│   │   ├── sales-orders/   # SO pages
│   │   │   ├── SOList/
│   │   │   ├── SODetail/
│   │   │   └── SOForm/
│   │   ├── invoices/       # Invoice pages
│   │   │   ├── SalesInvoiceList/
│   │   │   ├── SalesInvoiceDetail/
│   │   │   ├── SalesInvoiceForm/
│   │   │   ├── PurchaseInvoiceList/
│   │   │   ├── PurchaseInvoiceDetail/
│   │   │   └── PurchaseInvoiceForm/
│   │   ├── accounts-receivable/ # AR pages
│   │   │   ├── ARList/
│   │   │   ├── AgingReport/
│   │   │   └── PaymentEntry/
│   │   ├── accounts-payable/ # AP pages
│   │   │   ├── APList/
│   │   │   ├── AgingReport/
│   │   │   └── PaymentEntry/
│   │   ├── inventory/      # Inventory pages
│   │   │   ├── StockList/
│   │   │   ├── StockMovement/
│   │   │   └── StockAdjustment/
│   │   ├── reports/        # Report pages
│   │   │   ├── SalesReport/
│   │   │   ├── PurchaseReport/
│   │   │   ├── InventoryReport/
│   │   │   └── FinancialReport/
│   │   └── settings/       # Settings pages
│   │       ├── CompanySettings/
│   │       ├── UserManagement/
│   │       └── SystemSettings/
│   │
│   ├── contexts/           # React contexts
│   │   ├── AuthContext.jsx # Authentication context
│   │   ├── ThemeContext.jsx # Theme context
│   │   └── NotificationContext.jsx # Notification context
│   │
│   ├── hooks/              # Custom hooks
│   │   ├── useAuth.js      # Authentication hook
│   │   ├── useApi.js       # API hook
│   │   ├── useTable.js     # Table hook
│   │   └── ...
│   │
│   ├── services/           # API services
│   │   ├── api/            # API client
│   │   │   ├── axios.js    # Axios configuration
│   │   │   └── interceptors.js # Request/response interceptors
│   │   ├── auth.service.js # Authentication service
│   │   ├── item.service.js # Item service
│   │   ├── customer.service.js # Customer service
│   │   ├── supplier.service.js # Supplier service
│   │   ├── po.service.js   # PO service
│   │   ├── so.service.js   # SO service
│   │   ├── invoice.service.js # Invoice service
│   │   ├── payment.service.js # Payment service
│   │   ├── inventory.service.js # Inventory service
│   │   └── report.service.js # Report service
│   │
│   ├── store/              # State management (Redux/Zustand)
│   │   ├── slices/         # Redux slices
│   │   │   ├── auth.slice.js
│   │   │   ├── item.slice.js
│   │   │   ├── customer.slice.js
│   │   │   └── ...
│   │   ├── store.js        # Store configuration
│   │   └── ...
│   │
│   ├── utils/              # Utility functions
│   │   ├── validators/     # Validation functions
│   │   ├── formatters/     # Formatting functions
│   │   ├── helpers/        # Helper functions
│   │   └── constants/      # Constants
│   │
│   ├── routes/             # Route configuration
│   │   ├── AppRoutes.jsx   # Main routes
│   │   ├── PrivateRoute.jsx # Private route wrapper
│   │   └── PublicRoute.jsx # Public route wrapper
│   │
│   ├── styles/             # Global styles
│   │   ├── variables.css   # CSS variables
│   │   ├── global.css      # Global styles
│   │   └── themes/         # Theme styles
│   │
│   ├── App.jsx             # Main App component
│   └── index.js            # Entry point
│
├── .env                    # Environment variables
├── .env.example            # Example environment variables
├── package.json            # Frontend dependencies
├── package-lock.json       # Lock file
├── vite.config.js          # Vite configuration (or webpack.config.js)
└── README.md               # Frontend README
```

---

## 4. Mobile Structure (Optional)

```
mobile/
├── src/
│   ├── components/         # Reusable components
│   ├── screens/            # Screen components
│   ├── navigation/         # Navigation configuration
│   ├── services/           # API services
│   ├── store/              # State management
│   ├── utils/              # Utility functions
│   └── App.js              # Main App component
│
├── assets/                 # Assets
│   ├── images/
│   └── fonts/
│
├── .env                    # Environment variables
├── package.json            # Mobile dependencies
└── README.md               # Mobile README
```

---

## 5. Documentation Structure

```
docs/
├── api/                    # API documentation
│   ├── authentication.md
│   ├── items.md
│   ├── customers.md
│   ├── invoices.md
│   └── ...
│
├── guides/                 # User guides
│   ├── getting-started.md
│   ├── user-guide.md
│   └── admin-guide.md
│
├── architecture/           # Architecture documentation
│   ├── system-design.md
│   ├── database-design.md
│   └── security.md
│
└── deployment/             # Deployment documentation
    ├── setup.md
    ├── deployment.md
    └── maintenance.md
```

---

## 6. Scripts Structure

```
scripts/
├── setup.sh                # Setup script
├── migrate.sh              # Migration script
├── seed.sh                 # Seed script
├── backup.sh               # Backup script
├── deploy.sh               # Deployment script
└── ...
```

---

## 7. Tests Structure

```
tests/
├── unit/                   # Unit tests
├── integration/            # Integration tests
├── e2e/                    # End-to-end tests
├── fixtures/               # Test fixtures
└── helpers/                # Test helpers
```

---

## 8. Key Files Description

### 8.1 Backend Key Files
- `server.js` - Server entry point
- `app.js` - Express app configuration
- `config/database.js` - Database configuration
- `config/auth.js` - Authentication configuration
- `models/` - Database models
- `controllers/` - Request handlers
- `services/` - Business logic
- `routes/` - API routes
- `middleware/` - Middleware functions

### 8.2 Frontend Key Files
- `src/App.jsx` - Main App component
- `src/index.js` - Entry point
- `src/routes/AppRoutes.jsx` - Route configuration
- `src/services/api/` - API client
- `src/store/` - State management
- `src/components/` - Reusable components
- `src/pages/` - Page components

### 8.3 Configuration Files
- `.env` - Environment variables (not in git)
- `.env.example` - Example environment variables
- `package.json` - Dependencies
- `.gitignore` - Git ignore rules
- `docker-compose.yml` - Docker configuration

---

## 9. Naming Conventions

### 9.1 Files and Folders
- **Backend**: camelCase for files (e.g., `userController.js`)
- **Frontend**: PascalCase for components (e.g., `UserList.jsx`)
- **Folders**: kebab-case or camelCase (e.g., `purchase-orders/` or `purchaseOrders/`)

### 9.2 Code
- **Variables**: camelCase (e.g., `userName`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **Classes**: PascalCase (e.g., `UserController`)
- **Functions**: camelCase (e.g., `getUserById`)

---

## 10. Environment Variables

### 10.1 Backend (.env)
```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=antariksa_accounting
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASSWORD=your_password
```

### 10.2 Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Antariksa Accounting
VITE_APP_VERSION=1.0.0
```

---

**Document Status**: Draft  
**Last Updated**: [Current Date]






