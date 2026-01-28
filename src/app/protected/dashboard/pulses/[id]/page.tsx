'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { SectionHeader } from '@/components/persons/section-header'
import { ProfileCard } from '@/components/persons/profile-card'
import { ProfileBackground } from '@/components/persons/profile-background'
import { ProfileLayout } from '@/components/persons/profile-layout'
import { GET_PULSE_DETAILS_WITH_CONTEXT } from '@/app/graphql/queries/PULSE_DETAILS_QUERIES'

export default function PulseDetailsPage() {
  const params = useParams()
  const pulseId = params?.id as string

  const { data, loading, error } = useQuery(GET_PULSE_DETAILS_WITH_CONTEXT, {
    variables: { pulseId },
    skip: !pulseId,
  })

  const pulse = data?.fieldPulses?.[0]
  const context = pulse?.context?.[0]
  const space = context?.space?.[0]
  const contextPulses = context?.pulses || []

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-x-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors flex items-center justify-center">
        <div className="text-gp-ink-muted">Loading...</div>
      </div>
    )
  }

  if (error || !pulse) {
    return (
      <div className="relative min-h-screen overflow-x-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors flex items-center justify-center">
        <div className="text-red-500">Error loading pulse</div>
      </div>
    )
  }

  const createdDate = new Date(pulse.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const contextCreatedDate = context
    ? new Date(context.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : ''

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors pt-20">
      <ProfileBackground />

      {/* Scrollable content */}
      <main className="relative">
        <ProfileLayout>
          {/* Header Section */}
          <div className="flex flex-col items-center text-center mb-12">
            <span className="text-[9px] uppercase font-semibold text-gp-accent-glow mb-2">
              {pulse.__typename} • {context?.title}
            </span>
            <h1 className="text-4xl font-light tracking-tight text-gp-ink-strong dark:text-gp-ink-strong mb-2">
              {pulse.title}
            </h1>
            <p className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
              Created {createdDate}
            </p>
          </div>

          {/* Content Section */}
          <div className="mb-12">
            <div className="flex flex-col gap-4">
              <SectionHeader icon="description" title="Content" />
              <ProfileCard>
                <p className="text-sm text-gp-ink-strong dark:text-gp-ink-strong leading-relaxed">
                  {pulse.content}
                </p>
              </ProfileCard>
            </div>
          </div>

          {/* Grid Layout - Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Context Info Section */}
            <div className="flex flex-col gap-4">
              <SectionHeader icon="category" title="Context" />
              <ProfileCard>
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                      Title
                    </span>
                    <h4 className="text-xs font-bold text-gp-ink-strong dark:text-white">
                      {context?.title}
                    </h4>
                  </div>
                  {context?.emergentName && (
                    <div>
                      <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                        Emergent Name
                      </span>
                      <p className="text-xs text-gp-ink-strong dark:text-white italic">
                        &quot;{context.emergentName}&quot;
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                      Created
                    </span>
                    <p className="text-xs text-gp-ink-strong dark:text-white">
                      {contextCreatedDate}
                    </p>
                  </div>
                </div>
              </ProfileCard>
            </div>

            {/* Space Info Section */}
            <div className="flex flex-col gap-4">
              <SectionHeader icon="location_on" title="Space" />
              <ProfileCard>
                <div className="space-y-2">
                  <div>
                    <span className="text-[9px] uppercase font-semibold text-gp-primary block mb-1">
                      {space?.__typename || 'Space'}
                    </span>
                    <h4 className="text-xs font-bold text-gp-ink-strong dark:text-white">
                      {space?.name}
                    </h4>
                  </div>
                  <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
                    {space?.visibility}
                  </p>
                </div>
              </ProfileCard>
            </div>

            {/* Related Pulses Section */}
            <div className="flex flex-col gap-4 md:col-span-2">
              <SectionHeader icon="waves" title="Related Pulses in Context" />
              <ProfileCard>
                <div className="space-y-3">
                  {contextPulses.length > 0 ? (
                    contextPulses.map((relatedPulse, idx) => (
                      <div
                        key={relatedPulse.id}
                        className={
                          idx > 0 ? 'border-t border-gp-glass-border pt-3' : ''
                        }
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex-1">
                            <span className="text-[9px] uppercase font-semibold text-gp-accent-glow block mb-0.5">
                              {relatedPulse.__typename}
                            </span>
                            <h4 className="text-xs font-bold text-gp-ink-strong dark:text-white">
                              {relatedPulse.title}
                            </h4>
                          </div>
                        </div>
                        {relatedPulse.content && (
                          <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed mt-1">
                            {relatedPulse.content.substring(0, 100)}
                            {relatedPulse.content.length > 100 ? '...' : ''}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
                      No other pulses in this context
                    </p>
                  )}
                </div>
              </ProfileCard>
            </div>

            {/* Metadata Section */}
            <div className="flex flex-col gap-4 md:col-span-2">
              <SectionHeader icon="info" title="Metadata" />
              <ProfileCard>
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                      Type
                    </span>
                    <p className="text-xs text-gp-ink-strong dark:text-white">
                      {pulse.__typename}
                    </p>
                  </div>
                </div>
              </ProfileCard>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-6 w-full">
            <button className="px-8 py-3 rounded-full bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 text-gp-ink-strong dark:text-gp-ink-strong font-medium hover:bg-white/80 dark:hover:bg-white/10 transition-all text-sm shadow-sm">
              Edit Pulse
            </button>
            <button className="px-10 py-3 rounded-full bg-gp-primary text-white font-semibold hover:shadow-[0_8px_25px_rgba(var(--gp-primary-rgb),0.4)] hover:scale-[1.02] transition-all text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                share
              </span>
              Share
            </button>
          </div>
        </ProfileLayout>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-2 p-1.5 rounded-full bg-gp-glass-bg border border-gp-glass-border backdrop-blur-2xl shadow-xl dark:shadow-2xl">
          <button className="size-10 flex items-center justify-center rounded-full text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-primary transition-colors hover:bg-gp-primary/10 dark:hover:bg-gp-primary/20">
            <span className="material-symbols-outlined">message</span>
          </button>
          <div className="w-px h-4 bg-gp-glass-border" />
          <button className="size-10 flex items-center justify-center rounded-full text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-primary transition-colors hover:bg-gp-primary/10 dark:hover:bg-gp-primary/20">
            <span className="material-symbols-outlined">bookmark</span>
          </button>
        </div>
      </div>
    </div>
  )
}
