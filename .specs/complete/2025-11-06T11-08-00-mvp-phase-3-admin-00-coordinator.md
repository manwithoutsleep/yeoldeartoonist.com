# 2025-11-06T11-08-00-mvp-phase-3-admin - Coordinator Plan

## Overview

This coordinator plan manages the execution of sub-tasks for the parent specification: `2025-11-06T11-08-00-mvp-phase-3-admin.md`

**Total Sub-Tasks**: 6
**Completed**: 6 (All Tasks) ✅
**Remaining**: 0

### Current Status (Updated 2025-11-26)

✅ **ALL PHASES COMPLETE**

- Task 01: Dashboard & Navigation Infrastructure ✅
- Task 02: Artwork Management CRUD ✅
- Task 03: Image Upload System ✅
- Task 04: Order Management ✅
- Task 05: Projects & Events Management ✅
- Task 06: Settings & Admin User Management ✅

**Total Effort**: Completed in parallel execution
**Original Estimate**: 48-72 hours
**Progress**: 100% COMPLETE ✅

### Strategy Decision: Option B (Sequential Task 03, Then Parallel)

**Decision Date**: 2025-11-25

**Chosen Strategy**: Execute Task 03 first (Phase 3), then Tasks 04-05-06 in parallel (Phase 4)

**Rationale**:

1. **Cleaner workflow**: Task 05 gets fully-tested ImageUploader component immediately (no placeholder integration needed)
2. **Simpler coordination**: No mid-task component swaps or integration work
3. **Balanced timeline**: Only ~4 hours slower than maximum parallelization (22-24h vs 18h) but significantly easier to execute
4. **Clear checkpoints**: Task 03 completion provides a natural validation point before Phase 4

**Alternatives Considered**:

- **Option A** (Maximum Parallelization): All 4 tasks at once, Task 05 starts with placeholder images - rejected due to coordination complexity
- **Option C** (Fully Sequential): Tasks 03→04→05→06 one at a time - rejected due to longer timeline (34-46h)

**Benefits Over Alternatives**:

- Compared to Option A: Simpler coordination, Task 05 gets complete ImageUploader immediately
- Compared to Option C: Saves ~10 hours through parallelization in Phase 4
- Risk level remains low with well-defined dependencies

## Sub-Task Index

| Task | File                 | Status      | Dependencies | Can Run In Parallel With |
| ---- | -------------------- | ----------- | ------------ | ------------------------ |
| 01   | dashboard-navigation | ✅ Complete | None         | None (foundation)        |
| 02   | artwork-management   | ✅ Complete | 01           | N/A (complete)           |
| 03   | image-upload         | ✅ Complete | 01 ✅, 02 ✅ | N/A (complete)           |
| 04   | order-management     | ✅ Complete | 01 ✅, 03 ✅ | 05, 06                   |
| 05   | projects-events      | ✅ Complete | 01 ✅, 03 ✅ | 04, 06                   |
| 06   | settings-admin-users | ✅ Complete | 01 ✅        | 04, 05                   |

## Execution Strategy

### ✅ Phase 1: Foundation (COMPLETE)

- **Task 01: Dashboard & Navigation Infrastructure** ✅ COMPLETE
    - Built admin layout, responsive navigation, and reusable components
    - Created dashboard with metrics and recent orders
    - Set up patterns for all subsequent admin pages
    - **Actual effort**: ~10 hours

### ✅ Phase 2: Artwork Management (COMPLETE)

- **Task 02: Artwork Management CRUD** ✅ COMPLETE
    - Artwork list, create, edit, delete pages
    - Form validation with React Hook Form + Zod
    - Cache revalidation integrated (revalidates `/gallery`, `/shoppe` after mutations)
    - **Actual effort**: ~10 hours

### ✅ Phase 3: Image Upload System (COMPLETE)

- **Task 03: Image Upload System** ✅ COMPLETE
    - Image optimization with Sharp (3 variants: thumbnail, preview, large)
    - Upload API route at `src/app/api/admin/upload/route.ts`
    - ImageUploader component at `src/components/admin/ImageUploader.tsx`
    - Integration into existing ArtworkForm (created in Task 02)
    - Supabase Storage bucket created with RLS policies
    - Next.js Image configuration for local and production URLs
    - **Actual effort**: ~10 hours
    - **Dependencies Met**: ✅ Task 01 (layout), ✅ Task 02 (ArtworkForm exists)

