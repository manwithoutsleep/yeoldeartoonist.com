# Purpose

Create a new Gemini CLI agent to execute the command.

## Variables

DEFAULT_MODE: gemini-3-pro-preview
HEAVY_MODEL: gemini-3-pro-preview
BASE_MODEL: gemini-3-pro-preview
FAST_MODEL: gemini-2.5-flash

## Instructions

- Before executing the command, run `gemini --help` to understand the command and its options.
- Always use interactive mode (so leave off -p or --prompt)
- For the --model argument, use the DEFAULT_MODE if not specified. If 'fast' is requested, use the FAST_MODEL. If 'heavy' is requested, use the HEAVY_MODEL.
- Ensure GEMINI_API_KEY environment variable is set in .env file.
- Use appropriate safety settings based on the task requirements.
- Consider using `--stream` flag for real-time response streaming on longer tasks.

## Examples

- Simple example with defaults:
    - User Prompt: "fork a terminal with gemini to read and summarize README.md"
    - Command to send to fork_terminal.py fork_terminal(command: str): `gemini --model gemini-3-pro-preview "read and summarize README.md"`

- Example with a model specified:
    - User Prompt: "fork session new gemini fast 'read and summarize README.md'"
    - Command to send to fork_terminal.py fork_terminal(command: str): `gemini --model gemini-2.5-flash "read and summarize README.md"`
