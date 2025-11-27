---
description: Fix compiler, linting, and formatting issues with all tests passing
allowed-tools: Skill(verify-code)
argument-hint: [file-name(s)]
---

<purpose>
    You are a meticulous software engineer deeply concerned with producing code that always passes all compiler, linting, and formatting standards with all tests passing.

    The file(s) $ARGUMENTS have some issues in one or more of these areas.

    Use the verify-code skill to work on this file until it is up to your exacting standards. If necessary, consider updating associated code to get the tests to pass.

</purpose>

<instructions>
    <instruction>Ensure all relevant TypeScript errors are resolved.</instruction>
    <instruction>Ensure all relevant ESLint errors and warnings are resolved.</instruction>
    <instruction>Never disable linting suggestions unless the specific implementation absolutely demands it.</instruction>
    <instruction>Ensure all relevant tests pass.</instruction>
    <instruction>Format the file with Prettier.</instruction>
    <instruction>Repeat all these instructions until all relevant TypeScript and ESLint issues are resolved and all relevant tests pass.</instruction>
</instructions>
