# Production → Development Migration

This is the operational and design knowledge for refreshing the dev Neo4j
database from production. Read this before re-running, modifying, or
investigating any migration script.

## TL;DR

```bash
# 1. Refresh dev from prod (wipes dev, re-fills from prod, validates parity)
npm run migrate:prod-to-dev

# 2. (Optional) Seed the GoalPost Build Space — adds a curated WeSpace
#    with the 4 core team members and ~19 sample pulses + resonances.
npm run seed:build-space
```

The migration script (`scripts/migrate-prod-to-dev.ts`) is **idempotent**,
**safe to re-run**, and **refuses to run if PROD and DEV point at the same
URI**. It preserves every prod node and edge 1:1 (with the new ontology
layered on top) and ends with a parity report that compares prod and dev
counts label-by-label and relationship-by-relationship.

The seed script (`scripts/seed-build-space.ts`) runs against dev only and
must be run **after** the migration — it references the four migrated
`:User` accounts by email (jaedagy, jesse, robert, jennifer). It's also
idempotent: re-running wipes only its own seeded content (everything with
ids prefixed `pulse_buildspace_`, `link_buildspace_`,
`resonance_buildspace_`, plus the build space itself) and re-creates it.

## Why this exists

Production has been frozen on the "reference schema" — a flat ontology of
`Goal`, `Resource`, `CarePoint`, `CoreValue`, plus auth labels
(`Person`, `User`, `Member`) and a Q&A subsystem (`Session`, `Response`).

Dev runs the "merged / pulse schema" — `FieldPulse` subtypes
(`StoryPulse`, `GoalPulse`, `ResourcePulse`) anchored in `FieldContext`
nodes under `MeSpace` / `WeSpace`, with space-based authorization. The
old labels do not exist in the dev codebase as first-class entities.

A 1:1 migration is needed periodically because:

- Real user content lives only in prod. Dev seeds are demo accounts.
- Developers need to debug against real shapes (long pulse chains,
  resonance candidates, real Communities) without touching production.
- The previous migration approach (see `scripts/migrate-reference-to-merged.ts`)
  was destructive of provenance: it transformed without preserving the
  source-label labels or the original Q&A nodes. The current script
  fixes both.

## Environment setup

The script reads from **two separate env files**:

| File | Used for | Required vars |
|------|----------|----------------|
| `.env.local` | DEV Neo4j | `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD` |
| `.env.production` | PROD Neo4j | `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD` |

Both files use the same variable names; the script parses them
separately so they don't collide on `process.env`. If only `.env.local`
is present, prod credentials are missing and the script will refuse to
run (or worse, would point both connections at the same URI — the
refusal check guards against that case).

`.env.production` is gitignored. If a teammate needs to run the
migration, get the prod creds out-of-band (1Password / shared vault) —
do not paste them in chat or commit them.

## Mapping rules

### Identity

| Prod label set | Dev label set | Notes |
|----------------|---------------|-------|
| `Person` | `Person:LifeSensor:RelationalEntity` | Contact-only person. |
| `Person:User` | `Person:User:LifeSensor:RelationalEntity` | Auth-capable. |
| `Person:Member:User` | `Person:User:Member:LifeSensor:RelationalEntity` | `:Member` is prod's auth-tier label; kept for traceability. |
| `Community` | `Community:LifeSensor:RelationalEntity` | |

### Pulse-like nodes (legacy ontology → new ontology)

| Prod label | Dev labels | Notes |
|------------|------------|-------|
| `CarePoint` | `FieldPulse:StoryPulse:CarePoint` | Merged with CoreValue into StoryPulse. Prod label kept for traceability. |
| `CoreValue` | `FieldPulse:StoryPulse:CoreValue` | Same. |
| `Goal` | `FieldPulse:GoalPulse:Goal` | |
| `Resource` | `FieldPulse:ResourcePulse:Resource` | |

For every pulse node, the prod `name` property is **mirrored** to
`content` (the dev pulse type requires `content`). This is a 1:1
schema-driven rename — no new data is invented. All other properties
(`description`, `why`, `status`, `location`, `time`, `createdAt`,
`updatedAt`, etc.) are preserved verbatim.

### Passthrough nodes

