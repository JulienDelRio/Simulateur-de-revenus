---
name: doc-conventions
description: Documentation standards, language rules, and guidelines for when and how to document
---

# Skill: Documentation Conventions

Documentation standards for this project.

> **See also**: `.claude/rules/coding-style.md` (no docstrings on unchanged code), `.claude/rules/communication.md`

## Language Rules

- **Code comments**: English
- **Commit messages**: English
- **Technical docs** (architecture, API): English
- **Specification documents**: French allowed (stored in `specs/`)
- **User-facing content** (UI text, help pages): French

## When to Document

**Do document**:
- Public API endpoints (parameters, response format, error codes)
- Non-obvious business logic (why, not what)
- Architecture decisions (use ADR format in `docs/adr/`)
- Setup and deployment instructions in README

**Don't document**:
- Self-explanatory code (obvious getters, simple CRUD)
- Code you didn't write or change (see `coding-style.md`)
- Implementation details that may change frequently

## Code Comments

- Explain **why**, not **what**: `// Skip weekends because alerts are paused` not `// Check if day is Saturday or Sunday`
- Use `TODO:` for planned improvements with context: `// TODO: add pagination when property count exceeds 1000`
- Use `FIXME:` for known issues: `// FIXME: race condition when two scrapers run simultaneously`
- Never leave commented-out code — delete it (it's in git history)

## Documentation File Structure

```
docs/
  specs/          # Feature specifications (French)
  adr/            # Architecture Decision Records (English)
```

<!-- TODO: expand structure when more doc categories are needed -->

## Architecture Decision Records (ADR)

Use for significant technical decisions. Format:

```markdown
# ADR-NNN: Title

## Status
Proposed | Accepted | Deprecated | Superseded by ADR-XXX

## Context
What is the problem or situation?

## Decision
What was decided and why?

## Consequences
What are the trade-offs and implications?
```

## README

- Keep the root README focused: what the project does, how to set it up, how to run it
- No duplication of information available elsewhere (link to `docs/` instead)

<!-- TODO: flesh out README template when stack is chosen and first features are built -->
