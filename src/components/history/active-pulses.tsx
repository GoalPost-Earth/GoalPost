'use client'

import React from 'react'

interface Pulse {
  id: string
  author: string
  avatar?: string
  icon: string
  avatarBg: string
  text: string
  time: string
  isNew?: boolean
  color?: 'teal' | 'slate' | 'purple'
}

export function ActivePulses() {
  const pulses: Pulse[] = [
    {
      id: '1',
      author: 'Pattern Bot',
      icon: 'smart_toy',
      avatarBg:
        'bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200 text-teal-600 dark:from-teal-500/20 dark:to-teal-600/20 dark:border-teal-500/30 dark:text-teal-300',
      text: 'I\'ve detected a high coherence between "Deep Work" and "Growth" fields based on your recent entries.',
      time: '2m ago',
      color: 'teal',
    },
    {
      id: '2',
      author: 'Sarah M.',
      icon: 'person',
      avatarBg:
        'bg-white border-slate-200 text-slate-400 dark:bg-white/10 dark:border-white/10 dark:text-white/70',
      text: 'Are we still on for the sync later? I have some updates on the knowledge graph structure.',
      time: 'now',
      isNew: true,
    },
    {
      id: '3',
      author: 'System Alert',
      icon: 'bolt',
      avatarBg:
        'bg-purple-50 border-purple-100 text-purple-500 dark:bg-purple-500/20 dark:border-purple-500/30 dark:text-purple-300',
      text: 'Weekly summary is ready for review. Check out your evolving intention patterns.',
      time: '1h ago',
      color: 'purple',
    },
  ]

  return (
    <section className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title text-accent-glow text-sm font-bold uppercase tracking-widest">
          Active Pulses
        </h3>
        <button className="cursor-pointer text-xs text-slate-400 hover:text-slate-700 transition-colors font-medium dark:text-white/50 dark:hover:text-white">
          View All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pulses.map((pulse) => (
          <div
            key={pulse.id}
            className="chat-card rounded-xl p-4 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div
                  className={`size-8 rounded-full border flex items-center justify-center shadow-sm ${pulse.avatarBg}`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {pulse.icon}
                  </span>
                </div>
                <span className="font-bold text-slate-700 text-sm dark:text-white/90">
                  {pulse.author}
                </span>
              </div>
              {pulse.isNew ? (
                <span className="text-[10px] text-accent-glow font-bold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100 dark:bg-accent-glow/20 dark:border-accent-glow/30">
                  New
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 font-medium dark:text-white/40">
                  {pulse.time}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed group-hover:text-slate-700 transition-colors dark:text-white/60 dark:group-hover:text-white/80">
              {pulse.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
