'use client'

import type { FieldBubbleProps } from '@/components/ui/field-bubble'
import { DraggableFieldBubble } from '@/components/canvas/draggable-field-bubble'
import { cn } from '@/lib/utils'
import { useRef, useState, useEffect, useCallback } from 'react'
import { CreateFieldModal } from '@/components/canvas/create-field-modal'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

type BubbleSize = NonNullable<FieldBubbleProps['size']>

export interface FieldsCanvasProps {
  fields?: (Omit<
    FieldBubbleProps,
    'position' | 'size' | 'shape' | 'animationType'
  > & { id?: string })[]
  onFieldClick?: (fieldId: string) => void
  onCreateField?: (description: string, name?: string) => void | Promise<void>
  className?: string
  spaceId?: string
  isCreating?: boolean
  isLoading?: boolean
}

interface FieldPosition {
  fieldId: string
  x: number
  y: number
  radius: number
  size: BubbleSize
}

export function FieldsCanvas({
  fields = [],
  onFieldClick,
  onCreateField,
  className,
  isCreating = false,
  isLoading = false,
}: FieldsCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [fieldPositions, setFieldPositions] = useState<FieldPosition[]>([])

  useEffect(() => {
    const sizeKeyForIndex = (idx: number): BubbleSize => {
      const sizeKeys: BubbleSize[] = [
        'xl',
        'lg',
        'md',
        'md',
        'sm',
        'md',
        'md',
        'md',
      ]
      return sizeKeys[idx % sizeKeys.length]
    }

    const radiusForSize: Record<BubbleSize, number> = {
      sm: 90,
      md: 110,
      lg: 140,
      xl: 220,
    }

    const initialPositions: FieldPosition[] = fields.map((field, idx) => {
      const angle = (idx / Math.max(fields.length, 1)) * Math.PI * 2
      const radialDistance = 250
      const size = sizeKeyForIndex(idx)
      const radius = radiusForSize[size]

      return {
        fieldId: field.id || `field-${idx}`,
        x: Math.cos(angle) * radialDistance + 400,
        y: Math.sin(angle) * radialDistance + 300,
        radius,
        size,
      }
    })
    setFieldPositions(initialPositions)
  }, [fields])

  const handleCreateField = async (description: string, name?: string) => {
    try {
      await onCreateField?.(description, name)
      setIsCreateModalOpen(false)
    } catch (err) {
      console.error('Failed to create field:', err)
    }
  }

  const handleFieldPositionChange = useCallback(
    (fieldId: string, x: number, y: number) => {
      setFieldPositions((prev) =>
        prev.map((pos) => (pos.fieldId === fieldId ? { ...pos, x, y } : pos))
      )
    },
    []
  )

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
          initialScale={1}
          initialPositionX={0}
          initialPositionY={0}
          minScale={0.5}
          maxScale={3}
          wheel={{ step: 0.1 }}
          pinch={{ step: 5 }}
          panning={{ disabled: true }}
          doubleClick={{ disabled: false }}
        >
          {({ zoomIn, zoomOut }) => (
            <>
              <TransformComponent
                wrapperClass="w-full h-full"
                contentClass="w-full h-full relative"
                wrapperStyle={{ width: '100%', height: '100%' }}
                contentStyle={{ width: '100%', height: '100%' }}
              >
                <div
                  className={cn(
                    'w-full h-full absolute inset-0 bg-gp-surface dark:bg-gp-surface-dark'
                  )}
                  style={{
                    backgroundImage: `
                radial-gradient(circle at 50% 50%, rgba(19,127,236,0.08), transparent 70%),
                url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='rgba(255,255,255,0.1)'/%3E%3C/svg%3E")
              `,
                    backgroundSize: '100% 100%, 40px 40px',
                  }}
                >
                  <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-gp-primary/10 dark:bg-gp-primary/5 rounded-full blur-[100px] animate-blob" />
                  <div className="absolute bottom-[20%] right-[20%] w-80 h-80 bg-gp-accent-glow/10 dark:bg-gp-accent-glow/5 rounded-full blur-[80px] animate-blob [animation-delay:2s]" />
                  <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-75 h-75 bg-gp-goal/5 dark:bg-gp-goal/3 rounded-full blur-[80px] animate-blob [animation-delay:4s]" />
                </div>

                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center z-50 bg-gp-surface/50 dark:bg-gp-surface-dark/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                      <span className="material-symbols-outlined text-5xl text-gp-primary animate-spin">
                        hourglass_bottom
                      </span>
                      <p className="text-sm font-medium text-gp-ink-muted dark:text-gp-ink-soft">
                        Loading fields...
                      </p>
                    </div>
                  </div>
                ) : fieldPositions.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-gp-ink-muted dark:text-gp-ink-soft mb-2">
                        No fields yet
                      </p>
                      <p className="text-sm text-gp-ink-soft dark:text-white/40 mb-6">
                        Create a field to organize your thoughts and intentions
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    {fieldPositions.map((pos, idx) => {
                      const field = fields[idx]
                      if (!field) return null

                      return (
                        <DraggableFieldBubble
                          key={pos.fieldId}
                          {...field}
                          size={pos.size}
                          canvasPosition={{ x: pos.x, y: pos.y }}
                          radius={pos.radius}
                          onPositionChange={(x, y) =>
                            handleFieldPositionChange(pos.fieldId, x, y)
                          }
                          onClick={() =>
                            onFieldClick?.(field.id || field.title || '')
                          }
                          className="transition-opacity duration-200"
                        />
                      )
                    })}
                  </div>
                )}
              </TransformComponent>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
                <div className="flex items-center gap-2 p-1.5 rounded-full gp-glass dark:gp-glass shadow-xl">
                  <button
                    onClick={() => zoomOut()}
                    className="cursor-pointer size-9 md:size-10 flex items-center justify-center rounded-full text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-ink-strong dark:hover:text-gp-ink-strong hover:bg-white/10 dark:hover:bg-white/20 transition-all"
                    title="Zoom Out"
                  >
                    <span className="material-symbols-outlined">remove</span>
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

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="cursor-pointer flex items-center gap-2 md:gap-3 px-4 md:px-6 h-10 md:h-14.5 rounded-full gp-glass dark:gp-glass border border-white/10 dark:border-white/10 hover:scale-105 hover:border-white/20 dark:hover:border-white/20 hover:bg-white/10 dark:hover:bg-white/20 hover:shadow-[0_0_50px_rgba(19,127,236,0.2)] transition-all duration-300 group"
                >
                  <div className="absolute inset-0 rounded-full bg-linear-to-tr from-gp-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="material-symbols-outlined text-gp-ink-muted dark:text-gp-ink-soft group-hover:text-gp-primary dark:group-hover:text-gp-primary text-[20px] md:text-[24px] transition-colors relative z-10">
                    add_circle
                  </span>
                  <span className="hidden md:inline text-sm md:text-base font-semibold text-gp-ink-strong dark:text-gp-ink-strong group-hover:text-gp-primary dark:group-hover:text-gp-primary transition-colors relative z-10">
                    Add New Field
                  </span>
                </button>
              </div>
            </>
          )}
        </TransformWrapper>
      </div>

      <CreateFieldModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateField={handleCreateField}
        isLoading={isCreating}
      />
    </main>
  )
}
