'use client'

import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { NodeType } from './pulse-node'
import { cn } from '@/lib/utils'

interface PulseTypeSuggestionProps {
  input: string
  onSelect: (type: NodeType, name: string) => void
  onClose: () => void
  isOpen: boolean
}

// Dummy AI inference - simple heuristics based on keywords
function inferPulseType(input: string): {
  type: NodeType
  interpretation: string
  suggestedName: string
} {
  const lowerInput = input.toLowerCase()

  // Goal indicators
  const goalKeywords = [
    'achieve',
    'complete',
    'finish',
    'accomplish',
    'target',
    'aim',
    'goal',
    'want to',
    'need to',
    'should',
    'expand',
    'improve',
    'increase',
    'grow',
    'build',
    'create',
    'develop',
    'learn',
    'master',
  ]

  // Resource indicators
  const resourceKeywords = [
    'tool',
    'resource',
    'material',
    'data',
    'dataset',
    'database',
    'file',
    'document',
    'template',
    'library',
    'framework',
    'code',
    'software',
    'application',
    'platform',
    'service',
    'api',
  ]

  // Story indicators
  const storyKeywords = [
    'journey',
    'experience',
    'story',
    'narrative',
    'lesson',
    'insight',
    'learning',
    'reflection',
    'memory',
    'moment',
    'event',
    'happened',
    'discovered',
    'realized',
    'found',
    'understand',
  ]

  const goalScore = goalKeywords.filter((kw) => lowerInput.includes(kw)).length
  const resourceScore = resourceKeywords.filter((kw) =>
    lowerInput.includes(kw)
  ).length
  const storyScore = storyKeywords.filter((kw) =>
    lowerInput.includes(kw)
  ).length

  let type: NodeType = 'goal'
  let interpretation = ''

  if (
    storyScore >= goalScore &&
    storyScore >= resourceScore &&
    storyScore > 0
  ) {
    type = 'story'
    interpretation =
      'This sounds like an experience or insight you want to capture and share.'
  } else if (resourceScore > goalScore && resourceScore > storyScore) {
    type = 'resource'
    interpretation =
      'This appears to be a tool, material, or knowledge asset that could be valuable.'
  } else {
    type = 'goal'
    interpretation =
      'This looks like an objective or outcome you want to work towards.'
  }

  // Generate a suggested name from input (capitalize and clean up)
  const suggestedName =
    input
      .trim()
      .split(' ')
      .slice(0, 4)
      .join(' ')
      .replace(/^(i want to|i need to|i should|i want|i have|a|an|the)\s+/i, '')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') || 'Untitled Pulse'

  return {
    type,
    interpretation,
    suggestedName,
  }
}

const typeConfig: Record<
  NodeType,
  { icon: string; label: string; color: string }
> = {
  goal: {
    icon: 'flag',
    label: 'Goal',
    color: 'text-gp-goal',
  },
  resource: {
    icon: 'diamond',
    label: 'Resource',
    color: 'text-gp-resource',
  },
  story: {
    icon: 'auto_stories',
    label: 'Story',
    color: 'text-gp-story',
  },
}

