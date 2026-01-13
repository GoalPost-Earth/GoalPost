# LLM Provider Abstraction - Implementation Plan

> **Goal**: Decouple GoalPost from OpenAI to enable model swapping, cost optimization, and MCP-style indirection  
> **Timeline**: Phase 1 (1 week) + Phase 2 (2-3 weeks)  
> **Status**: Planning

---

## Phase 1: Foundation (Week 1)

Create the abstraction layer without breaking existing functionality.

### Task 1.1: Create LLM Provider Interface ✏️

**File**: `src/lib/llm/provider.ts` (NEW)

**Implementation**:
```typescript
import { z } from 'zod'

/**
 * Core message interface for chat interactions
 */
export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  name?: string // For tool messages
}

/**
 * Options for chat completion
 */
export interface ChatOptions {
  temperature?: number
  maxTokens?: number
  topP?: number
  stop?: string[]
  stream?: boolean
}

/**
 * Chat response from provider
 */
export interface ChatResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  finishReason?: string
}

/**
 * Structured output request
 */
export interface StructuredOutputOptions<T = any> extends ChatOptions {
  schema: z.ZodSchema<T>
  systemPrompt?: string
}

/**
 * LLM Provider Interface
 * All providers must implement this interface
 */
export interface LLMProvider {
  // Metadata
  name: string
  embeddingDimension: number
  maxContextTokens: number
  capabilities: Set<LLMCapability>
  
  // Core operations
  chat(messages: Message[], options?: ChatOptions): Promise<ChatResponse>
  embed(texts: string[]): Promise<number[][]>
  structuredOutput<T>(
    messages: Message[], 
    options: StructuredOutputOptions<T>
  ): Promise<T>
  
  // Cost tracking
  estimateCost(operation: 'chat' | 'embed', tokens: number): number
}

/**
 * Supported capabilities
 */
export type LLMCapability = 
  | 'chat'
  | 'embeddings' 
  | 'structured-output'
  | 'streaming'
  | 'function-calling'
  | 'json-mode'

/**
 * Provider configuration
 */
export interface ProviderConfig {
  apiKey?: string
  baseURL?: string
  modelName?: string
  timeout?: number
  maxRetries?: number
}

/**
 * Base error class for provider errors
 */
export class LLMProviderError extends Error {
  constructor(
    public provider: string,
    message: string,
    public originalError?: Error
  ) {
    super(`[${provider}] ${message}`)
    this.name = 'LLMProviderError'
  }
}
```

**Acceptance Criteria**:
- [ ] Interface compiles without errors
- [ ] All methods have clear JSDoc comments
- [ ] Error types are defined
- [ ] TypeScript types are exported

**Estimated Time**: 1-2 hours

---

### Task 1.2: Implement OpenAI Provider Wrapper ✏️

**File**: `src/lib/llm/providers/openai.provider.ts` (NEW)

