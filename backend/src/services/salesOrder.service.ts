/**
 * Sales Order Service
 *
 * Business logic for sales order operations
 */

import { PrismaClient } from "../generated/prisma";
import {
  CreateSalesOrderInput,
  SalesOrderLineInput,
  SalesOrderListQuery,
  UpdateSalesOrderInput,
} from "../validators/salesOrder.validator";

const prisma = new PrismaClient();

export interface SalesOrderResult {
  id: string;
  tenantId: string;
  soNumber: string;
  soDate: Date;
  expectedDeliveryDate: Date | null;
  customerId: string;
  customerReference: string | null;
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
  customer?: any;
  lines?: any[];
}

interface CalculatedTotals {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
}

function calculateTotals(lines: SalesOrderLineInput[]): CalculatedTotals {
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

async function generateSalesOrderNumber(
  tenantId: string,
  tx: PrismaClient
): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const prefix = `SO-${year}${month}-`;

  const latest = await tx.salesOrder.findFirst({
    where: {
      tenantId,
      soNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      soNumber: "desc",
    },
  });

  let sequence = 1;
  if (latest?.soNumber?.startsWith(prefix)) {
    const tail = latest.soNumber.substring(prefix.length);
    const parsed = parseInt(tail, 10);
    if (!isNaN(parsed)) {
      sequence = parsed + 1;
    }
  }

  return `${prefix}${sequence.toString().padStart(5, "0")}`;
}

/**
 * Create a new sales order (header + lines) in a single transaction
 */
