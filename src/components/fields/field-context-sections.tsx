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
  __typename?: string | null
  name?: string | null
  visibility?: string | null
}

type PersonRecord = {
  id: string
  firstName: string
  lastName: string
  name: string | null
  email: string | null
  photo: string | null
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST' | 'PERSON'
}

type FieldContextSectionsProps = {
  createdDate: string
  pulses: PulseRecord[]
  resonances: ResonanceRecord[]
  space?: SpaceRecord | null
  people?: PersonRecord[]
  onAddPulse: () => void
  onAddPerson?: () => void
  onAddResonance: () => void
  /** Optional bulk-share entry attached to the Pulses section header.
   *  Omit (or pass `undefined`) to hide — typically when `pulses` is empty. */
  onSharePulses?: () => void
  /** Optional upload entry attached to a Documents-related empty state.
   *  Omit when the user lacks edit permission. */
  onUploadDocument?: () => void
  onEditPulse: (
    e: React.MouseEvent,
    pulseId: string,
    type: 'goal' | 'resource' | 'story' | 'care' | 'coreValue',
    title: string,
    content: string
  ) => void
  onDeletePulse: (
    e: React.MouseEvent,
    pulseId: string,
    type: 'goal' | 'resource' | 'story' | 'care' | 'coreValue'
  ) => void
  onPulseClick: (pulseId: string) => void
  onResonanceClick: (resonanceId: string) => void
  onPersonClick?: (personId: string) => void
}

