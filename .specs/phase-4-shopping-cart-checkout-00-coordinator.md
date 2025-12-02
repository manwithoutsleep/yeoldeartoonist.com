# Phase 4: Shopping Cart & Checkout - Coordinator Plan

## Overview

This coordinator plan manages the execution of sub-tasks for Phase 4: Shopping Cart & Checkout implementation.

**Total Sub-Tasks**: 6
**Estimated Total Effort**: 16-20 hours
**Parallelization Potential**: High (4 parallel tracks initially)

## Quick Reference - Sub-Task Specifications

| Task | Specification File                                                                            | Est. Time |
| ---- | --------------------------------------------------------------------------------------------- | --------- |
| 01   | [Tests for Cart Context](phase-4-shopping-cart-checkout-01-tests-cart-context.md)             | 2-3 hrs   |
| 02   | [Cart UI Components](phase-4-shopping-cart-checkout-02-cart-ui-components.md)                 | 3-4 hrs   |
| 03   | [Server Validation & Orders](phase-4-shopping-cart-checkout-03-server-validation-orders.md)   | 3-4 hrs   |
| 04   | [Stripe Payment Integration](phase-4-shopping-cart-checkout-04-stripe-payment-integration.md) | 3-4 hrs   |
| 05   | [Checkout Flow Integration](phase-4-shopping-cart-checkout-05-checkout-flow-integration.md)   | 4-6 hrs   |
| 06   | [E2E Testing](phase-4-shopping-cart-checkout-06-e2e-testing.md)                               | 2-3 hrs   |

## Current State Assessment

### Existing Infrastructure ✅

- Cart types defined (`src/types/cart.ts`, `src/types/order.ts`)
- CartContext with localStorage persistence implemented
- useCart hook functional
- CheckoutProvider stub exists
- Stripe packages installed (`@stripe/stripe-js`, `@stripe/react-stripe-js`, `stripe`)
- Shoppe page displays products with disabled "Add to Cart" buttons

### Missing Components ❌

- Cart UI components (CartButton, CartDrawer, CartItem, CartSummary)
- Cart and checkout pages
- Stripe integration and payment processing
- Server-side cart validation
- Order database functions and API routes
- Webhook handling
- Test coverage for cart/checkout

## Sub-Task Index

| Task | Description                | Spec File                                                                                                                          | Status  | Dependencies | Can Run In Parallel With |
| ---- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------ | ------------------------ |
| 01   | Tests for Cart Context     | [phase-4-shopping-cart-checkout-01-tests-cart-context.md](phase-4-shopping-cart-checkout-01-tests-cart-context.md)                 | Pending | None         | 02, 03, 04               |
| 02   | Cart UI Components         | [phase-4-shopping-cart-checkout-02-cart-ui-components.md](phase-4-shopping-cart-checkout-02-cart-ui-components.md)                 | Pending | None         | 01, 03, 04               |
| 03   | Server Validation & Orders | [phase-4-shopping-cart-checkout-03-server-validation-orders.md](phase-4-shopping-cart-checkout-03-server-validation-orders.md)     | Pending | None         | 01, 02, 04               |
| 04   | Stripe Payment Integration | [phase-4-shopping-cart-checkout-04-stripe-payment-integration.md](phase-4-shopping-cart-checkout-04-stripe-payment-integration.md) | Pending | None         | 01, 02, 03               |
| 05   | Checkout Flow Integration  | [phase-4-shopping-cart-checkout-05-checkout-flow-integration.md](phase-4-shopping-cart-checkout-05-checkout-flow-integration.md)   | Pending | 02, 03, 04   | None                     |
| 06   | E2E Testing                | [phase-4-shopping-cart-checkout-06-e2e-testing.md](phase-4-shopping-cart-checkout-06-e2e-testing.md)                               | Pending | 05           | None                     |

## Sub-Task Details

### Task 01: Tests for Cart Context

**Spec File:** [phase-4-shopping-cart-checkout-01-tests-cart-context.md](phase-4-shopping-cart-checkout-01-tests-cart-context.md)

Add comprehensive TDD tests for the existing `CartContext` and `useCart` hook. This ensures cart state management is reliable before building UI and checkout features.

**Key Deliverables:**

