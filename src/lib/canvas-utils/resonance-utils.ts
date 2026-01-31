/**
 * Resonance Canvas Utilities
 *
 * Contains helper functions, callbacks, and utilities for the resonance visualization system.
 */

import {
  FieldResonanceNode,
  ResonanceLinkNode,
  PulseNode,
} from './resonance-types'

const FIELD_NODE_RADIUS = 90
const LINK_NODE_RADIUS = 50

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Determines the pulse type based on GraphQL typename
 */
export function getPulseType(typename: string): 'goal' | 'resource' | 'story' {
  if (typename === 'GoalPulse') return 'goal'
  if (typename === 'ResourcePulse') return 'resource'
  return 'story'
}

/**
 * Gets the appropriate Material UI icon for a pulse type
 */
export function getPulseIcon(type: 'goal' | 'resource' | 'story'): string {
  if (type === 'goal') return 'flag'
  if (type === 'resource') return 'diamond'
  return 'auto_stories'
}

// ============================================================================
// Collision & Layout Functions
// ============================================================================

/**
 * Clamps a position to stay within canvas bounds
 */
export const createClampPosition = (canvasSize: {
  width: number
  height: number
}) => {
  return (x: number, y: number, radius: number) => ({
    x: Math.max(radius, Math.min(canvasSize.width - radius, x)),
    y: Math.max(radius, Math.min(canvasSize.height - radius, y)),
  })
}

/**
 * Helper to calculate distance between two points
 */
function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1)
}

/**
 * Relaxes the layout by pushing overlapping nodes apart
 */
export const createRelaxLayout = (
  clampPosition: ReturnType<typeof createClampPosition>
) => {
  return (
    initialFields: FieldResonanceNode[],
    initialLinks: ResonanceLinkNode[]
  ) => {
    let fields = initialFields
    let links = initialLinks

    const pushPair = <T extends { x: number; y: number }>(
      a: T,
      b: T,
      ra: number,
      rb: number
    ): [T, T, boolean] => {
      const minDist = ra + rb
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dist = Math.max(Math.hypot(dx, dy), 0.001)
      if (dist >= minDist) return [a, b, false]

      const overlap = minDist - dist + 1
      const nx = dx / dist
      const ny = dy / dist
      const shiftA = overlap * 0.5
      const shiftB = overlap * 0.5

      const clampedA = clampPosition(a.x - nx * shiftA, a.y - ny * shiftA, ra)
      const movedA = {
        ...a,
        x: clampedA.x,
        y: clampedA.y,
      } as T

      const clampedB = clampPosition(b.x + nx * shiftB, b.y + ny * shiftB, rb)
      const movedB = {
        ...b,
        x: clampedB.x,
        y: clampedB.y,
      } as T

      return [movedA, movedB, true]
    }

    const iterations = 8
    for (let iter = 0; iter < iterations; iter++) {
      let changed = false

      for (let i = 0; i < fields.length; i++) {
        for (let j = i + 1; j < fields.length; j++) {
          const [fi, fj, moved] = pushPair(
            fields[i],
            fields[j],
            FIELD_NODE_RADIUS,
            FIELD_NODE_RADIUS
          )
          if (moved) {
            fields = fields.map((f, idx) =>
              idx === i ? fi : idx === j ? fj : f
            )
            changed = true
          }
        }
      }

      for (let i = 0; i < links.length; i++) {
        for (let j = i + 1; j < links.length; j++) {
          const [li, lj, moved] = pushPair(
            links[i],
            links[j],
            LINK_NODE_RADIUS,
            LINK_NODE_RADIUS
          )
          if (moved) {
            links = links.map((l, idx) => (idx === i ? li : idx === j ? lj : l))
            changed = true
          }
        }
      }

      for (let i = 0; i < fields.length; i++) {
        for (let j = 0; j < links.length; j++) {
          const dx = links[j].x - fields[i].x
          const dy = links[j].y - fields[i].y
          const dist = Math.max(Math.hypot(dx, dy), 0.001)
          const minDist = FIELD_NODE_RADIUS + LINK_NODE_RADIUS

          if (dist < minDist) {
            const overlap = minDist - dist + 1
            const nx = dx / dist
            const ny = dy / dist
            const shiftField = overlap * 0.5
            const shiftLink = overlap * 0.5

            const clampedField = clampPosition(
              fields[i].x - nx * shiftField,
              fields[i].y - ny * shiftField,
              FIELD_NODE_RADIUS
            )
            fields = fields.map((f, idx) =>
              idx === i
                ? ({
                    ...f,
                    x: clampedField.x,
                    y: clampedField.y,
                  } as FieldResonanceNode)
                : f
            )

            const clampedLink = clampPosition(
              links[j].x + nx * shiftLink,
              links[j].y + ny * shiftLink,
              LINK_NODE_RADIUS
            )
            links = links.map((l, idx) =>
              idx === j
                ? ({
                    ...l,
                    x: clampedLink.x,
                    y: clampedLink.y,
                  } as ResonanceLinkNode)
                : l
            )
            changed = true
          }
        }
      }

      if (!changed) break
    }

    return { fields, links }
  }
}

