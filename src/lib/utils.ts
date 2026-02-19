import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { NodeType } from '@/components/ui/pulse-node'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalizeString(str: string) {
  if (str.length === 0) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// ============================================================================
// Canvas Collision Detection Utilities
// ============================================================================

export interface PulsePosition {
  pulseId: string
  x: number
  y: number
  icon: string
  label: string
  title: string
  content: string
  type: NodeType
  animation: 'float' | 'float-delayed' | 'float-random' | 'pulse-slow' | 'none'
}

// Node radii for collision detection
// These represent the actual visual bounding box of nodes including title and content
export const PULSE_NODE_RADIUS = 80 // Pixel radius for pulse nodes (~128px width + title/content area)
export const RESONANCE_NODE_RADIUS = 100 // Pixel radius for resonance nodes (visual indicator circles)

/**
 * Generates a deterministic pseudo-random number in [0,1) derived from an input string and salt.
 * Used for consistent positioning of nodes across renders.
 */
export function seededUnitValue(input: string, salt: number): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i) + salt
    hash |= 0
  }
  const value = Math.abs(Math.sin(hash + salt) * 10000)
  return value - Math.floor(value)
}

/**
 * Clamps a position within canvas bounds, accounting for node radius.
 * @returns Tuple of [clampedX, clampedY]
 */
export function clampPosition(
  x: number,
  y: number,
  canvasWidth: number,
  canvasHeight: number,
  nodeRadius: number = PULSE_NODE_RADIUS
): [number, number] {
  const minX = nodeRadius
  const maxX = canvasWidth - nodeRadius
  const minY = nodeRadius
  const maxY = canvasHeight - nodeRadius

  return [Math.max(minX, Math.min(maxX, x)), Math.max(minY, Math.min(maxY, y))]
}

/**
 * Resolves collisions between pulse nodes using iterative separation.
 * Nodes push each other apart when they get close, before significant overlap occurs.
 */
export function resolveCollisions(
  positions: PulsePosition[],
  canvasWidth: number = 6000,
  canvasHeight: number = 6000,
  iterations: number = 4 // Reduced from 6 for better performance
): PulsePosition[] {
  // Shallow copy is much faster than JSON.parse/stringify
  const result = positions.map((p) => ({ ...p }))

  // Early exit if no positions to check
  if (result.length < 2) {
    return result.map((pos) => {
      const [clampedX, clampedY] = clampPosition(
        pos.x,
        pos.y,
        canvasWidth,
        canvasHeight
      )
      return { ...pos, x: clampedX, y: clampedY }
    })
  }

  // Minimum distance includes both node radii plus a gap for early detection
  // Trigger collision when nodes approach each other, not after they overlap
  const minDistance = PULSE_NODE_RADIUS * 2 + 40 // Early detection gap (40px buffer)
  const minDistanceSquared = minDistance * minDistance // Avoid sqrt in hot loop
  let collisionsFound = false

  for (let iter = 0; iter < iterations; iter++) {
    collisionsFound = false
    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const dx = result[j].x - result[i].x
        const dy = result[j].y - result[i].y
        const distanceSquared = dx * dx + dy * dy

        // Use squared distance to avoid expensive sqrt
        if (distanceSquared < minDistanceSquared && distanceSquared > 0.01) {
          const distance = Math.sqrt(distanceSquared)
          collisionsFound = true
          const angle = Math.atan2(dy, dx)
          const overlap = minDistance - distance
          const pushDistance = overlap / 2 + 2 // Increased buffer for better separation

          result[i].x -= Math.cos(angle) * pushDistance
          result[i].y -= Math.sin(angle) * pushDistance
          result[j].x += Math.cos(angle) * pushDistance
          result[j].y += Math.sin(angle) * pushDistance
        }
      }
    }
    // If no collisions found after first iteration, exit early
    if (!collisionsFound && iter > 0) break
  }

  // Clamp all positions to canvas bounds
  return result.map((pos) => {
    const [clampedX, clampedY] = clampPosition(
      pos.x,
      pos.y,
      canvasWidth,
      canvasHeight
    )
    return { ...pos, x: clampedX, y: clampedY }
  })
}

