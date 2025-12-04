    # Antariksa Accounting - Development Plan

## 1. Executive Summary

This document outlines the comprehensive development plan for the Antariksa Accounting software. The project will be developed in phases using an Agile methodology, with a focus on security, scalability, and user experience.

**Project Duration**: 6-9 months (estimated)  
**Development Methodology**: Agile/Scrum  
**Team Size**: 3-5 developers (recommended)  
**Technology Stack**: Modern web stack (TBD based on team expertise)

---

## 1.1 Current Database Status

### ✅ Completed
- **Phase 1.3**: Core Auth & Tenant Tables (Tenant, TenantSetting, Role, Permission, RolePermission, User, UserSession)
- **Phase 2**: Master Data tables (Items, Categories, Customers, Suppliers, Addresses)
- **Phase 3**: Inventory tables (InventoryLocation, ItemInventory, StockMovement) - **CORE COMPLETE**
- **RLS**: Enabled on all tenant tables with policies
- **Database Roles**: app_user, app_readonly, app_admin created
- **Migrations**: Prisma migrations configured and working
- **Indexes**: All tenant_id indexes added

### 📋 Planned (Step-by-Step by Phase)
- **Phase 4-5**: Order tables (Purchase Orders, Sales Orders)
- **Phase 6**: Invoice tables (Sales & Purchase Invoices)
- **Phase 7**: Payment tables
- **Phase 8+**: Audit logs, reports, etc.

### 🎯 Next Steps
1. ✅ Phase 3 Core Complete - Inventory management foundation ready
2. Proceed to Phase 4: Purchase Orders (will integrate with inventory)
3. Proceed to Phase 5: Sales Orders (will integrate with inventory)

---

## 2. Technology Stack Selection

### 2.1 Frontend
**Recommended Options**:
- **React** (Recommended)
  - Large ecosystem
  - Strong community support
  - Component reusability
  - Good mobile responsiveness
- **Vue.js** (Alternative)
  - Easier learning curve
  - Good documentation
- **Angular** (Alternative)
  - Enterprise-grade
  - Strong TypeScript support

**Frontend Tools**:
- **State Management**: Redux Toolkit or Zustand
- **UI Framework**: Material-UI, Ant Design, or Tailwind CSS
- **Form Handling**: React Hook Form or Formik
- **HTTP Client**: Axios
- **Routing**: React Router
- **Build Tool**: Vite or Create React App

### 2.2 Backend
**Recommended Options**:
- **Node.js with Express** (Recommended)
  - JavaScript/TypeScript consistency
  - Large ecosystem
  - Fast development
- **Python with FastAPI/Django** (Alternative)
  - Strong data processing
  - Good for reports
- **Java with Spring Boot** (Alternative)
  - Enterprise-grade
  - Strong security

**Backend Tools**:
- **ORM**: Prisma, Sequelize, or TypeORM (for Node.js)
- **Validation**: Joi or Zod
- **Authentication**: JWT, Passport.js
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest, Mocha, or Supertest

### 2.3 Database
- **PostgreSQL** (Recommended)
  - Row-Level Security (RLS) support
  - Strong ACID compliance
  - Excellent for multi-tenant
- **MySQL** (Alternative)
  - Widely used
  - Good performance

**Database Tools**:
- **Migrations**: Knex.js, Prisma Migrate, or Sequelize
- **Connection Pooling**: PgBouncer (PostgreSQL)
- **Backup**: pg_dump or automated backup scripts

### 2.4 Infrastructure
- **Hosting**: AWS, Azure, or Google Cloud Platform
- **Containerization**: Docker
- **CI/CD**: GitHub Actions, GitLab CI, or Jenkins
- **Monitoring**: Sentry, DataDog, or New Relic
- **Logging**: Winston, Pino, or CloudWatch

### 2.5 Development Tools
- **Version Control**: Git (GitHub/GitLab)
- **Project Management**: Jira, Trello, or GitHub Projects
- **Communication**: Slack, Discord, or Microsoft Teams
- **Documentation**: Markdown, Confluence, or Notion

---

## 3. Development Methodology

### 3.1 Agile/Scrum Approach
- **Sprint Duration**: 2 weeks
- **Daily Standups**: 15 minutes
- **Sprint Planning**: Beginning of each sprint
- **Sprint Review**: End of each sprint
- **Retrospective**: End of each sprint

### 3.2 Workflow
1. **Backlog Refinement**: Prioritize and estimate tasks
2. **Sprint Planning**: Select tasks for sprint
3. **Development**: Code, test, review
4. **Sprint Review**: Demo completed work
5. **Retrospective**: Improve process

### 3.3 Git Workflow
- **Branch Strategy**: Git Flow or GitHub Flow
- **Main Branches**:
  - `main` - Production-ready code
  - `develop` - Integration branch
  - `feature/*` - Feature branches
  - `bugfix/*` - Bug fix branches
  - `release/*` - Release preparation

### 3.4 Code Review Process
- All code must be reviewed before merging
- Minimum 1 reviewer approval required
- Automated tests must pass
- Code quality checks (ESLint, Prettier)

---

## 4. Development Phases

### Phase 1: Project Setup & Foundation (Weeks 1-2)

#### 1.1 Project Initialization
- [ ] Set up repository (Git)
- [ ] Initialize project structure
- [ ] Set up development environment
- [ ] Configure IDE/Editor settings
- [ ] Set up code quality tools (ESLint, Prettier)
- [ ] Create initial documentation

#### 1.2 Technology Stack Setup
- [ ] Choose and set up frontend framework
- [ ] Choose and set up backend framework
- [ ] Set up database (PostgreSQL)
- [ ] Configure development environment
- [ ] Set up Docker (if using)
- [ ] Set up CI/CD pipeline (basic)

#### 1.3 Database Setup ✅ COMPLETE
- [x] Create database schema (from DB.md) - **COMPLETE: Phase 1.3 foundation tables done**
  - ✅ Tenant, TenantSetting, Role, Permission, RolePermission, User, UserSession
  - ✅ Master data tables (Items, Categories, Customers, Suppliers) - **Phase 2 COMPLETE**
  - ✅ Inventory tables (InventoryLocation, ItemInventory, StockMovement) - **Phase 3 CORE COMPLETE**
  - 📋 Order tables (PO, SO) - **Phase 4-5**
  - 📋 Invoice tables - **Phase 6**
  - 📋 Payment tables - **Phase 7**
  - 📋 Audit logs
- [x] Set up migrations - **DONE: Prisma migrations configured and working**
- [x] Configure Row-Level Security (RLS) - **DONE: RLS enabled on all tenant tables**
  - ✅ RLS enabled on: TenantSetting, Role, User, UserSession, InventoryLocation, ItemInventory, StockMovement
  - ✅ RLS policies created for tenant isolation
  - ✅ RLS function `get_current_tenant_id()` created
  - ✅ Migration: `20251130103832_enable_rls_and_policies`
  - ✅ Inventory RLS: Applied via `apply-inventory-rls.ts` script
- [x] Add missing indexes on tenant_id columns - **DONE: All tenant_id indexes added**
  - ✅ Migration: `20251130103625_add_tenant_id_indexes`
- [x] Create database roles (app_user, app_readonly, app_admin) - **DONE: Roles created and tested**
  - ✅ Script: `backend/prisma/scripts/create_database_roles.sql`
  - ✅ Roles created: app_user, app_readonly, app_admin
  - ✅ Permissions granted and tested
  - ✅ Application using app_user role successfully
- [ ] Set up backup strategy - **TODO: Production setup**
- [x] Test database connection - **DONE: Prisma Studio available**

#### 1.4 Authentication & Authorization Foundation ✅ COMPLETE
- [x] Implement user registration - **DONE: POST /api/auth/register endpoint**
  - ✅ Admin-created user registration
  - ✅ Password hashing with bcrypt
  - ✅ Input validation with Zod
  - ✅ Tenant isolation enforced
- [x] Implement login/logout - **DONE: POST /api/auth/login and POST /api/auth/logout**
  - ✅ JWT token generation on login
  - ✅ Session management in database
  - ✅ Logout invalidates session
  - ✅ GET /api/auth/me endpoint for current user
- [x] Implement JWT token generation - **DONE: JWT utility created**
  - ✅ Token generation with configurable expiration
  - ✅ Token verification middleware
  - ✅ Token extraction from Authorization header
- [x] Implement password hashing (bcrypt) - **DONE: Password utility created**
  - ✅ bcrypt with 10 salt rounds
  - ✅ Password hashing and verification functions
- [ ] Create role-based access control (RBAC) - **TODO: Phase 2 - Authorization middleware**
  - 📋 Permission checking middleware
  - 📋 Role-based route protection
- [x] Implement tenant context middleware - **DONE: Updated to use JWT**
  - ✅ Middleware: `backend/src/middleware/tenantContext.ts`
  - ✅ Extracts tenant ID from JWT token (Priority 1)
  - ✅ Falls back to `x-tenant-id` header (Priority 2)
  - ✅ Sets `app.current_tenant_id` for RLS filtering
  - ✅ JWT integration complete
- [x] Test tenant isolation - **DONE: All tests passing**
  - ✅ Test script: `backend/src/scripts/test-tenant-isolation.ts`
  - ✅ Verified: Tenants cannot see each other's data
  - ✅ RLS filtering working correctly

**Deliverables**:
- ✅ Working project structure
- ✅ Database with RLS enabled and tested
- ✅ Basic authentication system (COMPLETE)
  - ✅ User registration API
  - ✅ Login/logout API
  - ✅ JWT token generation
  - ✅ Password hashing
  - ✅ Authentication middleware
- ✅ Tenant isolation working and verified

---

### Phase 2: Master Data Management (Weeks 3-5)

**Recommended Implementation Order:**
1. **2.3 Item Master Data** (Start here - Foundation for all other features)
2. **2.4 Customer Management** (Needed for Sales Orders)
3. **2.5 Supplier Management** (Needed for Purchase Orders)
4. **2.2 User Management** (Can be done in parallel - Builds on Phase 1.4)
5. **2.1 Tenant Management** (Admin features - Can be done later)

---

#### 2.3 Item Master Data ⭐ **START HERE**
**Priority: HIGH** - Foundation for Inventory, Orders, Invoices

**Phase 2.3.1: Database & Basic CRUD** ✅ COMPLETE
- [x] Create Item table schema (Prisma)
- [x] Create Category table schema (hierarchical)
- [x] Add RLS policies for Item and Category
- [x] Run migrations (db push completed)
- [x] Category CRUD operations (simple, no dependencies)
- [x] Item CRUD operations (depends on categories)
- [x] Test basic CRUD with Postman

