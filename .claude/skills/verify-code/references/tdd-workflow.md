# TDD Workflow Reference

## Phase Detection

Detect TDD phases by analyzing recent changes:

### Red Phase (Expect Test Failures)

- New test files created matching `__tests__/**/*.test.ts`
- New test cases added to existing test files
- Implementation files not yet modified
- Tests should fail with "not implemented" or similar

### Green Phase (Expect Tests to Pass)

- Implementation files modified after Red phase
- Tests now passing
- No new test cases added

### Refactor Phase (Expect Tests to Pass)

- Implementation files modified
- No new tests added
- All tests still passing
- Code structure improved

## Detection Logic (Conceptual)

Ask yourself these questions in order:

1. **Did I create new test files or add new test cases?**
    - Yes → Check if implementation is modified
        - No → **RED phase** (expect failures)
        - Yes → **GREEN phase** (expect pass)
    - No → **REFACTOR phase** (expect pass)

2. **When in doubt:**
    - Ask the user which phase we're in
    - Default assumption: REFACTOR (expect tests to pass)

## Test Expectations

### In Red Phase

- Test failures are expected and correct
- Verify failures match new test cases
- Do NOT count as verification failure
- Proceed to implementation (Green phase)

### In Green/Refactor Phases

- All tests MUST pass
- Any failure is a real error
- Count failures toward 3-attempt limit
- MUST fix before proceeding

### Ambiguous Cases

- If unsure about TDD phase, ask user
- Default to expecting tests to pass
- Document assumption in chat

## Examples

### Red Phase Example

```bash
# Created: __tests__/lib/auth.test.ts (new tests)
# Status: RED phase - tests should fail

tsc --noEmit
npx eslint --fix __tests__/lib/auth.test.ts
npx prettier --write __tests__/lib/auth.test.ts
npx vitest related run __tests__/lib/auth.test.ts

# Expected: Tests fail (not implemented)
# Action: Proceed to Green phase (implement functionality)
```

### Green Phase Example

```bash
# Modified: src/lib/auth.ts (implementation)
# Status: GREEN phase - tests should now pass

tsc --noEmit
npx eslint --fix src/lib/auth.ts __tests__/lib/auth.test.ts
npx prettier --write src/lib/auth.ts __tests__/lib/auth.test.ts
npx vitest related run src/lib/auth.ts __tests__/lib/auth.test.ts

# Expected: All tests pass
# Action: If passing, proceed to next feature
```
