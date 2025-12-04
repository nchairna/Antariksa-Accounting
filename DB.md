# Antariksa Accounting - Database Design Document

## 0. Implementation Status

### ✅ Phase 1.3 - Database Foundation (COMPLETED)

#### Core Tables Created
- **Tenant** - Multi-tenant core table with status and subscription tier
- **TenantSetting** - Tenant-specific key-value settings
- **Role** - User roles per tenant with system role flag
- **Permission** - Global system permissions (shared across tenants)
- **RolePermission** - Role-permission mapping junction table
- **User** - User accounts with tenant isolation, email/username uniqueness per tenant
- **UserSession** - User session management with token and expiration

#### Security Implementation (COMPLETED)
- ✅ **Row-Level Security (RLS)**: Enabled on all tenant-specific tables
  - TenantSetting, Role, User, UserSession
  - RLS policies enforce tenant isolation at database level
- ✅ **RLS Policies**: Created for all tenant tables
  - `tenant_isolation_tenant_setting` - TenantSetting table
  - `tenant_isolation_role` - Role table
  - `tenant_isolation_user` - User table
  - `tenant_isolation_user_session` - UserSession table
- ✅ **RLS Function**: `get_current_tenant_id()` created
  - Retrieves tenant ID from PostgreSQL session variable `app.current_tenant_id`
  - Used by all RLS policies for tenant filtering
- ✅ **Database Roles**: SQL script created (`prisma/scripts/create_database_roles.sql`)
  - `app_user` - Application role with full CRUD access
  - `app_readonly` - Read-only role for reports/analytics
  - `app_admin` - Admin role for migrations/maintenance
  - **Note**: Script must be run manually as database superuser

#### Indexes (COMPLETED)
- ✅ **Tenant ID Indexes**: Added to all tenant-specific tables
  - `TenantSetting.tenantId` - Indexed
  - `Role.tenantId` - Indexed
  - `User.tenantId` - Indexed
  - `UserSession.tenantId` - Already indexed
- ✅ **Unique Constraints**: All tenant-scoped uniqueness enforced
  - `(tenantId, email)` on User
  - `(tenantId, username)` on User
  - `(tenantId, name)` on Role
  - `(tenantId, key)` on TenantSetting
- ✅ **Foreign Key Indexes**: All foreign keys properly indexed

#### Migrations
- ✅ `20251130102616_init` - Initial schema with all core tables
- ✅ `20251130103625_add_tenant_id_indexes` - Added missing tenant_id indexes
- ✅ `20251130103832_enable_rls_and_policies` - Enabled RLS and created policies

#### Files Created
- ✅ `backend/prisma/schema.prisma` - Prisma schema definition
- ✅ `backend/prisma/migrations/` - All migration files
- ✅ `backend/prisma/scripts/create_database_roles.sql` - Database roles setup script

### 📋 Pending Tables (To be added by phase)
- **Phase 2**: Items, Categories, Customers, Suppliers, Addresses
- **Phase 3**: InventoryLocations, ItemInventory, StockMovements
- **Phase 4**: PurchaseOrders, PurchaseOrderLines
- **Phase 5**: SalesOrders, SalesOrderLines
- **Phase 6**: SalesInvoices, PurchaseInvoices, InvoiceLines
- **Phase 7**: Payments, PaymentAllocations
- **Phase 8+**: AuditLogs, Reports, etc.

### 🎯 Next Steps
1. **Run Database Roles Script**: Execute `create_database_roles.sql` as postgres superuser
2. **Update DATABASE_URL**: Use `app_user` role in production
3. **Implement Tenant Context Middleware**: Set `app.current_tenant_id` in application
4. **Test Tenant Isolation**: Verify RLS policies work correctly
5. **Proceed to Phase 2**: Add master data tables (Items, Categories, Customers, Suppliers)

---

## 1. Multi-Tenant Architecture

### 1.1 Overview
The system will support multiple clients (tenants), each owning their own business with complete data isolation. Each tenant's data must be completely separated and secured.

### 1.2 Multi-Tenancy Approaches

#### Option 1: Shared Database with Tenant ID (Recommended)
**Architecture**: Single database with `tenant_id` column in all tenant-specific tables.

**Advantages**:
- Cost-effective (single database instance)
- Easier maintenance and updates
- Better resource utilization
- Simpler backup and recovery
- Easier cross-tenant analytics (if needed)

**Disadvantages**:
- Requires strict row-level security
- Potential performance issues at scale
- Data isolation depends on application logic

**Implementation**:
- Every tenant-specific table includes `tenant_id` column
- All queries must filter by `tenant_id`
- Database-level row security policies (PostgreSQL RLS)
- Application-level tenant context validation

#### Option 2: Separate Database per Tenant
**Architecture**: Each tenant has their own dedicated database.

**Advantages**:
- Complete data isolation
- Better performance (no tenant filtering)
- Easier data migration
- Independent scaling per tenant
- Compliance-friendly (easier data export/deletion)

**Disadvantages**:
- Higher infrastructure costs
- Complex database management
- More complex backup strategy
- Schema updates must be applied to all databases

**Implementation**:
- Dynamic database connection per tenant
- Database naming convention: `antariksa_tenant_{tenant_id}`
- Central tenant registry database

#### Option 3: Hybrid Approach
**Architecture**: Shared database for small tenants, separate databases for enterprise tenants.

**Implementation**:
- Tenant tier determines database strategy
- Small/Standard tenants → Shared database
- Enterprise tenants → Dedicated database

### 1.3 Recommended Approach
**Shared Database with Tenant ID + Row-Level Security**

