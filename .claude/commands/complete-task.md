---
argument-hint: [spec-name] [issue-id]
description: Mark the task complete then commit all changes
---

<purpose>
    Finalize the work we've just completed and commit the changes.
</purpose>

<instructions>
    <instruction>Update {{spec-name}} to mark all items in {{issue-id}} as complete</instruction>
    <instruction>Commit all outstanding changes with a comprehensive commit message.</instruction>
    <instruction>Do not skip the pre-commit hook! In other words, do not use the `--no-verify` flag during the commit.</instruction>
    <instruction>If the pre-commit hook surfaces issues, STOP and ask me how to proceed.</instruction>
</instructions>

<example-outputs>
<example-output>
I've found Issue #3: "Add magic link email template" in specs/auth-refactor.md.

First, let me mark all steps of Issue #3 complete...
[Creates test file with failing tests]

Now I'll commit all outstanding changes to the repo...
[Adds oustanding changes]
[Commits changes, allowing the pre-commit hook to run]

I've marked Issue #3 as completed in specs/auth-refactor.md and committed all outstanding changes.
</example-output>

<example-output>
I've found Issue #3: "Add magic link email template" in specs/auth-refactor.md.

First, let me mark all steps of Issue #3 complete...
[Creates test file with failing tests]

Now I'll commit all outstanding changes to the repo...
[Adds oustanding changes]
[Pre-commit hook reports linting issues]

I notice the pre-commit hook has surfaced linting issues. How would you like to proceed?

1. Fix the linting issues and try again.
2. Run the commit with the `--no-verify` flag to ignore the linting issues.
3. Something else?

</example-output>
</example-outputs>

<content>
    {{content}}
</content>
