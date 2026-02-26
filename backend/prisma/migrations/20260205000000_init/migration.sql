-- Arafat Visitor Management System
-- PostgreSQL 16 Database Schema
-- Consolidated Migration

-- ============ ENUMS ============

CREATE TYPE "Role" AS ENUM ('ADMIN', 'RECEPTION', 'HOST', 'STAFF');

CREATE TYPE "HostType" AS ENUM ('EXTERNAL', 'STAFF');

CREATE TYPE "Location" AS ENUM ('Barwa Towers', 'Marina 50', 'Element Mariott');

CREATE TYPE "VisitStatus" AS ENUM ('PRE_REGISTERED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED');

CREATE TYPE "CheckType" AS ENUM ('CHECK_IN', 'CHECK_OUT');

CREATE TYPE "DeliveryStatus" AS ENUM ('RECEIVED', 'PICKED_UP');

CREATE TYPE "TicketType" AS ENUM ('SUGGESTION', 'COMPLAINT');

CREATE TYPE "TicketStatus" AS ENUM ('SUBMITTED', 'REVIEWED', 'DISMISSED', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED');

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
    "type" "HostType" NOT NULL DEFAULT 'EXTERNAL',
    "deletedAt" TIMESTAMP(3),
    "createdById" INTEGER,
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
    "deliveryType" TEXT,
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

CREATE TABLE "LookupCourier" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'PARCEL',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LookupCourier_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LookupLocation" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LookupLocation_pkey" PRIMARY KEY ("id")
);

-- Tickets (hostId auto-set from creator's host for visitor-system context)
CREATE TABLE "Ticket" (
    "id" SERIAL NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "type" "TicketType" NOT NULL,
    "subject" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL,
    "resolution" TEXT,
    "rejectionReason" TEXT,
    "createdById" INTEGER NOT NULL,
    "assignedToId" INTEGER,
    "hostId" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TicketComment" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketComment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TicketAttachment" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketAttachment_pkey" PRIMARY KEY ("id")
);

-- ============ INDEXES ============

CREATE INDEX "Host_type_idx" ON "Host"("type");
CREATE INDEX "Host_type_status_idx" ON "Host"("type", "status");
CREATE INDEX "Host_createdById_idx" ON "Host"("createdById");

CREATE UNIQUE INDEX "Host_externalId_key" ON "Host"("externalId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Visit_sessionId_key" ON "Visit"("sessionId");
CREATE UNIQUE INDEX "QrToken_visitId_key" ON "QrToken"("visitId");
CREATE UNIQUE INDEX "QrToken_token_key" ON "QrToken"("token");
CREATE UNIQUE INDEX "LookupPurpose_code_key" ON "LookupPurpose"("code");
CREATE UNIQUE INDEX "LookupDeliveryType_code_key" ON "LookupDeliveryType"("code");
CREATE UNIQUE INDEX "LookupCourier_code_key" ON "LookupCourier"("code");
CREATE UNIQUE INDEX "LookupLocation_code_key" ON "LookupLocation"("code");

CREATE UNIQUE INDEX "Ticket_ticketNumber_key" ON "Ticket"("ticketNumber");
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");
CREATE INDEX "Ticket_type_idx" ON "Ticket"("type");
CREATE INDEX "Ticket_createdById_idx" ON "Ticket"("createdById");
CREATE INDEX "Ticket_assignedToId_idx" ON "Ticket"("assignedToId");
CREATE INDEX "Ticket_hostId_idx" ON "Ticket"("hostId");
CREATE INDEX "Ticket_type_status_idx" ON "Ticket"("type", "status");
CREATE INDEX "TicketComment_ticketId_idx" ON "TicketComment"("ticketId");
CREATE INDEX "TicketComment_ticketId_createdAt_idx" ON "TicketComment"("ticketId", "createdAt");
CREATE INDEX "TicketAttachment_ticketId_idx" ON "TicketAttachment"("ticketId");

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

ALTER TABLE "Host" ADD CONSTRAINT "Host_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_assignedToId_fkey"
    FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_hostId_fkey"
    FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TicketComment" ADD CONSTRAINT "TicketComment_ticketId_fkey"
    FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TicketComment" ADD CONSTRAINT "TicketComment_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TicketAttachment" ADD CONSTRAINT "TicketAttachment_ticketId_fkey"
    FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TicketAttachment" ADD CONSTRAINT "TicketAttachment_uploadedById_fkey"
    FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============ LOOKUP DATA ============

-- Purpose of Visit
INSERT INTO "LookupPurpose" (code, label, active, "sortOrder", "updatedAt") VALUES
('MEETING', 'Meeting', true, 1, NOW()),
('INTERVIEW', 'Interview', true, 2, NOW()),
('DELIVERY', 'Delivery', true, 3, NOW()),
('MAINTENANCE', 'Maintenance', true, 4, NOW()),
('OTHER', 'Other', true, 5, NOW())
ON CONFLICT (code) DO NOTHING;

-- Delivery Types
INSERT INTO "LookupDeliveryType" (code, label, active, "sortOrder", "updatedAt") VALUES
('DOCUMENT', 'Document', true, 1, NOW()),
('FOOD', 'Food', true, 2, NOW()),
('GIFT', 'Gift', true, 3, NOW())
ON CONFLICT (code) DO NOTHING;

-- Couriers (PARCEL = Document deliveries, FOOD = Food/Gift deliveries)
INSERT INTO "LookupCourier" (code, label, category, active, "sortOrder", "updatedAt") VALUES
('DHL', 'DHL', 'PARCEL', true, 1, NOW()),
('FEDEX', 'FedEx', 'PARCEL', true, 2, NOW()),
('ARAMEX', 'Aramex', 'PARCEL', true, 3, NOW()),
('QATAR_POST', 'Qatar Post', 'PARCEL', true, 4, NOW()),
('UPS', 'UPS', 'PARCEL', true, 5, NOW()),
('TNT', 'TNT Express', 'PARCEL', true, 6, NOW()),
('SNOONU', 'Snoonu', 'FOOD', true, 7, NOW()),
('KEETA', 'Keeta', 'FOOD', true, 8, NOW()),
('TALABAT', 'Talabat', 'FOOD', true, 9, NOW()),
('RAFEEQ', 'Rafeeq', 'FOOD', true, 10, NOW()),
('DELIVEROO', 'Deliveroo', 'FOOD', true, 11, NOW()),
('NINJA', 'Ninja', 'FOOD', true, 12, NOW())
ON CONFLICT (code) DO NOTHING;

-- Locations
INSERT INTO "LookupLocation" (code, label, active, "sortOrder", "updatedAt") VALUES
('BARWA_TOWERS', 'Barwa Towers', true, 1, NOW()),
('MARINA_50', 'Marina 50', true, 2, NOW()),
('ELEMENT_MARIOTT', 'Element Mariott', true, 3, NOW())
ON CONFLICT (code) DO NOTHING;
