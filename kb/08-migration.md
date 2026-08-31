# Production → Development Migration

This is the operational and design knowledge for refreshing the dev Neo4j
database from production. Read this before re-running, modifying, or
investigating any migration script.

## TL;DR

```bash
# 1. Refresh dev from prod (wipes dev, re-fills from prod, validates parity)
npm run migrate:prod-to-dev

# 2. (Optional) Seed the sample space — adds a curated WeSpace ("Maple
#    Street Mutual Aid", wholly fictional) with the 4 member accounts and
#    ~19 sample pulses + resonances.
npm run seed:build-space
```

The migration script (`scripts/migrate-prod-to-dev.ts`) is **idempotent**,
**safe to re-run**, and **refuses to run if PROD and DEV point at the same
URI**. It preserves every prod node and edge 1:1 (with the new ontology layered
on top) **except pulses it cannot attribute to any owner**, which are dropped
(Phase 5h — see below). It ends with a parity report that compares prod and dev
counts label-by-label and relationship-by-relationship, accounting for the
intentional drop.

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
| `.env.local` | DEV Neo4j + dev password hash | `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`, `PEPPER`, `DEV_LOGIN_EMAIL`, `DEV_LOGIN_PASSWORD` |
| `.env.production` | PROD Neo4j | `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD` |

`PEPPER` (in `.env.local`) must match the dev app's `PEPPER` so the Phase 5b
dev-password reset produces a hash the login route accepts. `DEV_LOGIN_EMAIL`
and `DEV_LOGIN_PASSWORD` name the account Phase 5b resets (omit them to skip
the step). All three are dev-only and live solely in the gitignored
`.env.local`.

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
| `CarePoint` | `PromiseWeave:CarePoint` | A connector node, NOT a pulse (promise-weave design, GOAL-266). Prod label kept for traceability. |
| `CoreValue` | `FieldPulse:CoreValuePulse:CoreValue` | Was `FieldPulse:StoryPulse:CoreValue` before `CoreValuePulse` existed as a distinct type; that made migrated values render as "Story" (GOAL-287). DBs migrated under the old mapping are fixed by `npm run backfill:corevalue-labels`. |
| `Goal` | `FieldPulse:GoalPulse:Goal` | |
| `Resource` | `FieldPulse:ResourcePulse:Resource` | |

For every pulse node, the prod `name` property is **mirrored** to
`content` and `title` (the dev pulse type requires both as non-null).
This is a 1:1 schema-driven rename — no new data is invented. All other
properties (`description`, `why`, `location`, `time`, `createdAt`,
`updatedAt`, etc.) are preserved verbatim.

**Non-null schema reconciliation (Phase 3c overlay).** A few dev fields
are declared non-null but have no faithful prod equivalent. Leaving them
null/invalid is silently fatal: the single-pulse detail query selects
them, and because the root list types are `[GoalPulse!]!` etc., one bad
non-null field nullifies the *entire* GraphQL response (non-null
propagation) → the drawer shows "This entity is no longer available". The
field-context **list** query avoids this only because it selects a minimal
field set. The overlay therefore normalizes, at node-create time:

- **`status` → `GoalStatus`-valid on *every* pulse.** `GoalPulse.status` is
  `GoalStatus!` (`ACTIVE | PAUSED | COMPLETED`); `Resource`/`Story` status is a
  free `String`. But the GraphQL layer cross-reads `status` against the
  `GoalStatus` enum whenever a `FieldPulse` **interface** list is queried with a
  `... on GoalPulse { status }` fragment — so a sibling Resource/Story holding
  the legacy `"Active"`/`"Inactive"` fails enum coercion and nulls the whole
  response. Therefore `normalizeGoalStatus` is applied to **all** pulses:
  `Active→ACTIVE`, `Inactive→PAUSED`, valid values pass through; Goal also
  defaults missing/unknown → `ACTIVE`. (Detail queries should also avoid
  selecting GoalPulse-only enum fields across a heterogeneous `context.pulses`
  list — see `PULSE_DETAILS_QUERIES.ts`, which no longer fans out to siblings.)
- **`ResourcePulse.resourceType` → `String!`.** Prod `Resource` has no
  resource-type concept, so a neutral default (`'general'`,
  `DEFAULT_RESOURCE_TYPE`) is backfilled. Stewards refine later.
