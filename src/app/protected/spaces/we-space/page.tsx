'use client'

import { useRouter } from 'next/navigation'
import { EntityBubble } from '@/components/ui/entity-bubble'
import { cn } from '@/lib/utils'

const weSpaces = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    size: 'xl' as const,
    shape: 'circle' as const,
    icon: 'hub',
    title: 'Community Hub',
    subtitle: 'Central gathering space',
    badge: { text: '24 Active', variant: 'primary' as const },
    decorators: [
      {
        icon: 'forum',
        position: 'top-left' as const,
        animate: 'float' as const,
      },
      {
        icon: 'handshake',
        position: 'bottom-right' as const,
        animate: 'bounce' as const,
      },
    ],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    size: 'lg' as const,
    shape: 'organic-1' as const,
    icon: 'groups',
    title: 'Creators Circle',
    subtitle: 'Design & Development',
    badge: { text: '12 Members', variant: 'accent' as const },
    decorators: [
      {
        icon: 'palette',
        position: 'top-right' as const,
        animate: 'pulse' as const,
      },
    ],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    size: 'md' as const,
    shape: 'organic-2' as const,
    icon: 'self_improvement',
    title: 'Wellness Collective',
    subtitle: 'Mind, Body, Spirit',
    decorators: [
      {
        icon: 'spa',
        position: 'bottom-left' as const,
        animate: 'float' as const,
      },
      {
        icon: 'favorite',
        position: 'top-right' as const,
        animate: 'pulse' as const,
      },
    ],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    size: 'lg' as const,
    shape: 'organic-3' as const,
    icon: 'school',
    title: 'Learning Lab',
    subtitle: 'Knowledge sharing',
    badge: { text: '8 Courses', variant: 'default' as const },
    decorators: [
      {
        icon: 'menu_book',
        position: 'top-left' as const,
        animate: 'bounce' as const,
      },
    ],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    size: 'md' as const,
    shape: 'circle' as const,
    icon: 'eco',
    title: 'Sustainability Squad',
    subtitle: 'Environmental action',
    decorators: [
      {
        icon: 'nature',
        position: 'bottom-right' as const,
        animate: 'float' as const,
      },
    ],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    size: 'sm' as const,
    shape: 'organic-1' as const,
    icon: 'music_note',
    title: 'Music & Arts',
    subtitle: 'Creative expression',
    badge: { text: 'New', variant: 'accent' as const },
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    size: 'md' as const,
    shape: 'organic-2' as const,
    icon: 'fitness_center',
    title: 'Fitness Friends',
    subtitle: 'Health & Movement',
    decorators: [
      {
        icon: 'directions_run',
        position: 'top-right' as const,
        animate: 'bounce' as const,
      },
    ],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    size: 'sm' as const,
    shape: 'circle' as const,
    icon: 'restaurant',
    title: 'Foodie Network',
    subtitle: 'Culinary adventures',
  },
]

const positions = [
  'top-[10%] left-[50%] -translate-x-1/2',
  'top-[25%] left-[15%]',
  'top-[20%] right-[18%]',
  'top-[50%] left-[8%]',
  'top-[45%] right-[12%]',
  'bottom-[25%] left-[20%]',
  'bottom-[20%] right-[25%]',
  'bottom-[35%] left-[50%] -translate-x-1/2',
]

export default function WeSpacePage() {
  const router = useRouter()

  const handleSpaceClick = (spaceId: string) => {
    router.push(`/protected/spaces/we-space/${spaceId}`)
  }

  return (
    <main className="relative flex-1 w-full h-full min-h-screen overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors">
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(19,127,236,0.08),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(19,127,236,0.15),transparent_70%)]" />

      {/* Animated background blobs */}
      <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-gp-primary/10 dark:bg-gp-primary/5 rounded-full blur-[100px] animate-blob" />
      <div className="absolute bottom-[20%] right-[20%] w-80 h-80 bg-gp-accent-glow/10 dark:bg-gp-accent-glow/5 rounded-full blur-[80px] animate-blob [animation-delay:2s]" />
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gp-goal/5 dark:bg-gp-goal/3 rounded-full blur-[80px] animate-blob [animation-delay:4s]" />

      {/* Dot grid pattern */}
      <div className="absolute inset-0 gp-dot-grid opacity-30 dark:opacity-20" />

      {/* We-Space Bubbles Container */}
      <div className="absolute inset-0 overflow-hidden pt-24 pb-24">
        {weSpaces.map((space, idx) => (
          <div
            key={space.id}
            className={cn('absolute', positions[idx % positions.length])}
          >
            <EntityBubble
              {...space}
              animationDelay={idx * 0.15}
              onClick={() => handleSpaceClick(space.id)}
            />
          </div>
        ))}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
        {/* View Controls */}
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
            title="Filter Spaces"
          >
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>

        {/* Create New Space Button */}
        <button className="cursor-pointer flex items-center gap-2 md:gap-3 px-4 md:px-6 h-10 md:h-12 rounded-full gp-glass dark:gp-glass border border-white/10 dark:border-white/10 hover:scale-105 hover:border-white/20 dark:hover:border-white/20 hover:bg-white/10 dark:hover:bg-white/20 hover:shadow-[0_0_50px_rgba(19,127,236,0.2)] transition-all duration-300 group">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gp-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="material-symbols-outlined text-gp-ink-muted dark:text-gp-ink-soft group-hover:text-gp-primary dark:group-hover:text-gp-primary text-[20px] md:text-[24px] transition-colors relative z-10">
            add_circle
          </span>
          <span className="hidden md:inline text-sm md:text-base font-semibold text-gp-ink-strong dark:text-gp-ink-strong group-hover:text-gp-primary dark:group-hover:text-gp-primary transition-colors relative z-10">
            Create WeSpace
          </span>
        </button>
      </div>
    </main>
  )
}
