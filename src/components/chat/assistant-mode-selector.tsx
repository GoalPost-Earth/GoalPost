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
    <div className="flex flex-col gap-3">
      <label
        className="text-[10px] font-bold text-gp-ink-muted dark:text-gp-ink-soft block uppercase tracking-[0.18em]"
        htmlFor="assistant-mode-select"
      >
        Interaction Style
      </label>
      <select
        id="assistant-mode-select"
        className="w-full rounded-xl border bg-white/50 dark:bg-slate-900/50 border-gp-glass-border px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gp-primary/50 focus:border-gp-primary transition-all backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Show description of current mode */}
      <div className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed">
        {MODE_METADATA[selectedMode]?.description}
      </div>
      {MODE_METADATA[selectedMode]?.subtitle && (
        <div className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft italic opacity-75">
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
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gp-primary/10 dark:bg-gp-primary/20 border border-gp-glass-border backdrop-blur-sm">
      <span className="text-sm">{metadata?.icon}</span>
      {showLabel && (
        <span className="text-xs font-medium text-slate-900 dark:text-white">
          {metadata?.label}
        </span>
      )}
    </div>
  )
}

/**
 * Mode description card - quick guide showing what each mode does
 */
export function AssistantModeInfo() {
  return (
    <div className="space-y-4 p-5 rounded-2xl bg-gp-glass-bg border border-gp-glass-border shadow-[0_30px_60px_-12px_rgba(0,0,0,0.08)] backdrop-blur-2xl dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]">
      <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-gp-ink-muted dark:text-gp-ink-soft">
        How modes work
      </h3>

      {Object.entries(MODE_METADATA).map(([key, metadata]) => (
        <div
          key={key}
          className="space-y-2 pb-4 border-b border-gp-glass-border last:border-b-0 last:pb-0"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{metadata.icon}</span>
            <span className="font-medium text-sm text-slate-900 dark:text-white">
              {metadata.label}
            </span>
          </div>
          <p className="text-sm text-gp-ink-muted dark:text-gp-ink-soft ml-7 leading-relaxed">
            {metadata.description}
          </p>
          {metadata.subtitle && (
            <p className="text-xs text-gp-ink-muted dark:text-gp-ink-soft ml-7 italic opacity-75">
              {metadata.subtitle}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
