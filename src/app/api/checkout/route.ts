/**
 * Checkout API Route
 *
 * Handles payment intent creation for checkout process.
 * Validates cart server-side before creating Stripe payment intent.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createPaymentIntent } from '@/lib/payments/stripe';
import { validateCart } from '@/lib/cart/validation';

/**
 * Schema for checkout request validation
 */
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
    customerName: z.string().min(1, 'Customer name is required'),
    customerEmail: z.string().email('Valid email is required'),
});

/**
 * POST /api/checkout
 *
 * Creates a Stripe payment intent for checkout.
 *
 * Request body:
 * - items: Array of cart items with artworkId, title, price, quantity, slug
 * - customerName: Customer's name
 * - customerEmail: Customer's email address
 *
 * Response:
 * - 200: { clientSecret: string, amount: number }
 * - 400: { error: string, details?: unknown } - Invalid request or cart validation failed
 * - 500: { error: string } - Server error during payment intent creation
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/checkout', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     items: [{ artworkId: '...', title: 'Art', price: 50, quantity: 2, slug: 'art' }],
 *     customerName: 'John Doe',
 *     customerEmail: 'john@example.com'
 *   })
 * });
 * const { clientSecret, amount } = await response.json();
 * ```
 */
export async function POST(request: NextRequest) {
    try {
        // Parse and validate request body
        const body = await request.json();
        const parsed = CheckoutSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    error: 'Invalid checkout data',
                    details: parsed.error.flatten(),
                },
                { status: 400 }
            );
        }

        const { items, customerName, customerEmail } = parsed.data;

        // Validate cart server-side (prevents price tampering, checks inventory, etc.)
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

        // Create Stripe payment intent with validated total
        const paymentIntent = await createPaymentIntent(
            validatedCart.total,
            'usd',
            {
                customerName,
                customerEmail,
                // Store cart data for webhook retrieval
                itemCount: items.length.toString(),
                subtotal: validatedCart.subtotal.toFixed(2),
                shippingCost: validatedCart.shippingCost.toFixed(2),
            }
        );

        // Return client secret for client-side confirmation
        return NextResponse.json(
            {
                clientSecret: paymentIntent.client_secret,
                amount: validatedCart.total,
            },
            { status: 200 }
        );
    } catch (error) {
        // Log error for debugging (in production, use proper logging service)
        console.error('Payment intent creation error:', error);

        return NextResponse.json(
            {
                error: 'Failed to create payment intent',
                message:
                    error instanceof Error
                        ? error.message
                        : 'Unknown error occurred',
            },
            { status: 500 }
        );
    }
}