**Phase 2.3.2: Search & Filtering** ✅ COMPLETE
- [x] Item search by code, name, brand, barcode, model number, description
- [x] Filter by category, status, price range (minPrice, maxPrice)
- [x] Advanced filtering (multiple criteria combined)
- [x] Category tree/hierarchy display (GET /api/categories?tree=true)
- [x] All features tested and working

**Phase 2.3.3: Advanced Features** ⏸️ DEFERRED
- [ ] Item images upload (deferred - can be done later)
- [ ] Item documents upload (deferred - can be done later)
- [ ] Bulk import/export (CSV/Excel) (deferred - can be done later)
- [ ] Item variants support (size, color, etc.) (deferred - can be done later)
- [ ] Unit of measurement management (deferred - can be done later)

---

#### 2.4 Customer Management
**Priority: HIGH** - Needed for Sales Orders (Phase 5)

**Phase 2.4.1: Database & Basic CRUD** ✅ COMPLETE
- [x] Create Customer table schema (Prisma)
- [x] Create CustomerAddress table schema
- [x] Add RLS policies
- [x] Run migrations (db push completed)
- [x] Customer CRUD operations
- [x] Customer address management (multiple addresses)
- [x] Test with Postman - All tests passing

**Phase 2.4.2: Search & Organization** ✅ COMPLETE
- [x] Customer search and filtering (by code, name, email, phone)
- [x] Filter by customerType and status
- [ ] Customer groups (deferred - can be done later)
- [ ] Customer import/export (deferred - can be done later)

**Phase 2.4.3: Advanced Features** ⏸️ DEFERRED
- [ ] Customer dashboard (orders, invoices summary) - Phase 5-6
- [ ] Customer credit limit management - Basic CRUD done, advanced features later
- [ ] Payment terms management - Basic CRUD done, advanced features later

---

#### 2.5 Supplier Management
**Priority: HIGH** - Needed for Purchase Orders (Phase 4)

**Phase 2.5.1: Database & Basic CRUD** ✅ COMPLETE
- [x] Create Supplier table schema (Prisma)
- [x] Create SupplierAddress table schema
- [x] Add RLS policies
- [x] Run migrations (db push completed)
- [x] Supplier CRUD operations
- [x] Supplier address management (multiple addresses)
- [x] Test with Postman - All tests passing

**Phase 2.5.2: Search & Organization** ✅ COMPLETE
- [x] Supplier search and filtering (by code, name, email, phone)
- [x] Filter by supplierType and status
- [ ] Supplier groups (deferred - can be done later)
- [ ] Supplier import/export (deferred - can be done later)

**Phase 2.5.3: Advanced Features** ⏸️ DEFERRED
- [ ] Supplier dashboard (POs, invoices summary) - Phase 4-6
- [ ] Payment terms management - Basic CRUD done, advanced features later
- [ ] Bank account management (encrypted) - Basic CRUD done, encryption can be added later

---

#### 2.2 User Management
**Priority: MEDIUM** - Can be done in parallel with 2.3/2.4/2.5
**Builds on Phase 1.4 Authentication**

**Phase 2.2.1: Basic CRUD** ✅ COMPLETE
- [x] User list/read operations (GET endpoints)
- [x] User update operations (PUT/PATCH)
- [x] User delete operations (soft delete)
- [x] User profile management (self-update, password change)
- [x] Test with Postman - Ready for testing

**Phase 2.2.2: Role & Permission Management** ✅ COMPLETE
- [x] Role CRUD operations
- [x] Permission management (GET all permissions)
- [x] Role-permission assignment
- [ ] Role-based access control (RBAC) middleware - **DEFERRED: Can be added later when needed**

**Phase 2.2.3: Advanced Features** ⏸️ DEFERRED
- [ ] Password reset functionality - Can be done later
- [ ] Email verification - Can be done later
- [ ] User activity logging - Can be done later
- [ ] User preferences/settings - Can be done later

---

#### 2.1 Tenant Management
**Priority: LOW** - Admin/Super-admin features, can be done later

**Phase 2.1.1: Basic Features** ✅ COMPLETE
- [x] Create tenant registration (super-admin only) - **Already exists in auth/register**
- [x] Implement tenant settings CRUD - **Full CRUD for tenant settings**
- [x] Tenant status management - **Update tenant status, subscription tier**

**Phase 2.1.2: Advanced Features** ⏸️ DEFERRED
- [ ] Create tenant admin dashboard - **UI feature, can be done later**
- [ ] Implement tenant switching (if multi-tenant UI) - **UI feature, can be done later**
- [ ] Tenant subscription management - **Basic status management done, advanced features later**
- [ ] Tenant usage analytics - **Can be done later**

**Deliverables**:
- ✅ Item Master Data (Foundation) - Items, Categories, Search/Filter
- ✅ Customer Management - Customers, Addresses, Groups
- ✅ Supplier Management - Suppliers, Addresses, Groups
- ✅ User Management - CRUD, Roles, Permissions
- ✅ Tenant Management - Settings, Admin Dashboard
- All CRUD operations working
- Search and filtering functional
- Import/export working (where applicable)

**Implementation Strategy**:
1. **Start with 2.3 (Items)** - Foundation for everything else
2. **Then 2.4 (Customers)** - Needed for Sales Orders
3. **Then 2.5 (Suppliers)** - Needed for Purchase Orders
4. **Parallel 2.2 (Users)** - Can be done alongside others
5. **Later 2.1 (Tenants)** - Admin features, less critical

---

### Phase 3: Inventory Management (Weeks 6-7)

**Recommended Implementation Order:**
1. **3.1 Inventory Locations** (Foundation - needed for all inventory features)
2. **3.2 Item Inventory** (Stock tracking per location)
3. **3.3 Stock Movements** (Audit trail and history)
4. **3.4 Stock Operations** (Adjustments, transfers, stock take)
5. **3.5 Low Stock Alerts** (Monitoring and notifications)
6. **3.6 Inventory Reports** (Stock levels, movements, valuation)

---

#### 3.1 Inventory Locations ⭐ **COMPLETE**
**Priority: HIGH** - Foundation for all inventory features

**Phase 3.1.1: Database & Basic CRUD** ✅ COMPLETE
- [x] Create InventoryLocation table schema (Prisma)
- [x] Add RLS policies for InventoryLocation
- [x] Run migrations (db push completed)
- [x] Location CRUD operations
- [x] Default location management (only one default per tenant)
- [x] Test with test script - All tests passing

**Phase 3.1.2: Search & Organization** ✅ COMPLETE
- [x] Location search and filtering
- [x] Filter by status (active/inactive)
- [x] Location code validation (unique per tenant)

**Deliverables**:
- ✅ Inventory locations CRUD working
- ✅ Default location management
- ✅ Search and filtering functional

---

#### 3.2 Item Inventory ✅ **COMPLETE**
**Priority: HIGH** - Core stock tracking functionality

**Phase 3.2.1: Database & Basic CRUD** ✅ COMPLETE
- [x] Create ItemInventory table schema (Prisma)
- [x] Add RLS policies for ItemInventory
- [x] Unique constraint: (tenantId, itemId, locationId)
- [x] Run migrations (db push completed)
- [x] Item inventory CRUD operations
- [x] Available quantity calculation (quantity - reserved_quantity)
- [x] Test with test script - All tests passing

**Phase 3.2.2: Stock Queries** ✅ COMPLETE
- [x] Get stock by item (across all locations)
- [x] Get stock by location
- [x] Get stock by item and location
- [x] Total stock calculation (sum across locations)
- [x] Stock level filtering (low stock, out of stock)

**Deliverables**:
- ✅ Item inventory CRUD working
- ✅ Stock queries functional
- ✅ Available quantity calculation working

---

#### 3.3 Stock Movements ✅ **COMPLETE**
**Priority: HIGH** - Audit trail for all stock changes

**Phase 3.3.1: Database & Basic CRUD** ✅ COMPLETE
- [x] Create StockMovement table schema (Prisma)
- [x] Add RLS policies for StockMovement
- [x] Run migrations (db push completed)
- [x] Stock movement creation (automatic on stock changes)
- [x] Movement history queries
- [x] Test with test script - All tests passing

**Phase 3.3.2: Movement Types & Tracking** ✅ COMPLETE
- [x] Movement types: INBOUND, OUTBOUND, ADJUSTMENT, TRANSFER, DAMAGE
- [x] Quantity tracking (before, after, change)
- [x] Reference tracking (invoice, PO, SO, adjustment ID)
- [x] Cost tracking (cost per unit, total cost)
- [x] User tracking (created_by)

**Phase 3.3.3: Movement Queries** ✅ COMPLETE
- [x] Get movements by item
- [x] Get movements by location
- [x] Get movements by date range
- [x] Get movements by reference (PO, SO, invoice)
- [x] Movement history queries (API endpoints ready)

**Deliverables**:
- ✅ Stock movements logging working
- ✅ All movement types supported
- ✅ Movement history queries functional

---

#### 3.4 Stock Operations ✅ **COMPLETE** (Core Features)
**Priority: MEDIUM** - Advanced inventory operations

**Phase 3.4.1: Stock Adjustments** ✅ COMPLETE
- [x] Manual stock adjustment (increase/decrease)
- [x] Adjustment reason codes
- [x] Adjustment creates stock movement
- [x] Update item inventory on adjustment
- [ ] Adjustment approval workflow - **DEFERRED: Can be added later if needed**

**Phase 3.4.2: Stock Transfers** ✅ COMPLETE
- [x] Transfer stock between locations
- [x] Transfer creates two movements (outbound from source, inbound to destination)
- [x] Update both source and destination inventory
- [x] Transfer validation (sufficient stock at source)
- [x] Transfer history (via stock movements API)

**Phase 3.4.3: Stock Take / Physical Count** ⏸️ **DEFERRED**
- [ ] Stock take creation (snapshot of current stock) - **DEFERRED: Can be done later**
- [ ] Physical count entry - **DEFERRED: Can be done later**
- [ ] Variance calculation (counted vs system) - **DEFERRED: Can be done later**
- [ ] Stock take approval - **DEFERRED: Can be done later**
- [ ] Auto-adjustment from stock take - **DEFERRED: Can be done later**

**Deliverables**:
- ✅ Stock adjustments working
- ✅ Stock transfers working
- ⏸️ Stock take functionality - **DEFERRED: Can be implemented later when needed**

---

#### 3.5 Low Stock Alerts ⏸️ **DEFERRED** (Basic Detection Available)
**Priority: MEDIUM** - Proactive inventory management

**Phase 3.5.1: Alert Configuration** ⏸️ **DEFERRED**
- [x] Set minimum stock level per item/location - **DONE: Fields exist in ItemInventory**
- [x] Set reorder point per item/location - **DONE: Fields exist in ItemInventory**
- [x] Set maximum stock level per item/location - **DONE: Fields exist in ItemInventory**
- [ ] Alert threshold configuration UI - **DEFERRED: UI feature, can be done later**

