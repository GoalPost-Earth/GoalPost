'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { SpaceDashboardView } from '@/components/dashboard/space-dashboard-view'
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
  const params = useParams()
  const spaceId = params?.id as string
  const { setPageTitle } = usePageContext()

  useEffect(() => {
    setPageTitle('Space')
  }, [setPageTitle])

  if (!spaceId) return null
  return <SpaceDashboardView spaceId={spaceId} />
}