function getEditablePulseType(
  typename: string
): 'goal' | 'resource' | 'story' | 'care' | 'coreValue' | null {
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

export function FieldContextSections({
  createdDate,
  pulses,
  resonances,
  space,
  people,
  onAddPulse,
  onAddPerson,
  onAddResonance,
  onSharePulses,
  onUploadDocument,
  onEditPulse,
  onDeletePulse,
  onPulseClick,
  onResonanceClick,
  onPersonClick,
}: FieldContextSectionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
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

      {people && (
        <div className="flex flex-col gap-4 md:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <SectionHeader icon="groups" title="People" />
            {onAddPerson && (
              <button
                onClick={onAddPerson}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 text-gp-ink-strong dark:text-gp-ink-strong hover:bg-white/80 dark:hover:bg-white/10 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  person_add
                </span>
                Add Person
              </button>
            )}
          </div>
          {people.length > 0 ? (
            <ProfileCard>
              <div className="space-y-3">
                {people.map((person, idx) => (
                  <div
                    key={person.id}
                    onClick={() => onPersonClick?.(person.id)}
                    className={
                      idx > 0
                        ? 'border-t border-gp-glass-border pt-3 rounded px-2 -mx-2'
                        : 'rounded px-2 -mx-2'
                    }
                  >
                    <div className="flex justify-between items-center gap-4 p-2">
                      <div>
                        <h4 className="text-xs font-bold text-gp-ink-strong dark:text-white">
                          {person.name ||
                            `${person.firstName} ${person.lastName}`.trim()}
                        </h4>
                        <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
                          {person.role}
                        </p>
                      </div>
                      {onPersonClick && (
                        <span className="material-symbols-outlined text-gp-ink-muted dark:text-gp-ink-soft text-sm">
                          arrow_forward_ios
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ProfileCard>
          ) : (
            <EmptySection
              icon="groups"
              title="No people yet"
              body="People you add show up here with their role inside this field."
              cta={
                onAddPerson
                  ? { label: 'Add a person', icon: 'person_add', onClick: onAddPerson }
                  : undefined
              }
            />
          )}
        </div>
      )}

      <div className="flex flex-col gap-4 md:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <SectionHeader icon="waves" title="Pulses" />
          <div className="flex items-center gap-2">
            {onSharePulses && (
              <button
                onClick={onSharePulses}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium bg-gp-primary/10 dark:bg-gp-primary/15 border border-gp-primary/30 dark:border-gp-primary/40 text-gp-primary hover:bg-gp-primary/20 dark:hover:bg-gp-primary/25 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  share
                </span>
                Share
              </button>
            )}
            <button
              onClick={onAddPulse}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 text-gp-ink-strong dark:text-gp-ink-strong hover:bg-white/80 dark:hover:bg-white/10 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add Pulse
            </button>
          </div>
        </div>
        {pulses.length === 0 ? (
          <EmptySection
            icon="waves"
            title="No pulses yet"
            body="A pulse is a Goal, Resource, Story, Care, or Core Value contributed into this field. Add the first one — or drop a document and let the assistant extract pulses from it."
            cta={{ label: 'Add a pulse', icon: 'add', onClick: onAddPulse }}
            secondaryCta={
              onUploadDocument
                ? {
                    label: 'Upload a document',
                    icon: 'upload_file',
                    onClick: onUploadDocument,
                  }
                : undefined
            }
          />
        ) : (
          <ProfileCard>
            <div className="space-y-3">
              {pulses.map((pulse, idx) => {
                const pulseType = getEditablePulseType(pulse.__typename)
                const canEditPulse =
                  pulseType === 'goal' ||
                  pulseType === 'resource' ||
                  pulseType === 'story'

                return (
                  <div
                    key={pulse.id}
                    onClick={() => onPulseClick(pulse.id)}
                    className={
                      idx > 0
                        ? 'border-t border-gp-glass-border pt-3 cursor-pointer hover:bg-gp-glass-bg/50 dark:hover:bg-white/5 transition-colors rounded px-2 -mx-2 '
                        : 'cursor-pointer hover:bg-gp-glass-bg/50 dark:hover:bg-white/5 transition-colors rounded px-2 -mx-2'
                    }
                  >
                    <div className="flex justify-between items-start gap-4 mb-1 p-4">
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
                      <div
                        className="flex items-start gap-2 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {canEditPulse && pulseType && (
                          <>
                            <button
                              onClick={(e) =>
                                onEditPulse(
                                  e,
                                  pulse.id,
                                  pulseType,
                                  pulse.title,
                                  pulse.content
                                )
                              }
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/60 bg-white/50 text-gp-ink-strong transition-all hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-gp-ink-strong dark:hover:bg-white/10"
                              aria-label={`Edit ${pulse.title}`}
                            >
                              <span
                                className="material-symbols-outlined cursor-pointer"
                                style={{ fontSize: '14px' }}
                              >
                                edit
                              </span>
                            </button>
                            <button
                              onClick={(e) =>
                                onDeletePulse(e, pulse.id, pulseType)
                              }
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-red-300 bg-red-50 text-red-600 transition-all hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 cursor-pointer"
                              aria-label={`Delete ${pulse.title}`}
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: '14px' }}
                              >
                                delete
                              </span>
                            </button>
                          </>
                        )}
                        <span className="pt-1 text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                          {new Date(pulse.createdAt).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )}
                        </span>
                      </div>
                    </div>
                    {pulse.content && (
                      <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed mt-1 px-4 pb-4">
                        {pulse.content.substring(0, 150)}
                        {pulse.content.length > 150 ? '...' : ''}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </ProfileCard>
        )}
      </div>

      <div className="flex flex-col gap-4 md:col-span-2">
        <div className="flex items-center justify-between">
          <SectionHeader icon="hub" title="Resonances" />
          <button
            onClick={() => onAddResonance()}
            disabled={pulses.length < 2}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gp-primary/30 bg-gp-primary/10 hover:bg-gp-primary/20 text-gp-primary dark:border-gp-primary/40 dark:bg-gp-primary/20 dark:hover:bg-gp-primary/30 transition-colors text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gp-primary/10 cursor-pointer"
            aria-label={
              pulses.length < 2
                ? 'Add at least 2 pulses to link'
                : 'Link pulses'
            }
            title={
              pulses.length < 2
                ? 'Add at least 2 pulses to create a resonance link'
                : ''
            }
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Link Pulses
          </button>
        </div>
        {resonances.length === 0 ? (
          <EmptySection
            icon="hub"
            title={
              pulses.length < 2
                ? 'No resonances yet'
                : 'No resonances yet'
            }
            body={
              pulses.length < 2
                ? 'Resonances connect two pulses — add at least two pulses, then link the ones that resonate.'
                : 'Resonances surface meaningful connections between pulses. Link two that go together, or let the assistant suggest some.'
            }
            cta={
              pulses.length >= 2
                ? { label: 'Link pulses', icon: 'add', onClick: onAddResonance }
                : undefined
            }
          />
        ) : (
          <ProfileCard>
            <div className="space-y-3">
              {resonances.map((resonance, idx) => {
                const source = resonance.source?.[0]
                const target = resonance.target?.[0]

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
              })}
            </div>
          </ProfileCard>
        )}
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

type EmptyCta = {
  label: string
  icon: string
  onClick: () => void
}

function EmptySection({
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
