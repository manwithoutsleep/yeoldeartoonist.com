import { useEffect, useState } from 'react';
import type { Order } from '@/types/order';

// Discriminated union for error types
type OrderError =
    | { type: 'not_found'; message: string }
    | { type: 'api_error'; message: string };

/**
 * Calculate exponential backoff delay for retry attempts
 * Pure function for testability (SRP - Single Responsibility Principle)
 *
 * @param attemptNumber - Current attempt number (1-indexed)
 * @param initialDelayMs - Initial delay in milliseconds (default: 1000)
 * @returns Delay in milliseconds for next retry
 */
export function calculateRetryDelay(
    attemptNumber: number,
    initialDelayMs: number = 1000
): number {
    return initialDelayMs * Math.pow(2, attemptNumber - 1);
}

/**
 * Fetch order by Stripe session ID
 * Extracted for easier testing (SRP)
 *
 * @param sessionId - Stripe checkout session ID
 * @returns Promise with order data or error
 */
export async function fetchOrderBySession(sessionId: string): Promise<{
    order: Order | null;
    error: OrderError | null;
}> {
    try {
        const response = await fetch(`/api/checkout/session/${sessionId}`);

        if (response.ok) {
            const data = await response.json();
            return { order: data.order, error: null };
        }

        if (response.status === 404) {
            return {
                order: null,
                error: {
                    type: 'not_found',
                    message: 'Order not found yet',
                },
            };
        }

        // Any other HTTP error (500, etc.)
        return {
            order: null,
            error: {
                type: 'api_error',
                message: 'Failed to load order. Please try again.',
            },
        };
    } catch (err) {
        // Network error or other fetch failure
        const errorMessage =
            err instanceof Error ? err.message : 'Unknown error';

        // Log error for debugging (useful for production troubleshooting)
        console.error('Failed to fetch order:', errorMessage, { sessionId });

        return {
            order: null,
            error: {
                type: 'api_error',
                message: 'Failed to load order. Please try again.',
            },
        };
    }
}

/**
 * Polls for order details with exponential backoff.
 *
 * See `.docs/POLLING_STRATEGY.md` for detailed implementation notes.
 *
 * @param sessionId - Stripe checkout session ID
 * @returns Polling state with order data
 */
export function useOrderPolling(sessionId: string | null): {
    order: Order | null;
    loading: boolean;
    error: OrderError | null;
    retryCount: number;
} {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState<boolean>(sessionId !== null);
    const [error, setError] = useState<OrderError | null>(null);
    const [retryCount, setRetryCount] = useState<number>(0);

    useEffect(() => {
        // Skip polling if no sessionId provided
        if (!sessionId) {
            setLoading(false);
            return;
        }

        let isMounted = true;
        let timeoutId: NodeJS.Timeout | null = null;
        let attemptCount = 0;

        const MAX_RETRY_ATTEMPTS = 5;

        const pollOrder = async () => {
            if (!isMounted) return;

            attemptCount++;
            setRetryCount(attemptCount);

            const { order: fetchedOrder, error: fetchError } =
                await fetchOrderBySession(sessionId);

            if (!isMounted) return;

            if (fetchedOrder) {
                // Success - order found
                setOrder(fetchedOrder);
                setLoading(false);
                setError(null);
                return;
            }

            if (fetchError) {
                if (fetchError.type === 'not_found') {
                    // Order not found yet - retry if attempts remaining
                    if (attemptCount >= MAX_RETRY_ATTEMPTS) {
                        setError({
                            type: 'not_found',
                            message:
                                'Order not found after multiple attempts. Please check your email for confirmation.',
                        });
                        setLoading(false);
                        return;
                    }

                    // Schedule retry with exponential backoff
                    const delay = calculateRetryDelay(attemptCount);
                    timeoutId = setTimeout(() => {
                        void pollOrder();
                    }, delay);
                    return;
                }

                if (fetchError.type === 'api_error') {
                    // API or network error - stop immediately
                    setError(fetchError);
                    setLoading(false);
                    return;
                }
            }
        };

        // Start polling
        void pollOrder();

        // Cleanup function
        return () => {
            isMounted = false;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [sessionId]);

    return { order, loading, error, retryCount };
}
