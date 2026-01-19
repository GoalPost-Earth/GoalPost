'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@apollo/client/react'
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

// ============================================================================
// Main Component
// ============================================================================

export default function ResonancePage() {
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

    // Convert to array with positions
    const resonances = Array.from(resonanceMap.values())
      .sort((a, b) => b.links.length - a.links.length) // Largest first
      .map((res, idx) => {
        const col = idx % 3
        const row = Math.floor(idx / 3)
        return {
          id: res.id,
          label: res.label,
          description: res.description,
          linkCount: res.links.length,
          confidence:
            res.confidences.reduce((a, b) => a + b, 0) / res.confidences.length,
          position: {
            left: `${25 + col * 37.5}%`,
            top: `${25 + row * 37.5}%`,
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
    const width = (window.innerWidth || 1200) * 3
    const height = (window.innerHeight || 1200) * 3

    // Convert field resonances
    const positioned = transformedData.resonances.map((res) => ({
      ...res,
      x: toBandPx(res.position.left, width, 0.6),
      y: toBandPx(res.position.top, height, 0.6),
    }))

    // Convert resonance links
    const positionedLinks = transformedData.links.map((link) => ({
      ...link,
      x: toBandPx(link.position.left, width, 0.6),
      y: toBandPx(link.position.top, height, 0.6),
    }))

    setFieldResonances(positioned)
    setResonanceLinks(positionedLinks)
  }, [transformedData, toBandPx])

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

    const distance = 120 // bring pulses closer to the resonance link
    const verticalOffset = 50

    const sourcePulse: PulseNode = {
      id: sourceData.id,
      content: sourceData.content,
      type: getPulseType(sourceData.__typename),
      x: linkNode.x - distance,
      y: linkNode.y - verticalOffset,
    }

    const targetPulse: PulseNode = {
      id: targetData.id,
      content: targetData.content,
      type: getPulseType(targetData.__typename),
      x: linkNode.x + distance,
      y: linkNode.y + verticalOffset,
    }

    setLinkPulses({ source: sourcePulse, target: targetPulse })
  }, [expandedState, linksData, resonanceLinks])

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
      setExpandedState({ type: null, id: null })
      setIsPanelOpen(false)
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
        canvasScale={2}
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
                  setFieldResonances((prev) =>
                    prev.map((r) => (r.id === res.id ? { ...r, x, y } : r))
                  )
                  // Update linked resonance link nodes
                  setResonanceLinks((prev) =>
                    prev.map((link) =>
                      link.resonanceId === res.id
                        ? {
                            ...link,
                            x: link.x + (x - res.x),
                            y: link.y + (y - res.y),
                          }
                        : link
                    )
                  )
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
                  setResonanceLinks((prev) =>
                    prev.map((l) => (l.id === link.id ? { ...l, x, y } : l))
                  )
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
              <span className="material-symbols-outlined text-5xl text-gp-primary animate-spin">
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
          onClose={() => {
            setIsPanelOpen(false)
            setExpandedState({ type: null, id: null })
          }}
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
          onClose={() => {
            setIsPanelOpen(false)
            setExpandedState({ type: null, id: null })
          }}
          resonance={{
            id: expandedState.id,
            label: 'Resonance Link Details',
            description: 'Connection between two pulses',
          }}
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
