# Feature Specification: Host-User Auto-Sync

**Feature Branch**: `002-host-user-sync`
**Created**: 2026-01-29
**Status**: Draft
**Input**: User description: "When an admin bulk-adds Hosts, the system must automatically create a matching User account for each new Host with the role = Host. Add a filter option to Users list to show/hide host role users."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Bulk Add Hosts with Auto User Creation (Priority: P1)

An administrator uploads a CSV file containing new host records via the Admin dashboard. For each successfully created Host record, the system automatically creates a corresponding User account with the HOST role, linking them together. This eliminates the manual step of creating user accounts separately for each host.

**Why this priority**: This is the core functionality that enables hosts to access the system without requiring separate manual user account creation. It directly addresses operational efficiency and reduces administrative overhead.

**Independent Test**: Can be fully tested by uploading a CSV with 5 new hosts and verifying that 5 Host records AND 5 linked User records (role=HOST) are created.

**Acceptance Scenarios**:

1. **Given** an admin is on the Hosts bulk import screen, **When** they upload a CSV with 10 valid new hosts, **Then** 10 Host records are created AND 10 User records with role=HOST are created, each linked to their respective Host via hostId.
2. **Given** a CSV contains hosts with email addresses, **When** the bulk import processes, **Then** User accounts are created using the host's email as the user email.
3. **Given** a host does not have an email address in the CSV, **When** the bulk import processes, **Then** a User account is created with a generated email using the host's database ID (e.g., `host_{id}@system.local`).

---

### User Story 2 - Prevent Duplicate Users on Re-Import (Priority: P1)

When re-uploading a CSV file that contains hosts already in the system, the system skips both the duplicate Host AND does not create duplicate User accounts. This ensures data integrity when administrators need to add new hosts to an existing dataset.

**Why this priority**: Data integrity is critical. Without duplicate prevention, re-imports could cause system errors, duplicate logins, and administrative confusion.

**Independent Test**: Can be tested by importing the same CSV file twice and verifying zero duplicates are created on the second import.

**Acceptance Scenarios**:

1. **Given** a Host with externalId "H001" already exists with a linked User, **When** admin re-uploads a CSV containing "H001", **Then** that host row is skipped and no new User is created.
2. **Given** a User already exists for a Host, **When** any import operation references that Host, **Then** no duplicate User is created.
3. **Given** a bulk import of 100 hosts where 50 already exist, **When** the import completes, **Then** only 50 new Host records and 50 new User records are created.

---

### User Story 3 - Filter Users List by Role (Priority: P2)

An administrator viewing the Users list in the Admin dashboard can filter to show only certain roles. By default, the list shows ADMIN and RECEPTION users. A toggle or filter control allows showing HOST role users as well (or all roles).

**Why this priority**: With potentially hundreds of host users being auto-created, administrators need the ability to focus on staff accounts (admin/reception) while still having access to host accounts when needed.

**Independent Test**: Can be tested by navigating to Users list and toggling the filter to verify correct users are shown/hidden.

**Acceptance Scenarios**:

1. **Given** an admin opens the Users list, **When** the page loads, **Then** only users with role ADMIN or RECEPTION are displayed, and the dropdown filter shows these roles pre-selected.
2. **Given** an admin is viewing the Users list, **When** they select HOST in the dropdown filter, **Then** users with role HOST are also displayed.
3. **Given** the dropdown filter includes HOST, **When** admin deselects HOST from the filter, **Then** HOST role users are hidden from the list.

---

### Edge Cases

- What happens when a Host has no email AND no externalId? System generates a unique email using the host's database ID after creation (e.g., `host_{id}@system.local`).
- What happens if a User already exists with the same email as a new Host's email? The Host is created but User creation is skipped for that host; the import reports this as a warning/skipped user, not a failure.
- What happens if the auto-generated email already exists? Since the format is `host_{id}@system.local` using the Host's database ID, this is guaranteed unique. If a User with matching email exists (e.g., from manual creation), skip User creation and report as skipped.
- What happens if User creation fails mid-batch? Host creation should be atomic per record; each Host+User pair is independent so failures don't roll back successful records.
- How does the system handle password generation for new Users? Generate a secure random password; the host will need to use "forgot password" or admin can reset it.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST create a User record with role=HOST for every newly inserted Host during bulk import.
- **FR-002**: System MUST link the created User to the Host via the hostId field.
- **FR-003**: System MUST NOT create a User if the Host already exists (duplicate externalId scenario).
- **FR-004**: System MUST NOT create a duplicate User if a User already exists for that Host.
- **FR-005**: System MUST use the Host's email as the User's email when available.
- **FR-006**: System MUST generate a placeholder email for Users when Host email is not provided.
- **FR-007**: System MUST generate a secure random password for auto-created User accounts; hosts must use the "forgot password" flow to set their own password on first login.
- **FR-008**: System MUST return import results that include: hosts inserted, hosts skipped, users created, users skipped.
- **FR-009**: Users list MUST default to showing only ADMIN and RECEPTION roles via a dropdown filter.
- **FR-010**: Users list MUST provide a dropdown filter allowing selection of one or more roles (ADMIN, RECEPTION, HOST) to display.
- **FR-011**: System MUST preserve existing Host bulk import validation rules (name, company, phone required).

### Key Entities

- **Host**: Represents an employee/contact who can receive visitors and deliveries. Key attributes: externalId (unique identifier from CSV), name, company, email, phone, location, status. Linked to User via one-to-many relationship.
- **User**: System account for authentication and authorization. Key attributes: email (unique), password, name, role (ADMIN/RECEPTION/HOST), hostId (optional link to Host). HOST role users are always linked to a Host record.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Bulk importing 100 new hosts creates exactly 100 Host records and 100 linked User records (role=HOST) in a single operation.
- **SC-002**: Re-uploading the same CSV file creates 0 duplicate Host records and 0 duplicate User records.
- **SC-003**: Users list loads with default filter showing only ADMIN and RECEPTION roles.
- **SC-004**: Administrators can toggle to view all users including HOST role within the same screen.
- **SC-005**: Import operation provides clear feedback on counts: hosts created, hosts skipped, users created, users skipped.

## Clarifications

### Session 2026-01-29

- Q: How do hosts receive credentials for first login? → A: Force password reset on first login (host uses "forgot password" flow)
- Q: What UI control type for Users list role filter? → A: Dropdown filter (select one or more roles to display)

## Assumptions

- Hosts will use the "forgot password" flow to set their initial password; no password is communicated directly.
- The generated placeholder email format (`host_{id}@system.local` where `id` is the Host's database ID) is acceptable for hosts without email addresses; they can update it later.
- HOST role users have limited dashboard access as already defined in the existing permission system.
- The existing bulk import validation rules (MAPPING.md) remain unchanged; this feature only adds User creation as a post-insert step.
