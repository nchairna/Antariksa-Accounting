# Antariksa Accounting - Features Specification

> **Implementation Note (Status vs Plan)**  
> - This file is the **product feature specification** (what the system should do end‑to‑end, including UI/UX).  
> - `Development-Plan.md` and `development-checklist.md` track **what is actually implemented**, and are currently **heavily backend‑focused (APIs, DB, RLS, rules)** with **no production UI yet**.  
> - As of now, backend core for Items, Customers, Suppliers, Inventory, Purchase Orders, Sales Orders, Invoices, Payments, and Reports is **implemented**, but many UI features in this document (dashboards, templates, imports/exports, report builder, PDF/Email, etc.) are **planned/deferred**.
>
> **Legend used in section headings below**  
> - `[BACKEND_CORE_DONE]` – Core models, APIs, business rules implemented (per Development Plan + Checklist).  
> - `[BACKEND_PARTIAL]` – Some backend support exists, but not full breadth described here.  
> - `[UI_NOT_STARTED]` – No real UI yet; spec is future behavior.  
> - `[UI_DEFERRED_FEATURES]` – Nice‑to‑have UI features (dashboards, builders, exports, notifications) not yet scheduled.

## 1. Item Management (Master Controller) [BACKEND_CORE_DONE, UI_NOT_STARTED, UI_DEFERRED_FEATURES]

### 1.1 Item Master Data

#### 1.1.1 Core Item Information
- **Item Code/SKU** (Unique identifier, auto-generated or manual)
- **Item Name** (Product name)
- **Category** (User-defined categories, flexible for any business type)
  - Customizable category hierarchy
  - Multiple levels (Category → Subcategory)
  - Category-specific attributes (optional)

- **Brand/Manufacturer** (Optional)
- **Model Number** (Optional)
- **Barcode/EAN** (Optional, can have multiple barcodes)

#### 1.1.2 Item Description
- **Detailed Description**
  - Long description (rich text support)
  - Technical specifications (flexible fields)
  - Features
  - Compatibility information
  - Dimensions and weight
  - Custom attributes (user-defined fields)

- **Short Description** (For invoices/reports, limited characters)

#### 1.1.3 Unit of Measurement
- **Unit Types** (User-configurable)
  - PCS (Pieces)
  - ROLL
  - BOX
  - SET
  - PAIR
  - UNIT
  - METER
  - FEET
  - KG (Kilogram)
  - LITER
  - Custom units (user can define)

- **Unit Conversion** (Optional)
  - Base unit
  - Conversion factors to other units
  - Multi-unit support (e.g., 1 BOX = 12 PCS)

#### 1.1.4 Pricing Information
- **Purchase Price** (Cost price)
- **Selling Price** (Retail price)
- **Wholesale Price** (If applicable)
- **Currency** (Multi-currency support)
- **Price History** (Track price changes over time)
- **Price Lists** (Multiple price lists for different customers)

#### 1.1.5 Inventory Information
- **Stock Quantity** (Current stock, real-time)
- **Reserved Quantity** (Reserved for orders)
- **Available Quantity** (Stock - Reserved)
- **Minimum Stock Level** (Reorder point)
- **Maximum Stock Level**
- **Warehouse/Location** (Multi-location support)
- **Bin/Location Code** (Physical location in warehouse)

