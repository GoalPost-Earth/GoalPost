'use client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push('/protected/spaces')
  }, [router])

  return null
}
