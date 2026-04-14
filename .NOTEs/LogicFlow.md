## Payment Flow
1. User selects competition
2. Backend initializes payment
3. Payment provider handles transaction
4. Provider calls your webhook
5. Backend verifies payment
6. Save payment + mark user as paid
7. Generate receipt

## Referral System
For MVP:
    generate code per user
store:
```txt
user_id
referral_code
referred_by
```
increment count when someone signs up using code. But only award for Payed users.

## Focus
1. db
2. Referral program
3. Admin dashboard