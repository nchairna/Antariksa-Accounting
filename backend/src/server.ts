import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { tenantContextMiddleware } from "./middleware/tenantContext";
import authRoutes from "./routes/auth.routes";
import categoryRoutes from "./routes/category.routes";
import itemRoutes from "./routes/item.routes";
import customerRoutes from "./routes/customer.routes";
import supplierRoutes from "./routes/supplier.routes";
import userRoutes from "./routes/user.routes";
import roleRoutes from "./routes/role.routes";
import permissionRoutes from "./routes/permission.routes";
import tenantRoutes from "./routes/tenant.routes";
import locationRoutes from "./routes/location.routes";
import inventoryRoutes from "./routes/inventory.routes";
import stockMovementRoutes from "./routes/stockMovement.routes";
import purchaseOrderRoutes from "./routes/purchaseOrder.routes";
import salesOrderRoutes from "./routes/salesOrder.routes";
import salesInvoiceRoutes from "./routes/salesInvoice.routes";
import purchaseInvoiceRoutes from "./routes/purchaseInvoice.routes";
import paymentRoutes from "./routes/payment.routes";
import salesReportRoutes from "./routes/salesReport.routes";
import purchaseReportRoutes from "./routes/purchaseReport.routes";
import financialReportRoutes from "./routes/financialReport.routes";
import taxReportRoutes from "./routes/taxReport.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check endpoint (before tenant middleware - no tenant required)
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Apply tenant context middleware to all routes
// This sets app.current_tenant_id for RLS filtering
// Note: Auth routes (login/register) still need tenant context (from header or body)
app.use(tenantContextMiddleware);

// Authentication routes
// POST /api/auth/register - Register new user (admin-created)
// POST /api/auth/login - Login user
// GET /api/auth/me - Get current user (protected)
// POST /api/auth/logout - Logout user (protected)
app.use("/api/auth", authRoutes);

// Category routes (protected - requires authentication)
// POST /api/categories - Create category
// GET /api/categories - Get all categories
// GET /api/categories/:id - Get category by ID
// PUT /api/categories/:id - Update category
// DELETE /api/categories/:id - Delete category
app.use("/api/categories", categoryRoutes);

// Item routes (protected - requires authentication)
// POST /api/items - Create item
// GET /api/items - Get all items (with filters: ?categoryId=xxx&status=ACTIVE&search=xxx)
// GET /api/items/:id - Get item by ID
// PUT /api/items/:id - Update item
// DELETE /api/items/:id - Delete item (soft delete)
app.use("/api/items", itemRoutes);

// Customer routes (protected - requires authentication)
// POST /api/customers - Create customer
// GET /api/customers - Get all customers (with filters: ?customerType=COMPANY&status=ACTIVE&search=xxx)
// GET /api/customers/:id - Get customer by ID
// PUT /api/customers/:id - Update customer
// DELETE /api/customers/:id - Delete customer (soft delete)
// POST /api/customers/:id/addresses - Create customer address
// GET /api/customers/:id/addresses - Get customer addresses
// PUT /api/customers/:id/addresses/:addressId - Update customer address
// DELETE /api/customers/:id/addresses/:addressId - Delete customer address
app.use("/api/customers", customerRoutes);

// Supplier routes (protected - requires authentication)
// POST /api/suppliers - Create supplier
// GET /api/suppliers - Get all suppliers (with filters: ?supplierType=DISTRIBUTOR&status=ACTIVE&search=xxx)
// GET /api/suppliers/:id - Get supplier by ID
// PUT /api/suppliers/:id - Update supplier
// DELETE /api/suppliers/:id - Delete supplier (soft delete)
// POST /api/suppliers/:id/addresses - Create supplier address
// GET /api/suppliers/:id/addresses - Get supplier addresses
// PUT /api/suppliers/:id/addresses/:addressId - Update supplier address
// DELETE /api/suppliers/:id/addresses/:addressId - Delete supplier address
app.use("/api/suppliers", supplierRoutes);

// User routes (protected - requires authentication)
// GET /api/users - Get all users (with filters: ?status=ACTIVE&roleId=xxx&search=xxx)
// GET /api/users/:id - Get user by ID
// PUT /api/users/:id - Update user
// DELETE /api/users/:id - Delete user (soft delete)
// PUT /api/users/me/profile - Update own profile
// PUT /api/users/me/password - Change own password
app.use("/api/users", userRoutes);

// Permission routes (protected - requires authentication)
// GET /api/permissions - Get all permissions
app.use("/api/permissions", permissionRoutes);

