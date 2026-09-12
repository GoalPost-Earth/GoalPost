import { useCallback, useSyncExternalStore } from 'react'
import { toast } from 'sonner'
import { chatApiAuthHeaders } from '@/lib/simulation/conversation-thread-client'
import {
  emitOpenResonanceSuggestions,
  emitResonanceDiscoveryFinished,
} from '@/lib/simulation/resonance-review-events'

interface DiscoverResponse {
  success?: boolean
  error?: string
  suggestionsCreated?: number
  crossFieldSuggestionsCreated?: number
  completed?: boolean
  reason?: 'space_running' | 'space_cooldown' | 'user_running'
  retryAfterSeconds?: number
}

// Spaces with a manual sweep in flight from this tab. Module-level, not hook
// state, for two reasons: every mounted Discover button (the studio action bar
// AND the field page's Resonances header) must show the same run, and the run
// can take minutes — it has to outlive whichever component started it, or the
// completion toast and count refresh would be lost on navigation.
const runningSpaces = new Set<string>()
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function setRunning(spaceId: string, running: boolean) {
  if (running) runningSpaces.add(spaceId)
  else runningSpaces.delete(spaceId)
  listeners.forEach((listener) => listener())
}

// Not "tonight's sweep": the nightly cron only runs the within-field pass
// (ADR-020), so it never covers the cross-field pairs a cut-short run missed.
const REST_OF_SPACE_NOTE =
  'It ran out of time before finishing — run Discover again later to check the rest.'

async function runDiscovery(fieldContextId: string, spaceId: string) {
  setRunning(spaceId, true)
  const toastId = toast.loading('Looking for resonances across this space…', {
    description: 'This can take a few minutes — you can keep working.',
  })

  try {
    const authHeaders = await chatApiAuthHeaders()
    const response = await fetch('/api/resonance/discover', {
      method: 'POST',
      credentials: 'include',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fieldContextId }),
    })
    const data: DiscoverResponse = await response.json().catch(() => ({}))

    // Cooldown (GOAL-368) — expected, not an error.
    if (response.status === 429) {
      const minutes = Math.max(
        1,
        Math.ceil(Number(data.retryAfterSeconds ?? 60) / 60)
      )
      const again = `You can run it again in about ${minutes} minute${minutes === 1 ? '' : 's'}.`
      const notice =
        data.reason === 'space_running'
          ? {
              title: 'Discovery is already running for this space',
              description: 'New suggestions will be ready to review when it finishes.',
            }
          : data.reason === 'user_running'
            ? {
                title: 'You already have discovery running in another space',
                description: `Wait for it to finish first. ${again}`,
              }
            : {
                title: 'Discovery ran recently for this space',
                description: again,
              }
      toast.info(notice.title, { id: toastId, description: notice.description })
      return
    }

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to trigger resonance discovery')
    }

    const total =
      Number(data.suggestionsCreated ?? 0) +
      Number(data.crossFieldSuggestionsCreated ?? 0)
    const partial = data.completed === false

    if (total > 0) {
      toast.success(
        `Found ${total} new resonance suggestion${total === 1 ? '' : 's'}`,
        {
          id: toastId,
          description: partial ? REST_OF_SPACE_NOTE : undefined,
          // An explicit way in: the new suggestions may be anchored on other
          // fields of the Space, so this field's Suggestions pill / Pending
          // badge can legitimately stay hidden. The modal lists the whole
          // Space's queue.
          action: {
            label: 'Review',
            onClick: () =>
              emitOpenResonanceSuggestions(fieldContextId, { spaceId }),
          },
          duration: 10000,
        }
      )
    } else {
      toast('No new resonances found', {
        id: toastId,
        description: partial
          ? REST_OF_SPACE_NOTE
          : 'Every field in this space was checked.',
        duration: 6000,
      })
    }

    emitResonanceDiscoveryFinished({ spaceId })
  } catch {
    // A sweep that failed or was cut off (e.g. a 504 at maxDuration) may still
    // have written suggestions before it stopped — refresh the counts anyway.
    toast.error("Couldn't finish discovering resonances", {
      id: toastId,
      description:
        'Some suggestions may still have been found. Try again in a minute.',
    })
    emitResonanceDiscoveryFinished({ spaceId })
  } finally {
    setRunning(spaceId, false)
  }
}

interface UseResonanceDiscoveryOptions {
  /** The field the sweep is started from — it is swept first. */
  fieldContextId?: string | null
  /** That field's Space — the sweep's scope and the in-flight key. */
  spaceId?: string | null
}

/**
 * Manual, Space-wide resonance discovery (WF-06, GOAL-368). The server sweeps
 * every field in the Space and enforces a per-Space cooldown; this hook owns
 * the toasts and announces completion via `emitResonanceDiscoveryFinished` so
 * the pending-suggestion counts refresh wherever they are shown.
 */
export function useResonanceDiscovery({
  fieldContextId,
  spaceId,
}: UseResonanceDiscoveryOptions) {
  const isLoading = useSyncExternalStore(
    subscribe,
    () => !!spaceId && runningSpaces.has(spaceId),
    () => false
  )

  const triggerDiscovery = useCallback(() => {
    if (!fieldContextId || !spaceId || runningSpaces.has(spaceId)) return
    void runDiscovery(fieldContextId, spaceId)
  }, [fieldContextId, spaceId])

  return { triggerDiscovery, isLoading }
}
