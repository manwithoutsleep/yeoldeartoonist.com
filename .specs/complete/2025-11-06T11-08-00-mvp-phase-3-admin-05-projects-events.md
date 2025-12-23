# 2025-11-06T11-08-00-mvp-phase-3-admin-05: Projects & Events Management

## Parent Specification

This is sub-task 05 of the parent specification: `2025-11-06T11-08-00-mvp-phase-3-admin.md`

## Objective

Build CRUD interfaces for managing projects (commissions, upcoming works) and events (shows, exhibitions, calendar items), following the same patterns established in Artwork Management.

## Dependencies

**Prerequisites** (must be completed before this task):

- Task 01: Dashboard & Navigation Infrastructure (provides admin layout and navigation)

**Blocks** (tasks that depend on this one):

- None - this completes the Phase 3 admin system

**Parallel Opportunities**:

- Task 02: Artwork Management (can run in parallel - similar pattern to learn from)
- Task 03: Image Upload System (can run in parallel - will be reused here)
- Task 04: Order Management (can run in parallel - different data model)

## Scope

### In Scope

**Admin Projects Queries** (`src/lib/db/admin/projects.ts`):

- `getAllProjectsAdmin(limit?, offset?)` - Returns ALL projects (not filtered by `is_published`)
- `getProjectById(id)` - Returns single project by UUID
- `createProject(data)` - Inserts new project with validation
- `updateProject(id, data)` - Updates existing project (partial update support)
- `deleteProject(id)` - Deletes project by UUID

**Admin Events Queries** (`src/lib/db/admin/events.ts`):

- `getAllEventsAdmin(limit?, offset?)` - Returns ALL events (not filtered by `is_published`)
- `getEventById(id)` - Returns single event by UUID
- `createEvent(data)` - Inserts new event with validation
- `updateEvent(id, data)` - Updates existing event (partial update support)
- `deleteEvent(id)` - Deletes event by UUID

**Validation Schemas**:

- `src/lib/validation/projects.ts` - Zod schema for project validation
- `src/lib/validation/events.ts` - Zod schema for event validation

**ProjectForm Component** (`src/components/admin/ProjectForm.tsx`):

- Client component with React Hook Form + Zod validation
- Fields: title, slug, description, status, start_date, end_date, image upload, is_published
- ImageUploader integration (reuse from Task 03)
- Props: `initialData?`, `onSubmit`, `isLoading?`

**EventForm Component** (`src/components/admin/EventForm.tsx`):

- Client component with React Hook Form + Zod validation
- Fields: title, slug, description, event_date, end_date, location, event_type, image upload, is_published
- ImageUploader integration (reuse from Task 03)
- Props: `initialData?`, `onSubmit`, `isLoading?`

**Projects Pages**:

- `src/app/admin/projects/page.tsx` - Projects list page
- `src/app/admin/projects/new/page.tsx` - Create project page
- `src/app/admin/projects/[id]/edit/page.tsx` - Edit project page

**Events Pages**:

- `src/app/admin/events/page.tsx` - Events list page
- `src/app/admin/events/new/page.tsx` - Create event page
- `src/app/admin/events/[id]/edit/page.tsx` - Edit event page

**Testing**:

- Unit tests for all admin queries (100% coverage)
- Validation schema tests (100% coverage)
- Component tests for forms (80-85% coverage)
- Page tests for list/create/edit pages (70%+ coverage)

### Out of Scope

- Calendar view for events (list view only for MVP)
- Project progress tracking (future enhancement)
- Event RSVP/ticketing (future enhancement)
- Recurring events (future enhancement)
- Project/event categories/tags (future enhancement)
- Bulk operations (future enhancement)

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

### Projects Schema Fields

**Required**:

- `title` (text, min 1 char)
- `slug` (text, min 1 char, pattern: `^[a-z0-9-]+$`)

**Optional**:

- `description` (textarea)
- `status` (text: "planning", "in-progress", "completed", "on-hold")
- `start_date` (date)
- `end_date` (date)
- `client_name` (text)
- `image_url` (URL - from ImageUploader)
- `image_thumbnail_url` (URL - from ImageUploader)
- `image_large_url` (URL - from ImageUploader)
- `is_published` (boolean, default false)
- `display_order` (number, integer, default 0)
- `seo_title` (text)
- `seo_description` (textarea)

### Events Schema Fields

**Required**:

- `title` (text, min 1 char)
- `slug` (text, min 1 char, pattern: `^[a-z0-9-]+$`)
- `event_date` (date, required)

**Optional**:

- `description` (textarea)
- `end_date` (date)
- `location` (text)
- `event_type` (text: "exhibition", "workshop", "show", "other")
- `image_url` (URL - from ImageUploader)
- `image_thumbnail_url` (URL - from ImageUploader)
- `image_large_url` (URL - from ImageUploader)
- `is_published` (boolean, default false)
- `display_order` (number, integer, default 0)
- `seo_title` (text)
- `seo_description` (textarea)

### Validation Schemas

**Projects** (`src/lib/validation/projects.ts`):

