/**
 * AI Assistant Mode State Management
 * Server-side singleton for managing mode state across requests
 *
 * Production Note:
 * For multi-user deployments, move state to session/JWT or database.
 * This singleton works for single-user dev/demo.
 */

import { AssistantMode, SimulationState } from './types'

class AssistantModeManager {
  private state: SimulationState = {
    mode: 'default',
    messageCount: 0,
  }

  /**
   * Get current mode
   */
  getMode(): AssistantMode {
    return this.state.mode
  }

  /**
   * Set mode to one of: 'default', 'aiden', 'braider'
   */
  setMode(mode: AssistantMode): void {
    if (!['default', 'aiden', 'braider'].includes(mode)) {
      console.warn('[AssistantModeManager] Invalid mode:', mode)
      return
    }
    this.state.mode = mode
    this.state.activatedAt = new Date()
    console.log(`[AssistantMode] Mode: ${mode}`)
  }

  /**
   * Reset to default mode
   */
  reset(): void {
    console.log(
      '[AssistantMode] Resetting. Messages processed:',
      this.state.messageCount
    )
    this.state.mode = 'default'
    this.state.activatedAt = undefined
    this.state.messageCount = 0
  }

  /**
   * Increment message count (for analytics/tracking)
   */
  incrementMessageCount(): void {
    this.state.messageCount++
  }

  /**
   * Get full state (read-only)
   */
  getState(): Readonly<SimulationState> {
    return { ...this.state }
  }

  /**
   * Check if non-default mode is active
   */
  isNonDefault(): boolean {
    return this.state.mode !== 'default'
  }

  /**
   * Check if the Aiden simulation mode is active
   */
  isActive(): boolean {
    return this.state.mode === 'aiden'
  }

  /**
   * Activate the Aiden simulation mode
   */
  activate(): void {
    this.state.mode = 'aiden'
    this.state.activatedAt = new Date()
    this.state.messageCount = 0
  }

  /**
   * Deactivate simulation and return to default mode
   */
  deactivate(): void {
    this.reset()
  }

  /**
   * Check if specific mode is active
   */
  isModeActive(mode: AssistantMode): boolean {
    return this.state.mode === mode
  }
}

// Singleton instance
export const assistantModeManager = new AssistantModeManager()

// For backwards compatibility (deprecated, use assistantModeManager instead)
export const simulationState = assistantModeManager
