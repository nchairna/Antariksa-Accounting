# Antariksa Accounting - UI Navigation Structure

> **Implementation Note (Frontend vs Backend)**  
> - This file describes the **intended UI/UX and navigation only** (what screens and flows should exist).  
> - Backend support for most areas (Items, Customers, Suppliers, Inventory, PO/SO, Invoices, AR/AP, Reports, Settings) is **already implemented** as per `Development-Plan.md` and `development-checklist.md`, but the **actual frontend screens are not built yet**.  
> - Use this file together with `Features.md` (feature behavior) and `Development-Plan.md` (phases/status) when designing or implementing UI.
>
> **Quick Mapping: UI Areas ↔ Features ↔ Backend Phases**
> | UI Area                 | Features Spec Section                    | Backend Phase / Status                            |
> |-------------------------|------------------------------------------|---------------------------------------------------|
> | Dashboard               | Financial/Inventory/Sales summaries      | Phase 7–8 reports & payments – **BACKEND_DONE**   |
> | Master Data (Items)     | `1. Item Management`                     | Phase 2.3 – **BACKEND_DONE**                      |
> | Master Data (Customers) | `2. Customer Management`                 | Phase 2.4 – **BACKEND_DONE**                      |
> | Master Data (Suppliers) | `3. Supplier Management`                 | Phase 2.5 – **BACKEND_DONE**                      |
> | Inventory               | `9. Inventory Management`                | Phase 3 – **BACKEND_DONE (Core)**                 |
> | Purchase Orders (PO)    | `4. Purchase Orders (PO)`                | Phase 4 – **BACKEND_DONE**                        |
> | Sales Orders (SO)       | `5. Sales Orders (SO)`                   | Phase 5 – **BACKEND_DONE**                        |
> | Invoices                | `6. Invoicing System`                    | Phase 6 – **BACKEND_DONE**                        |
> | Accounts Receivable     | `7. Accounts Receivable (AR)`            | Phase 7.2 – **BACKEND_DONE**                      |
> | Accounts Payable        | `8. Accounts Payable (AP)`               | Phase 7.3 – **BACKEND_DONE**                      |
> | Reports                 | `10. Financial Reports` + report sections| Phase 8 – **BACKEND_DONE (APIs, no UI yet)**      |
> | Settings / Users / Roles| Settings + User/Role parts of Features   | Phase 1.4, 2.1, 2.2 – **BACKEND_DONE**            |
> | Mobile Navigation       | N/A (uses same APIs as above)            | Depends on above – **FRONTEND_NOT_STARTED**       |

## 1. Main Navigation Menu

### 1.1 Top Navigation Bar
- **Logo/Home** (Link to dashboard)
- **Main Menu Items** (Horizontal menu or sidebar)
- **User Profile** (Dropdown: Profile, Settings, Logout)
- **Notifications** (Bell icon with notifications)
- **Search** (Global search bar)

### 1.2 Sidebar Navigation (Desktop)
- Dashboard
- Master Data
- Inventory
- Purchase Orders (PO)
- Sales Orders (SO)
- Invoices
- Accounts Receivable (AR)
- Accounts Payable (AP)
- Reports
- Settings

---

## 2. Dashboard

### 2.1 Dashboard Overview
- **Key Metrics Cards**
  - Total Sales (Today, This Month, This Year)
  - Total Purchases (Today, This Month, This Year)
  - Outstanding Receivables
  - Outstanding Payables
  - Inventory Value
  - Low Stock Items Count

- **Quick Actions**
  - Create New Invoice
  - Create New PO
  - Create New SO
  - Add New Item
  - Add New Customer

- **Recent Activity**
  - Recent Invoices
  - Recent Orders
  - Recent Payments
  - Recent Stock Movements

- **Charts and Graphs**
  - Sales Trend (Line chart)
  - Top Selling Items (Bar chart)
  - Customer Sales (Pie chart)
  - Inventory Status (Donut chart)

---

## 3. Master Data Section

### 3.1 Items
- **Items List View**
  - Table with columns: Code, Name, Category, Stock, Price, Status
  - Search and filter bar
  - Bulk actions
  - Add New Item button

