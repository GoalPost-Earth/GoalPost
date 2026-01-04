/**
 * AI Assistant Mode Type Definitions
 * Defines the types for multiple AI assistant modes
 */

export type AssistantMode = 'default' | 'aiden' | 'braider'
export type SimulationMode = AssistantMode

export interface SimulationState {
  mode: AssistantMode
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
