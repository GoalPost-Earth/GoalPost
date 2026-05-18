# Doc Ingestion — Slice 1 (GOAL-236) Session Summary

**Date:** 2026-05-18 (sessions 1 + 2)
**Branch:** `four-mode-studio`
**Jira:** GOAL-236 (epic GOAL-235)
**Commits (session 1):** `a706fe9`, `b84d8a5`
**Outcome (session 2):** Real Vercel Blob adapter wired (4 TDD cycles), upload UI shipped, security + code reviews captured below. GOAL-236 back in **Review**. Slices 2–7 still not started.

---

## What was asked

> "I have some document Ingestion tickets in JIRA. I need you to pick the tickets and implement them using tdd."

After the initial scope clarification the user picked:

- **Scope:** "All 7 slices (GOAL-236 → GOAL-242)"
- **TDD style:** "Strict vertical TDD on every module"

A second mid-session scope check landed on **finish slice 1 backend now, GraphQL surface as a follow-up, slices 2–7 to follow-up sessions**.

---

## Tickets in scope

Epic **GOAL-235 — Document Ingestion at the FieldContext level**, broken into 7 vertical slices:

| Ticket   | Slice                                                                                          | Status this session |
| -------- | ---------------------------------------------------------------------------------------------- | ------------------- |
| GOAL-236 | Slice 1 — `.txt` → one PersonPulse with provenance (load-bearing skeleton)                    | **Backend done → Review** |
| GOAL-237 | Slice 2 — Batch extraction: persons + GoalPulse/ResourcePulse/StoryPulse, "Approve all"        | Not started         |
| GOAL-238 | Slice 3 — PDF + Markdown support with upload-time size/format gating                           | Not started         |
| GOAL-239 | Slice 4 — In-extractor dedup via FieldContextRoster + partial-person filter                    | Not started         |
| GOAL-240 | Slice 5 — Thread switcher UI + Standard-mode forcing for ingest threads                        | Not started         |
| GOAL-241 | Slice 6 — Document list + Re-extract action with synthesized-turn failure handling             | Not started         |
| GOAL-242 | Slice 7 — Permission hardening + provenance visible on extracted entity detail views          | Not started         |

Also surveyed but not touched: GOAL-243 (resonance cron verification), GOAL-244 (re-upload semantics), GOAL-245 (delete mutation), GOAL-246 (E2E test infra).

---

## Strict-TDD cycles completed (16 total — 12 in session 1, 4 in session 2)

Each cycle followed the project's `/tdd` skill: one RED test → one GREEN minimal implementation → repeat. No horizontal slicing; tests verify external behaviour through public interfaces.

