# GoalPost - AI Agent Instructions

GoalPost is a meta-relational community platform using Neo4j graph database, LangChain AI agents, and Next.js. The system discovers semantic patterns ("resonances") across user contributions ("pulses") using vector embeddings and LLM analysis.

## Architecture Overview

**Core Stack**: Next.js 15, Neo4j (graph + vector indexes), LangChain, OpenAI (GPT-4 + embeddings), TypeScript

**Data Model**: Graph-based ontology where `Person` nodes create `FieldPulse` nodes within `FieldContext`, connected by `FieldResonance` patterns discovered via AI

- Vector indexes: `pulseContentVectorIndex`, `personBioVectorIndex`, `conversationChunkVectorIndex` (all 1536d, text-embedding-3-small)
- See `docs/ONTOLOGY_README.md` for semantic framework

**Key Directories**:

- `src/app/api/` - Next.js API routes (pulse creation, resonance discovery, person enrichment)
- `src/lib/resonance/` - Embedding generation and pattern detection
- `src/modules/agent/` - LangChain ReAct agent with Neo4j tools
- `src/modules/graph.ts` - Neo4j singleton (`initGraph()`)

## Critical Patterns

### Neo4j Query Results

**ALWAYS** use plain array access - Neo4jGraph returns arrays, NOT `{records: [...]}`:

```typescript
const graph = await initGraph()
const result = await graph.query<{ id: string }>(`RETURN p.id as id`, {})
const id = result[0].id // ✓ Correct
// NOT: result.records[0].get('id')  // ✗ Wrong
```

### Graph Initialization

**ALWAYS** use `await initGraph()` (async singleton):

```typescript
const graph = await initGraph() // ✓ From @/modules/graph
// NOT: getGraphInstance()  // ✗ Doesn't exist
```

### Cypher Syntax

**ALWAYS** add `WITH` clause between `SET` and `CALL`:

```cypher
SET p.modifiedAt = datetime()
WITH p
CALL db.create.setNodeVectorProperty(p, 'embedding', $embedding)
```

### LangChain Patterns (v1.x)

- Use `.pipe()` instead of `RunnableSequence.from([...])`:
  ```typescript
  const chain = prompt.pipe(llm).pipe(new StringOutputParser())
  ```
- Use `.withStructuredOutput(schema)` for structured LLM responses (requires `@langchain/openai@latest`)
- Remove explicit `openAIApiKey` parameters (auto-detected from env in v1.x)

### Path Aliases

- **Next.js routes**: Use `@/` aliases (`import { initGraph } from '@/modules/graph'`)
- **Standalone scripts** (tsx): Use relative paths (`import { initGraph } from '../../../modules/graph.js'`)
- **Never** mix them - standalone scripts can't resolve `@/` aliases

## Code Modularity & File Size Guidelines

**Maximum 400 lines per file** unless absolutely necessary. Prioritize:

1. **Absolute Modularity**: Break files into single-responsibility units. Extract utility functions, hooks, components, and business logic into separate files.
2. **Human Readability**: Shorter files are easier to understand, test, and maintain. Aim for files under 300 lines where practical.
3. **Testability**: Modular code is inherently more testable. Each exported function/component should be independently testable.

**Guidelines**:
- Utility functions → separate `utils/` or `helpers/` files
- Complex logic → extract to `lib/` modules with clear naming
- React components → one component per file (or co-located related components if tightly coupled)
- API routes → keep business logic in separate service/handler modules, not in route files
- Types/interfaces → move to dedicated `.types.ts` files if shared across modules

**Exception**: Only exceed 400 lines if the file is genuinely monolithic (e.g., a large enum, extensive data seed file, or generated schema). Document with a comment explaining why.

## Workflows

### Development

```bash
npm run dev              # Start Next.js (http://localhost:3000)
npm run build           # Production build (runs TypeScript checks)
npm run lint            # ESLint
npm run test            # Jest tests
npm run workers         # BullMQ background workers (optional)
```

### Database Setup

```bash
npm run init:db         # Seed Neo4j with ontology schema
npm run load:sample-data # Load example data
```

### Key API Endpoints

- `POST /api/pulse/create-from-conversation` - Create pulse → auto-generate embeddings → enrich person (all synchronous)
- `POST /api/resonance/discover` - Manual resonance discovery across all pulses
- `POST /api/person/enrich` - Batch person profile enrichment from pulses

## Automatic Workflows

**Pulse Creation** (`src/app/api/pulse/create-from-conversation/route.ts`):

1. Create `FieldPulse` node
2. Create `ConversationChunk` nodes (sentence-based)
3. `generatePulseEmbeddings(pulseId)` - embeddings for pulse + chunks
4. `enrichPersonFromPulses(personId)` - LLM extracts passions/traits → person embedding

**Resonance Discovery** (manual trigger):

1. Vector similarity search finds similar pulses
2. LLM analyzes clusters → extracts pattern (label, description, connections)
3. Create `FieldResonance` + `ResonanceLink` nodes

**Person Enrichment** (`src/lib/resonance/embeddings/person-enricher.ts`):

- LLM analyzes last 30 days of pulses → extracts themes/passions/fieldsOfCare/traits
- Generates embedding from: `name + email + passions + fieldsOfCare + traits + summary`
- Enables semantic search for similar people

## Common Issues

1. **Module not found errors**: Check if you're mixing path aliases (`@/`) with relative paths in standalone scripts
2. **Type errors with `.records`**: Neo4jGraph returns plain arrays - use `result[0].property` not `result.records[0].get('property')`
3. **Cypher syntax errors**: Add `WITH` clause between `SET` and `CALL` operations
4. **LangChain version mismatches**: Update to latest with `npm install @langchain/core@latest @langchain/openai@latest --legacy-peer-deps`
5. **Background workers not running**: Core functionality (embeddings, enrichment) works synchronously without Redis/BullMQ

## Environment Variables

Required in `.env.local`:

```bash
NEO4J_URI=neo4j+s://xxx.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=xxx
OPENAI_API_KEY=sk-xxx
JWT_SECRET=xxx
PEPPER=xxx
RESEND_API_KEY=xxx
```

## Testing Resonance System

```bash
# Create pulse (auto-generates embeddings + enriches person)
curl -X POST http://localhost:3000/api/pulse/create-from-conversation \
  -H "Content-Type: application/json" \
  -d '{"personId": "person_123", "conversation": [...]}'

# Discover resonances
curl -X POST http://localhost:3000/api/resonance/discover \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Important Files

- `src/modules/graph.ts` - Neo4j singleton pattern (all DB access)
- `src/lib/resonance/discovery/pattern-detector.ts` - AI resonance detection
- `src/lib/resonance/embeddings/pulse-embedder.ts` - Embedding generation
- `src/lib/resonance/embeddings/person-enricher.ts` - LLM person analysis
- `docs/ONTOLOGY_README.md` - Semantic ontology (RelationalEntity, LifeSensor, FieldPulse, etc.)
- `docs/ARCHITECTURE_DIAGRAM.md` - System architecture diagrams
