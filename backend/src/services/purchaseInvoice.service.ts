/**
 * Purchase Invoice Service
 *
 * Business logic for purchase invoice operations
 */

import { PrismaClient } from "../generated/prisma";
import {
  CreatePurchaseInvoiceInput,
  PurchaseInvoiceLineInput,
  PurchaseInvoiceListQuery,
  UpdatePurchaseInvoiceInput,
} from "../validators/purchaseInvoice.validator";

const prisma = new PrismaClient();

export interface PurchaseInvoiceResult {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  supplierId: string;
  purchaseOrderId: string | null;
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
  createdById: string | null;
  approvedById: string | null;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  supplier?: any;
  purchaseOrder?: any;
  lines?: any[];
}

interface CalculatedTotals {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
}

function calculateTotals(lines: PurchaseInvoiceLineInput[]): CalculatedTotals {
  let subtotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;

  for (const line of lines) {
    const qty = Number(line.quantityReceived);
    const cost = Number(line.unitCost);
    const discountPct = Number(line.discountPercentage ?? 0);
    const taxRate = Number(line.taxRate ?? 0);

    const lineBase = qty * cost;
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

/**
 * Create a new purchase invoice (header + lines) in a single transaction
 */
export async function createPurchaseInvoice(
  tenantId: string,
  userId: string | undefined,
  input: CreatePurchaseInvoiceInput
): Promise<PurchaseInvoiceResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  // Validate supplier belongs to tenant
  const supplier = await prisma.supplier.findFirst({
    where: {
      id: input.supplierId,
      tenantId,
      deletedAt: null,
    },
  });

  if (!supplier) {
    throw new Error("Supplier not found or does not belong to this tenant");
  }

  // Validate purchase order if provided
  if (input.purchaseOrderId) {
    const purchaseOrder = await prisma.purchaseOrder.findFirst({
      where: {
        id: input.purchaseOrderId,
        tenantId,
        supplierId: input.supplierId,
        deletedAt: null,
      },
    });
    if (!purchaseOrder) {
      throw new Error("Purchase order not found or does not belong to this supplier");
    }
  }

  // Validate addresses (if provided) belong to supplier and tenant
  if (input.shippingAddressId) {
    const shippingAddress = await prisma.supplierAddress.findFirst({
      where: {
        id: input.shippingAddressId,
        supplierId: input.supplierId,
        tenantId,
      },
    });
    if (!shippingAddress) {
      throw new Error(
        "Shipping address not found or does not belong to this supplier"
      );
    }
  }

  if (input.billingAddressId) {
    const billingAddress = await prisma.supplierAddress.findFirst({
      where: {
        id: input.billingAddressId,
        supplierId: input.supplierId,
        tenantId,
      },
    });
    if (!billingAddress) {
      throw new Error(
        "Billing address not found or does not belong to this supplier"
      );
    }
  }

  // Check if invoice number already exists for this tenant
  const existingInvoice = await prisma.purchaseInvoice.findFirst({
    where: {
      tenantId,
      invoiceNumber: input.invoiceNumber,
      deletedAt: null,
    },
  });

  if (existingInvoice) {
    throw new Error("Invoice number already exists for this tenant");
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
    const invoice = await (tx as any).purchaseInvoice.create({
      data: {
        tenantId,
        invoiceNumber: input.invoiceNumber,
        invoiceDate: new Date(input.invoiceDate),
        dueDate: new Date(input.dueDate),
        supplierId: input.supplierId,
        purchaseOrderId: input.purchaseOrderId || null,
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
        createdById: userId || null,
      },
    });

    const linesData = input.lines.map((line, index) => {
      const qty = Number(line.quantityReceived);
      const cost = Number(line.unitCost);
      const discountPct = Number(line.discountPercentage ?? 0);
      const taxRate = Number(line.taxRate ?? 0);

      const lineBase = qty * cost;
      const lineDiscount = lineBase * discountPct;
      const lineNet = lineBase - lineDiscount;
      const lineTax = lineNet * taxRate;
      const lineTotal = lineNet + lineTax;

      return {
        tenantId,
        purchaseInvoiceId: invoice.id,
        itemId: line.itemId || null,
        lineNumber: index + 1,
        description: line.description,
        quantityReceived: qty,
        unitCost: cost,
        discountPercentage: discountPct,
        discountAmount: lineDiscount,
        taxRate,
        taxAmount: lineTax,
        lineTotal,
      };
    });

    await (tx as any).purchaseInvoiceLine.createMany({
      data: linesData,
    });

    const created = await (tx as any).purchaseInvoice.findFirst({
      where: {
        id: invoice.id,
        tenantId,
      },
      include: {
        supplier: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        purchaseOrder: {
          select: {
            id: true,
            poNumber: true,
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
 * List purchase invoices with filtering and pagination
 */
export async function listPurchaseInvoices(
  tenantId: string,
  query: PurchaseInvoiceListQuery
): Promise<{ purchaseInvoices: PurchaseInvoiceResult[]; count: number }> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const where: any = {
    tenantId,
    deletedAt: null,
  };

  if (query.status) {
    where.status = query.status;
  }

  if (query.supplierId) {
    where.supplierId = query.supplierId;
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
        supplier: {
          OR: [
            { code: { contains: query.search, mode: "insensitive" } },
            { name: { contains: query.search, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  const skip = (query.page - 1) * query.limit;

  const [purchaseInvoices, count] = await Promise.all([
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
      },
    }),
    prisma.purchaseInvoice.count({ where }),
  ]);

  return { purchaseInvoices: purchaseInvoices as any, count };
}

/**
 * Get purchase invoice by ID (with lines)
 */
export async function getPurchaseInvoiceById(
  tenantId: string,
  id: string
): Promise<PurchaseInvoiceResult | null> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const invoice = await prisma.purchaseInvoice.findFirst({
    where: {
      id,
      tenantId,
      deletedAt: null,
    },
    include: {
      supplier: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      purchaseOrder: {
        select: {
          id: true,
          poNumber: true,
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
 * Update a draft purchase invoice (header + full line set)
 */
export async function updatePurchaseInvoice(
  tenantId: string,
  userId: string | undefined,
  id: string,
  input: UpdatePurchaseInvoiceInput
): Promise<PurchaseInvoiceResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const existing = await prisma.purchaseInvoice.findFirst({
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
    throw new Error("Purchase invoice not found or does not belong to this tenant");
  }

  if (existing.status !== "DRAFT") {
    throw new Error("Only draft purchase invoices can be edited");
  }

  // If supplierId is being changed, validate new supplier
  const supplierId = input.supplierId ?? existing.supplierId;

  const supplier = await prisma.supplier.findFirst({
    where: {
      id: supplierId,
      tenantId,
      deletedAt: null,
    },
  });

  if (!supplier) {
    throw new Error("Supplier not found or does not belong to this tenant");
  }

  // Validate purchase order if provided
  if (input.purchaseOrderId !== undefined) {
    if (input.purchaseOrderId) {
      const purchaseOrder = await prisma.purchaseOrder.findFirst({
        where: {
          id: input.purchaseOrderId,
          tenantId,
          supplierId,
          deletedAt: null,
        },
      });
      if (!purchaseOrder) {
        throw new Error("Purchase order not found or does not belong to this supplier");
      }
    }
  }

  // Validate invoice number uniqueness if being changed
  if (input.invoiceNumber && input.invoiceNumber !== existing.invoiceNumber) {
    const duplicateInvoice = await prisma.purchaseInvoice.findFirst({
      where: {
        tenantId,
        invoiceNumber: input.invoiceNumber,
        deletedAt: null,
        id: {
          not: existing.id,
        },
      },
    });
    if (duplicateInvoice) {
      throw new Error("Invoice number already exists for this tenant");
    }
  }

  // Validate addresses
  const shippingAddressId = input.shippingAddressId ?? existing.shippingAddressId;
  if (shippingAddressId) {
    const shippingAddress = await prisma.supplierAddress.findFirst({
      where: {
        id: shippingAddressId,
        supplierId,
        tenantId,
      },
    });
    if (!shippingAddress) {
      throw new Error(
        "Shipping address not found or does not belong to this supplier"
      );
    }
  }

  const billingAddressId = input.billingAddressId ?? existing.billingAddressId;
  if (billingAddressId) {
    const billingAddress = await prisma.supplierAddress.findFirst({
      where: {
        id: billingAddressId,
        supplierId,
        tenantId,
      },
    });
    if (!billingAddress) {
      throw new Error(
        "Billing address not found or does not belong to this supplier"
      );
    }
  }

  // Lines are optional in update; if provided, validate and recalc totals
  const lines = input.lines as PurchaseInvoiceLineInput[] | undefined;

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
    const header = await tx.purchaseInvoice.update({
      where: { id: existing.id },
      data: {
        invoiceNumber: input.invoiceNumber ?? existing.invoiceNumber,
        supplierId,
        purchaseOrderId:
          input.purchaseOrderId !== undefined
            ? input.purchaseOrderId || null
            : existing.purchaseOrderId,
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
        createdById: existing.createdById ?? userId ?? null,
      },
    });

    // Replace lines if provided
    if (lines && lines.length > 0) {
      await tx.purchaseInvoiceLine.deleteMany({
        where: {
          tenantId,
          purchaseInvoiceId: existing.id,
        },
      });

      const linesData = lines.map((line, index) => {
        const qty = Number(line.quantityReceived);
        const cost = Number(line.unitCost);
        const discountPct = Number(line.discountPercentage ?? 0);
        const taxRate = Number(line.taxRate ?? 0);

        const lineBase = qty * cost;
        const lineDiscount = lineBase * discountPct;
        const lineNet = lineBase - lineDiscount;
        const lineTax = lineNet * taxRate;
        const lineTotal = lineNet + lineTax;

        return {
          tenantId,
          purchaseInvoiceId: header.id,
          itemId: line.itemId || null,
          lineNumber: index + 1,
          description: line.description,
          quantityReceived: qty,
          unitCost: cost,
          discountPercentage: discountPct,
          discountAmount: lineDiscount,
          taxRate,
          taxAmount: lineTax,
          lineTotal,
        };
      });

      await tx.purchaseInvoiceLine.createMany({
        data: linesData,
      });
    }

    const updatedInvoice = await tx.purchaseInvoice.findFirst({
      where: {
        id: header.id,
        tenantId,
      },
      include: {
        supplier: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        purchaseOrder: {
          select: {
            id: true,
            poNumber: true,
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
 * Approve a purchase invoice
 */
export async function approvePurchaseInvoice(
  tenantId: string,
  userId: string | undefined,
  id: string
): Promise<PurchaseInvoiceResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const existing = await prisma.purchaseInvoice.findFirst({
    where: {
      id,
      tenantId,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new Error("Purchase invoice not found or does not belong to this tenant");
  }

  if (existing.status !== "RECEIVED" && existing.status !== "DRAFT") {
    throw new Error("Purchase invoice can only be approved from DRAFT or RECEIVED status");
  }

  const updated = await prisma.purchaseInvoice.update({
    where: { id: existing.id },
    data: {
      status: "APPROVED",
      approvedById: userId || null,
      approvedAt: new Date(),
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
 * Cancel a purchase invoice
 */
export async function cancelPurchaseInvoice(
  tenantId: string,
  userId: string | undefined,
  id: string,
  reason?: string
): Promise<PurchaseInvoiceResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const existing = await prisma.purchaseInvoice.findFirst({
    where: {
      id,
      tenantId,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new Error("Purchase invoice not found or does not belong to this tenant");
  }

  if (existing.status === "CANCELLED" || existing.status === "PAID") {
    throw new Error("Purchase invoice cannot be cancelled in its current status");
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

  const updated = await prisma.purchaseInvoice.update({
    where: { id: existing.id },
    data: {
      status: "CANCELLED",
      notes: notesParts.join("\n"),
      createdById: existing.createdById ?? userId ?? null,
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
 * Get Purchase Invoice Status Report - Summary grouped by status
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

  const invoices = await prisma.purchaseInvoice.findMany({
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

