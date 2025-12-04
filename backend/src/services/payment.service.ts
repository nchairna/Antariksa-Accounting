/**
 * Payment Service
 *
 * Handles payment creation, allocation, and management
 */

import { PrismaClient, PaymentStatus, PaymentType, InvoiceType } from "../generated/prisma";
import {
  CreatePaymentInput,
  UpdatePaymentInput,
  PaymentListQuery,
  AROutstandingInvoicesQuery,
  ARAgingAnalysisQuery,
  APOutstandingInvoicesQuery,
  APAgingAnalysisQuery,
} from "../validators/payment.validator";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

/**
 * Generate payment number (tenant-scoped, sequential)
 * Format: PAY-YYYYMMDD-XXXXX
 */
export async function generatePaymentNumber(
  tenantId: string,
  paymentDate: Date
): Promise<string> {
  const dateStr = paymentDate.toISOString().split("T")[0].replace(/-/g, "");
  const prefix = `PAY-${dateStr}-`;

  // Find the highest existing payment number for this tenant and date prefix
  const lastPayment = await prisma.payment.findFirst({
    where: {
      tenantId,
      paymentNumber: {
        startsWith: prefix,
      },
      deletedAt: null,
    },
    orderBy: {
      paymentNumber: "desc",
    },
    select: {
      paymentNumber: true,
    },
  });

  let sequence = 1;
  if (lastPayment) {
    const lastSeq = parseInt(lastPayment.paymentNumber.split("-")[2] || "0", 10);
    sequence = lastSeq + 1;
  }

  const sequenceStr = sequence.toString().padStart(5, "0");
  return `${prefix}${sequenceStr}`;
}

/**
 * Calculate totals for payment allocations
 */
function calculateAllocationTotals(allocations: Array<{ amountAllocated: number | Decimal }>): Decimal {
  return allocations.reduce(
    (sum, alloc) => sum.plus(new Decimal(alloc.amountAllocated)),
    new Decimal(0)
  );
}

/**
 * Update invoice amounts after payment allocation
 */
async function updateInvoiceAmounts(
  tenantId: string,
  invoiceType: InvoiceType,
  invoiceId: string,
  amountAllocated: Decimal
): Promise<void> {
  if (invoiceType === InvoiceType.SALES_INVOICE) {
    const invoice = await prisma.salesInvoice.findUnique({
      where: { id: invoiceId },
      select: {
        id: true,
        grandTotal: true,
        amountPaid: true,
        balanceDue: true,
        status: true,
        tenantId: true,
      },
    });

    if (!invoice || invoice.tenantId !== tenantId) {
      throw new Error("Sales invoice not found");
    }

    const newAmountPaid = new Decimal(invoice.amountPaid).plus(amountAllocated);
    const newBalanceDue = new Decimal(invoice.grandTotal).minus(newAmountPaid);

    // Determine status
    let newStatus = invoice.status;
    if (newBalanceDue.lte(0)) {
      newStatus = "PAID";
    } else if (newAmountPaid.gt(0) && newBalanceDue.gt(0)) {
      newStatus = "PARTIALLY_PAID";
    }

    await prisma.salesInvoice.update({
      where: { id: invoiceId },
      data: {
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue,
        status: newStatus,
      },
    });
  } else {
    const invoice = await prisma.purchaseInvoice.findUnique({
      where: { id: invoiceId },
      select: {
        id: true,
        grandTotal: true,
        amountPaid: true,
        balanceDue: true,
        status: true,
        tenantId: true,
      },
    });

    if (!invoice || invoice.tenantId !== tenantId) {
      throw new Error("Purchase invoice not found");
    }

    const newAmountPaid = new Decimal(invoice.amountPaid).plus(amountAllocated);
    const newBalanceDue = new Decimal(invoice.grandTotal).minus(newAmountPaid);

    // Determine status
    let newStatus = invoice.status;
    if (newBalanceDue.lte(0)) {
      newStatus = "PAID";
    } else if (newAmountPaid.gt(0) && newBalanceDue.gt(0)) {
      newStatus = "PARTIALLY_PAID";
    }

    await prisma.purchaseInvoice.update({
      where: { id: invoiceId },
      data: {
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue,
        status: newStatus,
      },
    });
  }
}

