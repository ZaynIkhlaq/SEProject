import { test, expect } from '@playwright/test';
import { loginAs } from './_helpers';

test.describe('Influencer UI flows', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'influencer@demo.com', 'Demo@123', /\/influencer\/dashboard/);
  });

  test('Influencer dashboard renders with nav', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Dashboard', exact: true }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Campaigns', exact: true }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Messages', exact: true }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Profile', exact: true }).first()).toBeVisible();
  });

  test('Browse Campaigns shows seeded campaigns', async ({ page }) => {
    await page.getByRole('link', { name: 'Campaigns', exact: true }).first().click();
    await expect(page).toHaveURL(/\/influencer\/campaigns/);
    await page.waitForTimeout(1500);
    const text = await page.locator('body').innerText();
    expect(text).toMatch(/Smartphone|Fashion|Skincare|Fitness|Beverage|Product Launch/);
  });

  test('Influencer profile shows seeded data', async ({ page }) => {
    await page.getByRole('link', { name: 'Profile', exact: true }).first().click();
    await expect(page).toHaveURL(/\/influencer\/profile/);
    await page.waitForTimeout(1000);
    const text = await page.locator('body').innerText();
    expect(text).toMatch(/Instagram|Tech & Innovation|50,?000|Karachi/i);
  });

  test('Influencer cannot access brand-only route', async ({ page }) => {
    await page.goto('/brand/dashboard');
    await page.waitForTimeout(800);
    expect(page.url()).not.toContain('/brand/dashboard');
  });
});
