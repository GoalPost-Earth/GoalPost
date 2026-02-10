'use client'

import { SpaceDetails } from './space-details'

interface SpaceSettingsToolbarProps {
  spaceId: string
  spaceName: string
  isWeSpace?: boolean
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
  isWeSpace = false,
  isOwner = false,
  members = [],
  onRefetch,
}: SpaceSettingsToolbarProps) {
  return (
    <SpaceDetails
      spaceId={spaceId}
      spaceName={spaceName}
      isWeSpace={isWeSpace}
      members={members}
      isOwner={isOwner}
      onRefetch={onRefetch}
    />
  )
}
