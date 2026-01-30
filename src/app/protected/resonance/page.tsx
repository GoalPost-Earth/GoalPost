'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
// import { useQuery } from '@apollo/client/react'
import { useAnimations } from '@/contexts'
import { GenericCanvas } from '@/components/canvas/generic-canvas'
import { DraggableResonanceNode } from '@/components/canvas/draggable-resonance-node'
import { DraggableResonanceLinkNode } from '@/components/canvas/draggable-resonance-link-node'
import { ConnectedPulseNode } from '@/components/ui/connected-pulse-node'
import { ResonanceConnections } from '@/components/ui/resonance-connections'
import { ResonancePanel } from '@/components/ui/resonance-panel'
import { PulsePanel, type PulseDetails } from '@/components/ui/pulse-panel'
import { usePageContext } from '@/contexts'
import { cn } from '@/lib/utils'
import {
  createClampPosition,
  createRelaxLayout,
  createResolveCollisions,
  createToBandPx,
  calculatePulsePositions,
  buildResonanceLinkLines,
  buildLinkPulseLines,
  getPulseIcon,
  FIELD_NODE_RADIUS,
  LINK_NODE_RADIUS,
} from '@/lib/canvas-utils/resonance-utils'
import {
  type FieldResonanceNode,
  type ResonanceLinkNode,
  type PulseNode,
  type ExpandedState,
} from '@/lib/canvas-utils/resonance-types'
// import { GET_ALL_RESONANCE_LINKS_WITH_RESONANCES } from '@/app/graphql'

// ============================================================================
// Type Definitions
// ============================================================================

// interface ResonanceLinkData {
//   id: string
//   confidence: number
//   evidence: string | null
//   createdAt: string
//   resonance: Array<{
//     id: string
//     label: string
//     description: string | null
//   }>
//   source: Array<{
//     id: string
//     content: string
//     __typename: string
//   }>
//   target: Array<{
//     id: string
//     content: string
//     __typename: string
//   }>
// }