/**
 * Resolves collisions for resonance nodes with other resonances and pulses.
 * Two-phase collision detection: resonance-to-resonance, then resonance-to-pulse.
 * Resonance nodes move to avoid collisions, pulse nodes remain stationary.
 * Collision detection is proactive - detects when nodes approach each other.
 * Optimized for performance with many entities.
 */
export function resolveResonanceCollisions(
  resonancePositions: Map<string, { x: number; y: number }>,
  pulsePositions: PulsePosition[],
  canvasWidth: number = 6000,
  canvasHeight: number = 6000,
  iterations: number = 5 // Reduced from 8 for better performance
): Map<string, { x: number; y: number }> {
  const result = new Map(resonancePositions)
  const resonanceArray = Array.from(result.entries())

  // Early exit if no entities
  if (resonanceArray.length === 0) {
    return result
  }

  // Minimum distances account for actual visual sizes and trigger early
  const minResonanceDistance = RESONANCE_NODE_RADIUS * 2 + 60 // Early detection gap between resonance nodes (60px buffer)
  const minPulseDistance = RESONANCE_NODE_RADIUS + PULSE_NODE_RADIUS + 50 // Early detection gap from pulse nodes (50px buffer)
  const minResonanceDistanceSquared =
    minResonanceDistance * minResonanceDistance // Avoid sqrt in hot loop
  const minPulseDistanceSquared = minPulseDistance * minPulseDistance // Avoid sqrt in hot loop

  for (let iter = 0; iter < iterations; iter++) {
    let collisionsFound = false

    // Check resonance-to-resonance collisions
    for (let i = 0; i < resonanceArray.length; i++) {
      for (let j = i + 1; j < resonanceArray.length; j++) {
        const [idA, posA] = resonanceArray[i]
        const [idB, posB] = resonanceArray[j]

        const dx = posB.x - posA.x
        const dy = posB.y - posA.y
        const distanceSquared = dx * dx + dy * dy

        // Use squared distance to avoid expensive sqrt
        if (
          distanceSquared < minResonanceDistanceSquared &&
          distanceSquared > 0.01
        ) {
          const distance = Math.sqrt(distanceSquared)
          collisionsFound = true
          const overlap = minResonanceDistance - distance
          const angle = Math.atan2(dy, dx)
          // Amplify separation for more decisive collision resolution
          const separationX = (Math.cos(angle) * overlap * 1.2) / 2
          const separationY = (Math.sin(angle) * overlap * 1.2) / 2

          const newPosA = {
            x: posA.x - separationX,
            y: posA.y - separationY,
          }
          const newPosB = {
            x: posB.x + separationX,
            y: posB.y + separationY,
          }

          result.set(idA, newPosA)
          result.set(idB, newPosB)
          resonanceArray[i][1] = newPosA
          resonanceArray[j][1] = newPosB
        }
      }
    }

    // Check resonance-to-pulse collisions
    for (let i = 0; i < resonanceArray.length; i++) {
      const [id, resPos] = resonanceArray[i]

      for (const pulse of pulsePositions) {
        const dx = pulse.x - resPos.x
        const dy = pulse.y - resPos.y
        const distanceSquared = dx * dx + dy * dy

        // Use squared distance to avoid expensive sqrt
        if (
          distanceSquared < minPulseDistanceSquared &&
          distanceSquared > 0.01
        ) {
          const distance = Math.sqrt(distanceSquared)
          collisionsFound = true
          const overlap = minPulseDistance - distance
          const angle = Math.atan2(dy, dx)
          // Push resonance node away from pulse (pulses don't move)
          // Amplify for more decisive separation
          const newPos = {
            x: resPos.x - Math.cos(angle) * overlap * 1.2,
            y: resPos.y - Math.sin(angle) * overlap * 1.2,
          }

          result.set(id, newPos)
          resonanceArray[i][1] = newPos
        }
      }
    }

    // Early exit if no collisions found after first iteration
    if (!collisionsFound && iter > 0) break
  }

  // Clamp all positions to canvas bounds
  const clamped = new Map<string, { x: number; y: number }>()
  result.forEach((pos, id) => {
    const [clampedX, clampedY] = clampPosition(
      pos.x,
      pos.y,
      canvasWidth,
      canvasHeight,
      RESONANCE_NODE_RADIUS
    )
    clamped.set(id, { x: clampedX, y: clampedY })
  })

  return clamped
}

