# 2025-11-06T11-08-00-mvp-phase-3-admin-06: Settings & Admin User Management

## Parent Specification

This is sub-task 06 of the parent specification: `2025-11-06T11-08-00-mvp-phase-3-admin.md`

## Objective

Build settings page with admin user management for super_admin role only, including creating new admin users, editing roles, and deactivating users.

## Dependencies

**Prerequisites** (must be completed before this task):

- Task 01: Dashboard & Navigation Infrastructure (provides admin layout and navigation)

**Blocks** (tasks that depend on this one):

- None - this is an optional advanced feature

**Parallel Opportunities**:

- Task 02: Artwork Management (can run in parallel - independent feature)
- Task 03: Image Upload System (can run in parallel - independent feature)
- Task 04: Order Management (can run in parallel - independent feature)
- Task 05: Projects & Events Management (can run in parallel - independent feature)

## Scope

### In Scope

**Admin User Queries** (`src/lib/db/admin/administrators.ts`):

- `getAllAdmins()` - List all administrators (including inactive)
- `getAdminById(id)` - Returns single admin by UUID
- `createAdmin(data)` - Creates new admin user in both Supabase Auth and `administrators` table
- `updateAdmin(id, data)` - Updates admin name, role, or status
- `deactivateAdmin(id)` - Sets `is_active = false` (soft delete)

**Validation Schema** (`src/lib/validation/admin.ts`):

- Zod schema for admin form validation
- Fields: name (required), email (required, valid email), role (enum), password (required for new, optional for edit), is_active (boolean)

**AdminForm Component** (`src/components/admin/AdminForm.tsx`):

- Client component with React Hook Form + Zod validation
- Fields: Name, Email, Role dropdown (admin/super_admin), Password (new only), Is Active checkbox (edit only)
- Props: `initialData?`, `onSubmit`, `isLoading?`, `mode: 'create' | 'edit'`

**Settings Page** (`src/app/admin/settings/page.tsx`):

- Server component with super_admin role check
- Redirects non-super_admins to dashboard with error message
- Admin Users section:
    - Table listing all admins (Name, Email, Role, Status, Actions)
    - "Add New Admin" button (opens modal/dialog)
    - Edit button for each admin (opens modal with pre-filled form)
    - Deactivate button for each admin (disabled for current user)
- Site Settings section (placeholder for future):
    - "Coming soon" message
    - Note about future features (shipping costs, social links, etc.)

**Testing**:

- Unit tests for admin user query functions (100% coverage)
- Validation schema tests (100% coverage)
- Component tests for AdminForm (80-85% coverage)
- Page tests for settings page (70%+ coverage)
- Security tests (role-based access, cannot deactivate self)

### Out of Scope

- Resetting admin passwords (future enhancement)
- Admin activity logs/audit trail (future enhancement)
- Site configuration settings (shipping cost, tax rates, social media links) - future
- Bulk admin operations (future enhancement)
- Admin permissions beyond role-based (admin vs. super_admin)

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

### Admin User Creation Flow

Creating a new admin user involves two steps:

1. **Create Supabase Auth User**:

```typescript
const { data: authUser, error: authError } =
    await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password, // temporary password, user should reset
        email_confirm: true, // skip email verification
    });
```

2. **Create Administrator Record**:

```typescript
const { data: admin, error } = await supabase
    .from('administrators')
    .insert({
        auth_id: authUser.user.id,
        name: data.name,
        email: data.email,
        role: data.role,
        is_active: true,
    })
    .select()
    .single();
```

**Important**: If step 1 succeeds but step 2 fails, rollback the auth user creation (or mark for cleanup).

### Role-Based Access Control

**Settings Page Access**:

- Read `admin_session` cookie to get current user's role
- If `role !== 'super_admin'`, redirect to `/admin` with error message
- Server component can check on server-side before rendering
- Client components can check on client-side for UI decisions

**Navigation Link Visibility**:

- Settings link in AdminNavigation only visible when `role === 'super_admin'`
- Already implemented in Task 01

### Deactivation vs. Deletion

Use **soft delete** pattern:

- Set `is_active = false` in `administrators` table
- Do NOT delete from database (preserve audit trail)
- Do NOT delete Supabase Auth user
- Deactivated admins cannot log in (proxy checks `is_active = true`)

**Cannot Deactivate Self**:

- Check if admin being deactivated matches current logged-in admin
- Disable deactivate button in UI for current user
- Server-side check to prevent API calls (return error if attempted)

### Validation Rules

```typescript
export const adminSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    role: z.enum(['admin', 'super_admin'], {
        errorMap: () => ({ message: 'Role must be admin or super_admin' }),
    }),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .optional(),
    is_active: z.boolean().default(true),
});
```

**Conditional Validation**:

- `password` required when `mode === 'create'`
- `password` optional when `mode === 'edit'`

Use Zod's `.refine()` or conditional schema for this.

