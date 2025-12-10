/**
 * Simulation Mode State Management
 * Server-side singleton for managing simulation state across requests
 */

import { SimulationMode, SimulationState } from './types'

class SimulationStateManager {
  private state: SimulationState = {
    mode: 'none',
    messageCount: 0,
  }

  getMode(): SimulationMode {
    return this.state.mode
  }

  activate(): void {
    this.state.mode = 'aiden'
    this.state.activatedAt = new Date()
    console.log(
      '[Simulation] Aiden Cinnamon Tea Protocol activated at',
      this.state.activatedAt
    )
  }

  deactivate(): void {
    console.log(
      '[Simulation] Deactivating. Messages processed:',
      this.state.messageCount
    )
    this.state.mode = 'none'
    this.state.activatedAt = undefined
    this.state.messageCount = 0
  }

  incrementMessageCount(): void {
    this.state.messageCount++
  }

  getState(): Readonly<SimulationState> {
    return { ...this.state }
  }

  isActive(): boolean {
    return this.state.mode === 'aiden'
  }
}

// Singleton instance
export const simulationState = new SimulationStateManager()
