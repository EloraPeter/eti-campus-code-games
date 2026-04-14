========================================
FRONTEND INTEGRATION SPECIFICATION
========================================

VERSION: v1
BASE URL: /api/v1
BACKEND URL: (leave as js variable)

----------------------------------------
GLOBAL RULES
----------------------------------------

1. ERROR HANDLING
- ALL endpoints may fail.
- Implement retry logic:
  - Retry up to 3 times
  - Use small delay between retries (e.g. 300ms–800ms exponential backoff)
- Always handle:
  - Network errors
  - 4xx errors (user issues)
  - 5xx errors (server issues)

2. AUTHENTICATION
- Assume authentication is session or token-based (not explicitly defined)
- Persist user session after login
- Protect authenticated routes

3. RESPONSE HANDLING
- Always check:
  - response.message
  - existence of expected fields
- Do NOT assume perfect structure on failure

----------------------------------------
AUTH MODULE
----------------------------------------

### 1. LOGIN

ENDPOINT:
POST /auth/login

REQUEST BODY:
{
  "email": "string",
  "password": "string"
}

SUCCESS RESPONSE:
{
  "message": "Login successful",
  "user": {
    "id": "string",
    "email": "string",
    "username": "string"
  }
}

FRONTEND BEHAVIOR:
- Save user data
- Redirect to dashboard/home
- Show success notification

FAILURE:
- Show error message (varies)

----------------------------------------

### 2. REGISTER

ENDPOINT:
POST /auth/register

DESCRIPTION:
- User must select a competition before registering
- Account is NOT active until payment is completed

REQUEST BODY:
{
  "competition_id": "string (required)",
  "full_name": "string (optional)",
  "email": "string (required)",
  "username": "string (required)",
  "password": "string (required)",
  "phone": "string (optional)",
  "school_name": "string (optional)",
  "provider": "string (required)",
  "referral_code": "string (optional)"
}

SUCCESS RESPONSE:
{
  "message": "User created. Complete payment to activate account.",
  "payment_link": "string (URL)"
}

FRONTEND BEHAVIOR:
- Redirect user to payment_link immediately
- Show "Complete payment to activate account"
- Do NOT treat user as fully logged in

----------------------------------------

### 3. GET CURRENT USER

ENDPOINT:
GET /auth/me

SUCCESS RESPONSE:
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "full_name": "string | null",
    "school_name": "string | null",
    "phone": "string | null",
    "users_referred": number,
    "is_active": boolean,
    "created_at": "ISO date"
  }
}

FRONTEND BEHAVIOR:
- Populate profile page
- Use is_active to determine access level

----------------------------------------

### 4. UPDATE PROFILE

ENDPOINT:
PUT /auth/me

REQUEST BODY:
{
  "full_name": "string (optional)",
  "school_name": "string (optional)",
  "password": "string (optional)"
}

SUCCESS RESPONSE:
{
  "message": "Profile updated successfully",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "full_name": "string",
    "school_name": "string",
    "phone": "string | null"
  }
}

FRONTEND BEHAVIOR:
- Update UI instantly with returned data
- Show success toast

----------------------------------------
COMPETITION MODULE
----------------------------------------

### 1. LIST COMPETITIONS

ENDPOINT:
GET /competitions/

DESCRIPTION:
- Used on landing/index page
- User MUST select ONE competition before registration

SUCCESS RESPONSE:
{
  "competitions": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "price": "string (currency)",
      "created_at": "ISO date"
    }
  ]
}

FRONTEND BEHAVIOR:
- Display as selectable cards or list
- Allow only ONE selection
- Store selected competition_id for registration

----------------------------------------
PAYMENT MODULE
----------------------------------------

### 1. GET USER PAYMENTS

ENDPOINT:
GET /payments/my-payments

SUCCESS RESPONSE:
{
  "payments": [
    {
      "id": "string",
      "amount": "string",
      "status": "pending | success",
      "payment_reference": "string",
      "paid_at": "ISO date | null",
      "created_at": "ISO date",
      "competition_title": "string"
    }
  ]
}

FRONTEND BEHAVIOR:
- Show payment history list
- Highlight:
  - pending → "Awaiting payment"
  - success → "Completed"
- If pending:
  - Optionally allow retry payment (if backend supports)

----------------------------------------
UI FLOW (IMPORTANT FOR AI AGENTS)
----------------------------------------

1. LANDING PAGE
- Fetch competitions
- User selects one

2. REGISTER FLOW
- Submit registration with selected competition_id
- Redirect to payment_link

3. PAYMENT STATE
- User completes payment externally
- On return → check /auth/me or payments

4. LOGIN FLOW
- Login user
- Fetch profile (/auth/me)

5. DASHBOARD
- Show:
  - Profile info
  - Payment status
  - Competition info

6. PROFILE PAGE
- View + edit profile

----------------------------------------
NOTES FOR AI FRONTEND GENERATION
----------------------------------------

- Use modular architecture:
  - authService
  - competitionService
  - paymentService

- Use:
  - Loading states
  - Error states
  - Retry logic wrapper for all API calls

- Prefer:
  - React + hooks OR
  - Any component-based framework

- Always validate inputs before sending

----------------------------------------
END OF DOCUMENT
----------------------------------------