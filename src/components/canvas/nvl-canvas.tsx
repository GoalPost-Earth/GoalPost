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
import { useNvlPinchZoom } from '@/hooks'
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
  layout?: 'forceDirected' | 'hierarchical' | 'free'
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
  emptyState?: ReactNode
  /** Cap zoom after initial fit so small node-sets are not over-zoomed. Default 1.4 leaves extra room so HTML bubbles do not clip at the canvas edges. */
  maxInitialZoom?: number
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
  emptyState,
  maxInitialZoom = 1.4,
}: NvlCanvasProps) {
  const wrapperRef = useRef<any>(null)
  const { animationsEnabled } = useAnimations()
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isDraggingRef = useRef(false)
  const isInitialLayoutRef = useRef(true)
  // Keep a ref so the stable useMemo callbacks always read the latest value
  const maxInitialZoomRef = useRef(maxInitialZoom)
  useEffect(() => {
    maxInitialZoomRef.current = maxInitialZoom
  }, [maxInitialZoom])

  const fitNodesWithPadding = useCallback(
    (nodeIds: string[], duration = 400) => {
      const nvlRef = wrapperRef.current
      if (!nvlRef || typeof nvlRef.fit !== 'function' || nodeIds.length <= 1) {
        return
      }

      // NVL fit() has no padding option. Emulate viewport padding by capping
      // the fit zoom so fitted nodes remain inset from the canvas edges.
      nvlRef.fit(nodeIds, {
        duration,
        maxZoom: Math.min(maxZoom, maxInitialZoomRef.current),
      })

      // NVL fits using the graph node bounds, but our rendered HTML bubbles are
      // visually larger than those hitboxes. Apply a small extra zoom-out after
      // the fit animation so bubble edges stay fully visible.
      setTimeout(() => {
        const currentScale = nvlRef.getScale?.()
        if (typeof currentScale !== 'number') {
          return
        }

        const paddedScale = Math.min(
          currentScale * 0.88,
          maxInitialZoomRef.current
        )

        if (paddedScale < currentScale) {
          nvlRef.setZoom?.(paddedScale)
        }
      }, duration + 100)
    },
    [maxZoom]
  )

  // Merge with defaults
  const finalNvlOptions: Partial<NvlOptions> = useMemo(
    () => ({
      initialZoom: 0.5,
      minScale: minZoom,
      maxScale: maxZoom,
      allowDynamicMinZoom: true,
      layout,
      renderer: 'canvas',
      ...nvlOptions,
    }),
    [minZoom, maxZoom, layout, nvlOptions]
  )

  const finalLayoutOptions = useMemo(
    () => ({
      ...(layout === 'forceDirected' && {
        simulationIterations: 400,
        gravity: 25,
        linkDistance: 1,
        charge: 0,
        linkStrength: 1.0,
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
        enableBoxSelection: false,
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

      // Update layout options with tight settings to restore clustering after drag
      nvlRef.setLayoutOptions({
        ...finalLayoutOptions,
        simulationIterations: 250,
        gravity: 20,
        charge: 0,
        linkDistance: 1,
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

  // Setup NVL callbacks — fit nodes once the simulation finishes so they are
  // centered and clustered rather than spread across the canvas mid-simulation.
  const nvlCallbacks: Partial<ExternalCallbacks> = useMemo(
    () => ({
      onLayoutDone: () => {
        // Only fit on the initial layout for this node set (not after drag re-layouts)
        if (!isInitialLayoutRef.current) return
        isInitialLayoutRef.current = false

        const nvlRef = wrapperRef.current
        if (!nvlRef || typeof nvlRef.fit !== 'function') return

        try {
          const allNodes = nvlRef.getNodes?.() ?? []
          const nodeIds = (allNodes as Node[]).map((n) => n.id)
          if (nodeIds.length > 1) {
            fitNodesWithPadding(nodeIds)
          }
        } catch (error) {
          console.error('[NVL] Auto-fit on layout done failed:', error)
        }
      },
      onError: (error) => {
        console.error('NVL Error:', error)
      },
    }),
    [fitNodesWithPadding]
  )

  // Fallback auto-fit: if onLayoutDone never fires, attempt fit after enough time
  // for the simulation to have fully converged (simulationIterations * ~4ms).
  useEffect(() => {
    if (nodes.length === 0) return

    const timeoutId = setTimeout(() => {
      // onLayoutDone already handled it
      if (!isInitialLayoutRef.current) return

      const nvlRef = wrapperRef.current
      if (!nvlRef || typeof nvlRef.fit !== 'function') return

      try {
        const allNodes = nvlRef.getNodes?.() ?? []
        const nodeIds = (allNodes as Node[]).map((n) => n.id)
        if (nodeIds.length > 1) {
          isInitialLayoutRef.current = false
          fitNodesWithPadding(nodeIds)
        }
      } catch (error) {
        console.error('[NVL] Fallback auto-fit failed:', error)
      }
    }, 2500) // Wait well beyond simulation convergence time

    return () => clearTimeout(timeoutId)
  }, [nodes, fitNodesWithPadding])

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

  // Pinch-to-zoom for touch devices (iPad / phones). NVL's built-in zoom only
  // listens to `wheel` events, which touch never emits for a pinch — this hook
  // bridges the gesture into NVL's own setZoom(). The returned callback ref
  // goes on the wrapping element, which carries `touch-action: none` (below)
  // so the browser hands us the gesture.
  const pinchSurfaceRef = useNvlPinchZoom({ nvlRef: wrapperRef, onScaleChange })

  return (
    <main
      className={cn(
        // Fill the host container, not the viewport: NvlCanvas always mounts
        // inside CanvasHost's bounded slot (viewport minus studio chrome).
        // `w-screen h-screen` overflowed that slot — clipping the bottom zoom
        // controls off-screen on mobile and overflowing horizontally in the
        // docked split view.
        'relative flex-1 w-full h-full overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors cursor-grab active:cursor-grabbing',
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

      {/* touch-action:none lets our pinch handler claim the gesture before the
          browser turns it into a native page zoom; NVL drives pan/drag in JS so
          disabling native touch scrolling here is correct. */}
      <div
        ref={pinchSurfaceRef}
        className="absolute inset-0"
        style={{ touchAction: 'none' }}
      >
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
      </div>

      {/* Empty State */}
      {!isLoading && nodes.length === 0 && emptyState && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="pointer-events-auto">{emptyState}</div>
        </div>
      )}

      {/* Controls and Toolbar */}
      {(enableZoomControls || actionButton || toolbar) && (
        // `flex-wrap` + a viewport-bounded max-width keep the row from
        // overflowing (and clipping the zoom pill) on narrow screens where the
        // zoom controls + a wide action button can't sit on one centered line.
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-wrap items-center justify-center gap-2 sm:gap-4 max-w-[calc(100%-1.5rem)] z-30 pointer-events-none">
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

                      if (nodeIds.length <= 1) {
                        // Avoid extreme zoom when only one node is present.
                        const targetZoom = Math.min(1, maxZoom)
                        nvlRef.setZoom?.(targetZoom)
                        return
                      }

                      fitNodesWithPadding(nodeIds, 500)
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
