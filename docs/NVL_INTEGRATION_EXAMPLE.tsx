/**
 * Example integration of NvlCanvas in a field detail page
 * This shows how to replace GenericPulseCanvas with NvlCanvas
 *
 * Reference: we-space/[id]/fields/[field]/page.tsx (lines 1-150)
 */

'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import type { Node } from '@neo4j-nvl/base'
import { NvlCanvas } from '@/components/canvas/nvl-canvas'
import { PulseNode } from '@/components/ui/pulse-node'
import { PersonNode } from '@/components/ui/person-node'
import {
  createNvlNodes,
  createNvlRelationships,
  renderReactComponentToContainer,
} from '@/lib/nvl-utils'
import type { NodeType } from '@/components/ui/pulse-node'

interface PulseData {
  id: string
  name: string
  type: NodeType
  icon?: string
  [key: string]: unknown
}

interface PersonData {
  id: string
  firstName: string
  lastName: string
  name: string | null
  email?: string | null
  photo?: string | null
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST'
  [key: string]: unknown
}

interface RelationshipData {
  id: string
  from: string
  to: string
  type?: string
  caption?: string
  [key: string]: unknown
}

/**
 * Example usage showing how to integrate NVL canvas
 */
export function ExampleFieldDetailPage() {
  // ============================================
  // 1. YOUR EXISTING DATA
  // ============================================
  const [pulses, setPulses] = useState<PulseData[]>([
    {
      id: 'pulse-1',
      name: 'Learn TypeScript',
      type: 'goal',
      icon: 'target',
    },
    {
      id: 'pulse-2',
      name: 'GraphQL Tutorial',
      type: 'resource',
      icon: 'library_books',
    },
    {
      id: 'pulse-3',
      name: 'Completed Project',
      type: 'story',
      icon: 'check_circle',
    },
  ])

  const [people, setPeople] = useState<PersonData[]>([
    {
      id: 'person-1',
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'MEMBER',
    },
    {
      id: 'person-2',
      firstName: 'Jane',
      lastName: 'Smith',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'ADMIN',
    },
  ])

  const [relationships, setRelationships] = useState<RelationshipData[]>([
    {
      id: 'rel-1',
      from: 'pulse-1',
      to: 'pulse-2',
      type: 'INFORMS',
      caption: 'informs',
    },
    {
      id: 'rel-2',
      from: 'pulse-2',
      to: 'pulse-3',
      type: 'SUPPORTS',
      caption: 'supports',
    },
  ])

  // ============================================
  // 2. UI STATE (selection, hover, modals, etc)
  // ============================================
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingPulseId, setEditingPulseId] = useState<string | null>(null)

  // ============================================
  // 3. CONVERT DATA TO NVL FORMAT
  // ============================================
  // Step 1: Create NVL node structure with empty containers
  // (React rendering happens in useEffect, not during render - keeps render pure)
  const nvlPulseNodes = useMemo(() => {
    return createNvlNodes(
      pulses.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        icon: p.icon,
      }))
    )
  }, [pulses])

  const nvlPersonNodes = useMemo(() => {
    return createNvlNodes(
      people.map((p) => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        name: p.name,
        email: p.email,
        photo: p.photo,
        role: p.role,
      }))
    )
  }, [people])

  // Step 2: Render React components into the NVL node containers
  // This happens in useEffect (allowed side effect), not during render
  useEffect(() => {
    // Render pulse nodes
    pulses.forEach((pulse) => {
      const container = document.getElementById(`node-${pulse.id}`)
      if (container) {
        renderReactComponentToContainer(
          <PulseNode
            label={pulse.name}
            type={pulse.type}
            icon={pulse.icon}
            isSelected={selectedNodeId === pulse.id}
            isHovered={hoveredNodeId === pulse.id}
            onClick={() => setSelectedNodeId(pulse.id)}
            onEditClick={(e) => {
              e.stopPropagation()
              setEditingPulseId(pulse.id)
              setIsEditModalOpen(true)
            }}
          />,
          container
        )
      }
    })

    // Render person nodes
    people.forEach((person) => {
      const container = document.getElementById(`node-${person.id}`)
      if (container) {
        renderReactComponentToContainer(
          <PersonNode
            id={person.id}
            firstName={person.firstName}
            lastName={person.lastName}
            name={person.name}
            email={person.email}
            photo={person.photo}
            role={person.role}
            isActive={selectedNodeId === person.id}
            isSelected={selectedNodeId === person.id}
            isHovered={hoveredNodeId === person.id}
            onClick={() => setSelectedNodeId(person.id)}
          />,
          container
        )
      }
    })
  }, [pulses, people, selectedNodeId, hoveredNodeId])

  // Combine all nodes (order matters for z-index/layering)
  const allNvlNodes = useMemo(
    () => [...nvlPulseNodes, ...nvlPersonNodes],
    [nvlPulseNodes, nvlPersonNodes]
  )

  // Convert relationships to NVL format
  const nvlRelationships = useMemo(
    () => createNvlRelationships(relationships),
    [relationships]
  )

  // ============================================
  // 4. CALLBACKS
  // ============================================
  const handleNodeClick = useCallback((node: Node) => {
    console.log('Node clicked:', node.id)
    setSelectedNodeId(node.id)

    // Optional: Open panel based on node type
    if (node.id.startsWith('pulse-')) {
      // Show pulse details panel
    } else if (node.id.startsWith('person-')) {
      // Show person details panel
    }
  }, [])

  const handleNodeHover = useCallback((node: Node | null) => {
    setHoveredNodeId(node?.id ?? null)
  }, [])

  const handleBackgroundClick = useCallback(() => {
    setSelectedNodeId(null)
    setHoveredNodeId(null)
  }, [])

  const handleCreatePulse = useCallback(() => {
    // Your create pulse logic here
    console.log('Create pulse clicked')
  }, [])

  // ============================================
  // 5. RENDER
  // ============================================
  return (
    <main className="relative w-full h-screen overflow-hidden">
      <NvlCanvas
        nodes={allNvlNodes}
        relationships={nvlRelationships}
        layout="forceDirected"
        minZoom={0.35}
        maxZoom={3}
        enableZoomControls={true}
        showBackgroundDecor={true}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        onBackgroundClick={handleBackgroundClick}
        actionButton={
          <button
            onClick={handleCreatePulse}
            className="px-4 py-2 bg-gp-primary text-white rounded-full hover:bg-gp-primary/90 transition-colors"
          >
            + Create Pulse
          </button>
        }
      />

      {/* Your modals, panels, etc. remain the same */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <h2>Edit Pulse: {editingPulseId}</h2>
            {/* Your edit form here */}
            <button onClick={() => setIsEditModalOpen(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Show selected node info if needed */}
      {selectedNodeId && (
        <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-40">
          <p className="text-sm">Selected: {selectedNodeId}</p>
          <button
            onClick={handleBackgroundClick}
            className="mt-2 text-xs text-blue-600 hover:underline"
          >
            Clear
          </button>
        </div>
      )}
    </main>
  )
}

// ============================================
// BEFORE vs AFTER COMPARISON
// ============================================

/**
 * BEFORE (using GenericPulseCanvas with react-zoom-pan-pinch):
 *
 * - Manually managed pulsePositions state
 * - Calculated initial positions using seededUnitValue()
 * - Used DraggablePulseNode with onPositionChange callbacks
 * - Managed canvasSize state
 * - Had to handle collision detection
 * - Implemented custom zoom/pan logic
 * - Animations were GSAP-based
 *
 * Code size: ~2000 lines in the page component
 *
 * AFTER (using NvlCanvas with NVL):
 *
 * - No manual position state needed
 * - Force-directed layout handles positioning automatically
 * - Nodes are draggable by default via NVL
 * - Canvas size handled by NVL
 * - No collision detection needed
 * - Zoom/pan built-in via InteractiveNvlWrapper
 * - Animations still work via Tailwind classes
 *
 * Code size: ~300 lines (90% less!)
 */
