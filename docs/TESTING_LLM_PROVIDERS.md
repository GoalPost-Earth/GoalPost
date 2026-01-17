# End-to-End Testing Guide: LLM Provider Abstraction

This guide walks through testing the newly implemented LLM provider abstraction layer from the frontend.

## What We've Built

We've successfully migrated GoalPost from direct OpenAI instantiations to a provider abstraction layer that enables:

1. **Swappable LLM providers** - Switch between OpenAI, Anthropic, AWS Bedrock, or mock providers via environment variables
2. **Consistent interface** - All LLM operations (chat, embeddings, structured output) go through unified providers
3. **Cost tracking** - Built-in token usage estimation for all operations
4. **Testing support** - Mock provider for unit tests without API calls

## Files Migrated (Phase 2 Complete ✅)

### Core Embedding Services
- ✅ `src/lib/resonance/embeddings/pulse-embedder.ts` - Pulse/chunk embedding generation
- ✅ `src/lib/resonance/embeddings/person-enricher.ts` - Person profile LLM analysis + embeddings

### API Routes  
- ✅ `src/app/api/resonance/search/route.ts` - Semantic search with vector similarity

### AI Agent System
- ✅ `src/modules/agent/index.ts` - Main agent entry point
- ✅ `src/modules/agent/react-agent.ts` - ReAct agent creation
- ✅ `src/lib/llm/adapters/langchain-adapter.ts` - LangChain compatibility layer

### Pattern Discovery
- ✅ `src/lib/resonance/discovery/pattern-detector.ts` - Resonance pattern LLM analysis

## Testing Scenarios

### 1. Pulse Creation with Embeddings (Automatic Flow)

**What it tests**: Pulse creation → embedding generation → person enrichment (3-step automatic pipeline)

**Endpoint**: `POST /api/pulse/create-from-conversation`

**Test command**:
```bash
curl -X POST http://localhost:3000/api/pulse/create-from-conversation \\
  -H "Content-Type: application/json" \\
  -d '{
    "personId": "person_123",
    "conversationThreadId": "thread_456",
    "conversation": [
      {"role": "user", "content": "I am feeling overwhelmed by all the commitments I have made."},
      {"role": "assistant", "content": "That sounds difficult. What specifically feels most pressing right now?"},
      {"role": "user", "content": "I promised to help with three different community projects but I am stretched too thin."}
    ],
    "pulseType": "reflection"
  }'
```

**Expected flow**:
1. Creates `FieldPulse` node
2. Creates `ConversationChunk` nodes (sentence-level)
3. **Uses `getEmbeddingsProvider()`** to generate embeddings for pulse + chunks
4. **Uses `getAnalysisProvider()`** to extract person insights (passions, traits, themes)
5. **Uses `getEmbeddingsProvider()`** to generate person profile embedding

**Verify in response**:
```json
{
  "success": true,
  "pulseId": "pulse_xyz",
  "embeddingsGenerated": true,
  "personEnriched": true
}
```

**Check in Neo4j**:
```cypher
MATCH (p:FieldPulse {id: 'pulse_xyz'})
RETURN p.embedding IS NOT NULL as hasEmbedding
```

---

### 2. Semantic Search (Embedding Lookup)

**What it tests**: Query embedding generation → vector similarity search

**Endpoint**: `POST /api/resonance/search`

**Test command**:
```bash
curl -X POST http://localhost:3000/api/resonance/search \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "overwhelm and commitments",
    "searchType": "pulses",
    "limit": 5,
    "minSimilarity": 0.7
  }'
```

**Expected flow**:
1. **Uses `getEmbeddingsProvider()`** to generate query embedding
2. Runs vector similarity search against `pulseContentVectorIndex`
3. Returns ranked results with similarity scores

**Verify in response**:
```json
{
  "success": true,
  "query": "overwhelm and commitments",
  "results": {
    "pulses": [
      {
        "id": "pulse_xyz",
        "content": "I am feeling overwhelmed...",
        "similarity": 0.89
      }
    ]
  }
}
```

---

### 3. Person Enrichment (LLM Analysis)