**Phase 3.5.2: Alert Detection** ✅ **PARTIAL**
- [x] Check stock levels against thresholds - **DONE: lowStock filter in inventory queries**
- [x] Identify low stock items - **DONE: Query filter available**
- [x] Identify items at reorder point - **DONE: Query filter available**
- [ ] Real-time alert notifications - **DEFERRED: Can be done later**

**Phase 3.5.3: Alert Reporting** ⏸️ **DEFERRED**
- [ ] Low stock alert report - **DEFERRED: Can be done later**
- [ ] Reorder point report - **DEFERRED: Can be done later**
- [ ] Overstock report - **DEFERRED: Can be done later**
- [ ] Alert dashboard - **DEFERRED: UI feature, can be done later**

**Deliverables**:
- ✅ Low stock detection working (via query filters)
- ✅ Reorder point tracking (fields available)
- ⏸️ Alert reports - **DEFERRED: Can be added later**

---

#### 3.6 Inventory Reports ⏸️ **DEFERRED** (Query Endpoints Available)
**Priority: MEDIUM** - Business intelligence

**Phase 3.6.1: Stock Level Reports** ⏸️ **DEFERRED**
- [x] Stock level queries - **DONE: GET /api/inventory endpoints available**
- [ ] Formatted stock level report - **DEFERRED: Can be done later**
- [ ] Stock summary report - **DEFERRED: Can be done later**
- [ ] Zero stock report - **DEFERRED: Can be done later**
- [ ] Stock by location report - **DEFERRED: Can be done later**

**Phase 3.6.2: Stock Movement Reports** ⏸️ **DEFERRED**
- [x] Stock movement history queries - **DONE: GET /api/stock-movements endpoints available**
- [ ] Formatted movement history report - **DEFERRED: Can be done later**
- [ ] Movement summary by type - **DEFERRED: Can be done later**
- [x] Movement by date range - **DONE: Query filter available**
- [x] Movement by item/location - **DONE: Query endpoints available**

**Phase 3.6.3: Stock Valuation Reports** ⏸️ **DEFERRED**
- [ ] Stock valuation report (using purchase price) - **DEFERRED: Can be done later**
- [ ] Valuation by location - **DEFERRED: Can be done later**
- [ ] Valuation by category - **DEFERRED: Can be done later**
- [ ] Cost analysis report - **DEFERRED: Can be done later**

**Deliverables**:
- ✅ All inventory query endpoints working
- ✅ Report filtering available via API
- ⏸️ Formatted reports - **DEFERRED: Can be added later when needed**

---

**Phase 3 Summary Deliverables**:
- ✅ Complete inventory management system (Core Features)
- ✅ Real-time stock tracking per location
- ✅ Stock movement history and audit trail
- ✅ Stock operations (adjustments, transfers)
- ✅ Low stock detection (via query filters)
- ✅ Inventory query endpoints (reports can be built from these)
- ⏸️ Stock take/physical count - **DEFERRED: Can be added later**
- ⏸️ Formatted inventory reports - **DEFERRED: Can be added later**
- ⏸️ Real-time alert notifications - **DEFERRED: Can be added later**

**Phase 3 Status**: ✅ **CORE COMPLETE** - Ready for Phase 4 (Purchase Orders)

---

### Phase 4: Purchase Orders (Weeks 8-9)

#### 4.1 Purchase Order Creation (Backend APIs & Data Model) ✅ **COMPLETE (Backend)**
- [x] **4.1.1 Database & Prisma Models**
  - [x] Add `PurchaseOrder` and `PurchaseOrderLine` models to `schema.prisma` (aligned with `DB.md` design)
  - [x] Ensure all tenant-specific fields include `tenantId` and proper indexes (tenant + code/number)
  - [x] Add soft-delete support (`deletedAt`) for `PurchaseOrder`
  - [x] Sync Prisma schema to database for Purchase Orders (`prisma db push`)
  - [ ] Update `DB.md` implementation status for Purchase Orders (Phase 4) ⏸️ **DEFERRED**
  - [x] Ensure RLS policies are created for `PurchaseOrder` and `PurchaseOrderLine` (tenant isolation)
  - [x] Verify `PurchaseOrder` and `PurchaseOrderLine` use `get_current_tenant_id()` in policies (via RLS scripts)

- [x] **4.1.2 Business Rules & Numbering**
  - [x] Define PO number format (e.g. `PO-YYYYMM-#####` per-tenant sequence)
  - [x] Implement deterministic PO number generation in service layer (transaction-safe, tenant-scoped)
  - [x] Define allowed PO statuses: `DRAFT`, `SENT`, `CONFIRMED`, `PARTIALLY_RECEIVED`, `COMPLETED`, `CANCELLED`
  - [ ] Enforce full status transitions (e.g. SENT → CONFIRMED workflow) ⏸️ **DEFERRED**
  - [x] Record `createdBy` / `updatedAt` auditing fields

- [x] **4.1.3 Validation & DTOs**
  - [x] Create Zod validator for Purchase Order create inputs (`purchaseOrder.validator.ts`)
  - [x] Validate tenant-owned foreign keys: `supplierId`, `shippingAddressId`, `billingAddressId`
  - [x] Validate line items: `itemId`, quantities, unit prices, discounts, tax, line totals
  - [x] Calculate financial totals on the backend (subtotal, discount, tax, shipping, grandTotal)
  - [x] Normalize codes and currency (uppercase, consistent decimals)

- [x] **4.1.4 Service Layer (Domain Logic)**
  - [x] Create `purchaseOrder.service.ts` with core operations:
    - [x] `createPurchaseOrder(tenantId, userId, input)` – create header + lines in a single transaction
    - [x] Internal helpers for number generation and totals calculation
  - [x] Ensure Prisma calls always set `app.current_tenant_id` for RLS
  - [x] Enforce multi-tenant checks on all related entities (supplier, addresses, items)
  - [x] (No stock changes yet – GRN will handle stock in 4.3)

- [x] **4.1.5 Controller & Routes**
  - [x] Create `purchaseOrder.controller.ts` with `createPurchaseOrder` handler
  - [x] Create `purchaseOrder.routes.ts` with route group `/api/purchase-orders`
  - [x] Wire routes into main Express app (`server.ts`)
  - [x] Protect routes with `auth.middleware` and tenant context middleware
  - [x] Add list/detail/update/cancel endpoints in 4.2 (shared route group)

- [x] **4.1.6 API Documentation & Testing**
  - [x] Update `API.md` with `/api/purchase-orders` endpoints (create, list, get by id, update, cancel)
  - [x] Document request/response schemas, validation errors, and security headers
  - [ ] Create Postman/curl examples for PO creation ⏸️ **DEFERRED**
  - [x] Manually test PO creation end-to-end (test script: `backend/src/scripts/test-purchase-orders.ts`)
  - [x] Update `development-checklist.md` for Phase 4.1 backend completion

#### 4.2 Purchase Order Management ✅ **COMPLETE (Backend APIs)**
- [x] **4.2.1 Purchase Order Listing & Filtering (Backend APIs)**
  - [x] Implement `GET /api/purchase-orders` endpoint with pagination
  - [x] Support filters: `status`, `supplierId`, `fromDate`, `toDate`, `search` (poNumber, supplier code/name)
  - [x] Ensure queries are tenant-scoped (RLS + `tenantId` where filters)
  - [x] Return summary rows with supplier info and totals

- [x] **4.2.2 Purchase Order Detail View (Backend API)**
  - [x] Implement `GET /api/purchase-orders/:id` endpoint
  - [x] Include header + lines, supplier (code/name), and item (code/name) per line
  - [x] Return `404` if PO not found or not in current tenant

- [x] **4.2.3 Edit Draft Purchase Order**
  - [x] Implement `PUT /api/purchase-orders/:id` to edit only when status is `DRAFT`
  - [x] Allow updating header fields (dates, addresses, paymentTerms, notes)
  - [x] Allow replacing full line set (lines array) with same validation as create
  - [x] Recalculate totals on the backend after update
  - [x] Enforce status guard: reject edits for non-`DRAFT` POs

- [x] **4.2.4 Cancel Purchase Order**
  - [x] Implement `POST /api/purchase-orders/:id/cancel` endpoint
  - [x] Allow cancellation only from `DRAFT`, `SENT`, `CONFIRMED`
  - [x] Prevent cancellation when status is `PARTIALLY_RECEIVED`, `COMPLETED`, or already `CANCELLED`
  - [x] Optionally accept `reason` and append/store in `notes`
  - [x] No inventory changes yet (stock handled in 4.3 GRN)

 - [x] **4.2.5 Documentation & Testing**
  - [x] Update `API.md` with list/detail/update/cancel PO endpoints
  - [x] Document status rules for editing and cancellation
  - [x] Add examples of common filters for PO listing
  - [x] Manually test list/detail/update/cancel flows with test script (`backend/src/scripts/test-purchase-orders-management.ts`)

#### 4.3 Goods Receipt Note (GRN)
- [x] **4.3.1 GRN Backend Model & API (Core)**
  - [x] Design GRN flow: receive against Purchase Orders, update PO line quantities, and adjust inventory
  - [ ] (Optional) Add dedicated GoodsReceipt tables in Prisma ⏸️ **DEFERRED: Can be added later if document history is needed**
  - [x] Reuse existing `StockMovement` with `referenceType = 'purchase_order'` for receipt audit trail
  - [x] Use `PurchaseOrderLine.quantityReceived` as cumulative received quantity

- [x] **4.3.2 GRN Creation from Purchase Order**
  - [x] Implement `POST /api/purchase-orders/:id/grn` endpoint
  - [x] Request accepts receipt lines with `purchaseOrderLineId`, `quantityReceived`, optional `locationId`, and `grnDate`
  - [x] Validate PO exists, belongs to tenant, and is not cancelled
  - [x] Validate each PO line belongs to PO and tenant, and that cumulative received quantity does not exceed ordered quantity

- [x] **4.3.3 Inventory & Stock Movements Integration**
  - [x] For each received line, update `PurchaseOrderLine.quantityReceived`
  - [x] Determine receipt location (from `locationId` or default location)
  - [x] Increase item inventory at the receipt location
  - [x] Create `StockMovement` records with `movementType = INBOUND`, `referenceType = 'purchase_order'`, `referenceId = purchaseOrderId`
  - [x] If all lines fully received, set PO status to `COMPLETED`; if partially, set to `PARTIALLY_RECEIVED`

- [ ] **4.3.4 GRN History & Printing**
  - [ ] GRN printing / PDF output ⏸️ **DEFERRED**
  - [ ] GRN list/detail endpoints for document history ⏸️ **DEFERRED: Can be added later using `StockMovement` and PO data**

