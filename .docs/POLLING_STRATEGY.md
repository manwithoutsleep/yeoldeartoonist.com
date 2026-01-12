# Polling Strategy

Custom hook to poll for order details with retry logic and exponential backoff

**Why polling exists:**
After successful Stripe payment, users are redirected to the success page immediately, but the Stripe webhook that creates the order in our database may not have completed yet. This creates a race condition where the success page loads before the order exists in the database. This hook polls the API with exponential backoff to handle this race condition gracefully.

**Polling Strategy:**

- Starts polling immediately when sessionId is provided
- Uses exponential backoff: 1s → 2s → 4s → 8s → 16s
- Stops on success (order found)
- Stops on API error (network failure, 500 error)
- Stops after 5 attempts if order not found (total wait time: ~31 seconds)
- Cleans up timeout on unmount to prevent memory leaks

**Retry Parameters:**

- MAX_RETRY_ATTEMPTS: 5 attempts
- Initial delay: 1000ms (1 second)
- Backoff multiplier: 2x per attempt
- Total polling duration: ~31 seconds (1 + 2 + 4 + 8 + 16)

**Error Handling:**

- `not_found`: Order doesn't exist yet (retries with backoff)
- `api_error`: Network or server error (stops immediately, no retry)
- After max attempts: Returns friendly error message suggesting user check email

param sessionId - Stripe checkout session ID (null to skip polling)
returns { order, loading, error, retryCount } - Polling state with full order object and debug info

## Examples

### Example

```tsx
// Basic usage in success page
function CheckoutSuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');

    const { order, loading, error, retryCount } = useOrderPolling(sessionId);

    if (loading) return <p>Loading order details...</p>;
    if (error) return <p>Error: {error.message}</p>;
    if (order) return <p>Order #{order.orderNumber} confirmed!</p>;
    return null;
}
```

### Example

```tsx
// With retry count display (for debugging)
function CheckoutSuccessContent() {
    const { order, loading, error, retryCount } = useOrderPolling(sessionId);

    return (
        <div>
            {loading && <p>Loading... (attempt {retryCount}/5)</p>}
            {order && <p>Order #{order.orderNumber}</p>}
            {error && <p>{error.message}</p>}
        </div>
    );
}
```

### Example

```tsx
// Conditional polling (skip if no sessionId)
function CheckoutSuccessContent() {
    const sessionId = getSessionIdFromURL(); // May return null

    // Hook handles null gracefully - won't poll if sessionId is null
    const { order, loading, error } = useOrderPolling(sessionId);

    if (!sessionId) return <p>Invalid checkout session</p>;
    // ... rest of component
}
```
