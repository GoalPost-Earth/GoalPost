'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { useAnimations } from '@/contexts/animation-context'

// Force dynamic rendering for this page (required for Vercel production)
export const dynamic = 'force-dynamic'
import { GenericCanvas } from '@/components/canvas/generic-canvas'
import { DraggableResonanceNode } from '@/components/canvas/draggable-resonance-node'
import { DraggableResonanceLinkNode } from '@/components/canvas/draggable-resonance-link-node'
import { ConnectedPulseNode } from '@/components/ui/connected-pulse-node'
import {
  ResonanceConnections,
  type ConnectionLine,
} from '@/components/ui/resonance-connections'
import { ResonancePanel } from '@/components/ui/resonance-panel'
import { PulsePanel, type PulseDetails } from '@/components/ui/pulse-panel'
import { GET_ALL_RESONANCE_LINKS_WITH_RESONANCES } from '@/app/graphql/queries'
import { distance } from '@/lib/collision-detection'
import { usePageContext } from '@/contexts'
import { cn } from '@/lib/utils'

// ============================================================================
// Type Definitions
// ============================================================================

interface ResonanceLinkData {
  id: string
  confidence: number
  evidence: string | null
  createdAt: string
  resonance: Array<{
    id: string
    label: string
    description: string | null
  }>
  source: Array<{
    id: string
    content: string
    __typename: string
  }>
  target: Array<{
    id: string
    content: string
    __typename: string
  }>
}

interface FieldResonanceNode {
  id: string
  label: string
  description: string
  linkCount: number
  confidence: number // Average confidence of links
  position: { top: string; left: string }
  x: number
  y: number
}

interface ResonanceLinkNode {
  id: string
  confidence: number
  evidence: string
  resonanceId: string
  position: { top: string; left: string }
  x: number
  y: number
}

interface PulseNode {
  id: string
  content: string
  type: 'goal' | 'resource' | 'story'
  x: number
  y: number
}

// ============================================================================
// Expansion State Types
// ============================================================================

type ExpandedType = 'field-resonance' | 'resonance-link' | null
interface ExpandedState {
  type: ExpandedType
  id: string | null
}

const FIELD_NODE_RADIUS = 90
const LINK_NODE_RADIUS = 50

// ============================================================================
// Main Component
// ============================================================================

