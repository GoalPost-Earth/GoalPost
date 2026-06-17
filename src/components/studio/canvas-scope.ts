import { focalEntityFromRoute } from '@/lib/focal-entity/route-matcher'

const DASHBOARD_ROOT = '/protected/dashboard'

/**
 * Whether the studio's Bloom Exploration can scope to the given route. True
 * for the dashboard root (top-level spaces) and for Space / FieldContext
 * detail routes — the only routes the NVL surface re-scopes to.
 * (See `bloom-view`: its `activeSpaceId` / `activeFieldId` derivation only
 * resolves `MeSpace`, `WeSpace`, and `FieldContext` from the pathname;
 * everything else renders the default top-level cluster, which wouldn't match
 * the route the user navigated to.)
 *
 * Every other content route — persons, profile, settings, search — has no
 * bloom representation, so the canvas falls back to the Dashboard view
 * there. This lets the selected `canvasView` be a *sticky preference*: it
 * survives navigation between scopeable routes (drilling space → field stays
 * in bloom) and is never overwritten, while leaf routes transparently show
 * their page content via an effective-view fallback in `CanvasHost` and have
 * Bloom disabled in the view toggle. Returning to a Space / FieldContext
 * restores the stored view.
 *
 * MeSpace-vs-WeSpace disambiguation is irrelevant here (both are scopeable),
 * so the matcher's `meSpaceIds` hint is intentionally omitted.
 */
export function routeHasCanvasScope(
  pathname: string | null | undefined
): boolean {
  if (!pathname) return false
  const path = pathname.split(/[?#]/)[0].replace(/\/+$/, '') || '/'
  if (path === DASHBOARD_ROOT) return true
  const match = focalEntityFromRoute(pathname)
  return (
    match?.type === 'MeSpace' ||
    match?.type === 'WeSpace' ||
    match?.type === 'FieldContext'
  )
}
