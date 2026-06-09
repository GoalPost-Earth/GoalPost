'use client'

import { PulseTypeSuggestion } from './pulse-type-suggestion'
import { NodeType } from './pulse-node'

interface OfferingInputProps {
  onSubmit?: (value: string, type: NodeType, name: string) => void
  isLoading?: boolean
}

/**
 * Create-mode pulse composer. Renders the unified composer directly — type
 * selection (a visible pill row), title, and content all live on one surface,
 * so "Add Pulse" no longer opens a bare text box with no selectable types
 * (GOAL-252). The legacy two-step "type your intention, then classify" flow is
 * gone; this is now a thin adapter over the shared `PulseTypeSuggestion`.
 */
export function OfferingInput({
  onSubmit,
  isLoading = false,
}: OfferingInputProps) {
  return (
    <div className="flex w-full justify-center">
      <PulseTypeSuggestion
        isOpen={true}
        isEditing={false}
        isLoading={isLoading}
        onSelect={(type, name, content) => {
          if (onSubmit && !isLoading) onSubmit(content, type, name)
        }}
        // Create-mode composer is always open; the parent OfferingModal owns
        // dismissal (backdrop / escape), so there is nothing to close here.
        onClose={() => {}}
      />
    </div>
  )
}
