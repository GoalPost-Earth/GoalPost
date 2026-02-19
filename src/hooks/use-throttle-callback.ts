import { useCallback, useRef } from 'react'

/**
 * Throttles a callback to run at most once per specified delay.
 * Useful for expensive operations like collision detection during drag events.
 *
 * @param callback - The function to throttle
 * @param delay - Minimum time between calls in milliseconds
 * @returns Throttled version of the callback
 */

//eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useThrottleCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRunRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastArgsRef = useRef<Parameters<T> | null>(null)

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now()
      lastArgsRef.current = args

      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      // If enough time has passed, execute immediately
      if (now - lastRunRef.current >= delay) {
        lastRunRef.current = now
        callback(...args)
      } else {
        // Otherwise, schedule execution for the remaining time
        const remaining = delay - (now - lastRunRef.current)
        timeoutRef.current = setTimeout(() => {
          lastRunRef.current = Date.now()
          if (lastArgsRef.current) {
            callback(...lastArgsRef.current)
          }
        }, remaining)
      }
    }) as T,
    [callback, delay]
  )
}
