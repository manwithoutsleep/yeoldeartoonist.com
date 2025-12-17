---
name: close-pr-and-cleanup
description: Squash and merge a GitHub PR, then clean up local and remote branches. Use when closing a PR and cleaning up the repository after PR approval. Requires PR number and branch name as parameters.
allowed-tools: Bash, AskUserQuestion
---

# Close PR and Clean Up Repository

This skill automates the process of closing a GitHub Pull Request and cleaning up the local repository.

## Prerequisites

Before running this skill, ensure:

- You have the PR number
- You have the local branch name
- The PR has been approved and is ready to merge
- You have no uncommitted changes in your working directory
- You are not currently on the branch you want to delete

## Parameters

The skill requires two parameters:

1. **PR Number**: The GitHub Pull Request number (e.g., 123)
2. **Branch Name**: The local git branch name (e.g., issue-123 or feature-xyz)

## Instructions

### Step 1: Validate Inputs and PR Status

First, validate that the PR exists and is in a mergeable state:

```bash
gh pr view {pr-number} --json state,title,headRefName,mergeable
```

**Expected Output:**

- `state`: "OPEN"
- `mergeable`: "MERGEABLE"
- Verify `headRefName` matches the branch name parameter

**Error Handling:**

- If PR is already merged: Inform user and skip to local cleanup (Step 4)
- If PR is closed without merge: Ask user if they want to proceed with cleanup only
- If PR is not mergeable: Stop and inform user (may have conflicts or failing checks)

### Step 2: Display Summary and Request Approval

Before proceeding with any destructive operations, display a comprehensive summary:

```
PR Details:
- Number: {pr-number}
- Title: {title from gh pr view}
- Branch: {branch-name}

Actions that will be performed:
1. Squash and merge PR #{pr-number}
2. Delete remote branch: {branch-name}
3. Switch local repository to main branch
4. Pull latest changes from origin/main
5. Delete local branch: {branch-name}
6. Prune stale remote branch references

⚠️  WARNING: These operations cannot be undone.
```

Use AskUserQuestion to get explicit approval:

- Question: "Do you want to proceed with closing PR #{pr-number} and cleaning up branch {branch-name}?"
- Options: "Yes, proceed" / "No, cancel"

**If user cancels:** Stop execution and inform user no changes were made.

### Step 3: Merge PR and Delete Remote Branch

Execute the merge operation:

```bash
gh pr merge {pr-number} --squash --delete-branch
```

**Explanation:**

- `--squash`: Squash all commits into a single commit on main
- `--delete-branch`: Automatically delete the remote branch after merge

**Error Handling:**

- If command fails, display error message and stop execution
- Common errors: PR already merged, PR not mergeable, insufficient permissions

**Success Indicator:**

- Command outputs merge commit hash
- Command confirms branch deletion

### Step 4: Local Repository Cleanup

Execute local cleanup operations. **IMPORTANT:** Run each command independently (not chained with `&&`) to ensure all cleanup steps execute even if one fails.

```bash
# Switch to main branch
git checkout main
```

```bash
# Pull latest changes (includes the squash merge)
git pull origin main
```

```bash
# Delete local branch (may not exist if deleted by gh pr merge)
git branch -d {branch-name}
```

```bash
# Prune stale remote references (ALWAYS run this, even if git branch -d fails)
git remote prune origin
```

**Error Handling:**

- If `git checkout main` fails: User may already be on main (safe to continue)
- If `git pull` fails: Check network connection; may need manual intervention
- If `git branch -d` fails: Branch may not exist locally (already deleted by `gh pr merge --delete-branch`), which is fine - continue with remaining steps
- If `git remote prune` fails: Non-critical; inform user to run manually

**Important Note:** The `gh pr merge --delete-branch` command may delete the local branch automatically in some configurations. If `git branch -d` fails because the branch doesn't exist, this is expected behavior. Always continue to `git remote prune origin` to clean up stale remote references.

### Step 5: Verify Cleanup Success

Verify the cleanup was successful:

```bash
# Verify on main branch
git branch --show-current

# Verify branch is deleted locally
git branch --list {branch-name}

# Verify remote branch is gone
git branch -r | grep {branch-name}
```

**Expected Results:**

- Current branch: `main`
- Local branch list: Empty (branch not found)
- Remote branch list: Empty (branch not found)

**Display Summary:**

```
✅ PR #{pr-number} successfully merged and closed
✅ Remote branch {branch-name} deleted
✅ Local branch {branch-name} deleted
✅ Repository cleaned up

Current branch: main
Latest commit: {git log -1 --oneline}
```

## Example Usage

**Scenario:** Close PR #123 for branch `issue-123`

**User Request:**
"Close PR 123 and clean up the issue-123 branch"

**Skill Execution:**

1. Validates PR #123 exists and is mergeable
2. Displays summary of actions
3. Requests user approval
4. Merges PR with squash
5. Deletes remote branch
6. Switches to main
7. Pulls latest changes
8. Deletes local branch
9. Prunes remote references
10. Confirms success

## Common Issues and Troubleshooting

**Issue:** "error: Cannot delete branch 'X' checked out at 'Y'"

- **Solution:** Ensure you're not on the branch being deleted; script includes `git checkout main`

**Issue:** "Pull request already merged"

- **Solution:** Skill skips merge step and proceeds with cleanup only

**Issue:** "error: The branch 'X' is not fully merged"

- **Solution:** Branch may have commits not in main; ask user if they want to force delete with `-D`

**Issue:** Network failures during `gh` or `git pull` commands

- **Solution:** Check internet connection; retry operation; may need manual intervention

## Version History

- v1.0.0 (2025-12-10): Initial implementation
