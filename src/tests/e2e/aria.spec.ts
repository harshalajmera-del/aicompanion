import { test, expect } from '@playwright/test';

test.describe('Aria AI Travel Assistant — E2E', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the greeting message to appear
    await page.waitForSelector('[data-testid="message-bubble"]', { timeout: 10000 });
  });

  test('shows greeting message on load', async ({ page }) => {
    const messages = page.locator('[data-testid="message-bubble"]');
    await expect(messages.first()).toBeVisible();
    await expect(messages.first()).toContainText("Aria");
  });

  test('sidebar shows journey breadcrumbs', async ({ page }) => {
    await expect(page.locator('text=Discover')).toBeVisible();
    await expect(page.locator('text=Plan')).toBeVisible();
    await expect(page.locator('text=Flights')).toBeVisible();
  });

  test('user can type and send a message', async ({ page }) => {
    const input = page.locator('textarea[aria-label="Message input"]');
    await input.fill('I want to travel to Paris');
    await input.press('Enter');
    // Step 2: Aria should respond (3rd message = 2nd aria response)
    await page.locator('[data-testid="message-bubble"]').nth(2).waitFor({ timeout: 15000 });
  });

  test('quick reply chips are clickable', async ({ page }) => {
    // Wait for quick reply buttons
    const quickReply = page.locator('button').filter({ hasText: /Beach vacation|City break|Adventure/i }).first();
    await expect(quickReply).toBeVisible({ timeout: 8000 });
    await quickReply.click();
    // User message should appear with the chip value
    await expect(page.locator('.message-user').first()).toBeVisible({ timeout: 5000 });
  });

  test('send button is disabled when input is empty', async ({ page }) => {
    const sendBtn = page.locator('button[aria-label="Send message"]');
    await expect(sendBtn).toBeDisabled();
  });

  test('send button enables after typing', async ({ page }) => {
    const input = page.locator('textarea[aria-label="Message input"]');
    const sendBtn = page.locator('button[aria-label="Send message"]');
    await input.fill('Hello');
    await expect(sendBtn).toBeEnabled();
  });

  test('header shows current stage', async ({ page }) => {
    await expect(page.locator('header')).toBeVisible();
    // Should show initial stage
    await expect(page.locator('header')).toContainText(/Discover|Welcome/);
  });

  test('chat input supports multi-line with Shift+Enter', async ({ page }) => {
    const input = page.locator('textarea[aria-label="Message input"]');
    await input.fill('Line 1');
    await input.press('Shift+Enter');
    await input.type('Line 2');
    // Should NOT have sent yet
    const userMessages = page.locator('.message-user');
    await expect(userMessages).toHaveCount(0);
  });

  test('mobile: menu toggle shows sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const menuBtn = page.locator('button[aria-label="Toggle menu"]');
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await expect(page.locator('text=Your journey')).toBeVisible({ timeout: 3000 });
    }
  });

  test('full discovery flow: beach vacation suggestion', async ({ page }) => {
    const input = page.locator('textarea[aria-label="Message input"]');

    // Step 1: Express interest
    await input.fill('I want a beach vacation in Europe');
    await input.press('Enter');
    await page.waitForTimeout(3000);

    // Step 2: Aria responds with suggestions
    const ariaMessages = page.locator('.message-aria');
    await expect(ariaMessages.last()).toBeVisible();
  });

  test('page title is Aria', async ({ page }) => {
    await expect(page).toHaveTitle(/Aria/);
  });

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.reload();
    await page.waitForTimeout(2000);
    // Filter out known benign errors
    const realErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('hydration') &&
      !e.includes('Warning:'),
    );
    expect(realErrors).toHaveLength(0);
  });
});
