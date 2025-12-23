# Phase 4-01: Tests for Cart Context and useCart Hook ✅ COMPLETE

## Parent Specification

This is sub-task 01 of the parent specification: `phase-4-shopping-cart-checkout-00-coordinator.md`

## Objective

Add comprehensive TDD tests for the existing `CartContext` and `useCart` hook to ensure cart state management is reliable before building UI and checkout features on top of it.

## Dependencies

**Prerequisites** (must be completed before this task):

- None - This task can start immediately

**Blocks** (tasks that depend on this one):

- None - Other tasks can proceed in parallel

**Parallel Opportunities**:

- Task 02: Cart UI Components
- Task 03: Server Validation & Order Functions
- Task 04: Stripe Payment Integration

## Scope

### In Scope

- Comprehensive unit tests for `src/context/CartContext.tsx`
- Unit tests for `src/hooks/useCart.ts`
- Test coverage for all cart operations:
    - Adding items to cart (new and duplicate)
    - Removing items from cart
    - Updating quantities
    - Clearing cart
    - Calculating totals
    - Getting item count
- localStorage persistence tests
- Edge case testing:
    - Duplicate items (should increment quantity)
    - Zero/negative quantities
    - Large quantities
    - Malformed localStorage data
    - localStorage unavailable
    - Concurrent cart updates
- Context provider tests
- Hook error handling (using outside provider)

### Out of Scope

- UI component tests (covered in Task 02)
- Server-side validation tests (covered in Task 03)
- Integration tests with checkout (covered in Task 06)
- E2E tests (covered in Task 06)

## Implementation Requirements

### Testing Framework

- Use Vitest with @testing-library/react
- Follow existing test patterns from Phase 2.5
- Mock localStorage for consistent test environment
- Use @testing-library/react-hooks for hook testing

### Test Coverage Goals

- 100% coverage for CartContext
- 100% coverage for useCart hook
- All branches tested (if/else, try/catch)
- All edge cases covered

### Test Organization

```
__tests__/
├── context/
│   └── CartContext.test.tsx    # CartContext provider tests
└── hooks/
    └── useCart.test.ts         # useCart hook tests
```

## Files to Create/Modify

- `__tests__/context/CartContext.test.tsx` - New file with CartContext tests
- `__tests__/hooks/useCart.test.ts` - New file with useCart hook tests

**No modifications** to existing source files - this task only adds tests for existing functionality.

## Testing Requirements

### CartContext Tests

#### Basic Initialization ✅ COMPLETE

- [x] Provider renders children without errors
- [x] Cart initializes with empty items array
- [x] Cart initializes from localStorage if available
- [x] Malformed localStorage data is handled gracefully

#### Adding Items ✅ COMPLETE

- [x] Can add new item to empty cart
- [x] Can add new item to cart with existing items
- [x] Adding duplicate item increments quantity instead of creating duplicate
- [x] Adding item updates cart.lastUpdated timestamp
- [x] Adding item persists to localStorage

#### Removing Items ✅ COMPLETE

- [x] Can remove item from cart
- [x] Removing non-existent item doesn't error
- [x] Removing item updates cart.lastUpdated timestamp
- [x] Removing item persists to localStorage

#### Updating Quantities ✅ COMPLETE

- [x] Can increase item quantity
- [x] Can decrease item quantity
- [x] Setting quantity to 0 removes item
- [x] Setting negative quantity removes item
- [x] Updating quantity updates cart.lastUpdated timestamp
- [x] Updating quantity persists to localStorage

#### Clearing Cart ✅ COMPLETE

- [x] Clearing cart removes all items
- [x] Clearing cart updates lastUpdated timestamp
- [x] Clearing cart persists to localStorage

#### Calculations ✅ COMPLETE

- [x] getTotal() returns 0 for empty cart
- [x] getTotal() correctly sums item prices × quantities
- [x] getItemCount() returns 0 for empty cart
- [x] getItemCount() correctly sums quantities

#### Edge Cases ✅ COMPLETE

- [x] Handles localStorage quota exceeded
- [x] Handles localStorage unavailable (SSR/disabled)
- [x] Handles concurrent state updates correctly
- [x] Preserves cart state across provider remounts

### useCart Hook Tests ✅ COMPLETE

- [x] Hook throws error when used outside CartProvider
- [x] Hook returns cart context when used inside CartProvider
- [x] Hook provides access to all cart operations
- [x] Hook updates trigger re-renders in components

## Success Criteria ✅ COMPLETE

- [x] All CartContext tests pass
- [x] All useCart hook tests pass
- [x] Test coverage ≥100% for CartContext
- [x] Test coverage ≥100% for useCart hook
- [x] No TypeScript errors in test files
- [x] Tests follow existing project patterns
- [x] Tests run in <5 seconds
- [x] All tests are deterministic (no flaky tests)
- [x] Edge cases thoroughly covered
- [x] The verify-code skill has been successfully executed

## Implementation Notes

### localStorage Mocking

Mock localStorage in test setup:

```typescript
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};

global.localStorage = localStorageMock as any;
```

### Testing Context Providers

Use @testing-library/react to render providers:

```typescript
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

const { result } = renderHook(() => useCart(), { wrapper });
```

### Testing State Updates

Use `act()` and `waitFor()` for async state updates:

```typescript
act(() => {
    result.current.addItem(mockItem);
});

expect(result.current.cart.items).toHaveLength(1);
```

### Sample Test Cases

**Test: Adding duplicate item increments quantity**

```typescript
it('should increment quantity when adding duplicate item', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const item = {
        artworkId: '123',
        title: 'Test Art',
        price: 50,
        quantity: 1,
        slug: 'test-art',
    };

    act(() => {
        result.current.addItem(item);
        result.current.addItem(item);
    });

    expect(result.current.cart.items).toHaveLength(1);
    expect(result.current.cart.items[0].quantity).toBe(2);
});
```

**Test: Setting quantity to 0 removes item**

```typescript
it('should remove item when quantity set to 0', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const item = {
        artworkId: '123',
        title: 'Test Art',
        price: 50,
        quantity: 1,
        slug: 'test-art',
    };

    act(() => {
        result.current.addItem(item);
        result.current.updateQuantity('123', 0);
    });

    expect(result.current.cart.items).toHaveLength(0);
});
```

## Notes

- This task only adds tests - no changes to source code
- Tests validate existing implementation is correct
- Identifies any bugs in current cart logic before building on it
- Provides confidence for refactoring in future tasks
- Sets testing pattern for other Phase 4 tasks to follow
