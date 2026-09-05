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

**Amendment (GOAL-347) — scheduling on non-production environments:** Vercel Cron fires **only against a project's production deployment**. `goal-post` is a single Vercel project whose production target is `main` → goalpost.earth, so the `crons` block in `vercel.json` never reaches `dev.goalpost.earth` or `demo.goalpost.earth`. Every job declared there is therefore a no-op on those environments — the nightly resonance sweep had never executed on demo at all, leaving six Spaces with zero embedded pulses and, because an un-embedded pulse is invisible to vector search, no resonance at all.

The three options were: promote demo to a production target, invoke the routes manually, or drive them from an external scheduler. Promotion is not available — one project has one production target, and it belongs to `main`. Manual invocation is not a schedule. So:

- **Production** stays on `vercel.json`.
- **dev and demo** are driven by GitHub Actions `schedule:` workflows that call the same routes with the same `Authorization: Bearer <CRON_SECRET>` header:
  - `.github/workflows/drain-queues.yml` — the every-5-minutes queue workers (GOAL-292, GOAL-326).
  - `.github/workflows/nightly-resonance.yml` — the midnight resonance sweep (GOAL-347).
- An environment must appear in exactly one of the two mechanisms. Adding production to a workflow would run every job twice.

Consequences to design around:

- GitHub `schedule:` ticks are **best-effort** (measured 19–94 minutes late on this repo). Fine for a nightly sweep; not a latency guarantee, which is why the queues also kick their worker at enqueue time (`src/lib/jobs/kick-queue-worker.ts`).
- A `schedule:` trigger only fires from the **default branch**, so a workflow edited on `dev`/`demo` does nothing until merged to `main`.
- GitHub disables scheduled workflows after 60 days of repo inactivity.
- Every scheduled route must be **fail-closed** on `CRON_SECRET` — these routes drive model spend and write across Spaces, so an unset secret must not leave them anonymously triggerable.
- A scheduled route must **budget itself under `maxDuration`** and report progress rather than run until the platform kills it. See ADR-008a.

---

## ADR-008a: Scheduled Sweeps Are Budgeted and Resumable

**Decision:** A scheduled job that fans out over the whole graph runs against an explicit wall-clock deadline, stops cleanly when the budget is spent, and orders its work so the next run continues where the last one stopped. Stopping early is a **success**, not a failure.

**Rules:**

- The route sets a budget below `maxDuration` (currently 270s of 300s) so it always has room to serialize a report.
- Work units check the deadline at the finest granularity that is expensive — for resonance discovery, per pulse, since one pulse is a vector search plus an LLM analysis.
- Fan-out is ordered **least-recently-processed first**, persisted in the graph (`:ResonanceSweepState {spaceId, lastSweptAt}`). A unit that throws is still stamped, or a permanently-failing one starves everything behind it.
- The response reports what remains (`complete`, `spacesSwept/spacesTotal`, per-phase `remaining`) so an operator can watch a backlog converge instead of guessing.

**Why:** The prior sweep had no budget and no cursor: it fanned out over every Space with an LLM call per pulse and simply ran until the platform killed it at 300s. Because it re-enumerated Spaces in the same order every time, it would die at the same point every time — the Spaces behind that point never swept even once — and the caller got a bare 504 that discarded the counts for the phases that HAD succeeded. (On demo the question never even arose: the route was never invoked at all, which is the bug GOAL-347 opened on. The cost profile is what made the fix more than a scheduling change: the very first successful run is the most expensive one the sweep will ever do.) A deadline turns the kill into a clean stop; the ordering turns the clean stop into forward progress.

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
- **Prefer a TYPE-level filter over a field-level one.** `@neo4j/graphql` v6
  expands a field-level `@authorization` filter once per gated field **in the
  selection set**, with no deduplication, and Neo4j's planning cost is
  super-linear in the resulting predicate count. The GOAL-275 Person PII rule,
  copied onto 14 fields, compiled to 348 `EXISTS` and took ~31 s to *plan* —
  past the 60 s `maxDuration` on `/api/graphql`. A type-level filter is emitted
  exactly once no matter how many fields are selected. When a subset of a
  node's fields needs gating, put that subset on its own type over the same
  `@node(labels:)` (locked down with `@query(read: false, aggregate: false)` and
  `@mutation(operations: [])`) and reach it from the open type via a `@cypher`
  field — see `Person.privateProfile` → `PersonPrivateProfile`.
- **Do not put a `@cypher` field inside an `@authorization` filter.** The
  library emits it as `MATCH (n) CALL { … } WITH * WHERE <your where>`, and
  Neo4j will not push a predicate below a `CALL` subquery, so the gate runs for
  every node of that label instead of the one the caller asked for (measured:
  168 → 146,453 dbHits on a single-row lookup). Declarative filters inline into
  the `WHERE` and keep the index seek.

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

> **Superseded in part by ADR-018 (GOAL-292):** the endpoint no longer runs the
> pipeline inline — it enqueues, and a cron worker extracts. The "dedicated
> endpoint, not the chat route" decision below still holds.

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

