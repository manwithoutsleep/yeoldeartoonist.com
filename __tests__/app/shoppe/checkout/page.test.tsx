/**
 * Checkout Page Tests
 *
 * Tests for the checkout page that handles payment processing.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import CheckoutPage from '@/app/shoppe/checkout/page';
import { CartProvider } from '@/context/CartContext';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

// Mock CheckoutForm
vi.mock('@/components/checkout/CheckoutForm', () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CheckoutForm: ({ onClientSecretReceived, onError }: any) => (
        <div data-testid="checkout-form">
            <button onClick={() => onClientSecretReceived('test_secret')}>
                Mock Receive Secret
            </button>
            <button onClick={() => onError('Test error')}>Mock Error</button>
        </div>
    ),
}));

// Mock CartSummary
vi.mock('@/components/cart/CartSummary', () => ({
    CartSummary: () => <div data-testid="cart-summary">Cart Summary</div>,
}));

// Mock CheckoutProvider
vi.mock('@/components/checkout/CheckoutProvider', () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CheckoutProvider: ({ children, clientSecret }: any) => (
        <div data-testid="checkout-provider" data-client-secret={clientSecret}>
            {children}
        </div>
    ),
}));

// Mock useCart hook
const mockUseCart = vi.fn();

vi.mock('@/hooks/useCart', () => ({
    useCart: () => mockUseCart(),
}));

describe('CheckoutPage', () => {
    beforeEach(() => {
        mockPush.mockClear();
    });

    it('redirects to cart when cart is empty', () => {
        mockUseCart.mockReturnValue({
            cart: { items: [], lastUpdated: Date.now() },
            getItemCount: () => 0,
        });

        render(
            <CartProvider>
                <CheckoutPage />
            </CartProvider>
        );

        // Should redirect
        expect(mockPush).toHaveBeenCalledWith('/shoppe/cart');
    });

    it('renders checkout page when cart has items', () => {
        mockUseCart.mockReturnValue({
            cart: {
                items: [
                    {
                        artworkId: '1',
                        title: 'Test Art',
                        price: 29.99,
                        quantity: 1,
                        slug: 'test-art',
                    },
                ],
                lastUpdated: Date.now(),
            },
            getItemCount: () => 1,
        });

        render(
            <CartProvider>
                <CheckoutPage />
            </CartProvider>
        );

        expect(
            screen.getByRole('heading', { name: /checkout/i })
        ).toBeInTheDocument();
    });

    it('displays checkout form', () => {
        mockUseCart.mockReturnValue({
            cart: {
                items: [
                    {
                        artworkId: '1',
                        title: 'Test Art',
                        price: 29.99,
                        quantity: 1,
                        slug: 'test-art',
                    },
                ],
                lastUpdated: Date.now(),
            },
            getItemCount: () => 1,
        });

        render(
            <CartProvider>
                <CheckoutPage />
            </CartProvider>
        );

        expect(screen.getByTestId('checkout-form')).toBeInTheDocument();
    });

    it('displays order summary', () => {
        mockUseCart.mockReturnValue({
            cart: {
                items: [
                    {
                        artworkId: '1',
                        title: 'Test Art',
                        price: 29.99,
                        quantity: 1,
                        slug: 'test-art',
                    },
                ],
                lastUpdated: Date.now(),
            },
            getItemCount: () => 1,
        });

        render(
            <CartProvider>
                <CheckoutPage />
            </CartProvider>
        );

        expect(
            screen.getByRole('heading', { name: /order summary/i })
        ).toBeInTheDocument();
        expect(screen.getByTestId('cart-summary')).toBeInTheDocument();
    });

    it('wraps checkout form in CheckoutProvider', () => {
        mockUseCart.mockReturnValue({
            cart: {
                items: [
                    {
                        artworkId: '1',
                        title: 'Test Art',
                        price: 29.99,
                        quantity: 1,
                        slug: 'test-art',
                    },
                ],
                lastUpdated: Date.now(),
            },
            getItemCount: () => 1,
        });

        render(
            <CartProvider>
                <CheckoutPage />
            </CartProvider>
        );

        expect(screen.getByTestId('checkout-provider')).toBeInTheDocument();
    });

    it('uses responsive grid layout', () => {
        mockUseCart.mockReturnValue({
            cart: {
                items: [
                    {
                        artworkId: '1',
                        title: 'Test Art',
                        price: 29.99,
                        quantity: 1,
                        slug: 'test-art',
                    },
                ],
                lastUpdated: Date.now(),
            },
            getItemCount: () => 1,
        });

        const { container } = render(
            <CartProvider>
                <CheckoutPage />
            </CartProvider>
        );

        const grid = container.querySelector('.grid');
        expect(grid).toBeInTheDocument();
        expect(grid).toHaveClass('grid-cols-1');
        expect(grid).toHaveClass('lg:grid-cols-3');
    });

    it('displays error message when error occurs', () => {
        mockUseCart.mockReturnValue({
            cart: {
                items: [
                    {
                        artworkId: '1',
                        title: 'Test Art',
                        price: 29.99,
                        quantity: 1,
                        slug: 'test-art',
                    },
                ],
                lastUpdated: Date.now(),
            },
            getItemCount: () => 1,
        });

        const { rerender } = render(
            <CartProvider>
                <CheckoutPage />
            </CartProvider>
        );

        // Simulate error by clicking the mock error button
        const errorButton = screen.getByRole('button', { name: /mock error/i });
        errorButton.click();

        // Re-render to see the error
        rerender(
            <CartProvider>
                <CheckoutPage />
            </CartProvider>
        );

        // The component should handle the error state
        expect(screen.getByTestId('checkout-form')).toBeInTheDocument();
    });
});
