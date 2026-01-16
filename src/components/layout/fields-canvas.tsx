'use client'

import {
  FieldBubble,
  type FieldBubbleProps,
} from '@/components/ui/field-bubble'
import { cn } from '@/lib/utils'
import { useRef, useState } from 'react'
import { CreateFieldModal } from '@/components/canvas/create-field-modal'

export interface FieldsCanvasProps {
  fields?: (Omit<
    FieldBubbleProps,
    'position' | 'size' | 'shape' | 'animationType'
  > & { id?: string })[]
  onFieldClick?: (fieldId: string) => void
  onCreateField?: (description: string) => void | Promise<void>
  className?: string
  spaceId?: string // Optional space ID to link new fields to
  isCreating?: boolean // Loading state for field creation
  isLoading?: boolean // Loading state for fetching fields
}

// Default fields data structure
const defaultFields = [
  {
    id: 'deep-work',
    icon: 'psychology',
    title: 'Deep Work',
    description: '5 active threads',
    badge: { text: '5 Active', variant: 'primary' as const },
    decorators: [
      {
        icon: 'menu_book',
        position: 'top-left' as const,
        opacity: 'opacity-40' as const,
        animate: 'float' as const,
      },
      {
        icon: 'code',
        position: 'bottom-right' as const,
        opacity: 'opacity-40' as const,
        animate: 'float' as const,
      },
    ],
  },
  {
    id: 'growth',
    icon: 'self_improvement',
    title: 'Growth',
    description: 'Shared intentions with WeSpace neighbors',
    members: [
      {
        initials: 'S',
        color:
          'bg-white/10 dark:bg-white/10 text-gp-ink-strong dark:text-gp-ink-soft',
      },
      {
        initials: 'M',
        color:
          'bg-white/10 dark:bg-white/10 text-gp-ink-strong dark:text-gp-ink-soft',
      },
    ],
    decorators: [
      {
        icon: 'spa',
        position: 'bottom-left' as const,
        opacity: 'opacity-30' as const,
      },
    ],
  },
  {
    id: 'community',
    icon: 'hub',
    title: 'Community',
    description: 'Shared intentions with WeSpace neighbors',
    decorators: [
      {
        icon: 'forum',
        position: 'top-left' as const,
        opacity: 'opacity-20' as const,
        animate: 'bounce' as const,
      },
      {
        icon: 'handshake',
        position: 'bottom-right' as const,
        opacity: 'opacity-20' as const,
        animate: 'bounce' as const,
      },
      {
        icon: 'groups',
        position: 'top-right' as const,
        opacity: 'opacity-10' as const,
        animate: 'pulse' as const,
      },
    ],
  },
  {
    id: 'inbox',
    icon: 'inbox',
    title: 'Inbox',
    description: '',
    badge: { text: '12 New', variant: 'primary' as const },
  },
  {
    id: 'vitality',
    icon: 'monitor_heart',
    title: 'Vitality',
    description: '',
  },
]

