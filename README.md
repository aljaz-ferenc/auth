# Auth Service
A production-ready authentication microservice built with Node.js, Express, TypeScript, and Prisma. Handles the complete auth flow including registration, email verification, login with JWT tokens, and secure session management.

## Tech Stack
- Node.js
- Express
- TypeScript
- Database: Supabase + Prisma ORM
- Validation: Zod
- Auth: JWT, bcrypt
- Email: EmailJS
- Security: Arcjet
- Testing: Jest + Supertest

## Security Features
- Passwords hashed with bcrypt
- JWT access tokens
- Refresh tokens in DB
- HTTP-only cookies
- Rate limiting, bot detection, and protection against common attacks- Email enumeration prevention
- Input validation with Zod

This service can be integrated into any frontend application needing secure authentication.