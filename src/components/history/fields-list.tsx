'use client'

import React from 'react'

interface Field {
  id: string
  title: string
  status: 'Active' | 'Inactive'
  description: string
  lastActivity: string
  icon: string
  iconBg: string
  accentColor: string
  members?: Array<{ initials: string }>
}

export function FieldsList() {
  const fields: Field[] = [
    {
      id: '1',
      title: 'Deep Work',
      status: 'Active',
      description: 'You: Updating the thesis on relational platforms...',
      lastActivity: '10:42 AM',
      icon: 'psychology',
      iconBg:
        'bg-sky-50 border-sky-100 text-primary dark:bg-primary/10 dark:border-primary/20 dark:text-primary',
      accentColor: 'bg-primary/50 group-hover:bg-primary',
      members: [{ initials: 'JD' }, { initials: '+2' }],
    },
    {
      id: '2',
      title: 'Growth',
      status: 'Active',
      description:
        'Sarah: We should dive deeper into the ontology structure...',
      lastActivity: '9:18 AM',
      icon: 'spa',
      iconBg:
        'bg-slate-50 border-slate-100 dark:bg-white/5 dark:border-white/10',
      accentColor:
        'bg-slate-200 group-hover:bg-slate-300 dark:bg-white/10 dark:group-hover:bg-white/15',
    },
    {
      id: '3',
      title: 'Mentorship',
      status: 'Active',
      description: 'You: Reviewing feedback from mentees this week...',
      lastActivity: '8:55 AM',
      icon: 'school',
      iconBg:
        'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-300',
      accentColor:
        'bg-amber-200 group-hover:bg-amber-300 dark:bg-amber-500/30 dark:group-hover:bg-amber-500/40',
    },
  ]

  return (
    <section className="animate-fade-in [animation-delay:0.1s]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title text-primary-content text-sm font-bold uppercase tracking-widest dark:text-primary">
          Fields
        </h3>
        <button className="cursor-pointer text-xs text-slate-400 hover:text-slate-700 transition-colors font-medium dark:text-white/50 dark:hover:text-white">
          Manage Fields
        </button>
      </div>

      <div className="space-y-3">
        {fields.map((field) => (
          <div
            key={field.id}
            className="chat-card rounded-2xl p-5 flex items-center gap-5 cursor-pointer group relative overflow-hidden"
          >
            {/* Left accent line */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${field.accentColor}`}
            ></div>

            {/* Icon */}
            <div
              className={`size-12 rounded-2xl border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm ${field.iconBg}`}
            >
              <span className="material-symbols-outlined text-xl">
                {field.icon}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-lg font-bold text-slate-800 group-hover:text-primary-content transition-colors dark:text-white dark:group-hover:text-primary">
                  {field.title}
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-green-100/50 border border-green-200 text-[10px] text-green-700 font-semibold dark:bg-green-500/20 dark:border-green-500/30 dark:text-green-300">
                  {field.status}
                </span>
              </div>
              <p className="text-sm text-slate-500 truncate group-hover:text-slate-700 transition-colors dark:text-white/60 dark:group-hover:text-white/80">
                <span className="text-slate-700 font-semibold dark:text-white/90">
                  {field.description.split(':')[0]}:
                </span>
                {field.description.split(':')[1]}
              </p>
            </div>

            {/* Right Section - Time and Members */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className="text-xs text-slate-400 font-medium dark:text-white/50">
                {field.lastActivity}
              </span>
              {field.members && (
                <div className="flex -space-x-2">
                  {field.members.map((member, idx) => (
                    <div
                      key={idx}
                      className="size-6 rounded-full bg-slate-100 border border-white shadow-sm flex items-center justify-center text-[8px] font-bold text-slate-600 dark:bg-white/10 dark:border-white/20 dark:text-white/70"
                    >
                      {member.initials}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