- **Item Detail View** (Tabs)
  - **Overview Tab**
    - Basic information
    - Description
    - Images
    - Status
  - **Pricing Tab**
    - Purchase price
    - Selling price
    - Price history
    - Price lists
  - **Inventory Tab**
    - Stock levels
    - Stock locations
    - Reorder points
    - Stock movements
  - **Suppliers Tab**
    - Primary supplier
    - Alternative suppliers
    - Supplier pricing
  - **Tax & Settings Tab**
    - Tax information
    - Unit of measurement
    - Custom attributes
  - **History Tab**
    - Transaction history
    - Price changes
    - Status changes

### 3.2 Customers
- **Customers List View**
  - Table with columns: Code, Name, Email, Phone, Balance, Status
  - Search and filter bar
  - Add New Customer button

- **Customer Detail View** (Tabs)
  - **Overview Tab**
    - Basic information
    - Contact details
    - Addresses
    - Financial info (Credit limit, Payment terms)
    - Status
  - **Orders Tab**
    - Sales Orders (SO) list
    - Order history
    - Order status
  - **Invoices Tab**
    - Sales invoices list
    - Invoice status
    - Payment history
  - **Transactions Tab**
    - All transactions
    - Payments
    - Credit notes
    - Returns
  - **Statement Tab**
    - Account statement
    - Aging analysis
    - Outstanding balance
  - **History Tab**
    - Communication log
    - Activity history
    - Notes

### 3.3 Suppliers
- **Suppliers List View**
  - Table with columns: Code, Name, Email, Phone, Balance, Status
  - Search and filter bar
  - Add New Supplier button

- **Supplier Detail View** (Tabs)
  - **Overview Tab**
    - Basic information
    - Contact details
    - Addresses
    - Financial info (Payment terms, Bank details)
    - Status
  - **Orders Tab**
    - Purchase Orders (PO) list
    - Order history
    - Order status
  - **Invoices Tab**
    - Purchase invoices list
    - Invoice status
    - Payment history
  - **Transactions Tab**
    - All transactions
    - Payments
    - Credit notes
    - Returns
  - **Statement Tab**
    - Account statement
    - Aging analysis
    - Outstanding balance
  - **History Tab**
    - Communication log
    - Activity history
    - Notes

---

## 4. Inventory Section

### 4.1 Stock Overview
- **Stock List View**
  - Table with columns: Item Code, Item Name, Category, Stock, Available, Reserved, Location
  - Search and filter
  - Low stock alerts
  - Stock adjustment button

### 4.2 Stock Movements
- **Movements List View**
  - Table with columns: Date, Type, Item, Quantity, Reference, User
  - Filter by type, date range, item
  - View movement details

### 4.3 Stock Adjustments
- **Adjustment Form**
  - Select item
  - Select location
  - Adjustment type (Increase, Decrease)
  - Quantity
  - Reason
  - Notes

### 4.4 Stock Transfers
- **Transfer Form**
  - From location
  - To location
  - Items and quantities
  - Transfer date
  - Notes

---

## 5. Purchase Orders (PO) Section

### 5.1 PO List View
- **Tabs**
  - **All POs** (All purchase orders)
  - **Draft** (Draft POs)
  - **Sent** (Sent to suppliers)
  - **Confirmed** (Confirmed by supplier)
  - **Partial** (Partially received)
  - **Completed** (Fully received)
  - **Cancelled** (Cancelled POs)

- **PO List Table**
  - Columns: PO Number, Date, Supplier, Amount, Status, Expected Delivery
  - Search and filter
  - Create New PO button
  - Bulk actions

### 5.2 PO Detail View
- **PO Header**
  - PO number, date, supplier
  - Status, expected delivery date
  - Totals

- **PO Lines**
  - Items ordered
  - Quantities
  - Prices
  - Received quantities

- **Actions**
  - Edit (if draft)
  - Send to supplier
  - Print
  - Download PDF
  - Receive goods (GRN)
  - Convert to invoice
  - Cancel

### 5.3 Create/Edit PO
- **PO Form**
  - Supplier selection
  - Date and delivery date
  - Items selection
  - Quantities and prices
  - Discounts and taxes
  - Notes
  - Save as draft or send

---

## 6. Sales Orders (SO) Section

### 6.1 SO List View
- **Tabs**
  - **All SOs** (All sales orders)
  - **Draft** (Draft SOs)
  - **Confirmed** (Confirmed orders)
  - **Partial** (Partially delivered)
  - **Completed** (Fully delivered)
  - **Cancelled** (Cancelled SOs)

- **SO List Table**
  - Columns: SO Number, Date, Customer, Amount, Status, Expected Delivery
  - Search and filter
  - Create New SO button
  - Bulk actions

