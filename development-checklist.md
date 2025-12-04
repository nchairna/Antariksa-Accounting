# Development Checklist - Antariksa Accounting

This document tracks the progress of development tasks as they are completed.

---

## Phase 1: Project Setup & Foundation

### ✅ 1.1 Project Initialization
- [x] Set up repository (Git)
- [x] Initialize project structure
- [x] Set up development environment
- [x] Configure IDE/Editor settings
- [x] Set up code quality tools (ESLint, Prettier)
- [x] Create initial documentation

### ✅ 1.2 Technology Stack Setup
- [x] Choose and set up frontend framework
- [x] Choose and set up backend framework (Node.js + Express + TypeScript)
- [x] Set up database (PostgreSQL)
- [x] Configure development environment
- [ ] Set up Docker (if using)
- [ ] Set up CI/CD pipeline (basic)

### ✅ 1.3 Database Setup - **COMPLETE**

#### Core Tables Created
- [x] Tenant - Multi-tenant core table
- [x] TenantSetting - Tenant-specific settings
- [x] Role - User roles per tenant
- [x] Permission - System permissions
- [x] RolePermission - Role-permission mapping
- [x] User - User accounts with tenant isolation
- [x] UserSession - User session management

#### Migrations
- [x] `20251130102616_init` - Initial schema with all core tables
- [x] `20251130103625_add_tenant_id_indexes` - Added missing tenant_id indexes
- [x] `20251130103832_enable_rls_and_policies` - Enabled RLS and created policies

#### Security Implementation
- [x] Row-Level Security (RLS) enabled on all tenant tables
  - TenantSetting, Role, User, UserSession
- [x] RLS policies created for tenant isolation
  - `tenant_isolation_tenant_setting`
  - `tenant_isolation_role`
  - `tenant_isolation_user`
  - `tenant_isolation_user_session`
- [x] RLS function `get_current_tenant_id()` created
- [x] Database roles created and tested
  - `app_user` - Application role (CRUD access)
  - `app_readonly` - Read-only role
  - `app_admin` - Admin role (migrations/maintenance)
- [x] All tenant_id indexes added
- [x] Unique constraints enforced (tenant-scoped)
- [x] Foreign key constraints in place

#### Testing
- [x] Database connection tested
- [x] Tenant isolation tested and verified
- [x] RLS filtering verified
- [x] All tests passing

### ✅ 1.4 Authentication & Authorization Foundation - **COMPLETE**

#### Completed
- [x] Implement tenant context middleware
  - File: `backend/src/middleware/tenantContext.ts`
  - Extracts tenant ID from JWT token (Priority 1)
  - Falls back to `x-tenant-id` header (Priority 2)
  - Sets `app.current_tenant_id` for RLS filtering
  - Integrated into `server.ts`
  - JWT integration complete
- [x] Test tenant isolation
  - Test script: `backend/src/scripts/test-tenant-isolation.ts`
  - All tests passing
  - Verified: Tenants cannot see each other's data
- [x] Implement user registration
  - File: `backend/src/services/auth.service.ts`, `backend/src/controllers/auth.controller.ts`
  - Endpoint: `POST /api/auth/register`
  - Admin-created user registration
  - Password hashing with bcrypt
  - Input validation with Zod
  - Tenant isolation enforced
- [x] Implement login/logout
  - Endpoints: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
  - JWT token generation on login
  - Session management in database
  - Logout invalidates session
  - All endpoints tested and working
- [x] Implement JWT token generation
  - File: `backend/src/utils/jwt.ts`
  - Token generation with configurable expiration
  - Token verification middleware
  - Token extraction from Authorization header
- [x] Implement password hashing (bcrypt)
  - File: `backend/src/utils/password.ts`
  - bcrypt with 10 salt rounds
  - Password hashing and verification functions
- [x] Upgrade tenant middleware to use JWT tokens
  - Tenant context middleware updated
  - Extracts tenant ID from JWT (Priority 1)
  - Falls back to header (Priority 2)

#### Pending (Future Phases)
- [ ] Create role-based access control (RBAC) - **Phase 2: Authorization middleware**
  - Permission checking middleware
  - Role-based route protection

---

## Phase 2: Master Data Management

### ✅ 2.1 Tenant Management - **COMPLETE**
- [x] Create tenant registration - **DONE: Already exists in auth/register**
- [x] Implement tenant settings - **DONE: Full CRUD for tenant settings**
- [x] Tenant status management - **DONE: Update tenant status, subscription tier**
- [ ] Create tenant admin dashboard - **DEFERRED: UI feature, can be done later**
- [ ] Implement tenant switching (if multi-tenant UI) - **DEFERRED: UI feature, can be done later**

**Completed Files:**
- `backend/src/validators/tenant.validator.ts` - Tenant validation
- `backend/src/services/tenant.service.ts` - Tenant business logic
- `backend/src/controllers/tenant.controller.ts` - Tenant HTTP handlers
- `backend/src/routes/tenant.routes.ts` - Tenant routes
- All endpoints tested and working

### ✅ 2.2 User Management - **COMPLETE**
- [x] User CRUD operations - **DONE: Full CRUD with search/filtering**
- [x] Role management - **DONE: Full CRUD, system role protection**
- [x] Permission management - **DONE: Get all permissions**
- [x] User profile management - **DONE: Self-update profile, change password**
- [ ] Password reset functionality - **DEFERRED: Can be done later**
- [ ] Email verification - **DEFERRED: Can be done later**

**Completed Files:**
- `backend/src/validators/user.validator.ts` - User validation
- `backend/src/services/user.service.ts` - User business logic
- `backend/src/controllers/user.controller.ts` - User HTTP handlers
- `backend/src/routes/user.routes.ts` - User routes
- `backend/src/validators/role.validator.ts` - Role validation
- `backend/src/services/role.service.ts` - Role business logic
- `backend/src/controllers/role.controller.ts` - Role HTTP handlers
- `backend/src/routes/role.routes.ts` - Role routes
- All endpoints tested and working

### ✅ 2.3 Item Master Data - **COMPLETE**
- [x] Item CRUD operations - **DONE: Full CRUD with validation**
- [x] Category management (hierarchical) - **DONE: Parent-child relationships, tree view**
- [x] Item search and filtering - **DONE: Multi-field search, price range, brand, status filters**
- [ ] Item images upload - **DEFERRED: Can be done later**
- [ ] Item documents upload - **DEFERRED: Can be done later**
- [ ] Bulk import/export (CSV/Excel) - **DEFERRED: Can be done later**
- [ ] Item variants support - **DEFERRED: Can be done later**
- [ ] Unit of measurement management - **DEFERRED: Can be done later**

