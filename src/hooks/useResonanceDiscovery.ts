import { useState, useCallback } from 'react'
import { toast } from 'sonner'

interface UseResonanceDiscoveryOptions {
  spaceId?: string
  fieldContextId?: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function useResonanceDiscovery(
  options: UseResonanceDiscoveryOptions = {}
) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const triggerDiscovery = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const toastId = toast.loading(
      '🔍 Discovering resonances across your pulses...'
    )

    try {
      const payload: Record<string, string | undefined> = {}

      if (options.spaceId) {
        payload.spaceId = options.spaceId
      }
      // Note: fieldContextId could be added to the payload if needed
      // For now, spaceId is the main scope

      const response = await fetch('/api/resonance/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || 'Failed to trigger resonance discovery'
        )
      }

      const data = await response.json()

      toast.dismiss(toastId)
      toast.success(
        `✨ Discovered ${data.suggestionsCreated} resonance${
          data.suggestionsCreated !== 1 ? 's' : ''
        }! Review them now.`,
        { duration: 5000 }
      )

      options.onSuccess?.()
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)

      toast.dismiss(toastId)
      toast.error(`Failed to discover resonances: ${errorMessage}`)

      options.onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [options])

  return { triggerDiscovery, isLoading, error }
}
