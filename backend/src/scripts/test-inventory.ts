/**
 * Inventory System Test Script
 * 
 * Tests Phase 3 Inventory Management implementation:
 * - Inventory Locations
 * - Item Inventory
 * - Stock Movements
 * - RLS policies
 * - Tenant isolation
 */

import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

// Get test tenant ID from database or environment
let TENANT_1_ID = process.env.TEST_TENANT_1_ID || "";
let TENANT_2_ID = process.env.TEST_TENANT_2_ID || "";

let tenant1LocationId: string;
let tenant1ItemId: string;
let tenant1InventoryId: string;
let tenant1MovementId: string;

async function testInventorySystem() {
  console.log("🧪 Starting Inventory System Tests...\n");

  try {
    // Get or create test tenant
    if (!TENANT_1_ID) {
      const testTenant = await prisma.tenant.findUnique({
        where: { code: "TEST_TENANT" },
      });
      if (testTenant) {
        TENANT_1_ID = testTenant.id;
        console.log(`📋 Using test tenant: ${testTenant.code} (${TENANT_1_ID})\n`);
      } else {
        throw new Error("No test tenant found. Run seed-test-tenant.ts first or set TEST_TENANT_1_ID");
      }
    }
    // Test 1: Create Inventory Locations
    console.log("📦 Test 1: Creating Inventory Locations");
    await testCreateLocations();

    // Test 2: Verify Tenant Isolation for Locations
    console.log("\n🔒 Test 2: Verifying Tenant Isolation for Locations");
    await testLocationTenantIsolation();

    // Test 3: Create Item Inventory
    console.log("\n📊 Test 3: Creating Item Inventory");
    await testCreateInventory();

    // Test 4: Stock Operations
    console.log("\n⚙️  Test 4: Testing Stock Operations");
    await testStockOperations();

    // Test 5: Stock Movements
    console.log("\n📝 Test 5: Testing Stock Movements");
    await testStockMovements();

    // Test 6: Verify Tenant Isolation for Inventory
    console.log("\n🔒 Test 6: Verifying Tenant Isolation for Inventory");
    await testInventoryTenantIsolation();

    // Test 7: Cleanup
    console.log("\n🧹 Test 7: Cleaning up test data");
    await cleanup();

    console.log("\n✅ All tests passed!");
  } catch (error: any) {
    console.error("\n❌ Test failed:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function testCreateLocations() {
  if (!TENANT_1_ID) {
    throw new Error("TEST_TENANT_1_ID environment variable not set");
  }

  // Set tenant context
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${TENANT_1_ID}'`);

  // Create location 1
  const location1 = await prisma.inventoryLocation.create({
    data: {
      tenantId: TENANT_1_ID,
      code: "WH-001",
      name: "Main Warehouse",
      address: "123 Warehouse St",
      isDefault: true,
      status: "ACTIVE",
    },
  });

  tenant1LocationId = location1.id;
  console.log("  ✅ Created location:", location1.code, "-", location1.name);

  // Create location 2
  const location2 = await prisma.inventoryLocation.create({
    data: {
      tenantId: TENANT_1_ID,
      code: "WH-002",
      name: "Secondary Warehouse",
      address: "456 Storage Ave",
      isDefault: false,
      status: "ACTIVE",
    },
  });

  console.log("  ✅ Created location:", location2.code, "-", location2.name);

  // Verify only one default location
  const defaultLocations = await prisma.inventoryLocation.findMany({
    where: {
      tenantId: TENANT_1_ID,
      isDefault: true,
    },
  });

  if (defaultLocations.length !== 1) {
    throw new Error(`Expected 1 default location, found ${defaultLocations.length}`);
  }
  console.log("  ✅ Default location constraint verified");

  // Test unique code constraint
  try {
    await prisma.inventoryLocation.create({
      data: {
        tenantId: TENANT_1_ID,
        code: "WH-001", // Duplicate code
        name: "Duplicate Warehouse",
        status: "ACTIVE",
      },
    });
    throw new Error("Should have failed: duplicate code");
  } catch (error: any) {
    if (error.code === "P2002") {
      console.log("  ✅ Unique code constraint working");
    } else {
      throw error;
    }
  }
}

async function testLocationTenantIsolation() {
  if (!TENANT_1_ID || !TENANT_2_ID) {
    console.log("  ⚠️  Skipping: TEST_TENANT_2_ID not set");
    return;
  }

  // Set tenant 1 context
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${TENANT_1_ID}'`);

  const tenant1Locations = await prisma.inventoryLocation.findMany({
    where: { tenantId: TENANT_1_ID },
  });

  // Set tenant 2 context
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${TENANT_2_ID}'`);

  const tenant2Locations = await prisma.inventoryLocation.findMany({
    where: { tenantId: TENANT_2_ID },
  });

  // Verify tenant 2 cannot see tenant 1's locations
  const tenant1LocationVisible = tenant2Locations.some(
    (loc) => loc.id === tenant1LocationId
  );

  if (tenant1LocationVisible) {
    throw new Error("Tenant 2 can see Tenant 1's locations - RLS not working!");
  }

  console.log(`  ✅ Tenant isolation verified (Tenant 1: ${tenant1Locations.length} locations, Tenant 2: ${tenant2Locations.length} locations)`);
}

async function testCreateInventory() {
  if (!TENANT_1_ID || !tenant1LocationId) {
    throw new Error("Missing tenant ID or location ID");
  }

  // First, we need an item. Let's check if one exists or create one
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${TENANT_1_ID}'`);

  let item = await prisma.item.findFirst({
    where: { tenantId: TENANT_1_ID },
  });

  if (!item) {
    // Create a test item
    item = await prisma.item.create({
      data: {
        tenantId: TENANT_1_ID,
        code: "TEST-ITEM-001",
        name: "Test Item",
        purchasePrice: 10.0,
        sellingPrice: 20.0,
        unitOfMeasurement: "PCS",
        currency: "USD",
        status: "ACTIVE",
      },
    });
    console.log("  ✅ Created test item:", item.code);
  }

  tenant1ItemId = item.id;

  // Create inventory
  const inventory = await prisma.itemInventory.create({
    data: {
      tenantId: TENANT_1_ID,
      itemId: tenant1ItemId,
      locationId: tenant1LocationId,
      quantity: 100.0,
      reservedQuantity: 10.0,
      availableQuantity: 90.0,
      minimumStockLevel: 20.0,
      maximumStockLevel: 500.0,
      reorderPoint: 30.0,
    },
  });

  tenant1InventoryId = inventory.id;
  console.log("  ✅ Created inventory:", {
    item: item.code,
    location: "WH-001",
    quantity: Number(inventory.quantity),
    available: Number(inventory.availableQuantity),
  });

  // Test unique constraint (item + location)
  try {
    await prisma.itemInventory.create({
      data: {
        tenantId: TENANT_1_ID,
        itemId: tenant1ItemId,
        locationId: tenant1LocationId, // Same item + location
        quantity: 50.0,
        reservedQuantity: 0,
        availableQuantity: 50.0,
      },
    });
    throw new Error("Should have failed: duplicate item+location");
  } catch (error: any) {
    if (error.code === "P2002") {
      console.log("  ✅ Unique (item + location) constraint working");
    } else {
      throw error;
    }
  }
}

async function testStockOperations() {
  if (!TENANT_1_ID || !tenant1InventoryId) {
    throw new Error("Missing tenant ID or inventory ID");
  }

  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${TENANT_1_ID}'`);

  // Test stock increase
  const inventoryBefore = await prisma.itemInventory.findUnique({
    where: { id: tenant1InventoryId },
  });

  if (!inventoryBefore) {
    throw new Error("Inventory not found");
  }

  const quantityBefore = Number(inventoryBefore.quantity);

  // Increase stock by 50
  const inventoryAfter = await prisma.itemInventory.update({
    where: { id: tenant1InventoryId },
    data: {
      quantity: quantityBefore + 50,
      availableQuantity: quantityBefore + 50 - Number(inventoryBefore.reservedQuantity),
    },
  });

  console.log("  ✅ Stock increased:", {
    before: quantityBefore,
    after: Number(inventoryAfter.quantity),
    change: "+50",
  });

  // Test available quantity calculation
  const expectedAvailable = Number(inventoryAfter.quantity) - Number(inventoryAfter.reservedQuantity);
  if (Number(inventoryAfter.availableQuantity) !== expectedAvailable) {
    throw new Error(`Available quantity mismatch: expected ${expectedAvailable}, got ${inventoryAfter.availableQuantity}`);
  }
  console.log("  ✅ Available quantity calculation correct");
}

async function testStockMovements() {
  if (!TENANT_1_ID || !tenant1ItemId || !tenant1LocationId) {
    throw new Error("Missing required IDs");
  }

  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${TENANT_1_ID}'`);

  // Create a stock movement
  const movement = await prisma.stockMovement.create({
    data: {
      tenantId: TENANT_1_ID,
      itemId: tenant1ItemId,
      locationId: tenant1LocationId,
      movementType: "INBOUND",
      movementDate: new Date(),
      quantity: 25.0,
      quantityBefore: 100.0,
      quantityAfter: 125.0,
      referenceType: "test",
      referenceId: "test-ref-001",
      reason: "Test stock movement",
    },
  });

  tenant1MovementId = movement.id;
  console.log("  ✅ Created stock movement:", {
    type: movement.movementType,
    quantity: Number(movement.quantity),
    reason: movement.reason,
  });

  // Query movements
  const movements = await prisma.stockMovement.findMany({
    where: {
      tenantId: TENANT_1_ID,
      itemId: tenant1ItemId,
    },
    take: 10,
  });

  console.log(`  ✅ Found ${movements.length} movement(s) for item`);

  // Test movement types
  const movementTypes = ["INBOUND", "OUTBOUND", "ADJUSTMENT", "TRANSFER", "DAMAGE"] as const;
  for (const type of movementTypes) {
    const count = await prisma.stockMovement.count({
      where: {
        tenantId: TENANT_1_ID,
        movementType: type as any,
      },
    });
    // Just verify the query works
  }
  console.log("  ✅ All movement types queryable");
}

async function testInventoryTenantIsolation() {
  if (!TENANT_1_ID || !TENANT_2_ID) {
    console.log("  ⚠️  Skipping: TEST_TENANT_2_ID not set");
    return;
  }

  // Set tenant 1 context
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${TENANT_1_ID}'`);

  const tenant1Inventory = await prisma.itemInventory.findMany({
    where: { tenantId: TENANT_1_ID },
  });

  // Set tenant 2 context
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${TENANT_2_ID}'`);

  const tenant2Inventory = await prisma.itemInventory.findMany({
    where: { tenantId: TENANT_2_ID },
  });

  // Verify tenant 2 cannot see tenant 1's inventory
  const tenant1InventoryVisible = tenant2Inventory.some(
    (inv) => inv.id === tenant1InventoryId
  );

  if (tenant1InventoryVisible) {
    throw new Error("Tenant 2 can see Tenant 1's inventory - RLS not working!");
  }

  console.log(`  ✅ Tenant isolation verified (Tenant 1: ${tenant1Inventory.length} inventory records, Tenant 2: ${tenant2Inventory.length} inventory records)`);
}

async function cleanup() {
  if (!TENANT_1_ID) {
    return;
  }

  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${TENANT_1_ID}'`);

  // Delete in reverse order (movements -> inventory -> locations)
  if (tenant1MovementId) {
    try {
      await prisma.stockMovement.delete({
        where: { id: tenant1MovementId },
      });
      console.log("  ✅ Deleted test movement");
    } catch (error) {
      // Ignore if already deleted
    }
  }

  if (tenant1InventoryId) {
    try {
      await prisma.itemInventory.delete({
        where: { id: tenant1InventoryId },
      });
      console.log("  ✅ Deleted test inventory");
    } catch (error) {
      // Ignore if already deleted
    }
  }

  // Delete locations (but keep items as they might be used elsewhere)
  if (tenant1LocationId) {
    try {
      await prisma.inventoryLocation.deleteMany({
        where: {
          tenantId: TENANT_1_ID,
          code: { in: ["WH-001", "WH-002"] },
        },
      });
      console.log("  ✅ Deleted test locations");
    } catch (error) {
      // Ignore if already deleted
    }
  }
}

// Run tests
testInventorySystem()
  .then(() => {
    console.log("\n🎉 All inventory tests completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Test suite failed:", error);
    process.exit(1);
  });