- [x] **4.3.5 Documentation & Testing**
  - [x] Update `API.md` with GRN endpoint, payload, and side effects on PO and inventory
  - [x] Update `development-checklist.md` for 4.3 GRN backend completion
  - [x] Add GRN test script to verify partial/complete receipts, PO status changes, inventory updates, and stock movements

#### 4.4 PO Reports ✅ **COMPLETE (Backend APIs)**
- [x] **4.4.1 PO Status Report (Backend API)**
  - [x] Implement `GET /api/purchase-orders/reports/status` endpoint
  - [x] Group POs by status with counts and total amounts
  - [x] Support date range filtering (`fromDate`, `toDate`)
  - [x] Return summary with total count and grand total

- [x] **4.4.2 PO vs Receipt Report (Backend API)**
  - [x] Implement `GET /api/purchase-orders/reports/po-vs-receipt` endpoint
  - [x] Show ordered vs received quantities per PO and line item
  - [x] Calculate receipt percentages at PO and line level
  - [x] Support date range and supplier filtering
  - [x] Return summary with overall receipt statistics

- [x] **4.4.3 Documentation & Testing**
  - [x] Update `API.md` with report endpoints and response schemas
  - [x] Update `development-checklist.md` for 4.4 completion
  - [x] Add test script to verify report functionality (`backend/src/scripts/test-po-reports.ts`)

- [ ] **4.4.4 Formatted Reports & Export** ⏸️ **DEFERRED**
  - [ ] PDF export for reports - **DEFERRED: Can be added later**
  - [ ] Excel/CSV export - **DEFERRED: Can be added later**
  - [ ] Report templates/customization - **DEFERRED: Can be added later**

**Deliverables**:
- ✅ Backend PO creation and management APIs (4.1 & 4.2)
- ✅ GRN functionality with inventory integration (4.3)
- ✅ PO reports APIs (4.4) - Status report and PO vs Receipt report
- ✅ Stock integration ready (Inventory & StockMovement APIs available for GRN)
- ⏸️ Formatted reports (PDF/Excel export) - **DEFERRED to future phases**

---

### Phase 5: Sales Orders (Weeks 10-11)

#### 5.1 Sales Order Creation (Backend APIs & Data Model) ✅ **COMPLETE (Backend)**
- [x] **5.1.1 Database & Prisma Models**
  - [x] Add `SalesOrder` and `SalesOrderLine` models to `schema.prisma` (aligned with `DB.md` design)
  - [x] Ensure all tenant-specific fields include `tenantId` and proper indexes (tenant + code/number)
  - [x] Add soft-delete support (`deletedAt`) for `SalesOrder`
  - [x] Sync Prisma schema to database for Sales Orders (`prisma db push`)
  - [x] Ensure RLS policies are created for `SalesOrder` and `SalesOrderLine` (tenant isolation)
  - [x] Verify `SalesOrder` and `SalesOrderLine` use `get_current_tenant_id()` in policies (via RLS scripts)

- [x] **5.1.2 Business Rules & Numbering**
  - [x] Define SO number format (e.g. `SO-YYYYMM-#####` per-tenant sequence)
  - [x] Implement deterministic SO number generation in service layer (transaction-safe, tenant-scoped)
  - [x] Define allowed SO statuses: `DRAFT`, `CONFIRMED`, `PARTIALLY_DELIVERED`, `COMPLETED`, `CANCELLED`
  - [x] Record `createdBy` / `updatedAt` auditing fields

- [x] **5.1.3 Validation & DTOs**
  - [x] Create Zod validator for Sales Order create inputs (`salesOrder.validator.ts`)
  - [x] Validate tenant-owned foreign keys: `customerId`, `shippingAddressId`, `billingAddressId`
  - [x] Validate line items: `itemId`, quantities, unit prices, discounts, tax, line totals
  - [x] Calculate financial totals on the backend (subtotal, discount, tax, shipping, grandTotal)
  - [x] Normalize codes and currency (uppercase, consistent decimals)

- [x] **5.1.4 Service Layer (Domain Logic)**
  - [x] Create `salesOrder.service.ts` with core operations:
    - [x] `createSalesOrder(tenantId, userId, input)` – create header + lines in a single transaction
    - [x] Internal helpers for number generation and totals calculation
  - [x] Ensure Prisma calls always set `app.current_tenant_id` for RLS
  - [x] Enforce multi-tenant checks on all related entities (customer, addresses, items)
  - [x] (No stock changes yet – Delivery Note will handle stock in 5.3)

- [x] **5.1.5 Controller & Routes**
  - [x] Create `salesOrder.controller.ts` with `createSalesOrder` handler
  - [x] Create `salesOrder.routes.ts` with route group `/api/sales-orders`
  - [x] Wire routes into main Express app (`server.ts`)
  - [x] Protect routes with `auth.middleware` and tenant context middleware

- [x] **5.1.6 API Documentation & Testing**
  - [x] Update `API.md` with `/api/sales-orders` endpoints (create, list, get by id, update, cancel)
  - [x] Document request/response schemas, validation errors, and security headers
  - [x] Manually test SO creation end-to-end (test script: `backend/src/scripts/test-sales-orders.ts`)
  - [x] Update `development-checklist.md` for Phase 5.1 backend completion

#### 5.2 Sales Order Management ✅ **COMPLETE (Backend APIs)**
- [x] **5.2.1 Sales Order Listing & Filtering (Backend APIs)**
  - [x] Implement `GET /api/sales-orders` endpoint with pagination
  - [x] Support filters: `status`, `customerId`, `fromDate`, `toDate`, `search` (soNumber, customer code/name)
  - [x] Ensure queries are tenant-scoped (RLS + `tenantId` where filters)
  - [x] Return summary rows with customer info and totals

- [x] **5.2.2 Sales Order Detail View (Backend API)**
  - [x] Implement `GET /api/sales-orders/:id` endpoint
  - [x] Include header + lines, customer (code/name), and item (code/name) per line
  - [x] Return `404` if SO not found or not in current tenant

- [x] **5.2.3 Edit Draft Sales Order**
  - [x] Implement `PUT /api/sales-orders/:id` to edit only when status is `DRAFT`
  - [x] Allow updating header fields (dates, addresses, paymentTerms, notes)
  - [x] Allow replacing full line set (lines array) with same validation as create
  - [x] Recalculate totals on the backend after update
  - [x] Enforce status guard: reject edits for non-`DRAFT` SOs

- [x] **5.2.4 Cancel Sales Order**
  - [x] Implement `POST /api/sales-orders/:id/cancel` endpoint
  - [x] Allow cancellation only from `DRAFT`, `CONFIRMED`
  - [x] Prevent cancellation when status is `PARTIALLY_DELIVERED`, `COMPLETED`, or already `CANCELLED`
  - [x] Optionally accept `reason` and append/store in `notes`
  - [x] No inventory changes yet (stock handled in 5.3 Delivery Note)

- [x] **5.2.5 Documentation & Testing**
  - [x] Update `API.md` with list/detail/update/cancel SO endpoints
  - [x] Document status rules for editing and cancellation
  - [x] Add examples of common filters for SO listing
  - [x] Manually test list/detail/update/cancel flows with test script

#### 5.3 Delivery Note ✅ **COMPLETE (Backend)**
- [x] **5.3.1 DN Backend Model & API (Core)**
  - [x] Design DN flow: deliver against Sales Orders, update SO line quantities, and adjust inventory
  - [x] Reuse existing `StockMovement` with `referenceType = 'sales_order'` for delivery audit trail
  - [x] Use `SalesOrderLine.quantityDelivered` as cumulative delivered quantity

- [x] **5.3.2 DN Creation from Sales Order**
  - [x] Implement `POST /api/sales-orders/:id/delivery-note` endpoint
  - [x] Request accepts delivery lines with `salesOrderLineId`, `quantityDelivered`, optional `locationId`, and `deliveryDate`
  - [x] Validate SO exists, belongs to tenant, and is not cancelled
  - [x] Validate each SO line belongs to SO and tenant, and that cumulative delivered quantity does not exceed ordered quantity
  - [x] Validate sufficient stock available before delivery

- [x] **5.3.3 Inventory & Stock Movements Integration**
  - [x] For each delivered line, update `SalesOrderLine.quantityDelivered`
  - [x] Determine delivery location (from `locationId` or default location)
  - [x] Decrease item inventory at the delivery location (outbound movement)
  - [x] Create `StockMovement` records with `movementType = OUTBOUND`, `referenceType = 'sales_order'`, `referenceId = salesOrderId`
  - [x] If all lines fully delivered, set SO status to `COMPLETED`; if partially, set to `PARTIALLY_DELIVERED`

- [ ] **5.3.4 DN History & Printing**
  - [ ] DN printing / PDF output ⏸️ **DEFERRED**
  - [ ] DN list/detail endpoints for document history ⏸️ **DEFERRED: Can be added later using `StockMovement` and SO data**

- [x] **5.3.5 Documentation & Testing**
  - [x] Update `API.md` with DN endpoint, payload, and side effects on SO and inventory
  - [x] Update `development-checklist.md` for 5.3 DN backend completion
  - [x] Add DN test script to verify partial/complete deliveries, SO status changes, inventory updates, and stock movements

#### 5.4 SO Reports ✅ **COMPLETE (Backend APIs)**
- [x] **5.4.1 SO Status Report (Backend API)**
  - [x] Implement `GET /api/sales-orders/reports/status` endpoint
  - [x] Group SOs by status with counts and total amounts
  - [x] Support date range filtering (`fromDate`, `toDate`)
  - [x] Return summary with total count and grand total

- [x] **5.4.2 SO vs Delivery Report (Backend API)**
  - [x] Implement `GET /api/sales-orders/reports/so-vs-delivery` endpoint
  - [x] Show ordered vs delivered quantities per SO and line item
  - [x] Calculate delivery percentages at SO and line level
  - [x] Support date range and customer filtering
  - [x] Return summary with overall delivery statistics

- [x] **5.4.3 Documentation & Testing**
  - [x] Update `API.md` with report endpoints and response schemas
  - [x] Update `development-checklist.md` for 5.4 completion
  - [x] Add test script to verify report functionality

- [ ] **5.4.4 Formatted Reports & Export** ⏸️ **DEFERRED**
  - [ ] PDF export for reports - **DEFERRED: Can be added later**
  - [ ] Excel/CSV export - **DEFERRED: Can be added later**
  - [ ] Report templates/customization - **DEFERRED: Can be added later**

