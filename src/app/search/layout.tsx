import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search - Goalpost',
  description: 'Search page for Goalpost',
}

export default function SearchLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
