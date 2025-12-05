# Phase 4-02: Cart UI Components

## Parent Specification

This is sub-task 02 of the parent specification: `phase-4-shopping-cart-checkout-00-coordinator.md`

## Objective

Build reusable cart UI components that provide a complete shopping cart interface, including a header cart button, slide-out cart drawer, individual cart items, and cart summary display.

## Dependencies

**Prerequisites** (must be completed before this task):

- None - This task can start immediately (uses existing CartContext)

**Blocks** (tasks that depend on this one):

- Task 05: Checkout Flow Integration (needs these components)

**Parallel Opportunities**:

- Task 01: Tests for Cart Context
- Task 03: Server Validation & Order Functions
- Task 04: Stripe Payment Integration

## Scope

### In Scope

- **CartButton** component - Header cart icon with item count badge
- **CartDrawer** component - Slide-out panel showing cart contents
- **CartItem** component - Individual item in cart with quantity controls
- **CartSummary** component - Cart totals (subtotal, shipping estimate, tax estimate, total)
- Unit tests for all cart components
- Responsive design (mobile and desktop)
- Smooth animations for drawer open/close
- Accessibility (keyboard navigation, ARIA labels)
- Integration with existing CartContext

### Out of Scope

- Cart page (covered in Task 05)
- Checkout page components (covered in Task 05)
- Server-side validation (covered in Task 03)
- Payment components (covered in Task 04)
- "Add to Cart" button on Shoppe page (covered in Task 05)

## Implementation Requirements

### Technology Stack

- React 19 with TypeScript
- Tailwind CSS 4 for styling
- Next.js Image component for product thumbnails
- CartContext for state management
- Vitest + @testing-library/react for testing

### Component Design Principles

- Follow existing component patterns from Phase 2/3
- Use Tailwind classes for styling (no custom CSS)
- Fully responsive (mobile-first design)
- Accessible (WCAG 2.1 AA compliance)
- Performance-optimized (lazy loading where appropriate)

### Component Specifications

#### CartButton

- Fixed position in header (top-right)
- Shopping cart icon with item count badge
- Badge shows total quantity of all items
- Badge hidden when cart is empty
- Click opens CartDrawer
- Badge animates when item added
- Accessible (aria-label, keyboard accessible)

#### CartDrawer

- Slide-out panel from right side
- Overlay darkens background when open
- Close button (X) and close on overlay click
- Shows "Your cart is empty" message when empty
- Lists all cart items using CartItem component
- Shows CartSummary at bottom
- "View Cart" and "Checkout" buttons
- Smooth open/close animation
- Scroll when many items
- Traps focus when open (accessibility)
- Closes on Escape key

#### CartItem

- Product thumbnail image (80x80px)
- Product title and price
- Quantity selector (dropdown or +/- buttons)
- Remove button (trash icon or X)
- Line total (price × quantity)
- Disabled state when updating
- Optimistic UI updates
- Accessible controls

#### CartSummary

- Subtotal (sum of line totals)
- Shipping estimate ($5.00 flat rate)
- Tax estimate (TBD or "Calculated at checkout")
- Total (subtotal + shipping + tax)
- Clear visual hierarchy
- Formatted currency ($XX.XX)

## Files to Create/Modify

### New Files

- `src/components/cart/CartButton.tsx` - Header cart button with badge
- `src/components/cart/CartDrawer.tsx` - Slide-out cart panel
- `src/components/cart/CartItem.tsx` - Individual cart item
- `src/components/cart/CartSummary.tsx` - Cart totals summary
- `__tests__/components/cart/CartButton.test.tsx` - CartButton tests
- `__tests__/components/cart/CartDrawer.test.tsx` - CartDrawer tests
- `__tests__/components/cart/CartItem.test.tsx` - CartItem tests
- `__tests__/components/cart/CartSummary.test.tsx` - CartSummary tests

### Modified Files

- `src/app/layout.tsx` - Add CartButton to header (if not already present)

## Testing Requirements

### CartButton Tests

- [x] Renders cart icon
- [ ] Shows badge with correct item count
- [x] Hides badge when cart is empty
- [x] Opens drawer when clicked
- [ ] Badge updates when items added/removed
- [x] Accessible (aria-label, keyboard nav)

