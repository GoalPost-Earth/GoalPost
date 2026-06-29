---
name: jira-move
description: Move a Jira issue in the GoalPost project (GOAL) through the workflow columns (To Do → In Progress → Review) as work progresses. Trigger proactively when starting work on a GOAL-X ticket (move to In Progress) and when finishing work and ready for human review (move to Review). Review is the END of the automatic loop — Verified By QA and Done are human-owned and must never be set by the agent. Also trigger when the user says "move GOAL-X to <column>", "transition GOAL-X", "I'm starting on GOAL-X", "GOAL-X is ready for review", or pastes a GOAL-X Jira link in a work-starting context.
---

# /jira-move — Transition a GOAL issue through the board

Move a Jira issue in the GoalPost (`GOAL`) project to the appropriate column
based on the stage of work. Default behaviour is **proactive**: the agent
calls this skill on its own when it starts or finishes work on a GOAL-X
ticket, and announces the transition in one short sentence before it happens.

This mirrors the Jira workflow rule in `CLAUDE.md`: move to **In Progress**
when you start, **Review** when the work is done and ready for human/QA review.
The downstream states (`Verified By QA`, `Done`) are **owned by humans** — the
agent never moves an issue into them.

## When to fire (target column matrix)

| Stage of work | Target column |
| --- | --- |
| You're about to start coding for `GOAL-X` | **In Progress** |
| You finished implementation, reviewers ran (`code-reviewer` + any security/cypher/e2e reviewer that applies), build is green, change is ready for human review (PR opened or pushed) | **Review** ← **final automatic step** |
| QA-verified, merged, or otherwise "complete" | **NOT YOUR CALL** — `Verified By QA` and `Done` are human-owned. Stop and tell the user to move it themselves. |

**Review is the end of the automatic loop.** After moving a ticket to
Review, stop. Do not transition further on your own.

**Verified By QA and Done are never set by the agent — not even on request.**
Per `CLAUDE.md`, those board states are owned by humans. People reading the
board treat them as a human signal that the change has been QA'd / shipped.
If the user asks you to mark a GOAL issue `Verified By QA` or `Done`, decline
and explain that those transitions are reserved for a human, and that the
furthest you take a ticket automatically is **Review**.

## Hard rules

- **Announce, then act.** Before transitioning, output one short sentence:
  `Moving GOAL-123 to In Progress before I start.` or `Moving GOAL-123 to Review.`
- **Review is the final step — full stop.** Never chain into Verified By QA
  or Done, and never set them on explicit request either. Redirect the user
  to do it themselves.
- **Never invent issue keys.** If the key is not in scope, ask.
- **Never pass `transition.name`.** The MCP only accepts `transition.id`.
- **Never move backward by default.** Only forward through the workflow unless
  the user explicitly asks ("move GOAL-123 back to In Progress").
- **Never silently skip.** If the requested transition isn't available from
  the current column, report the available options and ask.
- **No-op early.** If the issue is already in the target column, stop and
  report no-op without firing a transition.

## GOAL project reference

| Field | Value |
| --- | --- |
| Project key | `GOAL` |
| Project name | GoalPost |
| Cloud ID | `a15d0f93-d1b0-4577-92dd-973145588c2d` |
| Instance | `codefoundry.atlassian.net` |
| Board URL | https://codefoundry.atlassian.net/jira/software/projects/GOAL/boards |
| Issue URL pattern | `https://codefoundry.atlassian.net/browse/GOAL-<n>` |

## Workflow columns

```
To Do → In Progress → Review → Verified By QA → Done
                         ↑ agent stops here   ↑ humans own these
```

| Target status | Status ID | Transition ID | Agent may set? |
| --- | --- | --- | --- |
| To Do | `10530` | `11` | yes (only to move backward on explicit request) |
| In Progress | `10531` | `21` | yes |
| Review | `10672` | `2` | yes — **final automatic step** |
| BUGS | `10877` | `3` | only on explicit request |
| Verified By QA | `10878` | `4` | **no — human-owned** |
| Done | `10532` | `31` | **no — human-owned** |

All six transitions are marked `isGlobal: true` on the GOAL board, which means
each is callable from any current status — so e.g. `To Do → Review` works
directly with `id: "2"` and no In-Progress hop is required. Verified
2026-06-29 against `GOAL-279` (To Do) and `GOAL-282` (Review).

**Do not confuse transition IDs with status IDs.** The MCP's `transition.id`
field takes the transition ID (`2`, `11`, `21`, `31`, `3`, `4`); the five-digit
numbers (`10530` To Do / `10531` In Progress / `10672` Review / `10878`
Verified By QA / `10532` Done / `10877` BUGS) are the destination status IDs
and will be rejected if passed as `transition.id`.

If a transition fails with `Transition id 'X' is not valid for this issue`,
the board's workflow has been edited — fall back to
`getTransitionsForJiraIssue` and use the freshly fetched ID.

