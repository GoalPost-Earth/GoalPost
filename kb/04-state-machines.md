# State Machines

Valid states and transitions for core entities in GoalPost.

## FieldContext Lifecycle (GOAL-319)

```
Live → Soft-deleted → (purged after 90 days)
```

| State        | Marked By                                                                                   | Trigger                                                                 |
| ------------ | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Live         | `deletedAt` absent; `(Space)-[:HAS_CONTEXT]->(ctx)`                                          | Creation                                                                |
| Soft-deleted | `deletedAt` set on the context AND its pulses; Space edge re-pointed to `HAS_DELETED_CONTEXT` | `deleteFieldContext` mutation / assistant `delete_field_context` (owner or ADMIN only) |
| Purged       | Node and all nested entities removed from the graph                                          | Daily `/api/cron/purge-deleted-contexts` once `deletedAt` > 90 days old  |

Deleting a context CASCADES over its nested sub-context subtree (GOAL-295):
every live descendant reached via `HAS_SUBCONTEXT*` is soft-deleted in the
same transaction (own `deletedAt` stamp + own Space-edge re-point), so a
parent can never be hidden while its children stay visible. A sub-context
deleted on its own leaves its ancestors untouched; the `HAS_SUBCONTEXT`
overlay edge survives soft delete and drops at purge (`DETACH DELETE`).

Soft-deleted content is invisible to every read surface (all access flows
through `HAS_CONTEXT`). There is no user-facing restore; within the 90-day
window an operator can manually reverse the stamp + edge. The transition is
one-way per surface — nothing moves a purged context back.

---

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

`Document.status` is both the lifecycle and the work queue — there is no
separate job node, because the Document already carries everything the worker
needs (`blobKey`, `mimeType`, `userHint`, parent FieldContext, uploader).

| Status       | Set By                                              | Meaning                                                                 |
| ------------ | --------------------------------------------------- | ----------------------------------------------------------------------- |
| `PENDING`    | `POST /api/ingest/document/process` (anchor + 202)  | File is in blob storage and queued; nothing extracted yet               |
| `PROCESSING` | `/api/cron/process-document-ingestion` on claim     | A worker owns this document and is running extraction + summarization   |
| `COMPLETE`   | The worker, a re-extract, or the inline test path    | Entities written, summary stored, ingest thread created                 |
| `FAILED`     | Same three writers, on unrecoverable error          | `statusMessage` holds member-safe copy; Re-extract (GOAL-241) recovers  |

Two `FAILED` reasons are owned by the worker rather than the pipeline, and both
are security-relevant: the document has **no single `UPLOADED_BY` uploader** (so
no identity to attribute writes to), or the uploader **lost `canEditContent`
between enqueue and the claim**. The `UPLOADED_BY` edge captures the
authorization decision, but the worker re-validates it live before spending
anything — see `kb/03-workflows.md` WF-10 step 2b.

Rules:

- **Claiming is conditional.** The worker writes a throwaway `ingestLockToken`
  to force Neo4j's write lock, re-checks `status = 'PENDING'` *under* that lock,
  and only then stamps `ingestClaimedBy`. Neo4j is read-committed, so the naive
  `MATCH (d {status:'PENDING'}) SET d.status='PROCESSING'` loses updates and
  every overlapping cron run wins — measured at 11/12 trials, all 8 claimants.
  Even the by-id form loses updates: an index seek only becomes `Locking` when a
  write follows it. Never simplify that shape back.
  The lock is taken on `ingestLockToken` and **not** on `ingestClaimedBy`
  because the lock-forcing write commits even when the guard rejects the row —
  so a loser writing `ingestClaimedBy` would leave it naming a worker that does
  not hold the claim (measured correct in 0/6 contended trials before this was
  fixed). It has to stay truthful: it is what an operator reads to find the
  owner of a stuck document, and the terminal writes fence on it.
- **Stalled claims are recovered, not orphaned.** A `PROCESSING` document whose
  `statusUpdatedAt` is older than 15 minutes (longer than the 300s function
  ceiling, so a live run is never stolen) returns to `PENDING`, or lands in
  `FAILED` once `ingestAttempts` reaches 3. No document can spin forever.
- **Legacy documents have no `status` property.** Every read coalesces a missing
  value to `COMPLETE`, so pre-GOAL-292 uploads are never re-ingested and never
  render as stuck.
- Re-extract is blocked while a document is `PENDING`/`PROCESSING` — a second
  pipeline on the same document would double-write its summary and thread and
  double the model spend. Enforced **server-side** in `handleReExtractDocument`
  (reason `in_progress`), not just by the disabled button: re-extract does not go
  through the worker's claim, so a direct GraphQL call would otherwise bypass the
  mutual exclusion entirely. A successful re-extract also lands a fresh terminal
  status, so it genuinely clears a `FAILED` document rather than leaving stale
  failure copy on a row that now has entities.

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
