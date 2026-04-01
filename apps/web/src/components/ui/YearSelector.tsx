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
            'flex flex-col items-center justify-center p-6 rounded-[12px] border transition-all duration-200',
            value === year
              ? 'border-[#111827] bg-[#FAFAFA] shadow-sm'
              : 'border-[#EAEAEA] hover:border-gray-300 hover:bg-[#FAFAFA] bg-white'
          )}
        >
          <span className={clsx(
            'text-2xl font-bold tracking-tight',
            value === year ? 'text-[#111827]' : 'text-gray-700'
          )}>
            {year}
          </span>
          <span className="text-sm text-[#6B7280] mt-1 font-medium">
            {t('onboarding.steps.year.sscGDExam')}
          </span>
        </button>
      ))}
    </div>
  )
}