**Implementation**:
```typescript
import { ChatOpenAI } from '@langchain/openai'
import { OpenAIEmbeddings } from '@langchain/openai'
import {
  LLMProvider,
  Message,
  ChatOptions,
  ChatResponse,
  StructuredOutputOptions,
  ProviderConfig,
  LLMProviderError,
  LLMCapability,
} from '../provider'

/**
 * OpenAI Provider Implementation
 * Wraps LangChain's ChatOpenAI and OpenAIEmbeddings
 */
export class OpenAIProvider implements LLMProvider {
  name = 'openai'
  embeddingDimension = 1536 // text-embedding-3-small
  maxContextTokens = 128000 // gpt-4-turbo
  capabilities = new Set<LLMCapability>([
    'chat',
    'embeddings',
    'structured-output',
    'streaming',
    'function-calling',
    'json-mode',
  ])

  private chatModel: ChatOpenAI
  private embeddingsModel: OpenAIEmbeddings
  
  // Pricing (per 1K tokens)
  private readonly pricing = {
    'gpt-5.1': { prompt: 0.01, completion: 0.03 },
    'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
    'text-embedding-3-small': 0.0001,
  }

  constructor(private config: ProviderConfig = {}) {
    const apiKey = config.apiKey || process.env.OPENAI_API_KEY
    const modelName = config.modelName || 'gpt-5.1'
    
    if (!apiKey) {
      throw new LLMProviderError(
        'openai',
        'OPENAI_API_KEY not found in environment or config'
      )
    }

    this.chatModel = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName,
      temperature: 0.3,
      maxRetries: config.maxRetries || 3,
      timeout: config.timeout || 60000,
      ...(config.baseURL && { configuration: { baseURL: config.baseURL } }),
    })

    this.embeddingsModel = new OpenAIEmbeddings({
      openAIApiKey: apiKey,
      modelName: 'text-embedding-3-small',
      ...(config.baseURL && { configuration: { baseURL: config.baseURL } }),
    })
  }

  async chat(messages: Message[], options?: ChatOptions): Promise<ChatResponse> {
    try {
      const llm = this.chatModel.bind({
        temperature: options?.temperature,
        max_tokens: options?.maxTokens,
        top_p: options?.topP,
        stop: options?.stop,
      })

      const langchainMessages = messages.map(msg => ({
        type: msg.role === 'system' ? 'system' : 
              msg.role === 'assistant' ? 'ai' : 'human',
        content: msg.content,
      }))

      const response = await llm.invoke(langchainMessages)
      
      return {
        content: typeof response.content === 'string' 
          ? response.content 
          : JSON.stringify(response.content),
        usage: response.response_metadata?.tokenUsage ? {
          promptTokens: response.response_metadata.tokenUsage.promptTokens,
          completionTokens: response.response_metadata.tokenUsage.completionTokens,
          totalTokens: response.response_metadata.tokenUsage.totalTokens,
        } : undefined,
        finishReason: response.response_metadata?.finish_reason,
      }
    } catch (error) {
      throw new LLMProviderError(
        'openai',
        `Chat completion failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined
      )
    }
  }

  async embed(texts: string[]): Promise<number[][]> {
    try {
      const embeddings = await this.embeddingsModel.embedDocuments(texts)
      return embeddings
    } catch (error) {
      throw new LLMProviderError(
        'openai',
        `Embedding generation failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined
      )
    }
  }

  async structuredOutput<T>(
    messages: Message[],
    options: StructuredOutputOptions<T>
  ): Promise<T> {
    try {
      const structuredLlm = this.chatModel.withStructuredOutput(options.schema)
      
      const langchainMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }))

      if (options.systemPrompt) {
        langchainMessages.unshift({
          role: 'system',
          content: options.systemPrompt,
        })
      }

      const result = await structuredLlm.invoke(langchainMessages)
      return result as T
    } catch (error) {
      throw new LLMProviderError(
        'openai',
        `Structured output failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined
      )
    }
  }

  estimateCost(operation: 'chat' | 'embed', tokens: number): number {
    if (operation === 'embed') {
      return (tokens / 1000) * this.pricing['text-embedding-3-small']
    }
    
    // Assume 50/50 prompt/completion split for estimation
    const modelPricing = this.pricing['gpt-5.1']
    return (tokens / 2000) * (modelPricing.prompt + modelPricing.completion)
  }
}
```

**Acceptance Criteria**:
- [ ] Wraps existing LangChain OpenAI classes
- [ ] All interface methods implemented
- [ ] Error handling with LLMProviderError
- [ ] Cost estimation included
- [ ] Backwards compatible with current OpenAI usage

**Estimated Time**: 3-4 hours

---

### Task 1.3: Create Provider Factory ✏️

**File**: `src/lib/llm/factory.ts` (NEW)

**Implementation**:
```typescript
import { LLMProvider, ProviderConfig } from './provider'
import { OpenAIProvider } from './providers/openai.provider'

export type ProviderType = 'openai' | 'mistral' | 'bedrock' | 'mock'

/**
 * Get an LLM provider instance
 */
export function getLLMProvider(
  type?: ProviderType,
  config?: ProviderConfig
): LLMProvider {
  const providerType = type || (process.env.LLM_PROVIDER as ProviderType) || 'openai'
  
  switch (providerType) {
    case 'openai':
      return new OpenAIProvider(config)
    
    case 'mistral':
      // TODO: Implement in Phase 4
      throw new Error('Mistral provider not yet implemented')
    
    case 'bedrock':
      // TODO: Implement in Phase 4
      throw new Error('Bedrock provider not yet implemented')
    
    case 'mock':
      // TODO: Implement in Task 1.6
      throw new Error('Mock provider not yet implemented')
    
    default:
      throw new Error(`Unknown provider type: ${providerType}`)
  }
}

/**
 * Get provider for embedding operations
 * Can be different from chat provider for cost optimization
 */
