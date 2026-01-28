# Visitor & Delivery Management System – Full Specification

---

## 1. System Overview

This system is a **controlled-access visitor and delivery management platform** designed for multi-location office environments.

It standardizes:
- Visitor check-in and check-out
- Host notifications and approvals
- Delivery logging and pickup tracking
- Auditable history and reporting

The solution is split into two applications to keep reception workflows fast and the governance layer protected.

---

## 2. Technology Stack

### 2.1 Database
- **PostgreSQL 16**
  - Primary datastore
  - Stores users, hosts, visitors, visits, deliveries, QR tokens, check events, audit logs
  - Supports migrations, constraints, and reporting queries

### 2.2 Backend (API + Backoffice)
- **NestJS**
  - REST API for kiosk and backoffice
  - RBAC enforcement
  - Business rules and state transitions
  - Audit logging
  - Notification orchestration (Email / WhatsApp)

(Recommended integration)
- **Prisma**
  - Database access layer
  - Schema migrations
  - Typed models

### 2.3 Kiosk Application (Reception UI)
- **React + TypeScript**
- **TailwindCSS + custom CSS**
- Runs in browser on reception PC/tablet
- Uses camera QR scanning and fast forms
- Authenticates against backend (JWT recommended)

Purpose: fastest workflow at reception with minimal navigation and minimal risk of operational error.

---

## 3. System Actors

### 3.1 Admin
Purpose: governance and control.

Access:
- Users and roles
- System settings
- All visitors, visits, deliveries
- Reports
- Audit logs
- Host management

Restrictions:
- Admin does not operate reception workflows

---

### 3.2 Reception
Purpose: daily operations.

Access:
- Walk-in check-in
- QR-based check-out
- Visitor log (global)
- Deliveries log (create/update)
- Operational corrections

Restrictions:
- No user management
- No system settings
- No audit log access

---

### 3.3 Host
Purpose: manage own inbound traffic.

Access:
- Pre-register visitors (self only)
- Approve/reject assigned pre-registrations
- Receive arrival notifications
- View own history and dashboard
- View/update own deliveries (picked up)

Restrictions:
- No check-in/out
- No access to other hosts’ data
- No settings/users

---

## 4. Locations

Hosts and visits are tied to a location to prevent routing ambiguity.

Supported locations:
- Barwa Towers
- Marina 50
- Element Mariott

---

## 5. Hosts Table – Full Details

### 5.1 Purpose

The `hosts` table represents **internal people** who receive visitors and deliveries.

A host is used for:
- Assigning a visit to a responsible person
- Routing approvals
- Sending notifications
- Reporting and audit trails

There is **no companies table** by design. Company is stored on the host record to keep the model operationally simple and fast.

---

### 5.2 Table Structure

#### Table: `hosts`

| Column      | Type                                                | Null | Key | Description |
|------------|-----------------------------------------------------|------|-----|-------------|
| `id`       | `BIGINT UNSIGNED`                                   | NO   | PK  | Auto-increment unique identifier |
| `name`     | `VARCHAR(100)`                                      | NO   |     | Host full name |
| `company`  | `VARCHAR(100)`                                      | NO   |     | Company/tenant name (stored directly on host) |
| `email`    | `VARCHAR(100)`                                      | YES  |     | Optional notification email |
| `location` | `ENUM('Barwa Towers','Marina 50','Element Mariott')` | YES  |     | Host office location |
| `phone`    | `VARCHAR(191)`                                      | NO   |     | Primary phone (WhatsApp/SMS) |
| `status`   | `TINYINT UNSIGNED`                                  | NO   |     | Activation/availability state |

---

### 5.3 Column Semantics

#### `id`
- Primary key for host identity
- Referenced by visits and deliveries
- Never reused

#### `name`
- Human-readable identity for UI and logs
- Used in reception search/selection lists

#### `company`
- Stored as plain text
- Used for:
  - Reception confirmation
  - Reporting
  - Tenant grouping
- Intentionally denormalized to avoid joins and preserve historical stability

#### `email` (optional)
- Used for:
  - Approval requests
  - Arrival notifications
  - Visitor invitation messages
- If null, email channel is skipped

#### `location`
- Must be one of the supported locations
- Used for:
  - Filtering hosts at reception
  - Routing visitors correctly
  - Location-based reporting

#### `phone`
- Mandatory
- Primary channel for WhatsApp notifications
- Length supports international formats

#### `status`
Recommended semantics:
- `1` = Active (selectable, receives notifications, can approve)
- `0` = Inactive (hidden from new ops, preserved for history)

---

### 5.4 Data Integrity Rules

- Hosts should not be deleted once referenced in historical data
- If a host leaves, set `status = 0` instead of deletion
- Changes to `company` and `location` affect future operations, not historical records
- Reporting should use the host `id` as the stable identity, not mutable text fields

---

## 6. Operational Usage of Hosts

Hosts are referenced across flows:
- Visit assignment: reception selects host → visit links to host ID
- Approval routing: pending approvals notify the visit’s host
- Notifications: arrival and delivery notifications target host email/phone
- Delivery ownership: deliveries are assigned to host, not departments
- Audit logs: events reference host ID for traceability