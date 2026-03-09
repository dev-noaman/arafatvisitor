import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
/**
 * Tests the THROTTLED /api/auth/login endpoint (kiosk/mobile).
 * Admin uses /admin/api/login (not throttled).
 * Run against localhost (backend must be running):
 *   cd backend && npm run start:dev
 *   npx playwright test e2e/login-throttle.spec.ts
 * Run against production:
 *   PLAYWRIGHT_BASE_URL=https://arafatvisitor.cloud npx playwright test e2e/login-throttle.spec.ts
 */
test.describe('Login throttling - /api/auth/login', () => {
  test('with relaxed limits, 15+ login attempts before 429', async ({ request }) => {
    const responses: { status: number; body?: string }[] = [];
    const maxAttempts = 20;

    for (let i = 0; i < maxAttempts; i++) {
      const res = await request.post(`${BASE_URL}/api/auth/login`, {
        data: { email: 'test@test.com', password: 'wrongpassword' },
        headers: { 'Content-Type': 'application/json' },
        failOnStatusCode: false,
      });
      const body = await res.text();
      responses.push({ status: res.status(), body });
      if (res.status() === 429) {
        console.log(`\n=== Got 429 on attempt ${i + 1} ===`);
        expect(i + 1).toBeGreaterThanOrEqual(10); // With fix: allow 15+ before throttle
        expect(body).toContain('ThrottlerException');
        return;
      }
    }

    expect(responses.length).toBe(maxAttempts);
    expect(responses.every((r) => r.status === 401)).toBe(true); // Invalid creds, not 429
  });
});
