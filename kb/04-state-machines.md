# State Machines

Valid states and transitions for core entities in GoalPost.

## GoalPulse Status

```
ACTIVE ⇄ PAUSED → COMPLETED
ACTIVE → COMPLETED
```

| Status      | Description                     |
| ----------- | ------------------------------- |
| `ACTIVE`    | Goal is being actively pursued  |
| `PAUSED`    | Goal is on hold, may be resumed |
| `COMPLETED` | Goal has been achieved          |

---

## GoalPulse Horizon

Not a state machine — a classification of time scope:

| Horizon | Description           |
| ------- | --------------------- |
| `SHORT` | Near-term objective   |
| `MID`   | Medium-term objective |
| `LONG`  | Long-term aspiration  |

---

## ResonanceLink Status

```
Pending → Confirmed
Pending → Rejected
```

| Status      | Description                                 | Who Triggers              |
| ----------- | ------------------------------------------- | ------------------------- |
| `pending`   | AI-generated, awaiting human review         | Resonance Discovery Job   |
| `confirmed` | Human reviewed and confirmed the connection | User via review interface |
| `rejected`  | Human reviewed and rejected the connection  | User via review interface |

---

## Space Visibility

Not a state machine — a configuration setting:

| Visibility | Description                                                  |
| ---------- | ------------------------------------------------------------ |
| `PRIVATE`  | Only visible to owner (MeSpace) or owner + members (WeSpace) |
| `SHARED`   | Discoverable by others (future feature)                      |

---

## SpaceMembership Role

Not a state machine — an assigned role within a WeSpace:

| Role     | Description                                                  |
| -------- | ------------------------------------------------------------ |
| `ADMIN`  | Full control — manage members, edit content, view everything |
| `MEMBER` | Contribute pulses and view content                           |
| `GUEST`  | View-only access                                             |

---

## User Onboarding

```
Not Started → In Progress → Completed
                          → Skipped
```

| State       | Tracked By                                                                         |
| ----------- | ---------------------------------------------------------------------------------- |
| Not Started | `onboardingCurrentStepIndex = 0`, `onboardingIsCompleted = false`                  |
| In Progress | `onboardingCurrentStepIndex > 0`, steps accumulating in `onboardingCompletedSteps` |
| Completed   | `onboardingIsCompleted = true`                                                     |
| Skipped     | `onboardingSkipped = true`                                                         |

---

## Document Ingest Status (GOAL-292)

```
PENDING → PROCESSING → COMPLETE
                     → FAILED
```

| Status       | Description                                                                 | Who Triggers                                    |
| ------------ | ----------------------------------------------------------------------------- | ------------------------------------------------ |
| `PENDING`    | Document anchored by `POST /api/ingest/document/process`; awaiting the background job | Enqueue route (`enqueueIngestDocument`)   |
| `PROCESSING` | Claimed by a `process-document-ingestion` cron run (conditional PENDING→PROCESSING transition, safe against double-pickup) | Cron job (`claimPendingDocuments`) |
| `COMPLETE`   | Extraction + summarization + entity writes finished                          | Cron job (`processClaimedDocument`)              |
| `FAILED`     | Unrecoverable error (unsupported mime, oversize, parse failure, or an unexpected exception) — `Document.failureReason` carries a plain-English reason | Cron job (`processClaimedDocument`) |

Mirrors the shape of the existing Pulse Processing Job below. `FAILED` is not
a dead end — Re-extract (GOAL-241, `reExtractDocument` mutation) remains the
uniform retry path and does not depend on the ingest status. Documents
created before GOAL-292 have no `status` property; readers treat a null
status as `COMPLETE` (see `kb/05-data-entities.md`) rather than backfilling
every legacy row.

---

## Background Job States

### Pulse Processing Job

```
Queued → Processing → Completed
                    → Failed
```

### Person Enrichment Job

```
Queued → Processing → Completed
                    → Failed
```

### Resonance Discovery Job

```
Scheduled (cron) → Running → Completed
                           → Failed
```

---

## Assistant Mode

Not a state machine — a runtime toggle:

| Mode                 | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `default` (Standard) | Direct database answers, straightforward assistance  |
| `aiden`              | Questions assumptions, surfaces hidden frames        |
| `braider`            | Stays present with difficulty without rushing to fix |

Switched at any time via API parameter or UI selector. No persistent state between sessions (singleton in dev; session/DB in production).
