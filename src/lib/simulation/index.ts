/**
 * Simulation Module - Central Export
 */

export { simulationState } from './state'
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
export type {
  SimulationMode,
  SimulationState,
  ChatMessage,
  SimulationConfig,
} from './types'
