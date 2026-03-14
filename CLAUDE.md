# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static website to estimate net income from gross revenue (chiffre d'affaires → revenus nets). Targeted at French freelancers/entrepreneurs to simulate taxes, social contributions, and net take-home pay. Hosted on **GitHub Pages**.

- **License**: MIT
- **Status**: Early stage

## Language Conventions

- Code, comments, commits, branch names: **English**
- Specification documents and user-facing content: **French** allowed

## Naming Conventions

- Booleans: `is`, `has`, `can`, `should` prefixes
- Functions: verb-first (`get`, `create`, `update`, `delete`, `validate`, `handle`)
- No docstrings/comments/type annotations on unchanged code

## Code Principles

- No over-engineering: 3 similar lines > premature abstraction
- Validate only at system boundaries (user input, external APIs)
- Delete unused code completely — no backwards-compat hacks

## Git Conventions

- **Conventional Commits**: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`
- Subject line < 72 characters
- **Branches**: `feature/description`
- Stage specific files only (never `git add .` or `git add -A`)
- Run each git command in a **separate** Bash tool call (no `&&` chaining)
- Never force-push to `main`
- Never skip git hooks (`--no-verify`)

## MCP — Context7

Use the **Context7 MCP server** to fetch up-to-date documentation for libraries before using them.
Always prefer Context7 docs over training data when working with fast-moving dependencies.

## Critical Rules

### Always

- Read code before modifying it
- Consult specification documents before making assumptions

### Never

- Never prefix git commands with `cd <folder> &&` — commands already run in the project directory
- Never use `git -C <path>` — same reason
- Never chain git commands (`git add && git commit && git push`) — run them one by one
- If a git command fails because you're in the wrong directory, first `cd` back to the project root in a separate Bash call, then retry

## Task Management

- One task `in_progress` at a time
- Compact context proactively on long tasks

## Compaction

When compacting, always preserve:
- List of modified files and their purpose
- Architectural decisions made during the session
- Current task progress and remaining steps

## Specialized Agents

### Project Agents (`.claude/agents/`)

Invoke with `/agent-name` (e.g., `/code-reviewer`):

| Agent | Use case |
|-------|----------|
| `spec-reviewer` | Review specs for completeness, consistency, ambiguities |
| `code-reviewer` | Code quality, naming conventions, anti-pattern detection |
| `test-writer` | Write and run tests |
| `doc-writer` | Technical documentation from code |
| `refactorer` | Refactoring, tech debt, optimization |
| `orchestrator` | Coordinate multi-agent workflows |
| `product-owner` | Write, structure, and refine project specifications |

### Built-in Agents

Use via the Task tool with `subagent_type`:

| Agent | Use case |
|-------|----------|
| `Explore` | Codebase exploration, file/code search |
| `Plan` | Architecture and implementation planning |
| `spec-compliance-analyzer` | Verify code matches specifications |
| `ux-flow-auditor` | UX flow and interaction audits |
| `ui-accessibility-auditor` | WCAG / accessibility audits |
| `ui-mobile-rendering-auditor` | Mobile rendering checks |

## Rules Reference

Detailed rules live in `.claude/rules/`:
- `coding-style.md` — naming, formatting, patterns
- `code-quality.md` — backwards compatibility, performance
- `communication.md` — response style, corrections
- `git-workflow.md` — commits, branches, remote operations
- `task-management.md` — planning, scope control
- `security.md` — secrets management, input validation, OWASP guidelines
- `error-handling.md` — error boundaries, structured logging, retry strategy

## Shell

Working directory is already at project root. No `cd` needed.
