<objective>
Thoroughly analyze the test suite to identify and implement performance optimizations that reduce test execution time from 3-5 minutes to under 1 minute, without sacrificing test quality or coverage.

The goal is to improve developer experience by providing faster feedback loops during local development, making the test suite more efficient through strategic optimizations rather than cutting corners.
</objective>

<context>
This is a Next.js 16 application using Vitest as the test runner, with React Testing Library for component tests. The current test suite takes 3-5 minutes to complete, which slows down development iteration cycles.

Test suite details:

- Test runner: Vitest with coverage via @vitest/coverage-v8
- Test types: Unit tests, component tests, integration tests (database)
- Pre-commit hook runs `vitest related --run` on changed files
- Full test suite runs via `npm test` (vitest run)

Read @CLAUDE.md for project conventions and test patterns.
</context>

<research_phase>
Before making any changes, thoroughly investigate the current test suite to understand:

1. **Test inventory and timing**:
    - Use Glob to find all test files: `**/__tests__/**/*.test.{ts,tsx}` and `**/*.test.{ts,tsx}`
    - Analyze the test file structure and count of tests by type (unit, component, integration)
    - Run tests with timing output to identify slowest tests: `!npm test -- --reporter=verbose`

2. **Common performance bottlenecks**:
    - Redundant test setup/teardown (especially database operations)
    - Repeated identical test scenarios across multiple files
    - Heavy component mounting without cleanup
    - Database connection overhead in integration tests
    - Inefficient mocking or test data generation
    - Sequential tests that could run in parallel
    - Unnecessary async operations or delays

3. **Configuration analysis**:
    - Review @vitest.config.ts (or similar) for current Vitest configuration
    - Check for pooling, threading, or parallelization settings
    - Identify if there are any test isolation issues forcing sequential execution

4. **Caching opportunities**:
    - Test fixtures or data that could be cached between runs
    - Database schema setup that could be reused
    - Mock data generators that could be memoized

</research_phase>

<analysis_requirements>
For each potential optimization, evaluate:

1. **Impact**: How much time could this save? (estimate in seconds)
2. **Risk**: Could this affect test reliability or coverage?
3. **Effort**: How complex is the implementation?
4. **Trade-offs**: What are we giving up, if anything?

Categorize findings into:

- **Quick wins**: Low effort, high impact, no risk (implement these immediately)
- **Strategic improvements**: Medium effort, high impact, low risk (recommend with plan)
- **Not recommended**: High risk to quality/coverage or minimal impact

</analysis_requirements>

<optimization_strategies>
Consider these optimization approaches (only implement if analysis shows they apply):

1. **Remove redundancy**:
    - Identify duplicate or overlapping test coverage
    - Consolidate tests that verify the same behavior
    - Remove tests that provide no additional value

2. **Optimize test setup**:
    - Use `beforeAll` instead of `beforeEach` where safe
    - Share expensive setup across tests in the same file
    - Lazy-load test dependencies
    - Use in-memory databases instead of real connections where appropriate

3. **Improve test isolation efficiency**:
    - Batch database operations in test setup
    - Reuse database schemas, reset data only
    - Use transaction rollbacks instead of full cleanup

4. **Enable better parallelization**:
    - Configure Vitest threading/pooling optimally
    - Ensure tests are truly isolated (no shared state issues)
    - Use file-level parallelization effectively

5. **Reduce unnecessary work**:
    - Mock external dependencies more aggressively
    - Avoid full component renders when shallow rendering suffices
    - Skip expensive computations in test setup when not needed
    - Use `vi.mock` at module level instead of per-test when possible

6. **Add strategic caching**:
    - Cache compiled test fixtures
    - Reuse test database schemas
    - Memoize expensive mock data generation

</optimization_strategies>

<implementation>
After analysis, implement optimizations in priority order:

1. Start with quick wins that have zero risk
2. Document all changes with comments explaining the optimization
3. Run tests after each change to verify no regressions
4. Measure impact of each optimization (before/after timing)

For any test modifications:

- Preserve all assertions and coverage
- Maintain test readability and maintainability
- Add comments explaining why the optimization is safe
- Update test setup patterns to be more efficient

For configuration changes:

- Update @vitest.config.ts with optimal settings
- Document why each setting improves performance
- Ensure CI/CD pipeline benefits from the same optimizations

</implementation>

<output>
Create a comprehensive analysis document:

- `./.prompts/004-test-optimization-analysis.md` - Detailed findings, recommendations, and implementation log

The analysis should include:

1. **Executive Summary**: Current state, target state, recommended approach
2. **Timing Breakdown**: Before/after metrics for overall suite and key test files
3. **Optimizations Implemented**: What was changed and why, with impact measurements
4. **Optimizations Recommended**: Strategic improvements for future consideration
5. **Rejected Optimizations**: What was considered but not implemented, and why
6. **Verification**: Proof that coverage and quality remain unchanged

After implementation, run the full test suite and document:

- Total execution time (before vs after)
- Coverage percentage (must be maintained or improved)
- Number of tests passing (must remain 100%)

</output>

<success_criteria>
The optimization is successful when:

- Test suite execution time is reduced by at least 60% (from 3-5 minutes to under 2 minutes)
- All tests continue to pass (100% pass rate)
- Code coverage percentage is maintained or improved
- No test quality is sacrificed (assertions, edge cases, isolation)
- Changes are documented and maintainable
- Both local development and CI/CD benefit from optimizations

</success_criteria>

<verification>
Before declaring complete, verify:

- Run `!npm test` and confirm new execution time is significantly faster
- Run `!npm run test:coverage` and confirm coverage is maintained
- Check that `!npm run lint` still passes
- Verify that `!npx tsc --noEmit` shows no type errors
- Format all files with `!npx prettier --write`
- Test the pre-commit hook to ensure it still works efficiently
- Confirm all optimizations are documented with rationale

</verification>

<constraints>
NEVER compromise on:

- Test coverage percentage
- Test assertion quality or thoroughness
- Edge case coverage
- Test isolation and reliability
- Ability to catch real bugs

DO NOT:

- Skip tests or reduce test scope
- Remove assertions to make tests faster
- Disable coverage tracking
- Introduce flaky tests or race conditions
- Make tests less maintainable for speed gains

</constraints>
