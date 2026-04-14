This re-ordered documentation follows the same professional structure as the public guide. It is designed to help an AI agent immediately understand the hierarchy, resource management, and permission logic required for an Admin Dashboard.
------------------------------
## Admin API Documentation & Implementation Guide (Protected)## 1. Global Admin Rules

* Authorization: All routes require a Bearer Token with is_admin: true permissions.
* Base URL: /api/admin
* Error Handling: Implement specific UI feedback for the following edge cases:
* 403 Forbidden: Attempting to remove your own admin status or another admin's status.
   * 404 Not Found: Operating on a non-existent User, Competition, or Transaction ID.
* Retry Logic: Same as public endpoints (Max 3 retries, 2-second interval).

------------------------------
## 2. User Management Module## List & Detail Operations

* Get All Users: GET /auth
* Usage: Populate a user management table.
* Get User by ID: GET /auth/:id
* Usage: Deep-dive view for a specific user.

## Update & Delete

* Update User: PUT /auth/:id
* Payload: { username, email, full_name, phone, school_name }
* Delete User: DELETE /auth/:id
* Note: Irreversible action. Frontend should require a confirmation modal.

------------------------------
## 3. Permission & Access Control
These endpoints manage the is_active and is_admin flags. Use PATCH for partial state updates.

| Action | Endpoint | Expected Result |
|---|---|---|
| Activate | PATCH /permissions/:id/activate | Sets is_active: true |
| Deactivate | PATCH /permissions/:id/deactivate | Sets is_active: false |
| Promote | PATCH /permissions/:id/make-admin | Sets is_admin: true |
| Demote | PATCH /permissions/:id/remove-admin | Sets is_admin: false |

------------------------------
## 4. Competition Management Module## Create / Update / Delete

* Create: POST /competitions
* Payload: { title, description, price }
* Update: PUT /competitions/:id
* Payload: { title, description, price }
* Delete: DELETE /competitions/:id

------------------------------
## 5. Financial & Transaction Module## Transaction History

* All Transactions: GET /payments
* Usage: Master ledger for all platform payments.
* Recent Transactions: GET /payments/recent?days=X
* Query Param: days (Default: 7).
   * Usage: Dashboard statistics and "Recent Activity" widgets.

------------------------------
## 6. Admin Data Schema (Reference)
The AI agent should expect the User object in this format for all Admin responses:

{
    "id": "uuid",
    "username": "string",
    "email": "string",
    "full_name": "string",
    "is_active": "boolean",
    "is_admin": "boolean",
    "created_at": "ISO-8601"
}

------------------------------
Should I now generate a protected Admin Route wrapper or a Dashboard Layout in React to handle these views?

