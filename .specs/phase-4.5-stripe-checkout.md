# Phase 4.5: Migrate to Stripe Checkout

## Overview

Migrate from custom checkout flow to Stripe's hosted Checkout solution to:

- Enable automatic tax calculation (Stripe Tax works out-of-the-box)
- Reduce code complexity (~730 lines → ~100 lines)
- Improve security and PCI compliance
- Leverage Stripe's battle-tested checkout UX

**Estimated Effort:** 2-3 hours

**Branch:** `phase-4.5-stripe-checkout`

---

## Current State

### What Exists ✅

- Custom checkout flow with manual forms
- Cart context with localStorage persistence
- Order creation via webhook
- Success/cancelled pages
- Webhook handler for `payment_intent.succeeded`

### Current Implementation Files

```
src/
├── components/
│   └── checkout/
│       ├── CheckoutForm.tsx          (~300 lines) ❌ TO BE REMOVED
│       ├── PaymentForm.tsx           (~150 lines) ❌ TO BE REMOVED
│       ├── AddressForm.tsx           (~100 lines) ❌ TO BE REMOVED
│       └── CheckoutProvider.tsx      (~50 lines)  ❌ TO BE REMOVED
├── app/
│   ├── shoppe/
│   │   └── checkout/
│   │       ├── page.tsx              (~80 lines)  ❌ TO BE REMOVED
│   │       ├── success/page.tsx      (keep, modify)
│   │       └── cancelled/page.tsx    (keep, as-is)
│   └── api/
│       └── checkout/
│           ├── route.ts              (~180 lines) ❌ TO BE REPLACED
│           └── webhook/route.ts      (keep, modify)
└── lib/
    └── payments/stripe.ts            (keep, simplify)
```

**Total lines to remove:** ~730 lines
**Total lines to add:** ~100 lines

---

## Proposed Solution: Stripe Checkout

### What Will Change

1. **Replace custom checkout** with Stripe Checkout Session
2. **Simplify payment flow**: Cart → Stripe hosted page → Success
3. **Automatic tax calculation** via Stripe Tax (no custom code)
4. **Webhook updates** to handle `checkout.session.completed` event

### New Implementation Files

```
src/
├── app/
│   ├── shoppe/
│   │   └── checkout/
│   │       └── success/page.tsx      (modified to use session_id)
│   └── api/
│       └── checkout/
│           ├── session/route.ts      (~80 lines)  ✅ NEW
│           └── webhook/route.ts      (modified)   ✅ UPDATED
└── lib/
    └── payments/stripe.ts            (simplified)  ✅ UPDATED
```

---

## Implementation Plan

### TDD Approach

All changes follow Test-Driven Development:

1. **Red**: Write failing test
2. **Green**: Implement minimal code to pass
3. **Refactor**: Improve code quality
4. **Verify**: Run verify-code skill (TypeScript, ESLint, Prettier, tests, build)

### Code Quality Gates

Every change must pass:

- ✅ TypeScript compilation (`npx tsc --noEmit`)
- ✅ ESLint with 0 warnings (`npm run lint`)
- ✅ Prettier formatting (`npm run format:check`)
- ✅ All tests passing (`npm test`)
- ✅ Production build (`npm run build`)

---

## Phase Breakdown

### Phase 1: Setup & Planning ✅

**Goal:** Create branch, document approach, finalize plan

**Tasks:**

- [x] Create `.specs/phase-4.5-stripe-checkout.md`
- [x] Create branch `phase-4.5-stripe-checkout`
- [x] Review plan with user
- [x] Finalize implementation details

**Estimated Time:** 30 minutes

---

### Phase 2: Create Stripe Checkout Session API (TDD) ✅

**Goal:** Replace `/api/checkout` with `/api/checkout/session`

#### 2.1: Write Tests (RED)

**File:** `__tests__/app/api/checkout/session/route.test.ts`

**Test Cases:**

```typescript
describe('POST /api/checkout/session', () => {
    it('creates a Stripe Checkout session', async () => {
        // Verify session is created with correct parameters
    });

    it('includes line items from cart', async () => {
        // Verify all cart items are in session
    });

    it('enables automatic tax calculation', async () => {
        // Verify automatic_tax.enabled = true
    });

    it('sets correct success/cancel URLs', async () => {
        // Verify redirect URLs are correct
    });

    it('validates cart server-side', async () => {
        // Verify cart validation happens before session creation
    });

    it('returns session URL to client', async () => {
        // Verify response contains { url: string }
    });

    it('handles invalid cart items', async () => {
        // Test error handling for invalid items
    });

    it('stores metadata for order creation', async () => {
        // Verify session metadata includes order details
    });
});
```

