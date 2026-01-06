<objective>
Refactor the ImageLightbox component to improve code quality, maintainability, and adherence to best practices while ensuring all tests continue to pass (TDD Refactor Phase).
</objective>

<context>
You are implementing Step 4 of the lightbox viewer implementation plan (TDD Refactor Phase).

**CRITICAL CONTEXT FROM PREVIOUS STEP:**
{context_from_step_3}

Reference the full specification at: @.specs/2026-01-06T07-53-44-claude-issue-56.md

The component is now functional and all tests pass. Your goal is to improve code quality WITHOUT changing behavior. All tests must continue passing after refactoring.

Read @CLAUDE.md for project conventions and patterns.
</context>

<requirements>
Review and refactor: `src/components/ui/ImageLightbox.tsx`

Focus on these refactoring opportunities:

1. **Code Quality:**
    - Eliminate magic numbers (use named constants)
    - Ensure proper TypeScript types (no `any` types)
    - Ensure consistent naming conventions
    - Add JSDoc comments for component and props interface
    - Remove any dead code or unnecessary complexity

2. **Extract Reusable Logic (ONLY if truly beneficial):**
    - Consider extracting `useFocusTrap` custom hook IF focus trap logic is complex
    - Consider extracting `useBodyScrollLock` custom hook IF body scroll logic is reusable
    - **YAGNI Principle:** Only extract if pattern will be reused elsewhere - keep inline otherwise
    - Do NOT extract overlay component unless a third component needs it

3. **Accessibility Improvements:**
    - Verify all ARIA attributes are properly set
    - Ensure keyboard navigation is smooth and intuitive
    - Verify focus restoration works correctly
    - Check screen reader experience

4. **Performance Optimization:**
    - Verify event listeners are properly cleaned up
    - Ensure no unnecessary re-renders
    - Check that effects have proper dependency arrays
      </requirements>

<implementation>
- Read the current implementation thoroughly before making changes
- Make incremental refactoring changes, testing after each change
- Follow SOLID principles, especially Single Responsibility
- Preserve all existing functionality - tests must continue passing
- Add comments where code intent is not immediately clear
- Ensure consistency with project coding standards
</implementation>

<verification>
After EACH refactoring change, use the verify-code skill to ensure:
- TypeScript compilation still works
- ESLint validation passes
- Prettier formatting maintained
- ALL tests STILL PASS (critical for refactor phase)

Use the Skill tool to invoke: `verify-code`

If any test fails after refactoring, revert that change and try a different approach.
</verification>

<output>
Update file: `src/components/ui/ImageLightbox.tsx`

Report back:

- Summary of refactoring changes made
- Confirmation that all tests still pass
- Code quality improvements achieved
- Any patterns extracted (hooks, utilities) and why
- Context for next step: Component is production-ready, proceed to Gallery detail page integration
  </output>

<success_criteria>

- Code is cleaner and more maintainable
- All tests continue to pass (no regression)
- No magic numbers or unclear code
- Proper TypeScript types throughout
- JSDoc comments added for documentation
- Component follows SOLID principles
- Ready to proceed with Step 5 (create Gallery detail page tests)
  </success_criteria>
