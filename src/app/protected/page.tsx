'use client'

import { useEffect } from 'react'
import { usePageContext } from '@/contexts'

/**
 * `/protected` root. The Studio's Dashboard mode detects this pathname and
 * renders `<StudioOverview/>` directly — the page itself just sets the page
 * title and returns null, so we don't double-render the overview.
 */
export default function ProtectedHomePage() {
  const { setPageTitle } = usePageContext()

  useEffect(() => {
    setPageTitle('Home')
  }, [setPageTitle])

  return null
}
