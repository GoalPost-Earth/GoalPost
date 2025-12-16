# Resonance Discovery & Enrichment System

An AI-powered system for automatically discovering semantic connections between pulses, enriching conversation data with topics/emotions, and enabling human-in-the-loop refinement.

## Overview

The resonance system consists of several interconnected components:

1. **Sentence-based Chunking** - Conversations are split into semantic chunks based on sentence boundaries
2. **Vector Embeddings** - Individual chunks and pulses get vector embeddings for semantic search
3. **Person Enrichment** - Person profiles are continuously updated based on pulse contributions
4. **Background Workers** - Automated jobs for embedding generation and resonance discovery
5. **Semantic Search** - Find similar pulses, chunks, and resonances using vector similarity
6. **Human Review** - Confirm, edit, or reject AI-generated resonance links

## Architecture

```
User Conversation
    ↓
Sentence-based Chunking
    ↓
ConversationChunk Nodes (with individual embeddings)
    ↓
"Create Pulse" Button
    ↓
FieldPulse Node (linked to chunks)
    ↓
[Background Jobs Queue]
    ↓
├── Pulse Embedding Generation (combines pulse + chunks)
├── Person Enrichment (extract themes from pulses)
└── Daily Resonance Discovery (find patterns globally)
    ↓
ResonanceLink + FieldResonance Nodes
    ↓
Human Review Interface (confirm/edit/reject)
```

## Quick Start

### 1. Setup Environment

```bash
# Ensure you have Redis running
brew install redis  # macOS
brew services start redis

# Run the setup script
npm run setup:env
```

This will:
- Initialize Neo4j database with vector indexes
- Create ConversationChunk, FieldPulse, and Person vector indexes
- Seed an initial demo user
- Check Redis connection

### 2. Start the Application

```bash
# Terminal 1: Start Next.js dev server
npm run dev

# Terminal 2: Start background workers
npm run workers
```

### 3. Environment Variables

Create a `.env.local` file:

```bash
# Neo4j
NEO4J_URI=neo4j://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password

# OpenAI
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4-turbo-preview

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Resonance Discovery Schedule (cron format)
RESONANCE_DISCOVERY_CRON=0 2 * * *  # Daily at 2 AM

# Optional: Seed user credentials
SEED_USER_EMAIL=demo@goalpost.app
SEED_USER_NAME=Demo User
SEED_USER_PASSWORD=password123
```

## API Endpoints

### Create Pulse from Conversation

```typescript
POST /api/pulse/create-from-conversation

{
  "contextId": "context_id",
  "personId": "person_id",
  "pulseType": "GoalPulse",
  "content": "Exercise 3x per week",
  "intensity": 0.7,
  "conversation": [
    { "role": "user", "content": "I feel sad" },
    { "role": "assistant", "content": "Do you want to delve deeper into your emotion? What do you feel sad about?" },
    { "role": "user", "content": "I'm sad that my dog died" }
  ]
}

Response:
{
  "success": true,
  "pulseId": "pulse_...",
  "chunkIds": ["chunk_1", "chunk_2", "chunk_3"],
  "message": "Pulse created with 3 conversation chunks. Processing embeddings."
}
```

### Semantic Search

```typescript
POST /api/resonance/search

{
  "query": "grief and loss",
  "searchType": "all",  // 'pulses' | 'chunks' | 'resonances' | 'all'
  "limit": 10,
  "minSimilarity": 0.7,
  "contextId": "context_id"  // optional
}

Response:
{
  "success": true,
  "query": "grief and loss",
  "results": {
    "pulses": [...],
    "chunks": [...],
    "resonances": [...]
  }
}
```

### Review Resonances

```typescript
GET /api/resonance/review?limit=20&minConfidence=0.7

Response:
{
  "success": true,
  "count": 5,
  "resonances": [
    {
      "linkId": "rl_...",
      "confidence": 0.85,
      "evidence": "Both pulses discuss grief and loss of a pet",
      "sourcePulse": { "id": "...", "content": "I'm sad my dog died" },
      "targetPulse": { "id": "...", "content": "Missing my best friend" },
      "resonance": { "label": "grief", "description": "..." }
    }
  ]
}

POST /api/resonance/review

// Confirm a link
{
  "linkId": "rl_...",
  "action": "confirm",
  "reviewerId": "person_id"
}

// Edit a link
{
  "linkId": "rl_...",
  "action": "edit",
  "confidence": 0.9,
  "evidence": "Updated explanation",
  "reviewerId": "person_id"
}

// Reject a link
{
  "linkId": "rl_...",
  "action": "reject",
  "reviewerId": "person_id"
}
```