**Completed Files:**
- `backend/src/validators/category.validator.ts` - Category validation
- `backend/src/validators/item.validator.ts` - Item validation
- `backend/src/services/category.service.ts` - Category business logic
- `backend/src/services/item.service.ts` - Item business logic with search/filtering
- `backend/src/controllers/category.controller.ts` - Category HTTP handlers
- `backend/src/controllers/item.controller.ts` - Item HTTP handlers
- `backend/src/routes/category.routes.ts` - Category routes
- `backend/src/routes/item.routes.ts` - Item routes
- Database tables: Category, Item (with RLS)
- All endpoints tested and working

### ✅ 2.4 Customer Management - **COMPLETE**
- [x] Customer CRUD operations - **DONE: Full CRUD with validation**
- [x] Customer address management - **DONE: Multiple addresses per customer, default address support**
- [x] Customer search and filtering - **DONE: Multi-field search, type and status filters**
- [ ] Customer groups - **DEFERRED: Can be done later**
- [ ] Customer import/export - **DEFERRED: Can be done later**
- [ ] Customer dashboard (orders, invoices summary) - **Phase 5-6: Needs Orders/Invoices**

**Completed Files:**
- `backend/src/validators/customer.validator.ts` - Customer and address validation
- `backend/src/services/customer.service.ts` - Customer business logic
- `backend/src/controllers/customer.controller.ts` - Customer HTTP handlers
- `backend/src/routes/customer.routes.ts` - Customer routes
- Database tables: Customer, CustomerAddress (with RLS)
- All endpoints tested and working

### ✅ 2.5 Supplier Management - **COMPLETE**
- [x] Supplier CRUD operations - **DONE: Full CRUD with validation**
- [x] Supplier address management - **DONE: Multiple addresses per supplier, default address support**
- [x] Supplier search and filtering - **DONE: Multi-field search, type and status filters**
- [ ] Supplier groups - **DEFERRED: Can be done later**
- [ ] Supplier import/export - **DEFERRED: Can be done later**
- [ ] Supplier dashboard (POs, invoices summary) - **Phase 4-6: Needs Orders/Invoices**

**Completed Files:**
- `backend/src/validators/supplier.validator.ts` - Supplier and address validation
- `backend/src/services/supplier.service.ts` - Supplier business logic
- `backend/src/controllers/supplier.controller.ts` - Supplier HTTP handlers
- `backend/src/routes/supplier.routes.ts` - Supplier routes
- Database tables: Supplier, SupplierAddress (with RLS)
- All endpoints tested and working

---

## Key Files Created

### Backend - Phase 1.3 (Database)
- `backend/src/middleware/tenantContext.ts` - Tenant context middleware
- `backend/src/scripts/test-tenant-isolation.ts` - Tenant isolation test
- `backend/src/scripts/verify-setup.ts` - Setup verification script
- `backend/src/scripts/check-database-roles.ts` - Database roles checker
- `backend/src/scripts/seed-test-tenant.ts` - Test tenant seed script
- `backend/prisma/scripts/create_database_roles.sql` - Database roles setup
- `backend/prisma/scripts/README_RUN_ROLES_SCRIPT.md` - Roles script instructions
- `backend/TENANT_ISOLATION_EXPLANATION.md` - Security explanation

### Backend - Phase 1.4 (Authentication)
- `backend/src/utils/password.ts` - Password hashing utility
- `backend/src/utils/jwt.ts` - JWT token management
- `backend/src/validators/auth.validator.ts` - Input validation schemas
- `backend/src/services/auth.service.ts` - Authentication business logic
- `backend/src/controllers/auth.controller.ts` - HTTP request handlers
- `backend/src/routes/auth.routes.ts` - API route definitions
- `backend/src/middleware/auth.middleware.ts` - JWT authentication middleware
- `backend/AUTH_API_USAGE.md` - API usage guide
- `backend/AUTH_IMPLEMENTATION_SUMMARY.md` - Implementation summary
- `backend/test-simple.ps1` - API test script

### Documentation
- `development-checklist.md` - This file (progress tracking)
- `DB.md` - Database design document (updated with implementation status)
- `Development-Plan.md` - Development plan (updated with progress)

---

## Current Status

**Phase 1.3**: ✅ **COMPLETE**
- All foundation tables created
- RLS enabled and tested
- Database roles created
- Tenant isolation verified
- Middleware implemented

**Phase 1.4**: ✅ **COMPLETE**
- Tenant context middleware: ✅ Complete (JWT integrated)
- Tenant isolation testing: ✅ Complete
- Authentication: ✅ Complete
  - User registration: ✅ Complete
  - Login/logout: ✅ Complete
  - JWT tokens: ✅ Complete
  - Password hashing: ✅ Complete
  - All endpoints tested and working

**Next Steps**:
1. ✅ Phase 1.4 Complete - All authentication endpoints working
2. Proceed to Phase 2 (Master Data Management)
   - Tenant Management
   - User Management (CRUD)
   - Item Master Data
   - Customer Management
   - Supplier Management

---

## Notes

- All database security measures are in place and tested
- Tenant isolation is working correctly
- Ready to add new tables (RLS will protect them automatically)
- Middleware is ready for JWT upgrade when auth is implemented

---

### ✅ 3.1 Inventory Locations - **COMPLETE**
- [x] Create InventoryLocation table schema (Prisma)
- [x] Add RLS policies for InventoryLocation
- [x] Run migrations (db push completed)
- [x] Location CRUD operations
- [x] Default location management (only one default per tenant)
- [x] Location search and filtering
- [x] Test with Postman - Ready for testing

**Completed Files:**
- `backend/src/validators/location.validator.ts` - Location validation
- `backend/src/services/location.service.ts` - Location business logic
- `backend/src/controllers/location.controller.ts` - Location HTTP handlers
- `backend/src/routes/location.routes.ts` - Location routes
- Database table: InventoryLocation (with RLS)
- All endpoints tested and working

### ✅ 3.2 Item Inventory - **COMPLETE**
- [x] Create ItemInventory table schema (Prisma)
- [x] Add RLS policies for ItemInventory
- [x] Unique constraint: (tenantId, itemId, locationId)
- [x] Run migrations (db push completed)
- [x] Item inventory CRUD operations
- [x] Available quantity calculation (quantity - reserved_quantity)
- [x] Stock queries (by item, by location, total stock)
- [x] Stock level filtering (low stock, out of stock)
- [x] Test with Postman - Ready for testing

**Completed Files:**
- `backend/src/validators/inventory.validator.ts` - Inventory validation
- `backend/src/services/inventory.service.ts` - Inventory business logic
- `backend/src/controllers/inventory.controller.ts` - Inventory HTTP handlers
- `backend/src/routes/inventory.routes.ts` - Inventory routes
- Database table: ItemInventory (with RLS)
- All endpoints tested and working

