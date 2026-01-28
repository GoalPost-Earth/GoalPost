'use client'

import React from 'react'

type ViewType = 'overview' | 'pulses' | 'fields' | 'spaces' | 'people'

interface SidebarProps {
  activeView: ViewType
  onViewChange: (view: ViewType) => void
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({
  activeView,
  onViewChange,
  isOpen,
  onClose,
}: SidebarProps) {
  const navItems = [
    { id: 'overview' as ViewType, label: 'Overview', icon: 'dashboard' },
    { id: 'pulses' as ViewType, label: 'Pulses', icon: 'monitor_heart' },
    { id: 'fields' as ViewType, label: 'Fields', icon: 'layers' },
    { id: 'spaces' as ViewType, label: 'Spaces', icon: 'workspaces' },
    { id: 'people' as ViewType, label: 'People', icon: 'group' },
  ]

  return (
    <nav
      className={`fixed md:static left-0 top-0 w-64 h-screen md:h-auto  flex flex-col border-r border-glass-border bg-glass-bg/50 backdrop-blur-md pt-6 pb-4 dark:bg-glass-bg/40 dark:border-white/10 transform transition-transform duration-300 md:translate-x-0 ${
        isOpen ? 'translate-x-0 z-30' : '-translate-x-full'
      }`}
    >
      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 scroller pt-2">
        <div className="flex items-center justify-between px-3 py-2 mb-2">
          <span className="text-xs font-bold text-black uppercase tracking-widest dark:text-white/40">
            Views
          </span>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-md hover:bg-white/30 dark:hover:bg-white/20 transition-colors shrink-0"
            aria-label="Close sidebar"
          >
            <span className="material-symbols-outlined text-lg text-slate-600 dark:text-white/60">
              close
            </span>
          </button>
        </div>

        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg group transition-all duration-300 ${
              activeView === item.id
                ? 'active bg-white/80 text-slate-800 shadow-sm dark:bg-white/5 dark:text-white'
                : 'text-slate-900 hover:bg-white/60 hover:text-slate-900 dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] transition-colors">
              {item.icon}
            </span>
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Status Footer */}
      <div className="px-4 pt-4 border-t border-glass-border mt-auto dark:border-white/10 shrink-0">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-white/40 border border-white/50 shadow-sm backdrop-blur-sm dark:bg-white/5 dark:border-white/5">
          <div className="size-2 rounded-full bg-accent-glow animate-pulse shrink-0"></div>
          <div className="text-xs text-slate-600 font-medium dark:text-white/70">
            AI Pattern Discovery active
          </div>
        </div>
      </div>
    </nav>
  )
}
