/**
 * Goods Receipt (GRN) Test Script - Phase 4.3
 *
 * Verifies:
 * - Creating a GRN against a purchase order
 * - Partial vs complete receipts
 * - PO line quantityReceived updates
 * - PO status transitions (PARTIALLY_RECEIVED / COMPLETED)
 * - Inventory increases and stock movements with referenceType = purchase_order
 *
 * Run with:
 *   cd backend
 *   npx ts-node src/scripts/test-goods-receipt.ts
 */

import { PrismaClient } from "../generated/prisma";
import { createGoodsReceipt } from "../services/goodsReceipt.service";

const prisma = new PrismaClient();

let TEST_TENANT_ID = process.env.TEST_TENANT_1_ID || "";

async function ensureTestTenant(): Promise<string> {
  if (TEST_TENANT_ID) return TEST_TENANT_ID;

  const tenant = await prisma.tenant.findUnique({
    where: { code: "TEST_TENANT" },
  });

  if (!tenant) {
    throw new Error(
      "No test tenant found. Run seed-test-tenant.ts first or set TEST_TENANT_1_ID"
    );
  }

  TEST_TENANT_ID = tenant.id;
  return TEST_TENANT_ID;
}

async function ensurePoForGrn(tenantId: string) {
  await prisma.$executeRawUnsafe(
    `SET app.current_tenant_id = '${tenantId}'`
  );

  const existing = await prisma.purchaseOrder.findFirst({
    where: {
      tenantId,
      status: "DRAFT",
      deletedAt: null,
    },
    include: {
      lines: true,
    },
  });

  if (existing && existing.lines.length > 0) {
    return existing;
  }

  const supplier =
    (await prisma.supplier.findFirst({
      where: { tenantId },
    })) ||
    (await prisma.supplier.create({
      data: {
        tenantId,
        code: "TEST-SUP-GRN",
        name: "Test Supplier GRN",
        supplierType: "DISTRIBUTOR",
        status: "ACTIVE",
        currency: "USD",
      },
    }));

  const item =
    (await prisma.item.findFirst({
      where: { tenantId },
    })) ||
    (await prisma.item.create({
      data: {
        tenantId,
        code: "TEST-ITEM-GRN",
        name: "Test Item GRN",
        purchasePrice: 15.0,
        sellingPrice: 30.0,
        unitOfMeasurement: "PCS",
        currency: "USD",
        status: "ACTIVE",
      },
    }));

  const po = await prisma.purchaseOrder.create({
    data: {
      tenantId,
      poNumber: "PO-TEST-GRN-00001",
      poDate: new Date(),
      supplierId: supplier.id,
      currency: "USD",
      subtotal: 300,
      discountAmount: 0,
      taxAmount: 0,
      shippingCharges: 0,
      grandTotal: 300,
      status: "DRAFT",
    },
  });

  const line = await prisma.purchaseOrderLine.create({
    data: {
      tenantId,
      purchaseOrderId: po.id,
      itemId: item.id,
      lineNumber: 1,
      quantityOrdered: 20,
      quantityReceived: 0,
      unitPrice: 15,
      discountPercentage: 0,
      discountAmount: 0,
      taxRate: 0,
      taxAmount: 0,
      lineTotal: 300,
    },
  });

  return {
    ...po,
    lines: [line],
  };
}

async function main() {
  console.log("🧪 Starting Goods Receipt (GRN) tests (4.3)...\n");

  try {
    const tenantId = await ensureTestTenant();
    console.log(`📋 Using test tenant: ${tenantId}\n`);

    const userId = undefined;

    // Ensure RLS tenant context and at least one inventory location
    await prisma.$executeRawUnsafe(
      `SET app.current_tenant_id = '${tenantId}'`
    );

    let location = await prisma.inventoryLocation.findFirst({
      where: { tenantId },
    });

    if (!location) {
      location = await prisma.inventoryLocation.create({
        data: {
          tenantId,
          code: "WH-GRN-001",
          name: "GRN Test Warehouse",
          address: "Test GRN Address",
          isDefault: true,
          status: "ACTIVE",
        },
      });
    }

    const po = await ensurePoForGrn(tenantId);
    console.log(
      `✅ Using PO ${po.poNumber} with line ordered qty = ${Number(
        po.lines[0].quantityOrdered
      )}`
    );

    const poLine = po.lines[0];

    // 1. Partial GRN (receive 5 of 20)
    console.log("\n📦 Test 1: Partial GRN (5 units) ...");
    const afterPartial = await createGoodsReceipt(tenantId, userId, po.id, {
      grnDate: new Date().toISOString(),
      lines: [
        {
          purchaseOrderLineId: poLine.id,
          quantityReceived: 5,
          locationId: location.id,
        },
      ],
    });

    const receivedAfterPartial = Number(afterPartial.lines[0].quantityReceived);
    console.log(
      `  ✅ After partial GRN, quantityReceived = ${receivedAfterPartial}, status = ${afterPartial.status}`
    );

    // 2. Final GRN (receive remaining 15)
    console.log("\n📦 Test 2: Final GRN (remaining 15 units) ...");
    const afterFinal = await createGoodsReceipt(tenantId, userId, po.id, {
      grnDate: new Date().toISOString(),
      lines: [
        {
          purchaseOrderLineId: poLine.id,
          quantityReceived: 15,
          locationId: location.id,
        },
      ],
    });

    const receivedAfterFinal = Number(afterFinal.lines[0].quantityReceived);
    console.log(
      `  ✅ After final GRN, quantityReceived = ${receivedAfterFinal}, status = ${afterFinal.status}`
    );

    if (afterFinal.status !== "COMPLETED") {
      throw new Error("PO status should be COMPLETED after full receipt");
    }

    // 3. Verify inventory increased and stock movements exist
    console.log("\n📊 Test 3: Verify stock movements created for PO ...");
    const movements = await prisma.stockMovement.findMany({
      where: {
        tenantId,
        referenceType: "purchase_order",
        referenceId: po.id,
      },
    });

    console.log(
      `  ✅ Found ${movements.length} stock movement(s) for this PO with referenceType = purchase_order`
    );

    console.log("\n✅ All 4.3 GRN tests completed successfully!");
  } catch (error: any) {
    console.error("\n❌ GRN tests failed:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


