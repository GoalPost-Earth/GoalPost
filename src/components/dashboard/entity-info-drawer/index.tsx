'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FC,
} from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { gsap } from 'gsap'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useFocalEntity } from '@/contexts'
import type { FocalEntityType } from '@/lib/focal-entity/types'
import {
  CLOSE_INFO_DRAWER_EVENT,
  ENTITY_QUERY_PARAM,
  OPEN_INFO_DRAWER_EVENT,
  decodeEntityParam,
  encodeEntityParam,
  type InfoEntity,
  type InfoEntityType,
} from './types'
import { SpaceDetailsBody } from './space-details-body'
import { PulseDetailsBody } from './pulse-details-body'
import { PersonDetailsBody } from './person-details-body'
import { FieldContextDetailsBody } from './field-context-details-body'
import { DocumentDetailsBody } from './document-details-body'
import { ResonanceDetailsBody } from './resonance-details-body'
import { PromiseWeaveDetailsBody } from './promise-weave-details-body'
import { OrganizationDetailsBody } from './organization-details-body'
import { ConnectionDetailsBody } from './connection-details-body'

export { dispatchOpenInfoDrawer, dispatchCloseInfoDrawer } from './types'
export type { InfoEntity, InfoEntityType } from './types'

const TYPE_LABEL: Record<InfoEntityType, string> = {
  MeSpace: 'Me Space',
  WeSpace: 'We Space',
  FieldContext: 'Field Context',
  Pulse: 'Pulse',
  Person: 'Person',
  Document: 'Document',
  ResonanceLink: 'Resonance',
  PromiseWeave: 'Promise weave',
  Organization: 'Organization',
  Connection: 'Connection',
}

/**
 * Map an InfoEntityType to a FocalEntityType so opening the drawer can
 * also update the AI assistant's session context. Pulse falls through
 * provisionally as GoalPulse — the body refines via setFocalLabel once
 * the actual __typename resolves.
 */
function toFocalType(type: InfoEntityType): FocalEntityType | null {
  switch (type) {
    case 'MeSpace':
    case 'WeSpace':
    case 'FieldContext':
      return type
    case 'Person':
      return 'PersonPulse'
    case 'Pulse':
      return 'GoalPulse'
    // Document and ResonanceLink aren't focal entity types — they don't
    // change the assistant scope.
    default:
      return null
  }
}

/**
 * Right-side glass drawer mounted once in CanvasHost. Listens for the
 * global `goalpost:open-info-drawer` event so any caller (canvas nodes,
 * cards, assistant tool buttons) can summon it without prop drilling.
 *
 * Syncs to `?entity=Type:id` so refresh, deep links, and bookmarks all
 * reopen the drawer at the right entity.
 */
