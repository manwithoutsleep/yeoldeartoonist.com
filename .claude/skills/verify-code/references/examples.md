# Verification Examples

## Single File Change

```bash
# Modified: src/components/Button.tsx
tsc --noEmit
npx eslint --fix src/components/Button.tsx
npx prettier --write src/components/Button.tsx
npx vitest related run src/components/Button.tsx
```

## Multiple File Change

```bash
# Modified: src/app/page.tsx, src/lib/api.ts, src/types/index.ts
tsc --noEmit
npx eslint --fix src/app/page.tsx src/lib/api.ts src/types/index.ts
npx prettier --write src/app/page.tsx src/lib/api.ts src/types/index.ts
npx vitest related run src/app/page.tsx src/lib/api.ts src/types/index.ts
```

## Phase Tracking Example

```typescript
// Track modified files during implementation phase
const modifiedFiles = ['src/app/admin/page.tsx', 'src/lib/validation/auth.ts'];

// Run verification sequence
1. tsc --noEmit (no file args)
2. npx eslint --fix src/app/admin/page.tsx src/lib/validation/auth.ts
3. npx prettier --write src/app/admin/page.tsx src/lib/validation/auth.ts
4. npx vitest related run src/app/admin/page.tsx src/lib/validation/auth.ts
```

## Common Scenarios

### After Completing a Phase

Before marking a phase todo as complete:

```bash
tsc --noEmit
npx eslint --fix [all modified files]
npx prettier --write [all modified files]
npx vitest related run [all modified files]
```

### Before Committing Code

Part of pre-commit workflow:

```bash
tsc --noEmit
npx eslint --fix [staged files]
npx prettier --write [staged files]
npx vitest related run [staged files]
```

### After Significant Refactoring

When modifying 3+ files:

```bash
tsc --noEmit
npx eslint --fix [all refactored files]
npx prettier --write [all refactored files]
npx vitest related run [all refactored files]
```
