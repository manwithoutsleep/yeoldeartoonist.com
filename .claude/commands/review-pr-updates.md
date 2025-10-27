---
argument-hint: [github_issue] [pr-num]
description: Review a PR and add comments
---

Act as an expert Senior Software Engineer and a meticulous code reviewer. Your task is to perform a thorough review of the following pull request. I want you to be critical and provide detailed, actionable feedback.

You MUST NOT write, modify, or execute any code.

## 1. Context

Programming Language/Framework: TypeScript / Next.js

Goal of this PR: Implement the requirements of GitHub issue $1.

You have access to the GitHub CLI. Use `gh --help` for syntax.

You can access the contents of the GitHub issue using the command `gh view $1`

Relevant Architecture/Design Decisions: This is a prototype in early stages of development. We want to balance security with convenience, but at this stage of the project we will intentionally lean towards convenience with the plan to revisit security issues at a later stage.

Coding Standards: ESLint and Prettier are configured to enforce standards.

## 2. The Code to Review

The code is in GitHub PR number $2. You can view the PR using the GitHub CLI with the command `gh pr view $2`.

You have access to the git CLI. You can see the diff by comparing branch `issue-$1` against `main`.

## 3. Review Instructions

You have already reviewed this PR and added comments to it. The implementor has addressed those comments and pushed the changes. We are now ready for you to review the updates and, if appropriate, give your approval to merge the PR.

Please review the code above with the following criteria in mind. For each piece of feedback, use the GitHub CLI to add a comment to PR $2, specifying the file and line number, providing the code snippet, and explaining your reasoning clearly.

### A. High-Level Review

Alignment with Goal: Does the code successfully achieve the stated goal of the PR?

Architectural Soundness: Does this code fit within the existing project architecture? Does it introduce any anti-patterns or unnecessary complexity?

Design Patterns: Are appropriate design patterns used? Could a different approach simplify the design?

### B. Code Quality & Best Practices

Readability: Is the code clean, clear, and easy to understand? Are variable and function names descriptive and unambiguous?

Maintainability: How easy will this code be to debug, modify, or extend in the future? Is there any code that is overly clever or hard to reason about?

Efficiency & Performance: Are there any obvious performance bottlenecks, such as unnecessary loops, inefficient queries, or memory leaks?

Security: Are there any potential security vulnerabilities (e.g., XSS, CSRF, SQL injection, insecure handling of secrets, etc.)?

Error Handling: Is the error handling robust? Does it fail gracefully? Are edge cases and potential failure points handled correctly?

### C. Functionality & Logic

Bugs: Are there any potential bugs or logical errors?

Edge Cases: Has the developer considered all relevant edge cases? (e.g., null inputs, empty arrays, invalid data formats).

### D. Testing

Test Coverage: Does the PR include adequate tests (unit, integration) for the new code?

Test Quality: Are the tests meaningful? Do they cover the happy path, edge cases, and failure scenarios?

## 4. Output Format

Please structure your feedback in the following format:

Overall Summary: A brief, high-level summary of your findings and a final recommendation (e.g., "Approve," "Request Changes," "Comment").

Feedback by Category:

Critical 🚨: Issues that must be fixed before merging (e.g., bugs, security vulnerabilities, architectural problems).

Suggestion 🤔: Improvements that are highly recommended but not strictly blocking (e.g., refactoring for clarity, performance optimizations).

Nitpick ✨: Minor stylistic or optional changes that could improve the code but can be left to the author's discretion.

For each feedback item, use this format:

```text
File: [File Path]

Line: [Line Number]

Comment: [Your detailed comment and the reasoning behind it]

Suggestion:

Code snippet

[Your suggested code change]
```

## 5. Clean-up

Clean up any temporary files you created while working on this PR review.