### CartDrawer Tests

- [x] Opens and closes correctly
- [x] Shows empty state when no items
- [ ] Displays all cart items
- [ ] Shows CartSummary
- [x] Closes on overlay click
- [x] Closes on Escape key
- [x] Closes on close button click
- [ ] "View Cart" and "Checkout" buttons render
- [x] Accessible (focus trap, ARIA)

### CartItem Tests

- [ ] Displays product image, title, price
- [ ] Shows correct quantity
- [ ] Shows correct line total
- [ ] Quantity selector updates cart
- [ ] Remove button removes item
- [ ] Optimistic updates work
- [ ] Disabled state during updates
- [ ] Accessible controls

### CartSummary Tests

- [ ] Calculates subtotal correctly
- [ ] Shows shipping cost ($5.00)
- [ ] Shows tax estimate or placeholder
- [ ] Calculates total correctly
- [ ] Formats currency properly
- [ ] Updates when cart changes

## Success Criteria

- [ ] CartButton component complete and tested
- [ ] CartDrawer component complete and tested
- [ ] CartItem component complete and tested
- [ ] CartSummary component complete and tested
- [ ] All components integrate with CartContext
- [ ] All unit tests pass
- [ ] Test coverage ≥80% for cart components
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Animations smooth and performant
- [ ] Accessibility standards met (keyboard nav, ARIA)
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Code formatted with Prettier
- [ ] The verify-code skill has been successfully executed

## Implementation Notes

### CartButton Integration

Add to `src/app/layout.tsx` in header:

```tsx
import dynamic from 'next/dynamic';

const CartButton = dynamic(
    () => import('@/components/cart/CartButton').then((mod) => mod.CartButton),
    { ssr: false }
);

// In header JSX:
<header>
    {/* existing header content */}
    <CartButton />
</header>;
```

### CartDrawer State Management

Use React state for open/close:

```tsx
'use client';
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';

export function CartButton() {
    const [isOpen, setIsOpen] = useState(false);
    const { getItemCount } = useCart();

    return (
        <>
            <button onClick={() => setIsOpen(true)}>
                Cart ({getItemCount()})
            </button>
            <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
```

### Quantity Selector

Use select dropdown or +/- buttons:

```tsx
// Option 1: Dropdown
<select
  value={quantity}
  onChange={(e) => updateQuantity(artworkId, parseInt(e.target.value))}
>
  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
    <option key={n} value={n}>{n}</option>
  ))}
</select>

// Option 2: +/- buttons
<button onClick={() => updateQuantity(artworkId, quantity - 1)}>-</button>
<span>{quantity}</span>
<button onClick={() => updateQuantity(artworkId, quantity + 1)}>+</button>
```

### Currency Formatting

Create utility function:

```tsx
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}
```

### Slide-Out Animation

Use Tailwind classes:

```tsx
<div
    className={`fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}
>
    {/* drawer content */}
</div>
```

### Focus Trap (Accessibility)

Use `useEffect` to trap focus:

```tsx
useEffect(() => {
    if (!isOpen) return;

    const drawer = drawerRef.current;
    const focusableElements = drawer.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement?.focus();

    const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
        }
    };

    drawer.addEventListener('keydown', handleTab);
    return () => drawer.removeEventListener('keydown', handleTab);
}, [isOpen]);
```

### Testing Pattern

Test with CartProvider wrapper:

```tsx
import { render, screen } from '@testing-library/react';
import { CartProvider } from '@/context/CartContext';
import { CartButton } from '@/components/cart/CartButton';

const renderWithCart = (ui: React.ReactElement) => {
    return render(<CartProvider>{ui}</CartProvider>);
};

it('should display item count', () => {
    renderWithCart(<CartButton />);
    // Add items to cart and test badge
});
```

## Notes

- All components are client-side ('use client') since they use CartContext
- Use dynamic imports for cart button to avoid SSR issues
- Follow existing component patterns from Phase 2/3 for consistency
- Consider using shadcn/ui patterns if already used in project
- Ensure all components work with existing CartContext (no modifications needed)
- Components should handle loading and error states gracefully
- Optimistic updates provide better UX (update UI immediately, sync cart async)
