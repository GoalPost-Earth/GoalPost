# GoalPost

## What This Is

GoalPost is a community-first, privacy-respecting digital platform for mutual aid, collective sense-making, and relational depth. It reimagines how people share knowledge, resources, goals, and support through a graph-based approach to relationships and meaning-making.

The platform prioritizes user data sovereignty, deep interpersonal connection, and AI-powered resonance discovery — finding meaningful semantic connections between user contributions.

## Project Structure

```
/
├── CLAUDE.md               # This file — project-wide context
├── kb/                     # Shared domain knowledge (read before working)
├── docs/                   # Detailed documentation (70+ files)
├── .claude/                # Claude Code tools (commands, agents, settings)
│   ├── commands/           # /fix, /implement, /new-component, /commit
│   ├── agents/             # security-reviewer, code-reviewer, e2e-tester
│   └── settings.json       # Permissions, hooks
├── src/
│   ├── app/                # Next.js App Router (pages + API routes)
│   │   ├── api/            # REST + GraphQL endpoints
│   │   ├── auth/           # Auth pages (login, signup, reset)
│   │   └── protected/      # Protected routes (dashboard, spaces, profile, assistant, graph, search)
│   ├── components/         # React components (auth, dashboard, spaces, assistant-ui, chat, persons, canvas, ui)
│   ├── lib/                # Business logic (graphql, neo4j, llm, simulation, jobs, resonance, permissions, imports)
│   ├── hooks/              # Custom React hooks
│   ├── contexts/           # React contexts (auth, theme, page state)
│   ├── modules/            # Feature modules (agent)
│   ├── types/              # TypeScript type definitions
│   ├── gql/                # Generated GraphQL types
│   ├── constants/          # App constants
│   ├── config/             # Configuration files
│   └── utils/              # Utilities
├── scripts/                # Database init, seed, migration scripts
├── package.json            # Dependencies & scripts
└── .env.example            # Environment variable template
```

## Tech Stack

| Layer           | Technology                                              |
| --------------- | ------------------------------------------------------- |
| Framework       | Next.js 16 + React 19 + TypeScript                      |
| UI              | Radix UI + Tailwind CSS v4 + shadcn                     |
| Database        | Neo4j (graph database) with vector indexes              |
| API             | GraphQL (Apollo Client, GraphQL Yoga) + REST API routes |
| AI/LLM          | OpenAI API, Vercel AI SDK, LangChain                    |
| Background Jobs | Vercel Cron Jobs                                        |
| Email           | Resend                                                  |
| Visualization   | D3.js, Three.js, XYFlow, Neo4j NVL                      |

## Shared Knowledge Base

Domain knowledge lives in `kb/`. Read the relevant file before working on any feature.

| File                      | Contents                                                                     |
| ------------------------- | ---------------------------------------------------------------------------- |
| `kb/01-glossary.md`       | GoalPost-specific terms (pulse, resonance, FieldContext, Space, etc.)        |
| `kb/02-user-roles.md`     | Space-based permissions model (MeSpace owner, WeSpace roles)                 |
| `kb/03-workflows.md`      | Core workflows (pulse creation, resonance discovery, collaboration)          |
| `kb/04-state-machines.md` | Entity states and transitions (GoalPulse status, ResonanceLink status)       |
| `kb/05-data-entities.md`  | Full data model — all Neo4j nodes, fields, relationships, indexes            |
| `kb/06-adr.md`            | Architecture decisions (graph-first, pulse-first, space-based privacy, etc.) |
| `kb/07-ai-assistant-ux.md` | AI assistant UX conventions — raw-ID prohibition, SESSION CONTEXT shape, tool design, HITL gate, model choice |

Additional documentation in `docs/` covers architecture diagrams, ontology, resonance system, assistant modes, and more.

## Claude Code Tools

Project-level commands and agents in `.claude/`:

| Tool                | Type    | Purpose                                                                           |
| ------------------- | ------- | --------------------------------------------------------------------------------- |
| `/fix`              | Command | Root cause bug fixing — find cause, assess impact, fix properly, verify           |
| `/implement`        | Command | Feature implementation — gather requirements, analyze codebase, implement, verify |
| `/new-component`    | Command | Scaffold React component with GoalPost conventions (shadcn, Tailwind, <400 lines) |
| `/commit`           | Command | Commit using Conventional Commits: `type(scope): description`                     |
| `security-reviewer`   | Agent   | Audit auth, JWT, space permissions, input validation (uses neo4j MCP)             |
| `code-reviewer`       | Agent   | Review conventions, domain correctness, permissions (uses neo4j, shadcn, context7 MCPs) |
| `e2e-tester`          | Agent   | Browser E2E testing (uses chrome-devtools, neo4j MCPs for data verification)      |
| `test-writer`         | Agent   | Write & run tests for Next.js + Neo4j + GraphQL (uses neo4j, context7 MCPs)      |
| `cypher-reviewer`     | Agent   | Audit raw Cypher and `@cypher` SDL blocks for safety, perf, Space-scope, activity logs |
| `jira-story-writer`   | Agent   | Draft and create well-structured Jira stories for project `GOAL` via the Jira MCP |
| `prod-database-agent` | Agent   | Investigate prod Neo4j data issues; proposes Cypher fixes that require explicit user confirmation |

