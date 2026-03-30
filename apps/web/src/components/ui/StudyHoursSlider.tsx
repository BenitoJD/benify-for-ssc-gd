'use client'

import { useTranslations } from 'next-intl'
import { clsx } from 'clsx'

interface StudyHoursSliderProps {
  value: number
  onChange: (value: number) => void
}

export function StudyHoursSlider({ value, onChange }: StudyHoursSliderProps) {
  const t = useTranslations()
  
  const hours = [1, 2, 3, 4, 5, 6]

  return (
    <div className="w-full">
      {/* Selected value display */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-100">
          <span className="text-4xl font-bold text-primary-600">{value}</span>
        </div>
        <p className="mt-2 text-gray-600">
          {t('onboarding.steps.studyHours.hoursPerDay')}
        </p>
      </div>

      {/* Slider */}
      <div className="px-4 mb-8">
        <input
          type="range"
          min="1"
          max="6"
          step="1"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
        />
        <div className="flex justify-between mt-2">
          {hours.map((hour) => (
            <span key={hour} className="text-sm text-gray-500">
              {hour}h
            </span>
          ))}
        </div>
      </div>

      {/* Preset buttons */}
      <div className="grid grid-cols-3 gap-3">
        {hours.map((hour) => (
          <button
            key={hour}
            type="button"
            onClick={() => onChange(hour)}
            className={clsx(
              'p-3 rounded-lg border-2 font-medium transition-all',
              value === hour
                ? 'border-primary-600 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            )}
          >
            {hour} {hour === 1 ? t('onboarding.steps.studyHours.hour') : t('onboarding.steps.studyHours.hours')}
          </button>
        ))}
      </div>

      {/* Recommendation */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-sm text-yellow-800">
          <span className="font-medium">{t('onboarding.steps.studyHours.recommendation')}:</span>{' '}
          {value <= 2 && t('onboarding.steps.studyHours.recommendLight')}
          {value > 2 && value <= 4 && t('onboarding.steps.studyHours.recommendModerate')}
          {value > 4 && t('onboarding.steps.studyHours.recommendIntense')}
        </p>
      </div>
    </div>
  )
}