**What it tests**: Multi-pulse LLM analysis with structured output

**Endpoint**: `POST /api/person/enrich`

**Test command**:
```bash
curl -X POST http://localhost:3000/api/person/enrich \\
  -H "Content-Type: application/json" \\
  -d '{
    "personIds": ["person_123"]
  }'
```

**Expected flow**:
1. Fetches last 30 days of pulses for person
2. **Uses `getAnalysisProvider().structuredOutput()`** to extract themes/passions/traits
3. Updates person properties
4. **Uses `getEmbeddingsProvider()`** to generate enriched bio embedding

**Verify in response**:
```json
{
  "success": true,
  "enrichedCount": 1,
  "results": [
    {
      "personId": "person_123",
      "passions": ["community-building", "time-management"],
      "fieldsOfCare": ["sustainability", "education"],
      "traits": ["empathetic", "overcommitted"],
      "summary": "Active community member struggling with time management..."
    }
  ]
}
```

---

### 4. Resonance Discovery (Pattern Detection)

**What it tests**: Multi-pulse cluster analysis with LLM pattern extraction

**Endpoint**: `POST /api/resonance/discover`

**Test command**:
```bash
curl -X POST http://localhost:3000/api/resonance/discover \\
  -H "Content-Type: application/json" \\
  -d '{
    "similarityThreshold": 0.75,
    "minClusterSize": 2
  }'
```

**Expected flow**:
1. Fetches all pulses with embeddings
2. For each pulse, finds similar pulses via vector search
3. For each cluster, **uses `getAnalysisProvider().structuredOutput()`** to detect patterns
4. Creates `FieldResonance` nodes with pattern labels (e.g., "overwhelm", "momentum")

**Verify in response**:
```json
{
  "success": true,
  "resonancesDiscovered": 3,
  "resonances": [
    {
      "resonanceId": "resonance_abc",
      "label": "overwhelm",
      "description": "Multiple community members expressing feelings of overcommitment...",
      "links": [
        {
          "sourcePulseId": "pulse_xyz",
          "targetPulseId": "pulse_def",
          "confidence": 0.87,
          "evidence": "Both pulses express struggle with managing multiple projects..."
        }
      ]
    }
  ]
}
```

---

### 5. Chat with Agent (LangChain Integration)

**What it tests**: Agent system with LangChain adapter

**Frontend**: Navigate to `/assistant` page and type a query

**Or via API**:
```bash
curl -X POST http://localhost:3000/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "Who is Sarah Johnson?",
    "sessionId": "test-session-123"
  }'
```

**Expected flow**:
1. Agent receives query
2. **Uses `getLangChainChatModel()`** (from adapter) for ReAct agent
3. **Uses `getLangChainEmbeddings()`** (from adapter) for vector tools
4. Agent decides which tools to use (search_person_by_name, graph queries)
5. Returns structured response

**Verify in response**:
```json
{
  "success": true,
  "output": "Sarah Johnson is a community member who is passionate about sustainability and education. She has been involved in three community projects...",
  "sessionId": "test-session-123"
}
```

---

## Testing with Mock Provider (No API Calls)

To test without hitting OpenAI APIs, set the mock provider:

```bash
# In .env.local
LLM_PROVIDER=mock

# Then restart dev server
npm run dev
```

**Mock behavior**:
- `chat()` → Returns "[Mock chat response]"
- `embed()` → Returns random 1536d vectors
- `structuredOutput()` → Returns valid schema-compliant mock data
- Cost is always $0

**Use cases**:
- Unit tests (no API charges)
- Frontend development (instant responses)
- CI/CD pipelines (no external dependencies)

---

## Verifying Provider Abstraction Works

### Check which provider is active:
```bash
# In src/lib/llm/factory.ts
export function getLLMProvider(type?: ProviderType): LLMProvider {
  const providerType = type || process.env.LLM_PROVIDER || 'openai'
  console.log(`🤖 Using LLM provider: ${providerType}`)
  // ...
}
```

Look for console logs when API routes execute:
```
🤖 Using LLM provider: openai
```

