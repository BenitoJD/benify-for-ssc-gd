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
      <div className="h-2 bg-[#EAEAEA] rounded-full mb-6">
        <div
          className="h-2 bg-[#111827] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Step indicators */}
      <div className="flex justify-between">
        {labels.map((label, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300',
                index < currentStep
                  ? 'bg-[#111827] text-white border border-[#111827]'
                  : index === currentStep
                  ? 'bg-white text-[#111827] border-2 border-[#111827] shadow-sm'
                  : 'bg-white text-gray-400 border border-[#EAEAEA]'
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
              'text-xs mt-2 hidden sm:block tracking-wide',
              index <= currentStep ? 'text-[#111827] font-medium' : 'text-gray-400 font-medium'
            )}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
