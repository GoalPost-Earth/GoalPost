# PRD — Document Ingestion at the FieldContext Level

## Problem Statement

A user holding a meeting note, a research summary, a planning doc, or a community-organizing PDF currently has no way to land that document into GoalPost as structured `FieldPulse`s and `PersonPulse`s. The only paths today are:

- **Manual entry** — open the FieldContext, click "Add Person" / "Create Pulse" once per entity, retyping or copy-pasting from the source. For a meeting note that mentions four people and two action items, this is six round-trips through the UI.
- **Conversational capture** — chat with the assistant about the document's contents, then capture pulses one at a time. This is fine for reflective material but slow and lossy for dense documents.
- **CSV/XLSX import (WF-09)** — only works for already-tabular data, doesn't extract anything, and operates at the Space level rather than the FieldContext level.

The friction means the relational and intentional knowledge already living in users' documents — who is involved, what's being pursued, what resources exist — stays trapped in files. The platform's value depends on that knowledge being in the graph where resonance discovery, person enrichment, and FieldContext views can act on it.

## Solution

A user uploads a document (`.txt`, `.md`, `.pdf`) directly from a FieldContext page, optionally adding a one-line "What is this?" hint. The server stores the file, invokes a dedicated extraction model that reads the document alongside the FieldContext's current roster of persons and pulses, and produces a batch of proposed creates and updates — `PersonPulse`s for people mentioned in the doc, `GoalPulse`s for objectives, `ResourcePulse`s for tools / people / knowledge, `StoryPulse`s for narratives and values.

The proposed entities land in the AI assistant chat in a **fresh conversation thread** as pending HITL tool calls grouped into a single **batch approval dialog**. The user clicks "Approve all" (default) or expands any entity to edit or reject it individually. On approval, each entity is written through the same GraphQL mutations as manual creation, and the originating `Document` node remains linked to the new entities via `EXTRACTED_FROM` edges for provenance and re-extraction.

The user gets, from one upload, the same graph state they would have built by clicking through six manual forms — and a permanent provenance trail back to the source.

## User Stories

