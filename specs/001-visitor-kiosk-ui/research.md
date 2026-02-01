# Research: Visitor & Delivery Management Kiosk UI

**Branch**: `001-visitor-kiosk-ui` | **Date**: 2026-01-28

## Research Tasks

### 1. QR Code Generation Strategy

**Decision**: Use the existing external QR code service (`api.qrserver.com`) for QR image rendering, but change the QR payload from base64-encoded full session data to a plain session ID string.

**Rationale**: The session data is now persisted to the backend (per clarification). The QR code only needs to contain the session ID as a lookup key. This makes QR codes smaller, faster to scan, and decouples the QR payload from the data model. The external service is free, requires no API key, and is already integrated.

**Alternatives considered**:
- Client-side QR generation via `qrcode` npm package: Would eliminate external dependency but adds bundle size (~30KB). Not worth the tradeoff for a kiosk that always has internet.
- Backend-generated QR: Would add latency to check-in flow and requires backend image serving. Unnecessary complexity.

### 2. Authentication Approach

**Decision**: JWT-based authentication via backend `/auth/login` endpoint. Store JWT in sessionStorage. Include token in API request headers. Simulated login remains as fallback when no API base is configured.

**Rationale**: JWT is specified in the README and assumptions. sessionStorage is already used for config storage. No auto-logout timeout means token expiry can be handled by the backend (e.g., 24-hour tokens). The existing simulated login path provides a development/demo mode.

**Alternatives considered**:
- Cookie-based sessions: More secure against XSS but adds CORS complexity for the SPA-to-API architecture. JWT is simpler for the kiosk use case.
- OAuth2/SSO: Over-engineered for an internal kiosk system with 3 roles. Email/password is sufficient.

### 3. Location Configuration Mechanism

**Decision**: Store the kiosk's location in sessionStorage under key `vms_config` alongside the existing `apiBase` field. Add a `location` field to the config object. Host API requests include `?location=<value>` as a query parameter.

**Rationale**: The `vms_config` sessionStorage pattern is already established in `lib/api.ts`. Adding `location` to the same config object is consistent and requires no new storage mechanism. Query parameter filtering keeps the API contract simple.

**Alternatives considered**:
- Environment variable at build time: Would require separate builds per location. Defeats the purpose of a single deployable SPA.
- URL path parameter (e.g., `/barwa-towers/`): Adds routing complexity for no benefit on a kiosk.

### 4. Visit Session Persistence & Check-out Flow

**Decision**: On check-in, POST visit session data to `/visits` endpoint. Backend returns `{ id, sessionId }`. QR code encodes only the `sessionId`. On QR scan, decode the session ID, GET `/visits/{sessionId}` to retrieve visitor details, then POST `/visits/{sessionId}/checkout` to complete check-out.

**Rationale**: This implements the backend-persisted model from clarifications. The check-in creates the server record, and check-out updates it. The QR code is a lightweight lookup token. The scanner displays visitor name and details fetched from the server, not decoded from the QR.

**Alternatives considered**:
- Bulk encode visitor data in QR + also persist: Redundant. If the backend is the source of truth, the QR should just be a pointer.

### 5. Delivery Management API Integration

**Decision**: Replace in-memory delivery state with API-backed CRUD. Endpoints: POST `/deliveries` (create), GET `/deliveries?search=<term>` (list/search), PATCH `/deliveries/{id}/receive` (mark received). Deliveries are scoped to the kiosk's configured location.

**Rationale**: The current DeliveriesPanel uses local state only. For production use, deliveries must persist across browser sessions and be visible to hosts checking their own deliveries. The search endpoint handles server-side filtering.

**Alternatives considered**:
- Keep client-side state with localStorage: Would not support multi-device access or host portal viewing. Violates the audit trail requirement.

### 6. Host Data Loading with Location Filtering

**Decision**: Modify `fetchHosts()` to pass `?location=<configured_location>` query parameter. Backend returns only hosts at that location. Existing company-based grouping and cascading selection remain unchanged.

**Rationale**: With ~700 hosts across 3 locations, filtering server-side reduces payload size and eliminates client-side filtering logic. The cascading company→person selection UX is already implemented and works well.

**Alternatives considered**:
- Client-side filtering of all hosts: Works for 700 records but adds unnecessary data transfer and processing. Server-side is cleaner.

### 7. Testing Strategy

**Decision**: Add Vitest + React Testing Library for component-level tests. Focus tests on: form validation logic, API client functions (with mocked fetch), role-based view rendering, and QR encode/decode round-trips.

**Rationale**: The project has no tests currently. Vitest is the natural choice for a Vite project (zero-config, fast). React Testing Library tests user-facing behavior rather than implementation details. No E2E testing framework is needed for the initial implementation.

**Alternatives considered**:
- Jest: Requires more configuration with Vite. Vitest is the recommended testing framework for Vite projects.
- Playwright/Cypress E2E: Valuable but higher setup cost. Better added after the API integration is stable.