This document will focus on the shared database approach with comprehensive security measures.

---

## 2. Database Security Architecture

### 2.1 Security Layers

#### Layer 1: Database-Level Security
- **Row-Level Security (RLS)** - PostgreSQL Row Security Policies
- **Database Roles** - Separate roles for application, admin, read-only
- **Connection Encryption** - SSL/TLS for all connections
- **Database Firewall** - IP whitelisting
- **Encryption at Rest** - Database-level encryption
- **Audit Logging** - Database audit logs

#### Layer 2: Application-Level Security
- **Tenant Context Validation** - Verify tenant_id on every request
- **Query Filtering** - Always include tenant_id in WHERE clauses
- **Parameterized Queries** - Prevent SQL injection
- **Connection Pooling** - Secure connection management
- **Query Timeout** - Prevent long-running queries

#### Layer 3: Data Security
- **Sensitive Data Encryption** - Encrypt sensitive fields (passwords, financial data)
- **Data Masking** - Mask sensitive data in logs
- **Backup Encryption** - Encrypted backups
- **Data Retention Policies** - Automatic data archival

### 2.2 Tenant Isolation Strategy

#### 2.2.1 Tenant Identification
- **Tenant ID**: UUID (Universally Unique Identifier)
- **Tenant Code**: Unique human-readable code (e.g., "ACME_CORP")
- **Tenant Domain**: Subdomain or custom domain (e.g., "acme.antariksa.com")

#### 2.2.2 Row-Level Security Implementation
```sql
-- Example: Enable RLS on items table
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their tenant's data
CREATE POLICY tenant_isolation_policy ON items
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

#### 2.2.3 Application-Level Isolation
- **Middleware**: Set tenant context from JWT token or subdomain
- **Query Builder**: Automatically append tenant_id filter
- **Validation**: Reject requests without valid tenant context
- **Error Handling**: Never expose tenant information in errors

---

## 3. Database Schema Design

### 3.1 Core Tables Structure

#### 3.1.1 Tenant Management

**tenants**
- `id` (UUID, Primary Key)
- `code` (VARCHAR, Unique) - Tenant code
- `name` (VARCHAR) - Company name
- `domain` (VARCHAR, Unique) - Subdomain or domain
- `status` (ENUM) - active, inactive, suspended, trial
- `subscription_tier` (VARCHAR) - free, standard, premium, enterprise
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `deleted_at` (TIMESTAMP, Nullable) - Soft delete

**tenant_settings**
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key → tenants.id)
- `setting_key` (VARCHAR)
- `setting_value` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 3.1.2 User Management

**users**
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key → tenants.id) - **CRITICAL: Tenant isolation**
- `email` (VARCHAR, Unique per tenant)
- `username` (VARCHAR, Unique per tenant)
- `password_hash` (VARCHAR) - Encrypted password
- `first_name` (VARCHAR)
- `last_name` (VARCHAR)
- `phone` (VARCHAR, Nullable)
- `role_id` (UUID, Foreign Key → roles.id)
- `status` (ENUM) - active, inactive, locked
- `last_login_at` (TIMESTAMP, Nullable)
- `email_verified_at` (TIMESTAMP, Nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `deleted_at` (TIMESTAMP, Nullable)

**Indexes**:
- `idx_users_tenant_id` (tenant_id)
- `idx_users_tenant_email` (tenant_id, email) - Unique constraint
- `idx_users_tenant_username` (tenant_id, username) - Unique constraint

**roles**
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key → tenants.id) - **CRITICAL: Tenant isolation**
- `name` (VARCHAR) - admin, user, accountant, etc.
- `description` (TEXT, Nullable)
- `is_system_role` (BOOLEAN) - System roles vs custom roles
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**permissions**
- `id` (UUID, Primary Key)
- `name` (VARCHAR) - e.g., "items.create", "invoices.view"
- `resource` (VARCHAR) - items, invoices, customers, etc.
- `action` (VARCHAR) - create, read, update, delete
- `description` (TEXT, Nullable)

**role_permissions**
- `id` (UUID, Primary Key)
- `role_id` (UUID, Foreign Key → roles.id)
- `permission_id` (UUID, Foreign Key → permissions.id)
- `created_at` (TIMESTAMP)

**user_sessions**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `tenant_id` (UUID, Foreign Key → tenants.id) - **CRITICAL: Tenant isolation**
- `token` (VARCHAR, Unique) - JWT token or session token
- `ip_address` (VARCHAR)
- `user_agent` (TEXT)
- `expires_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)

#### 3.1.3 Master Data

**items**
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key → tenants.id) - **CRITICAL: Tenant isolation**
- `code` (VARCHAR) - SKU/Item code (Unique per tenant)
- `name` (VARCHAR)
- `short_description` (TEXT, Nullable)
- `long_description` (TEXT, Nullable)
- `category_id` (UUID, Foreign Key → categories.id, Nullable)
- `brand` (VARCHAR, Nullable)
- `model_number` (VARCHAR, Nullable)
- `barcode` (VARCHAR, Nullable)
- `unit_of_measurement` (VARCHAR) - PCS, ROLL, BOX, etc.
- `purchase_price` (DECIMAL)
- `selling_price` (DECIMAL)
- `wholesale_price` (DECIMAL, Nullable)
- `currency` (VARCHAR) - Default currency
- `tax_category_id` (UUID, Foreign Key → tax_categories.id, Nullable)
- `tax_rate` (DECIMAL, Nullable)
- `status` (ENUM) - active, inactive, discontinued, out_of_stock
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `deleted_at` (TIMESTAMP, Nullable)

