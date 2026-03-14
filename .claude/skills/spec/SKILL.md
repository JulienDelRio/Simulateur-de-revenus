# Skill: Write Specification

Workflow to draft a specification document.

## Trigger
User invokes `/spec <feature-name>`

## Steps

1. **Interview**: Ask the user about:
   - Functional requirements and expected behavior
   - Technical constraints and dependencies
   - UX considerations (if applicable)
   - Edge cases and error scenarios
2. **Draft**: Write the spec in `docs/specs/<feature-name>.md` with this structure:
   - **Context**: Problem statement and motivation
   - **Requirements**: Numbered functional requirements
   - **Constraints**: Technical and business constraints
   - **Acceptance Criteria**: Testable conditions for completion
3. **Review**: Present the draft to the user for feedback
4. **Iterate**: Refine based on feedback until approved
