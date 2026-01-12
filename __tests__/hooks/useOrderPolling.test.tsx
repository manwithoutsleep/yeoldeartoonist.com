import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    useOrderPolling,
    calculateRetryDelay,
    fetchOrderBySession,
} from '@/hooks/useOrderPolling';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useOrderPolling', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it('should return loading state initially when sessionId is provided', () => {
        // Arrange
        const sessionId = 'cs_test_123';
        mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

        // Act
        const { result } = renderHook(() => useOrderPolling(sessionId));

        // Assert
        expect(result.current.loading).toBe(true);
        expect(result.current.order).toBeNull();
        expect(result.current.error).toBeNull();
    });

    it('should fetch order successfully on first attempt', async () => {
        // Arrange
        const sessionId = 'cs_test_123';
        const mockOrder = {
            id: 'order_123',
            user_email: 'test@example.com',
            status: 'pending',
            total: 100,
            created_at: '2026-01-11T00:00:00Z',
            updated_at: '2026-01-11T00:00:00Z',
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ order: mockOrder }),
        });

        // Act
        const { result } = renderHook(() => useOrderPolling(sessionId));

        // Wait for the fetch to complete
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Assert
        expect(result.current.order).toEqual(mockOrder);
        expect(result.current.error).toBeNull();
        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(mockFetch).toHaveBeenCalledWith(
            `/api/checkout/session/${sessionId}`
        );
    });

    it('should retry fetching when API returns 404', async () => {
        // Arrange
        const sessionId = 'cs_test_123';
        const mockOrder = {
            id: 'order_123',
            user_email: 'test@example.com',
            status: 'pending',
            total: 100,
            created_at: '2026-01-11T00:00:00Z',
            updated_at: '2026-01-11T00:00:00Z',
        };

        // First two calls return 404, third call succeeds
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

        // Act
        const { result } = renderHook(() => useOrderPolling(sessionId));

        // Wait for first attempt
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });

        // Advance timer for first retry (exponential backoff: 1000ms)
        vi.advanceTimersByTime(1000);

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledTimes(2);
        });

        // Advance timer for second retry (exponential backoff: 2000ms)
        vi.advanceTimersByTime(2000);

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledTimes(3);
        });

        // Wait for final success
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Assert
        expect(result.current.order).toEqual(mockOrder);
        expect(result.current.error).toBeNull();
    });

    it('should stop retrying after max attempts and set error', async () => {
        // Arrange
        const sessionId = 'cs_test_123';
        const maxAttempts = 5;

        // All calls return 404
        mockFetch.mockResolvedValue({
            ok: false,
            status: 404,
            json: async () => ({ error: 'Order not found' }),
        });

        // Act
        const { result } = renderHook(() => useOrderPolling(sessionId));

        // Simulate all retry attempts
        for (let i = 0; i < maxAttempts; i++) {
            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledTimes(i + 1);
            });

            if (i < maxAttempts - 1) {
                // Advance timer for next retry (exponential backoff)
                const delay = Math.min(1000 * Math.pow(2, i), 10000);
                vi.advanceTimersByTime(delay);
            }
        }

        // Wait for error state
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Assert
        expect(result.current.order).toBeNull();
        expect(result.current.error).toEqual({
            type: 'not_found',
            message:
                'Order not found after multiple attempts. Please check your email for confirmation.',
        });
        expect(mockFetch).toHaveBeenCalledTimes(maxAttempts);
    });

    it('should not fetch when sessionId is null', () => {
        // Arrange
        const sessionId = null;

        // Act
        const { result } = renderHook(() => useOrderPolling(sessionId));

        // Assert
        expect(result.current.loading).toBe(false);
        expect(result.current.order).toBeNull();
        expect(result.current.error).toBeNull();
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should handle API errors (500, network failures)', async () => {
        // Arrange - Test 500 error
        const sessionId = 'cs_test_123';
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Internal server error' }),
        });

        // Act
        const { result } = renderHook(() => useOrderPolling(sessionId));

        // Wait for error state
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Assert for 500 error
        expect(result.current.order).toBeNull();
        expect(result.current.error).toEqual({
            type: 'api_error',
            message: 'Failed to load order. Please try again.',
        });
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle network failures', async () => {
        // Arrange - Test network failure
        const sessionId = 'cs_test_456';
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        // Act
        const { result } = renderHook(() => useOrderPolling(sessionId));

        // Wait for error state
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Assert for network error
        expect(result.current.order).toBeNull();
        expect(result.current.error).toEqual({
            type: 'api_error',
            message: 'Failed to load order. Please try again.',
        });
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should apply exponential backoff between retries', async () => {
        // Arrange
        const sessionId = 'cs_test_backoff';
        const expectedDelays = [1000, 2000, 4000, 8000]; // Exponential: 1s, 2s, 4s, 8s

        // All calls return 404
        mockFetch.mockResolvedValue({
            ok: false,
            status: 404,
            json: async () => ({ error: 'Order not found' }),
        });

        // Act
        const { result } = renderHook(() => useOrderPolling(sessionId));

        // Wait for first attempt
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });

        // Verify each retry with correct delay
        for (let i = 0; i < 4; i++) {
            // Advance timer by expected delay
            vi.advanceTimersByTime(expectedDelays[i]);

            // Wait for next fetch
            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledTimes(i + 2);
            });
        }

        // Wait for final error state
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Assert exponential backoff pattern
        expect(mockFetch).toHaveBeenCalledTimes(5);
        expect(result.current.error).toEqual({
            type: 'not_found',
            message:
                'Order not found after multiple attempts. Please check your email for confirmation.',
        });
    });

    it('should distinguish between "not found yet" and "API error" states', async () => {
        // Arrange - Test that 404 retries but 500 doesn't
        const sessionId = 'cs_test_error_types';

        // First test: 404 should trigger retry
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 404,
            json: async () => ({ error: 'Order not found' }),
        });

        // Act
        const { result, unmount } = renderHook(() =>
            useOrderPolling(sessionId)
        );

        // Wait for first attempt
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });

        // Assert: Still loading (will retry)
        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBeNull();

        // Clean up this test
        unmount();
        vi.clearAllMocks();

        // Second test: 500 should NOT trigger retry
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Internal server error' }),
        });

        // Act
        const { result: result2 } = renderHook(() =>
            useOrderPolling(sessionId)
        );

        // Wait for error state
        await waitFor(() => {
            expect(result2.current.loading).toBe(false);
        });

        // Assert: Error set immediately, no retry
        expect(result2.current.error).toEqual({
            type: 'api_error',
            message: 'Failed to load order. Please try again.',
        });
        expect(mockFetch).toHaveBeenCalledTimes(1); // Only one attempt
    });

    it('should expose retry attempt count for debugging', async () => {
        // Arrange
        const sessionId = 'cs_test_retry_count';
        const mockOrder = {
            id: 'order_123',
            user_email: 'test@example.com',
            status: 'pending',
            total: 100,
            created_at: '2026-01-11T00:00:00Z',
            updated_at: '2026-01-11T00:00:00Z',
        };

        // First two calls return 404, third call succeeds
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

        // Act
        const { result } = renderHook(() => useOrderPolling(sessionId));

        // Wait for first attempt
        await waitFor(() => {
            expect(result.current.retryCount).toBe(1);
        });

        // Advance timer for first retry
        vi.advanceTimersByTime(1000);

        await waitFor(() => {
            expect(result.current.retryCount).toBe(2);
        });

        // Advance timer for second retry
        vi.advanceTimersByTime(2000);

        await waitFor(() => {
            expect(result.current.retryCount).toBe(3);
        });

        // Wait for final success
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Assert
        expect(result.current.order).toEqual(mockOrder);
        expect(result.current.retryCount).toBe(3); // Final count is 3
    });

    it('should cleanup polling on unmount', async () => {
        // Arrange
        const sessionId = 'cs_test_123';

        mockFetch.mockResolvedValue({
            ok: false,
            status: 404,
            json: async () => ({ error: 'Order not found' }),
        });

        // Act
        const { unmount } = renderHook(() => useOrderPolling(sessionId));

        // Wait for first fetch
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });

        // Unmount while polling is active
        unmount();

        // Clear previous fetch calls count
        const fetchCountBeforeUnmount = mockFetch.mock.calls.length;

        // Advance timer to trigger what would be the next retry
        vi.advanceTimersByTime(1000);

        // Allow any pending promises to settle
        await waitFor(() => {
            // No additional fetches should occur after unmount
            expect(mockFetch).toHaveBeenCalledTimes(fetchCountBeforeUnmount);
        });

        // Assert: No new fetches after unmount
        expect(mockFetch).toHaveBeenCalledTimes(fetchCountBeforeUnmount);
    });

    it('should cleanup and restart polling when sessionId changes', async () => {
        // Arrange
        const firstSessionId = 'cs_test_123';
        const secondSessionId = 'cs_test_456';
        const mockOrder = {
            id: 'order_456',
            user_email: 'test@example.com',
            status: 'pending',
            total: 200,
            created_at: '2026-01-11T00:00:00Z',
            updated_at: '2026-01-11T00:00:00Z',
        };

        // First session returns 404 (keeps polling)
        mockFetch.mockResolvedValue({
            ok: false,
            status: 404,
            json: async () => ({ error: 'Order not found' }),
        });

        // Act - Start with first sessionId
        const { result, rerender } = renderHook(
            ({ sessionId }) => useOrderPolling(sessionId),
            { initialProps: { sessionId: firstSessionId } }
        );

        // Wait for first attempt
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                `/api/checkout/session/${firstSessionId}`
            );
        });

        // Clear mock and provide successful response for second session
        mockFetch.mockClear();
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ order: mockOrder }),
        });

        // Change sessionId
        rerender({ sessionId: secondSessionId });

        // Assert
        // 1. Old polling should stop (no more calls to first sessionId)
        vi.advanceTimersByTime(5000);
        expect(mockFetch).not.toHaveBeenCalledWith(
            `/api/checkout/session/${firstSessionId}`
        );

        // 2. New polling should start
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                `/api/checkout/session/${secondSessionId}`
            );
        });

        // 3. Result should show new order
        await waitFor(() => {
            expect(result.current.order).toEqual(mockOrder);
        });
    });
});

