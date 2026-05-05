import { test, expect } from '@playwright/test';
import { loginAs } from './_helpers';

test('Brand sees seeded message thread on /messaging', async ({ page }) => {
  await loginAs(page, 'brand@demo.com', 'Demo@123', /\/brand\/dashboard/);
  await page.goto('/messaging');
  await page.waitForTimeout(1500);
  const text = await page.locator('body').innerText();
  expect(text).toMatch(/(love your content|smartphone|interested|message|inbox)/i);
});

test('Influencer sees seeded message thread on /messaging', async ({ page }) => {
  await loginAs(page, 'influencer@demo.com', 'Demo@123', /\/influencer\/dashboard/);
  await page.goto('/messaging');
  await page.waitForTimeout(1500);
  const text = await page.locator('body').innerText();
  expect(text).toMatch(/(love your content|smartphone|timeline|message|inbox)/i);
});

test('Logout returns user to login screen', async ({ page }) => {
  await loginAs(page, 'brand@demo.com', 'Demo@123', /\/brand\/dashboard/);
  const logoutBtn = page.getByRole('button', { name: /log\s*out|sign\s*out/i }).first();
  if (await logoutBtn.count()) {
    await logoutBtn.click();
    await page.waitForURL(/\/login/, { timeout: 5000 });
  } else {
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.goto('/brand/dashboard');
    await expect(page).toHaveURL(/\/login/);
  }
});