**Expected Result:** All tests FAIL (no implementation yet)

#### 2.2: Implement Session Creation (GREEN)

**File:** `src/app/api/checkout/session/route.ts`

**Implementation:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { stripe } from '@/lib/payments/stripe';
import { validateCart } from '@/lib/cart/validation';

const CheckoutSessionSchema = z.object({
    items: z.array(
        z.object({
            artworkId: z.string().uuid(),
            title: z.string(),
            price: z.number().positive(),
            quantity: z.number().int().positive(),
            slug: z.string(),
        })
    ),
    customerEmail: z.string().email().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = CheckoutSessionSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { items, customerEmail } = parsed.data;

        // Validate cart server-side
        const validatedCart = await validateCart(items);

        if (!validatedCart.isValid) {
            return NextResponse.json(
                {
                    error: 'Cart validation failed',
                    details: validatedCart.errors,
                },
                { status: 400 }
            );
        }

        // Create Stripe Checkout Session
        const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            success_url: `${baseUrl}/shoppe/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/shoppe/cart`,
            customer_email: customerEmail,
            line_items: validatedCart.items.map((item) => ({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.title,
                    },
                    unit_amount: Math.round(item.price * 100), // Convert to cents
                },
                quantity: item.quantity,
            })),
            // Add shipping as a separate line item
            shipping_options: [
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: 500, // $5.00 flat rate
                            currency: 'usd',
                        },
                        display_name: 'Standard Shipping',
                    },
                },
            ],
            automatic_tax: {
                enabled: true,
            },
            shipping_address_collection: {
                allowed_countries: ['US'],
            },
            billing_address_collection: 'required',
            metadata: {
                // Store cart data for webhook processing
                cartItems: JSON.stringify(
                    validatedCart.items.map((item) => ({
                        artworkId: item.artworkId,
                        quantity: item.quantity,
                        price: item.price,
                    }))
                ),
            },
        });

        return NextResponse.json({ url: session.url }, { status: 200 });
    } catch (error) {
        console.error('Checkout session creation error:', error);
        return NextResponse.json(
            {
                error: 'Failed to create checkout session',
                message:
                    error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
```

**Expected Result:** All tests PASS

#### 2.3: Refactor & Verify

- Add JSDoc documentation
- Extract constants (URLs, shipping cost)
- Run verify-code skill

**Expected Result:** All quality checks pass

**Estimated Time:** 1 hour

---

### Phase 3: Update Webhook Handler (TDD) ✅

**Goal:** Handle `checkout.session.completed` event instead of `payment_intent.succeeded`

#### 3.1: Write Tests (RED)

**File:** `__tests__/app/api/checkout/webhook/route.test.ts`

**New Test Cases:**

```typescript
describe('POST /api/checkout/webhook - Checkout Session', () => {
    it('handles checkout.session.completed event', async () => {
        // Verify event is processed
    });

    it('creates order from session metadata', async () => {
        // Verify order is created with correct data
    });

    it('extracts tax amount from session', async () => {
        // Verify tax is read from session.total_details.amount_tax
    });

    it('extracts shipping address from session', async () => {
        // Verify shipping address is extracted correctly
    });

    it('extracts billing address from session', async () => {
        // Verify billing address is extracted correctly
    });

    it('handles sessions without customer email', async () => {
        // Test optional email field
    });

    it('prevents duplicate order creation', async () => {
        // Idempotency check using session_id
    });
});
```

**Expected Result:** Tests FAIL (webhook doesn't handle session events yet)

#### 3.2: Implement Session Handling (GREEN)

**File:** `src/app/api/checkout/webhook/route.ts`

**Changes:**

```typescript
// Add new event handler
case 'checkout.session.completed': {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log('Checkout session completed:', {
        sessionId: session.id,
        amount: session.amount_total,
        customer: session.customer_email,
    });

    // Check for duplicate order
    const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('payment_intent_id', session.payment_intent as string)
        .single();

    if (existingOrder) {
        console.log('Order already exists for session:', session.id);
        return NextResponse.json({ received: true }, { status: 200 });
    }

    // Parse metadata
    const cartItems = JSON.parse(session.metadata?.cartItems || '[]');

    // Extract tax from session
    const taxAmountCents = session.total_details?.amount_tax || 0;
    const taxAmount = taxAmountCents / 100;

    // Extract addresses
    const shippingAddress: Address = {
        line1: session.shipping_details?.address?.line1 || '',
        line2: session.shipping_details?.address?.line2,
        city: session.shipping_details?.address?.city || '',
        state: session.shipping_details?.address?.state || '',
        zip: session.shipping_details?.address?.postal_code || '',
        country: session.shipping_details?.address?.country || 'US',
    };

    const billingAddress: Address = {
        line1: session.customer_details?.address?.line1 || '',
        line2: session.customer_details?.address?.line2,
        city: session.customer_details?.address?.city || '',
        state: session.customer_details?.address?.state || '',
        zip: session.customer_details?.address?.postal_code || '',
        country: session.customer_details?.address?.country || 'US',
    };

    // Calculate totals
    const amountTotal = (session.amount_total || 0) / 100;
    const shippingCost = (session.total_details?.amount_shipping || 0) / 100;
    const subtotal = amountTotal - taxAmount - shippingCost;

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order
    const { data: order, error: orderError } = await createOrder({
        orderNumber,
        customerName: session.shipping_details?.name || session.customer_details?.name || 'Unknown',
        customerEmail: session.customer_email || session.customer_details?.email || '',
        shippingAddress,
        billingAddress,
        orderNotes: undefined,
        subtotal,
        shippingCost,
        taxAmount,
        total: amountTotal,
        paymentIntentId: session.payment_intent as string,
        paymentStatus: 'succeeded',
        items: cartItems.map((item: { artworkId: string; quantity: number; price: number }) => ({
            artworkId: item.artworkId,
            quantity: item.quantity,
            priceAtPurchase: item.price,
            lineSubtotal: item.price * item.quantity,
        })),
    });

    if (orderError) {
        console.error('Failed to create order from session:', orderError);
    } else {
        console.log('Order created from session:', {
            orderId: order?.id,
            orderNumber: order?.orderNumber,
        });
    }

    break;
}
```

**Expected Result:** All tests PASS

#### 3.3: Refactor & Verify

- Extract address parsing to helper function
- Add error handling for missing fields
- Run verify-code skill

**Expected Result:** All quality checks pass

**Estimated Time:** 45 minutes

---

### Phase 4: Update Cart Page (TDD)

**Goal:** Redirect to Stripe Checkout instead of internal checkout page

#### 4.1: Write Tests (RED)

**File:** `__tests__/app/shoppe/cart/page.test.tsx`

**New Test Cases:**

```typescript
describe('Cart Page - Stripe Checkout', () => {
    it('shows "Proceed to Checkout" button', async () => {
        // Verify button is visible
    });

    it('calls /api/checkout/session on checkout', async () => {
        // Mock API and verify it's called
    });

    it('redirects to Stripe Checkout URL', async () => {
        // Verify window.location.href is set to session.url
    });

    it('handles checkout session creation errors', async () => {
        // Verify error is displayed to user
    });

    it('disables button while creating session', async () => {
        // Verify loading state
    });
});
```

**Expected Result:** Tests FAIL

#### 4.2: Implement Checkout Redirect (GREEN)

**File:** `src/app/shoppe/cart/page.tsx`

**Changes:**

```typescript
const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
        const response = await fetch('/api/checkout/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: cart.items,
                customerEmail: undefined, // Optional: can pre-fill if user is logged in
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.error || 'Failed to create checkout session'
            );
        }

        const { url } = await response.json();

        // Redirect to Stripe Checkout
        window.location.href = url;
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
    }
};
```

**Expected Result:** All tests PASS

#### 4.3: Refactor & Verify

- Extract error handling
- Add loading state UI
- Run verify-code skill

**Expected Result:** All quality checks pass

**Estimated Time:** 30 minutes

---

### Phase 5: Update Success Page (TDD)

**Goal:** Fetch order details using `session_id` instead of `payment_intent`

#### 5.1: Write Tests (RED)

**File:** `__tests__/app/shoppe/checkout/success/page.test.tsx`

**New Test Cases:**

```typescript
describe('Success Page - Stripe Checkout', () => {
    it('fetches session details using session_id', async () => {
        // Verify API call with session_id
    });

    it('displays order confirmation', async () => {
        // Verify order details are shown
    });

    it('shows order number', async () => {
        // Verify order number is displayed
    });

    it('handles missing session_id', async () => {
        // Error handling
    });

    it('clears cart after successful order', async () => {
        // Verify cart is cleared
    });
});
```

**Expected Result:** Tests FAIL

#### 5.2: Implement Session Retrieval (GREEN)

**File:** `src/app/shoppe/checkout/success/page.tsx`

**Changes:**

```typescript
// Add API route to fetch session details
// src/app/api/checkout/session/[sessionId]/route.ts

