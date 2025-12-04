/**
 * Goods Receipt (GRN) Service
 *
 * Receives goods against purchase orders, updates PO lines,
 * inventory, and stock movements.
 */

import { PrismaClient } from "../generated/prisma";
import { CreateGoodsReceiptInput } from "../validators/goodsReceipt.validator";
import { getDefaultLocation } from "./location.service";
import {
  getInventoryByItemAndLocation,
  createOrUpdateItemInventory,
} from "./inventory.service";
import { createStockMovement } from "./stockMovement.service";

const prisma = new PrismaClient();

export async function createGoodsReceipt(
  tenantId: string,
  userId: string | undefined,
  purchaseOrderId: string,
  input: CreateGoodsReceiptInput
) {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const po = await prisma.purchaseOrder.findFirst({
    where: {
      id: purchaseOrderId,
      tenantId,
      deletedAt: null,
    },
    include: {
      lines: true,
    },
  });

  if (!po) {
    throw new Error("Purchase order not found or does not belong to this tenant");
  }

  if (po.status === "CANCELLED") {
    throw new Error("Cannot receive goods for a cancelled purchase order");
  }

  // Map PO lines by id for quick access
  const poLineMap = new Map(
    po.lines.map((line) => [line.id, line])
  );

  // Validate lines
  for (const line of input.lines) {
    const poLine = poLineMap.get(line.purchaseOrderLineId);
    if (!poLine) {
      throw new Error(
        "One or more purchase order lines not found or do not belong to this order"
      );
    }

    const ordered = Number(poLine.quantityOrdered);
    const alreadyReceived = Number(poLine.quantityReceived);
    const incoming = Number(line.quantityReceived);

    if (alreadyReceived + incoming > ordered) {
      throw new Error(
        "Received quantity exceeds ordered quantity for one or more lines"
      );
    }
  }

  const grnDate = input.grnDate ? new Date(input.grnDate) : new Date();

  // Perform updates in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // For each line, update PO line, inventory, and stock movement
    for (const line of input.lines) {
      const poLine = poLineMap.get(line.purchaseOrderLineId)!;

      const ordered = Number(poLine.quantityOrdered);
      const alreadyReceived = Number(poLine.quantityReceived);
      const incoming = Number(line.quantityReceived);
      const newReceived = alreadyReceived + incoming;

      // Update PO line quantityReceived
      await tx.purchaseOrderLine.update({
        where: {
          id: poLine.id,
        },
        data: {
          quantityReceived: newReceived,
        },
      });

      // Determine location (explicit or default)
      let locationId = line.locationId || null;
      if (!locationId) {
        const defaultLocation = await getDefaultLocation(tenantId);
        if (!defaultLocation) {
          throw new Error(
            "No default location found for tenant and no location specified for GRN line"
          );
        }
        locationId = defaultLocation.id;
      }

      // Update inventory: get or create, then add incoming quantity
      let inventory = await getInventoryByItemAndLocation(
        tenantId,
        poLine.itemId,
        locationId
      );

      const quantityBefore = inventory ? Number(inventory.quantity) : 0;
      const quantityAfter = quantityBefore + incoming;

      if (!inventory) {
        inventory = await createOrUpdateItemInventory(
          tenantId,
          {
            itemId: poLine.itemId,
            locationId,
            quantity: quantityAfter,
            reservedQuantity: 0,
          },
          userId
        );
      } else {
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
      }

      // Create stock movement with reference to PO
      await createStockMovement(
        tenantId,
        {
          itemId: poLine.itemId,
          locationId,
          movementType: "INBOUND",
          movementDate: grnDate,
          quantity: incoming,
          quantityBefore,
          quantityAfter,
          referenceType: "purchase_order",
          referenceId: purchaseOrderId,
          costPerUnit: Number(poLine.unitPrice),
          totalCost: Number(poLine.unitPrice) * incoming,
          reason: "Goods receipt from purchase order",
        },
        userId
      );
    }

    // Recompute PO status based on lines
    const refreshedLines = await tx.purchaseOrderLine.findMany({
      where: {
        tenantId,
        purchaseOrderId: po.id,
      },
    });

    let allReceived = true;
    let anyReceived = false;
    for (const l of refreshedLines) {
      const ordered = Number(l.quantityOrdered);
      const received = Number(l.quantityReceived);
      if (received > 0) {
        anyReceived = true;
      }
      if (received < ordered) {
        allReceived = false;
      }
    }

    let newStatus = po.status;
    if (allReceived && refreshedLines.length > 0) {
      newStatus = "COMPLETED";
    } else if (anyReceived) {
      newStatus = "PARTIALLY_RECEIVED";
    }

    const updatedPo = await tx.purchaseOrder.update({
      where: { id: po.id },
      data: {
        status: newStatus,
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
        },
      },
    });

    return updatedPo;
  });

  return result as any;
}




