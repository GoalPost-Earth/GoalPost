'use client'

import { ReactNode, useRef, useState, useEffect } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { cn } from '@/lib/utils'
import { useAnimations } from '@/contexts/animation-context'

export interface GenericPulseCanvasProps {
  children?: ReactNode
  className?: string
  canvasScale?: 5 | 4 | 3 | 2 | 1
  minZoom?: number
  maxZoom?: number
  enablePanning?: boolean
  enableZoomControls?: boolean
  actionButton?: ReactNode
  onScaleChange?: (scale: number) => void
  showBackgroundDecor?: boolean
  isLoading?: boolean
  isEmpty?: boolean
  emptyStateMessage?: {
    title: string
    subtitle?: string
  }
}

export function GenericPulseCanvas({
  children,
  className,
  canvasScale = 5,
  minZoom = 0.5,
  maxZoom = 3,
  enablePanning = true,
  enableZoomControls = true,
  actionButton,
  onScaleChange,
  showBackgroundDecor = true,
  isLoading = false,
  isEmpty = false,
  emptyStateMessage = {
    title: 'No pulses yet',
    subtitle: 'Create one with the button below',
  },
}: GenericPulseCanvasProps) {
  const { animationsEnabled } = useAnimations()
  const canvasRef = useRef<HTMLDivElement>(null)
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformRef = useRef<any>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 1200 })
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateCanvasSize = () => {
      const width = (window.innerWidth || 1200) * canvasScale
      const height = (window.innerHeight || 1200) * canvasScale
      setCanvasSize({ width, height })
      setViewportSize({
        width: window.innerWidth || 1200,
        height: window.innerHeight || 1200,
      })
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [canvasScale])

  // Auto-zoom to maximum when loading completes
  useEffect(() => {
    if (!isLoading && transformRef.current?.setScale) {
      setTimeout(() => {
        transformRef.current?.setScale?.(maxZoom)
      }, 100)
    }
  }, [isLoading, maxZoom])

  const initialPositionX = viewportSize.width
    ? -(canvasSize.width - viewportSize.width) / 2
    : 0
  const initialPositionY = viewportSize.height
    ? -(canvasSize.height - viewportSize.height) / 2
    : 0

  const handleScaleChange = (scale: number) => {
    onScaleChange?.(scale)
  }

  return (
    <main
      ref={canvasRef}
      className={cn(
        'relative w-full h-screen overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors',
        className
      )}
    >
      <div className="w-full h-full">
        <TransformWrapper
          ref={transformRef}
          key={`${canvasSize.width}x${canvasSize.height}`}
          initialScale={1}
          initialPositionX={initialPositionX}
          initialPositionY={initialPositionY}
          minScale={minZoom}
          maxScale={maxZoom}
          wheel={{ step: 0.1 }}
          pinch={{ step: 5 }}
          panning={{ disabled: !enablePanning, velocityDisabled: true }}
          doubleClick={{ disabled: false }}
          onTransformed={(ctx) => handleScaleChange(ctx.state.scale)}
        >
          {({ zoomIn, zoomOut }) => (
            <>
              <TransformComponent
                wrapperClass="w-full h-full"
                contentClass="w-full h-full relative"
                wrapperStyle={{ width: '100%', height: '100%' }}
                contentStyle={{
                  width: `${canvasSize.width}px`,
                  height: `${canvasSize.height}px`,
                }}
              >
                <div
                  className={cn(
                    'w-full h-full absolute inset-0 bg-gp-surface dark:bg-gp-surface-dark'
                  )}
                >
                  {showBackgroundDecor && (
                    <>
                      {/* Radial gradient overlay tinted by theme primary */}
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage:
                            'radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--gp-primary) 14%, transparent), transparent 70%)',
                        }}
                      />

                      {/* Dot grid pattern */}
                      <div
                        className="absolute inset-0 opacity-40 dark:opacity-20"
                        style={{
                          backgroundImage:
                            'radial-gradient(color-mix(in srgb, var(--gp-ink-soft) 75%, transparent) 1px, transparent 1px)',
                          backgroundSize: '60px 60px',
                        }}
                      />

                      {/* Pulse dots (background animation) */}
                      <div
                        className={cn(
                          'absolute top-[20%] left-[10%] size-1 bg-gp-primary/40 rounded-full',
                          animationsEnabled && 'animate-pulse'
                        )}
                      />
                      <div
                        className={cn(
                          'absolute top-[80%] left-[20%] size-1.5 bg-gp-primary/35 rounded-full',
                          animationsEnabled && 'animate-pulse'
                        )}
                      />
                      <div
                        className={cn(
                          'absolute top-[40%] right-[15%] size-1 bg-gp-primary/40 rounded-full',
                          animationsEnabled && 'animate-float'
                        )}
                      />
                    </>
                  )}

                  {/* Loading State */}
                  {isLoading && (
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
                          Loading pulses...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {isEmpty && !isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-slate-600 dark:text-white/60 mb-2">
                          {emptyStateMessage.title}
                        </p>
                        {emptyStateMessage.subtitle && (
                          <p className="text-xs text-slate-500 dark:text-white/40">
                            {emptyStateMessage.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Children (pulse nodes) */}
                  {children && !isLoading && (
                    <div className="relative w-full h-full">{children}</div>
                  )}
                </div>
              </TransformComponent>

              {/* Bottom Action Button */}
              {(enableZoomControls || actionButton) && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4">
                  {enableZoomControls && (
                    <div className="flex items-center gap-2 p-1.5 rounded-full gp-glass dark:gp-glass shadow-xl">
                      <button
                        onClick={() => zoomOut()}
                        className="cursor-pointer size-9 md:size-10 flex items-center justify-center rounded-full text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-ink-strong dark:hover:text-gp-ink-strong hover:bg-white/10 dark:hover:bg-white/20 transition-all"
                        title="Zoom Out"
                      >
                        <span className="material-symbols-outlined">
                          remove
                        </span>
                      </button>
                      <div className="w-px h-4 bg-gp-ink-soft/20 dark:bg-white/10" />
                      <button
                        onClick={() => zoomIn()}
                        className="cursor-pointer size-9 md:size-10 flex items-center justify-center rounded-full text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-ink-strong dark:hover:text-gp-ink-strong hover:bg-white/10 dark:hover:bg-white/20 transition-all"
                        title="Zoom In"
                      >
                        <span className="material-symbols-outlined">add</span>
                      </button>
                    </div>
                  )}

                  {actionButton}
                </div>
              )}
            </>
          )}
        </TransformWrapper>
      </div>
    </main>
  )
}
