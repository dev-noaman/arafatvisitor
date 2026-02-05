-- Arafat Visitor Management System
-- PostgreSQL 16 Database Schema
-- Consolidated Migration

-- ============ ENUMS ============

CREATE TYPE "Role" AS ENUM ('ADMIN', 'RECEPTION', 'HOST');

CREATE TYPE "Location" AS ENUM ('Barwa Towers', 'Marina 50', 'Element Mariott');

CREATE TYPE "VisitStatus" AS ENUM ('PRE_REGISTERED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED');

CREATE TYPE "CheckType" AS ENUM ('CHECK_IN', 'CHECK_OUT');

CREATE TYPE "DeliveryStatus" AS ENUM ('RECEIVED', 'PICKED_UP');

-- ============ TABLES ============

-- Hosts (companies and contact persons)
CREATE TABLE "Host" (
    "id" BIGSERIAL NOT NULL,
    "externalId" TEXT,
    "name" VARCHAR(100) NOT NULL,
    "company" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100),
    "location" "Location",
    "phone" VARCHAR(191),
    "status" SMALLINT NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Host_pkey" PRIMARY KEY ("id")
);

-- Users (admin, reception, host accounts)
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'RECEPTION',
    "hostId" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Visits (visitor check-ins)
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "visitorName" TEXT NOT NULL,
    "visitorCompany" TEXT NOT NULL,
    "visitorPhone" TEXT NOT NULL,
    "visitorEmail" TEXT,
    "hostId" BIGINT NOT NULL,
    "purpose" TEXT NOT NULL,
    "location" "Location" NOT NULL,
    "status" "VisitStatus" NOT NULL DEFAULT 'PRE_REGISTERED',
    "preRegisteredById" TEXT,
    "expectedDate" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "checkInAt" TIMESTAMP(3),
    "checkOutAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- QR Tokens (visitor pass tokens)
CREATE TABLE "QrToken" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QrToken_pkey" PRIMARY KEY ("id")
);

-- Check Events (check-in/out audit trail)
CREATE TABLE "CheckEvent" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "type" "CheckType" NOT NULL,
    "userId" INTEGER,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckEvent_pkey" PRIMARY KEY ("id")
);

-- Deliveries (package tracking)
CREATE TABLE "Delivery" (
    "id" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "hostId" BIGINT,
    "courier" TEXT NOT NULL,
    "location" "Location" NOT NULL,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'RECEIVED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receivedById" TEXT,
    "pickedUpAt" TIMESTAMP(3),

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- Audit Log (system audit trail)
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" INTEGER,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- Lookup: Purpose of Visit
CREATE TABLE "LookupPurpose" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LookupPurpose_pkey" PRIMARY KEY ("id")
);

-- Lookup: Delivery Type
CREATE TABLE "LookupDeliveryType" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LookupDeliveryType_pkey" PRIMARY KEY ("id")
);

-- ============ INDEXES ============

CREATE UNIQUE INDEX "Host_externalId_key" ON "Host"("externalId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Visit_sessionId_key" ON "Visit"("sessionId");
CREATE UNIQUE INDEX "QrToken_visitId_key" ON "QrToken"("visitId");
CREATE UNIQUE INDEX "QrToken_token_key" ON "QrToken"("token");
CREATE UNIQUE INDEX "LookupPurpose_code_key" ON "LookupPurpose"("code");
CREATE UNIQUE INDEX "LookupDeliveryType_code_key" ON "LookupDeliveryType"("code");

-- ============ FOREIGN KEYS ============

ALTER TABLE "User" ADD CONSTRAINT "User_hostId_fkey"
    FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Visit" ADD CONSTRAINT "Visit_hostId_fkey"
    FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "QrToken" ADD CONSTRAINT "QrToken_visitId_fkey"
    FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CheckEvent" ADD CONSTRAINT "CheckEvent_visitId_fkey"
    FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CheckEvent" ADD CONSTRAINT "CheckEvent_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_hostId_fkey"
    FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