### Query Pattern

All admin user queries follow the established pattern:

```typescript
export async function queryName(params): Promise<{
    data: T | null;
    error: AdministratorError | null;
}>;
```

- Use server client (service role key) from `@/lib/supabase/server`
- Never throw exceptions - always return `{ data, error }` tuple
- Custom error interface: `AdministratorError`
- Include runtime check: `if (typeof window !== 'undefined') throw new Error(...)`

## Files to Create/Modify

**Create**:

- `src/lib/db/admin/administrators.ts` - Admin user query functions
- `src/lib/validation/admin.ts` - Admin validation schema
- `src/components/admin/AdminForm.tsx` - Admin user form component
- `src/app/admin/settings/page.tsx` - Settings page
- `src/app/admin/settings/actions.ts` - Server Actions for admin user operations
- `__tests__/lib/db/admin/administrators.test.ts` - Admin user query tests
- `__tests__/lib/validation/admin.test.ts` - Admin validation schema tests
- `__tests__/components/admin/AdminForm.test.tsx` - AdminForm component tests
- `__tests__/app/admin/settings/page.test.tsx` - Settings page tests

## Testing Requirements

### Coverage Targets

- Admin user queries: 100% coverage
- Validation schema: 100% coverage
- AdminForm component: 80-85% coverage
- Settings page: 70%+ coverage

### Test Scenarios

**Admin User Queries**:

- `getAllAdmins()` returns all administrators (active and inactive)
- `getAdminById()` returns single admin by UUID
- `getAdminById()` returns error if not found
- `createAdmin()` creates Supabase Auth user and administrator record
- `createAdmin()` returns error if email already exists
- `createAdmin()` validates role (only 'admin' or 'super_admin')
- `createAdmin()` rolls back on partial failure (auth succeeds, DB insert fails)
- `updateAdmin()` updates name, role, and is_active
- `updateAdmin()` returns error if admin not found
- `deactivateAdmin()` sets is_active to false
- `deactivateAdmin()` returns error if admin not found
- All functions use server client (service role)
- All functions return `{ data, error }` format

**Validation Schema**:

- Name is required
- Email is required and must be valid email format
- Role must be 'admin' or 'super_admin'
- Password required for create mode (8+ characters)
- Password optional for edit mode
- is_active defaults to true

**AdminForm Component**:

- Renders name, email, role, password (create mode) fields
- Role dropdown shows 'admin' and 'super_admin' options
- Password field only visible in create mode
- Is Active checkbox only visible in edit mode
- Shows validation errors inline
- Submit button disabled when form invalid
- Calls `onSubmit` with valid form data
- Pre-fills form in edit mode (`initialData` prop)
- Cancel button exists and functions

**Settings Page**:

- Redirects to `/admin` if current user is not super_admin
- Shows "Access Denied" message if role check fails
- Renders "Settings" page title
- Displays "Admin Users" section with table
- Table columns: Name, Email, Role, Status (Active/Inactive), Actions
- "Add New Admin" button opens create form modal
- Edit button opens edit form modal with pre-filled data
- Deactivate button is disabled for current user
- Deactivate button shows confirmation dialog
- Modal form submission creates/updates admin
- Admin list refreshes after create/update/deactivate
- Shows "Site Settings" section with placeholder message

### Manual Testing Checklist

**As Super Admin**:

- [ ] Navigate to `/admin/settings` - page loads
- [ ] Verify "Admin Users" table displays all admins
- [ ] Click "Add New Admin" - modal opens with form
- [ ] Fill out form (name, email, role, password) - validation works
- [ ] Submit form - new admin created
- [ ] Verify new admin appears in table
- [ ] Login as new admin - works correctly
- [ ] Logout, login as super admin again
- [ ] Click Edit on an admin - modal opens with pre-filled form
- [ ] Update admin name - saves successfully
- [ ] Change admin role from 'admin' to 'super_admin' - updates
- [ ] Click Deactivate on an admin (not self) - confirmation appears
- [ ] Confirm deactivation - admin status changes to "Inactive"
- [ ] Try to deactivate self - button is disabled
- [ ] Verify "Site Settings" section shows placeholder

**As Regular Admin**:

- [ ] Login as regular admin (not super_admin)
- [ ] Try to navigate to `/admin/settings` - redirected or access denied
- [ ] Verify Settings link not visible in navigation

## Success Criteria

- [ ] All admin user query tests pass (100% coverage)
- [ ] All validation schema tests pass (100% coverage)
- [ ] All component tests pass (80-85% coverage)
- [ ] All page tests pass (70%+ coverage)
- [ ] TypeScript compiles without errors
- [ ] ESLint passes with no warnings
- [ ] Prettier formatting applied
- [ ] Super admin can create new admin users
- [ ] Super admin can edit existing admin users
- [ ] Super admin can deactivate admin users (except self)
- [ ] Regular admins cannot access settings page
- [ ] Role-based navigation works (Settings link visibility)
- [ ] Form validation works correctly
- [ ] Cannot deactivate currently logged-in admin
- [ ] Manual testing checklist complete
- [ ] The verify-code skill has been successfully executed

