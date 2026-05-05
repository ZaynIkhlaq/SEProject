import { Page, expect } from '@playwright/test';

export async function loginAs(page: Page, email: string, password: string, expectedUrl?: RegExp) {
  await page.goto('/login');
  // Labels in LoginPage.tsx are not associated with inputs (no htmlFor) — use placeholder.
  await page.getByPlaceholder(/you@company\.com|email/i).fill(email);
  await page.getByPlaceholder(/enter your password|password/i).fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  if (expectedUrl) await page.waitForURL(expectedUrl, { timeout: 10000 });
}