**Indexes**:
- `idx_items_tenant_id` (tenant_id)
- `idx_items_tenant_code` (tenant_id, code) - Unique constraint
- `idx_items_tenant_category` (tenant_id, category_id)
- `idx_items_barcode` (tenant_id, barcode) - If barcode exists

**categories**
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key → tenants.id) - **CRITICAL: Tenant isolation**
- `parent_id` (UUID, Foreign Key → categories.id, Nullable) - For hierarchy
- `name` (VARCHAR)
- `description` (TEXT, Nullable)
- `sort_order` (INTEGER, Nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**customers**
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key → tenants.id) - **CRITICAL: Tenant isolation**
- `code` (VARCHAR) - Customer code (Unique per tenant)
- `name` (VARCHAR)
- `customer_type` (ENUM) - individual, company, government
- `email` (VARCHAR, Nullable)
- `phone` (VARCHAR, Nullable)
- `tax_id` (VARCHAR, Nullable)
- `credit_limit` (DECIMAL, Nullable)
- `payment_terms` (VARCHAR, Nullable) - Net 30, Net 60, etc.
- `currency` (VARCHAR) - Preferred currency
- `default_discount` (DECIMAL, Nullable)
- `price_list_id` (UUID, Foreign Key → price_lists.id, Nullable)
- `status` (ENUM) - active, inactive, blocked, on_hold
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `deleted_at` (TIMESTAMP, Nullable)

**Indexes**:
- `idx_customers_tenant_id` (tenant_id)
- `idx_customers_tenant_code` (tenant_id, code) - Unique constraint
- `idx_customers_tenant_email` (tenant_id, email)

**customer_addresses**
- `id` (UUID, Primary Key)
- `customer_id` (UUID, Foreign Key → customers.id)
- `tenant_id` (UUID, Foreign Key → tenants.id) - **CRITICAL: Tenant isolation**
- `address_type` (ENUM) - billing, shipping
- `street_address` (VARCHAR)
- `city` (VARCHAR)
- `state_province` (VARCHAR, Nullable)
- `postal_code` (VARCHAR, Nullable)
- `country` (VARCHAR)
- `is_default` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**suppliers**
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key → tenants.id) - **CRITICAL: Tenant isolation**
- `code` (VARCHAR) - Supplier code (Unique per tenant)
- `name` (VARCHAR)
- `supplier_type` (ENUM) - manufacturer, distributor, wholesaler
- `email` (VARCHAR, Nullable)
- `phone` (VARCHAR, Nullable)
- `tax_id` (VARCHAR, Nullable)
- `payment_terms` (VARCHAR, Nullable)
- `currency` (VARCHAR)
- `bank_name` (VARCHAR, Nullable)
- `bank_account_number` (VARCHAR, Nullable) - **ENCRYPTED**
- `bank_routing_number` (VARCHAR, Nullable) - **ENCRYPTED**
- `swift_code` (VARCHAR, Nullable) - **ENCRYPTED**
- `status` (ENUM) - active, inactive, blocked, on_hold
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `deleted_at` (TIMESTAMP, Nullable)

**Indexes**:
- `idx_suppliers_tenant_id` (tenant_id)
- `idx_suppliers_tenant_code` (tenant_id, code) - Unique constraint

**supplier_addresses**
- `id` (UUID, Primary Key)
- `supplier_id` (UUID, Foreign Key → suppliers.id)
- `tenant_id` (UUID, Foreign Key → tenants.id) - **CRITICAL: Tenant isolation**
- `address_type` (ENUM) - billing, shipping
- `street_address` (VARCHAR)
- `city` (VARCHAR)
- `state_province` (VARCHAR, Nullable)
- `postal_code` (VARCHAR, Nullable)
- `country` (VARCHAR)
- `is_default` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 3.1.4 Inventory Management

**inventory_locations**
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key → tenants.id) - **CRITICAL: Tenant isolation**
- `code` (VARCHAR) - Location code (Unique per tenant)
- `name` (VARCHAR)
- `address` (TEXT, Nullable)
- `is_default` (BOOLEAN)
- `status` (ENUM) - active, inactive
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**item_inventory**
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key → tenants.id) - **CRITICAL: Tenant isolation**
- `item_id` (UUID, Foreign Key → items.id)
- `location_id` (UUID, Foreign Key → inventory_locations.id)
- `quantity` (DECIMAL) - Current stock
- `reserved_quantity` (DECIMAL) - Reserved for orders
- `available_quantity` (DECIMAL) - Calculated: quantity - reserved_quantity
- `minimum_stock_level` (DECIMAL, Nullable)
- `maximum_stock_level` (DECIMAL, Nullable)
- `reorder_point` (DECIMAL, Nullable)
- `last_counted_at` (TIMESTAMP, Nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Indexes**:
- `idx_item_inventory_tenant_id` (tenant_id)
- `idx_item_inventory_item_location` (tenant_id, item_id, location_id) - Unique constraint

**stock_movements**
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key → tenants.id) - **CRITICAL: Tenant isolation**
- `item_id` (UUID, Foreign Key → items.id)
- `location_id` (UUID, Foreign Key → inventory_locations.id)
- `movement_type` (ENUM) - inbound, outbound, adjustment, transfer, damage
- `movement_date` (TIMESTAMP)
- `quantity` (DECIMAL) - Positive for inbound, negative for outbound
- `quantity_before` (DECIMAL)
- `quantity_after` (DECIMAL)
- `reference_type` (VARCHAR, Nullable) - invoice, po, so, adjustment
- `reference_id` (UUID, Nullable) - ID of reference document
- `cost_per_unit` (DECIMAL, Nullable)
- `total_cost` (DECIMAL, Nullable)
- `reason` (TEXT, Nullable)
- `created_by` (UUID, Foreign Key → users.id)
- `created_at` (TIMESTAMP)

