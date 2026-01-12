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
    } catch {
        // Network error or other fetch failure
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
 * Custom hook to poll for order details with retry logic and exponential backoff
 *
 * **Why polling exists:**
 * After successful Stripe payment, users are redirected to the success page immediately,
 * but the Stripe webhook that creates the order in our database may not have completed yet.
 * This creates a race condition where the success page loads before the order exists in the database.
 * This hook polls the API with exponential backoff to handle this race condition gracefully.
 *
 * **Polling Strategy:**
 * - Starts polling immediately when sessionId is provided
 * - Uses exponential backoff: 1s → 2s → 4s → 8s → 16s
 * - Stops on success (order found)
 * - Stops on API error (network failure, 500 error)
 * - Stops after 5 attempts if order not found (total wait time: ~31 seconds)
 * - Cleans up timeout on unmount to prevent memory leaks
 *
 * **Retry Parameters:**
 * - MAX_RETRY_ATTEMPTS: 5 attempts
 * - Initial delay: 1000ms (1 second)
 * - Backoff multiplier: 2x per attempt
 * - Total polling duration: ~31 seconds (1 + 2 + 4 + 8 + 16)
 *
 * **Error Handling:**
 * - `not_found`: Order doesn't exist yet (retries with backoff)
 * - `api_error`: Network or server error (stops immediately, no retry)
 * - After max attempts: Returns friendly error message suggesting user check email
 *
 * @param sessionId - Stripe checkout session ID (null to skip polling)
 * @returns { order, loading, error, retryCount } - Polling state with full order object and debug info
 *
 * @example
 * ```tsx
 * // Basic usage in success page
 * function CheckoutSuccessContent() {
 *   const searchParams = useSearchParams();
 *   const sessionId = searchParams.get('session_id');
 *
 *   const { order, loading, error, retryCount } = useOrderPolling(sessionId);
 *
 *   if (loading) return <p>Loading order details...</p>;
 *   if (error) return <p>Error: {error.message}</p>;
 *   if (order) return <p>Order #{order.orderNumber} confirmed!</p>;
 *   return null;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With retry count display (for debugging)
 * function CheckoutSuccessContent() {
 *   const { order, loading, error, retryCount } = useOrderPolling(sessionId);
 *
 *   return (
 *     <div>
 *       {loading && <p>Loading... (attempt {retryCount}/5)</p>}
 *       {order && <p>Order #{order.orderNumber}</p>}
 *       {error && <p>{error.message}</p>}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Conditional polling (skip if no sessionId)
 * function CheckoutSuccessContent() {
 *   const sessionId = getSessionIdFromURL(); // May return null
 *
 *   // Hook handles null gracefully - won't poll if sessionId is null
 *   const { order, loading, error } = useOrderPolling(sessionId);
 *
 *   if (!sessionId) return <p>Invalid checkout session</p>;
 *   // ... rest of component
 * }
 * ```
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
