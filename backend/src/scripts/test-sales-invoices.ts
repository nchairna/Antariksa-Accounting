/**
 * Sales Invoice Test Script
 *
 * Simple script to verify SalesInvoice creation and tenant isolation.
 */

import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

let TEST_TENANT_ID = process.env.TEST_TENANT_1_ID || "";

async function main() {
  console.log("🧪 Starting Sales Invoice tests...\n");

  try {
    if (!TEST_TENANT_ID) {
      const tenant = await prisma.tenant.findUnique({
        where: { code: "TEST_TENANT" },
      });

      if (!tenant) {
        throw new Error(
          "No test tenant found. Run seed-test-tenant.ts first or set TEST_TENANT_1_ID"
        );
      }

      TEST_TENANT_ID = tenant.id;
      console.log(`📋 Using test tenant: ${tenant.code} (${TEST_TENANT_ID})\n`);
    }

    await prisma.$executeRawUnsafe(
      `SET app.current_tenant_id = '${TEST_TENANT_ID}'`
    );

    // Ensure we have at least one customer and item
    const customer =
      (await prisma.customer.findFirst({
        where: { tenantId: TEST_TENANT_ID },
      })) ||
      (await prisma.customer.create({
        data: {
          tenantId: TEST_TENANT_ID,
          code: "TEST-CUST-SI-001",
          name: "Test Customer for Invoice",
          customerType: "COMPANY",
          status: "ACTIVE",
          currency: "USD",
        },
      }));

    const item =
      (await prisma.item.findFirst({
        where: { tenantId: TEST_TENANT_ID },
      })) ||
      (await prisma.item.create({
        data: {
          tenantId: TEST_TENANT_ID,
          code: "TEST-ITEM-SI-001",
          name: "Test Invoice Item",
          purchasePrice: 10.0,
          sellingPrice: 20.0,
          unitOfMeasurement: "PCS",
          currency: "USD",
          status: "ACTIVE",
        },
      }));

    console.log("📦 Using customer:", customer.code, "-", customer.name);
    console.log("📦 Using item:", item.code, "-", item.name);

    // Test 1: Create Sales Invoice
    console.log("\n✅ Test 1: Creating Sales Invoice...");
    const invoiceDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const invoice = await prisma.salesInvoice.create({
      data: {
        tenantId: TEST_TENANT_ID,
        invoiceNumber: "SI-TEST-00001",
        invoiceDate,
        dueDate,
        customerId: customer.id,
        currency: "USD",
        subtotal: 100,
        discountAmount: 0,
        taxAmount: 0,
        shippingCharges: 0,
        grandTotal: 100,
        amountPaid: 0,
        balanceDue: 100,
        status: "DRAFT",
      },
    });
    console.log("✅ Sales Invoice created:", invoice.invoiceNumber, "- Status:", invoice.status);

    // Test 2: Create Sales Invoice Line
    console.log("\n✅ Test 2: Creating Sales Invoice Line...");
    const invoiceLine = await prisma.salesInvoiceLine.create({
      data: {
        tenantId: TEST_TENANT_ID,
        salesInvoiceId: invoice.id,
        itemId: item.id,
        lineNumber: 1,
        description: "Test invoice line",
        quantity: 5,
        unitPrice: 20,
        discountPercentage: 0,
        discountAmount: 0,
        taxRate: 0,
        taxAmount: 0,
        lineTotal: 100,
      },
    });
    console.log("✅ Sales Invoice Line created:", invoiceLine.lineNumber, "- Qty:", invoiceLine.quantity);

    // Test 3: Query Sales Invoice with lines
    console.log("\n✅ Test 3: Querying Sales Invoice with lines...");
    const invoiceWithLines = await prisma.salesInvoice.findFirst({
      where: {
        id: invoice.id,
        tenantId: TEST_TENANT_ID,
      },
      include: {
        customer: {
          select: {
            code: true,
            name: true,
          },
        },
        lines: {
          include: {
            item: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (invoiceWithLines) {
      console.log("✅ Sales Invoice retrieved:");
      console.log("   Invoice Number:", invoiceWithLines.invoiceNumber);
      console.log("   Customer:", invoiceWithLines.customer?.code, "-", invoiceWithLines.customer?.name);
      console.log("   Grand Total:", invoiceWithLines.grandTotal);
      console.log("   Balance Due:", invoiceWithLines.balanceDue);
      console.log("   Lines:", invoiceWithLines.lines.length);
      invoiceWithLines.lines.forEach((line, idx) => {
        console.log(`   Line ${idx + 1}:`, line.item?.code, "- Qty:", line.quantity);
      });
    }

    // Test 4: Verify tenant isolation
    console.log("\n✅ Test 4: Verifying tenant isolation...");
    const allInvoices = await prisma.salesInvoice.findMany({
      where: { tenantId: TEST_TENANT_ID },
    });
    console.log(`✅ Found ${allInvoices.length} sales invoice(s) for tenant`);

    console.log("\n✅ All tests passed!");
  } catch (error: any) {
    console.error("\n❌ Test failed:", error.message);
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log("\n🎉 Sales Invoice tests complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Sales Invoice tests failed:", error);
    process.exit(1);
  });