| # | Module                                              | Tests | Notes |
| - | --------------------------------------------------- | ----- | ----- |
| 1 | `hitl.ts` — `create_person` write-tool name + `describeWriteAction` | 5     | Added `create_person` to `WriteToolName`, registry, and dispatch summary. |
| 2 | `hitl.ts` — `buildPendingApprovalResult` factory (**load-bearing**) | 5     | Extracted the unapproved-tool-result construction into a shared factory. Refactored `runWriteTool` in `chat-tools.ts` to call it. |
| 3 | `synthesized-turn-appender.ts` (**load-bearing**)   | 10    | AI SDK v5 `tool-<name>` part wraps the same factory. Drift between synthesized turns and runtime turns is now physically impossible. |
| 4 | `document-text-extractor.ts`                        | 4     | `text/plain` only (PDF/MD ship in slice 3). |
| 5 | `field-context-roster.ts`                           | 2     | Empty roster v1 stub; slice 4 replaces with Neo4j projection. |
| 6 | `extraction-model-invoker.ts`                       | 5     | DI-injected `ExtractionModelClient`. Tests pin partial-person filter, empty-result path, failure-not-thrown contract, and no-raw-IDs-in-text. |
| 7 | `blob-store.ts` — interface + `MemoryBlobStore`     | 5     | Round-trip, missing-key, delete-idempotent, overwrite. |
| 8 | `document-storage.ts` (Neo4j integration)           | 4     | Real Neo4j against dev Aura. Pins "reserve graph node BEFORE blob put" so failed uploads can't leak orphan blobs. |
| 9 | `hitl.ts` — `executeAuthorizedWriteTool('create_person', …)` (Neo4j integration) | 3     | Pins `["Person","PersonPulse"]` labels, `HAS_PERSON`, optional `EXTRACTED_FROM`, one `Log` entry. Permission gate refused outsider. |
| 10| `handle-ingest-document.ts` (end-to-end integration)| 4     | Composes everything: upload → extract → fresh thread titled `Ingest: <filename>` → synthesized assistant turn → approval landed PersonPulse with EXTRACTED_FROM. Happy / approval / failure / permission paths. |
| 11| `upload-document-input.ts` validator                | 8     | Base64 round-trip detection, mimeType allow-list, size cap, whitespace-only hint normalisation, etc. |
| 12| GraphQL Document type + resolver wiring             | —     | Schema additions are declarative; resolver re-uses `handleIngestDocument` + `validateUploadDocumentInput`. |
| 13| `vercel-blob-store.ts` — `put` adapter (session 2)  | 1     | Forwards pathname, buffer, contentType, access=public, allowOverwrite=true, addRandomSuffix=false, token; returns BlobRef shape. |
| 14| `vercel-blob-store.ts` — `delete` adapter (session 2) | 1   | Forwards key + token to SDK `del`; swallows BlobNotFoundError to honour the idempotent contract. |
| 15| `vercel-blob-store.ts` — `get` adapter (session 2)  | 2     | `head` + `fetch` round-trip back to Buffer; returns null on missing blob. |
| 16| `vercel-blob-store.ts` — token guard (session 2)    | 1     | Throws a clear error if `BLOB_READ_WRITE_TOKEN` is unset, rather than an opaque SDK 401. |

Plus a separate skip-gracefully integration test (`vercel-blob-store.integration.test.ts`) — runs a live put → get → delete round-trip only when `BLOB_READ_WRITE_TOKEN` is set in the environment.

**Final test count:** **121 tests across 15 test suites passing** (was 115 across 13 in session 1).

---

## Files added / modified

### New library code (`src/lib/ingest/`)

| File                                         | Lines | Purpose |
| -------------------------------------------- | ----- | ------- |
| `blob-store.ts`                              | 61    | `BlobStore` interface + `createMemoryBlobStore()` test double. |
| `vercel-blob-store.ts`                       | 76    | Real `@vercel/blob` adapter (session 2) — `put` / `get` (via head + fetch) / `delete` (idempotent). Throws clear error if `BLOB_READ_WRITE_TOKEN` is unset. |
| `document-text-extractor.ts`                 | 44    | `text/plain` → `{ text, charCount, pageCount }`. |
| `field-context-roster.ts`                    | 34    | Returns empty roster for v1; slice 4 replaces with Neo4j projection. |
| `extraction-model-invoker.ts`                | 109   | Wraps the LLM call behind a DI'd client; partial-person filter, failure path. |
| `openai-extraction-model-client.ts`          | 87    | Production wiring with `generateObject` + Zod, separate model id from `DEFAULT_ASSISTANT_MODEL`. |
| `synthesized-turn-appender.ts`               | 65    | Builds AI SDK v5 `tool-<name>` parts that wrap `buildPendingApprovalResult`. |
| `document-storage.ts`                        | 147   | Document lifecycle: reserve graph → put blob → patch blobKey. |
| `handle-ingest-document.ts`                  | 222   | Slice 1 orchestrator composing all of the above. |
| `upload-document-input.ts`                   | 91    | Pure validator shared between REST + GraphQL. |

Plus matching `*.test.ts` files for each (`hitl.test.ts` lives at `src/lib/chat/hitl.test.ts`).

