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
              'flex flex-col items-center justify-center p-6 rounded-[12px] border transition-all duration-200',
              gender === 'male'
                ? 'border-[#111827] bg-[#FAFAFA] shadow-sm'
                : 'border-[#EAEAEA] hover:border-gray-300 bg-white hover:bg-[#FAFAFA]'
            )}
          >
            <span className="text-4xl mb-3 grayscale">👨</span>
            <span className={clsx(
              'font-medium text-sm',
              gender === 'male' ? 'text-[#111827]' : 'text-gray-700'
            )}>
              {t('onboarding.steps.fitness.male')}
            </span>
            <span className="text-xs text-[#6B7280] mt-1.5 font-medium">
              {t('onboarding.steps.fitness.maleRequirement')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onGenderChange('female')}
            className={clsx(
              'flex flex-col items-center justify-center p-6 rounded-[12px] border transition-all duration-200',
              gender === 'female'
                ? 'border-[#111827] bg-[#FAFAFA] shadow-sm'
                : 'border-[#EAEAEA] hover:border-gray-300 bg-white hover:bg-[#FAFAFA]'
            )}
          >
            <span className="text-4xl mb-3 grayscale">👩</span>
            <span className={clsx(
              'font-medium text-sm',
              gender === 'female' ? 'text-[#111827]' : 'text-gray-700'
            )}>
              {t('onboarding.steps.fitness.female')}
            </span>
            <span className="text-xs text-[#6B7280] mt-1.5 font-medium">
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
                'w-full text-left p-4 rounded-[8px] border transition-all duration-200',
                fitnessLevel === level
                  ? 'border-[#111827] bg-[#FAFAFA] shadow-sm'
                  : 'border-[#EAEAEA] hover:border-gray-300 bg-white hover:bg-[#FAFAFA]'
              )}
            >
              <div className="flex flex-row items-center">
                <span className={clsx(
                  'inline-flex items-center justify-center w-6 h-6 rounded border mr-4 text-xs grayscale transition-colors',
                  fitnessLevel === level
                    ? 'border-[#111827] bg-[#111827]'
                    : 'border-[#EAEAEA] bg-white'
                )}>
                  {level === 'beginner' && '🤍'}
                  {level === 'intermediate' && '⭐'}
                  {level === 'advanced' && '🔥'}
                </span>
                <div>
                  <span className={clsx(
                    'font-medium text-sm',
                    fitnessLevel === level ? 'text-[#111827]' : 'text-gray-700'
                  )}>
                    {t(`onboarding.steps.fitness.levels.${level}`)}
                  </span>
                  <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
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
      <div className="p-5 bg-[#FAFAFA] rounded-[8px] border border-[#EAEAEA]">
        <h4 className="font-semibold text-[#111827] mb-3 text-sm tracking-tight">
          {t('onboarding.steps.fitness.infoTitle')}
        </h4>
        <ul className="text-sm text-[#6B7280] space-y-2 leading-relaxed">
          <li className="flex items-start">
            <span className="mr-2 text-[#9CA3AF]">—</span>
            <span>{t('onboarding.steps.fitness.infoMale')}</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-[#9CA3AF]">—</span>
            <span>{t('onboarding.steps.fitness.infoFemale')}</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
