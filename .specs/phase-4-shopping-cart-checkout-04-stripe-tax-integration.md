# Phase 4-04B: Stripe Tax Integration

## Parent Specification

This extends sub-task 04 of the parent specification: `phase-4-shopping-cart-checkout-00-coordinator.md`

## Objective

Integrate Stripe Tax API to automatically calculate sales tax based on customer shipping address during checkout. Replace the placeholder "Tax: Calculated at checkout" with actual tax calculations.

## Current State

**Problem**: Tax is currently hardcoded to $0.00 throughout the checkout flow:

- Cart validation returns `taxAmount: 0`
- Order summary displays "Tax: Calculated at checkout" placeholder
- Payment totals exclude tax
- Orders are created with `tax_amount: 0` in database

**What We Have**:

- ✅ Complete address collection (shipping + billing addresses)
- ✅ Address fields: line1, line2, city, state, zip, country
- ✅ Infrastructure ready (database columns, types, data flow)
- ✅ Stripe integration in place

**What's Missing**:

- ❌ Stripe Tax API integration
- ❌ Tax calculation during PaymentIntent creation
- ❌ Tax display in order summary
- ❌ Tax extraction from PaymentIntent in webhook

## Business Context

- **Business Location**: United States
- **Tax Registration**: Not yet registered in any states (Stripe Tax will calculate but compliance required for collection)
- **Product Type**: Mix of physical artwork and digital products
- **Tax Approach**: Use Stripe Tax API for automatic calculation

## Implementation Approach: Test-Driven Development

This implementation will follow strict TDD principles:

1. **Red**: Write failing tests first
2. **Green**: Write minimal code to pass tests
3. **Refactor**: Improve code while keeping tests green
4. **Verify**: Run verify-code skill to ensure code quality
5. **Repeat**: Move to next phase

### Code Quality Verification

The **verify-code skill** will be used throughout implementation to ensure:

- ✅ TypeScript compilation (tsc)
- ✅ ESLint compliance (no errors or warnings)
- ✅ Prettier formatting
- ✅ All tests pass (Vitest)
- ✅ Test coverage meets thresholds

**When to run verify-code**:

- After completing each phase's refactor step
- Before moving to the next phase
- After any significant code changes
- Before committing code

This ensures we catch issues early and maintain high code quality throughout the TDD process.

## Phase 1: Stripe Tax Utilities (TDD)

### Phase 1a: Write Tests First ✅ RED

**File**: `__tests__/lib/payments/stripe.test.ts`

Add the following test cases:

```typescript
describe('createPaymentIntentWithTax', () => {
    it('creates PaymentIntent with automatic_tax enabled', async () => {
        // Test that automatic_tax.enabled = true
    });

    it('includes shipping address for tax calculation', async () => {
        // Test that address details are included
    });

    it('returns tax amount from PaymentIntent', async () => {
        // Test that tax amount is extracted and returned
    });

    it('handles addresses in tax-free states', async () => {
        // Test OR, NH, MT, DE, AK return $0 tax
    });

    it('handles addresses in high-tax states', async () => {
        // Test CA, NY return appropriate tax
    });

    it('handles invalid addresses gracefully', async () => {
        // Test error handling for bad addresses
    });

    it('uses correct product tax code for physical goods', async () => {
        // Test tax_code is set appropriately
    });
});
```

**Expected Result**: All tests FAIL (no implementation yet)

### Phase 1b: Implement ✅ GREEN

**File**: `src/lib/payments/stripe.ts`

Add new function:

```typescript
export interface PaymentIntentWithTaxResult {
    paymentIntent: Stripe.PaymentIntent;
    taxAmount: number; // In dollars
    total: number; // In dollars
}

export async function createPaymentIntentWithTax(
    amount: number,
    shippingAddress: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
    },
    metadata: Record<string, string> = {}
): Promise<PaymentIntentWithTaxResult> {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        metadata,
        automatic_payment_methods: {
            enabled: true,
        },
        automatic_tax: {
            enabled: true,
        },
        shipping: {
            name: metadata.customerName || 'Customer',
            address: {
                line1: shippingAddress.line1,
                line2: shippingAddress.line2,
                city: shippingAddress.city,
                state: shippingAddress.state,
                postal_code: shippingAddress.postal_code,
                country: shippingAddress.country,
            },
        },
    });

    // Extract tax amount (in cents, convert to dollars)
    const taxAmountCents = paymentIntent.automatic_tax?.amount ?? 0;
    const taxAmount = taxAmountCents / 100;
    const total = amount + taxAmount;

    return {
        paymentIntent,
        taxAmount,
        total,
    };
}
```

