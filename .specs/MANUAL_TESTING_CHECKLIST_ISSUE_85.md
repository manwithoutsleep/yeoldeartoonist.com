# Manual Testing Checklist - Issue #85: Order Retrieval Fix

**Feature**: Order confirmation page polling mechanism
**Branch**: `issue-85-fix-order-retrieval-error`
**Testing Environment**: Local development (`npm run dev`)
**Prerequisites**: Stripe test mode configured, local Supabase running

---

## Pre-Testing Setup

### 1. Environment Verification

- [ ] Local development server running (`npm run dev` at http://localhost:3000)
- [ ] Supabase local instance running (`npm run db:start`)
- [ ] Stripe test mode API keys configured in `.env.local`
- [ ] Browser DevTools open (Console + Network tabs visible)

### 2. Test Data Preparation

**Stripe Test Cards** (from [Stripe Testing Documentation](https://stripe.com/docs/testing)):

- **Success**: `4242 4242 4242 4242` (Use any future expiry date, any CVC)
- **Decline**: `4000 0000 0000 0002` (For testing payment failures)

**Test Products**: Ensure at least one artwork is available for purchase in the shoppe.

---

## Test Case 1: Normal Flow (Webhook Faster Than Polling)

**Objective**: Verify that order number appears immediately when webhook completes before polling starts.

### Steps

1. [ ] Navigate to shoppe: http://localhost:3000/shoppe
2. [ ] Add any artwork to cart (click "Add to Cart" button)
3. [ ] Click "Checkout" button in cart
4. [ ] Fill in Stripe checkout form:
    - Email: `test@example.com`
    - Card: `4242 4242 4242 4242`
    - Expiry: `12/34` (any future date)
    - CVC: `123` (any 3 digits)
    - Name: `Test Customer`
5. [ ] Click "Pay" button
6. [ ] Observe redirect to success page (`/shoppe/checkout/success?session_id=...`)

### Expected Results

- [ ] Success page displays "Order Confirmed!" heading immediately
- [ ] Loading state visible briefly or not at all (< 2 seconds)
- [ ] Order number appears (format: starts with "ORD-" followed by numbers)
- [ ] No error messages visible
- [ ] Browser console shows no errors
- [ ] Network tab shows 1-2 requests to `/api/checkout/session/[sessionId]` endpoint

### Verification

- [ ] Check Supabase database: Order exists with matching `payment_intent_id`
- [ ] Order status is `pending` or `completed`
- [ ] Order total matches the paid amount

---

## Test Case 2: Delayed Webhook (Simulated Race Condition)

**Objective**: Verify polling mechanism handles webhook delays gracefully.

### Setup (Simulate Delay)

**Option A: Comment Out Order Creation** (recommended for testing)

1. [ ] Open `src/app/api/webhooks/stripe/route.ts`
2. [ ] Find the `checkout.session.completed` handler
3. [ ] Comment out the order creation code (lines that call `createOrder` or insert into database)
4. [ ] Save the file (Next.js will hot-reload)

**Option B: Add Artificial Delay**

```typescript
// In webhook handler, add before order creation:
await new Promise((resolve) => setTimeout(resolve, 15000)); // 15 second delay
```

### Steps

1. [ ] With webhook disabled/delayed, navigate to shoppe
2. [ ] Add artwork to cart and proceed to checkout
3. [ ] Complete payment with test card `4242 4242 4242 4242`
4. [ ] Observe success page behavior

### Expected Results (During Polling)

- [ ] Success page displays "Order Confirmed!" heading
- [ ] Loading spinner or "Loading order details..." message visible
- [ ] Network tab shows repeated requests to `/api/checkout/session/[sessionId]`
- [ ] Requests appear at increasing intervals (1s, 1.5s, 2.25s, etc.)
- [ ] Polling continues for approximately 20 seconds

### Expected Results (After Timeout)

- [ ] After ~20 seconds, polling stops (10 retries exhausted)
- [ ] Friendly message appears: "We're still processing your order. You'll receive a confirmation email shortly."
- [ ] No technical error messages visible
- [ ] No browser console errors

### Cleanup

1. [ ] Re-enable webhook processing (uncomment order creation code or remove delay)
2. [ ] (Optional) Manually create the order in database to verify webhook would work
3. [ ] Restart dev server if needed

---

## Test Case 3: Missing session_id Parameter

**Objective**: Verify graceful handling when user navigates directly to success page.

### Steps

1. [ ] Manually navigate to: http://localhost:3000/shoppe/checkout/success
2. [ ] Observe page behavior

### Expected Results

- [ ] Page displays "Order Confirmed!" heading
- [ ] No loading state visible (no polling initiated)
- [ ] No error messages visible
- [ ] Generic success message shown (no order number displayed)
- [ ] Browser console shows no errors
- [ ] Network tab shows no API requests to `/api/checkout/session/`

### Rationale

User may bookmark the success page or navigate there directly. Should degrade gracefully without attempting to poll for non-existent session.

---

## Test Case 4: Invalid session_id Parameter

**Objective**: Verify error handling for malformed or expired session IDs.

### Steps

1. [ ] Navigate to: http://localhost:3000/shoppe/checkout/success?session_id=cs_invalid_12345
2. [ ] Observe page behavior

### Expected Results (During Polling)

- [ ] Page displays "Order Confirmed!" heading
- [ ] Loading state visible initially
- [ ] Network tab shows repeated API calls to `/api/checkout/session/cs_invalid_12345`
- [ ] Each API call returns 404 or 500 error
- [ ] Polling continues for ~20 seconds (10 retries)

### Expected Results (After Timeout)

- [ ] After retries exhausted, error message appears
- [ ] Message should be user-friendly (NOT "404 Not Found")
- [ ] Example: "Unable to retrieve order details right now. Don't worry - your payment was successful."
- [ ] Browser console may show network errors (acceptable for invalid session)

### Verification

- [ ] Check database: No order exists with session_id `cs_invalid_12345`
- [ ] No crash or blank page
- [ ] User is still informed payment succeeded

---

## Test Case 5: Network Error During Polling

**Objective**: Verify resilience to network failures.

### Setup (Simulate Network Failure)

1. [ ] Complete a real checkout flow (Test Case 1)
2. [ ] On the success page, open Browser DevTools
3. [ ] Go to Network tab → Throttling dropdown
4. [ ] Select "Offline" mode BEFORE the polling completes

### Expected Results

- [ ] Polling attempts continue (fetch errors are caught)
- [ ] No unhandled promise rejections in console
- [ ] After retries exhausted, shows user-friendly error message
- [ ] Page doesn't crash or become unresponsive

### Cleanup

- [ ] Return network to "No throttling" mode

---

## Test Case 6: Browser Navigation During Polling

**Objective**: Verify cleanup of polling timers when user navigates away.

### Steps

1. [ ] Simulate delayed webhook (Test Case 2 setup)
2. [ ] Start checkout and reach success page (polling starts)
3. [ ] While loading state is visible, click browser Back button
4. [ ] Navigate forward again to success page
5. [ ] Navigate to another page entirely (e.g., home page)

### Expected Results

- [ ] No memory leaks (polling timers are cleaned up)
- [ ] Browser console shows no errors
- [ ] If you return to success page, polling starts fresh
- [ ] No duplicate polling instances running

### Verification (Advanced)

- [ ] Open browser DevTools → Performance tab
- [ ] Record a session while navigating back/forth
- [ ] Check that timers are properly cleared (no accumulating setTimeouts)

---

## Test Case 7: Multiple Artworks in Cart

**Objective**: Verify order total calculation with multiple items.

### Steps

1. [ ] Add 2-3 different artworks to cart
2. [ ] Verify cart total is correct sum
3. [ ] Complete checkout with test card
4. [ ] Observe success page

### Expected Results

- [ ] Order number appears as normal
- [ ] Database order contains all cart items as separate `order_items` rows
- [ ] Order total matches cart total

---

## Test Case 8: Rapid Page Reload During Polling

**Objective**: Verify idempotency and proper cleanup on rapid reloads.

### Steps

1. [ ] Start checkout flow and reach success page
2. [ ] Immediately reload the page (F5 or Ctrl+R) multiple times rapidly
3. [ ] Observe polling behavior

### Expected Results

- [ ] Each page load initiates independent polling
- [ ] Old polling instances are cleaned up
- [ ] Eventually order number appears (same order, not duplicates)
- [ ] No duplicate orders created in database

### Verification

- [ ] Check database: Only ONE order exists for this `session_id`
- [ ] Webhook idempotency prevents duplicate order creation

---

## Browser Compatibility Testing (Optional)

Test the polling mechanism across different browsers:

- [ ] Chrome/Edge (Chromium-based)
- [ ] Firefox
- [ ] Safari (if available on macOS)

### Expected Results

- [ ] Polling behavior consistent across browsers
- [ ] Loading states render correctly
- [ ] No browser-specific console errors

---

## Performance Verification

### Metrics to Check

1. [ ] **Initial Page Load**: Success page loads within 1-2 seconds
2. [ ] **API Response Time**: Each `/api/checkout/session/[sessionId]` request completes in < 200ms
3. [ ] **Polling Frequency**: Observe requests spacing out (exponential backoff working)
4. [ ] **Memory Usage**: No memory leaks during prolonged polling (check DevTools Memory tab)

### Tools

- Browser DevTools → Network tab (timing column)
- Browser DevTools → Performance tab (memory profile)
- Lighthouse audit (optional, for overall performance check)

---

## Edge Cases Checklist

- [ ] **Test Case 3**: No session_id parameter (direct navigation)
- [ ] **Test Case 4**: Invalid session_id (malformed string)
- [ ] **Test Case 5**: Network offline during polling
- [ ] **Test Case 6**: User navigates away during polling
- [ ] **Test Case 8**: Rapid page reloads
- [ ] **Long session_id**: Extremely long session_id string (> 500 chars)
- [ ] **Special characters**: session_id with URL-unsafe characters (already URL-encoded by Stripe)

---

## Accessibility Testing (Optional)

- [ ] **Screen Reader**: Announce loading state changes properly
- [ ] **Keyboard Navigation**: Success page is keyboard-navigable
- [ ] **Focus Management**: Focus not lost during polling state updates
- [ ] **Error Announcements**: Error messages announced to screen readers

### Tools

- NVDA or JAWS (Windows)
- VoiceOver (macOS)
- Browser accessibility inspector

---

## Post-Testing Cleanup

1. [ ] Re-enable webhook processing if disabled (remove comments/delays)
2. [ ] Clear test orders from database (optional):
    ```sql
    DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE customer_email = 'test@example.com');
    DELETE FROM orders WHERE customer_email = 'test@example.com';
    ```
3. [ ] Restart dev server: `npm run dev`
4. [ ] Verify normal checkout flow still works after cleanup

---

## Sign-Off

**Tester Name**: \***\*\*\*\*\*\*\***\_\_\_\***\*\*\*\*\*\*\***

**Testing Date**: \***\*\*\*\*\*\*\***\_\_\_\***\*\*\*\*\*\*\***

**Environment**:

- Node version: \***\*\*\*\*\*\*\***\_\_\_\***\*\*\*\*\*\*\***
- Browser: \***\*\*\*\*\*\*\***\_\_\_\***\*\*\*\*\*\*\***
- OS: \***\*\*\*\*\*\*\***\_\_\_\***\*\*\*\*\*\*\***

**Overall Result**: [ ] PASS / [ ] FAIL

**Issues Found** (if any):

1. ***
2. ***
3. ***

**Additional Notes**:

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
