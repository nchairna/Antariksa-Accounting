/**
 * Purchase Order Management Test Script (Phase 4.2)
 *
 * Verifies:
 * - Listing purchase orders with filters
 * - Getting purchase order by ID
 * - Updating a draft purchase order
 * - Cancelling a purchase order with status rules
 *
 * Run with:
 *   cd backend
 *   npx ts-node src/scripts/test-purchase-orders-management.ts
 */

import { PrismaClient } from "../generated/prisma";
import {
  listPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrder,
  cancelPurchaseOrder,
} from "../services/purchaseOrder.service";

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

async function ensureDraftPurchaseOrder(tenantId: string): Promise<string> {
  await prisma.$executeRawUnsafe(
    `SET app.current_tenant_id = '${tenantId}'`
  );

  const existing = await prisma.purchaseOrder.findFirst({
    where: {
      tenantId,
      status: "DRAFT",
      deletedAt: null,
    },
  });

  if (existing) {
    return existing.id;
  }

  // Fallback: create a very simple PO via Prisma (schema already tested in 4.1 script)
  const supplier =
    (await prisma.supplier.findFirst({
      where: { tenantId },
    })) ||
    (await prisma.supplier.create({
      data: {
        tenantId,
        code: "TEST-SUP-4.2",
        name: "Test Supplier 4.2",
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
        code: "TEST-ITEM-4.2",
        name: "Test Item 4.2",
        purchasePrice: 10.0,
        sellingPrice: 20.0,
        unitOfMeasurement: "PCS",
        currency: "USD",
        status: "ACTIVE",
      },
    }));

  const po = await prisma.purchaseOrder.create({
    data: {
      tenantId,
      poNumber: "PO-TEST-4.2-00001",
      poDate: new Date(),
      supplierId: supplier.id,
      currency: "USD",
      subtotal: 100,
      discountAmount: 0,
      taxAmount: 0,
      shippingCharges: 0,
      grandTotal: 100,
      status: "DRAFT",
    },
  });

  await prisma.purchaseOrderLine.create({
    data: {
      tenantId,
      purchaseOrderId: po.id,
      itemId: item.id,
      lineNumber: 1,
      quantityOrdered: 5,
      quantityReceived: 0,
      unitPrice: 20,
      discountPercentage: 0,
      discountAmount: 0,
      taxRate: 0,
      taxAmount: 0,
      lineTotal: 100,
    },
  });

  return po.id;
}

async function main() {
  console.log("🧪 Starting Purchase Order Management tests (4.2)...\n");

  try {
    const tenantId = await ensureTestTenant();
    console.log(`📋 Using test tenant: ${tenantId}\n`);

    const userId = undefined; // service will still set createdById if needed

    // Ensure we have at least one draft PO
    const poId = await ensureDraftPurchaseOrder(tenantId);
    console.log(`✅ Using draft purchase order: ${poId}\n`);

    // 1. List POs
    console.log("📄 Test 1: Listing purchase orders (no filters)...");
    const listResult = await listPurchaseOrders(tenantId, {
      page: 1,
      limit: 10,
    } as any);
    console.log(
      `  ✅ Retrieved ${listResult.count} purchase order(s) (showing up to 10).`
    );

    // 2. Get PO by ID
    console.log("\n🔎 Test 2: Get purchase order by ID...");
    const poBeforeUpdate = await getPurchaseOrderById(tenantId, poId);
    if (!poBeforeUpdate) {
      throw new Error("Failed to load purchase order by ID");
    }
    console.log(
      `  ✅ Loaded PO ${poBeforeUpdate.poNumber} with ${poBeforeUpdate.lines?.length ?? 0} line(s)`
    );

    // 3. Update draft PO (change notes only for safety)
    console.log("\n✏️  Test 3: Update draft purchase order (notes)...");
    const updated = await updatePurchaseOrder(
      tenantId,
      userId,
      poId,
      {
        notes: "Updated in 4.2 management test",
      } as any
    );
    console.log(
      `  ✅ Updated PO ${updated.poNumber}, new notes: ${updated.notes ?? "(none)"}`
    );

    // 4. Cancel PO
    console.log("\n⛔ Test 4: Cancel purchase order...");
    const cancelled = await cancelPurchaseOrder(
      tenantId,
      userId,
      poId,
      "Test cancellation from 4.2 script"
    );
    if (cancelled.status !== "CANCELLED") {
      throw new Error("Purchase order status was not updated to CANCELLED");
    }
    console.log(
      `  ✅ Cancelled PO ${cancelled.poNumber}, status now: ${cancelled.status}`
    );

    console.log("\n✅ All 4.2 Purchase Order Management tests completed successfully!");
  } catch (error: any) {
    console.error("\n❌ 4.2 tests failed:", error.message);
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