export function getEmbeddingsProvider(config?: ProviderConfig): LLMProvider {
  const type = (process.env.EMBEDDINGS_PROVIDER as ProviderType) || 
               (process.env.LLM_PROVIDER as ProviderType) || 
               'openai'
  return getLLMProvider(type, config)
}

/**
 * Get provider for chat operations
 */
export function getChatProvider(config?: ProviderConfig): LLMProvider {
  const type = (process.env.CHAT_PROVIDER as ProviderType) || 
               (process.env.LLM_PROVIDER as ProviderType) || 
               'openai'
  return getLLMProvider(type, config)
}

/**
 * Get provider for analysis operations (enrichment, resonance discovery)
 * Can use cheaper models for batch processing
 */
export function getAnalysisProvider(config?: ProviderConfig): LLMProvider {
  const type = (process.env.ANALYSIS_PROVIDER as ProviderType) || 
               (process.env.LLM_PROVIDER as ProviderType) || 
               'openai'
  return getLLMProvider(type, config)
}
```

**Acceptance Criteria**:
- [ ] Factory returns OpenAI provider by default
- [ ] Environment variables control provider selection
- [ ] Separate factories for embeddings, chat, analysis
- [ ] Clear error messages for unimplemented providers

**Estimated Time**: 1 hour

---

### Task 1.4: Create Execution Context & Logger ✏️

**File**: `src/lib/llm/execution-context.ts` (NEW)

**Implementation**:
```typescript
import { LLMProvider } from './provider'

/**
 * Context for LLM execution tracking
 */
export interface ExecutionContext {
  userId?: string // From JWT
  sessionId?: string
  operation: string // e.g., "person-enrichment", "chat", "resonance-discovery"
  capability: 'chat' | 'embeddings' | 'structured-output'
  timestamp: Date
  metadata?: Record<string, any>
}

/**
 * Execution result for logging
 */
export interface ExecutionResult {
  success: boolean
  duration: number
  provider: string
  tokensUsed?: number
  estimatedCost?: number
  error?: string
}

/**
 * Wraps LLM operations with logging, monitoring, and error handling
 */
export class LLMExecutor {
  constructor(private provider: LLMProvider) {}

  /**
   * Execute an operation with full context tracking
   */
  async executeWithContext<T>(
    context: ExecutionContext,
    operation: (provider: LLMProvider) => Promise<T>
  ): Promise<T> {
    const startTime = Date.now()
    
    try {
      // 1. Authorize (TODO: Add rate limiting in Phase 3)
      await this.authorize(context)
      
      // 2. Execute operation
      const result = await operation(this.provider)
      
      // 3. Log success
      const duration = Date.now() - startTime
      await this.logExecution(context, {
        success: true,
        duration,
        provider: this.provider.name,
      })
      
      return result
      
    } catch (error) {
      // 4. Log failure
      const duration = Date.now() - startTime
      await this.logExecution(context, {
        success: false,
        duration,
        provider: this.provider.name,
        error: error instanceof Error ? error.message : String(error),
      })
      
      throw error
    }
  }

  /**
   * Authorization check (placeholder for Phase 3)
   */
  private async authorize(context: ExecutionContext): Promise<void> {
    // TODO: Implement rate limiting, quota checks in Phase 3
    // For now, just validate context
    if (!context.operation || !context.capability) {
      throw new Error('Invalid execution context: operation and capability required')
    }
  }

  /**
   * Log execution (placeholder for Phase 3)
   */
  private async logExecution(
    context: ExecutionContext,
    result: ExecutionResult
  ): Promise<void> {
    // TODO: Store in Neo4j or logging service in Phase 3
    // For now, console log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[LLM Execution]', {
        ...context,
        ...result,
      })
    }
  }
}

/**
 * Convenience wrapper for simple operations
 */
