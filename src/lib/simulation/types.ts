/**
 * Simulation Mode Type Definitions
 * Defines the types for Aiden Cinnamon Tea Simulation Protocol
 */

export type SimulationMode = 'none' | 'aiden'

export interface SimulationState {
  mode: SimulationMode
  activatedAt?: Date
  messageCount: number
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface SimulationConfig {
  provider: 'openai' | 'groq' | 'mistral' | 'anthropic'
  model: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}
