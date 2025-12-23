# 2025-11-06T11-08-00-mvp-phase-3-admin-04: Order Management

## Parent Specification

This is sub-task 04 of the parent specification: `2025-11-06T11-08-00-mvp-phase-3-admin.md`

## Objective

Build a complete order management interface for viewing orders, updating status, adding tracking numbers, and managing admin notes.

## Dependencies

**Prerequisites** (must be completed before this task):

- Task 01: Dashboard & Navigation Infrastructure (provides admin layout and navigation)

**Blocks** (tasks that depend on this one):

- None - other tasks can proceed independently

**Parallel Opportunities**:

- Task 02: Artwork Management (can run in parallel - different data model)
- Task 03: Image Upload System (can run in parallel - independent feature)
- Task 05: Projects & Events Management (can run in parallel - different data model)

## Scope

### In Scope

**Admin Order Queries** (`src/lib/db/admin/orders.ts`):

- `getAllOrders(limit?, offset?, filters?)` - Paginated orders with filtering by status and date range
- `getOrderById(id)` - Single order with `order_items` joined (full order details)
- `updateOrderStatus(id, status)` - Update order status (pending, paid, shipped, delivered, cancelled)
- `addOrderNote(id, note)` - Append admin note to order
- `addTrackingNumber(id, tracking)` - Add shipping tracking number to order

**OrdersList Component** (`src/components/admin/OrdersList.tsx`):

- Displays orders in table format
- Columns: Order Number, Customer Name, Date, Total Amount, Status, Actions
- Status badges with colors (pending: yellow, paid: green, shipped: blue, delivered: teal, cancelled: red)
- "View Details" button linking to order detail page
- Pagination controls (Previous/Next, page numbers)
- Props: `orders`, `currentPage`, `totalPages`, `onPageChange`

**Orders List Page** (`src/app/admin/orders/page.tsx`):

- Server component with search params for pagination and filters
- Fetches orders using `getAllOrders()`
- Filter controls: Status dropdown, optional date range picker
- Displays OrdersList component
- Pagination via URL search params
- Handles loading and error states

**Order Detail Page** (`src/app/admin/orders/[id]/page.tsx`):

- Client component for interactive status updates
- Fetches order using `getOrderById()`
- Displays complete order information:
    - Order number, date, status badge
    - Customer name, email
    - Shipping address
    - Billing address (if different)
- Order items table:
    - Columns: Product, Quantity, Price, Subtotal
    - Calculated totals: Subtotal, Shipping, Tax, Total
- Admin action controls:
    - Status dropdown (pending, paid, shipped, delivered, cancelled)
    - Update Status button
    - Admin notes textarea
    - Save Notes button
    - Tracking number input
    - Save Tracking button
- Back link to orders list
- Handles 404 if order not found

**Testing**:

- Unit tests for all admin order query functions (100% coverage)
- Component tests for OrdersList (80-85% coverage)
- Page tests for orders list and order detail (70%+ coverage)
- Integration tests for status updates, notes, tracking

### Out of Scope

- Creating new orders (orders created via checkout flow in Phase 3 of MVP)
- Refund processing (future enhancement)
- Bulk order operations (future enhancement)
- Email notifications to customers (Phase 5)
- Printing order invoices/packing slips (future enhancement)
- Order search by customer name/email (future enhancement - use filters for MVP)

## Implementation Requirements

### TDD Workflow

Follow strict Red/Green/Refactor pattern:

1. **Red**: Write failing tests first
2. **Green**: Implement minimal code to pass tests
3. **Refactor**: Improve code quality while keeping tests green

### Code Verification Procedure

Run after each TDD Green/Refactor step:

1. `npx tsc --noEmit` - TypeScript check
2. `npx eslint --fix {modified-files}` - Lint with auto-fix
3. `npx prettier --write {modified-files}` - Format code
4. `npx vitest related run {modified-files}` - Run related tests

### Order Status Values

```typescript
type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
```

**Status Flow**:

- `pending` → `paid` → `shipped` → `delivered`
- Any status can transition to `cancelled`

**Status Badge Colors** (Tailwind):

- `pending`: `bg-yellow-100 text-yellow-800`
- `paid`: `bg-green-100 text-green-800`
- `shipped`: `bg-blue-100 text-blue-800`
- `delivered`: `bg-teal-100 text-teal-800`
- `cancelled`: `bg-red-100 text-red-800`

### Filters Interface

