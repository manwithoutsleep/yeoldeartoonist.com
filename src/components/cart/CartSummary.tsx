'use client';

import { siteConfig } from '@/config/site';
/**
 * CartSummary Component
 *
 * Displays cart totals including subtotal, shipping, tax, and total.
 *
 * Features:
 * - Subtotal calculation
 * - Shipping cost (flat rate)
 * - Tax display (actual or estimate placeholder)
 * - Total calculation (with or without tax)
 * - Formatted currency display
 */

import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/utils/currency';

const SHIPPING_COST = siteConfig.shipping.flat_rate / 100;

export interface CartSummaryProps {
    /**
     * Optional tax amount calculated at checkout
     */
    taxAmount?: number;

    /**
     * Optional total including tax
     */
    total?: number;
}

export function CartSummary({
    taxAmount,
    total: providedTotal,
}: CartSummaryProps = {}) {
    const { getTotal } = useCart();

    const subtotal = getTotal();
    const shipping = SHIPPING_COST;
    const calculatedTotal = subtotal + shipping;

    // Use provided total if available, otherwise calculate
    const total = providedTotal ?? calculatedTotal;

    // Determine if we should show actual tax or placeholder
    const showActualTax = taxAmount !== undefined;

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
                {showActualTax ? (
                    <span className="font-medium text-gray-900">
                        {formatCurrency(taxAmount)}
                    </span>
                ) : (
                    <span className="text-gray-500 text-xs">
                        Calculated at checkout
                    </span>
                )}
            </div>

            {/* Total */}
            <div className="flex justify-between text-base font-semibold border-t border-gray-200 pt-2 mt-2">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900" data-testid="cart-total">
                    {formatCurrency(total)}
                </span>
            </div>
        </div>
    );
}