**Expected Result**: All tests PASS

### Phase 1c: Refactor ✅ REFACTOR

- Add JSDoc documentation
- Extract address formatting if needed
- Ensure TypeScript types are exported
- Add error handling for Stripe API errors

**Expected Result**: Tests still PASS after refactoring

### Phase 1d: Verify ✅ VERIFY

Run the verify-code skill:

```bash
/verify-code src/lib/payments/stripe.ts __tests__/lib/payments/stripe.test.ts
```

**Expected Result**: All checks pass (TypeScript, ESLint, Prettier, tests)

## Phase 2: Checkout API Route (TDD)

### Phase 2a: Write Tests First ✅ RED

**File**: `__tests__/app/api/checkout/route.test.ts`

Add test cases:

```typescript
describe('POST /api/checkout with tax calculation', () => {
    it('creates PaymentIntent with automatic tax enabled', async () => {
        // Mock Stripe, verify automatic_tax is enabled
    });

    it('returns tax amount in response body', async () => {
        // Verify response includes taxAmount field
    });

    it('returns total including tax in response', async () => {
        // Verify response includes total = subtotal + tax
    });

    it('uses shipping address for tax calculation', async () => {
        // Verify shipping address is used (not billing)
    });

    it('handles tax calculation errors gracefully', async () => {
        // Test error handling
    });

    it('returns correct response structure', async () => {
        // Verify: { clientSecret, amount, taxAmount, total }
    });

    it('validates cart before calculating tax', async () => {
        // Ensure existing cart validation still works
    });
});
```

**Expected Result**: All new tests FAIL

### Phase 2b: Implement ✅ GREEN

**File**: `src/app/api/checkout/route.ts`

Update the POST handler:

```typescript
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = CheckoutSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid checkout data', details: parsed.error },
                { status: 400 }
            );
        }

        // Validate cart
        const validatedCart = await validateCart(parsed.data.items);

        if (!validatedCart.isValid) {
            return NextResponse.json(
                {
                    error: 'Cart validation failed',
                    details: validatedCart.errors,
                },
                { status: 400 }
            );
        }

        // Create payment intent with tax calculation
        const { paymentIntent, taxAmount, total } =
            await createPaymentIntentWithTax(
                validatedCart.subtotal + validatedCart.shippingCost,
                {
                    line1: parsed.data.shippingAddress.line1,
                    line2: parsed.data.shippingAddress.line2,
                    city: parsed.data.shippingAddress.city,
                    state: parsed.data.shippingAddress.state,
                    postal_code: parsed.data.shippingAddress.zip,
                    country: parsed.data.shippingAddress.country,
                },
                {
                    customerName: parsed.data.customerName,
                    customerEmail: parsed.data.customerEmail,
                    // ... other metadata
                }
            );

        return NextResponse.json(
            {
                clientSecret: paymentIntent.client_secret,
                amount: validatedCart.subtotal + validatedCart.shippingCost,
                taxAmount,
                total,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Payment intent creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create payment intent' },
            { status: 500 }
        );
    }
}
```

Update the CheckoutSchema to include addresses:

```typescript
const AddressSchema = z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(2),
    zip: z.string().min(5),
    country: z.string().min(2),
});

const CheckoutSchema = z.object({
    items: z.array(/* ... */),
    customerName: z.string().min(1),
    customerEmail: z.string().email(),
    shippingAddress: AddressSchema,
    billingAddress: AddressSchema,
    orderNotes: z.string().optional(),
});
```

**Expected Result**: All tests PASS

### Phase 2c: Refactor ✅ REFACTOR

- Clean up error handling
- Extract address transformation logic if needed
- Add proper TypeScript types for response
- Ensure metadata is complete

**Expected Result**: Tests still PASS

### Phase 2d: Verify ✅ VERIFY

Run the verify-code skill:

