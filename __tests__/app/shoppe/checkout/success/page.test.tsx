/**
 * Checkout Success Page Tests
 *
 * Tests for the order confirmation page shown after successful payment.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import CheckoutSuccessPage from '@/app/shoppe/checkout/success/page';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';
import type { Order } from '@/types/order';

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

// Mock next/navigation
let mockSearchParams = new URLSearchParams();
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

// Mock useOrderPolling hook
const mockUseOrderPolling = vi.fn();
vi.mock('@/hooks/useOrderPolling', () => ({
    useOrderPolling: (sessionId: string | null) =>
        mockUseOrderPolling(sessionId),
}));

describe('CheckoutSuccessPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default mock return value for old tests
        mockUseOrderPolling.mockReturnValue({
            order: null,
            loading: false,
            error: null,
            retryCount: 0,
        });
    });

    it('displays success message', () => {
        renderWithProviders(<CheckoutSuccessPage />);

        expect(screen.getByText(/order confirmed!/i)).toBeInTheDocument();
        expect(
            screen.getByText(/thank you for your purchase/i)
        ).toBeInTheDocument();
    });

    it('clears the cart on mount', () => {
        renderWithProviders(<CheckoutSuccessPage />);

        expect(mockClearCart).toHaveBeenCalled();
    });

    it('displays what happens next information', () => {
        renderWithProviders(<CheckoutSuccessPage />);

        expect(screen.getByText(/what's next\?/i)).toBeInTheDocument();
        expect(
            screen.getByText(/order confirmation email/i)
        ).toBeInTheDocument();
        expect(screen.getByText(/when your order ships/i)).toBeInTheDocument();
        expect(screen.getByText(/track your order/i)).toBeInTheDocument();
    });

    it('provides link to return to gallery', () => {
        renderWithProviders(<CheckoutSuccessPage />);

        const returnLink = screen.getByRole('link', {
            name: /return to gallery/i,
        });
        expect(returnLink).toBeInTheDocument();
        expect(returnLink).toHaveAttribute('href', '/gallery');
    });

    it('uses success styling (green theme)', () => {
        const { container } = renderWithProviders(<CheckoutSuccessPage />);

        // Check for green-themed elements
        const successBanner = container.querySelector('.bg-green-100');
        expect(successBanner).toBeInTheDocument();
    });

    it('renders in centered layout', () => {
        const { container } = renderWithProviders(<CheckoutSuccessPage />);

        const mainContainer = container.querySelector('.text-center');
        expect(mainContainer).toBeInTheDocument();
    });

    it('displays confirmation heading prominently', () => {
        renderWithProviders(<CheckoutSuccessPage />);

        const heading = screen.getByRole('heading', {
            name: /order confirmed!/i,
            level: 1,
        });
        expect(heading).toBeInTheDocument();
    });

    it('shows helpful next steps in list format', () => {
        renderWithProviders(<CheckoutSuccessPage />);

        // Check for list items with checkmarks
        const listItems = screen.getAllByText(/✅/);
        expect(listItems.length).toBeGreaterThan(0);
    });

    // New tests for useOrderPolling hook integration
    describe('useOrderPolling hook integration', () => {
        beforeEach(() => {
            vi.clearAllMocks();
            // Reset search params
            mockSearchParams = new URLSearchParams();
            // Default mock return value
            mockUseOrderPolling.mockReturnValue({
                order: null,
                loading: false,
                error: null,
                retryCount: 0,
            });
        });

        it('should show loading state while polling for order', () => {
            // Set session_id in search params
            mockSearchParams.set('session_id', 'cs_test_123');

            // Mock loading state
            mockUseOrderPolling.mockReturnValue({
                order: null,
                loading: true,
                error: null,
                retryCount: 1,
            });

            renderWithProviders(<CheckoutSuccessPage />);

            expect(
                screen.getByText(/loading order details/i)
            ).toBeInTheDocument();
            expect(mockUseOrderPolling).toHaveBeenCalledWith('cs_test_123');
        });

        it('should display order number when polling succeeds', async () => {
            // Set session_id in search params
            mockSearchParams.set('session_id', 'cs_test_123');

            // Mock successful order retrieval
            const mockOrder: Order = {
                id: 'order_123',
                orderNumber: 'ORD-2026-0001',
                customerName: 'Test User',
                customerEmail: 'test@example.com',
                shippingAddress: {
                    line1: '123 Test St',
                    city: 'Test City',
                    state: 'TS',
                    zip: '12345',
                    country: 'US',
                },
                billingAddress: {
                    line1: '123 Test St',
                    city: 'Test City',
                    state: 'TS',
                    zip: '12345',
                    country: 'US',
                },
                subtotal: 100,
                shippingCost: 10,
                taxAmount: 5,
                total: 115,
                status: 'paid',
                paymentStatus: 'succeeded',
                items: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            mockUseOrderPolling.mockReturnValue({
                order: mockOrder,
                loading: false,
                error: null,
                retryCount: 2,
            });

            renderWithProviders(<CheckoutSuccessPage />);

            await waitFor(() => {
                expect(screen.getByText('ORD-2026-0001')).toBeInTheDocument();
            });
            expect(mockUseOrderPolling).toHaveBeenCalledWith('cs_test_123');
        });

        it('should show polling timeout error message when retries exhausted', () => {
            // Set session_id in search params
            mockSearchParams.set('session_id', 'cs_test_123');

            // Mock error state after retries exhausted (polling timeout)
            mockUseOrderPolling.mockReturnValue({
                order: null,
                loading: false,
                error: {
                    type: 'not_found',
                    message:
                        'Order not found after multiple attempts. Please check your email for confirmation.',
                },
                retryCount: 5,
            });

            renderWithProviders(<CheckoutSuccessPage />);

            expect(
                screen.getByText(
                    /we're still processing your order.*you'll receive a confirmation email shortly/i
                )
            ).toBeInTheDocument();
            expect(mockUseOrderPolling).toHaveBeenCalledWith('cs_test_123');
        });

        it('should show API error message when API fails', () => {
            // Set session_id in search params
            mockSearchParams.set('session_id', 'cs_test_123');

            // Mock API error state
            mockUseOrderPolling.mockReturnValue({
                order: null,
                loading: false,
                error: {
                    type: 'api_error',
                    message: 'Failed to load order. Please try again.',
                },
                retryCount: 1,
            });

            renderWithProviders(<CheckoutSuccessPage />);

            expect(
                screen.getByText(
                    /unable to retrieve order details right now.*your payment was successful/i
                )
            ).toBeInTheDocument();
            expect(mockUseOrderPolling).toHaveBeenCalledWith('cs_test_123');
        });

        it('should handle session_id query parameter correctly', () => {
            // Set session_id in search params
            mockSearchParams.set('session_id', 'cs_test_abc123');

            mockUseOrderPolling.mockReturnValue({
                order: null,
                loading: true,
                error: null,
                retryCount: 0,
            });

            renderWithProviders(<CheckoutSuccessPage />);

            // Verify hook was called with correct session_id
            expect(mockUseOrderPolling).toHaveBeenCalledWith('cs_test_abc123');
        });

        it('should not poll when session_id is missing', () => {
            // No session_id in search params
            mockSearchParams = new URLSearchParams();

            mockUseOrderPolling.mockReturnValue({
                order: null,
                loading: false,
                error: null,
                retryCount: 0,
            });

            renderWithProviders(<CheckoutSuccessPage />);

            // Verify hook was called with null
            expect(mockUseOrderPolling).toHaveBeenCalledWith(null);
            // Should not show loading state
            expect(
                screen.queryByText(/loading order details/i)
            ).not.toBeInTheDocument();
        });
    });
});
