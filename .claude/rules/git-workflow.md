# Git Workflow

## Commits
- Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`
- Subject line under 72 characters

## Branching Model
- **`main`** — production-ready, stable code
- **`develop`** — integration branch for ongoing development
- **`feature/*`** — feature branches created from `develop`
- Feature branches target `develop` for PRs
- `develop` is merged into `main` via PR when a version is ready for release
- Never force-push to `main` or `develop`

## Branch Naming
- Format: `feature/us-xxx-description` or `feature/description`

## Remote Operations
- Remote git commands are allowed (`git push`, `git pull`, `git fetch`, `gh pr create`, etc.)
- SSH is configured via PuTTY/Pageant — no special handling needed
- Still confirm before force-push or destructive remote operations

## Worktrees

- Use git worktrees for parallel work: spin up multiple worktrees, each running its own Claude session
- Worktrees live in `.claude/worktrees/` (managed by Claude Code's `/worktree` command)
- Useful patterns: one worktree per feature, a dedicated "analysis" worktree for read-only tasks (logs, queries)

## Pull Requests
- Title under 70 characters
- Include a Summary section with 1-3 bullet points
- Include a Test Plan section
