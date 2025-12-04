/**
 * Sales Report Service
 *
 * Business logic for sales reports
 */

import { PrismaClient } from "../generated/prisma";
import {
  SalesSummaryReportQuery,
  SalesDetailReportQuery,
  SalesByCustomerReportQuery,
  SalesByItemReportQuery,
  SalesTrendAnalysisQuery,
} from "../validators/report.validator";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

/**
 * Get Sales Summary Report
 * Groups sales by time period (day/week/month/year)
 */
export async function getSalesSummaryReport(
  tenantId: string,
  query: SalesSummaryReportQuery
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

  if (query.customerId) {
    where.customerId = query.customerId;
  }

  if (query.status) {
    where.status = query.status;
  }

  const invoices = await prisma.salesInvoice.findMany({
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
      totalSales: Decimal;
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
  let totalSales = new Decimal(0);
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
        totalSales: new Decimal(0),
        totalPaid: new Decimal(0),
        totalOutstanding: new Decimal(0),
        totalSubtotal: new Decimal(0),
        totalDiscount: new Decimal(0),
        totalTax: new Decimal(0),
      });
    }

    const periodData = periodMap.get(period)!;
    periodData.invoiceCount += 1;
    periodData.totalSales = periodData.totalSales.plus(invoice.grandTotal);
    periodData.totalPaid = periodData.totalPaid.plus(invoice.amountPaid);
    periodData.totalOutstanding = periodData.totalOutstanding.plus(invoice.balanceDue);
    periodData.totalSubtotal = periodData.totalSubtotal.plus(invoice.subtotal);
    periodData.totalDiscount = periodData.totalDiscount.plus(invoice.discountAmount);
    periodData.totalTax = periodData.totalTax.plus(invoice.taxAmount);

    totalInvoiceCount += 1;
    totalSales = totalSales.plus(invoice.grandTotal);
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
      totalSales,
      totalPaid,
      totalOutstanding,
      totalSubtotal,
      totalDiscount,
      totalTax,
    },
  };
}

/**
 * Get Sales Detail Report
 * Detailed list of sales invoices with pagination
 */
