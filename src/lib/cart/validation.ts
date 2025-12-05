/**
 * Cart Validation
 *
 * Server-side cart validation logic to ensure data integrity, prevent tampering,
 * and validate item availability and pricing.
 */

import type { CartItem, ValidatedCart } from '@/types/cart';
import { createServiceRoleClient } from '@/lib/supabase/server';

/**
 * Validates a shopping cart by checking:
 * - All items exist in the database
 * - All items are published
 * - Prices match database (detects client-side tampering)
 * - Sufficient inventory is available
 * - Calculates accurate totals
 *
 * @param items - Array of cart items to validate
 * @returns ValidatedCart with validation status, validated items, totals, and any errors
 *
 * @example
 * ```typescript
 * const cart = await validateCart([
 *   { artworkId: '123', title: 'Art', price: 50, quantity: 2, slug: 'art' }
 * ]);
 *
 * if (cart.isValid) {
 *   // Proceed to checkout
 * } else {
 *   // Show errors to user
 *   console.error(cart.errors);
 * }
 * ```
 */
export async function validateCart(items: CartItem[]): Promise<ValidatedCart> {
    // Handle empty cart
    if (items.length === 0) {
        return {
            isValid: false,
            items: [],
            subtotal: 0,
            shippingCost: 0,
            taxAmount: 0,
            total: 0,
            errors: ['Cart is empty'],
        };
    }

    const supabase = await createServiceRoleClient();
    const artworkIds = items.map((item) => item.artworkId);

    // Fetch artwork from database to validate against
    const { data: artworkRecords, error } = await supabase
        .from('artwork')
        .select('id, title, price, inventory_count, is_published, slug')
        .in('id', artworkIds);

    // Handle database errors
    if (error) {
        return {
            isValid: false,
            items: [],
            subtotal: 0,
            shippingCost: 0,
            taxAmount: 0,
            total: 0,
            errors: ['Failed to validate cart items'],
        };
    }

    const errors: string[] = [];
    const validatedItems: CartItem[] = [];
    let subtotal = 0;

    // Validate each cart item
    for (const item of items) {
        const artwork = artworkRecords?.find((a) => a.id === item.artworkId);

        // Validate item exists in database
        if (!artwork) {
            errors.push(`Item "${item.title}" not found`);
            continue;
        }

        // Validate item is published (available for purchase)
        if (!artwork.is_published) {
            errors.push(`Item "${artwork.title}" is no longer available`);
            continue;
        }

        // Validate price matches database (detect client-side tampering)
        // Database stores prices as strings (numeric type), convert for comparison
        if (parseFloat(artwork.price) !== item.price) {
            errors.push(
                `Price for "${artwork.title}" has changed. Please refresh your cart.`
            );
            continue;
        }

        // Validate sufficient inventory is available
        if (artwork.inventory_count < item.quantity) {
            errors.push(
                `Only ${artwork.inventory_count} of "${artwork.title}" available`
            );
            continue;
        }

        // Item passed all validations
        const artworkPrice = parseFloat(artwork.price);
        validatedItems.push({
            artworkId: artwork.id,
            title: artwork.title,
            price: artworkPrice,
            quantity: item.quantity,
            slug: artwork.slug,
        });

        // Add to running subtotal
        subtotal += artworkPrice * item.quantity;
    }

    // Calculate shipping and total
    const shippingCost = 5.0; // Flat rate shipping for MVP
    const taxAmount = 0; // Tax calculated by Stripe Tax at checkout
    const total = subtotal + shippingCost + taxAmount;

    return {
        isValid: errors.length === 0,
        items: validatedItems,
        subtotal,
        shippingCost,
        taxAmount,
        total,
        errors: errors.length > 0 ? errors : undefined,
    };
}