```bash
/verify-code src/app/api/checkout/route.ts __tests__/app/api/checkout/route.test.ts
```

**Expected Result**: All checks pass (TypeScript, ESLint, Prettier, tests)

## Phase 3: Webhook Handler (TDD)

### Phase 3a: Write Tests First ✅ RED

**File**: `__tests__/app/api/checkout/webhook/route.test.ts`

Add test cases:

```typescript
describe('POST /api/checkout/webhook with tax', () => {
    it('extracts tax from PaymentIntent.automatic_tax.amount', async () => {
        // Verify tax extracted from correct field
    });

    it('creates order with correct tax amount', async () => {
        // Verify order has accurate tax_amount
    });

    it('handles PaymentIntents without tax (backwards compatibility)', async () => {
        // Old orders without tax should still work
    });

    it('converts tax from cents to dollars correctly', async () => {
        // Stripe returns cents, we store dollars
    });

    it('calculates order total including tax', async () => {
        // Verify total = subtotal + shipping + tax
    });
});
```

**Expected Result**: Tests FAIL

### Phase 3b: Implement ✅ GREEN

**File**: `src/app/api/checkout/webhook/route.ts`

Update webhook handler:

```typescript
case 'payment_intent.succeeded': {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  // Extract tax amount from automatic_tax (not metadata)
  const taxAmountCents = paymentIntent.automatic_tax?.amount ?? 0;
  const taxAmount = taxAmountCents / 100;

  // Parse other amounts from metadata
  const subtotal = parseFloat(paymentIntent.metadata.subtotal);
  const shippingCost = parseFloat(paymentIntent.metadata.shippingCost);
  const total = subtotal + shippingCost + taxAmount;

  const orderData = {
    orderNumber: generateOrderNumber(),
    customerName: paymentIntent.metadata.customerName,
    customerEmail: paymentIntent.metadata.customerEmail,
    // ... addresses ...
    subtotal,
    shippingCost,
    taxAmount,
    total,
    paymentIntentId: paymentIntent.id,
    status: 'paid',
  };

  const { data: order, error } = await createOrder(orderData);

  if (error) {
    console.error('Failed to create order:', error);
  }

  console.log('Order created:', order?.order_number);
  break;
}
```

**Expected Result**: Tests PASS

### Phase 3c: Refactor ✅ REFACTOR

- Extract tax extraction into helper function
- Add error handling for missing fields
- Ensure backwards compatibility

**Expected Result**: Tests still PASS

### Phase 3d: Verify ✅ VERIFY

Run the verify-code skill:

```bash
/verify-code src/app/api/checkout/webhook/route.ts __tests__/app/api/checkout/webhook/route.test.ts
```

**Expected Result**: All checks pass (TypeScript, ESLint, Prettier, tests)

## Phase 4: CheckoutForm Component (TDD)

### Phase 4a: Write Tests First ✅ RED

**File**: `__tests__/components/checkout/CheckoutForm.test.tsx`

```typescript
describe('CheckoutForm tax handling', () => {
    it('receives tax amount from API response', async () => {
        // Mock API, verify taxAmount is received
    });

    it('updates state with tax amount', async () => {
        // Verify component state updates
    });

    it('passes tax amount to CartSummary component', async () => {
        // Verify prop is passed down
    });

    it('displays loading state during tax calculation', async () => {
        // Verify loading indicator
    });

    it('handles tax calculation errors', async () => {
        // Default to 0 on error
    });

    it('existing form submission tests still pass', async () => {
        // Regression test
    });
});
```

**Expected Result**: Tests FAIL

### Phase 4b: Implement ✅ GREEN

**File**: `src/components/checkout/CheckoutForm.tsx`

Add state and update handler:

```typescript
const [taxAmount, setTaxAmount] = useState(0);

const handleSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);
    try {
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error);
        }

        // Update tax amount from response
        setTaxAmount(result.taxAmount ?? 0);
        setClientSecret(result.clientSecret);
    } catch (error) {
        console.error('Checkout error:', error);
        setTaxAmount(0); // Default to 0 on error
    } finally {
        setIsProcessing(false);
    }
};
```

Pass to CartSummary:

```typescript
<CartSummary
  items={cartItems}
  taxAmount={taxAmount}
/>
```

