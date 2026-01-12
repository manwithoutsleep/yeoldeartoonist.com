/**
 * Integration Tests for Checkout Success Page - Full Flow
 *
 * These tests verify the complete end-to-end user experience from payment
 * redirect through order retrieval, including:
 * - Race condition handling between page load and webhook completion
 * - Polling retry logic with exponential backoff
 * - User-friendly error messages on timeout or failure
 * - Full component rendering with actual API simulation
 *
 * Unlike unit tests that mock the useOrderPolling hook, these tests simulate
 * real fetch API behavior to test the FULL integration flow.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import CheckoutSuccessPage from '@/app/shoppe/checkout/success/page';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';
import type { Order } from '@/types/order';

/**
 * Helper function to render components with required providers
 */
function renderWithProviders(ui: React.ReactElement) {
    return render(
        <ToastProvider>
            <CartProvider>{ui}</CartProvider>
        </ToastProvider>
    );
}

// Mock next/navigation
let mockSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
    useSearchParams: () => mockSearchParams,
}));

// Mock useCart
const mockClearCart = vi.fn();
vi.mock('@/hooks/useCart', () => ({
    useCart: () => ({
        cart: { items: [], lastUpdated: Date.now() },
        clearCart: mockClearCart,
        addItem: vi.fn(),
        removeItem: vi.fn(),
        updateQuantity: vi.fn(),
        getTotal: vi.fn(() => 0),
        getItemCount: vi.fn(() => 0),
    }),
}));

// Mock global fetch API
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock order data
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
    paymentIntentId: 'pi_test_123',
    createdAt: '2026-01-11T00:00:00Z',
    updatedAt: '2026-01-11T00:00:00Z',
};

