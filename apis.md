# Spend Manager — API Documentation

> **Base URL:** `http://localhost:5000`
>
> **Authentication:** Most endpoints require a JWT token sent as an `authToken` cookie or via `Authorization: Bearer <token>` header.

---

## Table of Contents

- [Root](#root)
- [Auth (`/auth/v1`)](#auth-authv1)
  - [Register](#1-register)
  - [Login](#2-login)
  - [Google Auth](#3-google-auth)
  - [User Info](#4-user-info)
  - [Logout](#5-logout)
  - [Filter Users](#6-filter-users)
  - [Get Usernames](#7-get-usernames)
- [Account (`/account`)](#account-account)
  - [Create Account](#1-create-account)
  - [Get Accounts](#2-get-accounts)
  - [Account Details](#3-account-details)
  - [Delete Account](#4-delete-account)
  - [Remind Group](#5-remind-group)
- [Payment (`/payment`)](#payment-payment)
  - [Get Payments](#1-get-payments)
  - [Add Payment](#2-add-payment)
  - [Delete Payment](#3-delete-payment)
  - [Clear Payments](#4-clear-payments)
  - [Paid & Spend Summary](#5-paid--spend-summary)
- [UserAccount (`/userAccount`)](#useraccount-useraccount)
  - [Update Password](#1-update-password)
  - [Forgot Password — Send Verification Code](#2-forgot-password--send-verification-code)
  - [Forgot Password — Verify OTP](#3-forgot-password--verify-otp)
  - [Forgot Password — Reset Password](#4-forgot-password--reset-password)
  - [Subscribe Push Notification](#5-subscribe-push-notification)
  - [Unsubscribe Push Notification](#6-unsubscribe-push-notification)
  - [Settlement](#7-settlement)
  - [AI Account Summary](#8-ai-account-summary)
- [Notifications](#notifications)

---

## Root

### Health Check

| | |
|---|---|
| **URL** | `GET /` |
| **Auth** | ❌ None |

**Response `200`**
```
hello and welcome to spend-manager-api!
```

---

## Auth (`/auth/v1`)

### 1. Register

| | |
|---|---|
| **URL** | `POST /auth/v1/register` |
| **Auth** | ❌ None |

**Request Body**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "userName": "johndoe01",   // min 8 characters
  "email": "john@example.com",
  "password": "secret1234"   // min 8 characters
}
```

**Validation Rules**
- `userName` — min 8 characters
- `email` — must be a valid email
- `password` — min 8 characters
- `userName` and `email` must be unique

**Response `200` — Success**
```json
{
  "message": "Account Created Succesfully",
  "authToken": "<jwt_token>"
}
```
> Also sets `authToken` cookie (httpOnly, secure, sameSite: none, 30 days).

**Response `400` — Validation Error**
```json
{
  "message": [
    { "msg": "userName should be at least 8 character", "param": "userName", ... }
  ]
}
```

**Response `500` — Server Error**
```json
{ "message": "Internal Application Error" }
```

---

### 2. Login

| | |
|---|---|
| **URL** | `POST /auth/v1/login` |
| **Auth** | ❌ None |

**Request Body**
```json
{
  "userName": "johndoe01",   // can also be an email
  "password": "secret1234",
  "rememberMe": true         // optional (boolean)
}
```

**Response `200` — Success**
```json
{
  "message": "Login Successful",
  "authToken": "<jwt_token>"
}
```
> Sets `authToken` cookie. `maxAge` = 30 days if `rememberMe` is true, else 1 day.

**Response `401` — Invalid Credentials**
```json
{ "message": "Incorrect Credentials" }
```

**Response `500` — Server Error**
```json
{ "message": "Internal Application Error" }
```

---

### 3. Google Auth

| | |
|---|---|
| **URL** | `POST /auth/v1/google` |
| **Auth** | ❌ None |

**Request Body**
```json
{
  "token": "<google_id_token>"
}
```
> Also accepts `credential` or `idToken` field names.

**Response `200` — Success**
```json
{
  "message": "Google Authentication Successful",
  "authToken": "<jwt_token>"
}
```
> Sets `authToken` cookie (30 days). Creates a new user if email is not found.

**Response `400` — Missing Token**
```json
{ "message": "Google token is required" }
```

**Response `401` — Invalid Token**
```json
{ "message": "Invalid Google token" }
```

**Response `500` — Server Error**
```json
{ "message": "Internal Application Error" }
```

---

### 4. User Info

| | |
|---|---|
| **URL** | `GET /auth/v1/userInfo` |
| **Auth** | ✅ Required |

**Response `200` — Success**
```json
{
  "user": {
    "_id": "64f...",
    "firstName": "John",
    "lastName": "Doe",
    "userName": "johndoe01",
    "email": "john@example.com"
  }
}
```

**Response `404` — Not Found**
```json
{ "message": "No Account Found!" }
```

**Response `500` — Server Error**
```json
{ "message": "Internal Application Error" }
```

---

### 5. Logout

| | |
|---|---|
| **URL** | `POST /auth/v1/logout` |
| **Auth** | ✅ Required |

**Request Body** — None

**Response `200` — Success**
```json
{ "message": "logout Successfully!" }
```
> Clears the `authToken` cookie and removes push subscription.

**Response `500` — Server Error**
```json
{ "message": "Internal Application Error" }
```

---

### 6. Filter Users

| | |
|---|---|
| **URL** | `GET /auth/v1/filter?search=<query>` |
| **Auth** | ✅ Required |

**Query Params**
| Param | Type | Description |
|---|---|---|
| `search` | string | Username prefix to search |

**Response `200` — Success**
```json
{
  "users": [
    { "_id": "64f...", "userName": "johndoe01" },
    { "_id": "64f...", "userName": "johndoe02" }
  ]
}
```

**Response `500` — Server Error**
```json
{ "message": "Server error" }
```

---

### 7. Get Usernames

| | |
|---|---|
| **URL** | `POST /auth/v1/usernames` |
| **Auth** | ✅ Required |

**Request Body**
```json
{
  "userIds": ["64f...", "64f..."]
}
```

**Response `200` — Success**
```json
["johndoe01", "janedoe02"]
```

**Response `500` — Server Error**
```json
{ "message": "Server error" }
```

---

## Account (`/account`)

> All account routes require authentication.

### 1. Create Account

| | |
|---|---|
| **URL** | `POST /account/create` |
| **Auth** | ✅ Required |

**Request Body**
```json
{
  "acName": "Trip Fund",          // min 4 characters
  "accountType": "shared",        // "shared" or "personal"
  "acMembers": ["64f...", "64f..."]  // array of user IDs (for shared accounts)
}
```

**Validation Rules**
- `acName` — min 4 characters
- `accountType` — cannot be empty

**Response `200` — Success**
```json
{ "message": "Account Created Successfully" }
```
> For shared accounts, notifies added members.

**Response `400` — Validation Error**
```json
{
  "message": [
    { "msg": "Account Name Should be At least 4 Charater!", "param": "acName", ... }
  ]
}
```

**Response `500` — Server Error**
```json
{ "message": "Internal Application Error" }
```

---

### 2. Get Accounts

| | |
|---|---|
| **URL** | `GET /account/getaccounts` |
| **Auth** | ✅ Required |

**Response `200` — Success**
```json
{
  "created": [
    {
      "_id": "64f...",
      "accountName": "Trip Fund",
      "accountHolder": "64f...",
      "accountType": "shared",
      "accountMembers": ["64f...", "64f..."],
      "totalTransaction": 5,
      "totalSpend": 2500
    }
  ],
  "joined": [
    {
      "_id": "64f...",
      "accountName": "Office Lunch",
      "accountHolder": "64f...",
      "accountType": "shared",
      "accountMembers": ["64f...", "64f..."],
      "totalTransaction": 3,
      "totalSpend": 1200
    }
  ]
}
```

**Response `500` — Server Error**
```json
{ "message": "Internal Application Error" }
```

---

### 3. Account Details

| | |
|---|---|
| **URL** | `POST /account/details` |
| **Auth** | ✅ Required |

**Request Body**
```json
{
  "acId": "64f..."
}
```

**Response `200` — Success**
```json
{
  "_id": "64f...",
  "accountName": "Trip Fund",
  "accountHolder": "64f...",
  "accountType": "shared",
  "accountMembers": ["64f...", "64f..."],
  "totalTransaction": 5,
  "totalSpend": 2500
}
```

**Response `500` — Server Error**
```json
{ "message": "Internal Application Error" }
```

---

### 4. Delete Account

| | |
|---|---|
| **URL** | `DELETE /account/delete` |
| **Auth** | ✅ Required |

**Request Body**
```json
{
  "accountId": "64f..."
}
```

**Response `200` — Success**
```json
{ "message": "Account Deleted Succesfully." }
```
> Also deletes all associated payments and notifies shared account members.

**Response `404` — Not Found**
```json
{ "message": "No Matching Account Found!" }
```

**Response `500` — Server Error**
```json
{ "message": "Internal Application Error" }
```

---

### 5. Remind Group

| | |
|---|---|
| **URL** | `GET /account/reminder?accountId=<id>` |
| **Auth** | ✅ Required |

**Query Params**
| Param | Type | Description |
|---|---|---|
| `accountId` | string | The account ID to send reminders for |

**Response `200` — Success**
```json
{
  "status": true,
  "msg": "Reminder Sent To Group Members."
}
```
> Sends a push notification reminder to all members (except the sender).

**Response `404` — Not Found**
```json
{ "status": false, "message": "No Matching Account Found!" }
```

**Response `500` — Server Error**
```json
{ "status": false, "message": "Internal Application Error" }
```

---

## Payment (`/payment`)

> All payment routes require authentication + account membership verification.

### 1. Get Payments

| | |
|---|---|
| **URL** | `GET /payment?accountId=<id>` |
| **Auth** | ✅ Required |

**Query Params**
| Param | Type | Description |
|---|---|---|
| `accountId` | string | The account ID to fetch payments for |

**Response `200` — Success**
```json
[
  {
    "_id": "64f...",
    "accountId": "64f...",
    "where": "Restaurant",
    "paidBy": "johndoe01",
    "date": "2026-08-20T10:30:00.000Z",
    "amount": 500,
    "memberExpenses": [
      { "member": "64f...", "amount": 250 },
      { "member": "64f...", "amount": 250 }
    ]
  }
]
```

**Response `500` — Server Error**
```json
{ "message": "Internal Application Error" }
```

---

### 2. Add Payment

| | |
|---|---|
| **URL** | `POST /payment/add` |
| **Auth** | ✅ Required |

**Request Body**
```json
{
  "accountId": "64f...",
  "where": "Restaurant",            // min 3 characters
  "paidBy": "johndoe01",            // username of the payer
  "amount": 500,                     // must be > 0
  "memberExpenses": [                // required for shared accounts
    { "member": "64f...", "amount": 250 },
    { "member": "64f...", "amount": 250 }
  ]
}
```

**Validation Rules**
- `where` — not empty, min 3 characters
- `amount` — must be > 0
- `paidBy` — not empty
- `memberExpenses` — required non-empty array for shared accounts

**Response `201` — Success**
```json
{ "message": "Transaction added successfully!" }
```
> Updates account totals and notifies shared account members.

**Response `400` — Validation / Missing Data**
```json
{
  "message": [
    { "msg": "Amount should be greater than 0!", "param": "amount", ... }
  ]
}
```

**Response `404` — Account Not Found**
```json
{ "message": "Account not found" }
```

**Response `500` — Server Error**
```json
{ "message": "Internal Server Error" }
```

---

### 3. Delete Payment

| | |
|---|---|
| **URL** | `DELETE /payment/delete?accountId=<id>&paymentId=<id>` |
| **Auth** | ✅ Required |

**Query Params**
| Param | Type | Description |
|---|---|---|
| `accountId` | string | The account the payment belongs to |
| `paymentId` | string | The payment to delete |

**Response `200` — Success**
```json
{ "message": "Payment deleted successfully." }
```
> Decrements account totals and notifies shared account members.

**Response `400` — Missing Params**
```json
{ "message": "accountId and paymentId are required" }
```

**Response `404` — Not Found**
```json
{ "message": "Payment not found!" }
```

**Response `500` — Server Error**
```json
{ "message": "Internal Application Error" }
```

---

### 4. Clear Payments

| | |
|---|---|
| **URL** | `PUT /payment/clear?accountId=<id>` |
| **Auth** | ✅ Required |

**Query Params**
| Param | Type | Description |
|---|---|---|
| `accountId` | string | The account to clear all payments for |

**Response `200` — Success**
```json
{ "message": "Account reset successfully." }
```
> Resets account totals to 0, deletes all payments, backs up deleted data, and notifies shared account members.

**Response `400` — Missing Param**
```json
{ "message": "accountId is required" }
```

**Response `404` — Account Not Found**
```json
{ "message": "Account not found!" }
```

**Response `500` — Server Error**
```json
{ "message": "Internal Application Error" }
```

---

### 5. Paid & Spend Summary

| | |
|---|---|
| **URL** | `POST /payment/paidspend?accountId=<id>` |
| **Auth** | ✅ Required |

**Query Params**
| Param | Type | Description |
|---|---|---|
| `accountId` | string | The account ID |

**Request Body**
```json
{
  "accountMembers": ["64f...", "64f..."]
}
```

**Response `200` — Success**
```json
{
  "paidSummary": {
    "johndoe01": 1500,
    "janedoe02": 1000
  },
  "expenseSummary": {
    "johndoe01": 1200,
    "janedoe02": 1300
  }
}
```

**Response `400` — Invalid Input**
```json
{ "message": "Invalid input!" }
```

**Response `500` — Server Error**
```json
{ "message": "Internal Server Error" }
```

---

## UserAccount (`/userAccount`)

### 1. Update Password

| | |
|---|---|
| **URL** | `POST /userAccount/updatepassword` |
| **Auth** | ✅ Required |

**Request Body**
```json
{
  "oldPassword": "currentPass123",
  "newPassword": "newSecure456"
}
```

**Response `200` — Success**
```json
{ "status": false, "message": "Password Updated Successfully!" }
```

**Response `400` — Invalid User**
```json
{ "status": false, "message": "Invalid User!" }
```

**Response `422` — Password Mismatch**
```json
{ "message": "Old Password Does Not Match!" }
```

**Response `500` — Server Error**
```json
{ "status": false, "message": "Internal Server Error!" }
```

---

### 2. Forgot Password — Send Verification Code

| | |
|---|---|
| **URL** | `POST /userAccount/forgotpassword/verificationcode` |
| **Auth** | ❌ None |

**Request Body**
```json
{
  "email": "john@example.com"
}
```

**Response `200` — Success**
```json
{
  "success": true,
  "message": "Verification code sent to your email"
}
```
> Sends a 6-digit OTP to the user's email. Code expires in 10 minutes.

**Response `404` — Email Required / User Not Found**
```json
{ "success": false, "message": "Email is Required!" }
```
```json
{ "status": false, "error": "Invalid User! No user found with this email." }
```

**Response `500` — Server Error**
```json
{ "success": false, "message": "Internal Server Error" }
```

---

### 3. Forgot Password — Verify OTP

| | |
|---|---|
| **URL** | `POST /userAccount/forgotpassword/verifyOtp` |
| **Auth** | ❌ None |

**Request Body**
```json
{
  "email": "john@example.com",
  "verificationCode": "482910"
}
```

**Response `200` — Success**
```json
{
  "success": true,
  "message": "Verification successful",
  "tempToken": "<temporary_jwt_token>"
}
```
> Returns a temporary JWT token (valid 15 min) for the password reset step.

**Response `400` — Invalid / Expired Code**
```json
{ "success": false, "message": "Invalid verification code" }
```
```json
{ "success": false, "message": "Verification code has expired. Please request a new code" }
```

**Response `404` — User Not Found**
```json
{ "success": false, "message": "User not found with this email" }
```

**Response `500` — Server Error**
```json
{ "success": false, "message": "Internal Server Error" }
```

---

### 4. Forgot Password — Reset Password

| | |
|---|---|
| **URL** | `POST /userAccount/forgotpassword/reset` |
| **Auth** | ❌ None (uses `tempToken` from OTP step) |

**Request Body**
```json
{
  "email": "john@example.com",
  "newPassword": "newSecure456",
  "tempToken": "<temporary_jwt_token>"
}
```

**Response `200` — Success**
```json
{ "success": true, "message": "Password reset successful" }
```

**Response `400` — Missing Fields**
```json
{ "success": false, "message": "All fields are required!" }
```

**Response `401` — Invalid Token**
```json
{ "success": false, "message": "Invalid Request!" }
```

**Response `404` — User Not Found**
```json
{ "success": false, "message": "Invalid User!" }
```

**Response `500` — Server Error**
```json
{ "success": false, "message": "Internal Server Error" }
```

---

### 5. Subscribe Push Notification

| | |
|---|---|
| **URL** | `POST /userAccount/subscribe` |
| **Auth** | ✅ Required |

**Request Body**
```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}
```

**Response `200` — Success**
```json
{ "status": true, "message": "Push Notification Enabled!" }
```

**Response `404` — User Not Found**
```json
{ "status": false, "message": "No User Found!" }
```

**Response `500` — Server Error**
```json
{ "status": false, "message": "Internal Server Error!" }
```

---

### 6. Unsubscribe Push Notification

| | |
|---|---|
| **URL** | `DELETE /userAccount/subscribe` |
| **Auth** | ✅ Required |

**Request Body** — None

**Response `200` — Success**
```json
{ "status": false, "message": "Push Notification Disabled!" }
```

**Response `404` — User Not Found**
```json
{ "status": false, "message": "No User Found!" }
```

**Response `500` — Server Error**
```json
{ "status": false, "message": "Internal Server Error!" }
```

---

### 7. Settlement

| | |
|---|---|
| **URL** | `POST /userAccount/settlement` |
| **Auth** | ✅ Required |

**Request Body**
```json
{
  "userName": "johndoe01",
  "paidSummery": {
    "johndoe01": 1500,
    "janedoe02": 1000
  },
  "expenseSummery": {
    "johndoe01": 1200,
    "janedoe02": 1300
  }
}
```

**Response `200` — Success**
```json
{
  "status": true,
  "settlement": [
    { "userName": "johndoe01", "due": 300 }
  ]
}
```

**Response `500` — Server Error**
```json
{ "status": false, "message": "Internal Server Error!" }
```

---

### 8. AI Account Summary

| | |
|---|---|
| **URL** | `POST /userAccount/accountsummery` |
| **Auth** | ✅ Required |

**Request Body**
```json
{
  "accountId": "64f..."
}
```

**Response `200` — Success**
```json
{
  "summary": "Based on the account data, here is an AI-generated analysis of spending patterns..."
}
```
> Uses Groq API (GPT model) to generate a spending analysis summary.

**Response `404` — No Data**
```json
{ "message": "No data found." }
```

**Response `500` — Server Error**
```json
{ "message": "Something went wrong." }
```

---

## Notifications

### Get All Notifications

| | |
|---|---|
| **URL** | `GET /notifications` |
| **Auth** | ✅ Required |

**Response `200` — Success**
```json
[
  {
    "_id": "64f...",
    "from": "johndoe01",
    "to": ["64f..."],
    "message": "johndoe01 added a new transaction of ₹500 in Trip Fund account.",
    "timestamp": "2026-08-20T10:30:00.000Z",
    "relatedAccount": "64f..."
  }
]
```
> Returns notifications sorted by timestamp (newest first). Notifications auto-expire after 10 days.

**Response `505` — Server Error**
```json
{ "message": "Internal Server Error!" }
```

---

## Data Models Reference

### User
| Field | Type | Notes |
|---|---|---|
| `firstName` | String | Required |
| `lastName` | String | Default: `""` |
| `userName` | String | Required, Unique |
| `email` | String | Required, Unique |
| `password` | String | Required (bcrypt hashed) |
| `pushSubscription` | Object | Default: `null` |
| `verificationCode` | String | SHA-256 hashed OTP |
| `verificationExpiry` | Date | Default: `null` |

### Account
| Field | Type | Notes |
|---|---|---|
| `accountName` | String | Default: `"sm-account"` |
| `accountHolder` | ObjectId | Ref → User |
| `accountType` | String | Enum: `"shared"`, `"personal"` |
| `accountMembers` | Array | Array of user IDs |
| `totalTransaction` | Number | Default: `0` |
| `totalSpend` | Number | Default: `0` |

### Payment
| Field | Type | Notes |
|---|---|---|
| `accountId` | ObjectId | Ref → Account |
| `where` | String | Required |
| `paidBy` | String | Required (username) |
| `date` | Date | Default: `Date.now` |
| `amount` | Number | Required |
| `memberExpenses` | Array | Expense split per member |

### Notification
| Field | Type | Notes |
|---|---|---|
| `from` | String | Username of sender |
| `to` | Array | Array of recipient user IDs |
| `message` | String | Notification text |
| `timestamp` | Date | Default: `Date.now`, TTL: 10 days |
| `relatedAccount` | ObjectId | Ref → Account (nullable) |
