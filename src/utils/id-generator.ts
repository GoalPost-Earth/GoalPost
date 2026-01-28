import { randomUUID } from 'crypto'

/**
 * Generate a unique ID for database nodes.
 * Uses Node's built-in crypto.randomUUID()
 */
export function generateId(): string {
  return randomUUID()
}

/**
 * Generate a prefixed unique ID.
 * Useful for creating semantic IDs like 'pulse_abc123', 'context_xyz789'
 */
export function generatePrefixedId(prefix: string): string {
  return `${prefix}_${randomUUID()}`
}