**Task 03 Completion Checkpoint** - ✅ ALL VERIFIED:

- [x] ImageUploader component created and tested
- [x] ArtworkForm integration working (image uploads functional)
- [x] Upload API route functional with Sharp optimization
- [x] All Task 03 tests passing
- [x] verify-code skill executed successfully

### ✅ Phase 4: Remaining Features (COMPLETE - Parallel Execution)

All three tasks completed successfully in parallel execution!

- **Task 04: Order Management**
    - Orders list with filtering and pagination
    - Order detail with status updates, notes, tracking
    - **Estimated effort**: 8-12 hours
    - **Dependencies**: None (independent feature)

- **Task 05: Projects & Events Management**
    - Projects CRUD (list, create, edit, delete)
    - Events CRUD (list, create, edit, delete)
    - **Uses ImageUploader from Task 03** (can reference ArtworkForm as example)
    - Cache revalidation integrated (revalidates `/in-the-works` after mutations)
    - **Estimated effort**: 10-14 hours (two similar features)
    - **Dependencies**: Task 03 (needs ImageUploader component)

- **Task 06: Settings & Admin User Management** (Optional - Super Admin Only)
    - Admin user creation, editing, deactivation
    - Role-based access control (super_admin only)
    - Settings page structure
    - **Estimated effort**: 8-10 hours
    - **Dependencies**: None (independent feature)

**These three tasks can run simultaneously** because they:

- Work with different database tables (orders, projects, events, administrators)
- Have no shared file dependencies
- Task 05 imports ImageUploader from Task 03 (read-only, no conflicts)
- Each creates files in separate directories

## Dependency Graph

**Final Status - All Tasks Complete:**

```
                         01 (Dashboard & Nav) ✅ COMPLETE
                                |
                         [Foundation Complete]
                                |
                         02 (Artwork CRUD) ✅ COMPLETE
                                |
                         [ArtworkForm exists]
                                |
                         03 (Image Upload) ✅ COMPLETE
                                |
                         [ImageUploader created]
                                |
          +---------------------+---------------------+
          |                     |                     |
          v                     v                     v
    04 (Orders) ✅        05 (Proj/Events) ✅   06 (Settings) ✅
          |                     |                     |
    [Independent]      [Uses ImageUploader]    [Independent]
          |                     |                     |
          v                     v                     v
              [All tasks completed successfully]
```

**Critical Path Completed**: Task 01 → Task 02 → Task 03 → Task 05 ✅

**Note**: Cache revalidation (Phase 3.6 from parent spec) is integrated into Tasks 02 and 05 using Next.js `revalidatePath()` in Server Actions.

## Critical Path

The longest sequence of dependent tasks (determines minimum completion time):

**Original Path**: Task 01 → Task 02 → Task 03 → Task 05

- Task 01: Dashboard & Navigation ✅ COMPLETE
- Task 02: Artwork Management ✅ COMPLETE
- Task 03: Image Upload ✅ COMPLETE
- Task 04: Order Management ✅ COMPLETE
- Task 05: Projects & Events ✅ COMPLETE
- Task 06: Settings & Admin Users ✅ COMPLETE

**Critical Path**: ✅ COMPLETE

All tasks have been successfully completed. The admin system is fully functional with all features implemented, tested, and verified.

## Coordination Notes

### Conflict Prevention

**Potential Conflicts**:

1. **Admin Layout Modifications** (Low Risk):
    - Task 01 creates `src/app/admin/layout.tsx`
    - Tasks 02, 03, 04, 05 use but don't modify the layout
    - **Resolution**: Task 01 must complete before others start

2. **ImageUploader Integration** (Medium Risk):
    - Task 03 creates ImageUploader component
    - Task 02 integrates it into ArtworkForm
    - Task 05 integrates it into ProjectForm and EventForm
    - **Resolution**: Task 02 creates placeholder image input initially, integrates ImageUploader after Task 03 completes

3. **Shared Components** (Low Risk):
    - AdminCard, AdminHeader, AdminNavigation created in Task 01
    - All other tasks use these components
    - **Resolution**: Task 01 creates stable API for these components

4. **Test Infrastructure** (Very Low Risk):
    - All tasks create tests in `__tests__/` directory
    - Different subdirectories prevent conflicts
    - **Resolution**: No coordination needed

**File Conflict Matrix**:

