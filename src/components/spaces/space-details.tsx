'use client'

import { useState } from 'react'
import { useSpacePermissions } from '@/hooks/use-space-permissions'
import { SpacePermissionsModal } from './space-permissions-modal'

interface SpaceMember {
  id: string
  role: 'ADMIN' | 'MEMBER' | 'GUEST'
  addedAt?: string | Date
  member: {
    __typename: string
    id: string
    name: string
    email?: string
  }
}

interface SpaceDetailsProps {
  spaceId: string
  spaceName: string
  members?: SpaceMember[]
  isOwner?: boolean
  onRefetch?: () => Promise<void>
}

export function SpaceDetails({
  spaceId,
  spaceName,
  members = [],
  isOwner = false,
  onRefetch,
}: SpaceDetailsProps) {
  const [showPermissions, setShowPermissions] = useState(false)
  const { refetch } = useSpacePermissions(members, false)

  const handleMembersUpdated = () => {
    refetch()
  }

  if (!isOwner) {
    return null
  }

  return (
    <>
      {/* Space Settings Button */}
      <button
        onClick={() => setShowPermissions(true)}
        className="cursor-pointer flex items-center gap-2 md:gap-3 px-4 md:px-6 h-10 md:h-14.5 rounded-full gp-glass dark:gp-glass border border-white/10 dark:border-white/10 hover:scale-105 hover:border-white/20 dark:hover:border-white/20 hover:bg-white/10 dark:hover:bg-white/20 transition-all duration-300 group"
        style={{
          boxShadow: 'none',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
            `0 0 50px color-mix(in srgb, var(--gp-primary) 50%, transparent)`
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
        }}
        title="Manage space permissions"
      >
        <div className="absolute inset-0 rounded-full bg-linear-to-tr from-gp-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="material-symbols-outlined text-gp-ink-muted dark:text-gp-ink-soft group-hover:text-gp-primary dark:group-hover:text-gp-primary text-[20px] md:text-[24px] transition-colors relative z-10">
          admin_panel_settings
        </span>
        <span className="hidden lg:inline text-sm md:text-base font-semibold text-gp-ink-strong dark:text-gp-ink-strong group-hover:text-gp-primary dark:group-hover:text-gp-primary transition-colors relative z-10">
          Permissions
        </span>
      </button>

      {/* Permissions Modal */}
      <SpacePermissionsModal
        isOpen={showPermissions}
        onClose={() => setShowPermissions(false)}
        spaceId={spaceId}
        spaceName={spaceName}
        members={members}
        onMembersUpdated={handleMembersUpdated}
        onRefetch={onRefetch}
      />
    </>
  )
}
