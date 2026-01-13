# MCP-Style Indirection Analysis for GoalPost

> **Assessment Date**: 13 January 2026  
> **Purpose**: Evaluate GoalPost's architecture against MCP-style indirection principles to enable LLM swapping, maintain security, and future-proof AI integration.

---

## Executive Summary

**Current Status**: GoalPost is ~40% aligned with MCP-style indirection principles.

✅ **Strengths**:
- Well-defined tool capabilities (LangChain tools with clear schemas)
- Security boundary exists (JWT authentication in GraphQL layer)
- Controlled execution (tools call backend logic, not direct external APIs)

❌ **Gaps**:
- **Tight OpenAI coupling** throughout the codebase (27+ direct instantiations)
- **No model abstraction layer** - OpenAI hardcoded in embeddings, chat, enrichment
- **Mixed concerns** - LLM instantiation scattered across 15+ files
- **No fallback strategy** for model failures or cost optimization

**Priority**: Implement an LLM provider abstraction layer **before** building any MCP server to enable the "swappable reasoning engine" philosophy.

---

## The Three Principles: How GoalPost Measures Up

### Principle 1: Capabilities Are Model-Agnostic

> **MCP Ideal**: Tools have clear contracts independent of the LLM vendor

#### ✅ What Works

**Well-Defined Tool Schemas**:
```typescript
// src/modules/agent/tools/person-search.tool.ts
const PersonSearchSchema = z.object({
  name: z.string().describe('The first name, last name, or full name...')
})
```
- All tools use Zod schemas
- Clear input/output contracts
- Documented descriptions for LLM understanding

**LangChain Tool Abstraction**:
- Tools wrapped in `DynamicStructuredTool`
- Standard interface (`name`, `description`, `schema`, `func`)
- Can theoretically work with any LLM that supports tool calling

#### ❌ What's Missing

**No Capability Registry**:
- Tools scattered across `src/modules/agent/tools/`
- No central registry of "what the system can do"
- No way to dynamically discover or enable/disable capabilities

**Tool Behavior Assumptions**:
- Assumes perfect JSON compliance (OpenAI-specific)
- No handling for models with weaker structured output
- No retry logic for malformed tool calls

**Recommendation**:
```typescript
// NEW: src/lib/capabilities/registry.ts
interface Capability {
  id: string
  name: string
  description: string
  schema: z.ZodSchema
  handler: (input: unknown) => Promise<string>
  requiredCapabilities: string[] // e.g., "embeddings", "structured-output"
}

class CapabilityRegistry {
  register(capability: Capability): void
  getByModel(modelCapabilities: string[]): Capability[]
  execute(id: string, input: unknown): Promise<string>
}
```

---

### Principle 2: Execution Is Separate From Reasoning

> **MCP Ideal**: LLM decides what to do. Our system authenticates, authorizes, and executes.

#### ✅ What Works

**Security Boundary Exists**:
```typescript
// src/pages/api/apollo.ts & src/lib/graphql/apollo.ts
const token = req.headers.authorization?.replace('Bearer ', '')
let jwt = jwtDecode(token) // JWT validation
return { token, jwt }
```
- GraphQL requests require JWT tokens
- JWT decoded to extract user context
- Tools have access to user identity

**Controlled Tool Execution**:
```typescript
// src/modules/agent/tools/person-search.tool.ts
export function createPersonSearchTool(graph: Neo4jGraph): DynamicStructuredTool {
  return new DynamicStructuredTool({
    func: async (input) => {
      // Tool executes database query - LLM only provides input
      const query = `MATCH (p:Person) WHERE ... RETURN p`
      const result = await graph.query(query, { name: input.name })
      return JSON.stringify(result)
    }
  })
}
```
- LLM requests tool execution with parameters
- Tool runs authenticated database queries
- LLM receives results, formats response

#### ⚠️ Partial Implementation

**Mixed Security Context**:
- ✅ GraphQL routes: JWT-authenticated
- ✅ REST API routes: Some have auth checks
- ❌ Resonance/embedding APIs: **No authentication** in:
  - `src/app/api/pulse/create-from-conversation/route.ts`
  - `src/app/api/resonance/discover/route.ts`
  - `src/app/api/person/enrich/route.ts`

