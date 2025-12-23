# Phase 4-04: Stripe Payment Integration

## Parent Specification

This is sub-task 04 of the parent specification: `phase-4-shopping-cart-checkout-00-coordinator.md`

## Objective

Integrate Stripe payment processing to handle checkout payments, including payment intent creation, Stripe Elements integration, and webhook handling for payment confirmation.

## Dependencies

**Prerequisites** (must be completed before this task):

- None - This task can start immediately

**Blocks** (tasks that depend on this one):

- Task 05: Checkout Flow Integration (needs payment components)

**Parallel Opportunities**:

- Task 01: Tests for Cart Context
- Task 02: Cart UI Components
- Task 03: Server Validation & Order Functions

## Scope

### In Scope

- Stripe client setup (server and client-side)
- Payment intent creation API route
- Stripe webhook handler for payment events
- Stripe Elements integration (PaymentElement)
- Payment form component with Stripe Elements
- Tax calculation with Stripe Tax API (optional for MVP)
- Unit tests for Stripe utilities
- Integration tests for payment API
- Webhook signature verification

### Out of Scope

- Checkout page layout (covered in Task 05)
- Cart validation (covered in Task 03)
- Order creation (covered in Task 03, but triggered by this task)
- Email notifications (Phase 5)
- UI components other than payment form (covered in Task 02)

## Implementation Requirements

### Technology Stack

- Stripe API (Node.js SDK)
- @stripe/stripe-js (client-side)
- @stripe/react-stripe-js (React components)
- Next.js API routes (App Router)
- Zod for schema validation
- Vitest for testing

### Stripe Configuration

- Use test mode for development
- Test card: 4242 4242 4242 4242 (any future date, any CVC)
- Webhook secret from Stripe CLI for local testing
- Webhook endpoint: `/api/checkout/webhook`

### Security Requirements

- Never expose Stripe secret key to client
- Verify webhook signatures
- Validate all payment amounts server-side
- Use idempotency keys for payment intents
- HTTPS required for production webhooks

### Payment Flow

1. User submits checkout form
2. Client calls `/api/checkout/route.ts` (POST) with cart and customer info
3. Server validates cart (using Task 03 functions)
4. Server creates Stripe payment intent
5. Server returns client secret to client
6. Client confirms payment with Stripe Elements
7. Stripe sends webhook to `/api/checkout/webhook`
8. Webhook handler verifies signature
9. Webhook handler creates order (using Task 03 functions)
10. Webhook handler updates order status to "paid"

## Files to Create/Modify

### New Files

- `src/lib/payments/stripe.ts` - Stripe client setup and utilities
- `src/app/api/checkout/route.ts` - Payment intent creation API
- `src/app/api/checkout/webhook/route.ts` - Stripe webhook handler
- `src/components/checkout/PaymentForm.tsx` - Stripe Elements payment form
- `__tests__/lib/payments/stripe.test.ts` - Stripe utilities tests
- `__tests__/app/api/checkout/route.test.ts` - Payment API tests
- `__tests__/app/api/checkout/webhook/route.test.ts` - Webhook tests

### Modified Files

- `src/components/checkout/CheckoutProvider.tsx` - Add Stripe Elements provider

## Testing Requirements

### Stripe Utilities Tests

- [ ] Stripe client initializes correctly
- [ ] Creates payment intent with correct amount
- [ ] Handles Stripe API errors gracefully
- [ ] Idempotency keys work correctly
- [ ] Currency formatting works

### Payment API Tests

- [ ] POST /api/checkout creates payment intent
- [ ] Returns client secret
- [ ] Validates cart before creating intent
- [ ] Returns 400 for invalid cart
- [ ] Returns 400 for invalid customer data
- [ ] Returns 500 for Stripe errors
- [ ] Uses idempotency keys

### Webhook Tests

- [ ] Verifies webhook signature
- [ ] Handles payment_intent.succeeded event
- [ ] Creates order on successful payment
- [ ] Updates order status to "paid"
- [ ] Handles payment_intent.payment_failed event
- [ ] Ignores unhandled event types
- [ ] Returns 400 for invalid signature
- [ ] Returns 200 for successful processing

### Payment Form Tests

- [ ] Renders Stripe Elements
- [ ] Handles form submission
- [ ] Displays loading state during payment
- [ ] Displays error messages
- [ ] Handles successful payment
- [ ] Handles failed payment
- [ ] Accessible (keyboard nav, ARIA)

## Success Criteria

