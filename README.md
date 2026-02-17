# Auth Service
A microservice that handles the complete authentication flow.

## Tech Stack
- Node + Express.js
- TypeScript
- Database: Supabase + Prisma ORM
- Validation: Zod
- Auth: JWT, bcrypt
- Email: EmailJS
- Security: Arcjet
- Testing: Jest + Supertest

## Features
### Authentication
- **User Registration** - Create new accounts with email/password

- **Email Verification** - Verify email addresses with time-limited tokens (24h expiry)

- **Resend Verification** - Request new verification emails

- **Login** - Authenticate with email/username and password

- **JWT Access Tokens** - Short-lived (15min) stateless tokens

- **Refresh Tokens** - Long-lived (30 days) tokens stored in HTTP-only cookies

- **Logout** - Secure session termination with token revocation

- **Get Current User** - Fetch authenticated user profile

- **Password Reset** - Complete forgot password flow with email links

### Security 
- **Password Security** - bcrypt hashing

- **Token Strategy**

    - **Access tokens**: 15min expiry (stateless JWT)

    - **Refresh tokens**: 30 days (stored in DB, revocable)

    - **Email tokens**: 24h expiry, used for user verification and password reset

- **HTTP-Only Cookies** - Refresh tokens stored securely, inaccessible to JavaScript

- **Rate Limiting** - Arcjet token bucket algorithm with tiered limits

    - **Auth endpoints**: 3-5 requests/minute

    - **Verify endpoints**: 5-10 requests/minute

    - **Public endpoints**: 20-30 requests/minute

- **Bot Protection** - Arcjet bot detection and mitigation

- **Attack Prevention** - Arcjet Shield against SQL injection, XSS, etc.

- **Email Enumeration Prevention** - Generic error messages for security

- **Input Validation** - All inputs validated with Zod schemas

- **CORS & Cookie Security** - Strict same-site policies, secure flags in production

## Authentication Flow Details

### Registration & Verification
1. `POST /register` → Creates unverified user + sends email
2. User clicks email link → `GET /verify-email?token=xxx`
3. Account verified → User can now login

### Resend Verification
1. `POST /resend-verification` with email
2. Deletes old verification token → creates new token → sends verification email

### Login & Sessions
1. `POST /login` → Validates password and access token
2. Returns accessToken (15min) + sets refreshToken cookie (30 days)
3. Subsequent requests use `Authorization: Bearer <accessToken>`
4. `POST /logout` → Deletes refresh token + clears cookie

### Password Reset
1. `POST /forgot-password` → Sends email with reset link
2. User clicks email link → returns `password_reset` token
3. `POST /reset-password` with token + new password
4. Password updated + all sessions invalidated

### Refresh Token
1. `POST /refresh` → Receives refreshToken from HTTP-only cookie
2. Validates refreshToken exists in database and is not expired
3. Deletes old refreshToken from database (one-time use security)
4. Creates new refreshToken (rotation) and stores in database → stores in HTTP-only cookie
5. Generates new accessToken (15 min expiry) → returns in response

### Logout
1. `POST /logout` → Clear access token from cookies, clear refresh token from DB 