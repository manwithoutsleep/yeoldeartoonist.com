'use client';

/**
 * CartSummary Component
 *
 * Displays cart totals including subtotal, shipping, tax, and total.
 *
 * Features:
 * - Subtotal calculation
 * - Shipping cost ($5.00 flat rate)
 * - Tax estimate placeholder
 * - Total calculation
 * - Formatted currency display
 */

import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/utils/currency';

const SHIPPING_COST = 5.0;

export function CartSummary() {
    const { getTotal } = useCart();

    const subtotal = getTotal();
    const shipping = SHIPPING_COST;
    const total = subtotal + shipping;

    return (
        <div className="border-t border-gray-200 pt-4 space-y-2">
            {/* Subtotal */}
            <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">
                    {formatCurrency(subtotal)}
                </span>
            </div>

            {/* Shipping */}
            <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-gray-900">
                    {formatCurrency(shipping)}
                </span>
            </div>

            {/* Tax */}
            <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-500 text-xs">
                    Calculated at checkout
                </span>
            </div>

            {/* Total */}
            <div className="flex justify-between text-base font-semibold border-t border-gray-200 pt-2 mt-2">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">{formatCurrency(total)}</span>
            </div>
        </div>
    );
}
