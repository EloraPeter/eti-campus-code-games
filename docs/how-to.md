# Public Endpoints

## Auth Routes

NOTE: In all endpoints, expect error, thus handle these error grcacefully by retrynig just 3 times, on a few 
unoticable seconns interval.

### To login
`POST --> /api/v1/auth/login`
```JSON
{
    "email":"joe@example.com",
    "password":"example"
}
```
Expect a reply like:

SUCCESS
```JSON
{
    "message": 'Login successful',
    "user": {
        id: user.id,
        email: user.email,
        username: user.username
    }
}
```
FAIL (may vary)

### To register
`POST --> /api/v1/auth/register`

User needs to pay the sum shown to be successfully activated
```JSON
{
    competition_id: "required", 
    full_name: "optional", 
    email: "required", 
    username: "required", 
    password: "required", 
    phone: "optional", 
    school_name: "optional", 
    provider: "required", 
    referral_code: "optional"
}
```

Expect fialures, but success looks like this:
```JSON
{
    message: 'User created. Complete payment to activate account.',
    payment_link: payment.payment_link
}
```

### To get profile data

`GET --> /api/v1/auth/me`

Expect a reply like this:
```JSON
{
    "user": {
        "id": "3c57b874-f4fb-4547-ad9b-fe5388ab1bf4",
        "username": "admin",
        "email": "admin@talk.com",
        "full_name": "Admin",
        "school_name": null,
        "phone": null,
        "users_referred": 0,
        "is_active": true,
        "created_at": "2026-04-14T05:22:57.200Z"
    }
}
```

### To alter profile data

`PUT --> /api/v1/auth/me`

Send a body like this:
```JSON
{ full_name, school_name, password }
```

Expect a success reply like this:
```JSON
{
    "message": "Profile updated successfully",
    "user": {
        "id": "3c57b874-f4fb-4547-ad9b-fe5388ab1bf4",
        "username": "admin",
        "email": "admin@talk.com",
        "full_name": "Admin",
        "school_name": "Ghost buffy",
        "phone": null
    }
}
```


### Competition Routes

### To list competitions
Probably on the index page (Users must select only one, then create an account)

`GET --> /api/v1/competitions/`

Expect a good reply like this:
```JSON
{
    "competitions": [
        {
            "id": "c7894561-d2e3-f4a5-b6c7-890abc123456",
            "title": "PlayStation Speedrun Challenge",
            "description": "Compete for the fastest completion time in popular PS5 and PS4 action titles",
            "price": "2500.00",
            "created_at": "2026-04-14T04:50:55.839Z"
        },
        {
            "id": "b4561234-a1b2-c3d4-e5f6-7890abcdef12",
            "title": "Capture The Flag (CTF)",
            "description": "A cybersecurity hacking competition where teams find vulnerabilities and exploit them to capture flags",
            "price": "2500.00",
            "created_at": "2026-04-14T04:50:28.564Z"
        },
        {
            "id": "7347212f-2c5c-44b2-ac14-a21f277e8d1b",
            "title": "Coding",
            "description": "Coding Competition where all Developers can participate",
            "price": "2500.00",
            "created_at": "2026-04-14T04:48:28.291Z"
        }
    ]
}
```

## Payment Routes

### To view your past payments

`GET --> /api/v1/payments/my-payments`

Expect a reply like this:
```JSON
{
    "payments": [
        {
            "id": "162fe435-3b1a-466d-b9de-7d63c058fe16",
            "amount": "2500.00",
            "status": "pending",
            "payment_reference": "pn5d3ycrm2",
            "paid_at": null,
            "created_at": "2026-04-14T05:22:58.275Z",
            "competition_title": "PlayStation Speedrun Challenge"
        }
    ]
}
```
Where status could also be 'success'


# Admin Protected Endpoints

## Auth Routes

### Get all Users
`GET --> /api/admin/auth`

