'use client'

import { useMemo } from 'react'
import { DraggableResonanceNode } from './draggable-resonance-node'

export interface PulsePosition {
  pulseId: string
  x: number
  y: number
}

export interface ResonanceLink {
  id: string
  label: string
  confidence: number
  description?: string
  source: Array<{ id: string }>
  target: Array<{ id: string }>
}

export interface ResonanceLinksVisualizationProps {
  pulsePositions: PulsePosition[]
  resonanceLinks: ResonanceLink[]
  resonanceNodePositions: Map<string, { x: number; y: number }>
  canvasWidth: number
  canvasHeight: number
  expandedLinks?: Set<string>
  scale?: number
  onResonanceNodeClick?: (linkId: string) => void
  onResonanceNodeDrag?: (
    linkId: string,
    newX: number,
    newY: number,
    connectedPulseIds: string[]
  ) => void
  onResonanceNodeEdit?: (linkId: string) => void
}

/**
 * Renders resonance links as interactive nodes positioned at midpoints
 * SVG connections appear only when a resonance node is clicked/active
 */
export function ResonanceLinksVisualization({
  pulsePositions,
  resonanceLinks,
  resonanceNodePositions,
  canvasWidth,
  canvasHeight,
  expandedLinks = new Set(),
  scale = 1,
  onResonanceNodeClick,
  onResonanceNodeDrag,
  onResonanceNodeEdit,
}: ResonanceLinksVisualizationProps) {
  // Create position map for O(1) lookups
  const positionMap = useMemo(
    () => new Map(pulsePositions.map((p) => [p.pulseId, { x: p.x, y: p.y }])),
    [pulsePositions]
  )

  // Filter valid links (both source and target exist)
  const validLinks = useMemo(
    () =>
      resonanceLinks.filter((link) => {
        const sourceId = link.source?.[0]?.id
        const targetId = link.target?.[0]?.id
        return (
          sourceId &&
          targetId &&
          positionMap.has(sourceId) &&
          positionMap.has(targetId)
        )
      }),
    [resonanceLinks, positionMap]
  )

  // Memoize resonance positions for quick lookup
  const resonancePositionsMap = useMemo(
    () => resonanceNodePositions,
    [resonanceNodePositions]
  )

  // Get color based on confidence
  const getLineColor = (confidence: number) => {
    if (confidence >= 0.8) return 'rgba(59, 130, 246, 0.6)' // Blue - high confidence
    if (confidence >= 0.6) return 'rgba(34, 197, 94, 0.5)' // Green - medium confidence
    return 'rgba(168, 85, 247, 0.4)' // Purple - low confidence
  }

  const getLineStrokeDasharray = (label: string) => {
    // Different line styles based on relationship type
    if (label.toLowerCase().includes('conflict')) return '5,5'
    if (label.toLowerCase().includes('support')) return '0'
    if (label.toLowerCase().includes('complement')) return '8,4'
    return '0'
  }

  // Get icon based on resonance label
  const getResonanceIcon = (label: string): string => {
    const lower = label.toLowerCase()
    if (lower.includes('support')) return 'trending_up'
    if (lower.includes('conflict')) return 'warning'
    if (lower.includes('complement')) return 'auto_awesome'
    return 'link'
  }

  return (
    <>
      {/* SVG layer for connection lines (only shown when expanded) */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={canvasWidth}
        height={canvasHeight}
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Arrow marker for directed lines */}
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="rgba(99, 102, 241, 0.4)" />
          </marker>

          {/* Glow effect for high-confidence links */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Render connection lines only for expanded links */}
        <g className="resonance-lines">
          {validLinks.map((link) => {
            // Only render if link is expanded
            if (!expandedLinks.has(link.id)) return null

            const sourceId = link.source?.[0]?.id
            const targetId = link.target?.[0]?.id

            if (!sourceId || !targetId) return null

            const sourcePos = positionMap.get(sourceId)
            const targetPos = positionMap.get(targetId)

            if (!sourcePos || !targetPos) return null

            // Use stored resonance position or fallback to midpoint
            const resonancePos = resonancePositionsMap.get(link.id)
            const midX = resonancePos?.x ?? (sourcePos.x + targetPos.x) / 2
            const midY = resonancePos?.y ?? (sourcePos.y + targetPos.y) / 2
            const lineColor = getLineColor(link.confidence)
            const strokeDasharray = getLineStrokeDasharray(link.label)

            return (
              <g key={`line-${link.id}`}>
                {/* Connection line from source to resonance node */}
                <line
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={midX}
                  y2={midY}
                  stroke={lineColor}
                  strokeWidth="2.5"
                  strokeDasharray={strokeDasharray}
                  filter="url(#glow)"
                  className="transition-opacity duration-300 hover:opacity-100"
                  style={{ opacity: 0.7 }}
                />

                {/* Connection line from resonance node to target */}
                <line
                  x1={midX}
                  y1={midY}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  stroke={lineColor}
                  strokeWidth="2.5"
                  strokeDasharray={strokeDasharray}
                  markerEnd="url(#arrowhead)"
                  filter="url(#glow)"
                  className="transition-opacity duration-300 hover:opacity-100"
                  style={{ opacity: 0.7 }}
                />

                {/* Label background */}
                <rect
                  x={midX - 35}
                  y={midY - 12}
                  width="70"
                  height="20"
                  rx="3"
                  fill="rgba(15, 23, 42, 0.85)"
                  stroke="rgba(148, 163, 184, 0.3)"
                  strokeWidth="0.5"
                />

                {/* Label text */}
                <text
                  x={midX}
                  y={midY + 3}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="500"
                  fill="rgba(226, 232, 240, 0.9)"
                  className="pointer-events-none select-none"
                >
                  {link.label}
                </text>

                {/* Confidence indicator (small dot) */}
                <circle
                  cx={midX + 40}
                  cy={midY - 8}
                  r="2.5"
                  fill={
                    link.confidence >= 0.8
                      ? 'rgba(59, 130, 246, 0.8)'
                      : link.confidence >= 0.6
                        ? 'rgba(34, 197, 94, 0.8)'
                        : 'rgba(168, 85, 247, 0.8)'
                  }
                  className="transition-opacity duration-300"
                />
              </g>
            )
          })}
        </g>
      </svg>

      {/* Render resonance nodes (interactive) */}
      <div className="absolute inset-0 pointer-events-none">
        {validLinks.map((link) => {
          const sourceId = link.source?.[0]?.id
          const targetId = link.target?.[0]?.id

          if (!sourceId || !targetId) return null

          const sourcePos = positionMap.get(sourceId)
          const targetPos = positionMap.get(targetId)

          if (!sourcePos || !targetPos) return null

          // Use stored resonance position or fallback to midpoint
          const resonancePos = resonancePositionsMap.get(link.id)
          const midX = resonancePos?.x ?? (sourcePos.x + targetPos.x) / 2
          const midY = resonancePos?.y ?? (sourcePos.y + targetPos.y) / 2
          const isActive = expandedLinks.has(link.id)

          // Handler for when resonance node is dragged
          const handleResonanceDrag = (newX: number, newY: number) => {
            if (!onResonanceNodeDrag) return

            // Never drag connected pulses - resonance node moves independently
            // Connection lines will still show and update if link is active
            onResonanceNodeDrag(link.id, newX, newY, [])
          }

          return (
            <DraggableResonanceNode
              key={`node-${link.id}`}
              id={link.id}
              icon={getResonanceIcon(link.label)}
              label={link.label}
              description={link.description}
              isActive={isActive}
              canvasPosition={{ x: midX, y: midY }}
              scale={scale}
              onClick={() => onResonanceNodeClick?.(link.id)}
              onEdit={() => onResonanceNodeEdit?.(link.id)}
              onPositionChange={handleResonanceDrag}
            />
          )
        })}
      </div>
    </>
  )
}
