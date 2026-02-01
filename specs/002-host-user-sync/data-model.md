# Data Model: Host-User Auto-Sync

**Branch**: `002-host-user-sync` | **Date**: 2026-01-29

## Overview

This feature does not require schema changes. The existing data model already supports:
- User with optional `hostId` link to Host
- HOST role in the Role enum
- One-to-many relationship (one Host can have multiple Users)

## Existing Entities (No Changes)

### Host

| Field      | Type          | Required | Description                    |
|------------|---------------|----------|--------------------------------|
| id         | BigInt        | Yes      | Auto-increment primary key     |
| externalId | String?       | No       | Unique external identifier     |
| name       | String(100)   | Yes      | Host full name                 |
| company    | String(100)   | Yes      | Company name                   |
| email      | String?(100)  | No       | Email address                  |
| phone      | String?(191)  | No       | Phone number                   |
| location   | Location?     | No       | Office location enum           |
| status     | SmallInt      | Yes      | 1=active, 0=inactive           |
| deletedAt  | DateTime?     | No       | Soft delete timestamp          |
| createdAt  | DateTime      | Yes      | Creation timestamp             |
| updatedAt  | DateTime      | Yes      | Last update timestamp          |

### User

| Field     | Type         | Required | Description                    |
|-----------|--------------|----------|--------------------------------|
| id        | Int          | Yes      | Auto-increment primary key     |
| email     | String       | Yes      | Unique login email             |
| password  | String       | Yes      | Bcrypt-hashed password         |
| name      | String       | Yes      | Display name                   |
| role      | Role         | Yes      | ADMIN, RECEPTION, or HOST      |
| hostId    | BigInt?      | No       | Link to Host (for HOST role)   |
| createdAt | DateTime     | Yes      | Creation timestamp             |
| updatedAt | DateTime     | Yes      | Last update timestamp          |

### Role Enum

| Value     | Description                                    |
|-----------|------------------------------------------------|
| ADMIN     | Full system access                             |
| RECEPTION | Front desk operations                          |
| HOST      | Limited access - own visitors/deliveries only  |

## Relationships

```
Host 1 ←──────→ * User
       (hostId)

- One Host can have multiple User accounts (one-to-many)
- User.hostId is optional (null for ADMIN/RECEPTION users)
- HOST role users MUST have a hostId (business rule enforced in code)
```

## Auto-Created User Details

When a Host is bulk-imported, a User is automatically created with:

| Field     | Value                                          |
|-----------|------------------------------------------------|
| email     | Host.email OR `host_{Host.id}@system.local`    |
| password  | Random 32-character hex, bcrypt-hashed         |
| name      | Host.name                                      |
| role      | HOST                                           |
| hostId    | Host.id                                        |

## Validation Rules

### User Creation During Import

1. **Email uniqueness**: Skip user creation if email already exists
2. **Host link uniqueness**: Skip user creation if a User already exists for this Host
3. **Password security**: 32-character random hex (16 bytes), bcrypt 12 rounds
4. **Name inheritance**: User.name = Host.name

## State Diagram

```
CSV Upload
    │
    ▼
┌─────────────────┐
│ Parse & Validate│
└────────┬────────┘
         │
         ▼
┌─────────────────┐     externalId exists?
│ Check Duplicate │────── YES ───► Skip Host + User
└────────┬────────┘
         │ NO
         ▼
┌─────────────────┐
│   Create Host   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     User email exists?
│  Check Email    │────── YES ───► Skip User (log warning)
└────────┬────────┘
         │ NO
         ▼
┌─────────────────┐     User for hostId exists?
│ Check Host Link │────── YES ───► Skip User
└────────┬────────┘
         │ NO
         ▼
┌─────────────────┐
│   Create User   │
│  (role=HOST)    │
└─────────────────┘
```
