---
name: verify-code
description: Automated code quality verification for TypeScript/Next.js projects using tsc, ESLint, Prettier, and Vitest. Triggered after code modifications to ensure compile, lint, format, and test standards are met. Detects TDD phases and adjusts test failure expectations accordingly.
---

<objective>
Enforce code quality by automatically running TypeScript compilation checks, ESLint, Prettier formatting, and Vitest tests after code modifications. Prevent technical debt accumulation through continuous validation with smart TDD phase detection.
</objective>

<when_to_use>
Invoke this skill at these key moments:

- **After completing a phase or task**: Before marking phase todos as complete
- **Before committing code**: As part of the pre-commit workflow
- **After significant changes**: When modifying 3+ files or major refactoring
- **When explicitly requested**: User asks to verify, check, or validate code quality
- **Before creating a PR**: Final verification before code review

**When NOT to use:**

- After every single file edit (too frequent)
- For documentation-only changes (.md files without code)
- During exploratory coding where you expect things to be broken
  </when_to_use>

<quick_start>
After modifying files in a phase or when called manually, automatically trigger verification:

```bash
# Example: Modified src/app/admin/page.tsx and src/lib/validation/auth.ts

# Run verification sequence (all commands MUST pass)
tsc --noEmit
npx eslint --fix src/app/admin/page.tsx src/lib/validation/auth.ts
npx prettier --write src/app/admin/page.tsx src/lib/validation/auth.ts
npx vitest related run src/app/admin/page.tsx src/lib/validation/auth.ts
```

All commands MUST pass before proceeding to next phase. If TDD Red phase detected (new tests added), test failures are expected.

See `references/examples.md` for more verification scenarios.
</quick_start>

<workflow>
<phase_tracking>
**Track modified files throughout the current phase:**

At the start of each phase, initialize tracking:

- Create a mental list or use TodoWrite to track files
- Update the list each time you Edit or Write a file
- Include both source files and test files

Example tracking approach:
Phase: Implement authentication validation
Modified files:

- src/lib/validation/auth.ts (created)
- src/app/api/login/route.ts (edited)
- tests/lib/validation/auth.test.ts (created)

When ready to verify, use this list to construct verification commands.
</phase_tracking>

<verification_sequence>
<overview>Run these commands in order, replacing {files} with space-separated paths of modified files:</overview>

<step_1>

<title>TypeScript Compilation</title>
<command>
```bash
tsc --noEmit
```
</command>
<notes>
- No file arguments needed (checks entire project)
- MUST complete with zero errors
- If errors found, fix before proceeding
</notes>
</step_1>

<step_2>

<title>ESLint</title>
<command>
```bash
npx eslint --fix {files}
```
</command>
<notes>
- NEVER disable linting suggestions or use `eslint-disable` unless the specific implementation absolutely demands it
- Auto-fixes issues when possible
- MUST complete with zero errors and warnings
- If errors persist, fix code (NEVER add `eslint-disable`)
</notes>
</step_2>

<step_3>

<title>Prettier</title>
<command>
```bash
npx prettier --write {files}
```
</command>
<notes>
- Auto-formats all files
- Should always succeed
- If fails, investigate file corruption
- Do not bother with `npx prettier --check` or `npm format:check`, it only wastes time
</notes>
</step_3>

<step_4>

<title>Vitest</title>
<command>
```bash
npx vitest related run {files}
```
</command>
<notes>
- Runs tests related to modified files
- Expectation depends on TDD phase (see `references/tdd-workflow.md`)
- If unexpected failures, fix implementation or tests
- Tests hang on occasion - if not completed in 2 minutes, kill process and retry
</notes>
</step_4>
</verification_sequence>

<failure_handling>
For each command that fails:

1. Read error output carefully
2. Fix the specific issue in code
3. Retry the SAME verification command (not the entire sequence)
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

<common_errors>
**TypeScript Common Errors:**

- `Cannot find module 'X'` → Check import paths, may need file extension or path alias
- `Type 'X' is not assignable to type 'Y'` → Review type definitions, may need type assertion or fix types
- `Object is possibly 'undefined'` → Add null check (`if (obj)`) or optional chaining (`obj?.prop`)
- `Property 'X' does not exist on type 'Y'` → Check object shape, may need to extend interface

**ESLint Common Errors:**

- `React Hook useEffect has a missing dependency` → Add dependency to array or wrap in useCallback
- `'X' is assigned a value but never used` → Remove variable or use it, or prefix with `_` if intentional
- `Unexpected any. Specify a different type` → Replace `any` with specific type or `unknown`
- `Prefer const` → Change `let` to `const` if variable is never reassigned

**Vitest Common Errors:**

- `Test timeout of 5000ms exceeded` → Kill and retry, or increase timeout in specific test
- `Cannot find module 'X' from 'test.ts'` → Check tsconfig.json paths, may need to adjust test configuration
- `ReferenceError: X is not defined` → Import missing dependency or mock it
- `Expected X to be Y` → Implementation doesn't match test expectation, review logic

**Recovery strategy:**
After each fix, re-run ONLY the failed command, not the entire verification sequence.
</common_errors>
</failure_handling>

<tdd_detection>
**Before running tests, detect the current TDD phase:**

Ask yourself these questions in order:

1. **Did I create new test files or add new test cases?**
    - Yes → Check if implementation is modified
        - No → **RED phase** (expect test failures)
        - Yes → **GREEN phase** (expect tests to pass)
    - No → **REFACTOR phase** (expect tests to pass)

