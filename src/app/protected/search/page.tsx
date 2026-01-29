'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAnimations } from '@/app/contexts/animation-context'
import { usePageContext } from '@/app/contexts/PageContext'
import { SEARCH_ALL } from '@/app/graphql/queries'
import { useQuery } from '@apollo/client/react'
import { capitalizeString } from '@/lib/utils'

type EntityType =
  | 'person'
  | 'community'
  | 'meSpace'
  | 'weSpace'
  | 'context'
  | 'goalPulse'
  | 'resourcePulse'
  | 'storyPulse'

type SearchEntity = {
  id: string
  type: EntityType
  title: string
  subtitle?: string
  description: string
  tags?: string[]
  href: string
}

interface GraphQLSearchResult {
  searchAll: {
    people: Array<{
      id: string
      firstName: string
      lastName: string
      email: string
    }>
    communities: Array<{ id: string; name: string; type?: string }>
    meSpaces: Array<{
      id: string
      name: string
      visibility: string
      createdAt: string
    }>
    weSpaces: Array<{
      id: string
      name: string
      visibility: string
      createdAt: string
    }>
    contexts: Array<{ id: string; title: string }>
    goalPulses: Array<{
      id: string
      content: string
      createdAt: string
      intensity: number
    }>
    resourcePulses: Array<{
      id: string
      content: string
      createdAt: string
      intensity: number
      resourceType: string
    }>
    storyPulses: Array<{
      id: string
      content: string
      createdAt: string
      intensity: number
    }>
  }
}

/**
 * Transform GraphQL search results into SearchEntity array for display
 */
const transformSearchResults = (data: GraphQLSearchResult): SearchEntity[] => {
  const entities: SearchEntity[] = []

  // Transform people
  data.searchAll.people.forEach((person) => {
    entities.push({
      id: person.id,
      type: 'person',
      title: `${person.firstName} ${person.lastName}`,
      subtitle: person.email,
      description: `A person in the network`,
      href: `/protected/dashboard/persons/${person.id}`,
    })
  })

  // Transform communities
  data.searchAll.communities.forEach((community) => {
    entities.push({
      id: community.id,
      type: 'community',
      title: community.name,
      subtitle: community.type ? `${community.type} Community` : 'Community',
      description: `A collective community`,
      href: `/protected/dashboard/community/${community.id}`,
    })
  })

  // Transform me spaces
  data.searchAll.meSpaces.forEach((space) => {
    entities.push({
      id: space.id,
      type: 'meSpace',
      title: space.name,
      subtitle: 'Me Space',
      description: `${capitalizeString(space.visibility)}`,
      href: `/protected/dashboard/space/${space.id}`,
    })
  })

  // Transform we spaces
  data.searchAll.weSpaces.forEach((space) => {
    entities.push({
      id: space.id,
      type: 'weSpace',
      title: space.name,
      subtitle: 'We Space',
      description: `${capitalizeString(space.visibility)}`,
      href: `/protected/dashboard/space/${space.id}`,
    })
  })

  // Transform contexts
  data.searchAll.contexts.forEach((context) => {
    entities.push({
      id: context.id,
      type: 'context',
      title: context.title,
      subtitle: 'Field Context',
      description: `A thematic container for related pulses`,
      href: `/protected/dashboard/field-context/${context.id}`,
    })
  })

  // Transform goal pulses
  data.searchAll.goalPulses.forEach((pulse) => {
    entities.push({
      id: pulse.id,
      type: 'goalPulse',
      title:
        pulse.content.substring(0, 50) +
        (pulse.content.length > 50 ? '...' : ''),
      subtitle: 'Goal',
      description: pulse.content,
      href: `/protected/dashboard/pulses/${pulse.id}`,
    })
  })

  // Transform resource pulses
  data.searchAll.resourcePulses.forEach((pulse) => {
    entities.push({
      id: pulse.id,
      type: 'resourcePulse',
      title:
        pulse.content.substring(0, 50) +
        (pulse.content.length > 50 ? '...' : ''),
      subtitle: pulse.resourceType,
      description: pulse.content,
      tags: [pulse.resourceType],
      href: `/protected/dashboard/pulses/${pulse.id}`,
    })
  })

  // Transform story pulses
  data.searchAll.storyPulses.forEach((pulse) => {
    entities.push({
      id: pulse.id,
      type: 'storyPulse',
      title:
        pulse.content.substring(0, 50) +
        (pulse.content.length > 50 ? '...' : ''),
      subtitle: 'Story',
      description: pulse.content,
      href: `/protected/dashboard/pulses/${pulse.id}`,
    })
  })

  return entities
}