**No Audit Logging**:
- Tool executions not logged with user context
- No tracking of which user triggered which LLM operation
- Cost attribution impossible

#### ❌ What's Missing

**LLM Crosses Security Boundary**:
```typescript
// src/lib/resonance/embeddings/person-enricher.ts (Line 48)
const llm = new ChatOpenAI({
  modelName: 'gpt-5.1',
  temperature: 0.3,
}) // Direct OpenAI call - no auth/audit wrapper
```
- LLM instantiated directly in business logic
- No rate limiting per user
- No cost tracking
- No error handling for API failures

**Recommendation**:
```typescript
// NEW: src/lib/llm/execution-context.ts
interface ExecutionContext {
  userId: string
  sessionId: string
  capability: string
  maxTokens?: number
}

interface SecureLLMExecutor {
  authorize(context: ExecutionContext): Promise<boolean>
  execute(prompt: string, context: ExecutionContext): Promise<LLMResponse>
  logExecution(context: ExecutionContext, result: LLMResponse): Promise<void>
}
```

---

### Principle 3: The Model Is Replaceable Infrastructure

> **MCP Ideal**: Swap OpenAI → Mistral → Bedrock without changing tool/API code

#### ❌ Critical Gap: Zero Model Abstraction

**27+ Direct OpenAI Instantiations**:

Locations of tight coupling:
1. `src/lib/resonance/embeddings/pulse-embedder.ts` (Line 30)
2. `src/lib/resonance/discovery/pattern-detector.ts` (Line 127)
3. `src/lib/resonance/embeddings/person-enricher.ts` (Lines 48, 154, 219)
4. `src/modules/agent/index.ts` (Lines 8, 16)
5. `src/modules/agent/react-agent.ts` (Lines 1, 140, 146)
6. `src/app/api/chat/simulation/route.ts` (Lines 1, uses OpenAI via AI SDK)
7. `src/app/api/resonance/search/route.ts` (Line 88)
8. All test files (15+ instances)

**Example of Tight Coupling**:
```typescript
// src/lib/resonance/embeddings/pulse-embedder.ts
async function generateEmbedding(text: string): Promise<number[]> {
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY, // ❌ Hardcoded
    modelName: 'text-embedding-3-small',      // ❌ Hardcoded
  })
  const embedding = await embeddings.embedQuery(text)
  return embedding
}
```

**Impact of Swapping Models**:
- Would require changing **27+ files**
- No confidence that Mistral/Bedrock have same embedding dimensions (1536d)
- Structured output (`.withStructuredOutput()`) is OpenAI-specific API
- Tool calling format differs across providers

#### ✅ One Bright Spot: AI SDK in Chat

```typescript
// src/app/api/chat/simulation/route.ts
import { openai } from '@ai-sdk/openai'
import { streamText, tool } from 'ai'
```
- Uses Vercel AI SDK with provider abstraction
- Could swap to `import { anthropic } from '@ai-sdk/anthropic'`
- But only in chat endpoint - not embeddings/enrichment/resonance

**Recommendation**:
```typescript
// NEW: src/lib/llm/provider.ts
interface LLMProvider {
  name: string
  capabilities: string[] // e.g., ['chat', 'embeddings', 'structured-output']
  
  chat(messages: Message[], options?: ChatOptions): Promise<string>
  embed(texts: string[]): Promise<number[][]>
  structuredOutput<T>(schema: z.ZodSchema<T>, prompt: string): Promise<T>
}

class OpenAIProvider implements LLMProvider { /* ... */ }
class MistralProvider implements LLMProvider { /* ... */ }
class BedrockProvider implements LLMProvider { /* ... */ }

// NEW: src/lib/llm/factory.ts
export function getLLMProvider(preference?: string): LLMProvider {
  const provider = preference || process.env.LLM_PROVIDER || 'openai'
  switch (provider) {
    case 'openai': return new OpenAIProvider()
    case 'mistral': return new MistralProvider()
    case 'bedrock': return new BedrockProvider()
    default: throw new Error(`Unknown provider: ${provider}`)
  }
}
```

---

## Current Architecture: Detailed Breakdown

