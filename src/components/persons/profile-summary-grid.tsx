'use client'

import type { FC } from 'react'
import { SectionHeader } from './section-header'
import { ProfileCard } from './profile-card'
import { RelatedPulsesList } from './related-pulses-list'
import type { RelatedPulseRow } from '@/lib/person-related-pulses'

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * The four summary cards at the foot of the person profile page — owned
 * spaces, member spaces, recent pulses, and the activity counters. Split from
 * `profile-sections.tsx` so neither file crowds the 400-line rule.
 */

const emptyTextClass = 'text-[11px] text-gp-ink-muted dark:text-gp-ink-soft'

const dividerClass = (idx: number) =>
  idx > 0 ? 'border-t border-gp-glass-border pt-3' : ''

export const ProfileSummaryGrid: FC<{
  ownsSpaces?: any[] | null
  memberOf?: any[] | null
  ownedPulses: any[]
  relatedRows: RelatedPulseRow[]
  totalPulseCount: number
  onOpenPulse: (id: string, title: string) => void
}> = ({
  ownsSpaces,
  memberOf,
  ownedPulses,
  relatedRows,
  totalPulseCount,
  onOpenPulse,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
    <div className="flex flex-col gap-4 h-full">
      <SectionHeader icon="auto_awesome" title="Owned Spaces" />
      <div className="flex-1 h-full">
        <ProfileCard>
          <div className="space-y-4">
            {ownsSpaces && ownsSpaces.length > 0 ? (
              ownsSpaces.map((space: any, idx: number) => (
                <div key={idx} className={dividerClass(idx)}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <span className="text-[9px] uppercase font-semibold text-gp-primary mb-0.5 block">
                        {space.__typename || 'Space'}
                      </span>
                      <h4 className="text-xs font-bold text-gp-ink-strong dark:text-white">
                        {space.name}
                      </h4>
                    </div>
                    <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                      {space.contexts?.length || 0} contexts
                    </span>
                  </div>
                  <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed">
                    {space.visibility}
                  </p>
                </div>
              ))
            ) : (
              <p className={emptyTextClass}>No spaces owned yet</p>
            )}
          </div>
        </ProfileCard>
      </div>
    </div>

    <div className="flex flex-col gap-4 h-full">
      <SectionHeader icon="group" title="Member Spaces" />
      <div className="flex-1 h-full">
        <ProfileCard>
          <div className="space-y-4">
            {memberOf && memberOf.length > 0 ? (
              memberOf.map((membership: any, idx: number) => {
                const space = membership.space?.[0] // space is an array
                if (!space) return null

                return (
                  <div key={idx} className={dividerClass(idx)}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <span className="text-[9px] uppercase font-semibold text-gp-primary mb-0.5 block">
                          {space.__typename || 'Space'} • {membership.role}
                        </span>
                        <h4 className="text-xs font-bold text-gp-ink-strong dark:text-white">
                          {space.name}
                        </h4>
                      </div>
                      <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                        {space.visibility}
                      </span>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className={emptyTextClass}>Not a member of any spaces yet</p>
            )}
          </div>
        </ProfileCard>
      </div>
    </div>

    <div className="flex flex-col gap-4 h-full">
      <SectionHeader icon="waves" title="Pulses" />
      <div className="flex-1 h-full">
        <ProfileCard>
          <div className="space-y-3">
            {ownedPulses.length === 0 && relatedRows.length === 0 && (
              <p className={emptyTextClass}>No pulses yet</p>
            )}
            {ownedPulses.slice(0, 5).map((pulse, idx) => (
              <div key={pulse.id} className={dividerClass(idx)}>
                <h4 className="text-xs font-bold text-gp-ink-strong dark:text-white mb-1">
                  {pulse.title}
                </h4>
                <p className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                  {pulse.spaceType} • {pulse.spaceName} • {pulse.contextName}
                </p>
              </div>
            ))}
            {relatedRows.length > 0 && (
              <div className={dividerClass(ownedPulses.length > 0 ? 1 : 0)}>
                <RelatedPulsesList rows={relatedRows} onOpen={onOpenPulse} />
              </div>
            )}
          </div>
        </ProfileCard>
      </div>
    </div>

    <div className="flex flex-col gap-4 h-full">
      <SectionHeader icon="flare" title="Activity" />
      <div className="flex-1 h-full">
        <ProfileCard>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
                Total Pulses
              </span>
              <span className="text-lg font-bold text-gp-primary">
                {totalPulseCount}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
                Active Spaces
              </span>
              <span className="text-lg font-bold text-gp-primary">
                {ownsSpaces?.length || 0}
              </span>
            </div>
          </div>
        </ProfileCard>
      </div>
    </div>
  </div>
)
