---
argument-hint: [spec-name] [issue-id]
description: Mark the task complete then commit all changes
---

We've completed all of {{issue-id}} in {{spec-name}}. Update {{spec-name}} to mark all items in {{issue-id}} as complete, then commit all outstanding changes. Do not skip the pre-commit hook! In other words, do not use the `--no-verify` flag during the commit. If the pre-commit hook surfaces issues, STOP and ask me how to proceed.
