---
argument-hint: [issue-id] [notes]
description: Create a PR covering the current work
---

<purpose>
    Create a PR for the current work
</purpose>

<instructions>
    <instruction>Commit any outstanding changes on the current branch.</instruction>
    <instruction>Push the current branch to `origin`.</instruction>
    <instruction>Review the scope of work described in ISSUE.</instruction>
    <instruction>Check the actual work completed by reading the commit messages in the current branch</instruction>
    <instruction>Create a PR with a comprehensive commit message describing the work done, with reference to the CONTEXT.</instruction>
    <instruction>Attach the PR to the issue.</instruction>
</instructions>

<issue>
    GitHub issue # {{issue-id}}
</issue>

<context>
    {{notes}}
</context>
