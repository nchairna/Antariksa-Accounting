/**
 * Purchase Report Service
 *
 * Business logic for purchase reports
 */

import { PrismaClient } from "../generated/prisma";
import {
  PurchaseSummaryReportQuery,
  PurchaseDetailReportQuery,
  PurchaseBySupplierReportQuery,
  PurchaseByItemReportQuery,
} from "../validators/report.validator";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

/**
 * Get Purchase Summary Report
 * Groups purchases by time period (day/week/month/year)
 */
export async function getPurchaseSummaryReport(
  tenantId: string,
  query: PurchaseSummaryReportQuery
) {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const where: any = {
    tenantId,
    deletedAt: null,
    status: {
      not: "CANCELLED",
    },
  };

  if (query.fromDate || query.toDate) {
    where.invoiceDate = {};
    if (query.fromDate) {
      where.invoiceDate.gte = new Date(query.fromDate);
    }
    if (query.toDate) {
      where.invoiceDate.lte = new Date(query.toDate);
    }
  }

  if (query.supplierId) {
    where.supplierId = query.supplierId;
  }

  if (query.status) {
    where.status = query.status;
  }

  const invoices = await prisma.purchaseInvoice.findMany({
    where,
    select: {
      invoiceDate: true,
      grandTotal: true,
      amountPaid: true,
      balanceDue: true,
      subtotal: true,
      discountAmount: true,
      taxAmount: true,
    },
    orderBy: {
      invoiceDate: "asc",
    },
  });

  // Group by time period
  const periodMap = new Map<
    string,
    {
      period: string;
      invoiceCount: number;
      totalPurchases: Decimal;
      totalPaid: Decimal;
      totalOutstanding: Decimal;
      totalSubtotal: Decimal;
      totalDiscount: Decimal;
      totalTax: Decimal;
    }
  >();

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

  let totalInvoiceCount = 0;
  let totalPurchases = new Decimal(0);
  let totalPaid = new Decimal(0);
  let totalOutstanding = new Decimal(0);
  let totalSubtotal = new Decimal(0);
  let totalDiscount = new Decimal(0);
  let totalTax = new Decimal(0);

  for (const invoice of invoices) {
    const period = formatPeriod(invoice.invoiceDate, query.groupBy);

    if (!periodMap.has(period)) {
      periodMap.set(period, {
        period,
        invoiceCount: 0,
        totalPurchases: new Decimal(0),
        totalPaid: new Decimal(0),
        totalOutstanding: new Decimal(0),
        totalSubtotal: new Decimal(0),
        totalDiscount: new Decimal(0),
        totalTax: new Decimal(0),
      });
    }

    const periodData = periodMap.get(period)!;
    periodData.invoiceCount += 1;
    periodData.totalPurchases = periodData.totalPurchases.plus(invoice.grandTotal);
    periodData.totalPaid = periodData.totalPaid.plus(invoice.amountPaid);
    periodData.totalOutstanding = periodData.totalOutstanding.plus(invoice.balanceDue);
    periodData.totalSubtotal = periodData.totalSubtotal.plus(invoice.subtotal);
    periodData.totalDiscount = periodData.totalDiscount.plus(invoice.discountAmount);
    periodData.totalTax = periodData.totalTax.plus(invoice.taxAmount);

    totalInvoiceCount += 1;
    totalPurchases = totalPurchases.plus(invoice.grandTotal);
    totalPaid = totalPaid.plus(invoice.amountPaid);
    totalOutstanding = totalOutstanding.plus(invoice.balanceDue);
    totalSubtotal = totalSubtotal.plus(invoice.subtotal);
    totalDiscount = totalDiscount.plus(invoice.discountAmount);
    totalTax = totalTax.plus(invoice.taxAmount);
  }

  const periods = Array.from(periodMap.values()).sort((a, b) =>
    a.period.localeCompare(b.period)
  );

  return {
    periods,
    summary: {
      totalInvoiceCount,
      totalPurchases,
      totalPaid,
      totalOutstanding,
      totalSubtotal,
      totalDiscount,
      totalTax,
    },
  };
}

/**
 * Get Purchase Detail Report
 * Detailed list of purchase invoices with pagination
 */