Expect a reply:
```JSON
{
    "users": [
        {
            "id": "3c57b874-f4fb-4547-ad9b-fe5388ab1bf4",
            "username": "admin",
            "email": "admin@talk.com",
            "full_name": "Admin",
            "phone": null,
            "school_name": "Ghost buffy",
            "is_active": true,
            "is_admin": true,
            "created_at": "2026-04-14T05:22:57.200Z"
        },
        {
            "id": "018a6f02-376d-4a25-a5eb-ef9c8d192366",
            "username": "user1",
            "email": "user1@talk.com",
            "full_name": "Abdullah Yusuf",
            "phone": null,
            "school_name": null,
            "is_active": true,
            "is_admin": false,
            "created_at": "2026-04-14T05:18:23.937Z"
        },
        {
            "id": "05c05265-820e-40d2-a24e-14ab3c8aed9d",
            "username": "hello123",
            "email": "hello@talk.com",
            "full_name": "Abdullah Yusuf",
            "phone": null,
            "school_name": null,
            "is_active": false,
            "is_admin": false,
            "created_at": "2026-04-14T05:05:15.738Z"
        }
    ]
}
```

### Get user by id
`GET --> /api/admin/auth/uuid`
Expect:
```JSON
{
    "user": {
        "id": "018a6f02-376d-4a25-a5eb-ef9c8d192366",
        "username": "user1",
        "email": "user1@talk.com",
        "full_name": "Abdullah Yusuf",
        "phone": null,
        "school_name": null,
        "is_active": true,
        "is_admin": false,
        "created_at": "2026-04-14T05:18:23.937Z"
    }
}
```

### Update a user
`PUT --> /api/admin/auth/uuid`
Req Body:
```JSON
{
            username,
            email,
            full_name,
            phone,
            school_name
        }
```

Expect:
```JSON
{
    "message": "User updated successfully",
    "user": {
        "id": "018a6f02-376d-4a25-a5eb-ef9c8d192366",
        "username": "user1",
        "email": "user1@talk.com",
        "full_name": "Ah Yusuf",
        "phone": null,
        "school_name": null,
        "is_active": true,
        "is_admin": false,
        "created_at": "2026-04-14T05:18:23.937Z"
    }
}
```

### Delete a user
`DELETE --> /api/admin/auth/id`
Expect:
```JSON
{
            message: "User deleted successfully",
            user: result.rows[0]
        }
```


## Competition Routes

### To create competitions
`POST --> /api/admin/competitions`
req:
```json
{ title, description, price }
```

res:
```json
{
            message: "Competition created successfully",
            competition: result.rows[0]
        }
```

### To update competition
`PUT/PATCH --> /api/admin/competitions/<id>`

req:
```json
{ title, description, price }
```

res:
```json
{
            message: "Competition updated successfully",
            competition: result.rows[0]
        }
```

### To delete competition
`DELETE --> /api/admin/competitions/<id>`

res:
```json
{
            message: "Competition deleted successfully",
            competition: result.rows[0]
        }
```

## Payment Routes

### Get all transactions
`GET --> /api/admin/payments`

res:
```json
{
            transactions: result.rows
        }
```

### get recent transactions
`GET --> /api/admin/payments/recent`
Get recent transactions (last X days, default 7): (req.query.days) || 7

res:
```json
{
            recent_transactions: result.rows
        }
```


## Permission Routes

### To activate a user
`PATCH --> /api/admin/permissions/<id>/activate`

res:
```json
{ message: "User activated", user: result.rows[0] }
```

### To deactivate a user
`PATCH --> /api/admin/permissions/<id>/deactivate`

res:
```json
{ message: "User deactivated", user: result.rows[0] }
```

### To make a user admin
`PATCH --> /api/admin/permissions/<id>/make-admin`

res:
```json
{ message: "User promoted to admin", user: result.rows[0] }
```

### To revoke admin permission
`PATCH --> /api/admin/permissions/<id>/remove-admin`

res:
```json
{ message: "Admin role removed", user: result.rows[0] }
```

Now, these responses can vary due to certain errors like `user not found`, `cannot remove a fellow admin`,
`can't remove yourself from admin` etc
