# Testing Guide for Ye Olde Artoonist

This document describes the testing infrastructure, patterns, and best practices for the yeoldeartoonist.com project.

## Quick Start

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Debug tests in Node inspector
npm run test:debug
```

## Testing Infrastructure

### Setup

- **Test Runner**: Jest 30.2.0
- **Testing Library**: @testing-library/react 16.3.0 (React Testing Library)
- **Test Environment**: jsdom (for browser API simulation)
- **TypeScript Support**: ts-jest

### Configuration Files

- **jest.config.ts** - Main Jest configuration with:
    - Module name mapping for path aliases (@/, @/components, etc.)
    - Coverage thresholds (70-90% depending on module)
    - setupFilesAfterEnv pointing to test setup
    - jsdom test environment

- \***\*tests**/setup.ts\*\* - Test environment setup with:
    - Jest DOM matchers (@testing-library/jest-dom)
    - Environment variables mocking
    - Next.js router mocks
    - Console error suppression (optional)

- **tsconfig.test.json** - TypeScript configuration specific to tests

## Test Organization

```
__tests__/
├── setup.ts              # Global test setup and mocks
├── mocks/
│   └── supabase.ts       # Supabase client mocks and mock data
├── lib/
│   ├── supabase/
│   │   └── client.test.ts
│   └── db/
│       └── artwork.test.ts
├── components/
│   ├── layout/
│   │   ├── Header.test.tsx
│   │   ├── Navigation.test.tsx
│   │   └── Footer.test.tsx
│   └── ui/
│       ├── Button.test.tsx
│       ├── Input.test.tsx
│       ├── Card.test.tsx
│       ├── Grid.test.tsx
│       └── SocialMediaIcon.test.tsx
└── integration/
    └── home-page.test.tsx
```

## Coverage Goals

Enforced minimum coverage thresholds in jest.config.ts:

- **Global**: 70% (branches, functions, lines, statements)
- **src/lib/**: 85-90% (critical business logic)
- **src/components/**: 80-85% (UI components)

Run `npm run test:coverage` to generate a coverage report and identify untested code.

## Test Patterns

### 1. Component Tests

Test React components using React Testing Library. Focus on user behavior, not implementation details.

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('should handle click events', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button', { name: 'Click me' });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

**Best Practices:**

- Use `screen.getByRole()` for accessibility-first queries
- Use `userEvent` for user interactions (more realistic than fireEvent)
- Test behavior, not CSS classes (unless style is critical)
- Test both happy path and error states

### 2. Database Query Tests

Mock the Supabase client to test database queries without a real database connection.

```typescript
import { getAllArtwork } from '@/lib/db/artwork';
import * as supabaseModule from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js');

