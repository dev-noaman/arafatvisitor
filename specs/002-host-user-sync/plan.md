# Implementation Plan: Host-User Auto-Sync

**Branch**: `002-host-user-sync` | **Date**: 2026-01-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-host-user-sync/spec.md`

## Summary

Extend the existing Host bulk import functionality to automatically create linked User accounts with role=HOST for each newly inserted Host. Add a dropdown role filter to the Users list in AdminJS that defaults to showing only ADMIN and RECEPTION roles.

## Technical Context

**Language/Version**: TypeScript 5.9, NestJS (Node.js backend)
**Primary Dependencies**: NestJS, Prisma ORM, AdminJS, bcrypt
**Storage**: PostgreSQL 16
**Testing**: Manual verification via AdminJS UI and API testing
**Target Platform**: Web (AdminJS dashboard)
**Project Type**: Web application (frontend kiosk + backend API + admin dashboard)
**Performance Goals**: Bulk import of 100+ hosts should complete within reasonable time
**Constraints**: Must not break existing bulk import flow; must be backwards compatible
**Scale/Scope**: Expected hundreds of hosts; admin-only feature

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution template is not customized for this project. Proceeding with standard best practices:

- ✅ Changes are additive to existing functionality
- ✅ No breaking changes to existing Host bulk import
- ✅ Role-based access control preserved (ADMIN only for Users management)
- ✅ Uses existing patterns (Prisma, bcrypt for passwords)

## Project Structure

### Documentation (this feature)

```text
specs/002-host-user-sync/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── admin/
│   │   ├── admin.controller.ts      # MODIFY: Add User creation to /admin/api/hosts/import
│   │   └── components/
│   │       └── BulkImportHosts.tsx  # MODIFY: Display usersCreated/usersSkipped in results
│   └── main.ts                      # MODIFY: Add role filter to Users AdminJS resource
└── prisma/
    └── schema.prisma                # No changes needed (schema already supports Host-User link)
```

**Structure Decision**: Web application structure. Changes limited to backend services and AdminJS configuration. No frontend (kiosk UI) changes required.

## Complexity Tracking

No constitution violations. Feature uses existing patterns and extends current functionality.

---

## Phase 0: Research

### Research Tasks Completed

1. **Existing bulk import implementation** - Analyzed `csv-import.service.ts` and `admin.controller.ts`
2. **User-Host relationship** - Verified schema supports `User.hostId` linking to `Host.id`
3. **Password hashing** - Confirmed `bcrypt` with 12 rounds used via `AuthService.hashPassword()`
4. **AdminJS filtering** - Identified `list.before` hook pattern for filtering

### Key Findings

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Extend existing `admin.controller.ts` import endpoint | Most used endpoint, already has detailed validation | Creating new endpoint (unnecessary duplication) |
| Use bcrypt with random 32-char password | Matches existing auth pattern, secure | UUID password (less entropy), deterministic (insecure) |
| Use AdminJS `list.before` hook for role filter | Pattern already used for HOST filtering, no API changes | New API endpoint for filtered users (overengineering) |
| Generate email as `host_{id}@system.local` | Uses Host DB id for guaranteed uniqueness | Using externalId (may be null), name (not unique) |

---

## Phase 1: Design

### Data Model Changes

**No schema changes required.** The existing schema already supports:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(RECEPTION)
  hostId    BigInt?
  host      Host?    @relation(fields: [hostId], references: [id])
  // ...
}

enum Role {
  ADMIN
  RECEPTION
  HOST
}
```

The `User.hostId` field allows linking a User to a Host. The `HOST` role already exists.

### Implementation Components

#### 1. Modify Host Bulk Import (`admin.controller.ts`)

After successful Host insert (line ~225), add User creation:

```typescript
// After host insert succeeds
const host = await this.prisma.host.create({ data: { ... } });
inserted += 1;

// Auto-create User for new Host
let userCreated = false;
let userSkipped = false;
try {
  const userEmail = host.email || `host_${host.id}@system.local`;

  // Check if user already exists with this email
  const existingUser = await this.prisma.user.findUnique({
    where: { email: userEmail.toLowerCase() }
  });

  if (!existingUser) {
    // Check if a user already exists for this host
    const existingHostUser = await this.prisma.user.findFirst({
      where: { hostId: host.id }
    });

    if (!existingHostUser) {
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 12);

      await this.prisma.user.create({
        data: {
          email: userEmail.toLowerCase(),
          password: hashedPassword,
          name: host.name,
          role: 'HOST',
          hostId: host.id,
        },
      });
      userCreated = true;
    } else {
      userSkipped = true; // User already exists for this host
    }
  } else {
    userSkipped = true; // Email already in use
  }
} catch (e) {
  // Log but don't fail the host import
  console.error(`Failed to create user for host ${host.id}:`, e);
  userSkipped = true;
}
```

Update return object to include user counts:

```typescript
return {
  totalProcessed,
  inserted,
  skipped,
  rejected,
  rejectedRows,
  usersCreated,    // NEW
  usersSkipped,    // NEW
};
```

#### 2. Add Role Filter to Users AdminJS Resource (`main.ts`)

Modify the Users resource configuration (around line 505-562):

```typescript
{
  resource: { model: getModel('User'), client: prisma },
  options: {
    id: 'Users',
    navigation: { name: 'System', icon: 'Users' },
    listProperties: ['name', 'email', 'role', 'createdAt'],
    filterProperties: ['role', 'email', 'name'],  // ADD role to filter
    properties: {
      role: {
        isVisible: { list: true, show: true, edit: true, filter: true },  // Enable filter
        availableValues: [
          { value: 'ADMIN', label: 'Admin' },
          { value: 'RECEPTION', label: 'Reception' },
          { value: 'HOST', label: 'Host' },
        ],
      },
      // ... existing properties
    },
    actions: {
      list: {
        isAccessible: ({ currentAdmin }: any) => currentAdmin?.role === 'ADMIN',
        isVisible: ({ currentAdmin }: any) => currentAdmin?.role === 'ADMIN',
        before: async (request: any, context: any) => {
          // Default filter: exclude HOST role if no role filter is specified
          // This shows only ADMIN and RECEPTION users by default
          if (!request.query?.['filters.role']) {
            request.query = {
              ...request.query,
              'filters.role': ['ADMIN', 'RECEPTION'],
            };
          }
          return request;
        },
      },
      // ... existing actions
    },
  },
},
```

**Implementation approach**:
1. Make the `role` property filterable with `availableValues` for the dropdown
2. Use `list.before` hook to set default filter to `['ADMIN', 'RECEPTION']` when no filter is specified
3. Admin can clear the filter or select HOST to see all users including hosts

### API Contract Changes

**Endpoint**: `POST /admin/api/hosts/import`

**Request**: No changes (same CSV content body)

**Response** (updated):
```json
{
  "totalProcessed": 100,
  "inserted": 80,
  "skipped": 10,
  "rejected": 10,
  "rejectedRows": [...],
  "usersCreated": 75,
  "usersSkipped": 5
}
```

New fields:
- `usersCreated`: Number of User accounts created
- `usersSkipped`: Number of User accounts skipped (email conflict or user already exists for host)

---

## Implementation Order

1. **Modify `admin.controller.ts`** - Add User creation logic to bulk import
2. **Update `BulkImportHosts.tsx`** - Display user creation counts in results
3. **Modify `main.ts`** - Add role filter to Users AdminJS resource
4. **Test** - Verify with CSV upload and Users list filtering

---

## Files to Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `backend/src/admin/admin.controller.ts` | Modify | Add User creation after Host insert in `importHosts` |
| `backend/src/admin/components/BulkImportHosts.tsx` | Modify | Display usersCreated/usersSkipped in results |
| `backend/src/main.ts` | Modify | Add role filter to Users AdminJS resource |

## Dependencies

- `crypto` (Node.js built-in) - For generating random passwords
- `bcrypt` (already installed) - For hashing passwords