1. As a community organizer, I want to upload a meeting-notes PDF from a FieldContext page, so that the people and action items in that meeting land as `PersonPulse`s and `GoalPulse`s without retyping.
2. As a researcher, I want to upload a `.md` summary of a paper to a research FieldContext, so that key resources and questions become `ResourcePulse`s and `StoryPulse`s I can connect to other work.
3. As a user who just uploaded a document, I want to see — in the assistant chat — exactly which entities were proposed, in one batch, so that I can approve them all in one click instead of clicking through one dialog per entity.
4. As a careful user, I want to expand any single proposed entity in the batch dialog, edit its fields, or reject it individually, so that I retain HITL control over what enters my FieldContext.
5. As a user with several people already in a FieldContext, I want the extractor to recognize when a document mentions someone I've already added (e.g. "Sarah Chen" matches an existing `PersonPulse`) and propose an **update** to that existing person rather than creating a duplicate.
6. As a user uploading a document that contains ambiguous mentions ("Sarah", "Dr. Patel", "the project lead"), I want the extractor to skip those low-confidence mentions and tell me which ones it skipped, so that my FieldContext doesn't fill with half-formed person records.
7. As a user whose upload didn't extract anything useful, I want a "Re-extract" action on the `Document` so that I can try again without re-uploading the file, optionally after the model improves.
8. As a user whose extraction failed (model error, malformed output, empty result), I want the assistant chat to clearly tell me what happened in the thread, so that "nothing in the graph, nothing in the UI" is never a possible state.
9. As a user uploading a document, I want to optionally add a one-line "What is this?" hint (e.g. "meeting notes from our Q2 strategy session — focus on action items"), so that the extractor uses that framing when proposing entities.
10. As a user, I want the doc-ingestion chat to start in a **fresh `ConversationThread`** (not in my existing reflective chat), so that the file content and batch tool calls do not pollute my prior conversation.
11. As a user, I want a thread switcher on the assistant panel so that I can move between my ongoing reflective chat and my recent doc-ingestion threads.
12. As a user, I want the doc-ingestion thread to run in **Standard mode** regardless of which mode my prior chat was in, so that the assistant actually emits tool calls (Aiden and Braider modes are designed not to take action).
13. As an admin of a WeSpace, I want only members with `canEditContent` permission to be able to upload documents to FieldContexts in that space, so that uploads respect the existing Space-based authorization model.
14. As a user inspecting an extracted `PersonPulse` six months later, I want to see what document it came from, so that I have provenance for who is in my FieldContext and why.
15. As a user, I want extracted entities to be eligible for the daily resonance-discovery cron just like any other pulse, so that resonance links between my newly-ingested content and my older content emerge naturally over time.
16. As a WeSpace member, I want my upload to NOT auto-create `CONNECTED_TO` edges between me and the extracted persons, so that the relational graph keeps its signal — "I actually know this person" — rather than collapsing into "this person appeared in a doc I have."
17. As a user uploading an unsupported file format (.docx, .xlsx, image, audio), I want a clear "not supported in v1" message at upload time, so that I'm not left waiting for an extraction that won't happen.
18. As a user uploading a document larger than the v1 cap (~20 pages / ~50K characters of extracted text), I want an immediate "this doc is too large — please split it" message at upload time, so that I don't wait on a doomed extraction.
19. As a user, I want only the v1 pulse subtypes `GoalPulse`, `ResourcePulse`, and `StoryPulse` to be emitted by the extractor, so that I don't have to clean up confused `CarePulse` / `CoreValuePulse` classifications (Care and CoreValue remain available via manual creation).
20. As a user uploading the same document a second time (intentional re-upload), I want a separate `Document` node and a fresh extraction thread, so that each upload event has its own audit trail.
21. As a user, I want the upload UI on the FieldContext page to clearly indicate which file types and size are accepted before I pick a file, so that I don't try uploading a `.docx` and get rejected after the fact.
22. As a user, I want the assistant turn that lands in my new ingestion thread to read naturally — "Uploaded `meeting-notes.pdf`. Hint: …" → "I extracted these entities …" — so that the thread is a coherent record of what happened.
23. As a user, I want approved entities to write activity `Log` records exactly like manual creation does (one Log per entity), so that the existing activity feed continues to be the canonical mutation history.
24. As a future maintainer reading the code, I want the synthesized assistant turn shape (pre-staged tool calls + `createApprovalHash`) to stay in sync with the runtime HITL shape, so that the batch approval flow can't silently break when one side changes.

## Implementation Decisions

### Output entities (no schema change to existing pulse types)

- **Extracted Person** → `["Person", "PersonPulse"]` node attached to the FieldContext via `(:FieldContext)-[:HAS_PERSON]->(:Person)`. Same shape as a `PersonPulse` added manually.
- **Extracted FieldPulse** → `GoalPulse`, `ResourcePulse`, or `StoryPulse` attached via `(:FieldContext)-[:HAS_PULSE]->(:FieldPulse)`. Same shape as a pulse created manually.
- v1 explicitly does **not** emit `CarePulse` or `CoreValuePulse` — those remain available via manual creation. (StoryPulse already absorbs the legacy Care + CoreValue concepts per the glossary.)

### New schema — `Document` node

A first-class node for uploaded source documents. Fields include: id, filename, mimeType, sizeBytes, blobUrl, optional userHint, uploadedAt. Relationships:

- `(:FieldContext)-[:HAS_DOCUMENT]->(:Document)`
- `(:Document)-[:UPLOADED_BY]->(:Person:User)`
- `(:Person)-[:EXTRACTED_FROM]->(:Document)` and `(:FieldPulse)-[:EXTRACTED_FROM]->(:Document)` — written on approval.

Authorization: `Document` inherits read access from its parent Space, same pattern as `FieldContext`. Documents are never auto-deleted, even on full-rejection of extracted entities; cleanup is user-driven.

### Transport — dedicated extraction endpoint (see ADR-0001)