**Indexes**:
- `idx_stock_movements_tenant_id` (tenant_id)
- `idx_stock_movements_item` (tenant_id, item_id)
- `idx_stock_movements_date` (tenant_id, movement_date)
- `idx_stock_movements_reference` (tenant_id, reference_type, reference_id)

#### 3.1.5 Purchase Orders

**purchase_orders**
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key → tenants.id) - **CRITICAL: Tenant isolation**
- `po_number` (VARCHAR) - Auto-generated (Unique per tenant)
- `po_date` (DATE)
- `expected_delivery_date` (DATE, Nullable)
- `supplier_id` (UUID, Foreign Key → suppliers.id)
- `supplier_reference` (VARCHAR, Nullable) - Supplier's PO number
- `shipping_address_id` (UUID, Foreign Key → supplier_addresses.id, Nullable)
- `billing_address_id` (UUID, Foreign Key → supplier_addresses.id, Nullable)
- `payment_terms` (VARCHAR, Nullable)
- `currency` (VARCHAR)
- `subtotal` (DECIMAL)
- `discount_amount` (DECIMAL, Default 0)
- `tax_amount` (DECIMAL, Default 0)
- `shipping_charges` (DECIMAL, Default 0)
- `grand_total` (DECIMAL)
- `status` (ENUM) - draft, sent, confirmed, partial, completed, cancelled
- `notes` (TEXT, Nullable)
- `created_by` (UUID, Foreign Key → users.id)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `deleted_at` (TIMESTAMP, Nullable)

**Indexes**:
- `idx_purchase_orders_tenant_id` (tenant_id)
- `idx_purchase_orders_tenant_po_number` (tenant_id, po_number) - Unique constraint
- `idx_purchase_orders_supplier` (tenant_id, supplier_id)
- `idx_purchase_orders_status` (tenant_id, status)
- `idx_purchase_orders_date` (tenant_id, po_date)

**purchase_order_lines**
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key → tenants.id) - **CRITICAL: Tenant isolation**
- `purchase_order_id` (UUID, Foreign Key → purchase_orders.id)
- `item_id` (UUID, Foreign Key → items.id)
- `line_number` (INTEGER)
- `description` (TEXT, Nullable)
- `quantity_ordered` (DECIMAL)
- `quantity_received` (DECIMAL, Default 0)
- `unit_price` (DECIMAL)
- `discount_percentage` (DECIMAL, Default 0)
- `discount_amount` (DECIMAL, Default 0)
- `tax_rate` (DECIMAL, Default 0)
- `tax_amount` (DECIMAL, Default 0)
- `line_total` (DECIMAL)
- `expected_delivery_date` (DATE, Nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Indexes**:
- `idx_po_lines_tenant_id` (tenant_id)
- `idx_po_lines_po_id` (tenant_id, purchase_order_id)
- `idx_po_lines_item` (tenant_id, item_id)

#### 3.1.6 Sales Orders

**sales_orders**
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key → tenants.id) - **CRITICAL: Tenant isolation**
- `so_number` (VARCHAR) - Auto-generated (Unique per tenant)
- `so_date` (DATE)
- `expected_delivery_date` (DATE, Nullable)
- `customer_id` (UUID, Foreign Key → customers.id)
- `customer_reference` (VARCHAR, Nullable) - Customer's PO number
- `shipping_address_id` (UUID, Foreign Key → customer_addresses.id, Nullable)
- `billing_address_id` (UUID, Foreign Key → customer_addresses.id, Nullable)
- `payment_terms` (VARCHAR, Nullable)
- `currency` (VARCHAR)
- `subtotal` (DECIMAL)
- `discount_amount` (DECIMAL, Default 0)
- `tax_amount` (DECIMAL, Default 0)
- `shipping_charges` (DECIMAL, Default 0)
- `grand_total` (DECIMAL)
- `status` (ENUM) - draft, confirmed, partial, completed, cancelled
- `notes` (TEXT, Nullable)
- `created_by` (UUID, Foreign Key → users.id)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `deleted_at` (TIMESTAMP, Nullable)

**Indexes**:
- `idx_sales_orders_tenant_id` (tenant_id)
- `idx_sales_orders_tenant_so_number` (tenant_id, so_number) - Unique constraint
- `idx_sales_orders_customer` (tenant_id, customer_id)
- `idx_sales_orders_status` (tenant_id, status)
- `idx_sales_orders_date` (tenant_id, so_date)

