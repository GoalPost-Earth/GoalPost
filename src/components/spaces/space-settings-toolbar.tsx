'use client'

import { SpaceDetails } from './space-details'

interface SpaceSettingsToolbarProps {
  spaceId: string
  spaceName: string
  isOwner?: boolean
  members?: Array<{
    id: string
    role: 'ADMIN' | 'MEMBER' | 'GUEST'
    member: {
      __typename: string
      id: string
      name: string
      email?: string
    }
  }>
  onRefetch?: () => Promise<void>
}

export function SpaceSettingsToolbar({
  spaceId,
  spaceName,
  isOwner = false,
  members = [],
  onRefetch,
}: SpaceSettingsToolbarProps) {
  return (
    <SpaceDetails
      spaceId={spaceId}
      spaceName={spaceName}
      members={members}
      isOwner={isOwner}
      onRefetch={onRefetch}
    />
  )
}
