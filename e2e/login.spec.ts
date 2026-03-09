import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'https://arafatvisitor.cloud';
const LOGIN_EMAIL = process.env.PLAYWRIGHT_LOGIN_EMAIL || 'admin@arafatvisitor.cloud';
const LOGIN_PASSWORD = process.env.PLAYWRIGHT_LOGIN_PASSWORD || 'admin123';

test.describe('Login flow', () => {
  test('admin login captures response - reproduces ThrottlerException', async ({ page }) => {
    const loginResponses: { url: string; status: number; body?: string }[] = [];

    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/login') || url.includes('/api/auth') || url.includes('/admin/api')) {
        const status = response.status();
        let body = '';
        try {
          body = await response.text();
        } catch {
          body = '(could not read body)';
        }
        loginResponses.push({ url, status, body });
      }
    });

    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });

    await page.getByLabel(/email/i).fill(LOGIN_EMAIL);
    await page.getByLabel(/password/i).fill(LOGIN_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForTimeout(3000);

    const loginCalls = loginResponses.filter((r) => r.url.includes('login'));
    const throttled = loginResponses.filter((r) => r.status === 429);

    if (throttled.length > 0) {
      console.log('\n=== THROTTLED RESPONSES (429) ===');
      throttled.forEach((r) => {
        console.log(`URL: ${r.url}`);
        console.log(`Status: ${r.status}`);
        console.log(`Body: ${r.body?.slice(0, 500)}`);
      });
    }

    if (loginCalls.length > 0) {
      console.log('\n=== LOGIN API RESPONSES ===');
      loginCalls.forEach((r) => {
        console.log(`URL: ${r.url} -> ${r.status}`);
        if (r.status >= 400) console.log(`Body: ${r.body?.slice(0, 500)}`);
      });
    }

    expect(throttled.length, `Expected no 429. Got throttled: ${JSON.stringify(throttled)}`).toBe(0);
  });
});
