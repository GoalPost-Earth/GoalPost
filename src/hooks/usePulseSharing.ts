import { useMutation, useQuery } from '@apollo/client/react'
import {
  SHARE_PULSE_WITH_CONTEXT_MUTATION,
  REMOVE_PULSE_FROM_CONTEXT_MUTATION,
  GET_CONTEXT_RESONANCES_QUERY,
} from '@/app/graphql/mutations/PULSE_MUTATIONS'

interface ShareResult {
  success: boolean
  error?: string
}

interface RemoveResult {
  success: boolean
  error?: string
}

interface ResonanceData {
  fieldContexts: Array<{
    id: string
    title: string
    pulses: Array<{ id: string; title: string }>
    resonances: Array<{
      id: string
      label: string
      description: string | null
      confidence: number
      evidence: string | null
      createdAt: string
      source: {
        id: string
        title: string
        content: string
      }
      target: {
        id: string
        title: string
        content: string
      }
    }>
  }>
}

export function usePulseSharing() {
  const [sharePulse, { loading: sharingLoading, error: sharingError }] =
    useMutation(SHARE_PULSE_WITH_CONTEXT_MUTATION, {
      onError: (error) => console.error('Failed to share pulse:', error),
    })

  const [removePulse, { loading: removingLoading, error: removingError }] =
    useMutation(REMOVE_PULSE_FROM_CONTEXT_MUTATION, {
      onError: (error) => console.error('Failed to remove pulse:', error),
    })

  const {
    data: resonanceData,
    loading: resonancesLoading,
    refetch: refetchResonances,
  } = useQuery<ResonanceData>(GET_CONTEXT_RESONANCES_QUERY, {
    skip: true, // Only fetch when context ID is provided
  })

  const sharePulseWithContext = async (
    pulseId: string,
    contextId: string
  ): Promise<ShareResult> => {
    try {
      const result = await sharePulse({
        variables: { pulseId, contextId },
      })
      if (result.error) {
        return { success: false, error: result.error?.message }
      }
      return { success: true }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  const removePulseFromContext = async (
    pulseId: string,
    contextId: string
  ): Promise<RemoveResult> => {
    try {
      const result = await removePulse({
        variables: { pulseId, contextId },
      })
      if (result.error) {
        return { success: false, error: result.error?.message }
      }
      return { success: true }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  const getContextResonances = async (contextId: string) => {
    return refetchResonances({ contextId })
  }

  return {
    sharePulseWithContext,
    removePulseFromContext,
    getContextResonances,
    resonances: resonanceData?.fieldContexts[0]?.resonances ?? [],
    loading: sharingLoading || removingLoading || resonancesLoading,
    error: sharingError || removingError,
  }
}
