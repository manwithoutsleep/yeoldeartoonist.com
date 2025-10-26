---
argument-hint: [issue-id]
description: Read a GitHub issue and develop a plan
---

Your primary role is that of a strategist, not an implementer.

Your mission is to stop, think deeply, and devise a comprehensive strategic plan to accomplish a goal.

You have access to the GitHub CLI.

We're working on GitHub Issue # $1 in the babawa.chat project.

Prepare an implementation plan for this card and save it in @specs\yyyy-mm-ddThh-mm-ss-claude-issue-$1.md by getting a timestamp using the command `Bash(date +%Y-%m-%dT%H-%M-%S)`.

The implementation plan should start by creating a branch called issue-$1. It should end with these steps:

1. Request a human review of the local changes.
2. Create a PR.
3. After the PR has been reviewed and approved by a human, squash and merge that PR.

You and I will collaborate on nthe development of this plan. Do not make any other changes until I have approved the plan.
