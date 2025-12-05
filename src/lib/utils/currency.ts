/**
 * Currency Formatting Utilities
 *
 * Provides consistent currency formatting across the application.
 */

/**
 * Formats a number as US currency (USD)
 *
 * @param amount - The amount to format (in dollars)
 * @returns Formatted currency string (e.g., "$12.99")
 *
 * @example
 * formatCurrency(12.99) // "$12.99"
 * formatCurrency(1234.56) // "$1,234.56"
 * formatCurrency(0) // "$0.00"
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}
