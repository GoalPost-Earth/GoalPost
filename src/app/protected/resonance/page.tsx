'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { GenericCanvas } from '@/components/canvas/generic-canvas'
import { DraggableResonanceNode } from '@/components/canvas/draggable-resonance-node'
import { DraggablePulseNode } from '@/components/canvas/draggable-pulse-node'
import {
  ResonanceConnections,
  type ConnectionLine,
} from '@/components/ui/resonance-connections'
import { ResonancePanel } from '@/components/ui/resonance-panel'

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

// Mock resonance data - would come from API/database
const resonancesData: ResonanceDefinition[] = [
  {
    id: 'ecological-reciprocity',
    label: 'Ecological Reciprocity',
    description:
      'A pattern of mutual care and interdependence between human communities and natural ecosystems, emphasizing regenerative practices and sacred relationships with the land.',
    icon: 'eco',
    pulseCount: 4,
    strength: 87,
    position: { top: '25%', left: '25%' },
    connectedPulses: [
      {
        id: 'pulse-1',
        label: 'Water Systems',
        type: 'resource' as const,
        icon: 'water_drop',
        description:
          'We need to listen to what the river is telling us before we build.',
        connections: 3,
        author: 'Sarah',
        relevance: 98,
        position: { top: '10%', left: '10%' },
      },
      {
        id: 'pulse-2',
        label: 'Solar Cycle',
        type: 'story' as const,
        icon: 'auto_stories',
        description:
          'Starting a seed library for heirloom vegetables next month.',
        connections: 5,
        author: 'Mike',
        relevance: 92,
        position: { top: '5%', left: '35%' },
      },
      {
        id: 'pulse-3',
        label: 'Community Garden',
        type: 'goal' as const,
        icon: 'flag',
        description:
          'The soil quality in the north sector is degrading rapidly.',
        connections: 8,
        author: 'Alex',
        relevance: 89,
        position: { top: '40%', left: '5%' },
      },
      {
        id: 'pulse-4',
        label: 'Seed Library',
        type: 'resource' as const,
        icon: 'local_library',
        description:
          'Preserving heirloom seeds and indigenous knowledge about plant cultivation.',
        connections: 4,
        author: 'Jordan',
        relevance: 85,
        position: { top: '35%', left: '35%' },
      },
    ],
    connections: [
      {
        id: 'line-1',
        x1: '25%',
        y1: '25%',
        x2: '10%',
        y2: '10%',
        dashArray: '10, 10',
        duration: 3,
      },
      {
        id: 'line-2',
        x1: '25%',
        y1: '25%',
        x2: '35%',
        y2: '5%',
        dashArray: '15, 10',
        duration: 4,
      },
      {
        id: 'line-3',
        x1: '25%',
        y1: '25%',
        x2: '5%',
        y2: '40%',
        dashArray: '8, 12',
        duration: 3.5,
      },
      {
        id: 'line-4',
        x1: '25%',
        y1: '25%',
        x2: '35%',
        y2: '35%',
        dashArray: '12, 12',
        duration: 5,
      },
    ],
  },
  {
    id: 'knowledge-commons',
    label: 'Knowledge Commons',
    description:
      'Open sharing of wisdom, expertise, and learning resources across communities, breaking silos and creating collective intelligence.',
    icon: 'school',
    pulseCount: 3,
    strength: 72,
    position: { top: '25%', left: '75%' },
    connectedPulses: [
      {
        id: 'pulse-5',
        label: 'Skill Sharing',
        type: 'resource' as const,
        icon: 'psychology',
        description:
          'Exchange of practical skills and expertise across communities.',
        connections: 6,
        author: 'Casey',
        relevance: 88,
        position: { top: '10%', left: '60%' },
      },
      {
        id: 'pulse-6',
        label: 'Open Research',
        type: 'goal' as const,
        icon: 'science',
        description:
          'Collaborative research and open-source knowledge development.',
        connections: 7,
        author: 'Taylor',
        relevance: 91,
        position: { top: '5%', left: '85%' },
      },
      {
        id: 'pulse-7',
        label: 'Learning Circles',
        type: 'story' as const,
        icon: 'groups',
        description: 'Peer-to-peer learning groups and knowledge synthesis.',
        connections: 5,
        author: 'Morgan',
        relevance: 86,
        position: { top: '35%', left: '80%' },
      },
    ],
    connections: [
      {
        id: 'line-5',
        x1: '75%',
        y1: '25%',
        x2: '60%',
        y2: '10%',
        dashArray: '10, 10',
        duration: 3,
      },
      {
        id: 'line-6',
        x1: '75%',
        y1: '25%',
        x2: '85%',
        y2: '5%',
        dashArray: '15, 10',
        duration: 4,
      },
      {
        id: 'line-7',
        x1: '75%',
        y1: '25%',
        x2: '80%',
        y2: '35%',
        dashArray: '12, 12',
        duration: 5,
      },
    ],
  },
  {
    id: 'care-networks',
    label: 'Care Networks',
    description:
      'Systems of mutual aid, support, and care that prioritize connection, interdependence, and collective wellbeing.',
    icon: 'favorite',
    pulseCount: 5,
    strength: 91,
    position: { top: '75%', left: '25%' },
    connectedPulses: [
      {
        id: 'pulse-8',
        label: 'Healing Circles',
        type: 'story' as const,
        icon: 'spa',
        description: 'Spaces for emotional and spiritual healing and support.',
        connections: 8,
        author: 'River',
        relevance: 94,
        position: { top: '60%', left: '10%' },
      },
      {
        id: 'pulse-9',
        label: 'Community Support',
        type: 'goal' as const,
        icon: 'handshake',
        description:
          'Organized systems for supporting vulnerable community members.',
        connections: 10,
        author: 'Jamie',
        relevance: 96,
        position: { top: '65%', left: '35%' },
      },
      {
        id: 'pulse-10',
        label: 'Care Practices',
        type: 'resource' as const,
        icon: 'volunteer_activism',
        description: 'Methodologies and practices for sustainable care work.',
        connections: 9,
        author: 'Alex',
        relevance: 90,
        position: { top: '85%', left: '20%' },
      },
    ],
    connections: [
      {
        id: 'line-8',
        x1: '25%',
        y1: '75%',
        x2: '10%',
        y2: '60%',
        dashArray: '10, 10',
        duration: 3,
      },
      {
        id: 'line-9',
        x1: '25%',
        y1: '75%',
        x2: '35%',
        y2: '65%',
        dashArray: '15, 10',
        duration: 4,
      },
      {
        id: 'line-10',
        x1: '25%',
        y1: '75%',
        x2: '20%',
        y2: '85%',
        dashArray: '12, 12',
        duration: 5,
      },
    ],
  },
  {
    id: 'emergent-futures',
    label: 'Emergent Futures',
    description:
      'Imaginative visions and co-creative explorations of alternative futures, rooted in possibility and collective aspiration.',
    icon: 'lightbulb',
    pulseCount: 4,
    strength: 78,
    position: { top: '75%', left: '75%' },
    connectedPulses: [
      {
        id: 'pulse-11',
        label: 'Speculative Design',
        type: 'goal' as const,
        icon: 'palette',
        description:
          'Exploring future possibilities through creative design practices.',
        connections: 6,
        author: 'Phoenix',
        relevance: 87,
        position: { top: '60%', left: '85%' },
      },
      {
        id: 'pulse-12',
        label: 'Visionary Stories',
        type: 'story' as const,
        icon: 'auto_stories',
        description: 'Narratives of transformed futures and new ways of being.',
        connections: 5,
        author: 'Sam',
        relevance: 84,
        position: { top: '70%', left: '60%' },
      },
      {
        id: 'pulse-13',
        label: 'Collaborative Tools',
        type: 'resource' as const,
        icon: 'build',
        description:
          'Technologies and methods for co-creating alternative futures.',
        connections: 7,
        author: 'Blake',
        relevance: 93,
        position: { top: '85%', left: '80%' },
      },
    ],
    connections: [
      {
        id: 'line-11',
        x1: '75%',
        y1: '75%',
        x2: '85%',
        y2: '60%',
        dashArray: '10, 10',
        duration: 3,
      },
      {
        id: 'line-12',
        x1: '75%',
        y1: '75%',
        x2: '60%',
        y2: '70%',
        dashArray: '15, 10',
        duration: 4,
      },
      {
        id: 'line-13',
        x1: '75%',
        y1: '75%',
        x2: '80%',
        y2: '85%',
        dashArray: '12, 12',
        duration: 5,
      },
    ],
  },
]