## Mandatory Rules

### KB — You MUST read before working

Do NOT write code without reading the relevant KB files first. This is non-negotiable.

| If you are working on...                                | You MUST read                                          |
| ------------------------------------------------------- | ------------------------------------------------------ |
| Any feature                                             | `kb/01-glossary.md` — use correct GoalPost terminology |
| Anything involving permissions or auth                  | `kb/02-user-roles.md`                                  |
| Any workflow (pulse creation, resonance, collaboration) | `kb/03-workflows.md`                                   |
| Any entity status or state transition                   | `kb/04-state-machines.md`                              |
| Any data model, field, or relationship                  | `kb/05-data-entities.md`                               |
| Architecture decisions or trade-offs                    | `kb/06-adr.md`                                         |
| Assistant prompts, tools, chat routes, or anything the model emits to a user | `kb/07-ai-assistant-ux.md`              |

### Commands — You MUST use the right command for the task

| If you are asked to...      | You MUST use                                       |
| --------------------------- | -------------------------------------------------- |
| Fix a bug                   | `/fix` — never skip root cause analysis            |
| Implement a feature         | `/implement` — never skip requirements gathering   |
| Create a frontend component | `/new-component` — never scaffold manually         |
| Commit changes              | `/commit` — always use Conventional Commits format |

### Agents — You MUST dispatch the right agent

| If you are doing...                                          | You MUST dispatch           |
| ------------------------------------------------------------ | --------------------------- |
| Reviewing code quality or conventions                        | `code-reviewer` agent       |
| Reviewing security (auth, JWT, permissions)                  | `security-reviewer` agent   |
| Reviewing Cypher (raw strings or `@cypher` SDL blocks)       | `cypher-reviewer` agent     |
| Running E2E browser tests                                    | `e2e-tester` agent          |
| Writing or running tests                                     | `test-writer` agent         |
| Drafting / creating Jira stories for the `GOAL` project      | `jira-story-writer` agent   |
| Investigating a prod Neo4j data inconsistency                | `prod-database-agent` agent |

### Jira workflow — status transitions are MANDATORY

Whenever work in a session is tied to a Jira issue (`GOAL-N`):

1. **When you START working on the issue** → transition it to **In Progress**.
2. **When you FINISH the work in this session** (the implementation is done
   and ready for human/QA review) → transition it to **Review**.

This applies to every Claude-driven workflow that touches a Jira issue —
`/fix`, `/implement`, ad-hoc edits, story splits, etc. The downstream board
states (`Verified By QA`, `Done`) are owned by humans; never move an issue
into those states yourself.

Mechanics:

```
# Discover the cloudId once per session
mcp__jira__getAccessibleAtlassianResources

# Look up the right transition id for the current state
mcp__jira__getTransitionsForJiraIssue
  cloudId: <discovered>
  issueIdOrKey: "GOAL-N"

# Apply it
mcp__jira__transitionJiraIssue
  cloudId: <discovered>
  issueIdOrKey: "GOAL-N"
  transition: { id: "<id from previous step>" }
```

If the issue is already past the target state (e.g. already in `Review`),
leave it alone — don't move it backwards.

Board flow: `(Any) → In Progress → Review → Verified By QA → Done`.

### Things you MUST NOT do

- Do NOT invent terminology — use `kb/01-glossary.md` terms exactly
- Do NOT guess state transitions — check `kb/04-state-machines.md`
- Do NOT bypass Space-based authorization — all content access flows through Spaces
- Do NOT skip `@authorization` directives on new GraphQL types
- Do NOT skip activity logging on mutations
- Do NOT create components over 400 lines
- Do NOT commit without Conventional Commits format
- Do NOT hardcode space roles — check `kb/02-user-roles.md` for the permission model
- Do NOT use SQL — this project uses Neo4j with Cypher queries exclusively
- Do NOT add REST endpoints for things that should be GraphQL mutations/queries
- Do NOT work on a Jira issue without moving it to **In Progress** at start and **Review** when done
- Do NOT transition a Jira issue into `Verified By QA` or `Done` — those are owned by humans
- Do NOT expose raw entity IDs (`me_...`, `ws_...`, `ctx_...`, `pulse_...`, person UUIDs) or other internal artifacts (`__typename`, approval hashes, internal flags) in any AI assistant output. See `kb/07-ai-assistant-ux.md` for the full set of AI UX rules.

## Operational Context

- **Platform type:** Community collaboration / mutual aid / sense-making
- **Database:** Neo4j (graph) — no relational DB
- **Auth:** JWT-based with refresh token rotation
- **AI:** OpenAI for embeddings (text-embedding-3-small) and LLM analysis
- **Background jobs:** Vercel Cron Jobs (embedding generation, person enrichment, resonance discovery)
- **Key principle:** User data sovereignty — users control what they share via Spaces
