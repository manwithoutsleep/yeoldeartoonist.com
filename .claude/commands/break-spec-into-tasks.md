---
argument-hint: [spec-name] [notes]
description: Break down a large spec file into manageable sub-tasks
---

<objective>
Analyze a large specification file and break it down into a set of manageable sub-tasks with clear boundaries and dependencies. Create a coordinator plan that orchestrates the execution of these sub-tasks, with explicit knowledge of which tasks can be executed in parallel and which must be executed sequentially.

This enables large specifications to be implemented incrementally and
efficiently, with proper dependency management to ensure correctness.
</objective>

<context>
Large specification files often contain too much work to be implemented in a single pass. Breaking them into smaller, focused sub-tasks improves:
- **Clarity**: Each sub-task has a single, clear objective
- **Parallelization**: Independent tasks can be executed simultaneously
- **Progress tracking**: Completion can be measured incrementally
- **Error isolation**: Issues can be identified and fixed in smaller scopes
- **Reviewability**: Changes are easier to review when focused

The coordinator plan acts as the orchestration layer, understanding task
dependencies and execution order.

Read the project conventions in @CLAUDE.md to understand the codebase structure
and standards.
</context>

<input_parameters>

This prompt expects the following input parameter:

**{{spec-name}}** - The name/path of the specification file to break down (e.g.,
"phase-3-implementation" or ".specs/phase-3-implementation.md")

**{{notes}}** - Additional notes to consider when completing this objective.

</input_parameters>

<requirements>

<step_1_read_specification>

1. Read the specification file at `.specs/{{spec-name}}.md` (or the provided
   path)
2. Thoroughly analyze the entire specification to understand:
    - Overall goals and objectives
    - Major components or features
    - Technical requirements and constraints
    - Dependencies between different parts of the work
    - Existing vs. new functionality
    - Testing requirements
3. Consider these additional notes:

{{notes}}

</step_1_read_specification>

<step_2_identify_logical_boundaries>

3. Identify logical boundaries for breaking down the work based on:

- **Functional cohesion**: Group related functionality together
- **Logical dependencies**: Identify what must be built before other things
- **File scope**: Consider which files/modules will be affected by each task
- **Testability**: Each sub-task should be independently testable
- **Size balance**: Aim for sub-tasks of roughly similar complexity (not too
  small, not too large)

4. Determine the optimal number of sub-tasks:
    - Minimum 2 sub-tasks (otherwise, no breakdown is needed)
    - Maximum 10 sub-tasks (beyond this, tasks may be too granular)
    - Sweet spot: 3-6 sub-tasks for most specifications
    - Consider: Each sub-task should represent 1-3 hours of focused work

</step_2_identify_logical_boundaries>

<step_3_analyze_dependencies>

5. For each identified sub-task, analyze dependencies:

- **Sequential dependencies**: Task B requires Task A to be completed first
- **Parallel opportunities**: Tasks that can be executed simultaneously
- **Shared resources**: Tasks that modify the same files (potential conflicts)
- **Data flow**: Does one task produce data/state needed by another?
- **Testing dependencies**: Must tests pass before proceeding to dependent
  tasks?

6. Create a dependency graph (conceptually) that shows:
    - Which tasks can start immediately (no dependencies)
    - Which tasks must wait for other tasks to complete
    - Which groups of tasks can run in parallel

</step_3_analyze_dependencies>

<step_4_create_subtask_files>

7. Create sub-task specification files following this naming pattern:

- `.specs/{{spec-name}}-01-[descriptive-name].md`
- `.specs/{{spec-name}}-02-[descriptive-name].md`
- `.specs/{{spec-name}}-03-[descriptive-name].md`
- ... continuing sequentially