export async function getSalesDetailReport(
  tenantId: string,
  query: SalesDetailReportQuery
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

  if (query.customerId) {
    where.customerId = query.customerId;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.invoiceId) {
    where.id = query.invoiceId;
  }

  const skip = (query.page - 1) * query.limit;

  const [invoices, total] = await Promise.all([
    prisma.salesInvoice.findMany({
      where,
      skip,
      take: query.limit,
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
        },
      },
    }),
    prisma.salesInvoice.count({ where }),
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
 * Get Sales by Customer Report
 * Groups sales by customer with totals
 */
export async function getSalesByCustomerReport(
  tenantId: string,
  query: SalesByCustomerReportQuery
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

  if (query.customerId) {
    where.customerId = query.customerId;
  }

  const invoices = await prisma.salesInvoice.findMany({
    where,
    select: {
      customerId: true,
      grandTotal: true,
      amountPaid: true,
      balanceDue: true,
      customer: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
  });

  const customerMap = new Map<
    string,
    {
      customer: any;
      invoiceCount: number;
      totalSales: Decimal;
      totalPaid: Decimal;
      totalOutstanding: Decimal;
    }
  >();

  for (const invoice of invoices) {
    const customerId = invoice.customerId;
    if (!customerMap.has(customerId)) {
      customerMap.set(customerId, {
        customer: invoice.customer,
        invoiceCount: 0,
        totalSales: new Decimal(0),
        totalPaid: new Decimal(0),
        totalOutstanding: new Decimal(0),
      });
    }

    const customerData = customerMap.get(customerId)!;
    customerData.invoiceCount += 1;
    customerData.totalSales = customerData.totalSales.plus(invoice.grandTotal);
    customerData.totalPaid = customerData.totalPaid.plus(invoice.amountPaid);
    customerData.totalOutstanding = customerData.totalOutstanding.plus(invoice.balanceDue);
  }

  let customers = Array.from(customerMap.values());

  // Apply amount filters
  if (query.minAmount !== undefined) {
    customers = customers.filter((c) => Number(c.totalSales) >= query.minAmount!);
  }
  if (query.maxAmount !== undefined) {
    customers = customers.filter((c) => Number(c.totalSales) <= query.maxAmount!);
  }

  // Calculate totals
  const summary = customers.reduce(
    (acc, customer) => ({
      totalCustomers: acc.totalCustomers + 1,
      totalInvoiceCount: acc.totalInvoiceCount + customer.invoiceCount,
      totalSales: acc.totalSales.plus(customer.totalSales),
      totalPaid: acc.totalPaid.plus(customer.totalPaid),
      totalOutstanding: acc.totalOutstanding.plus(customer.totalOutstanding),
    }),
    {
      totalCustomers: 0,
      totalInvoiceCount: 0,
      totalSales: new Decimal(0),
      totalPaid: new Decimal(0),
      totalOutstanding: new Decimal(0),
    }
  );

  return {
    byCustomer: customers.sort((a, b) =>
      Number(b.totalSales.minus(a.totalSales))
    ),
    summary,
  };
}

/**
 * Get Sales by Item Report
 * Groups sales by item with quantities and totals
 */
export async function getSalesByItemReport(
  tenantId: string,
  query: SalesByItemReportQuery
) {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const where: any = {
    tenantId,
    salesInvoice: {
      status: {
        not: "CANCELLED",
      },
      deletedAt: null,
    },
  };

  if (query.fromDate || query.toDate) {
    where.salesInvoice = {
      ...where.salesInvoice,
      invoiceDate: {},
    };
    if (query.fromDate) {
      where.salesInvoice.invoiceDate.gte = new Date(query.fromDate);
    }
    if (query.toDate) {
      where.salesInvoice.invoiceDate.lte = new Date(query.toDate);
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

  const lines = await prisma.salesInvoiceLine.findMany({
    where,
    select: {
      itemId: true,
      quantity: true,
      unitPrice: true,
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
      totalSales: Decimal;
      averagePrice: Decimal;
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
        totalSales: new Decimal(0),
        averagePrice: new Decimal(0),
        invoiceCount: 0,
      });
    }

    const itemData = itemMap.get(itemId)!;
    itemData.totalQuantity = itemData.totalQuantity.plus(line.quantity);
    itemData.totalSales = itemData.totalSales.plus(line.lineTotal);
    itemData.invoiceCount += 1;
  }

  // Calculate average prices
  for (const itemData of itemMap.values()) {
    if (itemData.totalQuantity.gt(0)) {
      itemData.averagePrice = itemData.totalSales.dividedBy(itemData.totalQuantity);
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
      totalSales: acc.totalSales.plus(item.totalSales),
    }),
    {
      totalItems: 0,
      totalQuantity: new Decimal(0),
      totalSales: new Decimal(0),
    }
  );

  return {
    byItem: items.sort((a, b) => Number(b.totalSales.minus(a.totalSales))),
    summary,
  };
}

/**
 * Get Sales Trend Analysis
 * Shows sales trends over time
 */
export async function getSalesTrendAnalysis(
  tenantId: string,
  query: SalesTrendAnalysisQuery
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

  if (query.customerId) {
    where.customerId = query.customerId;
  }

  const invoices = await prisma.salesInvoice.findMany({
    where,
    select: {
      invoiceDate: true,
      grandTotal: true,
    },
    orderBy: {
      invoiceDate: "asc",
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
      count: number;
      amount: Decimal;
      average: Decimal;
    }
  >();

  for (const invoice of invoices) {
    const period = formatPeriod(invoice.invoiceDate, query.groupBy);

    if (!periodMap.has(period)) {
      periodMap.set(period, {
        period,
        count: 0,
        amount: new Decimal(0),
        average: new Decimal(0),
      });
    }

    const periodData = periodMap.get(period)!;
    periodData.count += 1;
    periodData.amount = periodData.amount.plus(invoice.grandTotal);
  }

  // Calculate averages
  for (const periodData of periodMap.values()) {
    if (periodData.count > 0) {
      periodData.average = periodData.amount.dividedBy(periodData.count);
    }
  }

  const trends = Array.from(periodMap.values()).sort((a, b) =>
    a.period.localeCompare(b.period)
  );

  // Calculate growth rates
  const trendsWithGrowth = trends.map((trend, index) => {
    let growthRate = null;
    if (index > 0) {
      const previous = trends[index - 1];
      if (previous.amount.gt(0)) {
        const growth = trend.amount.minus(previous.amount);
        growthRate = growth.dividedBy(previous.amount).times(100);
      }
    }

    return {
      ...trend,
      growthRate,
    };
  });

  return {
    trends: trendsWithGrowth,
    metric: query.metric,
  };
}