## Database Schema

### ConversationChunk Node

```cypher
(:ConversationChunk {
  id: string,
  content: string,
  order: number,
  role: 'user' | 'assistant' | 'system',
  createdAt: datetime,
  embedding: float[]  // 1536 dimensions
})
```

### FieldPulse Node (with embedding)

```cypher
(:FieldPulse:GoalPulse {
  id: string,
  content: string,
  createdAt: datetime,
  modifiedAt: datetime,
  embedding: float[],  // Composite: pulse content + all chunks
  // ... pulse-specific properties
})

// Relationships
(:FieldPulse)-[:HAS_CHUNK]->(:ConversationChunk)
(:FieldPulse)-[:INITIATED_BY]->(:Person)
```

### Person Node (enriched)

```cypher
(:Person {
  id: string,
  name: string,
  email: string,
  passions: string[],      // Extracted from pulses
  fieldsOfCare: string[],  // Extracted from pulses
  traits: string[],        // Extracted from pulses
  embedding: float[],      // Bio + pulse-derived insights
  enrichedAt: datetime
})
```

### ResonanceLink Node

```cypher
(:ResonanceLink {
  id: string,
  confidence: float,  // 0-1
  evidence: string,
  createdAt: datetime,
  status: 'pending' | 'confirmed' | 'rejected',
  reviewedAt: datetime,
  reviewedBy: string,
  editedBy: string
})

// Relationships
(:ResonanceLink)-[:SOURCE]->(:FieldPulse)
(:ResonanceLink)-[:TARGET]->(:FieldPulse)
(:ResonanceLink)-[:RESONATES_AS]->(:FieldResonance)
```

## Background Jobs

### Pulse Processing Job

**Trigger:** On every pulse creation  
**Function:** Generate embeddings for pulse and all conversation chunks

```typescript
{
  pulseId: string,
  personId: string,
  triggerPersonEnrichment: boolean
}
```

### Person Enrichment Job

**Trigger:** On every pulse creation (via pulse processing job)  
**Function:** Analyze last 30 days of pulses, extract themes, update Person properties and embedding

```typescript
{
  personId: string
}
```

### Resonance Discovery Job

**Trigger:** Daily at 2 AM (configurable)  
**Function:** Find semantically similar pulses globally, analyze patterns with LLM, create ResonanceLink nodes

```typescript
{
  lastRunTimestamp: string,  // ISO datetime
  scopeType: 'global' | 'space' | 'context',
  scopeId: string  // optional
}
```

## How It Works

### 1. Conversation Deepening

When a user says "I feel sad", the chat API detects emotion and asks follow-up questions:

```typescript
// In chat API
{
  role: 'assistant',
  content: 'Do you want to delve deeper into your emotion? What do you feel sad about?'
}

// User responds
{
  role: 'user',
  content: "I'm sad that my dog died"
}
```

Each message is chunked into sentences:
- "I feel sad" → Chunk 1
- "Do you want to delve deeper..." → Chunk 2
- "I'm sad that my dog died" → Chunk 3

### 2. Pulse Creation

User clicks "Create Pulse" button:

```typescript
POST /api/pulse/create-from-conversation
{
  content: "Processing grief over loss of my dog",
  conversation: [/* all messages */]
}
```

The system:
1. Creates FieldPulse node
2. Creates ConversationChunk nodes linked to pulse
3. Queues embedding generation job

### 3. Embedding Generation

Background worker processes the pulse:

1. Generate individual chunk embeddings (sentence-level)
2. Generate pulse embedding (combines pulse content + all chunks)
3. Store all embeddings in Neo4j vector indexes

### 4. Person Enrichment

Automatically triggered after pulse creation:

1. Fetch person's last 30 days of pulses
2. Send to LLM: "Extract themes, passions, traits from these pulses"
3. Update Person node properties
4. Regenerate Person embedding with enriched bio

### 5. Resonance Discovery

