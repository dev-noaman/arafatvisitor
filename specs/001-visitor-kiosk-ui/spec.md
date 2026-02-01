# Feature Specification: Visitor & Delivery Management Kiosk UI

**Feature Branch**: `001-visitor-kiosk-ui`
**Created**: 2026-01-28
**Status**: Draft
**Input**: User description: "Visitor and Delivery Management Kiosk UI based on README specification with current UI review"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Walk-in Visitor Check-in (Priority: P1)

A receptionist receives a walk-in visitor at one of three office locations (Barwa Towers, Marina 50, Element Mariott). The receptionist opens the kiosk application, selects "Visitor Check-in", and fills in the visitor's details: full name, company, phone number (with country code), optional email, and purpose of visit (Meeting, Interview, Delivery, Maintenance, or Other). The receptionist then selects the host company and host person the visitor is here to see. Upon submission, the system generates a QR code badge for the visitor, and the assigned host is notified via email and/or WhatsApp that their visitor has arrived.

**Why this priority**: Walk-in check-in is the core daily operation of the reception desk. Without this flow, the system has no primary function. Every other feature depends on visitors being registered in the system.

**Independent Test**: Can be fully tested by filling in the walk-in form with sample visitor data, selecting a host, and verifying the QR code is generated and host notification is triggered. Delivers immediate value by digitizing the visitor registration process.

**Acceptance Scenarios**:

1. **Given** the receptionist is logged in and on the dashboard, **When** they tap "Visitor Check-in", **Then** the walk-in registration form is displayed with all required fields.
2. **Given** the walk-in form is open, **When** the receptionist fills in visitor name, company, phone, purpose, and selects a host company, **Then** the host person dropdown filters to show only hosts belonging to the selected company.
3. **Given** all required fields are filled, **When** the receptionist submits the form, **Then** a QR code is generated containing the visit session data, and a success notification is shown.
4. **Given** the host has an email address on file, **When** a visitor checks in to see them, **Then** the host receives an email notification with visitor name, company, and purpose.
5. **Given** the host has a phone number on file, **When** a visitor checks in to see them, **Then** the host receives a WhatsApp message with visitor arrival details.
6. **Given** the visitor selects "Other" as the purpose, **When** the purpose dropdown changes, **Then** a text input appears for the visitor to describe their purpose.

---

### User Story 2 - QR-Based Visitor Check-out (Priority: P2)

When a visitor is leaving, the receptionist opens the "QR Scan" section on the kiosk. The visitor presents their QR code badge. The receptionist uses the device camera to scan the QR code, which decodes the visitor session data. The system shows the visitor's name and session ID, and the receptionist taps "Process Visitor" to complete the check-out. The receptionist can also scan another visitor immediately or stop scanning.

**Why this priority**: Check-out completes the visitor lifecycle. Without it, there is no way to track who is still on-premises, which is a security and compliance requirement.

**Independent Test**: Can be tested by generating a QR code during check-in, then scanning it with the camera. Verifying the decoded session ID matches and the visitor record is updated. Delivers value by enabling auditable entry/exit tracking.

**Acceptance Scenarios**:

1. **Given** the receptionist selects "QR Scan" from the dashboard, **When** the scanner view loads, **Then** the device camera activates and shows a live viewfinder with a target frame.
2. **Given** the camera is active and scanning, **When** a valid QR code is held within the frame, **Then** the system automatically decodes the QR data and displays the visitor's session ID and name.
3. **Given** a QR code has been successfully scanned, **When** the receptionist taps "Process Visitor", **Then** a success confirmation is shown and the scan view resets.
4. **Given** a QR code has been scanned, **When** the receptionist taps "Scan Another", **Then** the camera re-activates for the next visitor.
5. **Given** the device camera cannot be accessed, **When** the scanner attempts to activate, **Then** an error message is displayed explaining that camera permissions must be granted.

---

### User Story 3 - Delivery Logging and Tracking (Priority: P3)

A courier arrives at reception with a package. The receptionist opens the "Deliveries" section and taps "Log New" to create a delivery record. The delivery is assigned a unique ID, recorded with the recipient name, courier name, and timestamp. Deliveries appear in a searchable list with status (Pending or Received). When the recipient picks up their package, the receptionist marks the delivery as "Received".

**Why this priority**: Delivery management is a secondary but important operational function. It prevents lost packages and provides accountability for deliveries received at the office.

**Independent Test**: Can be tested by logging a new delivery, searching for it by ID or recipient name, and marking it as received. Delivers value by providing a digital ledger for all incoming packages.

**Acceptance Scenarios**:

1. **Given** the receptionist is on the Deliveries panel, **When** they tap "Log New", **Then** a new delivery entry is created with a unique ID, "Pending" status, and current timestamp.
2. **Given** there are deliveries in the list, **When** the receptionist types in the search box, **Then** the list filters by delivery ID or recipient name in real time.
3. **Given** a delivery has "Pending" status, **When** the receptionist taps "Mark Received", **Then** the status changes to "Received" and a success notification is shown.
4. **Given** a delivery has already been marked "Received", **When** viewing the delivery list, **Then** the "Mark Received" button is no longer visible for that delivery.
5. **Given** no deliveries match the search query, **When** viewing the filtered list, **Then** a "No deliveries found" message is displayed.

---

### User Story 4 - Employee Authentication (Priority: P4)

An employee (receptionist, admin, or host) arrives at the kiosk and must log in before accessing any operational features. They enter their email and password, and the system authenticates them and routes them to the appropriate dashboard based on their role. If the employee forgets their password, they can request a reset link via email. A quick-login option for reception staff is available for rapid access during busy periods.

**Why this priority**: Authentication gates all other features and enforces role-based access. It is foundational but ranked P4 because the current implementation uses simulated authentication, and the core workflows can be demonstrated without a live backend.

**Independent Test**: Can be tested by entering valid credentials and verifying the dashboard loads with role-appropriate options. The forgot-password flow can be tested by entering an email and verifying the reset confirmation message.

**Acceptance Scenarios**:

1. **Given** the user is not logged in, **When** they access the kiosk application, **Then** the login form is displayed with email and password fields.
2. **Given** the login form is displayed, **When** the user enters valid credentials and submits, **Then** they are authenticated and redirected to the role-appropriate dashboard.
3. **Given** the login form is displayed, **When** the user enters an invalid email format, **Then** an inline validation error is shown.
4. **Given** the login form is displayed, **When** the user enters a password shorter than 6 characters, **Then** an inline validation error is shown.
5. **Given** the user taps "Forgot password?", **When** they enter their email and submit, **Then** a confirmation message is displayed stating a reset link has been sent.
6. **Given** the user is a receptionist during a busy period, **When** they tap "Quick Login (Reception)", **Then** they are immediately logged in with the reception role.

---

### User Story 5 - Role-Based Dashboard Navigation (Priority: P5)

After logging in, the employee sees a dashboard with large, touch-friendly action buttons appropriate to their role. Receptionists see QR Scan, Visitor Check-in, and Deliveries. Hosts do not have access to the walk-in check-in form. The employee can navigate to any workflow and return to the dashboard via a "Back to Dashboard" button. A real-time clock is displayed in the header for operational awareness.

**Why this priority**: Navigation and role-based access control are important for usability and security, but they are structural elements that support the primary workflows rather than delivering standalone value.

**Independent Test**: Can be tested by logging in as different roles and verifying the correct dashboard buttons and workflow access are presented.

**Acceptance Scenarios**:

1. **Given** a receptionist is logged in, **When** they view the dashboard, **Then** they see three action buttons: QR Scan, Visitor Check-in, and Deliveries.
2. **Given** a host is logged in, **When** they navigate to the walk-in check-in view, **Then** the form is not displayed (access restricted).
3. **Given** any employee is viewing a sub-workflow (e.g., QR Scanner), **When** they tap "Back to Dashboard", **Then** they return to the main dashboard view.
4. **Given** any employee is logged in, **When** they view the header, **Then** a real-time clock shows the current time and date.
5. **Given** any employee is logged in, **When** they tap the logout button, **Then** they are logged out and returned to the login screen.

---

### Edge Cases

