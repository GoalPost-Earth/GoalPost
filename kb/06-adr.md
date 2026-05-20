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

**Decision:** The three canonical canvas surfaces (Dashboard View, Graph View, Bloom Exploration) are pure visual transforms of the **same Apollo-cached data**. Flipping between them MUST be a zero-network frontend change.

**Rules:**

- All three views consume the same Apollo queries (currently `GET_ALL_ME_SPACES` + `GET_ALL_WE_SPACES`) with `fetchPolicy: 'cache-first'`.
- Bloom Exploration is NOT allowed to fetch its own data. It is "native NVL rendering," not "native NVL fetching."
- New view modes must reuse the queries the first-mounted view already warmed.
- Loading skeletons may render only on a genuinely cold cache (first ever mount of any of the three).

**Why:** Toggling a view is a presentational concern. A second network round-trip on toggle produced confusing loading flashes and made the surfaces feel unrelated. Sharing the cache also keeps the three views structurally honest — they show the same things, just differently.

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
