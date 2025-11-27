---
description: Generate a comprehensive commit message for all outstanding changes
allowed-tools:
    [Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git branch:*)]
---

<objective>
Generate a comprehensive, well-structured commit message that accurately describes all outstanding changes in the repository.

This helps maintain clear git history by analyzing staged/unstaged changes, following repository conventions, and crafting meaningful commit messages that explain the "why" rather than just the "what".
</objective>

<context>
Current branch: !`git branch --show-current`

Git status: !`git status`

Staged changes: !`git diff --cached`

Unstaged changes: !`git diff`

Recent commit messages (for style reference): !`git log --oneline -10`

Full recent commits (for context): !`git log -5 --pretty=format:"%h - %s%n%b"`
</context>

<process>
1. Analyze all staged and unstaged changes from the git status and diffs
2. Identify the nature of changes (new feature, bug fix, refactor, docs, test, etc.)
3. Review recent commit messages to understand repository commit message style and conventions
4. Group related changes into logical categories
5. Draft a comprehensive commit message with:
   - Concise summary line (50-72 chars) focusing on "why" not "what"
   - Blank line
   - Detailed body explaining:
     - What changed and why
     - Key implementation details if relevant
     - Any breaking changes or important notes
   - Standard footer with Claude Code attribution:
     ```
     🤖 Generated with [Claude Code](https://claude.com/claude-code)

     Co-Authored-By: Claude <noreply@anthropic.com>
     ```

6. Present the commit message to the user for review
   </process>

<output>
A formatted commit message ready to use with `git commit -m` or `git commit -F`, structured as:

```
<type>: <concise summary of changes>

<detailed explanation of what changed and why>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

</output>

<success_criteria>

- All staged and unstaged changes are accounted for in the message
- Commit type accurately reflects the nature of changes
- Summary line is concise (50-72 characters) and meaningful
- Body explains the "why" behind changes, not just the "what"
- Message follows repository commit conventions based on recent history
- Standard Claude Code footer is included
- Message is ready to use without further editing
  </success_criteria>