/**
 * Revert invoice amounts when payment is cancelled
 */
async function revertInvoiceAmounts(
  tenantId: string,
  invoiceType: InvoiceType,
  invoiceId: string,
  amountAllocated: Decimal
): Promise<void> {
  if (invoiceType === InvoiceType.SALES_INVOICE) {
    const invoice = await prisma.salesInvoice.findUnique({
      where: { id: invoiceId },
      select: {
        id: true,
        grandTotal: true,
        amountPaid: true,
        balanceDue: true,
        status: true,
        tenantId: true,
      },
    });

    if (!invoice || invoice.tenantId !== tenantId) {
      throw new Error("Sales invoice not found");
    }

    const newAmountPaid = new Decimal(invoice.amountPaid).minus(amountAllocated);
    const newBalanceDue = new Decimal(invoice.grandTotal).minus(newAmountPaid);

    // Determine status
    let newStatus = invoice.status;
    if (newAmountPaid.lte(0)) {
      // Revert to original status before payment (could be DRAFT, SENT, etc.)
      // For simplicity, if no payment remains, set to SENT if it was PAID/PARTIALLY_PAID
      if (invoice.status === "PAID" || invoice.status === "PARTIALLY_PAID") {
        newStatus = "SENT";
      }
    } else if (newBalanceDue.gt(0)) {
      newStatus = "PARTIALLY_PAID";
    }

    await prisma.salesInvoice.update({
      where: { id: invoiceId },
      data: {
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue,
        status: newStatus,
      },
    });
  } else {
    const invoice = await prisma.purchaseInvoice.findUnique({
      where: { id: invoiceId },
      select: {
        id: true,
        grandTotal: true,
        amountPaid: true,
        balanceDue: true,
        status: true,
        tenantId: true,
      },
    });

    if (!invoice || invoice.tenantId !== tenantId) {
      throw new Error("Purchase invoice not found");
    }

    const newAmountPaid = new Decimal(invoice.amountPaid).minus(amountAllocated);
    const newBalanceDue = new Decimal(invoice.grandTotal).minus(newAmountPaid);

    // Determine status
    let newStatus = invoice.status;
    if (newAmountPaid.lte(0)) {
      if (invoice.status === "PAID" || invoice.status === "PARTIALLY_PAID") {
        newStatus = "APPROVED";
      }
    } else if (newBalanceDue.gt(0)) {
      newStatus = "PARTIALLY_PAID";
    }

    await prisma.purchaseInvoice.update({
      where: { id: invoiceId },
      data: {
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue,
        status: newStatus,
      },
    });
  }
}

/**
 * Create a payment with allocations
 */
