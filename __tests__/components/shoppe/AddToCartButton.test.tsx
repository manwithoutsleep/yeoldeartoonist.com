/**
 * AddToCartButton Component Tests
 *
 * Tests for the AddToCartButton component that allows users to add
 * products to their shopping cart from the Shoppe page.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddToCartButton } from '@/components/shoppe/AddToCartButton';
import { CartProvider } from '@/context/CartContext';

// Mock CartContext
const mockAddItem = vi.fn();
const mockUseCart = vi.fn(() => ({
    addItem: mockAddItem,
    cart: { items: [], lastUpdated: Date.now() },
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
    getTotal: vi.fn(() => 0),
    getItemCount: vi.fn(() => 0),
}));

vi.mock('@/hooks/useCart', () => ({
    useCart: () => mockUseCart(),
}));

describe('AddToCartButton', () => {
    const defaultProps = {
        artworkId: 'artwork-123',
        title: 'Test Artwork',
        price: '29.99',
        slug: 'test-artwork',
        imageUrl: 'https://example.com/image.jpg',
        maxQuantity: 10,
    };

    beforeEach(() => {
        mockAddItem.mockClear();
    });

    it('renders with default quantity of 1', () => {
        render(
            <CartProvider>
                <AddToCartButton {...defaultProps} />
            </CartProvider>
        );

        const quantitySelect = screen.getByLabelText(/quantity/i);
        expect(quantitySelect).toHaveValue('1');
    });

    it('renders Add to Cart button', () => {
        render(
            <CartProvider>
                <AddToCartButton {...defaultProps} />
            </CartProvider>
        );

        const button = screen.getByRole('button', { name: /add to cart/i });
        expect(button).toBeInTheDocument();
        expect(button).not.toBeDisabled();
    });

    it('shows quantity options up to maxQuantity or 10, whichever is lower', () => {
        render(
            <CartProvider>
                <AddToCartButton {...defaultProps} maxQuantity={5} />
            </CartProvider>
        );

        const quantitySelect = screen.getByLabelText(/quantity/i);
        const options = quantitySelect.querySelectorAll('option');

        // Should have 5 options (1-5)
        expect(options).toHaveLength(5);
        expect(options[0]).toHaveValue('1');
        expect(options[4]).toHaveValue('5');
    });

    it('limits quantity options to 10 even if maxQuantity is higher', () => {
        render(
            <CartProvider>
                <AddToCartButton {...defaultProps} maxQuantity={50} />
            </CartProvider>
        );

        const quantitySelect = screen.getByLabelText(/quantity/i);
        const options = quantitySelect.querySelectorAll('option');

        // Should have 10 options (1-10)
        expect(options).toHaveLength(10);
        expect(options[9]).toHaveValue('10');
    });

    it('allows user to change quantity', async () => {
        const user = userEvent.setup();

        render(
            <CartProvider>
                <AddToCartButton {...defaultProps} />
            </CartProvider>
        );

        const quantitySelect = screen.getByLabelText(/quantity/i);

        await user.selectOptions(quantitySelect, '3');

        expect(quantitySelect).toHaveValue('3');
    });

    it('adds item to cart with selected quantity when clicked', async () => {
        const user = userEvent.setup();

        render(
            <CartProvider>
                <AddToCartButton {...defaultProps} />
            </CartProvider>
        );

        const quantitySelect = screen.getByLabelText(/quantity/i);
        await user.selectOptions(quantitySelect, '2');

        const addButton = screen.getByRole('button', { name: /add to cart/i });
        await user.click(addButton);

        // Wait for the addItem call
        await waitFor(() => {
            expect(mockAddItem).toHaveBeenCalledWith({
                artworkId: 'artwork-123',
                title: 'Test Artwork',
                price: 29.99,
                quantity: 2,
                slug: 'test-artwork',
                imageUrl: 'https://example.com/image.jpg',
                maxQuantity: 10,
            });
        });
    });

    it('shows "Added!" feedback briefly after adding to cart', async () => {
        const user = userEvent.setup();

        render(
            <CartProvider>
                <AddToCartButton {...defaultProps} />
            </CartProvider>
        );

        const addButton = screen.getByRole('button', { name: /add to cart/i });
        await user.click(addButton);

        // Should show "Added!" immediately
        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /added!/i })
            ).toBeInTheDocument();
        });

        // Should be disabled while showing feedback
        expect(screen.getByRole('button', { name: /added!/i })).toBeDisabled();

        // Should revert back to "Add to Cart" after timeout
        await waitFor(
            () => {
                expect(
                    screen.getByRole('button', { name: /add to cart/i })
                ).toBeInTheDocument();
            },
            { timeout: 1000 }
        );
    });

    it('handles adding item without optional imageUrl', async () => {
        const user = userEvent.setup();
        const propsWithoutImage = { ...defaultProps, imageUrl: undefined };

        render(
            <CartProvider>
                <AddToCartButton {...propsWithoutImage} />
            </CartProvider>
        );

        const addButton = screen.getByRole('button', { name: /add to cart/i });
        await user.click(addButton);

        await waitFor(() => {
            expect(mockAddItem).toHaveBeenCalledWith({
                artworkId: 'artwork-123',
                title: 'Test Artwork',
                price: 29.99,
                quantity: 1,
                slug: 'test-artwork',
                imageUrl: undefined,
                maxQuantity: 10,
            });
        });
    });

    it('maintains accessibility with proper labels', () => {
        render(
            <CartProvider>
                <AddToCartButton {...defaultProps} />
            </CartProvider>
        );

        // Quantity select should have label
        expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();

        // Button should be keyboard accessible
        const button = screen.getByRole('button', { name: /add to cart/i });
        expect(button).toHaveAttribute('type', 'button');
    });
});
