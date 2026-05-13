'use client'

import { useEffect, useRef, useState, useSyncExternalStore, type FC } from 'react'
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
import { useApp } from '@/contexts'
import {
  NotificationPanel,
  useUnreadCount,
} from '@/components/notifications/NotificationPanel'
import { FocalContextBadge } from './focal-context-badge'
import { ModeSwitcher, MODES } from './mode-switcher'
import { StudioSearchInput } from './studio-search-input'
import { useStudioMode } from './studio-mode-context'

const NOOP_SUBSCRIBE = () => () => {}
const GET_TRUE_SNAPSHOT = () => true
const GET_FALSE_SNAPSHOT = () => false

/**
 * The single-row glass header that replaces NavBar as the only chrome in the
 * worktree. Hosts the focal-context breadcrumb (left), the four-mode
 * switcher (center), and the search/notifications/theme/user controls
 * (right). A 1px gradient strip underneath tints to the active mode's color
 * so the user always knows where they are.
 */
export const StudioChrome: FC = () => {
  const { mode } = useStudioMode()
  const { user, logout } = useApp()
  // Start at light mode on both server and first client paint to avoid a
  // hydration mismatch. After mount, sync from localStorage / system pref —
  // the user sees a one-frame flicker to dark only if their stored
  // preference disagrees, which is acceptable and the canonical pattern.
  const [isDark, setIsDark] = useState(false)
  // useSyncExternalStore is the canonical "is this running on the client?"
  // gate — server snapshot returns false, client returns true, and no
  // setState is required.
  const isMounted = useSyncExternalStore(
    NOOP_SUBSCRIBE,
    GET_TRUE_SNAPSHOT,
    GET_FALSE_SNAPSHOT
  )
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)
  const unreadCount = useUnreadCount(user?.id)

  // After mount, read the persisted theme + system preference and apply.
  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches
    const shouldBeDark = stored === 'dark' || (!stored && prefersDark)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time theme sync from storage
    setIsDark(shouldBeDark)
  }, [])

  // Apply theme class on <html> whenever isDark changes.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const isNotificationButton = target.closest('[data-notification-button]')
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node) &&
        !isNotificationButton
      ) {
        setShowNotifications(false)
      }
    }
    if (showUserMenu || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu, showNotifications])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    document.documentElement.classList.toggle('dark', newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  const activeMode = MODES.find((m) => m.id === mode) ?? MODES[0]

  return (
    <>
      <header className="relative z-30 mx-4 lg:mx-8 mt-4 gp-glass rounded-full border border-gp-glass-border shadow-lg">
        <div className="flex items-center justify-between gap-3 px-4 lg:px-6 py-2.5">
          <div className="flex items-center gap-3 lg:gap-4 min-w-0">
            <Link
              href="/protected"
              className="flex items-center text-gp-primary shrink-0"
              aria-label="GoalPost home"
            >
              <span className="size-9 flex items-center justify-center">
                {isMounted && <GoalPostLogo />}
              </span>
            </Link>
            <FocalContextBadge />
          </div>

          <div className="hidden md:flex items-center justify-center shrink-0">
            <ModeSwitcher />
          </div>

          <div className="flex items-center gap-2 lg:gap-3 shrink-0">
            <StudioSearchInput />
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                data-notification-button
                className="hidden md:flex cursor-pointer size-10 items-center justify-center rounded-full bg-gp-surface-strong/40 dark:bg-gp-surface-dark/40 text-gp-ink-strong dark:text-gp-ink-strong hover:bg-gp-surface-strong/60 dark:hover:bg-gp-surface-dark/60 transition-all relative"
                aria-label="Notifications"
              >
                {isMounted && <NotificationIcon />}
                {isMounted && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 size-5 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-black/90 animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              <NotificationPanel
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
              />
            </div>
            <button
              onClick={toggleTheme}
              className="hidden md:flex size-10 items-center justify-center rounded-full bg-gp-surface-strong/40 dark:bg-gp-surface-dark/40 text-gp-ink-strong dark:text-gp-ink-strong hover:bg-gp-surface-strong/60 dark:hover:bg-gp-surface-dark/60 transition-all cursor-pointer"
              aria-label="Toggle theme"
            >
              {isMounted && (isDark ? <MoonIcon /> : <SunIcon />)}
            </button>

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
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-black/90 border border-gp-glass-border shadow-xl py-2 z-50">
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
          </div>
        </div>

        {/* Mobile mode switcher row */}
        <div className="md:hidden flex items-center justify-center px-3 pb-2">
          <ModeSwitcher />
        </div>

        {/* Mode-tinted accent strip — soft gradient under the chrome */}
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute -bottom-1.5 left-6 right-6 h-1.5 rounded-full bg-gradient-to-r opacity-70 blur-sm transition-all duration-300',
            activeMode.accent
          )}
        />
      </header>

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
    </>
  )
}