```typescript
interface OrderFilters {
    status?: OrderStatus;
    startDate?: string; // ISO date string
    endDate?: string; // ISO date string
}
```

For MVP: Status filter only (dropdown).
Date range filter: Optional enhancement.

### Query Pattern

All admin order queries follow the established pattern:

```typescript
export async function queryName(params): Promise<{
    data: T | null;
    error: OrderAdminError | null;
}>;
```

- Use server client (service role key) from `@/lib/supabase/server`
- Never throw exceptions - always return `{ data, error }` tuple
- Custom error interface: `OrderAdminError`
- Include runtime check: `if (typeof window !== 'undefined') throw new Error(...)`

### Order Items Join

`getOrderById()` must join with `order_items` table to get product details:

```typescript
const { data, error } = await supabase
    .from('orders')
    .select(
        `
        *,
        order_items (
            id,
            order_id,
            artwork_id,
            quantity,
            price_at_time,
            subtotal
        )
    `
    )
    .eq('id', id)
    .single();
```

## Files to Create/Modify

**Create**:

- `src/lib/db/admin/orders.ts` - Admin order query functions
- `src/components/admin/OrdersList.tsx` - Orders list component
- `src/app/admin/orders/page.tsx` - Orders list page
- `src/app/admin/orders/[id]/page.tsx` - Order detail page
- `src/app/admin/orders/actions.ts` - Server Actions for status/notes/tracking updates
- `__tests__/lib/db/admin/orders.test.ts` - Order query tests
- `__tests__/components/admin/OrdersList.test.tsx` - OrdersList component tests
- `__tests__/app/admin/orders/page.test.tsx` - Orders list page tests
- `__tests__/app/admin/orders/[id]/page.test.tsx` - Order detail page tests

## Testing Requirements

### Coverage Targets

- Admin order queries: 100% coverage
- OrdersList component: 80-85% coverage
- Order pages: 70%+ coverage

### Test Scenarios

**Admin Order Queries**:

- `getAllOrders()` returns paginated orders
- `getAllOrders()` filters by status (pending, paid, shipped, etc.)
- `getAllOrders()` filters by date range (optional)
- `getAllOrders()` sorts by created_at DESC by default
- `getOrderById()` returns order with order_items joined
- `getOrderById()` returns error if not found
- `updateOrderStatus()` updates order status
- `updateOrderStatus()` returns error if order not found
- `addOrderNote()` appends note to admin_notes field
- `addOrderNote()` returns error if order not found
- `addTrackingNumber()` adds tracking_number to order
- `addTrackingNumber()` returns error if order not found
- All functions use server client (service role)
- All functions return `{ data, error }` format

**OrdersList Component**:

- Renders table with correct columns
- Displays order data (number, customer, date, total, status)
- Status badges have correct colors
- "View Details" button links to `/admin/orders/[id]`
- Pagination controls appear when multiple pages
- Page change calls `onPageChange` callback
- Shows empty state when no orders
- Handles loading state (optional prop)

**Orders List Page**:

- Renders "Orders" title
- Fetches orders on page load
- Displays OrdersList component with fetched data
- Status filter dropdown appears
- Changing status filter refetches orders with filter
- Pagination via URL search params (`?page=2`)
- Handles loading state
- Handles error state (shows error message)

**Order Detail Page**:

- Fetches order by ID from URL params
- Displays order information (number, date, status)
- Shows customer details (name, email)
- Displays shipping and billing addresses
- Renders order items table with all columns
- Calculates totals correctly (subtotal, shipping, tax, total)
- Status dropdown shows current status selected
- Updating status calls `updateOrderStatus()` and refreshes
- Admin notes textarea displays existing notes
- Saving notes calls `addOrderNote()` and refreshes
- Tracking number input displays existing tracking
- Saving tracking calls `addTrackingNumber()` and refreshes
- Shows 404 page if order not found
- Back link to `/admin/orders` works
- Handles update errors (shows error message)

### Manual Testing Checklist

- [ ] Navigate to `/admin/orders` - list page loads
- [ ] Verify orders table displays with all columns
- [ ] Status badges show correct colors
- [ ] Click status filter dropdown - options appear
- [ ] Filter by "paid" status - only paid orders show
- [ ] Paginate through orders (if multiple pages exist)
- [ ] Click "View Details" - order detail page loads
- [ ] Verify all order information displays correctly
- [ ] Verify order items table shows products
- [ ] Verify totals calculated correctly
- [ ] Change status in dropdown - click Update Status
- [ ] Verify status updates and badge changes
- [ ] Type admin note - click Save Notes
- [ ] Verify note saves and displays
- [ ] Enter tracking number - click Save Tracking
- [ ] Verify tracking saves and displays
- [ ] Click Back link - returns to orders list
- [ ] Test 404 - navigate to non-existent order ID