- [x] Stripe client setup complete and tested
- [x] Payment intent API complete and tested
- [x] Webhook handler complete and tested
- [x] PaymentForm component complete and tested
- [x] CheckoutProvider integrated with Stripe Elements
- [x] All tests pass
- [x] Test coverage ≥90% for Stripe code
- [x] Webhook signature verification working
- [x] Payment flow works end-to-end with test card
- [x] No TypeScript errors
- [x] No ESLint warnings
- [x] Code formatted with Prettier
- [x] The verify-code skill has been successfully executed

## Implementation Notes

### Stripe Client Setup

**File**: `src/lib/payments/stripe.ts`

```typescript
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-11-20.acacia', // Use latest API version
    typescript: true,
});

export async function createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata: Record<string, string> = {}
): Promise<Stripe.PaymentIntent> {
    return await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
            enabled: true,
        },
    });
}

export function constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
): Stripe.Event {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
```

### Payment Intent API

**File**: `src/app/api/checkout/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createPaymentIntent } from '@/lib/payments/stripe';
import { validateCart } from '@/lib/cart/validation';

const CheckoutSchema = z.object({
    items: z.array(
        z.object({
            artworkId: z.string().uuid(),
            title: z.string(),
            price: z.number().positive(),
            quantity: z.number().int().positive(),
            slug: z.string(),
        })
    ),
    customerName: z.string().min(1),
    customerEmail: z.string().email(),
});

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

        // Create payment intent
        const paymentIntent = await createPaymentIntent(
            validatedCart.total,
            'usd',
            {
                customerName: parsed.data.customerName,
                customerEmail: parsed.data.customerEmail,
            }
        );

        return NextResponse.json(
            {
                clientSecret: paymentIntent.client_secret,
                amount: validatedCart.total,
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

### Webhook Handler

**File**: `src/app/api/checkout/webhook/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/payments/stripe';
import { createOrder } from '@/lib/db/orders';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json(
            { error: 'Missing signature' },
            { status: 400 }
        );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error('STRIPE_WEBHOOK_SECRET not configured');
        return NextResponse.json(
            { error: 'Webhook not configured' },
            { status: 500 }
        );
    }

    try {
        const event = constructWebhookEvent(payload, signature, webhookSecret);

        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;

                // Create order
                // Note: Order data should be stored in payment intent metadata
                // or retrieved from session/database
                const orderData = {
                    // Extract from paymentIntent.metadata
                    orderNumber: generateOrderNumber(),
                    customerName: paymentIntent.metadata.customerName,
                    customerEmail: paymentIntent.metadata.customerEmail,
                    // ... other fields
                    paymentIntentId: paymentIntent.id,
                };

                const { data: order, error } = await createOrder(orderData);

                if (error) {
                    console.error('Failed to create order:', error);
                    // Don't return error to Stripe, log for manual review
                }

                console.log('Order created:', order?.order_number);
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                console.error('Payment failed:', paymentIntent.id);
                // Handle failed payment (send email, log, etc.)
                break;
            }

            default:
                console.log('Unhandled event type:', event.type);
        }

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 400 }
        );
    }
}

function generateOrderNumber(): string {
    // Generate order number (e.g., YOA-20250112-0001)
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');
    return `YOA-${date}-${random}`;
}
```

### CheckoutProvider with Stripe Elements

**File**: `src/components/checkout/CheckoutProvider.tsx`

```typescript
'use client';

import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface CheckoutProviderProps {
  clientSecret?: string;
  children: React.ReactNode;
}

export function CheckoutProvider({
  clientSecret,
  children,
}: CheckoutProviderProps) {
  if (!clientSecret) {
    return <>{children}</>;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#000000',
          },
        },
      }}
    >
      {children}
    </Elements>
  );
}
```

### PaymentForm Component

**File**: `src/components/checkout/PaymentForm.tsx`

```typescript
'use client';

import React, { useState } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';

interface PaymentFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function PaymentForm({ onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/shoppe/checkout/success`,
      },
    });

    if (error) {
      onError(error.message || 'Payment failed');
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe || isProcessing}>
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}
```

### Testing Webhook Locally

Use Stripe CLI:

```bash
# Install Stripe CLI
# Download from https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local dev server
stripe listen --forward-to localhost:3000/api/checkout/webhook

# Copy webhook signing secret to .env.local
# STRIPE_WEBHOOK_SECRET=whsec_...

# Test webhook
stripe trigger payment_intent.succeeded
```

## Notes

- Stripe packages already installed (verified in package.json)
- Use Stripe test mode for all development
- Test card: 4242 4242 4242 4242 (any future expiry, any CVC)
- Webhook secret is different for local dev vs. production
- Consider using Stripe Tax API for automatic tax calculation (optional for MVP)
- Payment intent should store order data in metadata for webhook retrieval
- Consider implementing idempotency keys to prevent duplicate charges
- Stripe Elements automatically handles PCI compliance
- Return URL in confirmPayment redirects after successful payment
