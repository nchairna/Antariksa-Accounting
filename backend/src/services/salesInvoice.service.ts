/**
 * Sales Invoice Service
 *
 * Business logic for sales invoice operations
 */

import { PrismaClient } from "../generated/prisma";
import {
  CreateSalesInvoiceInput,
  SalesInvoiceLineInput,
  SalesInvoiceListQuery,
  UpdateSalesInvoiceInput,
} from "../validators/salesInvoice.validator";

const prisma = new PrismaClient();

export interface SalesInvoiceResult {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  customerId: string;
  salesOrderId: string | null;
  shippingAddressId: string | null;
  billingAddressId: string | null;
  paymentTerms: string | null;
  currency: string;
  referenceNumber: string | null;
  subtotal: any;
  discountAmount: any;
  taxAmount: any;
  shippingCharges: any;
  grandTotal: any;
  amountPaid: any;
  balanceDue: any;
  status: string;
  notes: string | null;
  termsConditions: string | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  customer?: any;
  salesOrder?: any;
  lines?: any[];
}

interface CalculatedTotals {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
}

function calculateTotals(lines: SalesInvoiceLineInput[]): CalculatedTotals {
  let subtotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;

  for (const line of lines) {
    const qty = Number(line.quantity);
    const price = Number(line.unitPrice);
    const discountPct = Number(line.discountPercentage ?? 0);
    const taxRate = Number(line.taxRate ?? 0);

    const lineBase = qty * price;
    const lineDiscount = lineBase * discountPct;
    const lineNet = lineBase - lineDiscount;
    const lineTax = lineNet * taxRate;

    subtotal += lineBase;
    discountTotal += lineDiscount;
    taxTotal += lineTax;
  }

  const grandTotal = subtotal - discountTotal + taxTotal;

  return {
    subtotal,
    discountTotal,
    taxTotal,
    grandTotal,
  };
}

async function generateSalesInvoiceNumber(
  tenantId: string,
  tx: PrismaClient
): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const prefix = `SI-${year}${month}-`;

  const latest = await tx.salesInvoice.findFirst({
    where: {
      tenantId,
      invoiceNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      invoiceNumber: "desc",
    },
  });

  let sequence = 1;
  if (latest?.invoiceNumber?.startsWith(prefix)) {
    const tail = latest.invoiceNumber.substring(prefix.length);
    const parsed = parseInt(tail, 10);
    if (!isNaN(parsed)) {
      sequence = parsed + 1;
    }
  }

  return `${prefix}${sequence.toString().padStart(5, "0")}`;
}

/**
 * Create a new sales invoice (header + lines) in a single transaction
 */
