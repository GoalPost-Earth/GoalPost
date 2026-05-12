'use client'

import { useEffect, useRef, useState } from 'react'
import { useAssistantState } from '@assistant-ui/react'
import { useFocalEntity } from '@/contexts'
import {
  extractEntitiesFromToolResult,
  type CollectedEntity,
  type PivotEntityType,
} from '@/lib/simulation/entity-collector'
import { isFocalEntityType } from '@/lib/focal-entity/types'

interface ThreadMessagePart {
  type?: string
  result?: unknown
}

interface ThreadMessage {
  role?: string
  parts?: ThreadMessagePart[]
}

/**
 * Accumulate every entity referenced in the current chat thread:
 *
 *   1. Every focal entity the user has navigated to while the panel is open.
 *   2. Every entity returned in a tool-result part of an assistant message.
 *
 * Dedupes by `${type}:${id}` and preserves first-seen order so the footer
 * pivot strip can offer "open the things we talked about, in the order we
 * talked about them."
 */
export function useCollectedEntities(): CollectedEntity[] {
  const { sessionContext } = useFocalEntity()
  const focalEntity = sessionContext.focalEntity

  const messages = useAssistantState(({ thread }) => thread.messages) as
    | unknown as ThreadMessage[] | undefined

  const [entities, setEntities] = useState<CollectedEntity[]>([])
  const seenRef = useRef<Set<string>>(new Set())

  // Capture focal navigation.
  useEffect(() => {
    if (!focalEntity) return
    if (!isFocalEntityType(focalEntity.type)) return
    if (!focalEntity.id || !focalEntity.label) return
    const key = `${focalEntity.type}:${focalEntity.id}`
    if (seenRef.current.has(key)) return
    seenRef.current.add(key)
    setEntities((prev) => [
      ...prev,
      {
        type: focalEntity.type as PivotEntityType,
        id: focalEntity.id,
        name: focalEntity.label!,
      },
    ])
  }, [focalEntity])

  // Capture tool-result entities.
  useEffect(() => {
    if (!messages || messages.length === 0) return
    const additions: CollectedEntity[] = []
    for (const message of messages) {
      if (message.role !== 'assistant') continue
      if (!Array.isArray(message.parts)) continue
      for (const part of message.parts) {
        if (part?.type !== 'tool-result') continue
        const found = extractEntitiesFromToolResult(part.result)
        for (const entity of found) {
          const key = `${entity.type}:${entity.id}`
          if (seenRef.current.has(key)) continue
          seenRef.current.add(key)
          additions.push(entity)
        }
      }
    }
    if (additions.length > 0) {
      setEntities((prev) => [...prev, ...additions])
    }
  }, [messages])

  return entities
}
