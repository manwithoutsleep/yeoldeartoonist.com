/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, Page } from '@playwright/test';

/**
 * Extended Playwright test with custom fixtures for cart and database setup
 */
export const test = base.extend<{
    clearCart: Page;
}>({
    /**
     * Fixture that clears the cart before each test
     */
    clearCart: async ({ page }, use) => {
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.removeItem('cart');
        });
        // Playwright fixture 'use' function (not a React Hook)
        await use(page);
    },
});

export { expect } from '@playwright/test';
