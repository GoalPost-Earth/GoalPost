'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import type { NodeType } from '@/components/ui/pulse-node'
import { DraggablePulseNode } from '@/components/canvas/draggable-pulse-node'
import { GenericPulseCanvas } from '@/components/canvas/generic-pulse-canvas'
import { OfferingModal } from '@/components/ui/offering-modal'
import { OfferingInput } from '@/components/ui/offering-input'
import { useApp } from '@/app/contexts/AppContext'

interface PulsePosition {
  pulseId: string
  x: number
  y: number
  icon: string
  label: string
  type: NodeType
  animation: 'float' | 'float-delayed' | 'float-random' | 'pulse-slow' | 'none'
}

// Icon mappings for pulse types
const pulseTypeIcons: Record<'goal' | 'resource' | 'story', string> = {
  goal: 'flag',
  resource: 'diamond',
  story: 'auto_stories',
}

const ANIMATION_ORDER: Array<
  'float' | 'float-delayed' | 'float-random' | 'pulse-slow'
> = ['float', 'float-delayed', 'float-random', 'pulse-slow']

function FieldDetailPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [pulsePositions, setPulsePositions] = useState<PulsePosition[]>([])
  const [currentScale, setCurrentScale] = useState(1)
  const [isLoadingPulses, setIsLoadingPulses] = useState(true)

  const params = useParams()
  const fieldId = params?.feild as string // Note: folder name is [feild] (typo)
  const { user } = useApp()

  // Redirect if no field ID
  if (!fieldId) {
    console.error('❌ No field ID in URL')
  }

  // Compute positions for pulse nodes
  const computePulsePositions = useCallback(
    (
      pulseData: Array<{
        id: string
        content: string
        type: 'goal' | 'resource' | 'story'
      }>
    ) => {
      // 2x canvas size (GenericPulseCanvas with canvasScale={2})
      const canvasWidth = (window.innerWidth || 1200) * 2
      const canvasHeight = (window.innerHeight || 1200) * 2
      const centerX = canvasWidth / 2
      const centerY = canvasHeight / 2
      const radialDistance = Math.min(canvasWidth, canvasHeight) / 4

      const positions: PulsePosition[] = pulseData.map((pulse, idx) => {
        const angle = (idx / Math.max(pulseData.length, 1)) * Math.PI * 2
        const animation = ANIMATION_ORDER[idx % ANIMATION_ORDER.length]

        return {
          pulseId: pulse.id,
          x: Math.cos(angle) * radialDistance + centerX,
          y: Math.sin(angle) * radialDistance + centerY,
          icon: pulseTypeIcons[pulse.type],
          label:
            pulse.content.substring(0, 50) +
            (pulse.content.length > 50 ? '...' : ''),
          type: pulse.type,
          animation,
        }
      })
      return positions
    },
    []
  )

  const fetchPulses = useCallback(async () => {
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
        const positions = computePulsePositions(data.pulses)
        setPulsePositions(positions)
        console.log(`✓ Loaded ${positions.length} pulses for field ${fieldId}`)
      } else {
        setPulsePositions([])
        console.log(`ℹ️ No pulses found for field ${fieldId}`)
      }
    } catch (error) {
      console.error('Error fetching pulses:', error)
      setPulsePositions([])
    } finally {
      setIsLoadingPulses(false)
    }
  }, [fieldId, computePulsePositions])

  useEffect(() => {
    fetchPulses()
  }, [fetchPulses])

  useEffect(() => {
    setIsMounted(true)
  }, [])

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

      // Refresh pulses after successful creation
      await fetchPulses()

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
    <>
      <GenericPulseCanvas
        canvasScale={2}
        onScaleChange={setCurrentScale}
        isLoading={isLoadingPulses}
        isEmpty={pulsePositions.length === 0}
        actionButton={
          isMounted && (
            <div className="group flex flex-col items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="cursor-pointer relative flex items-center justify-center size-16 rounded-full gp-glass dark:gp-glass bg-white/50 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-700/80 shadow-lg hover:shadow-[0_0_35px_rgba(79,255,203,0.3)] dark:hover:shadow-[0_0_35px_rgba(79,255,203,0.2)] transition-all duration-500 ease-out border border-slate-200 dark:border-white/10 hover:border-gp-accent-glow/40 dark:hover:border-gp-accent-glow/30 backdrop-blur-md group-hover:-translate-y-1"
              >
                <span className="material-symbols-outlined text-3xl text-slate-400 dark:text-white group-hover:text-gp-accent-glow dark:group-hover:text-gp-accent-glow transition-colors duration-500">
                  spa
                </span>
                <div className="absolute inset-0 rounded-full border border-slate-400/20 dark:border-white/15 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              </button>
            </div>
          )
        }
      >
        {isMounted &&
          !isLoadingPulses &&
          pulsePositions.map((pos) => (
            <DraggablePulseNode
              key={pos.pulseId}
              icon={pos.icon}
              label={pos.label}
              type={pos.type}
              animation={pos.animation}
              canvasPosition={{ x: pos.x, y: pos.y }}
              scale={currentScale}
              onPositionChange={(x, y) =>
                setPulsePositions((prev) =>
                  prev.map((p) =>
                    p.pulseId === pos.pulseId ? { ...p, x, y } : p
                  )
                )
              }
              onClick={() => console.log(`Clicked pulse: ${pos.label}`)}
            />
          ))}
      </GenericPulseCanvas>

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
            onSubmit={(value: string, type: string, name: string) => {
              handleOfferingSubmit(value, type, name)
            }}
            isLoading={isSubmitting}
          />
        </div>
      </OfferingModal>
    </>
  )
}

export default FieldDetailPage
