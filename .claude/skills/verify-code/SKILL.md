---
name: verify-code
description: Automated code quality verification for TypeScript/Next.js projects using tsc, ESLint, Prettier, and Vitest. Used after making code changes to ensure compile, lint, format, and test standards are met. Detects TDD phases and adjusts test failure expectations accordingly.
---

<objective>
Enforce code quality by automatically running TypeScript compilation checks, ESLint, Prettier formatting, and Vitest tests after code modifications. Prevent technical debt accumulation through continuous validation with smart TDD phase detection.
</objective>

<quick_start>

After modifying files in a phase or when called manually,
automatically trigger verification:

```typescript
// Phase tracking
const modifiedFiles = ['src/app/admin/page.tsx', 'src/lib/validation/auth.ts'];

// Run verification sequence
1. tsc --noEmit (no file args)
2. npx eslint --fix src/app/admin/page.tsx src/lib/validation/auth.ts
3. npx prettier --write src/app/admin/page.tsx src/lib/validation/auth.ts
4. npx vitest related run src/app/admin/page.tsx src/lib/validation/auth.ts
```

All commands must pass before proceeding to next phase. If TDD Red phase
detected (new tests added), expect test failures.

</quick_start>

<workflow>
<phase_tracking>

Track which files are modified in the current implementation phase:

- Keep list of file paths edited or created
- Update list as work progresses
- Use list to generate verification commands

</phase_tracking>

<verification_sequence>

Run these commands in order, replacing {files} with
space-separated paths:

1. **TypeScript compile**: `tsc --noEmit`
    - No file arguments needed (checks entire project)
    - Must complete with zero errors
    - If errors found, fix before proceeding

2. **ESLint**: `npx eslint --fix {files}`
    - NEVER disable linting suggestions or use `eslint-disable` unless the specific implementation absolutely demands it.
    - Auto-fixes issues when possible
    - Must complete with zero errors and warnings
    - If errors persist, fix code (never add `eslint-disable`)

3. **Prettier**: `npx prettier --write {files}`
    - Auto-formats all files
    - Should always succeed
    - If fails, investigate file corruption
    - Do not bother with `npx prettier --check` or `npm format:check`, it only wastes time.

4. **Vitest**: `npx vitest related run {files}`
    - Runs tests related to modified files
    - Expectation depends on TDD phase (see tdd_handling)
    - If unexpected failures, fix implementation or tests
    - The tests hang on occasion. If they have not completed in 2 minutes, kill the process and retry it.

</verification_sequence>

<failure_handling>

For each command that fails:

1. Read error output carefully
2. Fix the specific issue in code
3. Retry the same verification command
4. Track retry attempts

After 3 consecutive failures on same command:

1. Stop all implementation work
2. Document the error in detail:
    - Command that failed
    - Full error output
    - Files involved
    - What was attempted
3. Use AskUserQuestion to request human guidance
4. Do NOT proceed until issue resolved

</failure_handling>

<timing>

Trigger verification at these points:

- **After completing a phase**: Before marking phase todo as complete
- **Before committing code**: Part of pre-commit workflow
- **After significant refactoring**: When modifying 3+ files
- **Before creating PR**: Final check before code review
- **On request**: When user explicitly asks for verification

Do NOT verify after every single file edit (too frequent). DO verify before
moving to next major step.

</timing>

</workflow>

<tdd_handling>

<phase_detection>

Detect TDD phases by analyzing recent changes:

**Red Phase** (expect test failures):

- New test files created matching `__tests__/**/*.test.ts`
- New test cases added to existing test files
- Implementation files not yet modified
- Tests should fail with "not implemented" or similar

**Green Phase** (expect tests to pass):

- Implementation files modified after Red phase
- Tests now passing
- No new test cases added

**Refactor Phase** (expect tests to pass):

- Implementation files modified
- No new tests added
- All tests still passing
- Code structure improved

**Detection logic**:

```typescript
if (newTestsAdded && !implementationModified) {
    phase = 'RED';
    expectTestFailures = true;
} else if (implementationModified && testsWereFailing) {
    phase = 'GREEN';
    expectTestFailures = false;
} else {
    phase = 'REFACTOR';
    expectTestFailures = false;
}
```