**Deliverables**:
- ✅ Backend SO creation and management APIs (5.1 & 5.2)
- ✅ Delivery Note functionality with inventory integration (5.3)
- ✅ SO reports APIs (5.4) - Status report and SO vs Delivery report
- ✅ Stock integration ready (Inventory & StockMovement APIs available for DN)
- ⏸️ Formatted reports (PDF/Excel export) - **DEFERRED to future phases**

---

### Phase 6: Invoicing System (Weeks 12-14)

#### 6.1 Sales Invoicing (Backend APIs & Data Model) ✅ **COMPLETE (Backend)**
- [x] **6.1.1 Database & Prisma Models**
  - [x] Add `SalesInvoice` and `SalesInvoiceLine` models to `schema.prisma` (aligned with `DB.md` design)
  - [x] Ensure all tenant-specific fields include `tenantId` and proper indexes (tenant + invoice_number)
  - [x] Add soft-delete support (`deletedAt`) for `SalesInvoice`
  - [x] Sync Prisma schema to database for Sales Invoices (`prisma db push`)
  - [x] Ensure RLS policies are created for `SalesInvoice` and `SalesInvoiceLine` (tenant isolation)
  - [x] Verify `SalesInvoice` and `SalesInvoiceLine` use `get_current_tenant_id()` in policies (via RLS scripts)

- [x] **6.1.2 Business Rules & Numbering**
  - [x] Define Sales Invoice number format (e.g. `SI-YYYYMM-#####` per-tenant sequence)
  - [x] Implement deterministic invoice number generation in service layer (transaction-safe, tenant-scoped)
  - [x] Define allowed invoice statuses: `DRAFT`, `SENT`, `PAID`, `PARTIALLY_PAID`, `OVERDUE`, `CANCELLED`
  - [x] Record `createdBy` / `updatedAt` auditing fields
  - [x] Calculate `balanceDue` = `grandTotal` - `amountPaid`

- [x] **6.1.3 Validation & DTOs**
  - [x] Create Zod validator for Sales Invoice create inputs (`salesInvoice.validator.ts`)
  - [x] Validate tenant-owned foreign keys: `customerId`, `salesOrderId` (optional), addresses
  - [x] Validate line items: optional `itemId`, quantities, unit prices, discounts, tax, line totals
  - [x] Calculate financial totals on the backend (subtotal, discount, tax, shipping, grandTotal)
  - [x] Normalize codes and currency (uppercase, consistent decimals)

- [x] **6.1.4 Service Layer (Domain Logic)**
  - [x] Create `salesInvoice.service.ts` with core operations:
    - [x] `createSalesInvoice(tenantId, userId, input)` – create header + lines in a single transaction
    - [x] Internal helpers for number generation and totals calculation
  - [x] Ensure Prisma calls always set `app.current_tenant_id` for RLS
  - [x] Enforce multi-tenant checks on all related entities (customer, sales order, addresses, items)

- [x] **6.1.5 Controller & Routes**
  - [x] Create `salesInvoice.controller.ts` with `createSalesInvoice` handler
  - [x] Create `salesInvoice.routes.ts` with route group `/api/sales-invoices`
  - [x] Wire routes into main Express app (`server.ts`)
  - [x] Protect routes with `auth.middleware` and tenant context middleware

- [x] **6.1.6 API Documentation & Testing**
  - [x] Update `API.md` with `/api/sales-invoices` endpoints (create, list, get by id, update, cancel)
  - [x] Document request/response schemas, validation errors, and security headers
  - [x] Manually test Sales Invoice creation end-to-end (test script: `backend/src/scripts/test-sales-invoices.ts`)
  - [x] Update `development-checklist.md` for Phase 6.1 backend completion

#### 6.2 Purchase Invoicing (Backend APIs & Data Model) ✅ **COMPLETE (Backend)**
- [x] **6.2.1 Database & Prisma Models**
  - [x] Add `PurchaseInvoice` and `PurchaseInvoiceLine` models to `schema.prisma` (aligned with `DB.md` design)
  - [x] Ensure all tenant-specific fields include `tenantId` and proper indexes (tenant + invoice_number)
  - [x] Add soft-delete support (`deletedAt`) for `PurchaseInvoice`
  - [x] Sync Prisma schema to database for Purchase Invoices (`prisma db push`)
  - [x] Ensure RLS policies are created for `PurchaseInvoice` and `PurchaseInvoiceLine` (tenant isolation)
  - [x] Verify `PurchaseInvoice` and `PurchaseInvoiceLine` use `get_current_tenant_id()` in policies (via RLS scripts)

- [x] **6.2.2 Business Rules & Numbering**
  - [x] Purchase Invoice number is user-provided (supplier invoice number) - must be unique per tenant
  - [x] Validate invoice number uniqueness on create/update
  - [x] Define allowed invoice statuses: `DRAFT`, `RECEIVED`, `APPROVED`, `PAID`, `PARTIALLY_PAID`, `OVERDUE`, `CANCELLED`
  - [x] Record `createdBy`, `approvedBy`, `approvedAt` auditing fields
  - [x] Calculate `balanceDue` = `grandTotal` - `amountPaid`

- [x] **6.2.3 Validation & DTOs**
  - [x] Create Zod validator for Purchase Invoice create inputs (`purchaseInvoice.validator.ts`)
  - [x] Validate tenant-owned foreign keys: `supplierId`, `purchaseOrderId` (optional), addresses
  - [x] Validate line items: optional `itemId`, quantities received, unit costs, discounts, tax, line totals
  - [x] Calculate financial totals on the backend (subtotal, discount, tax, shipping, grandTotal)
  - [x] Normalize codes and currency (uppercase, consistent decimals)

- [x] **6.2.4 Service Layer (Domain Logic)**
  - [x] Create `purchaseInvoice.service.ts` with core operations:
    - [x] `createPurchaseInvoice(tenantId, userId, input)` – create header + lines in a single transaction
    - [x] Internal helpers for totals calculation
    - [x] `approvePurchaseInvoice(tenantId, userId, id)` – approve invoice (DRAFT/RECEIVED → APPROVED)
  - [x] Ensure Prisma calls always set `app.current_tenant_id` for RLS
  - [x] Enforce multi-tenant checks on all related entities (supplier, purchase order, addresses, items)

- [x] **6.2.5 Controller & Routes**
  - [x] Create `purchaseInvoice.controller.ts` with `createPurchaseInvoice` and `approvePurchaseInvoice` handlers
  - [x] Create `purchaseInvoice.routes.ts` with route group `/api/purchase-invoices`
  - [x] Wire routes into main Express app (`server.ts`)
  - [x] Protect routes with `auth.middleware` and tenant context middleware

- [x] **6.2.6 API Documentation & Testing**
  - [x] Update `API.md` with `/api/purchase-invoices` endpoints (create, list, get by id, update, approve, cancel)
  - [x] Document request/response schemas, validation errors, and security headers
  - [x] Manually test Purchase Invoice creation end-to-end (test script: `backend/src/scripts/test-purchase-invoices.ts`)
  - [x] Update `development-checklist.md` for Phase 6.2 backend completion

#### 6.3 Invoice Management ✅ **COMPLETE (Backend APIs)**
- [x] **6.3.1 Sales Invoice Listing & Filtering (Backend APIs)**
  - [x] Implement `GET /api/sales-invoices` endpoint with pagination
  - [x] Support filters: `status`, `customerId`, `fromDate`, `toDate`, `search` (invoiceNumber, customer code/name)
  - [x] Ensure queries are tenant-scoped (RLS + `tenantId` where filters)
  - [x] Return summary rows with customer info and totals

- [x] **6.3.2 Sales Invoice Detail View (Backend API)**
  - [x] Implement `GET /api/sales-invoices/:id` endpoint
  - [x] Include header + lines, customer (code/name), sales order (if linked), and item (code/name) per line
  - [x] Return `404` if invoice not found or not in current tenant

- [x] **6.3.3 Edit Draft Sales Invoice**
  - [x] Implement `PUT /api/sales-invoices/:id` to edit only when status is `DRAFT`
  - [x] Allow updating header fields (dates, addresses, paymentTerms, notes, termsConditions)
  - [x] Allow replacing full line set (lines array) with same validation as create
  - [x] Recalculate totals and balanceDue on the backend after update
  - [x] Enforce status guard: reject edits for non-`DRAFT` invoices

- [x] **6.3.4 Cancel Sales Invoice**
  - [x] Implement `POST /api/sales-invoices/:id/cancel` endpoint
  - [x] Allow cancellation only from `DRAFT`, `SENT`, `PARTIALLY_PAID`, `OVERDUE`
  - [x] Prevent cancellation when status is `PAID` or already `CANCELLED`
  - [x] Optionally accept `reason` and append/store in `notes`

- [x] **6.3.5 Purchase Invoice Listing & Filtering (Backend APIs)**
  - [x] Implement `GET /api/purchase-invoices` endpoint with pagination
  - [x] Support filters: `status`, `supplierId`, `fromDate`, `toDate`, `search` (invoiceNumber, supplier code/name)
  - [x] Ensure queries are tenant-scoped (RLS + `tenantId` where filters)
  - [x] Return summary rows with supplier info and totals

- [x] **6.3.6 Purchase Invoice Detail View (Backend API)**
  - [x] Implement `GET /api/purchase-invoices/:id` endpoint
  - [x] Include header + lines, supplier (code/name), purchase order (if linked), and item (code/name) per line
  - [x] Return `404` if invoice not found or not in current tenant

- [x] **6.3.7 Edit Draft Purchase Invoice**
  - [x] Implement `PUT /api/purchase-invoices/:id` to edit only when status is `DRAFT`
  - [x] Allow updating header fields (invoiceNumber, dates, addresses, paymentTerms, notes)
  - [x] Allow replacing full line set (lines array) with same validation as create
  - [x] Recalculate totals and balanceDue on the backend after update
  - [x] Enforce status guard: reject edits for non-`DRAFT` invoices
  - [x] Validate invoice number uniqueness if being changed

- [x] **6.3.8 Approve Purchase Invoice**
  - [x] Implement `POST /api/purchase-invoices/:id/approve` endpoint
  - [x] Allow approval only from `DRAFT` or `RECEIVED` status
  - [x] Set status to `APPROVED` and record `approvedBy` and `approvedAt`

- [x] **6.3.9 Cancel Purchase Invoice**
  - [x] Implement `POST /api/purchase-invoices/:id/cancel` endpoint
  - [x] Allow cancellation only from `DRAFT`, `RECEIVED`, `APPROVED`, `PARTIALLY_PAID`, `OVERDUE`
  - [x] Prevent cancellation when status is `PAID` or already `CANCELLED`
  - [x] Optionally accept `reason` and append/store in `notes`

- [x] **6.3.10 Documentation & Testing**
  - [x] Update `API.md` with all invoice management endpoints
  - [x] Document status rules for editing, approval, and cancellation
  - [x] Add examples of common filters for invoice listing
  - [x] Manually test list/detail/update/cancel/approve flows with test scripts