### Tool Layer (✅ Good Foundation)

**Existing Tools**:
1. **search_person_by_name** ([person-search.tool.ts](src/modules/agent/tools/person-search.tool.ts))
   - Flexible name matching (first, last, partial)
   - Disambiguation handling
   - Returns structured JSON
   - ✅ Model-agnostic interface

2. **graph-cypher-retrieval-chain** (inferred from tests)
   - Natural language → Cypher query generation
   - Error correction via LLM
   - Schema-aware queries
   - ⚠️ Tightly coupled to OpenAI for generation

3. **graph-vector-retrieval-chain** (inferred from tests)
   - Semantic search across Person embeddings
   - Uses `personBioVectorIndex` (1536d cosine)
   - ⚠️ Embedding dimension tied to OpenAI

**Tool Integration**:
- LangChain v1.x API (`createAgent()`)
- System prompts per mode (default, aiden, braider)
- Guardrails for query validation
- ✅ Clean separation of tool definition from execution

### LLM Usage Patterns (❌ Needs Abstraction)

**Pattern 1: Direct Instantiation** (most common, most problematic)
```typescript
const llm = new ChatOpenAI({
  modelName: 'gpt-5.1', // ❌ Hardcoded
  temperature: 0.3,
})
```
Found in: resonance discovery, person enrichment, agent initialization

**Pattern 2: Via AI SDK** (better, but isolated)
```typescript
import { openai } from '@ai-sdk/openai'
const result = await streamText({
  model: openai('gpt-5.1'), // ⚠️ Still hardcoded, but SDK-wrapped
  // ...
})
```
Found in: chat simulation endpoint only

**Pattern 3: Via LangChain Chains** (inconsistent)
```typescript
const rephraseChain = await initRephraseChain(llm) // ✅ Injected
// vs
const llm = new ChatOpenAI({ ... }) // ❌ Created inline
```
Some chains accept injected LLM, others create their own

### Security Architecture (⚠️ Incomplete)

**What Exists**:
```typescript
// GraphQL Context (src/lib/graphql/apollo.ts)
const context = async ({ req }) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  let jwt = null
  try {
    jwt = jwtDecode(token)
  } catch (error) {
    logger.warn('Invalid JWT token')
  }
  return { token, jwt }
}
```
- JWT tokens decoded in GraphQL layer
- User identity available in resolvers
- Neo4j session attached to context

**What's Missing**:
- ❌ No auth middleware for REST API routes (`/api/pulse/`, `/api/resonance/`)
- ❌ No rate limiting (could abuse expensive LLM operations)
- ❌ No cost tracking per user
- ❌ No audit trail for tool executions

### Database Access (✅ Well-Architected)

**Neo4j Singleton Pattern**:
```typescript
// src/modules/graph.ts
export async function initGraph(): Promise<Neo4jGraph> {
  if (graphInstance) return graphInstance
  // ... initialization
  return graphInstance
}
```
- Single connection pool
- LangChain `Neo4jGraph` wrapper
- Vector index support
- ✅ Already abstracted from LLM concerns

---

## Gap Analysis: What Needs to Change

### Critical (Must Fix Before MCP)

#### 1. Create LLM Provider Abstraction Layer

**File**: `src/lib/llm/provider.ts` (NEW)

```typescript
export interface LLMProvider {
  // Core capabilities
  chat(messages: Message[], options?: ChatOptions): Promise<string>
  embed(texts: string[]): Promise<number[][]>
  structuredOutput<T>(schema: z.ZodSchema<T>, prompt: string): Promise<T>
  
  // Metadata
  name: string
  embeddingDimension: number
  maxTokens: number
  costPerToken: { prompt: number; completion: number }
  capabilities: Set<'chat' | 'embeddings' | 'structured-output' | 'streaming'>
}

export interface ChatOptions {
  temperature?: number
  maxTokens?: number
  stop?: string[]
  stream?: boolean
}

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}
```

**Implementations**:
- `OpenAIProvider`: Wrap `ChatOpenAI` + `OpenAIEmbeddings`
- `MistralProvider`: Use Mistral SDK
- `BedrockProvider`: AWS Bedrock integration
- `LocalProvider`: Ollama for development

