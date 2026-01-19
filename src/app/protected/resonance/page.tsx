'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLazyQuery, useQuery } from '@apollo/client/react'
import { GenericCanvas } from '@/components/canvas/generic-canvas'
import { DraggableResonanceNode } from '@/components/canvas/draggable-resonance-node'
import { DraggablePulseNode } from '@/components/canvas/draggable-pulse-node'
import {
  ResonanceConnections,
  type ConnectionLine,
} from '@/components/ui/resonance-connections'
import {
  ResonancePanel,
  type ResonanceLink,
} from '@/components/ui/resonance-panel'
import {
  GET_RESONANCE_WITH_LINKS,
  GET_ALL_RESONANCES,
} from '@/app/graphql/queries'

interface PulseWithPosition {
  id: string
  label: string
  type: 'goal' | 'resource' | 'story'
  icon: string
  description: string
  connections: number
  author: string
  relevance: number
  position: { top: string; left: string }
}

interface ResonanceDefinition {
  id: string
  label: string
  description: string
  icon: string
  pulseCount: number
  strength: number
  position: { top: string; left: string }
  connectedPulses: PulseWithPosition[]
  connections: ConnectionLine[]
}

interface PositionedPulse extends PulseWithPosition {
  x: number
  y: number
}

interface PositionedResonance extends ResonanceDefinition {
  x: number
  y: number
  connectedPulses: PositionedPulse[]
}

