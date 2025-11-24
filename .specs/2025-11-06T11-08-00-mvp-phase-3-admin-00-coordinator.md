# 2025-11-06T11-08-00-mvp-phase-3-admin - Coordinator Plan

## Overview

This coordinator plan manages the execution of sub-tasks for the parent specification: `2025-11-06T11-08-00-mvp-phase-3-admin.md`

**Total Sub-Tasks**: 6
**Estimated Total Effort**: 48-72 hours (8-12 hours per task)
**Parallelization Potential**: High (Tasks 02-06 can run in parallel after Task 01)

## Sub-Task Index

| Task | File                 | Status  | Dependencies | Can Run In Parallel With |
| ---- | -------------------- | ------- | ------------ | ------------------------ |
| 01   | dashboard-navigation | Pending | None         | None (foundation)        |
| 02   | artwork-management   | Pending | 01           | 03, 04, 05, 06           |
| 03   | image-upload         | Pending | 01, 02       | 04, 05, 06               |
| 04   | order-management     | Pending | 01           | 02, 03, 05, 06           |
| 05   | projects-events      | Pending | 01           | 02, 03, 04, 06           |
| 06   | settings-admin-users | Pending | 01           | 02, 03, 04, 05           |

## Execution Strategy

### Phase 1: Foundation (Sequential - Must Complete First)

Execute this task first - it provides the foundation for all admin features:

- **Task 01: Dashboard & Navigation Infrastructure**
    - Builds admin layout, responsive navigation, and reusable components
    - Creates dashboard with metrics and recent orders
    - Sets up patterns for all subsequent admin pages
    - **Estimated effort**: 8-12 hours
    - **Why first**: All other tasks depend on navigation structure and admin components

**Wait for Phase 1 completion before proceeding to Phase 2**

### Phase 2: Parallel Content Management (Can Execute Simultaneously)

After Task 01 completes, execute these tasks in parallel for maximum efficiency:

- **Task 02: Artwork Management CRUD**
    - Artwork list, create, edit, delete pages
    - Form validation with React Hook Form + Zod
    - Cache revalidation integrated (revalidates `/gallery`, `/shoppe` after mutations)
    - **Estimated effort**: 8-12 hours

- **Task 04: Order Management**
    - Orders list with filtering and pagination
    - Order detail with status updates, notes, tracking
    - **Estimated effort**: 8-12 hours

- **Task 05: Projects & Events Management**
    - Projects CRUD (list, create, edit, delete)
    - Events CRUD (list, create, edit, delete)
    - Cache revalidation integrated (revalidates `/in-the-works` after mutations)
    - **Estimated effort**: 10-14 hours (two similar features)

- **Task 06: Settings & Admin User Management** (Optional - Super Admin Only)
    - Admin user creation, editing, deactivation
    - Role-based access control (super_admin only)
    - Settings page structure
    - **Estimated effort**: 8-10 hours

**These four tasks can run simultaneously** because they:

- Work with different database tables (artwork, orders, projects, events, administrators)
- Have no shared file dependencies
- Use the same patterns from Task 01

**Coordination Note**: If implementing sequentially, do Task 02 before Task 05 (Projects & Events can reuse artwork patterns).

### Phase 3: Image Upload Integration (Can Overlap with Phase 2)

- **Task 03: Image Upload System**
    - Image optimization with Sharp (3 variants)
    - Upload API with Supabase Storage
    - ImageUploader component
    - Integration into ArtworkForm
    - **Estimated effort**: 8-10 hours
    - **Dependencies**: Needs Task 01 (layout) and Task 02 (ArtworkForm to integrate with)
    - **Can overlap**: Start after Task 02's form structure is complete (before all CRUD pages done)

**Parallelization Strategy**:

- Start Task 03 after Task 02's ArtworkForm component is built
- Task 03 can complete while Task 02's create/edit/delete pages are still in progress
- Task 05 can reuse ImageUploader once Task 03 is complete

## Dependency Graph

```
                         01 (Dashboard & Nav)
                                |
                         [Foundation Complete]
                                |
          +---------------------+---------------------+
          |                     |                     |
          v                     v                     v
    02 (Artwork)          04 (Orders)          06 (Settings)
          |                     |
          | (ArtworkForm)       |
          v                     |
    03 (Image Upload)           |
          |                     |
          | (ImageUploader)     |
          v                     |
    [Integrate into 02]         |
          |                     |
          v                     |
    05 (Proj/Events) <----------+
          |
          | (Reuse ImageUploader)
          v
    [Integrate into 05]
```

**Note**: Cache revalidation (Phase 3.6 from parent spec) is integrated into Tasks 02 and 05 using Next.js `revalidatePath()` in Server Actions.

## Critical Path

The longest sequence of dependent tasks (determines minimum completion time):

**Path**: Task 01 → Task 02 → Task 03 → Integration with Task 05

- Task 01: Dashboard & Navigation (8-12 hours)
- Task 02: Artwork Management (8-12 hours)
- Task 03: Image Upload (8-10 hours)
- Task 05: Projects & Events (10-14 hours) - includes ImageUploader integration
- **Total critical path**: 34-48 hours

**Note**: Tasks 04 and 06 are off the critical path and can be completed in parallel with Tasks 02-03-05.

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

**If executing sequentially** (not in parallel), use this order for optimal flow:

1. **Task 01: Dashboard & Navigation** - Foundation must be first
    - Reason: All other tasks depend on admin layout and components

2. **Task 02: Artwork Management** - Second priority
    - Reason: Establishes CRUD patterns that Task 05 can replicate

3. **Task 03: Image Upload** - Third priority
    - Reason: Completes artwork management, can be reused in Task 05

4. **Task 04: Order Management** - Fourth priority
    - Reason: Independent feature, can be done anytime after Task 01

