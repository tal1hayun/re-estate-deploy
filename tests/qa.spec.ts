import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads without crashing', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    const res = await page.goto('/');
    expect(res?.status()).toBeLessThan(500);

    // Visible content
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveTitle(/.+/);

    // No console errors
    expect(errors, `Console errors: ${errors.join(', ')}`).toHaveLength(0);
  });

  test('renders hero text and CTA buttons', async ({ page }) => {
    await page.goto('/');
    // Main heading visible
    await expect(page.locator('h1').first()).toBeVisible();
    // At least one button/link
    const cta = page.locator('a, button').first();
    await expect(cta).toBeVisible();
  });
});

test.describe('Public routes', () => {
  test('/org/[id] — unknown org shows error state gracefully', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    const res = await page.goto('/org/nonexistent-org-id');
    expect(res?.status()).toBeLessThan(500);
    // Wait for client-side render to complete (spinner disappears, content appears)
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
    expect(errors, `Page crashed: ${errors.join(', ')}`).toHaveLength(0);

    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(10);
  });

  test('/invite/[token] — invalid token shows error state gracefully', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    const res = await page.goto('/invite/invalid-token');
    expect(res?.status()).toBeLessThan(500);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
    expect(errors, `Page crashed: ${errors.join(', ')}`).toHaveLength(0);

    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(10);
  });

  test('/client/[token] — invalid token shows error state gracefully', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    const res = await page.goto('/client/invalid-token');
    expect(res?.status()).toBeLessThan(500);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
    expect(errors, `Page crashed: ${errors.join(', ')}`).toHaveLength(0);

    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(10);
  });
});

test.describe('Auth redirect', () => {
  test('/dashboard redirects unauthenticated users to homepage', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/dashboard');
    // Should end up at / (redirected by agent layout)
    await page.waitForURL('/', { timeout: 5000 });
    await expect(page.locator('body')).toBeVisible();
    expect(errors, `Page crashed: ${errors.join(', ')}`).toHaveLength(0);
  });

  test('/home redirects unauthenticated users to homepage', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/home');
    // Should end up at / (redirected by InternalHomePage auth guard)
    await page.waitForURL('/', { timeout: 5000 });
    await expect(page.locator('body')).toBeVisible();
    expect(errors, `Page crashed: ${errors.join(', ')}`).toHaveLength(0);
  });
});