#### 2. Centralize LLM Instantiation

**File**: `src/lib/llm/factory.ts` (NEW)

```typescript
import { getLLMProvider } from './provider'

export function getEmbeddingsProvider(): LLMProvider {
  return getLLMProvider(process.env.EMBEDDINGS_PROVIDER || 'openai')
}

export function getChatProvider(): LLMProvider {
  return getLLMProvider(process.env.CHAT_PROVIDER || 'openai')
}

export function getAnalysisProvider(): LLMProvider {
  // Could use cheaper model for enrichment/resonance
  return getLLMProvider(process.env.ANALYSIS_PROVIDER || 'openai')
}
```

**Migration Strategy**:
Replace this pattern:
```typescript
// ❌ OLD
const llm = new ChatOpenAI({ modelName: 'gpt-5.1', temperature: 0.3 })
```

With this:
```typescript
// ✅ NEW
const provider = getChatProvider()
const result = await provider.chat(messages, { temperature: 0.3 })
```

**Files to Update** (27 total):
- `src/lib/resonance/embeddings/pulse-embedder.ts` (3 instances)
- `src/lib/resonance/embeddings/person-enricher.ts` (3 instances)
- `src/lib/resonance/discovery/pattern-detector.ts` (1 instance)
- `src/modules/agent/index.ts` (2 instances)
- `src/modules/agent/react-agent.ts` (3 instances)
- `src/app/api/resonance/search/route.ts` (1 instance)
- All test files (15 instances - use mock provider)

#### 3. Add Execution Context

**File**: `src/lib/llm/execution-context.ts` (NEW)

```typescript
export interface ExecutionContext {
  userId?: string      // From JWT
  sessionId?: string   // For tracking conversation
  operation: string    // e.g., "person-enrichment", "resonance-discovery"
  capability: string   // e.g., "chat", "embeddings"
  timestamp: Date
}

export class LLMExecutor {
  constructor(private provider: LLMProvider) {}
  
  async executeWithContext(
    context: ExecutionContext,
    operation: () => Promise<any>
  ): Promise<any> {
    // 1. Authorize
    await this.authorize(context)
    
    // 2. Execute
    const startTime = Date.now()
    try {
      const result = await operation()
      
      // 3. Log success
      await this.logExecution(context, {
        success: true,
        duration: Date.now() - startTime,
        provider: this.provider.name
      })
      
      return result
    } catch (error) {
      // 4. Log failure
      await this.logExecution(context, {
        success: false,
        duration: Date.now() - startTime,
        error: String(error)
      })
      throw error
    }
  }
  
  private async authorize(context: ExecutionContext): Promise<void> {
    // Rate limiting, quota checks, etc.
  }
  
  private async logExecution(context: ExecutionContext, result: any): Promise<void> {
    // Audit trail - store in Neo4j or separate logs
  }
}
```

### Important (Before Production)

#### 4. Add Authentication to AI APIs

**Files to Update**:
- `src/app/api/pulse/create-from-conversation/route.ts`
- `src/app/api/resonance/discover/route.ts`
- `src/app/api/resonance/search/route.ts`
- `src/app/api/person/enrich/route.ts`

**Pattern**:
```typescript
import { verifyJWT } from '@/lib/auth/jwt' // Create this

export async function POST(request: Request) {
  // 1. Verify JWT
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  const user = await verifyJWT(token)
  if (!user) {
    return new Response('Invalid token', { status: 401 })
  }
  
  // 2. Extract personId from JWT (not from request body)
  const { personId } = user
  
  // 3. Proceed with authenticated context
  // ...
}
```

#### 5. Create Capability Registry

**File**: `src/lib/capabilities/registry.ts` (NEW)

```typescript
export class CapabilityRegistry {
  private capabilities = new Map<string, Capability>()
  
  register(capability: Capability): void {
    this.capabilities.set(capability.id, capability)
  }
  
  getAvailableFor(provider: LLMProvider): Capability[] {
    return Array.from(this.capabilities.values()).filter(cap =>
      cap.requiredCapabilities.every(req => provider.capabilities.has(req))
    )
  }
  
  async execute(
    id: string,
    input: unknown,
    context: ExecutionContext
  ): Promise<string> {
    const capability = this.capabilities.get(id)
    if (!capability) throw new Error(`Unknown capability: ${id}`)
    
    // Validate input against schema
    const validInput = capability.schema.parse(input)
    
    // Execute with context
    const executor = new LLMExecutor(getProviderForCapability(capability))
    return executor.executeWithContext(context, () =>
      capability.handler(validInput)
    )
  }
}
```

