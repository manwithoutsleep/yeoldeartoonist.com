/**
 * Checkout Cancelled Page Tests
 *
 * Tests for the page shown when payment is cancelled or fails.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CheckoutCancelledPage from '@/app/shoppe/checkout/cancelled/page';

describe('CheckoutCancelledPage', () => {
    it('displays cancellation message', () => {
        render(<CheckoutCancelledPage />);

        expect(screen.getByText(/payment cancelled/i)).toBeInTheDocument();
        expect(
            screen.getByText(/your order was not completed/i)
        ).toBeInTheDocument();
    });

    it('provides link to return to cart', () => {
        render(<CheckoutCancelledPage />);

        const cartLink = screen.getByRole('link', {
            name: /return to cart/i,
        });
        expect(cartLink).toBeInTheDocument();
        expect(cartLink).toHaveAttribute('href', '/shoppe/cart');
    });

    it('provides link to return to shop', () => {
        render(<CheckoutCancelledPage />);

        const shopLink = screen.getByRole('link', {
            name: /return to shop/i,
        });
        expect(shopLink).toBeInTheDocument();
        expect(shopLink).toHaveAttribute('href', '/shoppe');
    });

    it('uses warning/error styling (yellow/red theme)', () => {
        const { container } = render(<CheckoutCancelledPage />);

        // Check for warning-themed elements
        const warningBanner = container.querySelector('.bg-yellow-100');
        expect(warningBanner).toBeInTheDocument();
    });

    it('renders in centered layout', () => {
        const { container } = render(<CheckoutCancelledPage />);

        const mainContainer = container.querySelector('.text-center');
        expect(mainContainer).toBeInTheDocument();
    });

    it('displays helpful message about cart preservation', () => {
        render(<CheckoutCancelledPage />);

        expect(
            screen.getByText(/your cart items have been saved/i)
        ).toBeInTheDocument();
    });

    it('shows cancellation heading prominently', () => {
        render(<CheckoutCancelledPage />);

        const heading = screen.getByRole('heading', {
            name: /payment cancelled/i,
            level: 1,
        });
        expect(heading).toBeInTheDocument();
    });

    it('provides clear next steps', () => {
        render(<CheckoutCancelledPage />);

        expect(
            screen.getByText(/what would you like to do/i)
        ).toBeInTheDocument();
    });

    it('has primary and secondary action buttons', () => {
        render(<CheckoutCancelledPage />);

        const cartButton = screen.getByRole('link', {
            name: /return to cart/i,
        });
        const shopButton = screen.getByRole('link', {
            name: /return to shop/i,
        });

        expect(cartButton).toBeInTheDocument();
        expect(shopButton).toBeInTheDocument();
    });
});