```typescript
export const projectSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    slug: z
        .string()
        .min(1, 'Slug is required')
        .regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
    description: z.string().optional(),
    status: z
        .enum(['planning', 'in-progress', 'completed', 'on-hold'])
        .optional(),
    start_date: z.string().optional(), // ISO date string
    end_date: z.string().optional(),
    client_name: z.string().optional(),
    image_url: z.string().url().optional(),
    image_thumbnail_url: z.string().url().optional(),
    image_large_url: z.string().url().optional(),
    is_published: z.boolean().default(false),
    display_order: z.number().int().default(0),
    seo_title: z.string().optional(),
    seo_description: z.string().optional(),
});
```

**Events** (`src/lib/validation/events.ts`):

```typescript
export const eventSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    slug: z
        .string()
        .min(1, 'Slug is required')
        .regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
    event_date: z.string().min(1, 'Event date is required'), // ISO date string
    description: z.string().optional(),
    end_date: z.string().optional(),
    location: z.string().optional(),
    event_type: z.enum(['exhibition', 'workshop', 'show', 'other']).optional(),
    image_url: z.string().url().optional(),
    image_thumbnail_url: z.string().url().optional(),
    image_large_url: z.string().url().optional(),
    is_published: z.boolean().default(false),
    display_order: z.number().int().default(0),
    seo_title: z.string().optional(),
    seo_description: z.string().optional(),
});
```

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
- Custom error interfaces: `ProjectAdminError`, `EventAdminError`
- Include runtime check: `if (typeof window !== 'undefined') throw new Error(...)`

## Files to Create/Modify

**Create - Projects**:

- `src/lib/db/admin/projects.ts` - Admin project query functions
- `src/lib/validation/projects.ts` - Project validation schema
- `src/components/admin/ProjectForm.tsx` - Project form component
- `src/app/admin/projects/page.tsx` - Projects list page
- `src/app/admin/projects/new/page.tsx` - Create project page
- `src/app/admin/projects/[id]/edit/page.tsx` - Edit project page
- `src/app/admin/projects/actions.ts` - Server Actions for projects
- `__tests__/lib/db/admin/projects.test.ts` - Project query tests
- `__tests__/lib/validation/projects.test.ts` - Project validation tests
- `__tests__/components/admin/ProjectForm.test.tsx` - ProjectForm tests
- `__tests__/app/admin/projects/page.test.tsx` - Projects list page tests
- `__tests__/app/admin/projects/new/page.test.tsx` - Create project page tests
- `__tests__/app/admin/projects/[id]/edit/page.test.tsx` - Edit project page tests

**Create - Events**:

- `src/lib/db/admin/events.ts` - Admin event query functions
- `src/lib/validation/events.ts` - Event validation schema
- `src/components/admin/EventForm.tsx` - Event form component
- `src/app/admin/events/page.tsx` - Events list page
- `src/app/admin/events/new/page.tsx` - Create event page
- `src/app/admin/events/[id]/edit/page.tsx` - Edit event page
- `src/app/admin/events/actions.ts` - Server Actions for events
- `__tests__/lib/db/admin/events.test.ts` - Event query tests
- `__tests__/lib/validation/events.test.ts` - Event validation tests
- `__tests__/components/admin/EventForm.test.tsx` - EventForm tests
- `__tests__/app/admin/events/page.test.tsx` - Events list page tests
- `__tests__/app/admin/events/new/page.test.tsx` - Create event page tests
- `__tests__/app/admin/events/[id]/edit/page.test.tsx` - Edit event page tests

## Testing Requirements

### Coverage Targets

- Admin query functions: 100% coverage
- Validation schemas: 100% coverage
- Form components: 80-85% coverage
- Pages: 70%+ coverage

### Test Scenarios

**Projects Queries**:

- `getAllProjectsAdmin()` returns all projects (published + unpublished)
- `getProjectById()` returns single project by UUID
- `createProject()` inserts new project with valid data
- `updateProject()` updates existing project (partial update)
- `deleteProject()` deletes project by UUID
- Error handling for all operations
- Uses server client (service role)
- Returns `{ data, error }` format

**Events Queries**:

- `getAllEventsAdmin()` returns all events (published + unpublished)
- `getEventById()` returns single event by UUID
- `createEvent()` inserts new event with valid data
- `updateEvent()` updates existing event (partial update)
- `deleteEvent()` deletes event by UUID
- Error handling for all operations
- Uses server client (service role)
- Returns `{ data, error }` format

**Validation Schemas**:

- Title is required
- Slug is required and matches pattern
- Event date is required for events
- All optional fields accept valid values
- Invalid data returns validation errors

**Form Components**:

- Renders all form fields correctly
- Shows validation errors inline
- Submit button disabled when invalid
- Calls `onSubmit` with valid form data
- Pre-fills form in edit mode
- ImageUploader integration works
- Cancel button exists and functions

**List Pages**:

- Renders page title and "Add New" button
- Displays items in table/grid
- Shows thumbnail, title, status for each item
- Edit and Delete buttons work
- Delete confirmation appears
- Empty state when no items
- Handles loading and error states

**Create Pages**:

- Renders form component
- Form submission creates item
- Redirects to list on success
- Shows error message on failure
- Back link to list exists

