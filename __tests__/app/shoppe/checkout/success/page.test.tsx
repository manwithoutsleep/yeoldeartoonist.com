/**
 * Checkout Success Page Tests
 *
 * Tests for the order confirmation page shown after successful payment.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CheckoutSuccessPage from '@/app/shoppe/checkout/success/page';
import { CartProvider } from '@/context/CartContext';

// Mock next/navigation
const mockSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
    useSearchParams: () => mockSearchParams,
}));

// Mock useCart
const mockClearCart = vi.fn();
const mockUseCart = vi.fn(() => ({
    cart: { items: [], lastUpdated: Date.now() },
    clearCart: mockClearCart,
    addItem: vi.fn(),
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
    getTotal: vi.fn(() => 0),
    getItemCount: vi.fn(() => 0),
}));

vi.mock('@/hooks/useCart', () => ({
    useCart: () => mockUseCart(),
}));

describe('CheckoutSuccessPage', () => {
    it('displays success message', () => {
        render(
            <CartProvider>
                <CheckoutSuccessPage />
            </CartProvider>
        );

        expect(screen.getByText(/order confirmed!/i)).toBeInTheDocument();
        expect(
            screen.getByText(/thank you for your purchase/i)
        ).toBeInTheDocument();
    });

    it('clears the cart on mount', () => {
        render(
            <CartProvider>
                <CheckoutSuccessPage />
            </CartProvider>
        );

        expect(mockClearCart).toHaveBeenCalled();
    });

    it('displays what happens next information', () => {
        render(
            <CartProvider>
                <CheckoutSuccessPage />
            </CartProvider>
        );

        expect(screen.getByText(/what's next\?/i)).toBeInTheDocument();
        expect(
            screen.getByText(/order confirmation email/i)
        ).toBeInTheDocument();
        expect(screen.getByText(/when your order ships/i)).toBeInTheDocument();
        expect(screen.getByText(/track your order/i)).toBeInTheDocument();
    });

    it('provides link to return to gallery', () => {
        render(
            <CartProvider>
                <CheckoutSuccessPage />
            </CartProvider>
        );

        const returnLink = screen.getByRole('link', {
            name: /return to gallery/i,
        });
        expect(returnLink).toBeInTheDocument();
        expect(returnLink).toHaveAttribute('href', '/gallery');
    });

    it('uses success styling (green theme)', () => {
        const { container } = render(
            <CartProvider>
                <CheckoutSuccessPage />
            </CartProvider>
        );

        // Check for green-themed elements
        const successBanner = container.querySelector('.bg-green-100');
        expect(successBanner).toBeInTheDocument();
    });

    it('renders in centered layout', () => {
        const { container } = render(
            <CartProvider>
                <CheckoutSuccessPage />
            </CartProvider>
        );

        const mainContainer = container.querySelector('.text-center');
        expect(mainContainer).toBeInTheDocument();
    });

    it('displays confirmation heading prominently', () => {
        render(
            <CartProvider>
                <CheckoutSuccessPage />
            </CartProvider>
        );

        const heading = screen.getByRole('heading', {
            name: /order confirmed!/i,
            level: 1,
        });
        expect(heading).toBeInTheDocument();
    });

    it('shows helpful next steps in list format', () => {
        render(
            <CartProvider>
                <CheckoutSuccessPage />
            </CartProvider>
        );

        // Check for list items with checkmarks
        const listItems = screen.getAllByText(/✅/);
        expect(listItems.length).toBeGreaterThan(0);
    });
});
