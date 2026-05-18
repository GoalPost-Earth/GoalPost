---
name: goalpost-context
description: Project glossary and design decisions. Captures domain terms as they are clarified or extended during design sessions.
---

# GoalPost — Context

> Project-wide glossary lives in `kb/01-glossary.md`. This file captures **additional** terms and decisions resolved during design conversations that extend or refine the base glossary.

---

## Document Ingestion

### Extracted entity

Output of the document-ingestion AI for a single uploaded document. An extracted entity is **always one of two shapes**:

1. **Extracted Person** — minted as a `["Person", "PersonPulse"]` node and attached to the target FieldContext via `(:FieldContext)-[:HAS_PERSON]->(:Person)`. Identical in shape to a person manually added to the FieldContext today.
2. **Extracted FieldPulse** — minted as one of `GoalPulse | ResourcePulse | StoryPulse` (v1 restricts to these 3 of the 5 subtypes — see *Pulse type set* below) and attached via `(:FieldContext)-[:HAS_PULSE]->(:FieldPulse)`. Identical in shape to a pulse manually created in the FieldContext today.

> **Terminology note.** Conversationally we may say a document "produces 3 person pulses and 1 resource pulse." Under the hood these are **structurally different**: a "person pulse" is a `Person` node (via `HAS_PERSON`); a "resource pulse" is a `FieldPulse` node (via `HAS_PULSE`). Different labels, different relationships, different vector indexes (`personBioVectorIndex` vs `pulseContentVectorIndex`), different GraphQL mutations.

A single document may produce zero or more extracted Persons and zero or more extracted FieldPulses, in any combination.

### Document (new node — proposed)

**Neo4j Labels:** `["Document"]`

A user-uploaded file ingested into a FieldContext. Persisted in the graph for provenance and re-extraction.

| Field        | Type     | Notes                                                    |
| ------------ | -------- | -------------------------------------------------------- |
| id           | string   | Unique                                                   |
| filename     | string   | Original filename                                        |
| mimeType     | string   | `application/pdf`, `text/plain`, `text/markdown` (v1)    |
| sizeBytes    | int      |                                                          |
| blobUrl      | string   | Blob-storage URL of the original file                    |
| userHint     | string   | Optional free-text "what is this?" hint from uploader    |
| uploadedAt   | datetime |                                                          |
| uploadedBy   | Person   | `UPLOADED_BY` relationship                               |

**Relationships:**
- `HAS_DOCUMENT` ← FieldContext
- `UPLOADED_BY` → Person:User
- `EXTRACTED_FROM` ← Person (PersonPulse) or FieldPulse (set on approval)

**Lifecycle:** A Document may have multiple extraction attempts (each producing a new ConversationThread). A Document is never auto-deleted, even if every extracted entity is rejected — the user can manually delete it.

### Ingestion flow (resolved)

