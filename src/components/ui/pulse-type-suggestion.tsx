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
    onSelect(selectedType, editedName)
    onClose()
  }

  if (!isOpen) return null

  const config = typeConfig[selectedType]

  return (
    <div
      ref={containerRef}
      className="w-full max-w-lg glass-panel rounded-3xl overflow-hidden flex flex-col items-center bg-white/90 dark:bg-glass-bg/30 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.02)] dark:shadow-2xl"
    >
      {/* Gradient blobs */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-gp-primary/15 dark:bg-gp-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full p-8 flex flex-col items-center">
        {/* Icon Section */}
        <div
          className="relative mb-8 group cursor-pointer"
          onClick={handleRegenerateType}
        >
          <div className="absolute inset-0 bg-gp-primary/20 rounded-full blur-xl scale-150 animate-pulse-slow" />
          <div className="relative size-24 flex items-center justify-center rounded-2xl bg-linear-to-br from-white/80 dark:from-white/10 to-white/40 dark:to-white/5 border border-white dark:border-white/10 shadow-[0_0_30px_-5px_rgba(19,164,236,0.3)] ring-1 ring-white/20 dark:ring-white/5 group-hover:scale-105 transition-transform duration-500">
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
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2',
              selectedType === 'goal' &&
                'bg-gp-goal/10 dark:bg-gp-goal/20 border border-gp-goal/30 text-gp-goal',
              selectedType === 'resource' &&
                'bg-gp-resource/10 dark:bg-gp-resource/20 border border-gp-resource/30 text-gp-resource',
              selectedType === 'story' &&
                'bg-gp-story/10 dark:bg-gp-story/20 border border-gp-story/30 text-gp-story'
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
          <p className="text-sm text-slate-600 dark:text-blue-200/60 font-medium">
            GoalPost AI has analyzed your input.
          </p>
        </div>

        {/* Input and Interpretation */}
        <div className="w-full space-y-4 mb-8">
          {/* Name Input */}
          <div className="group relative rounded-xl glass-input overflow-hidden bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 pointer-events-none group-focus-within:text-gp-primary transition-colors">
              <span className="material-symbols-outlined text-xl">edit</span>
            </div>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full bg-transparent border-none py-4 pl-12 pr-12 text-center text-lg font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:ring-0 selection:bg-gp-primary/30"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <button
                onClick={() => setEditedName('')}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 dark:text-white/60 hover:text-slate-600 dark:hover:text-white transition-colors"
                title="Clear"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
          </div>

          {/* Interpretation */}
          <div className="text-left bg-linear-to-r from-gp-primary/5 dark:from-gp-primary/10 to-transparent border-l-2 border-gp-primary rounded-r-xl p-4 flex gap-3">
            <div className="mt-0.5 shrink-0">
              <span className="material-symbols-outlined text-gp-primary text-lg">
                psychology_alt
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-blue-100/80 leading-relaxed">
              <span className="font-bold text-gp-primary dark:text-gp-primary/90 block mb-1">
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
            className="flex-1 h-12 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 group"
          >
            <span className="material-symbols-outlined text-lg group-hover:-rotate-12 transition-transform">
              tune
            </span>
            Refine Type
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 h-12 rounded-xl bg-gp-primary hover:bg-gp-primary/90 text-white text-sm font-bold shadow-[0_0_20px_-5px_rgba(19,164,236,0.5)] hover:shadow-[0_0_30px_-5px_rgba(19,164,236,0.7)] transition-all flex items-center justify-center gap-2 transform active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">check</span>
            Create Pulse
          </button>
        </div>
      </div>

      {/* Bottom divider */}
      <div className="h-1 w-full bg-white/5 dark:bg-white/5">
        <div className="h-full w-full bg-linear-to-r from-transparent via-gp-primary to-transparent opacity-50 animate-pulse" />
      </div>
    </div>
  )
}
