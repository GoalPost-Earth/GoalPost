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
export const PULSE_NODE_RADIUS = 40 // Pixel radius for collision detection (size-20 = 80px)
export const RESONANCE_NODE_RADIUS = 80 // Pixel radius for resonance node collision detection (size-40 = 160px)

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
 * Nodes push each other apart when they overlap.
 */
export function resolveCollisions(
  positions: PulsePosition[],
  canvasWidth: number = 6000,
  canvasHeight: number = 6000,
  iterations: number = 6
): PulsePosition[] {
  const result = JSON.parse(JSON.stringify(positions)) as PulsePosition[]
  const minDistance = PULSE_NODE_RADIUS * 2 + 10 // 90px separation (80px + 10px gap)
  let collisionsFound = false

  for (let iter = 0; iter < iterations; iter++) {
    collisionsFound = false
    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const dx = result[j].x - result[i].x
        const dy = result[j].y - result[i].y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < minDistance && distance > 0.1) {
          collisionsFound = true
          const angle = Math.atan2(dy, dx)
          const overlap = minDistance - distance
          const pushDistance = overlap / 2 + 1 // Increased buffer for better separation

          result[i].x -= Math.cos(angle) * pushDistance
          result[i].y -= Math.sin(angle) * pushDistance
          result[j].x += Math.cos(angle) * pushDistance
          result[j].y += Math.sin(angle) * pushDistance
        }
      }
    }
    // If no collisions found, we can exit early
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
 */
export function resolveResonanceCollisions(
  resonancePositions: Map<string, { x: number; y: number }>,
  pulsePositions: PulsePosition[],
  canvasWidth: number = 6000,
  canvasHeight: number = 6000,
  iterations: number = 8
): Map<string, { x: number; y: number }> {
  const result = new Map(resonancePositions)
  const resonanceArray = Array.from(result.entries())
  const minResonanceDistance = RESONANCE_NODE_RADIUS * 2 + 20 // 180px separation between resonances (resonances + 20px gap)
  const minPulseDistance = RESONANCE_NODE_RADIUS + PULSE_NODE_RADIUS + 20 // 140px separation from pulses (20px gap)

  for (let iter = 0; iter < iterations; iter++) {
    let collisionsFound = false

    // Check resonance-to-resonance collisions
    for (let i = 0; i < resonanceArray.length; i++) {
      for (let j = i + 1; j < resonanceArray.length; j++) {
        const [idA, posA] = resonanceArray[i]
        const [idB, posB] = resonanceArray[j]

        const dx = posB.x - posA.x
        const dy = posB.y - posA.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < minResonanceDistance && distance > 0) {
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
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < minPulseDistance && distance > 0) {
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