// ============================================================================
// Expansion State Types
// ============================================================================

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

  // Create clamping function based on canvas size
  const clampPosition = useMemo(
    () => createClampPosition(canvasSize),
    [canvasSize]
  )

  // Create layout relaxation function
  const relaxLayout = useMemo(
    () => createRelaxLayout(clampPosition),
    [clampPosition]
  )

  // Create collision resolution function
  const resolveCollisions = useMemo(
    () => createResolveCollisions(clampPosition),
    [clampPosition]
  )

  // Dummy data for testing
  const linksData = useMemo(
    () => ({
      fieldResonances: [
        {
          id: 'resonance-1',
          label: 'Learning & Growth',
          description:
            'Connection between self-improvement practices and career advancement',
          confidence: 0.85,
          source: [
            {
              id: 'pulse-1',
              content: 'Started daily journaling practice for reflection',
              __typename: 'StoryPulse',
            },
          ],
          target: [
            {
              id: 'pulse-2',
              content: 'Enrolled in advanced TypeScript course',
              __typename: 'ResourcePulse',
            },
          ],
        },
        {
          id: 'resonance-2',
          label: 'Community & Impact',
          description: 'Pattern of contributing to open source and mentoring',
          confidence: 0.78,
          source: [
            {
              id: 'pulse-3',
              content: 'Mentored three junior developers this quarter',
              __typename: 'GoalPulse',
            },
          ],
          target: [
            {
              id: 'pulse-4',
              content: 'Contributed to three open source projects',
              __typename: 'ResourcePulse',
            },
          ],
        },
        {
          id: 'resonance-3',
          label: 'Health & Wellness',
          description: 'Consistent exercise routine supporting energy levels',
          confidence: 0.92,
          source: [
            {
              id: 'pulse-5',
              content: '30-day running challenge completed',
              __typename: 'GoalPulse',
            },
          ],
          target: [
            {
              id: 'pulse-6',
              content: 'Increased productivity and focus at work',
              __typename: 'StoryPulse',
            },
          ],
        },
        {
          id: 'resonance-4',
          label: 'Creative Expression',
          description:
            'Link between artistic pursuits and problem-solving skills',
          confidence: 0.71,
          source: [
            {
              id: 'pulse-7',
              content: 'Started weekly photography sessions',
              __typename: 'StoryPulse',
            },
          ],
          target: [
            {
              id: 'pulse-8',
              content: 'Improved design thinking in product development',
              __typename: 'ResourcePulse',
            },
          ],
        },
      ],
    }),
    []
  )
  const linksLoading = false

  // Transform resonance links into field resonances and link nodes
  const transformedData = useMemo(() => {
    if (!linksData?.fieldResonances) return { resonances: [], links: [] }

    // Transform field resonances directly
    const resonances = linksData.fieldResonances
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((res: any) => ({
        id: res.id,
        label: res.label,
        description: res.description || '',
        linkCount: 1, // Each resonance is counted as one link
        confidence: res.confidence || 0.5,
        position: {
          left: `${10 + Math.random() * 80}%`,
          top: `${10 + Math.random() * 80}%`,
        },
        x: 0,
        y: 0,
      }))
      .sort((a, b) => b.confidence - a.confidence) // Sort by confidence descending

    // Create link nodes positioned around their parent resonances
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const linkNodes: ResonanceLinkNode[] = resonances.map((res, resIdx) => ({
      id: `link-${res.id}`,
      confidence: res.confidence,
      evidence: `Connection between pulses`,
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

  // Helper to convert percentage to pixels
  const toBandPx = useMemo(() => createToBandPx(), [])

  const [hasInitialized, setHasInitialized] = useState(false)

  // Update canvas size and positions - only run once on mount
  useEffect(() => {
    // Guard against SSR - only run on client
    if (typeof window === 'undefined') return
    if (hasInitialized) return

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
    setHasInitialized(true)
  }, [hasInitialized, relaxLayout, toBandPx, transformedData])

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

  // Helper to calculate pulse positions relative to a link node (imported from utils)

  // Get pulses for currently expanded resonance link, anchored near the link node
  useEffect(() => {
    if (expandedState.type !== 'resonance-link' || !expandedState.id) {
      setLinkPulses({ source: null, target: null })
      return
    }

    const linkNode = resonanceLinks.find((l) => l.id === expandedState.id)
    const linkData = linksData?.fieldResonances.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (r: any) => r.id === expandedState.id
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

  // Connection line builders (imported from utils)

  // Reset pulse positions when panel closes
  useEffect(() => {
    if (isPulsePanelOpen) return

    // When panel closes, reset pulses to original position near link node
    if (expandedState.type === 'resonance-link' && expandedState.id) {
      const linkNode = resonanceLinks.find((l) => l.id === expandedState.id)
      const linkData = linksData?.fieldResonances.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (r: any) => r.id === expandedState.id
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
  }, [isPulsePanelOpen, expandedState, resonanceLinks, linksData])

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
      createdBy: [],
      contexts: [],
    }
    setSelectedPulse(details)
    setIsPulsePanelOpen(true)
  }, [])

  // Show error state if query failed
  // if (linksError) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <div className="text-center">
  //         <p className="text-gp-ink-muted dark:text-gp-ink-soft mb-2">
  //           Error loading resonances
  //         </p>
  //         <p className="text-sm text-gp-ink-soft dark:text-white/40">
  //           {linksError.message}
  //         </p>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <>
      <GenericCanvas
        canvasScale={5}
        onScaleChange={setCurrentScale}
        enableZoomControls
        showBackgroundDecor
      >
        {fieldResonances.length > 0 && (
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
                  // Update both state variables together to avoid race conditions
                  setResonanceLinks((prevLinks) => {
                    const { x: clampedX, y: clampedY } = clampPosition(
                      x,
                      y,
                      LINK_NODE_RADIUS
                    )

                    const updatedLinks = prevLinks.map((l) =>
                      l.id === link.id ? { ...l, x: clampedX, y: clampedY } : l
                    )

                    // Use current state from prevLinks to resolve collisions
                    setFieldResonances((prevFields) => {
                      const { fields: resolvedFields } = resolveCollisions(
                        { id: link.id, kind: 'link', x: clampedX, y: clampedY },
                        prevFields,
                        updatedLinks
                      )
                      return resolvedFields
                    })

                    return updatedLinks
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
            (linksData?.fieldResonances as any[])
              ?.filter(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (res: any) => res.id === expandedState.id
              )
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .map((res: any) => ({
                id: res.id,
                confidence: res.confidence,
                evidence: res.description || '',
                createdAt: new Date().toISOString(),
                source: {
                  id: res.source?.[0]?.id || '',
                  content: res.source?.[0]?.content || 'Unknown',
                  __typename: res.source?.[0]?.__typename || 'Unknown',
                },
                target: {
                  id: res.target?.[0]?.id || '',
                  content: res.target?.[0]?.content || 'Unknown',
                  __typename: res.target?.[0]?.__typename || 'Unknown',
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
            const link = (linksData?.fieldResonances as any[])?.find(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (r: any) => r.id === expandedState.id
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
            (linksData?.fieldResonances as any[])
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ?.filter((res: any) => res.id === expandedState.id)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .map((res: any) => ({
                id: res.id,
                confidence: res.confidence,
                evidence: res.description || '',
                createdAt: new Date().toISOString(),
                source: {
                  id: res.source?.[0]?.id || '',
                  content: res.source?.[0]?.content || 'Unknown',
                  __typename: res.source?.[0]?.__typename || 'Unknown',
                },
                target: {
                  id: res.target?.[0]?.id || '',
                  content: res.target?.[0]?.content || 'Unknown',
                  __typename: res.target?.[0]?.__typename || 'Unknown',
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
// Utility Functions (imported from resonance-utils)
// ============================================================================

// export default function ResonancePage() {
//   return <div>Resonance Page Under Construction</div>
// }
