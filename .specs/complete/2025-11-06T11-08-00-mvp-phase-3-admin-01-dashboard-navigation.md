# 2025-11-06T11-08-00-mvp-phase-3-admin-01: Dashboard & Navigation Infrastructure

## Parent Specification

This is sub-task 01 of the parent specification: `2025-11-06T11-08-00-mvp-phase-3-admin.md`

## Objective

Build the foundational admin dashboard with metrics, responsive navigation system (horizontal menu bar on desktop, sidebar on mobile), and reusable admin UI components.

## Dependencies

**Prerequisites** (must be completed before this task):

- None - This is the foundation task that can start immediately

**Blocks** (tasks that depend on this one):

- Task 02: Artwork Management (needs AdminCard, navigation structure)
- Task 03: Image Upload System (needs navigation to access upload features)
- Task 04: Order Management (needs navigation and card components)
- Task 05: Projects & Events Management (needs navigation structure)

**Parallel Opportunities**:

- None - This must complete first as it provides the foundation for all other admin features

## Scope

### In Scope

**Database Queries** (`src/lib/db/admin/dashboard.ts`):

- `getDashboardMetrics()` - Returns total orders, orders this month, total revenue, pending orders
- `getRecentOrders()` - Returns last 10 orders with pagination

**Admin Components** (`src/components/admin/`):

- `AdminCard.tsx` - Reusable card component for metrics and content sections
- `AdminHeader.tsx` - Compact header with logo, admin name, logout button, mobile menu toggle
- `AdminNavigation.tsx` - Responsive navigation (horizontal menu bar on desktop ≥1024px, collapsible sidebar on mobile <1024px)

**Admin Layout** (`src/app/admin/layout.tsx`):

- Client component that wraps all admin pages
- Manages mobile menu state
- Reads admin name and role from `admin_session` cookie
- Responsive layout structure

**Dashboard Page** (`src/app/admin/page.tsx`):

- Server component that fetches and displays dashboard data
- 4 metric cards (Total Orders, Orders This Month, Total Revenue, Pending Orders)
- Recent orders table with links to order details
- Error handling and loading states

**Testing**:

- Unit tests for dashboard query functions (100% coverage)
- Component tests for AdminCard, AdminHeader, AdminNavigation (80-85% coverage)
- Integration tests for layout and dashboard page (70%+ coverage)

### Out of Scope

- Image upload functionality (Task 03)
- Artwork CRUD operations (Task 02)
- Order detail pages and status updates (Task 04)
- Projects and events management (Task 05)
- Settings page (later phase)

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

### Design Specifications

**AdminHeader**:

- Height: ~60px (compact compared to public header)
- Layout: Hamburger menu (mobile only) | Logo | Admin name (desktop only) | Logout button
- Logo links to `/admin` dashboard
- Logout button calls Supabase `signOut()`

**AdminNavigation**:

- Desktop (≥1024px): Horizontal menu bar (~48px height) below header
- Mobile (<1024px): Sidebar (256px width) that slides in from left
- Links: Dashboard | Artwork | Orders | Projects | Events | Settings (super_admin only)
- Active route highlighting
- Backdrop overlay on mobile when sidebar open

**AdminCard**:

- Props: `title`, `value?`, `label?`, `loading?`, `children?`, `className?`
- Supports metric display (title + value + label) or custom children content
- Loading state shows skeleton
- Extends existing Card component patterns

### Authentication & Session

- Admin layout reads `admin_session` cookie to get admin name and role
- Cookie contains: `userId`, `adminId`, `name`, `role`, `expiresAt`
- Session validated by proxy (formerly middleware) before layout renders
- No additional auth checks needed in components (proxy handles it)

### Query Pattern

All admin queries follow the established pattern:

```typescript
export async function queryName(params): Promise<{
    data: T | null;
    error: ErrorType | null;
}>;
```

- Use server client (service role key) from `@/lib/supabase/server`
- Never throw exceptions - always return `{ data, error }` tuple
- Custom error interfaces (e.g., `DashboardQueryError`)
- Include runtime check: `if (typeof window !== 'undefined') throw new Error(...)`

## Files to Create/Modify

**Create**:

- `src/lib/db/admin/dashboard.ts` - Dashboard query functions
- `src/components/admin/AdminCard.tsx` - Metric/content card component
- `src/components/admin/AdminHeader.tsx` - Admin header with logout
- `src/components/admin/AdminNavigation.tsx` - Responsive navigation
- `src/app/admin/layout.tsx` - Admin layout wrapper
- `__tests__/lib/db/admin/dashboard.test.ts` - Dashboard query tests
- `__tests__/components/admin/AdminCard.test.tsx` - Card component tests
- `__tests__/components/admin/AdminHeader.test.tsx` - Header component tests
- `__tests__/components/admin/AdminNavigation.test.tsx` - Navigation component tests
- `__tests__/app/admin/layout.test.tsx` - Layout tests
- `__tests__/app/admin/dashboard.test.tsx` - Dashboard page tests

