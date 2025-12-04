-- Row-Level Security (RLS) Setup for Multi-Tenant Architecture
-- This migration enables RLS on all tenant-specific tables and creates isolation policies

-- Step 1: Create function to get current tenant ID from session
CREATE OR REPLACE FUNCTION get_current_tenant_id() RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('app.current_tenant_id', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Enable Row-Level Security on all tenant-specific tables
-- Note: Tenant table itself doesn't need RLS as it's the root table

-- Enable RLS on TenantSetting
ALTER TABLE "TenantSetting" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on Role
ALTER TABLE "Role" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on User
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on UserSession
ALTER TABLE "UserSession" ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS Policies for tenant isolation

-- Policy for TenantSetting: Users can only access their tenant's settings
CREATE POLICY tenant_isolation_tenant_setting ON "TenantSetting"
  FOR ALL
  USING ("tenantId" = get_current_tenant_id()::TEXT)
  WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT);

-- Policy for Role: Users can only access their tenant's roles
CREATE POLICY tenant_isolation_role ON "Role"
  FOR ALL
  USING ("tenantId" = get_current_tenant_id()::TEXT)
  WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT);

-- Policy for User: Users can only access their tenant's users
CREATE POLICY tenant_isolation_user ON "User"
  FOR ALL
  USING ("tenantId" = get_current_tenant_id()::TEXT)
  WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT);

-- Policy for UserSession: Users can only access their tenant's sessions
CREATE POLICY tenant_isolation_user_session ON "UserSession"
  FOR ALL
  USING ("tenantId" = get_current_tenant_id()::TEXT)
  WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT);

-- Note: Permission and RolePermission tables are global (not tenant-specific)
-- They don't need RLS as they're shared across all tenants
