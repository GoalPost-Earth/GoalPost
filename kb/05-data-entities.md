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

| Field           | Type     | Notes            |
| --------------- | -------- | ---------------- |
| id              | string   | Unique           |
| name            | string   | Required         |
| visibility      | enum     | PRIVATE / SHARED |
| description     | string   | Optional         |
| why             | string   | Optional         |
| location        | string   | Optional         |
| time            | string   | Optional         |
| activities      | string   | Optional         |
| resultsAchieved | string   | Optional         |
| status          | string   | Optional         |
| createdAt       | datetime |                  |

**Relationships:**

- `OWNS` ← Person (one owner)
- `HAS_CONTEXT` → FieldContext

**Authorization:** Only the owner can read/write.

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

---

## Neo4j Constraints

| Constraint          | Target                  |
| ------------------- | ----------------------- |
| `person_id`         | Person.id UNIQUE        |
| `community_id`      | Community.id UNIQUE     |
| `space_id`          | Space.id UNIQUE         |
| `context_id`        | FieldContext.id UNIQUE  |
| `pulse_id`          | FieldPulse.id UNIQUE    |
| `resonance_link_id` | ResonanceLink.id UNIQUE |

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
