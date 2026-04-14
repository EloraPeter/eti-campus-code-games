## API Documentation & Frontend Implementation Guide

## 1. Global Implementation Rules

* Error Handling: Implement a global interceptor/wrapper for all requests. On failure, execute a retry logic (max 3 attempts) with a 2-second delay between retries.
* Base URL: /api/v1
* Authentication: Use Bearer tokens (stored in LocalStorage/Cookies) for all routes except Login, Register, and Competition List.
* User Flow:
1. User lands on Index page -> views Competitions.
   2. User selects one competition -> proceeds to Register.
   3. After Registration -> redirect to provided payment_link.

------------------------------
## 2. Competition Module (Public)

## List All Competitions

* Usage: Display on the landing page for user selection.
* Endpoint: GET /competitions
* Response Schema:

{
  "competitions": [
    {
      "id": "uuid",
      "title": "String",
      "description": "String",
      "price": "String (Decimal)",
      "created_at": "ISO-8601"
    }
  ]
}

------------------------------
## 3. Authentication Module

## User Registration

* Endpoint: POST /auth/register
* Payload:

{
  "competition_id": "required",
  "email": "required",
  "username": "required",
  "password": "required",
  "provider": "required",
  "full_name": "optional",
  "phone": "optional",
  "school_name": "optional",
  "referral_code": "optional"
}


* Success Response: Returns a payment_link. The frontend must redirect the user to this URL to activate the account.

## User Login

* Endpoint: POST /auth/login
* Payload: { "email": "...", "password": "..." }
* Success Response:

{
  "message": "Login successful",
  "user": { "id": "uuid", "email": "string", "username": "string" }
}

------------------------------
## 4. User Profile Module (Protected)

## Get Current Profile

* Endpoint: GET /auth/me
* Key Fields to Display: full_name, is_active (status), users_referred (count).

## Update Profile

* Endpoint: PUT /auth/me
* Payload: { "full_name": "...", "school_name": "...", "password": "..." }

------------------------------
## 5. Payment Module (Protected)

## Transaction History

* Endpoint: GET /payments/my-payments
* Status Logic: Status can be pending or success.
* Response Schema:

{
  "payments": [
    {
      "id": "uuid",
      "amount": "string",
      "status": "pending | success",
      "payment_reference": "string",
      "competition_title": "string",
      "paid_at": "ISO-8601 | null"
    }
  ]
}

------------------------------