export async function GET(
    request: NextRequest,
    { params }: { params: { sessionId: string } }
) {
    try {
        const session = await stripe.checkout.sessions.retrieve(
            params.sessionId
        );

        // Find order by payment_intent_id
        const { data: order } = await getOrderByPaymentIntentId(
            session.payment_intent as string
        );

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ order }, { status: 200 });
    } catch (error) {
        console.error('Session retrieval error:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve session' },
            { status: 500 }
        );
    }
}
```

**Update success page to use session_id:**

```typescript
const searchParams = useSearchParams();
const sessionId = searchParams.get('session_id');

useEffect(() => {
    if (sessionId) {
        fetch(`/api/checkout/session/${sessionId}`)
            .then((res) => res.json())
            .then((data) => setOrder(data.order));
    }
}, [sessionId]);
```

**Expected Result:** All tests PASS

#### 5.3: Refactor & Verify

- Add loading states
- Error handling for failed session retrieval
- Run verify-code skill

**Expected Result:** All quality checks pass

**Estimated Time:** 30 minutes

---

### Phase 6: Cleanup Old Code

**Goal:** Remove unused checkout components and routes

#### 6.1: Remove Files

**Files to delete:**

```
src/components/checkout/CheckoutForm.tsx
src/components/checkout/PaymentForm.tsx
src/components/checkout/AddressForm.tsx
src/components/checkout/CheckoutProvider.tsx
src/app/shoppe/checkout/page.tsx
src/app/api/checkout/route.ts
```

#### 6.2: Remove Tests

**Test files to delete:**

```
__tests__/components/checkout/CheckoutForm.test.tsx
__tests__/components/checkout/PaymentForm.test.tsx
__tests__/components/checkout/AddressForm.test.tsx
__tests__/app/shoppe/checkout/page.test.tsx
__tests__/app/api/checkout/route.test.ts
```

#### 6.3: Update Imports

Remove any imports referencing deleted files:

- Check `src/app/shoppe/checkout/layout.tsx`
- Check any other files importing checkout components

#### 6.4: Verify

- Run full test suite (`npm test`)
- Run build (`npm run build`)
- Verify no broken imports

**Estimated Time:** 15 minutes

---

### Phase 7: Update Stripe Tax Configuration Helper

**Goal:** Simplify `createPaymentIntentWithTax` or remove if unused

#### 7.1: Analysis

Check if `createPaymentIntentWithTax` is still used after migration:

- Used by: ~~`/api/checkout/route.ts`~~ (deleted)
- If not used elsewhere: delete it
- If used elsewhere: keep and document

#### 7.2: Update or Remove

**Option A: Delete** (if unused)

```bash
# Remove from stripe.ts
```

**Option B: Simplify** (if still needed)

```typescript
// Keep only basic createPaymentIntent without tax logic
```

#### 7.3: Verify

- Run verify-code skill
- Ensure no broken references

**Estimated Time:** 15 minutes

---

### Phase 8: Environment Variable Updates

**Goal:** Add `NEXT_PUBLIC_URL` for Stripe Checkout redirect URLs

#### 8.1: Update `.env.example`

```bash
# Stripe Checkout
NEXT_PUBLIC_URL="http://localhost:3000"  # Change to production URL for deployment
```

#### 8.2: Update `.env.local`

Add the environment variable locally for testing.

#### 8.3: Document

Update `CLAUDE.md` with new environment variable requirement.

**Estimated Time:** 5 minutes

---

### Phase 9: End-to-End Testing

**Goal:** Verify complete checkout flow works end-to-end

#### 9.1: Manual Testing

Test the complete flow:

1. Add items to cart
2. Click "Proceed to Checkout"
3. Fill out Stripe Checkout form
4. Use test card: `4242 4242 4242 4242`
5. Verify redirect to success page
6. Verify order appears in database
7. Verify tax is calculated correctly
8. Verify cart is cleared

#### 9.2: E2E Test Updates

**File:** `__tests__/e2e/cart-checkout.spec.ts`

Update E2E tests to handle Stripe Checkout redirect:

```typescript
test('should complete checkout via Stripe Checkout', async ({ page }) => {
    // Add item to cart
    await addItemToCart(page);

    // Go to cart
    await goToCartPage(page);

    // Click checkout (will redirect to Stripe)
    await page.click('[data-testid="checkout-btn"]');

    // Wait for Stripe Checkout page
    await page.waitForURL(/checkout\.stripe\.com/);

    // Note: Full Stripe Checkout testing requires Stripe test environment
    // For now, verify redirect happens correctly
    expect(page.url()).toContain('checkout.stripe.com');
});
```

**Note:** Full E2E testing with Stripe Checkout requires Stripe test mode configuration.

**Estimated Time:** 30 minutes

---

## Success Criteria

### Functional Requirements

- [ ] Users can initiate checkout from cart page
- [ ] Stripe Checkout session is created with correct line items
- [ ] Tax is calculated automatically by Stripe Tax
- [ ] Shipping address is collected
- [ ] Billing address is collected
- [ ] Payment succeeds with test card
- [ ] Order is created in database after payment
- [ ] Success page displays order details
- [ ] Cart is cleared after successful checkout
- [ ] Webhook processes `checkout.session.completed` event

### Technical Requirements

- [ ] All TypeScript types are correct (no `any`, no errors)
- [ ] ESLint passes with 0 warnings
- [ ] All code formatted with Prettier
- [ ] All tests pass (unit + integration + E2E)
- [ ] Production build succeeds
- [ ] Test coverage maintained (>80%)
- [ ] No console errors in browser
- [ ] verify-code skill passes for all modified files

### Code Quality

- [ ] ~630 lines of code removed (old checkout components)
- [ ] ~100 lines of code added (Stripe Checkout session)
- [ ] Net reduction: ~530 lines
- [ ] Simplified architecture
- [ ] Improved maintainability

### Security Requirements

- [ ] Cart validation still occurs server-side
- [ ] Webhook signature verification working
- [ ] Order totals calculated by Stripe (not client)
- [ ] Idempotency prevents duplicate orders
- [ ] No PCI compliance issues

---

## Rollback Strategy

### Git Strategy

- Work in branch: `phase-4.5-stripe-checkout`
- Create PR against `main`
- If issues discovered: revert PR merge
- Keep old code in git history for reference

### Critical Issues Requiring Rollback

- Stripe Checkout not creating orders
- Tax calculation failures
- Webhook not processing sessions
- Payment processing errors

### Non-Critical Issues (Fix Forward)

- UI/UX improvements
- Error message clarity
- Performance optimizations

---

## Notes

### Stripe Tax Requirements

For Stripe Tax to work in production:

1. Activate Stripe Tax in Dashboard
2. Register for tax collection in applicable states
3. Configure tax codes for products (default: `txcd_99999999` for general goods)

### Testing in Development

- Use Stripe CLI for webhook forwarding: `stripe listen --forward-to localhost:3000/api/checkout/webhook`
- Update webhook secret in `.env.local` with CLI-provided secret
- Test mode automatically enabled with test API keys

### Migration Path

This is a **non-breaking change** if done in a feature branch:

- Old checkout still works in `main`
- New Stripe Checkout in `phase-4.5-stripe-checkout`
- Switch over happens on PR merge
- Can revert if needed

### Future Enhancements

After Stripe Checkout is stable:

- Add order notes field (custom field in Stripe Checkout)
- Support multiple shipping options
- Add coupon/discount codes
- Enable more payment methods (Apple Pay, Google Pay, etc.)

---

## Commit Message Template

```
feat: Migrate to Stripe Checkout for automatic tax calculation

Replace custom checkout flow with Stripe's hosted Checkout solution:

- Add /api/checkout/session endpoint to create Checkout sessions
- Update webhook to handle checkout.session.completed events
- Modify cart page to redirect to Stripe Checkout
- Update success page to retrieve order via session_id
- Remove custom checkout components (~630 lines deleted)
- Enable automatic tax calculation via Stripe Tax
- Simplify payment flow and improve security

BREAKING CHANGE: Checkout now redirects to checkout.stripe.com

This fixes tax calculation issues and reduces code complexity by 85%.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Review Checklist

Before merging:

- [ ] All tests pass
- [ ] Manual testing completed
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Environment variables documented
- [ ] Webhook endpoint verified
- [ ] Tax calculation verified
- [ ] Order creation verified
- [ ] No regression in existing features
- [ ] Performance acceptable
- [ ] Error handling robust
- [ ] Rollback plan documented
