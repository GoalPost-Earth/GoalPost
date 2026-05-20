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

#### Proactive dispatch — run without being asked

The table above describes which agent to use for which review. The
following rules say **when** to dispatch without waiting for the user to
ask. These run automatically when the opportunity is present.

**`code-reviewer` — after every non-trivial code change.**
Dispatch once a logical unit of work is complete (a slice landed, a
feature wired, a bug fix verified). "Non-trivial" = anything beyond a
typo, a single-line tweak, or a doc-only change. Run it before
proposing a commit, so the user sees a reviewed diff rather than a raw
one. Provide the agent with the list of changed files + the goal.

**`e2e-tester` — after any user-facing change reachable in the browser.**
Dispatch whenever a UI change can be exercised end-to-end: a new page,
a new interaction (click, drawer, modal), a route change, a layout
flip, a new component visible on a route. Skip only for pure
backend / lib / kb edits with no observable surface. Run it after the
dev server has compiled the change.

**`security-reviewer` — anytime a security-sensitive file is touched.**
Dispatch automatically when an edit lands in any of these paths or
matches any of these patterns. Don't ask permission — just run it.

Security-sensitive paths (this list is the floor, not the ceiling):

- `src/app/api/auth/**` — login, signup, JWT issuance, refresh, password
- `src/app/api/auth/utils.ts` — `resolveAuthenticatedUserId`,
  `signJWT`, `verifyJWT`, `hashPassword`
- `src/app/api/me-space/**` — MeSpace invariant + ownership
- `src/lib/validation/**` — invariant + permission helpers
- `src/lib/graphql/schema/schema.gql` — `@authorization`, `@mutation`,
  `@private` directives; any change to the SDL's auth surface
- `scripts/init-db.js` — Neo4j constraints, especially anything
  enforcing ownership / uniqueness invariants
- `src/middleware.ts` (if/when added) — request-level gates

Security-sensitive patterns (regardless of path):

- Anything that reads/writes `accessToken`, `refreshToken`, `password`,
  cookie auth, bearer headers
- Anything that constructs or modifies `@authorization` filters
- Anything that touches `OWNS` / `HAS_MEMBER` relationships in Cypher
- Anything that changes how `$jwt.user.id` is consumed
- Mutations on `User`, `Person`, `MeSpace`, `WeSpace`, `SpaceMembership`
- Adding / removing `@private` fields on any type

The agent dispatch is mandatory before the commit, not as a follow-up.
A failed or "needs work" review blocks the commit until addressed.

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
