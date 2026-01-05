---
description: Execute spec files from a coordinator file sequentially using forked terminals
allowed-tools: Skill(verify-code)
argument-hint: [coordinator-file]
---

<objective>
Process a COORDINATOR_FILE that contains a list of SPEC_FILES and execute each one sequentially using the fork-terminal skill with Claude Code.

This command orchestrates the implementation of a multi-task plan by forking a separate Claude Code terminal for each spec file, waiting for completion, and collecting status notes before proceeding to the next task.
</objective>

<context>
Coordinator file to process: @$arguments

The coordinator file contains a table with spec file paths in the format:
| Task | File | Status | Dependencies | Can Run In Parallel With |
| ---- | ---- | ------ | ------------ | ------------------------ |
| 01 | .specs/example-01.md | Not Started | None | 02, 03 |
</context>

<process>
1. **Parse the Coordinator File**
   - Read the coordinator file specified by the user
   - Extract all spec file paths from the "File" column of the task table
   - Note which tasks are already marked as "Complete" (skip these)
   - Respect dependency order (tasks with dependencies should run after their prerequisites)

2. **For Each Spec File (Sequential Execution)**
   Execute these steps for each spec file that is NOT already complete:

    a. **Announce the Task**
    - Display which task number and spec file is being started
    - Show any relevant dependencies or prerequisites

    b. **Fork a Claude Code Terminal**
    - Use the fork-terminal skill to spawn a new Claude Code session
    - Pass the command: `claude --model sonnet --permission-mode acceptEdits "/implement-plan @{SPEC_FILE}"`
    - The forked terminal will implement the spec file independently

    c. **Wait for Task Completion**
    - Monitor the forked terminal for completion
    - Since fork_terminal spawns an external process, you cannot directly monitor it
    - Instead, ask the user to confirm when the forked terminal has completed its work
    - Request completion status: success, partial, or failed

    d. **Collect Completion Notes**
    - Ask the user for any relevant notes from the completed task
    - Document any issues, blockers, or important details
    - Update progress tracking

    e. **Proceed to Next Task**
    - Move to the next incomplete spec file
    - Repeat steps a-d

3. **Completion Summary**
   After all tasks have been processed:
    - Display a summary of completed tasks
    - List any tasks that failed or were skipped
    - Note any follow-up actions required
      </process>

<constraints>
- Execute tasks SEQUENTIALLY, not in parallel
- SKIP tasks already marked as "Complete" in the coordinator file
- Respect dependency order (check "Dependencies" column)
- Always wait for user confirmation before proceeding to the next task
- Do NOT proceed to dependent tasks until prerequisites are complete
</constraints>

<fork-terminal-invocation>
When using the fork-terminal skill, construct the command as:

```
claude --model sonnet --permission-mode acceptEdits "/implement-plan @.specs/spec-file-name.md"
```

This invokes Claude Code in a new terminal with:

- Model: sonnet (default, use opus for complex tasks if user requests)
- Permission mode: acceptEdits (allows file modifications with confirmation)
- Prompt: The /implement-plan slash command with the spec file path
  </fork-terminal-invocation>

<user-interaction>
After forking each terminal:
1. Notify the user that a new terminal has been forked for the task
2. Wait for the user to signal completion (they will type something like "task complete" or "done")
3. Ask for completion status and any notes
4. Record the information and proceed to the next task
</user-interaction>

<success_criteria>

- All spec files from the coordinator file have been processed
- Each task was executed in a forked Claude Code terminal
- User confirmed completion status for each task
- Completion notes collected for all tasks
- Dependent tasks only ran after prerequisites completed
- Final summary provided showing overall progress
  </success_criteria>
