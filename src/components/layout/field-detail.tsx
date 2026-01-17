'use client'

import { PulseNode, type NodeType } from '@/components/ui/pulse-node'
import { cn } from '@/lib/utils'
import { useRef } from 'react'

export interface NodeData {
  id: string
  icon: string
  label: string
  type: NodeType
  position:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'top-center'
    | 'right-center'
  animation: 'float' | 'float-delayed' | 'float-random' | 'pulse-slow'
}

export interface FieldDetailProps {
  fieldTitle: string
  nodes?: NodeData[]
  onNodeClick?: (nodeId: string) => void
  className?: string
}

const defaultNodes: NodeData[] = [
  {
    id: 'expand-api',
    icon: 'flag',
    label: 'Expand API Coverage',
    type: 'goal',
    position: 'top-left',
    animation: 'float',
  },
  {
    id: 'design-tokens',
    icon: 'diamond',
    label: 'Design Tokens',
    type: 'resource',
    position: 'bottom-left',
    animation: 'float-delayed',
  },
  {
    id: 'origin-narrative',
    icon: 'auto_stories',
    label: 'Origin Narrative',
    type: 'story',
    position: 'top-right',
    animation: 'float-random',
  },
  {
    id: 'q3-revenue',
    icon: 'flag',
    label: 'Q3 Revenue',
    type: 'goal',
    position: 'bottom-right',
    animation: 'pulse-slow',
  },
  {
    id: 'raw-dataset',
    icon: 'diamond',
    label: 'Raw Dataset B',
    type: 'resource',
    position: 'top-center',
    animation: 'float',
  },
  {
    id: 'user-journey',
    icon: 'auto_stories',
    label: 'User Journey Map',
    type: 'story',
    position: 'right-center',
    animation: 'float-delayed',
  },
]

export function FieldDetail({
  nodes = defaultNodes,
  onNodeClick,
  className,
}: FieldDetailProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

  return (
    <main
      ref={canvasRef}
      className={cn(
        'relative flex-1 w-full h-full overflow-hidden transition-colors',
        className
      )}
    >
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(19,127,236,0.08),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(19,127,236,0.05),transparent_70%)]" />

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-40 dark:opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(var(--gp-ink-soft) 1px, transparent 1px), radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Ambient particles */}
      <div className="absolute top-[20%] left-[10%] size-1 bg-gp-primary/40 dark:bg-white/20 rounded-full animate-pulse" />
      <div className="absolute top-[80%] left-[20%] size-1.5 bg-gp-primary/30 dark:bg-white/10 rounded-full animate-pulse-slow" />
      <div className="absolute top-[40%] right-[15%] size-1 bg-gp-primary/40 dark:bg-white/20 rounded-full animate-float" />

      {/* Pulse Nodes */}
      <div className="absolute inset-0 overflow-hidden">
        {nodes.map((node) => (
          <PulseNode
            key={node.id}
            icon={node.icon}
            label={node.label}
            type={node.type}
            position={node.position}
            animation={node.animation}
            onClick={() => onNodeClick?.(node.id)}
          />
        ))}
      </div>

      {/* Bottom Action Button */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 group flex flex-col items-center gap-3">
        <button className="cursor-pointer relative flex items-center justify-center size-16 rounded-full glass-panel bg-white/50 dark:bg-glass-bg/30 hover:bg-white/80 dark:hover:bg-glass-bg shadow-lg dark:shadow-none hover:shadow-[0_0_35px_rgba(79,255,203,0.3)] dark:hover:shadow-[0_0_35px_rgba(79,255,203,0.15)] transition-all duration-500 ease-out border border-gp-surface-strong dark:border-white/5 hover:border-gp-accent-glow/40 dark:hover:border-gp-accent-glow/20 backdrop-blur-md group-hover:-translate-y-1">
          <span className="material-symbols-outlined text-3xl text-gp-ink-muted dark:text-gp-ink-soft group-hover:text-gp-accent-glow dark:group-hover:text-gp-accent-glow transition-colors duration-500">
            spa
          </span>
          <div className="absolute inset-0 rounded-full border border-gp-ink-soft dark:border-gp-ink-soft/20 opacity-50 dark:opacity-50 group-hover:opacity-100 dark:group-hover:opacity-100 transition-opacity duration-500" />
        </button>
      </div>
    </main>
  )
}