## ADR-017: Nested FieldContexts Are a Pure Overlay; the Root Field Is the Resonance Scope (GOAL-295)

**Decision:** FieldContexts can nest via a `HAS_SUBCONTEXT` self-relationship
(`(parent)-[:HAS_SUBCONTEXT]->(child)`), capped at 5 levels. The hierarchy is
a **pure overlay**: every context — nested or not — keeps its own direct
`(Space)-[:HAS_CONTEXT]->` edge. And resonance discovery treats the **root
field's whole subtree as one scope**: sub-contexts organize a growing field,
they never partition its resonance.

**Why:**

- **`HAS_CONTEXT` is the universal visibility anchor.** 40+ call sites —
  every `@authorization` filter, `viewablePulsePredicate`,
  `accessible-contexts`, resonance sweeps, the bloom generator's fail-closed
  Space anchoring, and the GOAL-319 soft-delete edge re-point — assume
  `(Space)-[:HAS_CONTEXT]->(FieldContext)` is one hop. Keeping the edge on
  children means none of them change: a sub-context is readable/writable
  exactly like its parent by construction, and soft delete keeps hiding a
  context by re-pointing that one edge.
- **The field stays the resonance boundary.** The motivating case (several
  hundred documents in one "AI adoption" field) needs *navigation* to split,
  not *meaning*: a pulse filed under a sub-context must still resonate with
  the rest of the field. So `findSimilarPulsesInContext` searches the scoped
  context's subtree, per-pulse discovery climbs to the root context first,
  and the space sweep enumerates only root contexts (children would be
  double-processed otherwise). `resonancesInContext` likewise rolls up the
  subtree.
- **Invariants need a custom write path.** Single parent, same Space, no
  cycles, depth cap — none are expressible through generated nested-connect
  mutations, so the SDL declares `parentContext`/`subContexts` with
  `nestedOperations: []` and all writes flow through `createSubFieldContext`
  / `moveFieldContext` (`src/lib/field-context/sub-context.ts`), which gate
  on `canEditContent` and write the activity Log atomically.

**Consequences:**

- Space-level listings now contain the whole hierarchy; surfaces that want
  top-level fields must filter on "no incoming `HAS_SUBCONTEXT`" (the Space
  dashboard does this client-side via `parentContext`).
- Subtree traversals (`HAS_SUBCONTEXT*0..N`) must filter
  `deletedAt IS NULL`: soft delete cascades downward (GOAL-319 parity), but
  a child soft-deleted on its own remains reachable through the surviving
  overlay edge.
- `HAS_SUBCONTEXT` is whitelisted in the cypher-generator vocabulary
  (kb/07 Rule 9); no new auth anchor is needed in `execute.ts` because every
  context still anchors through `HAS_CONTEXT`.
- Depth cap 5 keeps every variable-length traversal bounded (`*0..10` in
  queries for headroom).

---

## ADR-018: Document Ingestion Is Asynchronous, With `Document.status` As the Queue (GOAL-292)

**Context:** ADR-014 gave ingestion its own endpoint, and that endpoint ran the
whole pipeline inline: fetch the blob back, LLM entity extraction, LLM
summarization, Neo4j entity writes. Every 504 observed in the prototype traced
to it. Raising `maxDuration` 60 → 300 bought headroom but a slow enough
extraction still blows the ceiling, and a 300-second synchronous request is a
poor experience regardless.

**Decision:** the request enqueues; a Vercel Cron worker extracts.
`POST /api/ingest/document/process` gates on `canEditContent`, anchors the
`Document` as `PENDING`, and returns **202** (measured warm median ~1.4 s).
`/api/cron/process-document-ingestion` runs every minute, claims PENDING
documents, and runs the pipeline. The UI polls `Document.status`.

**The queue is `Document.status` — there is no job node.** The document already
carries everything a worker needs (`blobKey`, `mimeType`, `userHint`, parent
FieldContext, uploader), so a separate node would duplicate that state and
invite the two to drift. Considered and rejected: the provisioned Upstash Redis
(job state would live apart from the graph data it mutates, complicating
resumability and the `:Log` audit trail) and the dormant BullMQ setup in
`src/lib/jobs/` (needs a long-lived worker process, which serverless has no
place to host).

**Authorization crosses the queue boundary via the `UPLOADED_BY` edge.** The
worker holds no JWT, so the enqueue-time decision is persisted as that edge and
the worker acts as the uploader. It is **re-validated live at claim time** — the
gap can be minutes, and the uploader may have been removed from the Space or
demoted to GUEST — and every individual entity write re-gates itself inside
`executeAuthorizedWriteTool` regardless.

**Consequences:**

- Claiming needs a lock-forcing write before its status guard. Neo4j is
  read-committed, and an index seek only becomes `Locking` when a write follows,
  so the obvious `MATCH (d {status:'PENDING'}) SET d.status='PROCESSING'` loses
  updates and *every* overlapping run wins (measured 11/12 trials). See
  `kb/04-state-machines.md`.
