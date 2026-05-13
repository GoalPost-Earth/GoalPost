'use client'

import { type FC } from 'react'
import { cn } from '@/lib/utils'
import { useFocalEntity } from '@/contexts'
import { focalToOntologyNodeId, ONTOLOGY_NODES } from './ontology-data'

/**
 * GoalPost-styled "spatial" graph view. Phase 1: renders the ontology types
 * as a constellation of colored chips, with the focal entity's type
 * highlighted and others dimmed. Real-data spatial layout (field bubbles
 * around the focal Space) is the seam the next iteration plugs into.
 */
export const SpatialView: FC = () => {
  const { focalEntity } = useFocalEntity()
  const highlightedId = focalToOntologyNodeId(focalEntity?.type)

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[20%] left-[15%] w-[420px] h-[420px] rounded-full blur-[120px] animate-blob"
          style={{
            backgroundColor:
              'color-mix(in srgb, var(--gp-primary) 12%, transparent)',
          }}
        />
        <div
          className="absolute bottom-[15%] right-[20%] w-[360px] h-[360px] rounded-full blur-[100px] animate-blob [animation-delay:2s]"
          style={{
            backgroundColor:
              'color-mix(in srgb, var(--gp-accent-glow) 12%, transparent)',
          }}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
        <div className="mb-10 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
            Spatial View
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
            GoalPost Ontology
          </h2>
          <p className="mt-1 text-sm text-white/55 max-w-md">
            Pulse-first, context-aware data model. Switch to{' '}
            <span className="text-white/80">Bloom</span> for raw graph
            exploration.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 max-w-3xl">
          {ONTOLOGY_NODES.map((node) => {
            const isHighlighted = highlightedId === node.id
            const dimmed = highlightedId !== null && !isHighlighted
            return (
              <div
                key={node.id}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-4 py-2.5 backdrop-blur-md transition-all duration-300',
                  isHighlighted
                    ? 'border-white/40 bg-white/15 shadow-[0_0_30px_rgba(255,255,255,0.25)] scale-110'
                    : dimmed
                      ? 'border-white/5 bg-white/[0.02] opacity-40'
                      : 'border-white/10 bg-white/5'
                )}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: node.color as string }}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    'text-sm font-semibold tracking-wide',
                    isHighlighted ? 'text-white' : 'text-white/75'
                  )}
                >
                  {node.caption}
                </span>
              </div>
            )
          })}
        </div>

        {focalEntity && (
          <div className="mt-10 text-center text-xs text-white/45">
            Highlighting:{' '}
            <span className="font-semibold text-white/80">
              {focalEntity.label || focalEntity.type}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