### Nice to Have (Future)

#### 6. Model Routing by Task

**File**: `src/lib/llm/router.ts` (NEW)

```typescript
interface ModelRoute {
  pattern: RegExp
  provider: string
  rationale: string
}

const routes: ModelRoute[] = [
  {
    pattern: /person-enrichment|resonance-discovery/,
    provider: 'mistral-small', // Cheaper for batch analysis
    rationale: 'Cost optimization for bulk operations'
  },
  {
    pattern: /chat|simulation/,
    provider: 'openai', // Better conversational quality
    rationale: 'User-facing requires high quality'
  },
  {
    pattern: /embeddings/,
    provider: 'openai', // Need consistent 1536d vectors
    rationale: 'Vector indexes tuned for OpenAI dimensions'
  }
]

export function routeToProvider(operation: string): LLMProvider {
  const route = routes.find(r => r.pattern.test(operation))
  return getLLMProvider(route?.provider || 'openai')
}
```

#### 7. Fallback Chain

```typescript
export async function executeWithFallback<T>(
  operation: () => Promise<T>,
  fallbacks: LLMProvider[]
): Promise<T> {
  for (const provider of [primaryProvider, ...fallbacks]) {
    try {
      setCurrentProvider(provider)
      return await operation()
    } catch (error) {
      logger.warn(`Provider ${provider.name} failed, trying next`)
      continue
    }
  }
  throw new Error('All providers failed')
}
```

---

## Migration Path: Step-by-Step

### Phase 1: Foundation (Week 1)

**Goal**: Create abstraction layer without breaking existing code

1. **Create provider interface** (`src/lib/llm/provider.ts`)
   - Define `LLMProvider` interface
   - Implement `OpenAIProvider` that wraps current usage
   - Add factory function `getLLMProvider()`

2. **Create execution context** (`src/lib/llm/execution-context.ts`)
   - Define `ExecutionContext` interface
   - Implement `LLMExecutor` with logging

3. **Write tests** for provider abstraction
   - Mock provider for testing
   - Verify OpenAI provider works

**Validation**: All existing tests pass, no behavior change

### Phase 2: Migration (Week 2-3)

**Goal**: Replace direct OpenAI calls with provider abstraction

1. **Update embedding generation** (5 files)
   - `pulse-embedder.ts`: `getEmbeddingsProvider().embed()`
   - `person-enricher.ts`: Same pattern
   - `search/route.ts`: Same pattern

2. **Update chat/analysis** (10 files)
   - `pattern-detector.ts`: `getAnalysisProvider().chat()`
   - `person-enricher.ts`: Same for LLM calls
   - `react-agent.ts`: Inject provider instead of creating
   - `agent/index.ts`: Same

3. **Update tests** (15 files)
   - Replace `new ChatOpenAI()` with `MockLLMProvider`
   - Speeds up tests (no real API calls)

**Validation**: 
- All tests pass with mock provider
- Production uses OpenAI (no behavior change)
- Can swap via `LLM_PROVIDER=mock npm test`

### Phase 3: Security (Week 4)

**Goal**: Add authentication and audit logging

1. **Create JWT middleware** (`src/lib/auth/jwt.ts`)
   - Extract existing JWT logic from GraphQL
   - Make reusable for REST routes

2. **Protect AI endpoints**
   - Add auth to `/api/pulse/create-from-conversation`
   - Add auth to `/api/resonance/*`
   - Add auth to `/api/person/enrich`

3. **Add execution logging**
   - Log all LLM calls with user context
   - Track costs per user
   - Store in Neo4j: `(:ExecutionLog)-[:EXECUTED_BY]->(:Person)`

**Validation**:
- Unauthenticated requests return 401
- Audit logs capture user, operation, cost

### Phase 4: Alternative Providers (Week 5)

