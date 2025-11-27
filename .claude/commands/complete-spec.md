---
description: Mark spec as complete and commit all changes with pre-commit validation
argument-hint: [spec-name]
allowed-tools:
    [
        Read,
        Edit,
        Bash(git status:*),
        Bash(git diff:*),
        Bash(git add:*),
        Bash(git commit:*),
        Bash(git log:*),
    ]
---

<context>
Current git status: !`git status`
Staged changes: !`git diff --cached`
Unstaged changes: !`git diff`
</context>

<objective>
Mark the spec file $ARGUMENTS as complete and commit all outstanding changes with a comprehensive commit message.
</objective>

<process>
1. Read the spec file $ARGUMENTS to understand its current state
2. Update the spec file to mark all items/tasks as complete
3. Review all outstanding changes using git status and diff
4. Stage all relevant changes with git add
5. Create a comprehensive commit message that describes what was completed
6. Run git commit (allowing the pre-commit hook to run - DO NOT use --no-verify)
7. If the pre-commit hook surfaces issues (linting, formatting, test failures), STOP and ask the user how to proceed
8. Verify the commit was created successfully with git log
</process>

<verification>
Before completing, verify:
- Spec file $ARGUMENTS has been updated with completion status
- Git status shows a clean working tree or only expected uncommitted files
- A new commit was created (check git log)
- Pre-commit hook passed OR user provided explicit direction on how to handle failures
</verification>

<success_criteria>

- Spec file marked as complete
- All changes committed with descriptive message
- Pre-commit hook passed OR user consulted on failures and direction provided
- Git history shows new commit
  </success_criteria>

<examples>
Example 1 - Success path:
User: /complete-spec .specs/auth-refactor.md
Assistant: I'll mark .specs/auth-refactor.md as complete and commit the changes.
[Reads spec, updates completion status, stages changes, commits]
Result: Spec marked complete and committed successfully.

Example 2 - Pre-commit hook failure:
User: /complete-spec .specs/payment-integration.md
Assistant: I'll mark .specs/payment-integration.md as complete and commit the changes.
[Reads spec, updates completion status, stages changes, attempts commit]
[Pre-commit hook reports ESLint errors]
Assistant: The pre-commit hook has surfaced linting issues. How would you like to proceed?

1. Fix the linting issues and retry the commit
2. Skip the pre-commit hook with --no-verify (not recommended)
3. Something else?
   </examples>
