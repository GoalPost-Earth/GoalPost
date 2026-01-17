'use client'

import { useState } from 'react'
import { ResonanceNode } from '@/components/ui/resonance-node'
import { PulseNode } from '@/components/ui/pulse-node'
import { ResonanceConnections } from '@/components/ui/resonance-connections'
import { ResonancePanel } from '@/components/ui/resonance-panel'

// Mock resonance data - would come from API/database
const resonancesData = [
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
  const expandedResonance = resonancesData.find((r) => r.id === expandedId)

  return (
    <main className="relative w-full h-screen overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors">
      {/* Radial gradient overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(19,164,236,0.05),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(19,164,236,0.08),transparent_70%)]" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_top_right,rgba(19,164,236,0.03),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top_right,rgba(19,164,236,0.05),transparent_60%)]" />

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-30 dark:opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(100, 116, 139, 0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* SVG Connection Lines - only for expanded resonance */}
      {expandedResonance && (
        <ResonanceConnections
          isActive={true}
          lines={expandedResonance.connections}
        />
      )}

      {/* Canvas Container */}
      <div className="relative w-full h-full">
        {/* All Resonance Nodes */}
        {resonancesData.map((resonance) => (
          <div key={resonance.id}>
            {/* Resonance Node */}
            <ResonanceNode
              id={resonance.id}
              icon={resonance.icon}
              label={resonance.label}
              description="Resonance Pattern"
              isActive={expandedId === resonance.id}
              position={resonance.position}
              onClick={() => {
                if (expandedId === resonance.id) {
                  // Toggle off
                  setExpandedId(null)
                  setIsPanelOpen(false)
                } else {
                  // Switch to new resonance
                  setExpandedId(resonance.id)
                  setIsPanelOpen(true)
                }
              }}
            />

            {/* Connected Pulse Nodes - only when expanded */}
            {expandedId === resonance.id &&
              resonance.connectedPulses.map((pulse) => (
                <PulseNode
                  key={pulse.id}
                  icon={pulse.icon}
                  label={pulse.label}
                  type={pulse.type}
                  position={
                    pulse.position.top && pulse.position.left
                      ? {
                          top: pulse.position.top,
                          left: pulse.position.left,
                        }
                      : undefined
                  }
                  animation="float"
                  onClick={() => console.log('Pulse clicked:', pulse.label)}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                />
              ))}
          </div>
        ))}
      </div>

      {/* Resonance Detail Panel - shows for expanded resonance */}
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
    </main>
  )
}
