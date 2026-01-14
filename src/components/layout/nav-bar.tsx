'use client'

import { useState, useEffect } from 'react'

export default function NavBar() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check initial theme from localStorage or system preference
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches
    const shouldBeDark = stored === 'dark' || (!stored && prefersDark)

    setIsDark(shouldBeDark)
    document.documentElement.classList.toggle('dark', shouldBeDark)
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    document.documentElement.classList.toggle('dark', newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  return (
    <header className="fixed top-6 left-0 right-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-gp-glass-border px-10 py-4 gp-glass mx-10 rounded-full shadow-lg">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4 text-gp-primary">
          <div className="size-6">
            <svg
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z"
                fill="currentColor"
                fillRule="evenodd"
              />
              <path
                clipRule="evenodd"
                d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z"
                fill="currentColor"
                fillRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-gp-ink-strong dark:text-gp-ink-strong text-lg font-bold leading-tight tracking-[-0.015em] transition-colors">
            GoalPost
          </h2>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a
            className="text-gp-primary font-semibold text-sm leading-normal px-4 py-1.5 bg-gp-primary/10 rounded-full transition-colors"
            href="#"
          >
            MeSpace
          </a>
          <a
            className="text-gp-ink-muted hover:text-gp-ink-strong dark:text-gp-ink-soft dark:hover:text-gp-ink-strong text-sm font-medium transition-colors"
            href="#"
          >
            Fields
          </a>
          <a
            className="text-gp-ink-muted hover:text-gp-ink-strong dark:text-gp-ink-soft dark:hover:text-gp-ink-strong text-sm font-medium transition-colors"
            href="#"
          >
            Intentions
          </a>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="flex size-10 items-center justify-center rounded-full bg-gp-surface-strong/40 dark:bg-gp-surface-dark/40 text-gp-ink-strong dark:text-gp-ink-strong hover:bg-gp-surface-strong/60 dark:hover:bg-gp-surface-dark/60 transition-all"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <svg
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>
        <button className="flex size-10 items-center justify-center rounded-full bg-gp-surface-strong/40 dark:bg-gp-surface-dark/40 text-gp-ink-strong dark:text-gp-ink-strong hover:bg-gp-surface-strong/60 dark:hover:bg-gp-surface-dark/60 transition-all">
          <svg
            className="size-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
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
