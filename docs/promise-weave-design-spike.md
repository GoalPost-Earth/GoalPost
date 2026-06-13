# Promise-Weave — Design Spike (v0 proposal)

**Status:** Proposal for discussion. **No schema, migration, or app code has been
written.** This document exists to pin the semantics of a "promise weave" before
we touch the ontology, and to surface the questions that need alignment with
**Steve's "map"** (where the concept originates).

**Source:** Goalpost Sync, 2026-06-12 (Robert Damashek). Robert's framing:
migrated **care points float with no navigable surrounding relationships**
("show surrounding relationships → there aren't any"). His proposed fix is a
**promise weave** — *"a starting point … it will contain the relationship."* JD
committed to building a starting-point version. The term appears **nowhere in the
codebase today** (0 hits for `weave` / `promiseWeave`), so this is net-new
ontology, not a script tweak.

Owner: JD · Reviewers needed: Steve (map alignment), then `cypher-reviewer` +
`security-reviewer` + `code-reviewer` once a shape is agreed.

---

## 1. The problem, precisely

A `CarePoint` migrated from prod becomes `:FieldPulse:StoryPulse:CarePoint`
(see `kb/08-migration.md`). Migration copies **all 21 prod relationship types
verbatim** (Phase 4), so the gap is **not** a migration bug — care points
genuinely lack connective tissue in the *source* graph. When a user opens one in
Bloom and asks for surrounding relationships, there is nothing to traverse.

Two existing facts shape any fix:

- **Resonance is invisible without a context edge.** A `ResonanceLink` only
  renders in a scope when a `(FieldContext)-[:HAS_RESONANCE]->(rl)` edge exists
  (the auth filter keys off it). Whatever we build must be reachable under the
  same Space/FieldContext authorization, or it won't show in Bloom either.
- **Pulses already have a placement rule.** Phase 5 of the migration anchors
  every pulse in a MeSpace or WeSpace via `CREATED_BY` / community edges. A weave
  must respect that same boundary so it inherits the right Space scope.

## 2. What a "promise weave" is (working definition)

> A **promise weave** is a connective container that gives a care point (and,
> later, any pulse) a navigable neighbourhood. It *holds* the relationships
> between a care point and the people, field, and other pulses it implicates —
> so "show surrounding relationships" has something to return, and a custom/Bloom
> view can be a starting point for exploration rather than a dead end.

Robert's "it will contain the relationship" leans toward a **node that owns
edges** (a container), not a single edge. That's the recommended interpretation
below — but see §6, this is the top question for Steve.

## 3. Design options

### Option A — `PromiseWeave` as a node (container) — **recommended**

A first-class node that fans out to the things it weaves together.

```
(:PromiseWeave {id, title?, status, createdAt, modifiedAt})
   -[:WEAVES]->        (:FieldPulse)        // the care point(s) it connects
   -[:WOVEN_FOR]->     (:Person)            // whose promise / who it concerns
   -[:WITHIN]->        (:FieldContext)      // the field it lives in (scope anchor)
   -[:WEAVES]->        (:FieldPulse)        // related / resonant pulses
(:FieldContext) -[:HAS_WEAVE]-> (:PromiseWeave)   // context edge, mirrors HAS_RESONANCE
(:Person)       -[:CREATED_BY]<- (:PromiseWeave)  // authorship, reuse existing edge
```

- **Why a node:** matches "contains the relationship"; lets a weave grow
  (add/remove woven pulses) without schema churn; gives a stable thing to open a
  drawer/Bloom view on; can carry its own `status`, embedding, and activity log.
- **Visibility:** the `(:FieldContext)-[:HAS_WEAVE]->(:PromiseWeave)` edge is the
  scope anchor — directly analogous to `HAS_RESONANCE` for resonance links — so a
  weave is visible exactly when its FieldContext (hence parent Space) is.
- **Navigability:** opening a care point → traverse `<-[:WEAVES]-(:PromiseWeave)-[:WEAVES]->`
  to reach its neighbourhood; the weave node is itself a Bloom node you can drill.

### Option B — `WEAVES` as a relationship type (edge only)

A typed edge directly between two pulses (or pulse↔person), no container node.

- Simpler; no new node, no new auth type.
- But: can't hold metadata cleanly, can't be "opened," can't group >2 things, and
  contradicts Robert's "container" framing. Resonance already occupies the
  "typed edge between two pulses" niche (`ResonanceLink` is itself reified as a
  node for exactly these reasons) — Option B would just re-learn that lesson.

**Recommendation: Option A.** It mirrors how `ResonanceLink` is already modelled
(a reified connector node with a `HAS_*` context edge for auth/visibility), so it
slots into existing Bloom scoping, the entity-info-drawer, and the migration's
Phase-5 structural-build pattern with minimal new machinery.

## 4. Authorization, mutation, activity (non-negotiables)

- **`@authorization`** — Space-scoped, mirroring the `WeSpace`/`FieldContext`
  filter: a weave is readable iff the caller owns or is a member of the parent
  Space (reached via `WITHIN → FieldContext ← HAS_CONTEXT ← Space`). No new
  unauthenticated surface.