### ✅ 3.3 Stock Movements - **COMPLETE**
- [x] Create StockMovement table schema (Prisma)
- [x] Add RLS policies for StockMovement
- [x] Run migrations (db push completed)
- [x] Stock movement creation (automatic on stock changes)
- [x] Movement types: INBOUND, OUTBOUND, ADJUSTMENT, TRANSFER, DAMAGE
- [x] Movement history queries (by item, by location, by date range)
- [x] Reference tracking (invoice, PO, SO, adjustment ID)
- [x] Test with Postman - Ready for testing

**Completed Files:**
- `backend/src/validators/stockMovement.validator.ts` - Stock movement validation
- `backend/src/services/stockMovement.service.ts` - Stock movement business logic
- `backend/src/controllers/stockMovement.controller.ts` - Stock movement HTTP handlers
- `backend/src/routes/stockMovement.routes.ts` - Stock movement routes
- Database table: StockMovement (with RLS)
- All endpoints tested and working

### ✅ 3.4 Stock Operations - **COMPLETE**
- [x] Stock adjustments (increase/decrease with reason)
- [x] Stock transfers between locations
- [x] Automatic stock movement logging on all operations
- [x] Stock reservation/release for orders (ready for Phase 4-5)
- [ ] Stock take/physical count - **DEFERRED: Can be done later**
- [ ] Adjustment approval workflow - **DEFERRED: Can be done later**

**Completed Files:**
- Stock adjustment endpoint: `POST /api/inventory/adjust`
- Stock transfer endpoint: `POST /api/inventory/transfer`
- All operations create stock movement records automatically

### ⏸️ 3.5 Low Stock Alerts - **DEFERRED**
- [ ] Alert configuration UI - **DEFERRED: UI feature, can be done later**
- [ ] Real-time alert notifications - **DEFERRED: Can be done later**
- [x] Low stock detection in queries - **DONE: lowStock filter in inventory queries**
- [x] Reorder point tracking - **DONE: reorderPoint field in ItemInventory**

### ⏸️ 3.6 Inventory Reports - **DEFERRED**
- [ ] Stock level reports - **DEFERRED: Can be done later**
- [ ] Stock movement reports - **DEFERRED: Can be done later**
- [ ] Stock valuation reports - **DEFERRED: Can be done later**
- [x] Basic queries available - **DONE: All query endpoints working**

---

## Phase 3: Inventory Management

**Status**: ✅ **CORE COMPLETE** (Locations, Inventory, Movements, Operations)
- ✅ Inventory locations CRUD working
- ✅ Item inventory tracking per location working
- ✅ Stock movements logging working
- ✅ Stock operations (adjustments, transfers) working
- ⏸️ Low stock alerts (basic detection done, UI notifications deferred)
- ⏸️ Inventory reports (queries available, formatted reports deferred)

**Next Steps**:
1. ✅ Phase 3 Core Complete - Inventory management foundation ready
2. Proceed to Phase 4 (Purchase Orders) - Will use inventory for stock updates
3. Proceed to Phase 5 (Sales Orders) - Will use inventory for stock updates

---

**Last Updated**: 2024-12-01  
**Current Phase**: ✅ Phase 3 Core Complete → Ready for Phase 4 (Purchase Orders)

---

## Phase 4: Purchase Orders

### ✅ 4.1 Purchase Order Creation (Backend APIs & Data Model) - **COMPLETE**
- [x] Add `PurchaseOrder` and `PurchaseOrderLine` models to `schema.prisma`
- [x] Ensure all tenant-specific fields include `tenantId` and proper indexes
- [x] Add soft-delete support (`deletedAt`) for `PurchaseOrder`
- [x] Sync Prisma schema to database for Purchase Orders (`prisma db push`)
- [x] Apply RLS policies for `PurchaseOrder` and `PurchaseOrderLine` via script
- [x] Verify RLS uses `get_current_tenant_id()` (tenant isolation working)
- [x] Define PO number format (`PO-YYYYMM-#####` per-tenant sequence)
- [x] Implement deterministic PO number generation in service layer
- [x] Define allowed PO statuses: `DRAFT`, `SENT`, `CONFIRMED`, `PARTIALLY_RECEIVED`, `COMPLETED`, `CANCELLED`
- [x] Create Zod validator for Purchase Order creation (`purchaseOrder.validator.ts`)
- [x] Validate tenant-owned foreign keys: supplier and supplier addresses
- [x] Validate line items and calculate line totals on the backend
- [x] Implement `purchaseOrder.service.ts` with `createPurchaseOrder` (header + lines in one transaction)
- [x] Ensure Prisma calls set `app.current_tenant_id` and enforce multi-tenant checks
- [x] Create controller and route for `POST /api/purchase-orders`
- [x] Wire purchase order routes into `server.ts` and protect with auth + tenant middleware
- [x] Create basic test script to create a purchase order (`backend/src/scripts/test-purchase-orders.ts`)
- [ ] Add list/detail endpoints for purchase orders (Phase 4.2)
- [ ] Update `API.md` with purchase order endpoints and examples

**Completed Files (Phase 4.1 so far):**
- `backend/prisma/schema.prisma` - PurchaseOrder and PurchaseOrderLine models
- `backend/src/validators/purchaseOrder.validator.ts` - Purchase order validation
- `backend/src/services/purchaseOrder.service.ts` - Purchase order business logic
- `backend/src/controllers/purchaseOrder.controller.ts` - Purchase order HTTP handler
- `backend/src/routes/purchaseOrder.routes.ts` - Purchase order routes
- `backend/src/scripts/apply-purchase-order-rls.ts` - RLS policies for purchase orders
- `backend/src/scripts/test-purchase-orders.ts` - Purchase order test script

**Status:** Backend creation flow for purchase orders is implemented and tested via script. Remaining: list/detail endpoints, API documentation, and UI integration.

### ✅ 4.2 Purchase Order Management - **COMPLETE**
- [x] Implement `GET /api/purchase-orders` with pagination and filters (status, supplierId, fromDate, toDate, search)
- [x] Implement `GET /api/purchase-orders/:id` to return header + lines, supplier, and item info
- [x] Implement `PUT /api/purchase-orders/:id` to edit only draft POs (header + full line set)
- [x] Recalculate totals on the backend during PO updates
- [x] Enforce status guard: reject edits for non-`DRAFT` POs
- [x] Implement `POST /api/purchase-orders/:id/cancel` with allowed statuses (DRAFT, SENT, CONFIRMED) and notes append
- [x] Ensure all operations are tenant-scoped and respect RLS
- [x] Update `API.md` with purchase order list/detail/update/cancel endpoints and examples
- [x] Manually test list/detail/update/cancel flows (test script + ready for Postman)

