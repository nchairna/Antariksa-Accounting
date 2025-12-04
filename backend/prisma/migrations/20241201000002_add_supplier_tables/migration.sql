-- CreateEnum: SupplierType
CREATE TYPE "SupplierType" AS ENUM ('MANUFACTURER', 'DISTRIBUTOR', 'WHOLESALER');

-- CreateEnum: SupplierStatus
CREATE TYPE "SupplierStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED', 'ON_HOLD');

-- CreateTable: Supplier
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "supplierType" "SupplierType" NOT NULL DEFAULT 'DISTRIBUTOR',
    "email" TEXT,
    "phone" TEXT,
    "taxId" TEXT,
    "paymentTerms" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "bankName" TEXT,
    "bankAccountNumber" TEXT,
    "bankRoutingNumber" TEXT,
    "swiftCode" TEXT,
    "status" "SupplierStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable: SupplierAddress
CREATE TABLE "SupplierAddress" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "addressType" "AddressType" NOT NULL,
    "streetAddress" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "stateProvince" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierAddress_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey: Supplier -> Tenant
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: SupplierAddress -> Supplier
ALTER TABLE "SupplierAddress" ADD CONSTRAINT "SupplierAddress_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: SupplierAddress -> Tenant
ALTER TABLE "SupplierAddress" ADD CONSTRAINT "SupplierAddress_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex: Supplier tenantId
CREATE INDEX "Supplier_tenantId_idx" ON "Supplier"("tenantId");

-- CreateIndex: Supplier unique code per tenant
CREATE UNIQUE INDEX "Supplier_tenantId_code_key" ON "Supplier"("tenantId", "code");

-- CreateIndex: SupplierAddress tenantId
CREATE INDEX "SupplierAddress_tenantId_idx" ON "SupplierAddress"("tenantId");

-- CreateIndex: SupplierAddress supplierId
CREATE INDEX "SupplierAddress_supplierId_idx" ON "SupplierAddress"("supplierId");

-- Enable Row-Level Security on Supplier
ALTER TABLE "Supplier" ENABLE ROW LEVEL SECURITY;

-- Enable Row-Level Security on SupplierAddress
ALTER TABLE "SupplierAddress" ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy for Supplier: Users can only access their tenant's suppliers
CREATE POLICY tenant_isolation_supplier ON "Supplier"
  FOR ALL
  USING ("tenantId" = get_current_tenant_id()::TEXT)
  WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT);

-- Create RLS Policy for SupplierAddress: Users can only access their tenant's supplier addresses
CREATE POLICY tenant_isolation_supplier_address ON "SupplierAddress"
  FOR ALL
  USING ("tenantId" = get_current_tenant_id()::TEXT)
  WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT);



