'use client'

import { PulseTypeSuggestion } from './pulse-type-suggestion'
import { OfferingModal } from './offering-modal'
import { NodeType } from './pulse-node'

interface PulseEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (type: NodeType, name: string, content: string) => void
  onDelete?: () => void
  isLoading?: boolean
  initialType: NodeType
  initialName: string
  initialContent: string
  error?: string | null
}

export function PulseEditModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  isLoading = false,
  initialType,
  initialName,
  initialContent,
  error,
}: PulseEditModalProps) {
  const handleSelect = (type: NodeType, name: string, content: string) => {
    onSubmit(type, name, content)
    // Don't close immediately - let parent handle closing after async operation completes
  }

  return (
    <OfferingModal
      isOpen={isOpen}
      onClose={onClose}
      position="center"
      title="Edit pulse"
    >
      <div className="w-full">
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}
        <PulseTypeSuggestion
          isOpen={true}
          onSelect={handleSelect}
          onClose={onClose}
          isEditing={true}
          initialType={initialType}
          initialName={initialName}
          initialContent={initialContent}
          onDelete={onDelete}
          isLoading={isLoading}
        />
      </div>
    </OfferingModal>
  )
}