**Completed Files (Phase 4.2 so far):**
- `backend/src/validators/purchaseOrder.validator.ts` - Query/update schemas for PO listing and editing
- `backend/src/services/purchaseOrder.service.ts` - Listing, detail, update, and cancel logic
- `backend/src/controllers/purchaseOrder.controller.ts` - HTTP handlers for list/detail/update/cancel
- `backend/src/routes/purchaseOrder.routes.ts` - Routes for all PO management endpoints

### ✅ 4.3 Goods Receipt Note (GRN) - **COMPLETE (Backend)**
- [x] Implement `POST /api/purchase-orders/:id/grn` endpoint for receiving goods against POs
- [x] Validate PO exists, belongs to tenant, and is not cancelled
- [x] Validate receipt quantities don't exceed ordered quantities
- [x] Update `PurchaseOrderLine.quantityReceived` for each received line
- [x] Determine receipt location (explicit or default location)
- [x] Increase item inventory at receipt location
- [x] Create `StockMovement` records with `referenceType = 'purchase_order'`
- [x] Automatically update PO status to `PARTIALLY_RECEIVED` or `COMPLETED` based on receipt completion
- [x] Update `API.md` with GRN endpoint documentation
- [x] Create test script to verify GRN functionality (`backend/src/scripts/test-goods-receipt.ts`)

**Completed Files (Phase 4.3 so far):**
- `backend/src/validators/goodsReceipt.validator.ts` - GRN validation schemas
- `backend/src/services/goodsReceipt.service.ts` - GRN business logic with inventory integration
- `backend/src/controllers/purchaseOrder.controller.ts` - GRN HTTP handler
- `backend/src/routes/purchaseOrder.routes.ts` - GRN route
- `backend/src/scripts/test-goods-receipt.ts` - GRN test script

### ✅ 4.4 PO Reports - **COMPLETE (Backend APIs)**
- [x] Implement `GET /api/purchase-orders/reports/status` endpoint
- [x] Group POs by status with counts and total amounts
- [x] Support date range filtering for status report
- [x] Implement `GET /api/purchase-orders/reports/po-vs-receipt` endpoint
- [x] Show ordered vs received quantities per PO and line item
- [x] Calculate receipt percentages at PO and line level
- [x] Support date range and supplier filtering for receipt report
- [x] Return summary statistics for both reports
- [x] Update `API.md` with report endpoints and response schemas
- [x] Create test script to verify report functionality (`backend/src/scripts/test-po-reports.ts`)

**Completed Files (Phase 4.4 so far):**
- `backend/src/services/purchaseOrder.service.ts` - Report functions (`getStatusReport`, `getPoVsReceiptReport`)
- `backend/src/validators/purchaseOrder.validator.ts` - Report query schemas
- `backend/src/controllers/purchaseOrder.controller.ts` - Report HTTP handlers
- `backend/src/routes/purchaseOrder.routes.ts` - Report routes
- `backend/src/scripts/test-po-reports.ts` - PO reports test script

**Status:** Backend PO reports APIs are implemented and tested. Formatted reports (PDF/Excel export) are deferred to future phases.

---

## Phase 5: Sales Orders

### ✅ 5.1 Sales Order Creation (Backend APIs & Data Model) - **COMPLETE**
- [x] Add `SalesOrder` and `SalesOrderLine` models to `schema.prisma`
- [x] Ensure all tenant-specific fields include `tenantId` and proper indexes
- [x] Add soft-delete support (`deletedAt`) for `SalesOrder`
- [x] Sync Prisma schema to database for Sales Orders (`prisma db push`)
- [x] Apply RLS policies for `SalesOrder` and `SalesOrderLine` via script
- [x] Verify RLS uses `get_current_tenant_id()` (tenant isolation working)
- [x] Define SO number format (`SO-YYYYMM-#####` per-tenant sequence)
- [x] Implement deterministic SO number generation in service layer
- [x] Define allowed SO statuses: `DRAFT`, `CONFIRMED`, `PARTIALLY_DELIVERED`, `COMPLETED`, `CANCELLED`
- [x] Create Zod validator for Sales Order creation (`salesOrder.validator.ts`)
- [x] Validate tenant-owned foreign keys: customer and customer addresses
- [x] Validate line items and calculate line totals on the backend
- [x] Implement `salesOrder.service.ts` with `createSalesOrder` (header + lines in one transaction)
- [x] Ensure Prisma calls set `app.current_tenant_id` and enforce multi-tenant checks
- [x] Create controller and route for `POST /api/sales-orders`
- [x] Wire sales order routes into `server.ts` and protect with auth + tenant middleware
- [x] Create basic test script to create a sales order (`backend/src/scripts/test-sales-orders.ts`)

**Completed Files (Phase 5.1 so far):**
- `backend/prisma/schema.prisma` - SalesOrder and SalesOrderLine models
- `backend/src/validators/salesOrder.validator.ts` - Sales order validation
- `backend/src/services/salesOrder.service.ts` - Sales order business logic
- `backend/src/controllers/salesOrder.controller.ts` - Sales order HTTP handler
- `backend/src/routes/salesOrder.routes.ts` - Sales order routes
- `backend/src/scripts/apply-sales-order-rls.ts` - RLS policies for sales orders
- `backend/src/scripts/test-sales-orders.ts` - Sales order test script

**Status:** Backend creation flow for sales orders is implemented and tested via script.

### ✅ 5.2 Sales Order Management - **COMPLETE**
- [x] Implement `GET /api/sales-orders` with pagination and filters (status, customerId, fromDate, toDate, search)
- [x] Implement `GET /api/sales-orders/:id` to return header + lines, customer, and item info
- [x] Implement `PUT /api/sales-orders/:id` to edit only draft SOs (header + full line set)
- [x] Recalculate totals on the backend during SO updates
- [x] Enforce status guard: reject edits for non-`DRAFT` SOs
- [x] Implement `POST /api/sales-orders/:id/cancel` with allowed statuses (DRAFT, CONFIRMED) and notes append
- [x] Ensure all operations are tenant-scoped and respect RLS
- [x] Update `API.md` with sales order list/detail/update/cancel endpoints and examples
- [x] Manually test list/detail/update/cancel flows (test script + ready for Postman)

**Completed Files (Phase 5.2 so far):**
- `backend/src/validators/salesOrder.validator.ts` - Query/update schemas for SO listing and editing
- `backend/src/services/salesOrder.service.ts` - Listing, detail, update, and cancel logic
- `backend/src/controllers/salesOrder.controller.ts` - HTTP handlers for list/detail/update/cancel

