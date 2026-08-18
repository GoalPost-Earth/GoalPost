# Architecture Decision Records — GoalPost

## ADR-001: Graph-First Data Model with Neo4j

**Decision:** GoalPost uses Neo4j as its primary and only database. All entities are nodes, all relationships are edges. No relational database.

**Implication:** Every feature must be modeled as nodes and relationships. Queries are Cypher, not SQL. The GraphQL layer uses `@neo4j/graphql` for automatic Cypher generation with `@authorization` directives.

**Why:** GoalPost's core value proposition is relational depth — connections between people, pulses, and resonances. A graph database makes these traversals natural and performant. The ontology (LifeSensors, FieldContexts, Pulses, Resonances) maps directly to graph structures.

---

## ADR-002: Pulse-First Architecture

**Decision:** All user contributions are modeled as Pulses (subtypes of FieldPulse). Goals, resources, stories, care points, and core values are all pulse types, not separate entity hierarchies.

**Rules:**

- Every pulse has: id, title, content, intensity, createdAt, createdBy
- Pulse types add specialized fields (e.g., GoalPulse adds status and horizon)
- Pulses live within FieldContexts, which live within Spaces
- Access to a pulse is determined by its FieldContext's parent Space

**Why:** Unifying everything as pulses enables the resonance system to find connections across all contribution types. A goal can resonate with a care point, a resource can connect to a story.

---

## ADR-003: Space-Based Privacy Model

**Decision:** Privacy is enforced through Spaces (MeSpace for personal, WeSpace for collaborative). There are no global roles or permissions — access flows from Space ownership/membership through FieldContexts to Pulses.

**Rules:**

- MeSpace: only owner can access (enforced by GraphQL `@authorization`)
- WeSpace: owner + members can access (role determines write vs. read)
- FieldContext: inherits from parent Space
- Pulses: inherit from parent FieldContext
- Person profiles: readable by any authenticated user

**Why:** GoalPost prioritizes user data sovereignty. The Space model gives users explicit control over who sees their content, without requiring a complex permission matrix.

---

## ADR-004: AI-Powered Resonance Discovery with Human-in-the-Loop

**Decision:** Semantic connections between pulses are discovered by AI (vector similarity + LLM analysis) but require human review before becoming established.

**Rules:**

- All pulses and conversation chunks get vector embeddings (OpenAI text-embedding-3-small, 1536 dims)
- Daily background job finds similar pulse clusters via cosine similarity
- LLM analyzes clusters and proposes ResonanceLinks with confidence scores and evidence
- Links are created with status `pending`
- Users must confirm, edit, or reject each link

**Why:** Pure AI-generated connections lack the nuance of human understanding. The human-in-the-loop model ensures connections are meaningful and respects user agency. The AI handles scale (finding candidates across thousands of pulses), humans handle quality.

---

## ADR-005: Next.js Full-Stack with API Routes

**Decision:** GoalPost is a single Next.js application handling both frontend rendering and backend API. No separate backend service.

**Stack:**

- Next.js App Router for pages and API routes
- GraphQL (GraphQL Yoga) served from `/api/graphql`
- REST endpoints for specialized operations (`/api/chat`, `/api/pulse`, `/api/resonance`, etc.)
- Background jobs run as Vercel Cron Jobs hitting API route handlers

**Why:** Simplicity for a small team. One deployment, one codebase, shared types. No separate worker process — Vercel Cron Jobs invoke API routes on a schedule.

---

## ADR-006: Multi-Label Node Strategy

**Decision:** Neo4j nodes use multiple labels for type hierarchy. E.g., a GoalPulse has labels `["FieldPulse", "GoalPulse"]`, a MeSpace has `["Space", "MeSpace"]`.

**Rules:**

- Base label always present (FieldPulse, Space, Person)
- Subtype label added for specialization
- GraphQL interface types map to base labels
- Concrete types map to subtype labels
- Constraints applied to base labels (e.g., `FieldPulse.id IS UNIQUE`)

**Why:** Enables querying all pulses generically (`MATCH (p:FieldPulse)`) or by type (`MATCH (p:GoalPulse)`). The `@neo4j/graphql` library supports this via interface/implementation mapping.

---

## ADR-007: Three AI Assistant Modes

**Decision:** The AI assistant supports three interaction modes: Standard (direct answers), Aiden (assumption-questioning), and Braider (presence-holding). Mode is a runtime toggle, not a permanent setting.

