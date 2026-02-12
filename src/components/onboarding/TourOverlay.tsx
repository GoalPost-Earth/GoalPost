'use client'

import React, { useEffect, useState } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { useTourOverlay } from '@/hooks/useTourOverlay'
import { Button } from '@/components/ui/button'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'
import './tour-overlay.css'

export function TourOverlay() {
  const {
    currentStep,
    isOnboarding,
    nextStep,
    previousStep,
    skipTour,
    currentStepIndex,
    isElementReady,
  } = useOnboarding()
  const { elementPosition, tooltipPosition } = useTourOverlay(
    currentStep?.selector,
    currentStep?.position
  )
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOnboarding || !currentStep || !mounted || !isElementReady) {
    return null
  }

  // Get step count
  const totalSteps = 7 // Adjust based on your steps count
  const stepNumber = currentStepIndex + 1

  return (
    <div className="tour-overlay-wrapper">
      {/* Backdrop with spotlight */}
      {elementPosition?.isVisible && currentStep?.position !== 'center' && (
        <>
          <div className="tour-backdrop" />
          <svg
            className="tour-spotlight"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 9998,
            }}
          >
            <defs>
              <mask id="tour-mask">
                <rect width="100%" height="100%" fill="white" />
                <circle
                  cx={elementPosition.left + elementPosition.width / 2}
                  cy={elementPosition.top + elementPosition.height / 2}
                  r={
                    Math.max(elementPosition.width, elementPosition.height) /
                      2 +
                    12
                  }
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.5)"
              mask="url(#tour-mask)"
              className="tour-mask"
            />
          </svg>

          {/* Glow ring around element */}
          <div
            className="tour-glow-ring"
            style={{
              position: 'fixed',
              top: elementPosition.top - 12,
              left: elementPosition.left - 12,
              width: elementPosition.width + 24,
              height: elementPosition.height + 24,
              pointerEvents: 'none',
              zIndex: 9998,
            }}
          />
        </>
      )}

      {/* Center position backdrop (no spotlight) */}
      {currentStep?.position === 'center' && <div className="tour-backdrop" />}

      {/* Tooltip */}
      <div
        className="tour-tooltip"
        style={{
          position: 'fixed',
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          zIndex: 9999,
        }}
      >
        <div className="tour-tooltip-content">
          <div className="tour-tooltip-header">
            <h3 className="tour-title">{currentStep.title}</h3>
            <button
              className="tour-close-button"
              onClick={skipTour}
              aria-label="Skip tour"
            >
              <X size={16} />
            </button>
          </div>

          <p className="tour-description">{currentStep.description}</p>

          <div className="tour-progress">
            <div className="tour-progress-dots">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <div
                  key={idx}
                  className={`tour-progress-dot ${
                    idx < stepNumber ? 'active' : 'inactive'
                  }`}
                />
              ))}
            </div>
            <span className="tour-progress-text">
              Step {stepNumber} of {totalSteps}
            </span>
          </div>

          <div className="tour-actions">
            {currentStepIndex > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={previousStep}
                className="tour-button"
              >
                <ChevronLeft size={16} />
                Back
              </Button>
            )}
            <div style={{ flex: 1 }} />
            <Button
              variant="outline"
              size="sm"
              onClick={skipTour}
              className="tour-button"
            >
              Skip
            </Button>
            <Button
              size="sm"
              onClick={nextStep}
              className="tour-button tour-button-primary"
            >
              {stepNumber === totalSteps ? 'Done' : 'Next'}
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
