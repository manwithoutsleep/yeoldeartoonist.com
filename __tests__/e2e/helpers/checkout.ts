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
 * Helper function to fill out the checkout form
 */
export async function fillCheckoutForm(page: Page, useSameAddress = true) {
    // Fill customer information
    await page.fill('[data-testid="customer-name-input"]', testCustomer.name);
    await page.fill('[data-testid="customer-email-input"]', testCustomer.email);

    // Fill shipping address
    await page.fill(
        '[name="shippingAddress.line1"]',
        testCustomer.address.line1
    );
    await page.fill('[name="shippingAddress.city"]', testCustomer.address.city);
    await page.fill(
        '[name="shippingAddress.state"]',
        testCustomer.address.state
    );
    await page.fill('[name="shippingAddress.zip"]', testCustomer.address.zip);

    // Handle billing address
    if (!useSameAddress) {
        await page.uncheck('[name="useSameAddressForBilling"]');
        // You can add billing address fields here if needed
    }
}

/**
 * Helper function to fill Stripe test card details
 * Note: This fills the Stripe Elements iframe which may require frame locator
 */
export async function fillStripeCardDetails(
    page: Page,
    cardNumber: string = '4242424242424242'
) {
    // Wait for Stripe Elements to load
    await page.waitForTimeout(2000);

    // Locate the Stripe iframe - Stripe Payment Element uses a unified iframe
    const stripeFrame = page
        .frameLocator('iframe[name^="__privateStripeFrame"]')
        .first();

    // Fill card number (if available as separate field in older versions)
    const cardNumberInput = stripeFrame.locator('[name="number"]');
    if (await cardNumberInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await cardNumberInput.fill(cardNumber);
    } else {
        // For unified Payment Element, just wait for it to be ready
        await stripeFrame
            .locator('[name="number"], input[placeholder*="number"]')
            .first()
            .waitFor({ timeout: 5000 })
            .catch(() => {});
    }
}

/**
 * Helper function to navigate to the checkout page
 */
export async function goToCheckoutPage(page: Page) {
    await page.goto('/shoppe/checkout');
}

/**
 * Helper function to verify we're on the success page
 */
export async function verifySuccessPage(page: Page) {
    await expect(page).toHaveURL(/\/shoppe\/checkout\/success/, {
        timeout: 15000,
    });
    await expect(page.locator('h1')).toContainText('Order Confirmed');
}
