# Feature Specification: Admin Host Password Management

**Feature Branch**: `003-admin-host-password`
**Created**: 2026-01-29
**Status**: Draft
**Input**: User description: "add feature for admin role can change password for any host will write raw password and its auto change to hash one like override"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Changes Host Password from Host Edit Form (Priority: P1)

An administrator editing a Host record in the AdminJS Hosts panel can see and update the password for the linked User account directly on the Host edit form. The admin enters a new raw password in the password field, and the system automatically hashes it using bcrypt and updates the linked User record. This allows admins to manage host credentials without navigating to a separate Users panel.

**Why this priority**: This is the core functionality that enables admins to easily manage host credentials from a single location. Hosts and their login credentials should be managed together.

**Independent Test**: Can be fully tested by editing any Host record, entering a new password, saving, and verifying the host can log in with the new password.

**Acceptance Scenarios**:

1. **Given** an admin is viewing a Host's edit form, **When** they enter a new password in the password field and save, **Then** the password is hashed with bcrypt and stored in the linked User record, and the host can log in with the new password.
2. **Given** an admin is editing a Host, **When** they leave the password field empty and save other changes, **Then** the linked User's existing password remains unchanged.
3. **Given** a Host has no linked User account, **When** admin enters a password and saves, **Then** the system creates a new User account with role=HOST linked to this Host.

---

### User Story 2 - Password Field on Host Edit Form (Priority: P1)

The Host edit form in AdminJS displays a password field that allows admins to set or change the password for the host's linked User account. The field shows as empty (never displays the hashed password) and only updates when a new value is entered.

**Why this priority**: This is required for User Story 1 to work. The password field must be visible on the Host edit form.

**Independent Test**: Can be tested by opening the edit form for any Host and verifying the password field is present and editable.

**Acceptance Scenarios**:

1. **Given** an admin opens the edit form for a Host, **When** the form loads, **Then** a password field is visible and empty.
2. **Given** an admin opens the edit form for a Host with an existing linked User, **When** the form loads, **Then** the password field is empty (hashed password not shown).

---

### Edge Cases

- What happens when admin enters the same password the user already has? The system re-hashes and stores it (no comparison check needed).
- What happens if the password field is filled with only spaces? The system should treat it as empty (no password change).
- What happens if a Host has no linked User account? The system creates a new User with role=HOST and the provided password.
- What happens if the Host has no email? The system generates email as `host_{id}@system.local`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a password field on the Host edit form in AdminJS.
- **FR-002**: System MUST hash passwords using bcrypt with 12 salt rounds before storing.
- **FR-003**: System MUST preserve the existing password when the password field is left empty during edit.
- **FR-004**: System MUST update the linked User record when a password is provided on Host edit.
- **FR-005**: System MUST create a new User (role=HOST) if none exists when password is provided.
- **FR-006**: System MUST display the password field as empty in edit forms (never show hashed values).
- **FR-007**: System MUST only allow ADMIN role users to edit Host records (existing behavior).

### Key Entities

- **User**: System account for authentication. Key attributes: email (unique), password (bcrypt hashed), name, role (ADMIN/RECEPTION/HOST), hostId (optional link to Host).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can change any HOST user's password in under 30 seconds (open edit form, enter password, save).
- **SC-002**: 100% of password changes result in properly hashed passwords (bcrypt, 12 rounds).
- **SC-003**: Host users can immediately log in with their new password after admin reset.
- **SC-004**: Zero security incidents from plaintext password storage (passwords always hashed).

## Assumptions

- Bcrypt is already imported and available in the backend.
- The Host edit form is already ADMIN-only (existing behavior).
- User-Host relationship via User.hostId is already established.
