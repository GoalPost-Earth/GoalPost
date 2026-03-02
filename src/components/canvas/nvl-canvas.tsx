'use client'

import { ReactNode, useRef, useMemo, useCallback, useEffect } from 'react'
import { InteractiveNvlWrapper } from '@neo4j-nvl/react'
import type {
  Node,
  Relationship,
  NvlOptions,
  ExternalCallbacks,
} from '@neo4j-nvl/base'
import type { InteractiveNvlWrapperProps } from '@neo4j-nvl/react'
import { useAnimations } from '@/contexts'
import { cn } from '@/lib/utils'

export interface NvlCanvasProps {
  nodes: Node[]
  relationships: Relationship[]
  className?: string
  minZoom?: number
  maxZoom?: number
  enableZoomControls?: boolean
  showBackgroundDecor?: boolean
  isLoading?: boolean
  layout?: 'forceDirected' | 'hierarchical'
  onNodeClick?: (node: Node) => void
  onNodeDoubleClick?: (node: Node) => void
  onNodeHover?: (node: Node | null) => void
  onBackgroundClick?: () => void
  onScaleChange?: (scale: number) => void
  nvlOptions?: Partial<NvlOptions>
  layoutOptions?: Record<string, unknown>
  interactionOptions?: InteractiveNvlWrapperProps['interactionOptions']
  toolbar?: ReactNode
  actionButton?: ReactNode
}

