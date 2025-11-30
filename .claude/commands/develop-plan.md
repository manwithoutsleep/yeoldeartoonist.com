---
description: Create an implementation plan for a GitHub issue
argument-hint: [issue-id]
allowed-tools:
    [
        Read,
        Edit,
        Bash(gh issue view:*),
        Bash(powershell -Command \"Get-Date -Format ''yyyy-MM-ddTHH-mm-ss''\"),
    ]
---

<context>
    <role>strategist</role>
    <project_state>
        Working on GitHub Issue #{{issue-id}} in the yeoldeartoonist.com project.
    </project_state>
    <constraints>
        You are responsible for planning, not implementation.
        Implementation will occur after human approval of the plan.
    </constraints>
    <development_principles>
        <tdd>
            Implementation should follow Test Driven Development (TDD) practices whenever practical:
            - Write tests first (Red)
            - Implement code to pass tests (Green)
            - Refactor while keeping tests passing (Refactor)
        </tdd>
        <solid>
            All code should adhere to SOLID principles:
            - Single Responsibility: Each class/function has one reason to change
            - Open/Closed: Open for extension, closed for modification
            - Liskov Substitution: Subtypes must be substitutable for base types
            - Interface Segregation: Many specific interfaces over one general interface
            - Dependency Inversion: Depend on abstractions, not concretions
        </solid>
    </development_principles>
</context>

<purpose>
    Create a comprehensive, strategic implementation plan for GitHub Issue #{{issue-id}}.
    The plan should be detailed enough to guide implementation but require human approval before any code changes are made.
    The plan must incorporate TDD practices and SOLID principles throughout.
</purpose>

<available_tools>
<tool>GitHub CLI (gh) - for reading issue details, checking project state</tool>
<tool>Git - for branch management planning</tool>
<tool>Bash - for timestamps and filesystem operations</tool>
<tool>Read/Write - for creating the plan document</tool>
</available_tools>

<instructions>
    <step id="1">
        <action>Fetch and analyze the GitHub issue</action>
        <command>gh issue view {{issue-id}} --json title,body,labels,assignees</command>
        <details>
            Read the issue thoroughly to understand:
            - The problem or feature request
            - Acceptance criteria
            - Any technical constraints or requirements
            - Related issues or dependencies
        </details>
    </step>

    <step id="2">
        <action>Generate timestamp for spec filename</action>
        <command>date +%Y-%m-%dT%H-%M-%S</command>
        <details>
            Use this timestamp to create a unique spec filename following the pattern:
            .specs/{{timestamp}}-claude-issue-{{issue-id}}.md
        </details>
    </step>

    <step id="3">
        <action>Analyze the codebase context</action>
        <details>
            Use available tools to understand:
            - Existing code structure related to the issue
            - Current architectural patterns
            - Relevant dependencies and integrations
            - Test coverage in affected areas
            - Similar implementations that can guide the approach
        </details>
    </step>

    <step id="4">
        <action>Develop the implementation plan</action>
        <details>
            Create a strategic plan that includes:

            <plan_structure>
                <section name="overview">
                    - Brief summary of the issue
                    - Goals and success criteria
                    - Estimated scope and complexity
                </section>

                <section name="technical_approach">
                    - Architectural decisions and rationale
                    - Design patterns to be used
                    - Integration points with existing code
                    - Potential risks and mitigation strategies
                    - SOLID principles application (explain how each principle is applied)
                </section>

                <section name="implementation_steps">
                    Start with:
                    1. Create branch: issue-{{issue-id}}
                    2. [Detailed implementation steps here]

                    Each step should follow TDD cycle whenever practical:
                    - Write failing tests first (Red phase)
                    - Implement minimum code to pass tests (Green phase)
                    - Refactor while keeping tests passing (Refactor phase)
                    - Verify SOLID principles are maintained
                    - Run verification commands after each step (see Verification Process below)

                    Each step should include:
                    - What needs to be done (specific files, components, functions)
                    - Why it needs to be done (rationale)
                    - How SOLID principles are applied
                    - Test files and test cases to write first (TDD Red phase)
                    - Implementation approach (TDD Green phase)
                    - Refactoring opportunities (TDD Refactor phase)
                    - Verification process (compile, lint, format, test)
                    - Dependencies on previous steps

                    End with:
                    N-2. Request human review of all local changes
                    N-1. Create Pull Request
                    N. After PR approval, squash and merge
                </section>

                <section name="verification_process">
                    After EACH implementation step, follow this verification procedure:

                    <verification_commands>
                        <cmd_compile>tsc --noEmit</cmd_compile>
                        <cmd_lint>npx eslint --fix {files}</cmd_lint>
                        <cmd_format>npx prettier --write {files}</cmd_format>
                        <cmd_test>npx vitest related run {files}</cmd_test>
                    </verification_commands>

                    <verification_steps>
                        1. Identify the specific file paths modified in the current step
                        2. Run verification commands, replacing {files} with space-separated file paths:
                           - TypeScript compile check: tsc --noEmit (run as-is, no file paths)
                           - ESLint: npx eslint --fix {files}
                           - Prettier: npx prettier --write {files}
                           - Vitest: npx vitest related run {files}
                        3. If any command fails:
                           - Fix the specific error
                           - Retry the verification step
                        4. If failures persist beyond 3 attempts:
                           - Stop implementation
                           - Document the issue
                           - Ask for human guidance
                        5. Only proceed to next step when ALL verifications pass
                    </verification_steps>

                    This ensures code quality and prevents accumulation of technical debt.
                </section>

                <section name="testing_strategy">
                    Follow TDD approach:
                    - Unit tests to be written FIRST (before implementation)
                    - Integration tests required (specify when to write)
                    - Manual testing scenarios (for UI/UX validation)
                    - Test data requirements and setup
                    - Test coverage goals (aim for high coverage of new code)
                    - Regression tests for existing functionality
                </section>

                <section name="considerations">
                    - Security implications
                    - Performance impacts
                    - Database migrations (if any)
                    - Backward compatibility
                    - Documentation updates needed
                </section>
            </plan_structure>
        </details>
    </step>

    <step id="5">
        <action>Write the plan to the specs directory</action>
        <filepath>.specs/{{timestamp}}-claude-issue-{{issue-id}}.md</filepath>
        <format>
            Use clear Markdown formatting with:
            - Heading hierarchy (H1 for title, H2 for sections, H3 for subsections)
            - Code blocks for technical details
            - Checkboxes [ ] for actionable steps
            - Tables for comparisons or options
            - Links to relevant documentation or related issues
        </format>
    </step>

    <step id="6">
        <action>Present the plan for human review</action>
        <details>
            Output a summary that includes:
            - Path to the spec file created
            - High-level overview of the approach
            - Key decisions that need validation
            - Estimated complexity and any concerns
            - Explicit request for approval before proceeding
        </details>
        <collaboration_note>
            You and the human will collaborate on refining this plan.
            Do NOT make any code changes until explicit approval is given.
            Be prepared to:
            - Answer questions about the approach
            - Revise the plan based on feedback
            - Consider alternative approaches if suggested
        </collaboration_note>
    </step>

</instructions>

<quality_checks>
<check>Plan addresses all aspects of the GitHub issue</check>
<check>Steps are specific and actionable</check>
<check>Dependencies between steps are clear</check>
<check>Testing strategy is comprehensive and follows TDD approach</check>
<check>Tests are written BEFORE implementation in each step</check>
<check>Risks and mitigation strategies are identified</check>
<check>SOLID principles are explicitly applied and explained</check>
<check>Each implementation step includes TDD cycle (Red-Green-Refactor)</check>
<check>Each step includes verification commands (compile, lint, format, test)</check>
<check>Verification failure handling is documented (3-attempt limit, human escalation)</check>
<check>Refactoring opportunities are identified</check>
<check>All file paths and naming follow project standards</check>
</quality_checks>

<output_format>

<summary>
Created implementation plan at: .specs/{{timestamp}}-claude-issue-{{issue-id}}.md

        Overview: [2-3 sentence summary of the approach]

        Key Decisions:
        - [Decision 1 and rationale]
        - [Decision 2 and rationale]
        - [etc.]

        Complexity: [Low/Medium/High with justification]

        Concerns: [Any risks or areas needing special attention]

        Next Steps:
        Please review the plan and let me know if you approve, or if you'd like any changes.
        I will not proceed with implementation until you give explicit approval.
    </summary>

</output_format>

<examples>
    <example scenario="simple-bug-fix">
        For a bug fix issue:
        - Focus on root cause analysis
        - Write regression test FIRST that reproduces the bug (TDD Red)
        - Fix the bug with minimal code changes (TDD Green)
        - Run verification commands (tsc, eslint, prettier, vitest)
        - Refactor if needed while tests pass (TDD Refactor)
        - Re-run verification commands after refactoring
        - Keep implementation steps concise
        - Highlight affected areas
        - Verify SOLID principles not violated by fix
    </example>

    <example scenario="new-feature">
        For a new feature:
        - Detailed architectural decisions with SOLID principles
        - Design interfaces before implementations (Dependency Inversion)
        - Multiple testing layers (unit, integration, e2e) written FIRST
        - Each component follows Single Responsibility Principle
        - Plan for extensibility (Open/Closed Principle)
        - After each component implementation, run full verification suite
        - Handle verification failures (max 3 attempts, then escalate)
        - Consider UI/UX implications
        - Plan for documentation
        - Explicit TDD cycles for each major component
    </example>

    <example scenario="refactoring">
        For refactoring work:
        - Justify the refactor (which SOLID principle is violated?)
        - Ensure comprehensive test coverage BEFORE refactoring
        - Run verification commands to establish baseline (all passing)
        - Plan incremental changes with tests passing at each step
        - After each incremental change, run verification suite
        - Identify SOLID violations and how to fix them
        - Define success metrics (improved cohesion, reduced coupling, etc.)
        - Maintain TDD discipline: test-refactor-test-verify
    </example>

</examples>