Daily job at 2 AM:

1. Find all pulses created/modified since last run
2. For each pulse:
   - Use vector search to find similar pulses (cosine similarity > 0.7)
   - Send cluster to LLM: "Analyze resonance patterns"
   - LLM returns: `{ label: "grief", description: "...", connections: [...] }`
3. Create FieldResonance node (e.g., "grief")
4. Create ResonanceLink nodes with confidence scores and evidence

### 6. Human Review

User views pending resonances:

```typescript
GET /api/resonance/review
```

Sees AI-generated connection:
- Source: "I'm sad my dog died"
- Target: "Missing my best friend every day"
- Resonance: "grief"
- Confidence: 0.85
- Evidence: "Both pulses express sadness over the loss of a beloved companion"

User can:
- ✅ Confirm (mark as confirmed)
- ✏️ Edit (adjust confidence, revise evidence)
- ❌ Reject (mark as rejected)

## Vector Indexes

Three indexes for semantic search:

1. **personBioVectorIndex**
   - Label: `Person`
   - Property: `embedding`
   - Use: Find people by interests/themes

2. **pulseContentVectorIndex**
   - Label: `FieldPulse`
   - Property: `embedding`
   - Use: Find similar pulses (conversation-level)

3. **conversationChunkVectorIndex**
   - Label: `ConversationChunk`
   - Property: `embedding`
   - Use: Find specific moments in conversations (sentence-level)

## Example Queries

### Find similar pulses

```cypher
CALL db.index.vector.queryNodes('pulseContentVectorIndex', 10, $queryEmbedding)
YIELD node, score
WHERE score >= 0.7
RETURN node, score
ORDER BY score DESC
```

### Find conversation chunks about grief

```cypher
CALL db.index.vector.queryNodes('conversationChunkVectorIndex', 5, $queryEmbedding)
YIELD node, score
MATCH (pulse:FieldPulse)-[:HAS_CHUNK]->(node)
RETURN node.content, pulse.content, score
ORDER BY score DESC
```

### Get person's enrichment history

```cypher
MATCH (p:Person {id: $personId})
RETURN p.passions, p.fieldsOfCare, p.traits, p.enrichedAt
```

## Troubleshooting

### Workers not processing jobs

1. Check Redis is running: `redis-cli ping`
2. Check worker logs: `npm run workers`
3. Verify queue connection in logs

### Embeddings not generated

1. Check OpenAI API key is set
2. Verify vector indexes exist: `SHOW INDEXES`
3. Check worker logs for errors

### Person enrichment failing

1. Ensure person has created pulses in last 30 days
2. Check LLM structured output parsing
3. Verify person node has required fields

### Resonance discovery finds no patterns

1. Check if pulses have embeddings
2. Lower similarity threshold (try 0.6 instead of 0.7)
3. Ensure enough pulses exist (need at least 2 similar)

## Development

### Run tests

```bash
npm test
```

### Manual job triggering

```bash
# In Node REPL or script
import { queuePulseProcessing, queueResonanceDiscovery } from './src/lib/jobs/queue-config.js'

await queuePulseProcessing({ pulseId: '...', personId: '...', triggerPersonEnrichment: true })
await queueResonanceDiscovery({ lastRunTimestamp: '2024-01-01T00:00:00Z' })
```

### Clear all jobs

```bash
redis-cli FLUSHDB
```

## Performance Considerations

- **Chunk size**: 3 sentences per chunk (configurable)
- **Embedding model**: `text-embedding-3-small` (1536 dimensions, cheaper than `text-embedding-3-large`)
- **LLM model**: `gpt-4-turbo-preview` for pattern analysis (accuracy over speed)
- **Worker concurrency**: 
  - Pulse processing: 2 concurrent
  - Person enrichment: 3 concurrent
  - Resonance discovery: 1 (intensive)
- **Batch size**: 50-100 pulses per discovery run

## Future Enhancements

- [ ] Multi-modal embeddings (images, audio)
- [ ] Real-time resonance suggestions in chat
- [ ] Resonance visualization graph UI
- [ ] Custom resonance patterns (user-defined)
- [ ] Cross-space resonance discovery
- [ ] Embedding fine-tuning on domain data
- [ ] Webhook notifications for discovered resonances