// Role routes (protected - requires authentication)
// POST /api/roles - Create role
// GET /api/roles - Get all roles (with optional ?permissions=true)
// GET /api/roles/:id - Get role by ID
// PUT /api/roles/:id - Update role
// DELETE /api/roles/:id - Delete role
// POST /api/roles/:id/permissions - Assign permissions to role
app.use("/api/roles", roleRoutes);

// Tenant routes (protected - requires authentication)
// GET /api/tenants/me - Get current tenant
// GET /api/tenants/:id - Get tenant by ID
// PUT /api/tenants/:id - Update tenant
// GET /api/tenants/:id/settings - Get all tenant settings
// GET /api/tenants/:id/settings/:key - Get tenant setting by key
// POST /api/tenants/:id/settings - Create tenant setting
// PUT /api/tenants/:id/settings/:key - Update tenant setting
// DELETE /api/tenants/:id/settings/:key - Delete tenant setting
app.use("/api/tenants", tenantRoutes);

// Location routes (protected - requires authentication)
// POST /api/locations - Create location
// GET /api/locations - Get all locations
// GET /api/locations/default - Get default location
// GET /api/locations/:id - Get location by ID
// PUT /api/locations/:id - Update location
// DELETE /api/locations/:id - Delete location
app.use("/api/locations", locationRoutes);

// Inventory routes (protected - requires authentication)
// POST /api/inventory - Create or update inventory
// GET /api/inventory - Get all inventories
// GET /api/inventory/item/:itemId/total - Get total stock for item
// GET /api/inventory/:id - Get inventory by ID
// PUT /api/inventory/:id - Update inventory
// POST /api/inventory/adjust - Adjust stock
// POST /api/inventory/transfer - Transfer stock between locations
app.use("/api/inventory", inventoryRoutes);

// Purchase order routes (protected - requires authentication)
// POST /api/purchase-orders - Create purchase order (header + lines)
app.use("/api/purchase-orders", purchaseOrderRoutes);

// Sales order routes (protected - requires authentication)
// POST /api/sales-orders - Create sales order (header + lines)
app.use("/api/sales-orders", salesOrderRoutes);

// Sales invoice routes (protected - requires authentication)
// POST /api/sales-invoices - Create sales invoice (header + lines)
app.use("/api/sales-invoices", salesInvoiceRoutes);

// Purchase invoice routes (protected - requires authentication)
// POST /api/purchase-invoices - Create purchase invoice (header + lines)
app.use("/api/purchase-invoices", purchaseInvoiceRoutes);
app.use("/api/payments", paymentRoutes);

// Report routes (protected - requires authentication)
// Sales Reports: GET /api/reports/sales/summary, /detail, /by-customer, /by-item, /trend
app.use("/api/reports/sales", salesReportRoutes);
// Purchase Reports: GET /api/reports/purchase/summary, /detail, /by-supplier, /by-item
app.use("/api/reports/purchase", purchaseReportRoutes);
// Financial Statements: GET /api/reports/financial/profit-loss, /balance-sheet, /cash-flow, /trial-balance
app.use("/api/reports/financial", financialReportRoutes);
// Tax Reports: GET /api/reports/tax/summary, /detail, /by-rate
app.use("/api/reports/tax", taxReportRoutes);

// Stock movement routes (protected - requires authentication)
// GET /api/stock-movements - Get all stock movements
// GET /api/stock-movements/item/:itemId - Get movements by item
// GET /api/stock-movements/location/:locationId - Get movements by location
// GET /api/stock-movements/:id - Get movement by ID
app.use("/api/stock-movements", stockMovementRoutes);

// Example protected route (requires tenant context)
app.get("/api/test", (req, res) => {
  const tenantId = (req as any).tenantId;
  res.json({
    message: "Tenant context is set",
    tenantId: tenantId,
    note: "All database queries are now automatically filtered by this tenant",
  });
});

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
  console.log(`Tenant context middleware enabled`);
  console.log(`Use x-tenant-id header for development testing`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  Auth: /api/auth`);
  console.log(`  Categories: /api/categories`);
  console.log(`  Items: /api/items`);
  console.log(`  Customers: /api/customers`);
  console.log(`  Suppliers: /api/suppliers`);
  console.log(`  Users: /api/users`);
  console.log(`  Roles: /api/roles`);
  console.log(`  Permissions: /api/permissions`);
  console.log(`  Tenants: /api/tenants`);
  console.log(`  Locations: /api/locations`);
  console.log(`  Inventory: /api/inventory`);
  console.log(`  Stock Movements: /api/stock-movements`);
  console.log(`  Purchase Orders: /api/purchase-orders`);
  console.log(`  Sales Orders: /api/sales-orders`);
  console.log(`  Sales Invoices: /api/sales-invoices`);
  console.log(`  Purchase Invoices: /api/purchase-invoices`);
});



