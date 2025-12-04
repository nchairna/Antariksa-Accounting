-- Add RLS policies for Phase 3 Inventory tables
-- This migration enables Row-Level Security on InventoryLocation, ItemInventory, and StockMovement tables

-- Enable RLS on InventoryLocation
ALTER TABLE "InventoryLocation" ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for InventoryLocation
CREATE POLICY tenant_isolation_inventory_location ON "InventoryLocation"
  FOR ALL
  USING ("tenantId" = get_current_tenant_id()::TEXT)
  WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT);

-- Enable RLS on ItemInventory
ALTER TABLE "ItemInventory" ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for ItemInventory
CREATE POLICY tenant_isolation_item_inventory ON "ItemInventory"
  FOR ALL
  USING ("tenantId" = get_current_tenant_id()::TEXT)
  WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT);

-- Enable RLS on StockMovement
ALTER TABLE "StockMovement" ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for StockMovement
CREATE POLICY tenant_isolation_stock_movement ON "StockMovement"
  FOR ALL
  USING ("tenantId" = get_current_tenant_id()::TEXT)
  WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT);



