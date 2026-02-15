'use client'

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react'
import { useRouter, usePathname } from 'next/navigation'

export interface OnboardingStep {
  id: string
  title: string
  description: string
  page: string // route path
  selector?: string // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  actionLabel?: string
}

interface OnboardingContextType {
  isOnboarding: boolean
  currentStepIndex: number
  currentStep: OnboardingStep | null
  completedSteps: string[]
  isCompleted: boolean
  isElementReady: boolean
  steps: OnboardingStep[]
  nextStep: () => void
  previousStep: () => void
  skipTour: () => void
  markComplete: () => void
  setCurrentStep: (index: number) => void
  resumeTour: () => void
  restartTour: () => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
)

/**
 * Helper function to fetch access token and call the onboarding API
 */
async function callOnboardingAPI(
  method: 'GET' | 'POST',
  body?: Record<string, unknown>
) {
  try {
    // Fetch access token
    const tokenResponse = await fetch('/api/auth/access-token')
    let tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      // Try refreshing the token
      const refreshResponse = await fetch('/api/auth/refresh-token')
      const refreshData = await refreshResponse.json()
      if (refreshResponse.ok && refreshData.accessToken) {
        tokenData = refreshData
      } else {
        console.warn(
          'Failed to obtain access token, skipping API call',
          refreshData
        )
        return null // Return null instead of throwing
      }
    }

    const accessToken = tokenData.accessToken
    if (!accessToken) {
      console.warn('No access token available, skipping API call')
      return null // Return null if no token
    }

    // Call onboarding API with token
    const apiResponse = await fetch('/api/user/onboarding', {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      ...(body && { body: JSON.stringify(body) }),
    })

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json()
      console.warn('Onboarding API error:', errorData.error)
      return null // Return null on API error
    }

    return await apiResponse.json()
  } catch (error) {
    console.warn('Error calling onboarding API:', error)
    return null // Return null instead of throwing
  }
}