describe('getAllArtwork', () => {
    it('should return published artwork', async () => {
        const mockData = [{ id: '1', title: 'Test Art', is_published: true }];
        setupMockChain(mockData);

        const result = await getAllArtwork();

        expect(result.data).toEqual(mockData);
        expect(result.error).toBeNull();
    });
});
```

**Best Practices:**

- Mock Supabase at module level
- Test both success and error cases
- Verify proper filtering (e.g., is_published = true)
- Test pagination and sorting
- Always handle error responses in assertions

### 3. Integration Tests

Test how multiple components or systems work together.

```typescript
describe('Home Page Integration', () => {
  it('should render layout with header, nav, and footer', () => {
    render(
      <Header />
      <Navigation />
      <main>{/* page content */}</main>
      <Footer />
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
```

### 4. Testing Async Components

For async/server components, test the integration with mocked data.

```typescript
describe('Async Page Components', () => {
  it('should handle data fetching pattern', async () => {
    const mockData = await mockDatabaseQuery();

    // Render component with mocked data
    const { container } = render(<PageComponent data={mockData} />);

    expect(screen.getByText(mockData.title)).toBeInTheDocument();
  });
});
```

## Mocking Strategies

### Supabase Client Mocking

Use the mock helpers in `__tests__/mocks/supabase.ts`:

```typescript
import {
    createMockSupabaseClient,
    mockArtworkData,
} from '@/__tests__/mocks/supabase';

// In your test:
const mockClient = createMockSupabaseClient();
jest.mocked(createClient).mockReturnValue(mockClient);
```

### Next.js Router Mocking

Next.js router is mocked in `__tests__/setup.ts`. Use it like:

```typescript
import { useRouter } from 'next/navigation';

describe('Component with Router', () => {
    it('should navigate', () => {
        const router = useRouter();
        router.push('/new-page');
        expect(router.push).toHaveBeenCalledWith('/new-page');
    });
});
```

## Test Data

Mock data factory functions are available in `__tests__/mocks/supabase.ts`:

- `mockArtworkData` - Artwork item
- `mockProjectData` - Project item
- `mockEventData` - Event item
- `mockOrderData` - Order item

Use these for consistent test data:

```typescript
import { mockArtworkData } from '@/__tests__/mocks/supabase';

const testArtwork = { ...mockArtworkData, title: 'Custom Title' };
```

## Writing New Tests (TDD Pattern)

Starting with Phase 3, follow Test-Driven Development:

1. **Red**: Write failing test for new feature
2. **Green**: Write minimal code to pass test
3. **Refactor**: Clean up and optimize

Example workflow for a new component:

```bash
# 1. Create test file
touch src/components/new/NewComponent.test.tsx

# 2. Write failing test
# (edit test file with test cases)

# 3. Run tests in watch mode
npm run test:watch

# 4. Create component to pass tests
# (edit src/components/new/NewComponent.tsx)

# 5. Run tests again - should pass
# (npm run test:watch auto-runs)

# 6. Commit when tests pass
git add .
git commit -m "feat: Add NewComponent with tests"
```

## Debugging Tests

### Debug Single Test

```bash
npm run test:debug -- --testNamePattern="Button click handler"
```

Open `chrome://inspect` in Chrome browser to debug.

### Verbose Output

```bash
npm test -- --verbose
```

### Inspect DOM

Use `screen.debug()` in tests to see rendered HTML:

```typescript
it('should render content', () => {
  render(<MyComponent />);
  screen.debug(); // Prints DOM to console
});
```

## Coverage Analysis

Generate coverage report:

```bash
npm run test:coverage
```

This creates a `coverage/` folder with:

- `coverage/index.html` - Visual coverage report (open in browser)
- Coverage statistics by file and metric

**Improve Coverage:**

1. Open coverage/index.html in browser
2. Click files with low coverage
3. See which lines are untested
4. Add tests for uncovered code paths

## Continuous Integration

Tests run automatically in CI/CD pipeline via GitHub Actions.

**Current setup:**

- Tests run on every pull request
- All tests must pass to merge
- Coverage reports checked against thresholds

**Local verification before pushing:**

```bash
# Full test + coverage check
npm run test:coverage

# Then push only if passing
git push origin your-branch
```

## Common Testing Scenarios

### Testing Form Submission

```typescript
it('should handle form submission', async () => {
  const user = userEvent.setup();
  const handleSubmit = jest.fn();

  render(<Form onSubmit={handleSubmit} />);

  await user.type(screen.getByLabelText('Email'), 'test@example.com');
  await user.click(screen.getByRole('button', { name: 'Submit' }));

  expect(handleSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
  });
});
```

### Testing Conditional Rendering

```typescript
it('should show error message on error state', () => {
  render(<Component error="Something went wrong" />);

  expect(screen.getByText('Something went wrong')).toBeInTheDocument();
});

it('should hide error message on success', () => {
  render(<Component error={null} />);

  expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
});
```

### Testing Navigation Links

```typescript
it('should have correct navigation links', () => {
  render(<Navigation />);

  expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
    'href',
    '/'
  );
  expect(screen.getByRole('link', { name: 'Gallery' })).toHaveAttribute(
    'href',
    '/gallery'
  );
});
```

## Accessibility Testing

Always test with accessibility in mind:

```typescript
it('should be keyboard navigable', async () => {
  const user = userEvent.setup();
  render(<Button>Click me</Button>);

  const button = screen.getByRole('button');
  await user.tab(); // Tab to button
  expect(button).toHaveFocus();

  await user.keyboard('{Enter}'); // Activate with Enter
  expect(handleClick).toHaveBeenCalled();
});
```

## Troubleshooting

### "Cannot find module '@/...'"

Ensure path aliases in jest.config.ts match tsconfig.json.

### "Warning: ReactDOM.render"

This is suppressed in setup.ts for older React warnings. Safe to ignore.

### "act() warning"

Wrap state updates in act():

```typescript
import { act } from 'react-dom/test-utils';

it('should update state', async () => {
  const { rerender } = render(<Component />);

  await act(async () => {
    // State-changing code here
  });

  rerender(<Component />);
});
```

### Tests running slowly

Check for:

- Missing mocks (network requests)
- Too many database queries in tests
- Large test data sets

Optimize by:

- Using smaller mock data
- Mocking external APIs
- Splitting large test files

## Resources

- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Docs](https://jestjs.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Accessibility Testing](https://www.w3.org/WAI/test-evaluate/)

## Phase 3+ TDD Commitment

All Phase 3 and beyond features include comprehensive tests:

- Unit tests for utility functions
- Component tests for all UI components
- Integration tests for user flows
- Coverage thresholds maintained at >80%
- Tests written BEFORE implementation (TDD)

This ensures code quality, maintainability, and confidence in refactoring.
