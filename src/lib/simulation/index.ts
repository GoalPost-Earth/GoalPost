/**
 * Simulation Module - Central Export
 */

export { simulationState, assistantModeManager } from './state'
export { FULL_AIDEN_PROTOCOL, AIDEN_RUNTIME_ESSENCE } from './protocol'
export {
  detectActivationCommand,
  detectDeactivationCommand,
  buildMessagePayload,
  processSimulationCommand,
  getLastUserMessage,
} from './helpers'
export {
  simulationMiddleware,
  withSimulation,
  addSimulationHeaders,
} from './middleware'
export { SYSTEM_PROMPTS, MODE_METADATA } from './system-prompts'
export type {
  SimulationMode,
  AssistantMode,
  SimulationState,
  ChatMessage,
  SimulationConfig,
  SystemPromptKey,
  AssistantModeInfo,
} from './types'
