'use client'

import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogPortal } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ResonanceSuggestionItem } from '@/components/ui/resonance-suggestion-item'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface Suggestion {
  id: string
  label: string
  description: string
  confidence: number
  evidence: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: string
  sourcePulseId: string
  sourcePulseContent: string
  targetPulseId: string
  targetPulseContent: string
  contextId: string
  contextTitle: string
}

interface ResonanceSuggestionsModalProps {
  isOpen: boolean
  onClose: () => void
  spaceId: string
  suggestions?: Suggestion[]
  loading?: boolean
  onAccept?: (id: string) => Promise<void>
  onDecline?: (id: string) => Promise<void>
  onRefresh?: () => Promise<void>
}

type TabStatus = 'pending' | 'accepted' | 'declined'

export function ResonanceSuggestionsModal({
  isOpen,
  onClose,
  spaceId,
  suggestions = [],
  loading = false,
  onAccept,
  onDecline,
  onRefresh,
}: ResonanceSuggestionsModalProps) {
  const [activeTab, setActiveTab] = useState<TabStatus>('pending')
  const [reviewMode, setReviewMode] = useState(false)
  const [reviewIndex, setReviewIndex] = useState(0)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Filter suggestions by status
  const filteredSuggestions = useMemo(() => {
    return suggestions.filter((s) => s.status === activeTab)
  }, [suggestions, activeTab])

  // Get current suggestion in review mode
  const currentSuggestion = reviewMode ? filteredSuggestions[reviewIndex] : null

  // Tab counts
  const tabCounts = {
    pending: suggestions.filter((s) => s.status === 'pending').length,
    accepted: suggestions.filter((s) => s.status === 'accepted').length,
    declined: suggestions.filter((s) => s.status === 'declined').length,
  }

  const handleStartReview = () => {
    if (filteredSuggestions.length > 0) {
      setReviewMode(true)
      setReviewIndex(0)
    }
  }

  const handleNextReview = () => {
    if (reviewIndex < filteredSuggestions.length - 1) {
      setReviewIndex(reviewIndex + 1)
    } else {
      setReviewMode(false)
      setReviewIndex(0)
    }
  }

  const handlePrevReview = () => {
    if (reviewIndex > 0) {
      setReviewIndex(reviewIndex - 1)
    }
  }

  const handleAccept = async (id: string) => {
    if (!onAccept) return
    setActionLoading(id)
    try {
      await onAccept(id)
      await onRefresh?.()
      if (reviewMode && filteredSuggestions.length > 1) {
        handleNextReview()
      }
    } finally {
      setActionLoading(null)
    }
  }

  const handleDecline = async (id: string) => {
    if (!onDecline) return
    setActionLoading(id)
    try {
      await onDecline(id)
      await onRefresh?.()
      if (reviewMode && filteredSuggestions.length > 1) {
        handleNextReview()
      }
    } finally {
      setActionLoading(null)
    }
  }

  const handleClose = () => {
    setReviewMode(false)
    setReviewIndex(0)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogPortal>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="border-b border-slate-200 pb-4 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Resonance Suggestions
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Review and approve discovered connections between your pulses
            </p>
          </div>

          {/* Review Mode */}
          {reviewMode && currentSuggestion && (
            <div className="space-y-4">
              {/* Progress */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  Reviewing {reviewIndex + 1} of {filteredSuggestions.length}
                </span>
                <div className="h-1 w-32 bg-slate-200 rounded-full dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{
                      width: `${((reviewIndex + 1) / filteredSuggestions.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Current Suggestion */}
              <ResonanceSuggestionItem
                id={currentSuggestion.id}
                label={currentSuggestion.label}
                description={currentSuggestion.description}
                confidence={currentSuggestion.confidence}
                evidence={currentSuggestion.evidence}
                sourcePulseId={currentSuggestion.sourcePulseId}
                sourcePulseContent={currentSuggestion.sourcePulseContent}
                targetPulseId={currentSuggestion.targetPulseId}
                targetPulseContent={currentSuggestion.targetPulseContent}
                contextTitle={currentSuggestion.contextTitle}
                onAccept={handleAccept}
                onDecline={handleDecline}
                isLoading={actionLoading === currentSuggestion.id}
              />

              {/* Navigation */}
              <div className="flex gap-3 justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button
                  variant="outline"
                  onClick={handlePrevReview}
                  disabled={reviewIndex === 0}
                >
                  ← Previous
                </Button>
                <Button variant="ghost" onClick={() => setReviewMode(false)}>
                  Back to List
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNextReview}
                  disabled={reviewIndex === filteredSuggestions.length - 1}
                >
                  Next →
                </Button>
              </div>
            </div>
          )}

          {/* Tab View */}
          {!reviewMode && (
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
                {(['pending', 'accepted', 'declined'] as const).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setActiveTab(status)}
                      className={cn(
                        'px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize',
                        activeTab === status
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                      )}
                    >
                      {status}
                      {tabCounts[status] > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-slate-600 rounded-full dark:bg-slate-500">
                          {tabCounts[status]}
                        </span>
                      )}
                    </button>
                  )
                )}
              </div>

              {/* Content */}
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-48 rounded-lg" />
                  ))}
                </div>
              ) : filteredSuggestions.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-600 dark:bg-slate-800/50">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {activeTab === 'pending'
                      ? 'No pending suggestions. Run discovery to find resonances!'
                      : `No ${activeTab} suggestions yet.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSuggestions.map((suggestion) => (
                    <ResonanceSuggestionItem
                      key={suggestion.id}
                      id={suggestion.id}
                      label={suggestion.label}
                      description={suggestion.description}
                      confidence={suggestion.confidence}
                      evidence={suggestion.evidence}
                      sourcePulseId={suggestion.sourcePulseId}
                      sourcePulseContent={suggestion.sourcePulseContent}
                      targetPulseId={suggestion.targetPulseId}
                      targetPulseContent={suggestion.targetPulseContent}
                      contextTitle={suggestion.contextTitle}
                      onAccept={handleAccept}
                      onDecline={handleDecline}
                      isLoading={actionLoading === suggestion.id}
                    />
                  ))}
                </div>
              )}

              {/* Review All Button (for pending tab) */}
              {activeTab === 'pending' && filteredSuggestions.length > 0 && (
                <Button
                  onClick={handleStartReview}
                  className="w-full"
                  size="lg"
                >
                  Review All Suggestions
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
