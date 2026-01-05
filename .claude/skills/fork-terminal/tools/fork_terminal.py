#!/usr/bin/env python3
"""Minimal script to fork a new terminal with a command."""

import os
import shlex
import subprocess
import sys


def fork_terminal(command: str) -> str:
    """
    Open a new PowerShell terminal and execute the given command.

    Args:
        command: The command to execute in the new terminal

    Returns:
        Status message indicating the terminal was spawned
    """
    try:
        cwd = os.getcwd()
        # Escape double quotes in command for PowerShell
        escaped_command = command.replace('"', '"""')
        ps_cmd = f'Start-Process powershell -WorkingDirectory "{cwd}" -ArgumentList @("-NoExit", "-Command", "{escaped_command}")'
        subprocess.Popen(
            ["powershell", "-Command", ps_cmd],
            creationflags=subprocess.CREATE_NEW_CONSOLE
        )
        return f"Terminal forked with command: {escaped_command}"
    except Exception as e:
        return f"Error forking terminal: {str(e)}"


if __name__ == "__main__":
    if len(sys.argv) > 1:
        cmd = ' '.join(shlex.quote(arg) for arg in sys.argv[1:])
        result = fork_terminal(cmd)
        print(result)
    else:
        print("Usage: fork_terminal.py <command>")
