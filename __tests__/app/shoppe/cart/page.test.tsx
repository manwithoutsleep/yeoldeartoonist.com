/**
 * Cart Page Tests
 *
 * Tests for the shopping cart page that displays cart items
 * and allows users to manage their cart before checkout.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CartPage from '@/app/shoppe/cart/page';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';

// Mock cart components
vi.mock('@/components/cart/CartItem', () => ({
    CartItem: ({ item }: { item: { artworkId: string; title: string } }) => (
        <div data-testid={`cart-item-${item.artworkId}`}>{item.title}</div>
    ),
}));

vi.mock('@/components/cart/CartSummary', () => ({
    CartSummary: () => <div data-testid="cart-summary">Cart Summary</div>,
}));

// Mock useCart hook
const mockUseCart = vi.fn();

vi.mock('@/hooks/useCart', () => ({
    useCart: () => mockUseCart(),
}));

describe('CartPage', () => {
    it('shows empty state when cart is empty', () => {
        mockUseCart.mockReturnValue({
            cart: { items: [], lastUpdated: Date.now() },
            getItemCount: () => 0,
        });

        render(
            <ToastProvider>
                <CartProvider>
                    <CartPage />
                </CartProvider>
            </ToastProvider>
        );

        expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: /continue shopping/i })
        ).toHaveAttribute('href', '/shoppe');
    });

    it('displays cart items when cart has items', () => {
        mockUseCart.mockReturnValue({
            cart: {
                items: [
                    {
                        artworkId: '1',
                        title: 'Test Art 1',
                        price: 29.99,
                        quantity: 2,
                        slug: 'test-art-1',
                        maxQuantity: 10,
                    },
                    {
                        artworkId: '2',
                        title: 'Test Art 2',
                        price: 39.99,
                        quantity: 1,
                        slug: 'test-art-2',
                        maxQuantity: 10,
                    },
                ],
                lastUpdated: Date.now(),
            },
            getItemCount: () => 3,
        });

        render(
            <ToastProvider>
                <CartProvider>
                    <CartPage />
                </CartProvider>
            </ToastProvider>
        );

        expect(screen.getByText(/your cart/i)).toBeInTheDocument();
        expect(screen.getByTestId('cart-item-1')).toBeInTheDocument();
        expect(screen.getByTestId('cart-item-2')).toBeInTheDocument();
    });

    it('displays cart summary when cart has items', () => {
        mockUseCart.mockReturnValue({
            cart: {
                items: [
                    {
                        artworkId: '1',
                        title: 'Test Art',
                        price: 29.99,
                        quantity: 1,
                        slug: 'test-art',
                        maxQuantity: 10,
                    },
                ],
                lastUpdated: Date.now(),
            },
            getItemCount: () => 1,
        });

        render(
            <ToastProvider>
                <CartProvider>
                    <CartPage />
                </CartProvider>
            </ToastProvider>
        );

        expect(screen.getByTestId('cart-summary')).toBeInTheDocument();
    });

    it('shows Proceed to Checkout button when cart has items', () => {
        mockUseCart.mockReturnValue({
            cart: {
                items: [
                    {
                        artworkId: '1',
                        title: 'Test Art',
                        price: 29.99,
                        quantity: 1,
                        slug: 'test-art',
                        maxQuantity: 10,
                    },
                ],
                lastUpdated: Date.now(),
            },
            getItemCount: () => 1,
        });

        render(
            <ToastProvider>
                <CartProvider>
                    <CartPage />
                </CartProvider>
            </ToastProvider>
        );

        const checkoutLink = screen.getByRole('link', {
            name: /proceed to checkout/i,
        });
        expect(checkoutLink).toBeInTheDocument();
        expect(checkoutLink).toHaveAttribute('href', '/shoppe/checkout');
    });

    it('shows Continue Shopping link when cart has items', () => {
        mockUseCart.mockReturnValue({
            cart: {
                items: [
                    {
                        artworkId: '1',
                        title: 'Test Art',
                        price: 29.99,
                        quantity: 1,
                        slug: 'test-art',
                        maxQuantity: 10,
                    },
                ],
                lastUpdated: Date.now(),
            },
            getItemCount: () => 1,
        });

        render(
            <ToastProvider>
                <CartProvider>
                    <CartPage />
                </CartProvider>
            </ToastProvider>
        );

        const continueLink = screen.getByRole('link', {
            name: /continue shopping/i,
        });
        expect(continueLink).toBeInTheDocument();
        expect(continueLink).toHaveAttribute('href', '/shoppe');
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
                        maxQuantity: 10,
                    },
                ],
                lastUpdated: Date.now(),
            },
            getItemCount: () => 1,
        });

        const { container } = render(
            <ToastProvider>
                <CartProvider>
                    <CartPage />
                </CartProvider>
            </ToastProvider>
        );

        // Check for grid layout classes
        const grid = container.querySelector('.grid');
        expect(grid).toBeInTheDocument();
        expect(grid).toHaveClass('grid-cols-1');
        expect(grid).toHaveClass('lg:grid-cols-3');
    });

    it('renders page title correctly', () => {
        mockUseCart.mockReturnValue({
            cart: {
                items: [
                    {
                        artworkId: '1',
                        title: 'Test Art',
                        price: 29.99,
                        quantity: 1,
                        slug: 'test-art',
                        maxQuantity: 10,
                    },
                ],
                lastUpdated: Date.now(),
            },
            getItemCount: () => 1,
        });

        render(
            <ToastProvider>
                <CartProvider>
                    <CartPage />
                </CartProvider>
            </ToastProvider>
        );

        expect(
            screen.getByRole('heading', { name: /your cart/i, level: 1 })
        ).toBeInTheDocument();
    });
});
