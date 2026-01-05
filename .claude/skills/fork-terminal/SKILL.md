---
name: Fork Terminal Skill
description: Fork a terminal session to a new terminal window. Use this when the user requests 'fork terminal' or 'create new terminal' or 'new terminal: <command>' or 'fork session: <command>'.
---

# Purpose

Fork a terminal session to a new terminal window using agentic coding tools or raw cli commands.
Follow the `Instructions`, execute the `Workflow`, based on the `Cookbook`.

## Variables

ENABLE_RAW_CLI_COMMANDS: true
ENABLE_GEMINI_CLI: true
ENABLE_CODEX_CLI: true
ENABLE_CLAUDE_CODE: true
AGENTIC_CODEING_TOOLS: claude-code, codex-cli, gemini-cli

## Instructions

- Based on the user's request, follow the cookbook to determine which tool to use.

### Fork Summary User Prompts

- IF: The user requests a forked terminal with a summary using one of our agentic coding tools `AGENTIC_CODING_TOOLS` AND the toolis enabled,
- THEN:
    - Prepare a summary of the conversation between you and the user so far using `.claude\skills\fork-terminal\prompts\fork-summary-user-prompt.md` as a template.
    - Include the user's next request in the `Next User Request` section.
    - This will be what you pass into the PROMPT parameter of the agentic coding tool.

#### Examples

- "fork terminal use claude code to <xyz> summarize work so far"
- "spin up a new terminal request <xyz> using claude code include summary"
- "create a new terminal to <xyz> with claude code with summary"

## Workflow

1. Understand the user's request.
2. READ: `.claude\skills\fork-terminal\tools\fork_terminal.py` to understand our tooling.
3. Follow the `Cookbook` to determine which tool to use.
4. Execute the Python tool `.claude/skills/fork-terminal/tools/fork_terminal.py: fork_terminal(command: str)`

## Cookbook

### Raw CLI Commands

- IF: The user requests a non-agentic coding tool and `ENABLE_RAW_CLI_COMMANDS` is true,
- THEN: Read and execute `.claude\skills\fork-terminal\cookbook\cli-command.md`
- EXAMPLES:
    - "Create a new terminal to <xyz> with ffmepg"
    - "Create a new terminal to <xyz> with curl"
    - "Create a new terminal to <xyz> with python"

### Claude Code

- IF: The user requests a claude code agent to execute the command and `ENABLE_CLAUDE_CODE` is true,
- THEN: Read and execute `.claude\skills\fork-terminal\cookbook\claude-code.md`
- EXAMPLES:
    - "fork terminal use claude code to <xyz>"
    - "spin up a new terminal request <xyz> using claude code"
    - "create a new terminal to <xyz> with claude code"

### Codex CLI

- IF: The user requests to use the codex-cli tool and `ENABLE_CODEX_CLI` is true,
- THEN: Read and execute `.claude\skills\fork-terminal\cookbook\codex-cli.md`
- EXAMPLES:
    - "fork terminal use codex-cli to <xyz>"
    - "create a new terminal using codex-cli for <xyz>"
    - "spin up a codex-cli terminal to <xyz>"

### Gemini CLI

- IF: The user requests to use the gemini-cli tool and `ENABLE_GEMINI_CLI` is true,
- THEN: Read and execute `.claude\skills\fork-terminal\cookbook\gemini-cli.md`
- EXAMPLES:
    - "fork terminal use gemini-cli to <xyz>"
    - "create a new terminal using gemini-cli for <xyz>"
    - "spin up a gemini-cli terminal to <xyz>"
