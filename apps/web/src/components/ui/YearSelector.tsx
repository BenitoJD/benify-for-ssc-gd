'use client'

import { useTranslations } from 'next-intl'
import { clsx } from 'clsx'

interface YearSelectorProps {
  value: number | null
  onChange: (value: number) => void
  years?: number[]
}

export function YearSelector({ value, onChange, years = [2025, 2026, 2027] }: YearSelectorProps) {
  const t = useTranslations()

  return (
    <div className="grid grid-cols-3 gap-4">
      {years.map((year) => (
        <button
          key={year}
          type="button"
          onClick={() => onChange(year)}
          className={clsx(
            'flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all',
            value === year
              ? 'border-primary-600 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          )}
        >
          <span className={clsx(
            'text-2xl font-bold',
            value === year ? 'text-primary-600' : 'text-gray-700'
          )}>
            {year}
          </span>
          <span className="text-sm text-gray-500 mt-1">
            {t('onboarding.steps.year.sscGDExam')}
          </span>
        </button>
      ))}
    </div>
  )
}