**Goal**: Prove swappability by adding Mistral

1. **Implement `MistralProvider`**
   - Wrap Mistral SDK
   - Map to same interface
   - Handle differences (structured output, embedding dimensions)

2. **Test with non-user-facing operations**
   - `process.env.ANALYSIS_PROVIDER=mistral`
   - Run person enrichment on test data
   - Compare quality vs OpenAI

3. **Document provider differences**
   - Embedding dimensions (OpenAI 1536d vs Mistral 1024d)
   - Structured output support
   - Cost comparisons
   - Quality benchmarks

**Validation**:
- Can run resonance discovery with Mistral
- Results comparable to OpenAI
- Costs tracked per provider

### Phase 5: Optimization (Week 6+)

**Goal**: Route operations to optimal provider

1. **Implement model routing**
   - Cheap operations → Mistral
   - User-facing chat → OpenAI
   - Embeddings → OpenAI (vector index compatibility)

2. **Add fallback chains**
   - Primary fails → try secondary
   - Log provider failures

3. **Cost monitoring dashboard**
   - Per-user costs
   - Per-operation costs
   - Provider comparison

---

## Relation to MCP Protocol

### What MCP-Style Indirection IS

The document correctly identifies:
- ✅ **Not building MCP server/protocol**
- ✅ Adopting MCP's **design philosophy**
- ✅ Treating LLMs as **interchangeable infrastructure**

### What GoalPost Already Has

1. **Capabilities (Tools)**:
   - ✅ Defined with clear schemas (Zod)
   - ✅ Independent of model (LangChain interface)
   - ⚠️ But execution still tied to OpenAI

2. **Execution Separation**:
   - ✅ Tools execute in our backend
   - ✅ LLM only provides reasoning
   - ⚠️ But no audit/auth layer

3. **Model Replaceability**:
   - ❌ Completely missing
   - ❌ 27+ hardcoded OpenAI calls
   - ❌ No abstraction layer

### Where We Need to Go

```
Current State (40% MCP-style):
┌─────────────┐
│ LLM Decides │──► ChatOpenAI (hardcoded)
└─────────────┘
       │
       ▼
┌─────────────┐
│ Tool Calls  │──► person-search, cypher-query (✅ good)
└─────────────┘
       │
       ▼
┌─────────────┐
│ Execution   │──► Neo4j queries (✅ secure)
└─────────────┘

Target State (100% MCP-style):
┌─────────────┐
│ LLM Decides │──► LLMProvider (abstracted)
└─────────────┘         │
       │                ├──► OpenAI
       │                ├──► Mistral
       │                └──► Bedrock
       ▼
┌─────────────────┐
│ Capability Call │──► Registry (validated, logged)
└─────────────────┘
       │
       ▼
┌──────────────────┐
│ Auth + Authorize │──► JWT + rate limits
└──────────────────┘
       │
       ▼
┌─────────────┐
│ Execution   │──► Backend logic (Neo4j, etc.)
└─────────────┘
       │
       ▼
┌─────────────┐
│ Audit Log   │──► Track user, cost, result
└─────────────┘
```

---

## When to Build Actual MCP

**Only if we need**:
- External agents discovering our capabilities
- Claude Desktop or other MCP clients consuming our tools
- Cross-organization tool sharing
- Standardized AI-to-AI protocols

**For now (prototype)**:
- ❌ **Don't** build MCP server
- ✅ **Do** apply MCP principles internally
- ✅ **Do** make LLMs swappable
- ✅ **Do** separate reasoning from execution
- ✅ **Do** maintain security boundaries

**If Robert's stakeholder says "show me MCP integration"**:
- We can expose 2-3 tools via MCP in ~1 week
- But only **after** we've done the abstraction work above
- Otherwise we're exposing brittle OpenAI-coupled code

---

## Recommendations for Robert

### Immediate Actions (This Sprint)

1. **Create LLM provider abstraction** (2-3 days)
   - Allows future swapping without rewriting 27 files
   - Unblocks cost optimization experiments

2. **Add auth to AI endpoints** (1 day)
   - Prevents abuse of expensive operations
   - Enables per-user cost tracking

