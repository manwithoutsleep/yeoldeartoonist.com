/**
 * Cart Validation API Route
 *
 * POST /api/checkout/validate
 *
 * Validates shopping cart data server-side to ensure:
 * - All items exist in the database
 * - Items are published and available
 * - Prices match database (detect client-side tampering)
 * - Sufficient inventory is available
 * - Accurate total calculations
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateCart } from '@/lib/cart/validation';
import { z } from 'zod';

/**
 * Zod schema for validating cart item structure
 */
const CartItemSchema = z.object({
    artworkId: z.string().uuid(),
    title: z.string(),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
    slug: z.string(),
});

/**
 * Zod schema for validating the request body
 */
const ValidateCartSchema = z.object({
    items: z.array(CartItemSchema),
});

/**
 * POST handler for cart validation endpoint
 *
 * @param request - Next.js request object
 * @returns JSON response with validated cart or error
 *
 * @example
 * ```typescript
 * // Request
 * POST /api/checkout/validate
 * {
 *   "items": [
 *     {
 *       "artworkId": "123e4567-e89b-12d3-a456-426614174000",
 *       "title": "Artwork Title",
 *       "price": 50.00,
 *       "quantity": 2,
 *       "slug": "artwork-title"
 *     }
 *   ]
 * }
 *
 * // Success Response (200)
 * {
 *   "cart": {
 *     "isValid": true,
 *     "items": [...],
 *     "subtotal": 100.00,
 *     "shippingCost": 5.00,
 *     "taxAmount": 0,
 *     "total": 105.00
 *   }
 * }
 *
 * // Validation Failure Response (400)
 * {
 *   "error": "Cart validation failed",
 *   "cart": {
 *     "isValid": false,
 *     "items": [],
 *     "subtotal": 0,
 *     "shippingCost": 0,
 *     "taxAmount": 0,
 *     "total": 0,
 *     "errors": ["Item not found", "Price mismatch"]
 *   }
 * }
 * ```
 */
export async function POST(request: NextRequest) {
    try {
        // Parse and validate request body
        const body = await request.json();
        const parsed = ValidateCartSchema.safeParse(body);

        // Return 400 if request body doesn't match schema
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid cart data', details: parsed.error },
                { status: 400 }
            );
        }

        // Validate cart items against database
        const validatedCart = await validateCart(parsed.data.items);

        // Return 400 if cart validation fails
        if (!validatedCart.isValid) {
            return NextResponse.json(
                { error: 'Cart validation failed', cart: validatedCart },
                { status: 400 }
            );
        }

        // Return validated cart
        return NextResponse.json({ cart: validatedCart }, { status: 200 });
    } catch (error) {
        // Log error for debugging (in production, use proper logging service)
        console.error('Validation error:', error);

        // Return 500 for unexpected errors
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