- Unit tests for CartContext (add, remove, update, clear operations)
- Unit tests for useCart hook
- Edge case testing (localStorage, concurrent updates)
- 100% test coverage for cart logic

**Estimated Effort:** 2-3 hours

---

### Task 02: Cart UI Components

**Spec File:** [phase-4-shopping-cart-checkout-02-cart-ui-components.md](phase-4-shopping-cart-checkout-02-cart-ui-components.md)

Build reusable cart UI components that provide a complete shopping cart interface.

**Key Deliverables:**

- CartButton (header cart icon with badge)
- CartDrawer (slide-out cart panel)
- CartItem (individual item with quantity controls)
- CartSummary (cart totals)
- Unit tests for all components
- Responsive design and accessibility

**Estimated Effort:** 3-4 hours

---

### Task 03: Server Validation & Order Functions

**Spec File:** [phase-4-shopping-cart-checkout-03-server-validation-orders.md](phase-4-shopping-cart-checkout-03-server-validation-orders.md)

Implement server-side cart validation and order database functions to ensure data integrity and prevent tampering.

**Key Deliverables:**

- Server-side cart validation logic
- Order database query functions (create, read, update)
- Cart validation API route (`/api/checkout/validate`)
- Unit tests for validation and order functions
- Integration tests for validation API

**Estimated Effort:** 3-4 hours

---

### Task 04: Stripe Payment Integration

**Spec File:** [phase-4-shopping-cart-checkout-04-stripe-payment-integration.md](phase-4-shopping-cart-checkout-04-stripe-payment-integration.md)

Integrate Stripe payment processing to handle checkout payments, including payment intent creation and webhook handling.

**Key Deliverables:**

- Stripe client setup (server and client-side)
- Payment intent creation API route
- Stripe webhook handler for payment events
- PaymentForm component with Stripe Elements
- Unit and integration tests

**Estimated Effort:** 3-4 hours

---

### Task 05: Checkout Flow Integration

**Spec File:** [phase-4-shopping-cart-checkout-05-checkout-flow-integration.md](phase-4-shopping-cart-checkout-05-checkout-flow-integration.md)

Build the complete checkout flow by creating cart and checkout pages, integrating all components from previous tasks.

**Key Deliverables:**

- Enable "Add to Cart" on Shoppe page
- Cart page (`/shoppe/cart`)
- Checkout page (`/shoppe/checkout`)
- Success page (`/shoppe/checkout/success`)
- Cancelled page (`/shoppe/checkout/cancelled`)
- AddressForm and CheckoutForm components
- Integration of all previous tasks

**Estimated Effort:** 4-6 hours

---

### Task 06: End-to-End Testing

**Spec File:** [phase-4-shopping-cart-checkout-06-e2e-testing.md](phase-4-shopping-cart-checkout-06-e2e-testing.md)

Create comprehensive E2E tests that validate the complete cart-to-checkout-to-order flow.

**Key Deliverables:**

- E2E test for happy path (add to cart → checkout → payment → order)
- E2E tests for cart management
- E2E tests for checkout validation
- E2E tests for payment success/failure
- Performance and accessibility testing

**Estimated Effort:** 2-3 hours

---

## Execution Strategy

### Phase 1: Foundation (Parallel Execution)

Execute these tasks simultaneously (no dependencies):

- **Task 01: Tests for Cart Context** → [Spec](phase-4-shopping-cart-checkout-01-tests-cart-context.md)
    - Add comprehensive TDD tests for existing CartContext and useCart hook
    - 2-3 hours

- **Task 02: Cart UI Components** → [Spec](phase-4-shopping-cart-checkout-02-cart-ui-components.md)
    - Build CartButton, CartDrawer, CartItem, CartSummary components
    - 3-4 hours

- **Task 03: Server Validation & Order Functions** → [Spec](phase-4-shopping-cart-checkout-03-server-validation-orders.md)
    - Implement cart validation, order database queries, API routes
    - 3-4 hours

- **Task 04: Stripe Payment Integration** → [Spec](phase-4-shopping-cart-checkout-04-stripe-payment-integration.md)
    - Set up Stripe, create payment intent API, integrate Stripe Elements
    - 3-4 hours

**Estimated Duration**: 8-10 hours (parallel) | 11-15 hours (sequential)

