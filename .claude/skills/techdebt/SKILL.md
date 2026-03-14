---
name: techdebt
description: Find and report technical debt, duplicated code, and cleanup opportunities
---

# Skill: Tech Debt Review

Scan the codebase for technical debt and cleanup opportunities.

## Trigger

User invokes `/techdebt` (recommended at the end of every session or before a release).

## Steps

1. **Scan for TODOs and FIXMEs**: Search the codebase for `TODO:`, `FIXME:`, `HACK:`, `XXX:` comments
2. **Find duplicated code**: Look for repeated patterns that could be consolidated
3. **Check for dead code**: Identify unused exports, unreachable branches, orphan files
4. **Review dependencies**: Flag outdated or unused dependencies
5. **Report**: Present findings as a prioritized list:
   - **Critical**: bugs, security issues, broken functionality
   - **High**: significant duplication, missing error handling
   - **Medium**: minor duplication, inconsistent patterns
   - **Low**: style issues, minor cleanup

## Output Format

```markdown
## Tech Debt Report — <date>

### Critical
- (none or list)

### High
- (none or list)

### Medium
- (none or list)

### Low
- (none or list)

### Summary
- X items found across Y files
- Top recommendation: ...
```

## Notes

- Do not auto-fix anything — report only, let the user decide what to address
- Use subagents to parallelize scanning across different categories
- Compare against previous reports if available to track trend
