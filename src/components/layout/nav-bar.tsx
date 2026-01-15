'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  GoalPostLogo,
  SunIcon,
  MoonIcon,
  NotificationIcon,
} from '@/components/icons'
import { cn } from '@/lib/utils'

export default function NavBar() {
  const [isDark, setIsDark] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Check initial theme from localStorage or system preference
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches
    const shouldBeDark = stored === 'dark' || (!stored && prefersDark)

    setIsDark(shouldBeDark)
    document.documentElement.classList.toggle('dark', shouldBeDark)
    setIsMounted(true)
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    document.documentElement.classList.toggle('dark', newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  return (
    <header className="fixed top-6 left-0 right-0 z-30 flex items-center justify-between whitespace-nowrap border-b border-gp-glass-border px-10 py-4 gp-glass mx-10 rounded-full shadow-lg">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-4 text-gp-primary">
          <div className="size-6">{isMounted && <GoalPostLogo />}</div>
          <h2 className="text-gp-ink-strong dark:text-gp-ink-strong text-lg font-bold leading-tight tracking-[-0.015em] transition-colors">
            GoalPost
          </h2>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link
            className={cn(
              'text-sm font-medium transition-colors',
              pathname === '/protected/fields/mespace'
                ? 'text-gp-primary font-semibold px-4 py-1.5 bg-gp-primary/10 rounded-full'
                : 'text-gp-ink-muted hover:text-gp-ink-strong dark:text-gp-ink-soft dark:hover:text-gp-ink-strong'
            )}
            href="/protected/fields/mespace"
          >
            Me Space
          </Link>
          <Link
            className={cn(
              'text-sm font-medium transition-colors',
              pathname === '/protected/fields/wespace'
                ? 'text-gp-primary font-semibold px-4 py-1.5 bg-gp-primary/10 rounded-full'
                : 'text-gp-ink-muted hover:text-gp-ink-strong dark:text-gp-ink-soft dark:hover:text-gp-ink-strong'
            )}
            href="/protected/fields/wespace"
          >
            We Space
          </Link>
          <Link
            className={cn(
              'text-sm font-medium transition-colors',
              pathname === '/protected/resonance'
                ? 'text-gp-primary font-semibold px-4 py-1.5 bg-gp-primary/10 rounded-full'
                : 'text-gp-ink-muted hover:text-gp-ink-strong dark:text-gp-ink-soft dark:hover:text-gp-ink-strong'
            )}
            href="/protected/resonance"
          >
            Resonance
          </Link>
          <Link
            className={cn(
              'text-sm font-medium transition-colors',
              pathname === '/protected/history'
                ? 'text-gp-primary font-semibold px-4 py-1.5 bg-gp-primary/10 rounded-full'
                : 'text-gp-ink-muted hover:text-gp-ink-strong dark:text-gp-ink-soft dark:hover:text-gp-ink-strong'
            )}
            href="/protected/history"
          >
            History
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="flex size-10 items-center justify-center rounded-full bg-gp-surface-strong/40 dark:bg-gp-surface-dark/40 text-gp-ink-strong dark:text-gp-ink-strong hover:bg-gp-surface-strong/60 dark:hover:bg-gp-surface-dark/60 transition-all"
          aria-label="Toggle theme"
        >
          {isMounted && (isDark ? <MoonIcon /> : <SunIcon />)}
        </button>
        <button className="flex size-10 items-center justify-center rounded-full bg-gp-surface-strong/40 dark:bg-gp-surface-dark/40 text-gp-ink-strong dark:text-gp-ink-strong hover:bg-gp-surface-strong/60 dark:hover:bg-gp-surface-dark/60 transition-all">
          {isMounted && <NotificationIcon />}
        </button>
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-gp-surface-strong shadow-sm"
          style={{
            backgroundImage:
              'url("https://api.dicebear.com/7.x/avataaars/svg?seed=User")',
          }}
        />
      </div>
    </header>
  )
}
