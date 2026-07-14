# Data Entities

All entities in GoalPost — their fields, relationships, and storage details. Database is Neo4j (graph).

> **Adding a new node label or relationship type?** Also add it to the AI Cypher
> generator's whitelist in `src/lib/cypher-generator/schema-context.ts`
> (`ALLOWED_LABELS` / `ALLOWED_RELATIONSHIPS` + `SCHEMA_DOC`), or the assistant's
> `query_for_bloom` tool can neither name nor return the new entity and will tell
> users it "couldn't find" something they can plainly see. Full checklist in
> `kb/07-ai-assistant-ux.md` Rule 9.

## Entity Relationship Overview

```
Person ──OWNS──▶ Space (MeSpace / WeSpace)
Space ──HAS_MEMBER──▶ SpaceMembership ──IS_MEMBER──▶ Person
Space ──HAS_CONTEXT──▶ FieldContext
FieldContext ──HAS_PULSE──▶ FieldPulse (GoalPulse / ResourcePulse / StoryPulse / CarePulse / CoreValuePulse)
FieldContext ──HAS_RESONANCE──▶ ResonanceLink
ResonanceLink ──SOURCE──▶ FieldPulse
ResonanceLink ──TARGET──▶ FieldPulse
ResonanceLink ──RESONATES_AS──▶ FieldResonance
FieldContext ──HAS_WEAVE──▶ PromiseWeave
PromiseWeave ──WEAVES──▶ FieldPulse
PromiseWeave ──WOVEN_FOR──▶ Person
PromiseWeave ──CREATED_BY──▶ Person
FieldPulse ──INITIATED_BY──▶ Person   (canonical author edge — assistant + doc-ingest paths; CREATED_BY carries the same meaning but is written by the dashboard flow and imports. Read both, preferring INITIATED_BY — see src/lib/pulse-author.ts)
FieldContext ──HAS_ORGANIZATION──▶ Organization   (GOAL-298; parallels HAS_PERSON)
Person/Organization ──MENTIONED_IN──▶ FieldPulse   (GOAL-298; named-in / related-to, NOT authorship)
Organization ──EXTRACTED_FROM──▶ Document
FieldPulse ──HAS_CHUNK──▶ ConversationChunk
Person ──CONNECTED_TO── Person (bidirectional)
Log ──CREATED_BY──▶ Person
Log ──LOGGED_FOR──▶ FieldPulse
FieldContext ──HAS_DOCUMENT──▶ Document
Document ──UPLOADED_BY──▶ Person:User
Person/FieldPulse ──EXTRACTED_FROM──▶ Document
Document ──HAS_INGEST_THREAD──▶ ConversationThread
```

## Core Entities

### Person

**Neo4j Labels:** `["Person"]`, `["Person", "User"]`, or `["Person", "PersonPulse"]`

The `Person` node is the single entity for all humans in the system. Adjacent labels distinguish platform access:

| Label Combination           | Meaning                                                                    |
| --------------------------- | -------------------------------------------------------------------------- |
| `["Person"]`                | Base person — contact or imported record, not yet classified               |
| `["Person", "User"]`        | Registered platform user — can log in, owns MeSpace, creates pulses        |
| `["Person", "PersonPulse"]` | Non-user person — someone in a user's relational world, no platform access |

**`User` is a label, not a separate node.** Signup creates (or matches) a `Person` and runs `SET person:User`; auth queries (login, JWT validation, `resolveAuthenticatedUserId`) match on `:User`. A `Person` without the `:User` label cannot authenticate even if it has an `email` and `password` set. Seeded contacts and imported relational entities therefore stay non-logged-in until they're explicitly promoted by adding the label and the auth/onboarding fields below (or by going through `/api/auth/signup`).

| Field        | Type     | Notes                                  |
| ------------ | -------- | -------------------------------------- |
| id           | string   | Unique                                 |
| firstName    | string   | Required                               |
| lastName     | string   | Required                               |
| name         | string   | Computed: firstName + lastName         |
| email        | string   | Login identifier                       |
| phone        | string   | Optional                               |
| pronouns     | string   | Optional                               |
| location     | string   | Optional                               |
| photo        | string   | Avatar URL, optional                   |
| gender       | string   | Optional                               |
| status       | string   | Optional                               |
| careManual   | string   | How this person wants to be cared for  |
| favorites    | string   | Things they value                      |
| passions     | string[] | Extracted from pulses or self-reported |
| traits       | string[] | Personality traits                     |
| fieldsOfCare | string[] | Areas of care and concern              |
| interests    | string[] | Broader interests                      |
| embedding    | float[]  | 1536-dim vector for semantic search    |
| enrichedAt   | datetime | Last enrichment timestamp              |
| isUser       | boolean  | Computed — has `User` label            |
| signupDate   | datetime | When they registered                   |