- What happens when the camera is blocked or permissions are denied during QR scanning? The system displays an error message and allows the receptionist to retry or use a simulate-scan fallback.
- What happens when no hosts are loaded from the API? The host company dropdown is empty and the host person dropdown shows "No hosts found", preventing submission with an invalid host.
- What happens when the API base URL is not configured? The system gracefully returns empty data (no hosts, no error thrown) and operations that require the API silently skip.
- What happens when the WhatsApp notification config is missing? The WhatsApp notification is skipped; only email notification is attempted if available.
- What happens when a visitor scans a QR code that contains invalid or corrupted data? The scanner falls back to displaying the raw scanned string and shows a generic "QR Scanned" message.
- What happens when a receptionist tries to submit the walk-in form with missing required fields? Inline validation errors appear next to each invalid field, and the form is not submitted.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a walk-in visitor registration form capturing full name, company, phone (with country code), optional email, and visit purpose.
- **FR-002**: System MUST support five visit purpose categories: Meeting, Interview, Delivery, Maintenance, and Other (with free-text description).
- **FR-003**: System MUST load host data from a backend API, filter to the kiosk's configured location, and organize hosts by company for cascading selection (company first, then person).
- **FR-004**: System MUST persist the visit session to the backend API on check-in and generate a QR code containing the session ID as a lookup key.
- **FR-005**: System MUST send an email notification to the host when their visitor checks in, provided the host has an email address on file.
- **FR-006**: System MUST send a WhatsApp notification to the host when their visitor checks in, provided WhatsApp integration is configured.
- **FR-007**: System MUST provide a camera-based QR scanner that automatically detects and decodes QR codes from the device camera feed.
- **FR-008**: System MUST decode the session ID from scanned QR codes, look up the visit record from the backend API, and display the visitor's name and session details.
- **FR-009**: System MUST allow receptionists to log new deliveries with auto-generated unique IDs, current timestamp, and "Pending" status.
- **FR-010**: System MUST allow receptionists to search deliveries by ID or recipient name with real-time filtering.
- **FR-011**: System MUST allow receptionists to mark pending deliveries as "Received".
- **FR-012**: System MUST authenticate employees via email and password with client-side validation (valid email format, minimum 6-character password).
- **FR-013**: System MUST provide a "Forgot Password" flow that accepts an email address and confirms a reset link has been sent.
- **FR-014**: System MUST enforce role-based access: hosts cannot access the walk-in check-in form.
- **FR-015**: System MUST display a real-time clock (hours and minutes) and current date in the application header.
- **FR-016**: System MUST support three office locations: Barwa Towers, Marina 50, and Element Mariott. The kiosk's operating location is fixed at deployment via configuration and determines which hosts are displayed.
- **FR-017**: System MUST support phone numbers with international country codes (Qatar +974, UAE +971, Saudi +966, UK +44, USA +1).
- **FR-018**: System MUST provide a "Quick Login" option for reception staff that bypasses the credential form.

### Key Entities

- **Visitor**: A person arriving at the office. Attributes: full name, company, phone, optional email, visit purpose. Created during walk-in check-in.
- **Host**: An internal employee who receives visitors and deliveries. Attributes: name, company, optional email, phone. Loaded from backend. Used for visit assignment and notification routing.
- **Visit Session**: A record linking a visitor to a host for a specific visit. Attributes: unique session ID, visitor details, host reference, purpose, check-in timestamp, check-out timestamp, status (checked-in/checked-out). Persisted to the backend on check-in; QR code contains the session ID as a lookup key.
- **Delivery**: A package received at reception. Attributes: unique delivery ID, recipient name, courier, timestamp, status (Pending/Received).
- **User (Employee)**: A system operator. Attributes: email, password, role (admin/reception/host). Determines dashboard access and permissions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Reception staff can complete a walk-in visitor check-in (fill form, select host, submit, generate QR) in under 2 minutes.
- **SC-002**: 95% of QR code scans are detected and decoded within 5 seconds of presenting the code to the camera.
- **SC-003**: Host receives arrival notification (email or WhatsApp) within 30 seconds of visitor check-in completion.
- **SC-004**: Reception staff can log a new delivery in under 30 seconds (single button tap).
- **SC-005**: Searching deliveries returns filtered results instantly as the user types, with no perceptible delay.
- **SC-006**: 100% of login attempts with invalid credentials show clear, specific validation feedback before any request is sent.
- **SC-007**: All primary dashboard actions (QR Scan, Visitor Check-in, Deliveries) are accessible within one tap from the dashboard.
- **SC-008**: The kiosk interface is fully usable on tablet-sized screens (768px width and above) with touch-friendly controls (minimum 44px tap targets).

## Clarifications

### Session 2026-01-28

- Q: How should the kiosk determine which location it is operating at? → A: Fixed at deployment - location set once in configuration (e.g., session storage or environment variable), not changeable by the receptionist. Host lists are filtered to the configured location.
- Q: Should visit sessions be persisted to the backend, or is the QR code the sole record? → A: Backend-persisted - check-in sends session data to the API; the QR code contains the session ID as a lookup key. This enables active visitor lists, audit trails, and check-out status tracking.
- Q: Should the kiosk auto-logout after a period of inactivity? → A: No timeout - the kiosk stays logged in until manual logout or browser close. Reception kiosks are continuously attended during operating hours.

## Assumptions

- The backend API (NestJS + Prisma + PostgreSQL) is a separate system that will be developed independently. The kiosk UI connects to it via REST endpoints.
- Notification configuration (SMTP for email, WhatsApp API credentials) is stored in the browser's session storage and managed outside the kiosk UI.
- The host data (names, companies, contact info) is maintained in the backend and served via a `/hosts` endpoint.
- The QR code generation uses an external QR code service (`api.qrserver.com`) for rendering the code image.
- The application is deployed as a single-page application running in a web browser on reception PCs or tablets. There is no auto-logout timeout; the session persists until manual logout or browser close.
- Session-based authentication (JWT) will be implemented when the backend is available; current authentication is simulated for development.
- The three supported locations (Barwa Towers, Marina 50, Element Mariott) are fixed and do not require dynamic management through the UI. Each kiosk is configured with its location at deployment time, and this setting filters the available hosts.
