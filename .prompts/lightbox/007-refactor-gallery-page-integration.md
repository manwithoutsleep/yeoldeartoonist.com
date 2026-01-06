<objective>
Refactor the Gallery detail page implementation to improve code quality, enhance visual affordances, and ensure maintainability while keeping all tests passing (TDD Refactor Phase).
</objective>

<context>
You are implementing Step 7 of the lightbox viewer implementation plan (TDD Refactor Phase for Gallery page).

**CRITICAL CONTEXT FROM PREVIOUS STEP:**
{context_from_step_6}

Reference the full specification at: @.specs/2026-01-06T07-53-44-claude-issue-56.md

The Gallery detail page integration is complete and all tests pass. Your goal is to improve code quality without changing behavior.

Read @CLAUDE.md for project conventions.
</context>

<requirements>
Review and refactor these files:
1. `src/app/gallery/[slug]/page.tsx`
2. `src/app/gallery/[slug]/GalleryDetailClient.tsx`

Focus on these refactoring opportunities:

1. **Extract Image Fallback Logic:**
    - If multiple fallback checks exist, extract into helper function
    - Example: `getArtworkImageUrl(artwork, 'large' | 'full')` utility
    - Place in appropriate location (inline helper or shared utility if reused)

2. **Visual Affordance Improvements:**
    - Verify zoom icon overlay appears correctly on hover and looks professional
    - Verify "Click to enlarge" text hint is clearly visible, well-positioned, and styled consistently
    - Ensure high contrast for both affordances (WCAG AA compliance)
    - Test hover interactions feel smooth and intuitive
    - Ensure focus indicator is clearly visible for keyboard users

3. **Code Quality:**
    - Eliminate any magic numbers or strings (use named constants)
    - Ensure proper TypeScript types
    - Add JSDoc comments where helpful
    - Consistent naming conventions
    - Remove any dead code

4. **Component Structure:**
    - Verify proper separation of concerns (server vs client components)
    - Ensure props are minimal and well-typed
    - Check that state management is simple and clear
    - Verify no unnecessary re-renders

5. **Styling Consistency:**
    - Ensure consistent spacing, colors, fonts with rest of site
    - Verify responsive behavior on different screen sizes
    - Check that Tailwind classes are semantic and well-organized
      </requirements>

<implementation>
- Read both files thoroughly before making changes
- Make incremental refactoring changes, testing after each
- Preserve all functionality - tests must continue passing
- Follow SOLID principles (Single Responsibility, etc.)
- Ensure visual affordances are polished and professional
- Consider extracting shared logic only if truly reusable (YAGNI principle)
</implementation>

<verification>
After EACH refactoring change, use the verify-code skill:
- TypeScript compilation
- ESLint validation
- Prettier formatting
- ALL tests STILL PASS

Use the Skill tool to invoke: `verify-code`

If any test fails, revert that change and try a different approach.
</verification>

<output>
Update files:
- `src/app/gallery/[slug]/page.tsx`
- `src/app/gallery/[slug]/GalleryDetailClient.tsx`

Report back:

- Summary of refactoring changes made
- Visual affordance improvements (zoom icon, text hint styling)
- Code quality improvements
- Any helper functions or utilities extracted
- Confirmation that all tests still pass
- Final assessment: Implementation is production-ready
- Context for next step: Code is ready for manual testing and human review (Steps 8-10)
  </output>

<success_criteria>

- Code is clean, maintainable, and well-documented
- Visual affordances are polished and professional
- All tests continue to pass (no regression)
- Proper TypeScript types throughout
- Consistent styling with rest of site
- No magic numbers or unclear code
- WCAG AA contrast requirements met
- Code follows SOLID principles
- Ready for human review and manual testing (Steps 8-10)
  </success_criteria>

<manual_testing_required>
**⚠️ HUMAN INTERVENTION REQUIRED**

Implementation Steps 1-7 are now complete. The following steps require human involvement:

**Step 8: Manual Testing and Accessibility Audit**

- Desktop testing (hover, click, keyboard navigation)
- Mobile testing (responsive layout, native pinch-to-zoom)
- Accessibility testing (screen reader, keyboard-only, color contrast)
- Performance testing (image loading, network throttling)

**Step 9: Update Documentation**

- Review CLAUDE.md, README.md
- Add JSDoc comments to components

**Step 10: Request Human Review**

- Comprehensive review checklist
- Approval before PR creation

**Step 11: Create Pull Request**

- Git commit and push
- Create PR with detailed description

**Step 12: Merge After Approval**

- Wait for PR approval
- Squash and merge
- Delete feature branch

Please perform manual testing and review before proceeding with PR creation.
</manual_testing_required>
