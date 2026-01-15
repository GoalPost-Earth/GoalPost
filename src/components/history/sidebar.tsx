'use client'

import React from 'react'

export function Sidebar() {
  const [activeNav, setActiveNav] = React.useState('overview')

  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'pulses', label: 'Pulses', icon: 'monitor_heart', badge: '3' },
    { id: 'fields', label: 'Fields', icon: 'layers' },
    { id: 'spaces', label: 'Spaces', icon: 'groups' },
  ]

  return (
    <nav className="w-64 z-20 flex flex-col border-r border-glass-border bg-glass-bg/50 backdrop-blur-md pt-6 pb-4 dark:bg-glass-bg/40 dark:border-white/10">
      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 scroller">
        <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 dark:text-white/40">
          Views
        </div>

        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveNav(item.id)}
            className={`nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg group transition-all duration-300 ${
              activeNav === item.id
                ? 'active bg-white/80 text-slate-800 shadow-sm dark:bg-white/5 dark:text-white'
                : 'text-slate-600 hover:bg-white/60 hover:text-slate-900 dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] transition-colors">
              {item.icon}
            </span>
            <span className="text-sm font-medium">{item.label}</span>
            {item.badge && (
              <span className="ml-auto text-[10px] bg-slate-200/50 border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-semibold dark:bg-white/10 dark:border-white/5 dark:text-white/50">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Status Footer */}
      <div className="px-4 pt-4 border-t border-glass-border mt-auto dark:border-white/10">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-white/40 border border-white/50 shadow-sm backdrop-blur-sm dark:bg-white/5 dark:border-white/5">
          <div className="size-2 rounded-full bg-accent-glow animate-pulse"></div>
          <div className="text-xs text-slate-600 font-medium dark:text-white/70">
            AI Pattern Discovery active
          </div>
        </div>
      </div>
    </nav>
  )
}
