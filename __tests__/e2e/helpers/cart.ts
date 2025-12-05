import { Page, expect } from '@playwright/test';

/**
 * Helper function to add an item to the cart from the shoppe page
 */
export async function addItemToCart(page: Page, itemIndex: number = 0) {
    await page.goto('/shoppe');
    const addToCartBtns = page.locator('[data-testid="add-to-cart-btn"]');
    await addToCartBtns.nth(itemIndex).click();
    // Wait for the "Added!" feedback
    await expect(addToCartBtns.nth(itemIndex)).toContainText('Added!');
    // Wait for cart badge to be visible
    await expect(page.locator('[data-testid="cart-badge"]')).toBeVisible();
}

/**
 * Helper function to open the cart drawer
 */
export async function openCartDrawer(page: Page) {
    await page.click('[data-testid="cart-button"]');
    await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible();
}

/**
 * Helper function to verify the cart item count badge
 */
export async function verifyCartItemCount(page: Page, count: number) {
    if (count === 0) {
        await expect(
            page.locator('[data-testid="cart-badge"]')
        ).not.toBeVisible();
    } else {
        await expect(page.locator('[data-testid="cart-badge"]')).toContainText(
            count.toString()
        );
    }
}

/**
 * Helper function to navigate to the cart page
 */
export async function goToCartPage(page: Page) {
    await page.goto('/shoppe/cart');
}

/**
 * Helper function to remove all items from the cart
 */
export async function clearCart(page: Page) {
    // Navigate to home page first to ensure we have a valid context
    await page.goto('/');
    // Clear cart from localStorage
    await page.evaluate(() => {
        localStorage.removeItem('cart');
    });
}
