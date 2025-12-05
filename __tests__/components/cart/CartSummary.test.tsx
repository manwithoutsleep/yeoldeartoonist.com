import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CartSummary } from '@/components/cart/CartSummary';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';

/**
 * Test helper: Render CartSummary with required providers
 */
const renderWithCart = (ui: React.ReactElement) => {
    return render(
        <ToastProvider>
            <CartProvider>{ui}</CartProvider>
        </ToastProvider>
    );
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

    describe('Tax display', () => {
        it('displays actual tax amount when provided', () => {
            renderWithCart(<CartSummary taxAmount={8.5} total={113.5} />);

            expect(screen.getByText('Tax')).toBeInTheDocument();
            // Should show actual tax amount, not placeholder
            expect(
                screen.queryByText(/calculated at checkout/i)
            ).not.toBeInTheDocument();

            // Find the tax row and verify amount
            const taxRow = screen
                .getByText('Tax')
                .closest('div') as HTMLElement;
            expect(taxRow).toHaveTextContent('$8.50');
        });

        it('displays "Calculated at checkout" when tax not provided', () => {
            renderWithCart(<CartSummary />);

            expect(screen.getByText('Tax')).toBeInTheDocument();
            expect(
                screen.getByText(/calculated at checkout/i)
            ).toBeInTheDocument();
        });

        it('displays zero tax amount for tax-free states', () => {
            renderWithCart(<CartSummary taxAmount={0} total={105} />);

            const taxRow = screen
                .getByText('Tax')
                .closest('div') as HTMLElement;
            expect(taxRow).toHaveTextContent('$0.00');
        });

        it('updates total to include tax when provided', () => {
            renderWithCart(<CartSummary taxAmount={9.75} total={114.75} />);

            const totalRow = screen
                .getByText('Total')
                .closest('div') as HTMLElement;
            expect(totalRow).toHaveTextContent('$114.75');
        });

        it('uses calculated total when tax not provided', () => {
            renderWithCart(<CartSummary />);

            // With empty cart: subtotal ($0.00) + shipping ($5.00) = $5.00
            const totalRow = screen
                .getByText('Total')
                .closest('div') as HTMLElement;
            expect(totalRow).toHaveTextContent('$5.00');
        });
    });
});
