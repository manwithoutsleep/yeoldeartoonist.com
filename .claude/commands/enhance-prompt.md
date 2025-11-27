---
argument-hint: [output-file-name] [content]
description: Revise a prompt to improve clarity, detail, and effectiveness.
---

<context>
    I have developed a prompt for an AI model, but I want to enhance it to ensure it is clear, detailed, and effective in eliciting the desired response. Your task is to revise and improve the prompt while maintaining its original intent.
</context>

<purpose>
    Read the provided prompt and identify areas for improvement. Enhance the prompt by adding necessary details, clarifying ambiguous language, and structuring it for better comprehension. Format it in XML structure following the <example-outputs>. The goal is to make the prompt more effective in guiding the AI model to produce the desired output.
</purpose>

<shell-commands>
    <cmd_compile>tsc --noEmit</cmd_compile>
    <cmd_lint>npx eslint --fix {files}</cmd_lint>
    <cmd_format>npx prettier --write {files}</cmd_format>
    <cmd_test>npx vitest related run {files}</cmd_test>
</shell-commands>

<instructions>
    <instruction>Read the PROMPT-TO-ENHANCE to understand its goals.</instruction>
    <instruction>Develop a plan to improve the prompt as described in PURPOSE.</instruction>
    <instruction>Revise the prompt according to the plan.</instruction>
    <instruction>Reformat the prompt into XML following the EXAMPLE-OUTPUTS.</instruction>
    <instruction>Add any variables that would help make this prompt reusable, using the `{{variable-name}}` format.</instruction>
    <instruction>Write the revised prompt to @prompts\{{output-file-name}}</instruction>
    <instruction>Output a summary of the changes made and the rationale behind them.</instruction>
</instructions>

<example-outputs>
    <example-output>
        <context>
            <project_state>
                The project is currently on branch {{branch-name}}.
                Pull Request # {{pr-num}} has been opened and received feedback.
            </project_state>
            <focus_areas>
                {{focus-areas}}
            </focus_areas>
        </context>

        <purpose>
            Address only the issues listed in the FOCUS_AREAS
            Ignore all other issues for this session.
        </purpose>

        <verification_commands>
            <cmd_compile>tsc --noEmit</cmd_compile>
            <cmd_lint>npx eslint --fix {files}</cmd_lint>
            <cmd_format>npx prettier --write {files}</cmd_format>
            <cmd_test>npx vitest related run {files}</cmd_test>
        </verification_commands>

        <instructions>
            <step>
                Check the detailed PR comments with `gh pr view {{pr-num}} --comments`.
                (If the `gh` CLI fails or is not authenticated, ask me to paste the comments manually).
            </step>

            <step>
                Analyze the FOCUS_AREAS and create a prioritized list of the issues
                you plan to fix. Present this plan to me briefly before writing code.
            </step>

            <step>
                Iterate through the prioritized list one issue at a time using the INSTRUCTION_LOOP.

                <instruction_loop>
                    <fix>
                        Implement the code changes required for the current issue.
                    </fix>

                    <verify>
                        1. Identify the specific file paths you just modified.
                        2. Run the VERIFICATION_COMMANDS, replacing `{files}` with those paths (space-separated).
                            - Note: Run CMD_COMPILE as written, without file paths.
                        3. IF any command fails:
                            - Fix the specific error.
                            - Retry VERIFY.
                        4. IF failures persist beyond 3 attempts: Stop and ask for human guidance.
                    </verify>

                    <commit>
                        Once VERIFY_LOOP passes, commit the changes.
                        - Message Format: "fix: [brief description of the specific critical issue]"
                        - Constraint: Do NOT use `--no-verify`.
                    </commit>
                </instruction_loop>
            </step>

            <final_step>
                After all critical issues are committed:
                1. Stop and output a summary of the fixed items.
                2. Add a comment to the PR describing these changes.
                3. Ask if I am ready to proceed to other suggestions.
            </final_step>

        </instructions>
    </example-output>

    <example-output>
        <purpose>
            Finalize the work we've just completed and commit the changes.
        </purpose>

        <instructions>
            <instruction>Update {{spec-name}} to mark all items in {{issue-id}} as complete</instruction>
            <instruction>Commit all outstanding changes with a comprehensive commit message.</instruction>
            <instruction>Do not skip the pre-commit hook! In other words, do not use the `--no-verify` flag during the commit.</instruction>
            <instruction>If the pre-commit hook surfaces issues, STOP and ask me how to proceed.</instruction>
        </instructions>

        <example-outputs>
        <example-output>
        I've found Issue #3: "Add magic link email template" in specs/auth-refactor.md.

        First, let me mark all steps of Issue #3 complete...
        [Creates test file with failing tests]

        Now I'll commit all outstanding changes to the repo...
        [Adds oustanding changes]
        [Commits changes, allowing the pre-commit hook to run]

        I've marked Issue #3 as completed in specs/auth-refactor.md and committed all outstanding changes.
        </example-output>

        <example-output>
        I've found Issue #3: "Add magic link email template" in specs/auth-refactor.md.

        First, let me mark all steps of Issue #3 complete...
        [Creates test file with failing tests]

        Now I'll commit all outstanding changes to the repo...
        [Adds oustanding changes]
        [Pre-commit hook reports linting issues]

        I notice the pre-commit hook has surfaced linting issues. How would you like to proceed?

        1. Fix the linting issues and try again.
        2. Run the commit with the `--no-verify` flag to ignore the linting issues.
        3. Something else?

        </example-output>
        </example-outputs>

        <content>
            {{content}}
        </content>
    </example-output>

</example-outputs>

<prompt-to-enhance>
    {{content}}
</prompt-to-enhance>
