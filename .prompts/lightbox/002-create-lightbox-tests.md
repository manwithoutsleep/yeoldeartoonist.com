<objective>
Create comprehensive test suite for the ImageLightbox component following TDD Red Phase methodology. Write ALL tests BEFORE implementing the component to ensure test-driven development.
</objective>

<context>
You are implementing Step 2 of the lightbox viewer implementation plan (TDD Red Phase).

**CRITICAL CONTEXT FROM PREVIOUS STEP:**
{context_from_step_1}

Reference the full specification at: @.specs/2026-01-06T07-53-44-claude-issue-56.md

This follows Test-Driven Development (TDD):

- **Red Phase** (this step): Write failing tests first
- Green Phase (next step): Implement component to make tests pass
- Refactor Phase: Clean up code while tests still pass

Read @CLAUDE.md for project testing conventions and patterns.
</context>

<requirements>
Create test file: `__tests__/components/ui/ImageLightbox.test.tsx`

Write comprehensive test cases covering:

1. **Rendering Tests** (4 tests):
    - Should not render when `isOpen={false}`
    - Should render overlay and lightbox when `isOpen={true}`
    - Should display image with correct src and alt text
    - Should display close button

2. **Interaction Tests** (4 tests):
    - Should call `onClose` when overlay is clicked
    - Should call `onClose` when close button is clicked
    - Should call `onClose` when Escape key is pressed
    - Should NOT call `onClose` when clicking on the image itself

3. **Accessibility Tests** (6 tests):
    - Should have `role="dialog"` and `aria-modal="true"`
    - Should have `aria-labelledby` pointing to image title
    - Should focus close button when lightbox opens
    - Should trap focus within lightbox (Tab navigation)
    - Should prevent body scroll when open
    - Should restore body scroll when closed

4. **Keyboard Navigation Tests** (3 tests):
    - Should handle Tab key (forward focus)
    - Should handle Shift+Tab key (backward focus)
    - Should handle Escape key (close)

**Expected Interface:**

```typescript
interface ImageLightboxProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string;
    imageAlt: string;
    imageTitle?: string;
}
```

</requirements>

<implementation>
- Use Vitest and React Testing Library (already configured in project)
- Mock Next.js Image component (standard practice in this codebase)
- Use happy-dom for DOM simulation
- Each test should be focused on ONE specific behavior
- All tests MUST fail initially (Red Phase) - the component doesn't exist yet
- Follow existing test patterns in the codebase (examine similar component tests if needed)
</implementation>

<verification>
After creating the test file, run the verify-code skill to ensure code quality:
- TypeScript compilation check
- ESLint validation
- Prettier formatting
- Run tests and EXPECT them to FAIL (this is correct for Red Phase)

Use the Skill tool to invoke: `verify-code`

The verify-code skill will handle test failures gracefully during TDD Red Phase.
</verification>

<output>
Create file: `__tests__/components/ui/ImageLightbox.test.tsx`

Report back:

- Number of test cases written
- Confirmation that tests fail as expected (Red Phase complete)
- Any issues encountered during test creation
- Context for next step: The component interface and expected behaviors are now defined through tests
  </output>

<success_criteria>

- Test file created with 17+ comprehensive test cases
- All tests fail (component doesn't exist yet - expected for Red Phase)
- Tests compile without TypeScript errors
- Tests follow project conventions (ESLint, Prettier)
- Ready to proceed with Step 3 (implement component to make tests pass)
  </success_criteria>
