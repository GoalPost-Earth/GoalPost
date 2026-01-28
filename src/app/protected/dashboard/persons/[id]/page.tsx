'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { SectionHeader } from '@/components/persons/section-header'
import { ProfileCard } from '@/components/persons/profile-card'
import { ProfileBackground } from '@/components/persons/profile-background'
import { ProfileLayout } from '@/components/persons/profile-layout'
import { GET_PERSON_PROFILE } from '@/app/graphql/queries/PERSON_QUERIES'
import { cn } from '@/lib/utils'
import { useAnimations } from '@/app/contexts'

export default function PersonProfilePage() {
  const params = useParams()
  const personId = params?.id as string
  const { animationsEnabled } = useAnimations()

  const { data, loading, error } = useQuery(GET_PERSON_PROFILE, {
    variables: { personId },
    skip: !personId,
  })

  const person = data?.people?.[0]

  // Extract all pulses from all contexts across all spaces with metadata
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allPulses: any[] = []
  if (person?.ownsSpaces) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    person.ownsSpaces.forEach((space: any) => {
      const spaceType = space.__typename || 'Space'
      if (space.contexts) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        space.contexts.forEach((context: any) => {
          if (context.pulses) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            context.pulses.forEach((pulse: any) => {
              allPulses.push({
                ...pulse,
                spaceType,
                spaceName: space.name,
                contextName: context.title,
              })
            })
          }
        })
      }
    })
  }

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-50 bg-gp-surface/50 dark:bg-gp-surface-dark/50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <span
            className={cn(
              'material-symbols-outlined text-5xl text-gp-primary',
              animationsEnabled && 'animate-spin'
            )}
          >
            hourglass_bottom
          </span>
          <p className="text-sm font-medium text-gp-ink-muted dark:text-gp-ink-soft">
            Loading...
          </p>
        </div>
      </div>
    )
  }

  if (error || !person) {
    return (
      <div className="relative min-h-screen overflow-x-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors flex items-center justify-center">
        <div className="text-red-500">Error loading person profile</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors pt-20">
      <ProfileBackground />

      {/* Scrollable content */}
      <main className="relative">
        <ProfileLayout>
          {/* Profile Header */}
          <div className="flex flex-col items-center text-center mb-12">
            <h1 className="text-4xl font-light tracking-tight text-gp-ink-strong dark:text-gp-ink-strong mb-2">
              {person.name}
            </h1>
            <p className="text-gp-ink-muted dark:text-gp-ink-soft text-xs">
              {person.email}
            </p>
          </div>

          {/* Grid Layout - Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Owned Spaces Section */}
            <div className="flex flex-col gap-4">
              <SectionHeader icon="auto_awesome" title="Owned Spaces" />
              <ProfileCard>
                <div className="space-y-4">
                  {person.ownsSpaces && person.ownsSpaces.length > 0 ? (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    person.ownsSpaces.map((space: any, idx: number) => (
                      <div
                        key={idx}
                        className={
                          idx > 0 ? 'border-t border-gp-glass-border pt-3' : ''
                        }
                      >
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
                    <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
                      No spaces owned yet
                    </p>
                  )}
                </div>
              </ProfileCard>
            </div>

            {/* Member Spaces Section */}
            <div className="flex flex-col gap-4">
              <SectionHeader icon="group" title="Member Spaces" />
              <ProfileCard>
                <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
                  Not a member of any spaces yet
                </p>
              </ProfileCard>
            </div>

            {/* Pulses Section */}
            <div className="flex flex-col gap-4">
              <SectionHeader icon="waves" title="Pulses" />
              <ProfileCard>
                <div className="space-y-3">
                  {allPulses.length > 0 ? (
                    allPulses.slice(0, 5).map((pulse, idx) => (
                      <div
                        key={pulse.id}
                        className={
                          idx > 0 ? 'border-t border-gp-glass-border pt-3' : ''
                        }
                      >
                        <h4 className="text-xs font-bold text-gp-ink-strong dark:text-white mb-1">
                          {pulse.title}
                        </h4>
                        <p className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                          {pulse.spaceType} • {pulse.spaceName} •{' '}
                          {pulse.contextName}
                        </p>
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

            {/* Activity Summary Section */}
            <div className="flex flex-col gap-4">
              <SectionHeader icon="flare" title="Activity" />
              <ProfileCard>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
                      Total Pulses
                    </span>
                    <span className="text-lg font-bold text-gp-primary">
                      {allPulses.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
                      Active Spaces
                    </span>
                    <span className="text-lg font-bold text-gp-primary">
                      {person.ownsSpaces?.length || 0}
                    </span>
                  </div>
                </div>
              </ProfileCard>
            </div>
          </div>

          {/* Action Buttons */}
          {/* <div className="flex items-center justify-center gap-6 w-full">
            <button className="px-8 py-3 rounded-full bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 text-gp-ink-strong dark:text-gp-ink-strong font-medium hover:bg-white/80 dark:hover:bg-white/10 transition-all text-sm shadow-sm">
              View Profile
            </button>
            <button className="px-10 py-3 rounded-full bg-gp-primary text-white font-semibold hover:shadow-[0_8px_25px_rgba(var(--gp-primary-rgb),0.4)] hover:scale-[1.02] transition-all text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                bolt
              </span>
              Pulse {person.name.split(' ')[0]}
            </button>
          </div> */}
        </ProfileLayout>
      </main>

      {/* Bottom Action Bar */}
      {/* <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-2 p-1.5 rounded-full bg-gp-glass-bg border border-gp-glass-border backdrop-blur-2xl shadow-xl dark:shadow-2xl">
          <button className="size-10 flex items-center justify-center rounded-full text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-primary transition-colors hover:bg-gp-primary/10 dark:hover:bg-gp-primary/20">
            <span className="material-symbols-outlined">message</span>
          </button>
          <div className="w-px h-4 bg-gp-glass-border" />
          <button className="size-10 flex items-center justify-center rounded-full text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-primary transition-colors hover:bg-gp-primary/10 dark:hover:bg-gp-primary/20">
            <span className="material-symbols-outlined">share</span>
          </button>
        </div>
      </div> */}
    </div>
  )
}