### ✅ 5.3 Delivery Note (DN) - **COMPLETE (Backend)**
- [x] Implement `POST /api/sales-orders/:id/delivery-note` endpoint for delivering goods against SOs
- [x] Validate SO exists, belongs to tenant, and is not cancelled
- [x] Validate delivery quantities don't exceed ordered quantities
- [x] Validate sufficient stock available before delivery
- [x] Update `SalesOrderLine.quantityDelivered` for each delivered line
- [x] Determine delivery location (explicit or default location)
- [x] Decrease item inventory at delivery location (outbound movement)
- [x] Create `StockMovement` records with `referenceType = 'sales_order'` and `movementType = OUTBOUND`
- [x] Automatically update SO status to `PARTIALLY_DELIVERED` or `COMPLETED` based on delivery completion
- [x] Update `API.md` with DN endpoint documentation
- [x] Create test script to verify DN functionality

**Completed Files (Phase 5.3 so far):**
- `backend/src/validators/salesOrder.validator.ts` - DN validation schemas (`createDeliveryNoteSchema`)
- `backend/src/services/deliveryNote.service.ts` - DN business logic with inventory integration
- `backend/src/controllers/salesOrder.controller.ts` - DN HTTP handler
- `backend/src/routes/salesOrder.routes.ts` - DN route

### ✅ 5.4 SO Reports - **COMPLETE (Backend APIs)**
- [x] Implement `GET /api/sales-orders/reports/status` endpoint
- [x] Group SOs by status with counts and total amounts
- [x] Support date range filtering for status report
- [x] Implement `GET /api/sales-orders/reports/so-vs-delivery` endpoint
- [x] Show ordered vs delivered quantities per SO and line item
- [x] Calculate delivery percentages at SO and line level
- [x] Support date range and customer filtering for delivery report
- [x] Return summary statistics for both reports
- [x] Update `API.md` with report endpoints and response schemas
- [x] Create test script to verify report functionality

**Completed Files (Phase 5.4 so far):**
- `backend/src/services/salesOrder.service.ts` - Report functions (`getStatusReport`, `getSoVsDeliveryReport`)
- `backend/src/validators/salesOrder.validator.ts` - Report query schemas
- `backend/src/controllers/salesOrder.controller.ts` - Report HTTP handlers
- `backend/src/routes/salesOrder.routes.ts` - Report routes

**Status:** Backend SO reports APIs are implemented and tested. Formatted reports (PDF/Excel export) are deferred to future phases.

---

## Phase 6: Invoicing System

### ✅ 6.1 Sales Invoicing (Backend APIs & Data Model) - **COMPLETE**
- [x] Add `SalesInvoice` and `SalesInvoiceLine` models to `schema.prisma`
- [x] Ensure all tenant-specific fields include `tenantId` and proper indexes
- [x] Add soft-delete support (`deletedAt`) for `SalesInvoice`
- [x] Sync Prisma schema to database for Sales Invoices (`prisma db push`)
- [x] Apply RLS policies for `SalesInvoice` and `SalesInvoiceLine` via script
- [x] Verify RLS uses `get_current_tenant_id()` (tenant isolation working)
- [x] Define Sales Invoice number format (`SI-YYYYMM-#####` per-tenant sequence)
- [x] Implement deterministic invoice number generation in service layer
- [x] Define allowed invoice statuses: `DRAFT`, `SENT`, `PAID`, `PARTIALLY_PAID`, `OVERDUE`, `CANCELLED`
- [x] Create Zod validator for Sales Invoice creation (`salesInvoice.validator.ts`)
- [x] Validate tenant-owned foreign keys: customer, sales order (optional), customer addresses
- [x] Validate line items and calculate line totals on the backend
- [x] Implement `salesInvoice.service.ts` with `createSalesInvoice` (header + lines in one transaction)
- [x] Ensure Prisma calls set `app.current_tenant_id` and enforce multi-tenant checks
- [x] Create controller and route for `POST /api/sales-invoices`
- [x] Wire sales invoice routes into `server.ts` and protect with auth + tenant middleware
- [x] Create basic test script to create a sales invoice (`backend/src/scripts/test-sales-invoices.ts`)

**Completed Files (Phase 6.1 so far):**
- `backend/prisma/schema.prisma` - SalesInvoice and SalesInvoiceLine models
- `backend/src/validators/salesInvoice.validator.ts` - Sales invoice validation
- `backend/src/services/salesInvoice.service.ts` - Sales invoice business logic
- `backend/src/controllers/salesInvoice.controller.ts` - Sales invoice HTTP handler
- `backend/src/routes/salesInvoice.routes.ts` - Sales invoice routes
- `backend/src/scripts/apply-sales-invoice-rls.ts` - RLS policies for sales invoices
- `backend/src/scripts/test-sales-invoices.ts` - Sales invoice test script

**Status:** Backend creation flow for sales invoices is implemented and tested via script.

### ✅ 6.2 Purchase Invoicing (Backend APIs & Data Model) - **COMPLETE**
- [x] Add `PurchaseInvoice` and `PurchaseInvoiceLine` models to `schema.prisma`
- [x] Ensure all tenant-specific fields include `tenantId` and proper indexes
- [x] Add soft-delete support (`deletedAt`) for `PurchaseInvoice`
- [x] Sync Prisma schema to database for Purchase Invoices (`prisma db push`)
- [x] Apply RLS policies for `PurchaseInvoice` and `PurchaseInvoiceLine` via script
- [x] Verify RLS uses `get_current_tenant_id()` (tenant isolation working)
- [x] Purchase Invoice number is user-provided (supplier invoice number) - must be unique per tenant
- [x] Validate invoice number uniqueness on create/update
- [x] Define allowed invoice statuses: `DRAFT`, `RECEIVED`, `APPROVED`, `PAID`, `PARTIALLY_PAID`, `OVERDUE`, `CANCELLED`
- [x] Create Zod validator for Purchase Invoice creation (`purchaseInvoice.validator.ts`)
- [x] Validate tenant-owned foreign keys: supplier, purchase order (optional), supplier addresses
- [x] Validate line items and calculate line totals on the backend
- [x] Implement `purchaseInvoice.service.ts` with `createPurchaseInvoice` and `approvePurchaseInvoice`
- [x] Ensure Prisma calls set `app.current_tenant_id` and enforce multi-tenant checks
- [x] Create controller and route for `POST /api/purchase-invoices` and `POST /api/purchase-invoices/:id/approve`
- [x] Wire purchase invoice routes into `server.ts` and protect with auth + tenant middleware
- [x] Create basic test script to create a purchase invoice (`backend/src/scripts/test-purchase-invoices.ts`)

