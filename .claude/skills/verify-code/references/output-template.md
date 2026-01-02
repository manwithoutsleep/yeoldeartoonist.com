# Verification Output Template

Use this template when reporting verification results:

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

## Guidelines

- Include only sections that are relevant (omit sections with no issues)
- For each issue, describe exactly what you observed
- For each resolution, explain WHAT you changed and WHY it fixes the root cause
- Final verification should confirm the fix works and doesn't introduce new problems