### Existing library code modified

| File                                              | Change |
| ------------------------------------------------- | ------ |
| `src/lib/chat/hitl.ts`                            | Added `create_person` to `WriteToolName`, registry, `describeWriteAction`; extracted `buildPendingApprovalResult` factory; added `createPersonAuthorized` + dispatch branch in `executeAuthorizedWriteTool`. |
| `src/lib/simulation/chat-tools.ts`                | `runWriteTool` now calls `buildPendingApprovalResult` (drift-proofing). |
| `jest.config.js`                                  | Added `moduleNameMapper` so `@/` path aliases resolve under Jest. |
| `src/lib/ingest/synthesized-turn-appender.test.ts`| Tightened typecasts so strict `tsc --noEmit` passes. |

### GraphQL surface

| File                                                | Change |
| --------------------------------------------------- | ------ |
| `src/lib/graphql/schema/schema.gql`                 | Added `Document` type with `@authorization` (mirrors FieldContext); `FieldContext.documents` relationship; `UploadDocumentInput`, `IngestDocumentResponse`; `uploadDocument` mutation; `documentsByFieldContext` query. |
| `src/lib/graphql/resolvers/document-resolver.ts`    | New resolver — thin wrapper around `handleIngestDocument` + Neo4j read for the query. Selects blob backend at request time via `INGEST_BLOB_BACKEND`. |
| `src/lib/graphql/resolvers/index.ts`                | Spreads `documentMutations` / `documentQueries` into root resolvers. |

### REST surface

| File                                          | Change |
| --------------------------------------------- | ------ |
| `src/app/api/ingest/document/route.ts`        | New `POST` route — multipart upload, JWT auth via cookie, calls shared `validateUploadDocumentInput` + `handleIngestDocument`. |

### Upload UI (session 2)

| File                                                                                  | Change |
| ------------------------------------------------------------------------------------- | ------ |
| `src/components/ui/upload-document-modal.tsx`                                         | New 211-line modal — file picker, optional hint, client-side base64 + mimeType + size validation mirroring `upload-document-input.ts`. |
| `src/app/protected/dashboard/field-context/[id]/page.tsx`                             | Added "Upload Document" action button, recent-documents panel, modal wiring with toast feedback. Pre-existing file already over the 400-line cap; new code did not introduce that violation. |
| `src/app/graphql/mutations/DOCUMENT_MUTATIONS.ts`                                     | `UPLOAD_DOCUMENT_MUTATION` (uses plain `gql` from `@apollo/client` so it compiles without re-running codegen). |
| `src/app/graphql/queries/DOCUMENT_QUERIES.ts`                                         | `GET_DOCUMENTS_BY_FIELD_CONTEXT` — intentionally omits `blobUrl` / `blobKey` from the selection set. |
| `src/app/graphql/mutations/index.ts`, `src/app/graphql/queries/index.ts`              | Re-exports for the new operations. |
| `package.json` / `package-lock.json`                                                  | Added `@vercel/blob@2.3.3`. |

---

## Acceptance criteria status (GOAL-236)

| AC                                                                                              | Status |
| ----------------------------------------------------------------------------------------------- | ------ |
| Document node with `HAS_DOCUMENT` to FieldContext, `UPLOADED_BY` to uploader, file in blob       | Done (DocumentStorage integration test) |
| Extraction returns ONE `create_person` with `firstName` AND `lastName`                          | Done (ExtractionModelInvoker test) |
| Fresh `ConversationThread` titled `Ingest: <filename>` with user turn + synthesized assistant turn | Done (handleIngestDocument test) |
| HITL Dialog hydrates the pending tool call identically to runtime emission                       | Done (shape-contract test — paired tests in `hitl.test.ts` + `synthesized-turn-appender.test.ts`) |
| Approve → `["Person","PersonPulse"]` + `HAS_PERSON` + `EXTRACTED_FROM` + one `Log`              | Done (create-person-tool integration test) |
| Permission gate runs before blob put                                                             | Done (DocumentStorage rejects upload to nonexistent context; handleIngestDocument rejects outsider) |
| No raw IDs in user-visible copy                                                                 | Done (pinned in `describeWriteAction`, `extraction-model-invoker`, `handle-ingest-document` tests) |
| Failure handling — model error → plain-text assistant turn, Document persists                    | Done (handle-ingest-document failure-path test) |
| No new file exceeds 400 lines                                                                   | Done (`handle-ingest-document.ts` is the largest at 222 lines) |
| Approved PersonPulse triggers post-creation embedding job (WF-05)                               | **Not done** — manual `createPeople` flow today also doesn't auto-embed; parity preserved. Revisit when person enrichment is updated to cover PersonPulse profile fields. |