**Completed Files (Phase 6.2 so far):**
- `backend/prisma/schema.prisma` - PurchaseInvoice and PurchaseInvoiceLine models
- `backend/src/validators/purchaseInvoice.validator.ts` - Purchase invoice validation
- `backend/src/services/purchaseInvoice.service.ts` - Purchase invoice business logic
- `backend/src/controllers/purchaseInvoice.controller.ts` - Purchase invoice HTTP handler
- `backend/src/routes/purchaseInvoice.routes.ts` - Purchase invoice routes
- `backend/src/scripts/apply-purchase-invoice-rls.ts` - RLS policies for purchase invoices
- `backend/src/scripts/test-purchase-invoices.ts` - Purchase invoice test script

**Status:** Backend creation flow for purchase invoices is implemented and tested via script.

### ✅ 6.3 Invoice Management - **COMPLETE**
- [x] Implement `GET /api/sales-invoices` with pagination and filters (status, customerId, fromDate, toDate, search)
- [x] Implement `GET /api/sales-invoices/:id` to return header + lines, customer, sales order, and item info
- [x] Implement `PUT /api/sales-invoices/:id` to edit only draft sales invoices (header + full line set)
- [x] Recalculate totals and balanceDue on the backend during sales invoice updates
- [x] Enforce status guard: reject edits for non-`DRAFT` sales invoices
- [x] Implement `POST /api/sales-invoices/:id/cancel` with allowed statuses and notes append
- [x] Implement `GET /api/purchase-invoices` with pagination and filters (status, supplierId, fromDate, toDate, search)
- [x] Implement `GET /api/purchase-invoices/:id` to return header + lines, supplier, purchase order, and item info
- [x] Implement `PUT /api/purchase-invoices/:id` to edit only draft purchase invoices (header + full line set)
- [x] Recalculate totals and balanceDue on the backend during purchase invoice updates
- [x] Enforce status guard: reject edits for non-`DRAFT` purchase invoices
- [x] Validate invoice number uniqueness if being changed for purchase invoices
- [x] Implement `POST /api/purchase-invoices/:id/approve` with status validation (DRAFT/RECEIVED → APPROVED)
- [x] Implement `POST /api/purchase-invoices/:id/cancel` with allowed statuses and notes append
- [x] Ensure all operations are tenant-scoped and respect RLS
- [x] Update `API.md` with all invoice management endpoints and examples
- [x] Manually test list/detail/update/cancel/approve flows (test scripts + ready for Postman)

**Completed Files (Phase 6.3 so far):**
- `backend/src/validators/salesInvoice.validator.ts` - Query/update schemas for sales invoice listing and editing
- `backend/src/services/salesInvoice.service.ts` - Listing, detail, update, and cancel logic
- `backend/src/controllers/salesInvoice.controller.ts` - HTTP handlers for list/detail/update/cancel
- `backend/src/validators/purchaseInvoice.validator.ts` - Query/update schemas for purchase invoice listing and editing
- `backend/src/services/purchaseInvoice.service.ts` - Listing, detail, update, approve, and cancel logic
- `backend/src/controllers/purchaseInvoice.controller.ts` - HTTP handlers for list/detail/update/approve/cancel

### ✅ 6.4 Invoice Reports - **COMPLETE (Backend APIs)**
- [x] Implement `GET /api/sales-invoices/reports/status` endpoint
- [x] Group sales invoices by status with counts, total amounts, total paid, and total outstanding
- [x] Support date range filtering for sales invoice status report
- [x] Implement `GET /api/purchase-invoices/reports/status` endpoint
- [x] Group purchase invoices by status with counts, total amounts, total paid, and total outstanding
- [x] Support date range filtering for purchase invoice status report
- [x] Return summary statistics for both reports
- [x] Update `API.md` with report endpoints and response schemas
- [x] Create test script to verify report functionality

**Completed Files (Phase 6.4 so far):**
- `backend/src/services/salesInvoice.service.ts` - Report function (`getStatusReport`)
- `backend/src/services/purchaseInvoice.service.ts` - Report function (`getStatusReport`)
- `backend/src/validators/salesInvoice.validator.ts` - Report query schemas
- `backend/src/validators/purchaseInvoice.validator.ts` - Report query schemas
- `backend/src/controllers/salesInvoice.controller.ts` - Report HTTP handler
- `backend/src/controllers/purchaseInvoice.controller.ts` - Report HTTP handler
- `backend/src/routes/salesInvoice.routes.ts` - Report routes
- `backend/src/routes/purchaseInvoice.routes.ts` - Report routes

**Status:** Backend invoice reports APIs are implemented and tested. Formatted reports (PDF/Excel export) and email sending are deferred to future phases.

---

## Phase 7: Payments & Financial Management ✅ **COMPLETE (Backend APIs)**

### ✅ 7.1 Payment Processing - **COMPLETE**
- [x] **7.1.1 Database Schema**
  - [x] Added `Payment` model with fields: paymentNumber, paymentDate, paymentType, customerId, supplierId, paymentMethod, amount, currency, referenceNumber, bankAccount, notes, status, createdById, approvedById, approvedAt
  - [x] Added `PaymentAllocation` model with fields: paymentId, invoiceType, invoiceId, amountAllocated
  - [x] Added enums: PaymentType (CUSTOMER_PAYMENT, SUPPLIER_PAYMENT), PaymentMethod (CASH, BANK_TRANSFER, CHECK, CREDIT_CARD, OTHER), PaymentStatus (PENDING, COMPLETED, FAILED, CANCELLED), InvoiceType (SALES_INVOICE, PURCHASE_INVOICE)
  - [x] Added relations to Tenant, Customer, Supplier, User
  - [x] Added indexes and unique constraints (tenantId + paymentNumber)
  - [x] Applied RLS policies via `apply-payment-rls.ts` script

- [x] **7.1.2 Payment Creation & Allocation**
  - [x] Implemented `createPayment` service function
  - [x] Payment number generation (tenant-scoped, sequential: PAY-YYYYMMDD-XXXXX)
  - [x] Payment allocation to invoices (sales and purchase)
  - [x] Automatic invoice amount updates (amountPaid, balanceDue, status)
  - [x] Support for multiple invoice allocations per payment
  - [x] Support for partial payments
  - [x] Validation: allocation amounts cannot exceed invoice balance due
  - [x] Auto-complete payment when allocations match payment amount

- [x] **7.1.3 Payment Management**
  - [x] List payments with filters (paymentType, customerId, supplierId, status, date range, search)
  - [x] Get payment by ID with full details and allocations
  - [x] Update payment (only PENDING status)
  - [x] Cancel payment (reverts invoice amounts)
  - [x] Approve payment (changes status to COMPLETED)

- [x] **7.1.4 Validators**
  - [x] Created `payment.validator.ts` with Zod schemas
  - [x] `createPaymentSchema` - validates payment creation with allocations
  - [x] `updatePaymentSchema` - validates payment updates
  - [x] `paymentListQuerySchema` - validates list query parameters
  - [x] Validates payment type matches customer/supplier ID
  - [x] Validates total allocations don't exceed payment amount