describe('Checkout Success Page - Full Integration Flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        mockSearchParams = new URLSearchParams();
        mockSearchParams.set('session_id', 'cs_test_123');
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    describe('Successful Order Retrieval Scenarios', () => {
        it('should successfully display order after polling when webhook creates order', async () => {
            /**
             * Scenario: Webhook completes quickly (before 3rd poll)
             * - User redirected to success page after payment
             * - First fetch: 404 (webhook hasn't created order yet)
             * - Second fetch: 404 (webhook still processing)
             * - Third fetch: 200 (webhook completed, order created)
             * - Expected: Loading → Success with order number
             */

            // Mock API responses: 404, 404, 200 (order appears on 3rd attempt)
            mockFetch
                .mockResolvedValueOnce({
                    ok: false,
                    status: 404,
                    json: async () => ({ error: 'Order not found' }),
                })
                .mockResolvedValueOnce({
                    ok: false,
                    status: 404,
                    json: async () => ({ error: 'Order not found' }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => ({ order: mockOrder }),
                });

            // Render the page
            renderWithProviders(<CheckoutSuccessPage />);

            // Step 1: Verify initial loading state
            expect(
                screen.getByText(/loading order details/i)
            ).toBeInTheDocument();
            expect(screen.queryByText(/ORD-2026-0001/)).not.toBeInTheDocument();

            // Step 2: Wait for first fetch (404)
            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledTimes(1);
            });

            // Verify still loading (not failed)
            expect(
                screen.getByText(/loading order details/i)
            ).toBeInTheDocument();

            // Step 3: Advance timer for first retry (1000ms exponential backoff)
            vi.advanceTimersByTime(1000);

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledTimes(2);
            });

            // Verify still loading after second 404
            expect(
                screen.getByText(/loading order details/i)
            ).toBeInTheDocument();

            // Step 4: Advance timer for second retry (2000ms exponential backoff)
            vi.advanceTimersByTime(2000);

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledTimes(3);
            });

            // Step 5: Wait for success state (order found)
            await waitFor(() => {
                expect(screen.queryByText(/loading order details/i)).toBeNull();
            });

            // Step 6: Verify order number is displayed
            expect(screen.getByText('ORD-2026-0001')).toBeInTheDocument();
            expect(screen.getByText(/order number/i)).toBeInTheDocument();
            expect(screen.queryByText(/error/i)).not.toBeInTheDocument();

            // Step 7: Verify fetch was called with correct sessionId
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/orders/by-session?sessionId=cs_test_123'
            );
        });

        it('should handle immediate success when webhook completes before page load', async () => {
            /**
             * Scenario: Webhook already completed (fast webhook)
             * - User redirected to success page
             * - First fetch: 200 (order already exists)
             * - Expected: Immediate success, no loading state
             */

            // Mock immediate success
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ order: mockOrder }),
            });

            // Render the page
            renderWithProviders(<CheckoutSuccessPage />);

            // Verify loading state appears briefly
            expect(
                screen.getByText(/loading order details/i)
            ).toBeInTheDocument();

            // Wait for order to load
            await waitFor(() => {
                expect(screen.queryByText(/loading order details/i)).toBeNull();
            });

            // Verify order number displayed immediately
            expect(screen.getByText('ORD-2026-0001')).toBeInTheDocument();
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });

        it('should handle race condition where order appears on 3rd poll attempt', async () => {
            /**
             * Scenario: Webhook takes ~5 seconds to complete
             * - First fetch (immediate): 404
             * - Second fetch (after 1s): 404
             * - Third fetch (after 2s more): 200
             * - Expected: Loading for ~3 seconds total, then success
             */

            // Mock the exact scenario from the spec
            mockFetch
                .mockResolvedValueOnce({
                    ok: false,
                    status: 404,
                    json: async () => ({ error: 'Order not found' }),
                })
                .mockResolvedValueOnce({
                    ok: false,
                    status: 404,
                    json: async () => ({ error: 'Order not found' }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => ({ order: mockOrder }),
                });

            renderWithProviders(<CheckoutSuccessPage />);

            // Wait for first attempt
            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledTimes(1);
            });

            // Still loading after first 404
            expect(
                screen.getByText(/loading order details/i)
            ).toBeInTheDocument();

            // Advance to second retry (1000ms)
            vi.advanceTimersByTime(1000);

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledTimes(2);
            });

            // Still loading after second 404
            expect(
                screen.getByText(/loading order details/i)
            ).toBeInTheDocument();

            // Advance to third retry (2000ms)
            vi.advanceTimersByTime(2000);

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledTimes(3);
            });

            // Wait for success
            await waitFor(() => {
                expect(screen.getByText('ORD-2026-0001')).toBeInTheDocument();
            });

            // Verify no error shown
            expect(
                screen.queryByText(/still processing/i)
            ).not.toBeInTheDocument();
        });
    });

    describe('Error Handling Scenarios', () => {
        it('should show final error after max retries when order never appears', async () => {
            /**
             * Scenario: Webhook fails or takes too long
             * - All 5 fetch attempts return 404
             * - Expected: User-friendly error message after max retries
             */

            // All attempts fail (5 max retries)
            mockFetch.mockResolvedValue({
                ok: false,
                status: 404,
                json: async () => ({ error: 'Order not found' }),
            });

            renderWithProviders(<CheckoutSuccessPage />);

            // Wait for all retries (5 attempts total)
            const delays = [0, 1000, 2000, 4000, 8000]; // Exponential backoff delays

            for (let i = 0; i < 5; i++) {
                await waitFor(() => {
                    expect(mockFetch).toHaveBeenCalledTimes(i + 1);
                });

                if (i < 4) {
                    // Advance to next retry (exponential backoff)
                    vi.advanceTimersByTime(delays[i + 1]);
                }
            }

            // Wait for error state
            await waitFor(() => {
                expect(screen.queryByText(/loading order details/i)).toBeNull();
            });

            // Verify user-friendly error message (not found type)
            // Use more specific selector to avoid "What's Next" section
            const errorContainer = screen
                .getByText(/still processing your order/i)
                .closest('.bg-yellow-50');
            expect(errorContainer).toBeInTheDocument();
            expect(errorContainer).toHaveTextContent(
                /confirmation email shortly/i
            );

            // Verify order number is NOT displayed
            expect(screen.queryByText(/ORD-2026-0001/)).not.toBeInTheDocument();

            // Verify exactly 5 attempts were made
            expect(mockFetch).toHaveBeenCalledTimes(5);
        });

        it('should show API error immediately on 500 response', async () => {
            /**
             * Scenario: API error (not a race condition)
             * - First fetch returns 500
             * - Expected: Immediate error, no retries
             */

            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => ({ error: 'Internal server error' }),
            });

            renderWithProviders(<CheckoutSuccessPage />);

            // Wait for error state
            await waitFor(() => {
                expect(screen.queryByText(/loading order details/i)).toBeNull();
            });

            // Verify API error message is shown
            expect(
                screen.getByText(/unable to retrieve order details/i)
            ).toBeInTheDocument();
            expect(
                screen.getByText(/payment was successful/i)
            ).toBeInTheDocument();

            // Verify no retries (only 1 attempt)
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });

        it('should show API error immediately on network failure', async () => {
            /**
             * Scenario: Network error during fetch
             * - Fetch throws network error
             * - Expected: Immediate error, no retries
             */

            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            renderWithProviders(<CheckoutSuccessPage />);

            // Wait for error state
            await waitFor(() => {
                expect(screen.queryByText(/loading order details/i)).toBeNull();
            });

            // Verify API error message is shown
            expect(
                screen.getByText(/unable to retrieve order details/i)
            ).toBeInTheDocument();

            // Verify no retries
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });
    });

    describe('User Experience Flow', () => {
        it('should complete full user journey: loading → success → confirmation', async () => {
            /**
             * Full happy path integration test:
             * 1. User lands on success page after payment
             * 2. Page shows loading state
             * 3. Webhook completes, order found after 2 retries
             * 4. Order number displayed
             * 5. User sees next steps
             * 6. Cart is cleared
             */

            // Mock webhook delay (order appears on 3rd attempt)
            mockFetch
                .mockResolvedValueOnce({
                    ok: false,
                    status: 404,
                    json: async () => ({ error: 'Order not found' }),
                })
                .mockResolvedValueOnce({
                    ok: false,
                    status: 404,
                    json: async () => ({ error: 'Order not found' }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => ({ order: mockOrder }),
                });

            renderWithProviders(<CheckoutSuccessPage />);

            // Step 1: Verify initial success banner appears immediately
            expect(screen.getByText(/order confirmed!/i)).toBeInTheDocument();
            expect(
                screen.getByText(/thank you for your purchase/i)
            ).toBeInTheDocument();

            // Step 2: Verify loading state for order details
            expect(
                screen.getByText(/loading order details/i)
            ).toBeInTheDocument();

            // Step 3: Verify cart was cleared
            expect(mockClearCart).toHaveBeenCalledTimes(1);

            // Step 4: Wait through polling attempts
            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledTimes(1);
            });

            vi.advanceTimersByTime(1000);

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledTimes(2);
            });

            vi.advanceTimersByTime(2000);

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledTimes(3);
            });

            // Step 5: Wait for success state
            await waitFor(() => {
                expect(screen.getByText('ORD-2026-0001')).toBeInTheDocument();
            });

            // Step 6: Verify order number section
            expect(screen.getByText(/order number/i)).toBeInTheDocument();

            // Step 7: Verify "What's Next" section
            expect(screen.getByText(/what's next\?/i)).toBeInTheDocument();
            expect(
                screen.getByText(/order confirmation email/i)
            ).toBeInTheDocument();

            // Step 8: Verify return link
            const returnLink = screen.getByRole('link', {
                name: /return to gallery/i,
            });
            expect(returnLink).toHaveAttribute('href', '/gallery');

            // Step 9: Verify no error messages
            expect(
                screen.queryByText(/still processing/i)
            ).not.toBeInTheDocument();
            expect(
                screen.queryByText(/unable to retrieve/i)
            ).not.toBeInTheDocument();
        });

        it('should complete full error journey: loading → timeout → helpful message', async () => {
            /**
             * Full error path integration test:
             * 1. User lands on success page
             * 2. Page shows loading state
             * 3. All polling attempts fail (webhook delayed)
             * 4. User sees helpful error message (not technical)
             * 5. Success banner still visible (payment succeeded)
             * 6. User can still navigate away
             */

            // All attempts fail
            mockFetch.mockResolvedValue({
                ok: false,
                status: 404,
                json: async () => ({ error: 'Order not found' }),
            });

            renderWithProviders(<CheckoutSuccessPage />);

            // Step 1: Verify success banner (payment succeeded)
            expect(screen.getByText(/order confirmed!/i)).toBeInTheDocument();

            // Step 2: Verify loading state
            expect(
                screen.getByText(/loading order details/i)
            ).toBeInTheDocument();

            // Step 3: Exhaust all retries
            for (let i = 0; i < 5; i++) {
                await waitFor(() => {
                    expect(mockFetch).toHaveBeenCalledTimes(i + 1);
                });

                if (i < 4) {
                    const delays = [1000, 2000, 4000, 8000];
                    vi.advanceTimersByTime(delays[i]);
                }
            }

            // Step 4: Wait for error state
            await waitFor(() => {
                expect(screen.queryByText(/loading order details/i)).toBeNull();
            });

            // Step 5: Verify user-friendly error message
            const errorMessage = screen.getByText(
                /still processing your order/i
            );
            expect(errorMessage).toBeInTheDocument();
            // Use the error container to verify the specific message (not from "What's Next")
            const errorContainer = errorMessage.closest('.bg-yellow-50');
            expect(errorContainer).toHaveTextContent(
                /confirmation email shortly/i
            );

            // Step 6: Verify success banner still visible (reassurance)
            expect(screen.getByText(/order confirmed!/i)).toBeInTheDocument();

            // Step 7: Verify "What's Next" section still shows
            expect(screen.getByText(/what's next\?/i)).toBeInTheDocument();

            // Step 8: Verify return link still available
            const returnLink = screen.getByRole('link', {
                name: /return to gallery/i,
            });
            expect(returnLink).toBeInTheDocument();

            // Step 9: Verify no technical error details shown
            expect(
                screen.queryByText(/failed to load order/i)
            ).not.toBeInTheDocument();
            expect(screen.queryByText(/500/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/error 404/i)).not.toBeInTheDocument();
        });

        it('should handle missing session_id gracefully', async () => {
            /**
             * Scenario: User navigates to page without session_id
             * - No sessionId in URL
             * - Expected: Success message, but no order polling
             */

            // Clear session_id from URL
            mockSearchParams = new URLSearchParams();

            renderWithProviders(<CheckoutSuccessPage />);

            // Verify success banner shows
            expect(screen.getByText(/order confirmed!/i)).toBeInTheDocument();

            // Verify no loading state
            expect(
                screen.queryByText(/loading order details/i)
            ).not.toBeInTheDocument();

            // Verify no order number section
            expect(screen.queryByText(/order number/i)).not.toBeInTheDocument();

            // Verify no fetch calls
            expect(mockFetch).not.toHaveBeenCalled();

            // Verify "What's Next" section still shows
            expect(screen.getByText(/what's next\?/i)).toBeInTheDocument();
        });
    });

    describe('Polling Behavior Validation', () => {
        it('should use exponential backoff delays correctly', async () => {
            /**
             * Verify polling uses correct timing:
             * - 1st retry: 1000ms (1s)
             * - 2nd retry: 2000ms (2s)
             * - 3rd retry: 4000ms (4s)
             * - 4th retry: 8000ms (8s)
             */

            mockFetch.mockResolvedValue({
                ok: false,
                status: 404,
                json: async () => ({ error: 'Order not found' }),
            });

            renderWithProviders(<CheckoutSuccessPage />);

            // First attempt (immediate)
            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledTimes(1);
            });

            // Second attempt after 1000ms
            vi.advanceTimersByTime(999);
            expect(mockFetch).toHaveBeenCalledTimes(1); // Not yet
            vi.advanceTimersByTime(1);
            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledTimes(2);
            });

            // Third attempt after 2000ms more
            vi.advanceTimersByTime(1999);
            expect(mockFetch).toHaveBeenCalledTimes(2); // Not yet
            vi.advanceTimersByTime(1);
            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledTimes(3);
            });

            // Fourth attempt after 4000ms more
            vi.advanceTimersByTime(3999);
            expect(mockFetch).toHaveBeenCalledTimes(3); // Not yet
            vi.advanceTimersByTime(1);
            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledTimes(4);
            });

            // Fifth attempt after 8000ms more
            vi.advanceTimersByTime(7999);
            expect(mockFetch).toHaveBeenCalledTimes(4); // Not yet
            vi.advanceTimersByTime(1);
            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledTimes(5);
            });

            // No more retries after 5th attempt
            vi.advanceTimersByTime(10000);
            expect(mockFetch).toHaveBeenCalledTimes(5);
        });

        it('should stop polling immediately on success', async () => {
            /**
             * Verify polling stops when order is found
             * - No unnecessary retries after success
             */

            mockFetch
                .mockResolvedValueOnce({
                    ok: false,
                    status: 404,
                    json: async () => ({ error: 'Order not found' }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => ({ order: mockOrder }),
                });

            renderWithProviders(<CheckoutSuccessPage />);

            // First attempt
            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledTimes(1);
            });

            // Second attempt (succeeds)
            vi.advanceTimersByTime(1000);
            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledTimes(2);
            });

            // Wait for success state
            await waitFor(() => {
                expect(screen.getByText('ORD-2026-0001')).toBeInTheDocument();
            });

            // Verify no more fetches after success
            vi.advanceTimersByTime(10000);
            expect(mockFetch).toHaveBeenCalledTimes(2); // No additional calls
        });

        it('should stop polling immediately on API error', async () => {
            /**
             * Verify polling stops on API errors (not 404)
             * - No retries for 500 errors
             */

            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => ({ error: 'Server error' }),
            });

            renderWithProviders(<CheckoutSuccessPage />);

            // Wait for error state
            await waitFor(() => {
                expect(screen.queryByText(/loading order details/i)).toBeNull();
            });

            // Verify no retries attempted
            expect(mockFetch).toHaveBeenCalledTimes(1);

            // Advance timers significantly
            vi.advanceTimersByTime(20000);

            // Verify still only 1 call
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });
    });
});
