# Manual Testing Checklist - Issue #85: Order Retrieval Fix

**Feature**: Order confirmation page polling mechanism
**Branch**: `issue-85-fix-order-retrieval-error`
**Testing Environment**: Local development (`npm run dev`)
**Prerequisites**: Stripe test mode configured, local Supabase running

---

## Pre-Testing Setup

### 1. Environment Verification

- [x] Local development server running (`npm run dev` at http://localhost:3000)
- [x] Supabase local instance running (`npm run db:start`)
- [x] Stripe test mode API keys configured in `.env.local`
- [x] Browser DevTools open (Console + Network tabs visible)

### 2. Test Data Preparation

**Stripe Test Cards** (from [Stripe Testing Documentation](https://stripe.com/docs/testing)):

- **Success**: `4242 4242 4242 4242` (Use any future expiry date, any CVC)
- **Decline**: `4000 0000 0000 0002` (For testing payment failures)

**Test Products**: Ensure at least one artwork is available for purchase in the shoppe.

---

## Test Case 1: Normal Flow (Webhook Faster Than Polling)

**Objective**: Verify that order number appears immediately when webhook completes before polling starts.

### Steps

1. [x] Navigate to shoppe: http://localhost:3000/shoppe
2. [x] Add any artwork to cart (click "Add to Cart" button)
3. [x] Click "Checkout" button in cart
4. [x] Fill in Stripe checkout form:
    - Email: `test@example.com`
    - Card: `4242 4242 4242 4242`
    - Expiry: `12/34` (any future date)
    - CVC: `123` (any 3 digits)
    - Name: `Test Customer`
5. [x] Click "Pay" button
6. [x] Observe redirect to success page (`/shoppe/checkout/success?session_id=...`)

### Expected Results

- [x] Success page displays "Order Confirmed!" heading immediately
- [x] Loading state visible briefly or not at all (< 2 seconds)
- [x] Order number appears (format: starts with "ORD-" followed by numbers)
- [x] No error messages visible
- [x] Browser console shows no errors
- [x] Network tab shows 1-2 requests to `/api/checkout/session/[sessionId]` endpoint

### Verification

- [x] Check Supabase database: Order exists with matching `payment_intent_id`
- [x] Order status is `pending` or `completed`
- [x] Order total matches the paid amount

---

## Test Case 2: Delayed Webhook (Simulated Race Condition)

**Objective**: Verify polling mechanism handles webhook delays gracefully.

### Setup (Simulate Delay)

**Option A: Comment Out Order Creation** (recommended for testing)

1. [x] Open `src/app/api/webhooks/stripe/route.ts`
2. [x] Find the `checkout.session.completed` handler
3. [x] Comment out the order creation code (lines that call `createOrder` or insert into database)
4. [x] Save the file (Next.js will hot-reload)

**Option B: Add Artificial Delay**

```typescript
// In webhook handler, add before order creation:
await new Promise((resolve) => setTimeout(resolve, 15000)); // 15 second delay
```

### Steps

1. [x] With webhook disabled/delayed, navigate to shoppe
2. [x] Add artwork to cart and proceed to checkout
3. [x] Complete payment with test card `4242 4242 4242 4242`
4. [x] Observe success page behavior

### Expected Results (During Polling)

- [x] Success page displays "Order Confirmed!" heading
- [x] Loading spinner or "Loading order details..." message visible
- [x] Network tab shows repeated requests to `/api/checkout/session/[sessionId]`
- [x] Requests appear at increasing intervals (1s, 1.5s, 2.25s, etc.)
- [x] Polling continues for approximately 20 seconds

### Expected Results (After Timeout)

- [x] After ~20 seconds, polling stops (10 retries exhausted)
- [x] Friendly message appears: "We're still processing your order. You'll receive a confirmation email shortly."
- [x] No technical error messages visible
- [x] No browser console errors

### Cleanup

1. [x] Re-enable webhook processing (uncomment order creation code or remove delay)
2. [x] (Optional) Manually create the order in database to verify webhook would work
3. [x] Restart dev server if needed

---

## Test Case 3: Missing session_id Parameter

**Objective**: Verify graceful handling when user navigates directly to success page.

### Steps

1. [x] Manually navigate to: http://localhost:3000/shoppe/checkout/success
2. [x] Observe page behavior

### Expected Results

- [x] Page displays "Order Confirmed!" heading
- [x] No loading state visible (no polling initiated)
- [x] No error messages visible
- [x] Generic success message shown (no order number displayed)
- [x] Browser console shows no errors
- [x] Network tab shows no API requests to `/api/checkout/session/`

### Rationale

User may bookmark the success page or navigate there directly. Should degrade gracefully without attempting to poll for non-existent session.

---

## Test Case 4: Invalid session_id Parameter

**Objective**: Verify error handling for malformed or expired session IDs.

### Steps

1. [x] Navigate to: http://localhost:3000/shoppe/checkout/success?session_id=cs_invalid_12345
2. [x] Observe page behavior

### Expected Results (During Polling)

- [x] Page displays "Order Confirmed!" heading
- [x] Loading state visible initially
- [x] Network tab shows repeated API calls to `/api/checkout/session/cs_invalid_12345`
- [x] Each API call returns 404 or 500 error
- [x] Polling continues for ~20 seconds (10 retries)

### Expected Results (After Timeout)

- [x] After retries exhausted, error message appears
- [x] Message should be user-friendly (NOT "404 Not Found")
- [x] Example: "Unable to retrieve order details right now. Don't worry - your payment was successful."
- [x] Browser console may show network errors (acceptable for invalid session)

### Verification

- [x] Check database: No order exists with session_id `cs_invalid_12345`
- [x] No crash or blank page
- [x] User is still informed payment succeeded

---

## Test Case 5: Network Error During Polling

**Objective**: Verify resilience to network failures.

### Setup (Simulate Network Failure)

1. [x] Complete a real checkout flow (Test Case 1)
2. [x] On the success page, open Browser DevTools
3. [x] Go to Network tab → Throttling dropdown
4. [x] Select "Offline" mode BEFORE the polling completes

### Expected Results

- [x] Polling attempts continue (fetch errors are caught)
- [x] No unhandled promise rejections in console
- [x] After retries exhausted, shows user-friendly error message
- [x] Page doesn't crash or become unresponsive

### Cleanup

- [x] Return network to "No throttling" mode

---

## Test Case 6: Browser Navigation During Polling

**Objective**: Verify cleanup of polling timers when user navigates away.

### Steps

1. [x] Simulate delayed webhook (Test Case 2 setup)
2. [x] Start checkout and reach success page (polling starts)
3. [x] While loading state is visible, click browser Back button
4. [x] Navigate forward again to success page
5. [x] Navigate to another page entirely (e.g., home page)

### Expected Results

- [x] No memory leaks (polling timers are cleaned up)
- [x] Browser console shows no errors
- [x] If you return to success page, polling starts fresh
- [x] No duplicate polling instances running

### Verification (Advanced)

- [x] Open browser DevTools → Performance tab
- [x] Record a session while navigating back/forth
- [x] Check that timers are properly cleared (no accumulating setTimeouts)

---

## Test Case 7: Multiple Artworks in Cart

**Objective**: Verify order total calculation with multiple items.

### Steps

1. [x] Add 2-3 different artworks to cart
2. [x] Verify cart total is correct sum
3. [x] Complete checkout with test card
4. [x] Observe success page

### Expected Results

- [x] Order number appears as normal
- [x] Database order contains all cart items as separate `order_items` rows
- [x] Order total matches cart total

---

## Test Case 8: Rapid Page Reload During Polling

**Objective**: Verify idempotency and proper cleanup on rapid reloads.

### Steps

1. [x] Start checkout flow and reach success page
2. [x] Immediately reload the page (F5 or Ctrl+R) multiple times rapidly
3. [x] Observe polling behavior

### Expected Results

- [x] Each page load initiates independent polling
- [x] Old polling instances are cleaned up
- [x] Eventually order number appears (same order, not duplicates)
- [x] No duplicate orders created in database

### Verification

- [x] Check database: Only ONE order exists for this `session_id`
- [x] Webhook idempotency prevents duplicate order creation

---

## Browser Compatibility Testing (Optional)

Test the polling mechanism across different browsers:

- [x] Chrome/Edge (Chromium-based)
- [x] Firefox
- [x] Safari (if available on macOS)

### Expected Results

- [x] Polling behavior consistent across browsers
- [x] Loading states render correctly
- [x] No browser-specific console errors

---

## Performance Verification

### Metrics to Check

1. [x] **Initial Page Load**: Success page loads within 1-2 seconds
2. [x] **API Response Time**: Each `/api/checkout/session/[sessionId]` request completes in < 200ms
3. [x] **Polling Frequency**: Observe requests spacing out (exponential backoff working)
4. [x] **Memory Usage**: No memory leaks during prolonged polling (check DevTools Memory tab)

### Tools

- Browser DevTools → Network tab (timing column)
- Browser DevTools → Performance tab (memory profile)
- Lighthouse audit (optional, for overall performance check)

---

## Edge Cases Checklist

- [x] **Test Case 3**: No session_id parameter (direct navigation)
- [x] **Test Case 4**: Invalid session_id (malformed string)
- [x] **Test Case 5**: Network offline during polling
- [x] **Test Case 6**: User navigates away during polling
- [x] **Test Case 8**: Rapid page reloads
- [x] **Long session_id**: Extremely long session_id string (> 500 chars)
- [x] **Special characters**: session_id with URL-unsafe characters (already URL-encoded by Stripe)

---

## Accessibility Testing (Optional)

- [x] **Screen Reader**: Announce loading state changes properly
- [x] **Keyboard Navigation**: Success page is keyboard-navigable
- [x] **Focus Management**: Focus not lost during polling state updates
- [x] **Error Announcements**: Error messages announced to screen readers

### Tools

- NVDA or JAWS (Windows)
- VoiceOver (macOS)
- Browser accessibility inspector

---

## Post-Testing Cleanup

1. [x] Re-enable webhook processing if disabled (remove comments/delays)
2. [x] Clear test orders from database (optional):
    ```sql
    DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE customer_email = 'test@example.com');
    DELETE FROM orders WHERE customer_email = 'test@example.com';
    ```
3. [x] Restart dev server: `npm run dev`
4. [x] Verify normal checkout flow still works after cleanup

---

## Sign-Off

**Tester Name**: Brad Harris

**Testing Date**: 1/12/2026

**Environment**:

- Node version: 22.21.1
- Browser: Chrome 143.0.7499.192 (Official Build) (64-bit)
- OS: Windows 11

**Overall Result**: [x] PASS / [ ] FAIL

**Issues Found** (if any):

1. **Shipping addresses not being saved**: When customers checked "Same as billing address" in Stripe Checkout, the webhook received a session object with `shipping_details.address` as null. The code was not falling back to `customer_details.address`, resulting in empty shipping address fields in the database.
    - **Status**: FIXED
    - **Solution**: Updated webhook handler to fallback to billing address when shipping details are not provided (`session.shipping_details?.address ?? session.customer_details?.address`)
    - **File**: `src/app/api/checkout/webhook/route.ts` (lines 283-291)
    - **Re-test Required**: Yes - need to verify both scenarios work:
        - Separate shipping address entered → saves to shipping fields
        - "Same as billing" checked → copies billing address to shipping fields

**Additional Notes**:

- The root cause was Stripe's behavior: when "Same as billing address" is selected, Stripe only populates `customer_details.address` and leaves `shipping_details.address` as null
- The fix uses the nullish coalescing operator (`??`) to fallback to billing address when shipping address is not provided
- This ensures the admin always has a shipping address to send orders to, regardless of whether the customer enters separate addresses or uses the same address for both

---

---

---

---

## Appendix A: Quick Reference - Test Card Numbers

| Card Number           | Behavior                |
| --------------------- | ----------------------- |
| `4242 4242 4242 4242` | Successful payment      |
| `4000 0000 0000 0002` | Payment declined        |
| `4000 0000 0000 9995` | Insufficient funds      |
| `4000 0025 0000 3155` | Requires authentication |

All test cards accept:

- Any future expiry date (e.g., `12/34`)
- Any 3-digit CVC (e.g., `123`)
- Any billing postal code

---

## Appendix B: Debugging Tips

### If order number doesn't appear:

1. Check browser console for errors
2. Check Network tab for failed API requests
3. Verify webhook endpoint is reachable (check Stripe webhook logs)
4. Check Supabase database: Does order exist?
5. Verify `payment_intent_id` matches between Stripe session and database order

### If polling never stops:

1. Check that `MAX_RETRY_ATTEMPTS` constant is set to 10 (not infinity)
2. Verify exponential backoff is working (check Network tab request timing)
3. Check for infinite useEffect loop (dependency array issues)

### If tests are flaky:

1. Check for race conditions in test setup (use `waitFor` properly)
2. Verify fake timers are used correctly in tests
3. Check that mocks are reset between tests
4. Verify cleanup functions run on unmount

---

## Appendix C: Success Criteria Summary

| Test Case                       | Critical? | Must Pass?  |
| ------------------------------- | --------- | ----------- |
| Test Case 1: Normal Flow        | YES       | YES         |
| Test Case 2: Delayed Webhook    | YES       | YES         |
| Test Case 3: Missing session_id | YES       | YES         |
| Test Case 4: Invalid session_id | YES       | YES         |
| Test Case 5: Network Error      | Medium    | YES         |
| Test Case 6: Navigation Cleanup | Medium    | Recommended |
| Test Case 7: Multiple Items     | Medium    | Recommended |
| Test Case 8: Rapid Reload       | Low       | Recommended |

**Minimum to proceed**: Test Cases 1-4 must all PASS.

---

**End of Manual Testing Checklist**