**⚠️ Wait for Phase 1 completion before proceeding to Phase 2**

---

### Phase 2: Integration (Sequential)

Execute after Phase 1 completes:

- **Task 05: Checkout Flow Integration** → [Spec](phase-4-shopping-cart-checkout-05-checkout-flow-integration.md)
    - Build cart page, checkout page, success/cancelled pages, wire everything together
    - Depends on: Tasks 02, 03, 04
    - 4-6 hours

**⚠️ Wait for Task 05 completion before proceeding to Phase 3**

---

### Phase 3: E2E Testing (Sequential)

Execute after Phase 2 completes:

- **Task 06: End-to-End Testing** → [Spec](phase-4-shopping-cart-checkout-06-e2e-testing.md)
    - Comprehensive E2E tests for complete cart-to-checkout-to-order flow
    - Depends on: Task 05
    - 2-3 hours

## Dependency Graph

```
01 (Tests) ───────┐
02 (UI) ──────────┼──→ 05 (Integration) ──→ 06 (E2E Tests)
03 (Server) ──────┤
04 (Stripe) ──────┘
```

## Critical Path

The longest sequence of dependent tasks determines minimum completion time:

**Path 1**: Task 02 (UI) → Task 05 (Integration) → Task 06 (E2E) = ~10-13 hours
**Path 2**: Task 03 (Server) → Task 05 (Integration) → Task 06 (E2E) = ~10-13 hours
**Path 3**: Task 04 (Stripe) → Task 05 (Integration) → Task 06 (E2E) = ~10-13 hours

**Minimum Total Time**: 14-19 hours (with 4 parallel tracks in Phase 1)

## Coordination Notes

### Conflict Prevention

**Phase 1 Tasks (Parallel Safe)**:

- Task 01 creates test files only (`__tests__/context/CartContext.test.tsx`, `__tests__/hooks/useCart.test.ts`)
- Task 02 creates UI components (`src/components/cart/*.tsx`)
- Task 03 creates server utilities (`src/lib/cart/validation.ts`, `src/lib/db/orders.ts`, `src/app/api/checkout/*.ts`)
- Task 04 creates Stripe integration (`src/lib/payments/stripe.ts`, `src/app/api/checkout/route.ts`)

**Potential Conflicts**:

- Tasks 03 and 04 both create files in `src/app/api/checkout/`
    - **Resolution**: Task 03 creates `src/app/api/checkout/validate/route.ts`
    - **Resolution**: Task 04 creates `src/app/api/checkout/route.ts` (payment intent) and `src/app/api/checkout/webhook/route.ts`
    - No actual file conflicts

**Phase 2 Dependencies**:

- Task 05 depends on all Phase 1 tasks completing because it integrates their outputs
- Task 05 modifies `src/app/shoppe/page.tsx` to enable "Add to Cart" buttons (requires Task 02)
- Task 05 creates cart/checkout pages that use components from Tasks 02, 03, 04

**Phase 3 Dependencies**:

- Task 06 requires complete implementation from Task 05 to test end-to-end flows

### Recommended Execution Order

If not running in parallel, execute in this order for optimal flow:

1. **Task 01** (Tests) - Ensures existing cart logic is solid before building on it
2. **Task 03** (Server) - Foundation for validation and order creation
3. **Task 04** (Stripe) - Payment infrastructure
4. **Task 02** (UI) - User-facing components
5. **Task 05** (Integration) - Wire everything together
6. **Task 06** (E2E Tests) - Validate complete flow

## Progress Tracking

### Completion Checklist

- [x] **Task 01**: Tests for Cart Context and useCart hook → [Spec](phase-4-shopping-cart-checkout-01-tests-cart-context.md)
- [x] **Task 02**: Cart UI components (CartButton, CartDrawer, CartItem, CartSummary) → [Spec](phase-4-shopping-cart-checkout-02-cart-ui-components.md)
- [ ] **Task 03**: Server validation, order database functions, validation API → [Spec](phase-4-shopping-cart-checkout-03-server-validation-orders.md)
- [ ] **Task 04**: Stripe integration, payment intent API, webhook handler → [Spec](phase-4-shopping-cart-checkout-04-stripe-payment-integration.md)
- [ ] **Task 05**: Cart page, checkout page, success/cancelled pages, integration → [Spec](phase-4-shopping-cart-checkout-05-checkout-flow-integration.md)
- [ ] **Task 06**: E2E tests for complete cart-checkout-order flow → [Spec](phase-4-shopping-cart-checkout-06-e2e-testing.md)
- [ ] All sub-tasks completed
- [ ] Integration testing passed
- [ ] Phase 4 specification objectives achieved