/**
 * Resolves collisions when a node is dragged
 */
export const createResolveCollisions = (
  clampPosition: ReturnType<typeof createClampPosition>
) => {
  return (
    mover: { id: string; kind: 'field' | 'link'; x: number; y: number },
    initialFields: FieldResonanceNode[],
    initialLinks: ResonanceLinkNode[]
  ) => {
    const moverRadius =
      mover.kind === 'field' ? FIELD_NODE_RADIUS : LINK_NODE_RADIUS

    let fields = initialFields
    let links = initialLinks

    // Helper to push a single node away from a source
    const pushNodeFrom = <T extends { id: string; x: number; y: number }>(
      node: T,
      radius: number,
      source: { x: number; y: number },
      sourceRadius: number
    ): T => {
      const minDist = radius + sourceRadius
      const dist = Math.max(distance(source.x, source.y, node.x, node.y), 0.001)
      if (dist >= minDist) return node

      const overlap = minDist - dist + 1
      const nx = (node.x - source.x) / dist
      const ny = (node.y - source.y) / dist

      const newX = node.x + nx * overlap
      const newY = node.y + ny * overlap

      const clamped = clampPosition(newX, newY, radius)
      return { ...node, x: clamped.x, y: clamped.y } as T
    }

    // Cascade collision detection: iteratively resolve collisions
    const maxIterations = 5
    for (let iter = 0; iter < maxIterations; iter++) {
      let changed = false

      // Push all nodes away from mover
      const newFields = fields.map((f) => {
        if (f.id === mover.id) return f
        const pushed = pushNodeFrom(f, FIELD_NODE_RADIUS, mover, moverRadius)
        if (pushed.x !== f.x || pushed.y !== f.y) changed = true
        return pushed
      })

      const newLinks = links.map((l) => {
        if (l.id === mover.id) return l
        const pushed = pushNodeFrom(l, LINK_NODE_RADIUS, mover, moverRadius)
        if (pushed.x !== l.x || pushed.y !== l.y) changed = true
        return pushed
      })

      // Now check for collisions between other nodes (cascade effect)
      let cascadeFields = newFields
      let cascadeLinks = newLinks

      // Check field-to-field collisions
      for (let i = 0; i < cascadeFields.length; i++) {
        for (let j = i + 1; j < cascadeFields.length; j++) {
          const pushed = pushNodeFrom(
            cascadeFields[j],
            FIELD_NODE_RADIUS,
            cascadeFields[i],
            FIELD_NODE_RADIUS
          )
          if (
            pushed.x !== cascadeFields[j].x ||
            pushed.y !== cascadeFields[j].y
          ) {
            cascadeFields = cascadeFields.map((f) =>
              f.id === pushed.id ? pushed : f
            )
            changed = true
          }
        }
      }

      // Check link-to-link collisions
      for (let i = 0; i < cascadeLinks.length; i++) {
        for (let j = i + 1; j < cascadeLinks.length; j++) {
          const pushed = pushNodeFrom(
            cascadeLinks[j],
            LINK_NODE_RADIUS,
            cascadeLinks[i],
            LINK_NODE_RADIUS
          )
          if (
            pushed.x !== cascadeLinks[j].x ||
            pushed.y !== cascadeLinks[j].y
          ) {
            cascadeLinks = cascadeLinks.map((l) =>
              l.id === pushed.id ? pushed : l
            )
            changed = true
          }
        }
      }

      // Check field-to-link collisions
      for (let i = 0; i < cascadeFields.length; i++) {
        for (let j = 0; j < cascadeLinks.length; j++) {
          const pushed = pushNodeFrom(
            cascadeLinks[j],
            LINK_NODE_RADIUS,
            cascadeFields[i],
            FIELD_NODE_RADIUS
          )
          if (
            pushed.x !== cascadeLinks[j].x ||
            pushed.y !== cascadeLinks[j].y
          ) {
            cascadeLinks = cascadeLinks.map((l) =>
              l.id === pushed.id ? pushed : l
            )
            changed = true
          }
        }
      }

      fields = cascadeFields
      links = cascadeLinks

      // Stop if no changes occurred
      if (!changed) break
    }

    return { fields, links }
  }
}