- **`modifiedAt`** is mirrored from `createdAt` (read by several dev
  surfaces; legacy nodes lack it — matches the seed).

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

**Personal-authorship attribution (Phase 5e2).** Pulse placement keys off
`CREATED_BY`, but in prod a person's own pulses are not always linked that
way. They are often linked by one of:

- `(Person)-[:EMBRACES|GUIDED_BY]->(CoreValue)` — values they hold,
- `(Person)-[:PROVIDES]->(Resource)` — resources they offer,
- `(Person)-[:MOTIVATED_BY]->(Goal)` — goals that drive them.

All four are equally strong "this is mine" signals. Left unattributed, those
pulses have no recognized creator and are **dropped as unattributable** (Phase
5h) instead of anchoring in the owner's MeSpace. Phase 5e2 fixes this: for any
creator-less, non-community pulse that an auth-capable `:User` embraces, is
guided by, provides, or is motivated by, it wires `CREATED_BY` **and**
`INITIATED_BY` from that user, so the standard MeSpace placement (5g) anchors it
in their MeSpace. A pulse offered/embraced by several `:User`s gains one
`CREATED_BY` per user; 5g anchors it in each MeSpace and 5g2 then splits it into
independent per-owner copies. Community-owned pulses are excluded, so a community
`EMBRACES`/`PROVIDES`/`MOTIVATED_BY` still routes to the community WeSpace
(community precedence preserved).

**`INITIATED_BY` mirror (Phase 5e3).** Migrated pulses carry only the prod
`CREATED_BY` edge, but dev surfaces (e.g. "my pulses", resonance) read
`INITIATED_BY` — the seed deliberately wires both. Phase 5e3 mirrors
`CREATED_BY → INITIATED_BY` for every pulse missing it, so migrated and
seeded content behave identically. Neither 5e2 nor 5e3 breaks Phase 6
parity (they only *add* edges; dev counts stay ≥ prod).

**Drop unattributable pulses (Phase 5h).** After community anchoring (5f),
MeSpace anchoring (5g), and the per-owner split (5g2), any `FieldPulse` that
still lacks a `HAS_PULSE` anchor cannot be tied to a real owner: no community
owns it, and it has no creator-with-MeSpace (covers pulses with no creator at
all, pulses whose only author is a non-`:User` `Person`, and pulses carrying
only structural/log edges). **Per the migration directive these are LEFT OUT of
dev — `DETACH DELETE`d, not parked in a fallback bucket.** Earlier revisions
routed them into a *"Migrated (unattributed)"* fallback WeSpace; that bucket has
been retired. Before deleting, Phase 5h records what it drops (count per node
label and per incident relationship type) and hands those maps to Phase 6 so the
parity report subtracts the intentional loss. This is the **one deliberate
exception** to the "no data loss" mandate. Invariant after 5h: **no `FieldPulse`
is left unanchored** (the drop targeted exactly that set; a nonzero remainder
aborts the run as an anchoring bug).

**Community authorship attribution (Phase 5i).** Every remaining pulse is now
anchored, but a **community** pulse linked only to a `Community` (many core
values and shared resources) can still have **no creator edge at all** — yet it
lives in a real shared WeSpace, and the UI attributes every pulse to a person
("who is this from?"). Phase 5i attributes each remaining creator-less pulse to
the **owner of its (deterministically first) space** — that space's steward —
wiring both `INITIATED_BY` and `CREATED_BY`. Personal MeSpace pulses already have
a creator (5g keys off it), so in practice this only touches community-anchored
pulses. Idempotent and add-only, so Phase 6 parity is preserved.

