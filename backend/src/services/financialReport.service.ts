/**
 * Financial Report Service
 *
 * Business logic for financial statements (P&L, Balance Sheet, Cash Flow, Trial Balance)
 */

import { PrismaClient } from "../generated/prisma";
import {
  ProfitLossReportQuery,
  BalanceSheetReportQuery,
  CashFlowReportQuery,
  TrialBalanceReportQuery,
} from "../validators/report.validator";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

/**
 * Get Profit & Loss Report
 * Shows revenue, expenses, and net profit/loss
 */
export async function getProfitLossReport(
  tenantId: string,
  query: ProfitLossReportQuery
) {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const whereSales: any = {
    tenantId,
    deletedAt: null,
    status: {
      not: "CANCELLED",
    },
  };

  const wherePurchases: any = {
    tenantId,
    deletedAt: null,
    status: {
      not: "CANCELLED",
    },
  };

  if (query.fromDate || query.toDate) {
    const dateFilter: any = {};
    if (query.fromDate) {
      dateFilter.gte = new Date(query.fromDate);
    }
    if (query.toDate) {
      dateFilter.lte = new Date(query.toDate);
    }
    whereSales.invoiceDate = dateFilter;
    wherePurchases.invoiceDate = dateFilter;
  }

  const [salesInvoices, purchaseInvoices] = await Promise.all([
    prisma.salesInvoice.findMany({
      where: whereSales,
      select: {
        invoiceDate: true,
        subtotal: true,
        discountAmount: true,
        taxAmount: true,
        grandTotal: true,
        amountPaid: true,
        lines: query.includeDetails
          ? {
              select: {
                itemId: true,
                quantity: true,
                unitPrice: true,
                lineTotal: true,
                item: {
                  select: {
                    code: true,
                    name: true,
                  },
                },
              },
            }
          : undefined,
      },
    }),
    prisma.purchaseInvoice.findMany({
      where: wherePurchases,
      select: {
        invoiceDate: true,
        subtotal: true,
        discountAmount: true,
        taxAmount: true,
        grandTotal: true,
        amountPaid: true,
        lines: query.includeDetails
          ? {
              select: {
                itemId: true,
                quantityReceived: true,
                unitCost: true,
                lineTotal: true,
                item: {
                  select: {
                    code: true,
                    name: true,
                  },
                },
              },
            }
          : undefined,
      },
    }),
  ]);

  // Calculate revenue (sales)
  const totalRevenue = salesInvoices.reduce(
    (sum, inv) => sum.plus(inv.grandTotal),
    new Decimal(0)
  );
  const totalSalesDiscount = salesInvoices.reduce(
    (sum, inv) => sum.plus(inv.discountAmount),
    new Decimal(0)
  );
  const netRevenue = totalRevenue.minus(totalSalesDiscount);

  // Calculate cost of goods sold (purchases)
  const totalCostOfGoodsSold = purchaseInvoices.reduce(
    (sum, inv) => sum.plus(inv.grandTotal),
    new Decimal(0)
  );
  const totalPurchaseDiscount = purchaseInvoices.reduce(
    (sum, inv) => sum.plus(inv.discountAmount),
    new Decimal(0)
  );
  const netCostOfGoodsSold = totalCostOfGoodsSold.minus(totalPurchaseDiscount);

  // Calculate gross profit
  const grossProfit = netRevenue.minus(netCostOfGoodsSold);

  // Calculate taxes
  const totalSalesTax = salesInvoices.reduce(
    (sum, inv) => sum.plus(inv.taxAmount),
    new Decimal(0)
  );
  const totalPurchaseTax = purchaseInvoices.reduce(
    (sum, inv) => sum.plus(inv.taxAmount),
    new Decimal(0)
  );
  const netTax = totalSalesTax.minus(totalPurchaseTax);

  // Net profit/loss
  const netProfit = grossProfit.minus(netTax);

  // Group by period if needed
  const formatPeriod = (date: Date, groupBy: string): string => {
    const d = new Date(date);
    switch (groupBy) {
      case "day":
        return d.toISOString().split("T")[0];
      case "week":
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        return weekStart.toISOString().split("T")[0];
      case "month":
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      case "year":
        return String(d.getFullYear());
      default:
        return d.toISOString().split("T")[0];
    }
  };

  const periodMap = new Map<
    string,
    {
      period: string;
      revenue: Decimal;
      costOfGoodsSold: Decimal;
      grossProfit: Decimal;
      tax: Decimal;
      netProfit: Decimal;
    }
  >();

  for (const invoice of salesInvoices) {
    const period = formatPeriod(invoice.invoiceDate, query.groupBy);
    if (!periodMap.has(period)) {
      periodMap.set(period, {
        period,
        revenue: new Decimal(0),
        costOfGoodsSold: new Decimal(0),
        grossProfit: new Decimal(0),
        tax: new Decimal(0),
        netProfit: new Decimal(0),
      });
    }
    const periodData = periodMap.get(period)!;
    periodData.revenue = periodData.revenue.plus(invoice.grandTotal);
  }

  for (const invoice of purchaseInvoices) {
    const period = formatPeriod(invoice.invoiceDate, query.groupBy);
    if (!periodMap.has(period)) {
      periodMap.set(period, {
        period,
        revenue: new Decimal(0),
        costOfGoodsSold: new Decimal(0),
        grossProfit: new Decimal(0),
        tax: new Decimal(0),
        netProfit: new Decimal(0),
      });
    }
    const periodData = periodMap.get(period)!;
    periodData.costOfGoodsSold = periodData.costOfGoodsSold.plus(invoice.grandTotal);
  }

  // Calculate period-level metrics
  for (const periodData of periodMap.values()) {
    periodData.grossProfit = periodData.revenue.minus(periodData.costOfGoodsSold);
    // Simplified tax calculation per period
    periodData.tax = periodData.revenue.times(0.1); // 10% estimate, should be calculated from actual tax
    periodData.netProfit = periodData.grossProfit.minus(periodData.tax);
  }

  return {
    summary: {
      totalRevenue,
      totalSalesDiscount,
      netRevenue,
      totalCostOfGoodsSold,
      totalPurchaseDiscount,
      netCostOfGoodsSold,
      grossProfit,
      totalSalesTax,
      totalPurchaseTax,
      netTax,
      netProfit,
    },
    byPeriod: Array.from(periodMap.values()).sort((a, b) =>
      a.period.localeCompare(b.period)
    ),
    details: query.includeDetails
      ? {
          salesInvoices,
          purchaseInvoices,
        }
      : undefined,
  };
}