5. **Task 05: Projects & Events** - Final task
    - Reason: Reuses patterns from Tasks 02 and 03, benefits from having examples

**If executing in parallel** (recommended):

**Round 1**: Task 01 only
**Round 2**: Start Tasks 02, 04, 05 simultaneously
**Round 3**: Start Task 03 once Task 02's ArtworkForm is complete
**Round 4**: Integrate ImageUploader into Task 02 and Task 05

## Progress Tracking

### Completion Checklist

- [ ] **Task 01: Dashboard & Navigation Infrastructure**
    - [ ] Dashboard query functions implemented and tested
    - [ ] AdminCard, AdminHeader, AdminNavigation components tested
    - [ ] Admin layout created and tested
    - [ ] Dashboard page displays metrics and recent orders
    - [ ] Responsive navigation works (desktop menu bar, mobile sidebar)
    - [ ] Manual testing complete
    - [ ] verify-code skill executed successfully

- [ ] **Task 02: Artwork Management CRUD**
    - [ ] Admin artwork queries implemented and tested
    - [ ] Validation schema created and tested
    - [ ] ArtworkForm component tested
    - [ ] List, create, edit pages tested
    - [ ] Delete functionality tested
    - [ ] Manual testing complete
    - [ ] verify-code skill executed successfully

- [ ] **Task 03: Image Upload System**
    - [ ] Image optimization utilities tested
    - [ ] Upload API route tested
    - [ ] ImageUploader component tested
    - [ ] Integration with ArtworkForm complete
    - [ ] Manual testing complete (upload, variants, storage)
    - [ ] verify-code skill executed successfully

- [ ] **Task 04: Order Management**
    - [ ] Admin order queries implemented and tested
    - [ ] OrdersList component tested
    - [ ] List and detail pages tested
    - [ ] Status updates, notes, tracking tested
    - [ ] Manual testing complete
    - [ ] verify-code skill executed successfully

- [ ] **Task 05: Projects & Events Management**
    - [ ] Projects queries and validation tested
    - [ ] Events queries and validation tested
    - [ ] ProjectForm and EventForm components tested
    - [ ] All CRUD pages tested (projects and events)
    - [ ] ImageUploader integration tested
    - [ ] Manual testing complete
    - [ ] verify-code skill executed successfully

- [ ] **Task 06: Settings & Admin User Management** (Optional - Super Admin Only)
    - [ ] Admin user queries implemented and tested
    - [ ] Validation schema created and tested
    - [ ] AdminForm component tested
    - [ ] Settings page tested (role-based access)
    - [ ] Can create, edit, deactivate admin users
    - [ ] Cannot deactivate self (validation works)
    - [ ] Manual testing complete
    - [ ] verify-code skill executed successfully

- [ ] **All sub-tasks completed**
- [ ] **Integration testing passed**
- [ ] **Parent specification objectives achieved**

## Integration Verification

After all sub-tasks are complete, verify:

### Functional Integration

- [ ] All navigation links work (Dashboard, Artwork, Orders, Projects, Events, Settings\*)
- [ ] Active route highlighting works across all pages
- [ ] Admin header displays correctly on all pages
- [ ] Logout works from any admin page
- [ ] Mobile navigation works on all pages

### Data Flow Integration

- [ ] Dashboard metrics reflect data from artwork/orders/projects/events
- [ ] Recent orders on dashboard link to order detail pages
- [ ] Creating artwork updates dashboard metrics
- [ ] Creating order updates dashboard metrics
- [ ] Image uploads work in artwork, projects, and events forms

### Component Reuse

- [ ] AdminCard used consistently across dashboard and list pages
- [ ] ImageUploader works in ArtworkForm, ProjectForm, EventForm
- [ ] Status badges styled consistently (artwork, orders, projects, events)
- [ ] Form validation patterns consistent across all forms

### Testing Integration

- [ ] All tests pass: `npm test`
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] ESLint passes: `npm run lint`
- [ ] Prettier formatting applied: `npm run format`
- [ ] Full build succeeds: `npm run build:full`

### Code Quality

- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] All files formatted with Prettier
- [ ] Test coverage meets targets (80-100% depending on module)
- [ ] No console errors in browser
- [ ] No console warnings in browser

### Manual End-to-End Testing

- [ ] Admin login flow works
- [ ] Can perform full artwork workflow: create → edit → upload image → publish → delete
- [ ] Can perform full order workflow: view list → filter → view detail → update status → add note → add tracking
- [ ] Can perform full project workflow: create → edit → upload image → publish → delete
- [ ] Can perform full event workflow: create → edit → upload image → publish → delete
- [ ] Super admin can create/edit/deactivate admin users
- [ ] Regular admin cannot access settings page
- [ ] Session timeout redirects to login
- [ ] Role-based access works (Settings visible only to super_admin)
- [ ] Cache revalidation works (public pages update after admin changes)

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

- [ ] Add indexes for frequently queried fields (e.g., `orders.status`, `artwork.is_published`)
- [ ] Optimize complex queries (dashboard metrics, order items join)
- [ ] Implement query result caching where appropriate

### Image Upload

- [ ] Verify Sharp performance on production server
- [ ] Consider image upload queue for large batches (future)
- [ ] Monitor Supabase Storage usage and limits

### Bundle Size

- [ ] Verify admin routes are code-split from public routes
- [ ] Check bundle analyzer for large dependencies
- [ ] Lazy load heavy components (image uploader, forms)

### Caching

- [ ] Verify admin_session cookie caching works (15-minute TTL)
- [ ] Test cache revalidation after content updates
- [ ] Monitor Next.js cache hit rates

## Success Metrics

Phase 3 is considered complete when:

### Technical Metrics

- [x] All 5 sub-tasks marked as complete
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
