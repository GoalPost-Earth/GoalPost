---
description: Commit staged or all changes using Conventional Commits format
argument-hint: Optional commit description override
---

# Commit

Create a git commit following the Conventional Commits convention used in this project.

## Format

```
<type>(<scope>): <short description>
```

### Types

| Type | When to use |
|------|------------|
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `chore` | Build, config, tooling, dependencies — no production code change |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `style` | Formatting, whitespace — no logic change |
| `perf` | Performance improvement |
| `ci` | CI/CD pipeline changes |

### Scope (optional, use when relevant)

Use the package or area name: `frontend`, `backend`, `kb`, `harness`, or a specific module like `auth`, `payments`, `aggregator`, `field-agent`, `cashpoint`, `sourcing-officer`.

### Examples

```
feat(field-agent): add farmer onboarding form
fix(backend): prevent duplicate MoMo payment callbacks
refactor(aggregator): extract commitment creation into custom hook
chore(harness): add e2e-tester agent and Chrome DevTools MCP
docs(kb): update state machine transitions for voucher entity
test(backend): add integration tests for RBAC geographic scoping
```

## Workflow

1. Run `git status` and `git diff` to understand all changes
2. Analyze the nature of the changes (new feature, bug fix, refactor, etc.)
3. Pick the correct type and scope
4. Write a concise description (imperative mood, lowercase, no period)
5. Do NOT add Co-Authored-By or your name to the commit message
6. Stage relevant files (prefer specific files over `git add -A`)
7. Commit

If `$ARGUMENTS` is provided, use it as guidance for the commit message but still follow the format above.