#### 6.4 Invoice Reports ✅ **COMPLETE (Backend APIs)**
- [x] **6.4.1 Sales Invoice Status Report (Backend API)**
  - [x] Implement `GET /api/sales-invoices/reports/status` endpoint
  - [x] Group invoices by status with counts, total amounts, total paid, and total outstanding
  - [x] Support date range filtering (`fromDate`, `toDate`)
  - [x] Return summary with total count, total amount, total paid, and total outstanding

- [x] **6.4.2 Purchase Invoice Status Report (Backend API)**
  - [x] Implement `GET /api/purchase-invoices/reports/status` endpoint
  - [x] Group invoices by status with counts, total amounts, total paid, and total outstanding
  - [x] Support date range filtering (`fromDate`, `toDate`)
  - [x] Return summary with total count, total amount, total paid, and total outstanding

- [x] **6.4.3 Documentation & Testing**
  - [x] Update `API.md` with report endpoints and response schemas
  - [x] Update `development-checklist.md` for 6.4 completion
  - [x] Add test script to verify report functionality

- [ ] **6.4.4 Formatted Reports & Export** ⏸️ **DEFERRED**
  - [ ] PDF export for invoices - **DEFERRED: Can be added later**
  - [ ] Excel/CSV export - **DEFERRED: Can be added later**
  - [ ] Invoice templates/customization - **DEFERRED: Can be added later**
  - [ ] Email sending - **DEFERRED: Can be added later**

**Deliverables**:
- ✅ Backend Sales Invoice creation and management APIs (6.1 & 6.3)
- ✅ Backend Purchase Invoice creation and management APIs (6.2 & 6.3)
- ✅ Invoice approval workflow for purchase invoices (6.3.8)
- ✅ Invoice reports APIs (6.4) - Status reports for both sales and purchase invoices
- ⏸️ PDF generation - **DEFERRED to future phases**
- ⏸️ Email integration - **DEFERRED to future phases**

---

### Phase 7: Payments & Financial Management ✅ **COMPLETE (Backend APIs)**

#### 7.1 Payment Processing ✅ **COMPLETE**
- [x] Customer payment entry - **DONE: POST /api/payments with CUSTOMER_PAYMENT type**
- [x] Supplier payment entry - **DONE: POST /api/payments with SUPPLIER_PAYMENT type**
- [x] Payment allocation to invoices - **DONE: Payment allocations to sales/purchase invoices**
- [x] Multiple invoice payment - **DONE: Multiple allocations per payment**
- [x] Partial payment - **DONE: Partial allocations supported**
- [x] Payment methods - **DONE: CASH, BANK_TRANSFER, CHECK, CREDIT_CARD, OTHER**
- [x] Payment approval workflow - **DONE: POST /api/payments/:id/approve**

#### 7.2 Accounts Receivable (AR) ✅ **COMPLETE (Backend APIs)**
- [x] Outstanding invoices list - **DONE: GET /api/payments/ar/outstanding**
- [x] Aging analysis - **DONE: GET /api/payments/ar/aging**
- [ ] AR dashboard - **DEFERRED: UI feature**
- [ ] Customer statements - **DEFERRED: UI feature**
- [ ] Payment history - **DEFERRED: Can use GET /api/payments?customerId=xxx**
- [ ] AR reports - **DEFERRED: UI feature**

#### 7.3 Accounts Payable (AP) ✅ **COMPLETE (Backend APIs)**
- [x] Outstanding invoices list - **DONE: GET /api/payments/ap/outstanding**
- [x] Aging analysis - **DONE: GET /api/payments/ap/aging**
- [ ] AP dashboard - **DEFERRED: UI feature**
- [ ] Supplier statements - **DEFERRED: UI feature**
- [ ] Payment history - **DEFERRED: Can use GET /api/payments?supplierId=xxx**
- [ ] AP reports - **DEFERRED: UI feature**

**Deliverables**:
- ✅ Complete payment system (backend APIs)
- ✅ AR/AP tracking (backend APIs)
- ✅ Aging reports (backend APIs)
- ✅ Payment allocation (backend APIs)
- ⏸️ UI dashboards - **DEFERRED to future phases**

---

### Phase 8: Financial Reports ✅ **COMPLETE (Backend APIs)**

#### 8.1 Sales Reports ✅ **COMPLETE (Backend APIs)**
- [x] **8.1.1 Sales Summary Report (Backend API)**
  - [x] Implement `GET /api/reports/sales/summary` endpoint
  - [x] Group sales by time period (day/week/month/year)
  - [x] Support date range filtering (`fromDate`, `toDate`)
  - [x] Support customer and status filtering
  - [x] Return summary with totals (sales, paid, outstanding, subtotal, discount, tax)
- [x] **8.1.2 Sales Detail Report (Backend API)**
  - [x] Implement `GET /api/reports/sales/detail` endpoint
  - [x] Detailed list of sales invoices with pagination
  - [x] Support filtering by customer, status, invoice ID, date range
  - [x] Include invoice lines with item details
- [x] **8.1.3 Sales by Customer Report (Backend API)**
  - [x] Implement `GET /api/reports/sales/by-customer` endpoint
  - [x] Group sales by customer with totals
  - [x] Support amount filtering (minAmount, maxAmount)
  - [x] Return summary with total customers, invoices, sales, paid, outstanding
- [x] **8.1.4 Sales by Item Report (Backend API)**
  - [x] Implement `GET /api/reports/sales/by-item` endpoint
  - [x] Group sales by item with quantities and totals
  - [x] Support filtering by item, category, quantity range
  - [x] Calculate average prices per item
- [x] **8.1.5 Sales Trend Analysis (Backend API)**
  - [x] Implement `GET /api/reports/sales/trend` endpoint
  - [x] Show sales trends over time (day/week/month/year)
  - [x] Support metrics: amount, count, average
  - [x] Calculate growth rates between periods
- [x] **8.1.6 Documentation & Testing**
  - [x] Update `API.md` with all sales report endpoints
  - [x] Create test script to verify all sales report functionality
  - [x] Update `development-checklist.md` for 8.1 completion

#### 8.2 Purchase Reports ✅ **COMPLETE (Backend APIs)**
- [x] **8.2.1 Purchase Summary Report (Backend API)**
  - [x] Implement `GET /api/reports/purchase/summary` endpoint
  - [x] Group purchases by time period (day/week/month/year)
  - [x] Support date range filtering (`fromDate`, `toDate`)
  - [x] Support supplier and status filtering
  - [x] Return summary with totals (purchases, paid, outstanding, subtotal, discount, tax)
- [x] **8.2.2 Purchase Detail Report (Backend API)**
  - [x] Implement `GET /api/reports/purchase/detail` endpoint
  - [x] Detailed list of purchase invoices with pagination
  - [x] Support filtering by supplier, status, invoice ID, date range
  - [x] Include invoice lines with item details
- [x] **8.2.3 Purchase by Supplier Report (Backend API)**
  - [x] Implement `GET /api/reports/purchase/by-supplier` endpoint
  - [x] Group purchases by supplier with totals
  - [x] Support amount filtering (minAmount, maxAmount)
  - [x] Return summary with total suppliers, invoices, purchases, paid, outstanding
- [x] **8.2.4 Purchase by Item Report (Backend API)**
  - [x] Implement `GET /api/reports/purchase/by-item` endpoint
  - [x] Group purchases by item with quantities and totals
  - [x] Support filtering by item, category, quantity range
  - [x] Calculate average costs per item
- [x] **8.2.5 Documentation & Testing**
  - [x] Update `API.md` with all purchase report endpoints
  - [x] Create test script to verify all purchase report functionality
  - [x] Update `development-checklist.md` for 8.2 completion

#### 8.3 Financial Statements ✅ **COMPLETE (Backend APIs)**
- [x] **8.3.1 Profit & Loss Report (Backend API)**
  - [x] Implement `GET /api/reports/financial/profit-loss` endpoint
  - [x] Calculate revenue (sales), cost of goods sold (purchases), gross profit
  - [x] Calculate taxes and net profit/loss
  - [x] Support grouping by time period (day/week/month/year)
  - [x] Optional detailed breakdown of invoices
- [x] **8.3.2 Balance Sheet Report (Backend API)**
  - [x] Implement `GET /api/reports/financial/balance-sheet` endpoint
  - [x] Calculate assets (cash, accounts receivable)
  - [x] Calculate liabilities (accounts payable)
  - [x] Calculate equity (retained earnings)
  - [x] Balance check: Assets = Liabilities + Equity
  - [x] Support `asOfDate` parameter
- [x] **8.3.3 Cash Flow Report (Backend API)**
  - [x] Implement `GET /api/reports/financial/cash-flow` endpoint
  - [x] Show cash inflows (customer payments) and outflows (supplier payments)
  - [x] Calculate net cash flow
  - [x] Support grouping by time period (day/week/month/year)
  - [x] Optional detailed payment breakdown
- [x] **8.3.4 Trial Balance Report (Backend API)**
  - [x] Implement `GET /api/reports/financial/trial-balance` endpoint
  - [x] Show all account balances (revenue, expenses, assets, liabilities)
  - [x] Calculate total debits and credits
  - [x] Support `asOfDate` parameter
  - [x] Optional filtering of zero balances
- [x] **8.3.5 Documentation & Testing**
  - [x] Update `API.md` with all financial statement endpoints
  - [x] Create test script to verify all financial statement functionality
  - [x] Update `development-checklist.md` for 8.3 completion

#### 8.4 Tax Reports ✅ **COMPLETE (Backend APIs)**
- [x] **8.4.1 Tax Summary Report (Backend API)**
  - [x] Implement `GET /api/reports/tax/summary` endpoint
  - [x] Calculate tax collected (from sales invoices) and tax paid (from purchase invoices)
  - [x] Calculate net tax payable
  - [x] Support filtering by invoice type (SALES, PURCHASE, BOTH)
  - [x] Group tax by tax rate
- [x] **8.4.2 Tax Detail Report (Backend API)**
  - [x] Implement `GET /api/reports/tax/detail` endpoint
  - [x] Detailed list of invoices with tax information
  - [x] Support pagination and filtering by date range, tax rate, invoice type
  - [x] Include invoice lines with tax breakdown
- [x] **8.4.3 Tax by Rate Report (Backend API)**
  - [x] Implement `GET /api/reports/tax/by-rate` endpoint
  - [x] Group tax by tax rate with totals
  - [x] Show tax collected and tax paid per rate
  - [x] Calculate net tax per rate
  - [x] Include invoice counts and amounts per rate
- [x] **8.4.4 Documentation & Testing**
  - [x] Update `API.md` with all tax report endpoints
  - [x] Create test script to verify all tax report functionality
  - [x] Update `development-checklist.md` for 8.4 completion