export async function executeLLMOperation<T>(
  provider: LLMProvider,
  operation: string,
  callback: (provider: LLMProvider) => Promise<T>,
  userId?: string
): Promise<T> {
  const executor = new LLMExecutor(provider)
  const context: ExecutionContext = {
    operation,
    capability: 'chat', // Will be inferred from actual operation in Phase 3
    timestamp: new Date(),
    userId,
  }
  
  return executor.executeWithContext(context, callback)
}
```

**Acceptance Criteria**:
- [ ] Context captures user, operation, timestamp
- [ ] Execution wrapper handles errors gracefully
- [ ] Logging interface defined (implementation in Phase 3)
- [ ] Authorization hook defined (implementation in Phase 3)

**Estimated Time**: 2 hours

---

### Task 1.5: Add Provider Tests ✏️

**File**: `src/lib/llm/__tests__/openai.provider.test.ts` (NEW)

**Implementation**:
```typescript
import { describe, it, expect, beforeAll } from '@jest/globals'
import { OpenAIProvider } from '../providers/openai.provider'
import { z } from 'zod'

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider

  beforeAll(() => {
    // Skip if no API key (CI environment)
    if (!process.env.OPENAI_API_KEY) {
      console.warn('Skipping OpenAI provider tests - no API key')
      return
    }
    
    provider = new OpenAIProvider()
  })

  describe('metadata', () => {
    it('should have correct metadata', () => {
      if (!provider) return
      
      expect(provider.name).toBe('openai')
      expect(provider.embeddingDimension).toBe(1536)
      expect(provider.maxContextTokens).toBeGreaterThan(0)
      expect(provider.capabilities.has('chat')).toBe(true)
      expect(provider.capabilities.has('embeddings')).toBe(true)
    })
  })

  describe('chat', () => {
    it('should complete a simple chat', async () => {
      if (!provider) return
      
      const response = await provider.chat([
        { role: 'user', content: 'Say "test successful" and nothing else.' }
      ])
      
      expect(response.content).toContain('test successful')
      expect(response.usage).toBeDefined()
    }, 10000) // 10s timeout
  })

  describe('embed', () => {
    it('should generate embeddings', async () => {
      if (!provider) return
      
      const embeddings = await provider.embed(['Hello world', 'Test embedding'])
      
      expect(embeddings).toHaveLength(2)
      expect(embeddings[0]).toHaveLength(1536)
      expect(embeddings[1]).toHaveLength(1536)
    }, 10000)
  })

  describe('structuredOutput', () => {
    it('should return structured data', async () => {
      if (!provider) return
      
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      })
      
      const result = await provider.structuredOutput(
        [
          { role: 'user', content: 'Extract: John is 30 years old' }
        ],
        { schema }
      )
      
      expect(result.name).toBe('John')
      expect(result.age).toBe(30)
    }, 10000)
  })

  describe('estimateCost', () => {
    it('should estimate chat cost', () => {
      if (!provider) return
      
      const cost = provider.estimateCost('chat', 1000)
      expect(cost).toBeGreaterThan(0)
    })

    it('should estimate embedding cost', () => {
      if (!provider) return
      
      const cost = provider.estimateCost('embed', 1000)
      expect(cost).toBeGreaterThan(0)
      expect(cost).toBeLessThan(provider.estimateCost('chat', 1000))
    })
  })
})
```

**File**: `src/lib/llm/__tests__/factory.test.ts` (NEW)

```typescript
import { describe, it, expect } from '@jest/globals'
import { getLLMProvider, getChatProvider, getEmbeddingsProvider } from '../factory'

describe('LLM Factory', () => {
  describe('getLLMProvider', () => {
    it('should return OpenAI provider by default', () => {
      const provider = getLLMProvider()
      expect(provider.name).toBe('openai')
    })

    it('should return OpenAI when explicitly requested', () => {
      const provider = getLLMProvider('openai')
      expect(provider.name).toBe('openai')
    })

    it('should throw for unimplemented providers', () => {
      expect(() => getLLMProvider('mistral')).toThrow('not yet implemented')
    })
  })

  describe('specialized factories', () => {
    it('getChatProvider should work', () => {
      const provider = getChatProvider()
      expect(provider).toBeDefined()
      expect(provider.capabilities.has('chat')).toBe(true)
    })

    it('getEmbeddingsProvider should work', () => {
      const provider = getEmbeddingsProvider()
      expect(provider).toBeDefined()
      expect(provider.capabilities.has('embeddings')).toBe(true)
    })
  })
})
```

**Acceptance Criteria**:
- [ ] Tests pass with valid OpenAI API key
- [ ] Tests skip gracefully without API key (CI friendly)
- [ ] All provider methods tested
- [ ] Factory returns correct provider types

**Estimated Time**: 2-3 hours

---

### Task 1.6: Create Mock Provider for Tests ✏️

**File**: `src/lib/llm/providers/mock.provider.ts` (NEW)

**Implementation**:
```typescript
import {
  LLMProvider,
  Message,
  ChatOptions,
  ChatResponse,
  StructuredOutputOptions,
  LLMCapability,
} from '../provider'