#### 1.1.6 Supplier Information
- **Primary Supplier**
- **Alternative Suppliers** (Multiple suppliers per item)
- **Supplier Item Code** (Supplier's SKU)
- **Lead Time** (Days to receive)
- **Purchase Terms**
- **Minimum Order Quantity** (MOQ)
- **Supplier Price** (Per supplier pricing)

#### 1.1.7 Additional Attributes
- **Tax Information**
  - Tax category
  - Tax rate (VAT/GST)
  - Tax-exempt status

- **Serial Number Tracking** (Optional, for high-value items)
- **Batch/Lot Number Tracking** (Optional)
- **Warranty Information**
  - Warranty period
  - Warranty terms

- **Images**
  - Multiple product images
  - Image upload and management
  - Image optimization

- **Documents**
  - Technical datasheets
  - Manuals
  - Certificates
  - Custom documents

#### 1.1.8 Status Management
- **Item Status**
  - Active
  - Inactive
  - Discontinued
  - Out of Stock
  - On Order

- **Status History** (Track status changes with timestamps)

### 1.2 Item Management Features
- **CRUD Operations**
  - Create new items
  - Edit existing items
  - Delete items (soft delete)
  - Duplicate items
  - Bulk import/export (CSV/Excel)
  - Item templates

- **Search and Filter**
  - Search by item code, name, brand, category, barcode
  - Advanced filters (multiple criteria)
  - Saved filter presets
  - Quick search bar

- **Item Relationships**
  - Related items (Accessories, bundles)
  - Alternative items (Substitutes)
  - Complementary items (Frequently bought together)
  - Item variants (Size, color, etc.)

- **Bulk Operations**
  - Bulk price update
  - Bulk status change
  - Bulk category assignment
  - Bulk supplier assignment
  - Bulk image upload

---

## 2. Customer Management [BACKEND_CORE_DONE, UI_NOT_STARTED, UI_DEFERRED_FEATURES]

### 2.1 Customer Master Data

#### 2.1.1 Core Customer Information
- **Customer Code** (Unique identifier, auto-generated or manual)
- **Customer Name** (Company name or individual name)
- **Customer Type** (Individual, Company, Government)
- **Contact Person** (Primary contact)
- **Email** (Primary and secondary emails)
- **Phone** (Primary and secondary phones)
- **Website** (Optional)

#### 2.1.2 Address Information
- **Billing Address**
  - Street address
  - City
  - State/Province
  - Postal code
  - Country

- **Shipping Address** (Can have multiple shipping addresses)
  - Default shipping address
  - Additional addresses
  - Address labels (Home, Office, Warehouse, etc.)

#### 2.1.3 Financial Information
- **Tax ID** (Tax identification number)
- **Credit Limit** (Maximum credit allowed)
- **Payment Terms** (Net 30, Net 60, Due on Receipt, etc.)
- **Currency** (Preferred currency)
- **Discount** (Default discount percentage)
- **Price List** (Assigned price list)

#### 2.1.4 Additional Information
- **Customer Group** (VIP, Regular, Wholesale, Retail)
- **Sales Representative** (Assigned sales person)
- **Industry** (Optional)
- **Notes** (Internal notes)
- **Tags** (For categorization and filtering)

#### 2.1.5 Status Management
- **Customer Status**
  - Active
  - Inactive
  - Blocked
  - On Hold

### 2.2 Customer Features

#### 2.2.1 Customer Dashboard
- **Overview**
  - Total orders (Count and value)
  - Outstanding balance
  - Recent orders
  - Recent invoices
  - Payment history summary

#### 2.2.2 Order History
- **Sales Orders (SO)**
  - List of all sales orders
  - Order status
  - Order date
  - Order value
  - Items ordered
  - Delivery status

- **Invoices**
  - List of all invoices
  - Invoice status (Paid, Unpaid, Partially Paid, Overdue)
  - Invoice date
  - Due date
  - Invoice amount
  - Payment history

#### 2.2.3 Transaction History
- **All Transactions**
  - Chronological list of all transactions
  - Order confirmations
  - Invoices
  - Payments
  - Credit notes
  - Returns

#### 2.2.4 Customer Communication
- **Communication Log**
  - Email history
  - Call logs
  - Meeting notes
  - Documents shared

#### 2.2.5 Recurring Customers
- **Recurring Orders**
  - Identify repeat customers
  - Order frequency analysis
  - Customer lifetime value
  - Purchase patterns

#### 2.2.6 Customer Reports
- **Customer Statement**
  - Account statement
  - Outstanding invoices
  - Payment history
  - Aging analysis

- **Customer Performance**
  - Sales by customer
  - Top customers
  - Customer growth
  - Customer retention

### 2.3 Customer Management Features
- **CRUD Operations**
  - Create new customers
  - Edit existing customers
  - Delete customers (soft delete)
  - Duplicate customers
  - Bulk import/export (CSV/Excel)

- **Search and Filter**
  - Search by customer code, name, email, phone
  - Advanced filters
  - Filter by status, group, sales rep
  - Saved filter presets

- **Quick Actions**
  - Create new order
  - Create new invoice
  - Send email
  - Print statement
  - View history

---

## 3. Supplier Management [BACKEND_CORE_DONE, UI_NOT_STARTED, UI_DEFERRED_FEATURES]

### 3.1 Supplier Master Data

#### 3.1.1 Core Supplier Information
- **Supplier Code** (Unique identifier)
- **Supplier Name**
- **Supplier Type** (Manufacturer, Distributor, Wholesaler)
- **Contact Person**
- **Email**
- **Phone**
- **Website**

#### 3.1.2 Address Information
- **Billing Address**
- **Shipping Address** (Warehouse location)

#### 3.1.3 Financial Information
- **Tax ID**
- **Payment Terms**
- **Currency**
- **Bank Details** (For payment)
  - Bank name
  - Account number
  - Routing number
  - SWIFT code

#### 3.1.4 Additional Information
- **Supplier Group**
- **Purchase Representative** (Assigned buyer)
- **Industry**
- **Notes**
- **Tags**

#### 3.1.5 Status Management
- **Supplier Status**
  - Active
  - Inactive
  - Blocked
  - On Hold

### 3.2 Supplier Features

#### 3.2.1 Supplier Dashboard
- **Overview**
  - Total purchase orders
  - Outstanding balance
  - Recent POs
  - Recent purchase invoices
  - Payment history

#### 3.2.2 Order History
- **Purchase Orders (PO)**
  - List of all purchase orders
  - PO status
  - Order date
  - Expected delivery date
  - Items ordered

- **Purchase Invoices**
  - List of all purchase invoices
  - Invoice status
  - Invoice date
  - Due date
  - Invoice amount
  - Payment history

#### 3.2.3 Transaction History
- **All Transactions**
  - Purchase orders
  - Purchase invoices
  - Payments
  - Credit notes
  - Returns

### 3.3 Supplier Management Features
- **CRUD Operations**
  - Create, edit, delete suppliers
  - Bulk import/export
  - Duplicate suppliers

- **Search and Filter**
  - Search by supplier code, name, email, phone
  - Advanced filters
  - Saved filter presets

---

## 4. Purchase Orders (PO) [BACKEND_CORE_DONE, UI_NOT_STARTED, UI_DEFERRED_FEATURES]

### 4.1 Purchase Order Creation

#### 4.1.1 PO Header
- **PO Number** (Auto-generated, customizable format)
- **PO Date**
- **Expected Delivery Date**
- **Supplier** (Selected from supplier master)
- **Supplier Reference** (Supplier's PO number)
- **Shipping Address**
- **Billing Address**
- **Payment Terms**
- **Currency**
- **Status** (Draft, Sent, Confirmed, Partial, Completed, Cancelled)

#### 4.1.2 PO Lines
- **Item Selection** (From item master)
- **Item Description**
- **Quantity** (Ordered quantity)
- **Unit Price** (From supplier or item master)
- **Discount** (Percentage or amount)
- **Tax Rate**
- **Line Total**
- **Expected Delivery Date** (Per line item)
- **Received Quantity** (Updated when goods received)

#### 4.1.3 PO Totals
- **Subtotal**
- **Discount Total**
- **Tax Total**
- **Shipping Charges**
- **Grand Total**

### 4.2 Purchase Order Features

#### 4.2.1 PO Management
- **Create PO**
  - Manual creation
  - Create from reorder point (low stock)
  - Create from purchase requisition
  - Copy from previous PO
  - Template-based creation

- **PO Status Workflow**
  - Draft → Sent → Confirmed → Partial → Completed
  - Can cancel at any stage (with approval)

- **PO Actions**
  - Send PO to supplier (Email)
  - Print PO
  - Download PDF
  - Convert to Purchase Invoice
  - Receive goods (GRN)
  - Cancel PO

#### 4.2.2 PO Tracking
- **PO Status Tracking**
  - View PO status
  - Track delivery progress
  - Monitor received quantities
  - Track partial deliveries

- **PO History**
  - View all POs
  - Filter by status, supplier, date range
  - Search POs
  - View PO details

#### 4.2.3 PO Reports
- **PO List Report**
- **PO Status Report**
- **PO vs Receipt Report**
- **Pending PO Report**
- **PO Analysis Report**

### 4.3 Goods Receipt Note (GRN)
- **GRN Creation**
  - Create from PO
  - Link to PO
  - Receive full or partial quantity
  - Quality inspection notes

- **GRN Features**
  - Record received quantities
  - Update inventory
  - Generate GRN number
  - Print GRN

---

## 5. Sales Orders (SO) [BACKEND_CORE_DONE, UI_NOT_STARTED, UI_DEFERRED_FEATURES]

### 5.1 Sales Order Creation

#### 5.1.1 SO Header
- **SO Number** (Auto-generated, customizable format)
- **SO Date**
- **Expected Delivery Date**
- **Customer** (Selected from customer master)
- **Customer Reference** (Customer's PO number)
- **Shipping Address**
- **Billing Address**
- **Payment Terms**
- **Currency**
- **Status** (Draft, Confirmed, Partial, Completed, Cancelled)

#### 5.1.2 SO Lines
- **Item Selection** (From item master)
- **Item Description**
- **Quantity** (Ordered quantity)
- **Unit Price** (From price list or item master)
- **Discount** (Percentage or amount)
- **Tax Rate**
- **Line Total**
- **Expected Delivery Date** (Per line item)
- **Delivered Quantity** (Updated when goods delivered)

#### 5.1.3 SO Totals
- **Subtotal**
- **Discount Total**
- **Tax Total**
- **Shipping Charges**
- **Grand Total**

### 5.2 Sales Order Features

#### 5.2.1 SO Management
- **Create SO**
  - Manual creation
  - Create from quotation
  - Copy from previous SO
  - Template-based creation
  - Quick order entry

- **SO Status Workflow**
  - Draft → Confirmed → Partial → Completed
  - Can cancel at any stage (with approval)

- **SO Actions**
  - Send SO to customer (Email)
  - Print SO
  - Download PDF
  - Convert to Invoice
  - Deliver goods
  - Cancel SO

#### 5.2.2 SO Tracking
- **SO Status Tracking**
  - View SO status
  - Track delivery progress
  - Monitor delivered quantities
  - Track partial deliveries

- **SO History**
  - View all SOs
  - Filter by status, customer, date range
  - Search SOs
  - View SO details

#### 5.2.3 SO Reports
- **SO List Report**
- **SO Status Report**
- **SO vs Delivery Report**
- **Pending SO Report**
- **SO Analysis Report**

### 5.3 Delivery Note
- **Delivery Note Creation**
  - Create from SO
  - Link to SO
  - Deliver full or partial quantity
  - Delivery notes and remarks

- **Delivery Note Features**
  - Record delivered quantities
  - Update inventory
  - Generate delivery note number
  - Print delivery note

---

## 6. Invoicing System [BACKEND_CORE_DONE, UI_NOT_STARTED, UI_DEFERRED_FEATURES]

### 6.1 Sales Invoicing (Outbound)

#### 6.1.1 Invoice Creation
- **Invoice Header**
  - Invoice number (Auto-generated, customizable format)
  - Invoice date
  - Due date
  - Customer information
  - Shipping address
  - Billing address
  - Payment terms
  - Currency
  - Reference number (SO number, PO number, etc.)
  - Status (Draft, Sent, Paid, Partially Paid, Overdue, Cancelled)

- **Invoice Lines**
  - Item selection (Search by code, name, barcode)
  - Item description
  - Quantity
  - Unit price
  - Discount (Percentage or amount)
  - Tax rate
  - Line total
  - Multiple items per invoice

- **Invoice Totals**
  - Subtotal
  - Discount total
  - Tax total (Breakdown by tax rate)
  - Shipping charges
  - Grand total
  - Amount paid
  - Balance due

#### 6.1.2 Invoice Features
- **Quick Invoice**
  - Fast invoice creation
  - Template-based invoicing
  - Recurring invoices
  - Copy from previous invoice
  - Create from SO

- **Invoice Customization**
  - Company logo
  - Custom fields
  - Terms and conditions
  - Notes/Remarks
  - Footer text

- **Invoice Actions**
  - Print invoice
  - Email invoice (PDF attachment)
  - Download PDF
  - Duplicate invoice
  - Cancel invoice
  - Mark as paid
  - Partial payment
  - Send reminder

#### 6.1.3 Invoice Management
- **Invoice List**
  - Search and filter
  - Sort by date, amount, customer
  - Status filter
  - Date range filter
  - Customer filter

- **Invoice History**
  - View all invoices
  - Edit draft invoices
  - View invoice details
  - Payment history
  - Credit notes

### 6.2 Purchase Invoicing (Inbound)

#### 6.2.1 Purchase Invoice Creation
- **Purchase Invoice Header**
  - Invoice number (Supplier invoice number)
  - Invoice date
  - Due date
  - Supplier information
  - Receiving address
  - Payment terms
  - Currency
  - Reference number (PO number)
  - Status (Draft, Received, Approved, Paid, Partially Paid, Overdue, Cancelled)

- **Purchase Invoice Lines**
  - Item selection
  - Item description
  - Quantity received
  - Unit cost
  - Discount
  - Tax rate
  - Line total

- **Purchase Invoice Totals**
  - Subtotal
  - Discount total
  - Tax total
  - Shipping charges
  - Grand total
  - Amount paid
  - Balance due

#### 6.2.2 Purchase Invoice Features
- **Purchase Order Integration**
  - Link to purchase orders
  - Auto-create from PO
  - Three-way matching (PO, Receipt, Invoice)

- **Receiving**
  - Goods receipt note (GRN)
  - Partial receiving
  - Quality inspection

- **Purchase Invoice Actions**
  - Print invoice
  - Email invoice
  - Download PDF
  - Approve invoice
  - Mark as paid
  - Partial payment
  - Cancel invoice

#### 6.2.3 Purchase Invoice Management
- **Purchase Invoice List**
  - Search and filter
  - Sort by date, amount, supplier
  - Status filter
  - Approval workflow

### 6.3 Invoice Templates
- **Sales Invoice Template**
  - Professional layout
  - Company branding
  - Customizable fields
  - Multi-language support (if needed)

- **Purchase Invoice Template**
  - Standard format
  - Required fields
  - Compliance with regulations

### 6.4 Invoice Numbering
- **Numbering System**
  - Auto-increment
  - Custom prefix/suffix
  - Year/month inclusion
  - Reset options
  - Unique validation

---

## 7. Accounts Receivable (AR) [BACKEND_CORE_DONE, UI_NOT_STARTED, UI_DEFERRED_FEATURES]

### 7.1 AR Tracking
- **Outstanding Invoices**
  - List of unpaid invoices
  - Age analysis (Current, 30 days, 60 days, 90+ days)
  - Total amount owed per customer
  - Due date tracking

- **Payment Tracking**
  - Payment received
  - Payment date
  - Payment method (Cash, Bank Transfer, Check, Credit Card)
  - Reference number
  - Partial payments
  - Payment allocation to invoices

### 7.2 AR Reports
- **Aging Report**
  - Customer-wise aging
  - Invoice-wise aging
  - Total receivables by age

- **Customer Statement**
  - Account statement per customer
  - Invoice list
  - Payment history
  - Outstanding balance

- **Collection Report**
  - Overdue invoices
  - Collection efficiency
  - Bad debt analysis

### 7.3 Payment Processing
- **Payment Entry**
  - Record customer payments
  - Allocate to specific invoices
  - Multiple invoice payment
  - Discount handling
  - Write-off (Bad debt)

---

## 8. Accounts Payable (AP) [BACKEND_CORE_DONE, UI_NOT_STARTED, UI_DEFERRED_FEATURES]

### 8.1 AP Tracking
- **Outstanding Invoices**
  - List of unpaid purchase invoices
  - Age analysis (Current, 30 days, 60 days, 90+ days)
  - Total amount owed per supplier
  - Due date tracking

- **Payment Tracking**
  - Payment made
  - Payment date
  - Payment method
  - Reference number
  - Partial payments
  - Payment allocation to invoices

### 8.2 AP Reports
- **Aging Report**
  - Supplier-wise aging
  - Invoice-wise aging
  - Total payables by age

- **Supplier Statement**
  - Account statement per supplier
  - Invoice list
  - Payment history
  - Outstanding balance

- **Payment Schedule**
  - Upcoming payments
  - Cash flow forecast
  - Payment efficiency

### 8.3 Payment Processing
- **Payment Entry**
  - Record supplier payments
  - Allocate to specific invoices
  - Multiple invoice payment
  - Discount handling
  - Payment approval workflow

---

## 9. Inventory Management [BACKEND_CORE_DONE, UI_NOT_STARTED, UI_DEFERRED_FEATURES]

### 9.1 Stock Management
- **Stock Tracking**
  - Real-time stock levels
  - Stock movement history
  - Stock valuation (FIFO, LIFO, Average Cost)
  - Multi-location inventory

- **Stock Adjustments**
  - Manual adjustments (with reason codes)
  - Stock transfers between locations
  - Stock take/Physical count
  - Stock reconciliation

### 9.2 Stock Movements
- **Movement Types**
  - Inbound (Purchase, Return from customer)
  - Outbound (Sale, Return to supplier)
  - Adjustment (Increase, Decrease)
  - Transfer (Between locations)
  - Damage/Scrap

- **Movement Tracking**
  - Date and time
  - User who made the movement
  - Reference document (Invoice, PO, SO, etc.)
  - Quantity before and after
  - Cost/Value

### 9.3 Inventory Reports
- **Stock Level Report**
- **Stock Valuation Report**
- **Low Stock Alert Report**
- **Stock Movement Report**
- **Aging Inventory Report**
- **ABC Analysis Report**

---

## 10. Financial Reports [BACKEND_CORE_DONE, UI_NOT_STARTED, UI_DEFERRED_FEATURES]

### 10.1 Sales Reports
- **Sales Summary Report**
  - Total sales by period
  - Sales by customer
  - Sales by item/category
  - Sales trend analysis

- **Sales Detail Report**
  - Invoice-wise sales
  - Item-wise sales
  - Customer-wise sales

- **Profit & Loss (P&L)**
  - Revenue
  - Cost of Goods Sold (COGS)
  - Gross profit
  - Operating expenses
  - Net profit
  - Period comparison

### 10.2 Purchase Reports
- **Purchase Summary Report**
  - Total purchases by period
  - Purchases by supplier
  - Purchases by item/category

- **Purchase Detail Report**
  - Invoice-wise purchases
  - Item-wise purchases
  - Supplier-wise purchases

### 10.3 Inventory Reports
- **Stock Valuation Report**
  - Current stock value
  - Stock by category
  - Stock by location

- **Inventory Turnover Report**
  - Turnover ratio
  - Slow-moving items
  - Fast-moving items

### 10.4 Financial Statements
- **Balance Sheet**
  - Assets
  - Liabilities
  - Equity
  - Period comparison

- **Cash Flow Statement**
  - Operating activities
  - Investing activities
  - Financing activities

- **Trial Balance**
  - Account balances
  - Debit/Credit totals
  - Period-wise

### 10.5 Tax Reports
- **Tax Summary Report**
  - Tax collected (Sales)
  - Tax paid (Purchases)
  - Net tax payable

- **Tax Detail Report**
  - Invoice-wise tax
  - Tax by rate
  - Period-wise tax

### 10.6 Custom Reports
- **Report Builder**
  - Customizable report fields
  - Date range selection
  - Filter options
  - Export options (PDF, Excel, CSV)
  - Scheduled reports (Email delivery)

---

**Document Status**: Draft  
**Last Updated**: [Current Date]





