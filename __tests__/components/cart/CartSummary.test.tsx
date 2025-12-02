import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CartSummary } from '@/components/cart/CartSummary';
import { CartProvider } from '@/context/CartContext';

/**
 * Test helper: Render CartSummary with CartProvider
 */
const renderWithCart = (ui: React.ReactElement) => {
    return render(<CartProvider>{ui}</CartProvider>);
};

describe('CartSummary', () => {
    it('calculates subtotal correctly', () => {
        renderWithCart(<CartSummary />);

        // With empty cart, subtotal should be $0.00
        expect(screen.getByText('Subtotal')).toBeInTheDocument();
        expect(screen.getByText('$0.00')).toBeInTheDocument();
    });

    it('shows shipping cost', () => {
        renderWithCart(<CartSummary />);

        expect(screen.getByText('Shipping')).toBeInTheDocument();
        // Shipping is always $5.00
        const shippingRow = screen
            .getByText('Shipping')
            .closest('div') as HTMLElement;
        expect(shippingRow).toHaveTextContent('$5.00');
    });

    it('shows tax estimate placeholder', () => {
        renderWithCart(<CartSummary />);

        expect(screen.getByText('Tax')).toBeInTheDocument();
        expect(screen.getByText(/calculated at checkout/i)).toBeInTheDocument();
    });

    it('calculates total correctly', () => {
        renderWithCart(<CartSummary />);

        // With empty cart: subtotal ($0.00) + shipping ($5.00) = $5.00
        expect(screen.getByText('Total')).toBeInTheDocument();
        const totalRow = screen
            .getByText('Total')
            .closest('div') as HTMLElement;
        expect(totalRow).toHaveTextContent('$5.00');
    });

    it('formats currency properly', () => {
        renderWithCart(<CartSummary />);

        // All amounts should be formatted as currency
        const amounts = screen.getAllByText(/\$\d+\.\d{2}/);
        expect(amounts.length).toBeGreaterThan(0);
    });
});
