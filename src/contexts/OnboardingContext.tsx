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

  // Initialize onboarding state from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const savedProgress = localStorage.getItem('onboardingProgress')
      if (savedProgress) {
        const progress = JSON.parse(savedProgress)
        if (progress.isCompleted) {
          setIsCompleted(true)
          setIsOnboarding(false)
          return
        }

        // If user has partial progress, resume from there
        if (progress.completedSteps && progress.completedSteps.length > 0) {
          setCompletedSteps(progress.completedSteps)
          const nextIndex = steps.findIndex(
            (step) => !progress.completedSteps.includes(step.id)
          )
          setCurrentStepIndex(nextIndex >= 0 ? nextIndex : 0)
          setIsOnboarding(!progress.isCompleted)
        }
      } else {
        // Brand new user - start onboarding
        setIsOnboarding(true)
        setCurrentStepIndex(0)
        setCompletedSteps([])
      }
    } catch (error) {
      console.error('Error loading onboarding progress:', error)
      // Default: start fresh
      setIsOnboarding(true)
      setCurrentStepIndex(0)
      setCompletedSteps([])
    }
  }, [steps])

  // Wait for the tour element to be ready before showing the overlay
  useEffect(() => {
    const currentStepObj = steps[currentStepIndex] || null
    if (!isOnboarding || !currentStepObj) {
      setIsElementReady(false)
      return
    }

    // If no selector, it's a centered step - always ready
    if (!currentStepObj.selector) {
      setIsElementReady(true)
      return
    }

    // Check if element exists immediately
    const checkElement = () => {
      const element = document.querySelector(currentStepObj.selector!)
      if (element) {
        setIsElementReady(true)
        return
      }
      // If not found, retry in 100ms
      const timer = setTimeout(checkElement, 100)
      return () => clearTimeout(timer)
    }

    const cleanup = checkElement()
    return () => {
      if (typeof cleanup === 'function') cleanup()
    }
  }, [isOnboarding, currentStepIndex, steps])

  const markComplete = useCallback(() => {
    setIsOnboarding(false)
    setIsCompleted(true)

    // Persist to localStorage
    try {
      localStorage.setItem(
        'onboardingProgress',
        JSON.stringify({
          completedSteps: steps.map((s) => s.id),
          isCompleted: true,
        })
      )
    } catch (error) {
      console.error('Failed to save onboarding progress:', error)
    }
  }, [steps])

  const currentStep = steps[currentStepIndex] || null

  const nextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      // Mark current step as completed
      const completedStep = steps[currentStepIndex]?.id
      if (completedStep && !completedSteps.includes(completedStep)) {
        const updatedCompleted = [...completedSteps, completedStep]
        setCompletedSteps(updatedCompleted)
        // Save progress to localStorage
        try {
          localStorage.setItem(
            'onboardingProgress',
            JSON.stringify({
              completedSteps: updatedCompleted,
              isCompleted: false,
            })
          )
        } catch (error) {
          console.error('Failed to save progress:', error)
        }
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
          if (
            nextPageBase.includes('/me-space') &&
            !nextPageBase.includes('[id]')
          ) {
            const meSpaceId =
              typeof window !== 'undefined'
                ? localStorage.getItem('meSpaceId')
                : null
            if (meSpaceId) {
              navigationUrl = `/protected/spaces/me-space/${meSpaceId}`
            }
          }

          // Handle field detail pages that need the fieldId
          if (nextPageBase.includes('field-details')) {
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
              // If no field created yet, stay on me-space page
              // This allows user to create a field first
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
  }, [currentStepIndex, steps, completedSteps, markComplete, pathname, router])

  const previousStep = useCallback(() => {
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
          if (
            previousPageBase.includes('/me-space') &&
            !previousPageBase.includes('[id]')
          ) {
            const meSpaceId =
              typeof window !== 'undefined'
                ? localStorage.getItem('meSpaceId')
                : null
            if (meSpaceId) {
              navigationUrl = `/protected/spaces/me-space/${meSpaceId}`
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
    try {
      localStorage.setItem(
        'onboardingProgress',
        JSON.stringify({
          completedSteps,
          isCompleted: false,
          skipped: true,
        })
      )
    } catch (error) {
      console.error('Failed to save skip state:', error)
    }
  }, [completedSteps])

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
  }, [])

  const restartTour = useCallback(() => {
    setCurrentStepIndex(0)
    setCompletedSteps([])
    setIsOnboarding(true)
    setIsCompleted(false)
    // Clear localStorage
    try {
      localStorage.removeItem('onboardingProgress')
    } catch (error) {
      console.error('Failed to clear onboarding progress:', error)
    }
  }, [])

  return (
    <OnboardingContext.Provider
      value={{
        isOnboarding,
        currentStepIndex,
        currentStep,
        completedSteps,
        isCompleted,
        isElementReady,
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
