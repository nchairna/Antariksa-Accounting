-- CreateEnum: ItemStatus (must be created before Item table)
CREATE TYPE "ItemStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DISCONTINUED', 'OUT_OF_STOCK');

-- CreateTable: Category
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Item
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT,
    "longDescription" TEXT,
    "categoryId" TEXT,
    "brand" TEXT,
    "modelNumber" TEXT,
    "barcode" TEXT,
    "unitOfMeasurement" TEXT NOT NULL DEFAULT 'PCS',
    "purchasePrice" DECIMAL(18,2) NOT NULL,
    "sellingPrice" DECIMAL(18,2) NOT NULL,
    "wholesalePrice" DECIMAL(18,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "taxCategoryId" TEXT,
    "taxRate" DECIMAL(5,4),
    "status" "ItemStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey: Category -> Tenant
ALTER TABLE "Category" ADD CONSTRAINT "Category_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Category -> Category (self-reference for hierarchy)
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: Item -> Tenant
ALTER TABLE "Item" ADD CONSTRAINT "Item_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Item -> Category
ALTER TABLE "Item" ADD CONSTRAINT "Item_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex: Category tenantId
CREATE INDEX "Category_tenantId_idx" ON "Category"("tenantId");

-- CreateIndex: Category parentId
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- CreateIndex: Category unique name per tenant
CREATE UNIQUE INDEX "Category_tenantId_name_key" ON "Category"("tenantId", "name");

-- CreateIndex: Item tenantId
CREATE INDEX "Item_tenantId_idx" ON "Item"("tenantId");

-- CreateIndex: Item unique code per tenant
CREATE UNIQUE INDEX "Item_tenantId_code_key" ON "Item"("tenantId", "code");

-- CreateIndex: Item categoryId
CREATE INDEX "Item_tenantId_categoryId_idx" ON "Item"("tenantId", "categoryId");

-- CreateIndex: Item barcode (nullable, so partial index)
CREATE INDEX "Item_tenantId_barcode_idx" ON "Item"("tenantId", "barcode") WHERE "barcode" IS NOT NULL;

-- Enable Row-Level Security on Category
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;

-- Enable Row-Level Security on Item
ALTER TABLE "Item" ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy for Category: Users can only access their tenant's categories
CREATE POLICY tenant_isolation_category ON "Category"
  FOR ALL
  USING ("tenantId" = get_current_tenant_id()::TEXT)
  WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT);

-- Create RLS Policy for Item: Users can only access their tenant's items
CREATE POLICY tenant_isolation_item ON "Item"
  FOR ALL
  USING ("tenantId" = get_current_tenant_id()::TEXT)
  WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT);

