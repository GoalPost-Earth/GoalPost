'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import { cn } from '@/lib/utils'

export interface GenericCanvasProps {
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
}

export function GenericCanvas({
  children,
  className,
  canvasScale = 3,
  minZoom = 0.35,
  maxZoom = 3,
  enablePanning = true,
  enableZoomControls = true,
  actionButton,
  onScaleChange,
  showBackgroundDecor = true,
}: GenericCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
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
        'relative flex-1 w-screen h-screen min-h-screen overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors',
        className
      )}
    >
      <div className="w-full h-full">
        <TransformWrapper
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
                </div>

                {children && (
                  <div className="relative w-full h-full">{children}</div>
                )}
              </TransformComponent>

              {(enableZoomControls || actionButton) && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
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
                      <div className="w-px h-4 bg-gp-ink-soft/20 dark:bg-white/10" />
                      <button
                        className="cursor-pointer size-9 md:size-10 flex items-center justify-center rounded-full text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-ink-strong dark:hover:text-gp-ink-strong hover:bg-white/10 dark:hover:bg-white/20 transition-all"
                        title="Filter Fields"
                      >
                        <span className="material-symbols-outlined">
                          filter_list
                        </span>
                      </button>
                    </div>
                  )}

                  {actionButton && (
                    <div className="gp-action-button-shell">{actionButton}</div>
                  )}
                </div>
              )}
            </>
          )}
        </TransformWrapper>
      </div>
    </main>
  )
}