**Phase indicators:**

**Red Phase** (expect failures):

- Created new test files matching `__tests__/**/*.test.ts` or `**/*.test.ts`
- Added new test cases (`it()`, `test()`, `describe()`) to existing test files
- Have NOT yet modified corresponding implementation files
- Action: Test failures are EXPECTED, do NOT count as verification failure

**Green Phase** (expect pass):

- Modified implementation files after being in Red phase
- Tests were previously failing
- Action: Tests should now pass, any failure is a real error

**Refactor Phase** (expect pass):

- Modified implementation files only
- No new tests added
- Action: All existing tests MUST still pass

**When uncertain about phase:**
Use AskUserQuestion to confirm: "Are we in Red phase (expecting test failures) or Green/Refactor phase (expecting all tests to pass)?"
</tdd_detection>

<progress_reporting>
**Keep the user informed during verification:**

**At start:**
"Running verification on [N] modified files: [list files]"

**After each step:**
"✓ TypeScript compilation passed"
"✓ ESLint passed (auto-fixed 3 issues)"
"✓ Prettier formatting applied"
"✓ Tests passed (12 tests, 2.4s)"

**On failure:**
"✗ ESLint found 2 errors in src/app/page.tsx:"
[Show specific errors]
"Fixing errors and retrying..."

**On completion:**
"✓ All verification checks passed - code is ready for commit"

This transparency helps users understand what's happening, especially for long verification runs.
</progress_reporting>

<todo_integration>
**Update todos to reflect verification status:**

**Before verification:**

- Current phase todo should be marked as in_progress
- Example: "Implementing authentication module"

**During verification (if failures found):**

- Keep phase todo as in_progress
- Do NOT mark complete until all verification passes

**After successful verification:**

- Mark phase todo as completed
- You may add a completion note: "Verified: tsc ✓ eslint ✓ prettier ✓ vitest ✓"

**If verification fails 3 times:**

- Keep phase todo as in_progress
- Add new todo: "Blocked: [describe specific issue] - needs human guidance"
- Use AskUserQuestion to get help from user
  </todo_integration>

<command_execution>
**Important execution details:**

1. **Run commands sequentially** - each depends on previous success
2. **Use Bash tool** for each command with clear descriptions
3. **Check exit codes** - 0 means success, non-zero means failure
4. **Capture and analyze output** for each command
5. **Handle timeouts** - if a command hangs (>2 minutes), kill and retry

**Example Bash tool usage:**

```bash
tsc --noEmit
# Description: "Check TypeScript compilation"
```

**Never skip steps:** Even if you "know" TypeScript will pass, always run tsc first. The sequence is designed to catch issues early (type errors before lint errors).
</command_execution>
</workflow>

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

<anti_patterns>
<batching_verification>
**Wrong**: Wait until 10 files modified, then verify once
**Right**: Verify after each logical phase (1-3 files)
**Why**: Early detection prevents cascading errors
</batching_verification>

<ignoring_warnings>
**Wrong**: `npx eslint --fix {files} --max-warnings 100`
**Right**: `npx eslint --fix {files}` (zero warnings)
**Why**: Warnings indicate code quality issues
</ignoring_warnings>

<skipping_compile_check>
**Wrong**: Only run eslint and prettier
**Right**: Always run tsc first
**Why**: Type errors can cause runtime failures
</skipping_compile_check>

<adding_eslint_disable>
**Wrong**: Add `// eslint-disable-next-line` to bypass rules
**Right**: Fix the underlying code issue
**Why**: Disabling rules hides problems
</adding_eslint_disable>

<assuming_tdd_phase>
**Wrong**: Guess whether in Red/Green/Refactor
**Right**: Detect from file modifications or ask user
**Why**: Wrong assumptions lead to false positives/negatives
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
When reporting verification results, use the template in `references/output-template.md`.

Include only relevant sections (omit sections that passed successfully on the first try with no changes). For each issue, describe exactly what was observed. For each resolution, explain WHAT was changed and WHY it fixes the root cause.
</output_format>

<quick_reference>
**Command Sequence** (replace `{files}` with actual file paths):

1. `tsc --noEmit` → Must pass (0 errors)
2. `npx eslint --fix {files}` → Must pass (0 errors, 0 warnings)
3. `npx prettier --write {files}` → Should always succeed
4. `npx vitest related run {files}` → Must pass (unless Red phase)

**When to Verify:**

- ✓ After completing a phase (before marking todo complete)
- ✓ Before committing code
- ✓ After modifying 3+ files
- ✓ When user explicitly requests
- ✗ After every single file edit

**Failure Limits:**

- 3 attempts per command → then ask user for help
- Retry only the failed command, not entire sequence

**TDD Quick Guide:**

- **RED**: New tests added, no implementation → failures expected ✓
- **GREEN**: Implementation added after RED → must pass ✓
- **REFACTOR**: Only implementation changed → must pass ✓
- **Uncertain?** → Ask user which phase

**Exit Codes:**

- 0 = Success, continue to next step
- Non-zero = Failure, fix and retry same command

**Special Cases:**

- No tests exist for files → Skip vitest, note in output
- Documentation-only (.md) → Skip verification entirely
- Test files hanging → Kill after 2 minutes, retry once
  </quick_reference>
