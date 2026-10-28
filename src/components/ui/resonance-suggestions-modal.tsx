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
import { ResonanceBulkAcceptBar } from '@/components/ui/resonance-bulk-accept-bar'
import {
  HiddenFieldsEmptyState,
  ResonanceFieldFilter,
  useResonanceFieldFilter,
} from '@/components/ui/resonance-field-filter'
import {
  ResonanceSuggestionTabs,
  type ResonanceTabStatus as TabStatus,
} from '@/components/ui/resonance-suggestion-tabs'
import { ResonanceSuggestionList } from '@/components/ui/resonance-suggestion-list'
import { ResonanceReviewCarousel } from '@/components/ui/resonance-review-carousel'
import { groupSuggestionsByTheme } from '@/lib/resonance/group-suggestions'
import { Skeleton } from '@/components/ui/skeleton'

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
  matchedContextId?: string | null
  matchedContextTitle?: string | null
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

  // Grouped is the default on the pending tab — it is the view that makes a
  // large queue reviewable. The flat list stays one tap away for anyone who
  // wants to work pair by pair.
  const [grouped, setGrouped] = useState(true)

  const tabSuggestions = useMemo(
    () => suggestions.filter((s) => s.status === activeTab),
    [suggestions, activeTab]
  )

  // Hide / show by the field a match came from (GOAL-384).
  const fieldFilter = useResonanceFieldFilter(tabSuggestions)
  const { isVisible, visible: filteredSuggestions } = fieldFilter

  // The bulk routes act on the whole field's queue server-side, hidden
  // suggestions included, so "Accept 12" or a theme's "Accept all" would take
  // pairs the member just chose not to see. Pause them while a field is hidden
  // rather than let the number on the button and the action disagree.
  const bulkPaused = activeTab === 'pending' && fieldFilter.hiddenCount > 0

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
  // Render grouped whenever there is a real theme to group by. Requiring more
  // than one theme meant a queue of 117 pairs that all share ONE theme — the
  // worst case this feature exists for — fell back to a flat list with no
  // "Accept all 117" button. The TOGGLE still needs >1 to be meaningful.
  const showGrouped =
    grouped &&
    activeTab === 'pending' &&
    !reviewMode &&
    themeGroups.length > 0 &&
    themeGroups.some((g) => g.themeId)

  // Get current suggestion in review mode
  const currentSuggestion = reviewMode ? filteredSuggestions[reviewIndex] : null

  // What each tab will actually list once hidden fields are taken out.
  const countTab = (status: TabStatus) =>
    suggestions.filter((s) => s.status === status && isVisible(s)).length
  const tabCounts = {
    pending: countTab('pending'),
    accepted: countTab('accepted'),
    declined: countTab('declined'),
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
    // Stays mounted on the field page — never reopen filtered from last time.
    fieldFilter.showAll()
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
              <ResonanceSuggestionTabs
                activeTab={activeTab}
                counts={tabCounts}
                onChange={setActiveTab}
              />

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

              {/* Hide / show by the field a match came from (GOAL-384) */}
              {!loading && (
                <ResonanceFieldFilter
                  rows={fieldFilter.rows}
                  hidden={fieldFilter.hidden}
                  hiddenCount={fieldFilter.hiddenCount}
                  onToggle={fieldFilter.toggle}
                  onShowAll={fieldFilter.showAll}
                />
              )}

              {/* Bulk accept-by-confidence control (pending tab only) */}
              {activeTab === 'pending' &&
                onAcceptAll &&
                tabCounts.pending > 0 &&
                !bulkPaused && (
                  <ResonanceBulkAcceptBar
                    threshold={threshold}
                    onThresholdChange={setThreshold}
                    eligibleCount={eligibleCount}
                    loading={bulkLoading}
                    onAcceptAll={handleAcceptAll}
                  />
                )}
              {bulkPaused && (onAcceptAll || onReviewTheme) && (
                <p className="text-xs text-gp-ink-muted">
                  Bulk accept and dismiss are paused while a field is hidden —
                  they would include the suggestions you have hidden.
                </p>
              )}

              {/* Content */}
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-48 rounded-lg" />
                  ))}
                </div>
              ) : filteredSuggestions.length === 0 &&
                tabSuggestions.length > 0 ? (
                <HiddenFieldsEmptyState
                  status={activeTab}
                  onShowAll={fieldFilter.showAll}
                />
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
                  onReviewTheme={
                    onReviewTheme && !bulkPaused
                      ? async (themeId, action) => {
                          const result = await onReviewTheme(themeId, action)
                          // onRefresh is the ONLY caller that re-counts the
                          // field badge and notifies the action bar. Every
                          // other action awaits it; without it here the queue
                          // updates and the badge keeps the pre-action number
                          // — the exact mismatch this work set out to close.
                          await onRefresh?.()
                          return result
                        }
                      : undefined
                  }
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
