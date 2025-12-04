-- Database Roles Setup for Antariksa Accounting
-- This script creates database roles for secure multi-tenant access
-- Run this script as a database superuser (postgres)

-- ============================================
-- Step 1: Create Database Roles
-- ============================================

-- Application User Role (for application connections)
-- This role will be used by the application to connect to the database
-- DEVELOPMENT PASSWORD: Change this in production!
CREATE ROLE app_user WITH LOGIN PASSWORD 'dev_app_user_password_123';

-- Read-only Role (for reports, analytics, backups)
-- This role can only read data, not modify it
-- DEVELOPMENT PASSWORD: Change this in production!
CREATE ROLE app_readonly WITH LOGIN PASSWORD 'dev_app_readonly_password_123';

-- Admin Role (for migrations, maintenance, emergency access)
-- This role has full access for administrative tasks
-- DEVELOPMENT PASSWORD: Change this in production!
CREATE ROLE app_admin WITH LOGIN PASSWORD 'dev_app_admin_password_123';

-- ============================================
-- Step 2: Grant Database Connection
-- ============================================

-- Grant connection to the database
GRANT CONNECT ON DATABASE antariksa_accounting TO app_user;
GRANT CONNECT ON DATABASE antariksa_accounting TO app_readonly;
GRANT CONNECT ON DATABASE antariksa_accounting TO app_admin;

-- ============================================
-- Step 3: Grant Schema Usage
-- ============================================

-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO app_user;
GRANT USAGE ON SCHEMA public TO app_readonly;
GRANT USAGE ON SCHEMA public TO app_admin;

-- ============================================
-- Step 4: Grant Table Permissions
-- ============================================

-- App User: Full access to all tables (SELECT, INSERT, UPDATE, DELETE)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;

-- App Readonly: Only SELECT access
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readonly;

-- App Admin: Full access
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_admin;

-- ============================================
-- Step 5: Grant Sequence Permissions
-- ============================================

-- App User: Can use sequences (for auto-incrementing IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- App Admin: Full access to sequences
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_admin;

-- ============================================
-- Step 6: Grant Function Permissions
-- ============================================

-- Grant execute on the get_current_tenant_id function
GRANT EXECUTE ON FUNCTION get_current_tenant_id() TO app_user;
GRANT EXECUTE ON FUNCTION get_current_tenant_id() TO app_readonly;

-- ============================================
-- Step 7: Set Default Privileges (for future tables)
-- ============================================

-- Set default privileges for app_user on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;

-- Set default privileges for app_readonly on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT SELECT ON TABLES TO app_readonly;

-- Set default privileges for app_admin on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT ALL PRIVILEGES ON TABLES TO app_admin;

-- Set default privileges for sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT USAGE, SELECT ON SEQUENCES TO app_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT ALL PRIVILEGES ON SEQUENCES TO app_admin;

-- ============================================
-- Notes:
-- ============================================
-- 1. CHANGE ALL PASSWORDS before running in production
-- 2. Store passwords securely (environment variables, secrets manager)
-- 3. The application should use app_user role for normal operations
-- 4. Use app_readonly for reporting and analytics
-- 5. Use app_admin only for migrations and maintenance
-- 6. RLS policies will still apply based on tenant context
-- 7. Update DATABASE_URL in .env to use app_user role:
--    postgresql://app_user:password@localhost:5432/antariksa_accounting


