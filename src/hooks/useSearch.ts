import { useQuery } from '@apollo/client'
import { GET_MATCHING_ENTITIES } from '@/app/graphql/queries'
import useDebounce from '@/hooks/useDebounce'

export default function useSearch({
  searchTerm,
}: Readonly<{ searchTerm: string }>) {
  const debouncedTerm = useDebounce(searchTerm, 300)

  const { data, loading } = useQuery(GET_MATCHING_ENTITIES, {
    variables: { key: debouncedTerm },
    skip: !debouncedTerm,
  })

  const returnedEntities = data

  const returnedCarePoints = returnedEntities?.carePointSubstringSearch ?? []
  const returnedCommunities = returnedEntities?.communitySubstringSearch ?? []
  const returnedCoreValues = returnedEntities?.coreValueSubstringSearch ?? []
  const returnedPeople = returnedEntities?.peopleSubstringSearch ?? []
  const returnedResources = returnedEntities?.resourceSubstringSearch ?? []
  const returnedGoals = returnedEntities?.goalSubstringSearch ?? []

  return {
    loading,
    returnedCarePoints,
    returnedCommunities,
    returnedCoreValues,
    returnedPeople,
    returnedResources,
    returnedGoals,
  }
}