export async function createPayment(
  tenantId: string,
  userId: string | undefined,
  data: CreatePaymentInput
) {
  // Validate invoice exists and belongs to tenant
  for (const allocation of data.allocations) {
    if (allocation.invoiceType === "SALES_INVOICE") {
      const invoice = await prisma.salesInvoice.findUnique({
        where: { id: allocation.invoiceId },
        select: { id: true, tenantId: true, balanceDue: true },
      });
      if (!invoice || invoice.tenantId !== tenantId) {
        throw new Error(`Sales invoice ${allocation.invoiceId} not found`);
      }
      if (new Decimal(invoice.balanceDue).lt(allocation.amountAllocated)) {
        throw new Error(
          `Allocation amount exceeds balance due for invoice ${allocation.invoiceId}`
        );
      }
    } else {
      const invoice = await prisma.purchaseInvoice.findUnique({
        where: { id: allocation.invoiceId },
        select: { id: true, tenantId: true, balanceDue: true },
      });
      if (!invoice || invoice.tenantId !== tenantId) {
        throw new Error(`Purchase invoice ${allocation.invoiceId} not found`);
      }
      if (new Decimal(invoice.balanceDue).lt(allocation.amountAllocated)) {
        throw new Error(
          `Allocation amount exceeds balance due for invoice ${allocation.invoiceId}`
        );
      }
    }
  }

  const paymentDate = new Date(data.paymentDate);
  const paymentNumber = await generatePaymentNumber(tenantId, paymentDate);

  // Create payment and allocations in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        tenantId,
        paymentNumber,
        paymentDate,
        paymentType: data.paymentType as PaymentType,
        customerId: data.customerId || null,
        supplierId: data.supplierId || null,
        paymentMethod: data.paymentMethod as any,
        amount: new Decimal(data.amount),
        currency: data.currency,
        referenceNumber: data.referenceNumber || null,
        bankAccount: data.bankAccount || null,
        notes: data.notes || null,
        status: PaymentStatus.PENDING,
        createdById: userId || null,
      },
    });

    // Create allocations and update invoices
    const allocations = [];
    for (const alloc of data.allocations) {
      const allocation = await tx.paymentAllocation.create({
        data: {
          tenantId,
          paymentId: payment.id,
          invoiceType: alloc.invoiceType as InvoiceType,
          invoiceId: alloc.invoiceId,
          amountAllocated: new Decimal(alloc.amountAllocated),
        },
      });

      // Update invoice amounts
      await updateInvoiceAmounts(
        tenantId,
        alloc.invoiceType as InvoiceType,
        alloc.invoiceId,
        new Decimal(alloc.amountAllocated)
      );

      allocations.push(allocation);
    }

    // Auto-complete payment if all allocations match the payment amount
    const totalAllocated = calculateAllocationTotals(allocations);
    if (totalAllocated.equals(new Decimal(data.amount))) {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.COMPLETED },
      });
      return { ...payment, status: PaymentStatus.COMPLETED, allocations };
    }

    return { ...payment, allocations };
  });

  return result;
}

/**
 * List payments with filters
 */
