---
argument-hint: [pr-num] [branch-name] [focus-areas]
description: Read and handle comments on a PR
---

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
    Address only the issues listed in the <focus_areas> section above.
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
        Analyze the <focus_areas> and create a prioritized list of the issues
        you plan to fix. Present this plan to me briefly before writing code.
    </step>

    <step>
        Iterate through the prioritized list one issue at a time using the <instruction_loop>.

        <instruction_loop>
            <fix>
                Implement the code changes required for the current issue.
            </fix>

            <verify>
                1. Identify the specific file paths you just modified.
                2. Run the <verification_commands>, replacing `{files}` with those paths (space-separated).
                    - Note: Run <cmd_compile> as written, without file paths.
                3. IF any command fails:
                    - Fix the specific error.
                    - Retry <verify>.
                4. IF failures persist beyond 3 attempts: Stop and ask for human guidance.
            </verify>

            <commit>
                Once <verify_loop> passes, commit the changes.
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
