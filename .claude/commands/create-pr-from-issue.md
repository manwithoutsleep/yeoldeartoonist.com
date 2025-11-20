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
    <instruction>Create a PR with a comprehensive commit message describing the work done in ISSUE with reference to the CONTEXT, attaching the PR to the issue.</instruction>
</instructions>

<issue>
    GitHub issue # {{issue-id}}
</issue>

<context>
    {{notes}}
</context>
