# Testing the Artwork Database Queries

This document explains how the artwork database query tests are organized and how to run them.

## Overview

The artwork database tests (`src/lib/db/artwork.ts`) are split into two separate test files:

### 1. **Unit Tests** (`__tests__/lib/db/artwork.unit.test.ts`)

- **Purpose**: Verify function exports, signatures, and basic structure
- **Dependencies**: None (no external services required)
- **Runtime**: ~9 seconds
- **When to use**: Always safe to run, no setup required

Tests include:

- Function exports validation
- Function signatures (parameter counts)
- Return type verification (Promise)
- Query filtering patterns (code inspection)
- Return value structure documentation

### 2. **Integration Tests** (`__tests__/lib/db/artwork.integration.test.ts`)

- **Purpose**: Test actual error handling, edge cases, and behavior with real Supabase
- **Dependencies**: Supabase connection (local or remote)
- **Runtime**: ~12 seconds
- **When to use**: After setting up Supabase

Tests include:

- Error structure validation
- Error code validation
- User-friendly error messages
- Development vs. production error handling
- Edge case parameter handling
- Data/error mutual exclusivity
- Array type validation

## Running Tests

### Run All Unit Tests (No Supabase Required)

```bash
npm test -- __tests__/lib/db/artwork.unit.test.ts
```

### Run All Integration Tests (Requires Supabase)

```bash
npm test -- __tests__/lib/db/artwork.integration.test.ts
```

### Run Both Test Suites

```bash
npm test -- __tests__/lib/db/artwork
```

### Run with Coverage Report

```bash
npm test -- __tests__/lib/db/artwork.unit.test.ts --coverage --collectCoverageFrom="src/lib/db/artwork.ts"
```

## Setting Up Supabase for Integration Tests

### Option 1: Local Supabase (Recommended for Development)

1. **Start local Supabase instance**:

    ```bash
    npm run db:start
    ```

2. **Run integration tests**:
    ```bash
    npm test -- __tests__/lib/db/artwork.integration.test.ts
    ```

The local Supabase instance automatically sets the required environment variables.

### Option 2: Remote Supabase

1. **Set environment variables** in `.env.local`:

    ```
    NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
    ```

2. **Run integration tests**:
    ```bash
    npm test -- __tests__/lib/db/artwork.integration.test.ts
    ```

### What Happens if Supabase is Unavailable?

Integration tests **automatically skip** if Supabase is not available:

- No environment variables configured
- Supabase server is not running
- Network is unreachable

A helpful message is logged explaining how to configure Supabase:

```
ℹ️  Integration tests skipped - Supabase not configured
   To run integration tests, either:
   1. Run: npm run db:start
   2. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Test Structure

### Unit Tests Structure

```
describe('Artwork Database Queries - Unit Tests')
├── function exports (4 tests)
├── function signatures (4 tests)
├── return types (4 tests)
├── query filtering patterns (3 tests)
├── return value structure (5 tests)
└── error handling documentation (1 test)
```

### Integration Tests Structure

```
describe('Artwork Database Queries - Integration Tests')
├── Supabase integration tests (skipped if not available)
│   ├── error structure validation (6 tests)
│   ├── environment-based error details (3 tests)
│   ├── edge case handling (9 tests)
│   └── success paths (2 tests)
└── Supabase availability check (1 test)
```

## Test Coverage

### Unit Tests Coverage

- **100% functions**: All 4 query functions are tested
- **No line coverage**: Unit tests only verify structure, not execution paths

### Integration Tests Coverage

- **64.7% statements**: Covers error paths, edge cases, and partial success paths
- **31.4% branches**: Tests both success and error code branches
- **100% functions**: All 4 query functions are tested

### Why Some Lines Are Uncovered

Lines **50, 96, 142, 185** are success return paths:

```typescript
return { data, error: null }; // These lines are uncovered
```

Lines **51-63, 97-110, 143-155, 186-199** are error handling catch blocks:

```typescript
} catch (err) {
    console.error('query failed:', err);
    return { ... };  // Some lines here are uncovered
}
```

**Why**:

- Success paths require published artwork in the database
- Some error paths require exceptions to be thrown

**Current Status**:

- ✅ Error structure validation tests - fully tested
- ✅ Edge case parameter handling - fully tested
- ✅ Success path logic - tested structurally (ready to execute when data exists)
- ⚠️ Success path execution - blocked by empty database
- ⚠️ Exception handling - requires artificially triggered errors

**To Improve Coverage**:

1. **Seed test data**: Insert published artwork into Supabase before running tests

    ```bash
    npm run db:start
    # Then insert test artwork with is_published=true
    npm test -- __tests__/lib/db/artwork
    ```

2. **Mock Supabase exceptions**: Create tests that trigger exception paths
    - Currently not done because integration tests use real Supabase calls

**Future Improvements**:

- Add database seeding script for test data
- Create E2E tests that verify success paths with seeded data
- Add optional exception injection tests for error paths

## Deprecated Test File

The original `__tests__/lib/db/artwork.test.ts` has been deprecated and will be removed in a future release. It contains both unit and integration tests mixed together.

**Current status**: Kept for backward compatibility
**Action required**: Update any test runner configurations to use the new files instead

## Environment Variables

Integration tests check for these environment variables:

```typescript
const isSupabaseAvailable = (): boolean => {
    return (
        !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
};
```

If **both** are present, integration tests run. Otherwise, they're skipped.

## Best Practices

### For CI/CD Pipelines

1. **Run unit tests always**:

    ```bash
    npm test -- __tests__/lib/db/artwork.unit.test.ts
    ```

2. **Run integration tests only if Supabase is available**:
    ```bash
    # Only runs if Supabase is configured
    npm test -- __tests__/lib/db/artwork.integration.test.ts
    ```

### For Local Development

1. **Start Supabase**:

    ```bash
    npm run db:start
    ```

2. **Run both test suites**:

    ```bash
    npm test -- __tests__/lib/db/artwork
    ```

3. **Watch mode for TDD**:
    ```bash
    npm test -- __tests__/lib/db/artwork --watch
    ```

## Troubleshooting

### Tests Fail with "Cannot find module '@supabase/supabase-js'"

**Solution**: Run `npm install` to ensure all dependencies are installed

### Integration Tests Are Skipped

**Expected behavior** if Supabase is not configured. To fix:

1. Run `npm run db:start`, OR
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`

### Getting Permission Denied Errors

**Possible causes**:

- Supabase RLS policies are blocking the query
- Anon key doesn't have permission to read artwork
- Published status filter is too restrictive

**Solution**: Check Supabase RLS policies in the dashboard and ensure `is_published=true` artwork exists

### Tests Timeout

**Possible causes**:

- Supabase server is slow or unreachable
- Network timeout

**Solution**:

1. Verify Supabase is running: `npm run db:start`
2. Check network connectivity
3. Increase Jest timeout in `jest.config.ts`

## Further Reading

- [Artwork Database Queries](../src/lib/db/artwork.ts)
- [Project CLAUDE.md](../CLAUDE.md) - Database and testing setup
- [Jest Documentation](https://jestjs.io/)
- [Supabase Testing Guide](https://supabase.com/docs/guides/testing)