**Edit Pages**:

- Fetches item by ID and pre-fills form
- Form submission updates item
- Redirects to list on success
- Shows 404 if item not found
- Back link to list exists

### Manual Testing Checklist

**Projects**:

- [ ] Navigate to `/admin/projects` - list page loads
- [ ] Click "Add New Project" - create page loads
- [ ] Fill out form with valid data - submit succeeds
- [ ] Verify validation errors for required fields
- [ ] Upload project image - ImageUploader works
- [ ] Create project - redirects to list, new project appears
- [ ] Edit project - form pre-fills correctly
- [ ] Update project - changes save successfully
- [ ] Delete project - confirmation appears and deletion works

**Events**:

- [ ] Navigate to `/admin/events` - list page loads
- [ ] Click "Add New Event" - create page loads
- [ ] Fill out form with valid data - submit succeeds
- [ ] Verify validation errors for required fields (title, slug, event_date)
- [ ] Upload event image - ImageUploader works
- [ ] Create event - redirects to list, new event appears
- [ ] Edit event - form pre-fills correctly
- [ ] Update event - changes save successfully
- [ ] Delete event - confirmation appears and deletion works

## Success Criteria

- [ ] All projects query tests pass (100% coverage)
- [ ] All events query tests pass (100% coverage)
- [ ] All validation schema tests pass (100% coverage)
- [ ] All form component tests pass (80-85% coverage)
- [ ] All page tests pass (70%+ coverage)
- [ ] TypeScript compiles without errors
- [ ] ESLint passes with no warnings
- [ ] Prettier formatting applied
- [ ] Can create, edit, delete projects
- [ ] Can create, edit, delete events
- [ ] Form validation works correctly
- [ ] ImageUploader integration works for both
- [ ] Navigation between pages works
- [ ] Manual testing checklist complete
- [ ] The verify-code skill has been successfully executed

## Notes

### Code Reuse from Artwork Management

This task heavily reuses patterns from Task 02 (Artwork Management):

- Query function structure is identical
- Form component patterns are identical
- Page structure (list/create/edit) is identical
- Validation approach is identical

**Strategy**: Copy and modify artwork files, adjusting for projects/events schemas.

### ImageUploader Integration

ImageUploader component (from Task 03) is reused for both projects and events:

- Same props and behavior
- Returns same URL structure (thumbnail, preview, large)
- Database fields match: `image_url`, `image_thumbnail_url`, `image_large_url`

If Task 03 is not yet complete, use placeholder image input (same as Task 02 approach).

### Date Field Handling

Projects have optional `start_date` and `end_date`.
Events have required `event_date` and optional `end_date`.

Use HTML5 date input:

```tsx
<input type="date" {...register('event_date')} />
```

React Hook Form handles date inputs as strings (ISO format: "YYYY-MM-DD").

### Status and Type Dropdowns

**Project Status Dropdown**:

```tsx
<select {...register('status')}>
    <option value="">Select status...</option>
    <option value="planning">Planning</option>
    <option value="in-progress">In Progress</option>
    <option value="completed">Completed</option>
    <option value="on-hold">On Hold</option>
</select>
```

**Event Type Dropdown**:

```tsx
<select {...register('event_type')}>
    <option value="">Select type...</option>
    <option value="exhibition">Exhibition</option>
    <option value="workshop">Workshop</option>
    <option value="show">Show</option>
    <option value="other">Other</option>
</select>
```

### Server Actions Pattern

Same pattern as artwork:

```typescript
// src/app/admin/projects/actions.ts
'use server';

import { createProject } from '@/lib/db/admin/projects';
import { revalidatePath } from 'next/cache';

export async function createProjectAction(data: ProjectInput) {
    const result = await createProject(data);

    if (result.data) {
        revalidatePath('/in-the-works');
    }

    return result;
}
```

### Cache Revalidation

When projects/events are created, updated, or deleted, revalidate:

- Projects: `/in-the-works` (public page showing projects)
- Events: `/events` or calendar page (if exists)

### List Page Display

**Projects Table Columns**:

- Thumbnail, Title, Status, Start Date, Published Status, Actions

**Events Table Columns**:

- Thumbnail, Title, Event Date, Location, Published Status, Actions

Both use same status badge pattern as artwork (Published/Draft).

### Error Handling

Same strategy as artwork management:

- Query errors: Return `{ data: null, error: { code, message, details? } }`
- Validation errors: React Hook Form displays inline
- Submission errors: Show toast/alert above form
- 404 errors: Display "Not found" message with link to list

### Future Enhancements

Not in scope for this task but documented for future:

- Calendar view for events (month/week/day views)
- Project progress tracking (percentage complete, milestones)
- Event RSVP/ticketing system
- Recurring events support
- Project/event categories and tags
- Gallery integration (link projects to specific artworks)
- Event location map integration
- Export events to ICS format (calendar file)

### Accessibility

- Form labels associated with inputs
- Required fields marked clearly
- Validation errors announced to screen readers
- Date inputs have accessible labels and format hints
- Dropdown options have meaningful text
- Keyboard navigation support
- Focus management on validation errors
- Sufficient color contrast for status badges