## Integration Verification

After all sub-tasks are complete, verify:

### Functional Requirements

- [ ] Users can add items to cart from Shoppe page
- [ ] Cart persists across page refreshes (localStorage)
- [ ] Cart drawer shows correct item count and items
- [ ] Cart page displays all items with quantity controls
- [ ] Checkout form validates customer and address information
- [ ] Stripe payment element renders and accepts test cards
- [ ] Payment succeeds with test card (4242 4242 4242 4242)
- [ ] Order created in database with correct totals
- [ ] Inventory decremented after successful payment
- [ ] Webhook confirms payment and updates order status
- [ ] Success page displays order confirmation
- [ ] Cart cleared after successful checkout

### Technical Requirements

- [ ] All components integrate correctly
- [ ] No TypeScript errors
- [ ] All ESLint rules passing
- [ ] All tests pass (unit + integration + E2E)
- [ ] Code formatted with Prettier
- [ ] Test coverage >80% for new code
- [ ] No console errors in browser
- [ ] Performance: Cart operations complete in <100ms
- [ ] Performance: Checkout form submission completes in <3s

### Security Requirements

- [ ] Cart validation prevents price tampering
- [ ] Server-side validation for all cart operations
- [ ] Stripe webhook signature verification working
- [ ] Order totals calculated server-side (never trust client)
- [ ] Inventory checks prevent overselling
- [ ] Admin-only operations properly protected

### Phase 4 Success Criteria

- [ ] Complete shopping cart with persistence ✅
- [ ] Checkout form with validation ✅
- [ ] Stripe payment integration ✅
- [ ] Order database storage ✅
- [ ] Webhook handling for payment confirmation ✅
- [ ] Order confirmation page ✅
- [ ] All Phase 4 tasks from MVP spec completed ✅

## Rollback Strategy

If a critical issue is discovered:

1. **Identify**: Determine which sub-task(s) introduced the issue
2. **Isolate**: Use git to identify specific commits/changes
3. **Assess**: Determine if fix-forward or rollback is appropriate
    - Fix-forward: Issue is minor and can be quickly resolved
    - Rollback: Issue is critical and affects data integrity or security
4. **Execute**: Apply fix or rollback to last stable state
5. **Document**: Update affected sub-task specifications with lessons learned
6. **Re-test**: Run full integration verification after fix/rollback

### Critical Issues Requiring Immediate Rollback

- Payment processing failures that charge customers incorrectly
- Inventory decrement bugs that oversell products
- Security vulnerabilities in webhook handling
- Data corruption in order creation

### Non-Critical Issues (Fix Forward)

- UI bugs in cart display
- Minor validation edge cases
- Performance issues that don't block functionality
- Cosmetic issues in checkout flow

## Notes

### TDD Approach

All sub-tasks follow Test-Driven Development (TDD) principles:

1. Write failing tests first (Red)
2. Implement minimum code to pass tests (Green)
3. Refactor and optimize (Refactor)

### Testing Requirements

- Task 01 focuses on unit tests for existing cart logic
- Tasks 02-05 include unit tests for new functionality
- Task 06 focuses on E2E tests for complete flows
- Target: >80% code coverage for Phase 4 code

### Stripe Test Mode

All development uses Stripe test mode:

- Test card: `4242 4242 4242 4242`
- Any future expiry date, any CVC
- Webhook testing uses Stripe CLI: `stripe listen --forward-to localhost:3000/api/checkout/webhook`

### Environment Variables Required

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (client-side)
- `STRIPE_SECRET_KEY` (server-side)
- `STRIPE_WEBHOOK_SECRET` (webhook signature verification)

### Phase 5 Handoff

After Phase 4 completion, Phase 5 will add:

- Email notifications (Resend integration)
- Admin notification emails
- Performance optimization
- SEO optimization
- Production deployment

Phase 4 focuses exclusively on cart and checkout functionality.