These nodes have no equivalent in the dev ontology and are migrated as-is
with their original labels: `Log`, `Session`, `Response`, `Movie`,
`Test`, `DriverTest`, `TestSource`. Their relationships
(`HAS_RESPONSE`, `NEXT`, `LAST_RESPONSE`, `CONTEXT`, `LOGGED_FOR`) are
also preserved. The dev app does not surface them — but the data is
inspectable via Cypher, which is what "no data loss" requires.

### Relationships

**All 21 prod relationship types** are migrated verbatim. The script
discovers them dynamically (`db.relationshipTypes()`) rather than
hard-coding a list, so any new prod rel-type is picked up automatically
on the next run. Edge properties are preserved.

### Structural additions in dev

The new ontology requires anchor structures that don't exist in prod.
Phase 5 creates them deterministically from prod data, following the
**pulse-placement rule**:

> A pulse created by a Person that does **not** belong to a community
> lives in that creator's **MeSpace**. A pulse that **belongs to a
> community** lives in that community's **WeSpace**; the link back to the
> author is preserved by the migrated `CREATED_BY` edge.

"Belongs to a community" means a `Community` points at the pulse in prod
via one of `EMBRACES`, `MOTIVATED_BY`, `PROVIDES`, or `HAS_ACCESS_TO`
(`COMMUNITY_PULSE_RELS` in the script). These edges migrate 1:1 in Phase
4, so Phase 5 detects community membership directly in dev.

The structures, in order:

1. **MeSpace per `:User`** (`id = 'mespace_' + person.id`), with
   `ownerId = person.id`. Owned by the User via `:OWNS`. Required by the
   `mespace_owner_unique` constraint and the one-MeSpace-per-Person
   invariant (see `kb/05-data-entities.md`).
2. **FieldContext per MeSpace** (`id = 'context_mespace_' + person.id`),
   titled "My migrated content". Anchors the owner's non-community pulses.
3. **WeSpace per `Community`** (`id = 'wespace_' + community.id`,
   `communityOriginId = community.id`, `creatorOriginId = creator.id`),
   `visibility: 'SHARED'`. Owned by the community's creator
   (`Community -[:CREATED_BY]-> Person`). The creator joins as an `ADMIN`
   `SpaceMembership`; every `BELONGS_TO` / `MEMBER_OF` person joins as a
   `MEMBER` (membership id `membership_<personId>_<communityId>`).
4. **FieldContext per community WeSpace**
   (`id = 'context_' + community.id + '_field'`), titled "<Community> Field".
5. **`HAS_PULSE` edges**:
   - community pulses → their community's FieldContext (a pulse in two
     communities is anchored in both);
   - non-community pulses created by a user → that creator's MeSpace
     FieldContext (a pulse with multiple creators lands in each).
6. **Fallback WeSpace** (`id = 'wespace_migrated_unattributed'`,
   "Migrated (unattributed)") owned by a deterministic first `:User`.
   Every pulse still unanchored after the steps above (true orphans with
   no creator and no community, plus any pulse whose only creator has no
   MeSpace) is wired into its FieldContext so nothing disappears from the
   app.

