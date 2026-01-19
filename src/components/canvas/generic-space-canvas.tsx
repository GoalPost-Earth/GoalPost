'use client'

import { GenericCanvas, type GenericCanvasProps } from './generic-canvas'

export interface GenericSpaceCanvasProps extends Omit<
  GenericCanvasProps,
  'canvasScale' | 'enableZoomControls' | 'showBackgroundDecor'
> {
  isLoading?: boolean
  isEmpty?: boolean
  emptyStateMessage?: {
    title: string
    subtitle?: string
  }
}

export function GenericSpaceCanvas({
  children,
  className,
  minZoom = 0.35,
  maxZoom = 3,
  enablePanning = true,
  actionButton,
  onScaleChange,
  isLoading = false,
  isEmpty = false,
  emptyStateMessage = {
    title: 'No spaces yet. Create your first one!',
    subtitle: undefined,
  },
}: GenericSpaceCanvasProps) {
  return (
    <GenericCanvas
      canvasScale={2}
      minZoom={minZoom}
      maxZoom={maxZoom}
      enablePanning={enablePanning}
      enableZoomControls={true}
      actionButton={actionButton}
      onScaleChange={onScaleChange}
      showBackgroundDecor={true}
      className={className}
    >
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-gp-surface/50 dark:bg-gp-surface-dark/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-5xl text-gp-primary animate-spin">
              hourglass_bottom
            </span>
            <p className="text-sm font-medium text-gp-ink-muted dark:text-gp-ink-soft">
              Loading your spaces...
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {isEmpty && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gp-ink-muted dark:text-gp-ink-soft mb-2">
              {emptyStateMessage.title}
            </p>
            {emptyStateMessage.subtitle && (
              <p className="text-sm text-gp-ink-soft dark:text-white/40">
                {emptyStateMessage.subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Children (space bubbles) */}
      {children && !isLoading && (
        <div className="relative w-full h-full">{children}</div>
      )}
    </GenericCanvas>
  )
}