#### 8.5 Custom Reports ⏸️ **DEFERRED**
- [ ] Report builder - **DEFERRED: UI feature, can be added later**
- [ ] Custom report templates - **DEFERRED: Can be added later**
- [ ] Scheduled reports - **DEFERRED: Can be added later**
- [ ] Report export (PDF, Excel, CSV) - **DEFERRED: Can be added later**

**Deliverables**:
- ✅ Complete reporting system (backend APIs)
- ✅ All financial reports (backend APIs)
- ✅ Sales, Purchase, Financial, and Tax reports (backend APIs)
- ⏸️ Report builder - **DEFERRED to future phases**
- ⏸️ Export functionality (PDF/Excel/CSV) - **DEFERRED to future phases**

---

### Phase 9: Mobile Optimization & UI/UX (Weeks 19-20)

> **Goal**: Build a desktop-first, web-based UI that still feels great on tablets and phones (especially for checking inventory and order status on the go).

#### 9.1 Frontend Foundation & Design System ✅ **IN PROGRESS**
- [x] Choose frontend stack and tooling ✅ **COMPLETE**
  - [x] Framework: React 19 + TypeScript ✅
  - [x] Routing: React Router v7 ✅
  - [x] Styling: Tailwind CSS ✅
  - [x] State Management: Zustand ✅
  - [x] Forms: React Hook Form + Zod ✅
  - [x] HTTP Client: Axios ✅
  - [x] Build Tool: Vite ✅
- [x] Set up project structure ✅ **COMPLETE**
  - [x] React app initialized with Vite
  - [x] TypeScript configuration
  - [x] Tailwind CSS configured
  - [x] Folder structure (layouts, pages, stores, lib)
- [ ] Set up global theming (colors, typography, spacing, light/dark mode ready) ⏳ **IN PROGRESS**
  - [ ] Design tokens configuration (colors, typography, spacing)
  - [ ] Logo integration
  - [ ] Font configuration
  - [ ] Theme provider setup
  - [ ] Dark mode support (ready for implementation)
- [x] Define responsive layout grid & breakpoints ✅ **COMPLETE**
  - [x] Desktop-first layout (≥ 1200px) - Tailwind breakpoints configured
  - [x] Tablet layout (768–1199px) - Responsive utilities ready
  - [x] Mobile layout (≤ 767px) - Mobile drawer navigation implemented
- [x] Build core reusable components ✅ **PARTIAL**
  - [x] Layout shell (DashboardLayout with header, sidebar, content area) ✅
  - [x] Login page with form validation ✅
  - [x] Dashboard page placeholder ✅
  - [ ] Cards, tables, filters, form controls (inputs, selects, date pickers) ⏳ **TODO**
  - [ ] Toasts/notifications, modal dialogs, confirmation prompts ⏳ **TODO**
- [x] Authentication & routing ✅ **COMPLETE**
  - [x] Auth store with Zustand + persistence ✅
  - [x] Protected routes with auth guards ✅
  - [x] API client with JWT interceptors ✅
  - [x] Auto-logout on 401 errors ✅

#### 9.2 Application Shell, Navigation & Auth (Desktop-first) ✅ **PARTIAL**
- [x] Implement authenticated app shell ✅ **COMPLETE**
  - [x] Top bar with user menu ✅
  - [x] Left sidebar navigation (Dashboard, Items, Customers, Suppliers, Inventory, PO, SO, Invoices, Payments, Reports, Settings) ✅
  - [x] Route-level auth guard that checks JWT ✅
  - [ ] Logo/home integration ⏳ **TODO: Waiting for logo asset**
  - [ ] Search functionality ⏳ **TODO**
  - [ ] Notifications dropdown ⏳ **TODO**
- [x] Implement responsive navigation behavior ✅ **COMPLETE**
  - [x] Desktop: persistent sidebar + content ✅
  - [x] Tablet: collapsible sidebar with toggle ✅
  - [x] Mobile: slide-in drawer navigation ✅
- [x] Hook up navigation to existing backend APIs ✅ **PARTIAL**
  - [x] Wire auth flows (login, logout) to backend ✅
  - [x] API client configured with interceptors ✅
  - [ ] Current user endpoint integration ⏳ **TODO: GET /api/auth/me**
  - [ ] Define complete route structure ⏳ **TODO: Add all page routes**

#### 9.3 Core Desktop Dashboards & Key Screens
- [ ] Implement main dashboard page (desktop-first)
  - [ ] Key metrics cards (sales, purchases, AR, AP, inventory, low stock)
  - [ ] Recent activity lists (invoices, orders, payments, stock movements)
  - [ ] Charts using Phase 7–8 report APIs (sales trend, top items, customer sales, inventory status)
- [ ] Implement reusable list/detail patterns
  - [ ] Standard list view: search, filters, pagination, column visibility
  - [ ] Detail view layout with header summary, tabs (Details, Activity/History)
  - [ ] Apply these patterns to at least: Items, Customers, Suppliers, Sales Orders, Purchase Orders, Invoices, Payments
- [ ] Implement quick actions
  - [ ] Global “+ New” menu for creating orders, invoices, payments, and master data
  - [ ] Contextual actions on list rows (view, edit, cancel, approve)

#### 9.4 Mobile-Friendly Experience (Inventory & Order Status)
- [ ] Optimize key flows for mobile usage
  - [ ] Mobile-friendly dashboard with condensed cards and simplified charts
  - [ ] Fast access to “My Orders” and “My Invoices” summaries
  - [ ] One-tap access to low-stock inventory list
- [ ] Mobile navigation patterns
  - [ ] Implement mobile drawer/bottom-nav with shortcuts: Dashboard, Inventory, Orders, Invoices
  - [ ] Ensure all critical views work well in portrait mode
- [ ] Mobile form and table ergonomics
  - [ ] Larger tap targets, proper spacing, and keyboard-aware forms
  - [ ] Column-prioritized mobile tables (important columns visible, others hidden or moved to detail row)

#### 9.5 UI/UX Polish, Performance & Accessibility
- [ ] Loading & empty states
  - [ ] Skeleton loaders for dashboard cards, tables, and charts
  - [ ] Clear empty-state messages with suggested actions (e.g. “No invoices yet – create your first invoice”)
- [ ] Error handling
  - [ ] Global error boundary for unexpected frontend errors
  - [ ] Consistent API error display (inline + toast), including RLS/permission errors
- [ ] Performance & accessibility
  - [ ] Basic code splitting and lazy loading for heavy routes (reports, large tables)
  - [ ] Keyboard navigation support and focus management for dialogs/forms
  - [ ] Color contrast and ARIA attributes for critical components

**Deliverables**:
- ✅ Desktop-first web UI shell with navigation and auth integrated (Phase 9.1-9.2 partial)
- ✅ Theming system with design tokens (Phase 9.1)
- ✅ Testing infrastructure setup (Phase 9.1)
- ⏳ Fully responsive layout (desktop, tablet, mobile) for core screens (Phase 9.3-9.4)
- ⏳ Production-ready dashboard, lists, and detail pages wired to backend APIs (Phase 9.3)
- ⏳ Mobile-friendly flows for checking inventory and order/invoice/payment status (Phase 9.4)
- ⏳ Solid UX foundation: loading states, error handling, and baseline accessibility (Phase 9.5)

**Phase 9 Status**: ✅ **9.1 IN PROGRESS** - Foundation complete, theming system ready, testing setup done

---

### Phase 10: Security Hardening & Testing (Weeks 21-22)

#### 10.1 Security Audit
- [ ] Security vulnerability scan
- [ ] Penetration testing
- [ ] Code security review
- [ ] Database security audit
- [ ] API security testing

#### 10.2 Security Enhancements
- [ ] Implement missing security features
- [ ] Rate limiting
- [ ] Input validation improvements
- [ ] XSS/CSRF protection
- [ ] SQL injection prevention verification

#### 10.3 Testing Strategy ✅ **SETUP COMPLETE**
**Testing Framework**: Vitest + React Testing Library

**Testing Between Phases** (Industry Best Practice):
- [x] Set up testing infrastructure ✅
  - [x] Vitest configured with React Testing Library ✅
  - [x] Test setup files created ✅
  - [x] Coverage reporting configured ✅
- [ ] Unit tests (80%+ coverage target)
  - [ ] Component tests for reusable UI components
  - [ ] Utility function tests
  - [ ] Store/state management tests
- [ ] Integration tests
  - [ ] API integration tests
  - [ ] Form submission flows
  - [ ] Authentication flows
- [ ] End-to-end tests (Phase 10)
  - [ ] Critical user workflows
  - [ ] Cross-browser testing
- [ ] Performance tests (Phase 10)
  - [ ] Load time benchmarks
  - [ ] Bundle size monitoring
- [ ] Security tests (Phase 10)
  - [ ] XSS vulnerability testing
  - [ ] Authentication bypass testing
- [ ] User acceptance testing (UAT) (Phase 10)
  - [ ] Stakeholder review sessions
  - [ ] User feedback collection

**Testing Between Phases Checklist**:
- ✅ After Phase 9.1: Test theme system, logo rendering, responsive breakpoints
- ⏳ After Phase 9.2: Test navigation, auth guards, route protection
- ⏳ After Phase 9.3: Test each page component, form validation, API integration
- ⏳ After Phase 9.4: Test mobile responsiveness, touch interactions
- ⏳ After Phase 9.5: Test error boundaries, loading states, accessibility

**Deliverables**:
- Security-hardened application
- Comprehensive test suite
- UAT completed

---

### Phase 11: Deployment & Launch (Weeks 23-24)

#### 11.1 Pre-Deployment
- [ ] Production environment setup
- [ ] Database migration to production
- [ ] SSL certificates
- [ ] Domain configuration
- [ ] CDN setup
- [ ] Monitoring setup

#### 11.2 Deployment
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Database backup setup
- [ ] Automated deployment pipeline
- [ ] Smoke testing

#### 11.3 Post-Deployment
- [ ] Performance monitoring
- [ ] Error tracking
- [ ] User onboarding
- [ ] Documentation finalization
- [ ] Training materials

**Deliverables**:
- Production deployment
- Monitoring in place
- Documentation complete

---

### Phase 12: Maintenance & Optimization (Ongoing)

#### 12.1 Bug Fixes
- [ ] Bug tracking
- [ ] Priority-based fixes
- [ ] Hotfixes for critical issues

#### 12.2 Performance Optimization
- [ ] Database query optimization
- [ ] Caching implementation
- [ ] API response time optimization
- [ ] Frontend performance optimization

#### 12.3 Feature Enhancements
- [ ] User feedback implementation
- [ ] New feature requests
- [ ] Integration with third-party services