### 6.2 SO Detail View
- **SO Header**
  - SO number, date, customer
  - Status, expected delivery date
  - Totals

- **SO Lines**
  - Items ordered
  - Quantities
  - Prices
  - Delivered quantities

- **Actions**
  - Edit (if draft)
  - Send to customer
  - Print
  - Download PDF
  - Deliver goods
  - Convert to invoice
  - Cancel

### 6.3 Create/Edit SO
- **SO Form**
  - Customer selection
  - Date and delivery date
  - Items selection
  - Quantities and prices
  - Discounts and taxes
  - Notes
  - Save as draft or confirm

---

## 7. Invoices Section

### 7.1 Sales Invoices
- **Invoice List View**
  - **Tabs**
    - **All Invoices** (All sales invoices)
    - **Draft** (Draft invoices)
    - **Sent** (Sent to customers)
    - **Paid** (Fully paid)
    - **Partially Paid** (Partially paid)
    - **Overdue** (Past due date)
    - **Cancelled** (Cancelled invoices)

  - **Invoice List Table**
    - Columns: Invoice Number, Date, Customer, Amount, Status, Due Date, Balance
    - Search and filter
    - Create New Invoice button
    - Bulk actions

- **Invoice Detail View**
  - **Invoice Header**
    - Invoice number, date, customer
    - Status, due date
    - Totals, balance

  - **Invoice Lines**
    - Items
    - Quantities
    - Prices
    - Totals

  - **Payment Section**
    - Payment history
    - Record payment
    - Allocate payment

  - **Actions**
    - Edit (if draft)
    - Print
    - Email
    - Download PDF
    - Record payment
    - Send reminder
    - Cancel

### 7.2 Purchase Invoices
- **Invoice List View**
  - **Tabs**
    - **All Invoices** (All purchase invoices)
    - **Draft** (Draft invoices)
    - **Received** (Received from supplier)
    - **Approved** (Approved for payment)
    - **Paid** (Fully paid)
    - **Partially Paid** (Partially paid)
    - **Overdue** (Past due date)
    - **Cancelled** (Cancelled invoices)

  - **Invoice List Table**
    - Columns: Invoice Number, Date, Supplier, Amount, Status, Due Date, Balance
    - Search and filter
    - Create New Invoice button
    - Bulk actions

- **Invoice Detail View**
  - **Invoice Header**
    - Invoice number, date, supplier
    - Status, due date
    - Totals, balance

  - **Invoice Lines**
    - Items
    - Quantities
    - Prices
    - Totals

  - **Payment Section**
    - Payment history
    - Record payment
    - Allocate payment

  - **Actions**
    - Edit (if draft)
    - Approve
    - Print
    - Email
    - Download PDF
    - Record payment
    - Cancel

### 7.3 Create/Edit Invoice
- **Invoice Form**
  - Customer/Supplier selection
  - Date and due date
  - Items selection
  - Quantities and prices
  - Discounts and taxes
  - Payment terms
  - Notes
  - Save as draft or send

---

## 8. Accounts Receivable (AR) Section

### 8.1 AR Overview
- **Summary Cards**
  - Total Receivables
  - Current (Not due)
  - 1-30 days overdue
  - 31-60 days overdue
  - 61-90 days overdue
  - 90+ days overdue

### 8.2 AR List View
- **Tabs**
  - **All Receivables** (All outstanding invoices)
  - **Current** (Not due)
  - **Overdue** (Past due date)
  - **By Customer** (Grouped by customer)

- **AR List Table**
  - Columns: Invoice Number, Customer, Date, Due Date, Amount, Days Overdue, Status
  - Search and filter
  - Record Payment button

### 8.3 Aging Report
- **Aging Analysis Table**
  - Customer-wise aging
  - Invoice-wise aging
  - Total by age bucket
  - Export to Excel/PDF

### 8.4 Customer Statements
- **Statement View**
  - Customer selection
  - Date range
  - Invoice list
  - Payment history
  - Outstanding balance
  - Print/Email statement

### 8.5 Payment Entry
- **Payment Form**
  - Customer selection
  - Payment date
  - Payment method
  - Amount
  - Allocate to invoices
  - Reference number
  - Notes

---

## 9. Accounts Payable (AP) Section

### 9.1 AP Overview
- **Summary Cards**
  - Total Payables
  - Current (Not due)
  - 1-30 days overdue
  - 31-60 days overdue
  - 61-90 days overdue
  - 90+ days overdue