</phase_detection>

<test_expectations>

**In Red phase**:

- Test failures are expected and correct
- Verify failures match new test cases
- Do NOT count as verification failure
- Proceed to implementation (Green phase)

**In Green/Refactor phases**:

- All tests must pass
- Any failure is a real error
- Count failures toward 3-attempt limit
- Must fix before proceeding

**Ambiguous cases**:

- If unsure about TDD phase, ask user
- Default to expecting tests to pass
- Document assumption in chat </test_expectations> </tdd_handling>

<validation>

<success_indicators>

Verification succeeded when:

- `tsc --noEmit` exits with code 0
- `npx eslint --fix {files}` exits with code 0, no errors/warnings
- `npx prettier --write {files}` exits with code 0
- `npx vitest related run {files}` exits with code 0 (unless Red phase)
- All files properly formatted and linted

</success_indicators>

<failure_indicators>

Verification failed when:

- Any command exits with non-zero code
- TypeScript errors reported
- ESLint errors or warnings reported
- Prettier cannot format files
- Tests fail (outside Red phase)
- Same command fails 3 times

</failure_indicators>

</validation>

<common_patterns>

<single_file_change>

```bash
# Modified: src/components/Button.tsx
tsc --noEmit
npx eslint --fix src/components/Button.tsx
npx prettier --write src/components/Button.tsx
npx vitest related run src/components/Button.tsx
```

</single_file_change>

<multiple_file_change>

```bash
# Modified: src/app/page.tsx, src/lib/api.ts, src/types/index.ts
tsc --noEmit
npx eslint --fix src/app/page.tsx src/lib/api.ts src/types/index.ts
npx prettier --write src/app/page.tsx src/lib/api.ts src/types/index.ts
npx vitest related run src/app/page.tsx src/lib/api.ts src/types/index.ts
```

</multiple_file_change>

<tdd_red_phase>

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

</tdd_red_phase>

<tdd_green_phase>

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

</tdd_green_phase>

</common_patterns>

<anti_patterns>

<batching_verification>

**Wrong**: Wait until 10 files modified,
then verify once **Right**: Verify after each logical phase (1-3 files) **Why**:
Early detection prevents cascading errors

</batching_verification>

<ignoring_warnings>

**Wrong**: `npx eslint --fix {files} --max-warnings 100`
**Right**: `npx eslint --fix {files}` (zero warnings) **Why**: Warnings indicate
code quality issues

</ignoring_warnings>

<skipping_compile_check>

**Wrong**: Only run eslint and prettier **Right**:
Always run tsc first **Why**: Type errors can cause runtime failures

</skipping_compile_check>

<adding_eslint_disable>

**Wrong**: Add `// eslint-disable-next-line` to bypass
rules **Right**: Fix the underlying code issue **Why**: Disabling rules hides
problems

</adding_eslint_disable>

<assuming_tdd_phase>

**Wrong**: Guess whether in Red/Green/Refactor **Right**:
Detect from file modifications or ask user **Why**: Wrong assumptions lead to
false positives/negatives

</assuming_tdd_phase>

</anti_patterns>

<success_criteria>

Verification is successful when:

- All four commands (tsc, eslint, prettier, vitest) complete without errors
- Modified files are tracked accurately throughout the phase
- TDD phase correctly detected (if applicable)
- Test failures in Red phase are recognized as expected
- Failures in Green/Refactor phases trigger proper error handling
- After 3 failures, work stops and human guidance is requested
- Code is ready for commit or next implementation phase

</success_criteria>

<output_format>

```markdown
## Issues

### TypeScript Errors

[What you observed - exact errors, behaviors, outputs]

### ESLint Errors

[What you observed - exact errors, behaviors, outputs]

### Prettier Errors

[What you observed - exact errors, behaviors, outputs]

### Test Failures

[What you observed - exact errors, behaviors, outputs]

## Resolution

### TypeScript Errors

[What you changed and WHY it addresses the root cause]

### ESLint Errors

[What you changed and WHY it addresses the root cause]

### Prettier Errors

[What you changed and WHY it addresses the root cause]

### Test Failures

[What you changed and WHY it addresses the root cause]

## Verification

[How you confirmed this works and doesn't break anything else]
```

</output_format>