export async function createSalesOrder(
  tenantId: string,
  userId: string | undefined,
  input: CreateSalesOrderInput
): Promise<SalesOrderResult> {
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
    // Regenerate SO number inside the transaction for safety
    const soNumber = await generateSalesOrderNumber(tenantId, tx as any);

    const so = await (tx as any).salesOrder.create({
      data: {
        tenantId,
        soNumber,
        soDate: new Date(input.soDate),
        expectedDeliveryDate: input.expectedDeliveryDate
          ? new Date(input.expectedDeliveryDate)
          : null,
        customerId: input.customerId,
        customerReference: input.customerReference || null,
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
        salesOrderId: so.id,
        itemId: line.itemId,
        lineNumber: index + 1,
        description: line.description || null,
        quantityOrdered: qty,
        quantityDelivered: 0,
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

    await (tx as any).salesOrderLine.createMany({
      data: linesData,
    });

    const created = await (tx as any).salesOrder.findFirst({
      where: {
        id: so.id,
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
 * List sales orders with filtering and pagination
 */
export async function listSalesOrders(
  tenantId: string,
  query: SalesOrderListQuery
): Promise<{ salesOrders: SalesOrderResult[]; count: number }> {
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
    where.soDate = {};
    if (query.fromDate) {
      where.soDate.gte = new Date(query.fromDate);
    }
    if (query.toDate) {
      where.soDate.lte = new Date(query.toDate);
    }
  }

  if (query.search) {
    where.OR = [
      { soNumber: { contains: query.search, mode: "insensitive" } },
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

  const [salesOrders, count] = await Promise.all([
    prisma.salesOrder.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: {
        soDate: "desc",
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
    prisma.salesOrder.count({ where }),
  ]);

  return { salesOrders: salesOrders as any, count };
}

/**
 * Get sales order by ID (with lines)
 */
export async function getSalesOrderById(
  tenantId: string,
  id: string
): Promise<SalesOrderResult | null> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const so = await prisma.salesOrder.findFirst({
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

  return so as any;
}

/**
 * Update a draft sales order (header + full line set)
 */
export async function updateSalesOrder(
  tenantId: string,
  userId: string | undefined,
  id: string,
  input: UpdateSalesOrderInput
): Promise<SalesOrderResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const existing = await prisma.salesOrder.findFirst({
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
    throw new Error("Sales order not found or does not belong to this tenant");
  }

  if (existing.status !== "DRAFT") {
    throw new Error("Only draft sales orders can be edited");
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

  // Validate addresses (if provided) belong to customer and tenant
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
  const lines = input.lines as SalesOrderLineInput[] | undefined;

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
    const header = await tx.salesOrder.update({
      where: { id: existing.id },
      data: {
        customerId,
        customerReference:
          input.customerReference !== undefined
            ? input.customerReference || null
            : existing.customerReference,
        soDate:
          input.soDate !== undefined
            ? new Date(input.soDate)
            : existing.soDate,
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
      await tx.salesOrderLine.deleteMany({
        where: {
          tenantId,
          salesOrderId: existing.id,
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
          salesOrderId: header.id,
          itemId: line.itemId,
          lineNumber: index + 1,
          description: line.description || null,
          quantityOrdered: qty,
          quantityDelivered: 0,
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

      await tx.salesOrderLine.createMany({
        data: linesData,
      });
    }

    const updatedSo = await tx.salesOrder.findFirst({
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

    return updatedSo;
  });

  return updated as any;
}

/**
 * Cancel a sales order
 */
export async function cancelSalesOrder(
  tenantId: string,
  userId: string | undefined,
  id: string,
  reason?: string
): Promise<SalesOrderResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const existing = await prisma.salesOrder.findFirst({
    where: {
      id,
      tenantId,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new Error("Sales order not found or does not belong to this tenant");
  }

  if (
    existing.status === "CANCELLED" ||
    existing.status === "PARTIALLY_DELIVERED" ||
    existing.status === "COMPLETED"
  ) {
    throw new Error("Sales order cannot be cancelled in its current status");
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

  const updated = await prisma.salesOrder.update({
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
 * Get SO Status Report - Summary grouped by status
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
    where.soDate = {};
    if (fromDate) {
      where.soDate.gte = new Date(fromDate);
    }
    if (toDate) {
      where.soDate.lte = new Date(toDate);
    }
  }

  const sos = await prisma.salesOrder.findMany({
    where,
    select: {
      status: true,
      grandTotal: true,
    },
  });

  const statusMap = new Map<string, { count: number; totalAmount: number }>();

  let totalCount = 0;
  let totalAmount = 0;

  for (const so of sos) {
    const status = so.status;
    const amount = Number(so.grandTotal);

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
 * Get SO vs Delivery Report - Shows ordered vs delivered quantities
 */
export async function getSoVsDeliveryReport(
  tenantId: string,
  fromDate?: string,
  toDate?: string,
  customerId?: string
): Promise<{
  salesOrders: Array<{
    id: string;
    soNumber: string;
    soDate: Date;
    customer: {
      id: string;
      code: string;
      name: string;
    };
    status: string;
    totalOrdered: number;
    totalDelivered: number;
    deliveryPercentage: number;
    lines: Array<{
      itemId: string;
      itemCode: string;
      itemName: string;
      quantityOrdered: number;
      quantityDelivered: number;
      deliveryPercentage: number;
      unitPrice: number;
      lineTotal: number;
    }>;
  }>;
  summary: {
    totalSos: number;
    totalOrdered: number;
    totalDelivered: number;
    overallDeliveryPercentage: number;
  };
}> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const where: any = {
    tenantId,
    deletedAt: null,
  };

  if (fromDate || toDate) {
    where.soDate = {};
    if (fromDate) {
      where.soDate.gte = new Date(fromDate);
    }
    if (toDate) {
      where.soDate.lte = new Date(toDate);
    }
  }

  if (customerId) {
    where.customerId = customerId;
  }

  const sos = await prisma.salesOrder.findMany({
    where,
    include: {
      customer: {
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
      soDate: "desc",
    },
  });

  let totalOrdered = 0;
  let totalDelivered = 0;

  const salesOrders = sos.map((so) => {
    let soOrdered = 0;
    let soDelivered = 0;

    const lines = so.lines.map((line) => {
      const ordered = Number(line.quantityOrdered);
      const delivered = Number(line.quantityDelivered);
      const deliveryPct = ordered > 0 ? (delivered / ordered) * 100 : 0;

      soOrdered += ordered;
      soDelivered += delivered;

      return {
        itemId: line.itemId,
        itemCode: line.item?.code || "N/A",
        itemName: line.item?.name || "N/A",
        quantityOrdered: ordered,
        quantityDelivered: delivered,
        deliveryPercentage: deliveryPct,
        unitPrice: Number(line.unitPrice),
        lineTotal: Number(line.lineTotal),
      };
    });

    const soDeliveryPct = soOrdered > 0 ? (soDelivered / soOrdered) * 100 : 0;

    totalOrdered += soOrdered;
    totalDelivered += soDelivered;

    return {
      id: so.id,
      soNumber: so.soNumber,
      soDate: so.soDate,
      customer: so.customer,
      status: so.status,
      totalOrdered: soOrdered,
      totalDelivered: soDelivered,
      deliveryPercentage: soDeliveryPct,
      lines,
    };
  });

  const overallDeliveryPct =
    totalOrdered > 0 ? (totalDelivered / totalOrdered) * 100 : 0;

  return {
    salesOrders,
    summary: {
      totalSos: sos.length,
      totalOrdered,
      totalDelivered,
      overallDeliveryPercentage: overallDeliveryPct,
    },
  };
}

