import { type FC } from 'react'
import { cn } from '@/lib/utils'

/**
 * Shown when a Person resolves but their `privateProfile` is null — the
 * GOAL-275 gate withheld it (see kb/02-user-roles.md for the branch list).
 *
 * The copy deliberately does NOT claim any relationship to the viewer. Person
 * identity (name + photo) is open cross-Space by design so people stay
 * findable by name, which means this notice renders for complete strangers as
 * well as for contacts the viewer simply doesn't share a Space with. Saying
 * "in your network" here would assert a tie that may not exist.
 *
 * Rendered by both the person drawer (`LimitedPersonBody`) and the person
 * profile page, so the two surfaces cannot drift apart.
 */
export const PrivateProfileNotice: FC<{ className?: string }> = ({
  className,
}) => (
  <div
    className={cn(
      'flex items-start gap-3 rounded-xl border border-gp-glass-border bg-black/[0.03] dark:bg-white/[0.03] px-4 py-3.5 sm:px-5 sm:py-4',
      className
    )}
  >
    <span className="material-symbols-outlined shrink-0 text-[20px] text-gp-ink-muted dark:text-gp-ink-soft">
      lock
    </span>
    <div className="min-w-0">
      <p className="text-sm font-semibold text-gp-ink-strong dark:text-white/90">
        Private profile
      </p>
      <p className="mt-1 text-xs text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed">
        This person&apos;s details are only shared with people they share a
        Space with.
      </p>
    </div>
  </div>
)
