import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'

interface Suggestion {
  id: string
  label: string
  description: string
  confidence: number
  evidence: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: string
  sourcePulseId: string
  sourcePulseContent: string
  targetPulseId: string
  targetPulseContent: string
  contextId: string
  contextTitle: string
}

interface UseResonanceSuggestionsOptions {
  spaceId: string
  filter?: 'pending' | 'accepted' | 'declined' | 'all'
  enabled?: boolean
  autoRefetch?: boolean
}

export function useResonanceSuggestions(
  options: UseResonanceSuggestionsOptions
) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSuggestions = useCallback(async () => {
    if (!options.spaceId) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        spaceId: options.spaceId,
      })

      if (options.filter && options.filter !== 'all') {
        params.append('status', options.filter)
      }

      const response = await fetch(
        `/api/resonance/suggestions?${params.toString()}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch suggestions')
      }

      const data = await response.json()
      setSuggestions(data.suggestions || [])
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('[useResonanceSuggestions] Error:', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [options.spaceId, options.filter])

  // Auto-fetch on mount and when options change
  useEffect(() => {
    if (options.enabled !== false) {
      fetchSuggestions()
    }
  }, [fetchSuggestions, options.enabled])

  const acceptSuggestion = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(
          `/api/resonance/suggestions/${id}/accept`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to accept suggestion')
        }

        toast.success('✨ Suggestion accepted and created!')

        // Refetch suggestions to update status
        await fetchSuggestions()
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred'
        toast.error(`Failed to accept suggestion: ${errorMessage}`)
        throw err
      }
    },
    [fetchSuggestions]
  )

  const declineSuggestion = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(
          `/api/resonance/suggestions/${id}/decline`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to decline suggestion')
        }

        toast.success('Suggestion declined.')

        // Refetch suggestions to update status
        await fetchSuggestions()
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred'
        toast.error(`Failed to decline suggestion: ${errorMessage}`)
        throw err
      }
    },
    [fetchSuggestions]
  )

  return {
    suggestions,
    loading,
    error,
    refetch: fetchSuggestions,
    acceptSuggestion,
    declineSuggestion,
  }
}