export default function ResonancePage() {
  const { setPageTitle } = usePageContext()
  const { animationsEnabled } = useAnimations()
  const [expandedState, setExpandedState] = useState<ExpandedState>({
    type: null,
    id: null,
  })
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [fieldResonances, setFieldResonances] = useState<FieldResonanceNode[]>(
    []
  )
  const [resonanceLinks, setResonanceLinks] = useState<ResonanceLinkNode[]>([])
  const [linkPulses, setLinkPulses] = useState<{
    source: PulseNode | null
    target: PulseNode | null
  }>({ source: null, target: null })
  const [isPulsePanelOpen, setIsPulsePanelOpen] = useState(false)
  const [selectedPulse, setSelectedPulse] = useState<PulseDetails | null>(null)
  const [currentScale, setCurrentScale] = useState(1)
  const [canvasSize, setCanvasSize] = useState({ width: 3600, height: 3600 })

  // Set page title
  useEffect(() => {
    setPageTitle('Resonance')
  }, [setPageTitle])

  const clampPosition = useCallback(
    (x: number, y: number, radius: number) => ({
      x: Math.max(radius, Math.min(canvasSize.width - radius, x)),
      y: Math.max(radius, Math.min(canvasSize.height - radius, y)),
    }),
    [canvasSize.height, canvasSize.width]
  )

  const relaxLayout = useCallback(
    (
      initialFields: FieldResonanceNode[],
      initialLinks: ResonanceLinkNode[]
    ) => {
      let fields = initialFields
      let links = initialLinks

      const pushPair = <T extends { x: number; y: number }>(
        a: T,
        b: T,
        ra: number,
        rb: number
      ): [T, T, boolean] => {
        const minDist = ra + rb
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.max(Math.hypot(dx, dy), 0.001)
        if (dist >= minDist) return [a, b, false]

        const overlap = minDist - dist + 1
        const nx = dx / dist
        const ny = dy / dist
        const shiftA = overlap * 0.5
        const shiftB = overlap * 0.5

        const clampedA = clampPosition(a.x - nx * shiftA, a.y - ny * shiftA, ra)
        const movedA = {
          ...a,
          x: clampedA.x,
          y: clampedA.y,
        } as T

        const clampedB = clampPosition(b.x + nx * shiftB, b.y + ny * shiftB, rb)
        const movedB = {
          ...b,
          x: clampedB.x,
          y: clampedB.y,
        } as T

        return [movedA, movedB, true]
      }

      const iterations = 8
      for (let iter = 0; iter < iterations; iter++) {
        let changed = false

        for (let i = 0; i < fields.length; i++) {
          for (let j = i + 1; j < fields.length; j++) {
            const [fi, fj, moved] = pushPair(
              fields[i],
              fields[j],
              FIELD_NODE_RADIUS,
              FIELD_NODE_RADIUS
            )
            if (moved) {
              fields = fields.map((f, idx) =>
                idx === i ? fi : idx === j ? fj : f
              )
              changed = true
            }
          }
        }

        for (let i = 0; i < links.length; i++) {
          for (let j = i + 1; j < links.length; j++) {
            const [li, lj, moved] = pushPair(
              links[i],
              links[j],
              LINK_NODE_RADIUS,
              LINK_NODE_RADIUS
            )
            if (moved) {
              links = links.map((l, idx) =>
                idx === i ? li : idx === j ? lj : l
              )
              changed = true
            }
          }
        }

        for (let i = 0; i < fields.length; i++) {
          for (let j = 0; j < links.length; j++) {
            const dx = links[j].x - fields[i].x
            const dy = links[j].y - fields[i].y
            const dist = Math.max(Math.hypot(dx, dy), 0.001)
            const minDist = FIELD_NODE_RADIUS + LINK_NODE_RADIUS

            if (dist < minDist) {
              const overlap = minDist - dist + 1
              const nx = dx / dist
              const ny = dy / dist
              const shiftField = overlap * 0.5
              const shiftLink = overlap * 0.5

              const clampedField = clampPosition(
                fields[i].x - nx * shiftField,
                fields[i].y - ny * shiftField,
                FIELD_NODE_RADIUS
              )
              fields = fields.map((f, idx) =>
                idx === i
                  ? ({
                      ...f,
                      x: clampedField.x,
                      y: clampedField.y,
                    } as FieldResonanceNode)
                  : f
              )

              const clampedLink = clampPosition(
                links[j].x + nx * shiftLink,
                links[j].y + ny * shiftLink,
                LINK_NODE_RADIUS
              )
              links = links.map((l, idx) =>
                idx === j
                  ? ({
                      ...l,
                      x: clampedLink.x,
                      y: clampedLink.y,
                    } as ResonanceLinkNode)
                  : l
              )
              changed = true
            }
          }
        }

        if (!changed) break
      }

      return { fields, links }
    },
    [clampPosition]
  )

  const resolveCollisions = useCallback(
    (
      mover: { id: string; kind: 'field' | 'link'; x: number; y: number },
      initialFields: FieldResonanceNode[],
      initialLinks: ResonanceLinkNode[]
    ) => {
      const moverRadius =
        mover.kind === 'field' ? FIELD_NODE_RADIUS : LINK_NODE_RADIUS

      let fields = initialFields
      let links = initialLinks

      // Helper to push a single node away from a source
      const pushNodeFrom = <T extends { id: string; x: number; y: number }>(
        node: T,
        radius: number,
        source: { x: number; y: number },
        sourceRadius: number
      ): T => {
        const minDist = radius + sourceRadius
        const dist = Math.max(
          distance(source.x, source.y, node.x, node.y),
          0.001
        )
        if (dist >= minDist) return node

        const overlap = minDist - dist + 1
        const nx = (node.x - source.x) / dist
        const ny = (node.y - source.y) / dist

        const newX = node.x + nx * overlap
        const newY = node.y + ny * overlap

        const clamped = clampPosition(newX, newY, radius)
        return { ...node, x: clamped.x, y: clamped.y } as T
      }

      // Cascade collision detection: iteratively resolve collisions
      const maxIterations = 5
      for (let iter = 0; iter < maxIterations; iter++) {
        let changed = false

        // Push all nodes away from mover
        const newFields = fields.map((f) => {
          if (f.id === mover.id) return f
          const pushed = pushNodeFrom(f, FIELD_NODE_RADIUS, mover, moverRadius)
          if (pushed.x !== f.x || pushed.y !== f.y) changed = true
          return pushed
        })

        const newLinks = links.map((l) => {
          if (l.id === mover.id) return l
          const pushed = pushNodeFrom(l, LINK_NODE_RADIUS, mover, moverRadius)
          if (pushed.x !== l.x || pushed.y !== l.y) changed = true
          return pushed
        })

        // Now check for collisions between other nodes (cascade effect)
        let cascadeFields = newFields
        let cascadeLinks = newLinks

        // Check field-to-field collisions
        for (let i = 0; i < cascadeFields.length; i++) {
          for (let j = i + 1; j < cascadeFields.length; j++) {
            const pushed = pushNodeFrom(
              cascadeFields[j],
              FIELD_NODE_RADIUS,
              cascadeFields[i],
              FIELD_NODE_RADIUS
            )
            if (
              pushed.x !== cascadeFields[j].x ||
              pushed.y !== cascadeFields[j].y
            ) {
              cascadeFields = cascadeFields.map((f) =>
                f.id === pushed.id ? pushed : f
              )
              changed = true
            }
          }
        }

        // Check link-to-link collisions
        for (let i = 0; i < cascadeLinks.length; i++) {
          for (let j = i + 1; j < cascadeLinks.length; j++) {
            const pushed = pushNodeFrom(
              cascadeLinks[j],
              LINK_NODE_RADIUS,
              cascadeLinks[i],
              LINK_NODE_RADIUS
            )
            if (
              pushed.x !== cascadeLinks[j].x ||
              pushed.y !== cascadeLinks[j].y
            ) {
              cascadeLinks = cascadeLinks.map((l) =>
                l.id === pushed.id ? pushed : l
              )
              changed = true
            }
          }
        }

        // Check field-to-link collisions
        for (let i = 0; i < cascadeFields.length; i++) {
          for (let j = 0; j < cascadeLinks.length; j++) {
            const pushed = pushNodeFrom(
              cascadeLinks[j],
              LINK_NODE_RADIUS,
              cascadeFields[i],
              FIELD_NODE_RADIUS
            )
            if (
              pushed.x !== cascadeLinks[j].x ||
              pushed.y !== cascadeLinks[j].y
            ) {
              cascadeLinks = cascadeLinks.map((l) =>
                l.id === pushed.id ? pushed : l
              )
              changed = true
            }
          }
        }

        fields = cascadeFields
        links = cascadeLinks

        // Stop if no changes occurred
        if (!changed) break
      }

      return { fields, links }
    },
    [clampPosition]
  )

  // Fetch all resonance links
  const { data: linksData, loading: linksLoading } = useQuery(
    GET_ALL_RESONANCE_LINKS_WITH_RESONANCES
  )

  // Transform resonance links into field resonances and link nodes
  const transformedData = useMemo(() => {
    if (!linksData?.resonanceLinks) return { resonances: [], links: [] }

    const resonanceMap = new Map<
      string,
      {
        id: string
        label: string
        description: string
        links: ResonanceLinkData[]
        confidences: number[]
      }
    >()

    // Group links by resonance
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    linksData.resonanceLinks.forEach((link: any) => {
      const resonanceArray = link.resonance || []
      const resonance = resonanceArray[0]
      if (!resonance) return

      const resId = resonance.id
      if (!resonanceMap.has(resId)) {
        resonanceMap.set(resId, {
          id: resId,
          label: resonance.label,
          description: resonance.description,
          links: [],
          confidences: [],
        })
      }

      const res = resonanceMap.get(resId)!
      res.links.push(link)
      res.confidences.push(link.confidence)
    })

    // Convert to array with random positions across the entire canvas
    const resonances = Array.from(resonanceMap.values())
      .sort((a, b) => b.links.length - a.links.length) // Largest first
      .map((res) => {
        // Generate random position across full canvas (10-90% range for safety margin)
        const randomLeft = 10 + Math.random() * 80
        const randomTop = 10 + Math.random() * 80
        return {
          id: res.id,
          label: res.label,
          description: res.description,
          linkCount: res.links.length,
          confidence:
            res.confidences.reduce((a, b) => a + b, 0) / res.confidences.length,
          position: {
            left: `${randomLeft}%`,
            top: `${randomTop}%`,
          },
          x: 0,
          y: 0,
        }
      })

    // Create link nodes - distribute around their resonance
    const linkNodes: ResonanceLinkNode[] = []
    const linksPerResonance = new Map<string, ResonanceLinkData[]>()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    linksData.resonanceLinks.forEach((link: any) => {
      const resEntry = link.resonance?.[0]
      if (!resEntry) return
      const resId = resEntry.id
      if (!linksPerResonance.has(resId)) {
        linksPerResonance.set(resId, [])
      }
      linksPerResonance.get(resId)!.push(link)
    })

    resonances.forEach((res) => {
      const links = linksPerResonance.get(res.id) || []
      const radius = 15
      links.forEach((link, idx) => {
        const angle = (idx / Math.max(links.length, 1)) * 2 * Math.PI
        const offsetX = Math.cos(angle) * radius
        const offsetY = Math.sin(angle) * radius
        const centerX = parseFloat(res.position.left)
        const centerY = parseFloat(res.position.top)

        linkNodes.push({
          id: link.id,
          confidence: link.confidence,
          evidence: link.evidence || 'No evidence provided',
          resonanceId: res.id,
          position: {
            left: `${centerX + offsetX}%`,
            top: `${centerY + offsetY}%`,
          },
          x: 0,
          y: 0,
        })
      })
    })

    return { resonances, links: linkNodes }
  }, [linksData])

  // Helper to convert percentage to pixels
  const toBandPx = useCallback((value: string, total: number, band = 0.7) => {
    const numeric = parseFloat(value)
    if (Number.isNaN(numeric)) return total / 2
    const clamped = Math.min(Math.max(numeric, 0), 100)
    const usable = total * band
    const margin = (total - usable) / 2
    return (clamped / 100) * usable + margin
  }, [])

  // Update canvas size and positions
  useEffect(() => {
    const width = (window.innerWidth || 1200) * 5
    const height = (window.innerHeight || 1200) * 5
    setCanvasSize({ width, height })

    // Convert field resonances
    const positioned = transformedData.resonances.map((res) => ({
      ...res,
      x: toBandPx(res.position.left, width, 0.9),
      y: toBandPx(res.position.top, height, 0.9),
    }))

    // Convert resonance links
    const positionedLinks = transformedData.links.map((link) => ({
      ...link,
      x: toBandPx(link.position.left, width, 0.9),
      y: toBandPx(link.position.top, height, 0.9),
    }))

    const relaxed = relaxLayout(positioned, positionedLinks)

    setFieldResonances(relaxed.fields)
    setResonanceLinks(relaxed.links)
  }, [relaxLayout, toBandPx, transformedData])

  // Get resonance links for currently expanded resonance
  const activeResonanceId = useMemo(() => {
    if (expandedState.type === 'field-resonance') return expandedState.id

    if (expandedState.type === 'resonance-link' && expandedState.id) {
      const parentLink = resonanceLinks.find((l) => l.id === expandedState.id)
      return parentLink?.resonanceId || null
    }

    return null
  }, [expandedState, resonanceLinks])

  const activeResonanceLinks = useMemo(() => {
    if (!activeResonanceId) return []
    return resonanceLinks.filter(
      (link) => link.resonanceId === activeResonanceId
    )
  }, [activeResonanceId, resonanceLinks])

  // Helper to calculate pulse positions relative to a link node
  const calculatePulsePositions = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (linkNode: ResonanceLinkNode, sourceData: any, targetData: any) => {
      const distance = 120
      const verticalOffset = 50

      return {
        source: {
          id: sourceData.id,
          content: sourceData.content,
          type: getPulseType(sourceData.__typename),
          x: linkNode.x - distance,
          y: linkNode.y - verticalOffset,
        },
        target: {
          id: targetData.id,
          content: targetData.content,
          type: getPulseType(targetData.__typename),
          x: linkNode.x + distance,
          y: linkNode.y + verticalOffset,
        },
      }
    },
    []
  )

  // Get pulses for currently expanded resonance link, anchored near the link node
  useEffect(() => {
    if (expandedState.type !== 'resonance-link' || !expandedState.id) {
      setLinkPulses({ source: null, target: null })
      return
    }

    const linkNode = resonanceLinks.find((l) => l.id === expandedState.id)
    const linkData = linksData?.resonanceLinks.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (l: any) => l.id === expandedState.id
    )

    if (!linkNode || !linkData) {
      setLinkPulses({ source: null, target: null })
      return
    }

    const sourceData = linkData.source?.[0]
    const targetData = linkData.target?.[0]

    if (!sourceData || !targetData) {
      setLinkPulses({ source: null, target: null })
      return
    }

    const positions = calculatePulsePositions(linkNode, sourceData, targetData)
    setLinkPulses({ source: positions.source, target: positions.target })
  }, [expandedState, linksData, resonanceLinks, calculatePulsePositions])

  const handleToggleResonance = (resonanceId: string) => {
    if (
      expandedState.type === 'field-resonance' &&
      expandedState.id === resonanceId
    ) {
      setExpandedState({ type: null, id: null })
      setIsPanelOpen(false)
    } else {
      setExpandedState({ type: 'field-resonance', id: resonanceId })
      setIsPanelOpen(true)
    }
  }

  const handleToggleLink = (linkId: string) => {
    if (
      expandedState.type === 'resonance-link' &&
      expandedState.id === linkId
    ) {
      // Close pulse nodes but keep resonance links visible
      // Find the parent resonance for this link
      const link = resonanceLinks.find((l) => l.id === linkId)
      if (link) {
        setExpandedState({ type: 'field-resonance', id: link.resonanceId })
        setIsPanelOpen(true)
      }
    } else {
      setExpandedState({ type: 'resonance-link', id: linkId })
      setIsPanelOpen(true)
    }
  }

  const buildResonanceLinkLines = useCallback(
    (res: FieldResonanceNode, links: ResonanceLinkNode[]): ConnectionLine[] =>
      links.map((link, idx) => ({
        id: `res-link-${res.id}-${link.id}`,
        x1: res.x.toString(),
        y1: res.y.toString(),
        x2: link.x.toString(),
        y2: link.y.toString(),
        dashArray: '10, 10',
        duration: 3 + idx * 0.1,
      })),
    []
  )

  const buildLinkPulseLines = useCallback(
    (
      link: ResonanceLinkNode,
      source: PulseNode,
      target: PulseNode
    ): ConnectionLine[] => [
      {
        id: `link-src-${link.id}`,
        x1: link.x.toString(),
        y1: link.y.toString(),
        x2: source.x.toString(),
        y2: source.y.toString(),
        dashArray: '8, 8',
        duration: 2.8,
      },
      {
        id: `link-tgt-${link.id}`,
        x1: link.x.toString(),
        y1: link.y.toString(),
        x2: target.x.toString(),
        y2: target.y.toString(),
        dashArray: '8, 8',
        duration: 3.2,
      },
    ],
    []
  )

  // Reset pulse positions when panel closes
  useEffect(() => {
    if (isPulsePanelOpen) return

    // When panel closes, reset pulses to original position near link node
    if (expandedState.type === 'resonance-link' && expandedState.id) {
      const linkNode = resonanceLinks.find((l) => l.id === expandedState.id)
      const linkData = linksData?.resonanceLinks.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (l: any) => l.id === expandedState.id
      )

      if (linkNode && linkData) {
        const sourceData = linkData.source?.[0]
        const targetData = linkData.target?.[0]

        if (sourceData && targetData) {
          const positions = calculatePulsePositions(
            linkNode,
            sourceData,
            targetData
          )
          setLinkPulses({ source: positions.source, target: positions.target })
        }
      }
    }
  }, [
    isPulsePanelOpen,
    expandedState,
    resonanceLinks,
    linksData,
    calculatePulsePositions,
  ])

  const handleOpenPulsePanel = useCallback((pulse: PulseNode) => {
    const details: PulseDetails = {
      id: pulse.id,
      type: pulse.type,
      content: pulse.content,
      createdAt: null,
      intensity: null,
      status: null,
      horizon: null,
      resourceType: null,
      initiators: [],
      contexts: [],
    }
    setSelectedPulse(details)
    setIsPulsePanelOpen(true)
  }, [])

  return (
    <>
      <GenericCanvas
        canvasScale={5}
        onScaleChange={setCurrentScale}
        enableZoomControls
        showBackgroundDecor
      >
        {!linksLoading && fieldResonances.length > 0 && (
          <div className="relative w-full h-full">
            {/* Lines from resonance to its link nodes when expanded */}
            {activeResonanceId &&
              (() => {
                const activeResonance = fieldResonances.find(
                  (r) => r.id === activeResonanceId
                )
                if (!activeResonance) return null

                return (
                  <ResonanceConnections
                    isActive
                    lines={buildResonanceLinkLines(
                      activeResonance,
                      activeResonanceLinks
                    )}
                  />
                )
              })()}

            {/* Field Resonance Nodes */}
            {fieldResonances.map((res) => (
              <DraggableResonanceNode
                key={res.id}
                id={res.id}
                icon="psychology"
                label={res.label}
                description={res.description}
                isActive={
                  expandedState.type === 'field-resonance' &&
                  expandedState.id === res.id
                }
                canvasPosition={{ x: res.x, y: res.y }}
                scale={currentScale}
                onPositionChange={(x, y) => {
                  setFieldResonances((prevFields) => {
                    const currentField = prevFields.find((r) => r.id === res.id)
                    if (!currentField) return prevFields

                    const { x: clampedX, y: clampedY } = clampPosition(
                      x,
                      y,
                      FIELD_NODE_RADIUS
                    )

                    const deltaX = clampedX - currentField.x
                    const deltaY = clampedY - currentField.y

                    const updatedFields = prevFields.map((r) =>
                      r.id === res.id ? { ...r, x: clampedX, y: clampedY } : r
                    )

                    const shiftedLinks = resonanceLinks.map((link) =>
                      link.resonanceId === res.id
                        ? { ...link, x: link.x + deltaX, y: link.y + deltaY }
                        : link
                    )

                    const { fields: resolvedFields, links: resolvedLinks } =
                      resolveCollisions(
                        { id: res.id, kind: 'field', x: clampedX, y: clampedY },
                        updatedFields,
                        shiftedLinks
                      )

                    setResonanceLinks(resolvedLinks)
                    return resolvedFields
                  })
                }}
                onClick={() => handleToggleResonance(res.id)}
              />
            ))}

            {/* Resonance Link Nodes (visible when parent resonance expanded) */}
            {activeResonanceLinks.map((link, idx) => (
              <DraggableResonanceLinkNode
                key={link.id}
                id={link.id}
                confidence={link.confidence}
                evidence={link.evidence}
                canvasPosition={{ x: link.x, y: link.y }}
                scale={currentScale}
                isVisible={activeResonanceId === link.resonanceId}
                delay={idx * 0.1}
                onPositionChange={(x, y) => {
                  setResonanceLinks((prevLinks) => {
                    const { x: clampedX, y: clampedY } = clampPosition(
                      x,
                      y,
                      LINK_NODE_RADIUS
                    )

                    const updatedLinks = prevLinks.map((l) =>
                      l.id === link.id ? { ...l, x: clampedX, y: clampedY } : l
                    )

                    const { fields: resolvedFields, links: resolvedLinks } =
                      resolveCollisions(
                        { id: link.id, kind: 'link', x: clampedX, y: clampedY },
                        fieldResonances,
                        updatedLinks
                      )

                    setFieldResonances(resolvedFields)
                    return resolvedLinks
                  })
                }}
                onClick={() => handleToggleLink(link.id)}
              />
            ))}

            {/* Pulse Nodes (visible when resonance link expanded) */}
            {expandedState.type === 'resonance-link' &&
              linkPulses.source &&
              linkPulses.target && (
                <>
                  {/* Lines from link to its pulses */}
                  {(() => {
                    const linkNode = resonanceLinks.find(
                      (l) => l.id === expandedState.id
                    )
                    return linkNode ? (
                      <ResonanceConnections
                        isActive
                        lines={buildLinkPulseLines(
                          linkNode,
                          linkPulses.source,
                          linkPulses.target
                        )}
                      />
                    ) : null
                  })()}

                  <ConnectedPulseNode
                    id={linkPulses.source.id}
                    icon={getPulseIcon(linkPulses.source.type)}
                    label={linkPulses.source.content.substring(0, 40)}
                    type={linkPulses.source.type}
                    animation="float"
                    canvasPosition={{
                      x: linkPulses.source.x,
                      y: linkPulses.source.y,
                    }}
                    scale={currentScale}
                    isVisible
                    onClick={() => handleOpenPulsePanel(linkPulses.source!)}
                    onPositionChange={(x, y) =>
                      setLinkPulses((prev) =>
                        prev.source
                          ? { ...prev, source: { ...prev.source, x, y } }
                          : prev
                      )
                    }
                  />
                  <ConnectedPulseNode
                    id={linkPulses.target.id}
                    icon={getPulseIcon(linkPulses.target.type)}
                    label={linkPulses.target.content.substring(0, 40)}
                    type={linkPulses.target.type}
                    animation="float"
                    canvasPosition={{
                      x: linkPulses.target.x,
                      y: linkPulses.target.y,
                    }}
                    scale={currentScale}
                    isVisible
                    onClick={() => handleOpenPulsePanel(linkPulses.target!)}
                    onPositionChange={(x, y) =>
                      setLinkPulses((prev) =>
                        prev.target
                          ? { ...prev, target: { ...prev.target, x, y } }
                          : prev
                      )
                    }
                  />
                </>
              )}
          </div>
        )}

        {linksLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-gp-surface/50 dark:bg-gp-surface-dark/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <span
                className={cn(
                  'material-symbols-outlined text-5xl text-gp-primary',
                  animationsEnabled && 'animate-spin'
                )}
              >
                hourglass_bottom
              </span>
              <p className="text-sm font-medium text-gp-ink-muted dark:text-gp-ink-soft">
                Loading resonances...
              </p>
            </div>
          </div>
        )}

        {!linksLoading && fieldResonances.length === 0 && (
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

      {/* Panel for Field Resonance */}
      {expandedState.type === 'field-resonance' && expandedState.id && (
        <ResonancePanel
          isOpen={isPanelOpen}
          isLoading={false}
          onClose={() => setIsPanelOpen(false)}
          resonance={{
            id: expandedState.id,
            label:
              fieldResonances.find((r) => r.id === expandedState.id)?.label ||
              'Unknown',
            description:
              fieldResonances.find((r) => r.id === expandedState.id)
                ?.description || '',
            strength:
              (fieldResonances.find((r) => r.id === expandedState.id)
                ?.confidence || 0) * 100,
          }}
          links={
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (linksData?.resonanceLinks as any[])
              ?.filter(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (link: any) => link.resonance?.[0]?.id === expandedState.id
              )
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .map((link: any) => ({
                id: link.id,
                confidence: link.confidence,
                evidence: link.evidence,
                createdAt: link.createdAt,
                source: {
                  id: link.source?.[0]?.id || '',
                  content: link.source?.[0]?.content || 'Unknown',
                  __typename: link.source?.[0]?.__typename || 'Unknown',
                },
                target: {
                  id: link.target?.[0]?.id || '',
                  content: link.target?.[0]?.content || 'Unknown',
                  __typename: link.target?.[0]?.__typename || 'Unknown',
                },
              })) || []
          }
        />
      )}

      {/* Panel for Resonance Link */}
      {expandedState.type === 'resonance-link' && expandedState.id && (
        <ResonancePanel
          isOpen={isPanelOpen}
          isLoading={false}
          onClose={() => setIsPanelOpen(false)}
          resonance={(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const link = (linksData?.resonanceLinks as any[])?.find(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (l: any) => l.id === expandedState.id
            )
            return {
              id: expandedState.id,
              label: 'Resonance Link Details',
              description: 'Connection between two pulses',
              strength: (link?.confidence || 0) * 100,
            }
          })()}
          links={
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (linksData?.resonanceLinks as any[])
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ?.filter((link: any) => link.id === expandedState.id)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .map((link: any) => ({
                id: link.id,
                confidence: link.confidence,
                evidence: link.evidence,
                createdAt: link.createdAt,
                source: {
                  id: link.source?.[0]?.id || '',
                  content: link.source?.[0]?.content || 'Unknown',
                  __typename: link.source?.[0]?.__typename || 'Unknown',
                },
                target: {
                  id: link.target?.[0]?.id || '',
                  content: link.target?.[0]?.content || 'Unknown',
                  __typename: link.target?.[0]?.__typename || 'Unknown',
                },
              })) || []
          }
        />
      )}

      {/* Panel for Pulse Details */}
      {isPulsePanelOpen && selectedPulse && (
        <PulsePanel
          isOpen={isPulsePanelOpen}
          isLoading={false}
          pulse={selectedPulse}
          onClose={() => setIsPulsePanelOpen(false)}
        />
      )}
    </>
  )
}

// ============================================================================
// Utility Functions
// ============================================================================

function getPulseType(typename: string): 'goal' | 'resource' | 'story' {
  if (typename === 'GoalPulse') return 'goal'
  if (typename === 'ResourcePulse') return 'resource'
  return 'story'
}

function getPulseIcon(type: 'goal' | 'resource' | 'story'): string {
  if (type === 'goal') return 'flag'
  if (type === 'resource') return 'diamond'
  return 'auto_stories'
}