#### 12.4 Regular Maintenance
- [ ] Security updates
- [ ] Dependency updates
- [ ] Database maintenance
- [ ] Backup verification

---

## 5. Team Structure

### 5.1 Recommended Team

#### Option 1: Small Team (3-4 people)
- **1 Full-Stack Developer** (Lead)
  - Backend development
  - Database design
  - DevOps
- **1 Frontend Developer**
  - UI/UX implementation
  - Frontend architecture
- **1 Backend Developer**
  - API development
  - Business logic
- **1 Part-time QA/Designer**
  - Testing
  - UI/UX design

#### Option 2: Medium Team (5-6 people)
- **1 Tech Lead**
  - Architecture decisions
  - Code reviews
  - Team coordination
- **2 Backend Developers**
  - API development
  - Database work
- **2 Frontend Developers**
  - UI implementation
  - User experience
- **1 QA Engineer**
  - Testing
  - Quality assurance

### 5.2 Roles & Responsibilities

**Tech Lead**:
- Architecture decisions
- Code reviews
- Team coordination
- Technical problem-solving

**Backend Developer**:
- API development
- Database design and optimization
- Business logic implementation
- Security implementation

**Frontend Developer**:
- UI/UX implementation
- Component development
- State management
- User experience optimization

**QA Engineer**:
- Test planning
- Test execution
- Bug reporting
- Quality assurance

---

## 6. Milestones & Deliverables

### Milestone 1: Foundation (Week 2)
- ✅ Project setup complete
- ✅ Database schema created (Phase 1.3 foundation tables)
- ✅ Database roles created and configured
- ✅ Row-Level Security (RLS) enabled and tested
- ✅ Tenant context middleware implemented
- ✅ Tenant isolation verified and tested
- ⏳ Authentication working (in progress - Phase 1.4)

### Milestone 2: Master Data (Week 5)
**Implementation Order:**
- ✅ Item Master Data (2.3) - Foundation complete
- ✅ Customer Management (2.4) - CRUD and search working
- ✅ Supplier Management (2.5) - CRUD and search working
- ✅ User Management (2.2) - CRUD, roles, permissions
- ✅ Tenant Management (2.1) - Settings and admin features
- ✅ All CRUD operations working
- ✅ Search and filtering functional
- ✅ Import/export functionality (where applicable)

### Milestone 3: Inventory (Week 7) ✅ **CORE COMPLETE**
- ✅ Inventory management complete (Core features)
- ✅ Stock tracking working
- ✅ Stock movements logging working
- ✅ Stock operations (adjustments, transfers) working
- ⏸️ Inventory reports (query endpoints available, formatted reports deferred)
- ⏸️ Stock take/physical count (deferred)

### Milestone 4: Orders (Week 11)
- ✅ PO workflow complete
- ✅ SO workflow complete
- ✅ Order reports

### Milestone 5: Invoicing (Week 14)
- ✅ Sales invoicing complete
- ✅ Purchase invoicing complete
- ✅ PDF generation working

### Milestone 6: Financial (Week 16)
- ✅ Payment processing
- ✅ AR/AP tracking
- ✅ Financial reports

### Milestone 7: Reports (Week 18)
- ✅ All reports implemented
- ✅ Report builder working
- ✅ Export functionality

### Milestone 8: Mobile & UX (Week 20)
- ✅ Mobile responsive
- ✅ UI/UX improvements
- ✅ Performance optimized

### Milestone 9: Security & Testing (Week 22)
- ✅ Security audit passed
- ✅ All tests passing
- ✅ UAT completed

### Milestone 10: Launch (Week 24)
- ✅ Production deployment
- ✅ Monitoring active
- ✅ Documentation complete

---

## 7. Testing Strategy

### 7.1 Testing Levels

#### Unit Testing
- **Coverage Target**: 80%+
- **Tools**: Jest, Mocha, or similar
- **Focus**: Business logic, utilities, services

#### Integration Testing
- **Focus**: API endpoints, database operations
- **Tools**: Supertest, Postman
- **Coverage**: All API endpoints

#### End-to-End Testing
- **Focus**: User workflows
- **Tools**: Cypress, Playwright, or Selenium
- **Coverage**: Critical user paths

#### Performance Testing
- **Focus**: Response times, load handling
- **Tools**: Apache JMeter, k6
- **Targets**: Meet performance requirements

#### Security Testing
- **Focus**: Vulnerabilities, penetration testing
- **Tools**: OWASP ZAP, Burp Suite
- **Targets**: Zero critical vulnerabilities

### 7.2 Test Plan

**Test Phases**:
1. **Unit Tests**: Continuous during development
2. **Integration Tests**: After each phase
3. **E2E Tests**: Before each release
4. **Performance Tests**: Before production
5. **Security Tests**: Before production

**Test Cases**:
- Functional tests
- Non-functional tests
- Security tests
- Usability tests
- Compatibility tests

---

## 8. Deployment Strategy

### 8.1 Environment Setup

**Environments**:
- **Development**: Local development
- **Staging**: Pre-production testing
- **Production**: Live application

### 8.2 Deployment Process

**Pre-Deployment**:
1. Code review completed
2. All tests passing
3. Security scan passed
4. Performance tests passed
5. Documentation updated

**Deployment Steps**:
1. Backup production database
2. Deploy backend
3. Run database migrations
4. Deploy frontend
5. Verify deployment
6. Monitor for issues

**Post-Deployment**:
1. Smoke testing
2. Monitor error logs
3. Monitor performance
4. User communication

### 8.3 Rollback Plan
- Database rollback scripts
- Application version rollback
- Emergency procedures
- Communication plan

---

## 9. Risk Management

### 9.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Database performance issues | High | Medium | Proper indexing, query optimization, caching |
| Security vulnerabilities | High | Low | Regular security audits, code reviews |
| Third-party service failures | Medium | Low | Fallback mechanisms, error handling |
| Scalability issues | High | Medium | Load testing, horizontal scaling |
| Data loss | Critical | Low | Regular backups, tested recovery |

### 9.2 Project Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Scope creep | High | Medium | Strict change management, prioritization |
| Timeline delays | Medium | Medium | Buffer time, agile methodology |
| Resource unavailability | High | Low | Cross-training, documentation |
| Technology learning curve | Medium | Medium | Training, pair programming |
| Integration challenges | Medium | Medium | Early integration testing |

### 9.3 Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Changing requirements | Medium | Medium | Agile methodology, regular reviews |
| User adoption | Medium | Low | User training, good UX |
| Compliance issues | High | Low | Legal review, compliance checks |

---

## 10. Dependencies & Prerequisites

### 10.1 Technical Dependencies
- Database server (PostgreSQL)
- Application server
- Web server
- SSL certificates
- Domain name
- Cloud hosting account

### 10.2 Third-Party Services
- Email service (SendGrid, AWS SES)
- Payment gateway (if needed)
- File storage (AWS S3, Azure Blob)
- Monitoring service (Sentry, DataDog)

### 10.3 Development Tools
- Code editor/IDE
- Version control (Git)
- Project management tool
- Communication tool

---

## 11. Success Metrics

### 11.1 Technical Metrics
- **Performance**: < 2s page load, < 1s API response
- **Uptime**: > 99.9%
- **Test Coverage**: > 80%
- **Security**: Zero critical vulnerabilities
- **Code Quality**: Maintainable, documented

### 11.2 Business Metrics
- **User Adoption**: Target users actively using
- **User Satisfaction**: > 90% satisfaction
- **Error Rate**: < 0.1%
- **Feature Usage**: Core features used regularly

---

## 12. Communication Plan

### 12.1 Team Communication
- **Daily Standups**: 15 minutes
- **Sprint Planning**: 2 hours every 2 weeks
- **Sprint Review**: 1 hour every 2 weeks
- **Retrospective**: 1 hour every 2 weeks

### 12.2 Stakeholder Communication
- **Weekly Status Updates**: Progress report
- **Monthly Reviews**: Demo and feedback
- **Milestone Reports**: Detailed milestone completion

### 12.3 Documentation
- **Code Documentation**: Inline comments, README
- **API Documentation**: Swagger/OpenAPI
- **User Documentation**: User guides, help docs
- **Technical Documentation**: Architecture, design decisions

---

## 13. Budget Estimation

### 13.1 Development Costs
- **Team Salaries**: Based on team size and duration
- **Infrastructure**: Cloud hosting, databases
- **Tools & Services**: Development tools, third-party services
- **Training**: Team training if needed

### 13.2 Ongoing Costs
- **Hosting**: Monthly cloud costs
- **Monitoring**: Monitoring service costs
- **Backup Storage**: Backup storage costs
- **Maintenance**: Ongoing development and support

---

## 14. Timeline Summary

| Phase | Duration | Weeks |
|-------|----------|-------|
| Phase 1: Foundation | 2 weeks | 1-2 |
| Phase 2: Master Data | 3 weeks | 3-5 |
| Phase 3: Inventory | 2 weeks | 6-7 |
| Phase 4: Purchase Orders | 2 weeks | 8-9 |
| Phase 5: Sales Orders | 2 weeks | 10-11 |
| Phase 6: Invoicing | 3 weeks | 12-14 |
| Phase 7: Payments | 2 weeks | 15-16 |
| Phase 8: Reports | 2 weeks | 17-18 |
| Phase 9: Mobile & UX | 2 weeks | 19-20 |
| Phase 10: Security & Testing | 2 weeks | 21-22 |
| Phase 11: Deployment | 2 weeks | 23-24 |
| **Total** | **24 weeks** | **~6 months** |

**Note**: Timeline may vary based on team size, experience, and requirements changes.

---

## 15. Next Steps

### Immediate Actions
1. **Review and approve** this development plan
2. **Finalize technology stack** decisions
3. **Assemble development team**
4. **Set up development environment**
5. **Begin Phase 1**: Project Setup & Foundation

### Preparation
1. **Review all documentation** (Requirements, Features, DB, UI)
2. **Set up project management** tool
3. **Create project repository**
4. **Schedule kickoff meeting**
5. **Define sprint schedule**

---

## 16. Appendix

### 16.1 Tools & Resources
- **Project Management**: Jira, Trello, GitHub Projects
- **Design**: Figma, Adobe XD
- **Documentation**: Markdown, Confluence, Notion
- **Communication**: Slack, Discord, Teams

### 16.2 Learning Resources
- Framework documentation
- Security best practices
- Database optimization guides
- Testing best practices

### 16.3 Reference Documents
- Requirements.md
- Features.md
- DB.md
- UI-Navigation.md
- Folder-Structure.md

---

**Document Status**: Draft  
**Last Updated**: [Current Date]  
**Next Review**: Before project kickoff

---

## 17. Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | [Current Date] | Initial development plan |



