/**
 * Orchestrator for the AI-driven Cypher → Bloom flow.
 *
 *   generate → validate → execute → return NVL payload
 *
 * On validation failure, the validator's reason is fed back to the
 * generator as a correction hint and one retry is attempted. After two
 * total attempts the orchestrator gives up and returns a friendly,
 * name-only summary suitable for the chat surface (no ids, no raw
 * Cypher — per kb/07-ai-assistant-ux.md Rule 1).
 */

import { driver } from '@/lib/neo4j/driver'
import { generateCypher, type GeneratorInput } from './generate'
import { validateCypher } from './validate'
import { executeForBloom } from './execute'
import type { BloomQueryResult } from './types'

export type { BloomQueryResult, NVLNode, NVLRelationship } from './types'

export interface RunForBloomArgs {
  intent: string
  userId: string
  activeSpaceId: string | null
  activeSpaceName: string | null
  activeSpaceType: 'MeSpace' | 'WeSpace' | null
  activeFieldContextId: string | null
  activeFieldContextTitle: string | null
  focalEntity: { type: string; id: string; label?: string | null } | null
  /**
   * Entities already rendered on the canvas. Forwarded into the
   * generator prompt so the LLM can prefer an id from this list over
   * a keyword match — fixes the "show me JD's Tech Lab" failure where
   * the WeSpace is on screen but the generator's `CONTAINS toLower(…)`
   * misses on apostrophe / case mismatches.
   */
  canvasVisibleEntities?: Array<{
    id: string
    name: string
    type: string
    source: string
  }>
}

const MAX_ATTEMPTS = 2

export async function generateAndRunForBloom(
  args: RunForBloomArgs
): Promise<BloomQueryResult> {
  let correction: string | null = null
  let lastReason: string | null = null

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const input: GeneratorInput = {
      intent: args.intent,
      activeSpaceId: args.activeSpaceId,
      activeSpaceName: args.activeSpaceName,
      activeSpaceType: args.activeSpaceType,
      activeFieldContextId: args.activeFieldContextId,
      activeFieldContextTitle: args.activeFieldContextTitle,
      focalEntity: args.focalEntity,
      canvasVisibleEntities: args.canvasVisibleEntities ?? [],
      correction,
      userId: args.userId,
    }

    let generated
    try {
      generated = await generateCypher(input)
    } catch (error) {
      lastReason = error instanceof Error ? error.message : 'Generation failed.'
      break
    }

    console.log('[cypher-generator] Attempt', attempt, {
      rationale: generated.rationale,
      cypher: generated.cypher,
    })

    const session = driver.session()
    let validation
    try {
      validation = await validateCypher(generated.cypher, session)
    } finally {
      await session.close()
    }

    if (!validation.ok) {
      console.warn('[cypher-generator] Validation failed:', validation.reason)
      lastReason = validation.reason
      correction = validation.reason
      continue
    }

    const execResult = await executeForBloom({
      cypher: generated.cypher,
      userId: args.userId,
    })

    if (!execResult.ok) {
      console.warn('[cypher-generator] Execution failed:', execResult.reason)
      lastReason = execResult.reason
      correction = `Execution failed: ${execResult.reason}`
      continue
    }

    if (execResult.nodes.length === 0) {
      return {
        found: false,
        summary:
          'I could not find any matching graph data you have access to for that request.',
        nodes: [],
        relationships: [],
      }
    }

    return {
      found: true,
      summary: generated.rationale,
      nodes: execResult.nodes,
      relationships: execResult.relationships,
    }
  }

  return {
    found: false,
    summary: lastReason
      ? `I was not able to build a safe graph query for that request (${lastReason}).`
      : 'I was not able to build a safe graph query for that request.',
    nodes: [],
    relationships: [],
  }
}
