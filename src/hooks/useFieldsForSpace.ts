import { useQuery } from '@apollo/client/react'
import { GET_FIELDS_FOR_SPACE } from '@/app/graphql/queries'

/**
 * Hook to fetch fields for a specific WeSpace
 * @param spaceId - The WeSpace ID to fetch fields for
 */
export function useFieldsForSpace(spaceId?: string) {
  const { data, loading, error, refetch } = useQuery(GET_FIELDS_FOR_SPACE, {
    variables: { spaceId: spaceId || '' },
    skip: !spaceId, // Skip query if no spaceId provided
  })

  return {
    fields: data?.fieldContexts || [],
    loading,
    error,
    refetch,
  }
}
