/**
 * Collision detection utilities for field bubbles
 * Provides spatial queries and collision responses
 */

export interface Bubble {
  id: string
  x: number
  y: number
  radius: number
}

export interface CollisionResponse {
  a: string
  b: string
  distance: number
  overlap: number
}

/**
 * Calculate distance between two points
 */
export function distance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1
  const dy = y2 - y1
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Check if two bubbles are colliding
 */
export function isColliding(bubble1: Bubble, bubble2: Bubble): boolean {
  const dist = distance(bubble1.x, bubble1.y, bubble2.x, bubble2.y)
  return dist < bubble1.radius + bubble2.radius
}

/**
 * Find all collisions in a set of bubbles
 */
export function detectCollisions(bubbles: Bubble[]): CollisionResponse[] {
  const collisions: CollisionResponse[] = []

  for (let i = 0; i < bubbles.length; i++) {
    for (let j = i + 1; j < bubbles.length; j++) {
      const dist = distance(
        bubbles[i].x,
        bubbles[i].y,
        bubbles[j].x,
        bubbles[j].y
      )
      const minDist = bubbles[i].radius + bubbles[j].radius

      if (dist < minDist) {
        collisions.push({
          a: bubbles[i].id,
          b: bubbles[j].id,
          distance: dist,
          overlap: minDist - dist,
        })
      }
    }
  }

  return collisions
}

/**
 * Separate two colliding bubbles (push apart)
 */
export function separateBubbles(
  bubble1: Bubble,
  bubble2: Bubble,
  maxSeparation: number = 50
): { bubble1: Bubble; bubble2: Bubble } {
  const dist = distance(bubble1.x, bubble1.y, bubble2.x, bubble2.y)
  const minDist = bubble1.radius + bubble2.radius

  if (dist >= minDist) {
    return { bubble1, bubble2 }
  }

  // Calculate separation vector
  const dx = bubble2.x - bubble1.x
  const dy = bubble2.y - bubble1.y
  const angle = Math.atan2(dy, dx)

  // Calculate separation amount
  const overlap = minDist - dist
  const separation = Math.min(overlap / 2, maxSeparation)

  // Apply separation
  return {
    bubble1: {
      ...bubble1,
      x: bubble1.x - Math.cos(angle) * separation,
      y: bubble1.y - Math.sin(angle) * separation,
    },
    bubble2: {
      ...bubble2,
      x: bubble2.x + Math.cos(angle) * separation,
      y: bubble2.y + Math.sin(angle) * separation,
    },
  }
}

/**
 * Get bubbles near a point (spatial query)
 */
export function getBubblesNear(
  bubbles: Bubble[],
  x: number,
  y: number,
  radius: number
): Bubble[] {
  return bubbles.filter((bubble) => {
    const dist = distance(bubble.x, bubble.y, x, y)
    return dist < radius + bubble.radius
  })
}

/**
 * Clamp bubble position to bounds
 */
export function clampToBounds(
  bubble: Bubble,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
): Bubble {
  return {
    ...bubble,
    x: Math.max(minX, Math.min(maxX, bubble.x)),
    y: Math.max(minY, Math.min(maxY, bubble.y)),
  }
}