/**
 * Get Balance Sheet Report
 * Shows assets, liabilities, and equity
 */
export async function getBalanceSheetReport(
  tenantId: string,
  query: BalanceSheetReportQuery
) {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const asOfDate = query.asOfDate ? new Date(query.asOfDate) : new Date();

  // Accounts Receivable (AR) - Outstanding sales invoices
  const arInvoices = await prisma.salesInvoice.findMany({
    where: {
      tenantId,
      deletedAt: null,
      status: {
        in: ["SENT", "PARTIALLY_PAID", "OVERDUE"],
      },
      balanceDue: {
        gt: 0,
      },
      invoiceDate: {
        lte: asOfDate,
      },
    },
    select: {
      balanceDue: true,
      customer: query.includeDetails
        ? {
            select: {
              id: true,
              code: true,
              name: true,
            },
          }
        : undefined,
    },
  });

  const accountsReceivable = arInvoices.reduce(
    (sum, inv) => sum.plus(inv.balanceDue),
    new Decimal(0)
  );

  // Accounts Payable (AP) - Outstanding purchase invoices
  const apInvoices = await prisma.purchaseInvoice.findMany({
    where: {
      tenantId,
      deletedAt: null,
      status: {
        in: ["APPROVED", "PARTIALLY_PAID", "OVERDUE"],
      },
      balanceDue: {
        gt: 0,
      },
      invoiceDate: {
        lte: asOfDate,
      },
    },
    select: {
      balanceDue: true,
      supplier: query.includeDetails
        ? {
            select: {
              id: true,
              code: true,
              name: true,
            },
          }
        : undefined,
    },
  });

  const accountsPayable = apInvoices.reduce(
    (sum, inv) => sum.plus(inv.balanceDue),
    new Decimal(0)
  );

  // Cash - Total payments received minus payments made
  const customerPayments = await prisma.payment.findMany({
    where: {
      tenantId,
      deletedAt: null,
      paymentType: "CUSTOMER_PAYMENT",
      status: "COMPLETED",
      paymentDate: {
        lte: asOfDate,
      },
    },
    select: {
      amount: true,
    },
  });

  const supplierPayments = await prisma.payment.findMany({
    where: {
      tenantId,
      deletedAt: null,
      paymentType: "SUPPLIER_PAYMENT",
      status: "COMPLETED",
      paymentDate: {
        lte: asOfDate,
      },
    },
    select: {
      amount: true,
    },
  });

  const cashReceived = customerPayments.reduce(
    (sum, p) => sum.plus(p.amount),
    new Decimal(0)
  );
  const cashPaid = supplierPayments.reduce(
    (sum, p) => sum.plus(p.amount),
    new Decimal(0)
  );
  const cash = cashReceived.minus(cashPaid);

  // Calculate equity (simplified: revenue - expenses)
  const salesInvoices = await prisma.salesInvoice.findMany({
    where: {
      tenantId,
      deletedAt: null,
      status: {
        not: "CANCELLED",
      },
      invoiceDate: {
        lte: asOfDate,
      },
    },
    select: {
      grandTotal: true,
    },
  });

  const purchaseInvoices = await prisma.purchaseInvoice.findMany({
    where: {
      tenantId,
      deletedAt: null,
      status: {
        not: "CANCELLED",
      },
      invoiceDate: {
        lte: asOfDate,
      },
    },
    select: {
      grandTotal: true,
    },
  });

  const totalRevenue = salesInvoices.reduce(
    (sum, inv) => sum.plus(inv.grandTotal),
    new Decimal(0)
  );
  const totalExpenses = purchaseInvoices.reduce(
    (sum, inv) => sum.plus(inv.grandTotal),
    new Decimal(0)
  );
  const retainedEarnings = totalRevenue.minus(totalExpenses);

  // Assets
  const assets = {
    current: {
      cash,
      accountsReceivable,
      total: cash.plus(accountsReceivable),
    },
    total: cash.plus(accountsReceivable),
  };

  // Liabilities
  const liabilities = {
    current: {
      accountsPayable,
      total: accountsPayable,
    },
    total: accountsPayable,
  };

  // Equity
  const equity = {
    retainedEarnings,
    total: retainedEarnings,
  };

  // Balance check: Assets = Liabilities + Equity
  const totalAssets = assets.total;
  const totalLiabilitiesAndEquity = liabilities.total.plus(equity.total);

  return {
    asOfDate,
    assets,
    liabilities,
    equity,
    balanceCheck: {
      totalAssets,
      totalLiabilitiesAndEquity,
      difference: totalAssets.minus(totalLiabilitiesAndEquity),
    },
    details: query.includeDetails
      ? {
          arInvoices,
          apInvoices,
        }
      : undefined,
  };
}