**Auth fields (private):** `password`, `refreshToken`, `refreshTokenExp`, `refreshTokenRevoked`, `authId`, `inviteTokenHash`, `inviteTokenExpires`, `resetTokenHash`, `resetTokenExpires` — the two single-use token fields store sha256(rawToken); the raw token only ever lives in the outgoing email URL.

**Onboarding fields:** `onboardingCurrentStepIndex`, `onboardingCompletedSteps`, `onboardingIsCompleted`, `onboardingSkipped`

**Relationships:**

- `OWNS` → Space
- `IS_MEMBER` → SpaceMembership
- `CONNECTED_TO` ↔ Person (bidirectional, with edge metadata: `why`, `interests`). Written by the person-detail UI, the GraphQL `createPersonConnection` mutation, **and** the AI assistant: `create_connection` (direct/proactive) and `create_person` (which MERGEs a `CONNECTED_TO` from the current user to the new person whenever a `relationshipWhy` is supplied). See `kb/07-ai-assistant-ux.md` Rule 5.
- `CREATED_BY` ← FieldPulse, Log

---

### MeSpace

**Neo4j Labels:** `["Space", "MeSpace"]`

**Cardinality:** Exactly one per Person. Auto-created at signup. A Person may never own more than one MeSpace.

| Field           | Type     | Notes                                     |
| --------------- | -------- | ----------------------------------------- |
| id              | string   | Unique                                    |
| name            | string   | Required                                  |
| visibility      | enum     | PRIVATE / SHARED                          |
| ownerId         | string   | Denormalized Person.id — UNIQUE constraint |
| description     | string   | Optional                                  |
| why             | string   | Optional                                  |
| location        | string   | Optional                                  |
| time            | string   | Optional                                  |
| activities      | string   | Optional                                  |
| resultsAchieved | string   | Optional                                  |
| status          | string   | Optional                                  |
| createdAt       | datetime |                                           |

**Relationships:**

- `OWNS` ← Person (one owner, and that Person owns no other MeSpace)
- `HAS_CONTEXT` → FieldContext

**Authorization:** Only the owner can read/write (GraphQL `@authorization` filter).

**Enforcement of the one-per-Person invariant:**

1. **DB constraint** — `mespace_owner_unique` UNIQUE on `MeSpace.ownerId` (`scripts/init-db.js`).
2. **REST endpoint** — `/api/me-space/create` uses an atomic `MATCH (p) WHERE NOT EXISTS { (p)-[:OWNS]->(:MeSpace) }` Cypher (no TOCTOU).
3. **Signup** — `getOrCreateMeSpace` in `src/lib/validation/space-validation.ts` is idempotent; it returns the existing MeSpace if one is already owned.
4. **GraphQL** — the auto-generated `createMeSpaces` mutation is disabled via `@mutation(operations: [UPDATE, DELETE])`; only `updateMeSpaces` and `deleteMeSpaces` are exposed.
5. **Audit** — `auditMeSpaceConstraint(session)` reports any Persons with >1 MeSpace (use during migrations).

---

### WeSpace

**Neo4j Labels:** `["Space", "WeSpace"]`

Same fields as MeSpace.

**Relationships:**

- `OWNS` ← Person (one owner)
- `HAS_MEMBER` → SpaceMembership
- `HAS_CONTEXT` → FieldContext

**Authorization:** Owner or any member can read. Write depends on membership role.

---

### SpaceMembership

**Neo4j Labels:** `["SpaceMembership"]`

| Field   | Type     | Notes                  |
| ------- | -------- | ---------------------- |
| id      | string   | Unique                 |
| role    | enum     | ADMIN / MEMBER / GUEST |
| addedAt | datetime | When member was added  |

**Relationships:**

- `IS_MEMBER` ← Person
- `HAS_MEMBER` ← Space

---

### FieldContext

**Neo4j Labels:** `["FieldContext"]`

| Field        | Type     | Notes                  |
| ------------ | -------- | ---------------------- |
| id           | string   | Unique                 |
| title        | string   | Required               |
| emergentName | string   | AI-generated, optional |
| createdAt    | datetime |                        |

**Relationships:**

- `HAS_CONTEXT` ← Space (MeSpace or WeSpace)
- `HAS_PULSE` → FieldPulse
- `HAS_PERSON` → Person — people attached to this context. Usually a
  `:Person:PersonPulse` (relational-world contact), but may also be a real
  `:User` (the uploader's self-link, or a consent-gated attach via the
  `addPersonToFieldContext` mutation — never the generated nested CONNECT,
  which is disabled)
- `HAS_RESONANCE` → ResonanceLink
- `CREATED_BY` → Person

**Authorization:** Inherits from parent Space.

---

### GoalPulse

**Neo4j Labels:** `["FieldPulse", "GoalPulse"]`

