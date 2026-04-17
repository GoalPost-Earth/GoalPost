# TDX Mobile App

## What This Is

TDX is an agricultural commodity aggregation and trading platform operating in Ghana. It coordinates sourcing from smallholder farmers, instant payment (MTN MoMo), inventory consolidation, resale to institutional buyers, and delivery logistics.

This repository is the **mobile field operations app** used by Field Agents, Aggregators, Cash Point Agents, and Sourcing Officers.

## Project Structure

```
/
├── CLAUDE.md               # This file — mobile app context
├── kb/                     # Shared domain knowledge (all packages read this)
├── .claude/                # Claude Code tools (commands, agents, settings)
│   ├── commands/           # /fix, /implement, /new-component, /commit
│   ├── agents/             # security-reviewer, code-reviewer, e2e-tester
│   └── settings.json       # Permissions, hooks
├── frontend/               # React + Vite mobile PWA
│   ├── CLAUDE.md           # Frontend-specific instructions
│   ├── kb/                 # Frontend-specific knowledge
│   ├── src/
│   └── package.json
└── backend/                # NestJS API (not yet implemented)
    ├── CLAUDE.md           # Backend-specific instructions
    ├── kb/                 # Backend-specific knowledge (ADRs, RBAC matrix, API architecture)
    └── package.json
```

## Shared Knowledge Base

Domain knowledge shared across all packages lives in `kb/`. Read the relevant file before working on any feature.

| File | Contents |
|------|----------|
| `kb/01-glossary.md` | TDX-specific terms (aggregation, voucher, session, etc.) |
| `kb/02-user-roles.md` | Mobile app roles: Field Agent, Aggregator, Cash Point, Sourcing Officer |
| `kb/03-workflows.md` | Core workflows (aggregation, verification, payment, voucher redemption) |
| `kb/04-state-machines.md` | Entity states, transitions, status labels and colors |
| `kb/05-data-entities.md` | Full data model — all entities, fields, relationships |
| `kb/06-adr.md` | Platform-wide architecture decisions |

Each package also has its own `kb/` with package-specific knowledge.

## Claude Code Tools

Project-level commands and agents in `.claude/`:

| Tool | Type | Purpose |
|------|------|---------|
| `/fix` | Command | Root cause bug fixing — find cause, assess impact, fix properly, verify |
| `/implement` | Command | Feature implementation — gather requirements, analyze codebase, implement, verify |
| `/new-component` | Command | Scaffold React component with TDX conventions (shadcn, Tailwind, <400 lines) |
| `/commit` | Command | Commit using Conventional Commits: `type(scope): description` |
| `security-reviewer` | Agent | Audit MoMo payments, JWT auth, RBAC, sync, and input validation |
| `code-reviewer` | Agent | Review against coding conventions, domain correctness, and RBAC compliance |
| `e2e-tester` | Agent | Browser E2E testing via Chrome DevTools MCP |

## Mandatory Rules

### KB — You MUST read before working

Do NOT write code without reading the relevant KB files first. This is non-negotiable.

| If you are working on... | You MUST read |
|--------------------------|---------------|
| Any feature | `kb/01-glossary.md` — use correct TDX terminology |
| Anything involving roles, permissions, or auth | `kb/02-user-roles.md` + `backend/kb/02-rbac-matrix.md` |
| Any workflow (aggregation, payment, voucher) | `kb/03-workflows.md` |
| Any entity status, badge, or state transition | `kb/04-state-machines.md` |
| Any data model, field, or relationship | `kb/05-data-entities.md` |
| Architecture decisions or trade-offs | `kb/06-adr.md` |
| Frontend components or pages | `frontend/CLAUDE.md` + `frontend/kb/02-design-system.md` |
| Status badges, colors, or available actions | `frontend/kb/03-status-display.md` |
| Backend modules or API endpoints | `backend/CLAUDE.md` + `backend/kb/01-backend-adr.md` |

### Commands — You MUST use the right command for the task

| If you are asked to... | You MUST use |
|------------------------|-------------|
| Fix a bug | `/fix` — never skip root cause analysis |
| Implement a feature | `/implement` — never skip requirements gathering |
| Create a frontend component | `/new-component` — never scaffold manually |
| Commit changes | `/commit` — always use Conventional Commits format |

### Agents — You MUST dispatch the right agent

| If you are doing... | You MUST dispatch |
|--------------------|-------------------|
| Reviewing code quality or conventions | `code-reviewer` agent |
| Reviewing security (payments, auth, RBAC, sync) | `security-reviewer` agent |
| Running E2E browser tests | `e2e-tester` agent |

### Things you MUST NOT do

- Do NOT invent terminology — use `kb/01-glossary.md` terms exactly
- Do NOT guess state transitions — check `kb/04-state-machines.md`
- Do NOT hardcode roles or permissions — check `backend/kb/02-rbac-matrix.md`
- Do NOT use USD or $ — this platform uses GHS (Ghana Cedis) only
- Do NOT skip RBAC guards on any backend endpoint
- Do NOT skip audit logging on any mutation
- Do NOT create components over 400 lines
- Do NOT commit without Conventional Commits format

## Operational Context

- **Country:** Ghana
- **Currency:** GHS (Ghana Cedis)
- **Payment rail:** MTN Mobile Money (phone number = bank account) + bank transfer
- **Commodities:** Maize, Soy, Groundnut, Rice (long shelf-life cereals/grains/nuts)
- **Scale:** ~4,000 farmers, 150 agents, 20 cash point agents
- **Districts:** Ashanti, Central, Eastern, Greater Accra, Volta
- **Team:** 5-person dev team. ASAP timeline for first prod release.