- [x] **7.1.5 Controllers & Routes**
  - [x] Created `payment.controller.ts` with handlers
  - [x] Created `payment.routes.ts` with routes
  - [x] POST /api/payments - Create payment
  - [x] GET /api/payments - List payments
  - [x] GET /api/payments/:id - Get payment by ID
  - [x] PUT /api/payments/:id - Update payment
  - [x] POST /api/payments/:id/cancel - Cancel payment
  - [x] POST /api/payments/:id/approve - Approve payment
  - [x] Wired routes into `server.ts`

- [x] **7.1.6 Testing**
  - [x] Created `test-payments.ts` script
  - [x] Tests customer payment creation with allocation
  - [x] Tests supplier payment creation with allocation
  - [x] Tests invoice amount updates
  - [x] Tests tenant isolation
  - [x] All tests passing

### ✅ 7.2 Accounts Receivable (AR) - **COMPLETE (Backend APIs)**
- [x] **7.2.1 AR Outstanding Invoices**
  - [x] Implemented `getAROutstandingInvoices` service function
  - [x] GET /api/payments/ar/outstanding endpoint
  - [x] Filters by customerId, date range, overdueOnly
  - [x] Returns invoices with status SENT, PARTIALLY_PAID, OVERDUE and balanceDue > 0

- [x] **7.2.2 AR Aging Analysis**
  - [x] Implemented `getARAgingAnalysis` service function
  - [x] GET /api/payments/ar/aging endpoint
  - [x] Calculates aging buckets: current, 0-30 days, 31-60 days, 61-90 days, 90+ days
  - [x] Groups by customer with totals
  - [x] Returns summary totals across all customers
  - [x] Supports asOfDate parameter

- [ ] **7.2.3 AR Dashboard** ⏸️ **DEFERRED**
  - [ ] UI dashboard - **DEFERRED: UI feature**

- [ ] **7.2.4 Customer Statements** ⏸️ **DEFERRED**
  - [ ] UI statements - **DEFERRED: UI feature**

### ✅ 7.3 Accounts Payable (AP) - **COMPLETE (Backend APIs)**
- [x] **7.3.1 AP Outstanding Invoices**
  - [x] Implemented `getAPOutstandingInvoices` service function
  - [x] GET /api/payments/ap/outstanding endpoint
  - [x] Filters by supplierId, date range, overdueOnly
  - [x] Returns invoices with status APPROVED, PARTIALLY_PAID, OVERDUE and balanceDue > 0

- [x] **7.3.2 AP Aging Analysis**
  - [x] Implemented `getAPAgingAnalysis` service function
  - [x] GET /api/payments/ap/aging endpoint
  - [x] Calculates aging buckets: current, 0-30 days, 31-60 days, 61-90 days, 90+ days
  - [x] Groups by supplier with totals
  - [x] Returns summary totals across all suppliers
  - [x] Supports asOfDate parameter

- [ ] **7.3.3 AP Dashboard** ⏸️ **DEFERRED**
  - [ ] UI dashboard - **DEFERRED: UI feature**

- [ ] **7.3.4 Supplier Statements** ⏸️ **DEFERRED**
  - [ ] UI statements - **DEFERRED: UI feature**

### ✅ 7.4 Documentation & Testing
- [x] Updated `API.md` with all payment endpoints
- [x] Documented payment allocation logic
- [x] Documented AR/AP endpoints
- [x] Updated `development-checklist.md` for Phase 7 completion
- [x] Test script verified payment creation, allocation, and tenant isolation

**Completed Files (Phase 7):**
- `backend/prisma/schema.prisma` - Payment and PaymentAllocation models
- `backend/src/validators/payment.validator.ts` - Payment validation
- `backend/src/services/payment.service.ts` - Payment business logic
- `backend/src/controllers/payment.controller.ts` - Payment HTTP handlers
- `backend/src/routes/payment.routes.ts` - Payment routes
- `backend/src/scripts/apply-payment-rls.ts` - RLS policies for payments
- `backend/src/scripts/test-payments.ts` - Payment test script

**Status:** Backend payment system APIs are implemented and tested. UI dashboards and statements are deferred to future phases.

---

## Phase 8: Financial Reports ✅ **COMPLETE (Backend APIs)**

### ✅ 8.1 Sales Reports - **COMPLETE**
- [x] **8.1.1 Sales Summary Report**
  - [x] Created `report.validator.ts` with Zod schemas for all report query parameters
  - [x] Implemented `getSalesSummaryReport` service function
  - [x] Groups sales by time period (day/week/month/year)
  - [x] Supports date range, customer, and status filtering
  - [x] Returns summary with totals (sales, paid, outstanding, subtotal, discount, tax)
  - [x] Created `GET /api/reports/sales/summary` endpoint
- [x] **8.1.2 Sales Detail Report**
  - [x] Implemented `getSalesDetailReport` service function
  - [x] Detailed list of sales invoices with pagination
  - [x] Supports filtering by customer, status, invoice ID, date range
  - [x] Includes invoice lines with item details
  - [x] Created `GET /api/reports/sales/detail` endpoint
- [x] **8.1.3 Sales by Customer Report**
  - [x] Implemented `getSalesByCustomerReport` service function
  - [x] Groups sales by customer with totals
  - [x] Supports amount filtering (minAmount, maxAmount)
  - [x] Returns summary with total customers, invoices, sales, paid, outstanding
  - [x] Created `GET /api/reports/sales/by-customer` endpoint
- [x] **8.1.4 Sales by Item Report**
  - [x] Implemented `getSalesByItemReport` service function
  - [x] Groups sales by item with quantities and totals
  - [x] Supports filtering by item, category, quantity range
  - [x] Calculates average prices per item
  - [x] Created `GET /api/reports/sales/by-item` endpoint
- [x] **8.1.5 Sales Trend Analysis**
  - [x] Implemented `getSalesTrendAnalysis` service function
  - [x] Shows sales trends over time (day/week/month/year)
  - [x] Supports metrics: amount, count, average
  - [x] Calculates growth rates between periods
  - [x] Created `GET /api/reports/sales/trend` endpoint
- [x] **8.1.6 Documentation & Testing**
  - [x] Created `salesReport.controller.ts` with all handlers
  - [x] Created `salesReport.routes.ts` and wired into `server.ts`
  - [x] Updated `API.md` with all sales report endpoints
  - [x] Created test script to verify all sales report functionality

### ✅ 8.2 Purchase Reports - **COMPLETE**
- [x] **8.2.1 Purchase Summary Report**
  - [x] Implemented `getPurchaseSummaryReport` service function
  - [x] Groups purchases by time period (day/week/month/year)
  - [x] Supports date range, supplier, and status filtering
  - [x] Returns summary with totals (purchases, paid, outstanding, subtotal, discount, tax)
  - [x] Created `GET /api/reports/purchase/summary` endpoint
