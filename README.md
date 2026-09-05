# GoalPost

**GoalPost is a community-first, privacy-respecting platform for mutual aid,
collective sense-making, and relational depth.**

It reimagines how people share knowledge, resources, goals, and support through
a graph-based approach to relationships and meaning-making — prioritizing user
data sovereignty, deep interpersonal connection, and AI-powered discovery of
meaningful semantic connections between contributions.

Open source under Apache-2.0, stewarded by Genius Cooperative.

> **Status: Prototype 1.8 — active development.** Features are landing and
> changing. The public production instance still runs v1; 1.8 will replace it.
> Please report issues — see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Core ideas

GoalPost has its own vocabulary, and it is worth two minutes before reading the
code. The full set is in [`kb/01-glossary.md`](kb/01-glossary.md).

- **Pulse** — the first-class unit of contribution. A sensed shift or resonance.
  Goals, resources, stories, care points, and core values are all pulse types.
- **FieldContext** — a thematic container that groups related pulses.
- **Space** — the privacy boundary that owns FieldContexts. A **MeSpace** is
  personal and private; a **WeSpace** is collaborative with membership roles.
  **All content access flows through Spaces.**
- **Resonance** — a semantic connection discovered between pulses, surfaced by AI
  and confirmed by humans.

## Tech stack

| Layer           | Technology                                              |
| --------------- | ------------------------------------------------------- |
| Framework       | Next.js 16 + React 19 + TypeScript                      |
| UI              | Radix UI + Tailwind CSS v4 + shadcn                     |
| Database        | Neo4j (graph) with vector indexes                       |
| API             | GraphQL (Apollo Client, GraphQL Yoga) + REST routes     |
| AI / LLM        | OpenAI, Google Gemini, Vercel AI SDK, LangChain         |
| Background jobs | Vercel Cron Jobs                                        |
| Email           | Resend                                                  |
| Visualization   | Neo4j NVL, D3.js, Three.js, XYFlow                      |

There is **no relational database**. GoalPost is Neo4j and Cypher throughout.

---

## Quick start

### Prerequisites

- **Node.js 20.9 or higher** (required by Next.js 16)
- **Git**
- **A Neo4j database** — this is the only hard requirement. Either
  [Neo4j Aura](https://neo4j.com/cloud/platform/aura-graph-database/) (free tier
  is fine) or a local instance.