## Notes

### Security Considerations

**Authentication for Admin Creation**:

- Only super_admin can create/edit/deactivate other admins
- Server-side role check required (not just client-side)
- Validate role in query functions (prevent privilege escalation)

**Preventing Self-Deactivation**:

- Client-side: Disable button for current user
- Server-side: Check `adminId` against current user's `adminId` from session cookie
- Return error if attempting to deactivate self

**Password Handling**:

- New admin passwords should be temporary (force reset on first login - future)
- Passwords never stored in `administrators` table (only in Supabase Auth)
- Consider password reset flow (email link) - future enhancement

### Modal/Dialog Implementation

For "Add New Admin" and "Edit Admin", use a modal/dialog:

**Options**:

1. HTML `<dialog>` element with Tailwind styling
2. Headless UI Dialog component
3. Radix UI Dialog component

For MVP, use HTML `<dialog>` element (native, no extra dependencies):

```tsx
const [showModal, setShowModal] = useState(false);

return (
    <>
        <button onClick={() => setShowModal(true)}>Add New Admin</button>
        {showModal && (
            <dialog open className="...">
                <AdminForm mode="create" onSubmit={handleSubmit} />
                <button onClick={() => setShowModal(false)}>Cancel</button>
            </dialog>
        )}
    </>
);
```

### Supabase Auth Admin API

Use Supabase Admin API for user management:

```typescript
import { createServerClient } from '@/lib/supabase/server';

const supabase = createServerClient();

// Create user
await supabase.auth.admin.createUser({ email, password, email_confirm: true });

// List users (if needed for debugging)
await supabase.auth.admin.listUsers();

// Delete user (if rollback needed)
await supabase.auth.admin.deleteUser(userId);
```

**Important**: Admin API requires service role key.

### Error Handling Strategy

**Email Already Exists**:

- Supabase Auth returns error if email exists
- Display user-friendly message: "An admin with this email already exists"
- Do NOT create `administrators` record

**Partial Failure (Auth succeeds, DB insert fails)**:

- Attempt to delete auth user: `await supabase.auth.admin.deleteUser(authUser.user.id)`
- If deletion fails, log error and return to admin with message
- Future: Consider background cleanup job

**Role Validation**:

- Only allow 'admin' or 'super_admin' roles
- Validate on client-side (Zod schema) and server-side (query function)

### Server Actions Pattern

Use Next.js Server Actions for admin user operations:

```typescript
// src/app/admin/settings/actions.ts
'use server';

import {
    createAdmin,
    updateAdmin,
    deactivateAdmin,
} from '@/lib/db/admin/administrators';
import { revalidatePath } from 'next/cache';

export async function createAdminAction(data: AdminInput) {
    const result = await createAdmin(data);

    if (result.data) {
        revalidatePath('/admin/settings');
    }

    return result;
}

export async function updateAdminAction(id: string, data: Partial<AdminInput>) {
    const result = await updateAdmin(id, data);

    if (result.data) {
        revalidatePath('/admin/settings');
    }

    return result;
}

export async function deactivateAdminAction(
    id: string,
    currentAdminId: string
) {
    // Prevent self-deactivation
    if (id === currentAdminId) {
        return {
            data: null,
            error: {
                code: 'self_deactivation',
                message: 'Cannot deactivate yourself',
            },
        };
    }

    const result = await deactivateAdmin(id);

    if (result.data) {
        revalidatePath('/admin/settings');
    }

    return result;
}
```

### Future Enhancements

Not in scope for this task but documented for future:

**Password Reset Flow**:

- Email password reset link to admin
- Admin clicks link and sets new password
- Supabase Auth handles token validation

**Admin Activity Logs**:

- Track who created/edited/deactivated admins
- Timestamp and action log in separate table

**Site Settings Management**:

- Shipping cost configuration
- Tax rate settings
- Social media links (Twitter, Instagram, etc.)
- Contact email address
- Site title and description
- Analytics tracking IDs

**Granular Permissions**:

- Beyond admin/super_admin roles
- Permissions like: can_manage_artwork, can_manage_orders, can_view_reports
- Implement with permissions table or JSON field

**Two-Factor Authentication** (2FA):

- Require 2FA for super_admin accounts
- Supabase Auth supports TOTP

### Accessibility

- Modal focus management (focus first field when opened, return focus on close)
- Form labels associated with inputs
- Required fields marked clearly
- Validation errors announced to screen readers
- Table headers with proper scope attributes
- Keyboard navigation for all controls (modal, form, buttons)
- Deactivate button has accessible name (includes admin name)
- Role dropdown has accessible options
