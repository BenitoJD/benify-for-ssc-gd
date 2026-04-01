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
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#FAFAFA] border border-[#EAEAEA] shadow-sm mb-4">
          <span className="text-5xl font-bold tracking-tight text-[#111827]">{value}</span>
        </div>
        <p className="text-sm font-medium text-[#6B7280]">
          {t('onboarding.steps.studyHours.hoursPerDay')}
        </p>
      </div>

      {/* Slider */}
      <div className="px-2 mb-10">
        <input
          type="range"
          min="1"
          max="6"
          step="1"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 bg-[#EAEAEA] rounded-lg appearance-none cursor-pointer accent-[#111827]"
        />
        <div className="flex justify-between mt-3 px-1">
          {hours.map((hour) => (
            <span key={hour} className={clsx(
              "text-xs font-medium transition-colors cursor-pointer",
              value === hour ? "text-[#111827]" : "text-[#9CA3AF]"
            )} onClick={() => onChange(hour)}>
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
              'p-3 rounded-[8px] border font-medium text-sm transition-all duration-200',
              value === hour
                ? 'border-[#111827] bg-[#FAFAFA] text-[#111827] shadow-sm'
                : 'border-[#EAEAEA] hover:border-gray-300 text-gray-600 hover:bg-[#FAFAFA]'
            )}
          >
            {hour} {hour === 1 ? t('onboarding.steps.studyHours.hour') : t('onboarding.steps.studyHours.hours')}
          </button>
        ))}
      </div>

      {/* Recommendation */}
      <div className="mt-8 p-4 bg-[#FAFAFA] rounded-[8px] border border-[#EAEAEA]">
        <p className="text-sm text-[#6B7280] leading-relaxed">
          <span className="font-semibold text-[#111827]">{t('onboarding.steps.studyHours.recommendation')}:</span>{' '}
          {value <= 2 && t('onboarding.steps.studyHours.recommendLight')}
          {value > 2 && value <= 4 && t('onboarding.steps.studyHours.recommendModerate')}
          {value > 4 && t('onboarding.steps.studyHours.recommendIntense')}
        </p>
      </div>
    </div>
  )
}
