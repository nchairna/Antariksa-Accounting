# API Documentation - Antariksa Accounting

This document describes all API endpoints for the Antariksa Accounting system.

**Base URL**: `http://localhost:3000/api`

**Authentication**: All endpoints (except auth) require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

**Tenant Context**: All endpoints require tenant context via:
- JWT token (tenantId in payload) - **Priority 1**
- `x-tenant-id` header - **Priority 2** (for development/testing)

**Last Updated**: Phase 8 Backend (Financial Reports)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Items](#items)
4. [Categories](#categories)
5. [Customers](#customers)
6. [Suppliers](#suppliers)
7. [Inventory](#inventory)
8. [Purchase Orders](#purchase-orders)
9. [Sales Orders](#sales-orders)
10. [Sales Invoices](#sales-invoices)
11. [Purchase Invoices](#purchase-invoices)
12. [Payments](#payments)
13. [Financial Reports](#financial-reports)
   - [Sales Reports](#sales-reports)
   - [Purchase Reports](#purchase-reports)
   - [Financial Statements](#financial-statements)
   - [Tax Reports](#tax-reports)

---

## Authentication

### Register User
**POST** `/api/auth/register`

Creates a new user account for a tenant.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "tenantId": "tenant-uuid"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "token": "jwt-token-here"
}
}
```

---

### Login
**POST** `/api/auth/login`

Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
    },
    "token": "jwt-token-here"
  }
}
```

---

### Logout
**POST** `/api/auth/logout`

Invalidates the current user session.

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Get Current User
**GET** `/api/auth/me`

Returns the current authenticated user.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "tenantId": "tenant-uuid"
  }
}
```

---

## Financial Reports

### Sales Reports

#### Sales Summary Report
**GET** `/api/reports/sales/summary`

Groups sales by time period (day/week/month/year) with totals.

**Query Parameters:**
- `fromDate` (string, optional): Start date (ISO datetime)
- `toDate` (string, optional): End date (ISO datetime)
- `customerId` (string, optional): Filter by customer UUID
- `status` (string, optional): Filter by invoice status (DRAFT, SENT, PAID, PARTIALLY_PAID, OVERDUE, CANCELLED)
- `groupBy` (string, optional): Group by period - "day", "week", "month", "year" (default: "month")

**Response (200):**
```json
{
  "success": true,
  "data": {
    "periods": [
    {
        "period": "2025-12",
        "invoiceCount": 10,
        "totalSales": 11000.00,
        "totalPaid": 8000.00,
        "totalOutstanding": 3000.00,
        "totalSubtotal": 10000.00,
        "totalDiscount": 500.00,
        "totalTax": 1000.00
      }
    ],
    "summary": {
      "totalInvoiceCount": 10,
      "totalSales": 11000.00,
      "totalPaid": 8000.00,
      "totalOutstanding": 3000.00,
      "totalSubtotal": 10000.00,
      "totalDiscount": 500.00,
      "totalTax": 1000.00
    }
  }
}
```

---

#### Sales Detail Report
**GET** `/api/reports/sales/detail`

Detailed list of sales invoices with pagination.

**Query Parameters:**
- `fromDate` (string, optional): Start date (ISO datetime)
- `toDate` (string, optional): End date (ISO datetime)
- `customerId` (string, optional): Filter by customer UUID
- `status` (string, optional): Filter by invoice status
- `invoiceId` (string, optional): Filter by specific invoice UUID
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 50, max: 100)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "id": "invoice-uuid",
        "invoiceNumber": "SI-202512-00001",
        "invoiceDate": "2025-12-01T10:00:00.000Z",
        "customer": {
          "id": "customer-uuid",
          "code": "CUST-001",
          "name": "Acme Corporation"
        },
        "grandTotal": 1100.00,
        "amountPaid": 800.00,
        "balanceDue": 300.00,
        "status": "PARTIALLY_PAID",
        "lines": [...]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

---

#### Sales by Customer Report
**GET** `/api/reports/sales/by-customer`

Groups sales by customer with totals.

**Query Parameters:**
- `fromDate` (string, optional): Start date (ISO datetime)
- `toDate` (string, optional): End date (ISO datetime)
- `customerId` (string, optional): Filter by customer UUID
- `minAmount` (number, optional): Minimum sales amount filter
- `maxAmount` (number, optional): Maximum sales amount filter

**Response (200):**
```json
{
  "success": true,
  "data": {
    "byCustomer": [
      {
        "customer": {
          "id": "customer-uuid",
          "code": "CUST-001",
          "name": "Acme Corporation"
        },
        "invoiceCount": 5,
        "totalSales": 5500.00,
        "totalPaid": 4000.00,
        "totalOutstanding": 1500.00
      }
    ],
    "summary": {
      "totalCustomers": 1,
      "totalInvoiceCount": 5,
      "totalSales": 5500.00,
      "totalPaid": 4000.00,
      "totalOutstanding": 1500.00
    }
  }
}
```

---

#### Sales by Item Report
**GET** `/api/reports/sales/by-item`

Groups sales by item with quantities and totals.

**Query Parameters:**
- `fromDate` (string, optional): Start date (ISO datetime)
- `toDate` (string, optional): End date (ISO datetime)
- `itemId` (string, optional): Filter by item UUID
- `categoryId` (string, optional): Filter by category UUID
- `minQuantity` (number, optional): Minimum quantity filter
- `maxQuantity` (number, optional): Maximum quantity filter

**Response (200):**
```json
{
  "success": true,
  "data": {
    "byItem": [
      {
  "item": {
    "id": "item-uuid",
    "code": "ITEM-001",
          "name": "Laptop",
    "category": {
      "id": "category-uuid",
      "name": "Electronics"
    }
        },
        "totalQuantity": 50,
        "totalSales": 50000.00,
        "averagePrice": 1000.00,
        "invoiceCount": 10
      }
    ],
    "summary": {
      "totalItems": 1,
      "totalQuantity": 50,
      "totalSales": 50000.00
    }
  }
}
```

---

#### Sales Trend Analysis
**GET** `/api/reports/sales/trend`

Shows sales trends over time with growth rates.

**Query Parameters:**
- `fromDate` (string, optional): Start date (ISO datetime)
- `toDate` (string, optional): End date (ISO datetime)
- `customerId` (string, optional): Filter by customer UUID
- `groupBy` (string, optional): Group by period - "day", "week", "month", "year" (default: "month")
- `metric` (string, optional): Metric type - "amount", "count", "average" (default: "amount")

**Response (200):**
```json
{
  "success": true,
  "data": {
    "trends": [
      {
        "period": "2025-12",
        "count": 10,
        "amount": 11000.00,
        "average": 1100.00,
        "growthRate": null
      },
      {
        "period": "2026-01",
        "count": 12,
        "amount": 13200.00,
        "average": 1100.00,
        "growthRate": 20.00
      }
    ],
    "metric": "amount"
  }
}
```

---

### Purchase Reports

#### Purchase Summary Report
**GET** `/api/reports/purchase/summary`

Groups purchases by time period (day/week/month/year) with totals.

**Query Parameters:**
- `fromDate` (string, optional): Start date (ISO datetime)
- `toDate` (string, optional): End date (ISO datetime)
- `supplierId` (string, optional): Filter by supplier UUID
- `status` (string, optional): Filter by invoice status (DRAFT, RECEIVED, APPROVED, PAID, PARTIALLY_PAID, OVERDUE, CANCELLED)
- `groupBy` (string, optional): Group by period - "day", "week", "month", "year" (default: "month")

**Response (200):**
```json
{
  "success": true,
  "data": {
    "periods": [
      {
        "period": "2025-12",
        "invoiceCount": 5,
        "totalPurchases": 5500.00,
        "totalPaid": 4000.00,
        "totalOutstanding": 1500.00,
        "totalSubtotal": 5000.00,
        "totalDiscount": 250.00,
        "totalTax": 500.00
      }
    ],
    "summary": {
      "totalInvoiceCount": 5,
      "totalPurchases": 5500.00,
      "totalPaid": 4000.00,
      "totalOutstanding": 1500.00,
      "totalSubtotal": 5000.00,
      "totalDiscount": 250.00,
      "totalTax": 500.00
    }
  }
}
```

---

#### Purchase Detail Report
**GET** `/api/reports/purchase/detail`

Detailed list of purchase invoices with pagination.

**Query Parameters:**
- `fromDate` (string, optional): Start date (ISO datetime)
- `toDate` (string, optional): End date (ISO datetime)
- `supplierId` (string, optional): Filter by supplier UUID
- `status` (string, optional): Filter by invoice status
- `invoiceId` (string, optional): Filter by specific invoice UUID
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 50, max: 100)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "invoices": [
    {
        "id": "invoice-uuid",
        "invoiceNumber": "INV-202512-001",
        "invoiceDate": "2025-12-01T10:00:00.000Z",
        "supplier": {
          "id": "supplier-uuid",
          "code": "SUP-001",
          "name": "Supplier Corp"
        },
        "grandTotal": 550.00,
        "amountPaid": 400.00,
        "balanceDue": 150.00,
        "status": "PARTIALLY_PAID",
        "lines": [...]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

---

#### Purchase by Supplier Report
**GET** `/api/reports/purchase/by-supplier`

Groups purchases by supplier with totals.

**Query Parameters:**
- `fromDate` (string, optional): Start date (ISO datetime)
- `toDate` (string, optional): End date (ISO datetime)
- `supplierId` (string, optional): Filter by supplier UUID
- `minAmount` (number, optional): Minimum purchase amount filter
- `maxAmount` (number, optional): Maximum purchase amount filter

**Response (200):**
```json
{
  "success": true,
  "data": {
    "bySupplier": [
      {
        "supplier": {
          "id": "supplier-uuid",
          "code": "SUP-001",
          "name": "Supplier Corp"
        },
        "invoiceCount": 3,
        "totalPurchases": 3300.00,
        "totalPaid": 2400.00,
        "totalOutstanding": 900.00
      }
    ],
    "summary": {
      "totalSuppliers": 1,
      "totalInvoiceCount": 3,
      "totalPurchases": 3300.00,
      "totalPaid": 2400.00,
      "totalOutstanding": 900.00
    }
  }
}
```

---

#### Purchase by Item Report
**GET** `/api/reports/purchase/by-item`

Groups purchases by item with quantities and totals.

**Query Parameters:**
- `fromDate` (string, optional): Start date (ISO datetime)
- `toDate` (string, optional): End date (ISO datetime)
- `itemId` (string, optional): Filter by item UUID
- `categoryId` (string, optional): Filter by category UUID
- `minQuantity` (number, optional): Minimum quantity filter
- `maxQuantity` (number, optional): Maximum quantity filter

**Response (200):**
```json
{
  "success": true,
  "data": {
    "byItem": [
      {
        "item": {
          "id": "item-uuid",
          "code": "ITEM-001",
          "name": "Laptop",
          "category": {
            "id": "category-uuid",
            "name": "Electronics"
          }
        },
        "totalQuantity": 25,
        "totalPurchases": 25000.00,
        "averageCost": 1000.00,
        "invoiceCount": 5
      }
    ],
    "summary": {
      "totalItems": 1,
      "totalQuantity": 25,
      "totalPurchases": 25000.00
      }
  }
}
```

---

### Financial Statements

#### Profit & Loss Report
**GET** `/api/reports/financial/profit-loss`

Shows revenue, expenses, and net profit/loss.

**Query Parameters:**
- `fromDate` (string, optional): Start date (ISO datetime)
- `toDate` (string, optional): End date (ISO datetime)
- `groupBy` (string, optional): Group by period - "day", "week", "month", "year" (default: "month")
- `includeDetails` (boolean, optional): Include detailed invoice breakdown (default: false)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRevenue": 11000.00,
      "totalSalesDiscount": 500.00,
      "netRevenue": 10500.00,
      "totalCostOfGoodsSold": 5500.00,
      "totalPurchaseDiscount": 250.00,
      "netCostOfGoodsSold": 5250.00,
      "grossProfit": 5250.00,
      "totalSalesTax": 1000.00,
      "totalPurchaseTax": 500.00,
      "netTax": 500.00,
      "netProfit": 4750.00
    },
    "byPeriod": [
      {
        "period": "2025-12",
        "revenue": 11000.00,
        "costOfGoodsSold": 5500.00,
        "grossProfit": 5500.00,
        "tax": 1100.00,
        "netProfit": 4400.00
      }
    ],
    "details": null
  }
}
```

---

#### Balance Sheet Report
**GET** `/api/reports/financial/balance-sheet`

Shows assets, liabilities, and equity.

**Query Parameters:**
- `asOfDate` (string, optional): As of date (ISO datetime, default: current date)
- `includeDetails` (boolean, optional): Include detailed AR/AP breakdown (default: false)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "asOfDate": "2025-12-31T23:59:59.999Z",
    "assets": {
      "current": {
        "cash": 500.00,
        "accountsReceivable": 3000.00,
        "total": 3500.00
      },
      "total": 3500.00
    },
    "liabilities": {
      "current": {
        "accountsPayable": 1500.00,
        "total": 1500.00
      },
      "total": 1500.00
    },
    "equity": {
      "retainedEarnings": 2000.00,
      "total": 2000.00
    },
    "balanceCheck": {
      "totalAssets": 3500.00,
      "totalLiabilitiesAndEquity": 3500.00,
      "difference": 0.00
    },
    "details": null
  }
}
```

---

#### Cash Flow Report
**GET** `/api/reports/financial/cash-flow`

Shows cash inflows and outflows.

**Query Parameters:**
- `fromDate` (string, optional): Start date (ISO datetime)
- `toDate` (string, optional): End date (ISO datetime)
- `groupBy` (string, optional): Group by period - "day", "week", "month", "year" (default: "month")
- `includeDetails` (boolean, optional): Include detailed payment breakdown (default: false)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalCashInflows": 8000.00,
      "totalCashOutflows": 4000.00,
      "netCashFlow": 4000.00
    },
    "byPeriod": [
      {
        "period": "2025-12",
        "cashInflows": 8000.00,
        "cashOutflows": 4000.00,
        "netCashFlow": 4000.00
      }
    ],
    "details": null
  }
}
```

---

#### Trial Balance Report
**GET** `/api/reports/financial/trial-balance`

Shows all account balances.

**Query Parameters:**
- `asOfDate` (string, optional): As of date (ISO datetime, default: current date)
- `includeZeroBalances` (boolean, optional): Include accounts with zero balance (default: false)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "asOfDate": "2025-12-31T23:59:59.999Z",
    "accounts": [
    {
        "account": "Sales Revenue",
        "type": "Revenue",
        "debit": 0.00,
        "credit": 11000.00,
        "balance": -11000.00
      },
{
        "account": "Purchase Expenses",
        "type": "Expense",
        "debit": 5500.00,
        "credit": 0.00,
        "balance": 5500.00
      },
      {
        "account": "Accounts Receivable",
        "type": "Asset",
        "debit": 3000.00,
        "credit": 0.00,
        "balance": 3000.00
      },
      {
        "account": "Accounts Payable",
        "type": "Liability",
        "debit": 0.00,
        "credit": 1500.00,
        "balance": -1500.00
      },
      {
        "account": "Cash",
        "type": "Asset",
        "debit": 500.00,
        "credit": 0.00,
        "balance": 500.00
      }
    ],
    "totals": {
      "totalDebits": 9000.00,
      "totalCredits": 12500.00,
      "difference": -3500.00
    }
  }
}
```

---

### Tax Reports

#### Tax Summary Report
**GET** `/api/reports/tax/summary`

Summary of tax collected and paid.

**Query Parameters:**
- `fromDate` (string, optional): Start date (ISO datetime)
- `toDate` (string, optional): End date (ISO datetime)
- `taxRate` (number, optional): Filter by tax rate
- `invoiceType` (string, optional): Filter by invoice type - "SALES", "PURCHASE", "BOTH" (default: "BOTH")

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "taxCollected": 1000.00,
      "taxPaid": 500.00,
      "netTaxPayable": 500.00
    },
    "byRate": [
      {
        "taxRate": 0.10,
        "taxCollected": 1000.00,
        "taxPaid": 500.00,
        "netTax": 500.00,
        "invoiceCount": 0
      }
    ],
    "invoiceCounts": {
      "salesInvoices": 10,
      "purchaseInvoices": 5
    }
  }
}
```

---

#### Tax Detail Report
**GET** `/api/reports/tax/detail`

Detailed list of invoices with tax information.

**Query Parameters:**
- `fromDate` (string, optional): Start date (ISO datetime)
- `toDate` (string, optional): End date (ISO datetime)
- `taxRate` (number, optional): Filter by tax rate
- `invoiceType` (string, optional): Filter by invoice type - "SALES", "PURCHASE", "BOTH" (default: "BOTH")
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 50, max: 100)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "salesInvoices": [
      {
        "id": "invoice-uuid",
        "invoiceNumber": "SI-202512-00001",
        "invoiceDate": "2025-12-01T10:00:00.000Z",
        "taxAmount": 100.00,
        "customer": {
          "id": "customer-uuid",
          "code": "CUST-001",
          "name": "Acme Corporation"
        },
  "lines": [
    {
            "taxRate": 0.10,
            "taxAmount": 100.00,
            "lineTotal": 1000.00
      }
    ]
  }
    ],
    "purchaseInvoices": [
      {
        "id": "invoice-uuid",
        "invoiceNumber": "INV-202512-001",
        "invoiceDate": "2025-12-01T10:00:00.000Z",
        "taxAmount": 50.00,
    "supplier": {
      "id": "supplier-uuid",
      "code": "SUP-001",
          "name": "Supplier Corp"
    },
    "lines": [
      {
            "taxRate": 0.10,
            "taxAmount": 50.00,
            "lineTotal": 500.00
      }
    ]
  }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

---

#### Tax by Rate Report
**GET** `/api/reports/tax/by-rate`

Groups tax by tax rate with totals.

**Query Parameters:**
- `fromDate` (string, optional): Start date (ISO datetime)
- `toDate` (string, optional): End date (ISO datetime)
- `invoiceType` (string, optional): Filter by invoice type - "SALES", "PURCHASE", "BOTH" (default: "BOTH")

**Response (200):**
```json
{
  "success": true,
  "data": {
    "byRate": [
      {
        "taxRate": 0.10,
        "taxCollected": 1000.00,
        "taxPaid": 500.00,
        "netTax": 500.00,
        "salesInvoiceCount": 10,
        "purchaseInvoiceCount": 5,
        "salesAmount": 10000.00,
        "purchaseAmount": 5000.00,
        "invoices": [
      {
            "invoiceNumber": "SI-202512-00001",
            "invoiceDate": "2025-12-01T10:00:00.000Z",
            "taxAmount": 100.00,
            "type": "SALES"
          }
        ]
      }
    ],
    "summary": {
      "totalTaxCollected": 1000.00,
      "totalTaxPaid": 500.00,
      "totalNetTax": 500.00,
      "totalSalesAmount": 10000.00,
      "totalPurchaseAmount": 5000.00
    }
  }
}
```

---

**Notes:**
- All reports are tenant-scoped and protected by Row-Level Security (RLS)
- Date filters use ISO datetime format (e.g., "2025-12-01T00:00:00.000Z")
- All monetary values are returned as Decimal numbers
- Pagination defaults to page 1 with 50 items per page (max 100)
- Reports exclude cancelled invoices unless explicitly filtered

**Last Updated**: Phase 8 Backend (Financial Reports)
