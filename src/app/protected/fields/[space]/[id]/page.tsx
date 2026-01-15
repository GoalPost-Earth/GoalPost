'use client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
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

function FieldDetailPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const paramId = useParams()
  const fieldId = (paramId?.id as string) || 'deep-work'
  const nodes = fieldNodesData[fieldId] || fieldNodesData['deep-work']

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

  const handleOfferingSubmit = (value: string, type: string, name: string) => {
    console.log('Pulse submitted:', { value, type, name })
    // Handle the submission logic here
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
          {isMounted &&
            nodes.map((node, idx) => (
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
                  onClick={() => console.log(`Clicked node: ${node.label}`)}
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
        onClose={() => setIsModalOpen(false)}
        position="bottom"
      >
        <OfferingInput
          onSubmit={(value, type, name) => {
            handleOfferingSubmit(value, type, name)
            setIsModalOpen(false)
          }}
        />
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
