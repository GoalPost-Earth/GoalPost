'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { PulseNode } from '@/components/ui/pulse-node'
import { OfferingModal } from '@/components/ui/offering-modal'
import { OfferingInput } from '@/components/ui/offering-input'
import { AIChatButton } from '@/components/ui/ai-chat-button'
import { AIAssistantPanel } from '@/components/ui/ai-assistant-panel'
import { cn } from '@/lib/utils'

// Mock data for field nodes
const fieldNodesData: Record<
  string,
  Array<{
    icon: string
    label: string
    type: 'goal' | 'resource' | 'story'
    position: string
    animation: string
  }>
> = {
  'deep-work': [
    {
      icon: 'flag',
      label: 'Expand API Coverage',
      type: 'goal',
      position: 'top-left',
      animation: 'float',
    },
    {
      icon: 'diamond',
      label: 'Design Tokens',
      type: 'resource',
      position: 'bottom-left',
      animation: 'float-delayed',
    },
    {
      icon: 'auto_stories',
      label: 'Origin Narrative',
      type: 'story',
      position: 'top-right',
      animation: 'float-random',
    },
    {
      icon: 'flag',
      label: 'Q3 Revenue',
      type: 'goal',
      position: 'bottom-right',
      animation: 'pulse-slow',
    },
    {
      icon: 'diamond',
      label: 'Raw Dataset B',
      type: 'resource',
      position: 'top-center',
      animation: 'float',
    },
    {
      icon: 'auto_stories',
      label: 'User Journey Map',
      type: 'story',
      position: 'right-center',
      animation: 'float-delayed',
    },
  ],
  growth: [
    {
      icon: 'self_improvement',
      label: 'Personal Development',
      type: 'goal',
      position: 'top-left',
      animation: 'float',
    },
    {
      icon: 'diamond',
      label: 'Learning Materials',
      type: 'resource',
      position: 'bottom-left',
      animation: 'float-delayed',
    },
    {
      icon: 'auto_stories',
      label: 'Growth Journey',
      type: 'story',
      position: 'top-right',
      animation: 'float-random',
    },
  ],
  community: [
    {
      icon: 'groups',
      label: 'Team Building',
      type: 'goal',
      position: 'top-left',
      animation: 'float',
    },
    {
      icon: 'handshake',
      label: 'Collaboration Tools',
      type: 'resource',
      position: 'bottom-left',
      animation: 'float-delayed',
    },
    {
      icon: 'forum',
      label: 'Community Stories',
      type: 'story',
      position: 'top-right',
      animation: 'float-random',
    },
    {
      icon: 'hub',
      label: 'Network Hub',
      type: 'goal',
      position: 'bottom-right',
      animation: 'pulse-slow',
    },
  ],
  inbox: [
    {
      icon: 'mail',
      label: 'Unread Messages',
      type: 'goal',
      position: 'top-left',
      animation: 'float',
    },
    {
      icon: 'notification_important',
      label: 'Urgent Items',
      type: 'resource',
      position: 'top-right',
      animation: 'float-delayed',
    },
  ],
  vitality: [
    {
      icon: 'favorite',
      label: 'Health Goals',
      type: 'goal',
      position: 'top-left',
      animation: 'float',
    },
    {
      icon: 'fitness_center',
      label: 'Wellness Resources',
      type: 'resource',
      position: 'top-right',
      animation: 'float-delayed',
    },
  ],
}

// Icon mappings for pulse types
const pulseTypeIcons: Record<'goal' | 'resource' | 'story', string> = {
  goal: 'flag',
  resource: 'diamond',
  story: 'auto_stories',
}

function FieldDetailPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [pulses, setPulses] = useState<
    Array<{
      icon: string
      label: string
      type: 'goal' | 'resource' | 'story'
      position: string
      animation: string
    }>
  >([])
  const [isLoadingPulses, setIsLoadingPulses] = useState(true)

  const paramId = useParams()
  const fieldId = (paramId?.field as string) || 'deep-work'
  const { user } = useAuth()

  // Position variations for the pulses
  const positions: Array<
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'top-center'
    | 'right-center'
  > = [
    'top-left',
    'bottom-left',
    'top-right',
    'bottom-right',
    'top-center',
    'right-center',
  ]

  const animations: Array<
    'float' | 'float-delayed' | 'float-random' | 'pulse-slow'
  > = [
    'float',
    'float-delayed',
    'float-random',
    'pulse-slow',
    'float',
    'float-delayed',
  ]

  // Fetch pulses on mount
  useEffect(() => {
    const fetchPulses = async () => {
      try {
        setIsLoadingPulses(true)
        const response = await fetch(
          `/api/pulse/get-by-context?contextId=${fieldId}`
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch pulses: ${response.status}`)
        }

        const data = await response.json()

        if (data.success && data.pulses && data.pulses.length > 0) {
          // Transform pulses to node format
          const pulseNodes = data.pulses.map((pulse: any, idx: number) => ({
            icon: pulseTypeIcons[pulse.type as 'goal' | 'resource' | 'story'],
            label:
              pulse.content.substring(0, 50) +
              (pulse.content.length > 50 ? '...' : ''),
            type: pulse.type as 'goal' | 'resource' | 'story',
            position: positions[idx % positions.length],
            animation: animations[idx % animations.length],
          }))
          setPulses(pulseNodes)
          console.log(
            `✓ Loaded ${pulseNodes.length} pulses for field ${fieldId}`
          )
        } else {
          setPulses([])
          console.log(`ℹ️ No pulses found for field ${fieldId}`)
        }
      } catch (error) {
        console.error('Error fetching pulses:', error)
        setPulses([])
      } finally {
        setIsLoadingPulses(false)
      }
    }

    fetchPulses()
  }, [fieldId])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const positionMap: Record<string, string> = {
    'top-left': 'top-[28%] left-[68%]',
    'top-right': 'top-[35%] left-[32%]',
    'bottom-left': 'top-[62%] left-[22%]',
    'bottom-right': 'top-[75%] left-[72%]',
    'top-center': 'top-[20%] left-[25%]',
    'right-center': 'top-[45%] left-[82%]',
  }

  const handleOfferingSubmit = async (
    value: string,
    type: string,
    name: string
  ) => {
    console.log('🎯 handleOfferingSubmit called with:', { value, type, name })

    if (!user) {
      console.error('❌ No user authenticated')
      setSubmitError('User not authenticated')
      return
    }

    console.log('👤 User found:', user.id)
    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)

    try {
      // Map pulse type from node type to API pulse type
      const pulseTypeMap: Record<string, string> = {
        goal: 'GoalPulse',
        resource: 'ResourcePulse',
        story: 'StoryPulse',
      }

      const pulseType = pulseTypeMap[type] || 'GoalPulse'

      const requestBody = {
        contextId: fieldId, // Use field ID as context ID
        personId: user.id,
        pulseType,
        content: value,
        conversation: [
          {
            role: 'user',
            content: value,
          },
        ],
      }

      console.log(
        '📤 Sending request to /api/pulse/create-from-conversation:',
        requestBody
      )

      const response = await fetch('/api/pulse/create-from-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('📨 Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ API error response:', errorData)
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        )
      }

      const data = await response.json()
      console.log('✅ Pulse created successfully:', data)
      setSubmitSuccess(true)

      // Close modal and reset after success
      setTimeout(() => {
        setIsModalOpen(false)
        setSubmitSuccess(false)
      }, 1500)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('❌ Error submitting pulse:', error)
      setSubmitError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative w-full h-screen overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors">
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(19,127,236,0.08),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(19,127,236,0.05),transparent_70%)]" />

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-40 dark:opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(var(--gp-ink-soft) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Pulse dots (background animation) */}
      <div className="absolute top-[20%] left-[10%] size-1 bg-gp-primary/40 dark:bg-white/20 rounded-full animate-pulse" />
      <div
        className="absolute top-[80%] left-[20%] size-1.5 bg-gp-primary/30 dark:bg-white/10 rounded-full"
        style={{ animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
      />
      <div className="absolute top-[40%] right-[15%] size-1 bg-gp-primary/40 dark:bg-white/20 rounded-full animate-float" />

      {/* Content Container - Positioned below navbar with relative positioning */}
      <div className="relative w-full h-full pt-24">
        {/* Nodes Canvas */}
        <div className="relative w-full h-full">
          {isMounted && isLoadingPulses && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="mb-4">
                  <span className="material-symbols-outlined text-4xl text-gp-primary animate-spin">
                    hourglass_bottom
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-white/60">
                  Loading pulses...
                </p>
              </div>
            </div>
          )}

          {isMounted && !isLoadingPulses && pulses.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-slate-600 dark:text-white/60 mb-2">
                  No pulses yet
                </p>
                <p className="text-xs text-slate-500 dark:text-white/40">
                  Create one with the button below
                </p>
              </div>
            </div>
          )}

          {isMounted &&
            !isLoadingPulses &&
            pulses.map((node, idx) => (
              <div
                key={idx}
                className={cn(
                  'absolute',
                  positionMap[node.position] ||
                    'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                )}
              >
                <PulseNode
                  icon={node.icon}
                  label={node.label}
                  type={node.type}
                  animation={
                    node.animation as
                      | 'float'
                      | 'float-delayed'
                      | 'float-random'
                      | 'pulse-slow'
                      | 'none'
                  }
                  onClick={() => console.log(`Clicked pulse: ${node.label}`)}
                />
              </div>
            ))}
        </div>

        {/* Bottom Action Button */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 group flex flex-col items-center gap-3">
          {isMounted && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="relative flex items-center justify-center size-16 rounded-full gp-glass dark:gp-glass bg-white/50 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-700/80 shadow-lg hover:shadow-[0_0_35px_rgba(79,255,203,0.3)] dark:hover:shadow-[0_0_35px_rgba(79,255,203,0.2)] transition-all duration-500 ease-out border border-slate-200 dark:border-white/10 hover:border-gp-accent-glow/40 dark:hover:border-gp-accent-glow/30 backdrop-blur-md group-hover:-translate-y-1"
            >
              <span className="material-symbols-outlined text-3xl text-slate-400 dark:text-white group-hover:text-gp-accent-glow dark:group-hover:text-gp-accent-glow transition-colors duration-500">
                spa
              </span>
              <div className="absolute inset-0 rounded-full border border-slate-400/20 dark:border-white/15 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            </button>
          )}
        </div>
      </div>

      {/* Offering Modal */}
      <OfferingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSubmitError(null)
          setSubmitSuccess(false)
        }}
        position="bottom"
      >
        <div className="w-full max-w-160">
          {submitError && (
            <div className="mb-4 p-4 rounded-xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 text-red-700 dark:text-red-300 text-sm">
              {submitError}
            </div>
          )}
          {submitSuccess && (
            <div className="mb-4 p-4 rounded-xl bg-green-500/10 dark:bg-green-500/20 border border-green-500/30 text-green-700 dark:text-green-300 text-sm">
              Pulse created successfully!
            </div>
          )}
          <OfferingInput
            onSubmit={(value, type, name) => {
              handleOfferingSubmit(value, type, name)
            }}
            isLoading={isSubmitting}
          />
        </div>
      </OfferingModal>

      {/* AI Chat Components */}
      {isMounted && (
        <>
          <AIChatButton
            onClick={() => setIsAIChatOpen(!isAIChatOpen)}
            isOpen={isAIChatOpen}
          />
          <AIAssistantPanel
            isOpen={isAIChatOpen}
            onClose={() => setIsAIChatOpen(false)}
          />
        </>
      )}
    </main>
  )
}

export default FieldDetailPage
