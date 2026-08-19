'use client'

import { cn } from '@/lib/utils'

/**
 * The three terminal states of the person profile surface, lifted out of
 * `persons/[id]/page.tsx` so the route stays under the 400-line ceiling and so
 * the shared shell (tokens, spacing, mobile density) lives in one place.
 *
 * All copy is member-facing: no raw ids, no `__typename`, no error text from
 * the server (kb/07 Rule 1).
 */

function ProfileStateShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-sm text-center flex flex-col items-center gap-3">
        {children}
      </div>
    </div>
  )
}

export function ProfileLoadingState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 bg-gp-surface/50 dark:bg-gp-surface-dark/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <span
          className={cn(
            'material-symbols-outlined text-5xl text-gp-primary',
            'motion-safe:animate-spin'
          )}
          aria-hidden="true"
        >
          hourglass_bottom
        </span>
        <p
          role="status"
          className="text-sm font-medium text-gp-ink-muted dark:text-gp-ink-soft"
        >
          Loading...
        </p>
      </div>
    </div>
  )
}

/**
 * Shown when the profile query failed or timed out and nothing is cached.
 * The request is heavy enough to exceed the API's execution ceiling on large
 * Spaces, so the recovery affordance is a user-controlled retry rather than an
 * automatic one (RetryLink deliberately does not retry a status response).
 */
export function ProfileErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <ProfileStateShell>
      <span
        className="material-symbols-outlined text-4xl text-gp-ink-soft"
        aria-hidden="true"
      >
        cloud_off
      </span>
      <h1 className="text-lg font-semibold text-gp-ink-strong">
        We couldn&apos;t load this profile
      </h1>
      <p className="text-sm text-gp-ink-muted dark:text-gp-ink-soft">
        The request didn&apos;t come back in time. This is usually temporary —
        try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className={cn(
          'mt-1 inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2',
          // Brand color carries the icon only: `--gp-primary` on glass falls
          // below AA for 14px text in light mode (and is unreadable in the
          // warm/emerald light themes), so the label uses an ink token.
          'text-sm font-medium text-gp-ink-strong gp-glass',
          'transition-all duration-300 hover:-translate-y-0.5',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gp-primary focus-visible:ring-offset-2'
        )}
      >
        <span
          className="material-symbols-outlined text-base text-gp-primary"
          aria-hidden="true"
        >
          refresh
        </span>
        Try again
      </button>
    </ProfileStateShell>
  )
}

/**
 * GOAL-275: this page selects Space-scoped PII fields, so an unauthorized
 * viewer (shares no Space with this person, and isn't them) gets an EMPTY
 * result rather than a partial one — the whole Person row is filtered out.
 * Neutral "not available", not an error: nothing failed, the profile is simply
 * private to people outside their Spaces.
 */
export function ProfileUnavailableState() {
  return (
    <ProfileStateShell>
      <span
        className="material-symbols-outlined text-4xl text-gp-ink-soft"
        aria-hidden="true"
      >
        lock_person
      </span>
      <h1 className="text-lg font-semibold text-gp-ink-strong">
        This profile isn&apos;t available
      </h1>
      <p className="text-sm text-gp-ink-muted dark:text-gp-ink-soft">
        You can only view someone&apos;s full profile if you share a Space with
        them. Ask them to add you to a Space to connect.
      </p>
    </ProfileStateShell>
  )
}
