'use client'

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getAccessToken } from '@/lib/auth/access-token-client'

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
  setElementReady: (value: boolean) => void
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
    // Shared helper dedupes the access-token/refresh-token dance across
    // every concurrent caller (Apollo, chat thread client, this context),
    // so a page mount that spawns parallel auth-bearing fetches no longer
    // 401s most of them via the refresh-token rotation race.
    const accessToken = await getAccessToken()
    if (!accessToken) {
      console.warn('No access token available, skipping API call')
      return null
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

    // When the tour activates, the active step may be anchored to an element
    // on a page the user isn't currently on (e.g. a fresh login lands on
    // /protected/dashboard, but step 1 lives on /protected/spaces). Without
    // this, TourOverlay can't find its anchor element and silently renders
    // nothing — the tour "doesn't trigger". Route to the step's page so the
    // overlay has somewhere to mount. No-op when already on the right page.
    const routeToActiveStep = (index: number) => {
      const stepObj = steps[index]
      if (!stepObj) return
      let target = stepObj.page
      if (target.includes('[id]')) {
        const meSpaceId = localStorage.getItem('meSpaceId')
        // meSpaceId is hydrated asynchronously by UserDataProvider, which
        // mounts inside this provider — on a cold login it may not be set
        // yet. Rather than leave the user stranded on a page where a
        // selector-anchored step can't render, fall back to the spaces
        // landing page (matches markComplete/restartTour navigation).
        target = meSpaceId ? target.replace('[id]', meSpaceId) : '/protected/spaces'
      }
      // Compare against window.location.pathname (not the usePathname() value)
      // on purpose: it keeps this init effect from depending on `pathname`,
      // which would make it re-run on every navigation and risk a redirect loop.
      if (window.location.pathname !== target) {
        router.push(target)
      }
    }

    const initializeOnboarding = async () => {
      try {
        const progress = await callOnboardingAPI('GET')

        // If API call failed, fall back to localStorage
        if (!progress) {
          throw new Error('API unavailable')
        }

        // If tour was completed, don't show onboarding
        if (progress.onboardingIsCompleted) {
          setIsCompleted(true)
          setIsOnboarding(false)
          return
        }

        // If tour was skipped, don't show onboarding (but allow resume/restart from profile)
        if (progress.onboardingSkipped) {
          setIsCompleted(false)
          setIsOnboarding(false)
          setCurrentStepIndex(progress.onboardingCurrentStepIndex ?? 0)
          setCompletedSteps(progress.onboardingCompletedSteps ?? [])
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
          const resumeIndex = nextIndex >= 0 ? nextIndex : 0
          setCurrentStepIndex(resumeIndex)
          setIsOnboarding(!progress.onboardingIsCompleted)
          if (!progress.onboardingIsCompleted) {
            routeToActiveStep(resumeIndex)
          }
        } else {
          // Brand new user - start onboarding
          setIsOnboarding(true)
          setCurrentStepIndex(0)
          setCompletedSteps([])
          routeToActiveStep(0)
        }
      } catch (error) {
        console.warn('Error loading onboarding progress from API:', error)
        // Fallback to localStorage if API fails
        try {
          const savedProgress = localStorage.getItem('onboardingProgress')
          if (savedProgress) {
            const progress = JSON.parse(savedProgress)
            // Check skipped flag in localStorage too
            if (progress.skipped) {
              setIsCompleted(false)
              setIsOnboarding(false)
              return
            }
            if (progress.isCompleted) {
              setIsCompleted(true)
              setIsOnboarding(false)
            } else if (progress.completedSteps?.length > 0) {
              setCompletedSteps(progress.completedSteps)
              const nextIndex = steps.findIndex(
                (step) => !progress.completedSteps.includes(step.id)
              )
              const resumeIndex = nextIndex >= 0 ? nextIndex : 0
              setCurrentStepIndex(resumeIndex)
              setIsOnboarding(true)
              routeToActiveStep(resumeIndex)
            } else {
              setIsOnboarding(true)
              routeToActiveStep(0)
            }
          } else {
            setIsOnboarding(true)
            routeToActiveStep(0)
          }
        } catch (fallbackError) {
          console.warn('Fallback localStorage loading failed:', fallbackError)
          setIsOnboarding(true)
          routeToActiveStep(0)
        }
      }
    }

    initializeOnboarding()
  }, [steps, router])

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
    // Immediately persist to localStorage to prevent re-entrance of onboarding
    try {
      localStorage.setItem(
        'onboardingProgress',
        JSON.stringify({
          currentStepIndex,
          completedSteps: steps.map((s) => s.id),
          isCompleted: true,
          skipped: false,
        })
      )
    } catch (e) {
      console.warn('Failed to save completion state to localStorage:', e)
    }

    setIsOnboarding(false)
    setIsCompleted(true)

    // Save completion to database (async)
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

  // Simple setter for element readiness
  const setElementReady = useCallback((value: boolean) => {
    setIsElementReady(value)
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
        const isCurrentlyOnNextPage = pathname === nextPageBase

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
            nextPageBase !== '/protected/spaces/we-space' &&
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

        // Require exact pathname match for onboarding step navigation
        const isCurrentlyOnPrevPage = pathname === previousPageBase

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
    // Immediately persist to localStorage to prevent re-entrance of onboarding
    try {
      localStorage.setItem(
        'onboardingProgress',
        JSON.stringify({
          currentStepIndex,
          completedSteps,
          isCompleted: false,
          skipped: true,
        })
      )
    } catch (e) {
      console.warn('Failed to save skip state to localStorage:', e)
    }

    setIsOnboarding(false)
    // Save that the tour was skipped but not completed (async)
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
    // Immediately persist reset state to localStorage
    try {
      localStorage.setItem(
        'onboardingProgress',
        JSON.stringify({
          currentStepIndex: 0,
          completedSteps: [],
          isCompleted: false,
          skipped: false,
        })
      )
    } catch (e) {
      console.warn('Failed to save restart state to localStorage:', e)
    }

    setCurrentStepIndex(0)
    setCompletedSteps([])
    setIsOnboarding(true)
    setIsCompleted(false)
    // Clear from database (async)
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
        setElementReady,
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
