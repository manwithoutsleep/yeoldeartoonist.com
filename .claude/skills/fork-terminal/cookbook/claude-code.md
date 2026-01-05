# Purpose

Create a new Claude Code agent to execute the command.

## Variables

DEFAULT_MODE: sonnet
HEAVY_MODEL: opus
BASE_MODEL: sonnet
FAST_MODEL: haiku

## Instructions

- Before executing the command, run `claude --help` to understand the command and its options.
- Always use interactive mode (so leave off -p)
- For the --model argument, use the DEFAULT_MODEL if not specified. If 'fast' is requested, use the FAST_MODEL. If 'heavy' is requested, use the HEAVY_MODEL.
- Always run with ` --permission-mode acceptEdits`.

## Examples

- Simple example with defaults:
    - User Prompt: "fork a terminal with claude code to read and summarize README.md"
    - Command to send to fork_terminal.py fork_terminal(command: str): `claude --model sonnet --permission-mode acceptEdits "read and summarize README.md"`

- Example with a model specified:
    - User Prompt: "fork session new claude code haiku 'read and summarize README.md'"
    - Command to send to fork_terminal.py fork_terminal(command: str): `claude --model haiku --permission-mode acceptEdits "read and summarize README.md"`
