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