/**
 * Mock LLM Provider for testing
 * Returns predictable responses without API calls
 */
export class MockLLMProvider implements LLMProvider {
  name = 'mock'
  embeddingDimension = 1536
  maxContextTokens = 128000
  capabilities = new Set<LLMCapability>([
    'chat',
    'embeddings',
    'structured-output',
  ])

  // Track calls for testing
  public calls: {
    chat: Message[][]
    embed: string[][]
    structuredOutput: any[]
  } = {
    chat: [],
    embed: [],
    structuredOutput: [],
  }

  constructor(
    private mockResponses: {
      chat?: string
      embeddings?: number[][]
      structuredOutput?: any
    } = {}
  ) {}

  async chat(messages: Message[], options?: ChatOptions): Promise<ChatResponse> {
    this.calls.chat.push(messages)
    
    return {
      content: this.mockResponses.chat || 'Mock response',
      usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      },
      finishReason: 'stop',
    }
  }

  async embed(texts: string[]): Promise<number[][]> {
    this.calls.embed.push(texts)
    
    if (this.mockResponses.embeddings) {
      return this.mockResponses.embeddings
    }
    
    // Return random embeddings of correct dimension
    return texts.map(() => 
      Array(this.embeddingDimension).fill(0).map(() => Math.random())
    )
  }

  async structuredOutput<T>(
    messages: Message[],
    options: StructuredOutputOptions<T>
  ): Promise<T> {
    this.calls.structuredOutput.push({ messages, options })
    
    if (this.mockResponses.structuredOutput) {
      return this.mockResponses.structuredOutput as T
    }
    
    // Return empty object that validates against schema
    return {} as T
  }

  estimateCost(operation: 'chat' | 'embed', tokens: number): number {
    return 0 // Mock provider is free!
  }

  // Test helper: reset call tracking
  resetCalls(): void {
    this.calls = {
      chat: [],
      embed: [],
      structuredOutput: [],
    }
  }
}
```

**Update**: `src/lib/llm/factory.ts`

```typescript
// Add to imports
import { MockLLMProvider } from './providers/mock.provider'

// Update switch statement in getLLMProvider:
case 'mock':
  return new MockLLMProvider(config?.mockResponses)
```

**Acceptance Criteria**:
- [ ] Mock provider implements full interface
- [ ] Returns predictable responses
- [ ] Tracks calls for verification
- [ ] No external API calls
- [ ] Can be used in all existing tests

**Estimated Time**: 2 hours

---

## Phase 1 Validation Checklist

Before moving to Phase 2, verify:

- [ ] All Phase 1 files compile without errors
- [ ] Tests pass: `npm run test -- src/lib/llm`
- [ ] OpenAI provider works identically to direct usage
- [ ] Mock provider enables fast testing
- [ ] Documentation is clear
- [ ] No breaking changes to existing code

**Phase 1 Total Estimated Time**: 15-20 hours (1 week)

---

## Phase 2: Migration (Weeks 2-3)

Replace direct OpenAI calls with provider abstraction.

### Task 2.1: Migrate Embedding Services (5 files) ✏️

**Files to Update**:
1. `src/lib/resonance/embeddings/pulse-embedder.ts`
2. `src/lib/resonance/embeddings/person-enricher.ts`
3. `src/app/api/resonance/search/route.ts`
4. `src/modules/agent/index.ts`
5. `src/modules/agent/react-agent.ts`

**Pattern**:

**BEFORE**:
```typescript
import { OpenAIEmbeddings } from '@langchain/openai'

async function generateEmbedding(text: string): Promise<number[]> {
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: 'text-embedding-3-small',
  })
  const embedding = await embeddings.embedQuery(text)
  return embedding
}
```

**AFTER**:
```typescript
import { getEmbeddingsProvider } from '@/lib/llm/factory'

async function generateEmbedding(text: string): Promise<number[]> {
  const provider = getEmbeddingsProvider()
  const embeddings = await provider.embed([text])
  return embeddings[0]
}
```

**Acceptance Criteria per file**:
- [ ] Remove direct OpenAI imports
- [ ] Replace with provider factory calls
- [ ] Maintain exact same behavior
- [ ] Update any related tests
- [ ] Verify embeddings still match (1536d)

**Estimated Time**: 4-6 hours (1 hour per file)

---

### Task 2.2: Migrate Resonance Discovery (1 file) ✏️

**File**: `src/lib/resonance/discovery/pattern-detector.ts`

**Pattern**:

**BEFORE**:
```typescript
const llm = new ChatOpenAI({
  modelName: 'gpt-5.1',
  temperature: 0.2,
})