---

## What still needs to be done

### To complete Slice 1 fully (GOAL-236)

1. **Provision `BLOB_READ_WRITE_TOKEN` for production.** Session 2 wired the real Vercel Blob client, but the env var must be set in Vercel for the production code path to work. Local dev can still use `INGEST_BLOB_BACKEND=memory` to bypass.
2. **Browser smoke-test the upload UI.** Session 2 typecheck-verified the wiring but did not exercise the modal end-to-end in a real browser. Suggested manual flow: `INGEST_BLOB_BACKEND=memory npm run dev` → log in → navigate to a FieldContext → click **Upload Document** → pick a small `.txt` → check toast + recent-documents panel update.
3. **Review follow-ups (advisory — see "Reviews completed" below).** The session-2 security and code reviews flagged several Should/Must-fix items, none of which were acted on. Triage them into follow-on tickets before treating Slice 1 as fully landed:
   - **Permission predicate drift** — `handle-ingest-document.ts`, `document-resolver.ts`, and `hitl.ts` hand-roll three slightly different versions of "is this user in the FieldContext's Space?" Replace with `canEditContent` / `canViewContent` from `src/lib/permissions/`.
   - **Custom `documentsByFieldContext` resolver bypasses the schema `@authorization` directive** — read path is currently wider than the write path (no role filter). Either delete the custom resolver and let `neo4j-graphql` autogenerate it, or harden it to match.
   - **No `Log` entry for the upload itself** — `uploadDocument` mutates the graph but emits no activity log. Add `createLog({...})` after success in `handle-ingest-document.ts`.
   - **Filename is not sanitised before becoming the blob key path** — `..`, slashes, control chars all flow through to `documents/<docId>/<filename>` (low severity given the UUID prefix isolates blobs per upload).
   - **Multipart REST body is buffered before the 50 KB cap is enforced** — pre-check `Content-Length` or stream-bound the read in `src/app/api/ingest/document/route.ts`.
   - **Returned `documentId` / `threadId` are raw prefixed IDs** in `IngestDocumentResponse` — confirm whether the kb/07-ai-assistant-ux.md ban on `pulse_…`/`ctx_…` extends to API response IDs.
4. **Cypher review** — was dispatched but stopped before completing. Re-run if confidence in the `createPersonAuthorized` Cypher + `document-storage` Cypher matters before shipping.

### Reviews completed (session 2)

Two of the three mandatory review agents ran to completion. Findings are advisory — none were acted on in this session.

**Security review — none Critical/High. Medium/Low:**