export function NvlCanvas({
  nodes,
  relationships,
  className,
  minZoom = 0.35,
  maxZoom = 3,
  enableZoomControls = true,
  showBackgroundDecor = true,
  isLoading = false,
  layout = 'forceDirected',
  onNodeClick,
  onNodeDoubleClick,
  onNodeHover,
  onBackgroundClick,
  onScaleChange,
  nvlOptions = {},
  layoutOptions = {},
  interactionOptions = {},
  toolbar,
  actionButton,
}: NvlCanvasProps) {
  const wrapperRef = useRef<any>(null)
  const { animationsEnabled } = useAnimations()
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isDraggingRef = useRef(false)
  const isInitialLayoutRef = useRef(true)

  // Merge with defaults
  const finalNvlOptions: Partial<NvlOptions> = useMemo(
    () => ({
      initialZoom: 0.5, // Start zoomed out
      minScale: minZoom,
      maxScale: maxZoom,
      allowDynamicMinZoom: true, // Allow zoom out beyond minScale to fit all nodes
      layout,
      renderer: 'canvas',
      ...nvlOptions,
    }),
    [minZoom, maxZoom, layout, nvlOptions]
  )

  const finalLayoutOptions = useMemo(
    () => ({
      ...(layout === 'forceDirected' && {
        simulationIterations: 350,
        gravity: 4.5, // Maximum pull toward center
        linkDistance: 25, // Very tight spacing
        charge: -100, // Minimal repulsion for tight clustering
        linkStrength: 0.98, // Maximum edge attraction
      }),
      ...layoutOptions,
    }),
    [layout, layoutOptions]
  )

  const finalInteractionOptions: InteractiveNvlWrapperProps['interactionOptions'] =
    useMemo(
      () => ({
        enablePan: true,
        enableZoom: true,
        enableDrag: true,
        enableBoxSelection: false, // Disable box selection UI
        ...interactionOptions,
      }),
      [interactionOptions]
    )

  // Trigger re-layout after drag ends to prevent overlaps
  const triggerReLayout = useCallback(() => {
    const nvlRef = wrapperRef.current

    if (
      nvlRef &&
      typeof nvlRef.getNodes === 'function' &&
      layout === 'forceDirected'
    ) {
      // Unpin all nodes (dragging pins them, preventing layout from affecting them)
      const allNodes = nvlRef.getNodes()
      allNodes.forEach((node: Node) => {
        nvlRef.unPinNode(node.id)
      })

      // Update layout options with gentler settings for re-layout
      nvlRef.setLayoutOptions({
        ...finalLayoutOptions,
        simulationIterations: 200, // Gentle re-layout
        gravity: 1.5, // Slightly less aggressive on re-layout
      })

      // Restart the force-directed simulation
      nvlRef.restart()
    }
  }, [layout, finalLayoutOptions])

  // Setup mouse event callbacks
  const mouseEventCallbacks: InteractiveNvlWrapperProps['mouseEventCallbacks'] =
    useMemo(
      () => ({
        onNodeClick: (node: Node, hitElements: any, event: MouseEvent) => {
          onNodeClick?.(node)
        },
        onNodeDoubleClick: (node: Node) => {
          onNodeDoubleClick?.(node)
        },
        onHover: (element: Node | null) => {
          // Handle hover on nodes - pass the node to callback
          if (onNodeHover) {
            onNodeHover(element)
          }
        },
        onSceneClick: () => {
          onBackgroundClick?.()
          if (onNodeHover) {
            onNodeHover(null)
          }
        },
        onPan: () => {
          // Panning enabled - NVL handles canvas panning
        },
        onZoom: (zoomLevel: number) => {
          // Zoom enabled - NVL handles the zooming
          onScaleChange?.(zoomLevel)
        },
        onDrag: (nodes: Node[], evt: MouseEvent) => {
          // Mark that dragging is happening
          isDraggingRef.current = true

          // Clear existing timeout
          if (dragTimeoutRef.current) {
            clearTimeout(dragTimeoutRef.current)
          }

          // Set new timeout - if no drag events for 500ms, drag has ended
          dragTimeoutRef.current = setTimeout(() => {
            if (isDraggingRef.current) {
              isDraggingRef.current = false
              triggerReLayout()
            }
          }, 500)
        },
      }),
      [
        onNodeClick,
        onNodeDoubleClick,
        onNodeHover,
        onBackgroundClick,
        onScaleChange,
        triggerReLayout,
      ]
    )

  // Setup NVL callbacks
  const nvlCallbacks: Partial<ExternalCallbacks> = useMemo(
    () => ({
      onLayoutDone: () => {
        console.log('[NVL] onLayoutDone fired')
      },
      onError: (error) => {
        console.error('NVL Error:', error)
      },
    }),
    []
  )

  // Auto-fit on initial load using useEffect instead of onLayoutDone callback
  useEffect(() => {
    if (!isInitialLayoutRef.current || nodes.length === 0) {
      return
    }

    console.log('[NVL] Starting auto-fit polling')

    // Poll for NVL ref to have methods available
    const pollForNvlAndFit = (attempts = 0, maxAttempts = 30) => {
      const nvlRef = wrapperRef.current

      console.log('[NVL] Polling attempt', attempts + 1, {
        hasRef: !!nvlRef,
        hasGetNodes: typeof nvlRef?.getNodes === 'function',
        hasFit: typeof nvlRef?.fit === 'function',
        nodeCount: nodes.length,
      })

      // Check if ref has NVL methods (InteractiveNvlWrapper exposes methods directly on ref)
      if (
        nvlRef &&
        typeof nvlRef.getNodes === 'function' &&
        typeof nvlRef.fit === 'function'
      ) {
        console.log('[NVL] NVL ref ready, attempting fit')
        isInitialLayoutRef.current = false

        try {
          const allNodes = nvlRef.getNodes()
          if (!allNodes || allNodes.length === 0) {
            console.warn('[NVL] No nodes in NVL instance')
            return
          }

          const nodeIds = allNodes.map((n: Node) => n.id)
          console.log('[NVL] Auto-fitting', nodeIds.length, 'nodes')

          // Only fit if there are 2+ nodes; for single node, initialZoom handles it
          if (nodeIds.length > 1) {
            nvlRef.fit(nodeIds, { duration: 500 })
            console.log('[NVL] Fit operation completed')
          } else {
            console.log('[NVL] Single node - skipping fit, using initialZoom')
          }
        } catch (error) {
          console.error('[NVL] Auto-fit failed:', error)
        }
      } else if (attempts < maxAttempts) {
        // Try again in 100ms
        setTimeout(() => pollForNvlAndFit(attempts + 1, maxAttempts), 100)
      } else {
        console.error('[NVL] NVL ref not ready after', maxAttempts, 'attempts')
      }
    }

    // Start polling after a delay to let React render the component
    const timeoutId = setTimeout(() => pollForNvlAndFit(), 500)

    return () => clearTimeout(timeoutId)
  }, [nodes])

  // Reset initial layout flag when nodes change (for navigation between different node sets)
  useEffect(() => {
    isInitialLayoutRef.current = true
  }, [nodes])

  // Cleanup timeout on unmount and add global mouseup listener for drag end detection
  useEffect(() => {
    // Add global mouseup listener to detect drag end more reliably
    const handleGlobalMouseUp = () => {
      if (isDraggingRef.current) {
        // Small delay to ensure drag event is fully processed
        setTimeout(() => {
          if (isDraggingRef.current) {
            isDraggingRef.current = false
            if (dragTimeoutRef.current) {
              clearTimeout(dragTimeoutRef.current)
            }
            triggerReLayout()
          }
        }, 100)
      }
    }

    window.addEventListener('mouseup', handleGlobalMouseUp)

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp)
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current)
      }
    }
  }, [triggerReLayout])

  return (
    <main
      className={cn(
        'relative flex-1 w-screen h-screen min-h-screen overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors cursor-grab active:cursor-grabbing',
        className
      )}
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--gp-primary) 18%, transparent), transparent 70%),
          url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='rgba(255,255,255,0.1)'/%3E%3C/svg%3E")
        `,
        backgroundSize: '100% 100%, 40px 40px',
      }}
    >
      {showBackgroundDecor && (
        <>
          <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-gp-primary/10 dark:bg-gp-primary/5 rounded-full blur-[100px] animate-blob" />
          <div className="absolute bottom-[20%] right-[20%] w-80 h-80 bg-gp-accent-glow/10 dark:bg-gp-accent-glow/5 rounded-full blur-[80px] animate-blob [animation-delay:2s]" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-75 h-75 bg-gp-goal/5 dark:bg-gp-goal/3 rounded-full blur-[80px] animate-blob [animation-delay:4s]" />
        </>
      )}

      <InteractiveNvlWrapper
        ref={wrapperRef}
        nodes={nodes}
        rels={relationships}
        layout={layout}
        layoutOptions={finalLayoutOptions}
        nvlOptions={finalNvlOptions as any}
        interactionOptions={finalInteractionOptions}
        mouseEventCallbacks={mouseEventCallbacks}
        nvlCallbacks={nvlCallbacks}
        onInitializationError={(error) => {
          console.error('NVL Initialization Error:', error)
        }}
      />

      {/* Controls and Toolbar */}
      {(enableZoomControls || actionButton || toolbar) && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30 pointer-events-none">
          {enableZoomControls && (
            <div className="relative z-40 flex items-center gap-2 p-1.5 rounded-full gp-glass dark:gp-glass shadow-xl pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  try {
                    const nvlRef = wrapperRef.current
                    if (nvlRef && typeof nvlRef.getScale === 'function') {
                      const currentScale = nvlRef.getScale()
                      if (typeof currentScale === 'number') {
                        nvlRef.setZoom(currentScale * 0.8)
                      }
                    }
                  } catch (error) {
                    console.warn('Zoom out failed:', error)
                  }
                }}
                className="cursor-pointer size-9 md:size-10 flex items-center justify-center rounded-full text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-ink-strong dark:hover:text-gp-ink-strong hover:bg-white/10 dark:hover:bg-white/20 transition-all"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined">remove</span>
              </button>
              <div className="w-px h-4 bg-gp-ink-soft/20 dark:bg-white/10" />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  try {
                    const nvlRef = wrapperRef.current
                    if (nvlRef && typeof nvlRef.getScale === 'function') {
                      const currentScale = nvlRef.getScale()
                      if (typeof currentScale === 'number') {
                        nvlRef.setZoom(currentScale * 1.2)
                      }
                    }
                  } catch (error) {
                    console.warn('Zoom in failed:', error)
                  }
                }}
                className="cursor-pointer size-9 md:size-10 flex items-center justify-center rounded-full text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-ink-strong dark:hover:text-gp-ink-strong hover:bg-white/10 dark:hover:bg-white/20 transition-all"
                title="Zoom In"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
              <div className="w-px h-4 bg-gp-ink-soft/20 dark:bg-white/10" />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  try {
                    const nvlRef = wrapperRef.current
                    if (
                      nvlRef &&
                      typeof nvlRef.getNodes === 'function' &&
                      typeof nvlRef.fit === 'function'
                    ) {
                      const allNodes = nvlRef.getNodes()
                      const nodeIds = allNodes.map((n: Node) => n.id)
                      nvlRef.fit(nodeIds, { duration: 500 })
                    }
                  } catch (error) {
                    console.warn('Fit to view failed:', error)
                  }
                }}
                className="cursor-pointer size-9 md:size-10 flex items-center justify-center rounded-full text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-ink-strong dark:hover:text-gp-ink-strong hover:bg-white/10 dark:hover:bg-white/20 transition-all"
                title="Fit to view"
              >
                <span className="material-symbols-outlined">fit_screen</span>
              </button>
            </div>
          )}

          {toolbar && <div className="pointer-events-auto">{toolbar}</div>}

          {actionButton && (
            <div className="gp-action-button-shell relative z-50 pointer-events-auto">
              {actionButton}
            </div>
          )}
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gp-surface/50 dark:bg-gp-surface-dark/50 backdrop-blur-sm z-40 pointer-events-none">
          <div className="flex flex-col items-center gap-4">
            <div
              className={cn(
                'text-gp-primary dark:text-gp-primary',
                animationsEnabled && 'animate-spin'
              )}
            >
              <span className="material-symbols-outlined text-5xl md:text-6xl">
                hourglass_bottom
              </span>
            </div>
            <p className="text-sm md:text-base font-medium text-gp-ink-muted dark:text-gp-ink-soft animate-pulse">
              Loading space details...
            </p>
          </div>
        </div>
      )}
    </main>
  )
}