export default function ResonancePage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [resonances, setResonances] = useState<PositionedResonance[]>([])
  const [currentScale, setCurrentScale] = useState(1)
  const [canvasSize, setCanvasSize] = useState({
    width: 1200 * 3,
    height: 1200 * 3,
  })

  const toBandPx = useCallback((value: string, total: number, band = 0.7) => {
    const numeric = parseFloat(value)
    if (Number.isNaN(numeric)) return total / 2
    const clamped = Math.min(Math.max(numeric, 0), 100)
    const usable = total * band
    const margin = (total - usable) / 2
    return (clamped / 100) * usable + margin
  }, [])

  const buildPositions = useCallback(
    (width: number, height: number) =>
      resonancesData.map<PositionedResonance>((resonance) => ({
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
    setResonances(buildPositions(width, height))
  }, [buildPositions])

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

  const handleToggleResonance = (resonanceId: string) => {
    setExpandedId((prev) => {
      if (prev === resonanceId) {
        setIsPanelOpen(false)
        return null
      }
      setIsPanelOpen(true)
      return resonanceId
    })
  }

  return (
    <>
      <GenericCanvas
        canvasScale={2}
        onScaleChange={setCurrentScale}
        enableZoomControls
        showBackgroundDecor
      >
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
      </GenericCanvas>

      {expandedResonance && (
        <ResonancePanel
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          resonance={{
            label: expandedResonance.label,
            description: expandedResonance.description,
            pulseCount: expandedResonance.pulseCount,
            strength: expandedResonance.strength,
          }}
          pulses={expandedResonance.connectedPulses}
        />
      )}
    </>
  )
}