| Severity | Finding                                                                                                                          | Location |
| -------- | -------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Medium   | Resolver Cypher admits any `SpaceMembership` row regardless of `sm.role`; read path wider than write path                       | `document-resolver.ts:130-134`, `schema.gql:531-557` |
| Medium   | `IngestDocumentResponse` returns raw `document_…` / `thread_…` IDs — verify intent vs. kb/07-ai-assistant-ux.md ID-exposure rule | `handle-ingest-document.ts:217-220`, `schema.gql:579-584` |
| Low      | Filename is not sanitised before becoming the blob key path                                                                       | `upload-document-input.ts:61-64`, `document-storage.ts:85` |
| Low      | Multipart request size unbounded before the 50 KB validator runs                                                                  | `route.ts:52-67` |
| Low      | Document-storage error message embeds raw `fieldContextId` + uploader UUID                                                        | `document-storage.ts:79-81` |
| Note     | `requireUserId` + `@authorization` are complementary, not contradictory                                                           | `document-resolver.ts:47-55` |
| Note     | Permission gate ordering is correct — runs before any blob put / model invocation                                                 | `handle-ingest-document.ts:131-148` |
| Note     | `access: 'public'` on the blob is acceptable given Space membership gates URL surfacing, but once exposed the URL never expires   | `vercel-blob-store.ts:12-21` |

**Code review — Must-fix / Should-fix / Note:**

| Severity   | Finding                                                                                                                                   | Location |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Must fix   | Permission predicate hand-rolled three slightly different ways across `handle-ingest-document.ts`, `document-resolver.ts`, and `hitl.ts` — replace with `canEditContent` / `canViewContent` | `handle-ingest-document.ts:94-95`, `document-resolver.ts:131-134`, `hitl.ts:357` |
| Must fix   | Custom `documentsByFieldContext` resolver bypasses the schema `@authorization` directive, creating a second auth surface that has already drifted (no role filter on read) | `document-resolver.ts:117-163` |
| Must fix   | GraphQL resolver maps every `IngestFailure` to `FORBIDDEN` — too broad for slices 2/3 once extraction / validation failures join that path | `document-resolver.ts:89-93` |
| Should fix | `uploadDocument` emits no `Log` entry despite mutating the graph; activity feed misses it                                                  | `handle-ingest-document.ts:158` (proposed insertion point) |
| Should fix | `Log.description` in `create_person` uses uploader-supplied `contextTitle` rather than resolving from the graph                            | `hitl.ts:1040` |
| Should fix | `createIngestThread` local helper duplicates `conversation-thread.service` logic — lift it instead of duplicating                          | `handle-ingest-document.ts:22-49` |
| Should fix | `OPENAI_INGEST_EXTRACTION_MODEL` default equals `DEFAULT_ASSISTANT_MODEL` — env var is dead weight                                          | `openai-extraction-model-client.ts:42` |
| Consider   | `vercel-blob-store.ts` uses `access: 'public'` and the schema still exposes `blobUrl: String` — any future selection of that field gets a permanent public URL | `vercel-blob-store.ts:14-17`, `schema.gql:566` |
| Note       | AI UX raw-ID audit clean — no `pulse_…`/`ctx_…`/UUIDs in user-facing copy paths                                                            | — |
| Note       | HITL parity tests via `buildPendingApprovalResult` factory called out as strongest in the slice                                            | `synthesized-turn-appender.test.ts` |
| Note       | Pre-existing file-size violations extended but not introduced — `hitl.ts` (1,248 lines), `chat-tools.ts` (877), field-context page (1,450) | — |
| Note       | Test gaps: no test for the GraphQL resolver wrapper or REST route shell                                                                    | `document-resolver.ts`, `route.ts` |

**Cypher review** was dispatched but stopped before producing findings — re-run if needed.

### Open follow-on slices

| Slice | Ticket   | Effort hint                                                                                            |
| ----- | -------- | ------------------------------------------------------------------------------------------------------ |
| 2     | GOAL-237 | Add `create_goal_pulse` / `create_resource_pulse` / `create_story_pulse` write tools; extend `ExtractionModelInvoker` schema for multi-entity output; batch-aware HITL Dialog grouping with "Approve all". ~5–7 TDD cycles. |
| 3     | GOAL-238 | Extend `DocumentTextExtractor` for `.pdf` and `.md`; raise size cap with character-count gating. ~3–4 cycles. |
| 4     | GOAL-239 | Replace `FieldContextRoster` stub with Neo4j projection of persons + pulses; teach extractor to emit `update_*` for matches; add `update_person` write tool branch. ~5–6 cycles. |
| 5     | GOAL-240 | Assistant-panel thread switcher across recent `ConversationThread`s; force Standard mode on ingest threads. UI + small backend changes. |
| 6     | GOAL-241 | `documentsByFieldContext` UI (query already shipped); Re-extract action + endpoint; the synthesized failure path already exists. |
| 7     | GOAL-242 | Polish `canEditContent` checks; surface "Extracted from `<filename>`" on Person/Pulse detail pages by traversing the `EXTRACTED_FROM` edge. |