export const EntityInfoDrawer: FC = () => {
  const [entity, setEntity] = useState<InfoEntity | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const { setFocalEntity, setFocalLabel } = useFocalEntity()

  useFocusTrap(panelRef, entity !== null)

  useEntityDrawerUrl(entity, setEntity)

  // Push focal entity into FocalEntityContext when we open. The body's own
  // query resolves the label and refines the type via setFocalLabel afterward.
  //
  // On close, release the manual override so the focal falls back to the
  // route derivation (GOAL-289). Closing only strips the `?entity=` query
  // param — the pathname never changes — so FocalEntityContext's
  // pathname-diff reset never fires, and without this the focal stays
  // latched on the pulse. The studio action cluster (Upload, Add pulse)
  // gates on `focalEntity.source === 'route'`, so a stale manual focal
  // hid it in both Bloom and Dashboard views until a full refresh.
  // `wasOpenRef` scopes the release to a real open→close transition —
  // i.e. "a drawer session occurred". Today every manual-focal setter
  // accompanies a drawer open, so this never clears a focal set elsewhere;
  // if a drawer-less manual setter is ever added, revisit this guard.
  const wasOpenRef = useRef(false)
  useEffect(() => {
    if (!entity) {
      if (wasOpenRef.current) {
        wasOpenRef.current = false
        setFocalEntity(null)
      }
      return
    }
    wasOpenRef.current = true
    const focalType = toFocalType(entity.type)
    if (!focalType) return
    setFocalEntity({
      type: focalType,
      id: entity.id,
      label: entity.label,
      focusedAt: new Date().toISOString(),
      source: 'manual',
    })
    if (entity.label) setFocalLabel(entity.id, entity.label)
  }, [entity, setFocalEntity, setFocalLabel])

  // Listen for open events globally.
  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<InfoEntity>).detail
      if (!detail || !detail.id || !detail.type) return
      setEntity(detail)
    }
    const onClose = () => setEntity(null)
    window.addEventListener(OPEN_INFO_DRAWER_EVENT, onOpen)
    window.addEventListener(CLOSE_INFO_DRAWER_EVENT, onClose)
    return () => {
      window.removeEventListener(OPEN_INFO_DRAWER_EVENT, onOpen)
      window.removeEventListener(CLOSE_INFO_DRAWER_EVENT, onClose)
    }
  }, [])

  // Close on Escape.
  useEffect(() => {
    if (!entity) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setEntity(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [entity])

  // Slide in when an entity is set (or when the entity *changes* — e.g.
  // user drills from FieldContext into a Pulse — replay the animation so
  // the swap feels intentional rather than abrupt).
  useEffect(() => {
    if (!entity || !panelRef.current) return
    gsap.fromTo(
      panelRef.current,
      { x: '100%', opacity: 0 },
      { x: '0%', opacity: 1, duration: 0.32, ease: 'power3.out' }
    )
  }, [entity?.type, entity?.id, entity])

  const close = useCallback(() => setEntity(null), [])

  if (!entity) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
        onClick={close}
        aria-hidden="true"
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${entity.type} details`}
        tabIndex={-1}
        className={cn(
          'fixed right-0 top-0 h-full w-full sm:w-[520px] z-50',
          'bg-gp-surface dark:bg-slate-950/95 backdrop-blur-2xl',
          'border-l border-gp-glass-border shadow-2xl',
          'flex flex-col overflow-hidden',
          'focus:outline-none'
        )}
      >
        <header className="flex items-center justify-between gap-2 px-6 py-4 border-b border-gp-glass-border shrink-0">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gp-ink-muted dark:text-white/45">
              {TYPE_LABEL[entity.type]}
            </p>
            <p className="text-base font-bold text-gp-ink-strong dark:text-white/95">
              Details
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close details"
            title="Close (Esc)"
            className="flex items-center justify-center size-9 rounded-full text-gp-ink-muted dark:text-white/55 hover:text-gp-ink-strong dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {/*
            Keyed on the entity so swapping one entity for another of the SAME
            type (Person A → a connection → Person B) remounts the body instead
            of reusing the instance. Without this, every `useState` inside the
            body survives the swap — edit mode, and (GOAL-315) the per-list
            expanded flags, would carry over to an entity the user never
            expanded.
          */}
          <DrawerBody
            key={`${entity.type}:${entity.id}`}
            entity={entity}
            onClose={close}
          />
        </div>
      </aside>
    </>
  )
}

const DrawerBody: FC<{ entity: InfoEntity; onClose: () => void }> = ({
  entity,
  onClose,
}) => {
  // `entity.label` is the name the caller already had in hand (canvas
  // drills and card clicks pass it). Thread it into each body so the
  // first-open loading state can show the title immediately rather than
  // blocking the whole form on the detail query. See GOAL-279.
  switch (entity.type) {
    case 'MeSpace':
    case 'WeSpace':
      return <SpaceDetailsBody spaceId={entity.id} label={entity.label} />
    case 'Pulse':
      return <PulseDetailsBody pulseId={entity.id} label={entity.label} />
    case 'FieldContext':
      return <FieldContextDetailsBody contextId={entity.id} label={entity.label} />
    case 'Person':
      return (
        <PersonDetailsBody
          personId={entity.id}
          onClose={onClose}
          label={entity.label}
        />
      )
    case 'Document':
      return <DocumentDetailsBody documentId={entity.id} label={entity.label} />
    case 'ResonanceLink':
      return <ResonanceDetailsBody resonanceId={entity.id} label={entity.label} />
    case 'PromiseWeave':
      return <PromiseWeaveDetailsBody weaveId={entity.id} label={entity.label} />
    case 'Organization':
      return (
        <OrganizationDetailsBody
          organizationId={entity.id}
          label={entity.label}
        />
      )
    case 'Connection':
      return <ConnectionDetailsBody connectionKey={entity.id} label={entity.label} />
  }
}

/**
 * Two-way sync between the drawer's open state and `?entity=Type:id`:
 *  - On every searchParams change: if the URL has an entity that differs
 *    from current state, open it. If the URL has no entity but the drawer
 *    is open, the URL is the source of truth — close.
 *  - On every drawer state change: write or clear the query param via
 *    `router.replace` so refresh / share / back-button all behave.
 *
 * The "did we initiate this URL change ourselves?" guard avoids the
 * obvious feedback loop. We track the last-written value and skip the
 * effect when the URL just reflects our own write.
 */
function useEntityDrawerUrl(
  entity: InfoEntity | null,
  setEntity: (entity: InfoEntity | null) => void
) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const selfWrittenRef = useRef<string | null>(null)

  // URL → state
  const urlEntityParam = searchParams?.get(ENTITY_QUERY_PARAM) ?? null
  useEffect(() => {
    const fromUrl = decodeEntityParam(urlEntityParam)
    // If the URL value matches what we just wrote, skip — that update is
    // already reflected in `entity`.
    if (urlEntityParam && urlEntityParam === selfWrittenRef.current) return

    if (!fromUrl) {
      if (entity) setEntity(null)
      return
    }
    if (
      !entity ||
      entity.type !== fromUrl.type ||
      entity.id !== fromUrl.id
    ) {
      setEntity(fromUrl)
    }
    // entity isn't a dep — we only react to *URL* changes here; the
    // state → URL effect handles the other direction.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlEntityParam])

  // State → URL
  useEffect(() => {
    if (!pathname) return
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    if (entity) {
      const encoded = encodeEntityParam(entity)
      if (params.get(ENTITY_QUERY_PARAM) === encoded) return
      params.set(ENTITY_QUERY_PARAM, encoded)
      selfWrittenRef.current = encoded
    } else {
      if (!params.has(ENTITY_QUERY_PARAM)) return
      params.delete(ENTITY_QUERY_PARAM)
      selfWrittenRef.current = null
    }
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    })
    // searchParams in deps would cause infinite loop on every navigation;
    // we read it for the merge but only fire when entity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, pathname])
}
