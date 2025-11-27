---
argument-hint: [spec-name] [label] [notes]
description: Create manageable GitHub issues from a larger spec file.
model: haiku
---

<purpose>
    Given a spec-file, create a set of manageable GitHub issues as described in example-output that another LLM can work through to implement the desired feature.
<purpose>

<instructions>
    <instruction>Read the entire spec-file to understand the context and goal.</instruction>
    <instruction>Review the current state of the application to understand what needs to be changed.</instruction>
    <instruction>Divide the plan into small stories that can be implemented independently in a reasonable amount of time.</instruction>
    <instruction>Write those stories in the JSON structure of the example-output.</instruction>
    <instruction>Do not include any other output.</instruction>
    <instruction>Save the output in @specs\{{spec-name}}.json</instruction>
    <instruction>If there are notes in the notes section, consider them before proceeding.</instruction>
</instructions>

<example-output>
    ```json
    {
        "issues": [
            "issue_1": {
                "title": "{{label}}: First story to implement",
                "body": {
                    "user-story": "As a {person benefiting from this feature}, I want {this feature}, so that {reason I want this feature}",
                    "acceptance-criteria": "numbered list of acceptance criteria to call this feature complete",
                    "notes": "any additional information that will help guide the developers in implementing this feature"
                },
                "assignees": [
                    "manwithoutsleep"
                ],
                "labels": [
                    "enhancement",
                    "{{label}}"
                ]
            },
            "issue_2": {
                "title": "{{label}}: Second story to implement",
                "body": {
                    "user-story": "As a {person benefiting from this feature}, I want {this feature}, so that {reason I want this feature}",
                    "acceptance-criteria": "numbered list of acceptance criteria to call this feature complete",
                    "notes": "any additional information that will help guide the developers in implementing this feature"
                },
                "assignees": [
                    "manwithoutsleep"
                ],
                "labels": [
                    "enhancement",
                    "{{label}}"
                ]
            }
        ]
    }
    ```
</example-output>

<spec-file>
    {{spec-name}}
</spec-file>

<notes>
    {{notes}}
</notes>
