import { test, expect } from '@playwright/test';

test.describe('Overlay Wealth', () => {
  test('homepage loads with branding', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Overlay/i).first()).toBeVisible();
  });

  test('sidebar navigation switches views', async ({ page }) => {
    await page.goto('/');
    await page.getByText(/Finance Dictionary/i).click();
    await expect(page.getByText(/Finance Dictionary/i)).toBeVisible();
  });

  test('dark mode toggle works', async ({ page }) => {
    await page.goto('/');
    const lightBtn = page.getByText(/Light Mode/i);
    if (await lightBtn.isVisible()) {
      await lightBtn.click();
    }
    await expect(page.getByText(/Dark Mode/i)).toBeVisible();
  });

  test('games hub loads and shows options', async ({ page }) => {
    await page.goto('/');
    await page.getByText(/Games/i).first().click();
    await expect(page.getByText(/Educational Games/i)).toBeVisible();
    await expect(page.getByText(/Stock Market Simulator/i)).toBeVisible();
  });

  test('wealth building section accessible on learning pathways', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Wealth Building/i)).toBeVisible();
    await expect(page.getByText(/Credit Mastery/i)).toBeVisible();
  });
});
