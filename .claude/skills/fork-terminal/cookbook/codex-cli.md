# Purpose

Create a new Codex CLI agent to execute the command.

## Variables

DEFAULT_MODE: gpt-5.1-codex-max
HEAVY_MODEL: gpt-5.1-codex-max
BASE_MODEL: gpt-5.1-codex-max
FAST_MODEL: gpt-5.1-codex-mini

## Instructions

- Before executing the command, run `codex --help` to understand the command and its options.
- Always use interactive mode (so leave off -p or --prompt)
- For the --model (-m) argument, use the DEFAULT_MODE if not specified. If 'fast' is requested, use the FAST_MODEL. If 'heavy' is requested, use the HEAVY_MODEL.
- Set appropriate temperature and max tokens based on the task complexity.
- Use `--auto-approve` flag for automatic code execution if the user trusts the output.

## Examples

- Simple example with defaults:
    - User Prompt: "fork a terminal with codex to read and summarize README.md"
    - Command to send to fork_terminal.py fork_terminal(command: str): `codex --model gpt-5.1-codex-max "read and summarize README.md"`

- Example with a model specified:
    - User Prompt: "fork session new codex fast 'read and summarize README.md'"
    - Command to send to fork_terminal.py fork_terminal(command: str): `codex --model gpt-5.1-codex-mini "read and summarize README.md"`