/**
 * Get Cash Flow Report
 * Shows cash inflows and outflows
 */
export async function getCashFlowReport(
  tenantId: string,
  query: CashFlowReportQuery
) {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const where: any = {
    tenantId,
    deletedAt: null,
    status: "COMPLETED",
  };

  if (query.fromDate || query.toDate) {
    where.paymentDate = {};
    if (query.fromDate) {
      where.paymentDate.gte = new Date(query.fromDate);
    }
    if (query.toDate) {
      where.paymentDate.lte = new Date(query.toDate);
    }
  }

  const payments = await prisma.payment.findMany({
    where,
    select: {
      paymentDate: true,
      paymentType: true,
      amount: true,
      paymentMethod: true,
      customer: query.includeDetails
        ? {
            select: {
              code: true,
              name: true,
            },
          }
        : undefined,
      supplier: query.includeDetails
        ? {
            select: {
              code: true,
              name: true,
            },
          }
        : undefined,
    },
    orderBy: {
      paymentDate: "asc",
    },
  });

  const formatPeriod = (date: Date, groupBy: string): string => {
    const d = new Date(date);
    switch (groupBy) {
      case "day":
        return d.toISOString().split("T")[0];
      case "week":
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        return weekStart.toISOString().split("T")[0];
      case "month":
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      case "year":
        return String(d.getFullYear());
      default:
        return d.toISOString().split("T")[0];
    }
  };

  const periodMap = new Map<
    string,
    {
      period: string;
      cashInflows: Decimal;
      cashOutflows: Decimal;
      netCashFlow: Decimal;
    }
  >();

  let totalCashInflows = new Decimal(0);
  let totalCashOutflows = new Decimal(0);

  for (const payment of payments) {
    const period = formatPeriod(payment.paymentDate, query.groupBy);

    if (!periodMap.has(period)) {
      periodMap.set(period, {
        period,
        cashInflows: new Decimal(0),
        cashOutflows: new Decimal(0),
        netCashFlow: new Decimal(0),
      });
    }

    const periodData = periodMap.get(period)!;

    if (payment.paymentType === "CUSTOMER_PAYMENT") {
      periodData.cashInflows = periodData.cashInflows.plus(payment.amount);
      totalCashInflows = totalCashInflows.plus(payment.amount);
    } else {
      periodData.cashOutflows = periodData.cashOutflows.plus(payment.amount);
      totalCashOutflows = totalCashOutflows.plus(payment.amount);
    }

    periodData.netCashFlow = periodData.cashInflows.minus(periodData.cashOutflows);
  }

  const netCashFlow = totalCashInflows.minus(totalCashOutflows);

  return {
    summary: {
      totalCashInflows,
      totalCashOutflows,
      netCashFlow,
    },
    byPeriod: Array.from(periodMap.values()).sort((a, b) =>
      a.period.localeCompare(b.period)
    ),
    details: query.includeDetails ? payments : undefined,
  };
}