export function PulseTypeSuggestion({
  input,
  onSelect,
  onClose,
  isOpen,
}: PulseTypeSuggestionProps) {
  const [selectedType, setSelectedType] = useState<NodeType>('goal')
  const [pulseData, setPulseData] = useState({
    type: 'goal' as NodeType,
    interpretation: '',
    suggestedName: '',
  })
  const [editedName, setEditedName] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Infer pulse type when input changes
  useEffect(() => {
    if (input.trim()) {
      const inference = inferPulseType(input)
      setPulseData(inference)
      setSelectedType(inference.type)
      setEditedName(inference.suggestedName)
    }
  }, [input])

  // Animate in
  useEffect(() => {
    if (isOpen && containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        {
          opacity: 0,
          scale: 0.95,
          y: 20,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.4,
          ease: 'power3.out',
        }
      )
    }
  }, [isOpen])

  const handleRegenerateType = () => {
    const newType =
      selectedType === 'goal'
        ? 'resource'
        : selectedType === 'resource'
          ? 'story'
          : 'goal'
    setSelectedType(newType)
  }

  const handleConfirm = () => {
    console.log('🎯 handleConfirm called:', { selectedType, editedName })
    console.log('📤 Calling onSelect with:', { selectedType, editedName })
    onSelect(selectedType, editedName)
    onClose()
  }

  if (!isOpen) return null

  const config = typeConfig[selectedType]

  return (
    <div
      ref={containerRef}
      className="w-full max-w-lg rounded-3xl overflow-hidden flex flex-col items-center bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.9),rgba(232,241,252,0.92))] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.9),rgba(232,241,252,0.92))] backdrop-blur-2xl border border-white/70 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.45)]"
    >
      {/* Gradient blobs */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#9fd6ff]/35 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#b6cffc]/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full p-8 flex flex-col items-center">
        {/* Icon Section */}
        <div
          className="relative mb-8 group cursor-pointer"
          onClick={handleRegenerateType}
        >
          <div className="absolute inset-0 bg-gp-primary/20 rounded-full blur-xl scale-150 animate-pulse-slow" />
          <div className="relative size-24 flex items-center justify-center rounded-2xl bg-linear-to-br from-white/90 to-[#e3f1ff] border border-white/70 shadow-[0_25px_45px_-18px_rgba(19,164,236,0.45)] ring-1 ring-white/70 group-hover:scale-105 transition-transform duration-500">
            <span
              className={cn(
                'material-symbols-outlined text-[48px] drop-shadow-[0_0_15px_rgba(19,164,236,0.6)]',
                config.color
              )}
            >
              {config.icon}
            </span>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white dark:bg-black border border-slate-200 dark:border-white/20 p-1.5 rounded-full text-gp-primary shadow-lg transition-opacity opacity-0 group-hover:opacity-100">
            <span className="material-symbols-outlined text-[18px] animate-spin-slow">
              auto_awesome
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <div
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 shadow-sm bg-[#d7ecff] text-[#1187e8] border border-white/70'
            )}
          >
            <span className="material-symbols-outlined text-sm">
              auto_awesome
            </span>
            AI Classified
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {config.label} Pulse
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-500 font-medium">
            GoalPost AI has analyzed your input.
          </p>
        </div>

        {/* Input and Interpretation */}
        <div className="w-full space-y-4 mb-8">
          {/* Name Input */}
          <div className="group relative rounded-xl overflow-hidden bg-[#e6edf5] border border-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_25px_-18px_rgba(0,0,0,0.45)]">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7b8895] pointer-events-none group-focus-within:text-gp-primary transition-colors">
              <span className="material-symbols-outlined text-xl">edit</span>
            </div>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full bg-transparent border-none py-4 pl-12 pr-12 text-center text-lg font-semibold text-[#1f2a36] placeholder-[#7b8895] focus:ring-0 selection:bg-gp-primary/20"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <button
                onClick={() => setEditedName('')}
                className="cursor-pointer p-1.5 rounded-full hover:bg-white/80 text-[#9aa6b2] hover:text-[#1f2a36] transition-colors"
                title="Clear"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
          </div>

          {/* Interpretation */}
          <div className="text-left bg-linear-to-r from-[#d7ecff]/90 to-transparent border-l-2 border-[#1187e8] rounded-r-xl p-4 flex gap-3">
            <div className="mt-0.5 shrink-0">
              <span className="material-symbols-outlined text-gp-primary text-lg">
                psychology_alt
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-[#1187e8] block mb-1">
                AI Interpretation:
              </span>
              {pulseData.interpretation}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full gap-3">
          <button
            onClick={handleRegenerateType}
            className="cursor-pointer flex-1 h-12 rounded-xl border border-[#2c3a46] bg-[#101820] text-[#8fa9bf] text-sm font-semibold transition-all flex items-center justify-center gap-2 group hover:border-[#1f8bff] hover:text-white hover:bg-[#162230]"
          >
            <span className="material-symbols-outlined text-lg group-hover:-rotate-12 transition-transform">
              tune
            </span>
            Refine Type
          </button>
          <button
            onClick={handleConfirm}
            className="cursor-pointer flex-1 h-12 rounded-xl bg-[#1a9bff] hover:bg-[#1386dc] text-white text-sm font-bold shadow-[0_18px_35px_-12px_rgba(26,155,255,0.55)] transition-all flex items-center justify-center gap-2 transform active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">check</span>
            Create Pulse
          </button>
        </div>
      </div>

      {/* Bottom divider */}
      <div className="h-1 w-full bg-white/40">
        <div className="h-full w-full bg-linear-to-r from-transparent via-[#0f8bf6] to-transparent opacity-60 animate-pulse" />
      </div>
    </div>
  )
}
