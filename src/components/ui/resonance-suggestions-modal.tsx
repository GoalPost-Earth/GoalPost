'use client'

import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ResonanceSuggestionItem } from '@/components/ui/resonance-suggestion-item'
import { ResonanceSuggestionList } from '@/components/ui/resonance-suggestion-list'
import { ResonanceReviewCarousel } from '@/components/ui/resonance-review-carousel'
import { groupSuggestionsByTheme } from '@/lib/resonance/group-suggestions'
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
  themeId?: string | null
  themeLabel?: string | null
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
  /**
   * Bulk-accept every pending suggestion at or above `minConfidence` (0–1).
   * When provided, the pending tab shows a threshold + "Accept N" control.
   */
  onAcceptAll?: (minConfidence: number) => Promise<number | void>
  /**
   * Take or dismiss every pending pair under one theme. When provided, the
   * pending tab groups by theme and offers per-group actions — the whole point
   * of the grouped queue, since a 31-pair theme becomes one decision.
   */
  onReviewTheme?: (
    themeId: string,
    action: 'accept' | 'decline'
  ) => Promise<number | void>
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
  onAcceptAll,
  onReviewTheme,
}: ResonanceSuggestionsModalProps) {
  const [activeTab, setActiveTab] = useState<TabStatus>('pending')
  const [reviewMode, setReviewMode] = useState(false)
  const [reviewIndex, setReviewIndex] = useState(0)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [threshold, setThreshold] = useState(85)
  const [bulkLoading, setBulkLoading] = useState(false)

  // How many pending suggestions clear the current % threshold (confidence is
  // stored 0–1; the control is expressed as a whole percent).
  const eligibleCount = useMemo(
    () =>
      suggestions.filter(
        (s) => s.status === 'pending' && s.confidence * 100 >= threshold
      ).length,
    [suggestions, threshold]
  )

  const handleAcceptAll = async () => {
    if (!onAcceptAll || eligibleCount === 0) return
    setBulkLoading(true)
    try {
      await onAcceptAll(threshold / 100)
      await onRefresh?.()
    } finally {
      setBulkLoading(false)
    }
  }

  // Filter suggestions by status
  // Grouped is the default on the pending tab — it is the view that makes a
  // large queue reviewable. The flat list stays one tap away for anyone who
  // wants to work pair by pair.
  const [grouped, setGrouped] = useState(true)

  const filteredSuggestions = useMemo(() => {
    return suggestions.filter((s) => s.status === activeTab)
  }, [suggestions, activeTab])

  const themeGroups = useMemo(
    () =>
      groupSuggestionsByTheme(
        filteredSuggestions.map((s) => ({
          ...s,
          themeId: s.themeId ?? null,
          themeLabel: s.themeLabel ?? null,
        }))
      ),
    [filteredSuggestions]
  )

  // Only group where grouping earns its keep. One group is just a card wrapped
  // around the same list, and the Accepted/Declined tabs are history rather
  // than a queue to work through.
  const showGrouped =
    grouped &&
    activeTab === 'pending' &&
    !reviewMode &&
    themeGroups.length > 1

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
        {/* Each card carries a long description, two pulse excerpts and a "Why
            they resonate" paragraph, so this dialog needs far more horizontal
            room than the primitive's default (GOAL-353). The `sm:` prefix is
            load-bearing: DialogContent ships `sm:max-w-lg`, and only a class in
            that same variant makes twMerge drop it — an unprefixed `max-w-2xl`
            loses to it at every width past 640px, which is why this dialog was
            rendering at 512px on a 1440px screen. Keep the unprefixed
            `max-w-2xl` too: it displaces the primitive's
            `max-w-[calc(100%-2rem)]`, which is what keeps the phone layout
            edge-to-edge and unchanged. */}
        <DialogContent className="max-w-2xl sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="border-b border-slate-200 pb-4 dark:border-slate-700">
            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Resonance Suggestions
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Review and approve discovered connections between your pulses
            </DialogDescription>
          </div>

          {/* Review Mode — one pair at a time, for anyone who wants it */}
          {reviewMode && currentSuggestion && (
            <ResonanceReviewCarousel
              suggestion={currentSuggestion}
              index={reviewIndex}
              total={filteredSuggestions.length}
              onPrev={handlePrevReview}
              onNext={handleNextReview}
              onExit={() => setReviewMode(false)}
              onAccept={onAccept ? handleAccept : undefined}
              onDecline={onDecline ? handleDecline : undefined}
              isLoading={actionLoading === currentSuggestion.id}
            />
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
                      {/* min-w + horizontal padding, not a fixed w-5: a Space
                          can queue three-digit counts (159 in the GOAL-353
                          report) and a fixed 20px circle clipped them. */}
                      {tabCounts[status] > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-semibold text-white bg-slate-600 rounded-full dark:bg-slate-500">
                          {tabCounts[status]}
                        </span>
                      )}
                    </button>
                  )
                )}
              </div>

              {/* Group / list switch. Only offered when there is more than one
                  theme to separate — otherwise it toggles between two
                  identical views. */}
              {activeTab === 'pending' &&
                !reviewMode &&
                themeGroups.length > 1 && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-xs text-gp-ink-muted">
                      {grouped
                        ? `${themeGroups.length} themes`
                        : `${filteredSuggestions.length} suggestions`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setGrouped((v) => !v)}
                      data-testid="toggle-grouping"
                      className="flex shrink-0 items-center gap-1.5 rounded-full border border-gp-glass-border px-3 py-1 text-xs font-medium text-gp-ink-muted transition-colors duration-300 hover:text-gp-primary"
                    >
                      <span
                        aria-hidden="true"
                        className="material-symbols-outlined text-[16px]"
                      >
                        {grouped ? 'format_list_bulleted' : 'workspaces'}
                      </span>
                      {grouped ? 'View as list' : 'Group by theme'}
                    </button>
                  </div>
                )}

              {/* Bulk accept-by-confidence control (pending tab only) */}
              {activeTab === 'pending' &&
                onAcceptAll &&
                tabCounts.pending > 0 && (
                  <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="material-symbols-outlined shrink-0 text-[20px] text-gp-primary">
                        auto_awesome
                      </span>
                      <label
                        htmlFor="resonance-threshold"
                        className="text-sm text-foreground"
                      >
                        Accept all at or above
                      </label>
                      <div className="flex shrink-0 items-center gap-1">
                        <Input
                          id="resonance-threshold"
                          type="number"
                          min={0}
                          max={100}
                          value={Number.isFinite(threshold) ? threshold : ''}
                          onChange={(e) => {
                            const n = Math.round(Number(e.target.value))
                            setThreshold(
                              Number.isFinite(n)
                                ? Math.max(0, Math.min(100, n))
                                : 0
                            )
                          }}
                          className="h-9 w-16 text-center"
                          aria-label="Confidence threshold percentage"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                    <Button
                      onClick={handleAcceptAll}
                      disabled={eligibleCount === 0 || bulkLoading}
                      className="w-full shrink-0 sm:w-auto"
                    >
                      <span
                        className={cn(
                          'material-symbols-outlined mr-1 text-[18px]',
                          bulkLoading && 'animate-spin'
                        )}
                      >
                        {bulkLoading ? 'progress_activity' : 'done_all'}
                      </span>
                      {bulkLoading ? 'Accepting…' : `Accept ${eligibleCount}`}
                    </Button>
                  </div>
                )}

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
                <ResonanceSuggestionList
                  grouped={showGrouped}
                  groups={themeGroups}
                  suggestions={filteredSuggestions}
                  actionLoadingId={actionLoading}
                  onAccept={onAccept ? handleAccept : undefined}
                  onDecline={onDecline ? handleDecline : undefined}
                  onReviewTheme={onReviewTheme}
                />
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
