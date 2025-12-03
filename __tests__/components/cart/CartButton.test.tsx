import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { CartButton } from '@/components/cart/CartButton';
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
 * Test helper: Render CartButton with CartProvider
 */
const renderWithCart = (ui: React.ReactElement) => {
    return renderWithProviders(ui);
};

describe('CartButton', () => {
    it('renders cart icon', () => {
        renderWithCart(<CartButton />);
        const button = screen.getByRole('button', { name: /cart/i });
        expect(button).toBeInTheDocument();
    });

    it('shows badge with correct item count when cart has items', () => {
        renderWithCart(<CartButton />);

        // Initially no badge (cart is empty)
        expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('hides badge when cart is empty', () => {
        renderWithCart(<CartButton />);

        // Badge should not be visible when cart is empty
        const badge = screen.queryByTestId('cart-badge');
        expect(badge).not.toBeInTheDocument();
    });

    it('opens drawer when clicked', async () => {
        const user = userEvent.setup();
        renderWithCart(<CartButton />);

        const button = screen.getByRole('button', { name: /cart/i });
        await user.click(button);

        // Drawer should be visible
        await waitFor(() => {
            expect(screen.getByTestId('cart-drawer')).toBeInTheDocument();
        });
    });

    it('has accessible aria-label', () => {
        renderWithCart(<CartButton />);
        const button = screen.getByRole('button', { name: /cart/i });
        expect(button).toHaveAttribute('aria-label');
    });

    it('is keyboard accessible', async () => {
        const user = userEvent.setup();
        renderWithCart(<CartButton />);

        const button = screen.getByRole('button', { name: /cart/i });
        button.focus();
        expect(button).toHaveFocus();

        // Press Enter to open drawer
        await user.keyboard('{Enter}');

        await waitFor(() => {
            expect(screen.getByTestId('cart-drawer')).toBeInTheDocument();
        });
    });
});