**Modify**:

- `src/app/admin/page.tsx` - Update from placeholder to functional dashboard

## Testing Requirements

### Coverage Targets

- Dashboard query functions: 100% coverage
- Admin components: 80-85% coverage
- Dashboard page: 70%+ coverage

### Test Scenarios

**Dashboard Queries**:

- Returns correct metrics (total orders, monthly orders, revenue, pending)
- Handles database errors gracefully
- Uses service role client
- Returns `{ data, error }` format
- Pagination works for recent orders

**AdminCard**:

- Renders title and children
- Displays metric value and label
- Shows loading skeleton when `loading=true`
- Applies custom className
- Accessible heading hierarchy

**AdminHeader**:

- Renders logo linking to `/admin`
- Displays admin name
- Logout button calls `signOut()`
- Mobile: Shows hamburger menu button
- Hamburger toggles navigation state

**AdminNavigation**:

- Desktop: Horizontal menu bar visible
- Mobile: Sidebar hidden by default, slides in when `isOpen=true`
- Shows all navigation links
- Filters Settings link for non-super_admin roles
- Highlights active route
- Backdrop closes sidebar on click

**Admin Layout**:

- Renders header, navigation, and children
- Passes admin name to header
- Passes role to navigation
- Mobile menu state toggles correctly

**Dashboard Page**:

- Fetches and displays 4 metrics
- Shows recent orders table
- Links to order detail pages
- Handles loading state
- Handles error state (shows error message)
- Shows empty state if no orders

### Manual Testing Checklist

- [ ] Navigate to `/admin` - dashboard loads
- [ ] Verify 4 metric cards display (may be 0 if no data)
- [ ] Desktop: Horizontal menu bar appears below header
- [ ] Desktop: Click each nav link (Dashboard, Artwork, Orders, etc.)
- [ ] Desktop: Active route is highlighted
- [ ] Mobile: Hamburger menu button visible
- [ ] Mobile: Click hamburger - sidebar slides in
- [ ] Mobile: Click backdrop - sidebar closes
- [ ] Mobile: Navigation links work in sidebar
- [ ] Logout button signs out and redirects to login
- [ ] Logo links back to dashboard

## Success Criteria

- [x] All dashboard query tests pass (100% coverage)
- [x] All component tests pass (80-85% coverage)
- [x] All page tests pass (70%+ coverage)
- [x] TypeScript compiles without errors
- [x] ESLint passes with no warnings
- [x] Prettier formatting applied
- [x] Dashboard displays metrics correctly
- [x] Navigation works on desktop (horizontal menu)
- [x] Navigation works on mobile (collapsible sidebar)
- [x] Active route highlighting works
- [x] Role-based Settings link visibility works
- [x] Logout functionality works
- [x] Manual testing checklist complete
- [x] The verify-code skill has been successfully executed

## Notes

### Prerequisite Configuration

Before starting this task, ensure:

1. ✅ Supabase Storage bucket `artwork` created and configured (see parent spec)
2. ✅ Proxy updated to include `name` in session cookie (see parent spec)
3. ✅ React Hook Form and Zod dependencies installed (see parent spec)

### Navigation Design Pattern

The responsive navigation uses Tailwind breakpoints:

- `hidden lg:flex` - Desktop horizontal menu (≥1024px)
- `lg:hidden` - Mobile sidebar trigger (<1024px)
- Sidebar uses `translate-x` transform for slide-in animation
- Backdrop uses fixed positioning with semi-transparent background

### Component Reusability

AdminCard is designed to be highly reusable:

- Metric mode: Pass `title`, `value`, `label` for dashboard metrics
- Content mode: Pass `title` and `children` for custom card content
- Used throughout admin interface for consistent styling

### Performance Considerations

- Dashboard metrics query uses single database call with aggregations
- Recent orders limited to 10 by default (pagination for more)
- Session cookie read once in layout, passed down as props
- No unnecessary re-fetches on navigation (layout persists)

### Error Handling Strategy

- Database errors: Show user-friendly message, log details in development
- Missing session: Proxy redirects to login before layout renders
- Invalid role: UI hides restricted links (Settings), server enforces access
- Network errors: Display retry option on dashboard

### Accessibility

- Proper semantic HTML (header, nav, main)
- ARIA labels for hamburger menu button
- Keyboard navigation support for all menu items
- Focus management when opening/closing mobile sidebar
- Sufficient color contrast for all text
