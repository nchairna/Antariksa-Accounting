/**
 * Delivery Note Service
 *
 * Delivers goods against sales orders, updates SO lines,
 * inventory, and stock movements.
 */

import { PrismaClient } from "../generated/prisma";
import { CreateDeliveryNoteInput } from "../validators/salesOrder.validator";
import { getDefaultLocation } from "./location.service";
import {
  getInventoryByItemAndLocation,
  createOrUpdateItemInventory,
} from "./inventory.service";
import { createStockMovement } from "./stockMovement.service";

const prisma = new PrismaClient();

export async function createDeliveryNote(
  tenantId: string,
  userId: string | undefined,
  salesOrderId: string,
  input: CreateDeliveryNoteInput
) {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const so = await prisma.salesOrder.findFirst({
    where: {
      id: salesOrderId,
      tenantId,
      deletedAt: null,
    },
    include: {
      lines: true,
    },
  });

  if (!so) {
    throw new Error("Sales order not found or does not belong to this tenant");
  }

  if (so.status === "CANCELLED") {
    throw new Error("Cannot deliver goods for a cancelled sales order");
  }

  // Map SO lines by id for quick access
  const soLineMap = new Map(
    so.lines.map((line) => [line.id, line])
  );

  // Validate lines
  for (const line of input.deliveryLines) {
    const soLine = soLineMap.get(line.salesOrderLineId);
    if (!soLine) {
      throw new Error(
        "One or more sales order lines not found or do not belong to this order"
      );
    }

    const ordered = Number(soLine.quantityOrdered);
    const alreadyDelivered = Number(soLine.quantityDelivered);
    const incoming = Number(line.quantityDelivered);

    if (alreadyDelivered + incoming > ordered) {
      throw new Error(
        "Delivered quantity exceeds ordered quantity for one or more lines"
      );
    }

    // Check available stock
    let locationId = line.locationId || null;
    if (!locationId) {
      const defaultLocation = await getDefaultLocation(tenantId);
      if (!defaultLocation) {
        throw new Error(
          "No default location found for tenant and no location specified for delivery line"
        );
      }
      locationId = defaultLocation.id;
    }

    const inventory = await getInventoryByItemAndLocation(
      tenantId,
      soLine.itemId,
      locationId
    );

    const availableQty = inventory
      ? Number(inventory.availableQuantity)
      : 0;

    if (availableQty < incoming) {
      throw new Error(
        `Insufficient stock available for item. Available: ${availableQty}, Required: ${incoming}`
      );
    }
  }

  const deliveryDate = input.deliveryDate ? new Date(input.deliveryDate) : new Date();

  // Perform updates in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // For each line, update SO line, inventory, and stock movement
    for (const line of input.deliveryLines) {
      const soLine = soLineMap.get(line.salesOrderLineId)!;

      const ordered = Number(soLine.quantityOrdered);
      const alreadyDelivered = Number(soLine.quantityDelivered);
      const incoming = Number(line.quantityDelivered);
      const newDelivered = alreadyDelivered + incoming;

      // Update SO line quantityDelivered
      await tx.salesOrderLine.update({
        where: {
          id: soLine.id,
        },
        data: {
          quantityDelivered: newDelivered,
        },
      });

      // Determine location (explicit or default)
      let locationId = line.locationId || null;
      if (!locationId) {
        const defaultLocation = await getDefaultLocation(tenantId);
        if (!defaultLocation) {
          throw new Error(
            "No default location found for tenant and no location specified for delivery line"
          );
        }
        locationId = defaultLocation.id;
      }

      // Update inventory: get or create, then subtract outgoing quantity
      let inventory = await getInventoryByItemAndLocation(
        tenantId,
        soLine.itemId,
        locationId
      );

      if (!inventory) {
        throw new Error(
          `Inventory not found for item at location. Cannot deliver without stock.`
        );
      }

      const quantityBefore = Number(inventory.quantity);
      const quantityAfter = quantityBefore - incoming;

      if (quantityAfter < 0) {
        throw new Error(
          `Insufficient stock. Available: ${quantityBefore}, Required: ${incoming}`
        );
      }

      inventory = await tx.itemInventory.update({
        where: {
          id: inventory.id,
        },
        data: {
          quantity: quantityAfter,
          availableQuantity:
            quantityAfter - Number(inventory.reservedQuantity),
        },
      }) as any;

      // Create stock movement with reference to SO (OUTBOUND)
      await createStockMovement(
        tenantId,
        {
          itemId: soLine.itemId,
          locationId,
          movementType: "OUTBOUND",
          movementDate: deliveryDate,
          quantity: -incoming, // Negative for outbound
          quantityBefore,
          quantityAfter,
          referenceType: "sales_order",
          referenceId: salesOrderId,
          costPerUnit: Number(soLine.unitPrice),
          totalCost: Number(soLine.unitPrice) * incoming,
          reason: "Delivery from sales order",
        },
        userId
      );
    }

    // Recompute SO status based on lines
    const refreshedLines = await tx.salesOrderLine.findMany({
      where: {
        tenantId,
        salesOrderId: so.id,
      },
    });

    let allDelivered = true;
    let anyDelivered = false;
    for (const l of refreshedLines) {
      const ordered = Number(l.quantityOrdered);
      const delivered = Number(l.quantityDelivered);
      if (delivered > 0) {
        anyDelivered = true;
      }
      if (delivered < ordered) {
        allDelivered = false;
      }
    }

    let newStatus = so.status;
    if (allDelivered && refreshedLines.length > 0) {
      newStatus = "COMPLETED";
    } else if (anyDelivered) {
      newStatus = "PARTIALLY_DELIVERED";
    }

    const updatedSo = await tx.salesOrder.update({
      where: { id: so.id },
      data: {
        status: newStatus,
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

  return result as any;
}