export async function getPurchaseDetailReport(
  tenantId: string,
  query: PurchaseDetailReportQuery
) {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const where: any = {
    tenantId,
    deletedAt: null,
  };

  if (query.fromDate || query.toDate) {
    where.invoiceDate = {};
    if (query.fromDate) {
      where.invoiceDate.gte = new Date(query.fromDate);
    }
    if (query.toDate) {
      where.invoiceDate.lte = new Date(query.toDate);
    }
  }

  if (query.supplierId) {
    where.supplierId = query.supplierId;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.invoiceId) {
    where.id = query.invoiceId;
  }

  const skip = (query.page - 1) * query.limit;

  const [invoices, total] = await Promise.all([
    prisma.purchaseInvoice.findMany({
      where,
      skip,
      take: query.limit,
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
        },
      },
    }),
    prisma.purchaseInvoice.count({ where }),
  ]);

  return {
    invoices,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

/**
 * Get Purchase by Supplier Report
 * Groups purchases by supplier with totals
 */
export async function getPurchaseBySupplierReport(
  tenantId: string,
  query: PurchaseBySupplierReportQuery
) {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const where: any = {
    tenantId,
    deletedAt: null,
    status: {
      not: "CANCELLED",
    },
  };

  if (query.fromDate || query.toDate) {
    where.invoiceDate = {};
    if (query.fromDate) {
      where.invoiceDate.gte = new Date(query.fromDate);
    }
    if (query.toDate) {
      where.invoiceDate.lte = new Date(query.toDate);
    }
  }

  if (query.supplierId) {
    where.supplierId = query.supplierId;
  }

  const invoices = await prisma.purchaseInvoice.findMany({
    where,
    select: {
      supplierId: true,
      grandTotal: true,
      amountPaid: true,
      balanceDue: true,
      supplier: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
  });

  const supplierMap = new Map<
    string,
    {
      supplier: any;
      invoiceCount: number;
      totalPurchases: Decimal;
      totalPaid: Decimal;
      totalOutstanding: Decimal;
    }
  >();

  for (const invoice of invoices) {
    const supplierId = invoice.supplierId;
    if (!supplierMap.has(supplierId)) {
      supplierMap.set(supplierId, {
        supplier: invoice.supplier,
        invoiceCount: 0,
        totalPurchases: new Decimal(0),
        totalPaid: new Decimal(0),
        totalOutstanding: new Decimal(0),
      });
    }

    const supplierData = supplierMap.get(supplierId)!;
    supplierData.invoiceCount += 1;
    supplierData.totalPurchases = supplierData.totalPurchases.plus(invoice.grandTotal);
    supplierData.totalPaid = supplierData.totalPaid.plus(invoice.amountPaid);
    supplierData.totalOutstanding = supplierData.totalOutstanding.plus(invoice.balanceDue);
  }

  let suppliers = Array.from(supplierMap.values());

  // Apply amount filters
  if (query.minAmount !== undefined) {
    suppliers = suppliers.filter((s) => Number(s.totalPurchases) >= query.minAmount!);
  }
  if (query.maxAmount !== undefined) {
    suppliers = suppliers.filter((s) => Number(s.totalPurchases) <= query.maxAmount!);
  }

  // Calculate totals
  const summary = suppliers.reduce(
    (acc, supplier) => ({
      totalSuppliers: acc.totalSuppliers + 1,
      totalInvoiceCount: acc.totalInvoiceCount + supplier.invoiceCount,
      totalPurchases: acc.totalPurchases.plus(supplier.totalPurchases),
      totalPaid: acc.totalPaid.plus(supplier.totalPaid),
      totalOutstanding: acc.totalOutstanding.plus(supplier.totalOutstanding),
    }),
    {
      totalSuppliers: 0,
      totalInvoiceCount: 0,
      totalPurchases: new Decimal(0),
      totalPaid: new Decimal(0),
      totalOutstanding: new Decimal(0),
    }
  );

  return {
    bySupplier: suppliers.sort((a, b) =>
      Number(b.totalPurchases.minus(a.totalPurchases))
    ),
    summary,
  };
}

/**
 * Get Purchase by Item Report
 * Groups purchases by item with quantities and totals
 */
export async function getPurchaseByItemReport(
  tenantId: string,
  query: PurchaseByItemReportQuery
) {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const where: any = {
    tenantId,
    purchaseInvoice: {
      status: {
        not: "CANCELLED",
      },
      deletedAt: null,
    },
  };

  if (query.fromDate || query.toDate) {
    where.purchaseInvoice = {
      ...where.purchaseInvoice,
      invoiceDate: {},
    };
    if (query.fromDate) {
      where.purchaseInvoice.invoiceDate.gte = new Date(query.fromDate);
    }
    if (query.toDate) {
      where.purchaseInvoice.invoiceDate.lte = new Date(query.toDate);
    }
  }

  if (query.itemId) {
    where.itemId = query.itemId;
  }

  if (query.categoryId) {
    where.item = {
      categoryId: query.categoryId,
    };
  }

  const lines = await prisma.purchaseInvoiceLine.findMany({
    where,
    select: {
      itemId: true,
      quantityReceived: true,
      unitCost: true,
      lineTotal: true,
      item: {
        select: {
          id: true,
          code: true,
          name: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  const itemMap = new Map<
    string,
    {
      item: any;
      totalQuantity: Decimal;
      totalPurchases: Decimal;
      averageCost: Decimal;
      invoiceCount: number;
    }
  >();

  for (const line of lines) {
    if (!line.itemId) continue;

    const itemId = line.itemId;
    if (!itemMap.has(itemId)) {
      itemMap.set(itemId, {
        item: line.item,
        totalQuantity: new Decimal(0),
        totalPurchases: new Decimal(0),
        averageCost: new Decimal(0),
        invoiceCount: 0,
      });
    }

    const itemData = itemMap.get(itemId)!;
    itemData.totalQuantity = itemData.totalQuantity.plus(line.quantityReceived);
    itemData.totalPurchases = itemData.totalPurchases.plus(line.lineTotal);
    itemData.invoiceCount += 1;
  }

  // Calculate average costs
  for (const itemData of itemMap.values()) {
    if (itemData.totalQuantity.gt(0)) {
      itemData.averageCost = itemData.totalPurchases.dividedBy(itemData.totalQuantity);
    }
  }

  let items = Array.from(itemMap.values());

  // Apply quantity filters
  if (query.minQuantity !== undefined) {
    items = items.filter((i) => Number(i.totalQuantity) >= query.minQuantity!);
  }
  if (query.maxQuantity !== undefined) {
    items = items.filter((i) => Number(i.totalQuantity) <= query.maxQuantity!);
  }

  // Calculate summary
  const summary = items.reduce(
    (acc, item) => ({
      totalItems: acc.totalItems + 1,
      totalQuantity: acc.totalQuantity.plus(item.totalQuantity),
      totalPurchases: acc.totalPurchases.plus(item.totalPurchases),
    }),
    {
      totalItems: 0,
      totalQuantity: new Decimal(0),
      totalPurchases: new Decimal(0),
    }
  );

  return {
    byItem: items.sort((a, b) => Number(b.totalPurchases.minus(a.totalPurchases))),
    summary,
  };
}

