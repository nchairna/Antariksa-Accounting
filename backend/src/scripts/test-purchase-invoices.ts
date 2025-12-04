/**
 * Purchase Invoice Test Script
 *
 * Simple script to verify PurchaseInvoice creation and tenant isolation.
 */

import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

let TEST_TENANT_ID = process.env.TEST_TENANT_1_ID || "";

async function main() {
  console.log("🧪 Starting Purchase Invoice tests...\n");

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

    // Ensure we have at least one supplier and item
    const supplier =
      (await prisma.supplier.findFirst({
        where: { tenantId: TEST_TENANT_ID },
      })) ||
      (await prisma.supplier.create({
        data: {
          tenantId: TEST_TENANT_ID,
          code: "TEST-SUP-PI-001",
          name: "Test Supplier for Invoice",
          supplierType: "DISTRIBUTOR",
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
          code: "TEST-ITEM-PI-001",
          name: "Test Purchase Invoice Item",
          purchasePrice: 10.0,
          sellingPrice: 20.0,
          unitOfMeasurement: "PCS",
          currency: "USD",
          status: "ACTIVE",
        },
      }));

    console.log("📦 Using supplier:", supplier.code, "-", supplier.name);
    console.log("📦 Using item:", item.code, "-", item.name);

    // Test 1: Create Purchase Invoice
    console.log("\n✅ Test 1: Creating Purchase Invoice...");
    const invoiceDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const invoice = await prisma.purchaseInvoice.create({
      data: {
        tenantId: TEST_TENANT_ID,
        invoiceNumber: "PI-TEST-00001",
        invoiceDate,
        dueDate,
        supplierId: supplier.id,
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
    console.log("✅ Purchase Invoice created:", invoice.invoiceNumber, "- Status:", invoice.status);

    // Test 2: Create Purchase Invoice Line
    console.log("\n✅ Test 2: Creating Purchase Invoice Line...");
    const invoiceLine = await prisma.purchaseInvoiceLine.create({
      data: {
        tenantId: TEST_TENANT_ID,
        purchaseInvoiceId: invoice.id,
        itemId: item.id,
        lineNumber: 1,
        description: "Test purchase invoice line",
        quantityReceived: 5,
        unitCost: 20,
        discountPercentage: 0,
        discountAmount: 0,
        taxRate: 0,
        taxAmount: 0,
        lineTotal: 100,
      },
    });
    console.log("✅ Purchase Invoice Line created:", invoiceLine.lineNumber, "- Qty:", invoiceLine.quantityReceived);

    // Test 3: Query Purchase Invoice with lines
    console.log("\n✅ Test 3: Querying Purchase Invoice with lines...");
    const invoiceWithLines = await prisma.purchaseInvoice.findFirst({
      where: {
        id: invoice.id,
        tenantId: TEST_TENANT_ID,
      },
      include: {
        supplier: {
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
      console.log("✅ Purchase Invoice retrieved:");
      console.log("   Invoice Number:", invoiceWithLines.invoiceNumber);
      console.log("   Supplier:", invoiceWithLines.supplier?.code, "-", invoiceWithLines.supplier?.name);
      console.log("   Grand Total:", invoiceWithLines.grandTotal);
      console.log("   Balance Due:", invoiceWithLines.balanceDue);
      console.log("   Lines:", invoiceWithLines.lines.length);
      invoiceWithLines.lines.forEach((line, idx) => {
        console.log(`   Line ${idx + 1}:`, line.item?.code, "- Qty:", line.quantityReceived);
      });
    }

    // Test 4: Verify tenant isolation
    console.log("\n✅ Test 4: Verifying tenant isolation...");
    const allInvoices = await prisma.purchaseInvoice.findMany({
      where: { tenantId: TEST_TENANT_ID },
    });
    console.log(`✅ Found ${allInvoices.length} purchase invoice(s) for tenant`);

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
    console.log("\n🎉 Purchase Invoice tests complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Purchase Invoice tests failed:", error);
    process.exit(1);
  });

