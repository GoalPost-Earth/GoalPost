'use client'

// Shared primitives for the FieldContext section components
// (field-context-sections.tsx and pulses-section.tsx). Kept in their own module
// so both can import them without a circular dependency.

export type EditablePulseType =
  | 'goal'
  | 'resource'
  | 'story'
  | 'care'
  | 'coreValue'

export function getEditablePulseType(
  typename: string
): EditablePulseType | null {
  switch (typename) {
    case 'GoalPulse':
      return 'goal'
    case 'ResourcePulse':
      return 'resource'
    case 'StoryPulse':
      return 'story'
    case 'CarePulse':
      return 'care'
    case 'CoreValuePulse':
      return 'coreValue'
    default:
      return null
  }
}

export function getPulseTypeLabel(typename: string): string {
  switch (typename) {
    case 'GoalPulse':
      return 'Goal'
    case 'ResourcePulse':
      return 'Resource'
    case 'StoryPulse':
      return 'Story'
    case 'CarePulse':
      return 'Care'
    case 'CoreValuePulse':
      return 'Core Value'
    default:
      return 'Pulse'
  }
}

export function getPulseTypeClass(typename: string): string {
  switch (typename) {
    case 'GoalPulse':
      return 'text-gp-goal'
    case 'ResourcePulse':
      return 'text-gp-resource'
    case 'StoryPulse':
      return 'text-gp-story'
    case 'CarePulse':
      return 'text-gp-care'
    case 'CoreValuePulse':
      return 'text-gp-coreValue'
    default:
      return 'text-gp-accent-glow'
  }
}

export type EmptyCta = {
  label: string
  icon: string
  onClick: () => void
}

export function EmptySection({
  icon,
  title,
  body,
  cta,
  secondaryCta,
}: {
  icon: string
  title: string
  body: string
  cta?: EmptyCta
  secondaryCta?: EmptyCta
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/40 dark:border-white/15 bg-white/30 dark:bg-white/[0.02] p-6 sm:p-10 text-center flex flex-col items-center gap-3">
      <div className="size-12 rounded-2xl border border-white/40 dark:border-white/10 bg-white/50 dark:bg-white/[0.04] flex items-center justify-center text-slate-500 dark:text-white/55">
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <div className="space-y-1 max-w-md">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
          {title}
        </h4>
        <p className="text-xs text-slate-500 dark:text-white/55 leading-relaxed">
          {body}
        </p>
      </div>
      {(cta || secondaryCta) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-1">
          {cta && (
            <button
              type="button"
              onClick={cta.onClick}
              className="inline-flex items-center justify-center gap-2 px-4 h-9 rounded-full bg-gp-primary hover:bg-gp-primary/90 text-white text-xs font-semibold shadow-md shadow-gp-primary/20 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                {cta.icon}
              </span>
              {cta.label}
            </button>
          )}
          {secondaryCta && (
            <button
              type="button"
              onClick={secondaryCta.onClick}
              className="inline-flex items-center justify-center gap-2 px-4 h-9 rounded-full bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/15 text-gp-ink-strong dark:text-white text-xs font-semibold hover:bg-white/80 dark:hover:bg-white/10 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                {secondaryCta.icon}
              </span>
              {secondaryCta.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