3. **Document provider comparison** (1 day)
   - Test Mistral on non-critical path (person enrichment)
   - Benchmark cost vs quality
   - Show Robert concrete alternatives

### For Prototype Demo (Next 2 Weeks)

**Keep using OpenAI**:
- Most reliable tool calling
- Best structured output
- Proven with LangChain

**But show swappability**:
- `LLM_PROVIDER=mistral npm run enrich-person`
- Cost comparison dashboard
- "We can change this in production without touching tool code"

### For Production (Future)

**Hybrid approach**:
- OpenAI for user-facing chat (quality matters)
- Mistral/Bedrock for batch analysis (cost matters)
- Local models for development (speed matters)

**Route by operation**:
```typescript
chat/simulation → OpenAI (best UX)
person-enrichment → Mistral (10x cheaper, good enough)
resonance-discovery → Bedrock (batch processing)
embeddings → OpenAI (vector index compatibility)
```

---

## Cost Implications

### Current (All OpenAI)
- Chat: $0.01/1K tokens (GPT-4)
- Embeddings: $0.0001/1K tokens
- Structured output: +20% overhead
- **Estimated monthly**: $500-1000 for 100 active users

### With Provider Routing
- Chat: OpenAI ($0.01/1K)
- Enrichment: Mistral ($0.001/1K) → **90% savings**
- Resonance: Bedrock ($0.002/1K) → **80% savings**
- Embeddings: OpenAI (required for vector compatibility)
- **Estimated monthly**: $200-400 for 100 active users

### ROI of Abstraction Layer
- **Development**: 2-3 weeks upfront
- **Savings**: $300-600/month at scale
- **Payback**: 3-6 months
- **Flexibility**: Priceless (can react to pricing changes, new models)

---

## Summary: MCP-Style Checklist

| Principle | Status | Action Required |
|-----------|--------|-----------------|
| **Capabilities Are Model-Agnostic** | ⚠️ Partial | Add capability registry (optional) |
| **Tool Schemas Defined** | ✅ Complete | None - already using Zod |
| **Execution Separate from Reasoning** | ⚠️ Partial | Add auth to AI endpoints |
| **Security Boundary Exists** | ⚠️ Partial | Extend JWT to REST APIs |
| **Audit Logging** | ❌ Missing | Add execution logging |
| **Model Abstraction** | ❌ Missing | **Critical: LLM provider layer** |
| **Provider Swappability** | ❌ Missing | Implement Mistral/Bedrock providers |
| **Cost Tracking** | ❌ Missing | Add per-user/per-op metrics |
| **Fallback Strategy** | ❌ Missing | Implement fallback chains |

**Overall Score**: 4/10 (40% MCP-style compliant)

**Priority 1**: LLM provider abstraction (blocks everything else)  
**Priority 2**: Security/auth on AI endpoints (needed for production)  
**Priority 3**: Cost tracking and provider alternatives (optimization)

---

## Final Thoughts

GoalPost has a **solid foundation** for MCP-style indirection:
- Tools are well-defined
- Database access is clean
- Security exists (but incomplete)

The **critical missing piece** is the LLM abstraction layer.

**Without it**:
- Cannot swap models without touching 27+ files
- Cannot optimize costs (stuck with OpenAI for everything)
- Cannot implement fallbacks (single point of failure)
- Cannot track costs per user/operation

**With it**:
- Swap providers via config (`LLM_PROVIDER=mistral`)
- Route operations to optimal model
- Track costs and usage
- Implement fallbacks and redundancy
- **Build MCP server later if needed** (tools already exposed via abstract interface)

**Robert's message is clear**: Prototype with OpenAI (speed), but design for swappability (MCP-style). The abstraction layer makes this possible.

**Recommendation**: Spend 2-3 weeks on provider abstraction **now**. It will pay dividends in flexibility, cost optimization, and future MCP integration. Without it, we're building on a brittle foundation that couples us to a single vendor.

---

**Next Steps**:
1. Review this analysis with Robert
2. Prioritize Phase 1 (Foundation) in next sprint
3. Create LLM provider abstraction
4. Test with Mistral on non-critical path
5. Document cost comparisons
6. Continue prototype development with confidence we can swap later

