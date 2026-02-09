'use client'

import type { FieldBubbleProps } from '@/components/ui/field-bubble'
import { DraggableFieldBubble } from '@/components/canvas/draggable-field-bubble'
import { GenericCanvas } from '@/components/canvas/generic-canvas'
import { useCallback, useEffect, useState } from 'react'
import { CreateFieldModal } from '@/components/canvas/create-field-modal'
import { useAnimations } from '@/contexts/animation-context'
import { cn } from '@/lib/utils'

type BubbleSize = NonNullable<FieldBubbleProps['size']>

// Deterministic pseudo-random number in [0,1) derived from an input string and salt
function seededUnitValue(input: string, salt: number) {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i) + salt
    hash |= 0
  }
  const value = Math.abs(Math.sin(hash + salt) * 10000)
  return value - Math.floor(value)
}

export interface FieldsCanvasProps {
  fields?: (Omit<
    FieldBubbleProps,
    'position' | 'size' | 'shape' | 'animationType'
  > & { id?: string })[]
  onFieldClick?: (fieldId: string) => void
  onCreateField?: (description: string, name?: string) => void | Promise<void>
  className?: string
  isCreating?: boolean
  isLoading?: boolean
  onRefetch?: () => Promise<void>
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
  onRefetch,
}: FieldsCanvasProps) {
  const { animationsEnabled } = useAnimations()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null)
  const [fieldPositions, setFieldPositions] = useState<FieldPosition[]>([])
  const [currentScale, setCurrentScale] = useState(1)
  const [canvasSize, setCanvasSize] = useState({ width: 6000, height: 6000 })

  // Track canvas size (5x viewport to match GenericCanvas canvasScale=5)
  useEffect(() => {
    const updateCanvas = () =>
      setCanvasSize({
        width: (window.innerWidth || 1200) * 5,
        height: (window.innerHeight || 1200) * 5,
      })

    updateCanvas()
    window.addEventListener('resize', updateCanvas)
    return () => window.removeEventListener('resize', updateCanvas)
  }, [])

  const clampPosition = useCallback(
    (x: number, y: number, radius: number) => ({
      x: Math.max(radius, Math.min(canvasSize.width - radius, x)),
      y: Math.max(radius, Math.min(canvasSize.height - radius, y)),
    }),
    [canvasSize.height, canvasSize.width]
  )

  const resolveCollisions = useCallback(
    (positions: FieldPosition[]) => {
      let updated = positions
      const iterations = 6

      for (let iter = 0; iter < iterations; iter++) {
        let changed = false

        for (let i = 0; i < updated.length; i++) {
          for (let j = i + 1; j < updated.length; j++) {
            const a = updated[i]
            const b = updated[j]
            const dx = b.x - a.x
            const dy = b.y - a.y
            const dist = Math.max(Math.hypot(dx, dy), 0.001)
            const minDist = a.radius + b.radius

            if (dist < minDist) {
              const overlap = (minDist - dist + 1) / 2
              const nx = dx / dist
              const ny = dy / dist

              const movedA = clampPosition(
                a.x - nx * overlap,
                a.y - ny * overlap,
                a.radius
              )
              const movedB = clampPosition(
                b.x + nx * overlap,
                b.y + ny * overlap,
                b.radius
              )

              updated = updated.map((p, idx) => {
                if (idx === i) return { ...p, ...movedA }
                if (idx === j) return { ...p, ...movedB }
                return p
              })
              changed = true
            }
          }
        }

        if (!changed) break
      }

      return updated
    },
    [clampPosition]
  )

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

    // 5x canvas size (GenericCanvas with canvasScale=5)
    const canvasWidth = canvasSize.width
    const canvasHeight = canvasSize.height
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2
    const radialDistance = Math.min(canvasWidth, canvasHeight) / 4

    const initialPositions: FieldPosition[] = fields.map((field, idx) => {
      const randomBase = `${field.id || `field-${idx}`}-${idx}`
      const angle = seededUnitValue(randomBase, 7) * Math.PI * 2
      const radius =
        Math.pow(seededUnitValue(randomBase, 13), 0.6) * radialDistance
      const size = sizeKeyForIndex(idx)
      const bubbleRadius = radiusForSize[size]

      return {
        fieldId: field.id || `field-${idx}`,
        x: Math.cos(angle) * radius + centerX,
        y: Math.sin(angle) * radius + centerY,
        radius: bubbleRadius,
        size,
      }
    })
    return initialPositions
  }, [canvasSize.height, canvasSize.width, fields])

  // Update positions when fields change
  useEffect(() => {
    if (fields.length > 0) {
      setFieldPositions(resolveCollisions(computeFieldPositions()))
    }
  }, [fields, computeFieldPositions, resolveCollisions])

  const handleCreateField = async (description: string, name?: string) => {
    try {
      await onCreateField?.(description, name)
      setIsCreateModalOpen(false)
    } catch (err) {
      console.error('Failed to create field:', err)
    }
  }

  const handleEditField = (e: React.MouseEvent, fieldId: string) => {
    e.stopPropagation()
    setEditingFieldId(fieldId)
    setShowEditModal(true)
  }

  const handleEditFieldSuccess = async () => {
    setShowEditModal(false)
    setEditingFieldId(null)
    if (onRefetch) {
      await onRefetch()
    }
  }

  const editingField = fields.find((f) => f.id === editingFieldId)

  return (
    <>
      <GenericCanvas
        canvasScale={5}
        className={className}
        isLoading={isLoading}
        onScaleChange={setCurrentScale}
        actionButton={
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="cursor-pointer flex items-center gap-2 md:gap-3 px-4 md:px-6 h-10 md:h-14.5 rounded-full gp-glass dark:gp-glass border border-white/10 dark:border-white/10 hover:scale-105 hover:border-white/20 dark:hover:border-white/20 hover:bg-white/10 dark:hover:bg-white/20 transition-all duration-300 group"
            style={{
              boxShadow: 'none',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
                `0 0 50px color-mix(in srgb, var(--gp-primary) 50%, transparent)`
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
            }}
          >
            <div className="absolute inset-0 rounded-full bg-linear-to-tr from-gp-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="material-symbols-outlined text-gp-ink-muted dark:text-gp-ink-soft group-hover:text-gp-primary dark:group-hover:text-gp-primary text-[20px] md:text-[24px] transition-colors relative z-10">
              add_circle
            </span>
            <span className="hidden lg:inline text-sm md:text-base font-semibold text-gp-ink-strong dark:text-gp-ink-strong group-hover:text-gp-primary dark:group-hover:text-gp-primary transition-colors relative z-10">
              Add New Field
            </span>
          </button>
        }
      >
        {isLoading ? (
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
                    setFieldPositions((prev) => {
                      const clamped = clampPosition(x, y, pos.radius)
                      const updated = prev.map((p) =>
                        p.fieldId === pos.fieldId
                          ? { ...p, x: clamped.x, y: clamped.y }
                          : p
                      )
                      return resolveCollisions(updated)
                    })
                  }
                  onClick={() => onFieldClick?.(field.id || field.title || '')}
                  onEditClick={(e) =>
                    handleEditField(e, field.id || field.title || '')
                  }
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

      <CreateFieldModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingFieldId(null)
        }}
        isEditing={true}
        fieldId={editingFieldId || undefined}
        initialName={editingField?.title || ''}
        onEditSuccess={handleEditFieldSuccess}
      />
    </>
  )
}