**Expected Result**: Tests PASS

### Phase 4c: Refactor ✅ REFACTOR

- Clean up error handling
- Ensure proper TypeScript types
- Add loading states

**Expected Result**: Tests still PASS

### Phase 4d: Verify ✅ VERIFY

Run the verify-code skill:

```bash
/verify-code src/components/checkout/CheckoutForm.tsx __tests__/components/checkout/CheckoutForm.test.tsx
```

**Expected Result**: All checks pass (TypeScript, ESLint, Prettier, tests)

## Phase 5: CartSummary Component (TDD)

### Phase 5a: Write Tests First ✅ RED

**File**: `__tests__/components/cart/CartSummary.test.tsx`

```typescript
describe('CartSummary tax display', () => {
    it('displays "Tax: Calculated at checkout" when tax is 0', () => {
        // Placeholder shown when no tax yet
    });

    it('displays "Tax: $X.XX" when tax amount provided', () => {
        // Actual amount shown when available
    });

    it('calculates total including tax correctly', () => {
        // total = subtotal + shipping + tax
    });

    it('formats tax amount as currency', () => {
        // Proper $ formatting
    });

    it('existing tests still pass', () => {
        // Regression check
    });
});
```

**Expected Result**: Tests FAIL

### Phase 5b: Implement ✅ GREEN

**File**: `src/components/cart/CartSummary.tsx`

Update component:

```typescript
interface CartSummaryProps {
  items: CartItem[];
  taxAmount?: number;
}

export function CartSummary({ items, taxAmount = 0 }: CartSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 5.00; // Fixed shipping
  const total = subtotal + shipping + taxAmount;

  return (
    <div className="cart-summary">
      {/* ... */}
      <div className="flex justify-between">
        <span>Tax:</span>
        <span>
          {taxAmount > 0
            ? `$${taxAmount.toFixed(2)}`
            : <span className="text-sm text-gray-500">Calculated at checkout</span>
          }
        </span>
      </div>
      <div className="flex justify-between font-bold">
        <span>Total:</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
}
```

**Expected Result**: Tests PASS

### Phase 5c: Refactor ✅ REFACTOR

- Extract currency formatting utility
- Ensure consistent styling
- Add accessibility attributes

**Expected Result**: Tests still PASS

### Phase 5d: Verify ✅ VERIFY

Run the verify-code skill:

```bash
/verify-code src/components/cart/CartSummary.tsx __tests__/components/cart/CartSummary.test.tsx
```

**Expected Result**: All checks pass (TypeScript, ESLint, Prettier, tests)

## Phase 6: Integration Testing

### Phase 6a: Write E2E Test ✅ RED

**File**: `__tests__/integration/checkout-with-tax.test.ts`

```typescript
describe('Checkout flow with tax calculation', () => {
    it('calculates tax for California address', async () => {
        // Full flow: cart → checkout → tax calculated → payment → order
    });

    it('calculates $0 tax for Oregon address', async () => {
        // Tax-free state test
    });

    it('displays tax in order summary before payment', async () => {
        // User sees tax before paying
    });

    it('stores tax in database correctly', async () => {
        // Verify database record
    });

    it('different addresses result in different tax amounts', async () => {
        // CA vs NY vs OR
    });
});
```

**Expected Result**: Tests FAIL initially

### Phase 6b: Verify ✅ GREEN

- Run all tests together
- Fix any integration issues
- Ensure full flow works end-to-end

**Expected Result**: All tests PASS

### Phase 6c: Manual Testing

Test with Stripe test mode:

- **California (high tax)**: 123 Main St, Los Angeles, CA, 90001
- **New York (high tax)**: 456 Broadway, New York, NY, 10001
- **Texas (moderate tax)**: 789 Oak St, Austin, TX, 78701
- **Oregon (no tax)**: 321 Pine St, Portland, OR, 97201
- **Invalid address**: Should handle gracefully

### Phase 6d: Final Verification ✅ VERIFY

Run comprehensive verify-code on all modified files:

```bash
/verify-code
```

This will run all checks across the entire codebase to ensure:

- No TypeScript errors anywhere
- No ESLint warnings anywhere
- All code is properly formatted
- All tests pass (unit, integration, and E2E)
- Test coverage meets thresholds

