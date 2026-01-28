import { useState, useCallback } from 'react'

export interface SpaceMember {
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

export interface UseSpacePermissionsReturn {
  members: SpaceMember[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useSpacePermissions(
  members: SpaceMember[] = [],
  loading: boolean = false
): UseSpacePermissionsReturn {
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(() => {
    // Refetch is handled by the parent component
    setError(null)
  }, [])

  return {
    members,
    loading,
    error,
    refetch,
  }
}