export default function ResonancePage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [resonances, setResonances] = useState<PositionedResonance[]>([])
  const [currentScale, setCurrentScale] = useState(1)
  const [canvasSize, setCanvasSize] = useState({
    width: 1200 * 3,
    height: 1200 * 3,
  })

  // Fetch all resonances
  const { data: allResonancesData, loading: allResonancesLoading } =
    useQuery(GET_ALL_RESONANCES)

  // Lazy query for resonance details
  const [
    fetchResonanceDetails,
    { data: resonanceData, loading: resonanceLoading },
  ] = useLazyQuery(GET_RESONANCE_WITH_LINKS)

  // Normalize resonance data from GraphQL
  const selectedResonanceDetails = useMemo(() => {
    if (!resonanceData?.fieldResonances?.[0] || !resonanceData?.resonanceLinks)
      return null

    const resonance = resonanceData.fieldResonances[0]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const links = resonanceData.resonanceLinks.map((link: any) => ({
      id: link.id,
      confidence: link.confidence,
      evidence: link.evidence,
      createdAt: link.createdAt,
      source: {
        id: link.source.id,
        content: link.source.content,
        __typename: link.source.__typename,
      },
      target: {
        id: link.target.id,
        content: link.target.content,
        __typename: link.target.__typename,
      },
    })) as ResonanceLink[]

    return {
      resonance,
      links,
    }
  }, [resonanceData])

  // Transform fetched resonances to display format
  const fetchedResonances = useMemo(() => {
    if (!allResonancesData?.fieldResonances) return []

    const icons: Record<string, string> = {
      'ecological-reciprocity': 'eco',
      'knowledge-commons': 'school',
      'care-networks': 'favorite',
      'emergent-futures': 'lightbulb',
    }

    // Distribute resonances around the canvas in a grid
    const resonancesPerSide = 2
    const positions: Array<{ left: string; top: string }> = []

    for (let i = 0; i < resonancesPerSide; i++) {
      for (let j = 0; j < resonancesPerSide; j++) {
        positions.push({
          left: `${25 + i * 50}%`,
          top: `${25 + j * 50}%`,
        })
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return allResonancesData.fieldResonances.map((res: any, idx: number) => ({
      id: res.id,
      label: res.label,
      description: res.description || '',
      icon: icons[res.id] || 'psychology',
      pulseCount: 0,
      strength: 75 + Math.random() * 20, // Mock strength
      position: positions[idx % positions.length],
      connectedPulses: [] as PulseWithPosition[],
      connections: [] as ConnectionLine[],
    }))
  }, [allResonancesData])

  const toBandPx = useCallback((value: string, total: number, band = 0.7) => {
    const numeric = parseFloat(value)
    if (Number.isNaN(numeric)) return total / 2
    const clamped = Math.min(Math.max(numeric, 0), 100)
    const usable = total * band
    const margin = (total - usable) / 2
    return (clamped / 100) * usable + margin
  }, [])

  const buildPositions = useCallback(
    (width: number, height: number, resData: typeof fetchedResonances) =>
      resData.map<PositionedResonance>((resonance) => ({
        ...resonance,
        x: toBandPx(resonance.position.left, width, 0.6),
        y: toBandPx(resonance.position.top, height, 0.6),
        connectedPulses: resonance.connectedPulses.map((pulse) => ({
          ...pulse,
          x: toBandPx(pulse.position.left, width, 0.5),
          y: toBandPx(pulse.position.top, height, 0.5),
        })),
      })),
    [toBandPx]
  )

  useEffect(() => {
    const width = (window.innerWidth || 1200) * 3
    const height = (window.innerHeight || 1200) * 3
    setCanvasSize({ width, height })
    setResonances(buildPositions(width, height, fetchedResonances))
  }, [buildPositions, fetchedResonances])

  const expandedResonance = useMemo(
    () => resonances.find((r) => r.id === expandedId) || null,
    [expandedId, resonances]
  )

  const buildConnectionLines = useCallback(
    (resonance: PositionedResonance) =>
      resonance.connections.map((line, idx) => {
        const targetPulse = resonance.connectedPulses[idx]
        const fallbackX2 = toBandPx(line.x2, canvasSize.width, 0.6)
        const fallbackY2 = toBandPx(line.y2, canvasSize.height, 0.6)

        return {
          ...line,
          x1: resonance.x.toString(),
          y1: resonance.y.toString(),
          x2: (targetPulse?.x ?? fallbackX2).toString(),
          y2: (targetPulse?.y ?? fallbackY2).toString(),
        }
      }),
    [canvasSize.height, canvasSize.width, toBandPx]
  )

  // Fetch resonance details when expandedId changes
  useEffect(() => {
    if (expandedId) {
      setIsPanelOpen(true)
      fetchResonanceDetails({ variables: { resonanceId: expandedId } })
    } else {
      setIsPanelOpen(false)
    }
  }, [expandedId, fetchResonanceDetails])

  // Update resonance with connected pulses when links are fetched
  useEffect(() => {
    if (!selectedResonanceDetails || !expandedId) return

    const { links } = selectedResonanceDetails

    // Extract unique pulses from links (both source and target)
    const pulseMap = new Map<string, PulseWithPosition>()

    links.forEach((link) => {
      // Helper to extract pulse type from __typename
      const getPulseType = (
        typename: string
      ): 'goal' | 'resource' | 'story' => {
        if (typename === 'GoalPulse') return 'goal'
        if (typename === 'ResourcePulse') return 'resource'
        return 'story'
      }

      // Helper to get icon for pulse type
      const getPulseIcon = (typename: string): string => {
        if (typename === 'GoalPulse') return 'flag'
        if (typename === 'ResourcePulse') return 'diamond'
        return 'auto_stories'
      }

      // Add source pulse if not already in map
      if (!pulseMap.has(link.source.id)) {
        const sourceContent = link.source.content || 'Untitled pulse'
        pulseMap.set(link.source.id, {
          id: link.source.id,
          label:
            sourceContent.length > 40
              ? sourceContent.substring(0, 40) + '...'
              : sourceContent,
          type: getPulseType(link.source.__typename),
          icon: getPulseIcon(link.source.__typename),
          description: sourceContent,
          connections: 0,
          author: 'Unknown',
          relevance: Math.round(link.confidence * 100),
          position: { top: '0%', left: '0%' }, // Will be positioned in a circle
        })
      }

      // Add target pulse if not already in map
      if (!pulseMap.has(link.target.id)) {
        const targetContent = link.target.content || 'Untitled pulse'
        pulseMap.set(link.target.id, {
          id: link.target.id,
          label:
            targetContent.length > 40
              ? targetContent.substring(0, 40) + '...'
              : targetContent,
          type: getPulseType(link.target.__typename),
          icon: getPulseIcon(link.target.__typename),
          description: targetContent,
          connections: 0,
          author: 'Unknown',
          relevance: Math.round(link.confidence * 100),
          position: { top: '0%', left: '0%' },
        })
      }
    })

    const pulses = Array.from(pulseMap.values())

    // Position pulses in a circle around the resonance node
    const radius = 20 // Percentage offset from resonance center

    // Find resonance position from fetchedResonances to avoid dependency on resonances state
    const resonanceData = fetchedResonances.find((r) => r.id === expandedId)
    if (!resonanceData) return

    pulses.forEach((pulse, idx) => {
      const angle = (idx / pulses.length) * 2 * Math.PI
      const offsetX = Math.cos(angle) * radius
      const offsetY = Math.sin(angle) * radius

      const centerX = parseFloat(resonanceData.position.left)
      const centerY = parseFloat(resonanceData.position.top)
      pulse.position = {
        left: `${centerX + offsetX}%`,
        top: `${centerY + offsetY}%`,
      }
    })

    // Update resonances state with connected pulses
    setResonances((prev) =>
      prev.map((r) => {
        if (r.id !== expandedId) return r

        // Convert pulses to PositionedPulse with x, y coordinates
        const positionedPulses = pulses.map((pulse) => ({
          ...pulse,
          x: toBandPx(pulse.position.left, canvasSize.width, 0.5),
          y: toBandPx(pulse.position.top, canvasSize.height, 0.5),
        }))

        // Create connection lines
        const connections = positionedPulses.map((pulse, idx) => ({
          id: `line-${pulse.id}`,
          x1: r.position.left,
          y1: r.position.top,
          x2: pulse.position.left,
          y2: pulse.position.top,
          dashArray: '10, 10',
          duration: 3 + idx * 0.2,
        }))

        return {
          ...r,
          connectedPulses: positionedPulses,
          connections,
        }
      })
    )
  }, [
    selectedResonanceDetails,
    expandedId,
    fetchedResonances,
    toBandPx,
    canvasSize,
  ])

  const handleToggleResonance = (resonanceId: string) => {
    setExpandedId((prev) => (prev === resonanceId ? null : resonanceId))
  }

  return (
    <>
      <GenericCanvas
        canvasScale={2}
        onScaleChange={setCurrentScale}
        enableZoomControls
        showBackgroundDecor
      >
        {!allResonancesLoading && resonances.length > 0 && (
          <div className="relative w-full h-full">
            {expandedResonance && (
              <ResonanceConnections
                isActive
                lines={buildConnectionLines(expandedResonance)}
              />
            )}

            {resonances.map((resonance) => (
              <div key={resonance.id}>
                <DraggableResonanceNode
                  id={resonance.id}
                  icon={resonance.icon}
                  label={resonance.label}
                  description={resonance.description}
                  isActive={expandedId === resonance.id}
                  canvasPosition={{ x: resonance.x, y: resonance.y }}
                  scale={currentScale}
                  onPositionChange={(x, y) =>
                    setResonances((prev) =>
                      prev.map((r) => {
                        if (r.id !== resonance.id) return r

                        const deltaX = x - r.x
                        const deltaY = y - r.y

                        return {
                          ...r,
                          x,
                          y,
                          connectedPulses: r.connectedPulses.map((p) => ({
                            ...p,
                            x: p.x + deltaX,
                            y: p.y + deltaY,
                          })),
                        }
                      })
                    )
                  }
                  onClick={() => handleToggleResonance(resonance.id)}
                />

                {expandedId === resonance.id &&
                  resonance.connectedPulses.map((pulse) => (
                    <DraggablePulseNode
                      key={pulse.id}
                      icon={pulse.icon}
                      label={pulse.label}
                      type={pulse.type}
                      animation="float"
                      canvasPosition={{ x: pulse.x, y: pulse.y }}
                      scale={currentScale}
                      onPositionChange={(x, y) =>
                        setResonances((prev) =>
                          prev.map((r) =>
                            r.id === resonance.id
                              ? {
                                  ...r,
                                  connectedPulses: r.connectedPulses.map((p) =>
                                    p.id === pulse.id ? { ...p, x, y } : p
                                  ),
                                }
                              : r
                          )
                        )
                      }
                      onClick={() => console.log('Pulse clicked:', pulse.label)}
                    />
                  ))}
              </div>
            ))}
          </div>
        )}

        {allResonancesLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-gp-surface/50 dark:bg-gp-surface-dark/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <span className="material-symbols-outlined text-5xl text-gp-primary animate-spin">
                hourglass_bottom
              </span>
              <p className="text-sm font-medium text-gp-ink-muted dark:text-gp-ink-soft">
                Loading resonances...
              </p>
            </div>
          </div>
        )}

        {!allResonancesLoading && resonances.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gp-ink-muted dark:text-gp-ink-soft mb-2">
                No resonances discovered yet
              </p>
              <p className="text-sm text-gp-ink-soft dark:text-white/40">
                Create pulses to generate resonance patterns
              </p>
            </div>
          </div>
        )}
      </GenericCanvas>

      {expandedResonance && selectedResonanceDetails && (
        <ResonancePanel
          isOpen={isPanelOpen}
          isLoading={resonanceLoading}
          onClose={() => setIsPanelOpen(false)}
          resonance={{
            id: selectedResonanceDetails.resonance.id,
            label:
              selectedResonanceDetails.resonance.label ||
              expandedResonance.label,
            description: selectedResonanceDetails.resonance.description,
            strength: expandedResonance.strength,
          }}
          links={selectedResonanceDetails.links}
        />
      )}
    </>
  )
}