**Expected Result**: Complete codebase passes all quality checks

## Phase 7: Documentation & Environment

### Stripe Tax Dashboard Setup

1. Log into Stripe Dashboard (test mode)
2. Navigate to Settings → Tax
3. Enable Stripe Tax
4. Configure business settings:
    - Business location: United States
    - Business type: Retail
5. Set product tax codes:
    - Default: `txcd_99999999` (physical goods)
    - Or use art-specific code if available
6. Review tax registration status
    - Note: Calculation works without registration
    - Registration required for actual tax collection
    - Consult tax professional for compliance

### Environment Variables

No new variables needed. Existing Stripe keys work:

- `STRIPE_SECRET_KEY` (already configured)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (already configured)

### Documentation Updates

Update README or docs with:

- Stripe Tax setup instructions
- Tax calculation behavior
- Tax registration requirements
- Testing with different addresses

## Files to Create/Modify

### Test Files (Create/Enhance)

1. `__tests__/lib/payments/stripe.test.ts` - Add tax function tests
2. `__tests__/app/api/checkout/route.test.ts` - Add tax calculation tests
3. `__tests__/app/api/checkout/webhook/route.test.ts` - Add tax extraction tests
4. `__tests__/components/checkout/CheckoutForm.test.tsx` - Create or enhance
5. `__tests__/components/cart/CartSummary.test.tsx` - Create or enhance
6. `__tests__/integration/checkout-with-tax.test.ts` - New integration test

### Implementation Files

1. `src/lib/payments/stripe.ts` - Add `createPaymentIntentWithTax()`
2. `src/app/api/checkout/route.ts` - Use tax-enabled PaymentIntent
3. `src/app/api/checkout/webhook/route.ts` - Extract tax from `automatic_tax`
4. `src/components/checkout/CheckoutForm.tsx` - Handle tax in response
5. `src/components/cart/CartSummary.tsx` - Display tax amount

### Documentation Files

1. Update `.docs/SETUP.md` with Stripe Tax setup
2. Add troubleshooting section for tax issues

## Success Criteria

### Testing

- ✅ All tests written before implementation (TDD)
- ✅ All tests pass (green)
- ✅ Test coverage ≥90% for new code
- ✅ No regression in existing tests
- ✅ Integration tests pass
- ✅ Manual testing with various addresses succeeds

### Functionality

- ✅ Tax automatically calculated based on shipping address
- ✅ Tax amount displayed in order summary
- ✅ Tax included in payment total
- ✅ Tax correctly stored in order record
- ✅ Works with all US addresses
- ✅ Handles tax-exempt states correctly (returns $0)
- ✅ Handles errors gracefully

### Code Quality

- ✅ No TypeScript errors
- ✅ No ESLint warnings
- ✅ Code formatted with Prettier
- ✅ Proper error handling
- ✅ Code is well-documented
- ✅ Clean, maintainable code
- ✅ **verify-code skill passes on entire codebase**

### Production Readiness

- ✅ Stripe Tax Dashboard configured
- ✅ Documentation updated
- ✅ No breaking changes to existing flow
- ✅ Backwards compatible with existing orders
- ✅ Ready for production deployment

## Notes & Considerations

### Tax Registration Compliance

- Stripe Tax calculates tax automatically but you must be registered to collect it
- Consult with tax professional or CPA about registration requirements
- Different states have different thresholds for tax collection
- Economic nexus rules may apply based on sales volume

### Product Tax Codes

- Use appropriate Stripe tax codes for your products
- Physical artwork: `txcd_99999999` (general tangible goods)
- Digital products may have different codes
- Services may be taxed differently

### Testing Limitations

- Test mode calculates realistic tax rates
- Real tax rates may vary slightly from test mode
- Always verify with actual Stripe production data

### Future Enhancements

- Support for international tax (VAT, GST)
- Tax-exempt customers (nonprofits, resellers)
- Detailed tax breakdown by jurisdiction
- Tax reporting and remittance via Stripe Tax

### Backwards Compatibility

- Old orders without tax should still display correctly
- Webhook must handle PaymentIntents created before tax integration
- Database already supports tax_amount column (defaults to 0)
