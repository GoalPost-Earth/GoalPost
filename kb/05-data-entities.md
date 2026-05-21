# Data Entities

All entities in GoalPost — their fields, relationships, and storage details. Database is Neo4j (graph).

## Entity Relationship Overview

```
Person ──OWNS──▶ Space (MeSpace / WeSpace)
Person ──IS_MEMBER──▶ SpaceMembership ◀──HAS_MEMBER── Space
Space ──HAS_CONTEXT──▶ FieldContext
FieldContext ──HAS_PULSE──▶ FieldPulse (GoalPulse / ResourcePulse / StoryPulse / CarePulse / CoreValuePulse)
FieldContext ──HAS_RESONANCE──▶ ResonanceLink
ResonanceLink ──SOURCE──▶ FieldPulse
ResonanceLink ──TARGET──▶ FieldPulse
ResonanceLink ──RESONATES_AS──▶ FieldResonance
FieldPulse ──CREATED_BY──▶ Person
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

**Auth fields (private):** `password`, `refreshToken`, `refreshTokenExp`, `refreshTokenRevoked`, `authId`

**Onboarding fields:** `onboardingCurrentStepIndex`, `onboardingCompletedSteps`, `onboardingIsCompleted`, `onboardingSkipped`

**Relationships:**

- `OWNS` → Space
- `IS_MEMBER` → SpaceMembership
- `CONNECTED_TO` ↔ Person (bidirectional, with edge metadata: `why`, `interests`)
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

Merges legacy CarePoint and CoreValue entities.

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

**Neo4j Labels:** `["FieldPulse", "CoreValuePulse"]`

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

Server-side persisted AI assistant chat thread. One per `User` Person — the
most recently updated thread is treated as "active" by the panel hydrator.
Survives page reloads and reopens of the assistant panel; replays via
`useChatRuntime({ messages })` on mount.

| Field       | Type     | Notes                                                         |
| ----------- | -------- | ------------------------------------------------------------- |
| id          | string   | UUID, UNIQUE                                                  |
| ownerId     | string   | UNIQUE — load-bearing for race-safe `MERGE` on first write    |
| createdAt   | datetime |                                                               |
| lastTurnAt  | datetime | Indexed — drives the "active thread" selection                |
| turnCount   | int      | Atomic counter — incremented per append, source of `Turn.order`|

**Relationships:**

- `HAS_THREAD` ← Person:User (one owner)
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

### Document

**Neo4j Labels:** `["Document"]`

Uploaded source document attached to a FieldContext. Created by the
direct-to-S3 ingestion flow: `POST /api/ingest/document/presign` mints a
short-lived presigned PUT URL; the browser uploads straight to S3; `POST
/api/ingest/document/process` then anchors the Document node and triggers
extraction (Gemini multimodal for PDFs, OpenAI for text/markdown). The
original file lives in AWS S3 (memory store for dev/tests); the graph node
carries metadata and provenance edges. See PRD `docs/prd/document-ingestion.md`,
ADR-0001, and ADR-0002.

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
- `HAS_INGEST_THREAD` → ConversationThread (one per upload + one per re-extract)

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

## Neo4j Constraints

| Constraint                | Target                        |
| ------------------------- | ----------------------------- |
| `person_id`               | Person.id UNIQUE              |
| `community_id`            | Community.id UNIQUE           |
| `space_id`                | Space.id UNIQUE               |
| `context_id`              | FieldContext.id UNIQUE        |
| `pulse_id`                | FieldPulse.id UNIQUE          |
| `resonance_link_id`       | ResonanceLink.id UNIQUE       |
| `conversation_thread_id`       | ConversationThread.id UNIQUE       |
| `conversation_thread_ownerId`  | ConversationThread.ownerId UNIQUE  |
| `conversation_turn_id`         | ConversationTurn.id UNIQUE         |

## Vector Indexes (1536 dimensions, cosine similarity)

| Index                          | Label             | Property  | Purpose                            |
| ------------------------------ | ----------------- | --------- | ---------------------------------- |
| `personBioVectorIndex`         | Person            | embedding | Find people by interests/themes    |
| `pulseContentVectorIndex`      | FieldPulse        | embedding | Find similar pulses                |
| `conversationChunkVectorIndex` | ConversationChunk | embedding | Find specific conversation moments |

## Property Indexes

| Index              | Target                  |
| ------------------ | ----------------------- |
| `resonance_label`  | FieldResonance.label    |
| `pulse_createdAt`  | FieldPulse.createdAt    |
| `pulse_modifiedAt` | FieldPulse.modifiedAt   |
| `chunk_order`      | ConversationChunk.order |

## ID Strategy

All entities use string IDs — generated server-side or client-side as needed.