## Success Criteria

- [ ] All order query tests pass (100% coverage)
- [ ] All component tests pass (80-85% coverage)
- [ ] All page tests pass (70%+ coverage)
- [ ] TypeScript compiles without errors
- [ ] ESLint passes with no warnings
- [ ] Prettier formatting applied
- [ ] Orders list displays correctly with pagination
- [ ] Status filter works
- [ ] Order detail page shows all information
- [ ] Can update order status
- [ ] Can add admin notes
- [ ] Can add tracking number
- [ ] Status badges display correct colors
- [ ] Navigation between list and detail works
- [ ] 404 handling works for invalid order IDs
- [ ] Manual testing checklist complete
- [ ] The verify-code skill has been successfully executed

## Notes

### Server Actions Pattern

Use Next.js Server Actions for order updates:

```typescript
// src/app/admin/orders/actions.ts
'use server';

import {
    updateOrderStatus,
    addOrderNote,
    addTrackingNumber,
} from '@/lib/db/admin/orders';
import { revalidatePath } from 'next/cache';

export async function updateStatusAction(orderId: string, status: OrderStatus) {
    const result = await updateOrderStatus(orderId, status);

    if (result.data) {
        revalidatePath(`/admin/orders/${orderId}`);
        revalidatePath('/admin/orders');
        revalidatePath('/admin'); // Dashboard metrics
    }

    return result;
}

export async function addNoteAction(orderId: string, note: string) {
    const result = await addOrderNote(orderId, note);

    if (result.data) {
        revalidatePath(`/admin/orders/${orderId}`);
    }

    return result;
}

export async function addTrackingAction(orderId: string, tracking: string) {
    const result = await addTrackingNumber(orderId, tracking);

    if (result.data) {
        revalidatePath(`/admin/orders/${orderId}`);
    }

    return result;
}
```

### Admin Notes Implementation

Admin notes stored as text field in `orders` table.

Options for implementation:

1. **Simple text field**: Store as single string, append new notes with timestamp
2. **Array field**: Store as PostgreSQL array (requires schema change)

For MVP: Use option 1 (simple text field).

Format when appending:

```
[2024-11-21 14:30] Admin Name: Note text here
```

### Tracking Number Field

`tracking_number` field in `orders` table stores single tracking number (text).

For MVP: Single tracking number only.
Future enhancement: Support multiple tracking numbers (split shipments).

### Pagination Implementation

Use URL search params for pagination:

- `/admin/orders?page=1`
- `/admin/orders?page=2&status=paid`

Server component reads params:

```typescript
export default async function OrdersPage({
    searchParams,
}: {
    searchParams: { page?: string; status?: string };
}) {
    const page = parseInt(searchParams.page || '1');
    const status = searchParams.status as OrderStatus | undefined;

    const limit = 20;
    const offset = (page - 1) * limit;

    const { data: orders } = await getAllOrders(limit, offset, { status });
    // ...
}
```

### Order Items Display

Order items table calculates subtotal:

```
Subtotal = quantity × price_at_time
```

Important: Use `price_at_time` (price when order was placed), not current artwork price.

### Totals Calculation

Order detail page displays:

- **Subtotal**: Sum of all order_items subtotals
- **Shipping**: From `shipping_amount` field
- **Tax**: From `tax_amount` field
- **Total**: From `total_amount` field (should equal subtotal + shipping + tax)

### Error Handling Strategy

- Query errors: Return `{ data: null, error: { code, message, details? } }`
- 404 errors: Show "Order not found" page with link to orders list
- Update errors: Show toast/alert message with error details
- Network errors: Display retry button

### Future Enhancements

Not in scope for this task but documented for future:

- Email notifications on status change
- Print invoice/packing slip
- Bulk status updates (select multiple orders)
- Order search by customer name/email
- Refund processing
- Order export (CSV/Excel)
- Advanced filtering (date range, amount range)
- Order analytics/reporting

### Accessibility

- Table has proper headers with scope attributes
- Status dropdown has accessible label
- Form controls have associated labels
- Success/error messages announced to screen readers
- Keyboard navigation support for all controls
- Sufficient color contrast for status badges
- Focus management after status updates