- A worker killed at the function ceiling leaves a claim behind, so stalled
  claims are reclaimed after 15 minutes and abandoned to `FAILED` after 3
  attempts. Nothing may spin forever.
- Enqueue got cheap, which removed the synchronous design's accidental
  self-throttle: one account may now hold at most 20 documents in flight (429
  `queue_full` beyond that), and the worker drains 4 per tick.
- Failures are surfaced through `Document.status = FAILED` + a member-safe
  `statusMessage`, not an HTTP error, because the member is no longer waiting on
  a response. Re-extract (GOAL-241) remains the recovery path.
- `Document` lost its generated GraphQL CRUD (`@mutation(operations: [])`):
  with `status` writable, any Space member could re-queue ingestion at will.
- Documents predating this story have no `status`; every read coalesces the
  absence to `COMPLETE` so the backlog is never re-ingested.

---

## ADR-019: Bulk Article Import Is Asynchronous, With a Job Node As the Queue (GOAL-326)

**Context:** `POST /api/import/articles` (GOAL-317) walked all 300 rows inside
the request under `maxDuration = 300`, and scheduled the embedding/resonance
sweep in a fire-and-forget `after()` callback. A large sheet, a slow batch, or
several concurrent field imports pushed the request toward the serverless
ceiling; the sweep — real OpenAI spend — was neither durable, retried, nor
observable. Identical failure mode to the one ADR-018 fixed for document
ingestion, so this is the same fix: the request enqueues, a Vercel Cron worker
processes.

**Decision:** `POST /api/import/articles` authenticates, rate-limits, validates,
gates on `canEditContent`, anchors an `:ArticleImportJob` as `PENDING`, and
returns **202** with a job id. `/api/cron/process-article-imports` runs every
minute, claims jobs, mints one pulse per row through
`executeAuthorizedWriteTool`, and lands them in `COMPLETE`/`FAILED`. The modal
polls `GET /api/import/articles/<jobId>`.

**The queue is a job node, unlike ADR-018.** Document ingestion had no job node
because the `Document` already carried everything a worker needed. A bulk import
has no such entity — the rows exist only in the request — so something has to
hold them. Considered and rejected: the provisioned Upstash Redis (a 300-row
payload can exceed its per-record ceiling at the field caps we accept, and job
state living apart from the graph it mutates would split the resume cursor from
the `:Log` audit trail it has to stay consistent with) and reusing `FieldPulse`
rows as their own queue (a half-imported sheet would be indistinguishable from
real content, and a failed row has no node to record itself on).

**The job node is deliberately absent from the GraphQL schema**, like
`:LlmUsage`. Generated CRUD roots over a status machine are exactly the hole
ADR-018 had to close on `Document` with `@mutation(operations: [])`; not opening
it is cheaper than closing it. Status is read through a requester-scoped REST
GET beside the POST that creates the job.

**Authorization crosses the queue boundary via the `REQUESTED_BY` edge**, and is
re-validated live at claim time — the requester may have been removed from the
Space or demoted to GUEST in the minutes since. Every row write re-gates itself
inside `executeAuthorizedWriteTool` regardless, and writes its `:Log` attributed
to the requester, so moving work off the request path does not weaken the audit
trail.

**Consequences:**

- Claiming reuses the document queue's lock-forcing write before its status
  guard, for the same read-committed reason. See `kb/04-state-machines.md`.
- Resume is a first-class path, not an error path: per-row outcomes are appended
  before the next row starts, `size(rowOutcomes)` is the cursor, and a run that
  is out of time requeues itself rather than being killed at the ceiling. The
  summary is recomputed from those outcomes on every read, so an interrupted job
  reports the same ROW counts as a straight-through run. People counts are
  per-run by design — the author cache starts cold on a resume, and making them
  exact would mean persisting an author identity on every row.
- Every outcome append is fenced on the claim, and a rejected append stops the
  run — otherwise a zombie worker would double-write alongside the new claimant.
- Enqueue got cheap, which removed the synchronous design's accidental
  self-throttle: one account may hold 5 jobs in flight (429 `queue_full`) on top
  of the 10/hour `bulk-import` rate limit. The in-flight cap lives in the graph
  precisely because that limiter fails OPEN when Redis is unreachable.
- Failures surface as `status = FAILED` plus member-safe `statusMessage`, not an
  HTTP error, because the member is no longer waiting on a response. Retry is
  re-uploading the sheet, which is safe: the write tools enrich rather than
  duplicate.
- The stored payload is dropped at every terminal status — the outcomes are what
  the member reads from then on, and a second copy of their spreadsheet in the
  graph buys nothing. The outcomes still hold the member's article titles, so a
  finished job is itself dropped 30 days after it lands; jobs are also
  hard-deleted with their FieldContext at the 90-day purge.
- The in-flight cap is enforced *inside* the enqueue write, not by a read before
  it. A count-then-create is a check-then-act, and it is precisely the bound
  that has to survive a Redis outage (`bulk-import` fails open), so it must not
  evaporate under concurrency.