1. **Entry point** — "Upload document" button on the FieldContext page. Gated by `canEditContent(userId, spaceId)` of the parent Space.
2. **Pre-flight** — server rejects files over the v1 size cap (~20 pages / ~50K extracted characters) and any mimeType outside `text/plain`, `text/markdown`, `application/pdf`.
3. **Persistence** — original file uploaded to blob storage (Vercel Blob or equivalent); a `Document` node is created with `HAS_DOCUMENT` from the FieldContext and `UPLOADED_BY` to the uploader.
4. **Thread isolation** — a **fresh** `ConversationThread` is created with a title like `Ingest: <filename>` and the assistant panel auto-switches to it. The thread is forced to **default (Standard)** mode for this purpose, regardless of the user's prior mode.
5. **Transport — dedicated extraction endpoint** — upload UI posts to a new `POST /api/ingest/document` route with `{ documentId, fieldContextId, userHint? }`. This route is **not** the chat route. It:
   - Loads the Document blob + extracted text.
   - Loads the FieldContext roster (persons + pulses) for de-dup context.
   - Invokes the **extraction model** (own model choice, own context budget, may be a reasoning model — independent of the chat assistant's Rule 6 constraints).
   - Returns a structured `{ toolCalls: WriteToolCall[], assistantText: string }` payload.
6. **Synthesized turn injection** — the server appends **two `ConversationTurn`s** to the fresh thread:
   - A `role: user` turn summarising the action ("Uploaded `<filename>`. Hint: `<userHint>`.") so the thread reads naturally.
   - A `role: assistant` turn whose `parts` are the pre-staged write tool calls plus the extractor's free-text reply (including any **skipped low-confidence person mentions** — see *Partial persons*). Each tool call is constructed server-side with the same hashing + state-shape that `runWriteTool` would produce, so it lands in the standard pending-approval UI.
7. **Tool calls emitted by extraction** — one of:
   - `create_person` for each new extracted Person — **new tool, must be added to `WriteToolName`**
   - `update_person` for each extracted Person that matches an existing FieldContext member — **new tool**
   - `create_pulse` for each new extracted FieldPulse (existing tool)
   - `update_pulse` for each extracted FieldPulse that matches an existing one (existing tool)
8. **HITL review** — emitted tool calls land in a **batch-aware** HITL Dialog. Default action: "Approve all." User can expand any single entity to approve / reject / edit just that one. Each underlying tool call still routes through `runWriteTool` for hash + audit (Rule 5 unchanged).
9. **Persistence on approval** — each approved tool call writes via the same GraphQL mutations as manual FieldContext creation. The server then writes the `EXTRACTED_FROM` edge from the new entity to the Document.
10. **Downstream pipelines** — pulse embeddings and Person enrichment run via the existing post-creation jobs (no new pipeline). Resonance discovery runs **only** via the existing daily cron (`WF-06`); no immediate scoped pass in v1.
11. **Retry** — a "Re-extract" action on the Document re-invokes `POST /api/ingest/document` (potentially with a different hint or model parameter) and produces a new ConversationThread. The Document is reused across attempts.

### Pulse type set (v1)

The extractor may emit **only** `GoalPulse`, `ResourcePulse`, or `StoryPulse`. The other two subtypes (`CarePulse`, `CoreValuePulse`) are intentionally excluded to avoid LLM classification drift — the glossary already notes that StoryPulse merges the legacy Care + CoreValue concepts. Care and CoreValue pulses remain available via the manual creation flow.

### Partial persons (v1)

The extractor emits `create_person` / `update_person` **only** when it can confidently fill `firstName` AND `lastName`. Low-confidence mentions (first-name-only, role-only, initials, etc.) are NOT minted as Person nodes — they are listed in the assistant's free-text reply ("I skipped these partial mentions: ...") so the user can add them manually if desired.

### Doc formats (v1)

Only `text/plain`, `text/markdown`, and `application/pdf` are accepted. PDFs ride as native AI-SDK file parts on the synthesized user message; text and markdown are inlined as text. DOCX, images, and audio are out of scope for v1.

### Document size policy (v1)

Hard cap at ~20 pages / ~50K characters of extracted text. Larger docs are rejected at upload time with a "split this up" message. No chunking, no multi-pass extraction in v1.

> The cap exists as a v1 scoping decision, **not** as a transport-layer constraint — because extraction runs on its own endpoint (step 5 above) with its own model and context budget, the cap can be raised in v2 without re-architecting the chat route.

### Failure handling

Every upload always ends with an assistant turn in the new thread. On extraction failure (model error, malformed output, empty result), the synthesized assistant turn carries a plain-text message ("Extraction failed: ..." / "I read this document but didn't find anything to extract") instead of pre-staged tool calls. The Document node persists in all cases. The user's next step is uniform: see the result in the thread, hit Re-extract if needed.

### No auto-CONNECTED_TO

The uploading User does **not** automatically receive a `CONNECTED_TO` edge to each extracted Person. `EXTRACTED_FROM` (Person → Document) is the only edge that records "this person came from a doc the user has." `CONNECTED_TO` is preserved as a deliberate user gesture made from the Person detail page, so the relational graph retains signal value. In WeSpace contexts this also avoids implicitly broadcasting "all members know this person" because one member uploaded a doc mentioning them.

### Implied new surfaces (track these in implementation planning)

- New API route: `POST /api/ingest/document` (extraction model invocation; does not stream chat output).
- New write tools: `create_person`, `update_person` (must be wired into `WriteToolName`, `executeAuthorizedWriteTool`, `describeWriteAction`).
- New "synthesized assistant turn" helper that constructs and appends a `ConversationTurn` containing pre-staged write tool-call parts with the same shape `runWriteTool` would produce (hash, summary). Used by the ingestion route.
- Batch-aware HITL Dialog: detects multiple pending write tool calls in one assistant turn, renders a stacked summary, default "Approve all".
- Conversation **thread switcher** UI on the assistant panel (implied by per-upload threads).
- Document GraphQL type + resolvers + `@authorization` directive (inherits from parent Space like FieldContext does).
- Blob-storage integration (first dependency of its kind in this otherwise Neo4j-only stack).
- "Re-extract" action on the Document node.
- Extraction model selection lives in its own factory (separate from `DEFAULT_ASSISTANT_MODEL` in `src/lib/llm/factory.ts`) — likely defaulting to a reasoning model.