/**
 * Resolves bidirectional collisions between resonance nodes and pulses.
 * Both resonance and pulse nodes move apart when they collide.
 * Returns updated positions for both pulse and resonance nodes.
 * Optimized for performance with many entities.
 */
export function resolveBidirectionalResonancePulseCollisions(
  resonancePositions: Map<string, { x: number; y: number }>,
  pulsePositions: PulsePosition[],
  canvasWidth: number = 6000,
  canvasHeight: number = 6000,
  iterations: number = 5 // Reduced from 8 for better performance
): {
  pulsePositions: PulsePosition[]
  resonancePositions: Map<string, { x: number; y: number }>
} {
  // Shallow copy is much faster than JSON.parse/stringify
  const pulsesResult = pulsePositions.map((p) => ({ ...p }))
  const resonanceResult = new Map(resonancePositions)
  const resonanceArray = Array.from(resonanceResult.entries())

  const minPulseDistance = RESONANCE_NODE_RADIUS + PULSE_NODE_RADIUS + 50 // Early detection gap from pulse nodes (50px buffer)
  const minPulseDistanceSquared = minPulseDistance * minPulseDistance // Avoid sqrt in hot loop

  const minResonanceDistance = RESONANCE_NODE_RADIUS * 2 + 80 // Minimum distance between resonance nodes (increased for better spacing)
  const minResonanceDistanceSquared =
    minResonanceDistance * minResonanceDistance

  // Debug logging
  const isInitialLoad = iterations === 5 // Full iterations on initial load
  if (isInitialLoad && resonanceArray.length > 1) {
    console.log(
      `🔍 Collision Detection: ${resonanceArray.length} resonance nodes, ${pulsesResult.length} pulses, ${iterations} iterations`
    )
    console.log(
      `📏 Min distances: pulse=${minPulseDistance}px, resonance=${minResonanceDistance}px`
    )
  }

  // Early exit if no entities to check
  if (resonanceArray.length === 0 || pulsesResult.length === 0) {
    return {
      pulsePositions: pulsesResult,
      resonancePositions: resonanceResult,
    }
  }

  let totalCollisionsResolved = 0
  for (let iter = 0; iter < iterations; iter++) {
    let collisionsFound = false
    let iterationCollisions = 0

    // Check resonance-to-pulse collisions (bidirectional)
    for (let i = 0; i < resonanceArray.length; i++) {
      const [resId, resPos] = resonanceArray[i]

      for (let j = 0; j < pulsesResult.length; j++) {
        const pulse = pulsesResult[j]
        const dx = pulse.x - resPos.x
        const dy = pulse.y - resPos.y
        const distanceSquared = dx * dx + dy * dy

        // Use squared distance to avoid expensive sqrt
        if (
          distanceSquared < minPulseDistanceSquared &&
          distanceSquared > 0.01
        ) {
          const distance = Math.sqrt(distanceSquared)
          collisionsFound = true
          iterationCollisions++
          const overlap = minPulseDistance - distance
          const angle = Math.atan2(dy, dx)
          const pushDistance = overlap / 2 + 1

          // Push resonance node away from pulse
          const newResPos = {
            x: resPos.x - Math.cos(angle) * pushDistance * 1.2,
            y: resPos.y - Math.sin(angle) * pushDistance * 1.2,
          }

          // Push pulse node away from resonance
          const newPulsePos = {
            ...pulse,
            x: pulse.x + Math.cos(angle) * pushDistance,
            y: pulse.y + Math.sin(angle) * pushDistance,
          }

          resonanceResult.set(resId, newResPos)
          resonanceArray[i][1] = newResPos
          pulsesResult[j] = newPulsePos
        }
      }
    }

    // Check resonance-to-resonance collisions
    for (let i = 0; i < resonanceArray.length; i++) {
      const [resId1, resPos1] = resonanceArray[i]

      for (let j = i + 1; j < resonanceArray.length; j++) {
        const [resId2, resPos2] = resonanceArray[j]

        const dx = resPos2.x - resPos1.x
        const dy = resPos2.y - resPos1.y
        const distanceSquared = dx * dx + dy * dy

        // Check if resonance nodes are too close
        if (
          distanceSquared < minResonanceDistanceSquared &&
          distanceSquared > 0.01
        ) {
          const distance = Math.sqrt(distanceSquared)
          collisionsFound = true
          iterationCollisions++
          const overlap = minResonanceDistance - distance
          const angle = Math.atan2(dy, dx)
          const pushDistance = (overlap / 2 + 1) * 1.5 // Increased multiplier for stronger separation

          // Push both resonance nodes apart equally (with extra force)
          const newResPos1 = {
            x: resPos1.x - Math.cos(angle) * pushDistance * 1.2,
            y: resPos1.y - Math.sin(angle) * pushDistance * 1.2,
          }

          const newResPos2 = {
            x: resPos2.x + Math.cos(angle) * pushDistance * 1.2,
            y: resPos2.y + Math.sin(angle) * pushDistance * 1.2,
          }

          resonanceResult.set(resId1, newResPos1)
          resonanceResult.set(resId2, newResPos2)
          resonanceArray[i][1] = newResPos1
          resonanceArray[j][1] = newResPos2
        }
      }
    }

    // Early exit if no collisions found after first iteration
    if (!collisionsFound && iter > 0) {
      if (isInitialLoad && resonanceArray.length > 1) {
        console.log(
          `✅ Collision resolution complete after ${iter} iteration${iter !== 1 ? 's' : ''} (${totalCollisionsResolved} total collisions resolved)`
        )
      }
      break
    }

    if (isInitialLoad && resonanceArray.length > 1 && iterationCollisions > 0) {
      console.log(
        `  Iteration ${iter}: ${iterationCollisions} collision${iterationCollisions !== 1 ? 's' : ''} resolved`
      )
      totalCollisionsResolved += iterationCollisions
    }
  }

  if (
    isInitialLoad &&
    resonanceArray.length > 1 &&
    totalCollisionsResolved === 0
  ) {
    console.warn(
      `⚠️  Collision Detection: No collisions detected during ${iterations} iterations`
    )
  }

  // Clamp all positions to canvas bounds
  const clampedPulses = pulsesResult.map((pos) => {
    const [clampedX, clampedY] = clampPosition(
      pos.x,
      pos.y,
      canvasWidth,
      canvasHeight,
      PULSE_NODE_RADIUS
    )
    return { ...pos, x: clampedX, y: clampedY }
  })

  const clampedResonance = new Map<string, { x: number; y: number }>()
  resonanceResult.forEach((pos, id) => {
    const [clampedX, clampedY] = clampPosition(
      pos.x,
      pos.y,
      canvasWidth,
      canvasHeight,
      RESONANCE_NODE_RADIUS
    )
    clampedResonance.set(id, { x: clampedX, y: clampedY })
  })

  return {
    pulsePositions: clampedPulses,
    resonancePositions: clampedResonance,
  }
}