**sales_order_lines**
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key → tenants.id) - **CRITICAL: Tenant isolation**
- `sales_order_id` (UUID, Foreign Key → sales_orders.id)
- `item_id` (UUID, Foreign Key → items.id)
- `line_number` (INTEGER)
- `description` (TEXT, Nullable)
- `quantity_ordered` (DECIMAL)
- `quantity_delivered` (DECIMAL, Default 0)
- `unit_price` (DECIMAL)
- `discount_percentage` (DECIMAL, Default 0)
- `discount_amount` (DECIMAL, Default 0)
- `tax_rate` (DECIMAL, Default 0)
- `tax_amount` (DECIMAL, Default 0)
- `line_total` (DECIMAL)
- `expected_delivery_date` (DATE, Nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Indexes**:
- `idx_so_lines_tenant_id` (tenant_id)
- `idx_so_lines_so_id` (tenant_id, sales_order_id)
- `idx_so_lines_item` (tenant_id, item_id)

#### 3.1.7 Invoicing

**sales_invoices**
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key → tenants.id) - **CRITICAL: Tenant isolation**
- `invoice_number` (VARCHAR) - Auto-generated (Unique per tenant)
- `invoice_date` (DATE)
- `due_date` (DATE)
- `customer_id` (UUID, Foreign Key → customers.id)
- `sales_order_id` (UUID, Foreign Key → sales_orders.id, Nullable)
- `shipping_address_id` (UUID, Foreign Key → customer_addresses.id, Nullable)
- `billing_address_id` (UUID, Foreign Key → customer_addresses.id, Nullable)
- `payment_terms` (VARCHAR, Nullable)
- `currency` (VARCHAR)
- `reference_number` (VARCHAR, Nullable) - Customer PO number, etc.
- `subtotal` (DECIMAL)
- `discount_amount` (DECIMAL, Default 0)
- `tax_amount` (DECIMAL, Default 0)
- `shipping_charges` (DECIMAL, Default 0)
- `grand_total` (DECIMAL)
- `amount_paid` (DECIMAL, Default 0)
- `balance_due` (DECIMAL) - Calculated: grand_total - amount_paid
- `status` (ENUM) - draft, sent, paid, partially_paid, overdue, cancelled
- `notes` (TEXT, Nullable)
- `terms_conditions` (TEXT, Nullable)
- `created_by` (UUID, Foreign Key → users.id)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `deleted_at` (TIMESTAMP, Nullable)

**Indexes**:
- `idx_sales_invoices_tenant_id` (tenant_id)
- `idx_sales_invoices_tenant_invoice_number` (tenant_id, invoice_number) - Unique constraint
- `idx_sales_invoices_customer` (tenant_id, customer_id)
- `idx_sales_invoices_status` (tenant_id, status)
- `idx_sales_invoices_date` (tenant_id, invoice_date)
- `idx_sales_invoices_due_date` (tenant_id, due_date)

**sales_invoice_lines**
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key → tenants.id) - **CRITICAL: Tenant isolation**
- `sales_invoice_id` (UUID, Foreign Key → sales_invoices.id)
- `item_id` (UUID, Foreign Key → items.id, Nullable)
- `line_number` (INTEGER)
- `description` (TEXT)
- `quantity` (DECIMAL)
- `unit_price` (DECIMAL)
- `discount_percentage` (DECIMAL, Default 0)
- `discount_amount` (DECIMAL, Default 0)
- `tax_rate` (DECIMAL, Default 0)
- `tax_amount` (DECIMAL, Default 0)
- `line_total` (DECIMAL)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Indexes**:
- `idx_si_lines_tenant_id` (tenant_id)
- `idx_si_lines_invoice_id` (tenant_id, sales_invoice_id)
- `idx_si_lines_item` (tenant_id, item_id)

**purchase_invoices**
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key → tenants.id) - **CRITICAL: Tenant isolation**
- `invoice_number` (VARCHAR) - Supplier invoice number (Unique per tenant)
- `invoice_date` (DATE)
- `due_date` (DATE)
- `supplier_id` (UUID, Foreign Key → suppliers.id)
- `purchase_order_id` (UUID, Foreign Key → purchase_orders.id, Nullable)
- `shipping_address_id` (UUID, Foreign Key → supplier_addresses.id, Nullable)
- `billing_address_id` (UUID, Foreign Key → supplier_addresses.id, Nullable)
- `payment_terms` (VARCHAR, Nullable)
- `currency` (VARCHAR)
- `reference_number` (VARCHAR, Nullable)
- `subtotal` (DECIMAL)
- `discount_amount` (DECIMAL, Default 0)
- `tax_amount` (DECIMAL, Default 0)
- `shipping_charges` (DECIMAL, Default 0)
- `grand_total` (DECIMAL)
- `amount_paid` (DECIMAL, Default 0)
- `balance_due` (DECIMAL) - Calculated: grand_total - amount_paid
- `status` (ENUM) - draft, received, approved, paid, partially_paid, overdue, cancelled
- `notes` (TEXT, Nullable)
- `created_by` (UUID, Foreign Key → users.id)
- `approved_by` (UUID, Foreign Key → users.id, Nullable)
- `approved_at` (TIMESTAMP, Nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `deleted_at` (TIMESTAMP, Nullable)

**Indexes**:
- `idx_purchase_invoices_tenant_id` (tenant_id)
- `idx_purchase_invoices_tenant_invoice_number` (tenant_id, invoice_number) - Unique constraint
- `idx_purchase_invoices_supplier` (tenant_id, supplier_id)
- `idx_purchase_invoices_status` (tenant_id, status)
- `idx_purchase_invoices_date` (tenant_id, invoice_date)
- `idx_purchase_invoices_due_date` (tenant_id, due_date)

**purchase_invoice_lines**
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key → tenants.id) - **CRITICAL: Tenant isolation**
- `purchase_invoice_id` (UUID, Foreign Key → purchase_invoices.id)
- `item_id` (UUID, Foreign Key → items.id, Nullable)
- `line_number` (INTEGER)
- `description` (TEXT)
- `quantity_received` (DECIMAL)
- `unit_cost` (DECIMAL)
- `discount_percentage` (DECIMAL, Default 0)
- `discount_amount` (DECIMAL, Default 0)
- `tax_rate` (DECIMAL, Default 0)
- `tax_amount` (DECIMAL, Default 0)
- `line_total` (DECIMAL)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Indexes**:
- `idx_pi_lines_tenant_id` (tenant_id)
- `idx_pi_lines_invoice_id` (tenant_id, purchase_invoice_id)
- `idx_pi_lines_item` (tenant_id, item_id)

