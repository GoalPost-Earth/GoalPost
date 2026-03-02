'use client'

import { ReactNode, useRef, useMemo } from 'react'
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

  // Merge with defaults
  const finalNvlOptions: Partial<NvlOptions> = useMemo(
    () => ({
      initialZoom: 1,
      minScale: minZoom,
      maxScale: maxZoom,
      layout,
      renderer: 'canvas',
      ...nvlOptions,
    }),
    [minZoom, maxZoom, layout, nvlOptions]
  )

  const finalLayoutOptions = useMemo(
    () => ({
      ...(layout === 'forceDirected' && {
        simulationIterations: 200,
        gravity: -10,
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
          // Drag enabled - NVL handles node dragging
        },
      }),
      [
        onNodeClick,
        onNodeDoubleClick,
        onNodeHover,
        onBackgroundClick,
        onScaleChange,
      ]
    )

  // Setup NVL callbacks
  const nvlCallbacks: Partial<ExternalCallbacks> = useMemo(
    () => ({
      onLayoutDone: () => {
        // Layout complete
      },
      onError: (error) => {
        console.error('NVL Error:', error)
      },
    }),
    []
  )

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
                    const currentScale = wrapperRef.current?.getScale?.()
                    if (typeof currentScale === 'number') {
                      wrapperRef.current?.setZoom?.(currentScale * 0.8)
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
                    const currentScale = wrapperRef.current?.getScale?.()
                    if (typeof currentScale === 'number') {
                      wrapperRef.current?.setZoom?.(currentScale * 1.2)
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
                    if (wrapperRef.current?.fit) {
                      wrapperRef.current.fit()
                    } else if (wrapperRef.current?.camera?.reset) {
                      wrapperRef.current.camera.reset()
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