describe('calculateRetryDelay', () => {
    it('should calculate exponential backoff correctly', () => {
        // Test exponential growth pattern
        expect(calculateRetryDelay(1)).toBe(1000); // 1000 * 2^0
        expect(calculateRetryDelay(2)).toBe(2000); // 1000 * 2^1
        expect(calculateRetryDelay(3)).toBe(4000); // 1000 * 2^2
        expect(calculateRetryDelay(4)).toBe(8000); // 1000 * 2^3
        expect(calculateRetryDelay(5)).toBe(16000); // 1000 * 2^4
    });

    it('should support custom initial delay', () => {
        expect(calculateRetryDelay(1, 500)).toBe(500); // 500 * 2^0
        expect(calculateRetryDelay(2, 500)).toBe(1000); // 500 * 2^1
        expect(calculateRetryDelay(3, 500)).toBe(2000); // 500 * 2^2
    });
});

describe('fetchOrderBySession', () => {
    it('should return order on successful response', async () => {
        // Arrange
        const mockOrder = {
            id: 'order_123',
            user_email: 'test@example.com',
            status: 'pending',
            total: 100,
            created_at: '2026-01-11T00:00:00Z',
            updated_at: '2026-01-11T00:00:00Z',
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ order: mockOrder }),
        });

        // Act
        const result = await fetchOrderBySession('cs_test_123');

        // Assert
        expect(result.order).toEqual(mockOrder);
        expect(result.error).toBeNull();
    });

    it('should return not_found error on 404', async () => {
        // Arrange
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 404,
            json: async () => ({ error: 'Order not found' }),
        });

        // Act
        const result = await fetchOrderBySession('cs_test_123');

        // Assert
        expect(result.order).toBeNull();
        expect(result.error).toEqual({
            type: 'not_found',
            message: 'Order not found yet',
        });
    });

    it('should return api_error on 500', async () => {
        // Arrange
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Internal server error' }),
        });

        // Act
        const result = await fetchOrderBySession('cs_test_123');

        // Assert
        expect(result.order).toBeNull();
        expect(result.error).toEqual({
            type: 'api_error',
            message: 'Failed to load order. Please try again.',
        });
    });

    it('should return api_error on network failure', async () => {
        // Arrange
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        // Act
        const result = await fetchOrderBySession('cs_test_123');

        // Assert
        expect(result.order).toBeNull();
        expect(result.error).toEqual({
            type: 'api_error',
            message: 'Failed to load order. Please try again.',
        });
    });
});