### Cross-slice supporting tickets

- **GOAL-243** — verify extracted entities flow through the daily resonance cron (`WF-06`). Most likely no code change; verification + maybe a test fixture.
- **GOAL-244** — re-upload semantics: same file → new Document, new ingest thread.
- **GOAL-245** — `deleteDocument` mutation + UI. `deleteDocument(...)` Neo4j+blob helper already exists in `document-storage.ts`; surfacing it through GraphQL is small.
- **GOAL-246** — E2E test infra: fixture files + blob test bucket.

---

## Architectural notes worth carrying forward

### The load-bearing invariant

`buildPendingApprovalResult(tool, args)` in `src/lib/chat/hitl.ts` is the **single shared factory** that constructs the unapproved-HITL tool-result shape. Both the runtime gate (`runWriteTool` in `src/lib/simulation/chat-tools.ts`) and the doc-ingestion `SynthesizedTurnAppender` call it. The HITL Dialog cannot tell a synthesized pending tool call apart from a runtime one because they emit the same object — paired tests in `hitl.test.ts` and `synthesized-turn-appender.test.ts` pin the contract.

Any future slice that introduces a new write tool or another synthesized-turn path **must call this factory** rather than rebuild the shape inline.

### Why a separate route, not the chat assistant route

`POST /api/ingest/document` is intentionally NOT the chat route (`/api/chat/simulation`). Per **ADR-0001**:

- Extraction can be a reasoning model independent of the chat assistant's non-reasoning default (KB Rule 6 does not apply here).
- Failure containment: a malformed extraction surfaces as a plain-text assistant turn rather than leaving the chat stream half-written.
- Re-extract is a clean re-invocation of the same endpoint.

The synthesized assistant turn is what bridges back to the chat surface — the user opens their assistant panel, the ingest thread is "active," and the HITL Dialog renders the pre-staged tool calls as if the chat assistant had emitted them.

### Document provenance contract

Per **ADR-0002**: extracted entities carry an `EXTRACTED_FROM` edge to their source `Document`. This is load-bearing — renaming or removing it is a graph migration. Documents are never auto-deleted; cleanup is user-driven (slice 6).

### ConversationThread.ownerId constraint workaround

The `conversation_thread_ownerId UNIQUE` Neo4j constraint enforces ONE implicit thread per user. The existing `createConversationThread()` helper at `src/lib/simulation/conversation-thread.service.ts` sets `ownerId`, which collides on the second call for the same user.

The slice-1 orchestrator works around this with a local `createIngestThread()` helper that **does not set `ownerId`**, so ingest threads coexist with the user's main chat thread. `appendConversationTurn(..., threadId)` matches by `id` rather than `ownerId`, so this is safe.

Later slices that touch threading should be aware of this asymmetry — if they need a "create a fresh thread" primitive, lift the local helper into `conversation-thread.service.ts` rather than duplicating the workaround.

---

## Test commands

Run only the new + adjacent tests:

```bash
npm test -- src/lib/chat src/lib/ingest src/lib/simulation
```

Run a single suite (recommended during slice 2 work for fast feedback):

```bash
npm test -- src/lib/ingest/handle-ingest-document.test.ts
```

Neo4j integration tests gracefully skip if `NEO4J_URI` is unreachable; otherwise they run against whatever `.env.local` points at (the dev Aura instance during this session).
