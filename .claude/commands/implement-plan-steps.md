---
description: Implement a finalized plan step-by-step
allowed-tools: Task, Skill(verify-code)
argument-hint: [spec-name] [notes]
---

<purpose>
Implement an implementation plan by sequentially delegating steps to specialized subagents, passing context between steps, while maintaining code quality, security, and testing standards.
</purpose>

<workflow>
<step>Read the entire implementation plan in {{spec-name}} to understand the full context and overall goals</step>
<step>Parse the spec file to identify all implementation steps (typically marked as "Step 0:", "Step 1:", etc.)</step>
<step>For each step in sequence:
  <substep>Create a subagent using the Task tool with subagent_type="general-purpose"</substep>
  <substep>Provide the subagent with:
    - The full spec file context
    - The specific step to implement
    - Any context returned from previous steps
    - All quality standards and instructions below
  </substep>
  <substep>Wait for the subagent to complete the step and return results</substep>
  <substep>Collect relevant context from the completed step (files modified, decisions made, issues encountered)</substep>
  <substep>Pass this accumulated context to the next subagent</substep>
</step>
<step>After all steps are complete, use the verify-code skill to ensure overall code quality</step>
<step>Before committing changes, pause to allow human testing of the work locally</step>
<step>When all tasks are complete, mark the implementation as completed in the original {{spec-name}} file</step>
</workflow>

<subagent-instructions>
These instructions apply to each subagent working on individual steps:

<instruction>Focus strictly on the assigned step - do NOT expand scope or work on other steps</instruction>
<instruction>If any requirements are unclear or ambiguous, pause and ask for clarification before proceeding</instruction>
<instruction>Follow TDD approach: write tests first (red), implement functionality (green), then refactor while keeping tests passing</instruction>
<instruction>Include comprehensive error handling with specific error types and detailed logging with context</instruction>
<instruction>Add JSDoc/docstring documentation for all public functions and complex logic</instruction>
<instruction>Ensure code follows SOLID principles, uses meaningful abstractions, and maintains clear domain boundaries</instruction>
<instruction>Design for future extensibility - use interfaces, avoid hard-coded dependencies, and create extension points without over-engineering</instruction>
<instruction>Design for failure - assume external calls can fail and implement graceful fallbacks</instruction>
<instruction>Maintain OWASP top 10 compliance and follow the principle of least privilege</instruction>
<instruction>Run the verification commands specified in the step (TypeScript, ESLint, Prettier, tests)</instruction>
<instruction>Return a summary of: files modified, key decisions made, any issues encountered, and context needed for subsequent steps</instruction>
<instruction>Consider the accumulated context from previous steps when making implementation decisions</instruction>
</subagent-instructions>

<context-to-pass>
When delegating to each subagent, include:
- The full spec file path and content
- The specific step number and description to implement
- Accumulated context from all previous steps (files modified, types created, patterns established)
- Any additional notes: {{notes}}
</context-to-pass>

<example-outputs>
<example-output>
I've read the implementation plan in .specs/2026-01-08T15-48-43-claude-issue-65.md. The plan contains 15 steps.

I'll now delegate each step to a specialized subagent in sequence:

**Step 0: Create Feature Branch**
Delegating to subagent...
✓ Subagent completed: Created branch 'issue-65'

**Step 1: Write Tests for Enhanced Database Query (TDD Red Phase)**
Delegating to subagent...
Context from previous steps: Branch 'issue-65' created
✓ Subagent completed: Created test file with failing tests
Files modified: **tests**/lib/db/admin/orders.test.ts

**Step 2: Update TypeScript Types (TDD Green Phase - Part 1)**
Delegating to subagent...
Context from previous steps: Test file created with failing tests for OrderItemWithArtwork and OrderWithItemsAndArtwork types
✓ Subagent completed: Added new TypeScript interfaces
Files modified: src/lib/db/admin/orders.ts

**Step 3: Enhance Database Query Function (TDD Green Phase - Part 2)**
Delegating to subagent...
Context from previous steps: Types defined - OrderItemWithArtwork includes nullable artwork field with title, sku, image_thumbnail_url, slug
✓ Subagent completed: Modified getOrderById to include artwork join, all tests passing
Files modified: src/lib/db/admin/orders.ts

[... continues through all 15 steps ...]

**Final Verification**
Running verify-code skill...
✓ All checks passed (TypeScript, ESLint, Prettier, tests)

The implementation is complete and ready for local testing. Once you've verified it works as expected, I'll mark the work as completed in .specs/2026-01-08T15-48-43-claude-issue-65.md.
</example-output>

<example-output>
I've reviewed the implementation plan in .specs/dashboard-redesign.md. However, the plan mentions "improved user experience" without specific requirements.

Before I proceed with delegating to subagents, could you clarify:

1. What specific UX improvements are expected?
2. Are there design mockups or wireframes I should reference?
3. Are there specific user pain points this should address?

This will help ensure the subagents implement exactly what's needed without scope creep.
</example-output>

<example-output>
I've completed the step-by-step implementation of the plan from .specs/security-audit.md using 8 specialized subagents.

Summary of changes across all steps:

- Added RLS policies for customer and participant photo access (Steps 1-3)
- Created comprehensive test coverage (Steps 4-5)
- All tests passing (12/12)
- ESLint: no errors or warnings
- TypeScript: no type errors
- All verification commands passed at each step

Files modified:

- src/lib/db/policies.sql
- **tests**/lib/db/policies.test.ts
- src/app/api/photos/route.ts

The code is ready for your local testing. Please verify:

1. Customers can access their own interview photos
2. Participants can access photos from their interviews
3. Unauthorized users cannot access any photos

Once confirmed, I'll mark the work as completed in the spec file.
</example-output>
</example-outputs>

<content>
You are the coordinator for implementing: {{spec-name}}

Your role:

1. Parse the spec file to identify all implementation steps
2. Delegate each step sequentially to a subagent via the Task tool
3. Collect and pass context between subagents
4. Ensure all quality standards are met
5. Run final verification using the verify-code skill
6. Pause before committing to allow human testing

Additional context to consider: {{notes}}

Begin by reading {{spec-name}} and identifying all steps to coordinate.
</content>