**Rules:**

- System prompts are the single source of truth (`src/lib/simulation/system-prompts.ts`)
- All tools are available in all modes — the system prompt directs how they're used
- Mode can be switched at any time via API parameter
- Current mode managed by singleton (dev) — future: session/DB storage for multi-user

**Why:** Different interaction needs require different AI behaviors. Looking up a person needs efficiency (Standard). Exploring a complex question needs depth (Aiden). Processing grief needs companionship (Braider).

---

## ADR-008: Background Jobs via Vercel Cron Jobs

**Decision:** Embedding generation, person enrichment, and resonance discovery run as scheduled background jobs via Vercel Cron Jobs, which invoke Next.js API route handlers on a configured schedule.

**Jobs:**

- Pulse Processing: triggered on pulse creation (or batched), generates embeddings
- Person Enrichment: triggered after pulse processing, updates profile with extracted themes
- Resonance Discovery: daily cron schedule, finds semantic connections

**Why:** Vercel Cron Jobs eliminate the need for a separate worker process, Redis instance, or BullMQ queue. Jobs are defined in `vercel.json` and hit API routes directly — simpler infrastructure, no additional services to manage, and scales with the Vercel deployment.

---

## ADR-009: Sentence-Based Conversation Chunking

**Decision:** Conversations with the AI assistant are split into sentence-level chunks, each stored as a `ConversationChunk` node with its own vector embedding.

**Rules:**

- Each sentence is a separate chunk (~3 sentences per chunk for batching)
- Chunks are linked to the pulse they were captured from (`HAS_CHUNK`)
- Chunk embeddings enable fine-grained semantic search
- Pulse embedding is a composite of pulse content + all linked chunk embeddings

**Why:** Sentence-level granularity enables finding specific moments in conversations, not just whole pulses. A pulse about grief might have individual chunks about different aspects of loss, each searchable independently.

---

## ADR-010: GraphQL Authorization via JWT Directives

**Decision:** Access control is enforced at the GraphQL schema level using `@authorization` directives that reference `$jwt.user.id`. No separate middleware layer.

**Rules:**

- Every type with privacy requirements has `@authorization(filter: [...])` directives
- Filters check ownership (`OWNS` relationship) and/or membership (`HAS_MEMBER` chain)
- `@private` fields (password, tokens) are excluded from all queries
- Computed fields use `@cypher` directives for complex access patterns

**Why:** Declarative authorization at the schema level is harder to bypass than middleware. The `@neo4j/graphql` library automatically applies filters to every query, making it impossible to accidentally return unauthorized data.

---

## ADR-011: Canvas Views Share One Apollo Cache — Toggling Never Refetches

**Decision:** The canonical canvas surfaces (Dashboard View, Bloom Exploration) are pure visual transforms of the **same Apollo-cached data**. Flipping between them MUST be a zero-network frontend change. (The former Graph View was deprecated and removed; the same rule applied to it.)

**Rules:**

- All views consume the same Apollo queries (currently `GET_ALL_ME_SPACES` + `GET_ALL_WE_SPACES`) with `fetchPolicy: 'cache-first'`.
- Bloom Exploration is NOT allowed to fetch its own data. It is "native NVL rendering," not "native NVL fetching."
- New view modes must reuse the queries the first-mounted view already warmed.
- Loading skeletons may render only on a genuinely cold cache (first ever mount of any view).

**Why:** Toggling a view is a presentational concern. A second network round-trip on toggle produced confusing loading flashes and made the surfaces feel unrelated. Sharing the cache also keeps the views structurally honest — they show the same things, just differently.

**Where this bites if violated:**

- A view that issues its own REST call (e.g. an earlier draft of `BloomView` POSTing to `/api/graph/neighborhood`) will flash a loading state every time the user flips to it, even when the data is already in the cache.
- Different queries with overlapping fields create silent cache misses (Apollo keys by selection set). Reuse the canonical query names.

---

## ADR-012: NVL `layout: 'free'` Is Mandatory When Positions Are Pre-Computed

**Decision:** When the application computes `(x, y)` positions for NVL nodes (e.g. via `createClusteredFieldNodePositions`), the `InteractiveNvlWrapper` MUST be passed `nvlOptions: { layout: 'free' }`.

**Rules:**

