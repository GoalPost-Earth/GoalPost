'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useOnboarding } from '@/contexts/OnboardingContext'

export function TourController() {
  const pathname = usePathname()
  const { currentStep, nextStep, isOnboarding } = useOnboarding()

  useEffect(() => {
    if (!isOnboarding || !currentStep) return

    // Check if user is on the expected page for current step
    const isOnCorrectPage =
      pathname === currentStep.page || pathname?.startsWith(currentStep.page)

    if (!isOnCorrectPage) {
      // If not on correct page, don't auto-advance
      // User needs to navigate to it
      console.log(
        `Tour: Expected ${currentStep.page}, but user is on ${pathname}`
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, currentStep])

  // Auto-advance on specific user actions
  useEffect(() => {
    if (!isOnboarding || !currentStep) return

    const handleTourAction = (e: CustomEvent<{ stepId: string }>) => {
      if (e.detail.stepId === currentStep.id) {
        // Auto-advance after a brief delay for better UX
        const timer = setTimeout(() => {
          nextStep()
        }, 400)
        return () => clearTimeout(timer)
      }
    }

    window.addEventListener('tour-action', handleTourAction as EventListener)
    return () =>
      window.removeEventListener(
        'tour-action',
        handleTourAction as EventListener
      )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, nextStep])

  return null
}

// Helper function to dispatch tour actions from components
export function dispatchTourAction(stepId: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tour-action', { detail: { stepId } }))
  }
}
