'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/**
 * The pending tab's "Accept all at or above N%" control.
 *
 * Split out of the review modal so that modal stays inside the 400-line rule
 * once it gained the per-field filter (GOAL-384). Stateless: the modal owns the
 * threshold, the eligible count and the request.
 */

interface ResonanceBulkAcceptBarProps {
  threshold: number
  onThresholdChange: (threshold: number) => void
  eligibleCount: number
  loading: boolean
  onAcceptAll: () => void
}

export function ResonanceBulkAcceptBar({
  threshold,
  onThresholdChange,
  eligibleCount,
  loading,
  onAcceptAll,
}: ResonanceBulkAcceptBarProps) {
  return (
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
              onThresholdChange(
                Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0
              )
            }}
            className="h-9 w-16 text-center"
            aria-label="Confidence threshold percentage"
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
      </div>
      <Button
        onClick={onAcceptAll}
        disabled={eligibleCount === 0 || loading}
        className="w-full shrink-0 sm:w-auto"
      >
        <span
          className={cn(
            'material-symbols-outlined mr-1 text-[18px]',
            loading && 'animate-spin'
          )}
        >
          {loading ? 'progress_activity' : 'done_all'}
        </span>
        {loading ? 'Accepting…' : `Accept ${eligibleCount}`}
      </Button>
    </div>
  )
}
