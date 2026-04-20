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