#### 3.1.8 Payments

**payments**
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key → tenants.id) - **CRITICAL: Tenant isolation**
- `payment_number` (VARCHAR) - Auto-generated (Unique per tenant)
- `payment_date` (DATE)
- `payment_type` (ENUM) - customer_payment, supplier_payment
- `customer_id` (UUID, Foreign Key → customers.id, Nullable)
- `supplier_id` (UUID, Foreign Key → suppliers.id, Nullable)
- `payment_method` (ENUM) - cash, bank_transfer, check, credit_card, other
- `amount` (DECIMAL)
- `currency` (VARCHAR)
- `reference_number` (VARCHAR, Nullable) - Check number, transaction ID, etc.
- `bank_account` (VARCHAR, Nullable) - **ENCRYPTED**
- `notes` (TEXT, Nullable)
- `status` (ENUM) - pending, completed, failed, cancelled
- `created_by` (UUID, Foreign Key → users.id)
- `approved_by` (UUID, Foreign Key → users.id, Nullable)
- `approved_at` (TIMESTAMP, Nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `deleted_at` (TIMESTAMP, Nullable)

**Indexes**:
- `idx_payments_tenant_id` (tenant_id)
- `idx_payments_tenant_payment_number` (tenant_id, payment_number) - Unique constraint
- `idx_payments_customer` (tenant_id, customer_id)
- `idx_payments_supplier` (tenant_id, supplier_id)
- `idx_payments_date` (tenant_id, payment_date)
- `idx_payments_type` (tenant_id, payment_type)

**payment_allocations**
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key → tenants.id) - **CRITICAL: Tenant isolation**
- `payment_id` (UUID, Foreign Key → payments.id)
- `invoice_type` (ENUM) - sales_invoice, purchase_invoice
- `invoice_id` (UUID) - ID of sales_invoice or purchase_invoice
- `amount_allocated` (DECIMAL)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Indexes**:
- `idx_payment_allocations_tenant_id` (tenant_id)
- `idx_payment_allocations_payment` (tenant_id, payment_id)
- `idx_payment_allocations_invoice` (tenant_id, invoice_type, invoice_id)

#### 3.1.9 Audit and Logging

**audit_logs**
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key → tenants.id, Nullable) - Nullable for system-level logs
- `user_id` (UUID, Foreign Key → users.id, Nullable)
- `action` (VARCHAR) - create, update, delete, view, login, logout
- `resource_type` (VARCHAR) - items, invoices, customers, etc.
- `resource_id` (UUID, Nullable)
- `old_values` (JSONB, Nullable) - Previous values
- `new_values` (JSONB, Nullable) - New values
- `ip_address` (VARCHAR, Nullable)
- `user_agent` (TEXT, Nullable)
- `created_at` (TIMESTAMP)

**Indexes**:
- `idx_audit_logs_tenant_id` (tenant_id)
- `idx_audit_logs_user` (tenant_id, user_id)
- `idx_audit_logs_resource` (tenant_id, resource_type, resource_id)
- `idx_audit_logs_created_at` (created_at)

---

## 4. Database Security Implementation

### 4.0 Implementation Status

**✅ COMPLETED**: All RLS policies and security measures have been implemented for Phase 1.3 tables.

**Migration**: `20251130103832_enable_rls_and_policies`
- RLS enabled on: TenantSetting, Role, User, UserSession
- RLS function created: `get_current_tenant_id()`
- Policies created: 4 tenant isolation policies

**Next Steps for Future Tables**: When adding new tenant tables in Phase 2+, follow the same pattern:
1. Enable RLS: `ALTER TABLE "TableName" ENABLE ROW LEVEL SECURITY;`
2. Create policy: `CREATE POLICY tenant_isolation_table_name ON "TableName" FOR ALL USING ("tenantId" = get_current_tenant_id()::TEXT) WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT);`

### 4.1 Row-Level Security (RLS) Policies

#### 4.1.1 Enable RLS on All Tenant Tables
```sql
-- Enable RLS on all tenant-specific tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
-- ... and all other tenant-specific tables
```

#### 4.1.2 Create RLS Policies

**✅ IMPLEMENTED**: RLS function and policies created for Phase 1.3 tables.

**Current Implementation**:
```sql
-- Function to get current tenant ID from session (TEXT for Prisma UUID strings)
CREATE OR REPLACE FUNCTION get_current_tenant_id() RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('app.current_tenant_id', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for Phase 1.3 tables
CREATE POLICY tenant_isolation_tenant_setting ON "TenantSetting"
  FOR ALL
  USING ("tenantId" = get_current_tenant_id()::TEXT)
  WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT);

CREATE POLICY tenant_isolation_role ON "Role"
  FOR ALL
  USING ("tenantId" = get_current_tenant_id()::TEXT)
  WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT);

CREATE POLICY tenant_isolation_user ON "User"
  FOR ALL
  USING ("tenantId" = get_current_tenant_id()::TEXT)
  WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT);

CREATE POLICY tenant_isolation_user_session ON "UserSession"
  FOR ALL
  USING ("tenantId" = get_current_tenant_id()::TEXT)
  WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT);
```

**Future Tables** (Phase 2+):
```sql
-- Policy for items table (example for future implementation)
CREATE POLICY tenant_isolation_item ON "Item"
  FOR ALL
  USING ("tenantId" = get_current_tenant_id()::TEXT)
  WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT);

-- Similar policies for all tenant-specific tables as they are created
```

