/create-slash-command """I have a COORDINATOR_FILE that points to a series of SPEC_FILES to be completed. I want to create a Claude Code slash command that will specify using the fork-terminal skill to execute each SPEC_FILE described in that COORDINATOR_FILE in sequence, NOT in parallel. For each SPEC_FILE in that COORDINATOR_FILE, follow these steps:

1. Use the fork-terminal skill to fork a Claude Code terminal for the task described in SPEC_FILE, passing the Claude Code slash command `/implement-plan @SPEC_FILE` as the prompt for the forked terminal.
2. Wait for the task to complete.
3. Get notes back from that task on completion status and any relevant details.
4. Repeat the process for the next SPEC_FILE in SPEC_FILES.

Repeat these steps until all tasks described in the COORDINATOR_FILE have been completed.
"""
