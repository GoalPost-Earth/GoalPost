import { useQuery } from '@apollo/client/react'
import { GET_ME_SPACE_FIELDS } from '@/app/graphql/queries'

/**
 * Hook to fetch fields for the current user's MeSpace
 * @param userId - The authenticated user's ID (required to fetch their MeSpace)
 */
export function useMeSpaceFields(userId?: string) {
  const { data, loading, error, refetch } = useQuery(GET_ME_SPACE_FIELDS, {
    skip: !userId, // Skip query if no userId provided
  })

  // Filter meSpaces to find the one owned by the current user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meSpace = data?.meSpaces?.find((space: any) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    space.owner?.some((owner: any) => owner.id === userId)
  )

  return {
    fields: meSpace?.contexts || [],
    meSpaceId: meSpace?.id,
    loading,
    error,
    refetch,
  }
}