export function FieldsCanvas({
  fields = defaultFields,
  onFieldClick,
  onCreateField,
  className,
  isCreating = false,
}: FieldsCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const handleCreateField = async (description: string) => {
    try {
      await onCreateField?.(description)
      setIsCreateModalOpen(false)
    } catch (err) {
      console.error('Failed to create field:', err)
      // TODO: Show error toast/notification to user
    }
  }

  // Position variations for the bubbles
  const positions: Array<FieldBubbleProps['position']> = [
    'center',
    'top-left',
    'top-right',
    'bottom-right',
    'bottom-left',
    'top-center',
    'right-center',
    'left-center',
  ]

  const sizes: Array<FieldBubbleProps['size']> = [
    'xl',
    'lg',
    'md',
    'md',
    'sm',
    'md',
    'md',
    'md',
  ]
  const shapes: Array<FieldBubbleProps['shape']> = [
    'circle',
    'organic-1',
    'organic-2',
    'organic-3',
    'circle',
    'organic-2',
    'organic-1',
    'circle',
  ]
  const animations: Array<FieldBubbleProps['animationType']> = [
    'none',
    'float-delayed',
    'float-slow',
    'float',
    'float-delayed',
    'float',
    'float-slow',
    'float-delayed',
  ]

  return (
    <main
      ref={canvasRef}
      className={cn(
        'relative flex-1 w-full h-full overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors',
        className
      )}
    >
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(19,127,236,0.08),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(19,127,236,0.15),transparent_70%)]" />

      {/* Animated background blobs */}
      <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-gp-primary/10 dark:bg-gp-primary/5 rounded-full blur-[100px] animate-blob" />
      <div className="absolute bottom-[20%] right-[20%] w-80 h-80 bg-gp-accent-glow/10 dark:bg-gp-accent-glow/5 rounded-full blur-[80px] animate-blob [animation-delay:2s]" />
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-75 h-75 bg-gp-goal/5 dark:bg-gp-goal/3 rounded-full blur-[80px] animate-blob [animation-delay:4s]" />

      {/* Dot grid pattern */}
      <div className="absolute inset-0 gp-dot-grid opacity-30 dark:opacity-20" />

      {/* Bubbles Container */}
      <div className="absolute inset-0 overflow-hidden">
        {fields.map((field, idx) => (
          <FieldBubble
            key={idx}
            {...field}
            position={positions[idx % positions.length]}
            size={sizes[idx % sizes.length]}
            shape={shapes[idx % shapes.length]}
            animationType={animations[idx % animations.length]}
            onClick={() => onFieldClick?.(field.id || field.title || '')}
          />
        ))}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
        {/* Zoom and Filter Controls */}
        <div className="flex items-center gap-2 p-1.5 rounded-full gp-glass dark:gp-glass shadow-xl">
          <button
            className="cursor-pointer size-9 md:size-10 flex items-center justify-center rounded-full text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-ink-strong dark:hover:text-gp-ink-strong hover:bg-white/10 dark:hover:bg-white/20 transition-all"
            title="Zoom Out"
          >
            <span className="material-symbols-outlined">remove</span>
          </button>
          <div className="w-px h-4 bg-gp-ink-soft/20 dark:bg-white/10" />
          <button
            className="cursor-pointer size-9 md:size-10 flex items-center justify-center rounded-full text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-ink-strong dark:hover:text-gp-ink-strong hover:bg-white/10 dark:hover:bg-white/20 transition-all"
            title="Zoom In"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
          <div className="w-px h-4 bg-gp-ink-soft/20 dark:bg-white/10" />
          <button
            className="cursor-pointer size-9 md:size-10 flex items-center justify-center rounded-full text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-ink-strong dark:hover:text-gp-ink-strong hover:bg-white/10 dark:hover:bg-white/20 transition-all"
            title="Filter Fields"
          >
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>

        {/* Add New Field Button */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="cursor-pointer flex items-center gap-2 md:gap-3 px-4 md:px-6 h-10 md:h-14.5 rounded-full gp-glass dark:gp-glass border border-white/10 dark:border-white/10 hover:scale-105 hover:border-white/20 dark:hover:border-white/20 hover:bg-white/10 dark:hover:bg-white/20 hover:shadow-[0_0_50px_rgba(19,127,236,0.2)] transition-all duration-300 group"
        >
          <div className="absolute inset-0 rounded-full bg-linear-to-tr from-gp-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="material-symbols-outlined text-gp-ink-muted dark:text-gp-ink-soft group-hover:text-gp-primary dark:group-hover:text-gp-primary text-[20px] md:text-[24px] transition-colors relative z-10">
            add_circle
          </span>
          <span className="hidden md:inline text-sm md:text-base font-semibold text-gp-ink-strong dark:text-gp-ink-strong group-hover:text-gp-primary dark:group-hover:text-gp-primary transition-colors relative z-10">
            Add New Field
          </span>
        </button>
      </div>

      {/* Create Field Modal */}
      <CreateFieldModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateField={handleCreateField}
        isLoading={isCreating}
      />
    </main>
  )
}