#### 4.1.3 Application-Level Tenant Context
```javascript
// Middleware to set tenant context
app.use((req, res, next) => {
  const tenantId = req.user?.tenant_id || req.headers['x-tenant-id'];
  if (tenantId) {
    // Set tenant ID in PostgreSQL session
    db.query('SET app.current_tenant_id = $1', [tenantId]);
  }
  next();
});
```

### 4.2 Database Roles and Permissions

#### 4.2.1 Create Database Roles
```sql
-- Application role (for application connections)
CREATE ROLE app_user WITH LOGIN PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE antariksa_accounting TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;

-- Read-only role (for reports, analytics)
CREATE ROLE app_readonly WITH LOGIN PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE antariksa_accounting TO app_readonly;
GRANT USAGE ON SCHEMA public TO app_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readonly;

-- Admin role (for migrations, maintenance)
CREATE ROLE app_admin WITH LOGIN PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE antariksa_accounting TO app_admin;
```

#### 4.2.2 Grant Permissions

**✅ IMPLEMENTED**: All permissions granted in `create_database_roles.sql` script.

**Permissions Summary**:
- **app_user**: Full CRUD on all tables, sequence usage, function execution
- **app_readonly**: SELECT only on all tables, function execution
- **app_admin**: All privileges for administrative tasks

**To Apply**: Run the SQL script as postgres superuser:
```bash
psql -U postgres -d antariksa_accounting -f backend/prisma/scripts/create_database_roles.sql
```

**Important**: Change all passwords in the script before running in production!

### 4.3 Data Encryption

#### 4.3.1 Encrypt Sensitive Fields
- **Application-Level Encryption**:
  - Encrypt sensitive fields before storing (passwords, bank details)
  - Use AES-256 encryption
  - Store encryption keys securely (Key Management Service)

- **Database-Level Encryption**:
  - Enable Transparent Data Encryption (TDE) if supported
  - Encrypt database backups

#### 4.3.2 Fields Requiring Encryption
- `users.password_hash` - Already hashed, but ensure strong hashing
- `suppliers.bank_account_number` - **ENCRYPTED**
- `suppliers.bank_routing_number` - **ENCRYPTED**
- `suppliers.swift_code` - **ENCRYPTED**
- `payments.bank_account` - **ENCRYPTED**
- Any other sensitive financial data

### 4.4 Connection Security

#### 4.4.1 SSL/TLS Configuration
```sql
-- Require SSL connections
-- In postgresql.conf:
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'

-- In pg_hba.conf:
hostssl all all 0.0.0.0/0 md5
```

#### 4.4.2 Connection Pooling
- Use connection pooling (PgBouncer, pgPool)
- Limit connections per tenant
- Set connection timeouts
- Monitor connection usage

### 4.5 Query Security

#### 4.5.1 Parameterized Queries
```javascript
// ✅ CORRECT: Parameterized query
db.query('SELECT * FROM items WHERE tenant_id = $1 AND id = $2', [tenantId, itemId]);

// ❌ WRONG: String concatenation (SQL injection risk)
db.query(`SELECT * FROM items WHERE tenant_id = '${tenantId}' AND id = '${itemId}'`);
```

#### 4.5.2 Query Validation
- Validate all input parameters
- Sanitize user inputs
- Use ORM/Query Builder with built-in protection
- Implement query timeouts

### 4.6 Backup and Recovery Security

#### 4.6.1 Backup Strategy
- **Daily Full Backups**: Encrypted backups
- **Hourly Incremental Backups**: Encrypted backups
- **Backup Retention**: 30 days minimum
- **Off-site Backup Storage**: Encrypted
- **Backup Testing**: Regular restore tests

#### 4.6.2 Backup Encryption
```bash
# Encrypt backup before storing
pg_dump -Fc database_name | gpg --encrypt --recipient backup@antariksa.com > backup.dump.gpg
```

---

## 5. Indexing Strategy

### 5.1 Critical Indexes

#### 5.1.1 Tenant Isolation Indexes
Every tenant-specific table MUST have:
- `idx_{table}_tenant_id` - Primary tenant filter index
- Composite indexes with tenant_id as first column

#### 5.1.2 Foreign Key Indexes
- All foreign keys should be indexed
- Improves join performance
- Required for referential integrity

#### 5.1.3 Query Performance Indexes
- Frequently queried columns
- Date ranges (invoice_date, due_date)
- Status filters
- Search columns (name, code, email)

### 5.2 Index Maintenance
- Regular index analysis and optimization
- Monitor index usage
- Remove unused indexes
- Rebuild fragmented indexes

---

## 6. Data Integrity

### 6.1 Constraints

#### 6.1.1 Primary Keys
- All tables use UUID as primary key
- Ensures uniqueness across all tenants

#### 6.1.2 Unique Constraints
- Tenant-scoped unique constraints:
  - `(tenant_id, code)` - For items, customers, suppliers
  - `(tenant_id, email)` - For users, customers
  - `(tenant_id, invoice_number)` - For invoices

#### 6.1.3 Foreign Key Constraints
- All foreign keys with CASCADE or RESTRICT rules
- Maintain referential integrity
- Prevent orphaned records

#### 6.1.4 Check Constraints
- Validate enum values
- Validate numeric ranges
- Validate date ranges

### 6.2 Triggers

#### 6.2.1 Audit Triggers
```sql
-- Trigger to automatically log changes
CREATE TRIGGER audit_items_trigger
  AFTER INSERT OR UPDATE OR DELETE ON items
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_function();
```

#### 6.2.2 Calculated Fields
- Auto-calculate `available_quantity` = `quantity` - `reserved_quantity`
- Auto-calculate `balance_due` = `grand_total` - `amount_paid`
- Auto-update `updated_at` timestamp

