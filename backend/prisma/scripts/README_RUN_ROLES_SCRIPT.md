# How to Run Database Roles Script

## Option 1: Using psql Command Line

If PostgreSQL is installed and `psql` is in your PATH:

```bash
cd backend
psql -U postgres -d antariksa_accounting -f prisma/scripts/create_database_roles.sql
```

You'll be prompted for the postgres password.

## Option 2: Using pgAdmin

1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on `antariksa_accounting` database
4. Select "Query Tool"
5. Open the file: `backend/prisma/scripts/create_database_roles.sql`
6. Execute the script (F5 or click Run)

## Option 3: Using PostgreSQL Command Prompt

1. Open "SQL Shell (psql)" from PostgreSQL installation
2. Connect to your database:
   ```
   Server: localhost
   Database: antariksa_accounting
   Port: 5432
   Username: postgres
   Password: [your postgres password]
   ```
3. Run:
   ```
   \i C:\Users\nicho\Documents\Antariksa Accounting\backend\prisma\scripts\create_database_roles.sql
   ```

## What This Script Does

- Creates 3 database roles: `app_user`, `app_readonly`, `app_admin`
- Grants appropriate permissions to each role
- Sets up default privileges for future tables

## After Running

The script uses development passwords:
- `app_user`: `dev_app_user_password_123`
- `app_readonly`: `dev_app_readonly_password_123`
- `app_admin`: `dev_app_admin_password_123`

**⚠️ IMPORTANT**: Change these passwords before production!

## Verification

After running, you can verify the roles were created:

```sql
SELECT rolname FROM pg_roles WHERE rolname LIKE 'app_%';
```

You should see: `app_user`, `app_readonly`, `app_admin`



