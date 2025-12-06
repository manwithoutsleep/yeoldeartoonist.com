import { Page, expect } from '@playwright/test';

/**
 * Test customer information
 */
export const testCustomer = {
    name: 'Test Customer',
    email: 'test@example.com',
    address: {
        line1: '123 Test St',
        city: 'Test City',
        state: 'CA',
        zip: '12345',
        country: 'US',
    },
};

/**
 * Helper function to verify we're on the success page
 */
export async function verifySuccessPage(page: Page) {
    await expect(page).toHaveURL(/\/shoppe\/checkout\/success/, {
        timeout: 15000,
    });
    await expect(page.locator('h1')).toContainText('Order Confirmed');
}