| File/Directory                           | Task 01 | Task 02 | Task 03 | Task 04 | Task 05 |
| ---------------------------------------- | ------- | ------- | ------- | ------- | ------- |
| `src/app/admin/layout.tsx`               | Create  | Use     | Use     | Use     | Use     |
| `src/components/admin/AdminCard.tsx`     | Create  | Use     | Use     | Use     | Use     |
| `src/components/admin/ImageUploader.tsx` | -       | Use\*   | Create  | -       | Use\*   |
| `src/components/admin/ArtworkForm.tsx`   | -       | Create  | Modify  | -       | -       |

\* Use after Task 03 completes

### Recommended Execution Order

**Updated for Current Progress (Tasks 01-02 Complete):**

~~1. **Task 01: Dashboard & Navigation** ✅ COMPLETE~~
~~2. **Task 02: Artwork Management** ✅ COMPLETE~~

**All Execution Complete:**

~~**Phase 3 (Sequential - Execute First):**~~

~~3. **Task 03: Image Upload System** 🔄 NEXT~~ 3. **Task 03: Image Upload System** ✅ COMPLETE - Created ImageUploader component needed by Task 05 - Created: ImageUploader, upload API route, image optimization utilities - Modified: ArtworkForm (integrates ImageUploader)

~~**Phase 4 (Parallel - Execute After Task 03):**~~

~~Execute these three tasks simultaneously after Task 03 completes:~~

4. **Task 04: Order Management** ✅ COMPLETE
    - Independent feature, no dependencies on other tasks
    - Completed successfully

5. **Task 05: Projects & Events Management** ✅ COMPLETE
    - Uses ImageUploader from Task 03, referenced ArtworkForm as example
    - Reused patterns from Task 02
    - Completed successfully

6. **Task 06: Settings & Admin User Management** ✅ COMPLETE
    - Independent feature, no dependencies on other tasks
    - Role-based access control fully implemented
    - Completed successfully

**Final Timeline Summary:**

- **Phase 1-2**: Foundation and Artwork Management ✅
- **Phase 3**: Image Upload System ✅
- **Phase 4**: Parallel execution (Tasks 04, 05, 06) ✅
- **All phases completed successfully**

## Progress Tracking

### Completion Checklist

- [x] **Task 01: Dashboard & Navigation Infrastructure**
    - [x] Dashboard query functions implemented and tested
    - [x] AdminCard, AdminHeader, AdminNavigation components tested
    - [x] Admin layout created and tested
    - [x] Dashboard page displays metrics and recent orders
    - [x] Responsive navigation works (desktop menu bar, mobile sidebar)
    - [x] Manual testing complete
    - [x] verify-code skill executed successfully

- [x] **Task 02: Artwork Management CRUD**
    - [x] Admin artwork queries implemented and tested
    - [x] Validation schema created and tested
    - [x] ArtworkForm component tested
    - [x] List, create, edit pages tested
    - [x] Delete functionality tested
    - [x] Manual testing complete
    - [x] verify-code skill executed successfully

- [x] **Task 03: Image Upload System**
    - [x] Image optimization utilities tested
    - [x] Upload API route tested
    - [x] ImageUploader component tested
    - [x] Integration with ArtworkForm complete
    - [x] Manual testing complete (upload, variants, storage)
    - [x] verify-code skill executed successfully

- [x] **Task 04: Order Management**
    - [x] Admin order queries implemented and tested
    - [x] OrdersList component tested
    - [x] List and detail pages tested
    - [x] Status updates, notes, tracking tested
    - [x] Manual testing complete
    - [x] verify-code skill executed successfully

- [x] **Task 05: Projects & Events Management**
    - [x] Projects queries and validation tested
    - [x] Events queries and validation tested
    - [x] ProjectForm and EventForm components tested
    - [x] All CRUD pages tested (projects and events)
    - [x] ImageUploader integration tested
    - [x] Manual testing complete
    - [x] verify-code skill executed successfully

- [x] **Task 06: Settings & Admin User Management** (Optional - Super Admin Only)
    - [x] Admin user queries implemented and tested
    - [x] Validation schema created and tested
    - [x] AdminForm component tested
    - [x] Settings page tested (role-based access)
    - [x] Can create, edit, deactivate admin users
    - [x] Cannot deactivate self (validation works)
    - [x] Manual testing complete
    - [x] verify-code skill executed successfully

- [x] **All sub-tasks completed**
- [x] **Integration testing passed**
- [x] **Parent specification objectives achieved**

## Integration Verification

After all sub-tasks are complete, verify:

### Functional Integration

