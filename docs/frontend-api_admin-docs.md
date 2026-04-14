========================================
ADMIN FRONTEND INTEGRATION SPECIFICATION
========================================

VERSION: v1
BASE URL: /api/admin
BACKEND URL: (leave as js variable)

----------------------------------------
GLOBAL RULES (ADMIN)
----------------------------------------

1. AUTHORIZATION
- ALL endpoints require:
  - Authenticated user
  - is_admin = true
- If unauthorized:
  - Redirect to login OR show "Access Denied"

2. ERROR HANDLING
- ALL endpoints may fail
- Implement retry logic:
  - Retry up to 3 times
  - Use small delay (300ms–800ms exponential backoff)

- Common errors:
  - "User not found"
  - "Cannot remove a fellow admin"
  - "Cannot remove yourself from admin"
  - Validation errors

3. RESPONSE HANDLING
- Always check:
  - message
  - returned object existence
- Never assume perfect structure

----------------------------------------
ADMIN DASHBOARD OVERVIEW
----------------------------------------

ADMIN UI SHOULD INCLUDE:

- User Management
- Competition Management
- Payments Overview
- Permissions Control

----------------------------------------
USER MANAGEMENT MODULE
----------------------------------------

### 1. GET ALL USERS

ENDPOINT:
GET /auth

SUCCESS RESPONSE:
{
  "users": [
    {
      "id": "string",
      "username": "string",
      "email": "string",
      "full_name": "string",
      "phone": "string | null",
      "school_name": "string | null",
      "is_active": boolean,
      "is_admin": boolean,
      "created_at": "ISO date"
    }
  ]
}

FRONTEND BEHAVIOR:
- Display users in table
- Include filters:
  - Active / Inactive
  - Admin / Non-admin
- Include search (email, username)

----------------------------------------

### 2. GET USER BY ID

ENDPOINT:
GET /auth/{id}

SUCCESS RESPONSE:
{
  "user": { ...same structure as above }
}

FRONTEND BEHAVIOR:
- Open user details view/modal
- Allow editing

----------------------------------------

### 3. UPDATE USER

ENDPOINT:
PUT /auth/{id}

REQUEST BODY:
{
  "username": "string",
  "email": "string",
  "full_name": "string",
  "phone": "string | null",
  "school_name": "string | null"
}

SUCCESS RESPONSE:
{
  "message": "User updated successfully",
  "user": { ...updated user object }
}

FRONTEND BEHAVIOR:
- Inline edit OR modal form
- Update UI immediately after success
- Show success toast

----------------------------------------

### 4. DELETE USER

ENDPOINT:
DELETE /auth/{id}

SUCCESS RESPONSE:
{
  "message": "User deleted successfully",
  "user": { ...deleted user }
}

FRONTEND BEHAVIOR:
- Show confirmation dialog BEFORE delete
- Remove user from UI after success

ERROR CASES:
- User not found
- Permission issues

----------------------------------------
COMPETITION MANAGEMENT MODULE
----------------------------------------

### 1. CREATE COMPETITION

ENDPOINT:
POST /competitions

REQUEST BODY:
{
  "title": "string",
  "description": "string",
  "price": "string | number"
}

SUCCESS RESPONSE:
{
  "message": "Competition created successfully",
  "competition": { ...competition object }
}

FRONTEND BEHAVIOR:
- Form submission
- Add new competition to list

----------------------------------------

### 2. UPDATE COMPETITION

ENDPOINT:
PUT or PATCH /competitions/{id}

REQUEST BODY:
{
  "title": "string",
  "description": "string",
  "price": "string | number"
}

SUCCESS RESPONSE:
{
  "message": "Competition updated successfully",
  "competition": { ...updated competition }
}

FRONTEND BEHAVIOR:
- Edit modal or inline editing
- Update UI instantly

----------------------------------------

### 3. DELETE COMPETITION

ENDPOINT:
DELETE /competitions/{id}

SUCCESS RESPONSE:
{
  "message": "Competition deleted successfully",
  "competition": { ...deleted competition }
}

FRONTEND BEHAVIOR:
- Confirmation dialog
- Remove from UI

----------------------------------------
PAYMENTS MODULE (ADMIN VIEW)
----------------------------------------

### 1. GET ALL TRANSACTIONS

ENDPOINT:
GET /payments

SUCCESS RESPONSE:
{
  "transactions": [
    {
      ...payment object
    }
  ]
}

FRONTEND BEHAVIOR:
- Display table of all payments
- Include:
  - Status
  - Amount
  - Date

----------------------------------------

### 2. GET RECENT TRANSACTIONS

ENDPOINT:
GET /payments/recent?days=X

DESCRIPTION:
- Default = 7 days
- X is optional query param

SUCCESS RESPONSE:
{
  "recent_transactions": [
    {
      ...payment object
    }
  ]
}

FRONTEND BEHAVIOR:
- Add filter:
  - Last 7 days (default)
  - Custom range
- Useful for dashboard analytics

----------------------------------------
PERMISSIONS MANAGEMENT MODULE
----------------------------------------

### 1. ACTIVATE USER

ENDPOINT:
PATCH /permissions/{id}/activate

SUCCESS RESPONSE:
{
  "message": "User activated",
  "user": { ...updated user }
}

----------------------------------------

### 2. DEACTIVATE USER

ENDPOINT:
PATCH /permissions/{id}/deactivate

SUCCESS RESPONSE:
{
  "message": "User deactivated",
  "user": { ...updated user }
}

----------------------------------------

### 3. MAKE USER ADMIN

ENDPOINT:
PATCH /permissions/{id}/make-admin

SUCCESS RESPONSE:
{
  "message": "User promoted to admin",
  "user": { ...updated user }
}

----------------------------------------

### 4. REMOVE ADMIN ROLE

ENDPOINT:
PATCH /permissions/{id}/remove-admin

SUCCESS RESPONSE:
{
  "message": "Admin role removed",
  "user": { ...updated user }
}

ERROR CASES:
- Cannot remove a fellow admin (depending on rules)
- Cannot remove yourself from admin

----------------------------------------
ADMIN UI FLOW (IMPORTANT)
----------------------------------------

1. LOGIN AS ADMIN
- Verify is_admin = true

2. DASHBOARD
- Overview:
  - Total users
  - Active users
  - Payments summary

3. USER MANAGEMENT
- View all users
- Edit / Delete
- Activate / Deactivate
- Promote / Demote admin

4. COMPETITION MANAGEMENT
- Create / Edit / Delete competitions

5. PAYMENTS VIEW
- View all transactions
- Filter recent transactions

----------------------------------------
NOTES FOR AI FRONTEND GENERATION
----------------------------------------

- Use modular services:
  - adminUserService
  - adminCompetitionService
  - adminPaymentService
  - adminPermissionService

- Strongly recommended UI:
  - Data tables (with pagination)
  - Modals for editing
  - Toast notifications

- Always:
  - Confirm destructive actions
  - Handle permission errors gracefully

----------------------------------------
END OF DOCUMENT
----------------------------------------