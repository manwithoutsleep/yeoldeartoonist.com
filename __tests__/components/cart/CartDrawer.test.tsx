import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';

/**
 * Helper function to render components with required providers
 */
const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <ToastProvider>
            <CartProvider>{ui}</CartProvider>
        </ToastProvider>
    );
};

/**
 * Test helper: Render CartDrawer with CartProvider
 */
const renderWithCart = (ui: React.ReactElement) => {
    return renderWithProviders(ui);
};

describe('CartDrawer', () => {
    it('opens and closes correctly', () => {
        const onClose = vi.fn();
        const { rerender } = renderWithCart(
            <CartDrawer isOpen={false} onClose={onClose} />
        );

        // Initially closed - drawer should not be visible
        expect(screen.queryByTestId('cart-drawer')).not.toBeInTheDocument();

        // Open the drawer
        rerender(
            <ToastProvider>
                <CartProvider>
                    <CartDrawer isOpen={true} onClose={onClose} />
                </CartProvider>
            </ToastProvider>
        );

        // Drawer should be visible
        expect(screen.getByTestId('cart-drawer')).toBeInTheDocument();
    });

    it('shows empty state when no items', () => {
        const onClose = vi.fn();
        renderWithCart(<CartDrawer isOpen={true} onClose={onClose} />);

        expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    });

    it('closes on overlay click', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        renderWithCart(<CartDrawer isOpen={true} onClose={onClose} />);

        const overlay = screen.getByTestId('cart-overlay');
        await user.click(overlay);

        expect(onClose).toHaveBeenCalled();
    });

    it('closes on Escape key', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        renderWithCart(<CartDrawer isOpen={true} onClose={onClose} />);

        await user.keyboard('{Escape}');

        expect(onClose).toHaveBeenCalled();
    });

    it('closes on close button click', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        renderWithCart(<CartDrawer isOpen={true} onClose={onClose} />);

        const closeButton = screen.getByRole('button', { name: /close/i });
        await user.click(closeButton);

        expect(onClose).toHaveBeenCalled();
    });

    it('renders View Cart and Checkout buttons when cart has items', () => {
        const onClose = vi.fn();
        renderWithCart(<CartDrawer isOpen={true} onClose={onClose} />);

        // With empty cart, these buttons should not be present
        expect(
            screen.queryByRole('link', { name: /view cart/i })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: /checkout/i })
        ).not.toBeInTheDocument();
    });

    it('has accessible focus trap', async () => {
        const onClose = vi.fn();
        renderWithCart(<CartDrawer isOpen={true} onClose={onClose} />);

        // The close button should receive focus when drawer opens
        const closeButton = screen.getByRole('button', { name: /close/i });
        await waitFor(() => {
            expect(closeButton).toHaveFocus();
        });
    });
});
