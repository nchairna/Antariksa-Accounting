-- CreateEnum: CustomerType
CREATE TYPE "CustomerType" AS ENUM ('INDIVIDUAL', 'COMPANY', 'GOVERNMENT');

-- CreateEnum: CustomerStatus
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED', 'ON_HOLD');

-- CreateEnum: AddressType
CREATE TYPE "AddressType" AS ENUM ('BILLING', 'SHIPPING');

-- CreateTable: Customer
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "customerType" "CustomerType" NOT NULL DEFAULT 'COMPANY',
    "email" TEXT,
    "phone" TEXT,
    "taxId" TEXT,
    "creditLimit" DECIMAL(18,2),
    "paymentTerms" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "defaultDiscount" DECIMAL(5,4),
    "priceListId" TEXT,
    "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CustomerAddress
CREATE TABLE "CustomerAddress" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
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

    CONSTRAINT "CustomerAddress_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey: Customer -> Tenant
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: CustomerAddress -> Customer
ALTER TABLE "CustomerAddress" ADD CONSTRAINT "CustomerAddress_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: CustomerAddress -> Tenant
ALTER TABLE "CustomerAddress" ADD CONSTRAINT "CustomerAddress_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex: Customer tenantId
CREATE INDEX "Customer_tenantId_idx" ON "Customer"("tenantId");

-- CreateIndex: Customer unique code per tenant
CREATE UNIQUE INDEX "Customer_tenantId_code_key" ON "Customer"("tenantId", "code");

-- CreateIndex: Customer email (nullable, so partial index)
CREATE INDEX "Customer_tenantId_email_idx" ON "Customer"("tenantId", "email") WHERE "email" IS NOT NULL;

-- CreateIndex: CustomerAddress tenantId
CREATE INDEX "CustomerAddress_tenantId_idx" ON "CustomerAddress"("tenantId");

-- CreateIndex: CustomerAddress customerId
CREATE INDEX "CustomerAddress_customerId_idx" ON "CustomerAddress"("customerId");

-- Enable Row-Level Security on Customer
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;

-- Enable Row-Level Security on CustomerAddress
ALTER TABLE "CustomerAddress" ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy for Customer: Users can only access their tenant's customers
CREATE POLICY tenant_isolation_customer ON "Customer"
  FOR ALL
  USING ("tenantId" = get_current_tenant_id()::TEXT)
  WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT);

-- Create RLS Policy for CustomerAddress: Users can only access their tenant's customer addresses
CREATE POLICY tenant_isolation_customer_address ON "CustomerAddress"
  FOR ALL
  USING ("tenantId" = get_current_tenant_id()::TEXT)
  WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT);



