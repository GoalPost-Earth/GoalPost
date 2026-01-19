'use client'

import type { FieldBubbleProps } from '@/components/ui/field-bubble'
import { DraggableFieldBubble } from '@/components/canvas/draggable-field-bubble'
import { GenericCanvas } from '@/components/canvas/generic-canvas'
import { useCallback, useEffect, useState } from 'react'
import { CreateFieldModal } from '@/components/canvas/create-field-modal'

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [fieldPositions, setFieldPositions] = useState<FieldPosition[]>([])
  const [currentScale, setCurrentScale] = useState(1)

  // Compute positions based on fields
  const computeFieldPositions = useCallback(() => {
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

    // 3x canvas size (GenericCanvas default)
    const canvasWidth = (window.innerWidth || 1200) * 3
    const canvasHeight = (window.innerHeight || 1200) * 3
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2
    const radialDistance = Math.min(canvasWidth, canvasHeight) / 4

    const initialPositions: FieldPosition[] = fields.map((field, idx) => {
      const angle = (idx / Math.max(fields.length, 1)) * Math.PI * 2
      const size = sizeKeyForIndex(idx)
      const radius = radiusForSize[size]

      return {
        fieldId: field.id || `field-${idx}`,
        x: Math.cos(angle) * radialDistance + centerX,
        y: Math.sin(angle) * radialDistance + centerY,
        radius,
        size,
      }
    })
    return initialPositions
  }, [fields])

  // Update positions when fields change
  useEffect(() => {
    setFieldPositions(computeFieldPositions())
  }, [fields, computeFieldPositions])

  const handleCreateField = async (description: string, name?: string) => {
    try {
      await onCreateField?.(description, name)
      setIsCreateModalOpen(false)
    } catch (err) {
      console.error('Failed to create field:', err)
    }
  }

  return (
    <>
      <GenericCanvas
        className={className}
        onScaleChange={setCurrentScale}
        actionButton={
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
        }
      >
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
                  scale={currentScale}
                  onPositionChange={(x, y) =>
                    setFieldPositions((prev) =>
                      prev.map((p) =>
                        p.fieldId === pos.fieldId ? { ...p, x, y } : p
                      )
                    )
                  }
                  onClick={() => onFieldClick?.(field.id || field.title || '')}
                  className="transition-opacity duration-200"
                />
              )
            })}
          </div>
        )}
      </GenericCanvas>

      <CreateFieldModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateField={handleCreateField}
        isLoading={isCreating}
      />
    </>
  )
}