## Procedure

### 1. Resolve the issue key

Try these sources in order — first hit wins:

1. **Slash-command argument**: `/jira-move GOAL-123 review` → key `GOAL-123`,
   target `review`.
2. **User message / recent conversation**: explicit `GOAL-\d+` mentions, or a
   Jira link the user pasted.
3. **Current git branch**: run `git branch --show-current` and look for a
   `GOAL-\d+` (or lowercase `goal-\d+`) prefix or substring (e.g.,
   `goal-282-docx-extraction`, `feature/GOAL-123-fix-thing`).

If no key is found across all three sources, **stop and ask** the user.
Do not guess.

### 2. Determine the target column

- If the user named a column ("move to review"), honour their wording —
  unless it is `Verified By QA` or `Done`, in which case decline (see Hard
  rules) and tell the user to set it themselves.
- Otherwise infer from the stage of work using the matrix at the top of this
  file.
- If still ambiguous, ask the user.

### 3. (Optional) Read the current status

Cheap pre-flight to avoid no-op transitions and to know which transitions
will be available:

```
mcp__atlassian__getJiraIssue with:
  cloudId: "a15d0f93-d1b0-4577-92dd-973145588c2d"
  issueIdOrKey: "GOAL-123"
  fields: ["status", "summary"]
```

If `status.name` already equals the target column, stop and report no-op.

### 4. Announce the move

Output exactly one short line before firing the transition. Examples:

- `Moving GOAL-123 to In Progress before I start.`
- `Implementation looks done — moving GOAL-123 to Review.`

### 5. Fetch available transitions (only as a fallback)

The IDs in the table above are global on the GOAL board and can be used
without a fetch. Only fall back to the dynamic fetch when an apply step
fails with `Transition id 'X' is not valid for this issue`:

```
mcp__atlassian__getTransitionsForJiraIssue with:
  cloudId: "a15d0f93-d1b0-4577-92dd-973145588c2d"
  issueIdOrKey: "GOAL-123"
```

Pick the transition whose `to.name` matches the target column and use its
`id` as `transition.id` in the next step.

### 6. Apply the transition

```
mcp__atlassian__transitionJiraIssue with:
  cloudId: "a15d0f93-d1b0-4577-92dd-973145588c2d"
  issueIdOrKey: "GOAL-123"
  transition: { id: "TRANSITION_ID" }
```

### 7. Confirm

Report a single line with the new status, summary, and URL:

```
GOAL-123 → In Progress  ·  [Import] DOCX upload extracts no entities  ·  https://codefoundry.atlassian.net/browse/GOAL-123
```

## Proactive behaviour during a feature/bug task

When a user gives you a task that references `GOAL-X` (or your branch contains
`GOAL-X` / `goal-X`), weave this skill into the lifecycle of the task:

1. **Before coding starts** — call this skill with target `In Progress`.
2. **After implementation, reviewers, and a green build** — call this skill
   with target `Review`. Do not move to Review until `code-reviewer` (and any
   other relevant reviewer — `security-reviewer`, `cypher-reviewer`,
   `e2e-tester`) has signed off, per `CLAUDE.md`.
3. **Stop here.** Do not move to Verified By QA or Done — ever.

If the task spans multiple GOAL tickets, transition each one independently in
the same lifecycle.

## Slash-command form

The user can also invoke this skill explicitly:

```
/jira-move GOAL-123 in-progress
/jira-move GOAL-123 review
```

Accept these column aliases case-insensitively:

| Input | Resolves to |
| --- | --- |
| `to-do`, `todo`, `to do` | To Do |
| `in-progress`, `in progress`, `progress`, `start`, `wip` | In Progress |
| `review`, `in-review`, `pr` | Review |
| `bugs`, `bug` | BUGS |
| `verified`, `verified by qa`, `qa`, `done`, `complete`, `closed`, `merged` | **declined — human-owned**; tell the user to set it themselves |

If the explicit form omits a target, fall back to the inferred-target logic
from step 2.

## Failure handling

| Symptom | What to do |
| --- | --- |
| User asks to set `Verified By QA` or `Done` | Decline; explain those are human-owned per `CLAUDE.md`; Review is the furthest the agent goes. |
| MCP returns `transition not available` | Fetch transitions, list the available `to.name` values to the user, ask which one they want. |
| Issue not found | Verify the key with the user; do not guess a different key. |
| MCP unavailable / authentication error | Report the error verbatim. Do not retry blindly. |
| Issue is in a non-GOAL project | Stop. This skill only handles GOAL. |

## What this skill does NOT do

- Set `Verified By QA` or `Done` — those are owned by humans.
- Create issues — that's the `jira-story-writer` agent.
- Comment on issues, log work, or assign issues.
- Track multiple issues in batch — call once per key.
- Move issues backward by default — only forward through the workflow unless
  the user explicitly asks ("move GOAL-123 back to In Progress").
