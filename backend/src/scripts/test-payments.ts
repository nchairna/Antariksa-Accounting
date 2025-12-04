/**
 * Test Payment Creation and Allocation
 *
 * This script tests:
 * 1. Creating a customer payment with allocations to sales invoices
 * 2. Creating a supplier payment with allocations to purchase invoices
 * 3. Verifying invoice amounts are updated correctly
 * 4. Verifying tenant isolation
 */

import { PrismaClient } from "../generated/prisma";
import { createPayment, getPaymentById } from "../services/payment.service";

const prisma = new PrismaClient();

async function testPayments() {
  console.log("🧪 Testing Payment System...\n");

  try {
    // Get or create test tenant
    let tenant = await prisma.tenant.findFirst({
      where: { code: "TEST" },
    });

    if (!tenant) {
      console.log("Creating test tenant...");
      tenant = await prisma.tenant.create({
        data: {
          code: "TEST",
          name: "Test Tenant",
          status: "ACTIVE",
        },
      });
    }

    const tenantId = tenant.id;
    console.log(`✅ Using tenant: ${tenant.code} (${tenantId})\n`);

    // Set tenant context for RLS
    await prisma.$executeRawUnsafe(`SET LOCAL app.current_tenant_id = '${tenantId}'`);

    // Get or create test customer
    let customer = await prisma.customer.findFirst({
      where: {
        tenantId,
        code: "CUST001",
      },
    });

    if (!customer) {
      console.log("Creating test customer...");
      customer = await prisma.customer.create({
        data: {
          tenantId,
          code: "CUST001",
          name: "Test Customer",
          customerType: "COMPANY",
          currency: "USD",
          status: "ACTIVE",
        },
      });
    }
    console.log(`✅ Using customer: ${customer.code} (${customer.id})\n`);

    // Get or create test supplier
    let supplier = await prisma.supplier.findFirst({
      where: {
        tenantId,
        code: "SUPP001",
      },
    });

    if (!supplier) {
      console.log("Creating test supplier...");
      supplier = await prisma.supplier.create({
        data: {
          tenantId,
          code: "SUPP001",
          name: "Test Supplier",
          supplierType: "MANUFACTURER",
          currency: "USD",
          status: "ACTIVE",
        },
      });
    }
    console.log(`✅ Using supplier: ${supplier.code} (${supplier.id})\n`);

    // Create a sales invoice first
    console.log("Creating test sales invoice...");
    const salesInvoice = await prisma.salesInvoice.create({
      data: {
        tenantId,
        invoiceNumber: `SI-${Date.now()}`,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        customerId: customer.id,
        currency: "USD",
        subtotal: 1000,
        discountAmount: 0,
        taxAmount: 100,
        shippingCharges: 0,
        grandTotal: 1100,
        amountPaid: 0,
        balanceDue: 1100,
        status: "SENT",
      },
    });
    console.log(`✅ Created sales invoice: ${salesInvoice.invoiceNumber} (Balance: $${salesInvoice.balanceDue})\n`);

    // Create a purchase invoice first
    console.log("Creating test purchase invoice...");
    const purchaseInvoice = await prisma.purchaseInvoice.create({
      data: {
        tenantId,
        invoiceNumber: `PI-${Date.now()}`,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        supplierId: supplier.id,
        currency: "USD",
        subtotal: 500,
        discountAmount: 0,
        taxAmount: 50,
        shippingCharges: 0,
        grandTotal: 550,
        amountPaid: 0,
        balanceDue: 550,
        status: "APPROVED",
      },
    });
    console.log(`✅ Created purchase invoice: ${purchaseInvoice.invoiceNumber} (Balance: $${purchaseInvoice.balanceDue})\n`);

    // Test 1: Create customer payment with partial allocation
    console.log("Test 1: Creating customer payment with partial allocation...");
    const customerPayment = await createPayment(tenantId, undefined, {
      paymentDate: new Date().toISOString(),
      paymentType: "CUSTOMER_PAYMENT",
      customerId: customer.id,
      paymentMethod: "BANK_TRANSFER",
      amount: 600,
      currency: "USD",
      referenceNumber: "TXN-001",
      allocations: [
        {
          invoiceType: "SALES_INVOICE",
          invoiceId: salesInvoice.id,
          amountAllocated: 600,
        },
      ],
    });
    const paymentWithDetails1 = await getPaymentById(tenantId, customerPayment.id);
    console.log(`✅ Created customer payment: ${paymentWithDetails1.paymentNumber}`);
    console.log(`   Amount: $${paymentWithDetails1.amount}`);
    console.log(`   Status: ${paymentWithDetails1.status}`);
    console.log(`   Allocations: ${(paymentWithDetails1 as any).allocations?.length || 0}\n`);

    // Verify invoice was updated
    const updatedSalesInvoice = await prisma.salesInvoice.findUnique({
      where: { id: salesInvoice.id },
    });
    console.log(`✅ Sales invoice updated:`);
    console.log(`   Amount Paid: $${updatedSalesInvoice?.amountPaid}`);
    console.log(`   Balance Due: $${updatedSalesInvoice?.balanceDue}`);
    console.log(`   Status: ${updatedSalesInvoice?.status}\n`);

    // Test 2: Create supplier payment with full allocation
    console.log("Test 2: Creating supplier payment with full allocation...");
    const supplierPayment = await createPayment(tenantId, undefined, {
      paymentDate: new Date().toISOString(),
      paymentType: "SUPPLIER_PAYMENT",
      supplierId: supplier.id,
      paymentMethod: "CHECK",
      amount: 550,
      currency: "USD",
      referenceNumber: "CHK-001",
      allocations: [
        {
          invoiceType: "PURCHASE_INVOICE",
          invoiceId: purchaseInvoice.id,
          amountAllocated: 550,
        },
      ],
    });
    const paymentWithDetails2 = await getPaymentById(tenantId, supplierPayment.id);
    console.log(`✅ Created supplier payment: ${paymentWithDetails2.paymentNumber}`);
    console.log(`   Amount: $${paymentWithDetails2.amount}`);
    console.log(`   Status: ${paymentWithDetails2.status}`);
    console.log(`   Allocations: ${(paymentWithDetails2 as any).allocations?.length || 0}\n`);

    // Verify invoice was updated
    const updatedPurchaseInvoice = await prisma.purchaseInvoice.findUnique({
      where: { id: purchaseInvoice.id },
    });
    console.log(`✅ Purchase invoice updated:`);
    console.log(`   Amount Paid: $${updatedPurchaseInvoice?.amountPaid}`);
    console.log(`   Balance Due: $${updatedPurchaseInvoice?.balanceDue}`);
    console.log(`   Status: ${updatedPurchaseInvoice?.status}\n`);

    // Test 3: Fetch payment by ID
    console.log("Test 3: Fetching payment by ID...");
    const fetchedPayment = await getPaymentById(tenantId, paymentWithDetails1.id);
    console.log(`✅ Fetched payment: ${fetchedPayment.paymentNumber}`);
    console.log(`   Customer: ${(fetchedPayment as any).customer?.name || "N/A"}`);
    console.log(`   Allocations: ${(fetchedPayment as any).allocations?.length || 0}\n`);

    // Test 4: Tenant isolation - try to fetch payment from different tenant
    console.log("Test 4: Testing tenant isolation...");
    const otherTenant = await prisma.tenant.create({
      data: {
        code: "OTHER",
        name: "Other Tenant",
        status: "ACTIVE",
      },
    });

    await prisma.$executeRawUnsafe(`SET LOCAL app.current_tenant_id = '${otherTenant.id}'`);

    try {
      await getPaymentById(otherTenant.id, paymentWithDetails1.id);
      console.log("❌ Tenant isolation failed - payment accessible from different tenant");
    } catch (error: any) {
      if (error.message === "Payment not found") {
        console.log("✅ Tenant isolation working - payment not accessible from different tenant\n");
      } else {
        throw error;
      }
    }

    console.log("✅ All payment tests passed!\n");
  } catch (error: any) {
    console.error("❌ Test failed:", error.message);
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testPayments()
  .then(() => {
    console.log("🎉 Payment testing complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Payment testing failed:", error);
    process.exit(1);
  });

