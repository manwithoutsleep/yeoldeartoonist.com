# Phase 4-06: End-to-End Testing for Cart & Checkout

## Parent Specification

This is sub-task 06 of the parent specification: `phase-4-shopping-cart-checkout-00-coordinator.md`

## Objective

Create comprehensive end-to-end (E2E) tests that validate the complete cart-to-checkout-to-order flow, ensuring all Phase 4 components work together correctly and providing confidence in the shopping experience.

## Dependencies

**Prerequisites** (must be completed before this task):

- Task 05: Checkout Flow Integration (needs complete implementation to test)

**Blocks** (tasks that depend on this one):

- None - This is the final task in Phase 4

**Parallel Opportunities**:

- None - This task tests the integrated system from Task 05

## Scope

### In Scope

- E2E test for complete happy path (add to cart → checkout → payment → order)
- E2E test for cart management (add, update, remove items)
- E2E test for cart persistence across page refreshes
- E2E test for checkout form validation
- E2E test for payment success flow
- E2E test for payment failure/cancellation flow
- E2E test for inventory management (decrement after purchase)
- E2E test for empty cart state
- E2E test for responsive design (mobile/desktop)
- Performance testing for cart operations
- Accessibility testing for checkout flow

### Out of Scope

- Unit tests (covered in Tasks 01-05)
- Component integration tests (covered in Tasks 01-05)
- Load testing / stress testing
- Security penetration testing
- Email notification testing (Phase 5)
- Admin order management testing (Phase 3)

## Implementation Requirements

### Testing Framework

- Playwright or Cypress for E2E testing
- Test against local development server (localhost:3000)
- Mock Stripe test mode (use test cards)
- Mock database with test data
- Clean state before each test (reset cart, database)

### Test Environment Setup

- Seed database with test artwork products
- Use Stripe test mode with test cards
- Mock webhook events for deterministic tests
- Reset cart localStorage before each test
- Clean up test orders after tests complete

### Test Coverage Goals

- 100% coverage of critical user paths
- All major user interactions tested
- All error states tested
- Mobile and desktop responsive tests
- Accessibility (keyboard navigation, screen reader)

## Files to Create/Modify

### New Files

- `__tests__/e2e/cart-checkout.spec.ts` - Main E2E test suite
- `__tests__/e2e/helpers/setup.ts` - Test setup utilities
- `__tests__/e2e/helpers/cart.ts` - Cart test helpers
- `__tests__/e2e/helpers/checkout.ts` - Checkout test helpers
- `__tests__/e2e/fixtures/artwork.ts` - Test artwork data
- `playwright.config.ts` (or `cypress.config.ts`) - E2E test configuration

### Modified Files

- `package.json` - Add E2E test scripts
- `.gitignore` - Ignore E2E test artifacts

## Testing Requirements

### Happy Path Test (Complete Flow)

- [ ] Navigate to Shoppe page
- [ ] Add item to cart
- [ ] Verify cart button shows count badge
- [ ] Open cart drawer
- [ ] Verify item appears in drawer
- [ ] Navigate to cart page
- [ ] Verify item appears with correct details
- [ ] Click "Proceed to Checkout"
- [ ] Fill out customer information
- [ ] Fill out shipping address
- [ ] Toggle "same as shipping" for billing
- [ ] Click "Continue to Payment"
- [ ] Fill out Stripe test card details
- [ ] Submit payment
- [ ] Verify redirect to success page
- [ ] Verify order confirmation message
- [ ] Verify cart is cleared
- [ ] Verify order exists in database
- [ ] Verify inventory decremented

### Cart Management Tests

- [ ] Add multiple items to cart
- [ ] Update item quantity
- [ ] Verify cart total updates
- [ ] Remove item from cart
- [ ] Verify cart updates immediately
- [ ] Clear cart
- [ ] Verify empty state displays

### Cart Persistence Tests

- [ ] Add items to cart
- [ ] Refresh page
- [ ] Verify cart persists
- [ ] Navigate away and back
- [ ] Verify cart persists
- [ ] Close and reopen browser
- [ ] Verify cart persists (within localStorage TTL)

### Checkout Form Validation Tests

- [ ] Submit form with empty name
- [ ] Verify error message displays
- [ ] Submit form with invalid email
- [ ] Verify error message displays
- [ ] Submit form with incomplete address
- [ ] Verify error messages for all required fields
- [ ] Fill form correctly
- [ ] Verify errors clear

