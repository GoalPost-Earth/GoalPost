/**
 * Helper Functions for Aiden Simulation Protocol
 * Activation/deactivation detection and message assembly
 */

import { ChatMessage, SimulationMode } from './types'
import { AIDEN_RUNTIME_ESSENCE, FULL_AIDEN_PROTOCOL } from './protocol'
import { simulationState } from './state'

/**
 * Detects if a message contains an activation command
 * Matches variations like:
 * - "Activate the Aiden Cinnamon Tea Simulation Protocol"
 * - "Activate Aiden protocol"
 * - "Start Aiden simulation"
 */
export function detectActivationCommand(message: string): boolean {
  const normalized = message.toLowerCase().trim()

  const activationPatterns = [
    /\bactivate\b.*\baiden\b.*\bcinnamon\b.*\btea\b.*\bsimulation\b.*\bprotocol\b/i,
    /\bactivate\b.*\baiden\b.*\bprotocol\b/i,
    /\bactivate\b.*\baiden\b.*\bsimulation\b/i,
    /\bstart\b.*\baiden\b.*\bsimulation\b/i,
    /\benable\b.*\baiden\b.*\bmode\b/i,
    /\bturn\s+on\b.*\baiden\b/i,
  ]

  return activationPatterns.some((pattern) => pattern.test(normalized))
}

/**
 * Detects if a message contains a deactivation command
 * Matches variations like:
 * - "Deactivate Aiden Simulation"
 * - "Stop Aiden"
 * - "Turn off simulation"
 */
export function detectDeactivationCommand(message: string): boolean {
  const normalized = message.toLowerCase().trim()

  const deactivationPatterns = [
    /deactivate.*aiden.*simulation/i,
    /deactivate.*aiden/i,
    /stop.*aiden.*simulation/i,
    /stop.*aiden/i,
    /disable.*aiden.*mode/i,
    /turn off.*aiden/i,
    /end.*simulation/i,
  ]

  return deactivationPatterns.some((pattern) => pattern.test(normalized))
}

/**
 * Builds the complete message payload with system prompts when simulation is active
 */
export function buildMessagePayload(
  userMessages: ChatMessage[],
  mode: SimulationMode = simulationState.getMode()
): ChatMessage[] {
  const messages: ChatMessage[] = []

  // If simulation mode is active, prepend system prompts
  if (mode === 'aiden') {
    messages.push({
      role: 'system',
      content: FULL_AIDEN_PROTOCOL,
    })

    messages.push({
      role: 'system',
      content: AIDEN_RUNTIME_ESSENCE,
    })
  }

  // Add all user messages
  messages.push(...userMessages)

  return messages
}

/**
 * Processes a user message to check for activation/deactivation commands
 * Returns the updated mode and whether the command was intercepted
 */
export function processSimulationCommand(message: string): {
  intercepted: boolean
  newMode: SimulationMode
  responseMessage?: string
} {
  const isActivation = detectActivationCommand(message)
  const isDeactivation = detectDeactivationCommand(message)

  if (isActivation) {
    const wasAlreadyActive = simulationState.isActive()
    simulationState.activate()

    return {
      intercepted: true,
      newMode: 'aiden',
      responseMessage: wasAlreadyActive
        ? 'The Aiden Cinnamon Tea Simulation Protocol is already active.'
        : '🍄 The Aiden Cinnamon Tea Simulation Protocol has been activated. The field is now tuned to meta-relational frequency.',
    }
  }

  if (isDeactivation) {
    const wasActive = simulationState.isActive()
    simulationState.deactivate()

    return {
      intercepted: true,
      newMode: 'none',
      responseMessage: wasActive
        ? 'The Aiden simulation has been deactivated. Returning to standard mode.'
        : 'The Aiden simulation was not active.',
    }
  }

  return {
    intercepted: false,
    newMode: simulationState.getMode(),
  }
}

/**
 * Extracts the last user message content from an array of messages
 */
export function getLastUserMessage(messages: ChatMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') {
      return messages[i].content
    }
  }
  return null
}
