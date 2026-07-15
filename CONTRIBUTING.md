# Contributing to GoalPost

GoalPost is a community-first, privacy-respecting platform for mutual aid,
collective sense-making, and relational depth. It is open source (Apache-2.0)
and stewarded by Genius Cooperative as part of a shared commons.

Contributions are welcome — from code, to bug reports, to "I wish it could do
this" ideas. Anyone can fork the repo and open a pull request; you do not need
permission or commit access. This guide explains where each kind of contribution
goes and how to make a change land.

If you are new here, read this file, then [README.md](README.md) for setup.

---

## Ways to contribute

Not every idea is a task, and not every task is ready to build. We sort input
into three kinds. Naming the kind up front saves a lot of back-and-forth — it
tells us whether we are fixing, scoping, or dreaming.

| Kind          | What it means                                                       | Example                                                    |
| ------------- | ------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Bug**       | Something behaves differently than it should. Has a clear "expected". | "Uploading a PDF loses the author, so attribution is gone." |
| **Feature**   | A defined capability we agree we want, scoped enough to build.       | "Import articles from a spreadsheet with author/date columns." |
| **Wish list** | Not scoped, maybe not soon, but worth having on the radar.           | "Re-rank features by who they resonate with."               |

A wish can become a feature later. The point is not to gatekeep — it is so that
a wish is never mistaken for a commitment, and a bug is never lost in a
brainstorm.

### Where to file

There are two doors, depending on who you are:

**Community members testing the app** → the **"Prototype 1.8 Issues"**
spreadsheet, maintained by Robert Damashek. One row per issue, with columns:
`Member | Context | Issue | Expected | Priority | Notes | Resolved`.
**Priority is 1 = highest, 5 = lowest.** Ask Robert for access.

