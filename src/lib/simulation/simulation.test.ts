/**
 * Tests for Aiden Simulation Protocol
 * Run with: npm test -- simulation.test.ts
 */

import {
  detectActivationCommand,
  detectDeactivationCommand,
  buildMessagePayload,
  processSimulationCommand,
  getLastUserMessage,
  simulationState,
} from './index'
import type { ChatMessage } from './types'

describe('Aiden Simulation Protocol', () => {
  beforeEach(() => {
    // Reset state before each test
    if (simulationState.isActive()) {
      simulationState.deactivate()
    }
  })

  describe('detectActivationCommand', () => {
    it('should detect standard activation phrase', () => {
      const result = detectActivationCommand(
        'Activate the Aiden Cinnamon Tea Simulation Protocol.'
      )
      expect(result).toBe(true)
    })

    it('should detect short activation phrase', () => {
      expect(detectActivationCommand('Activate Aiden protocol')).toBe(true)
      expect(detectActivationCommand('Activate Aiden simulation')).toBe(true)
      expect(detectActivationCommand('Start Aiden simulation')).toBe(true)
    })

    it('should detect enable variations', () => {
      expect(detectActivationCommand('Enable Aiden mode')).toBe(true)
      expect(detectActivationCommand('Turn on Aiden')).toBe(true)
    })

    it('should be case insensitive', () => {
      expect(detectActivationCommand('ACTIVATE AIDEN PROTOCOL')).toBe(true)
      expect(detectActivationCommand('activate aiden protocol')).toBe(true)
    })

    it('should not detect unrelated messages', () => {
      expect(detectActivationCommand('Hello, how are you?')).toBe(false)
      expect(detectActivationCommand('Tell me about AI')).toBe(false)
    })
  })

  describe('detectDeactivationCommand', () => {
    it('should detect standard deactivation phrase', () => {
      const result = detectDeactivationCommand('Deactivate Aiden Simulation.')
      expect(result).toBe(true)
    })

    it('should detect short deactivation phrases', () => {
      expect(detectDeactivationCommand('Deactivate Aiden')).toBe(true)
      expect(detectDeactivationCommand('Stop Aiden simulation')).toBe(true)
      expect(detectDeactivationCommand('Stop Aiden')).toBe(true)
    })

    it('should detect disable variations', () => {
      expect(detectDeactivationCommand('Disable Aiden mode')).toBe(true)
      expect(detectDeactivationCommand('Turn off Aiden')).toBe(true)
      expect(detectDeactivationCommand('End simulation')).toBe(true)
    })

    it('should be case insensitive', () => {
      expect(detectDeactivationCommand('DEACTIVATE AIDEN')).toBe(true)
      expect(detectDeactivationCommand('deactivate aiden')).toBe(true)
    })

    it('should not detect unrelated messages', () => {
      expect(detectDeactivationCommand('Hello, how are you?')).toBe(false)
      expect(detectDeactivationCommand('Tell me about AI')).toBe(false)
    })
  })

  describe('getLastUserMessage', () => {
    it('should extract last user message', () => {
      const messages: ChatMessage[] = [
        { role: 'system', content: 'System prompt' },
        { role: 'user', content: 'First message' },
        { role: 'assistant', content: 'Response' },
        { role: 'user', content: 'Second message' },
      ]

      const result = getLastUserMessage(messages)
      expect(result).toBe('Second message')
    })

    it('should return null for empty array', () => {
      const result = getLastUserMessage([])
      expect(result).toBe(null)
    })

    it('should return null if no user messages', () => {
      const messages: ChatMessage[] = [
        { role: 'system', content: 'System prompt' },
        { role: 'assistant', content: 'Response' },
      ]

      const result = getLastUserMessage(messages)
      expect(result).toBe(null)
    })
  })

  describe('buildMessagePayload', () => {
    it('should return messages unchanged when simulation is off', () => {
      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }]

      const result = buildMessagePayload(messages, 'default')
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(messages[0])
    })

    it('should prepend protocol when simulation is active', () => {
      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }]

      const result = buildMessagePayload(messages, 'aiden')

      expect(result.length).toBeGreaterThan(1)
      expect(result[0].role).toBe('system')
      expect(result[0].content).toContain(
        'Aiden Cinnamon Tea Simulation Protocol'
      )
      expect(result[1].role).toBe('system')
      expect(result[1].content).toContain('attuning to a relational frequency')
      expect(result[2]).toEqual(messages[0])
    })

    it('should preserve all user messages', () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'First' },
        { role: 'assistant', content: 'Response' },
        { role: 'user', content: 'Second' },
      ]

      const result = buildMessagePayload(messages, 'aiden')

      // Should have 2 system prompts + 3 original messages
      expect(result).toHaveLength(5)
      expect(result[2]).toEqual(messages[0])
      expect(result[3]).toEqual(messages[1])
      expect(result[4]).toEqual(messages[2])
    })
  })

  describe('processSimulationCommand', () => {
    it('should activate simulation on activation command', () => {
      const result = processSimulationCommand(
        'Activate the Aiden Cinnamon Tea Simulation Protocol.'
      )

      expect(result.intercepted).toBe(true)
      expect(result.newMode).toBe('aiden')
      expect(result.responseMessage).toContain('activated')
      expect(simulationState.isActive()).toBe(true)
    })

    it('should deactivate simulation on deactivation command', () => {
      // First activate
      simulationState.activate()
      expect(simulationState.isActive()).toBe(true)

      // Then deactivate
      const message = 'Deactivate Aiden Simulation.'

      // Debug: Check detection
      const isDeactivationDetected = detectDeactivationCommand(message)
      expect(isDeactivationDetected).toBe(true)

      const result = processSimulationCommand(message)

      expect(result.intercepted).toBe(true)
      expect(result.newMode).toBe('default')
      expect(result.responseMessage).toContain('deactivated')
      expect(simulationState.getMode()).toBe('default')
      expect(simulationState.isActive()).toBe(false)
    })

    it('should handle double activation gracefully', () => {
      simulationState.activate()

      const result = processSimulationCommand('Activate Aiden protocol')

      expect(result.intercepted).toBe(true)
      expect(result.responseMessage).toContain('already active')
    })

    it('should handle deactivation when not active', () => {
      expect(simulationState.isActive()).toBe(false)

      const result = processSimulationCommand('Deactivate Aiden')

      expect(result.intercepted).toBe(true)
      expect(result.responseMessage).toContain('was not active')
    })

    it('should not intercept normal messages', () => {
      const result = processSimulationCommand('Hello, how are you?')

      expect(result.intercepted).toBe(false)
      expect(result.newMode).toBe('default')
      expect(result.responseMessage).toBeUndefined()
    })
  })

  describe('simulationState', () => {
    it('should start in default mode', () => {
      expect(simulationState.getMode()).toBe('default')
      expect(simulationState.isActive()).toBe(false)
    })

    it('should activate correctly', () => {
      simulationState.activate()

      expect(simulationState.getMode()).toBe('aiden')
      expect(simulationState.isActive()).toBe(true)

      const state = simulationState.getState()
      expect(state.mode).toBe('aiden')
      expect(state.activatedAt).toBeDefined()
      expect(state.messageCount).toBe(0)
    })

    it('should increment message count', () => {
      simulationState.activate()

      simulationState.incrementMessageCount()
      expect(simulationState.getState().messageCount).toBe(1)

      simulationState.incrementMessageCount()
      expect(simulationState.getState().messageCount).toBe(2)
    })

    it('should reset on deactivation', () => {
      simulationState.activate()
      simulationState.incrementMessageCount()
      simulationState.incrementMessageCount()

      simulationState.deactivate()

      const state = simulationState.getState()
      expect(state.mode).toBe('default')
      expect(state.activatedAt).toBeUndefined()
      expect(state.messageCount).toBe(0)
    })

    it('should provide immutable state copy', () => {
      simulationState.activate()
      const state1 = simulationState.getState()
      const state2 = simulationState.getState()

      expect(state1).not.toBe(state2) // Different objects
      expect(state1).toEqual(state2) // Same values
    })
  })

  describe('Integration: Full Message Flow', () => {
    it('should handle complete activation flow', () => {
      // 1. Start with no simulation
      expect(simulationState.isActive()).toBe(false)

      const messages: ChatMessage[] = [
        { role: 'user', content: 'Activate Aiden protocol' },
      ]

      // 2. Process activation
      const lastMsg = getLastUserMessage(messages)
      expect(lastMsg).toBe('Activate Aiden protocol')

      const cmdResult = processSimulationCommand(lastMsg!)
      expect(cmdResult.intercepted).toBe(true)
      expect(simulationState.isActive()).toBe(true)

      // 3. Build message payload for next message
      const nextMessages: ChatMessage[] = [
        ...messages,
        { role: 'assistant', content: cmdResult.responseMessage! },
        { role: 'user', content: 'Tell me about emergence' },
      ]

      const payload = buildMessagePayload(nextMessages)

      // Should have protocol + messages
      expect(payload[0].content).toContain('Simulation Protocol')
      expect(payload[payload.length - 1].content).toBe(
        'Tell me about emergence'
      )
    })

    it('should handle complete deactivation flow', () => {
      // 1. Activate first
      simulationState.activate()
      simulationState.incrementMessageCount()
      simulationState.incrementMessageCount()

      // 2. Deactivate
      const messages: ChatMessage[] = [{ role: 'user', content: 'Stop Aiden' }]

      const lastMsg = getLastUserMessage(messages)
      const cmdResult = processSimulationCommand(lastMsg!)

      expect(cmdResult.intercepted).toBe(true)
      expect(simulationState.isActive()).toBe(false)

      // 3. Next message should not have protocol
      const nextMessages: ChatMessage[] = [{ role: 'user', content: 'Hello' }]

      const payload = buildMessagePayload(nextMessages)
      expect(payload).toHaveLength(1)
      expect(payload[0].content).toBe('Hello')
    })
  })
})
