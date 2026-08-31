'use client'

import { type FC } from 'react'
import { useQuery } from '@apollo/client/react'
import Image from 'next/image'
import { ArrowRight, Link2 } from 'lucide-react'
import { GET_PERSON_CONNECTIONS } from '@/app/graphql/queries/SPACE_QUERIES'
import { BodySkeleton, ErrorBody, NotFoundBody, SectionHeader } from './shared'
import { dispatchOpenInfoDrawer } from './types'

/**
 * Inspection body for an interpersonal `CONNECTED_TO` relationship — the pair
 * of people plus the `why` and `interests` carried on the edge.
 *
 * A connection isn't a single node, so the drawer addresses it by a composite
 * key: the two person ids sorted and joined with `__` (built in BloomView's
 * relationship-click handler). We resolve both endpoints' display info from
 * `GET_PERSON_CONNECTIONS`: each person's `connections` list contains the
 * *other* endpoint (name/photo — directory fields only, per GOAL-275), and
 * `connectionEdges` carries the relationship metadata. The whole query is
 * Space-scoped by the Person field-auth gate, so a caller who shares no Space
 * with (and isn't connected to) either endpoint resolves nothing → NotFound.
 * Resolving from the query (not the click payload) keeps
 * the drawer URL-refresh-safe — `?entity=Connection:a__b` reopens correctly.
 *
 * Replaces the legacy `ConnectionPanel` (removed with /protected/spaces/*).
 */

type PersonLite = {
  id: string
  firstName?: string | null
  lastName?: string | null
  name?: string | null
  photo?: string | null
}

type ConnectionEdge = {
  connectedPersonId?: string | null
  why?: string | null
  interests?: string | null
}

type PersonConnectionsRecord = {
  id: string
  // GOAL-275: the connection graph is PII — it reads through the single
  // type-level gate, and is null for a caller not authorized for this person.
  privateProfile?: {
    connections?: PersonLite[] | null
    connectionEdges?: ConnectionEdge[] | null
  } | null
}

function displayName(p?: PersonLite | null): string {
  if (!p) return 'Unknown'
  const composed = `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim()
  return p.name?.trim() || composed || 'Unnamed'
}

export const ConnectionDetailsBody: FC<{
  connectionKey: string
  label?: string
}> = ({ connectionKey, label }) => {
  // Composite key `aId__bId`. Person ids never contain `__` (prefixes use a
  // single underscore; UUIDs use hyphens), so the first `__` is the separator.
  // Split on the first occurrence (not `.split`) so a hypothetical `__`-bearing
  // id can't silently drop a segment — a malformed key (no separator) fails
  // closed to NotFound below.
  const sep = connectionKey.indexOf('__')
  const aId = sep > 0 ? connectionKey.slice(0, sep) : ''
  const bId = sep > 0 ? connectionKey.slice(sep + 2) : ''

  const { data, loading, error, refetch } = useQuery(GET_PERSON_CONNECTIONS, {
    variables: { personIds: [aId, bId].filter(Boolean) },
    fetchPolicy: 'cache-and-network',
    skip: !aId || !bId,
  })

  if (loading && !data) return <BodySkeleton label={label} />

  const people = (data?.people ?? []) as PersonConnectionsRecord[]
  const aRecord = people.find((p) => p.id === aId)
  const bRecord = people.find((p) => p.id === bId)

  // Each endpoint's display info comes from the *other* person's connections
  // list (the query doesn't return a person's own name fields directly).
  const personA =
    bRecord?.privateProfile?.connections?.find((c) => c.id === aId) ?? null
  const personB =
    aRecord?.privateProfile?.connections?.find((c) => c.id === bId) ?? null

  const edge =
    aRecord?.privateProfile?.connectionEdges?.find(
      (e) => e.connectedPersonId === bId
    ) ??
    bRecord?.privateProfile?.connectionEdges?.find(
      (e) => e.connectedPersonId === aId
    ) ??
    null

  if (!personA && !personB) {
    if (error) return <ErrorBody detail={error.message} onRetry={() => refetch()} />
    return <NotFoundBody message="This connection no longer exists." />
  }

  const why = edge?.why?.trim() || ''
  const interests = edge?.interests?.trim() || ''

  return (
    <div className="flex flex-col">
      <section className="relative px-6 pt-7 pb-7 border-b border-gp-glass-border bg-gradient-to-br from-gp-primary/20 via-gp-accent-glow/10 to-transparent">
        <div className="flex items-start gap-4">
          <div className="shrink-0 size-14 rounded-2xl border flex items-center justify-center shadow-md bg-gp-primary/20 border-gp-primary/40 text-gp-primary">
            <Link2 className="w-7 h-7" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <h2 className="text-xl font-black tracking-tight text-gp-ink-strong dark:text-white break-words leading-tight">
              {displayName(personA)}{' '}
              <span className="text-gp-ink-muted dark:text-white/45">&amp;</span>{' '}
              {displayName(personB)}
            </h2>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] border bg-gp-primary/20 border-gp-primary/40 text-gp-primary">
              Connection
            </span>
          </div>
        </div>
      </section>

      <section className="px-6 py-5 space-y-3">
        <PersonCard person={personA} fallbackId={aId} />
        <div className="flex items-center justify-center text-gp-primary">
          <span className="material-symbols-outlined">sync_alt</span>
        </div>
        <PersonCard person={personB} fallbackId={bId} />
      </section>

      {why && (
        <section className="px-6 pb-5">
          <SectionHeader>Why connected</SectionHeader>
          <p className="mt-2 text-sm text-gp-ink-muted dark:text-white/65 italic leading-relaxed">
            &quot;{why}&quot;
          </p>
        </section>
      )}

      {interests && (
        <section className="px-6 pb-6">
          <SectionHeader>Shared interests</SectionHeader>
          <p className="mt-2 text-sm text-gp-ink-muted dark:text-white/70 leading-relaxed">
            {interests}
          </p>
        </section>
      )}
    </div>
  )
}

const PersonCard: FC<{ person: PersonLite | null; fallbackId?: string }> = ({
  person,
  fallbackId,
}) => {
  const id = person?.id ?? fallbackId
  const name = displayName(person)
  return (
    <button
      type="button"
      disabled={!id}
      onClick={() =>
        id &&
        dispatchOpenInfoDrawer({
          type: 'Person',
          id,
          label: person?.name ?? undefined,
        })
      }
      className="group w-full text-left rounded-2xl border border-gp-glass-border bg-white/30 dark:bg-white/5 hover:bg-white/40 dark:hover:bg-white/[0.08] transition-all px-5 py-4 cursor-pointer disabled:cursor-default disabled:opacity-60"
    >
      <div className="flex items-center gap-3">
        <div className="size-10 shrink-0 rounded-full bg-linear-to-br from-gp-primary/20 to-gp-primary/10 flex items-center justify-center overflow-hidden">
          {person?.photo ? (
            <Image
              src={person.photo}
              alt={name}
              width={40}
              height={40}
              className="size-10 rounded-full object-cover"
            />
          ) : (
            <span className="material-symbols-outlined text-gp-primary text-xl">
              person
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gp-ink-strong dark:text-white truncate">
            {name}
          </p>
        </div>
        <ArrowRight className="w-4 h-4 shrink-0 text-gp-ink-soft/50 dark:text-white/30 group-hover:text-gp-ink-muted dark:group-hover:text-white/70 group-hover:translate-x-0.5 transition-all" />
      </div>
    </button>
  )
}
