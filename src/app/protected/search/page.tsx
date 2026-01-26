'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAnimations } from '@/app/contexts/animation-context'
import { usePageContext } from '@/app/contexts/PageContext'

type EntityType = 'person' | 'space' | 'resonance' | 'pulse'

type SearchEntity = {
  id: string
  type: EntityType
  title: string
  subtitle?: string
  description: string
  tags?: string[]
  href: string
}

const sampleEntities: SearchEntity[] = [
  {
    id: 'person-1',
    type: 'person',
    title: 'Elena Vance',
    subtitle: 'Synthesizer',
    description:
      'Exploring collective intelligence and decentralized governance models.',
    tags: ['DAO', 'Ethics'],
    href: '/protected/people/person-1',
  },
  {
    id: 'space-1',
    type: 'space',
    title: 'Pattern Library',
    subtitle: 'Community Space',
    description: 'Community-led design systems for social coordination.',
    tags: ['Design', 'Systems'],
    href: '/protected/spaces/pattern-library',
  },
  {
    id: 'resonance-1',
    type: 'resonance',
    title: 'Shared Vision',
    subtitle: 'Alignment Signal',
    description:
      'High cohesion across neighboring pulses in the governance domain.',
    tags: ['Alignment', 'Governance'],
    href: '/protected/resonance/shared-vision',
  },
  {
    id: 'pulse-1',
    type: 'pulse',
    title: 'Weekly Sync',
    subtitle: 'Pulse',
    description: 'Participants converge on priorities and unblock shared work.',
    tags: ['Collaboration', 'Meeting'],
    href: '/protected/pulses/weekly-sync',
  },
  {
    id: 'person-2',
    type: 'person',
    title: 'Malik Soto',
    subtitle: 'Field Catalyst',
    description: 'Connecting early-stage projects to the right collaborators.',
    tags: ['Network', 'Funding'],
    href: '/protected/people/malik-soto',
  },
  {
    id: 'space-2',
    type: 'space',
    title: 'Governance Guild',
    subtitle: 'We Space',
    description:
      'A shared lab for incentive design, protocols, and decision tooling.',
    tags: ['Governance', 'Protocols'],
    href: '/protected/spaces/governance-guild',
  },
]

const typeLabel: Record<EntityType, string> = {
  person: 'Person',
  space: 'Space',
  resonance: 'Resonance',
  pulse: 'Pulse',
}

const typeAccentClass: Record<EntityType, string> = {
  person: 'text-gp-primary',
  space: 'text-gp-goal',
  resonance: 'text-gp-story',
  pulse: 'text-gp-resource',
}

