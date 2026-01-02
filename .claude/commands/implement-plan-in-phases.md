---
argument-hint: [spec-name] [notes]
allowed-tools: Skill(verify-code)
description: Implement a finalized plan
---

<purpose>
Implement an implementation plan while maintaining code quality, security, and testing standards.
</purpose>

<instructions>
<instruction>Read the entire implementation plan in {{spec-name}} to understand the full context and overall goals</instruction>
<instruction>Identify all distinct phases in the specification. Look for:
    - Sections explicitly labeled as "Phase", "Step", "Task", or numbered sections
    - Natural breakpoints in the implementation (e.g., separate features, modules, or components)
    - Logical groupings that can be implemented, verified, and tested independently
    - Each phase should be appropriately sized for one iteration of implementation and verification
</instruction>
<instruction>Create a todo list with all identified phases to track progress throughout the implementation</instruction>
<instruction>Limit your work strictly to the specified implementation plan - do NOT expand scope or move on to other issues in the document</instruction>
<instruction>If any requirements are unclear or ambiguous, pause and ask for clarification before proceeding</instruction>
<instruction>
    For each phase, follow this iterative process:

    <phase_implementation>
        <step>Mark the current phase as in_progress in your todo list</step>
        <step>Follow TDD approach for this phase: write tests first (red), implement functionality (green), then refactor while keeping tests passing</step>
        <step>Include comprehensive error handling with specific error types and detailed logging with context</step>
        <step>Add JSDoc/docstring documentation for all public functions and complex logic</step>
        <step>Ensure code follows SOLID principles, uses meaningful abstractions, and maintains clear domain boundaries</step>
        <step>Design for future extensibility - use interfaces, avoid hard-coded dependencies, and create extension points without over-engineering</step>
        <step>Design for failure - assume external calls can fail and implement graceful fallbacks</step>
        <step>Maintain OWASP top 10 compliance and follow the principle of least privilege</step>
        <step>After completing the phase implementation, run the verification procedure (detailed below)</step>
        <step>Only after ALL verifications pass, mark the phase as completed in your todo list</step>
        <step>Proceed to the next phase and repeat this process</step>
    </phase_implementation>

    <verification_procedure>After implementation, use the verify-code skill to ensure TypeScript, linting, formatting, and testing issues are identified and resolved. This ensures code quality and prevents accumulation of technical debt.</verification_procedure>

</instruction>
<instruction>After all phases are complete, pause to allow human testing of the work locally before committing</instruction>
<instruction>When all tasks are complete and tested, mark the entire plan as completed in the original {{spec-name}} file</instruction>
<instruction>Consider these additional context notes: {{notes}}</instruction>
</instructions>

<example-outputs>
<example-output>
I've read the implementation plan in specs/auth-refactor.md and identified 3 phases:

Phase 1: Email template component
Phase 2: Password reset flow
Phase 3: Email integration testing

I'll now implement these phases one at a time with verification after each.

**Phase 1: Email template component**

Writing tests for the email template functionality...
[Creates test file with failing tests]

Implementing the email template component...
[Implements functionality]

Running verification for Phase 1:

- TypeScript: ✓ No errors
- ESLint: ✓ No errors or warnings
- Prettier: ✓ Formatted
- Tests: ✓ All tests passing (8/8)

Phase 1 complete. Moving to Phase 2...

[Continues with remaining phases]

All phases complete. The implementation is ready for local testing. Once you've verified it works as expected, I'll mark the work as completed in specs/auth-refactor.md.
</example-output>

<example-output>
I've reviewed the implementation plan in specs/dashboard-redesign.md. However, the plan mentions "improved user experience" without specific requirements.

Before I proceed, could you clarify:

1. What specific UX improvements are expected?
2. Are there design mockups or wireframes I should reference?
3. Are there specific user pain points this should address?

This will help ensure I implement exactly what's needed without scope creep, and allow me to properly break the work into phases.
</example-output>

<example-output>
I've read specs/security-audit.md and identified 2 phases:

Phase 1: RLS policies for customer photo access
Phase 2: RLS policies for participant photo access

**Phase 1: Customer photo access**

Writing tests for customer photo access...
[Creates tests]

Implementing RLS policies...
[Implements policies]

Running verification for Phase 1:

- TypeScript: ✓ No errors
- ESLint: ✓ No errors or warnings
- Prettier: ✓ Formatted
- Tests: ✓ All tests passing (6/6)

Phase 1 complete. Moving to Phase 2...

**Phase 2: Participant photo access**

[Similar process]

Running verification for Phase 2:

- TypeScript: ✓ No errors
- ESLint: ✓ No errors or warnings
- Prettier: ✓ Formatted
- Tests: ✓ All tests passing (6/6)

All phases complete. Summary:

- Added RLS policies for customer and participant photo access
- Created tests covering both authorized and unauthorized access scenarios
- All tests passing (12/12)
- All verification checks passed for both phases

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