---

## 7. Performance Optimization

### 7.1 Partitioning (For Large Tables)

#### 7.1.1 Table Partitioning
Consider partitioning large tables by:
- **Date Range**: Partition audit_logs, stock_movements by month/year
- **Tenant**: If using separate database approach

#### 7.1.2 Partition Strategy
```sql
-- Example: Partition audit_logs by month
CREATE TABLE audit_logs (
  ...
) PARTITION BY RANGE (created_at);

CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### 7.2 Materialized Views
- Pre-aggregated reports
- Dashboard metrics
- Refresh strategy (scheduled or on-demand)

### 7.3 Query Optimization
- Use EXPLAIN ANALYZE for slow queries
- Optimize N+1 queries
- Use appropriate JOIN types
- Limit result sets with pagination

---

## 8. Data Migration and Versioning

### 8.1 Migration Strategy
- Use migration tools (Knex.js, Sequelize, TypeORM)
- Version control for migrations
- Rollback capability
- Test migrations on staging first

### 8.2 Schema Versioning
- Track schema version in database
- Support multiple schema versions during transition
- Gradual migration strategy

---

## 9. Monitoring and Maintenance

### 9.1 Database Monitoring
- **Performance Metrics**:
  - Query execution time
  - Connection pool usage
  - Index usage
  - Table sizes

- **Security Monitoring**:
  - Failed login attempts
  - Unusual query patterns
  - Access from unknown IPs
  - Privilege escalation attempts

### 9.2 Maintenance Tasks
- **Regular Maintenance**:
  - VACUUM and ANALYZE
  - Index rebuilding
  - Statistics updates
  - Log rotation

- **Scheduled Tasks**:
  - Daily backups
  - Weekly optimization
  - Monthly audit review

---

## 10. Disaster Recovery

### 10.1 Recovery Procedures
- **Point-in-Time Recovery**: Restore to specific timestamp
- **Full Database Restore**: From encrypted backups
- **Partial Restore**: Restore specific tenant data

### 10.2 High Availability
- **Replication**: Master-slave replication
- **Failover**: Automatic failover to standby
- **Load Balancing**: Distribute read queries

---

## 11. Compliance and Data Privacy

### 11.1 Data Retention
- **Retention Policies**: Define data retention periods
- **Archival Strategy**: Move old data to archive
- **Deletion Policy**: Secure data deletion (GDPR compliance)

### 11.2 Data Export
- **Tenant Data Export**: Export all tenant data
- **Format**: JSON, CSV, SQL dump
- **Encryption**: Encrypt exported data

### 11.3 Data Deletion
- **Soft Delete**: Mark as deleted (deleted_at)
- **Hard Delete**: Permanent deletion after retention period
- **Audit Trail**: Log all deletions

---

## 12. Implementation Checklist

### 12.1 Database Setup
- [ ] Create database with encryption
- [ ] Create database roles (app_user, app_readonly, app_admin)
- [ ] Configure SSL/TLS
- [ ] Set up connection pooling
- [ ] Configure backup strategy

### 12.2 Schema Creation
- [ ] Create all tables with tenant_id
- [ ] Add all indexes
- [ ] Add foreign key constraints
- [ ] Add unique constraints (tenant-scoped)
- [ ] Add check constraints

### 12.3 Security Implementation
- [ ] Enable Row-Level Security (RLS)
- [ ] Create RLS policies for all tables
- [ ] Implement encryption for sensitive fields
- [ ] Set up audit logging
- [ ] Configure firewall rules

### 12.4 Application Integration
- [ ] Implement tenant context middleware
- [ ] Add tenant_id to all queries
- [ ] Validate tenant access on every request
- [ ] Test tenant isolation
- [ ] Test security policies

### 12.5 Monitoring
- [ ] Set up database monitoring
- [ ] Configure alerts
- [ ] Set up log aggregation
- [ ] Create dashboards

---

## 13. Notes for Schema Generation

When creating the actual database schema:

1. **Always include tenant_id** in tenant-specific tables
2. **Create indexes** on tenant_id and composite indexes with tenant_id first
3. **Enable RLS** on all tenant-specific tables
4. **Use UUIDs** for all primary keys
5. **Add soft delete** (deleted_at) where applicable
6. **Include audit fields** (created_at, updated_at, created_by)
7. **Encrypt sensitive fields** at application level
8. **Add proper constraints** (unique, foreign key, check)
9. **Create audit triggers** for critical tables
10. **Test tenant isolation** thoroughly

---

**Document Status**: Phase 1.3 Complete  
**Last Updated**: 2024-11-30  
**Phase 1.3 Status**: ✅ COMPLETED

### Phase 1.3 Completion Summary

**✅ All Core Tables Created**:
- Tenant, TenantSetting, Role, Permission, RolePermission, User, UserSession

**✅ Security Implemented**:
- Row-Level Security (RLS) enabled on all tenant tables
- RLS policies created for tenant isolation
- RLS function `get_current_tenant_id()` created
- Database roles script created (requires manual execution)

**✅ Indexes Added**:
- All tenant_id columns indexed
- All unique constraints enforced
- Foreign key indexes in place

**✅ Migrations Applied**:
- `20251130102616_init` - Initial schema
- `20251130103625_add_tenant_id_indexes` - Indexes
- `20251130103832_enable_rls_and_policies` - RLS setup

**📋 Next Steps**:
1. Run `backend/prisma/scripts/create_database_roles.sql` as postgres superuser
2. Update DATABASE_URL to use app_user role
3. Implement tenant context middleware in application
4. Test tenant isolation
5. Proceed to Phase 2: Master Data tables



