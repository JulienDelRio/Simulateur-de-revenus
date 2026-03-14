# Skill: Fix Issue

Workflow to fix a GitHub issue.

## Trigger
User invokes `/fix-issue <issue-number>`

## Steps

1. **Read the issue**: Run `gh issue view <number>` to get full context
2. **Analyze**: Identify the root cause and affected areas
3. **Search**: Find relevant files with Grep/Glob
4. **Plan**: For non-trivial fixes, enter plan mode
5. **Implement**: Apply the minimal fix that resolves the issue
6. **Test**: Run existing tests to verify nothing is broken
7. **Commit**: Create a descriptive commit referencing the issue (`fix: ... (#<number>)`)
8. **Provide push command**: Print the `git push` command for the user to run manually (never execute remote commands)