/**
 * Helper to convert percentage to pixels
 */
export const createToBandPx = () => {
  return (value: string, total: number, band = 0.7) => {
    const numeric = parseFloat(value)
    if (Number.isNaN(numeric)) return total / 2
    const clamped = Math.min(Math.max(numeric, 0), 100)
    const usable = total * band
    const margin = (total - usable) / 2
    return (clamped / 100) * usable + margin
  }
}

/**
 * Calculates pulse positions relative to a link node
 */
export const calculatePulsePositions = (
  linkNode: ResonanceLinkNode,
  sourceData: { id: string; content: string; __typename: string },
  targetData: { id: string; content: string; __typename: string }
): { source: PulseNode; target: PulseNode } => {
  const distance = 120
  const verticalOffset = 50

  return {
    source: {
      id: sourceData.id,
      content: sourceData.content,
      type: getPulseType(sourceData.__typename),
      x: linkNode.x - distance,
      y: linkNode.y - verticalOffset,
    },
    target: {
      id: targetData.id,
      content: targetData.content,
      type: getPulseType(targetData.__typename),
      x: linkNode.x + distance,
      y: linkNode.y + verticalOffset,
    },
  }
}

/**
 * Connection line type for visualization
 */
export interface ConnectionLine {
  id: string
  x1: string
  y1: string
  x2: string
  y2: string
  dashArray: string
  duration: number
}

/**
 * Builds connection lines from resonance to its link nodes
 */
export const buildResonanceLinkLines = (
  res: FieldResonanceNode,
  links: ResonanceLinkNode[]
): ConnectionLine[] =>
  links.map((link, idx) => ({
    id: `res-link-${res.id}-${link.id}`,
    x1: res.x.toString(),
    y1: res.y.toString(),
    x2: link.x.toString(),
    y2: link.y.toString(),
    dashArray: '10, 10',
    duration: 3 + idx * 0.1,
  }))

/**
 * Builds connection lines from link node to pulse nodes
 */
export const buildLinkPulseLines = (
  link: ResonanceLinkNode,
  source: PulseNode,
  target: PulseNode
): ConnectionLine[] => [
  {
    id: `link-src-${link.id}`,
    x1: link.x.toString(),
    y1: link.y.toString(),
    x2: source.x.toString(),
    y2: source.y.toString(),
    dashArray: '8, 8',
    duration: 2.8,
  },
  {
    id: `link-tgt-${link.id}`,
    x1: link.x.toString(),
    y1: link.y.toString(),
    x2: target.x.toString(),
    y2: target.y.toString(),
    dashArray: '8, 8',
    duration: 3.2,
  },
]

/**
 * Export radii constants for use in other modules
 */
export { FIELD_NODE_RADIUS, LINK_NODE_RADIUS }
