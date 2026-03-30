'use client'

import { clsx } from 'clsx'

interface OnboardingProgressProps {
  currentStep: number
  totalSteps: number
  labels: string[]
}

export function OnboardingProgress({ currentStep, totalSteps, labels }: OnboardingProgressProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="h-2 bg-gray-200 rounded-full mb-4">
        <div
          className="h-2 bg-primary-600 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Step indicators */}
      <div className="flex justify-between">
        {labels.map((label, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                index < currentStep
                  ? 'bg-primary-600 text-white'
                  : index === currentStep
                  ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                  : 'bg-gray-200 text-gray-500'
              )}
            >
              {index < currentStep ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <span className={clsx(
              'text-xs mt-1 hidden sm:block',
              index <= currentStep ? 'text-gray-900 font-medium' : 'text-gray-500'
            )}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