| Field           | Type     | Notes                         |
| --------------- | -------- | ----------------------------- |
| id              | string   | Unique                        |
| title           | string   | Required                      |
| content         | string   | Required                      |
| status          | enum     | ACTIVE / PAUSED / COMPLETED   |
| horizon         | enum     | SHORT / MID / LONG (optional) |
| intensity       | float    | 0.0–1.0, optional             |
| successMeasures | string   | Optional                      |
| activities      | string   | Optional                      |
| type            | string   | Optional sub-type             |
| why             | string   | Motivation                    |
| location        | string   | Optional                      |
| time            | string   | Optional                      |
| photo           | string   | Optional                      |
| embedding       | float[]  | 1536-dim vector               |
| createdAt       | datetime |                               |
| modifiedAt      | datetime |                               |

**Relationships:**

- `HAS_PULSE` ← FieldContext
- `CREATED_BY` → Person
- `HAS_CHUNK` → ConversationChunk
- `SOURCE` / `TARGET` ← ResonanceLink

---

### ResourcePulse

**Neo4j Labels:** `["FieldPulse", "ResourcePulse"]`

| Field        | Type     | Notes                       |
| ------------ | -------- | --------------------------- |
| id           | string   | Unique                      |
| title        | string   | Required                    |
| content      | string   | Required                    |
| resourceType | string   | Required — type of resource |
| availability | float    | Optional                    |
| intensity    | float    | 0.0–1.0, optional           |
| status       | string   | Optional                    |
| why          | string   | Optional                    |
| location     | string   | Optional                    |
| time         | string   | Optional                    |
| embedding    | float[]  | 1536-dim vector             |
| createdAt    | datetime |                             |
| modifiedAt   | datetime |                             |

**Relationships:** Same as GoalPulse.

---

### StoryPulse

**Neo4j Labels:** `["FieldPulse", "StoryPulse"]`

Historical note: StoryPulse originally absorbed the legacy CarePoint and
CoreValue entities, which is why it still declares their optional fields
below. Both have since been carved back out: migrated CarePoints are
`PromiseWeave` connector nodes, and migrated CoreValues are
`CoreValuePulse` (GOAL-287) — see [kb/08-migration.md](08-migration.md).
No StoryPulse carries `:CarePoint` or `:CoreValue` anymore (in envs that
have run `npm run backfill:corevalue-labels`; an un-backfilled env such as
a stale demo box may still hold the old `:StoryPulse:CoreValue` shape).

| Field               | Type     | Notes                        |
| ------------------- | -------- | ---------------------------- |
| id                  | string   | Unique                       |
| title               | string   | Required                     |
| content             | string   | Required                     |
| intensity           | float    | 0.0–1.0, optional            |
| levelFulfilled      | string   | Care-specific, optional      |
| fulfillmentDate     | string   | Care-specific, optional      |
| successMeasures     | string   | Care-specific, optional      |
| issuesIdentified    | string   | Care-specific, optional      |
| issuesResolved      | string   | Care-specific, optional      |
| alignmentChallenges | string   | CoreValue-specific, optional |
| alignmentExamples   | string   | CoreValue-specific, optional |
| whoSupports         | string   | CoreValue-specific, optional |
| embedding           | float[]  | 1536-dim vector              |
| createdAt           | datetime |                              |
| modifiedAt          | datetime |                              |

**Relationships:** Same as GoalPulse.

---

### CarePulse

**Neo4j Labels:** `["FieldPulse", "CarePulse"]`

| Field      | Type     | Notes             |
| ---------- | -------- | ----------------- |
| id         | string   | Unique            |
| title      | string   | Required          |
| content    | string   | Required          |
| sourceType | string   | Optional          |
| intensity  | float    | 0.0–1.0, optional |
| embedding  | float[]  | 1536-dim vector   |
| createdAt  | datetime |                   |

---

### CoreValuePulse

**Neo4j Labels:** `["FieldPulse", "CoreValuePulse"]` (nodes migrated from
production also retain `:CoreValue` for traceability — see
[kb/08-migration.md](08-migration.md) and
`scripts/backfill-corevalue-pulse-labels.ts`).

Minimal additional fields beyond the base FieldPulse interface.

---

### ResonanceLink

**Neo4j Labels:** `["ResonanceLink"]`

| Field       | Type     | Notes                                              |
| ----------- | -------- | -------------------------------------------------- |
| id          | string   | Unique                                             |
| label       | string   | Relationship type (e.g., MOTIVATED_BY, ALIGNED_TO) |
| description | string   | Optional                                           |
| confidence  | float    | 0–1, AI-assigned                                   |
| evidence    | string   | Explanation of why the link exists                 |
| mergedFrom  | string   | Legacy relationship tracking                       |
| status      | string   | pending / confirmed / rejected                     |
| reviewedAt  | datetime | When human reviewed                                |
| reviewedBy  | string   | Who reviewed                                       |
| editedBy    | string   | Who edited                                         |
| createdAt   | datetime |                                                    |