const result = await llm.withStructuredOutput(ResonancePatternSchema).invoke([...])
```

**AFTER**:
```typescript
import { getAnalysisProvider } from '@/lib/llm/factory'

const provider = getAnalysisProvider()
const result = await provider.structuredOutput(
  [{ role: 'user', content: prompt }],
  { 
    schema: ResonancePatternSchema,
    temperature: 0.2 
  }
)
```

**Acceptance Criteria**:
- [ ] Remove ChatOpenAI import
- [ ] Use getAnalysisProvider()
- [ ] Structured output still works
- [ ] Resonance discovery produces same quality results
- [ ] Update any related tests

**Estimated Time**: 2 hours

---

### Task 2.3: Migrate Person Enrichment (1 file) ✏️

**File**: `src/lib/resonance/embeddings/person-enricher.ts`

**Changes**:
- 3 OpenAI instantiations (2 ChatOpenAI, 1 OpenAIEmbeddings)
- Replace with provider abstraction

**BEFORE**:
```typescript
const llm = new ChatOpenAI({
  modelName: 'gpt-5.1',
  temperature: 0.3,
})
const structuredLlm = llm.withStructuredOutput(PersonInsightsSchema)
const insights = await structuredLlm.invoke([...])

// Later...
const embeddings = new OpenAIEmbeddings({...})
const embedding = await embeddings.embedQuery(personBio)
```

**AFTER**:
```typescript
const provider = getAnalysisProvider()
const insights = await provider.structuredOutput(
  [{ role: 'system', content: '...' }, { role: 'user', content: prompt }],
  { schema: PersonInsightsSchema, temperature: 0.3 }
)

// Later...
const embeddingProvider = getEmbeddingsProvider()
const embeddings = await embeddingProvider.embed([personBio])
const embedding = embeddings[0]
```

**Acceptance Criteria**:
- [ ] All 3 OpenAI calls replaced
- [ ] Person enrichment still produces quality insights
- [ ] Embeddings still 1536d
- [ ] Tests updated

**Estimated Time**: 2-3 hours

---

### Task 2.4: Migrate Agent System (3 files) ✏️

**Files**:
1. `src/modules/agent/index.ts`
2. `src/modules/agent/react-agent.ts`
3. `src/modules/agent/agent.ts`

**Challenge**: These files use LangChain's `createAgent()` which expects `BaseChatModel`

**Solution**: Create adapter

**New File**: `src/lib/llm/adapters/langchain-adapter.ts`

```typescript
import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { ChatOpenAI } from '@langchain/openai'
import { OpenAIEmbeddings } from '@langchain/openai'
import { Embeddings } from '@langchain/core/embeddings'
import { getLLMProvider } from '../factory'

/**
 * Get LangChain-compatible chat model from provider
 * For now, returns ChatOpenAI directly
 * TODO: Create true adapter for other providers
 */
export function getLangChainChatModel(): BaseChatModel {
  const provider = getLLMProvider()
  
  if (provider.name === 'openai') {
    // Return underlying ChatOpenAI instance
    return new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-5.1',
      temperature: 0.3,
    })
  }
  
  throw new Error(`LangChain adapter not implemented for ${provider.name}`)
}

/**
 * Get LangChain-compatible embeddings model
 */
export function getLangChainEmbeddings(): Embeddings {
  const provider = getLLMProvider()
  
  if (provider.name === 'openai') {
    return new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-3-small',
    })
  }
  
  throw new Error(`LangChain embeddings adapter not implemented for ${provider.name}`)
}
```

**Update `src/modules/agent/index.ts`**:

**BEFORE**:
```typescript
const llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-5.1',
})

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'text-embedding-3-small',
})
```

**AFTER**:
```typescript
import { getLangChainChatModel, getLangChainEmbeddings } from '@/lib/llm/adapters/langchain-adapter'

