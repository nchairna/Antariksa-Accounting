/**
 * Purchase Order Service
 *
 * Business logic for purchase order operations
 */

import { PrismaClient } from "../generated/prisma";
import {
  CreatePurchaseOrderInput,
  PurchaseOrderLineInput,
  PurchaseOrderListQuery,
  UpdatePurchaseOrderInput,
} from "../validators/purchaseOrder.validator";

const prisma = new PrismaClient();

export interface PurchaseOrderResult {
  id: string;
  tenantId: string;
  poNumber: string;
  poDate: Date;
  expectedDeliveryDate: Date | null;
  supplierId: string;
  supplierReference: string | null;
  shippingAddressId: string | null;
  billingAddressId: string | null;
  paymentTerms: string | null;
  currency: string;
  subtotal: any;
  discountAmount: any;
  taxAmount: any;
  shippingCharges: any;
  grandTotal: any;
  status: string;
  notes: string | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  supplier?: any;
  lines?: any[];
}

interface CalculatedTotals {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
}

function calculateTotals(lines: PurchaseOrderLineInput[]): CalculatedTotals {
  let subtotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;

  for (const line of lines) {
    const qty = Number(line.quantityOrdered);
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

async function generatePurchaseOrderNumber(
  tenantId: string,
  tx: PrismaClient
): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const prefix = `PO-${year}${month}-`;

  const latest = await tx.purchaseOrder.findFirst({
    where: {
      tenantId,
      poNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      poNumber: "desc",
    },
  });

  let sequence = 1;
  if (latest?.poNumber?.startsWith(prefix)) {
    const tail = latest.poNumber.substring(prefix.length);
    const parsed = parseInt(tail, 10);
    if (!isNaN(parsed)) {
      sequence = parsed + 1;
    }
  }

  return `${prefix}${sequence.toString().padStart(5, "0")}`;
}

/**
 * Create a new purchase order (header + lines) in a single transaction
 */
export async function createPurchaseOrder(
  tenantId: string,
  userId: string | undefined,
  input: CreatePurchaseOrderInput
): Promise<PurchaseOrderResult> {
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

  // Validate items belong to tenant
  const itemIds = Array.from(new Set(input.lines.map((l) => l.itemId)));
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

  const totals = calculateTotals(input.lines);

  const result = await prisma.$transaction(async (tx) => {
    // Regenerate PO number inside the transaction for safety
    const poNumber = await generatePurchaseOrderNumber(tenantId, tx as any);

    const po = await (tx as any).purchaseOrder.create({
      data: {
        tenantId,
        poNumber,
        poDate: new Date(input.poDate),
        expectedDeliveryDate: input.expectedDeliveryDate
          ? new Date(input.expectedDeliveryDate)
          : null,
        supplierId: input.supplierId,
        supplierReference: input.supplierReference || null,
        shippingAddressId: input.shippingAddressId || null,
        billingAddressId: input.billingAddressId || null,
        paymentTerms: input.paymentTerms || null,
        currency: input.currency.toUpperCase(),
        subtotal: totals.subtotal,
        discountAmount: totals.discountTotal,
        taxAmount: totals.taxTotal,
        shippingCharges: 0,
        grandTotal: totals.grandTotal,
        status: "DRAFT",
        notes: input.notes || null,
        createdById: userId || null,
      },
    });

    const linesData = input.lines.map((line, index) => {
      const qty = Number(line.quantityOrdered);
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
        purchaseOrderId: po.id,
        itemId: line.itemId,
        lineNumber: index + 1,
        description: line.description || null,
        quantityOrdered: qty,
        quantityReceived: 0,
        unitPrice: price,
        discountPercentage: discountPct,
        discountAmount: lineDiscount,
        taxRate,
        taxAmount: lineTax,
        lineTotal,
        expectedDeliveryDate: line.expectedDeliveryDate
          ? new Date(line.expectedDeliveryDate)
          : null,
      };
    });

    await (tx as any).purchaseOrderLine.createMany({
      data: linesData,
    });

    const created = await (tx as any).purchaseOrder.findFirst({
      where: {
        id: po.id,
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
 * List purchase orders with filtering and pagination
 */
export async function listPurchaseOrders(
  tenantId: string,
  query: PurchaseOrderListQuery
): Promise<{ purchaseOrders: PurchaseOrderResult[]; count: number }> {
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
    where.poDate = {};
    if (query.fromDate) {
      where.poDate.gte = new Date(query.fromDate);
    }
    if (query.toDate) {
      where.poDate.lte = new Date(query.toDate);
    }
  }

  if (query.search) {
    where.OR = [
      { poNumber: { contains: query.search, mode: "insensitive" } },
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

  const [purchaseOrders, count] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: {
        poDate: "desc",
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
    prisma.purchaseOrder.count({ where }),
  ]);

  return { purchaseOrders: purchaseOrders as any, count };
}

/**
 * Get purchase order by ID (with lines)
 */
export async function getPurchaseOrderById(
  tenantId: string,
  id: string
): Promise<PurchaseOrderResult | null> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const po = await prisma.purchaseOrder.findFirst({
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

  return po as any;
}

/**
 * Update a draft purchase order (header + full line set)
 */
export async function updatePurchaseOrder(
  tenantId: string,
  userId: string | undefined,
  id: string,
  input: UpdatePurchaseOrderInput
): Promise<PurchaseOrderResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const existing = await prisma.purchaseOrder.findFirst({
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
    throw new Error("Purchase order not found or does not belong to this tenant");
  }

  if (existing.status !== "DRAFT") {
    throw new Error("Only draft purchase orders can be edited");
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

  // Validate addresses (if provided) belong to supplier and tenant
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
  const lines = input.lines as PurchaseOrderLineInput[] | undefined;

  let totals = {
    subtotal: Number(existing.subtotal),
    discountTotal: Number(existing.discountAmount),
    taxTotal: Number(existing.taxAmount),
    grandTotal: Number(existing.grandTotal),
  };

  if (lines && lines.length > 0) {
    // Validate items belong to tenant
    const itemIds = Array.from(new Set(lines.map((l) => l.itemId)));
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

    totals = calculateTotals(lines);
  }

  const updated = await prisma.$transaction(async (tx) => {
    // Update header
    const header = await tx.purchaseOrder.update({
      where: { id: existing.id },
      data: {
        supplierId,
        supplierReference:
          input.supplierReference !== undefined
            ? input.supplierReference || null
            : existing.supplierReference,
        poDate:
          input.poDate !== undefined
            ? new Date(input.poDate)
            : existing.poDate,
        expectedDeliveryDate:
          input.expectedDeliveryDate !== undefined
            ? input.expectedDeliveryDate
              ? new Date(input.expectedDeliveryDate)
              : null
            : existing.expectedDeliveryDate,
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
        subtotal: totals.subtotal,
        discountAmount: totals.discountTotal,
        taxAmount: totals.taxTotal,
        // shippingCharges unchanged here
        grandTotal: totals.grandTotal,
        notes:
          input.notes !== undefined ? input.notes || null : existing.notes,
        createdById: existing.createdById ?? userId ?? null,
      },
    });

    // Replace lines if provided
    if (lines && lines.length > 0) {
      await tx.purchaseOrderLine.deleteMany({
        where: {
          tenantId,
          purchaseOrderId: existing.id,
        },
      });

      const linesData = lines.map((line, index) => {
        const qty = Number(line.quantityOrdered);
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
          purchaseOrderId: header.id,
          itemId: line.itemId,
          lineNumber: index + 1,
          description: line.description || null,
          quantityOrdered: qty,
          quantityReceived: 0,
          unitPrice: price,
          discountPercentage: discountPct,
          discountAmount: lineDiscount,
          taxRate,
          taxAmount: lineTax,
          lineTotal,
          expectedDeliveryDate: line.expectedDeliveryDate
            ? new Date(line.expectedDeliveryDate)
            : null,
        };
      });

      await tx.purchaseOrderLine.createMany({
        data: linesData,
      });
    }

    const updatedPo = await tx.purchaseOrder.findFirst({
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

    return updatedPo;
  });

  return updated as any;
}

/**
 * Cancel a purchase order
 */
export async function cancelPurchaseOrder(
  tenantId: string,
  userId: string | undefined,
  id: string,
  reason?: string
): Promise<PurchaseOrderResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const existing = await prisma.purchaseOrder.findFirst({
    where: {
      id,
      tenantId,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new Error("Purchase order not found or does not belong to this tenant");
  }

  if (
    existing.status === "CANCELLED" ||
    existing.status === "PARTIALLY_RECEIVED" ||
    existing.status === "COMPLETED"
  ) {
    throw new Error("Purchase order cannot be cancelled in its current status");
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

  const updated = await prisma.purchaseOrder.update({
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
 * Get PO Status Report - Summary grouped by status
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
  }>;
  totalCount: number;
  totalAmount: number;
}> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const where: any = {
    tenantId,
    deletedAt: null,
  };

  if (fromDate || toDate) {
    where.poDate = {};
    if (fromDate) {
      where.poDate.gte = new Date(fromDate);
    }
    if (toDate) {
      where.poDate.lte = new Date(toDate);
    }
  }

  const pos = await prisma.purchaseOrder.findMany({
    where,
    select: {
      status: true,
      grandTotal: true,
    },
  });

  const statusMap = new Map<string, { count: number; totalAmount: number }>();

  let totalCount = 0;
  let totalAmount = 0;

  for (const po of pos) {
    const status = po.status;
    const amount = Number(po.grandTotal);

    if (!statusMap.has(status)) {
      statusMap.set(status, { count: 0, totalAmount: 0 });
    }

    const summary = statusMap.get(status)!;
    summary.count += 1;
    summary.totalAmount += amount;

    totalCount += 1;
    totalAmount += amount;
  }

  const statusSummary = Array.from(statusMap.entries()).map(([status, data]) => ({
    status,
    count: data.count,
    totalAmount: data.totalAmount,
  }));

  return {
    statusSummary,
    totalCount,
    totalAmount,
  };
}

/**
 * Get PO vs Receipt Report - Shows ordered vs received quantities
 */
export async function getPoVsReceiptReport(
  tenantId: string,
  fromDate?: string,
  toDate?: string,
  supplierId?: string
): Promise<{
  purchaseOrders: Array<{
    id: string;
    poNumber: string;
    poDate: Date;
    supplier: {
      id: string;
      code: string;
      name: string;
    };
    status: string;
    totalOrdered: number;
    totalReceived: number;
    receiptPercentage: number;
    lines: Array<{
      itemId: string;
      itemCode: string;
      itemName: string;
      quantityOrdered: number;
      quantityReceived: number;
      receiptPercentage: number;
      unitPrice: number;
      lineTotal: number;
    }>;
  }>;
  summary: {
    totalPos: number;
    totalOrdered: number;
    totalReceived: number;
    overallReceiptPercentage: number;
  };
}> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const where: any = {
    tenantId,
    deletedAt: null,
  };

  if (fromDate || toDate) {
    where.poDate = {};
    if (fromDate) {
      where.poDate.gte = new Date(fromDate);
    }
    if (toDate) {
      where.poDate.lte = new Date(toDate);
    }
  }

  if (supplierId) {
    where.supplierId = supplierId;
  }

  const pos = await prisma.purchaseOrder.findMany({
    where,
    include: {
      supplier: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      lines: {
        include: {
          item: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
        orderBy: {
          lineNumber: "asc",
        },
      },
    },
    orderBy: {
      poDate: "desc",
    },
  });

  let totalOrdered = 0;
  let totalReceived = 0;

  const purchaseOrders = pos.map((po) => {
    let poOrdered = 0;
    let poReceived = 0;

    const lines = po.lines.map((line) => {
      const ordered = Number(line.quantityOrdered);
      const received = Number(line.quantityReceived);
      const receiptPct = ordered > 0 ? (received / ordered) * 100 : 0;

      poOrdered += ordered;
      poReceived += received;

      return {
        itemId: line.itemId,
        itemCode: line.item?.code || "N/A",
        itemName: line.item?.name || "N/A",
        quantityOrdered: ordered,
        quantityReceived: received,
        receiptPercentage: receiptPct,
        unitPrice: Number(line.unitPrice),
        lineTotal: Number(line.lineTotal),
      };
    });

    const poReceiptPct = poOrdered > 0 ? (poReceived / poOrdered) * 100 : 0;

    totalOrdered += poOrdered;
    totalReceived += poReceived;

    return {
      id: po.id,
      poNumber: po.poNumber,
      poDate: po.poDate,
      supplier: po.supplier,
      status: po.status,
      totalOrdered: poOrdered,
      totalReceived: poReceived,
      receiptPercentage: poReceiptPct,
      lines,
    };
  });

  const overallReceiptPct =
    totalOrdered > 0 ? (totalReceived / totalOrdered) * 100 : 0;

  return {
    purchaseOrders,
    summary: {
      totalPos: pos.length,
      totalOrdered,
      totalReceived,
      overallReceiptPercentage: overallReceiptPct,
    },
  };
}