8. Each sub-task file must contain:

    ```markdown
    # {{spec-name}}-NN: [Descriptive Title]

    ## Parent Specification

    This is sub-task NN of the parent specification: `{{spec-name}}.md`

    ## Objective

    [Clear, focused objective for this specific sub-task]

    ## Dependencies

    **Prerequisites** (must be completed before this task):

    - [List any sub-tasks that must be completed first, or "None" if this can start
      immediately]

    **Blocks** (tasks that depend on this one):

    - [List any sub-tasks that depend on this one completing, or "None"]

    **Parallel Opportunities**:

    - [List any sub-tasks that can be executed simultaneously with this one, or
      "None"]

    ## Scope

    [Detailed description of what this sub-task includes]

    ### In Scope

    - [Specific features, files, components to implement]

    ### Out of Scope

    - [What is explicitly NOT part of this sub-task]

    ## Implementation Requirements

    [Technical requirements specific to this sub-task]

    ## Files to Create/Modify

    - `./path/to/file1.ts` - [description]
    - `./path/to/file2.tsx` - [description]

    ## Testing Requirements

    [How to verify this sub-task is complete]

    ## Success Criteria

    - [ ] [Specific, measurable criterion 1]
    - [ ] [Specific, measurable criterion 2]
    - [ ] All tests pass
    - [ ] The verify-code skill has been successfully executed

    ## Notes

    [Any additional context, gotchas, or important considerations]
    ```

9. Ensure each sub-task is:
    - **Self-contained**: Can be understood without reading other sub-tasks
    - **Focused**: Has a single, clear purpose
    - **Testable**: Has clear success criteria
    - **Properly scoped**: Not too large, not too small

</step_4_create_subtask_files>

<step_5_create_coordinator>

10. Create the coordinator plan file: `.specs/{{spec-name}}-00-coordinator.md`

11. The coordinator file must contain:

    ```markdown
    # {{spec-name}} - Coordinator Plan

    ## Overview

    This coordinator plan manages the execution of sub-tasks for the parent
    specification: `{{spec-name}}.md`

    **Total Sub-Tasks**: [N] **Estimated Total Effort**: [X hours] **Parallelization
    Potential**: [High/Medium/Low]

    ## Sub-Task Index

    | Task | File               | Status  | Dependencies | Can Run In Parallel With |
    | ---- | ------------------ | ------- | ------------ | ------------------------ |
    | 01   | [descriptive-name] | Pending | None         | 02, 03                   |
    | 02   | [descriptive-name] | Pending | None         | 01, 03                   |
    | 03   | [descriptive-name] | Pending | None         | 01, 02                   |
    | 04   | [descriptive-name] | Pending | 01, 02       | None                     |
    | ...  | ...                | ...     | ...          | ...                      |

    ## Execution Strategy

    ### Phase 1: Parallel Execution (Tasks with no dependencies)

    Execute these tasks simultaneously:

    - Task 01: [brief description]
    - Task 02: [brief description]
    - Task 03: [brief description]

    **Wait for Phase 1 completion before proceeding to Phase 2**

    ### Phase 2: [Next phase name]

    [Description of what tasks can run after Phase 1 completes]

    Execute these tasks simultaneously:

    - Task 04: [brief description]

    [Continue with additional phases as needed]

    ## Dependency Graph
    ```

    [ASCII or text-based representation of task dependencies]

    Example: 01 (start) ─┐ 02 (start) ─┼─→ 04 ─→ 06 03 (start) ─┘ ↓ 05 ─→ 07

    ```
    ## Critical Path
    The longest sequence of dependent tasks (determines minimum completion time):
    - [Task] → [Task] → [Task] → [Total estimated time]

    ## Coordination Notes

    ### Conflict Prevention
    [Identify any potential conflicts between parallel tasks, such as:]
    - Tasks that modify the same files
    - Tasks that require exclusive access to resources
    - Tasks with subtle dependencies not captured in prerequisites

    ### Recommended Execution Order
    If not running in parallel, execute in this order for optimal flow:
    1. [Task NN] - [reason]
    2. [Task NN] - [reason]
    ...

    ## Progress Tracking

    ### Completion Checklist
    - [ ] Task 01: [brief description]
    - [ ] Task 02: [brief description]
    - [ ] Task 03: [brief description]
    - [ ] Task 04: [brief description]
    ...
    - [ ] All sub-tasks completed
    - [ ] Integration testing passed
    - [ ] Parent specification objectives achieved

    ## Integration Verification
    After all sub-tasks are complete, verify:
    - [ ] All sub-task success criteria met
    - [ ] Components integrate correctly
    - [ ] No conflicts or breaking changes introduced
    - [ ] All tests pass (unit + integration)
    - [ ] Code quality standards maintained
    - [ ] Parent specification goals fully achieved

    ## Rollback Strategy
    If a critical issue is discovered:
    1. Identify which sub-task(s) introduced the issue
    2. Isolate the problematic changes
    3. Determine if fix-forward or rollback is appropriate
    4. Update affected sub-task specifications with lessons learned
    ```