const typeLabel: Record<EntityType, string> = {
  person: 'Person',
  community: 'Community',
  meSpace: 'Me Space',
  weSpace: 'We Space',
  context: 'Context',
  goalPulse: 'Goal',
  resourcePulse: 'Resource',
  storyPulse: 'Story',
}

const typeAccentClass: Record<EntityType, string> = {
  person: 'text-gp-primary',
  community: 'text-gp-primary',
  meSpace: 'text-gp-goal',
  weSpace: 'text-gp-goal',
  context: 'text-gp-story',
  goalPulse: 'text-gp-resource',
  resourcePulse: 'text-gp-resource',
  storyPulse: 'text-gp-story',
}

const typePillClass: Record<EntityType, string> = {
  person: 'bg-gp-primary/10 text-gp-primary border-gp-primary/20',
  community: 'bg-gp-primary/10 text-gp-primary border-gp-primary/20',
  meSpace: 'bg-gp-goal/10 text-gp-goal border-gp-goal/20',
  weSpace: 'bg-gp-goal/10 text-gp-goal border-gp-goal/20',
  context: 'bg-gp-story/10 text-gp-story border-gp-story/20',
  goalPulse: 'bg-gp-resource/10 text-gp-resource border-gp-resource/20',
  resourcePulse: 'bg-gp-resource/10 text-gp-resource border-gp-resource/20',
  storyPulse: 'bg-gp-story/10 text-gp-story border-gp-story/20',
}

export default function SearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [activeType, setActiveType] = useState<EntityType | 'all'>('all')
  const { animationsEnabled } = useAnimations()
  const { setPageTitle } = usePageContext()
  const { data, loading, error } = useQuery<GraphQLSearchResult>(SEARCH_ALL, {
    variables: { query: debouncedQuery },
    skip: debouncedQuery.length === 0,
  })

  useEffect(() => {
    setPageTitle('Search')
  }, [setPageTitle])

  // Debounce search query to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 400)

    return () => clearTimeout(timer)
  }, [query])

  // Handle entity click to set title and localStorage before navigation
  const handleEntityClick = (entity: SearchEntity, e: React.MouseEvent) => {
    e.preventDefault()

    // For spaces and fields, set title and localStorage before navigating
    if (entity.type === 'meSpace' || entity.type === 'weSpace') {
      setPageTitle(entity.title)
      localStorage.setItem(`space_${entity.id}`, entity.title)
    } else if (entity.type === 'context') {
      // For field contexts, store as field
      setPageTitle(entity.title)
      localStorage.setItem(`field_${entity.id}`, entity.title)
    } else {
      // For other entities, just set the title
      setPageTitle(entity.title)
    }

    router.push(entity.href)
  }

  const filteredEntities = useMemo(() => {
    if (!data) return []
    const transformedEntities = transformSearchResults(data)
    return transformedEntities.filter((entity) => {
      return activeType === 'all' || entity.type === activeType
    })
  }, [data, activeType])

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
                { key: 'community', label: 'Communities' },
                { key: 'meSpace', label: 'Me Spaces' },
                { key: 'weSpace', label: 'We Spaces' },
                { key: 'context', label: 'Contexts' },
                { key: 'goalPulse', label: 'Goals' },
                { key: 'resourcePulse', label: 'Resources' },
                { key: 'storyPulse', label: 'Stories' },
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
          {loading && debouncedQuery.length > 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-gp-glass-border bg-gp-glass-bg backdrop-blur-xl p-10 text-center text-gp-ink-muted dark:text-gp-ink-soft">
              Searching...
            </div>
          )}

          {error && (
            <div className="col-span-full rounded-2xl border border-dashed border-red-300 bg-red-50 dark:bg-red-900/20 backdrop-blur-xl p-10 text-center text-red-600 dark:text-red-400">
              Error searching: {error.message}
            </div>
          )}

          {query.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-gp-glass-border bg-gp-glass-bg backdrop-blur-xl p-10 text-center text-gp-ink-muted dark:text-gp-ink-soft">
              Enter a search term to explore people, spaces, and pulses.
            </div>
          )}

          {filteredEntities.length === 0 && query.length > 0 && !loading && (
            <div className="col-span-full rounded-2xl border border-dashed border-gp-glass-border bg-gp-glass-bg backdrop-blur-xl p-10 text-center text-gp-ink-muted dark:text-gp-ink-soft">
              No results found. Try another query or filter.
            </div>
          )}

          {filteredEntities.map((entity) => (
            <Link
              key={entity.id}
              href={entity.href}
              className="group"
              onClick={(e) => handleEntityClick(entity, e)}
            >
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
