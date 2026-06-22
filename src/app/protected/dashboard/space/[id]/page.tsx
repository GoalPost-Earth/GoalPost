'use client'

import { useEffect } from 'react'
import { SpaceDashboardView } from '@/components/dashboard/space-dashboard-view'
import { useRouteFocalScope } from '@/lib/focal-entity/use-route-focal-scope'
import { usePageContext } from '@/contexts'

/**
 * The destination of every "open this space" interaction — bubble
 * clicks in Graph View, card clicks on the dashboard, and the (i)
 * drawer's "Open space" CTA. Renders the design-aligned in-space
 * dashboard surface (field-context cards, glass + radial-gradient
 * backdrop) instead of the legacy ProfileLayout-based detail page,
 * which lived in a different design language from the rest of the
 * app.
 */
export default function SpacePage() {
  // Scope is derived from the URL through the shared `useRouteFocalScope`
  // hook — the same single source the Bloom canvas reads — so the Dashboard
  // and Bloom views can never resolve to different Spaces after a view
  // switch (GOAL-271).
  const { activeSpaceId } = useRouteFocalScope()
  const { setPageTitle } = usePageContext()

  useEffect(() => {
    setPageTitle('Space')
  }, [setPageTitle])

  if (!activeSpaceId) return null
  return <SpaceDashboardView spaceId={activeSpaceId} />
}
