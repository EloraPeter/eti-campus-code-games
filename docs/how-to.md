## To login
POST --> `/api/v1/auth/login`
```
{
    "email":"joe@example.com",
    "password":"example"
}
```
Expect a reply like:

SUCCESS
```
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

## To register
POST --> `/api/v1/auth/register`
User needs to pay the sum shown to be successfully activated
```
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
```
{
    message: 'User created. Complete payment to activate account.',
    payment_link: payment.payment_link
}
```

## To list competitions
Probably on the index page (Users must select only one, then create an account)
GET --> `/api/v1/competitions/`