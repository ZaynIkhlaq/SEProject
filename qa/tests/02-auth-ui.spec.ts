import { test, expect } from '@playwright/test';
import { loginAs } from './_helpers';

test('Login page renders with InfluencerHub branding', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /InfluencerHub/i })).toBeVisible();
  await expect(page.getByPlaceholder(/you@company\.com/i)).toBeVisible();
  await expect(page.getByPlaceholder(/enter your password/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
});

test('Root path redirects to /login', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
});

test('Unknown path redirects to /login', async ({ page }) => {
  await page.goto('/totally-made-up-route');
  await expect(page).toHaveURL(/\/login$/);
});

test('Protected brand route redirects unauthenticated user to /login', async ({ page }) => {
  await page.goto('/brand/dashboard');
  await expect(page).toHaveURL(/\/login/);
});

test('Invalid login shows error message', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder(/you@company\.com/i).fill('brand@demo.com');
  await page.getByPlaceholder(/enter your password/i).fill('totally-wrong');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForTimeout(1500);
  await expect(page).toHaveURL(/\/login/);
  const bodyText = await page.locator('body').innerText();
  expect(bodyText.toLowerCase()).toMatch(/invalid|error|incorrect|wrong/);
});

test('Brand login redirects to /brand/dashboard', async ({ page }) => {
  await loginAs(page, 'brand@demo.com', 'Demo@123', /\/brand\/dashboard/);
  await expect(page).toHaveURL(/\/brand\/dashboard/);
});

test('Influencer login redirects to /influencer/dashboard', async ({ page }) => {
  await loginAs(page, 'influencer@demo.com', 'Demo@123', /\/influencer\/dashboard/);
  await expect(page).toHaveURL(/\/influencer\/dashboard/);
});

test('Login normalizes "brand" username shortcut', async ({ page }) => {
  await loginAs(page, 'brand', 'Demo@123', /\/brand\/dashboard/);
});

test('Brand register page loads', async ({ page }) => {
  await page.goto('/register/brand');
  await expect(page.locator('body')).toContainText(/brand/i);
});

test('Influencer register page loads', async ({ page }) => {
  await page.goto('/register/influencer');
  await expect(page.locator('body')).toContainText(/(influencer|creator)/i);
});
