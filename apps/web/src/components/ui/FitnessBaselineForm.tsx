'use client'

import { useTranslations } from 'next-intl'
import { clsx } from 'clsx'

interface FitnessBaselineFormProps {
  gender: 'male' | 'female' | null
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced' | null
  onGenderChange: (value: 'male' | 'female') => void
  onFitnessLevelChange: (value: 'beginner' | 'intermediate' | 'advanced') => void
}

export function FitnessBaselineForm({
  gender,
  fitnessLevel,
  onGenderChange,
  onFitnessLevelChange,
}: FitnessBaselineFormProps) {
  const t = useTranslations()

  return (
    <div className="w-full space-y-8">
      {/* Gender Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t('onboarding.steps.fitness.gender')}
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onGenderChange('male')}
            className={clsx(
              'flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all',
              gender === 'male'
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            )}
          >
            <span className="text-4xl mb-2">👨</span>
            <span className={clsx(
              'font-medium',
              gender === 'male' ? 'text-primary-700' : 'text-gray-700'
            )}>
              {t('onboarding.steps.fitness.male')}
            </span>
            <span className="text-xs text-gray-500 mt-1">
              {t('onboarding.steps.fitness.maleRequirement')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onGenderChange('female')}
            className={clsx(
              'flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all',
              gender === 'female'
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            )}
          >
            <span className="text-4xl mb-2">👩</span>
            <span className={clsx(
              'font-medium',
              gender === 'female' ? 'text-primary-700' : 'text-gray-700'
            )}>
              {t('onboarding.steps.fitness.female')}
            </span>
            <span className="text-xs text-gray-500 mt-1">
              {t('onboarding.steps.fitness.femaleRequirement')}
            </span>
          </button>
        </div>
      </div>

      {/* Fitness Level Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t('onboarding.steps.fitness.currentLevel')}
        </label>
        <div className="space-y-3">
          {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => onFitnessLevelChange(level)}
              className={clsx(
                'w-full text-left p-4 rounded-lg border-2 transition-all',
                fitnessLevel === level
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              )}
            >
              <div className="flex items-center">
                <span className={clsx(
                  'inline-flex items-center justify-center w-6 h-6 rounded-full border mr-3',
                  fitnessLevel === level
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : 'border-gray-300 text-gray-500'
                )}>
                  {level === 'beginner' && '🔰'}
                  {level === 'intermediate' && '⭐'}
                  {level === 'advanced' && '🏆'}
                </span>
                <div>
                  <span className={clsx(
                    'font-medium',
                    fitnessLevel === level ? 'text-primary-700' : 'text-gray-700'
                  )}>
                    {t(`onboarding.steps.fitness.levels.${level}`)}
                  </span>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {level === 'beginner' && t('onboarding.steps.fitness.levels.beginnerDesc')}
                    {level === 'intermediate' && t('onboarding.steps.fitness.levels.intermediateDesc')}
                    {level === 'advanced' && t('onboarding.steps.fitness.levels.advancedDesc')}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">
          {t('onboarding.steps.fitness.infoTitle')}
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>{t('onboarding.steps.fitness.infoMale')}</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>{t('onboarding.steps.fitness.infoFemale')}</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