**Developers and code-level issues** → **[GitHub Issues](https://github.com/GoalPost-Earth/GoalPost/issues)**.
Use the issue template, and label the kind (`bug`, `enhancement`, `wishlist`).

Maintainers reconcile both into an internal monitoring system, so nothing is
tracked in two places by hand. If you are unsure which door to use, use GitHub
Issues — we would rather move it than lose it.

### Writing a good report

Whichever door you use, include: what you expected, what happened instead, the
steps to reproduce, and your device/browser. Screenshots are worth a lot,
especially for anything visual.

---

## Before you write code: read the knowledge base

**This is not optional.** GoalPost has specific domain language and hard
architectural rules. Code that ignores them gets rejected in review, no matter
how well written it is. The `kb/` directory is the canonical source.

| If you are working on...                                | Read                        |
| ------------------------------------------------------- | --------------------------- |
| Anything at all                                         | `kb/01-glossary.md`         |
| Permissions or auth                                     | `kb/02-user-roles.md`       |
| A workflow (pulse creation, resonance, collaboration)   | `kb/03-workflows.md`        |
| Entity status or state transitions                      | `kb/04-state-machines.md`   |
| The data model — nodes, fields, relationships, indexes  | `kb/05-data-entities.md`    |
| Architecture decisions and their trade-offs            | `kb/06-adr.md`              |
| Assistant prompts, tools, or anything the AI emits      | `kb/07-ai-assistant-ux.md`  |
| The prod-to-dev database migration                      | `kb/08-migration.md`        |
| Turning community feedback into tickets                 | `kb/09-feedback-triage.md`  |

The single most common mistake is inventing terminology. A "pulse" is a specific
thing. So is a "Space", a "FieldContext", and a "resonance". Use the glossary's
words exactly — the graph, the GraphQL schema, and the AI assistant all depend
on them meaning one thing.

---

## Getting set up

Full setup lives in [README.md](README.md). Two notes for contributors:

- **You do not need to provision your own database.** Maintainers run a shared
  dev Neo4j instance with demo data that gets spun up, wiped, and reseeded
  freely. If you are working alongside the team, ask for credentials rather than
  standing one up — it is faster, and it means everyone is looking at the same
  graph. If you are contributing independently, a free Neo4j Aura instance works
  fine; see the [README](README.md).
- **You do not need AI or email keys to start.** GoalPost runs without them;
  those features degrade rather than break. See the configuration table in the
  README for what is required versus optional.

---

## The environments

There are three, and the distinction matters more than it looks:

| Environment    | Branch | What it is                                                                                      |
| -------------- | ------ | ----------------------------------------------------------------------------------------------- |
| **dev**        | `dev`  | Where active work lands. Backed by a disposable Neo4j Aura instance. Expect it to change hourly. |
| **demo**       | `demo` | **Stable.** This is what gets shown to the community and to funders. Treat it as semi-sacred.    |
| **production** | `main` | Still GoalPost v1 with the original data. Will be replaced by demo once 1.8 is ready.            |

**The rule that matters: do not push to `demo` ad hoc.** It has been demoed live
from, and an unrelated change once broke a working capability mid-demo. Changes
reach `demo` through a deliberate weekly promotion from `dev` (typically
Monday), accompanied by a written note of what was fixed and what shipped. If
you need something on demo sooner, ask — don't push.

---

## Making a change

**You do not need permission, and you do not need commit access.** GoalPost is
open source — fork it, build the thing, and open a pull request. That is the
normal path, not a lesser one.

### Fork and pull (anyone)

```bash
# Fork on GitHub, then:
git clone https://github.com/<your-username>/GoalPost.git
cd GoalPost
git remote add upstream https://github.com/GoalPost-Earth/GoalPost.git

git fetch upstream
git checkout -b fix/thing-that-broke upstream/dev   # branch from dev, not main
```

Push to your fork and open a PR against **`dev`** on `GoalPost-Earth/GoalPost`.

`dev` is the integration branch — `main` is the old v1 production line, so a PR
against `main` is almost always a mistake. Keep your fork current by pulling
`upstream/dev` and rebasing rather than merging, so your history stays readable.

For anything large or structural, open an issue first and say what you intend to
build. It is a cheap way to find out that a maintainer is already halfway
through it, or that it conflicts with something in `kb/06-adr.md`.

### If you have commit access

Branch directly from `dev` in this repo, same naming, same PR target.

### Either way

1. **Name the branch for the work:** `GOAL-123-short-slug`, or
   `fix/thing-that-broke` / `feat/thing-being-added` if there is no ticket.
2. **Keep it scoped.** A PR that does one thing gets reviewed in a day; a PR that
   does five things sits for a week.
3. **Open the PR against `dev`.** Vercel automatically builds a **preview
   deploy** for every PR — including PRs from forks — so you and reviewers can
   exercise the change in a real environment without touching dev or demo. Use
   it.
4. **Fill in the PR template.** The screenshots/video section is not optional for
   anything user-facing.
5. **Get a review**, address it, and a maintainer merges it.

Preview deploys from forks do not receive secrets, so AI, email, and upload
features will be inert there. That is expected — exercise those locally against
your own keys, and say in the PR what you verified and how.

### Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/), with the
ticket reference in the subject where one exists:

```
fix(bloom): derive legend overlay palette from shared node styles (GOAL-288)
feat(dev): seed llm-usage model table from catalog so unused models show $0
test(llm): add KNOWN_MODELS catalog + drift guard for usage metering
docs(readme): document the demo promotion cadence
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
The scope is the area touched (`bloom`, `graphql`, `assistant`, `studio`,
`pulse`, `import`, …). Write the description as what the change *does*, not what
you did.

---

## Code standards

These are what reviewers actually block on.

**Stack conventions**

- TypeScript, Next.js App Router, React 19. No Pages Router.
- UI is shadcn + Radix + Tailwind v4. Reach for an existing component before
  building one.
- **No component over 400 lines.** Split it.
- **Neo4j and Cypher only.** There is no relational database. No SQL, ever.
- Prefer **GraphQL** queries/mutations over adding REST endpoints.

**Rules with teeth**

- **Every new GraphQL type needs an `@authorization` directive.** All content
  access flows through Spaces — there is no other path. Bypassing space-based
  authorization is the one change guaranteed to be rejected.
- **Mutations must write an activity log entry.** Append-only, no exceptions.
- **Never expose raw entity IDs** (`me_…`, `ws_…`, `ctx_…`, `pulse_…`, person
  UUIDs) or internal artifacts (`__typename`, approval hashes, internal flags) in
  anything the AI assistant shows a user. See `kb/07-ai-assistant-ux.md`.
- **Don't guess state transitions.** Check `kb/04-state-machines.md`.

**UI parity — both are verified before a UI change is considered done**

- **Light and dark mode.** Light is a first-class target, not an afterthought.
  Every surface must work in light, dark, and at least one non-default theme.
- **Mobile.** Every surface must look intentional at **390px wide** — no
  horizontal overflow, no chrome overlap, compact density. Verify at 390 × 844
  in both light and dark.

A UI change that has not been checked on mobile and in dark mode is not done,
and reviewers will block on it.

**Tests and lint**

```bash
npm test          # jest
npm run lint      # eslint
```

Add tests for logic that can break silently — Cypher shape, permission gates,
data transforms. UI gets verified in the browser.

---

## Working with AI coding agents

This repo ships an **agentic harness**: `CLAUDE.md`, the `kb/` knowledge base,
and `.claude/` (commands, agents, skills). Together they give an AI coding agent
enough context to know what GoalPost is, what its terms mean, how the codebase is
organized, and what the conventions are — so agent-written changes come out
aligned instead of plausible-but-wrong.

You are welcome to use Claude Code or any other agent. Two things to know:

- **The harness is load-bearing.** If you change a convention, update the KB in
  the same PR. A stale KB actively misleads every future agent, which is worse
  than no KB.
- **You own the output.** Agent-authored code is held to exactly the same review
  bar as hand-written code. "The agent wrote it" is not a defense.

The harness also explains why the KB rules above are strict: they are read by
machines as well as people.

---

## Reciprocity

GoalPost is built as a commons, and the intent is that contributing to it is not
purely a donation of your time. Genius Cooperative is developing a mechanism for
contributors to receive reciprocity for work that feeds paid deployments and
support — the same principle by which authors of course content receive a share.

**The details are still being worked out, and nothing here is a commitment or an
offer.** It is described so that the intent is on the record, not so that anyone
contributes in expectation of payment. If this matters to you, talk to Robert
Damashek directly rather than inferring anything from this page.

---

## Questions

Open a [GitHub issue](https://github.com/GoalPost-Earth/GoalPost/issues), or ask
in your PR — maintainers would rather answer early than review the wrong thing.
Questions that reveal a gap in this guide are themselves a contribution: say so,
and we will fix the doc.