</step_5_create_coordinator>

</requirements>

<constraints>
- **Never create more than 10 sub-tasks** - If the specification is that large, it should be split into multiple parent specifications first
- **Never create fewer than 2 sub-tasks** - If the work is small enough for a single task, don't break it down
- **Preserve all context from the original specification** - Don't lose important details when breaking down
- **Maintain naming consistency** - Use the exact `{{spec-name}}` prefix for all sub-task files
- **Be realistic about dependencies** - Don't claim tasks can run in parallel if they modify the same files or have logical dependencies
- **Ensure proper file paths** - All sub-tasks and the coordinator should be created in the `.specs/` directory

</constraints>

<output>
Create the following files:
- `.specs/{{spec-name}}-00-coordinator.md` - Coordinator plan with dependency graph and execution strategy
- `.specs/{{spec-name}}-01-[name].md` - First sub-task specification
- `.specs/{{spec-name}}-02-[name].md` - Second sub-task specification
- `.specs/{{spec-name}}-NN-[name].md` - Continue for all sub-tasks

The coordinator must be created AFTER analyzing all sub-tasks to ensure accurate
dependency information.
</output>

<verification>
Before declaring complete, verify:
1. **Completeness**: All aspects of the original specification are covered across the sub-tasks
2. **No overlap**: Each piece of work appears in exactly one sub-task (no duplication)
3. **Clear dependencies**: The coordinator accurately represents which tasks depend on others
4. **Naming consistency**: All files follow the `{{spec-name}}-NN-[name].md` pattern
5. **Parallelization opportunities**: The coordinator explicitly identifies tasks that can run simultaneously
6. **Self-containment**: Each sub-task can be understood and executed independently
7. **Realistic scope**: Each sub-task represents a reasonable amount of work (1-3 hours)
8. **Success criteria**: Every sub-task has clear, measurable success criteria

Read each created file to confirm it follows the required format and contains
all necessary sections.
</verification>

<success_criteria>

- [ ] Original specification thoroughly analyzed
- [ ] Optimal number of sub-tasks identified (2-10, ideally 3-6)
- [ ] All sub-task files created with complete, well-structured content
- [ ] Coordinator plan created with accurate dependency graph
- [ ] Execution strategy clearly defines parallel vs. sequential tasks
- [ ] No work from original specification is lost or duplicated
- [ ] All files follow naming conventions
- [ ] Each sub-task has clear objectives, scope, and success criteria
- [ ] Dependencies are accurately identified and documented
- [ ] Coordinator provides actionable execution guidance

</success_criteria>

<examples>
Example of good sub-task breakdown for an authentication feature:

**Sub-tasks**:

1. `auth-01-database-schema.md` - Create users table, sessions table, RLS
   policies
2. `auth-02-server-utilities.md` - Server-side auth helpers, session management
3. `auth-03-login-ui.md` - Login form component and page
4. `auth-04-signup-ui.md` - Signup form component and page
5. `auth-05-protected-routes.md` - Route protection and redirect logic

**Dependencies**:

- Task 02 depends on Task 01 (needs database schema)
- Tasks 03 and 04 depend on Task 02 (need server utilities)
- Tasks 03 and 04 can run in parallel (independent UI components)
- Task 05 depends on Tasks 02, 03, 04 (needs auth system complete)

**Execution Strategy**:

- Phase 1: Task 01 (foundation)
- Phase 2: Task 02 (depends on Phase 1)
- Phase 3: Tasks 03 and 04 in parallel (depends on Phase 2)
- Phase 4: Task 05 (depends on Phase 3)

</examples>
