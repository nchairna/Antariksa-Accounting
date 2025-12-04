/**
 * Tax Report Service
 *
 * Business logic for tax reports
 */

import { PrismaClient } from "../generated/prisma";
import {
  TaxSummaryReportQuery,
  TaxDetailReportQuery,
  TaxByRateReportQuery,
} from "../validators/report.validator";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

/**
 * Get Tax Summary Report
 * Summary of tax collected and paid
 */
export async function getTaxSummaryReport(
  tenantId: string,
  query: TaxSummaryReportQuery
) {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const whereSales: any = {
    tenantId,
    deletedAt: null,
    status: {
      not: "CANCELLED",
    },
    taxAmount: {
      gt: 0,
    },
  };

  const wherePurchases: any = {
    tenantId,
    deletedAt: null,
    status: {
      not: "CANCELLED",
    },
    taxAmount: {
      gt: 0,
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

  if (query.taxRate !== undefined) {
    // Filter by tax rate (approximate match on line items)
    // This is simplified - in a real system, you'd query line items
  }

  const [salesInvoices, purchaseInvoices] = await Promise.all([
    query.invoiceType === "PURCHASE"
      ? []
      : prisma.salesInvoice.findMany({
          where: whereSales,
          select: {
            invoiceDate: true,
            taxAmount: true,
            grandTotal: true,
            subtotal: true,
            lines: {
              select: {
                taxRate: true,
                taxAmount: true,
                lineTotal: true,
              },
            },
          },
        }),
    query.invoiceType === "SALES"
      ? []
      : prisma.purchaseInvoice.findMany({
          where: wherePurchases,
          select: {
            invoiceDate: true,
            taxAmount: true,
            grandTotal: true,
            subtotal: true,
            lines: {
              select: {
                taxRate: true,
                taxAmount: true,
                lineTotal: true,
              },
            },
          },
        }),
  ]);

  // Calculate tax collected (from sales)
  const taxCollected = salesInvoices.reduce(
    (sum, inv) => sum.plus(inv.taxAmount),
    new Decimal(0)
  );

  // Calculate tax paid (from purchases)
  const taxPaid = purchaseInvoices.reduce(
    (sum, inv) => sum.plus(inv.taxAmount),
    new Decimal(0)
  );

  // Net tax payable
  const netTaxPayable = taxCollected.minus(taxPaid);

  // Calculate by tax rate
  const rateMap = new Map<
    string,
    {
      taxRate: Decimal;
      taxCollected: Decimal;
      taxPaid: Decimal;
      netTax: Decimal;
      invoiceCount: number;
    }
  >();

  for (const invoice of salesInvoices) {
    for (const line of invoice.lines) {
      const rate = line.taxRate;
      const rateKey = rate.toString();

      if (!rateMap.has(rateKey)) {
        rateMap.set(rateKey, {
          taxRate: rate,
          taxCollected: new Decimal(0),
          taxPaid: new Decimal(0),
          netTax: new Decimal(0),
          invoiceCount: 0,
        });
      }

      const rateData = rateMap.get(rateKey)!;
      rateData.taxCollected = rateData.taxCollected.plus(line.taxAmount);
    }
  }

  for (const invoice of purchaseInvoices) {
    for (const line of invoice.lines) {
      const rate = line.taxRate;
      const rateKey = rate.toString();

      if (!rateMap.has(rateKey)) {
        rateMap.set(rateKey, {
          taxRate: rate,
          taxCollected: new Decimal(0),
          taxPaid: new Decimal(0),
          netTax: new Decimal(0),
          invoiceCount: 0,
        });
      }

      const rateData = rateMap.get(rateKey)!;
      rateData.taxPaid = rateData.taxPaid.plus(line.taxAmount);
    }
  }

  // Calculate net tax per rate
  for (const rateData of rateMap.values()) {
    rateData.netTax = rateData.taxCollected.minus(rateData.taxPaid);
  }

  return {
    summary: {
      taxCollected,
      taxPaid,
      netTaxPayable,
    },
    byRate: Array.from(rateMap.values()).sort((a, b) =>
      Number(a.taxRate.minus(b.taxRate))
    ),
    invoiceCounts: {
      salesInvoices: salesInvoices.length,
      purchaseInvoices: purchaseInvoices.length,
    },
  };
}

/**
 * Get Tax Detail Report
 * Detailed list of invoices with tax information
 */
export async function getTaxDetailReport(
  tenantId: string,
  query: TaxDetailReportQuery
) {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const whereSales: any = {
    tenantId,
    deletedAt: null,
    status: {
      not: "CANCELLED",
    },
    taxAmount: {
      gt: 0,
    },
  };

  const wherePurchases: any = {
    tenantId,
    deletedAt: null,
    status: {
      not: "CANCELLED",
    },
    taxAmount: {
      gt: 0,
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

  const skip = (query.page - 1) * query.limit;

  const [salesInvoices, purchaseInvoices, salesCount, purchaseCount] =
    await Promise.all([
      query.invoiceType === "PURCHASE"
        ? []
        : prisma.salesInvoice.findMany({
            where: whereSales,
            skip: query.invoiceType === "BOTH" ? skip : 0,
            take: query.invoiceType === "BOTH" ? Math.floor(query.limit / 2) : query.limit,
            orderBy: {
              invoiceDate: "desc",
            },
            include: {
              customer: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                },
              },
              lines: {
                select: {
                  taxRate: true,
                  taxAmount: true,
                  lineTotal: true,
                },
              },
            },
          }),
      query.invoiceType === "SALES"
        ? []
        : prisma.purchaseInvoice.findMany({
            where: wherePurchases,
            skip: query.invoiceType === "BOTH" ? skip : 0,
            take: query.invoiceType === "BOTH" ? Math.floor(query.limit / 2) : query.limit,
            orderBy: {
              invoiceDate: "desc",
            },
            include: {
              supplier: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                },
              },
              lines: {
                select: {
                  taxRate: true,
                  taxAmount: true,
                  lineTotal: true,
                },
              },
            },
          }),
      query.invoiceType === "PURCHASE"
        ? Promise.resolve(0)
        : prisma.salesInvoice.count({ where: whereSales }),
      query.invoiceType === "SALES"
        ? Promise.resolve(0)
        : prisma.purchaseInvoice.count({ where: wherePurchases }),
    ]);

  const total = salesCount + purchaseCount;

  return {
    salesInvoices,
    purchaseInvoices,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

/**
 * Get Tax by Rate Report
 * Groups tax by tax rate
 */
export async function getTaxByRateReport(
  tenantId: string,
  query: TaxByRateReportQuery
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
    query.invoiceType === "PURCHASE"
      ? []
      : prisma.salesInvoice.findMany({
          where: whereSales,
          select: {
            invoiceDate: true,
            invoiceNumber: true,
            taxAmount: true,
            lines: {
              select: {
                taxRate: true,
                taxAmount: true,
                lineTotal: true,
              },
            },
          },
        }),
    query.invoiceType === "SALES"
      ? []
      : prisma.purchaseInvoice.findMany({
          where: wherePurchases,
          select: {
            invoiceDate: true,
            invoiceNumber: true,
            taxAmount: true,
            lines: {
              select: {
                taxRate: true,
                taxAmount: true,
                lineTotal: true,
              },
            },
          },
        }),
  ]);

  const rateMap = new Map<
    string,
    {
      taxRate: Decimal;
      taxCollected: Decimal;
      taxPaid: Decimal;
      netTax: Decimal;
      salesInvoiceCount: number;
      purchaseInvoiceCount: number;
      salesAmount: Decimal;
      purchaseAmount: Decimal;
      invoices: Array<{
        invoiceNumber: string;
        invoiceDate: Date;
        taxAmount: Decimal;
        type: "SALES" | "PURCHASE";
      }>;
    }
  >();

  for (const invoice of salesInvoices) {
    for (const line of invoice.lines) {
      if (line.taxRate.equals(0)) continue;

      const rate = line.taxRate;
      const rateKey = rate.toString();

      if (!rateMap.has(rateKey)) {
        rateMap.set(rateKey, {
          taxRate: rate,
          taxCollected: new Decimal(0),
          taxPaid: new Decimal(0),
          netTax: new Decimal(0),
          salesInvoiceCount: 0,
          purchaseInvoiceCount: 0,
          salesAmount: new Decimal(0),
          purchaseAmount: new Decimal(0),
          invoices: [],
        });
      }

      const rateData = rateMap.get(rateKey)!;
      rateData.taxCollected = rateData.taxCollected.plus(line.taxAmount);
      rateData.salesAmount = rateData.salesAmount.plus(line.lineTotal);

      // Add invoice if not already added
      if (
        !rateData.invoices.find(
          (inv) =>
            inv.invoiceNumber === invoice.invoiceNumber && inv.type === "SALES"
        )
      ) {
        rateData.invoices.push({
          invoiceNumber: invoice.invoiceNumber,
          invoiceDate: invoice.invoiceDate,
          taxAmount: invoice.taxAmount,
          type: "SALES",
        });
        rateData.salesInvoiceCount += 1;
      }
    }
  }

  for (const invoice of purchaseInvoices) {
    for (const line of invoice.lines) {
      if (line.taxRate.equals(0)) continue;

      const rate = line.taxRate;
      const rateKey = rate.toString();

      if (!rateMap.has(rateKey)) {
        rateMap.set(rateKey, {
          taxRate: rate,
          taxCollected: new Decimal(0),
          taxPaid: new Decimal(0),
          netTax: new Decimal(0),
          salesInvoiceCount: 0,
          purchaseInvoiceCount: 0,
          salesAmount: new Decimal(0),
          purchaseAmount: new Decimal(0),
          invoices: [],
        });
      }

      const rateData = rateMap.get(rateKey)!;
      rateData.taxPaid = rateData.taxPaid.plus(line.taxAmount);
      rateData.purchaseAmount = rateData.purchaseAmount.plus(line.lineTotal);

      // Add invoice if not already added
      if (
        !rateData.invoices.find(
          (inv) =>
            inv.invoiceNumber === invoice.invoiceNumber &&
            inv.type === "PURCHASE"
        )
      ) {
        rateData.invoices.push({
          invoiceNumber: invoice.invoiceNumber,
          invoiceDate: invoice.invoiceDate,
          taxAmount: invoice.taxAmount,
          type: "PURCHASE",
        });
        rateData.purchaseInvoiceCount += 1;
      }
    }
  }

  // Calculate net tax per rate
  for (const rateData of rateMap.values()) {
    rateData.netTax = rateData.taxCollected.minus(rateData.taxPaid);
  }

  const byRate = Array.from(rateMap.values()).sort((a, b) =>
    Number(a.taxRate.minus(b.taxRate))
  );

  const summary = byRate.reduce(
    (acc, rate) => ({
      totalTaxCollected: acc.totalTaxCollected.plus(rate.taxCollected),
      totalTaxPaid: acc.totalTaxPaid.plus(rate.taxPaid),
      totalNetTax: acc.totalNetTax.plus(rate.netTax),
      totalSalesAmount: acc.totalSalesAmount.plus(rate.salesAmount),
      totalPurchaseAmount: acc.totalPurchaseAmount.plus(rate.purchaseAmount),
    }),
    {
      totalTaxCollected: new Decimal(0),
      totalTaxPaid: new Decimal(0),
      totalNetTax: new Decimal(0),
      totalSalesAmount: new Decimal(0),
      totalPurchaseAmount: new Decimal(0),
    }
  );

  return {
    byRate,
    summary,
  };
}

