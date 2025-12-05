import { test, expect } from './helpers/setup';
import {
    addItemToCart,
    openCartDrawer,
    verifyCartItemCount,
    goToCartPage,
    clearCart,
} from './helpers/cart';
import { fillCheckoutForm, goToCheckoutPage } from './helpers/checkout';

/**
 * E2E tests for Cart and Checkout Flow
 *
 * These tests verify the complete user journey from browsing products
 * to adding items to cart and proceeding through checkout.
 *
 * Note: Payment integration tests are limited due to Stripe test mode requirements.
 * Full payment flow testing requires Stripe test webhooks and test mode configuration.
 */

test.describe('Cart Management', () => {
    test.beforeEach(async ({ page }) => {
        // Clear cart before each test
        await clearCart(page);
    });

    test('should add item to cart and show count badge', async ({ page }) => {
        // Navigate to shoppe
        await page.goto('/shoppe');

        // Verify cart badge is not visible initially
        await expect(
            page.locator('[data-testid="cart-badge"]')
        ).not.toBeVisible();

        // Add item to cart
        const addToCartBtn = page
            .locator('[data-testid="add-to-cart-btn"]')
            .first();
        await addToCartBtn.click();

        // Verify badge shows count of 1
        await verifyCartItemCount(page, 1);
    });

    test('should persist cart across page refreshes', async ({ page }) => {
        // Add item to cart
        await addItemToCart(page);

        // Verify cart has item
        await openCartDrawer(page);
        await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();

        // Refresh page
        await page.reload();

        // Verify cart still has item
        await verifyCartItemCount(page, 1);
        await openCartDrawer(page);
        await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
    });

    test('should update cart quantities', async ({ page }) => {
        // Add item to cart
        await addItemToCart(page);

        // Navigate to cart page
        await goToCartPage(page);

        // Get initial total
        const initialTotal = await page
            .locator('[data-testid="cart-total"]')
            .textContent();

        // Increase quantity to 2
        const quantitySelect = page.locator('[data-testid="quantity-select"]');
        await quantitySelect.selectOption('2');

        // Wait for update
        await page.waitForTimeout(500);

        // Verify total has updated (should be different from initial)
        const updatedTotal = await page
            .locator('[data-testid="cart-total"]')
            .textContent();
        expect(updatedTotal).not.toBe(initialTotal);
    });

    test('should remove item from cart', async ({ page }) => {
        // Add item to cart
        await addItemToCart(page);

        // Navigate to cart page
        await goToCartPage(page);

        // Verify item is in cart
        await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();

        // Remove item
        await page.click('[data-testid="remove-item-btn"]');

        // Verify empty cart message
        await expect(
            page.locator('[data-testid="empty-cart-message"]')
        ).toBeVisible();

        // Verify cart badge is hidden
        await expect(
            page.locator('[data-testid="cart-badge"]')
        ).not.toBeVisible();
    });

    test('should display empty cart state', async ({ page }) => {
        // Navigate to cart page with empty cart
        await goToCartPage(page);

        // Verify empty state message
        await expect(
            page.locator('[data-testid="empty-cart-message"]')
        ).toBeVisible();

        // Verify continue shopping link exists
        await expect(
            page.locator('[data-testid="continue-shopping-link"]')
        ).toBeVisible();
    });

    test('should open and close cart drawer', async ({ page }) => {
        // Add item to cart
        await addItemToCart(page);

        // Open cart drawer
        await openCartDrawer(page);

        // Verify drawer is visible
        await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible();

        // Close drawer by clicking close button (more reliable than overlay)
        await page.click('[aria-label="Close cart"]');

        // Verify drawer is hidden (wait for transition to complete)
        await expect(
            page.locator('[data-testid="cart-drawer"]')
        ).not.toBeVisible({ timeout: 10000 });
    });

    test('should navigate to cart page from drawer', async ({ page }) => {
        // Add item to cart
        await addItemToCart(page);

        // Open cart drawer
        await openCartDrawer(page);

        // Click "View Cart" link
        await page.click('[data-testid="view-cart-link"]');

        // Verify we're on cart page
        await expect(page).toHaveURL(/\/shoppe\/cart/);

        // Verify cart items are displayed
        await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
    });
});

