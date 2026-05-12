import { test, expect } from '@playwright/test';
import { loginAs } from './_helpers';

test.describe('Brand UI flows', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'brand@demo.com', 'Demo@123', /\/brand\/dashboard/);
  });

  test('Brand dashboard renders with nav', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Dashboard', exact: true }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Campaigns', exact: true }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Messages', exact: true }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Profile', exact: true }).first()).toBeVisible();
  });

  test('Brand campaigns page lists seeded campaigns', async ({ page }) => {
    await page.getByRole('link', { name: 'Campaigns', exact: true }).first().click();
    await expect(page).toHaveURL(/\/brand\/campaigns/);
    await page.waitForTimeout(1500);
    const text = await page.locator('body').innerText();
    expect(text).toMatch(/Product Launch Campaign|Summer Fashion|Smartphone/);
  });

  test('Create campaign page loads', async ({ page }) => {
    await page.goto('/brand/campaign/create');
    await page.waitForTimeout(1000);
    const text = await page.locator('body').innerText();
    expect(text.toLowerCase()).toMatch(/title|campaign|product/);
  });

  test('Brand profile page loads', async ({ page }) => {
    await page.getByRole('link', { name: 'Profile', exact: true }).first().click();
    await expect(page).toHaveURL(/\/brand\/profile/);
    await page.waitForTimeout(1000);
    const text = await page.locator('body').innerText();
    expect(text).toMatch(/Tech Startup|Technology|company/i);
  });

  test('Recommendations page loads', async ({ page }) => {
    await page.goto('/brand/recommendations');
    await page.waitForTimeout(1000);
    expect(await page.locator('body').innerText()).toBeTruthy();
  });

  test('Brand cannot access influencer-only route', async ({ page }) => {
    await page.goto('/influencer/dashboard');
    await page.waitForTimeout(800);
    expect(page.url()).not.toContain('/influencer/dashboard');
  });
});