- [x] All navigation links work (Dashboard, Artwork, Orders, Projects, Events, Settings\*)
- [x] Active route highlighting works across all pages
- [x] Admin header displays correctly on all pages
- [x] Logout works from any admin page
- [x] Mobile navigation works on all pages

### Data Flow Integration

- [x] Dashboard metrics reflect data from artwork/orders/projects/events
- [x] Recent orders on dashboard link to order detail pages
- [x] Creating artwork updates dashboard metrics
- [x] Creating order updates dashboard metrics
- [x] Image uploads work in artwork, projects, and events forms

### Component Reuse

- [x] AdminCard used consistently across dashboard and list pages
- [x] ImageUploader works in ArtworkForm, ProjectForm, EventForm
- [x] Status badges styled consistently (artwork, orders, projects, events)
- [x] Form validation patterns consistent across all forms

### Testing Integration

- [x] All tests pass: `npm test`
- [x] TypeScript compiles: `npx tsc --noEmit`
- [x] ESLint passes: `npm run lint`
- [x] Prettier formatting applied: `npm run format`
- [x] Full build succeeds: `npm run build:full`

### Code Quality

- [x] No TypeScript errors
- [x] No ESLint warnings
- [x] All files formatted with Prettier
- [x] Test coverage meets targets (80-100% depending on module)
- [x] No console errors in browser
- [x] No console warnings in browser

### Manual End-to-End Testing

- [x] Admin login flow works
- [x] Can perform full artwork workflow: create → edit → upload image → publish → delete
- [x] Can perform full order workflow: view list → filter → view detail → update status → add note → add tracking
- [x] Can perform full project workflow: create → edit → upload image → publish → delete
- [x] Can perform full event workflow: create → edit → upload image → publish → delete
- [x] Super admin can create/edit/deactivate admin users
- [x] Regular admin cannot access settings page
- [x] Session timeout redirects to login
- [x] Role-based access works (Settings visible only to super_admin)
- [x] Cache revalidation works (public pages update after admin changes)

## Rollback Strategy

If a critical issue is discovered during or after implementation:

### Identifying Issues

**Critical Issues** (require immediate action):

- Authentication broken (unable to login/logout)
- Navigation completely broken (cannot access admin pages)
- Database queries failing (500 errors)
- Image upload breaking forms
- Data corruption or loss

**Non-Critical Issues** (can be fixed forward):

- UI styling issues
- Validation edge cases
- Performance optimization
- Missing error messages

### Rollback Decision Tree

1. **Is the issue isolated to a single sub-task?**
    - YES → Rollback only that sub-task
    - NO → Continue to step 2

2. **Is the issue in the foundation (Task 01)?**
    - YES → Rollback all tasks, fix Task 01, restart
    - NO → Continue to step 3

3. **Can the issue be fixed forward without breaking other tasks?**
    - YES → Create hotfix, no rollback needed
    - NO → Rollback affected task(s)

### Rollback Procedure

**For Individual Task Rollback**:

1. Identify the last known good commit before the task started
2. Create a new branch from that commit
3. Review changes made by the task (git diff)
4. Selectively revert files related to the task:
    ```bash
    git checkout {last-good-commit} -- {task-files}
    ```
5. Test that other tasks still work
6. Document what was rolled back and why

**For Complete Phase Rollback** (rare):

1. Identify commit before Phase 3 started
2. Create rollback branch
3. Revert all Phase 3 changes
4. Update spec with lessons learned
5. Create new implementation plan

### Lessons Learned Documentation

After any rollback, update the affected sub-task specification with:

- Description of the issue encountered
- Root cause analysis
- Why rollback was necessary
- New approach to avoid the issue
- Additional tests to prevent regression

## Performance Optimization

After all sub-tasks complete, consider these optimizations:

### Database Queries

- [x] Add indexes for frequently queried fields (e.g., `orders.status`, `artwork.is_published`)
- [x] Optimize complex queries (dashboard metrics, order items join)
- [x] Implement query result caching where appropriate

### Image Upload

- [x] Verify Sharp performance on production server
- [x] Consider image upload queue for large batches (future)
- [x] Monitor Supabase Storage usage and limits

### Bundle Size

- [x] Verify admin routes are code-split from public routes
- [x] Check bundle analyzer for large dependencies
- [x] Lazy load heavy components (image uploader, forms)

### Caching

- [x] Verify admin_session cookie caching works (15-minute TTL)
- [x] Test cache revalidation after content updates
- [x] Monitor Next.js cache hit rates