const llm = getLangChainChatModel()
const embeddings = getLangChainEmbeddings()
```

**Acceptance Criteria**:
- [ ] Agent system still works with LangChain tools
- [ ] Chat responses identical to before
- [ ] All agent tests pass
- [ ] Adapter provides path for future providers

**Estimated Time**: 3-4 hours

---

### Task 2.5: Migrate Test Files (15 files) ✏️

**Test Files to Update**:
- `src/modules/agent/*.test.ts` (7 files)
- `src/modules/agent/chains/*.test.ts` (3 files)
- `src/modules/agent/tools/*.test.ts` (5 files)

**Pattern**:

**BEFORE**:
```typescript
llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-5.1',
})
```

**AFTER**:
```typescript
import { MockLLMProvider } from '@/lib/llm/providers/mock.provider'
import { getLangChainChatModel } from '@/lib/llm/adapters/langchain-adapter'

// For tests that need real LLM (integration tests)
llm = getLangChainChatModel()

// For unit tests (faster, no API calls)
process.env.LLM_PROVIDER = 'mock'
llm = getLangChainChatModel() // Will use mock via factory
```

**Benefits**:
- Faster test execution (no API calls)
- No API key required for CI
- Deterministic test results

**Acceptance Criteria**:
- [ ] All tests still pass
- [ ] Unit tests use mock provider
- [ ] Integration tests use real provider
- [ ] Test execution time reduced

**Estimated Time**: 6-8 hours (30 min per file)

---

### Task 2.6: Update Environment Variables & Docs ✏️

**Update `.env.example`**:
```bash
# LLM Provider Configuration (Phase 2)
# Options: openai, mistral, bedrock, mock
LLM_PROVIDER=openai

# Optional: Separate providers for different operations
CHAT_PROVIDER=openai
EMBEDDINGS_PROVIDER=openai
ANALYSIS_PROVIDER=openai

# OpenAI (default)
OPENAI_API_KEY=sk-...

# Mistral (Phase 4)
# MISTRAL_API_KEY=...

# AWS Bedrock (Phase 4)
# AWS_REGION=us-east-1
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...
```

**Update `README.md`**:
```markdown
## LLM Provider Configuration

GoalPost supports multiple LLM providers. Configure via environment variables:

```bash
# Use OpenAI (default)
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...

# Use mock provider (for testing, no API calls)
LLM_PROVIDER=mock

# Route different operations to different providers
CHAT_PROVIDER=openai         # User-facing chat
EMBEDDINGS_PROVIDER=openai   # Vector embeddings
ANALYSIS_PROVIDER=mistral    # Batch analysis (coming soon)
```

### Supported Providers
- **OpenAI** (default): GPT-4, text-embedding-3-small
- **Mock**: Testing without API calls
- **Mistral**: Coming in Phase 4
- **AWS Bedrock**: Coming in Phase 4
```

**Create `docs/LLM_PROVIDERS.md`**:
Document provider architecture, how to add new providers, etc.

**Acceptance Criteria**:
- [ ] Environment variables documented
- [ ] README updated with provider info
- [ ] Provider guide created
- [ ] Migration notes added to CHANGELOG

**Estimated Time**: 2-3 hours

---

## Phase 2 Validation Checklist

Before declaring Phase 2 complete:

- [ ] All 27 OpenAI instantiations replaced
- [ ] No remaining direct imports of `ChatOpenAI` or `OpenAIEmbeddings` (except in provider/adapter)
- [ ] All tests pass: `npm run test`
- [ ] Embeddings still 1536d (vector index compatibility)
- [ ] Person enrichment quality unchanged
- [ ] Resonance discovery quality unchanged
- [ ] Chat responses identical to before
- [ ] Documentation updated
- [ ] Can swap to mock provider: `LLM_PROVIDER=mock npm run test`

**Phase 2 Total Estimated Time**: 25-35 hours (2-3 weeks)

---

## File Changes Summary

### New Files (Phase 1)
- `src/lib/llm/provider.ts` - Interface definitions
- `src/lib/llm/providers/openai.provider.ts` - OpenAI implementation
- `src/lib/llm/providers/mock.provider.ts` - Mock for testing
- `src/lib/llm/factory.ts` - Provider factory
- `src/lib/llm/execution-context.ts` - Logging wrapper
- `src/lib/llm/__tests__/openai.provider.test.ts` - Tests
- `src/lib/llm/__tests__/factory.test.ts` - Tests

### New Files (Phase 2)
- `src/lib/llm/adapters/langchain-adapter.ts` - LangChain compatibility
- `docs/LLM_PROVIDERS.md` - Provider documentation

### Modified Files (Phase 2)
- `src/lib/resonance/embeddings/pulse-embedder.ts` (3 instances)
- `src/lib/resonance/embeddings/person-enricher.ts` (3 instances)
- `src/lib/resonance/discovery/pattern-detector.ts` (1 instance)
- `src/modules/agent/index.ts` (2 instances)
- `src/modules/agent/react-agent.ts` (3 instances)
- `src/modules/agent/agent.ts` (0 instances - uses injected llm)
- `src/app/api/resonance/search/route.ts` (1 instance)
- 15 test files (15 instances)
- `.env.example` - Add provider config
- `README.md` - Add provider section
- `docs/CHANGELOG.md` - Document changes

**Total**: 7 new files, 25 modified files

---

## Testing Strategy

### Unit Tests (Fast, No API)
```bash
LLM_PROVIDER=mock npm run test
```
- All business logic tests
- Mock provider returns predictable data
- No API costs

### Integration Tests (Slow, Real API)
```bash
LLM_PROVIDER=openai npm run test -- --testPathPattern=integration
```
- End-to-end workflows
- Verify OpenAI integration
- Run before deployment

### Validation Tests
```bash
# Test provider swapping
LLM_PROVIDER=openai npm run test
LLM_PROVIDER=mock npm run test
# Both should pass

# Test embeddings dimension
node -e "const p = require('./src/lib/llm/factory').getEmbeddingsProvider(); console.log(p.embeddingDimension)"
# Should print: 1536
```

---

## Rollback Plan

If Phase 2 causes issues:

1. **Immediate**: Set `LLM_PROVIDER=openai` (default behavior)
2. **Short-term**: Revert individual files via git
3. **Long-term**: Phase 1 abstraction layer doesn't break anything - can keep it and gradually adopt

Git strategy:
```bash
# Create feature branch
git checkout -b feature/llm-abstraction

# Phase 1 commit
git commit -m "feat: Add LLM provider abstraction layer (Phase 1)"

# Phase 2 commits (one per task)
git commit -m "refactor: Migrate embedding services to provider abstraction"
git commit -m "refactor: Migrate resonance discovery to provider abstraction"
# etc...

# If issue found, revert specific commit
git revert <commit-sha>
```

---

## Success Metrics

**Phase 1**:
- ✅ All tests pass with OpenAI provider
- ✅ Mock provider enables 10x faster test suite
- ✅ No breaking changes

**Phase 2**:
- ✅ Zero direct OpenAI imports (except provider/adapter)
- ✅ Can run full test suite with `LLM_PROVIDER=mock`
- ✅ Behavior identical to before migration
- ✅ Ready to add Mistral/Bedrock in Phase 4

---

## Next Steps After Phase 2

### Phase 3: Security (Week 4)
- Add JWT authentication to AI endpoints
- Implement audit logging
- Add rate limiting per user
- Cost tracking in Neo4j

### Phase 4: Alternative Providers (Week 5)
- Implement `MistralProvider`
- Implement `BedrockProvider`
- Cost/quality benchmarks
- Model routing by operation type

### Phase 5: MCP Server (Future)
- Only after Phases 1-3 complete
- Provider abstraction makes MCP trivial
- Tools already defined, just expose via protocol

---

## Questions & Decisions

### Q1: Should we keep LangChain long-term?
**Decision**: Yes for Phase 1-2. Agent system works well with it. Provider abstraction allows us to bypass LangChain for simple operations (embeddings, chat) while keeping it for complex workflows (agents, tools, chains).

### Q2: What about embedding dimension compatibility?
**Decision**: Phase 1-2 keep OpenAI for embeddings (1536d). Phase 4 can add Mistral but would need:
- New vector indexes (1024d)
- Separate indices per provider
- Migration strategy for existing embeddings

### Q3: Handle provider failures?
**Decision**: Phase 1-2 throw errors. Phase 5 add fallback chains.

### Q4: Cost tracking granularity?
**Decision**: Phase 1-2 estimate only. Phase 3 add actual usage tracking via LLM callbacks.

---

## Contact

Questions about this plan?
- Check `docs/MCP_STYLE_INDIRECTION_ANALYSIS.md` for context
- Review `docs/ARCHITECTURE_DIAGRAM.md` for system overview
- See existing agent code in `src/modules/agent/` for patterns

**Let's build! 🚀**
