# Prototype Feedback → Jira Triage

Operational knowledge for turning stakeholder / community prototype feedback
into GOAL Jira tickets **without creating duplicates**. Read this before filing
any batch of tickets from a feedback source (spreadsheet, WhatsApp thread, demo
notes).

## Canonical feedback source

Robert Damashek and community testers (e.g. "mastress") maintain a running
spreadsheet — **"Prototype 1.8 Issues"** (OneDrive/Excel) — with one row per
issue. Columns: `Member | Context | Issue | Expected | Priority | Notes |
Resolved`.

- **Priority scale is 1 = highest, 5 = lowest** (NOT the reverse). Map to Jira:
  1 → Highest/High, 2 → Medium, 5 → Low.
- The `Resolved = TRUE` column is the reporter's own view; it can disagree with
  Jira (a row marked resolved may still have an open ticket, and vice versa).
- Rows are appended over time and across multiple testers, so the same sheet
  mixes already-ticketed, already-fixed, and brand-new items. **Never assume a
  sheet is all-new.**

The sheet lives behind a OneDrive share link; read it with the Claude-in-Chrome
browser tools (Excel Online renders on a `<canvas>` in a nested iframe, so
`get_page_text` / accessibility-tree extraction return empty — you must read it
**visually via screenshots**, and jump to `A1` + `Ctrl+End` to find the used
range).

## The dedup rule (MANDATORY — this is the whole point of this file)

**Before creating ANY ticket from a feedback batch, reconcile every row against
existing GOAL issues.** In July 2026 a batch of 9 was drafted and 3 were exact
duplicates of a prior batch nobody remembered — caught only because the user
flagged it. Do not rely on the drafting agent's "recent issues" sweep alone; it
missed an older batch.

Reconciliation checklist:

1. **Query the `prototype1-feedback` label first.** Every ticket filed from this
   sheet carries it:
   ```
   project = GOAL AND labels = prototype1-feedback ORDER BY created DESC
   ```
   Tag every new ticket you create from the sheet with `prototype1-feedback`
   too, so the next triage finds it.
2. **Keyword-search the whole project** (not just recent) for each row's theme —
   e.g. `summary ~ "living system" OR summary ~ "non-member" OR ...`. Prior work
   is often **Done** (migration fixes especially recur); a Done ticket means
   "reference as a regression," not "file fresh."
3. **Map each sheet row to a verdict:** already-ticketed (skip, cross-link),
   marked-resolved-and-truly-done (skip), or genuinely-new (file).
4. When a row is a re-occurrence of a Done ticket, frame the new ticket as a
   **regression** and link it to the closed one, rather than describing it as a
   new discovery.

## Known batches (as of 2026-07-07)

| GOAL keys | Source | Notes |
| --------- | ------ | ----- |
| GOAL-285 … GOAL-292 | "Prototype 1.8 Issues" sheet, rows 2–8 | First batch; all `prototype1-feedback`. GOAL-292 owns the async-ingestion 504 fix. GOAL-291 is a task, not a bug. |
| GOAL-293, GOAL-294, GOAL-295 | Same sheet, rows 9–11 (+ WhatsApp) | Upload cross-context relationships / on-upload resonance / nested FieldContexts. |
| GOAL-296, GOAL-297 | WhatsApp thread (not the sheet) | Assistant limits/caps bug; per-user token & cost metering. |
| GOAL-298 … GOAL-303 | Same sheet, rows 12–17 | Second batch; `prototype1-feedback`. Upload entity attribution, non-member migration regression, cross-field search, LifeSensor type, doc-URL exposure, text-overflow. |

After this, sheet rows 2–17 are fully reconciled to Jira.

## Jira mechanics

- CloudId: `a15d0f93-d1b0-4577-92dd-973145588c2d` (site `codefoundry.atlassian.net`).
- Prefer the `jira-story-writer` agent to draft + create; it grounds acceptance
  criteria in the codebase. **Always give it the confirmed dedup verdict** —
  don't let it decide dedup unaided.
- Leave new tickets in **To Do**, no epic parent unless asked. Do not transition
  into `Verified By QA` / `Done` (human-owned) — see CLAUDE.md Jira workflow.
