import type { FieldBubbleProps } from '@/components/ui/field-bubble'

type FieldSize = NonNullable<FieldBubbleProps['size']>

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))
const INITIAL_SPIRAL_STEP = 18

const visualRadiusMap: Record<FieldSize, number> = {
  sm: 90,
  md: 110,
  lg: 140,
  xl: 220,
}

export const fieldBubbleHitboxSizeMap: Record<FieldSize, number> = {
  sm: 80,
  md: 100,
  lg: 130,
  xl: 210,
}

export interface ClusteredFieldNodePosition {
  fieldId: string
  size: FieldSize
  hitboxSize: number
  x: number
  y: number
}

function createSeedPosition(index: number) {
  if (index === 0) {
    return { x: 0, y: 0 }
  }

  const angle = index * GOLDEN_ANGLE
  const radius = Math.sqrt(index) * INITIAL_SPIRAL_STEP

  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  }
}

export function createClusteredFieldNodePositions(
  fields: Array<{ id?: string; size: FieldSize }>,
  desiredGap = 30
): ClusteredFieldNodePosition[] {
  const positions = fields.map((field, index) => {
    const seed = createSeedPosition(index)
    const fieldId = field.id || `field-${index}`

    return {
      fieldId,
      size: field.size,
      hitboxSize: fieldBubbleHitboxSizeMap[field.size],
      x: seed.x,
      y: seed.y,
    }
  })

  for (let iteration = 0; iteration < 80; iteration++) {
    let changed = false

    for (let firstIndex = 0; firstIndex < positions.length; firstIndex++) {
      for (
        let secondIndex = firstIndex + 1;
        secondIndex < positions.length;
        secondIndex++
      ) {
        const first = positions[firstIndex]
        const second = positions[secondIndex]
        const firstRadius = visualRadiusMap[first.size]
        const secondRadius = visualRadiusMap[second.size]
        const dx = second.x - first.x
        const dy = second.y - first.y
        const distance = Math.hypot(dx, dy)
        const minimumDistance = firstRadius + secondRadius + desiredGap

        if (distance >= minimumDistance) {
          continue
        }

        const overlap = (minimumDistance - Math.max(distance, 0.001)) / 2
        const fallbackAngle = (firstIndex + secondIndex + 1) * GOLDEN_ANGLE
        const normalX =
          distance > 0.001 ? dx / distance : Math.cos(fallbackAngle)
        const normalY =
          distance > 0.001 ? dy / distance : Math.sin(fallbackAngle)

        first.x -= normalX * overlap
        first.y -= normalY * overlap
        second.x += normalX * overlap
        second.y += normalY * overlap
        changed = true
      }
    }

    if (!changed) {
      break
    }
  }

  const centroidX =
    positions.reduce((total, position) => total + position.x, 0) /
    Math.max(positions.length, 1)
  const centroidY =
    positions.reduce((total, position) => total + position.y, 0) /
    Math.max(positions.length, 1)

  return positions.map((position) => ({
    ...position,
    x: Math.round(position.x - centroidX),
    y: Math.round(position.y - centroidY),
  }))
}
