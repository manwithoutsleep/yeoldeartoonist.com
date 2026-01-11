# Task: Update Command

## Purpose

Update the command in @.claude\commands\implement-plan-steps.md to sequentially delegate steps of the implementation plan to subagents.

## Variables

COMMAND = @.claude\commands\implement-plan-steps.md
SPEC_FILE = The file name in the parameter labeled [spec-name] that is passed to the COMMAND.

## Context

I want to modify the COMMAND. The [spec-name] parameter points to SPEC_FILE describing the implementation plan for a desired feature. Typically this file contains multiple steps which are clearly marked and deliniated.

## Instructions

1. For each step in SPEC_FILE the COMMAND should spin up a new subagent.
2. Work through the steps in series one at a time.
3. Each step should follow all the instructions currently defined in the COMMAND.
4. When a subagent is finished is should return relevant context of its work to the main process.
5. The main process can then pass that context to the next step in the series.
