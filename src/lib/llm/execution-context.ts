/**
 * LLM Execution Context & Logging
 *
 * Wraps LLM operations with logging, monitoring, authorization,
 * and error handling. Enables tracking of who uses what, when,
 * and at what cost.
 */

import { LLMProvider } from './provider'

/**
 * Context for LLM execution tracking
 */
export interface ExecutionContext {
  userId?: string // From JWT - identifies user for audit/billing
  sessionId?: string // For conversation tracking
  operation: string // e.g., "person-enrichment", "chat", "resonance-discovery"
  capability: 'chat' | 'embeddings' | 'structured-output'
  timestamp: Date
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any> // Additional context
}

/**
 * Execution result for logging
 */
export interface ExecutionResult {
  success: boolean
  duration: number // milliseconds
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
   *
   * @example
   * ```typescript
   * const executor = new LLMExecutor(provider)
   * const result = await executor.executeWithContext(
   *   { operation: 'chat', capability: 'chat', timestamp: new Date(), userId: 'user_123' },
   *   async (provider) => {
   *     return await provider.chat([{ role: 'user', content: 'Hello' }])
   *   }
   * )
   * ```
   */
  async executeWithContext<T>(
    context: ExecutionContext,
    operation: (provider: LLMProvider) => Promise<T>
  ): Promise<T> {
    const startTime = Date.now()

    try {
      // 1. Authorize (placeholder for Phase 3)
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
   * Authorization check
   * TODO: Implement rate limiting, quota checks in Phase 3
   */
  private async authorize(context: ExecutionContext): Promise<void> {
    // Validate context has required fields
    if (!context.operation || !context.capability) {
      throw new Error(
        'Invalid execution context: operation and capability required'
      )
    }

    // TODO Phase 3: Add rate limiting per user
    // TODO Phase 3: Add quota checks
    // TODO Phase 3: Add cost limits
  }

  /**
   * Log execution
   * TODO: Store in Neo4j or dedicated logging service in Phase 3
   */
  private async logExecution(
    context: ExecutionContext,
    result: ExecutionResult
  ): Promise<void> {
    // For now, log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[LLM Execution]', {
        operation: context.operation,
        capability: context.capability,
        userId: context.userId,
        provider: result.provider,
        duration: `${result.duration}ms`,
        success: result.success,
        ...(result.error && { error: result.error }),
      })
    }

    // TODO Phase 3: Store in Neo4j
    // CREATE (log:ExecutionLog {
    //   operation: $operation,
    //   userId: $userId,
    //   provider: $provider,
    //   duration: $duration,
    //   success: $success,
    //   timestamp: datetime()
    // })
    // MATCH (user:Person {id: $userId})
    // CREATE (log)-[:EXECUTED_BY]->(user)
  }
}

/**
 * Convenience wrapper for simple operations
 *
 * @example
 * ```typescript
 * const result = await executeLLMOperation(
 *   provider,
 *   'person-enrichment',
 *   async (p) => await p.chat(messages),
 *   'user_123'
 * )
 * ```
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
