'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useQuery } from '@apollo/client/react'
import { usePageContext } from '@/contexts'
import { GenericCanvas } from '@/components/canvas/generic-canvas'
import { DraggableResonanceNode } from '@/components/canvas/draggable-resonance-node'
import { DraggableResonanceLinkNode } from '@/components/canvas/draggable-resonance-link-node'
import {
  type FieldResonanceNode,
  type ResonanceLinkNode,
} from '@/lib/canvas-utils/resonance-types'
import {
  createToBandPx,
  createRelaxLayout,
  createClampPosition,
} from '@/lib/canvas-utils/resonance-utils'
import { GET_ALL_RESONANCE_LINKS_WITH_RESONANCES } from '@/app/graphql'

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

export default function ResonancePage() {
  const { setPageTitle } = usePageContext()
  const [currentScale, setCurrentScale] = useState(1)
  const [canvasSize, setCanvasSize] = useState({ width: 3600, height: 3600 })
  const [fieldResonances, setFieldResonances] = useState<FieldResonanceNode[]>(
    []
  )
  const [resonanceLinks, setResonanceLinks] = useState<ResonanceLinkNode[]>([])
  const [expandedResonanceId, setExpandedResonanceId] = useState<string | null>(
    null
  )

  useEffect(() => {
    setPageTitle('Resonance')
  }, [setPageTitle])

  // Initialize canvas size from window (one-time)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const width = (window.innerWidth || 1200) * 5
    const height = (window.innerHeight || 1200) * 5
    setCanvasSize({ width, height })
  }, [])

  // Helper functions for layout
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const toBandPx = useCallback(createToBandPx(), [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const clampPosition = useCallback(createClampPosition(canvasSize), [
    canvasSize,
  ])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const relaxLayout = useCallback(createRelaxLayout(clampPosition), [
    clampPosition,
  ])

  // Simple drag handler for resonance nodes - independent position updates
  const handleResonanceDrag = (id: string, x: number, y: number) => {
    // Find the current resonance to calculate delta
    const currentResonance = fieldResonances.find((r) => r.id === id)
    if (!currentResonance) return

    const deltaX = x - currentResonance.x
    const deltaY = y - currentResonance.y

    // Update resonance position
    setFieldResonances((prev) =>
      prev.map((r) => (r.id === id ? { ...r, x, y } : r))
    )

    // Update all links belonging to this resonance by applying the same delta
    setResonanceLinks((prev) =>
      prev.map((l) =>
        l.resonanceId === id ? { ...l, x: l.x + deltaX, y: l.y + deltaY } : l
      )
    )
  }

  // Simple drag handler for link nodes - independent position updates
  const handleLinkDrag = (id: string, x: number, y: number) => {
    setResonanceLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, x, y } : l))
    )
  }

  const {
    data: linksData,
    loading: linksLoading,
    error: linksError,
  } = useQuery<{
    fieldResonances: ResonanceLinkData[]
  }>(GET_ALL_RESONANCE_LINKS_WITH_RESONANCES, {
    fetchPolicy: 'network-only',
  })

  const transformedData = useMemo(() => {
    if (!linksData?.fieldResonances) return { resonances: [], links: [] }

    // Deterministic node positioning: use index for layout
    const resonances = linksData.fieldResonances
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((res: any, idx: number) => ({
        id: res.id,
        label: res.label,
        description: res.description || '',
        linkCount: 1,
        confidence: res.confidence || 0.5,
        position: {
          left: `${10 + ((idx * 37) % 80)}%`, // deterministic
          top: `${10 + ((idx * 53) % 80)}%`, // deterministic
        },
        x: 0,
        y: 0,
      }))
      .sort((a, b) => b.confidence - a.confidence)

    const linkNodes: ResonanceLinkNode[] = resonances.map((res) => ({
      id: `link-${res.id}`,
      confidence: res.confidence,
      evidence: 'Connection between pulses',
      resonanceId: res.id,
      position: {
        left: res.position.left,
        top: res.position.top,
      },
      x: 0,
      y: 0,
    }))

    return { resonances, links: linkNodes }
  }, [linksData])

  // Convert percentage positions to pixels with collision detection
  useEffect(() => {
    if (transformedData.resonances.length === 0) return

    const width = canvasSize.width
    const height = canvasSize.height

    // Convert field resonances from percentages to pixels
    const positioned = transformedData.resonances.map((res) => ({
      ...res,
      x: toBandPx(res.position.left, width, 0.9),
      y: toBandPx(res.position.top, height, 0.9),
    }))

    // Convert resonance links from percentages to pixels
    const positionedLinks = transformedData.links.map((link) => ({
      ...link,
      x: toBandPx(link.position.left, width, 0.9),
      y: toBandPx(link.position.top, height, 0.9),
    }))

    // Apply collision detection to prevent overlaps
    const relaxed = relaxLayout(positioned, positionedLinks)

    setFieldResonances(relaxed.fields)
    setResonanceLinks(relaxed.links)
  }, [canvasSize, toBandPx, transformedData, relaxLayout])

  if (linksError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gp-ink-muted dark:text-gp-ink-soft mb-2">
            Error loading resonances
          </p>
          <p className="text-sm text-gp-ink-soft dark:text-white/40">
            {linksError.message}
          </p>
        </div>
      </div>
    )
  }

  return (
    <GenericCanvas
      canvasScale={5}
      onScaleChange={setCurrentScale}
      enableZoomControls
      showBackgroundDecor
    >
      {fieldResonances.length > 0 && (
        <div className="relative w-full h-full">
          {/* Field Resonance Nodes */}
          {fieldResonances.map((res) => (
            <DraggableResonanceNode
              key={res.id}
              id={res.id}
              icon="psychology"
              label={res.label}
              description={res.description}
              isActive={expandedResonanceId === res.id}
              canvasPosition={{ x: res.x, y: res.y }}
              scale={currentScale}
              onPositionChange={(x, y) => handleResonanceDrag(res.id, x, y)}
              onClick={() =>
                setExpandedResonanceId(
                  expandedResonanceId === res.id ? null : res.id
                )
              }
            />
          ))}

          {/* Resonance Link Nodes */}
          {resonanceLinks
            .filter((link) => link.resonanceId === expandedResonanceId)
            .map((link, idx) => (
              <DraggableResonanceLinkNode
                key={link.id}
                id={link.id}
                confidence={link.confidence}
                evidence={link.evidence}
                canvasPosition={{ x: link.x, y: link.y }}
                scale={currentScale}
                isVisible={true}
                delay={idx * 0.1}
                onPositionChange={(x, y) => handleLinkDrag(link.id, x, y)}
                onClick={() => {}}
              />
            ))}
        </div>
      )}

      {linksLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <p className="text-sm font-medium text-gp-ink-muted dark:text-gp-ink-soft">
            Loading resonances...
          </p>
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
  )
}