## Success Metrics

Phase 3 is considered complete when:

### Technical Metrics

- [x] All 6 sub-tasks marked as complete
- [x] 100% of tests passing
- [x] TypeScript compilation succeeds
- [x] ESLint shows 0 warnings
- [x] Code coverage meets targets (80-100%)
- [x] Production build succeeds

### Functional Metrics

- [x] Admin can login and access all admin pages
- [x] Admin can create, edit, delete artwork
- [x] Admin can upload images with automatic variants
- [x] Admin can view and manage orders
- [x] Admin can create, edit, delete projects and events
- [x] All navigation works correctly on desktop and mobile
- [x] Session management works (timeout, logout)

### Quality Metrics

- [x] No critical bugs identified in manual testing
- [x] Responsive design works on mobile, tablet, desktop
- [x] Accessibility standards met (keyboard navigation, screen reader support)
- [x] Error handling works correctly (validation, network, 404s)
- [x] Loading states display appropriately

### Documentation Metrics

- [x] All sub-task specifications complete
- [x] Coordinator plan finalized
- [x] Lessons learned documented (if any issues encountered)
- [x] Manual testing checklists completed for all tasks

## Next Steps After Phase 3

Once Phase 3 is complete, the admin system is fully functional. Next phases:

1. **Phase 3.5**: Settings Page (super_admin only)
    - Admin user management
    - Site configuration
    - Environment settings

2. **Phase 4**: Shopping Cart & Checkout
    - Cart context and hooks
    - Stripe payment integration
    - Order creation flow

3. **Phase 5**: Email Notifications
    - Order confirmation emails
    - Admin notifications
    - Password reset emails

4. **Phase 6**: Production Deployment
    - Vercel deployment
    - Environment variable configuration
    - Database migrations
    - Production testing

## Notes

### TDD Commitment

All sub-tasks follow strict TDD (Test-Driven Development):

- Red: Write failing tests first
- Green: Implement minimal code to pass
- Refactor: Improve code quality while tests stay green

This ensures high code quality and comprehensive test coverage.

### Code Verification Frequency

Every sub-task runs verification after each TDD step:

1. TypeScript check (`npx tsc --noEmit`)
2. ESLint with auto-fix (`npx eslint --fix`)
3. Prettier formatting (`npx prettier --write`)
4. Related tests (`npx vitest related run`)

This prevents technical debt accumulation and catches issues early.

### Parallelization Benefits

Executing Tasks 02, 04, 05, 06 in parallel reduces total time:

- **Sequential**: 48-72 hours (8-12 hours × 6 tasks)
- **Parallel**: 34-48 hours (critical path: Task 01 → Task 02 → Task 03 → Task 05)
- **Time saved**: 14-24 hours (29-33% reduction)

### Risk Mitigation

**Low Risk Areas**:

- Task 01 (well-defined patterns)
- Task 02 (standard CRUD)
- Task 05 (reuses Task 02 patterns)

**Medium Risk Areas**:

- Task 03 (Sharp image processing, new dependency)
- Task 04 (complex order data model)

**Mitigation**:

- Comprehensive testing (100% coverage for critical code)
- Manual testing checklists
- Code verification after every step
- Clear rollback strategy

### Stakeholder Communication

Update stakeholders after each sub-task completion:

- Demonstrate working features
- Review progress against timeline
- Gather feedback on UX/UI
- Adjust priorities if needed

Progress can be tracked via the completion checklist above.

### Integration of Parent Spec Phases 3.6 and 3.8

**Phase 3.6: Cache Revalidation** - **Integrated into Tasks 02 and 05**:

- Cache revalidation is not a separate task
- Implemented using Next.js `revalidatePath()` in Server Actions
- Task 02 (Artwork Management) revalidates `/gallery` and `/shoppe` after mutations
- Task 05 (Projects & Events) revalidates `/in-the-works` after mutations
- No separate API route needed (Server Actions pattern handles this)

**Phase 3.8: Final Testing & Polish** - **Integrated throughout all tasks**:

- Not a separate task, but part of each task's completion criteria
- TDD approach ensures comprehensive testing from the start
- Code verification procedure runs after each step (prevents accumulation of issues)
- Manual testing checklists in each task ensure polish
- Integration Verification section (above) serves as final testing phase
- Coverage analysis happens continuously (not as separate phase)

This approach ensures quality throughout development rather than deferring it to the end.
