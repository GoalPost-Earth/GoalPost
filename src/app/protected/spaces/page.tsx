'use client'

import { useEffect } from 'react'
import { SpaceWrapper } from '@/components/ui/space-wrapper'
import { useRouter } from 'next/navigation'
import { usePageContext } from '@/contexts'
import { useAnimations } from '@/contexts/animation-context'
import { cn } from '@/lib/utils'

export default function SpacesPage() {
  const router = useRouter()
  const { setPageTitle } = usePageContext()
  const { animationsEnabled } = useAnimations()

  useEffect(() => {
    setPageTitle('Spaces')
  }, [setPageTitle])

  return (
    <main className="relative min-h-screen bg-gp-surface dark:bg-gp-surface-dark transition-colors overflow-x-hidden overflow-y-auto pt-24">
      {/* Background effects - fixed so they don't scroll */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(19,127,236,0.08),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(19,127,236,0.15),transparent_70%)] pointer-events-none" />
      <div
        className={cn(
          'fixed top-[15%] left-[15%] w-125 h-125 bg-gp-primary/10 dark:bg-gp-primary/5 rounded-full blur-[120px] pointer-events-none',
          animationsEnabled && 'animate-blob'
        )}
      />
      <div
        className={cn(
          'fixed bottom-[15%] right-[15%] w-100 h-100 bg-gp-accent-glow/10 dark:bg-gp-accent-glow/5 rounded-full blur-[100px] pointer-events-none',
          animationsEnabled && 'animate-blob [animation-delay:2s]'
        )}
      />
      <div
        className={cn(
          'fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-75 h-75 bg-gp-goal/5 dark:bg-gp-goal/3 rounded-full blur-[80px] pointer-events-none',
          animationsEnabled && 'animate-blob [animation-delay:4s]'
        )}
      />

      {/* Dot grid pattern - fixed so it doesn't scroll */}
      <div className="fixed inset-0 gp-dot-grid opacity-30 dark:opacity-20 pointer-events-none" />
      <div
        className="relative z-10 container mx-auto px-6 py-12 max-w-7xl"
        data-tour="spaces-container"
      >
        <div className="text-center mb-16 z-20">
          <h2 className="text-4xl md:text-5xl font-extralight text-gp-ink-strong dark:text-gp-ink-strong tracking-tight transition-colors">
            Where shall we begin?
          </h2>
          <p className="mt-4 text-gp-ink-muted dark:text-gp-ink-muted font-light tracking-wide max-w-lg mx-auto leading-relaxed transition-colors">
            Choose your sphere of resonance
          </p>
        </div>

        {/* Main Space Bubbles */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-24 w-full max-w-7xl">
          {/* MeSpace - Personal Space */}
          <div data-tour="me-space-button">
            <SpaceWrapper
              title="MeSpace"
              subtitle="Inner Sanctuary"
              description="Self-reflection, personal growth, and individual purpose."
              variant="mespace"
              onClick={() => {
                setPageTitle('Me Space')
                const meSpaceId = localStorage.getItem('meSpaceId')
                router.push(
                  meSpaceId
                    ? `/protected/spaces/me-space/${meSpaceId}`
                    : '/protected/spaces/me-space'
                )
              }}
            />
          </div>

          {/* WeSpace - Community Space */}
          <SpaceWrapper
            title="WeSpace"
            subtitle="Collective Field"
            description="Community sensing, shared intent, and collaborative evolution."
            variant="wespace"
            onClick={() => {
              setPageTitle('We Space')
              router.push('/protected/spaces/we-space')
            }}
          />
        </div>
      </div>
    </main>
  )
}