export function OnboardingProvider({
  children,
  steps,
}: {
  children: React.ReactNode
  steps: OnboardingStep[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [isOnboarding, setIsOnboarding] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isElementReady, setIsElementReady] = useState(false)

  // Initialize onboarding state from database
  useEffect(() => {
    if (typeof window === 'undefined') return

    const initializeOnboarding = async () => {
      try {
        const progress = await callOnboardingAPI('GET')

        // If API call failed, fall back to localStorage
        if (!progress) {
          throw new Error('API unavailable')
        }

        if (progress.onboardingIsCompleted) {
          setIsCompleted(true)
          setIsOnboarding(false)
          return
        }

        // If user has partial progress, resume from there
        if (
          progress.onboardingCompletedSteps &&
          progress.onboardingCompletedSteps.length > 0
        ) {
          setCompletedSteps(progress.onboardingCompletedSteps)
          const nextIndex = steps.findIndex(
            (step) => !progress.onboardingCompletedSteps.includes(step.id)
          )
          setCurrentStepIndex(nextIndex >= 0 ? nextIndex : 0)
          setIsOnboarding(!progress.onboardingIsCompleted)
        } else {
          // Brand new user - start onboarding
          setIsOnboarding(true)
          setCurrentStepIndex(0)
          setCompletedSteps([])
        }
      } catch (error) {
        console.warn('Error loading onboarding progress from API:', error)
        // Fallback to localStorage if API fails
        try {
          const savedProgress = localStorage.getItem('onboardingProgress')
          if (savedProgress) {
            const progress = JSON.parse(savedProgress)
            if (progress.isCompleted) {
              setIsCompleted(true)
              setIsOnboarding(false)
            } else if (progress.completedSteps?.length > 0) {
              setCompletedSteps(progress.completedSteps)
              const nextIndex = steps.findIndex(
                (step) => !progress.completedSteps.includes(step.id)
              )
              setCurrentStepIndex(nextIndex >= 0 ? nextIndex : 0)
              setIsOnboarding(true)
            } else {
              setIsOnboarding(true)
            }
          } else {
            setIsOnboarding(true)
          }
        } catch (fallbackError) {
          console.warn('Fallback localStorage loading failed:', fallbackError)
          setIsOnboarding(true)
        }
      }
    }

    initializeOnboarding()
  }, [steps])

  // Save progress to database whenever state changes
  const saveProgress = useCallback(
    async (
      stepIndex: number,
      completed: string[],
      isComp: boolean,
      skipped: boolean
    ) => {
      try {
        const result = await callOnboardingAPI('POST', {
          currentStepIndex: stepIndex,
          completedSteps: completed,
          isCompleted: isComp,
          skipped,
        })

        // If API call failed, fall back to localStorage silently
        if (!result) {
          try {
            localStorage.setItem(
              'onboardingProgress',
              JSON.stringify({
                currentStepIndex: stepIndex,
                completedSteps: completed,
                isCompleted: isComp,
                skipped,
              })
            )
          } catch (storageError) {
            console.warn('Failed to save to localStorage:', storageError)
          }
        }
      } catch (error) {
        console.warn('Failed to save onboarding progress:', error)
        // Try localStorage fallback
        try {
          localStorage.setItem(
            'onboardingProgress',
            JSON.stringify({
              currentStepIndex: stepIndex,
              completedSteps: completed,
              isCompleted: isComp,
              skipped,
            })
          )
        } catch (fallbackError) {
          console.warn('Fallback localStorage save failed:', fallbackError)
        }
      }
    },
    []
  )

  // Wait for the tour element to be ready before showing the overlay
  useEffect(() => {
    const currentStepObj = steps[currentStepIndex] || null
    if (!isOnboarding || !currentStepObj) {
      setIsElementReady(false)
      return
    }

    // If no selector, it's a centered step - add delay for page stability and hydration
    if (!currentStepObj.selector) {
      const timer = setTimeout(() => {
        // Use requestAnimationFrame to ensure DOM is fully painted
        requestAnimationFrame(() => {
          setIsElementReady(true)
        })
      }, 400)
      return () => clearTimeout(timer)
    }

    // Check if element exists and wait for page to stabilize
    let timeoutId: NodeJS.Timeout
    let pollCount = 0
    const maxPolls = 50 // ~5 seconds at 100ms intervals

    const checkElement = () => {
      const element = document.querySelector(
        currentStepObj.selector!
      ) as HTMLElement | null

      // Check if element exists in DOM
      if (element) {
        // Force layout flush by reading layout properties
        // This ensures the browser has calculated positions
        void element.offsetHeight
        void element.getBoundingClientRect()

        // Wait for next paint cycle to ensure layout is complete
        // Then add additional delay for useTourOverlay to calculate positions
        requestAnimationFrame(() => {
          setIsElementReady(true)
        })
        return
      }

      pollCount++

      // Give up after max polls and show anyway (fallback)
      if (pollCount >= maxPolls) {
        requestAnimationFrame(() => {
          setIsElementReady(true)
        })
        return
      }

      // If not found, retry in 100ms
      timeoutId = setTimeout(checkElement, 100)
    }

    // Start polling after brief delay for navigation
    timeoutId = setTimeout(checkElement, 300)
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isOnboarding, currentStepIndex, steps, pathname])

  const markComplete = useCallback(() => {
    setIsOnboarding(false)
    setIsCompleted(true)

    // Save completion to database
    saveProgress(
      currentStepIndex,
      steps.map((s) => s.id),
      true,
      false
    )

    // Navigate to spaces page after completion
    router.push('/protected/spaces')
  }, [steps, currentStepIndex, saveProgress, router])

  // Helper function to resolve page paths with placeholders
  const resolvePagePath = useCallback((pagePath: string): string => {
    if (pagePath.includes('[id]')) {
      const meSpaceId =
        typeof window !== 'undefined' ? localStorage.getItem('meSpaceId') : null
      if (meSpaceId) {
        return pagePath.replace('[id]', meSpaceId)
      }
    }
    return pagePath
  }, [])

  const currentStep = steps[currentStepIndex] || null

  const nextStep = useCallback(() => {
    // Reset element readiness for the next step
    setIsElementReady(false)

    if (currentStepIndex < steps.length - 1) {
      // Mark current step as completed
      const completedStep = steps[currentStepIndex]?.id
      if (completedStep && !completedSteps.includes(completedStep)) {
        const updatedCompleted = [...completedSteps, completedStep]
        setCompletedSteps(updatedCompleted)

        // Save progress to database
        saveProgress(currentStepIndex + 1, updatedCompleted, false, false)
      }

      // Check if next step is on a different page
      const nextStepObj = steps[currentStepIndex + 1]
      if (nextStepObj) {
        // Handle dynamic routes like /protected/spaces/me-space/[id]
        const nextPageBase = nextStepObj.page
        const isCurrentlyOnNextPage =
          pathname === nextPageBase || pathname?.startsWith(nextPageBase)

        if (!isCurrentlyOnNextPage) {
          // Need to navigate
          let navigationUrl = nextPageBase

          // Handle me-space pages that need the meSpaceId
          if (nextPageBase.includes('/me-space')) {
            const meSpaceId =
              typeof window !== 'undefined'
                ? localStorage.getItem('meSpaceId')
                : null
            if (meSpaceId) {
              navigationUrl = nextPageBase.replace('[id]', meSpaceId)
            }
          }

          // Handle we-space pages that need the weSpaceId
          if (
            nextPageBase.includes('/we-space') &&
            !nextPageBase.includes('[id]')
          ) {
            const weSpaceId =
              typeof window !== 'undefined'
                ? localStorage.getItem('weSpaceId')
                : null
            if (weSpaceId) {
              navigationUrl = `/protected/spaces/we-space/${weSpaceId}`
            }
          }

          // Handle field detail pages that need the meSpaceId and fieldId
          if (nextPageBase.includes('/fields')) {
            const meSpaceId =
              typeof window !== 'undefined'
                ? localStorage.getItem('meSpaceId')
                : null
            const fieldId =
              typeof window !== 'undefined'
                ? localStorage.getItem('lastCreatedFieldId')
                : null

            if (meSpaceId && fieldId) {
              navigationUrl = `/protected/spaces/me-space/${meSpaceId}/fields/${fieldId}`
            } else if (meSpaceId) {
              // If no field created yet, go back to me-space to create one
              setCurrentStepIndex(currentStepIndex + 1)
              return
            }
          }

          // Advance the step before navigating
          setCurrentStepIndex(currentStepIndex + 1)
          // Navigate to the next page
          router.push(navigationUrl)
          return
        }
      }

      // If already on the correct page, just advance
      setCurrentStepIndex(currentStepIndex + 1)
    } else {
      // We're at the last step
      markComplete()
    }
  }, [
    currentStepIndex,
    steps,
    completedSteps,
    markComplete,
    pathname,
    router,
    saveProgress,
  ])

  const previousStep = useCallback(() => {
    // Reset element readiness for the previous step
    setIsElementReady(false)

    if (currentStepIndex > 0) {
      const previousStepObj = steps[currentStepIndex - 1]

      if (previousStepObj) {
        const previousPageBase = previousStepObj.page

        // More precise route matching: check if we're exactly on the previous page
        // or on a direct child route of it (but not nested deeper)
        const isCurrentlyOnPrevPage =
          pathname === previousPageBase ||
          (pathname?.startsWith(previousPageBase) &&
            !pathname?.replace(previousPageBase, '').slice(1).includes('/'))

        if (!isCurrentlyOnPrevPage) {
          // Need to navigate to previous page
          let navigationUrl = previousPageBase

          // Handle me-space pages that need the meSpaceId
          if (previousPageBase.includes('/me-space')) {
            const meSpaceId =
              typeof window !== 'undefined'
                ? localStorage.getItem('meSpaceId')
                : null
            if (meSpaceId) {
              navigationUrl = previousPageBase.replace('[id]', meSpaceId)
            }
          }

          // Handle we-space detail pages that need the weSpaceId
          // Only add ID if the page path has more content after /we-space (not just the listing)
          if (
            previousPageBase.includes('/we-space') &&
            previousPageBase !== '/protected/spaces/we-space' &&
            !previousPageBase.includes('[id]')
          ) {
            const weSpaceId =
              typeof window !== 'undefined'
                ? localStorage.getItem('weSpaceId')
                : null
            if (weSpaceId) {
              navigationUrl = `/protected/spaces/we-space/${weSpaceId}`
            }
          }

          // Handle field detail pages that need the meSpaceId and fieldId
          if (previousPageBase.includes('/fields')) {
            const meSpaceId =
              typeof window !== 'undefined'
                ? localStorage.getItem('meSpaceId')
                : null
            const fieldId =
              typeof window !== 'undefined'
                ? localStorage.getItem('lastCreatedFieldId')
                : null

            if (meSpaceId && fieldId) {
              navigationUrl = `/protected/spaces/me-space/${meSpaceId}/fields/${fieldId}`
            }
          }

          // Update step before navigating
          setCurrentStepIndex(currentStepIndex - 1)
          // Navigate to the previous page
          router.push(navigationUrl)
          return
        }
      }

      // If already on the correct page, just go back a step
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }, [currentStepIndex, steps, pathname, router])

  const skipTour = useCallback(() => {
    setIsOnboarding(false)
    // Save that the tour was skipped but not completed
    saveProgress(currentStepIndex, completedSteps, false, true)
  }, [completedSteps, currentStepIndex, saveProgress])

  const setCurrentStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < steps.length) {
        setCurrentStepIndex(index)
      }
    },
    [steps.length]
  )

  const resumeTour = useCallback(() => {
    setIsOnboarding(true)
    setIsCompleted(false)
    saveProgress(currentStepIndex, completedSteps, false, false)

    // Navigate to the current step's page, resolving any [id] placeholders
    const currentStepObj = steps[currentStepIndex]
    if (currentStepObj) {
      const routePath = resolvePagePath(currentStepObj.page)
      router.push(routePath)
    }
  }, [
    currentStepIndex,
    completedSteps,
    saveProgress,
    steps,
    router,
    resolvePagePath,
  ])

  const restartTour = useCallback(() => {
    setCurrentStepIndex(0)
    setCompletedSteps([])
    setIsOnboarding(true)
    setIsCompleted(false)
    // Clear from database
    saveProgress(0, [], false, false)

    // Navigate to spaces page
    router.push('/protected/spaces')
  }, [saveProgress, router])

  return (
    <OnboardingContext.Provider
      value={{
        isOnboarding,
        currentStepIndex,
        currentStep,
        completedSteps,
        isCompleted,
        isElementReady,
        steps,
        nextStep,
        previousStep,
        skipTour,
        markComplete,
        setCurrentStep,
        resumeTour,
        restartTour,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider')
  }
  return context
}