**Known label values:** MOTIVATED_BY, APPLIED_TO, ALIGNED_TO, ENABLES, CARES_FOR, DEPENDS_ON, EMBRACES, PROVIDES, HAS_ACCESS_TO, CONNECTED_TO

**Relationships:**

- `SOURCE` → FieldPulse
- `TARGET` → FieldPulse
- `RESONATES_AS` → FieldResonance
- `HAS_RESONANCE` ← FieldContext

---

### PromiseWeave

**Neo4j Labels:** `["PromiseWeave"]`

A connective container that gives a pulse (initially a migrated care point) a
navigable neighbourhood. Modelled as a reified connector node exactly like
ResonanceLink — its own node type, **not** a pulse subtype — and surfaced
within a FieldContext via a `HAS_WEAVE` context edge, directly analogous to how
ResonanceLink is surfaced via `HAS_RESONANCE`. Originates in Steve's relational
"map" (see `docs/promise-weave-design-spike.md`, GOAL-266). Starting-point
scope: created by the prod→dev migration to wrap each migrated care point.

| Field      | Type     | Notes                                              |
| ---------- | -------- | -------------------------------------------------- |
| id         | string   | Unique, `weave_*` prefix                           |
| title      | string   | Optional — human label (defaults to the woven pulse's title) |
| status     | string   | Optional — `active` for migration-built weaves     |
| createdAt  | datetime |                                                    |

**Relationships:**

- `WEAVES` → FieldPulse (1..n — the care point(s) it connects)
- `WOVEN_FOR` → Person (whose care point / who it concerns)
- `CREATED_BY` → Person (authorship, for attribution)
- `HAS_WEAVE` ← FieldContext (scope + visibility anchor)

**Authorization:** Scoped to the parent FieldContext's Space — readable/writable
by the Space owner or any member, mirroring ResonanceLink. Note: a single
`HAS_WEAVE` context edge is the canonical anchor (the design spike's separate
`WITHIN` edge was collapsed into it, since it would be a redundant anti-parallel
edge — ResonanceLink likewise uses only `HAS_RESONANCE`).

---

### Organization

**Neo4j Labels:** `["Organization", "LifeSensor", "RelationalEntity"]`

A first-class organization, group, company, cooperative or institution named in
an uploaded document (GOAL-298) — e.g. "Artisan Cooperative". Its own entity, not
a `Person` and not a pulse. Captured at upload time so members can discover it
and connect to the resources/stories it belongs to. The GraphQL `Organization`
type maps the load-bearing `Organization` label; the `LifeSensor` /
`RelationalEntity` ontology labels ride alongside (parity with migrated Persons).

| Field       | Type     | Notes                                     |
| ----------- | -------- | ----------------------------------------- |
| id          | string   | Unique — `organization_<uuid>`            |
| name        | string   | Required                                  |
| description | string   | Optional — what the org is / does         |
| createdAt   | datetime |                                           |
| updatedAt   | datetime | Set on enrich                             |

**Relationships:**

- `HAS_ORGANIZATION` ← FieldContext — the context(s) the org is attached to. The
  only Space tie an Organization has (it owns no Space, holds no membership), so
  it is the load-bearing branch of the read gate.
- `MENTIONED_IN` → FieldPulse — the pulse(s) the org was identified as related to.
- `EXTRACTED_FROM` → Document — doc-ingestion provenance.

**Authorization:** type-level `@authorization` READ filter over `contexts_SOME`
(owner or member of a context's parent Space) — an org unreachable through any
visible context is filtered out entirely, mirroring the PersonPulse context-reach
gate. All generated mutations are disabled (`@mutation(operations: [])`); orgs are
created server-side only, via the audited doc-ingestion write in
`src/lib/chat/hitl.ts` (`createOrganizationAuthorized`), which gates on
`canEditContent`.

**Writes:** created / enriched **only** by the doc-ingestion path
(`create_organization` tool). Idempotent by name-within-context (a same-named org
in the context is enriched, never duplicated). No embedding / vector index yet —
semantic org discovery is a follow-up (resonance is pulse↔pulse today).

---

### FieldResonance

**Neo4j Labels:** `["FieldResonance"]`

| Field       | Type   | Notes                                           |
| ----------- | ------ | ----------------------------------------------- |
| label       | string | Indexed — e.g., "grief", "courage", "belonging" |
| description | string | Optional                                        |

---

### ConversationChunk

**Neo4j Labels:** `["ConversationChunk"]`

| Field     | Type     | Notes                              |
| --------- | -------- | ---------------------------------- |
| id        | string   |                                    |
| content   | string   | Sentence text                      |
| order     | int      | Indexed — position in conversation |
| role      | string   | user / assistant / system          |
| embedding | float[]  | 1536-dim vector                    |
| createdAt | datetime |                                    |

**Relationships:**

- `HAS_CHUNK` ← FieldPulse

---

### ConversationThread

**Neo4j Labels:** `["ConversationThread"]`

Server-side persisted AI assistant chat thread. A `User` can own many — one
implicit "reflective" thread created on first message, plus any threads
spawned via the sidebar "+" or doc-ingest. The active thread on hydration is
either the pinned `User.lastViewedThreadId` or, failing that, the most
recently updated. Survives page reloads and reopens of the assistant panel;
replays via `useChatRuntime({ messages })` on mount.

| Field       | Type     | Notes                                                                            |
| ----------- | -------- | -------------------------------------------------------------------------------- |
| id          | string   | UUID, UNIQUE                                                                     |
| ownerId     | string   | Set only on the implicit reflective thread (MERGE key in `appendConversationTurn`). Not unique; concurrent first-writes can produce two implicit threads, which is acceptable degeneracy — both surface in the sidebar normally. |
| createdAt   | datetime |                                                                                  |
| lastTurnAt  | datetime | Indexed — drives the "active thread" selection                                   |
| turnCount   | int      | Atomic counter — incremented per append, source of `Turn.order`                  |
| mode        | string   | `'default' \| 'aiden' \| 'braider'`. Locked to `'default'` on ingest threads.   |
| kind        | string   | `'reflective' \| 'ingest'`. Drives the mode-selector lock in the switcher.       |
| title       | string   | Auto-generated for ingest threads; auto-generated by GPT-4o-mini for reflective on first exchange. Null until set. |

**Relationships:**

- `HAS_THREAD` ← Person:User (multiple threads per user)
- `HAS_INGEST_THREAD` ← Document (ingest threads only)
- `HAS_TURN` → ConversationTurn

---

### ConversationTurn

**Neo4j Labels:** `["ConversationTurn"]`

Single message in a `ConversationThread`. Stores the full `parts` payload
from the AI SDK `UIMessage` shape so tool calls + results can be replayed
verbatim on hydration.

| Field     | Type     | Notes                                                                       |
| --------- | -------- | --------------------------------------------------------------------------- |
| id        | string   | UUID, UNIQUE                                                                |
| role      | string   | user / assistant / system                                                   |
| content   | string   | Plain-text view of the message — derived from text parts on save            |
| parts     | string   | JSON-serialised `UIMessagePart[]` (text, tool-call, tool-result, …)         |
| order     | int      | Indexed — monotonically increasing within a thread (gaps allowed under race)|
| createdAt | datetime |                                                                             |

**Relationships:**

- `HAS_TURN` ← ConversationThread

**Activity Log exemption:** chat turn writes are intentionally NOT mirrored
into the `Log` stream. The thread itself is the audit trail (every turn is
timestamped, ordered, and attributed via the user→thread relationship), and
logging every assistant message would swamp the activity feed. Mirrors the
existing exemption for `ConversationChunk` writes.

---

### Log (Activity)

**Neo4j Labels:** `["Log"]`

| Field       | Type     | Notes                    |
| ----------- | -------- | ------------------------ |
| id          | string   |                          |
| description | string   | Required                 |
| metadata    | string   | JSON metadata, optional  |
| createdAt   | datetime | Immutable, set on create |

**Relationships:**

- `CREATED_BY` → Person
- `LOGGED_FOR` → GoalPulse / ResourcePulse / FieldPulse

### Notification

**Neo4j Labels:** `["Notification"]`

Recipient-addressed, per-person notification with server-side read state.
**Distinct from `Log`:** a `Log` is the immutable, space-wide _audit trail_ of
everything that happened (including your own actions); a `Notification` is owned
by exactly one recipient, concerns _them specifically_ (you were invited, your
role changed, a resonance was found on your pulse, you were mentioned), and
carries its own read/unread flag. Notifications back the bell popover; the audit
`Log` backs the dedicated activity-log page. Emission is decoupled (see
`src/lib/notifications/create-notification.ts`) so an email/Resend channel can
layer on later without touching call sites.

| Field     | Type     | Notes                                                                |
| --------- | -------- | -------------------------------------------------------------------- |
| id        | string   | Required, unique (`ntf_<ts>_<rand>`)                                 |
| type      | string   | Enum: `INVITE`, `ROLE_CHANGE`, `MEMBERSHIP`, `RESONANCE`, `MENTION`  |
| title     | string   | Short headline, e.g. "New resonance on your pulse"                   |
| message   | string   | Human-readable body. Never embed raw internal IDs (Rule 1).         |
| link      | string   | Optional in-app route for click-through                             |
| read      | boolean  | Server-side read state. Defaults `false`.                           |
| readAt    | datetime | Set when first marked read; null while unread.                      |
| createdAt | datetime | Immutable, set on create.                                           |
| metadata  | string   | JSON-serialized optional contextual data (spaceId, pulseId, role…). |

**Relationships:**

- `NOTIFIES` → Person (the recipient; exactly one)
- `TRIGGERED_BY` → Person (the actor who caused it; optional — system events
  may have none)

**Authorization:** readable ONLY by the recipient. Enforced via the
`@authorization` filter on the `Notification` `@node` type
(`{ where: { node: { recipient_SOME: { id_EQ: "$jwt.user.id" } } } }`), which
gates the library-generated read query. The mark-read mutations additionally
re-check `context.jwt.user.id` server-side (the recipient MATCH is the auth gate).

**Emission rules:**

- Never notify the actor about their own action — `createNotification` drops any
  notification whose `recipientId === actorId`.
- Marking a notification read does NOT write to the `Log` audit stream (avoids
  audit-feed spam).

**Lifecycle:** forward-only. No backfill of historical events; the bell shows
nothing until new events fire. Read state is sticky — there is no "mark unread"
in v1. `@mention` notifications are plumbed (`type: MENTION`) but have no
production caller until a mention-authoring surface exists.

### Document

**Neo4j Labels:** `["Document"]`

Uploaded source document attached to a FieldContext. Created by the
direct-to-S3 ingestion flow: `POST /api/ingest/document/presign` mints a
short-lived presigned PUT URL; the browser uploads straight to S3; `POST
/api/ingest/document/process` then anchors the Document node and triggers
extraction (Gemini multimodal for PDFs, OpenAI for text/markdown). The
original file lives in AWS S3 (memory store for dev/tests); the graph node
carries metadata and provenance edges. See WF-10 in `kb/03-workflows.md`
and ADR-014 / ADR-015 in `kb/06-adr.md`.

| Field      | Type     | Notes                                                                                  |
| ---------- | -------- | -------------------------------------------------------------------------------------- |
| id         | string   | Required, unique                                                                       |
| filename   | string   | Required                                                                               |
| mimeType   | string   | v1: `text/plain`, `text/markdown`, `application/pdf`                                   |
| sizeBytes  | int      | Required                                                                               |
| pageCount  | int      | `1` for .txt/.md; real page count for .pdf; null when unknown                          |
| blobKey    | string   | Internal — UI surfaces filename instead                                                |
| blobUrl    | string   | Provider-issued URL for the blob (may be private/expiring; treat as opaque)            |
| userHint   | string   | Optional one-line "What is this?" hint; reused on re-extract                           |
| summary    | string   | AI-generated 1-paragraph synopsis; refreshed on re-extract; null on summarizer failure |
| concepts   | string[] | Up to 5 short concept phrases the AI surfaced as top-level themes; empty on failure    |
| uploadedAt | datetime | Immutable, set on create                                                               |

**Relationships:**

- `HAS_DOCUMENT` ← FieldContext (parent context owns the document)
- `UPLOADED_BY` → Person:User (the uploader)
- `EXTRACTED_FROM` ← Person (extracted persons trace back here)
- `EXTRACTED_FROM` ← FieldPulse (extracted goal/resource/story pulses trace back here)
- `EXTRACTED_FROM` ← Organization (extracted orgs trace back here — GOAL-298)
- `HAS_INGEST_THREAD` → ConversationThread (one per upload + one per re-extract)

**Attribution:** when the extractor identifies whose voice/authorship an
extracted pulse carries (a byline, the user hint, a named speaker), the
created pulse's canonical `INITIATED_BY` author edge points at that extracted
Person — not the uploader — so the person stays related to their
contributions in the graph. The extractor emits an `authorName` per pulse,
validated against the extracted persons + context roster
(`extraction-model-invoker.ts`), resolved to the live person id by the ingest
orchestrator, and enforced context-scoped (the credited person must be
`HAS_PERSON`-attached to the same FieldContext) in
`createPulseAuthorized` (`src/lib/chat/hitl.ts`). The activity `Log` stays
`CREATED_BY` the uploader either way, and `UPLOADED_BY` still records who
brought the document in. Any `HAS_PERSON`-attached Person qualifies —
including a registered `:User` (e.g. a WeSpace co-member): deliberate, since
the Log keeps the uploader accountable for the write itself.

**Related people & organizations (GOAL-298):** beyond the single author,
the extractor also emits, per pulse, the people and organizations the document
names as *related to* it (subjects, contributors, the cooperative offering a
resource). Each extracted person becomes a `:Person:PersonPulse`
(`create_person`), each org an `:Organization` (`create_organization`), both
attached to the FieldContext (`HAS_PERSON` / `HAS_ORGANIZATION`); then a
`MENTIONED_IN` edge links each to the pulse it belongs to. Authorship stays on
`INITIATED_BY`; `MENTIONED_IN` is the distinct "named in / related to" edge, so
one pulse can carry one author and many mentioned entities. The link write
(`linkEntityToPulseAuthorized`) is co-location-gated — the entity must already be
attached to a context that holds the pulse — and writes one `Log`. The ingest
orchestrator resolves each link's endpoints by name/title from the entities
created earlier in the same run (`handle-ingest-document.ts`).

**Authorization:** inherits read access from the parent Space — the same
`@authorization` pattern as FieldContext. Writes (`POST /api/ingest/document/{presign,process}`,
`reExtractDocument`, `deleteDocument`) all gate on `canEditContent` against
the parent Space (`kb/02-user-roles.md`).

**Lifecycle:** Documents are **never auto-deleted**. Deletion is user-driven
via `deleteDocument`, which removes the blob and the Document node;
previously approved Persons and FieldPulses extracted from the document
survive (their `EXTRACTED_FROM` edges drop with the Document). v1 has no
file-versioning; uploading a new revision of a source creates a new
Document node with its own ingest thread.

---

### AssistantFeedback

Captures signal about a single assistant turn so devs can improve prompts and
tools over time. Two write paths land here:

- **`user_thumb`** — explicit thumbs-up / thumbs-down from the chat UI,
  optionally with a "what would have been better" comment.
- **`auto_*`** — server-side signals emitted from the chat route's
  `onFinish` callback: tool errors, empty assistant text, Rule-1
  violations (raw ids, `__typename`, internal graph labels — see
  `kb/07-ai-assistant-ux.md`).

**Properties:**

| Field                  | Notes                                                             |
| ---------------------- | ----------------------------------------------------------------- |
| `id`                   | `feedback_<uuid>`                                                 |
| `rating`               | `'positive' \| 'negative'`                                        |
| `source`               | `'user_thumb' \| 'auto_tool_error' \| 'auto_empty_text' \| 'auto_rule_violation'` |
| `userComment`          | Optional free-text from the user (thumbs-down comment).           |
| `ruleViolated`         | For auto rule violations: `rule_1_raw_id_leak`, `rule_1_typename_leak`, `rule_1_graph_label_leak`, `rule_1_uuid_leak`. |
| `autoSignal`           | Machine-readable code (e.g. `tool_error:get_my_spaces`).          |
| `classification`       | LLM-assigned failure mode — see cron output for the enum.         |
| `classificationReason` | One-sentence rationale from the classifier.                       |
| `cluster`              | `cluster_<id>` assigned by nearest-neighbor on `questionEmbedding`. |
| `questionEmbedding`    | 1536-dim vector of the user question — drives clustering.         |
| `goldenSet`            | Boolean — devs flag rows that should be replayed by the (future) eval harness. |
| `status`               | Triage workflow: `'open'` (default) \| `'in_progress'` \| `'resolved'`. Rows predating this field coalesce to `'open'`. The dashboard hides `resolved` by default. |
| `statusUpdatedAt`      | datetime — when the status last changed (null until first touched). |
| `statusNote`           | Optional short note attached at the last status change (e.g. "fixed in 9d7bd9f"; "wontfix — accepted limitation"). |
| `createdAt`            | datetime.                                                         |

**Relationships:**

- `(AssistantFeedback)-[:FEEDBACK_ON]->(ConversationTurn)` — the assistant
  turn being rated.
- `(AssistantFeedback)-[:FEEDBACK_FROM]->(:Person)` — submitter (present
  for `user_thumb` only).
- `(AssistantFeedback)-[:IN_CONTEXT_OF]->(:ConversationThread)` — query
  convenience.

**Privacy / activity log:** AssistantFeedback writes are NOT mirrored
into the `Log` stream — the same exemption as `ConversationTurn` and
`ConversationChunk`. The nodes themselves are the audit trail.

**Where it's consumed:**

- `src/lib/feedback/assistant-feedback.service.ts` — Neo4j CRUD.
- `src/app/dev/ai-quality/page.tsx` — dev-gated triage dashboard.
- `src/app/api/cron/classify-ai-feedback/route.ts` — daily classifier.

---

### LlmUsage

Per-call token & cost metering (GOAL-297, Phase 1 — measurement). One node is
written per LLM/embedding call at every instrumented site (chat, title-gen,
cypher-gen, doc extract/summary, embeddings, person enrichment, resonance
analysis, feedback classification). Cost is derived from a configurable
per-model price table (`src/lib/llm/pricing.ts`, overridable via
`LLM_PRICING_JSON`). This is an internal metering node — it is deliberately
NOT part of the assistant's cypher-generator vocabulary (kb/07 Rule 9).

**Properties:**

| Field              | Notes                                                             |
| ------------------ | ----------------------------------------------------------------- |
| `id`               | `usage_<uuid>`                                                   |
| `model`            | Exact model id (e.g. `gpt-5.4`, `gpt-4o-mini`, `text-embedding-3-small`, `gemini-2.5-pro`). |
| `provider`         | `'openai' \| 'gemini'`                                            |
| `source`           | Call site: `'chat' \| 'title-gen' \| 'cypher-gen' \| 'doc-extract' \| 'doc-summary' \| 'embeddings' \| 'enrichment' \| 'resonance-analysis' \| 'feedback-classify'` |
| `promptTokens`     | Input tokens. Embeddings: counted locally via tiktoken (LangChain returns no usage). |
| `completionTokens` | Output tokens (0 for embeddings).                                |
| `totalTokens`      | Sum, or the model-reported total.                                |
| `costUsd`          | Derived at write time from the price table.                      |
| `priced`           | `false` when the model had no explicit rate (fallback used) — surfaced as "est." in the report. |
| `tokensEstimated`  | Reserved; `false` today (embeddings use an exact tiktoken count). |
| `principal`        | `'user'` (interactive) \| `'system'` (background/cron).          |
| `userId`           | The acting user's id when `principal='user'` (also carried on the edge). |
| `createdAt`        | datetime.                                                        |

**Relationships:**

- `(LlmUsage)-[:INCURRED_BY]->(:Person)` — the acting user (interactive spend).
- `(LlmUsage)-[:INCURRED_BY]->(:SystemPrincipal {id:'system'})` — the singleton
  principal for background/cron spend with no logged-in caller. MERGE'd on
  first write.
- `(LlmUsage)-[:IN_CONTEXT_OF]->(:ConversationThread)` — optional, for chat
  spend. The usage node is always created even when the Person / thread
  doesn't exist (edges are conditional; nothing is dropped).

**Privacy / activity log:** LlmUsage writes are NOT mirrored into the `Log`
stream — the same exemption as `ConversationTurn`, `ConversationChunk`, and
`AssistantFeedback`. The nodes themselves are the audit trail. (Phase-2
spend-cap *config* mutations WILL be logged; that is out of scope for Phase 1.)

**Where it's consumed:**

- `src/lib/llm/usage/llm-usage.service.ts` — write (`recordLlmUsage`) + report reads (`getLlmUsageReport`).
- `src/lib/llm/pricing.ts` — per-model price table.
- `src/app/dev/llm-usage/page.tsx` — dev-gated spend report (by user / by model / system).

---

## Neo4j Constraints

| Constraint                | Target                        |
| ------------------------- | ----------------------------- |
| `person_id`               | Person.id UNIQUE              |
| `community_id`            | Community.id UNIQUE           |
| `space_id`                | Space.id UNIQUE               |
| `context_id`              | FieldContext.id UNIQUE        |
| `pulse_id`                | FieldPulse.id UNIQUE          |
| `resonance_link_id`       | ResonanceLink.id UNIQUE       |
| `promise_weave_id`        | PromiseWeave.id UNIQUE        |
| `document_id`             | Document.id UNIQUE           |
| `conversation_thread_id`       | ConversationThread.id UNIQUE       |
| `conversation_turn_id`         | ConversationTurn.id UNIQUE         |
| `assistant_feedback_id`        | AssistantFeedback.id UNIQUE        |
| `organization_id`              | Organization.id UNIQUE             |
| `llm_usage_id`                 | LlmUsage.id UNIQUE                 |
| `system_principal_id`          | SystemPrincipal.id UNIQUE         |

## Vector Indexes (1536 dimensions, cosine similarity)

| Index                                | Label             | Property          | Purpose                                       |
| ------------------------------------ | ----------------- | ----------------- | --------------------------------------------- |
| `personBioVectorIndex`               | Person            | embedding         | Find people by interests/themes               |
| `pulseContentVectorIndex`            | FieldPulse        | embedding         | Find similar pulses                           |
| `conversationChunkVectorIndex`       | ConversationChunk | embedding         | Find specific conversation moments            |
| `assistantFeedbackQuestionVectorIndex` | AssistantFeedback | questionEmbedding | Cluster bad-question patterns for triage     |

## Property Indexes

| Index                              | Target                          |
| ---------------------------------- | ------------------------------- |
| `resonance_label`                  | FieldResonance.label            |
| `pulse_createdAt`                  | FieldPulse.createdAt            |
| `pulse_modifiedAt`                 | FieldPulse.modifiedAt           |
| `chunk_order`                      | ConversationChunk.order         |
| `assistant_feedback_createdAt`     | AssistantFeedback.createdAt     |
| `assistant_feedback_classification` | AssistantFeedback.classification |
| `assistant_feedback_status`        | AssistantFeedback.status        |
| `person_invite_token_hash`         | Person.inviteTokenHash          |
| `person_reset_token_hash`          | Person.resetTokenHash           |
| `llm_usage_createdAt`              | LlmUsage.createdAt              |

## ID Strategy

All entities use string IDs — generated server-side or client-side as needed.