/**
 * Get Trial Balance Report
 * Shows all account balances
 */
export async function getTrialBalanceReport(
  tenantId: string,
  query: TrialBalanceReportQuery
) {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const asOfDate = query.asOfDate ? new Date(query.asOfDate) : new Date();

  // Sales Revenue
  const salesInvoices = await prisma.salesInvoice.findMany({
    where: {
      tenantId,
      deletedAt: null,
      status: {
        not: "CANCELLED",
      },
      invoiceDate: {
        lte: asOfDate,
      },
    },
    select: {
      grandTotal: true,
    },
  });

  const salesRevenue = salesInvoices.reduce(
    (sum, inv) => sum.plus(inv.grandTotal),
    new Decimal(0)
  );

  // Purchase Expenses
  const purchaseInvoices = await prisma.purchaseInvoice.findMany({
    where: {
      tenantId,
      deletedAt: null,
      status: {
        not: "CANCELLED",
      },
      invoiceDate: {
        lte: asOfDate,
      },
    },
    select: {
      grandTotal: true,
    },
  });

  const purchaseExpenses = purchaseInvoices.reduce(
    (sum, inv) => sum.plus(inv.grandTotal),
    new Decimal(0)
  );

  // Accounts Receivable
  const arInvoices = await prisma.salesInvoice.findMany({
    where: {
      tenantId,
      deletedAt: null,
      balanceDue: {
        gt: 0,
      },
      invoiceDate: {
        lte: asOfDate,
      },
    },
    select: {
      balanceDue: true,
    },
  });

  const accountsReceivable = arInvoices.reduce(
    (sum, inv) => sum.plus(inv.balanceDue),
    new Decimal(0)
  );

  // Accounts Payable
  const apInvoices = await prisma.purchaseInvoice.findMany({
    where: {
      tenantId,
      deletedAt: null,
      balanceDue: {
        gt: 0,
      },
      invoiceDate: {
        lte: asOfDate,
      },
    },
    select: {
      balanceDue: true,
    },
  });

  const accountsPayable = apInvoices.reduce(
    (sum, inv) => sum.plus(inv.balanceDue),
    new Decimal(0)
  );

  // Cash
  const customerPayments = await prisma.payment.findMany({
    where: {
      tenantId,
      deletedAt: null,
      paymentType: "CUSTOMER_PAYMENT",
      status: "COMPLETED",
      paymentDate: {
        lte: asOfDate,
      },
    },
    select: {
      amount: true,
    },
  });

  const supplierPayments = await prisma.payment.findMany({
    where: {
      tenantId,
      deletedAt: null,
      paymentType: "SUPPLIER_PAYMENT",
      status: "COMPLETED",
      paymentDate: {
        lte: asOfDate,
      },
    },
    select: {
      amount: true,
    },
  });

  const cashReceived = customerPayments.reduce(
    (sum, p) => sum.plus(p.amount),
    new Decimal(0)
  );
  const cashPaid = supplierPayments.reduce(
    (sum, p) => sum.plus(p.amount),
    new Decimal(0)
  );
  const cash = cashReceived.minus(cashPaid);

  const accounts = [
    {
      account: "Sales Revenue",
      type: "Revenue",
      debit: new Decimal(0),
      credit: salesRevenue,
      balance: salesRevenue.negated(), // Revenue is negative in trial balance
    },
    {
      account: "Purchase Expenses",
      type: "Expense",
      debit: purchaseExpenses,
      credit: new Decimal(0),
      balance: purchaseExpenses,
    },
    {
      account: "Accounts Receivable",
      type: "Asset",
      debit: accountsReceivable,
      credit: new Decimal(0),
      balance: accountsReceivable,
    },
    {
      account: "Accounts Payable",
      type: "Liability",
      debit: new Decimal(0),
      credit: accountsPayable,
      balance: accountsPayable.negated(), // Liabilities are negative
    },
    {
      account: "Cash",
      type: "Asset",
      debit: cash,
      credit: new Decimal(0),
      balance: cash,
    },
  ];

  // Filter zero balances if requested
  const filteredAccounts = query.includeZeroBalances
    ? accounts
    : accounts.filter((acc) => !acc.balance.equals(0));

  const totalDebits = filteredAccounts.reduce(
    (sum, acc) => sum.plus(acc.debit),
    new Decimal(0)
  );
  const totalCredits = filteredAccounts.reduce(
    (sum, acc) => sum.plus(acc.credit),
    new Decimal(0)
  );

  return {
    asOfDate,
    accounts: filteredAccounts,
    totals: {
      totalDebits,
      totalCredits,
      difference: totalDebits.minus(totalCredits),
    },
  };
}

