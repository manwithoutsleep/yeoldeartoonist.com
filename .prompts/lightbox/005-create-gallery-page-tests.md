<objective>
Create comprehensive tests for the Gallery detail page that verify lightbox integration, image resolution usage, and visual affordances (TDD Red Phase for page integration).
</objective>

<context>
You are implementing Step 5 of the lightbox viewer implementation plan (TDD Red Phase for Gallery page).

**CRITICAL CONTEXT FROM PREVIOUS STEP:**
{context_from_step_4}

Reference the full specification at: @.specs/2026-01-06T07-53-44-claude-issue-56.md

The ImageLightbox component is complete. Now we need to integrate it into the Gallery detail page. Following TDD, we write tests first.

Read @CLAUDE.md for project conventions.
Examine the current Gallery detail page at: @src/app/gallery/[slug]/page.tsx
</context>

<requirements>
Create or update test file: `__tests__/app/gallery/[slug]/page.test.tsx`

Write comprehensive test cases covering:

1. **Image Display Tests** (3 tests):
    - Should display 800px image (`image_large_url`) in main view (NOT 1600px)
    - Should make image clickable with appropriate cursor styling
    - Should have fallback behavior if `image_large_url` is missing

2. **Visual Affordance Tests** (3 tests):
    - Should display "Click image to enlarge" text hint (always visible, not just on hover)
    - Should have proper ARIA attributes for clickable image (role="button", tabindex="0")
    - Should have clear focus indicator for keyboard users

3. **Lightbox Integration Tests** (5 tests):
    - Should open lightbox when main image is clicked
    - Should open lightbox when Enter/Space key pressed on focused image
    - Should pass 1600px image URL to lightbox (`image_url`)
    - Should close lightbox when overlay is clicked (via lightbox component)
    - Should pass correct alt text and title to lightbox component

4. **Regression Tests** (2 tests):
    - Should not affect Gallery page thumbnails (verify Gallery page still uses 300px)
    - Should preserve existing metadata generation (title, description, Open Graph)

Note: Zoom icon overlay on hover is visual only and difficult to test in unit tests - will be verified in manual testing (Step 8).
</requirements>

<implementation>
- Examine the current Gallery detail page implementation to understand its structure
- Create tests that will fail initially (page hasn't been updated yet)
- Mock the ImageLightbox component for testing page behavior
- Use React Testing Library for user interaction simulation
- Test both mouse and keyboard interactions
- Follow existing test patterns in the codebase
</implementation>

<verification>
After creating tests, use the verify-code skill:
- TypeScript compilation check
- ESLint validation
- Prettier formatting
- Run tests and EXPECT them to FAIL (Red Phase - page not updated yet)

Use the Skill tool to invoke: `verify-code`

Tests should fail because the Gallery detail page hasn't been updated to integrate the lightbox yet.
</verification>

<output>
Create/update file: `__tests__/app/gallery/[slug]/page.test.tsx`

Report back:

- Number of new test cases written
- Confirmation that tests fail as expected (Red Phase)
- Current Gallery detail page structure observed
- Any architectural considerations for the integration
- Context for next step: Tests define the expected integration behavior
  </output>

<success_criteria>

- Test file created/updated with 13+ test cases
- Tests fail as expected (page not updated yet)
- Tests compile without TypeScript errors
- Tests follow project conventions
- Test coverage includes image resolution, visual affordances, lightbox integration, and regression scenarios
- Ready to proceed with Step 6 (implement Gallery page integration)
  </success_criteria>
