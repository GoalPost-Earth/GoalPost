import type { AssistantFeedbackRating } from '@/lib/feedback/assistant-feedback.service'

/**
 * Resolve the rating filter for the AI-quality triage dashboard.
 *
 * The dashboard is a FAILURE triage board: every row renders a "Fix this in
 * Claude Code" prompt and is treated as something to fix. Positive feedback is
 * a SUCCESS signal, not a failure — an explicit thumbs-up, OR an inline
 * suggestion-card ACCEPT recorded as positive `user_thumb` (userComment
 * "Accepted suggested resonance: …"). Surfacing those here force-fits a success
 * into the triage flow and mints a bogus fix task (the exact false positive
 * this guards against). This mirrors `listUnclassifiedFeedback`, which scopes
 * the daily classifier to negative for the same reason — so a positive row that
 * the classifier correctly skipped (classification/cluster null) does not then
 * re-enter as an "unclustered" bad row through the dashboard's own read.
 *
 * Default: negative-only. A curator can still inspect successes with an
 * explicit `?rating=positive` (e.g. to mark golden-set examples). An
 * unrecognized value falls back to the failure-triage default rather than
 * widening the view.
 */
export function resolveTriageRating(
  raw: string | undefined
): AssistantFeedbackRating {
  return raw === 'positive' || raw === 'negative' ? raw : 'negative'
}