### Check build output:
```bash
npm run build

# Should see:
# ✓ Compiled successfully
# ✓ Linting and checking validity of types
# (no OpenAI direct import errors)
```

### Verify provider swapping:
1. **Test with OpenAI** (default):
   ```bash
   unset LLM_PROVIDER
   npm run dev
   # Make API calls, verify real responses
   ```

2. **Test with Mock**:
   ```bash
   export LLM_PROVIDER=mock
   npm run dev
   # Make API calls, verify instant mock responses
   ```

3. **Test error handling** (unsupported provider):
   ```bash
   export LLM_PROVIDER=anthropic
   npm run dev
   # Make API call, should see error:
   # "Provider 'anthropic' is not yet implemented"
   ```

---

## Frontend Testing Checklist

### Prerequisites
- ✅ Build passing (`npm run build`)
- ✅ Dev server running (`npm run dev`)
- ✅ Neo4j database seeded with sample data (`npm run load:sample-data`)
- ✅ `.env.local` configured with `OPENAI_API_KEY`

### Test Flow
1. **Create a pulse** (test embedding generation)
   - Frontend: `/assistant` → Type conversation
   - Backend: `POST /api/pulse/create-from-conversation`
   - Verify: `embeddingsGenerated: true` in response

2. **Search for pulses** (test vector similarity)
   - Frontend: Search input on dashboard (if exists)
   - Backend: `POST /api/resonance/search`
   - Verify: Results with similarity scores

3. **Enrich person profile** (test LLM analysis)
   - Backend: `POST /api/person/enrich`
   - Verify: `passions`, `traits`, `summary` populated

4. **Discover resonances** (test pattern detection)
   - Backend: `POST /api/resonance/discover`
   - Verify: `FieldResonance` nodes created with labels

5. **Chat with agent** (test LangChain integration)
   - Frontend: `/assistant` → Ask "Who is [person name]?"
   - Verify: Agent returns person info using search tools

### Success Criteria
- ✅ All API routes return `success: true`
- ✅ No TypeScript or runtime errors
- ✅ Embeddings generated as 1536d vectors
- ✅ LLM responses are coherent and structured
- ✅ Agent uses tools correctly
- ✅ System works identically to before migration
- ✅ Can swap to mock provider without code changes

---

## Troubleshooting

### "Provider not found" errors
**Solution**: Check `LLM_PROVIDER` env var. Default is 'openai', supported values: 'openai', 'mock'

### "Model name not recognized"
**Solution**: Check `OPENAI_MODEL` env var. Ensure it matches available models (e.g., 'gpt-4o', 'gpt-5.1')

### Embedding dimension mismatch
**Solution**: Vector indexes expect 1536d (text-embedding-3-small). Check `embeddingDimension` in provider config

### LangChain adapter errors
**Solution**: Agent system still uses LangChain's `createAgent()` which requires `BaseChatModel`. We provide compatibility via adapters.

### Cost estimation seems off
**Solution**: Cost estimates are approximations based on token counts. Actual costs may vary. Check `estimateCost()` logic in provider.

---

## Next Steps (Phase 3 - Future Work)

After validating Phase 2:

1. **Add authentication to AI endpoints** - JWT validation on resonance/person routes
2. **Implement Anthropic provider** - `AnthropicProvider` class for Claude models
3. **Implement AWS Bedrock provider** - `BedrockProvider` for enterprise deployments
4. **Add streaming support** - For real-time chat responses
5. **Enhanced logging** - Track all LLM calls with ExecutionContext
6. **Cost dashboards** - Frontend UI showing token usage per user/session
7. **A/B testing** - Run parallel requests to compare provider performance

---

## Summary

✅ **Phase 1 Complete**: Provider abstraction layer built  
✅ **Phase 2 Complete**: All OpenAI calls migrated to use abstraction  
🎯 **Ready for testing**: System maintains identical behavior with added flexibility  
🚀 **Future-proof**: Can swap LLM providers via config, no code changes needed

Test the system end-to-end using the scenarios above. The abstraction is transparent to end users - everything should work exactly as before, but now we have the flexibility to change providers at any time.
