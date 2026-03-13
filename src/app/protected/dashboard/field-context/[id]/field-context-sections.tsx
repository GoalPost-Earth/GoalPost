'use client'

import { SectionHeader } from '@/components/persons/section-header'
import { ProfileCard } from '@/components/persons/profile-card'
import { formatResonanceLabel } from '@/utils/graph-utils'

type PulseRecord = {
  __typename: string
  id: string
  title: string
  content: string
  createdAt: string
}

type ResonancePulseRecord = {
  __typename: string
  id: string
  title: string
  content: string
  createdAt: string
}

type ResonanceRecord = {
  id: string
  label: string
  description?: string | null
  confidence?: number | null
  evidence?: string | null
  createdAt: string
  source?: ResonancePulseRecord[] | null
  target?: ResonancePulseRecord[] | null
}

type SpaceRecord = {
  __typename?: string
  name?: string | null
  visibility?: string | null
}

type FieldContextSectionsProps = {
  createdDate: string
  pulses: PulseRecord[]
  resonances: ResonanceRecord[]
  space?: SpaceRecord | null
  onPulseClick: (pulseId: string) => void
  onResonanceClick: (resonanceId: string) => void
}

function getPulseTypeLabel(typename: string): string {
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

function getPulseTypeClass(typename: string): string {
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

function getResonanceEndpointLabel(pulse?: ResonancePulseRecord): string {
  if (!pulse) return 'Unknown pulse'
  return `${getPulseTypeLabel(pulse.__typename)}: ${pulse.title}`
}

function formatConfidence(confidence?: number | null): string | null {
  if (typeof confidence !== 'number' || Number.isNaN(confidence)) {
    return null
  }

  const normalized = confidence <= 1 ? confidence * 100 : confidence
  return `${Math.round(normalized)}% confidence`
}

export function FieldContextSections({
  createdDate,
  pulses,
  resonances,
  space,
  onPulseClick,
  onResonanceClick,
}: FieldContextSectionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      <div className="flex flex-col gap-4">
        <SectionHeader icon="location_on" title="Space" />
        <ProfileCard>
          <div className="space-y-2">
            <div>
              <span className="text-[9px] uppercase font-semibold text-gp-primary block mb-1">
                {space?.__typename || 'Space'}
              </span>
              <h4 className="text-xs font-bold text-gp-ink-strong dark:text-white mb-1">
                {space?.name}
              </h4>
            </div>
            <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
              {space?.visibility}
            </p>
          </div>
        </ProfileCard>
      </div>

      <div className="flex flex-col gap-4">
        <SectionHeader icon="info" title="Metadata" />
        <ProfileCard>
          <div className="space-y-2">
            <div>
              <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                Created
              </span>
              <p className="text-xs font-semibold text-gp-ink-strong dark:text-white">
                {createdDate}
              </p>
            </div>
          </div>
        </ProfileCard>
      </div>

      <div className="flex flex-col gap-4 md:col-span-2">
        <SectionHeader icon="waves" title="Pulses" />
        <ProfileCard>
          <div className="space-y-3">
            {pulses.length > 0 ? (
              pulses.map((pulse, idx) => (
                <div
                  key={pulse.id}
                  onClick={() => onPulseClick(pulse.id)}
                  className={
                    idx > 0
                      ? 'border-t border-gp-glass-border pt-3 cursor-pointer hover:bg-gp-glass-bg/50 dark:hover:bg-white/5 transition-colors rounded px-2 -mx-2'
                      : 'cursor-pointer hover:bg-gp-glass-bg/50 dark:hover:bg-white/5 transition-colors rounded px-2 -mx-2'
                  }
                >
                  <div className="flex justify-between items-start gap-4 mb-1">
                    <div className="flex-1">
                      <span
                        className={`text-[9px] uppercase font-semibold block mb-0.5 ${getPulseTypeClass(pulse.__typename)}`}
                      >
                        {getPulseTypeLabel(pulse.__typename)}
                      </span>
                      <h4 className="text-xs font-bold text-gp-ink-strong dark:text-white">
                        {pulse.title}
                      </h4>
                    </div>
                    <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft shrink-0">
                      {new Date(pulse.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  {pulse.content && (
                    <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed mt-1">
                      {pulse.content.substring(0, 150)}
                      {pulse.content.length > 150 ? '...' : ''}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
                No pulses yet
              </p>
            )}
          </div>
        </ProfileCard>
      </div>

      <div className="flex flex-col gap-4 md:col-span-2">
        <SectionHeader icon="hub" title="Resonances" />
        <ProfileCard>
          <div className="space-y-3">
            {resonances.length > 0 ? (
              resonances.map((resonance, idx) => {
                const source = resonance.source?.[0]
                const target = resonance.target?.[0]
                const confidenceLabel = formatConfidence(resonance.confidence)

                return (
                  <div
                    key={resonance.id}
                    onClick={() => onResonanceClick(resonance.id)}
                    className={
                      idx > 0
                        ? 'border-t border-gp-glass-border pt-3 cursor-pointer hover:bg-gp-glass-bg/50 dark:hover:bg-white/5 transition-colors rounded px-2 -mx-2'
                        : 'cursor-pointer hover:bg-gp-glass-bg/50 dark:hover:bg-white/5 transition-colors rounded px-2 -mx-2'
                    }
                  >
                    <div className="flex justify-between items-start gap-4 mb-1">
                      <div className="flex-1 space-y-1">
                        <span className="text-[9px] uppercase font-semibold text-gp-primary block">
                          {formatResonanceLabel(resonance.label)}
                        </span>
                        <h4 className="text-xs font-bold text-gp-ink-strong dark:text-white leading-relaxed">
                          {getResonanceEndpointLabel(source)}
                          <span className="text-gp-ink-muted dark:text-gp-ink-soft font-normal">
                            {' '}
                            →{' '}
                          </span>
                          {getResonanceEndpointLabel(target)}
                        </h4>
                      </div>
                      {confidenceLabel && (
                        <span className="text-[10px] text-gp-primary shrink-0">
                          {confidenceLabel}
                        </span>
                      )}
                    </div>
                    {resonance.description && (
                      <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed mt-1">
                        {resonance.description}
                      </p>
                    )}
                    {!resonance.description && resonance.evidence && (
                      <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed mt-1">
                        {resonance.evidence}
                      </p>
                    )}
                  </div>
                )
              })
            ) : (
              <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
                No resonances in this field context yet
              </p>
            )}
          </div>
        </ProfileCard>
      </div>

      <div className="flex flex-col gap-4 md:col-span-2">
        <SectionHeader icon="summarize" title="Summary" />
        <ProfileCard>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
                Total Pulses
              </span>
              <span className="text-lg font-bold text-gp-primary">
                {pulses.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
                Total Resonances
              </span>
              <span className="text-lg font-bold text-gp-primary">
                {resonances.length}
              </span>
            </div>
          </div>
        </ProfileCard>
      </div>
    </div>
  )
}
