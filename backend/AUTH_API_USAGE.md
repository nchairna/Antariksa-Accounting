# Authentication API Usage Guide

## Overview

The authentication system provides user registration, login, logout, and current user endpoints. All endpoints require tenant context (except health check).

## Endpoints

### 1. Register User (Admin-Created)
**POST** `/api/auth/register`

Creates a new user in the specified tenant. This is for admin-created users (no public registration).

**Headers:**
```
x-tenant-id: <tenant-id>  (or include tenantId in body)
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",  // optional
  "roleId": "role-uuid",    // optional
  "tenantId": "tenant-uuid" // optional if provided in header
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "roleId": "role-uuid",
    "tenantId": "tenant-uuid"
  },
  "token": "jwt-token-here"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

---

### 2. Login
**POST** `/api/auth/login`

Authenticates a user and returns a JWT token.

**Headers:**
```
x-tenant-id: <tenant-id>  (or include tenantId in body)
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "tenantId": "tenant-uuid"  // optional if provided in header
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "roleId": "role-uuid",
    "tenantId": "tenant-uuid"
  },
  "token": "jwt-token-here"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid email or password
- `400 Bad Request`: Missing tenant ID or validation error

---

### 3. Get Current User
**GET** `/api/auth/me`

Returns the currently authenticated user's information.

**Headers:**
```
Authorization: Bearer <jwt-token>
x-tenant-id: <tenant-id>  (optional - will use tenant from JWT)
```

**Response (200):**
```json
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "roleId": "role-uuid",
    "tenantId": "tenant-uuid"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: No token provided or invalid token

---

### 4. Logout
**POST** `/api/auth/logout`

Invalidates the current user session.

**Headers:**
```
Authorization: Bearer <jwt-token>
x-tenant-id: <tenant-id>  (optional - will use tenant from JWT)
```

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

## Testing with Postman/Thunder Client

### Step 1: Get a Tenant ID
First, you need a tenant ID. You can:
- Check your database for existing tenants
- Create a tenant via Prisma Studio: `npm run db:studio`

### Step 2: Register a User
1. Set method to **POST**
2. URL: `http://localhost:4000/api/auth/register`
3. Headers:
   - `x-tenant-id`: `<your-tenant-id>`
   - `Content-Type`: `application/json`
4. Body (JSON):
```json
{
  "email": "admin@example.com",
  "username": "admin",
  "password": "Admin123",
  "firstName": "Admin",
  "lastName": "User"
}
```
5. Send request
6. **Save the token** from the response

### Step 3: Login
1. Set method to **POST**
2. URL: `http://localhost:4000/api/auth/login`
3. Headers:
   - `x-tenant-id`: `<your-tenant-id>`
   - `Content-Type`: `application/json`
4. Body (JSON):
```json
{
  "email": "admin@example.com",
  "password": "Admin123"
}
```
5. Send request
6. **Save the token** from the response

### Step 4: Test Protected Route
1. Set method to **GET**
2. URL: `http://localhost:4000/api/auth/me`
3. Headers:
   - `Authorization`: `Bearer <your-token>`
   - `x-tenant-id`: `<your-tenant-id>` (optional - token contains tenant)
4. Send request

### Step 5: Logout
1. Set method to **POST**
2. URL: `http://localhost:4000/api/auth/logout`
3. Headers:
   - `Authorization`: `Bearer <your-token>`
4. Send request

---

## Environment Variables

Make sure to set these in your `.env` file:

```env
# Database
DATABASE_URL="postgresql://app_user:password@localhost:5432/antariksa_accounting"

# JWT
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"  # Token expiration (default: 7 days)

# Server
PORT=4000
```

**Important:** Change `JWT_SECRET` to a strong, random string in production!

---

## Security Notes

1. **Password Hashing**: All passwords are hashed using bcrypt (10 salt rounds)
2. **JWT Tokens**: Tokens contain user info and tenant ID, expire after 7 days (configurable)
3. **Session Management**: Each login creates a session record in the database
4. **Tenant Isolation**: All queries are automatically filtered by tenant via RLS
5. **Token Validation**: Tokens are verified on every protected request

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": []  // Optional: validation errors
}
```

Common HTTP Status Codes:
- `200`: Success
- `201`: Created (registration)
- `400`: Bad Request (validation errors, missing data)
- `401`: Unauthorized (invalid credentials, missing token)
- `403`: Forbidden (tenant mismatch)
- `409`: Conflict (email/username already exists)
- `500`: Internal Server Error

---

## Next Steps

After authentication is working:
1. Build frontend login/register pages
2. Implement protected routes in frontend
3. Add role-based access control (RBAC) middleware
4. Implement password reset functionality
5. Add email verification



