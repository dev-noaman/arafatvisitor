/**
 * Fast kiosk checks for Playwright MCP (browser_run_code).
 * Use: Playwright MCP → browser_run_code → paste the code below.
 */

// OPTION A - Smoke only (~0.2–3s): Verify login page loads
const SMOKE_ONLY = `async (page) => {
  const start = Date.now();
  await page.goto("https://www.arafatvisitor.cloud/", {
    waitUntil: "domcontentloaded",
    timeout: 10000
  });
  const hasLogin = await page.getByRole("heading", { name: "Employee Login" }).isVisible();
  return {
    elapsedMs: Date.now() - start,
    ok: hasLogin,
    title: await page.title()
  };
}`;

// OPTION B - Full login (~2–4s): Fill form and check post-login
// Credentials: update email/password as needed for your environment
const FULL_LOGIN = `async (page) => {
  const start = Date.now();
  await page.goto("https://www.arafatvisitor.cloud/", {
    waitUntil: "domcontentloaded",
    timeout: 10000
  });
  await page.getByRole("textbox", { name: "Email" }).fill("admin@arafatvisitor.cloud");
  await page.getByRole("textbox", { name: "Password" }).fill("admin123");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForSelector('main:has-text("Check In"), main:has-text("Check Out"), main:has-text("Welcome"), [data-slot="toast"]', {
    timeout: 6000
  }).catch(() => null);
  const mainText = await page.locator("main").textContent();
  const loginSuccess = /Check In|Check Out|Welcome|Dashboard/i.test(mainText || "");
  return {
    elapsedMs: Date.now() - start,
    loginSuccess,
    url: page.url(),
    title: await page.title()
  };
}`;
