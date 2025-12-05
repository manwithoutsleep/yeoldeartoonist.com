/**
 * Checkout API Route
 *
 * Handles payment intent creation for checkout process.
 * Validates cart server-side before creating Stripe payment intent.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createPaymentIntentWithTax } from '@/lib/payments/stripe';
import { validateCart } from '@/lib/cart/validation';

/**
 * Schema for checkout request validation
 */
const AddressSchema = z.object({
    line1: z.string().min(1, 'Address is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zip: z.string().min(5, 'ZIP code is required'),
    country: z.string().min(2, 'Country is required'),
});

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
    shippingAddress: AddressSchema,
    billingAddress: AddressSchema,
    orderNotes: z.string().optional(),
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
 * - 200: { clientSecret: string, amount: number, taxAmount: number, total: number }
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
 *     customerEmail: 'john@example.com',
 *     shippingAddress: { line1: '123 Main St', city: 'Portland', state: 'OR', zip: '97201', country: 'US' },
 *     billingAddress: { line1: '123 Main St', city: 'Portland', state: 'OR', zip: '97201', country: 'US' }
 *   })
 * });
 * const { clientSecret, amount, taxAmount, total } = await response.json();
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

        const {
            items,
            customerName,
            customerEmail,
            shippingAddress,
            billingAddress,
            orderNotes,
        } = parsed.data;

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

        // Create Stripe payment intent with automatic tax calculation
        // Transform shipping address format (zip -> postal_code)
        const shippingAddressForStripe = {
            line1: shippingAddress.line1,
            line2: shippingAddress.line2,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postal_code: shippingAddress.zip,
            country: shippingAddress.country,
        };

        // Create payment intent with tax calculation
        // Note: Stripe metadata values are limited to 500 chars each
        const { paymentIntent, taxAmount, total } =
            await createPaymentIntentWithTax(
                validatedCart.subtotal + validatedCart.shippingCost,
                shippingAddressForStripe,
                {
                    customerName,
                    customerEmail,
                    // Store addresses as JSON strings
                    shippingAddress: JSON.stringify(shippingAddress),
                    billingAddress: JSON.stringify(billingAddress),
                    // Store items as JSON string for order creation
                    items: JSON.stringify(
                        items.map((item) => ({
                            artworkId: item.artworkId,
                            quantity: item.quantity,
                            price: item.price,
                        }))
                    ),
                    // Store validated totals
                    itemCount: items.length.toString(),
                    subtotal: validatedCart.subtotal.toFixed(2),
                    shippingCost: validatedCart.shippingCost.toFixed(2),
                    // Tax is calculated by Stripe, not stored in metadata initially
                    // Store order notes if provided
                    ...(orderNotes && { orderNotes }),
                }
            );

        // Return client secret and tax details for client-side confirmation
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