const typePillClass: Record<EntityType, string> = {
  person: 'bg-gp-primary/10 text-gp-primary border-gp-primary/20',
  space: 'bg-gp-goal/10 text-gp-goal border-gp-goal/20',
  resonance: 'bg-gp-story/10 text-gp-story border-gp-story/20',
  pulse: 'bg-gp-resource/10 text-gp-resource border-gp-resource/20',
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [activeType, setActiveType] = useState<EntityType | 'all'>('all')
  const { animationsEnabled } = useAnimations()
  const { setPageTitle } = usePageContext()

  useEffect(() => {
    setPageTitle('Search')
  }, [setPageTitle])

  const filteredEntities = useMemo(() => {
    return sampleEntities.filter((entity) => {
      const matchesType = activeType === 'all' || entity.type === activeType
      const text =
        `${entity.title} ${entity.subtitle ?? ''} ${entity.description} ${(entity.tags ?? []).join(' ')}`.toLowerCase()
      const matchesQuery = text.includes(query.toLowerCase())
      return matchesType && matchesQuery
    })
  }, [activeType, query])

  return (
    <div
      className="relative min-h-screen overflow-x-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors pt-20"
      style={{
        backgroundImage: `
					radial-gradient(at 18% 18%, color-mix(in srgb, var(--gp-primary) 12%, transparent) 0, transparent 55%),
					radial-gradient(at 82% 16%, color-mix(in srgb, var(--gp-accent-glow) 12%, transparent) 0, transparent 55%),
					radial-gradient(at 80% 85%, color-mix(in srgb, var(--gp-goal) 10%, transparent) 0, transparent 60%),
					radial-gradient(at 16% 86%, color-mix(in srgb, var(--gp-resource) 12%, transparent) 0, transparent 60%)
				`,
      }}
    >
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute -top-40 -left-40 w-[320px] h-80 rounded-full bg-gp-primary/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[320px] h-80 rounded-full bg-gp-accent-glow/10 blur-[120px]" />
      </div>

      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 py-16 md:py-20 flex flex-col gap-10">
        <header className="flex flex-col gap-6 ">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gp-ink-strong dark:text-gp-ink-strong">
              Discover people, spaces, and resonances
            </h1>
            <p className="text-sm text-gp-ink-muted dark:text-gp-ink-soft max-w-2xl">
              Search across the network. Filter by entity type and apply your
              color theme for clarity in light or dark mode.
            </p>
          </div>

          <div className="flex flex-col gap-4 md:gap-6 rounded-3xl p-6 md:p-8 bg-gp-glass-bg border border-gp-glass-border shadow-[0_30px_60px_-12px_rgba(0,0,0,0.08)] backdrop-blur-2xl dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gp-ink-muted dark:text-gp-ink-soft">
                Search query
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-gp-glass-border bg-white/70 dark:bg-white/5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] px-4 py-3">
                <span className="material-symbols-outlined text-gp-ink-soft text-xl">
                  search
                </span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Explore resonances, people, and pulses..."
                  className="w-full bg-transparent focus:outline-none text-base text-gp-ink-strong dark:text-gp-ink-strong placeholder:text-gp-ink-soft"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {[
                { key: 'all', label: 'All' },
                { key: 'person', label: 'People' },
                { key: 'space', label: 'Spaces' },
                { key: 'resonance', label: 'Resonance' },
                { key: 'pulse', label: 'Pulses' },
              ].map((option) => {
                const isActive = activeType === option.key
                return (
                  <button
                    key={option.key}
                    onClick={() =>
                      setActiveType(option.key as EntityType | 'all')
                    }
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gp-primary/10 border-gp-primary/30 text-gp-ink-strong dark:text-gp-ink-strong'
                        : 'bg-white/50 dark:bg-white/5 border-gp-glass-border text-gp-ink-muted dark:text-gp-ink-soft hover:border-gp-primary/30'
                    } ${animationsEnabled ? 'hover:-translate-y-0.5' : ''}`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEntities.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-gp-glass-border bg-gp-glass-bg backdrop-blur-xl p-10 text-center text-gp-ink-muted dark:text-gp-ink-soft">
              No results yet. Try another query or filter.
            </div>
          )}

          {filteredEntities.map((entity) => (
            <Link key={entity.id} href={entity.href} className="group">
              <article
                className={`h-full rounded-2xl border border-gp-glass-border bg-gp-glass-bg backdrop-blur-xl p-5 shadow-[0_20px_40px_-16px_rgba(0,0,0,0.12)] dark:shadow-[0_30px_70px_-28px_rgba(0,0,0,0.6)] transition-all ${
                  animationsEnabled
                    ? 'group-hover:-translate-y-1 group-hover:shadow-[0_24px_48px_-18px_rgba(0,0,0,0.14)]'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`text-xs font-semibold uppercase tracking-[0.16em] ${typeAccentClass[entity.type]}`}
                  >
                    {typeLabel[entity.type]}
                  </div>
                  <span className="material-symbols-outlined text-gp-ink-soft dark:text-gp-ink-soft text-xl">
                    arrow_outward
                  </span>
                </div>

                <div className="mt-3 flex flex-col gap-1">
                  <h3 className="text-lg font-semibold text-gp-ink-strong dark:text-gp-ink-strong leading-tight">
                    {entity.title}
                  </h3>
                  {entity.subtitle && (
                    <p className="text-xs font-medium text-gp-ink-muted dark:text-gp-ink-soft">
                      {entity.subtitle}
                    </p>
                  )}
                </div>

                <p className="mt-3 text-sm text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed line-clamp-3">
                  {entity.description}
                </p>

                {entity.tags && entity.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {entity.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`px-2 py-1 rounded-full text-[11px] font-semibold border ${typePillClass[entity.type]}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            </Link>
          ))}
        </section>
      </main>
    </div>
  )
}
