---
argument-hint: [spec-name]
description: Create a PR covering the current work
---

<purpose>
    Create a PR for the current work
</purpose>

<variables>
SPEC_NAME = {{spec-name}}
</variables>

<instructions>
    <instruction>Commit any outstanding changes on the current branch.</instruction>
    <instruction>Push the current branch to `origin`.</instruction>
    <instruction>Review the scope of work described in SPEC_NAME.</instruction>
    <instruction>Check the actual work completed by reading the commit messages in the current branch</instruction>
    <instruction>Create a PR with a comprehensive commit message describing the work done.</instruction>
</instructions>