### Payment Success Flow Tests

- [ ] Complete checkout with test card 4242...
- [ ] Verify payment processes
- [ ] Verify redirect to success page
- [ ] Verify order number displayed
- [ ] Verify cart cleared

### Payment Failure Flow Tests

- [ ] Complete checkout with declined card (4000 0000 0000 0002)
- [ ] Verify error message displays
- [ ] Verify cart not cleared
- [ ] Verify order not created
- [ ] Verify can retry payment

### Inventory Management Tests

- [ ] Add item with limited stock (e.g., 2 available)
- [ ] Complete checkout for 1 item
- [ ] Verify inventory decremented to 1
- [ ] Attempt to purchase 2 more
- [ ] Verify out-of-stock error

### Empty Cart Tests

- [ ] Navigate to cart page with empty cart
- [ ] Verify empty state message
- [ ] Verify "Continue Shopping" link
- [ ] Attempt to navigate to checkout with empty cart
- [ ] Verify redirect to cart page

### Responsive Design Tests

- [ ] Run all tests on desktop viewport
- [ ] Run all tests on tablet viewport
- [ ] Run all tests on mobile viewport
- [ ] Verify mobile navigation works
- [ ] Verify touch interactions work

### Accessibility Tests

- [ ] Tab through entire checkout flow
- [ ] Verify all interactive elements keyboard accessible
- [ ] Verify form errors announced to screen readers
- [ ] Verify ARIA labels present
- [ ] Verify focus indicators visible
- [ ] Verify color contrast ratios

### Performance Tests

- [ ] Add item to cart completes in <100ms
- [ ] Cart page loads in <1s
- [ ] Checkout page loads in <2s
- [ ] Payment submission completes in <3s
- [ ] No memory leaks in cart operations

## Success Criteria

- [ ] All E2E tests pass consistently
- [ ] Happy path test covers complete flow
- [ ] All error states tested
- [ ] Cart persistence verified
- [ ] Payment integration verified end-to-end
- [ ] Inventory management verified
- [ ] Responsive design verified
- [ ] Accessibility standards met
- [ ] Performance benchmarks met
- [ ] Tests are deterministic (no flaky tests)
- [ ] Test suite runs in <5 minutes
- [ ] Test documentation complete
- [ ] CI/CD integration configured
- [ ] The verify-code skill has been successfully executed

## Implementation Notes

### Playwright Configuration

**File**: `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './__tests__/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
        },
    ],

    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
    },
});
```

### Test Setup Helpers

**File**: `__tests__/e2e/helpers/setup.ts`

```typescript
import { test as base } from '@playwright/test';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const test = base.extend({
    // Reset cart before each test
    async clearCart({ page }, use) {
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.removeItem('cart');
        });
        await use(page);
    },

    // Seed test data
    async seedDatabase({}, use) {
        const supabase = createServerSupabaseClient();

        // Insert test artwork
        await supabase.from('artwork').insert([
            {
                id: 'test-artwork-1',
                title: 'Test Art 1',
                slug: 'test-art-1',
                price: 50.0,
                inventory_count: 10,
                is_published: true,
            },
        ]);

        await use();

        // Clean up
        await supabase.from('artwork').delete().eq('id', 'test-artwork-1');
    },
});
```

### Happy Path E2E Test

**File**: `__tests__/e2e/cart-checkout.spec.ts`