- `GraphVisualizer` and `NvlCanvas` consumers that set per-node `x`/`y` always include `layout: 'free'` in `nvlOptions`.
- Forget this and NVL silently runs its default force-directed simulation, which **ignores your positions** and arranges nodes by physics — usually scattering unconnected nodes across an empty canvas.
- The post-mount auto-fit pattern (`nvlRef.fit(ids, { maxZoom })` deferred ~120ms) requires the layout to honor positions; otherwise `fit()` lands on whitespace and the canvas reads as blank.
- An `nvlRef.fit(...)` call belongs in a `useEffect` gated by a `hasInitialFitRef` so it runs exactly once per data load.

**Why:** NVL's default is force-directed because most callers ship relationships and want emergent layout. GoalPost's cluster layouts are deliberate (e.g. grouping spaces by visual proximity), so we override.

**Where this bites if violated:**

- "I see a blank canvas, did this break?" — the bubbles exist but are physics-scattered hundreds of pixels off-screen.
- The auto-fit zooms out trying to encompass scattered nodes, then snaps to `maxZoom` cap and lands on emptiness.

---

## ADR-013: Authenticated Client Fetches Use the Bearer-Token Dance, Not Just the Cookie

**Decision:** Any client-side `fetch` to a user-scoped REST route MUST attach `Authorization: Bearer <jwt>` resolved via `/api/auth/access-token` (with a `/api/auth/refresh-token` fallback). Cookie-only `credentials: 'include'` is not sufficient.

**Rules:**

- The canonical helper is `chatApiAuthHeaders` in `src/lib/simulation/conversation-thread-client.ts`. Reuse it (or inline the same dance) for any new REST fetch from the browser.
- The pattern: try `/api/auth/access-token` first; if not OK, try `/api/auth/refresh-token`; attach the resulting `accessToken` as `Authorization: Bearer <jwt>`. Cookie still goes along via `credentials: 'include'`.
- Server routes resolve identity through `resolveAuthenticatedUserId(req)` (`src/app/api/auth/utils.ts`), which accepts either transport — the cookie is the legacy path, the bearer is what Apollo refreshes against.
- Apollo Client traffic does NOT need this dance — Apollo manages its own refresh cycle. The rule applies only to hand-written `fetch` calls.
- Even better: avoid the REST fetch entirely and go through Apollo (see ADR-011).

**Why:** The `accessToken` cookie has a 30-minute lifetime. When it expires, the cookie is gone but the user's refresh token is still valid — Apollo silently refreshes and continues, but a raw `fetch` 401s. The bearer dance gives raw fetches the same refresh capability Apollo already has.

**Where this bites if violated:**

- Routes silently 401 after 30 minutes of activity. UI shows empty data, not an error chip, because the catch path swallows the 401.
- Symptom: "It worked yesterday but now shows nothing" — the cookie went stale, refresh wasn't attempted, the API returned 401.
- This bug has shown up at least twice (chat thread routes, Bloom neighborhood). Treat it as a recurring class.

---

## ADR-014: Doc Ingestion Uses a Dedicated Extraction Endpoint, Not the Chat Route

**Decision:** Document ingestion runs through `POST /api/ingest/document/{presign,process}` — not through the existing `/api/chat/simulation` route. The process endpoint loads the blob + the FieldContext roster, invokes its own extraction model, and auto-executes the proposed write tool calls in a fresh ingest `ConversationThread`.

**Why:**

- **Model independence.** Extraction may use a reasoning model (Gemini multimodal for PDFs, OpenAI for text). The chat assistant is constrained to non-reasoning by Rule 6 (`kb/07-ai-assistant-ux.md`) and bounded by `stopWhen: stepCountIs(N)` (Rule 7). A separate route lets the extraction model evolve independently.
- **Failure containment.** A malformed extraction surfaces as a plain-text assistant turn in the ingest thread; it cannot leave the chat stream half-written.
- **Re-extraction.** "Re-extract on this Document" is a clean re-invocation of the same endpoint, not a re-injection of a synthesized user message into chat.

**Consequences:**

- The extraction model lives in its own factory entry, separate from `DEFAULT_ASSISTANT_MODEL` in `src/lib/llm/factory.ts`.
- The ingestion endpoint pre-loads the FieldContext roster server-side; the extraction model receives it inlined in its prompt and does not need read tools to discover what's in the context.
- The fresh ingest thread is forced to **default (Standard) mode** regardless of the user's prior assistant mode — Aiden and Braider are designed not to take action.

---

