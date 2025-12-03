<objective>
Create a comprehensive commit for all outstanding changes in the current branch (phase-4-cart). The commit message should accurately summarize the scope and purpose of changes, following the repository's commit message conventions observed in recent history.
</objective>

<context>
Current branch: phase-4-cart
Main branch: main

This commit will capture work related to Phase 4 of the project (cart and checkout functionality). The repository follows a structured commit message format based on recent commit history.
</context>

<requirements>
1. Run `git status` to see all untracked and modified files
2. Run `git diff` to examine both staged and unstaged changes
3. Run `git log -10 --oneline` to understand the repository's commit message style
4. Stage all relevant files (modified and new, excluding any files that contain secrets)
5. Generate a commit message that:
   - Follows the repository's established format
   - Accurately describes the nature of changes (new feature, enhancement, bug fix, etc.)
   - Focuses on the "why" rather than just the "what"
   - Is concise (1-2 sentences for the main message)
6. Include the standard footer:
   ```
   🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>

````
7. Create the commit and verify with `git status`
</requirements>

<implementation>
- Use a HEREDOC to pass the commit message to ensure proper formatting:
```bash
git commit -m "$(cat <<'EOF'
Your commit message here.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
````

- Do NOT push to remote unless explicitly requested
- Do NOT commit files that likely contain secrets (.env files, credentials, etc.)
- If there are no changes to commit, report this to the user
  </implementation>

<verification>
After committing:
- Run `git status` to confirm the commit was successful
- Run `git log -1` to display the commit details
</verification>

<success_criteria>

- All outstanding changes are staged and committed
- Commit message accurately reflects the changes
- Commit follows the repository's conventions
- No secrets or sensitive files are committed
- User receives confirmation of successful commit with details
  </success_criteria>
