import { notFound } from 'next/navigation'
import Link from 'next/link'

/**
 * /dev — index of internal dev/staging dashboards. Env-gated (belt-and-braces
 * with the /dev layout). Not user-facing; 404 in production by default.
 */

const TOOLS: { href: string; icon: string; title: string; blurb: string }[] = [
  {
    href: '/dev/ai-quality',
    icon: 'rate_review',
    title: 'AI Quality',
    blurb:
      'Assistant feedback triage — user thumbs + auto-signals (tool errors, empty responses, rule leaks).',
  },
  {
    href: '/dev/llm-usage',
    icon: 'monitoring',
    title: 'LLM Usage & Cost',
    blurb:
      'Token & cost measurement across users, models, and system (background) work.',
  },
]

export default function DevIndex() {
  if (
    process.env.NODE_ENV !== 'development' &&
    process.env.ENABLE_DEV_DASHBOARDS !== 'true'
  ) {
    notFound()
  }

  return (
    <div className="px-4 py-6 sm:px-6 space-y-6 max-w-4xl mx-auto">
      <header className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-semibold">Internal dashboards</h1>
        <p className="text-sm text-gp-ink-muted dark:text-white/60">
          Dev / staging tooling. Not visible in production.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group flex items-start gap-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-4 transition-colors hover:border-gp-primary/40 hover:bg-gp-primary/5"
          >
            <span
              aria-hidden
              className="material-symbols-outlined shrink-0 text-gp-primary text-[22px]"
            >
              {tool.icon}
            </span>
            <div className="min-w-0">
              <div className="font-semibold group-hover:text-gp-primary transition-colors">
                {tool.title}
              </div>
              <p className="text-xs text-gp-ink-muted dark:text-white/60 mt-0.5">
                {tool.blurb}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
