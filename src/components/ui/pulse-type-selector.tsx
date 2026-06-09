'use client'

import {
  PULSE_TYPE_CONFIG,
  PULSE_TYPE_ORDER,
  type NodeType,
} from '@/lib/pulse-type-config'
import { cn } from '@/lib/utils'

interface PulseTypeSelectorProps {
  /** Currently selected pulse type. */
  selected: NodeType
  /** Fires when the user taps a type pill. */
  onSelect: (type: NodeType) => void
  /** AI-suggested type — marked with a sparkle while unconfirmed by the user. */
  suggested?: NodeType | null
  /** Whether to surface the "Suggested from your words" hint line. */
  showSuggestionHint?: boolean
  /** Locks the selector (edit mode or while saving) — pills become read-only. */
  disabled?: boolean
}

/**
 * Horizontal segmented selector exposing every creatable pulse type as a
 * directly-tappable pill. Replaces the legacy blind-cycling type icon so the
 * full set of options (and the active choice) is always visible — see GOAL-252.
 *
 * Entity icons + colors are pulled from the single source of truth in
 * `pulse-type-config.ts`; nothing here hardcodes a hue. Tints are themed via
 * `color-mix` over each type's CSS variable so they re-tint in light, dark, and
 * every theme variant.
 */
export function PulseTypeSelector({
  selected,
  onSelect,
  suggested = null,
  showSuggestionHint = false,
  disabled = false,
}: PulseTypeSelectorProps) {
  const hintActive =
    showSuggestionHint && !!suggested && !disabled && suggested === selected

  return (
    <div className="w-full">
      <div
        role="radiogroup"
        aria-label="Pulse type"
        className="flex flex-wrap justify-center gap-2"
      >
        {PULSE_TYPE_ORDER.map((type) => {
          const config = PULSE_TYPE_CONFIG[type]
          const isSelected = type === selected
          const isSuggested = !disabled && !isSelected && suggested === type

          return (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => !disabled && onSelect(type)}
              style={
                isSelected
                  ? {
                      backgroundColor: `color-mix(in srgb, var(${config.cssVar}) 16%, transparent)`,
                      borderColor: `color-mix(in srgb, var(${config.cssVar}) 55%, transparent)`,
                    }
                  : undefined
              }
              className={cn(
                'relative flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-semibold transition-all duration-300',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gp-primary/50',
                isSelected
                  ? 'text-gp-ink-strong dark:text-white shadow-sm'
                  : 'border-gp-glass-border bg-white/50 text-gp-ink-muted dark:border-white/10 dark:bg-white/5 dark:text-gp-ink-soft',
                disabled
                  ? isSelected
                    ? 'cursor-default opacity-90'
                    : 'cursor-default opacity-40'
                  : 'cursor-pointer hover:-translate-y-0.5 hover:border-gp-primary/40 hover:text-gp-ink-strong dark:hover:text-white active:scale-95'
              )}
            >
              <span
                className={cn(
                  'material-symbols-outlined text-[20px]',
                  isSelected ? config.color : 'text-current'
                )}
              >
                {config.icon}
              </span>
              <span className="whitespace-nowrap">{config.label}</span>
              {isSuggested && (
                <span
                  title="Suggested"
                  className="material-symbols-outlined text-[14px] text-gp-primary"
                >
                  auto_awesome
                </span>
              )}
            </button>
          )
        })}
      </div>

      {hintActive && (
        <p className="mt-3 flex items-center justify-center gap-1 text-center text-xs text-gp-ink-muted dark:text-gp-ink-soft">
          <span className="material-symbols-outlined text-[14px] text-gp-primary">
            auto_awesome
          </span>
          Suggested from your words — tap any type to change it.
        </p>
      )}
    </div>
  )
}
