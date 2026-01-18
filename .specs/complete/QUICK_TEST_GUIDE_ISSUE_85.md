# Quick Test Guide - Issue #85 Order Retrieval Fix

**For the complete checklist, see**: `.specs/MANUAL_TESTING_CHECKLIST_ISSUE_85.md`

---

## 5-Minute Quick Test

If you only have 5 minutes, run this minimal test:

### Prerequisites

```bash
npm run dev              # Start dev server
npm run db:start         # Start Supabase (if not already running)
```

### Test Steps

1. Navigate to http://localhost:3000/shoppe
2. Add any artwork to cart
3. Click "Checkout"
4. Fill in checkout form:
    - Card: `4242 4242 4242 4242`
    - Expiry: `12/34`
    - CVC: `123`
    - Email: `test@example.com`
5. Complete payment
6. Verify success page shows order number within 2 seconds

**Expected Result**: Success page displays order number with no errors.

---

## Critical Test Cases (Must Pass)

If you have 15-20 minutes, run these 4 critical tests:

### 1. Normal Flow

- Complete checkout with test card
- Order number appears immediately
- No errors in console

### 2. Delayed Webhook (Race Condition)

- Comment out order creation in webhook handler (`src/app/api/webhooks/stripe/route.ts`)
- Complete checkout
- Observe polling behavior (loading state, retries)
- See friendly timeout message after ~20 seconds
- Re-enable webhook

### 3. Missing session_id

- Navigate to http://localhost:3000/shoppe/checkout/success
- No errors, shows generic success message

### 4. Invalid session_id

- Navigate to http://localhost:3000/shoppe/checkout/success?session_id=invalid
- Shows error after retries, no crash

---

## Test Card Numbers

| Card                  | Purpose                              |
| --------------------- | ------------------------------------ |
| `4242 4242 4242 4242` | Success (use this for all tests)     |
| `4000 0000 0000 0002` | Decline (optional edge case testing) |

All cards accept any future expiry (e.g., `12/34`) and any CVC (e.g., `123`).

---

## What to Look For

### Success Indicators

- Order number appears (format: `ORD-XXXXXXXXXX`)
- No error messages visible
- Browser console has no errors
- Network tab shows 1-10 requests to `/api/checkout/session/[sessionId]`

### Failure Indicators

- "Failed to retrieve order details" error (the old bug!)
- Infinite loading state (polling never stops)
- Console errors or unhandled promise rejections
- Page crash or blank screen

---

## Debugging Quick Reference

### Order not appearing?

1. Check browser console for errors
2. Check Network tab - are API calls succeeding?
3. Check database: Does order exist with matching `payment_intent_id`?

### Polling never stops?

1. Check Network tab - are requests happening?
2. Look for infinite loop in useEffect
3. Verify MAX_RETRY_ATTEMPTS is set to 10

### Webhook not firing?

1. Check Stripe webhook URL is configured: http://localhost:3000/api/webhooks/stripe
2. Use Stripe CLI to forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Check webhook handler isn't commented out

---

## Pass/Fail Criteria

**PASS**: All 4 critical tests complete successfully
**FAIL**: Any critical test shows errors or unexpected behavior

If FAIL, document the issue and attach:

- Browser console logs
- Network tab screenshot
- Steps to reproduce

---

## Full Checklist

For comprehensive testing (edge cases, performance, accessibility):
See `.specs/MANUAL_TESTING_CHECKLIST_ISSUE_85.md`

---

**Ready to test?** Start with the 5-minute quick test, then proceed to critical tests if time allows.