## ADR-015: Document Provenance via Document Node + Blob Storage + EXTRACTED_FROM Edges

**Decision:** Document ingestion creates a first-class `Document` node attached to the FieldContext via `HAS_DOCUMENT`, with the original file persisted in blob storage (AWS S3 in prod, in-memory store for dev/tests). Each entity extracted from the document carries an `EXTRACTED_FROM` edge back to the Document.

**Why:**

- **Re-extractability.** "Re-extract on this Document" requires the original file to still exist. Throwing it away after the chat turn forecloses on retry, prompt tuning, and model upgrades.
- **Audit answerable from the graph.** "Where did this Person come from?" is answered by following `EXTRACTED_FROM`, not by grepping chat threads or activity logs.
- **Avoids overloading Log.** `Log` records mutations, not file storage. Stuffing `documentId` / `blobUrl` into `Log.metadata` would couple two unrelated concepts and make "list all entities from this doc" awkward.

**Consequences:**

- Blob storage is now a first-class dependency in an otherwise Neo4j-only stack: new env vars (`AWS_*`, `INGEST_BLOB_BACKEND`), new failure modes, user-driven cleanup.
- `Document` has an `@authorization` directive that inherits from the parent Space — same pattern as `FieldContext`.
- `EXTRACTED_FROM` is load-bearing: removing or renaming it is a graph migration.
- Documents are **never auto-deleted**, even on full-rejection of extracted entities. Cleanup is user-driven via `deleteDocument`; the Document node and its blob drop together, but previously approved Persons and FieldPulses survive (their `EXTRACTED_FROM` edges drop with the Document). Because surviving pulses carry the document's durable download locator in `location` (GOAL-283/316), the delete transaction also nulls exactly those `location` values that parse to the deleted document's id and logs the clearing (GOAL-321); the download route sends browser navigations for an unresolvable document to `/document-unavailable` instead of a raw JSON 404.

## ADR-016: Extracted Organizations Are First-Class; Related People/Orgs Link via MENTIONED_IN (GOAL-298)

**Decision:** Document ingestion now captures **organizations** (groups, companies, cooperatives, institutions named in the document) as a first-class `Organization` node — labels `["Organization", "LifeSensor", "RelationalEntity"]`, attached to the FieldContext via `HAS_ORGANIZATION`. Separately, people and organizations the extractor identifies as *related to* a pulse (but not its author) are linked to that pulse via a new `MENTIONED_IN` edge. Authorship stays on `INITIATED_BY`.

**Why:**

- **Attribution + discovery.** Members need to find and connect with the people and organizations behind an article's resources and stories. Previously only the single pulse *author* (`INITIATED_BY`) was linked to a pulse; everyone else named was created as a context contact but left unconnected to the pulse they belonged to (the reported gap). Organizations weren't modelled at all — the extraction schema only knew persons and pulses, so orgs were silently dropped.
- **`MENTIONED_IN` ≠ authorship.** `INITIATED_BY` is single-valued (one credited author, read as `initiatedBy[0]`). "Related to / named in" is many-valued — one resource can name three people and a cooperative. Overloading `INITIATED_BY` couldn't express that; a distinct edge can.
- **First-class org, not Person-adjacent.** An organization is not a person. Modelling it as its own type (mirroring the migration's `Community:LifeSensor:RelationalEntity` shape) keeps queries and UI honest and leaves room for the Living-System / LifeSensor sub-class work.

**Consequences:**

- New GraphQL `Organization` type with a type-level context-reach READ gate (`contexts_SOME`, mirroring the PersonPulse branch) and `@mutation(operations: [])` — orgs are created server-side only, via the audited `create_organization` ingest tool. Not public (unlike Person/Community): an org in a private MeSpace stays space-scoped.
- New write tools `create_organization` + `link_entity_to_pulse` in `lib/chat/hitl.ts`; the ingest orchestrator resolves each link's endpoints by name/title from entities created earlier in the same run.
- The assistant's cypher-generator vocab (`schema-context.ts`) and the Bloom anchor/style map (`execute.ts`) learned `Organization` / `HAS_ORGANIZATION` / `MENTIONED_IN` — a new label/edge is invisible to the assistant until whitelisted (kb/07 Rule 9).
- **Deferred:** organizations carry no embedding / vector index yet (resonance is pulse↔pulse today), so semantic org discovery is a follow-up. Person embeddings for extracted non-author people are covered by the existing `discover-resonances` backfill.