export async function createSalesInvoice(
  tenantId: string,
  userId: string | undefined,
  input: CreateSalesInvoiceInput
): Promise<SalesInvoiceResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  // Validate customer belongs to tenant
  const customer = await prisma.customer.findFirst({
    where: {
      id: input.customerId,
      tenantId,
      deletedAt: null,
    },
  });

  if (!customer) {
    throw new Error("Customer not found or does not belong to this tenant");
  }

  // Validate sales order if provided
  if (input.salesOrderId) {
    const salesOrder = await prisma.salesOrder.findFirst({
      where: {
        id: input.salesOrderId,
        tenantId,
        customerId: input.customerId,
        deletedAt: null,
      },
    });
    if (!salesOrder) {
      throw new Error("Sales order not found or does not belong to this customer");
    }
  }

  // Validate addresses (if provided) belong to customer and tenant
  if (input.shippingAddressId) {
    const shippingAddress = await prisma.customerAddress.findFirst({
      where: {
        id: input.shippingAddressId,
        customerId: input.customerId,
        tenantId,
      },
    });
    if (!shippingAddress) {
      throw new Error(
        "Shipping address not found or does not belong to this customer"
      );
    }
  }

  if (input.billingAddressId) {
    const billingAddress = await prisma.customerAddress.findFirst({
      where: {
        id: input.billingAddressId,
        customerId: input.customerId,
        tenantId,
      },
    });
    if (!billingAddress) {
      throw new Error(
        "Billing address not found or does not belong to this customer"
      );
    }
  }

  // Validate items belong to tenant (if provided)
  const itemIds = input.lines
    .map((l) => l.itemId)
    .filter((id): id is string => id !== null && id !== undefined);
  
  if (itemIds.length > 0) {
    const items = await prisma.item.findMany({
      where: {
        tenantId,
        id: {
          in: itemIds,
        },
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });
    const foundItemIds = new Set(items.map((i) => i.id));
    const missingItemIds = itemIds.filter((id) => !foundItemIds.has(id));
    if (missingItemIds.length > 0) {
      throw new Error("One or more items not found or do not belong to this tenant");
    }
  }

  const totals = calculateTotals(input.lines);
  const balanceDue = totals.grandTotal; // Initially balance due equals grand total

  const result = await prisma.$transaction(async (tx) => {
    // Generate invoice number inside the transaction for safety
    const invoiceNumber = await generateSalesInvoiceNumber(tenantId, tx as any);

    const invoice = await (tx as any).salesInvoice.create({
      data: {
        tenantId,
        invoiceNumber,
        invoiceDate: new Date(input.invoiceDate),
        dueDate: new Date(input.dueDate),
        customerId: input.customerId,
        salesOrderId: input.salesOrderId || null,
        shippingAddressId: input.shippingAddressId || null,
        billingAddressId: input.billingAddressId || null,
        paymentTerms: input.paymentTerms || null,
        currency: input.currency.toUpperCase(),
        referenceNumber: input.referenceNumber || null,
        subtotal: totals.subtotal,
        discountAmount: totals.discountTotal,
        taxAmount: totals.taxTotal,
        shippingCharges: 0,
        grandTotal: totals.grandTotal,
        amountPaid: 0,
        balanceDue,
        status: "DRAFT",
        notes: input.notes || null,
        termsConditions: input.termsConditions || null,
        createdById: userId || null,
      },
    });

    const linesData = input.lines.map((line, index) => {
      const qty = Number(line.quantity);
      const price = Number(line.unitPrice);
      const discountPct = Number(line.discountPercentage ?? 0);
      const taxRate = Number(line.taxRate ?? 0);

      const lineBase = qty * price;
      const lineDiscount = lineBase * discountPct;
      const lineNet = lineBase - lineDiscount;
      const lineTax = lineNet * taxRate;
      const lineTotal = lineNet + lineTax;

      return {
        tenantId,
        salesInvoiceId: invoice.id,
        itemId: line.itemId || null,
        lineNumber: index + 1,
        description: line.description,
        quantity: qty,
        unitPrice: price,
        discountPercentage: discountPct,
        discountAmount: lineDiscount,
        taxRate,
        taxAmount: lineTax,
        lineTotal,
      };
    });

    await (tx as any).salesInvoiceLine.createMany({
      data: linesData,
    });

    const created = await (tx as any).salesInvoice.findFirst({
      where: {
        id: invoice.id,
        tenantId,
      },
      include: {
        customer: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        salesOrder: {
          select: {
            id: true,
            soNumber: true,
          },
        },
        lines: {
          orderBy: {
            lineNumber: "asc",
          },
          include: {
            item: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return created;
  });

  return result as any;
}

/**
 * List sales invoices with filtering and pagination
 */
export async function listSalesInvoices(
  tenantId: string,
  query: SalesInvoiceListQuery
): Promise<{ salesInvoices: SalesInvoiceResult[]; count: number }> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const where: any = {
    tenantId,
    deletedAt: null,
  };

  if (query.status) {
    where.status = query.status;
  }

  if (query.customerId) {
    where.customerId = query.customerId;
  }

  if (query.fromDate || query.toDate) {
    where.invoiceDate = {};
    if (query.fromDate) {
      where.invoiceDate.gte = new Date(query.fromDate);
    }
    if (query.toDate) {
      where.invoiceDate.lte = new Date(query.toDate);
    }
  }

  if (query.search) {
    where.OR = [
      { invoiceNumber: { contains: query.search, mode: "insensitive" } },
      {
        customer: {
          OR: [
            { code: { contains: query.search, mode: "insensitive" } },
            { name: { contains: query.search, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  const skip = (query.page - 1) * query.limit;

  const [salesInvoices, count] = await Promise.all([
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
      },
    }),
    prisma.salesInvoice.count({ where }),
  ]);

  return { salesInvoices: salesInvoices as any, count };
}

/**
 * Get sales invoice by ID (with lines)
 */
export async function getSalesInvoiceById(
  tenantId: string,
  id: string
): Promise<SalesInvoiceResult | null> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const invoice = await prisma.salesInvoice.findFirst({
    where: {
      id,
      tenantId,
      deletedAt: null,
    },
    include: {
      customer: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      salesOrder: {
        select: {
          id: true,
          soNumber: true,
        },
      },
      lines: {
        orderBy: {
          lineNumber: "asc",
        },
        include: {
          item: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return invoice as any;
}

/**
 * Update a draft sales invoice (header + full line set)
 */
export async function updateSalesInvoice(
  tenantId: string,
  userId: string | undefined,
  id: string,
  input: UpdateSalesInvoiceInput
): Promise<SalesInvoiceResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const existing = await prisma.salesInvoice.findFirst({
    where: {
      id,
      tenantId,
      deletedAt: null,
    },
    include: {
      lines: true,
    },
  });

  if (!existing) {
    throw new Error("Sales invoice not found or does not belong to this tenant");
  }

  if (existing.status !== "DRAFT") {
    throw new Error("Only draft sales invoices can be edited");
  }

  // If customerId is being changed, validate new customer
  const customerId = input.customerId ?? existing.customerId;

  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      tenantId,
      deletedAt: null,
    },
  });

  if (!customer) {
    throw new Error("Customer not found or does not belong to this tenant");
  }

  // Validate sales order if provided
  if (input.salesOrderId !== undefined) {
    if (input.salesOrderId) {
      const salesOrder = await prisma.salesOrder.findFirst({
        where: {
          id: input.salesOrderId,
          tenantId,
          customerId,
          deletedAt: null,
        },
      });
      if (!salesOrder) {
        throw new Error("Sales order not found or does not belong to this customer");
      }
    }
  }

  // Validate addresses
  const shippingAddressId = input.shippingAddressId ?? existing.shippingAddressId;
  if (shippingAddressId) {
    const shippingAddress = await prisma.customerAddress.findFirst({
      where: {
        id: shippingAddressId,
        customerId,
        tenantId,
      },
    });
    if (!shippingAddress) {
      throw new Error(
        "Shipping address not found or does not belong to this customer"
      );
    }
  }

  const billingAddressId = input.billingAddressId ?? existing.billingAddressId;
  if (billingAddressId) {
    const billingAddress = await prisma.customerAddress.findFirst({
      where: {
        id: billingAddressId,
        customerId,
        tenantId,
      },
    });
    if (!billingAddress) {
      throw new Error(
        "Billing address not found or does not belong to this customer"
      );
    }
  }

  // Lines are optional in update; if provided, validate and recalc totals
  const lines = input.lines as SalesInvoiceLineInput[] | undefined;

  let totals = {
    subtotal: Number(existing.subtotal),
    discountTotal: Number(existing.discountAmount),
    taxTotal: Number(existing.taxAmount),
    grandTotal: Number(existing.grandTotal),
  };

  if (lines && lines.length > 0) {
    // Validate items belong to tenant (if provided)
    const itemIds = lines
      .map((l) => l.itemId)
      .filter((id): id is string => id !== null && id !== undefined);
    
    if (itemIds.length > 0) {
      const items = await prisma.item.findMany({
        where: {
          tenantId,
          id: {
            in: itemIds,
          },
          deletedAt: null,
        },
        select: {
          id: true,
        },
      });
      const foundItemIds = new Set(items.map((i) => i.id));
      const missingItemIds = itemIds.filter((id) => !foundItemIds.has(id));
      if (missingItemIds.length > 0) {
        throw new Error("One or more items not found or do not belong to this tenant");
      }
    }

    totals = calculateTotals(lines);
  }

  const balanceDue = totals.grandTotal - Number(existing.amountPaid);

  const updated = await prisma.$transaction(async (tx) => {
    // Update header
    const header = await tx.salesInvoice.update({
      where: { id: existing.id },
      data: {
        customerId,
        salesOrderId:
          input.salesOrderId !== undefined
            ? input.salesOrderId || null
            : existing.salesOrderId,
        invoiceDate:
          input.invoiceDate !== undefined
            ? new Date(input.invoiceDate)
            : existing.invoiceDate,
        dueDate:
          input.dueDate !== undefined
            ? new Date(input.dueDate)
            : existing.dueDate,
        shippingAddressId: shippingAddressId ?? null,
        billingAddressId: billingAddressId ?? null,
        paymentTerms:
          input.paymentTerms !== undefined
            ? input.paymentTerms || null
            : existing.paymentTerms,
        currency:
          input.currency !== undefined
            ? input.currency.toUpperCase()
            : existing.currency,
        referenceNumber:
          input.referenceNumber !== undefined
            ? input.referenceNumber || null
            : existing.referenceNumber,
        subtotal: totals.subtotal,
        discountAmount: totals.discountTotal,
        taxAmount: totals.taxTotal,
        grandTotal: totals.grandTotal,
        balanceDue,
        notes:
          input.notes !== undefined ? input.notes || null : existing.notes,
        termsConditions:
          input.termsConditions !== undefined
            ? input.termsConditions || null
            : existing.termsConditions,
        createdById: existing.createdById ?? userId ?? null,
      },
    });

    // Replace lines if provided
    if (lines && lines.length > 0) {
      await tx.salesInvoiceLine.deleteMany({
        where: {
          tenantId,
          salesInvoiceId: existing.id,
        },
      });

      const linesData = lines.map((line, index) => {
        const qty = Number(line.quantity);
        const price = Number(line.unitPrice);
        const discountPct = Number(line.discountPercentage ?? 0);
        const taxRate = Number(line.taxRate ?? 0);

        const lineBase = qty * price;
        const lineDiscount = lineBase * discountPct;
        const lineNet = lineBase - lineDiscount;
        const lineTax = lineNet * taxRate;
        const lineTotal = lineNet + lineTax;

        return {
          tenantId,
          salesInvoiceId: header.id,
          itemId: line.itemId || null,
          lineNumber: index + 1,
          description: line.description,
          quantity: qty,
          unitPrice: price,
          discountPercentage: discountPct,
          discountAmount: lineDiscount,
          taxRate,
          taxAmount: lineTax,
          lineTotal,
        };
      });

      await tx.salesInvoiceLine.createMany({
        data: linesData,
      });
    }

    const updatedInvoice = await tx.salesInvoice.findFirst({
      where: {
        id: header.id,
        tenantId,
      },
      include: {
        customer: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        salesOrder: {
          select: {
            id: true,
            soNumber: true,
          },
        },
        lines: {
          orderBy: {
            lineNumber: "asc",
          },
          include: {
            item: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return updatedInvoice;
  });

  return updated as any;
}

/**
 * Cancel a sales invoice
 */
export async function cancelSalesInvoice(
  tenantId: string,
  userId: string | undefined,
  id: string,
  reason?: string
): Promise<SalesInvoiceResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const existing = await prisma.salesInvoice.findFirst({
    where: {
      id,
      tenantId,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new Error("Sales invoice not found or does not belong to this tenant");
  }

  if (existing.status === "CANCELLED" || existing.status === "PAID") {
    throw new Error("Sales invoice cannot be cancelled in its current status");
  }

  const notesParts = [];
  if (existing.notes) {
    notesParts.push(existing.notes);
  }
  if (reason) {
    notesParts.push(`Cancelled: ${reason}`);
  } else {
    notesParts.push("Cancelled");
  }

  const updated = await prisma.salesInvoice.update({
    where: { id: existing.id },
    data: {
      status: "CANCELLED",
      notes: notesParts.join("\n"),
      createdById: existing.createdById ?? userId ?? null,
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
        orderBy: {
          lineNumber: "asc",
        },
        include: {
          item: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return updated as any;
}

/**
 * Get Sales Invoice Status Report - Summary grouped by status
 */
export async function getStatusReport(
  tenantId: string,
  fromDate?: string,
  toDate?: string
): Promise<{
  statusSummary: Array<{
    status: string;
    count: number;
    totalAmount: number;
    totalPaid: number;
    totalOutstanding: number;
  }>;
  totalCount: number;
  totalAmount: number;
  totalPaid: number;
  totalOutstanding: number;
}> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const where: any = {
    tenantId,
    deletedAt: null,
  };

  if (fromDate || toDate) {
    where.invoiceDate = {};
    if (fromDate) {
      where.invoiceDate.gte = new Date(fromDate);
    }
    if (toDate) {
      where.invoiceDate.lte = new Date(toDate);
    }
  }

  const invoices = await prisma.salesInvoice.findMany({
    where,
    select: {
      status: true,
      grandTotal: true,
      amountPaid: true,
      balanceDue: true,
    },
  });

  const statusMap = new Map<
    string,
    { count: number; totalAmount: number; totalPaid: number; totalOutstanding: number }
  >();

  let totalCount = 0;
  let totalAmount = 0;
  let totalPaid = 0;
  let totalOutstanding = 0;

  for (const invoice of invoices) {
    const status = invoice.status;
    const amount = Number(invoice.grandTotal);
    const paid = Number(invoice.amountPaid);
    const outstanding = Number(invoice.balanceDue);

    if (!statusMap.has(status)) {
      statusMap.set(status, {
        count: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalOutstanding: 0,
      });
    }

    const summary = statusMap.get(status)!;
    summary.count += 1;
    summary.totalAmount += amount;
    summary.totalPaid += paid;
    summary.totalOutstanding += outstanding;

    totalCount += 1;
    totalAmount += amount;
    totalPaid += paid;
    totalOutstanding += outstanding;
  }

  const statusSummary = Array.from(statusMap.entries()).map(
    ([status, data]) => ({
      status,
      count: data.count,
      totalAmount: data.totalAmount,
      totalPaid: data.totalPaid,
      totalOutstanding: data.totalOutstanding,
    })
  );

  return {
    statusSummary,
    totalCount,
    totalAmount,
    totalPaid,
    totalOutstanding,
  };
}

