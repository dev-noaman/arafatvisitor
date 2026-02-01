# Data Model: Visitor & Delivery Management Kiosk UI

**Branch**: `001-visitor-kiosk-ui` | **Date**: 2026-01-28

## Entities

### Host

Represents an internal employee who receives visitors and deliveries. Loaded from backend, read-only from the kiosk perspective.

| Field    | Type                                                   | Required | Description                          |
|----------|--------------------------------------------------------|----------|--------------------------------------|
| id       | string (numeric)                                       | Yes      | Unique identifier                    |
| name     | string                                                 | Yes      | Host full name                       |
| company  | string                                                 | Yes      | Company/tenant name                  |
| email    | string                                                 | No       | Notification email                   |
| phone    | string                                                 | Yes      | Primary phone (WhatsApp/SMS)         |
| location | enum: Barwa Towers, Marina 50, Element Mariott         | No       | Host office location                 |
| status   | number (1=Active, 0=Inactive)                          | Yes      | Activation state                     |

**Relationships**: Referenced by Visit (as host), referenced by Delivery (as recipient host).
**Filtering**: Kiosk only displays hosts where `location` matches the configured kiosk location and `status = 1`.

---

### Visitor

A person arriving at the office. Created as part of a visit session during walk-in check-in.

| Field   | Type   | Required | Description                        |
|---------|--------|----------|------------------------------------|
| name    | string | Yes      | Visitor full name                  |
| company | string | Yes      | Visitor's company                  |
| phone   | string | Yes      | Phone with country code prefix     |
| email   | string | No       | Visitor's email                    |

**Validation rules**:
- `name`: min 2 characters
- `company`: min 2 characters
- `phone`: country code + 6-15 digits (regex: `^\d{6,15}$` for number portion)
- `email`: valid email format or empty

**Note**: Visitor is not a standalone entity in the frontend. It is embedded within the Visit Session payload.

---

### Visit Session

A record linking a visitor to a host for a specific visit. Persisted to backend on check-in.

| Field             | Type                              | Required | Description                                    |
|-------------------|-----------------------------------|----------|------------------------------------------------|
| id                | string                            | Yes      | Backend-assigned unique ID                     |
| sessionId         | string                            | Yes      | Human-readable session identifier (e.g., VMS-xxx) |
| visitor           | Visitor (embedded)                | Yes      | Visitor details                                |
| hostId            | string                            | Yes      | Reference to Host                              |
| purpose           | string                            | Yes      | Visit purpose                                  |
| location          | enum                              | Yes      | Office location where visit occurs             |
| status            | enum: checked-in, checked-out     | Yes      | Current visit state                            |
| checkInTimestamp   | ISO 8601 datetime                 | Yes      | When visitor checked in                        |
| checkOutTimestamp  | ISO 8601 datetime                 | No       | When visitor checked out (null if still in)     |

**State transitions**:
```
[created] --check-in--> checked-in --scan-QR--> checked-out
```
- `checked-in`: Created on form submission. QR code generated with `sessionId`.
- `checked-out`: Set when receptionist scans QR and taps "Process Visitor".
- No reverse transitions. A checked-out visit cannot be re-opened.

**Identity**: `sessionId` is the public-facing identifier (encoded in QR codes, displayed in UI). `id` is the backend primary key.

---

### Delivery

A package received at reception. Managed through the Deliveries panel.

| Field     | Type                           | Required | Description                         |
|-----------|--------------------------------|----------|-------------------------------------|
| id        | string                         | Yes      | Unique delivery ID (e.g., DEL-xxx)  |
| recipient | string                         | Yes      | Recipient name (host or company)    |
| hostId    | string                         | No       | Reference to Host (if assigned)     |
| courier   | string                         | Yes      | Courier/carrier name                |
| location  | enum                           | Yes      | Office location                     |
| status    | enum: Pending, Received        | Yes      | Delivery state                      |
| timestamp | ISO 8601 datetime              | Yes      | When delivery was logged            |
| receivedAt| ISO 8601 datetime              | No       | When delivery was picked up         |

**State transitions**:
```
[logged] --log-new--> Pending --mark-received--> Received
```
- `Pending`: Created when receptionist logs a new delivery.
- `Received`: Set when receptionist marks delivery as picked up.
- No reverse transitions.

---

### User (Employee)

A system operator who logs into the kiosk. Managed by backend.

| Field    | Type                              | Required | Description                     |
|----------|-----------------------------------|----------|---------------------------------|
| id       | string                            | Yes      | Unique user ID                  |
| email    | string                            | Yes      | Login credential                |
| role     | enum: admin, reception, host      | Yes      | Determines dashboard access     |
| name     | string                            | Yes      | Display name                    |
| token    | string (JWT)                      | Yes      | Auth token (stored client-side) |

**Validation rules**:
- `email`: valid email format
- `password`: min 6 characters (not stored client-side; sent only during login)

## Kiosk Configuration

Stored in `sessionStorage` under key `vms_config`. Not a backend entity.

| Field    | Type   | Required | Description                                           |
|----------|--------|----------|-------------------------------------------------------|
| apiBase  | string | Yes      | Backend API base URL (e.g., `https://api.example.com`)|
| location | string | Yes      | Kiosk operating location (one of the 3 enum values)   |

## Notification Configuration

Stored in `sessionStorage` under key `vms_notify`. Not a backend entity.

| Field              | Type   | Required | Description                      |
|--------------------|--------|----------|----------------------------------|
| smtp.host          | string | No       | SMTP server host                 |
| smtp.port          | number | No       | SMTP server port                 |
| smtp.username      | string | No       | SMTP username                    |
| smtp.password      | string | No       | SMTP password                    |
| smtp.sender        | string | No       | Sender email address             |
| whatsapp.endpoint  | string | No       | WhatsApp API endpoint URL        |
| whatsapp.client_id | number | No       | WhatsApp client ID               |
| whatsapp.api_key   | string | No       | WhatsApp API key                 |
| whatsapp.whatsapp_client | number | No | WhatsApp client instance number  |