A new `POST /api/ingest/document` route — not the existing chat route. It loads the `Document` blob and the FieldContext roster, invokes the extraction model (independent model choice, independent context budget, free of the chat assistant's non-reasoning constraint), and returns a structured `{ toolCalls, assistantText }` payload.

The server then appends two `ConversationTurn`s to a freshly-created `ConversationThread`: a `user` turn summarizing the upload, and an `assistant` turn whose `parts` are pre-staged write tool-call parts (matching `runWriteTool`'s hash + state shape) plus the extractor's free-text reply. The existing HITL UI hydrates them as if the chat assistant had emitted them.

### Provenance via blob storage + `Document` node (see ADR-0002)

The original file persists in blob storage (Vercel Blob or equivalent). Each approved entity carries an `EXTRACTED_FROM` edge to its source Document. This is the first first-class blob-storage dependency in an otherwise Neo4j-only stack.

### Deduplication is in-extractor

The extraction route pre-loads the FieldContext roster (persons + pulses, projected to id + name + minimal context) server-side and inlines it in the model prompt. The model emits `create_person` for genuinely new mentions or `update_person` for mentions that match an existing roster member. Same pattern for `create_pulse` / `update_pulse`.

### Partial persons are skipped, not fabricated

The extractor emits `create_person` / `update_person` only when it can confidently fill both `firstName` AND `lastName`. Low-confidence mentions (first-name-only, initials, role-only) are listed in the assistant's free-text reply for the user to act on manually if they choose.

### HITL — batch-aware dialog

The existing HITL Dialog is extended to detect multiple pending write tool calls in a single assistant turn and render them grouped with one "Approve all" primary action and per-entity expand for individual approve / reject / edit. Each underlying tool call still routes through `runWriteTool` (same hashing, same audit, same activity logging) — the batch shape is purely a UI grouping.

### Chat thread isolation

Every upload creates a fresh `ConversationThread` titled `Ingest: <filename>`, mode forced to **default (Standard)** regardless of the user's prior assistant mode. The assistant panel auto-switches to the new thread. The previous thread is untouched and can be returned to via the thread switcher (new UI implied by this decision).

### Failure handling — every upload always lands in the thread

On extraction failure (model error, malformed output, empty result), the synthesized assistant turn carries a plain-text message ("Extraction failed: …" / "I read this document but didn't find anything to extract") instead of pre-staged tool calls. The Document persists. The "Re-extract" action is the uniform retry path.

### Downstream pipelines reuse existing jobs

- Pulse embedding and Person enrichment run via the existing post-creation jobs (`WF-05`). No new pipeline.
- Resonance discovery runs **only** via the existing daily cron (`WF-06`). No immediate scoped pass in v1.

### Permissions

Uploads gated by `canEditContent(userId, parentSpaceId)` from `src/lib/permissions/space-permissions.ts`. Document read access via the same `@authorization` pattern as `FieldContext`.

### No auto-`CONNECTED_TO`

Document extraction does **not** automatically create a `CONNECTED_TO` edge between the uploading User-Person and extracted Persons. `EXTRACTED_FROM` records "this person came from a doc the user has"; `CONNECTED_TO` remains a deliberate user gesture made from the Person detail page.

### Scope limits (v1)

- Accepted mimeTypes: `text/plain`, `text/markdown`, `application/pdf`.
- Hard size cap: ~20 pages / ~50K characters of extracted text. Larger files rejected at upload time.
- Not supported in v1: `.docx`, `.xlsx`, image OCR, audio transcription. Adding them is a v2 scoping decision and does not require re-architecting the transport.

### Modules to build / modify

**Deep modules (new, isolated, testable):**

- `DocumentStorage` — `Document` node + blob lifecycle. Owns blob SDK integration and the `HAS_DOCUMENT` / `UPLOADED_BY` edges.
- `DocumentTextExtractor` — normalizes `.txt`, `.md`, and `.pdf` inputs to `{ text, pageCount, charCount }`.
- `FieldContextRoster` — projects the de-dup context (persons + pulses) the extraction model needs.
- `ExtractionModelInvoker` — wraps the extraction LLM call, parses structured output, validates against v1 pulse-type set, filters partial persons. Returns `{ toolCalls, assistantText }` or `{ failure, assistantText }`.
- `SynthesizedTurnAppender` — constructs `ConversationTurn.parts` with pre-staged tool-call parts whose `createApprovalHash` and `describeWriteAction` shape match the runtime HITL gate.
- `CreatePersonTool` / `UpdatePersonTool` — new HITL-gated write tools. Must be wired into `WriteToolName`, `executeAuthorizedWriteTool`, and `describeWriteAction`. Mutations also write the optional `EXTRACTED_FROM` edge when a `documentId` is provided.

**Glue / coordinators (thin, integration-tested):**

- `POST /api/ingest/document` route — permission check → DocumentStorage.upload → DocumentTextExtractor.extract → FieldContextRoster.load → ExtractionModelInvoker.extract → fresh ConversationThread → SynthesizedTurnAppender.append.
- Upload UI on the FieldContext page — file picker, optional hint input, triggers panel switch.
- Thread switcher UI on the assistant panel.
- Batch-aware HITL Dialog component.
- Document list + "Re-extract" UI on the FieldContext page or a Document detail view.

### Model & factory

Extraction model selection lives in its own factory entry, separate from `DEFAULT_ASSISTANT_MODEL` in `src/lib/llm/factory.ts`. Likely defaults to a reasoning model — explicitly **not** bound by the chat assistant's Rule 6 non-reasoning constraint.

### GraphQL contract

- New `Document` type with full `@authorization` directive inheriting from parent Space (mirrors `FieldContext`).
- New mutations: `createPerson`, `updatePerson`, `uploadDocument`, `reExtractDocument`, `deleteDocument`. Each carries activity logging consistent with existing mutations.
- New query: `documentsByFieldContext(fieldContextId)` for the Document list UI.

## Testing Decisions

### What a good test looks like here

Tests should verify **external behavior** — given input X, the module produces output Y or a graph state Z. They should not pin internal helper function shapes, internal state machines, or specific prompt strings. For modules that touch the LLM, use mocked LLM clients keyed on the structured-output shape — never assert on the natural-language assistant reply text.

The shape contract between `SynthesizedTurnAppender` and the runtime HITL gate is the **single most load-bearing invariant** of this feature. A test must pin it: a synthesized pending tool call must hash, render, and approve identically to one produced by `runWriteTool` at runtime.

### Modules to test

| Module | Test type | What we're verifying |
| --- | --- | --- |
| `DocumentStorage` | Integration (real blob test bucket, real Neo4j) | Upload writes blob + node + edges; delete removes blob AND node. Catches the blob/graph cleanup ordering bug class. |
| `DocumentTextExtractor` | Fixture-based unit | Known `.pdf`, `.md`, `.txt` fixtures produce known `{ text, pageCount, charCount }`. Catches encoding + page-count edge cases. |
| `ExtractionModelInvoker` | Mocked LLM | Prompt is built with roster + hint; structured-output parser tolerates whitespace / extra fields; v1 pulse-type validation rejects `CarePulse`; partial-person filter drops `firstName`-only mentions; failure path returns `{ failure }` not throws. |
| `SynthesizedTurnAppender` | Shape contract | A synthesized pending tool call has the same `createApprovalHash`, the same `describeWriteAction` summary, and the same `UIMessagePart` shape as a runtime-emitted one. Drift here silently breaks approval. |
| `CreatePersonTool` / `UpdatePersonTool` | Integration (real Neo4j) | Approved execution writes `["Person", "PersonPulse"]` labels, `HAS_PERSON` edge, optional `EXTRACTED_FROM` edge, and an activity `Log`. Verifies parity with manual `PersonPulse` creation. |
| Batch-aware HITL Dialog | Component | Multiple pending tool calls render grouped; "Approve all" triggers each underlying `runWriteTool`; per-entity expand allows individual approve / reject / edit; rejected entities never call their write tool. |
| `/api/ingest/document` route | E2E integration | Upload → extraction → synthesized turn → batch approval → entities present in Neo4j with `EXTRACTED_FROM` edges and a `Log` per entity. Single test that exercises the seams between deep modules. |

### Prior art

- Existing CSV import service (`src/lib/imports/csv-import-service.ts`) provides a model for integration-testing data-import flows against a real Neo4j session.
- Existing chat tools and HITL gate (`src/lib/simulation/chat-tools.ts`, `src/lib/chat/hitl.ts`) define the shape contracts that `SynthesizedTurnAppender` and the new write tools must align with.
- Existing pulse-creation mutations (`createGoalPulse`, `createResourcePulse`, `createStoryPulse`) provide the canonical reference for parity tests on `CreatePersonTool` / `UpdatePersonTool`.

## Out of Scope

- **Document formats beyond `.txt`, `.md`, `.pdf`** — `.docx`, `.xlsx`, image OCR, and audio transcription are explicit v2 candidates. Adding them is purely a `DocumentTextExtractor` extension; no transport or HITL changes needed.
- **Documents over ~20 pages / ~50K characters** — chunking strategy and multi-pass extraction are deliberately deferred. The cap is a scoping decision, not a transport limit.
- **Immediate scoped resonance discovery on approved entities** — v1 relies on the existing daily cron. A "find resonance now" action can be added later if user behavior demonstrates demand.
- **`CarePulse` and `CoreValuePulse` extraction** — Care and CoreValue remain available via manual creation only. Adding them to the extractor's emission set is unlocked by editing the extraction prompt — no architecture change.
- **Auto-`CONNECTED_TO` edges between the uploader and extracted persons** — preserved as a deliberate user gesture. Adding an opt-in toggle is a future UX change, not a v1 feature.
- **A manual duplicate-merge UI** — v1 relies on in-extractor de-dup. If duplicates do slip through (concurrent uploads in a WeSpace, model misses), users currently have no merge tool. A merge UI is a separate piece of work.
- **Document-level extracted metadata** (auto-generated title, summary, suggested `FieldContext.emergentName` updates) — out of scope; would expand the extractor's output contract.
- **Versioning / replacing the file on an existing `Document` node** — re-extraction reuses the same blob; uploading a new version of the same source is treated as a new `Document`.
- **Per-extracted-person checkbox for `CONNECTED_TO` inside the HITL Dialog** — considered and dropped.
- **Template / preset selection on the upload UI** ("Meeting notes" / "Research doc" / etc.) — v1 uses the free-text "What is this?" hint instead.

## Further Notes

### Related ADRs

- **ADR-0001 — Doc ingestion uses a dedicated extraction endpoint, not the chat route.** Records why `/api/ingest/document` exists as a separate route. A future engineer who tries to "simplify" by routing uploads through the chat route should read this first.
- **ADR-0002 — Document provenance via new `Document` node + blob storage + `EXTRACTED_FROM` edges.** Records the first-class blob-storage dependency and the EXTRACTED_FROM edge contract.

### Required reading before implementation

- `kb/05-data-entities.md` — `Person`, `PersonPulse`, `FieldPulse`, `FieldContext`, `ConversationThread`, `ConversationTurn`, `Log` shapes.
- `kb/07-ai-assistant-ux.md` — Rules 1, 2, 3 (no raw IDs leaked into chat copy), Rule 5 (HITL gate), Rule 6 (extraction model can be reasoning; chat assistant cannot), Rule 7 (`stopWhen: stepCountIs(N)` — does not apply to the extraction endpoint since it doesn't stream chat).
- `kb/02-user-roles.md` — `canEditContent` for upload gating, `@authorization` patterns for the new `Document` type.

### Mandatory agent dispatches during implementation

- `cypher-reviewer` — every new Cypher string and `@cypher` SDL block (Document writes, EXTRACTED_FROM edges, roster reads).
- `security-reviewer` — Document `@authorization` directive, upload permission gate, blob URL exposure model.
- `code-reviewer` — overall conventions, parity with existing CSV import patterns.
- `test-writer` — the test matrix above.

### CONTEXT.md

The full design conversation, glossary extensions (extracted entity, Document node), and decision rationale are captured in the project's root `CONTEXT.md`. ADR-0001 and ADR-0002 live in `docs/adr/`.
