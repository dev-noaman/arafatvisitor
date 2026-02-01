# Quickstart: Visitor & Delivery Management Kiosk UI

**Branch**: `001-visitor-kiosk-ui` | **Date**: 2026-01-28

## Prerequisites

- Node.js 20+ and npm
- A modern browser (Chrome, Edge, or Safari)
- Backend API running (optional for dev - kiosk falls back to simulated mode without API)

## Setup

All commands run from the repository root (no `cd UI` needed).

# Clone and checkout branch
git checkout 001-visitor-kiosk-ui

# Install dependencies
npm install

# Start development server
npm run dev

The kiosk UI will be available at `http://localhost:5173`.

## Kiosk Configuration

Before the kiosk can connect to the backend API, configure it via the browser console:

```javascript
// Set API base URL and kiosk location
sessionStorage.setItem('vms_config', JSON.stringify({
  apiBase: 'http://localhost:3000',
  location: 'Barwa Towers'  // or 'Marina 50' or 'Element Mariott'
}))

// Optional: Set notification config
sessionStorage.setItem('vms_notify', JSON.stringify({
  smtp: {
    host: 'smtp.example.com',
    port: 587,
    username: 'notify@example.com',
    password: 'secret',
    sender: 'noreply@arafat.com'
  },
  whatsapp: {
    endpoint: 'https://api.whatsapp-provider.com/send',
    client_id: 12345,
    api_key: 'your-api-key',
    whatsapp_client: 67890
  }
}))
```

Reload the page after setting configuration.

## Development Mode (No Backend)

Without an `apiBase` configured:
- Login works in simulated mode (any credentials accepted after 1.5s delay)
- "Quick Login (Reception)" button bypasses the login form
- Host list returns empty (walk-in form shows "No hosts found")
- QR scanning works locally with a "Simulate Scan" button
- Deliveries use in-memory state (not persisted)

## Build for Production

```bash
npm run build
```

Output is generated in `dist/`. Deploy the contents to any static hosting.

## Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | App shell, auth state, view routing |
| `src/features/auth/LoginForm.tsx` | Employee login + forgot password |
| `src/features/visitors/WalkInForm.tsx` | Walk-in visitor registration |
| `src/features/visitors/QRScanner.tsx` | QR code scanning + check-out |
| `src/features/deliveries/DeliveriesPanel.tsx` | Delivery management |
| `src/lib/api.ts` | API client (hosts, visits, deliveries, auth) |
| `src/lib/notifications.ts` | Email + WhatsApp dispatch |

## API Endpoints (Backend)

See [contracts/api-contracts.yaml](./contracts/api-contracts.yaml) for full OpenAPI specification.

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/auth/login` | Authenticate employee |
| POST | `/auth/forgot-password` | Request password reset |
| GET | `/hosts?location=X` | List active hosts at location |
| POST | `/visits` | Create visit session (check-in) |
| GET | `/visits/{sessionId}` | Look up visit by session ID |
| POST | `/visits/{sessionId}/checkout` | Check out visitor |
| GET | `/deliveries?location=X&search=Y` | List/search deliveries |
| POST | `/deliveries` | Log new delivery |
| PATCH | `/deliveries/{id}/receive` | Mark delivery as received |
| POST | `/notify/email` | Send email notification |

## Testing

```bash
npm test        # Run unit tests (Vitest)
npm run lint    # Run ESLint
npm run build   # Type-check + build
```
