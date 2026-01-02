---
description: Implement a finalized plan
allowed-tools: Skill(verify-code)
argument-hint: [spec-name] [notes]
---

<purpose>
Implement an implementation plan while maintaining code quality, security, and testing standards.
</purpose>

<instructions>
<instruction>Read the entire implementation plan in {{spec-name}} to understand the full context and overall goals</instruction>
<instruction>Limit your work strictly to the specified implementation plan - do NOT expand scope or move on to other issues in the document</instruction>
<instruction>If any requirements are unclear or ambiguous, pause and ask for clarification before proceeding</instruction>
<instruction>Follow TDD approach: write tests first (red), implement functionality (green), then refactor while keeping tests passing</instruction>
<instruction>Include comprehensive error handling with specific error types and detailed logging with context</instruction>
<instruction>Add JSDoc/docstring documentation for all public functions and complex logic</instruction>
<instruction>Ensure code follows SOLID principles, uses meaningful abstractions, and maintains clear domain boundaries</instruction>
<instruction>Design for future extensibility - use interfaces, avoid hard-coded dependencies, and create extension points without over-engineering</instruction>
<instruction>Design for failure - assume external calls can fail and implement graceful fallbacks</instruction>
<instruction>Maintain OWASP top 10 compliance and follow the principle of least privilege</instruction>
<instruction>After implementation, use the verify-code skill to ensure TypeScript, linting, formatting, and testing issues are identified and resolved. This ensures code quality and prevents accumulation of technical debt.</instruction>
<instruction>Before committing changes, pause to allow human testing of the work locally</instruction>
<instruction>When the task is complete, mark it as completed in the original {{spec-name}} file</instruction>
<instruction>Consider these additional context notes: {{notes}}</instruction>
</instructions>

<example-outputs>
<example-output>
I've read the implementation plan in specs/auth-refactor.md. I'll now implement it as specified.

First, let me write tests for the email template functionality...
[Creates test file with failing tests]

Now implementing the email template component...
[Implements functionality]

Running tests and linting checks...
[Verifies all tests pass and code meets quality standards]

The implementation is complete and ready for local testing. Once you've verified it works as expected, I'll mark the work as completed in specs/auth-refactor.md.
</example-output>

<example-output>
I've reviewed the implementation plan in specs/dashboard-redesign.md. However, the plan mentions "improved user experience" without specific requirements.

Before I proceed, could you clarify:

1. What specific UX improvements are expected?
2. Are there design mockups or wireframes I should reference?
3. Are there specific user pain points this should address?

This will help ensure I implement exactly what's needed without scope creep.
</example-output>

<example-output>
I've completed the implementation of the plan from specs/security-audit.md.

Summary of changes:

- Added RLS policies for customer and participant photo access
- Created tests covering both authorized and unauthorized access scenarios
- All tests passing (12/12)
- ESLint: no errors or warnings
- TypeScript: no type errors

The code is ready for your local testing. Please verify:

1. Customers can access their own interview photos
2. Participants can access photos from their interviews
3. Unauthorized users cannot access any photos

Once confirmed, I'll mark the work as completed in the spec file.
</example-output>
</example-outputs>

<content>
Implementation task: The work defined in {{spec-name}}

Additional context: {{notes}}
</content>