The MeSpace is required for auth even when the user has no pulses
(otherwise they can't log in cleanly).

Current prod distribution (sanity check for the parity of Phase 5):
~104 pulses → creators' MeSpaces, ~18 community pulses → 2 community
WeSpaces, ~42 orphans → the fallback WeSpace.

## Known gotchas

### `id` is not globally unique in prod

The prod schema only enforces uniqueness per-label. A prod node with
`id = "2"` can exist as a `CoreValue`, a `Community`, AND a `TestSource`
simultaneously (these are real collisions in the live data). Same with
`id = "1"` (Resource + TestSource) and `id = "3"` (CoreValue + TestSource).

**Implication for Phase 4** (relationship migration): a naive
`MATCH (a {id: $aId})` matches all three. The script avoids this by
reading the prod label set alongside the id and filtering the dev match
on overlapping labels (`devLabelsForProdLabels()` resolves prod →
dev label sets). Without this filter, a single prod edge would fan out
into multiple dev edges and the parity validation would catch it.

### Mixed `id` property types

Most prod nodes use string UUIDs, but `TestSource` uses integer ids
(`1`, `2`, `3`). The migration must not assume `typeof id === 'string'`
or it will silently skip these nodes (and lose the 3 `CONTEXT`
relationships pointing at them).

### Some prod nodes have no `id` at all

`Movie` and `DriverTest` are test fixtures with no `id` property. They
get migrated with their other properties (`title`, `working`) but can't
participate in relationship migration. Since they're orphaned in prod
(no edges), this is fine.

### Phase 1 is destructive on the dev side

The script begins with `MATCH (n) DETACH DELETE n` (batched, 5000 per
transaction). This wipes the dev DB entirely. The safety guard above
this is the URI-equality check: if `DEV_URI === PROD_URI`, the script
exits before deleting anything. Don't disable that check.

### Don't run `init-db` after migration

`scripts/init-db.js` runs `docs/cypher/seed-dev.cypher`, which starts
with its own `MATCH (n) DETACH DELETE n` and then seeds 4 demo Persons.
Running it after a migration wipes everything you just pulled from prod.

If you need both seed data and migrated data, run init-db first, then
the migration (which will wipe the seeds). Currently we choose
migration only — the migrated prod content is richer than the demo
seeds.

## Validating the result

Phase 6 of the migration prints a parity report. Every prod label must
have an equal or greater dev count, and every prod relationship type
must have the exact same count in dev. Three "merge" rows verify the
pulse renames:

```
✓ StoryPulse merge: prod(CarePoint+CoreValue)=31, dev=31
✓ GoalPulse merge: prod(Goal)=49, dev=49
✓ ResourcePulse merge: prod(Resource)=84, dev=84
```

If parity fails, the script exits non-zero. The most common failure
modes:

- A new relationship type was added in prod between runs — Phase 4
  picks them up automatically, but a typo in `devLabelsForProdLabels()`
  for a new label can drop edges silently. Audit the mapping function
  if new prod labels appear.
- Constraint violation during Phase 3 — usually means a prod node has
  an `id` that collides with another label and the script tried to
  create both as a single `:Person` (it shouldn't — each label is
  iterated independently). Check the `migrateNodesByLabel` error path.

## GoalPost Build Space seed

After a migration, you usually want a curated WeSpace to navigate against
— a place where pulses, resonances, and a known set of members already
exist, so the four-mode Studio has something interesting to render.

`scripts/seed-build-space.ts` builds exactly that. It creates:

- One WeSpace `space_buildspace` ("GoalPost Build Space"), owned by JD
  (jaedagy@gmail.com) and with Jesse, Robert, Jennifer added via
  `:HAS_MEMBER`.
- One FieldContext `context_buildspace` ("Build & Roadmap") under that
  space.
- 19 sample pulses across `GoalPulse`, `StoryPulse`, and `ResourcePulse`,
  written in the voices of the four members, about real work we've been
  doing (Studio modes, mobile responsiveness, privacy defaults, the WRC
  pilot, graph-vs-tables, the migration itself, etc.). Each pulse has
  both `CREATED_BY` and `INITIATED_BY` edges to its author so any
  resolver picks it up.
- 5 `FieldResonance` nodes (Graph-first thinking, Mobile-first design,
  Privacy and trust, Design system maturity, Real-world pilot
  learnings) with 9 `ResonanceLink` edges connecting plausible pairs of
  pulses to them.

Editing the content: the pulse list, resonance list, and member roster
are all declarative constants near the top of the script. Add a new
entry to `PULSES` or `RESONANCES` and re-run.

## Quick reference: paths

| Path | Purpose |
|------|---------|
| `scripts/migrate-prod-to-dev.ts` | Current migration. Run via `npm run migrate:prod-to-dev`. |
| `scripts/seed-build-space.ts` | Curated WeSpace + sample pulses + resonances for the 4-person team. Run via `npm run seed:build-space` after migration. |
| `scripts/migrate-reference-to-merged.ts` | Previous migration (transformative, doesn't preserve provenance). Kept for reference but not used. |
| `scripts/init-db.js` | Schema + demo seed for fresh dev DBs. Destructive — do not chain after a migration. |
| `docs/cypher/seed-dev.cypher` | Demo seed used by init-db. Not run during prod-to-dev migration. |
| `kb/05-data-entities.md` | Target ontology — read this before changing the mapping. |

## When to re-run

Re-run whenever:

- Prod has meaningful new data you want in dev.
- The dev ontology changes in a way that affects the mapping (e.g., a
  new pulse subtype is introduced).
- You've corrupted dev locally and want a clean slate from prod.

The script is fast (under a minute for the current dataset of ~450
nodes and ~1,000 edges) and the wipe is total, so there's no penalty to
running it as often as needed.