- **`@mutation(operations: [...])`** — created by the system during migration and
  (later) by users/AI; user-facing writes route through the normal gated path.
- **Activity `Log`** — every create/update/delete writes a `:Log` row, same as
  pulses (`kb/05`, the mutation rules in `CLAUDE.md`).
- **No raw IDs** in any assistant copy that references a weave (`kb/07` Rule 1).

## 5. Migration (Phase 5 structural build) — once the shape is agreed

Synthesize a weave for each migrated care point, following the existing
**pulse-placement rule** so scope is inherited correctly:

1. For each `(:CarePoint)` (i.e. `:FieldPulse:StoryPulse:CarePoint`), create a
   `(:PromiseWeave)` and `WITHIN` → the care point's already-placed FieldContext.
2. `HAS_WEAVE` from that FieldContext (the visibility anchor).
3. `WEAVES` → the care point; `WOVEN_FOR`/`CREATED_BY` → its `CREATED_BY` person.
4. Optionally `WEAVES` → pulses the care point already resonates with (reuse
   migrated `ResonanceLink` SOURCE/TARGET) so the neighbourhood is non-empty.
5. Idempotent + counted (the migration asserts per-phase counts, e.g.
   `StoryPulse merge: prod=31, dev=31`), runnable as an additive phase.

This is **additive** — it doesn't alter migrated nodes/edges, so re-running is
safe and the existing phases are untouched.

## 6. Open questions (need Steve / JD before any code)

1. **Node or edge?** Does Steve's map model a promise weave as a container
   (Option A) or a relationship (Option B)? Recommendation is A — confirm.
2. **Naming.** Are `PromiseWeave` / `WEAVES` / `WOVEN_FOR` / `HAS_WEAVE` /
   `WITHIN` the right names, or does the map already have canonical terms we must
   match for forward-compatibility?
3. **Scope of "promise".** Is a weave specific to *care points / promises*, or the
   general connective primitive for *any* pulse neighbourhood? (Affects whether it
   replaces or complements `ResonanceLink`.)
4. **Lifecycle / state machine.** Does a weave need states (e.g.
   proposed → active → fulfilled / dissolved), or is it stateless structure? If
   stateful, it needs a `kb/04-state-machines.md` entry.
5. **Who authors weaves post-migration?** AI (resonance-style discovery), users
   (explicit), or both? Determines the HITL + tool surface.
6. **Relationship to resonance.** Should a weave *wrap* existing `ResonanceLink`s,
   or is it an independent layer? (Avoid two parallel "connection" concepts that
   confuse the graph.)

## 7. Proposed KB additions (DRAFT — promote only after §6 is settled)

> These are drafts to be moved into the canonical `kb/` files once the shape is
> agreed. They are intentionally **not** committed to `kb/` yet.

**`kb/01-glossary.md` (draft):**

> **PromiseWeave** — A connective container node that gives a pulse (initially a
> care point) a navigable neighbourhood, holding the relationships between it and
> the people, FieldContext, and related pulses it implicates. Originates in
> Steve's relational "map." Visible within its FieldContext's Space via a
> `HAS_WEAVE` context edge, analogous to how `ResonanceLink` is surfaced via
> `HAS_RESONANCE`.

**`kb/05-data-entities.md` (draft):**

> ### PromiseWeave
> **Neo4j Labels:** `["PromiseWeave"]`
>
> | Field | Type | Notes |
> | ----- | ---- | ----- |
> | id | string | Unique, `weave_*` prefix |
> | title | string | Optional, human label |
> | status | string | Optional — see state machine (TBD) |
> | createdAt | datetime | |
> | modifiedAt | datetime | |
>
> **Relationships:** `WEAVES` → FieldPulse (1..n) · `WOVEN_FOR` → Person ·
> `WITHIN` → FieldContext · `HAS_WEAVE` ← FieldContext (scope anchor) ·
> `CREATED_BY` → Person.

**`kb/04-state-machines.md` (draft, only if §6.4 = stateful):**

> PromiseWeave: `proposed → active → (fulfilled | dissolved)`. Transitions
> logged; AI-proposed weaves start `proposed` and require HITL confirmation to
> become `active` (mirrors `ResonanceLink` pending/confirmed/rejected).

## 8. Sequencing once approved

1. Settle §6 with Steve → finalize names + node/edge decision.
2. KB-first: promote the §7 drafts into `kb/01`, `kb/05`, and (if stateful)
   `kb/04`. **Mandatory before code.**
3. `schema.gql`: new `PromiseWeave` type + `@authorization` (Space-scoped) +
   `@mutation` + relationships. → `security-reviewer`.
4. `scripts/migrate-prod-to-dev.ts`: additive Phase-5 structural build (§5);
   update `kb/08-migration.md`. → `cypher-reviewer`.
5. Bloom/graph: ensure the `HAS_WEAVE` context edge is drawn so weaves render and
   are drillable (reuse the resonance-scoping pattern). → `e2e-tester`.
6. Verify: open a previously-floating care point in Bloom → surrounding
   relationships now render and are navigable; assistant "show surrounding
   relationships" returns the weave.

---

_Tracking: relates to Jira GOAL-266 (distinguish AI-generated StoryPulses /
promise-weave). This spike is the precursor to that work._