export async function listPayments(tenantId: string, query: PaymentListQuery) {
  const where: any = {
    tenantId,
    deletedAt: null,
  };

  if (query.paymentType) {
    where.paymentType = query.paymentType;
  }

  if (query.customerId) {
    where.customerId = query.customerId;
  }

  if (query.supplierId) {
    where.supplierId = query.supplierId;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.fromDate || query.toDate) {
    where.paymentDate = {};
    if (query.fromDate) {
      where.paymentDate.gte = new Date(query.fromDate);
    }
    if (query.toDate) {
      where.paymentDate.lte = new Date(query.toDate);
    }
  }

  if (query.search) {
    where.OR = [
      { paymentNumber: { contains: query.search, mode: "insensitive" } },
      { referenceNumber: { contains: query.search, mode: "insensitive" } },
      { notes: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const skip = (query.page - 1) * query.limit;
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        supplier: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        allocations: {
          include: {
            payment: {
              select: {
                id: true,
                paymentNumber: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        paymentDate: "desc",
      },
      skip,
      take: query.limit,
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    payments,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

/**
 * Get payment by ID
 */
export async function getPaymentById(tenantId: string, paymentId: string) {
  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      tenantId,
      deletedAt: null,
    },
    include: {
      customer: {
        select: {
          id: true,
          code: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      supplier: {
        select: {
          id: true,
          code: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      allocations: {
        include: {
          payment: {
            select: {
              id: true,
              paymentNumber: true,
            },
          },
        },
      },
      createdBy: {
        select: {
          id: true,
          email: true,
        },
      },
      approvedBy: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  return payment;
}

/**
 * Update payment (only allowed for PENDING status)
 */
export async function updatePayment(
  tenantId: string,
  paymentId: string,
  data: UpdatePaymentInput
) {
  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      tenantId,
      deletedAt: null,
    },
    include: {
      allocations: true,
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.status !== PaymentStatus.PENDING) {
    throw new Error("Only pending payments can be updated");
  }

  const updateData: any = {};

  if (data.paymentDate !== undefined) {
    updateData.paymentDate = new Date(data.paymentDate);
  }
  if (data.paymentMethod !== undefined) {
    updateData.paymentMethod = data.paymentMethod;
  }
  if (data.amount !== undefined) {
    updateData.amount = new Decimal(data.amount);
  }
  if (data.currency !== undefined) {
    updateData.currency = data.currency;
  }
  if (data.referenceNumber !== undefined) {
    updateData.referenceNumber = data.referenceNumber;
  }
  if (data.bankAccount !== undefined) {
    updateData.bankAccount = data.bankAccount;
  }
  if (data.notes !== undefined) {
    updateData.notes = data.notes;
  }

  return await prisma.payment.update({
    where: { id: paymentId },
    data: updateData,
    include: {
      customer: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      supplier: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      allocations: true,
      createdBy: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Cancel payment
 */
export async function cancelPayment(tenantId: string, paymentId: string, reason?: string) {
  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      tenantId,
      deletedAt: null,
    },
    include: {
      allocations: true,
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.status === PaymentStatus.CANCELLED) {
    throw new Error("Payment is already cancelled");
  }

  if (payment.status === PaymentStatus.COMPLETED) {
    throw new Error("Cannot cancel completed payment. Use reversal instead.");
  }

  // Revert invoice amounts
  await prisma.$transaction(async (tx) => {
    for (const allocation of payment.allocations) {
      await revertInvoiceAmounts(
        tenantId,
        allocation.invoiceType,
        allocation.invoiceId,
        allocation.amountAllocated
      );
    }

    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.CANCELLED,
        notes: reason
          ? `${payment.notes || ""}\n\nCancelled: ${reason}`.trim()
          : payment.notes,
      },
    });
  });

  return await getPaymentById(tenantId, paymentId);
}

/**
 * Approve payment
 */
export async function approvePayment(
  tenantId: string,
  paymentId: string,
  approvedById: string
) {
  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      tenantId,
      deletedAt: null,
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.status !== PaymentStatus.PENDING) {
    throw new Error("Only pending payments can be approved");
  }

  return await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: PaymentStatus.COMPLETED,
      approvedById,
      approvedAt: new Date(),
    },
    include: {
      customer: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      supplier: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      allocations: true,
      approvedBy: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Get AR Outstanding Invoices
 */
export async function getAROutstandingInvoices(
  tenantId: string,
  query: AROutstandingInvoicesQuery
) {
  const where: any = {
    tenantId,
    deletedAt: null,
    status: {
      in: ["SENT", "PARTIALLY_PAID", "OVERDUE"],
    },
    balanceDue: {
      gt: 0,
    },
  };

  if (query.customerId) {
    where.customerId = query.customerId;
  }

  if (query.fromDate || query.toDate) {
    where.dueDate = {};
    if (query.fromDate) {
      where.dueDate.gte = new Date(query.fromDate);
    }
    if (query.toDate) {
      where.dueDate.lte = new Date(query.toDate);
    }
  }

  if (query.overdueOnly) {
    where.dueDate = {
      ...where.dueDate,
      lt: new Date(),
    };
    where.status = {
      in: ["SENT", "PARTIALLY_PAID", "OVERDUE"],
    };
  }

  const invoices = await prisma.salesInvoice.findMany({
    where,
    include: {
      customer: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
    orderBy: {
      dueDate: "asc",
    },
  });

  return invoices;
}

/**
 * Get AR Aging Analysis
 */
export async function getARAgingAnalysis(
  tenantId: string,
  query: ARAgingAnalysisQuery
) {
  const asOfDate = query.asOfDate ? new Date(query.asOfDate) : new Date();

  const where: any = {
    tenantId,
    deletedAt: null,
    status: {
      in: ["SENT", "PARTIALLY_PAID", "OVERDUE"],
    },
    balanceDue: {
      gt: 0,
    },
  };

  if (query.customerId) {
    where.customerId = query.customerId;
  }

  const invoices = await prisma.salesInvoice.findMany({
    where,
    include: {
      customer: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
  });

  // Calculate aging buckets
  const agingData = invoices.map((invoice) => {
    const daysPastDue = Math.max(
      0,
      Math.floor((asOfDate.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))
    );

    let current = new Decimal(0);
    let days30 = new Decimal(0);
    let days60 = new Decimal(0);
    let days90 = new Decimal(0);
    let daysOver90 = new Decimal(0);

    if (daysPastDue <= 0) {
      current = invoice.balanceDue;
    } else if (daysPastDue <= 30) {
      days30 = invoice.balanceDue;
    } else if (daysPastDue <= 60) {
      days60 = invoice.balanceDue;
    } else if (daysPastDue <= 90) {
      days90 = invoice.balanceDue;
    } else {
      daysOver90 = invoice.balanceDue;
    }

    return {
      invoice,
      daysPastDue,
      current,
      days30,
      days60,
      days90,
      daysOver90,
    };
  });

  // Group by customer
  const customerAging: Record<
    string,
    {
      customer: any;
      invoices: typeof agingData;
      totals: {
        current: Decimal;
        days30: Decimal;
        days60: Decimal;
        days90: Decimal;
        daysOver90: Decimal;
        total: Decimal;
      };
    }
  > = {};

  for (const item of agingData) {
    const customerId = item.invoice.customerId;
    if (!customerAging[customerId]) {
      customerAging[customerId] = {
        customer: item.invoice.customer,
        invoices: [],
        totals: {
          current: new Decimal(0),
          days30: new Decimal(0),
          days60: new Decimal(0),
          days90: new Decimal(0),
          daysOver90: new Decimal(0),
          total: new Decimal(0),
        },
      };
    }

    customerAging[customerId].invoices.push(item);
    customerAging[customerId].totals.current = customerAging[customerId].totals.current.plus(item.current);
    customerAging[customerId].totals.days30 = customerAging[customerId].totals.days30.plus(item.days30);
    customerAging[customerId].totals.days60 = customerAging[customerId].totals.days60.plus(item.days60);
    customerAging[customerId].totals.days90 = customerAging[customerId].totals.days90.plus(item.days90);
    customerAging[customerId].totals.daysOver90 = customerAging[customerId].totals.daysOver90.plus(item.daysOver90);
    customerAging[customerId].totals.total = customerAging[customerId].totals.total.plus(item.invoice.balanceDue);
  }

  // Calculate summary totals
  const summary = {
    current: new Decimal(0),
    days30: new Decimal(0),
    days60: new Decimal(0),
    days90: new Decimal(0),
    daysOver90: new Decimal(0),
    total: new Decimal(0),
  };

  for (const customerData of Object.values(customerAging)) {
    summary.current = summary.current.plus(customerData.totals.current);
    summary.days30 = summary.days30.plus(customerData.totals.days30);
    summary.days60 = summary.days60.plus(customerData.totals.days60);
    summary.days90 = summary.days90.plus(customerData.totals.days90);
    summary.daysOver90 = summary.daysOver90.plus(customerData.totals.daysOver90);
    summary.total = summary.total.plus(customerData.totals.total);
  }

  return {
    asOfDate,
    summary,
    byCustomer: Object.values(customerAging),
  };
}

/**
 * Get AP Outstanding Invoices
 */
export async function getAPOutstandingInvoices(
  tenantId: string,
  query: APOutstandingInvoicesQuery
) {
  const where: any = {
    tenantId,
    deletedAt: null,
    status: {
      in: ["APPROVED", "PARTIALLY_PAID", "OVERDUE"],
    },
    balanceDue: {
      gt: 0,
    },
  };

  if (query.supplierId) {
    where.supplierId = query.supplierId;
  }

  if (query.fromDate || query.toDate) {
    where.dueDate = {};
    if (query.fromDate) {
      where.dueDate.gte = new Date(query.fromDate);
    }
    if (query.toDate) {
      where.dueDate.lte = new Date(query.toDate);
    }
  }

  if (query.overdueOnly) {
    where.dueDate = {
      ...where.dueDate,
      lt: new Date(),
    };
    where.status = {
      in: ["APPROVED", "PARTIALLY_PAID", "OVERDUE"],
    };
  }

  const invoices = await prisma.purchaseInvoice.findMany({
    where,
    include: {
      supplier: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
    orderBy: {
      dueDate: "asc",
    },
  });

  return invoices;
}

/**
 * Get AP Aging Analysis
 */
export async function getAPAgingAnalysis(
  tenantId: string,
  query: APAgingAnalysisQuery
) {
  const asOfDate = query.asOfDate ? new Date(query.asOfDate) : new Date();

  const where: any = {
    tenantId,
    deletedAt: null,
    status: {
      in: ["APPROVED", "PARTIALLY_PAID", "OVERDUE"],
    },
    balanceDue: {
      gt: 0,
    },
  };

  if (query.supplierId) {
    where.supplierId = query.supplierId;
  }

  const invoices = await prisma.purchaseInvoice.findMany({
    where,
    include: {
      supplier: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
  });

  // Calculate aging buckets (same logic as AR)
  const agingData = invoices.map((invoice) => {
    const daysPastDue = Math.max(
      0,
      Math.floor((asOfDate.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))
    );

    let current = new Decimal(0);
    let days30 = new Decimal(0);
    let days60 = new Decimal(0);
    let days90 = new Decimal(0);
    let daysOver90 = new Decimal(0);

    if (daysPastDue <= 0) {
      current = invoice.balanceDue;
    } else if (daysPastDue <= 30) {
      days30 = invoice.balanceDue;
    } else if (daysPastDue <= 60) {
      days60 = invoice.balanceDue;
    } else if (daysPastDue <= 90) {
      days90 = invoice.balanceDue;
    } else {
      daysOver90 = invoice.balanceDue;
    }

    return {
      invoice,
      daysPastDue,
      current,
      days30,
      days60,
      days90,
      daysOver90,
    };
  });

  // Group by supplier
  const supplierAging: Record<
    string,
    {
      supplier: any;
      invoices: typeof agingData;
      totals: {
        current: Decimal;
        days30: Decimal;
        days60: Decimal;
        days90: Decimal;
        daysOver90: Decimal;
        total: Decimal;
      };
    }
  > = {};

  for (const item of agingData) {
    const supplierId = item.invoice.supplierId;
    if (!supplierAging[supplierId]) {
      supplierAging[supplierId] = {
        supplier: item.invoice.supplier,
        invoices: [],
        totals: {
          current: new Decimal(0),
          days30: new Decimal(0),
          days60: new Decimal(0),
          days90: new Decimal(0),
          daysOver90: new Decimal(0),
          total: new Decimal(0),
        },
      };
    }

    supplierAging[supplierId].invoices.push(item);
    supplierAging[supplierId].totals.current = supplierAging[supplierId].totals.current.plus(item.current);
    supplierAging[supplierId].totals.days30 = supplierAging[supplierId].totals.days30.plus(item.days30);
    supplierAging[supplierId].totals.days60 = supplierAging[supplierId].totals.days60.plus(item.days60);
    supplierAging[supplierId].totals.days90 = supplierAging[supplierId].totals.days90.plus(item.days90);
    supplierAging[supplierId].totals.daysOver90 = supplierAging[supplierId].totals.daysOver90.plus(item.daysOver90);
    supplierAging[supplierId].totals.total = supplierAging[supplierId].totals.total.plus(item.invoice.balanceDue);
  }

  // Calculate summary totals
  const summary = {
    current: new Decimal(0),
    days30: new Decimal(0),
    days60: new Decimal(0),
    days90: new Decimal(0),
    daysOver90: new Decimal(0),
    total: new Decimal(0),
  };

  for (const supplierData of Object.values(supplierAging)) {
    summary.current = summary.current.plus(supplierData.totals.current);
    summary.days30 = summary.days30.plus(supplierData.totals.days30);
    summary.days60 = summary.days60.plus(supplierData.totals.days60);
    summary.days90 = summary.days90.plus(supplierData.totals.days90);
    summary.daysOver90 = summary.daysOver90.plus(supplierData.totals.daysOver90);
    summary.total = summary.total.plus(supplierData.totals.total);
  }

  return {
    asOfDate,
    summary,
    bySupplier: Object.values(supplierAging),
  };
}

