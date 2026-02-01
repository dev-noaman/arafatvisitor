# VMS Backend

Visitor & Delivery Management System - NestJS API + AdminJS.

## Prerequisites

- Node.js 20+
- PostgreSQL 16 (local or cloud)

## Setup

1. Create database:
   ```sql
   CREATE DATABASE vms_db;
   ```

2. Copy `.env.example` to `.env` and set `DATABASE_URL`:
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/vms_db"
   ```

3. Install and generate Prisma client:
   ```bash
   npm install
   npx prisma generate
   ```

4. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Seed admin user and optionally import hosts from CSV:
   ```bash
   npx prisma db seed
   ```

   Default admin: `admin@arafatvisitor.cloud` / `admin123`

## Run

```bash
npm run start:dev
```

- API: http://localhost:3000
- AdminJS: http://localhost:3000/admin

## API Endpoints

- `POST /auth/login` - Login (email, password)
- `POST /auth/forgot-password` - Request password reset
- `GET /hosts?location=X` - List hosts (no auth for kiosk)
- `POST /visits` - Walk-in check-in (Reception)
- `GET /visits/:sessionId` - Look up visit by session ID
- `POST /visits/:sessionId/checkout` - Check out visitor
- `GET /deliveries?location=X` - List deliveries
- `POST /deliveries` - Log new delivery
- `PATCH /deliveries/:id/receive` - Mark as received

See plan for full list.
