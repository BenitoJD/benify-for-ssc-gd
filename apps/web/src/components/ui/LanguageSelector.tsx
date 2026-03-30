'use client'

import { useTranslations } from 'next-intl'
import { clsx } from 'clsx'

interface LanguageSelectorProps {
  value: 'en' | 'hi' | null
  onChange: (value: 'en' | 'hi') => void
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const t = useTranslations()

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* English */}
      <button
        type="button"
        onClick={() => onChange('en')}
        className={clsx(
          'flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all',
          value === 'en'
            ? 'border-primary-600 bg-primary-50'
            : 'border-gray-200 hover:border-gray-300 bg-white'
        )}
      >
        <span className="text-4xl mb-2">🇬🇧</span>
        <span className={clsx(
          'font-medium',
          value === 'en' ? 'text-primary-700' : 'text-gray-700'
        )}>
          English
        </span>
        <span className="text-sm text-gray-500 mt-1">
          {t('onboarding.steps.language.english')}
        </span>
      </button>

      {/* Hindi */}
      <button
        type="button"
        onClick={() => onChange('hi')}
        className={clsx(
          'flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all',
          value === 'hi'
            ? 'border-primary-600 bg-primary-50'
            : 'border-gray-200 hover:border-gray-300 bg-white'
        )}
      >
        <span className="text-4xl mb-2">🇮🇳</span>
        <span className={clsx(
          'font-medium',
          value === 'hi' ? 'text-primary-700' : 'text-gray-700'
        )}>
          हिंदी
        </span>
        <span className="text-sm text-gray-500 mt-1">
          {t('onboarding.steps.language.hindi')}
        </span>
      </button>
    </div>
  )
}