### 9.2 AP List View
- **Tabs**
  - **All Payables** (All outstanding invoices)
  - **Current** (Not due)
  - **Overdue** (Past due date)
  - **By Supplier** (Grouped by supplier)

- **AP List Table**
  - Columns: Invoice Number, Supplier, Date, Due Date, Amount, Days Overdue, Status
  - Search and filter
  - Record Payment button

### 9.3 Aging Report
- **Aging Analysis Table**
  - Supplier-wise aging
  - Invoice-wise aging
  - Total by age bucket
  - Export to Excel/PDF

### 9.4 Supplier Statements
- **Statement View**
  - Supplier selection
  - Date range
  - Invoice list
  - Payment history
  - Outstanding balance
  - Print/Email statement

### 9.5 Payment Entry
- **Payment Form**
  - Supplier selection
  - Payment date
  - Payment method
  - Amount
  - Allocate to invoices
  - Reference number
  - Bank details
  - Notes
  - Approval (if required)

---

## 10. Reports Section

### 10.1 Sales Reports
- **Sales Summary Report**
- **Sales Detail Report**
- **Sales by Customer Report**
- **Sales by Item Report**
- **Profit & Loss Report**

### 10.2 Purchase Reports
- **Purchase Summary Report**
- **Purchase Detail Report**
- **Purchase by Supplier Report**
- **Purchase by Item Report**

### 10.3 Inventory Reports
- **Stock Level Report**
- **Stock Valuation Report**
- **Low Stock Report**
- **Stock Movement Report**
- **ABC Analysis Report**

### 10.4 Financial Reports
- **Balance Sheet**
- **Cash Flow Statement**
- **Trial Balance**
- **Aging Reports** (AR/AP)

### 10.5 Tax Reports
- **Tax Summary Report**
- **Tax Detail Report**

### 10.6 Custom Reports
- **Report Builder**
  - Select fields
  - Apply filters
  - Set date range
  - Export options

---

## 11. Settings Section

### 11.1 Company Settings
- **Company Information**
  - Company name
  - Address
  - Contact details
  - Tax ID
  - Logo

### 11.2 System Settings
- **Numbering**
  - Invoice numbering
  - PO numbering
  - SO numbering
  - Customer numbering
  - Item numbering

### 11.3 Tax Settings
- **Tax Rates**
  - Tax categories
  - Tax rates
  - Tax rules

### 11.4 User Management
- **Users List**
  - Add user
  - Edit user
  - Delete user
  - Assign roles

### 11.5 Role Management
- **Roles List**
  - Create role
  - Edit role
  - Assign permissions

### 11.6 Other Settings
- **Currency Settings**
- **Payment Terms**
- **Email Settings**
- **Backup Settings**
- **Audit Log**

---

## 12. Mobile Navigation

### 12.1 Mobile Menu
- **Bottom Navigation Bar** (Main sections)
  - Dashboard
  - Items
  - Orders (PO/SO)
  - Invoices
  - Reports

- **Hamburger Menu** (Additional options)
  - Customers
  - Suppliers
  - Inventory
  - AR/AP
  - Settings

### 12.2 Mobile Views
- **Simplified Layouts**
  - Card-based views
  - Swipe actions
  - Pull to refresh
  - Infinite scroll

- **Quick Actions**
  - Floating action button (FAB)
  - Quick create buttons
  - Search bar
  - Notifications

---

## 13. Common UI Elements

### 13.1 Data Tables
- **Features**
  - Sorting (Click column header)
  - Filtering (Filter icons)
  - Pagination
  - Row selection
  - Bulk actions
  - Export (CSV, Excel, PDF)

### 13.2 Forms
- **Features**
  - Validation
  - Auto-save (Draft)
  - Save and continue
  - Cancel
  - Help text
  - Error messages

### 13.3 Modals/Dialogs
- **Uses**
  - Confirm actions
  - Quick edit
  - View details
  - Select items
  - Payment entry

### 13.4 Notifications
- **Types**
  - Success messages
  - Error messages
  - Warning messages
  - Info messages
  - Toast notifications

### 13.5 Search and Filter
- **Global Search**
  - Search across all modules
  - Quick results
  - Recent searches

- **Advanced Filter**
  - Multiple criteria
  - Date ranges
  - Saved filters
  - Clear filters

---

**Document Status**: Draft  
**Last Updated**: [Current Date]





