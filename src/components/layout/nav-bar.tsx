'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  GoalPostLogo,
  SunIcon,
  MoonIcon,
  NotificationIcon,
} from '@/components/icons'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useApp, usePageContext } from '@/contexts'

export default function NavBar() {
  const [isDark, setIsDark] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useApp()
  const { pageTitle } = usePageContext()
  const menuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const isMobileMenuButton = target.closest('[data-mobile-menu-button]')

      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !isMobileMenuButton
      ) {
        setShowMobileMenu(false)
      }
    }

    if (showUserMenu || showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu, showMobileMenu])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    document.documentElement.classList.toggle('dark', newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  return (
    <header className="fixed top-6 left-0 right-0 z-30 flex items-center justify-between whitespace-nowrap border-b border-gp-glass-border px-5 lg:px-10 py-4 gp-glass mx-8 lg:mx-10 rounded-full shadow-lg">
      <div className="flex items-center gap-2 md:gap-6 lg:gap-8">
        <Link href="/" className="flex items-center gap-4 text-gp-primary">
          <div className="size-10 p-0 m-0">{isMounted && <GoalPostLogo />}</div>
        </Link>
        <div className="flex flex-col gap-1">
          <h2 className="text-gp-ink-strong dark:text-gp-ink-strong text-lg font-bold leading-tight tracking-[-0.015em] transition-colors whitespace-normal wrap-break-word md:whitespace-nowrap">
            {pageTitle === 'Spaces' && user?.firstName
              ? `${user.firstName}'s Spaces`
              : pageTitle}
          </h2>
          {pathname?.includes('/spaces/') && pageTitle !== 'Spaces' && (
            <div className="text-xs text-gp-ink-muted dark:text-gp-ink-soft flex flex-wrap items-center gap-2">
              <Link
                href="/protected/spaces"
                className="hover:text-gp-ink-strong dark:hover:text-gp-ink-strong transition-colors"
              >
                {user?.firstName + "'s Spaces" || 'My Spaces'}
              </Link>
              {(pathname?.includes('/me-space') &&
                pathname !== '/protected/spaces/me-space') ||
              (pathname?.includes('/we-space') &&
                pathname !== '/protected/spaces/we-space') ? (
                <>
                  <span>•</span>
                  <Link
                    href={
                      pathname?.includes('/me-space')
                        ? '/protected/spaces/me-space'
                        : '/protected/spaces/we-space'
                    }
                    className="hover:text-gp-ink-strong dark:hover:text-gp-ink-strong transition-colors"
                  >
                    {pathname?.includes('/me-space') ? 'Me Space' : 'We Space'}
                  </Link>
                </>
              ) : null}
              {pathname?.includes('/fields/') && (
                <>
                  <span>•</span>
                  <Link
                    href={(() => {
                      // Extract space URL from field URL
                      // e.g., /protected/spaces/we-space/space_id/fields/field_id -> /protected/spaces/we-space/space_id
                      const parts = pathname.split('/fields/')
                      return parts[0]
                    })()}
                    className="hover:text-gp-ink-strong dark:hover:text-gp-ink-strong transition-colors"
                  >
                    Fields
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
        <nav className="hidden md:flex items-center gap-2 md:gap-4 lg:gap-6">
          <Link
            className={cn(
              'text-sm font-medium transition-colors',
              pathname === '/protected/spaces/me-space'
                ? 'text-gp-primary font-semibold px-4 py-1.5 bg-gp-primary/10 rounded-full'
                : 'text-gp-ink-muted hover:text-gp-ink-strong dark:text-gp-ink-soft dark:hover:text-gp-ink-strong'
            )}
            href="/protected/spaces/me-space"
          >
            Me Space
          </Link>
          <Link
            className={cn(
              'text-sm font-medium transition-colors',
              pathname === '/protected/spaces/we-space'
                ? 'text-gp-primary font-semibold px-4 py-1.5 bg-gp-primary/10 rounded-full'
                : 'text-gp-ink-muted hover:text-gp-ink-strong dark:text-gp-ink-soft dark:hover:text-gp-ink-strong'
            )}
            href="/protected/spaces/we-space"
          >
            We Space
          </Link>
          {/* <Link
            className={cn(
              'text-sm font-medium transition-colors',
              pathname === '/protected/resonance'
                ? 'text-gp-primary font-semibold px-4 py-1.5 bg-gp-primary/10 rounded-full'
                : 'text-gp-ink-muted hover:text-gp-ink-strong dark:text-gp-ink-soft dark:hover:text-gp-ink-strong'
            )}
            href="/protected/resonance"
          >
            Resonance
          </Link> */}
          <Link
            className={cn(
              'text-sm font-medium transition-colors',
              pathname === '/protected/dashboard'
                ? 'text-gp-primary font-semibold px-4 py-1.5 bg-gp-primary/10 rounded-full'
                : 'text-gp-ink-muted hover:text-gp-ink-strong dark:text-gp-ink-soft dark:hover:text-gp-ink-strong'
            )}
            href="/protected/dashboard"
          >
            Dashboard
          </Link>
        </nav>

        <button
          onClick={toggleTheme}
          className="hidden md:flex size-10 items-center justify-center rounded-full bg-gp-surface-strong/40 dark:bg-gp-surface-dark/40 text-gp-ink-strong dark:text-gp-ink-strong hover:bg-gp-surface-strong/60 dark:hover:bg-gp-surface-dark/60 transition-all cursor-pointer"
          aria-label="Toggle theme"
        >
          {isMounted && (isDark ? <MoonIcon /> : <SunIcon />)}
        </button>
        <button className="hidden md:flex cursor-pointer size-10 items-center justify-center rounded-full bg-gp-surface-strong/40 dark:bg-gp-surface-dark/40 text-gp-ink-strong dark:text-gp-ink-strong hover:bg-gp-surface-strong/60 dark:hover:bg-gp-surface-dark/60 transition-all">
          {isMounted && <NotificationIcon />}
        </button>
        <Link
          href="/protected/search"
          className="hidden md:flex cursor-pointer size-10 items-center justify-center rounded-full bg-gp-surface-strong/40 dark:bg-gp-surface-dark/40 text-gp-ink-strong dark:text-gp-ink-strong hover:bg-gp-surface-strong/60 dark:hover:bg-gp-surface-dark/60 transition-all"
          aria-label="Search"
        >
          <span className="material-symbols-outlined">search</span>
        </Link>

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-gp-surface-strong hover:border-gp-primary shadow-sm transition-all cursor-pointer"
            style={{
              backgroundImage:
                'url("https://api.dicebear.com/7.x/avataaars/svg?seed=User")',
            }}
            aria-label="User menu"
          />

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-black/90 border border-gp-glass-border shadow-xl py-2 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gp-glass-border">
                <p className="text-sm font-semibold text-gp-ink-strong dark:text-gp-ink-strong">
                  {user?.firstName || user?.lastName
                    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                    : 'User'}
                </p>
                <p className="text-xs text-gp-ink-muted dark:text-gp-ink-muted mt-1">
                  {user?.email || 'No email'}
                </p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <Link
                  href="/protected/profile"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gp-ink-muted dark:text-gp-ink-soft hover:bg-gp-surface-strong/40 dark:hover:bg-gp-surface-dark/40 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <span className="material-symbols-outlined text-lg">
                    person
                  </span>
                  <span>Profile</span>
                </Link>

                <Link
                  href="/protected/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gp-ink-muted dark:text-gp-ink-soft hover:bg-gp-surface-strong/40 dark:hover:bg-gp-surface-dark/40 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <span className="material-symbols-outlined text-lg">
                    settings
                  </span>
                  <span>Settings</span>
                </Link>
              </div>

              {/* Logout Button */}
              <div className="border-t border-gp-glass-border pt-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    setShowLogoutConfirm(true)
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">
                    logout
                  </span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Mobile Menu Button */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="md:hidden flex items-center justify-center size-10 rounded-full bg-gp-surface-strong/40 dark:bg-gp-surface-dark/40 text-gp-ink-strong dark:text-gp-ink-strong hover:bg-gp-surface-strong/60 dark:hover:bg-gp-surface-dark/60 transition-all cursor-pointer"
          aria-label="Toggle mobile menu"
          data-mobile-menu-button
        >
          <span className="material-symbols-outlined text-xl">
            {showMobileMenu ? 'close' : 'menu'}
          </span>
        </button>
        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <div
            ref={mobileMenuRef}
            className="absolute top-20 left-4 right-4 md:hidden rounded-2xl bg-white dark:bg-black/90 border border-gp-glass-border shadow-xl py-2 z-50"
          >
            <Link
              href="/protected/spaces/me-space"
              className={cn(
                'flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors',
                pathname === '/protected/spaces/me-space'
                  ? 'text-gp-primary bg-gp-primary/10'
                  : 'text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-ink-strong'
              )}
              onClick={() => setShowMobileMenu(false)}
            >
              <span className="material-symbols-outlined">person</span>
              Me Space
            </Link>
            <Link
              href="/protected/spaces/we-space"
              className={cn(
                'flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors',
                pathname === '/protected/spaces/we-space'
                  ? 'text-gp-primary bg-gp-primary/10'
                  : 'text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-ink-strong'
              )}
              onClick={() => setShowMobileMenu(false)}
            >
              <span className="material-symbols-outlined">group</span>
              We Space
            </Link>
            <Link
              href="/protected/resonance"
              className={cn(
                'flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors',
                pathname === '/protected/resonance'
                  ? 'text-gp-primary bg-gp-primary/10'
                  : 'text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-ink-strong'
              )}
              onClick={() => setShowMobileMenu(false)}
            >
              <span className="material-symbols-outlined">auto_awesome</span>
              Resonance
            </Link>
            <Link
              href="/protected/dashboard"
              className={cn(
                'flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors',
                pathname === '/protected/dashboard'
                  ? 'text-gp-primary bg-gp-primary/10'
                  : 'text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-ink-strong'
              )}
              onClick={() => setShowMobileMenu(false)}
            >
              <span className="material-symbols-outlined">dashboard</span>
              Dashboard
            </Link>
            <Link
              href="/protected/search"
              className={cn(
                'flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors border-t border-gp-glass-border mt-1 pt-2',
                pathname === '/protected/search'
                  ? 'text-gp-primary bg-gp-primary/10'
                  : 'text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-ink-strong'
              )}
              onClick={() => setShowMobileMenu(false)}
            >
              <span className="material-symbols-outlined">search</span>
              Search
            </Link>
            <div className="border-t border-gp-glass-border mt-2 pt-2 px-4 py-2 flex items-center gap-2">
              <button
                onClick={() => {
                  toggleTheme()
                  setShowMobileMenu(false)
                }}
                className="flex size-10 items-center justify-center rounded-full bg-gp-surface-strong/40 dark:bg-gp-surface-dark/40 text-gp-ink-strong dark:text-gp-ink-strong hover:bg-gp-surface-strong/60 dark:hover:bg-gp-surface-dark/60 transition-all cursor-pointer"
                aria-label="Toggle theme"
              >
                {isMounted && (isDark ? <MoonIcon /> : <SunIcon />)}
              </button>
              <button className="cursor-pointer flex size-10 items-center justify-center rounded-full bg-gp-surface-strong/40 dark:bg-gp-surface-dark/40 text-gp-ink-strong dark:text-gp-ink-strong hover:bg-gp-surface-strong/60 dark:hover:bg-gp-surface-dark/60 transition-all">
                {isMounted && <NotificationIcon />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gp-ink-strong dark:text-gp-ink-strong">
              <span className="material-symbols-outlined text-red-600 dark:text-red-400">
                logout
              </span>
              Confirm Logout
            </DialogTitle>
            <DialogDescription className="text-slate-800 dark:text-slate-50">
              Are you sure you want to log out? You&apos;ll need to sign in
              again to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowLogoutConfirm(false)
                logout()
              }}
              className="flex-1"
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