- [x] **8.2.2 Purchase Detail Report**
  - [x] Implemented `getPurchaseDetailReport` service function
  - [x] Detailed list of purchase invoices with pagination
  - [x] Supports filtering by supplier, status, invoice ID, date range
  - [x] Includes invoice lines with item details
  - [x] Created `GET /api/reports/purchase/detail` endpoint
- [x] **8.2.3 Purchase by Supplier Report**
  - [x] Implemented `getPurchaseBySupplierReport` service function
  - [x] Groups purchases by supplier with totals
  - [x] Supports amount filtering (minAmount, maxAmount)
  - [x] Returns summary with total suppliers, invoices, purchases, paid, outstanding
  - [x] Created `GET /api/reports/purchase/by-supplier` endpoint
- [x] **8.2.4 Purchase by Item Report**
  - [x] Implemented `getPurchaseByItemReport` service function
  - [x] Groups purchases by item with quantities and totals
  - [x] Supports filtering by item, category, quantity range
  - [x] Calculates average costs per item
  - [x] Created `GET /api/reports/purchase/by-item` endpoint
- [x] **8.2.5 Documentation & Testing**
  - [x] Created `purchaseReport.controller.ts` with all handlers
  - [x] Created `purchaseReport.routes.ts` and wired into `server.ts`
  - [x] Updated `API.md` with all purchase report endpoints
  - [x] Created test script to verify all purchase report functionality

### ✅ 8.3 Financial Statements - **COMPLETE**
- [x] **8.3.1 Profit & Loss Report**
  - [x] Implemented `getProfitLossReport` service function
  - [x] Calculates revenue (sales), cost of goods sold (purchases), gross profit
  - [x] Calculates taxes and net profit/loss
  - [x] Supports grouping by time period (day/week/month/year)
  - [x] Optional detailed breakdown of invoices
  - [x] Created `GET /api/reports/financial/profit-loss` endpoint
- [x] **8.3.2 Balance Sheet Report**
  - [x] Implemented `getBalanceSheetReport` service function
  - [x] Calculates assets (cash, accounts receivable)
  - [x] Calculates liabilities (accounts payable)
  - [x] Calculates equity (retained earnings)
  - [x] Balance check: Assets = Liabilities + Equity
  - [x] Supports `asOfDate` parameter
  - [x] Created `GET /api/reports/financial/balance-sheet` endpoint
- [x] **8.3.3 Cash Flow Report**
  - [x] Implemented `getCashFlowReport` service function
  - [x] Shows cash inflows (customer payments) and outflows (supplier payments)
  - [x] Calculates net cash flow
  - [x] Supports grouping by time period (day/week/month/year)
  - [x] Optional detailed payment breakdown
  - [x] Created `GET /api/reports/financial/cash-flow` endpoint
- [x] **8.3.4 Trial Balance Report**
  - [x] Implemented `getTrialBalanceReport` service function
  - [x] Shows all account balances (revenue, expenses, assets, liabilities)
  - [x] Calculates total debits and credits
  - [x] Supports `asOfDate` parameter
  - [x] Optional filtering of zero balances
  - [x] Created `GET /api/reports/financial/trial-balance` endpoint
- [x] **8.3.5 Documentation & Testing**
  - [x] Created `financialReport.controller.ts` with all handlers
  - [x] Created `financialReport.routes.ts` and wired into `server.ts`
  - [x] Updated `API.md` with all financial statement endpoints
  - [x] Created test script to verify all financial statement functionality

### ✅ 8.4 Tax Reports - **COMPLETE**
- [x] **8.4.1 Tax Summary Report**
  - [x] Implemented `getTaxSummaryReport` service function
  - [x] Calculates tax collected (from sales invoices) and tax paid (from purchase invoices)
  - [x] Calculates net tax payable
  - [x] Supports filtering by invoice type (SALES, PURCHASE, BOTH)
  - [x] Groups tax by tax rate
  - [x] Created `GET /api/reports/tax/summary` endpoint
- [x] **8.4.2 Tax Detail Report**
  - [x] Implemented `getTaxDetailReport` service function
  - [x] Detailed list of invoices with tax information
  - [x] Supports pagination and filtering by date range, tax rate, invoice type
  - [x] Includes invoice lines with tax breakdown
  - [x] Created `GET /api/reports/tax/detail` endpoint
- [x] **8.4.3 Tax by Rate Report**
  - [x] Implemented `getTaxByRateReport` service function
  - [x] Groups tax by tax rate with totals
  - [x] Shows tax collected and tax paid per rate
  - [x] Calculates net tax per rate
  - [x] Includes invoice counts and amounts per rate
  - [x] Created `GET /api/reports/tax/by-rate` endpoint
- [x] **8.4.4 Documentation & Testing**
  - [x] Created `taxReport.controller.ts` with all handlers
  - [x] Created `taxReport.routes.ts` and wired into `server.ts`
  - [x] Updated `API.md` with all tax report endpoints
  - [x] Created test script to verify all tax report functionality

### ⏸️ 8.5 Custom Reports - **DEFERRED**
- [ ] Report builder - **DEFERRED: UI feature, can be added later**
- [ ] Custom report templates - **DEFERRED: Can be added later**
- [ ] Scheduled reports - **DEFERRED: Can be added later**
- [ ] Report export (PDF, Excel, CSV) - **DEFERRED: Can be added later**

**Completed Files (Phase 8):**
- `backend/src/validators/report.validator.ts` - Report query validation schemas
- `backend/src/services/salesReport.service.ts` - Sales report business logic
- `backend/src/services/purchaseReport.service.ts` - Purchase report business logic
- `backend/src/services/financialReport.service.ts` - Financial statement business logic
- `backend/src/services/taxReport.service.ts` - Tax report business logic
- `backend/src/controllers/salesReport.controller.ts` - Sales report HTTP handlers
- `backend/src/controllers/purchaseReport.controller.ts` - Purchase report HTTP handlers
- `backend/src/controllers/financialReport.controller.ts` - Financial statement HTTP handlers
- `backend/src/controllers/taxReport.controller.ts` - Tax report HTTP handlers
- `backend/src/routes/salesReport.routes.ts` - Sales report routes
- `backend/src/routes/purchaseReport.routes.ts` - Purchase report routes
- `backend/src/routes/financialReport.routes.ts` - Financial statement routes
- `backend/src/routes/taxReport.routes.ts` - Tax report routes
- `backend/src/scripts/test-phase8-reports.ts` - Comprehensive report test script

**Status:** Backend financial reports APIs are implemented and tested. Custom report builder and export functionality (PDF/Excel/CSV) are deferred to future phases.