```typescript
import { test, expect } from './helpers/setup';

test.describe('Cart to Checkout Flow', () => {
    test('should complete full purchase flow', async ({ page }) => {
        // 1. Navigate to shoppe
        await page.goto('/shoppe');
        await expect(page).toHaveTitle(/Shoppe/);

        // 2. Add item to cart
        await page.click('[data-testid="add-to-cart-btn"]');
        await expect(page.locator('[data-testid="cart-badge"]')).toContainText(
            '1'
        );

        // 3. View cart
        await page.click('[data-testid="cart-button"]');
        await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible();
        await page.click('[data-testid="view-cart-link"]');

        // 4. Proceed to checkout
        await expect(page).toHaveURL(/\/shoppe\/cart/);
        await page.click('[data-testid="checkout-btn"]');

        // 5. Fill checkout form
        await expect(page).toHaveURL(/\/shoppe\/checkout/);
        await page.fill('[name="customerName"]', 'Test Customer');
        await page.fill('[name="customerEmail"]', 'test@example.com');
        await page.fill('[name="shippingAddress.line1"]', '123 Test St');
        await page.fill('[name="shippingAddress.city"]', 'Test City');
        await page.fill('[name="shippingAddress.state"]', 'CA');
        await page.fill('[name="shippingAddress.zip"]', '12345');

        // 6. Submit for payment
        await page.click('[data-testid="continue-to-payment-btn"]');

        // 7. Fill Stripe payment (wait for Elements to load)
        const stripeFrame = page.frameLocator(
            'iframe[name^="__privateStripeFrame"]'
        );
        await stripeFrame
            .locator('[name="cardnumber"]')
            .fill('4242424242424242');
        await stripeFrame.locator('[name="exp-date"]').fill('12/34');
        await stripeFrame.locator('[name="cvc"]').fill('123');
        await stripeFrame.locator('[name="postal"]').fill('12345');

        // 8. Submit payment
        await page.click('[data-testid="pay-now-btn"]');

        // 9. Verify success
        await expect(page).toHaveURL(/\/shoppe\/checkout\/success/, {
            timeout: 10000,
        });
        await expect(page.locator('h1')).toContainText('Order Confirmed');

        // 10. Verify cart cleared
        await page.goto('/shoppe/cart');
        await expect(
            page.locator('[data-testid="empty-cart-message"]')
        ).toBeVisible();
    });

    test('should handle payment failure gracefully', async ({ page }) => {
        // ... setup cart and checkout ...

        // Use declined test card
        const stripeFrame = page.frameLocator(
            'iframe[name^="__privateStripeFrame"]'
        );
        await stripeFrame
            .locator('[name="cardnumber"]')
            .fill('4000000000000002');
        // ... fill other fields ...

        await page.click('[data-testid="pay-now-btn"]');

        // Verify error message
        await expect(
            page.locator('[data-testid="payment-error"]')
        ).toContainText('Your card was declined');

        // Verify cart not cleared
        await page.goto('/shoppe/cart');
        await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
    });
});

test.describe('Cart Management', () => {
    test('should persist cart across page refreshes', async ({ page }) => {
        await page.goto('/shoppe');
        await page.click('[data-testid="add-to-cart-btn"]');

        // Verify cart has item
        await page.click('[data-testid="cart-button"]');
        await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();

        // Refresh page
        await page.reload();

        // Verify cart still has item
        await page.click('[data-testid="cart-button"]');
        await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
    });

    test('should update cart quantities', async ({ page }) => {
        await page.goto('/shoppe');
        await page.click('[data-testid="add-to-cart-btn"]');

        await page.goto('/shoppe/cart');

        // Increase quantity
        await page.selectOption('[data-testid="quantity-select"]', '3');

        // Verify total updates
        await expect(page.locator('[data-testid="cart-total"]')).toContainText(
            '$150'
        ); // 3 x $50
    });
});
```

### Cart Test Helpers

**File**: `__tests__/e2e/helpers/cart.ts`

```typescript
import { Page, expect } from '@playwright/test';

export async function addItemToCart(page: Page, itemIndex: number = 0) {
    await page.goto('/shoppe');
    const addToCartBtns = page.locator('[data-testid="add-to-cart-btn"]');
    await addToCartBtns.nth(itemIndex).click();
    await expect(page.locator('[data-testid="cart-badge"]')).toBeVisible();
}

export async function openCartDrawer(page: Page) {
    await page.click('[data-testid="cart-button"]');
    await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible();
}

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
```

### Add Test Scripts to package.json

```json
{
    "scripts": {
        "test:e2e": "playwright test",
        "test:e2e:ui": "playwright test --ui",
        "test:e2e:debug": "playwright test --debug"
    }
}
```

## Notes

- E2E tests require local dev server running (`npm run dev`)
- Use Playwright's built-in retry mechanism for flaky network requests
- Mock Stripe webhooks in test environment for deterministic results
- Consider using Playwright's `test.beforeEach` for common setup
- Use `data-testid` attributes for stable selectors (don't rely on CSS classes)
- Run E2E tests in CI/CD pipeline before deploying
- Consider visual regression testing with Playwright screenshots
- Keep E2E tests fast (<5 min total) by running in parallel
- Document how to run tests locally in TESTING.md
- Consider adding E2E tests to pre-commit hooks (optional, may be slow)
