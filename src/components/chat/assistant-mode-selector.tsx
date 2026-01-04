/**
 * Assistant Mode Selector
 * UI component for switching between AI assistant modes
 *
 * Three modes for different interaction styles:
 * - Standard: Get facts from the database
 * - Aiden: Question the frame before answering
 * - Braider: Stay with difficulty instead of fixing it
 */

'use client'

import React, { useState, useEffect } from 'react'
import { MODE_METADATA } from '@/lib/simulation'
import type { AssistantMode } from '@/lib/simulation'

interface AssistantModeSelectorProps {
  currentMode?: AssistantMode
  onModeChange?: (mode: AssistantMode) => void
  disabled?: boolean
}

/**
 * Mode selector dropdown - displays all available modes with icons and descriptions
 */
export function AssistantModeSelector({
  currentMode = 'default',
  onModeChange,
  disabled = false,
}: AssistantModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<AssistantMode>(currentMode)
  const [isLoading, setIsLoading] = useState(false)

  // Sync with parent component changes
  useEffect(() => {
    setSelectedMode(currentMode)
  }, [currentMode])

  const handleModeChange = async (newMode: AssistantMode) => {
    setSelectedMode(newMode)
    setIsLoading(true)

    try {
      // Notify parent component
      onModeChange?.(newMode)

      // Sync with server
      const response = await fetch('/api/chat/simulation', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // Pass mode as query parameter
      })

      if (!response.ok) {
        console.error('Failed to update mode on server')
      }
    } catch (error) {
      console.error('Error updating mode:', error)
      // Revert to previous mode on error
      setSelectedMode(currentMode)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <label
          className="text-sm font-medium text-gray-700"
          htmlFor="assistant-mode-select"
        >
          Assistant Mode
        </label>
        <select
          id="assistant-mode-select"
          className="w-48 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          value={selectedMode}
          onChange={(e) => handleModeChange(e.target.value as AssistantMode)}
          disabled={disabled || isLoading}
        >
          {Object.entries(MODE_METADATA).map(([key, metadata]) => (
            <option key={key} value={key}>
              {`${metadata.icon} ${metadata.label}`}
            </option>
          ))}
        </select>
      </div>

      {/* Show description of current mode */}
      <div className="text-xs text-gray-600">
        {MODE_METADATA[selectedMode]?.description}
      </div>
      {MODE_METADATA[selectedMode]?.subtitle && (
        <div className="text-xs text-gray-500 italic">
          {MODE_METADATA[selectedMode].subtitle}
        </div>
      )}
    </div>
  )
}

/**
 * Inline mode indicator - compact badge showing current mode
 * Use in chat header or sidebar
 */
export function AssistantModeIndicator({
  mode = 'default',
  showLabel = true,
}: {
  mode?: AssistantMode
  showLabel?: boolean
}) {
  const metadata = MODE_METADATA[mode]

  return (
    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100">
      <span className="text-sm">{metadata?.icon}</span>
      {showLabel && (
        <span className="text-xs font-medium">{metadata?.label}</span>
      )}
    </div>
  )
}

/**
 * Mode description card - quick guide showing what each mode does
 */
export function AssistantModeInfo() {
  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="font-semibold text-sm text-gray-900">How modes work:</h3>

      {Object.entries(MODE_METADATA).map(([key, metadata]) => (
        <div
          key={key}
          className="space-y-1 pb-3 border-b border-gray-200 last:border-b-0 last:pb-0"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{metadata.icon}</span>
            <span className="font-medium text-sm text-gray-900">
              {metadata.label}
            </span>
          </div>
          <p className="text-sm text-gray-700 ml-6">{metadata.description}</p>
          {metadata.subtitle && (
            <p className="text-xs text-gray-500 ml-6">{metadata.subtitle}</p>
          )}
        </div>
      ))}
    </div>
  )
}
