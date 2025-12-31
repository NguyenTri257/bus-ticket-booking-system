# Admin Account Management API

## Overview
Admin endpoints for managing admin user accounts in the system. Requires authentication with super-admin role.

**Base URL:** `http://localhost:3001` (auth-service)  
**Authentication:** Bearer Token (Super Admin JWT)

---

## 🔐 Authentication
All admin account management endpoints require:
```
Authorization: Bearer <SUPER_ADMIN_JWT_TOKEN>
```

---

## 📋 API Endpoints

### 1. Create Admin Account
**POST** `/admin/accounts` or via API Gateway: `POST /auth/admin/accounts`

#### Request Body
```json
{
  "email": "admin@example.com",
  "phone": "+84901234567",
  "password": "SecurePass123!",
  "fullName": "John Doe"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email format, unique |
| phone | string | No | Valid phone format |
| password | string | Yes | Min 8 chars, 1 uppercase, 1 lowercase, 1 number |
| fullName | string | Yes | Min 2 chars, max 100 chars |

#### Example Request
```bash
# Direct to auth-service
curl -X POST "http://localhost:3001/admin/accounts" \
  -H "Authorization: Bearer <SUPER_ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "phone": "+84901234567",
    "password": "SecurePass123!",
    "fullName": "John Doe"
  }'

# Via API Gateway
curl -X POST "http://localhost:3000/auth/admin/accounts" \
  -H "Authorization: Bearer <SUPER_ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "phone": "+84901234567",
    "password": "SecurePass123!",
    "fullName": "John Doe"
  }'
