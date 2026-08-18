import Link from 'next/link'

/**
 * Friendly dead-end for a durable document-download link that can no longer be
 * resolved (GOAL-321). The download route 302s authenticated BROWSER
 * navigations here when the read gate comes back empty — mirroring the
 * unauthenticated login redirect (GOAL-316) — instead of dead-ending the
 * member on a raw JSON 404 body. Programmatic callers never land here; they
 * keep the JSON envelope.
 *
 * The copy is deliberately ambiguous between "removed" and "no access": the
 * download route returns the same verdict for both, and this page must not
 * become a side channel that confirms a document's existence to non-members.
 */
export default function DocumentUnavailablePage() {
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors"
      style={{
        backgroundImage: `
        radial-gradient(at 20% 20%, color-mix(in srgb, var(--gp-primary) 10%, transparent) 0, transparent 55%),
        radial-gradient(at 80% 15%, color-mix(in srgb, var(--gp-accent-glow) 12%, transparent) 0, transparent 55%),
        radial-gradient(at 85% 85%, color-mix(in srgb, var(--gp-resource) 10%, transparent) 0, transparent 55%),
        radial-gradient(at 15% 85%, color-mix(in srgb, var(--gp-story) 8%, transparent) 0, transparent 55%)
      `,
      }}
    >
      <div className="relative w-full max-w-2xl flex flex-col items-center justify-center px-4">
        {/* Floating gradient blobs */}
        <div className="pointer-events-none absolute -top-20 -left-20 w-64 h-64 bg-gp-primary/12 dark:bg-gp-primary/10 rounded-full blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 w-80 h-80 bg-gp-accent-glow/12 dark:bg-gp-accent-glow/10 rounded-full blur-[100px]" />

        <div className="w-full max-w-[440px] flex flex-col items-center text-center gap-4 sm:gap-5 p-6 sm:p-10 relative z-10 rounded-3xl bg-gp-glass-bg backdrop-blur-[40px] border border-gp-glass-border shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_28px_70px_rgba(0,0,0,0.5)]">
          <div className="size-12 sm:size-14 bg-white/60 dark:bg-white/10 rounded-full flex items-center justify-center border border-white/70 dark:border-white/15 shadow-sm dark:shadow-lg">
            <span
              className="material-symbols-outlined text-gp-primary text-2xl sm:text-3xl"
              aria-hidden="true"
            >
              scan_delete
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-light text-gp-ink-strong tracking-tight">
              Document unavailable
            </h1>
            <p className="text-sm text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed">
              This document can&apos;t be opened. It may have been removed from
              its space, or your account may not have access to it.
            </p>
            <p className="text-xs text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed">
              Pulses created from a removed document stay in the field — only
              the original file is gone.
            </p>
          </div>

          <Link
            href="/protected/dashboard"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white bg-gp-primary hover:opacity-90 transition-all duration-300 hover:-translate-y-0.5 shadow-[0_8px_28px_color-mix(in_srgb,var(--gp-primary)_35%,transparent)]"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              hub
            </span>
            Back to GoalPost
          </Link>
        </div>
      </div>
    </div>
  )
}
