---
description: Run automated code quality verification (TypeScript, ESLint, Prettier, Vitest)
argument-hint: [optional: file paths to verify]
allowed-tools: Skill(verify-code)
---

<objective>
Delegate code quality verification to the verify-code skill for: $ARGUMENTS

This routes to specialized skill containing verification workflows, TDD phase
detection, and failure handling patterns.
</objective>

<process>
1. Use Skill tool to invoke verify-code skill
2. Pass user's request: $ARGUMENTS
3. Let skill handle verification workflow
</process>

<success_criteria>

- Skill successfully invoked
- Arguments passed correctly to skill
- Verification workflow executes
- Output is displayed to the user </success_criteria>