```

#### Success Response (201)
```json
{
  "success": true,
  "data": {
    "adminId": "uuid",
    "email": "admin@example.com",
    "phone": "+84901234567",
    "fullName": "John Doe",
    "role": "admin",
    "status": "active",
    "createdAt": "2025-12-28T10:00:00.000Z"
  },
  "message": "Admin account created successfully",
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

#### Error Response (409)
```json
{
  "success": false,
  "error": {
    "code": "ADMIN_001",
    "message": "Admin account with this email already exists"
  },
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

### 2. Get All Admin Accounts
**GET** `/admin/accounts` or via API Gateway: `GET /auth/admin/accounts`

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number |
| limit | integer | No | 20 | Results per page (max 100) |
| status | string | No | - | Filter by status: `active`, `inactive`, `suspended` |
| search | string | No | - | Search by email or full name |

#### Example Request
```bash
# Direct to auth-service
curl -X GET "http://localhost:3001/admin/accounts?page=1&limit=10&status=active&search=john" \
  -H "Authorization: Bearer <SUPER_ADMIN_TOKEN>"

# Via API Gateway
curl -X GET "http://localhost:3000/auth/admin/accounts?page=1&limit=10&status=active&search=john" \
  -H "Authorization: Bearer <SUPER_ADMIN_TOKEN>"
```

#### Success Response (200)
```json
{
  "success": true,
  "data": [
    {
      "adminId": "uuid",
      "email": "admin@example.com",
      "phone": "+84901234567",
      "fullName": "John Doe",
      "role": "admin",
      "status": "active",
      "lastLogin": "2025-12-27T15:30:00.000Z",
      "createdAt": "2025-12-26T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  },
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

### 3. Get Admin Account by ID
**GET** `/admin/accounts/:id` or via API Gateway: `GET /auth/admin/accounts/:id`

#### Path Parameters
- `id` (string, required) - Admin UUID

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "adminId": "uuid",
    "email": "admin@example.com",
    "phone": "+84901234567",
    "fullName": "John Doe",
    "role": "admin",
    "status": "active",
    "lastLogin": "2025-12-27T15:30:00.000Z",
    "loginCount": 45,
    "createdAt": "2025-12-26T10:00:00.000Z",
    "updatedAt": "2025-12-27T15:30:00.000Z"
  },
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

#### Error Response (404)
```json
{
  "success": false,
  "error": {
    "code": "ADMIN_002",
    "message": "Admin account not found"
  },
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

### 4. Update Admin Account
**PUT** `/admin/accounts/:id` or via API Gateway: `PUT /auth/admin/accounts/:id`

#### Path Parameters
- `id` (string, required) - Admin UUID

#### Request Body
```json
{
  "phone": "+84901234567",
  "fullName": "John Smith",
  "status": "active"
}
```

**Updatable fields:** `phone`, `fullName`, `status`

#### Example Request
```bash
curl -X PUT "http://localhost:3001/admin/accounts/<admin_id>" \
  -H "Authorization: Bearer <SUPER_ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+84901234567",
    "fullName": "John Smith",
    "status": "active"
  }'
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "adminId": "uuid",
    "email": "admin@example.com",
    "phone": "+84901234567",
    "fullName": "John Smith",
    "status": "active",
    "updatedAt": "2025-12-28T10:00:00.000Z"
  },
  "message": "Admin account updated successfully",
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

### 5. Deactivate Admin Account
**PUT** `/admin/accounts/:id/deactivate` or via API Gateway: `PUT /auth/admin/accounts/:id/deactivate`

#### Path Parameters
- `id` (string, required) - Admin UUID

#### Request Body
```json
{
  "reason": "Employee left the company"
}
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "adminId": "uuid",
    "status": "inactive",
    "deactivatedAt": "2025-12-28T10:00:00.000Z",
    "deactivationReason": "Employee left the company"
  },
  "message": "Admin account deactivated successfully",
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

### 6. Reactivate Admin Account
**PUT** `/admin/accounts/:id/reactivate` or via API Gateway: `PUT /auth/admin/accounts/:id/reactivate`

#### Path Parameters
- `id` (string, required) - Admin UUID

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "adminId": "uuid",
    "status": "active",
    "reactivatedAt": "2025-12-28T10:00:00.000Z"
  },
  "message": "Admin account reactivated successfully",
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

### 7. Reset Admin Password
**PUT** `/admin/accounts/:id/reset-password` or via API Gateway: `PUT /auth/admin/accounts/:id/reset-password`

#### Path Parameters
- `id` (string, required) - Admin UUID

#### Request Body
```json
{
  "newPassword": "NewSecurePass123!"
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Admin password reset successfully",
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

### 8. Delete Admin Account
**DELETE** `/admin/accounts/:id` or via API Gateway: `DELETE /auth/admin/accounts/:id`

#### Path Parameters
- `id` (string, required) - Admin UUID

**Note:** Only inactive admin accounts can be deleted. Active accounts must be deactivated first.

#### Success Response (200)
```json
{
  "success": true,
  "message": "Admin account deleted successfully",
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

#### Error Response (409)
```json
{
  "success": false,
  "error": {
    "code": "ADMIN_003",
    "message": "Cannot delete active admin account"
  },
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

## 🔍 Filter Examples

### Filter by Status
```bash
GET /auth/admin/accounts?status=active&page=1&limit=20
```

### Search by Name or Email
```bash
GET /auth/admin/accounts?search=john&page=1&limit=20
```

### Combined Filters
```bash
GET /auth/admin/accounts?status=active&search=admin&page=1&limit=10
```

---

## 📊 Business Logic

### Admin Account Lifecycle
1. **Creation**
   - Email uniqueness validation
   - Password hashing with bcrypt (12 salt rounds)
   - Default role: `admin`
   - Default status: `active`
   - Welcome email notification sent

2. **Status Management**
   - **Active**: Full access to admin features
   - **Inactive**: Cannot login, account preserved for audit
   - **Suspended**: Temporarily blocked, can be reactivated

3. **Security Measures**
   - Password complexity requirements
   - Account lockout after failed attempts (future enhancement)
   - Session management and token invalidation
   - Audit logging for all admin actions

4. **Deletion Rules**
   - Only inactive accounts can be deleted
   - Active accounts must be deactivated first
   - Deletion is permanent and irreversible

### Role Hierarchy
- **Super Admin**: Can manage other admin accounts
- **Admin**: Can perform regular admin tasks but cannot manage other admins

---

## 🔐 Authorization

All endpoints require:
1. Valid JWT token
2. User role = `super-admin`

**Middleware:** `authenticate` → `authorize(['super-admin'])`

---

## 🧪 Testing

Run automated tests:
```bash
cd backend/services/auth-service
node test-admin-api.js
```

Before running tests:
1. Start auth-service: `npm start`
2. Get super-admin JWT token
3. Update `SUPER_ADMIN_TOKEN` in `test-admin-api.js`

---

## 📝 Error Codes

| Code | Description |
|------|-------------|
| VAL_001 | Validation error |
| AUTH_003 | Unauthorized access |
| ADMIN_001 | Email already exists |
| ADMIN_002 | Admin not found |
| ADMIN_003 | Cannot delete active account |
| ADMIN_012 | Phone number already exists |
| SYS_001 | Internal server error |

---

## 🚀 Future Enhancements

1. **Two-Factor Authentication (2FA)**
   - SMS or email-based 2FA for admin accounts
   - Backup codes for account recovery

2. **Advanced Security**
   - Account lockout after failed login attempts
   - IP whitelisting for admin access
   - Session timeout configuration

3. **Audit & Compliance**
   - Complete audit trail for all admin actions
   - GDPR compliance for data deletion
   - Admin activity reports

4. **Bulk Operations**
   - Bulk account creation via CSV upload
   - Bulk status updates
   - Bulk password reset

5. **Integration**
   - SSO integration with enterprise providers
   - Directory service integration (LDAP/Active Directory)</content>
<parameter name="filePath">c:\Users\HP\clones\bus-ticket-booking-system\backend\services\auth-service\ADMIN_ACCOUNT_MANAGEMENT_API.md