Everything else is optional and degrades gracefully. See
[Configuration](#configuration).

### Setup

```bash
git clone https://github.com/GoalPost-Earth/GoalPost.git
cd GoalPost
npm install

cp .env.example .env.local   # then fill it in — see Configuration below

npm run init:db              # creates constraints + vector indexes (required)
npm run dev
```

The app runs at http://localhost:3000.

> **`npm run init:db` is required, not optional.** It creates the ~34 uniqueness
> constraints and vector indexes the app depends on — including the invariants
> that enforce one MeSpace per owner and unique person emails. It does **not**
> load content. For sample content, run `npm run load:sample-data` and
> `npm run seed:user` afterwards.

> **Gotcha:** the app reads `NEO4J_USERNAME`, but `scripts/init-db.js` reads
> `NEO4J_USER` (defaulting to `neo4j`). If your Neo4j username is anything other
> than `neo4j`, set **both** variables.

**Contributors:** fork the repo and open a pull request — no permission or commit
access needed. If you are working alongside the maintainers, ask about the shared
dev instance instead of standing up your own. See
[CONTRIBUTING.md](CONTRIBUTING.md).

---

## Configuration

Copy [`.env.example`](.env.example) to `.env.local` — it documents every variable
inline, including the ones with sharp edges. The essentials:

### Required

| Variable                              | Notes                                                       |
| ------------------------------------- | ----------------------------------------------------------- |
| `NEO4J_URI` / `NEO4J_USERNAME` / `NEO4J_PASSWORD` | Your Neo4j connection.                           |
| `JWT_SECRET`                          | Signs auth tokens. Generate with `openssl rand -base64 48`.  |
| `PEPPER`                              | Password hashing pepper. `openssl rand -base64 32`.          |
| `NEXT_PUBLIC_BASE_URL`                | `http://localhost:3000` for local dev.                       |

> `JWT_SECRET` must be a **single-line random string**, not a PEM key — HS256
> signing breaks otherwise, and the failure mode is a confusing 401 storm rather
> than a clean error. Use the same value across every environment so tokens
> issued in one verify in another.

### Optional — features that switch off cleanly if unset

| Capability            | Variables                                                            | Without it                          |
| --------------------- | -------------------------------------------------------------------- | ----------------------------------- |
| AI assistant & embeddings | `OPENAI_API_KEY`, `OPENAI_ASSISTANT_MODEL`                       | No assistant, no resonance discovery |
| PDF document ingestion | `GOOGLE_GENERATIVE_AI_API_KEY`, `GEMINI_INGEST_*`                   | No PDF extraction                   |
| Document blob storage | `AWS_REGION`, `S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | Set `INGEST_BLOB_BACKEND=memory` for local testing |
| Transactional email   | `RESEND_API_KEY`, `NEXT_PUBLIC_EMAIL_FROM`                           | No password reset or invite emails  |
| Rate limiting         | `KV_REST_API_URL`, `KV_REST_API_TOKEN` (Upstash via Vercel Marketplace) | Auth limiters fail open, but invites/member-adds are DENIED (fail-closed) — see `src/lib/auth/rate-limit.ts` |
| Cron authentication   | `CRON_SECRET`                                                        | Every `/api/cron/*` route returns 401 — they are all fail-closed |

GoalPost currently uses proprietary models (OpenAI for the assistant and
embeddings, Gemini for PDF ingestion). Moving to self-hosted small language
models is an explicit direction, gated on hosting cost.

---

## Self-hosting

Nearly all functionality can be self-hosted. You need a Neo4j database; you
configure email and AI only if you want those features.

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/GoalPost-Earth/GoalPost)

Deploying to Vercel requires setting the environment variables above in your
project settings — the button alone will not produce a working instance without
a database.

`vercel.json` registers two cron jobs: resonance discovery (daily) and AI
feedback classification (daily).

---

## Environments

| Environment    | Branch | Purpose                                                                       |
| -------------- | ------ | ----------------------------------------------------------------------------- |
| **dev**        | `dev`  | Active development. Disposable Neo4j Aura instance, wiped and reseeded freely. |
| **demo**       | `demo` | Stable. What gets shown to the community. Promoted from `dev` roughly weekly.  |
| **production** | `main` | GoalPost v1 with original data. To be replaced by 1.8.                          |

Every pull request gets an automatic **Vercel preview deploy**, so changes can be
exercised in a real environment before they touch dev or demo.

---

## Authentication

Custom JWT-based auth with refresh token rotation: registration, login, password
reset by email, session management, automatic token refresh, and secure logout.
Passwords are hashed with bcrypt plus a server-side pepper.

Self-service signup can be disabled for invite-only onboarding by setting
`NEXT_PUBLIC_DISABLE_SIGNUP=true`.

---

## Scripts

| Command                      | What it does                                            |
| ---------------------------- | ------------------------------------------------------- |
| `npm run dev`                | Start the dev server                                    |
| `npm run build` / `start`    | Production build / serve                                |
| `npm test`                   | Jest test suite                                         |
| `npm run lint`               | ESLint                                                  |
| `npm run codegen`            | Regenerate GraphQL types (watch mode)                   |
| `npm run init:db`            | Create Neo4j constraints and vector indexes             |
| `npm run load:sample-data`   | Load sample ontology data                               |
| `npm run seed:user`          | Create an initial user with a MeSpace                   |
| `npm run setup:env`          | Guided full environment setup                           |
| `npm run workers`            | Run background job workers                              |

Migration, backfill, and cloning scripts are listed in `package.json`; see
[`kb/08-migration.md`](kb/08-migration.md) before running any of them.

---

## Documentation

`kb/` is the canonical knowledge base — for humans and for AI coding agents
alike. Read the relevant file before working on a feature.

| File                                                   | Contents                                                    |
| ------------------------------------------------------ | ----------------------------------------------------------- |
| [`kb/01-glossary.md`](kb/01-glossary.md)               | GoalPost terminology — pulse, resonance, FieldContext, Space |
| [`kb/02-user-roles.md`](kb/02-user-roles.md)           | Space-based permissions model                               |
| [`kb/03-workflows.md`](kb/03-workflows.md)             | Core workflows                                              |
| [`kb/04-state-machines.md`](kb/04-state-machines.md)   | Entity states and transitions                               |
| [`kb/05-data-entities.md`](kb/05-data-entities.md)     | Full data model — nodes, fields, relationships, indexes      |
| [`kb/06-adr.md`](kb/06-adr.md)                         | Architecture decisions                                      |
| [`kb/07-ai-assistant-ux.md`](kb/07-ai-assistant-ux.md) | AI assistant UX conventions                                 |
| [`kb/08-migration.md`](kb/08-migration.md)             | Prod-to-dev database migration                              |
| [`kb/09-feedback-triage.md`](kb/09-feedback-triage.md) | Turning community feedback into tickets                     |

Also: [`CLAUDE.md`](CLAUDE.md) — project context and conventions for AI coding
agents. [`UAT-GUIDE.md`](UAT-GUIDE.md) — user acceptance testing scenarios.
`docs/` holds support artifacts only (Cypher snippets, the OWL ontology, example
TSX).

---

## Contributing

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for how to report bugs, propose
features, set up, and get a change merged.

## License

Apache-2.0. See [LICENSE](LICENSE).
