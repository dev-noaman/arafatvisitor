# Research: Host-User Auto-Sync

**Branch**: `002-host-user-sync` | **Date**: 2026-01-29

## Research Questions

### 1. How does the existing bulk import work?

**Finding**: Two implementations exist:
- `csv-import.service.ts` - Used by `HostsController` for file uploads
- `admin.controller.ts` - Used by AdminJS `BulkImportHosts` component (main path)

The AdminJS path (`POST /admin/api/hosts/import`) is the primary one used. It:
1. Parses CSV content from request body
2. Validates each row (name, email, phone, location, status)
3. Checks for duplicate by `externalId`
4. Creates Host record
5. Returns counts: totalProcessed, inserted, skipped, rejected

**Decision**: Extend `admin.controller.ts` since it's the active import path.

### 2. What is the User-Host relationship in the schema?

**Finding**: The schema already supports this:
```prisma
model User {
  hostId    BigInt?
  host      Host?    @relation(fields: [hostId], references: [id])
}
```

- `User.hostId` is optional, allowing non-host users (ADMIN, RECEPTION)
- Host can have multiple Users (one-to-many)
- HOST role is already defined in the `Role` enum

**Decision**: No schema changes needed. Simply link new User to Host via `hostId`.

### 3. How are passwords handled?

**Finding**: The `AuthService` uses bcrypt with 12 rounds:
```typescript
const BCRYPT_ROUNDS = 12;
await bcrypt.hash(password, BCRYPT_ROUNDS);
```

**Decision**: Use same pattern. Generate random 32-character hex password using `crypto.randomBytes(16).toString('hex')`.

### 4. How does AdminJS filtering work?

**Finding**: AdminJS uses `list.before` hooks to modify queries:
```typescript
list: {
  before: async (request: any, context: any) => {
    request.query = { ...request.query, 'filters.hostId': currentAdmin.hostId };
    return request;
  },
}
```

The Users resource currently has no default filter. The `role` property is not exposed in filters.

**Decision**: Add `filterProperties: ['role']` and a `before` hook to default-exclude HOST role.

### 5. How to generate unique emails for hosts without email?

**Finding**: Options considered:
- `host_{externalId}@system.local` - externalId may be null
- `host_{name}@system.local` - names are not unique
- `host_{id}@system.local` - Host DB id is always unique after insert

**Decision**: Use `host_{host.id}@system.local` after Host is created, guaranteeing uniqueness.

## Alternatives Considered

| Topic | Chosen | Rejected | Reason |
|-------|--------|----------|--------|
| Import endpoint | admin.controller.ts | csv-import.service.ts | AdminJS component uses admin endpoint |
| Password generation | Random 32-char hex | UUID | More entropy, cleaner format |
| Email generation | host_{id}@system.local | host_{externalId}@system.local | ID is always unique, externalId may be null |
| Role filter UI | AdminJS filter panel | Custom component | Simpler, uses existing AdminJS patterns |
| Default filter | Exclude HOST via before hook | No default | Matches spec requirement |