**Shared-pulse split (Phase 5e2 placement + Phase 5g2).** A MeSpace is a
*personal* space, so a pulse must not be a single node shared across several
MeSpaces — otherwise one owner deleting it would delete it for the others. A
core value created/embraced by multiple users (e.g. "Love" — multiple
`CREATED_BY`, or multiple person-`EMBRACES`) would otherwise land in each
owner's MeSpace as one shared node. After placement, **Phase 5g2** finds every
personal (non-community) pulse anchored in more than one MeSpace, keeps the
original for the first owner (lowest id, deterministic), and **clones it once
per additional owner** (`<id>__ms_<ownerId>`, via `apoc.create.node` copying
all labels + props). Each owner's person↔pulse edges
(`CREATED_BY`/`INITIATED_BY`/`EMBRACES`/`GUIDED_BY`) and their MeSpace
`HAS_PULSE` are **moved** onto that owner's copy, so the copies share no
relationships and are independently editable/deletable. Edges not tied to a
specific owner (e.g. a Goal's `ALIGNED_TO`) stay on the original. WeSpace
(community) pulses are intentionally shared and are never split.

Because cloning *adds* nodes, the Phase 6 merge check (`StoryPulse`/`GoalPulse`/
`ResourcePulse` exact-equality) is told the per-label clone count and asserts
`dev === prod + clones` (the moved edges are count-neutral, so relationship
parity is unaffected).

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
6. **Drop unattributable pulses** (Phase 5h). Every pulse still unanchored
   after the steps above (true orphans with no creator and no community, plus
   any pulse whose only creator has no MeSpace) is **`DETACH DELETE`d — left out
   of dev**, not bucketed. There is no longer a "Migrated (unattributed)"
   fallback WeSpace; that structure and `FALLBACK_STEWARD_EMAILS` have been
   removed. The dropped counts (by label and rel-type) feed Phase 6 so parity
   stays meaningful.

The MeSpace is required for auth even when the user has no pulses
(otherwise they can't log in cleanly).

Current prod distribution (sanity check for the parity of Phase 5):
~104 pulses → creators' MeSpaces, ~18 community pulses → 2 community
WeSpaces, and the remaining unattributable pulses (previously ~42, now fewer
since Phase 5e2 also attributes `PROVIDES`/`MOTIVATED_BY` from a `:User`) are
**dropped**. Re-run the migration to see the exact dropped count in the Phase 6
report; clean any stray edgeless fixtures with `npm run clean:orphan-pulses`.

### Phase 5b — known dev login password

After the structural build, the migration forces a known password for one
dev account so the team can always log into the freshly-migrated dev DB
without a reset flow. The target account and password come from **`.env.local`**
(`DEV_LOGIN_EMAIL`, `DEV_LOGIN_PASSWORD`) — currently `jaedagy@gmail.com` /
`password`. They are deliberately kept out of the committed script so a weak
dev password and a personal email never enter git history; if either var is
unset, Phase 5b is skipped.

It writes `Person.password` as a bcrypt hash of `password + PEPPER` (cost 12),
exactly matching `hashPassword` in `src/app/api/auth/utils.ts`, so the dev
login route verifies it. This also requires **`PEPPER` in `.env.local`** to
match the dev app's `PEPPER` — otherwise the hash won't verify and the script
warns loudly. The step is **dev-only**: the migration aborts when
`DEV_URI === PROD_URI`, so a production account can never be rewritten. To
reset a different account, change `DEV_LOGIN_EMAIL`/`DEV_LOGIN_PASSWORD`.

### Phase 5c — JD test WeSpace

After the password step, the migration rebuilds a dedicated, **single-member
test WeSpace owned solely by JD** (`jaedagy@gmail.com`): id `wespace_jd_test`,
name "JD Test Space", with a `FieldContext` (`context_jd_test_field`, "Test
Field") so it renders, and JD wired as both `:OWNS` and an `ADMIN`
`SpaceMembership` (`membership_jd_test`). Single-member **at build time** — JD
then invites a tester into it.

Its purpose is to give JD a **clean, isolated space to exercise the
invite-by-email flow**. Because GoalPost visibility flows exclusively through
shared Space membership, anyone JD invites here is visible **only to JD** —
never to other migrated users (e.g. Robert), who are not members. This is
distinct from the `seed-build-space` "Maple Street" WeSpace, which adds Robert
and Jennifer as members and therefore can't be used for isolation testing.

The step is idempotent (guarded `CREATE` + MERGEd membership), DEV-only (same
URI guard as the rest of the migration), and parity-safe — it only adds
non-prod-label nodes/edges, so Phase 6's `dev >= prod` checks still hold. The
constants live in `JD_TEST_SPACE` near the top of the script. If JD isn't in
the dataset the step warns and skips rather than aborting. To invite a tester,
log in as JD and use invite-by-email on this space.

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

Phase 6 of the migration prints a parity report. Every prod label must have a
dev count `≥ prod − dropped`, and every prod relationship type a dev count
`≥ prod − dropped`, where `dropped` is the number of nodes/edges Phase 5h left
out as unattributable (shown inline as `(−N dropped)`). The three "merge" rows
verify the pulse renames and assert the exact identity `dev = prod + clones −
dropped`:

```
✓ CoreValuePulse merge: prod(CoreValue)=31, dev=29 −2 dropped
✓ GoalPulse merge: prod(Goal)=49, dev=48 −1 dropped
✓ ResourcePulse merge: prod(Resource)=84, dev=80 −4 dropped
```

(Counts illustrative — the actual dropped numbers print at run time. Before the
"leave out unattributable" change, dev equalled prod exactly; now it is lower by
the dropped count, and that gap is expected, not a failure.)

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

## Sample space seed (Maple Street Mutual Aid)

After a migration, you usually want a curated WeSpace to navigate against
— a place where pulses, resonances, and a known set of members already
exist, so the four-mode Studio has something interesting to render.

`scripts/seed-build-space.ts` builds exactly that. **The seeded content is
wholly fictional** — a made-up neighborhood mutual-aid network, with no
real people, organizations, or pilots named in the pulse text. Authorship
is attached to the four migrated `:User` accounts (by email) only so the
space is reachable when they log in; the content does not depict their
real work. It creates:

- One WeSpace `space_buildspace` ("Maple Street Mutual Aid"), owned by JD
  (jaedagy@gmail.com) and with Jesse, Robert, Jennifer added via
  `:HAS_MEMBER`. (Ids keep the `buildspace` prefix so the seed stays
  cleanly removable; only the display names are fictional.)
- One FieldContext `context_buildspace` ("Neighborhood Board") under that
  space.
- 19 sample pulses across `GoalPulse`, `StoryPulse`, and `ResourcePulse`,
  about invented neighborhood mutual aid (a tool-lending shed, a meal-share
  rotation, a repair café, a ride board, a skills directory, a phone tree,
  etc.). Each pulse has both `CREATED_BY` and `INITIATED_BY` edges to its
  author so any resolver picks it up.
- 5 `FieldResonance` nodes (Sharing over owning, Staying reachable, Trust
  and welcome, A block's shared identity, What cadence teaches us) with 9
  `ResonanceLink` edges connecting plausible pairs of pulses to them.

Editing the content: the pulse list, resonance list, and member roster
are all declarative constants near the top of the script. Keep new content
fictional — do not reintroduce real names, orgs, or internal project
specifics. Add a new entry to `PULSES` or `RESONANCES` and re-run.

## Full DB clone (any direction) — `scripts/clone-neo4j.ts`

`migrate-prod-to-dev.ts` is a **transforming** migration: it maps the legacy
prod ontology onto the dev ontology and builds MeSpace/WeSpace anchors.
`clone-neo4j.ts` is different — it is a **raw, faithful 1:1 clone** of one
Neo4j database onto another, with no ontology mapping. Use it to replace a
target DB wholesale with the exact contents of a source DB.

```bash
# Dev → Demo (EC2 box)
npm run clone:dev-to-demo -- --confirm neo4j://3.213.48.7:7687

# Dev → Prod (when ready — see caveats below)
npm run clone:dev-to-prod -- --confirm neo4j://54.225.112.191:7687

# Demo → Dev (refresh a hollowed-out dev box from the demo dataset)
npm run clone:demo-to-dev -- --confirm neo4j+s://ee93871d.databases.neo4j.io

# Any pair
npm run clone:neo4j -- <source> <target> --confirm <targetUri>
```

**`clone:demo-to-dev` vs `migrate:prod-to-dev`.** Both end with a repopulated dev
DB, but they are not interchangeable. `migrate:prod-to-dev` *transforms* the
legacy prod ontology and builds MeSpace/WeSpace anchors; use it when you want
real prod content mapped onto the current schema. `clone:demo-to-dev` is a raw
copy of whatever the demo box currently holds — already in the dev ontology,
already anchored, and much faster — so it's the right choice when you just want
dev to look like demo (reproducing a demo-only bug, refreshing after a wipe).

Because the clone is faithful, **it also copies demo's defects**. The demo box
has historically lagged on backfills, so check after cloning:

```bash
npx tsx scripts/backfill-corevalue-pulse-labels.ts          # dry run
npx tsx scripts/backfill-corevalue-pulse-labels.ts --apply  # if it reports any
```

Cloned `Person.password` hashes stay valid only while the target's `PEPPER`
matches the one the hashes were written under. `.env.local` and the demo box
share a `PEPPER` today — a temporary convenience, not an invariant the clone
flow may rely on; if the pepper is ever forked, re-run a password reset (see
Phase 5b, or `npm run reset:dev-password` for one account) or nobody can log
into the cloned DB.

The flip side of that convenience: a faithful clone keeps **real demo users'
credentials live on dev** — their password hashes and refresh tokens all still
authenticate, and anyone holding the dev DB creds + pepper can attack the
hashes offline. After cloning, reset the handful of accounts teammates actually
need (`npm run reset:dev-password -- --email <email>`) and treat scrambling the
remaining non-team credentials as part of the clone, not an optional cleanup.

**Profiles.** `<source>`/`<target>` are profile names resolving to a gitignored
`.env.<profile>` file that holds `NEO4J_URI` / `NEO4J_USERNAME` /
`NEO4J_PASSWORD`:

| Profile | Env file | Database |
|---------|----------|----------|
| `local` | `.env.local` | Dev Aura (`ee93871d`) |
| `demo` | `.env.demo` | EC2 demo box (`3.213.48.7`) |
| `production` | `.env.production` | PROD (`54.225.112.191`) |

`.env.demo` is gitignored (like `.env.local` / `.env.production` / `.mcp.json`);
its creds mirror the `neo4j-demo` entry in `.mcp.json`.

**What it does.** (1) Backs up the target's current nodes+rels to
`backups/<target>-<ts>.json` (gitignored — may contain PII). (2) Drops the
target's constraints + indexes and wipes all its data. (3) Rebuilds the target
schema to **exactly match the source** — constraints plus range/vector/fulltext
indexes (the vector indexes matter: without them resonance/embedding search is
dead). (4) Copies every source node and relationship 1:1 — labels, properties,
and 1536-dim embeddings preserved verbatim, matched by a temporary
`:_CloneTmp {_srcEid}` marker that is stripped (and verified stripped) at the
end. (5) Verifies the result: total **and per-label** node counts, total **and
per-type** relationship counts, plus an embedding-length spot check
(`FieldPulse`/`Person`) must all match the source. Requires APOC on both ends
(`apoc.create.node`, `apoc.periodic.iterate`) — preflighted before any schema is
dropped, so an APOC-less target fails while still intact. Non-uniqueness
constraints (NODE KEY aside) are not reproduced and are logged loudly if present.

**Safety guards (all must pass before anything is wiped):**

- Refuses unless `--confirm <uri>` is passed **and exactly equals** the resolved
  target URI — so the npm alias alone can never wipe a DB; you must paste the
  target URI. The guard runs before any driver/backup step.
- Refuses if source URI === target URI (never clone a DB onto itself).
- Always writes the target backup first. **There is no restore script yet** —
  the backup JSON is the only rollback.

**Caveats for the `production` direction.** This is a raw clone, so it ships
*everything* in dev to prod — assistant feedback, conversation history +
embeddings, the seeded "Maple Street" / "JD Test" spaces, and test fixtures
(`Movie`, `DriverTest`, `Test`). Curate dev first if prod should only receive
real content. And it **wipes prod entirely** before copying; with no restore
path, treat a prod clone as irreversible beyond the backup file.

## Quick reference: paths

| Path | Purpose |
|------|---------|
| `scripts/migrate-prod-to-dev.ts` | Current prod→dev **transforming** migration. Run via `npm run migrate:prod-to-dev`. |
| `scripts/clone-neo4j.ts` | Raw 1:1 **clone** of any Neo4j DB onto another (`clone:dev-to-demo`, `clone:dev-to-prod`, `clone:demo-to-dev`, `clone:neo4j`). Schema + data + embeddings; backup + `--confirm` guard. |
| `scripts/seed-build-space.ts` | Curated fictional WeSpace ("Maple Street Mutual Aid") + sample pulses + resonances, attached to the 4 member accounts. Run via `npm run seed:build-space` after migration. |
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