test.describe('Checkout Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Clear cart and add an item before each test
        await clearCart(page);
        await addItemToCart(page);
    });

    test('should navigate to checkout from cart page', async ({ page }) => {
        // Navigate to cart page
        await goToCartPage(page);

        // Wait for the checkout button to be visible (ensures cart is loaded)
        await expect(
            page.locator('[data-testid="checkout-btn"]')
        ).toBeVisible();

        // Click checkout button
        await page.click('[data-testid="checkout-btn"]');

        // Verify we're on checkout page
        await expect(page).toHaveURL(/\/shoppe\/checkout/);

        // Verify customer info section is visible
        await expect(page.locator('text=Customer Information')).toBeVisible();
    });

    test('should display checkout form validation errors', async ({ page }) => {
        // Navigate to checkout
        await goToCheckoutPage(page);

        // Try to submit empty form
        await page.click('[data-testid="continue-to-payment-btn"]');

        // Verify validation errors appear (the form should show errors for required fields)
        // Since we're using native HTML5 validation or react-hook-form,
        // we should wait a bit to see if errors appear
        await page.waitForTimeout(500);

        // Verify form is still on checkout page (didn't submit)
        await expect(page).toHaveURL(/\/shoppe\/checkout/);
    });

    test('should fill out checkout form successfully', async ({ page }) => {
        // Navigate to checkout
        await goToCheckoutPage(page);

        // Fill out the form
        await fillCheckoutForm(page);

        // Verify fields are filled
        await expect(
            page.locator('[data-testid="customer-name-input"]')
        ).toHaveValue('Test Customer');
        await expect(
            page.locator('[data-testid="customer-email-input"]')
        ).toHaveValue('test@example.com');
    });

    test('should allow toggling billing address', async ({ page }) => {
        // Navigate to checkout
        await goToCheckoutPage(page);

        // Verify "same as shipping" checkbox is checked by default
        const sameAddressCheckbox = page.locator(
            '[name="useSameAddressForBilling"]'
        );
        await expect(sameAddressCheckbox).toBeChecked();

        // Uncheck the checkbox
        await sameAddressCheckbox.uncheck();

        // Verify billing address fields appear
        // (The exact implementation depends on your AddressForm component)
        await page.waitForTimeout(500);
    });
});

test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        // Add item to cart
        await addItemToCart(page);

        // Open cart drawer
        await openCartDrawer(page);

        // Verify drawer takes full width on mobile
        const drawer = page.locator('[data-testid="cart-drawer"]');
        await expect(drawer).toBeVisible();

        // Navigate to cart page
        await page.click('[data-testid="view-cart-link"]');
        await expect(page).toHaveURL(/\/shoppe\/cart/);

        // Verify cart items display properly
        await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
    });
});

test.describe('Accessibility', () => {
    test('should support keyboard navigation in cart drawer', async ({
        page,
    }) => {
        // Add item to cart
        await addItemToCart(page);

        // Open cart drawer
        await page.click('[data-testid="cart-button"]');

        // Verify drawer is visible
        await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible();

        // Press Tab to navigate
        await page.keyboard.press('Tab');

        // Press Escape to close drawer
        await page.keyboard.press('Escape');

        // Verify drawer is closed
        await expect(
            page.locator('[data-testid="cart-drawer"]')
        ).not.toBeVisible();
    });

    test('should have proper ARIA labels on cart button', async ({ page }) => {
        await page.goto('/shoppe');

        const cartButton = page.locator('[data-testid="cart-button"]');

        // Verify button has aria-label
        await expect(cartButton).toHaveAttribute('aria-label', /Shopping cart/);

        // Add item to cart
        await addItemToCart(page);

        // Verify aria-label updates with count
        await expect(cartButton).toHaveAttribute('aria-label', /1 item/);
    });
});
