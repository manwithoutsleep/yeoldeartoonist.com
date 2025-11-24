<objective>
Create comprehensive tests for {{file-name}} following the established testing patterns in this project.

This project uses Vitest with React Testing Library for component tests, ensuring full coverage of functionality, edge cases, accessibility, and user interactions. Tests must follow the existing patterns and conventions found in the codebase.
</objective>

<context>
The codebase is a Next.js 16 application with TypeScript, using:
- **Test Framework**: Vitest with jsdom environment
- **Component Testing**: React Testing Library (@testing-library/react)
- **User Interaction Testing**: @testing-library/user-event
- **Test File Location**: `__tests__/` directory, mirroring the src/ structure
- **Setup**: Global test setup in `__tests__/setup.ts` with Next.js mocks

Before creating tests, read CLAUDE.md for project conventions:
@CLAUDE.md

Then examine the target file to understand what needs testing:
@{{file-name}}
</context>

<research>
To create effective tests following project patterns, examine existing test files:

**For Component Tests**:

- @**tests**/components/ui/Button.test.tsx (comprehensive component testing pattern)
- @**tests**/components/admin/artwork/ArtworkForm.test.tsx (form component pattern)
- @**tests**/components/layout/Header.test.tsx (layout component pattern)

**For Database Query Tests**:

- @**tests**/lib/db/artwork.unit.test.ts (unit test pattern)
- @**tests**/lib/db/artwork.integration.test.ts (integration test pattern)

**For Page Tests**:

- @**tests**/app/page.test.tsx (page component pattern)
- @**tests**/app/admin/page.test.tsx (admin page pattern)

**For Hook Tests**:

- @**tests**/hooks/useAuth.test.ts (custom hook pattern)
- @**tests**/hooks/useCart.test.tsx (hook with context pattern)

Identify which pattern(s) apply to {{file-name}} and follow those conventions.
</research>

<requirements>
Your tests must include ALL of the following, as applicable to the file type:

**Core Functionality Tests**:

1. Test all exported functions, components, or classes
2. Test all props, parameters, or configuration options
3. Test return values, rendered output, or side effects
4. Test default behaviors and explicit configurations

**Edge Case Tests**:

1. Test with missing/undefined/null values
2. Test with empty arrays, empty strings, or zero values
3. Test boundary conditions (min/max values, limits)
4. Test error scenarios and error handling

**User Interaction Tests** (for components):

1. Test click events, form submissions, keyboard interactions
2. Test state changes triggered by user actions
3. Test async operations (loading states, API calls)
4. Use @testing-library/user-event for realistic interactions

**Accessibility Tests** (for components):

1. Test proper ARIA attributes and roles
2. Test keyboard navigation
3. Test screen reader compatibility (semantic HTML)

**Integration Tests** (when applicable):

1. Test interactions with other components or systems
2. Test with different contexts or providers
3. Test data flow and state management

**Code Quality**:

1. Each test should have a clear, descriptive name
2. Use the pattern: `it('should [expected behavior] when [condition]')`
3. Include a describe block comment explaining what the file does
4. Group related tests in describe blocks
5. Mock external dependencies appropriately
6. Follow the existing test structure patterns from this codebase
   </requirements>

<implementation>
**Test File Location**:
- Determine the correct test file path by mirroring the src/ structure in __tests__/
- Example: `src/components/ui/Card.tsx` → `__tests__/components/ui/Card.test.tsx`
- Example: `src/lib/db/orders.ts` → `__tests__/lib/db/orders.test.ts`
- Example: `src/app/admin/page.tsx` → `__tests__/app/admin/page.test.tsx`

**Test Structure Pattern**:

```typescript
/**
 * Tests for [Component/Function Name]
 *
 * [Brief description of what this file does and what the tests cover]
 */
describe('[Component/Function Name]', () => {
    describe('[feature group]', () => {
        it('should [expected behavior]', () => {
            // Arrange
            // Act
            // Assert
        });
    });
});
```

**Imports**:

- Use proper path aliases (@/components, @/lib, etc.)
- Import from '@testing-library/react' for render, screen, waitFor
- Import from '@testing-library/user-event' for user interactions
- Import from 'vitest' for describe, it, expect, vi (mocking)
- Import from '@testing-library/jest-dom' is already globally available

**Mocking**:

- Use `vi.fn()` for function mocks
- Use `vi.mock()` for module mocks (place at top of file)
- Mock Supabase clients if needed (check existing patterns)
- Mock Next.js router/navigation (already mocked in setup.ts)

**Assertions**:

- Use jest-dom matchers: toBeInTheDocument(), toHaveClass(), toBeDisabled(), etc.
- Use standard matchers: toBe(), toEqual(), toHaveBeenCalled(), etc.
- Check both positive and negative cases

**WHY these patterns matter**:

- Following established patterns ensures consistency and maintainability
- Using user-event instead of fireEvent creates more realistic interaction tests
- Proper test organization makes it easy to identify what's failing and why
- Descriptive test names serve as living documentation
  </implementation>

<output>
Create the test file at the appropriate path:
- `__tests__/[mirrored-path-from-src]/[filename].test.tsx` (for components)
- `__tests__/[mirrored-path-from-src]/[filename].test.ts` (for utilities/hooks)

The test file should:

1. Include a comprehensive doc comment at the top
2. Have multiple describe blocks organizing related tests
3. Cover all functionality, edge cases, and interactions
4. Follow the exact patterns from existing tests in this project
5. Include clear, descriptive test names
6. Use proper mocking and setup/teardown if needed
   </output>

<verification>
After creating the test file, verify your work:

1. **Run the tests**:

    ```bash
    npm test [path-to-test-file]
    ```

2. **Check for passing tests**:
    - All tests should pass
    - No console errors or warnings
    - Tests should complete within timeout limits

3. **Verify coverage** (optional but recommended):

    ```bash
    npm run test:coverage
    ```

    Check that the target file has high coverage (aim for >80% for critical code)

4. **Check test quality**:
    - Are all exported functions/components tested?
    - Are edge cases covered?
    - Are error scenarios handled?
    - Do test names clearly describe what's being tested?

5. **Ensure consistency**:
    - Does the test file follow the same structure as other tests?
    - Are imports organized properly?
    - Is the describe/it nesting logical and clear?
      </verification>

<success_criteria>

- Test file created in correct **tests**/ location mirroring src/ structure
- All exported functionality has test coverage
- Tests follow existing project patterns (verified by reading example tests)
- Tests include edge cases, error handling, and user interactions (where applicable)
- All tests pass when run with `npm test`
- Test file includes clear documentation and descriptive test names
- No linting errors in the test file
- Tests are maintainable and serve as documentation for the code's behavior
  </success_criteria>
