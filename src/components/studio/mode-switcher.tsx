'use client'

import { type FC } from 'react'
import { cn } from '@/lib/utils'
import { useStudioPanes, type StudioMode } from './studio-panes-context'

interface ModeMeta {
  id: StudioMode
  label: string
  /** Material Symbols Outlined ligature name. */
  icon: string
  shortcut: string
  accent: string
}

export const MODES: ModeMeta[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    shortcut: '1',
    accent: 'from-gp-primary/80 to-gp-accent-glow/80',
  },
  {
    id: 'graph',
    label: 'Graph',
    icon: 'hub',
    shortcut: '2',
    accent: 'from-emerald-400/80 to-teal-400/80',
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: 'auto_awesome',
    shortcut: '3',
    accent: 'from-violet-400/80 to-fuchsia-400/80',
  },
]

/**
 * Switches the focused pane between dashboard / graph / chat. Lives in the
 * top chrome — for per-pane controls, see PaneHeader.
 */
export const ModeSwitcher: FC = () => {
  const { focusedMode, focusedPane, setPaneMode } = useStudioPanes()

  return (
    <div
      role="tablist"
      aria-label="Studio mode"
      className="flex items-center gap-1 rounded-full border border-white/15 bg-slate-900/60 p-1 backdrop-blur-xl shadow-lg dark:bg-slate-900/60"
    >
      {MODES.map((m) => {
        const active = focusedMode === m.id
        return (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`${m.label} (press ${m.shortcut})`}
            onClick={() => setPaneMode(focusedPane, m.id)}
            className={cn(
              'group relative flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold tracking-wide transition-all cursor-pointer',
              active
                ? 'text-white shadow-inner'
                : 'text-white/55 hover:text-white/85 hover:bg-white/5'
            )}
          >
            {active && (
              <span
                className={cn(
                  'absolute inset-0 rounded-full bg-gradient-to-r opacity-90',
                  m.accent
                )}
                aria-hidden="true"
              />
            )}
            <span className="relative flex items-center gap-2">
              <span className="material-symbols-outlined text-base leading-none">
                {m.icon}
              </span>
              <span className="hidden sm:inline">{m.label}</span>
              <kbd
                className={cn(
                  'hidden lg:inline-flex h-4 min-w-4 items-center justify-center rounded-sm border px-1 font-mono text-[10px] leading-none',
                  active
                    ? 'border-white/40 bg-white/10 text-white/90'
                    : 'border-white/10 bg-white/5 text-white/40'
                )}
              >
                {m.shortcut}
              </kbd>
            </span>
          </button>
        )
      })}
    </div>
  )
}
