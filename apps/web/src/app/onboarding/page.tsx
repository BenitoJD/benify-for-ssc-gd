'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { OnboardingProgress } from '@/components/ui/OnboardingProgress'
import { YearSelector } from '@/components/ui/YearSelector'
import { DiagnosticQuiz } from '@/components/ui/DiagnosticQuiz'
import { StudyHoursSlider } from '@/components/ui/StudyHoursSlider'
import { FitnessBaselineForm } from '@/components/ui/FitnessBaselineForm'
import { updateProfile, getProfile } from '@/lib/api/users'
import { fetchCurrentUser } from '@/lib/auth'
import { clsx } from 'clsx'

type Step = 'year' | 'assessment' | 'studyHours' | 'fitness'

interface OnboardingState {
  language: 'en'
  targetYear: number | null
  assessmentLevel: 'beginner' | 'intermediate' | 'advanced' | null
  dailyStudyHours: number
  gender: 'male' | 'female' | null
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced' | null
}

const STEPS: Step[] = ['year', 'assessment', 'studyHours', 'fitness']

export default function OnboardingPage() {
  const t = useTranslations()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<OnboardingState>({
    language: 'en',
    targetYear: null,
    assessmentLevel: null,
    dailyStudyHours: 2,
    gender: null,
    fitnessLevel: null,
  })

  const stepLabels = [
    t('onboarding.steps.year.title'),
    t('onboarding.steps.assessment.title'),
    t('onboarding.steps.studyHours.title'),
    t('onboarding.steps.fitness.title'),
  ]

  useEffect(() => {
    // Check if user is authenticated and load existing profile
    const checkAuth = async () => {
      try {
        const user = await fetchCurrentUser()
        if (!user) {
          router.push('/login')
          return
        }

        // Try to load existing profile data
        try {
          const profileData = await getProfile()
          if (profileData.target_exam_year !== undefined) {
            setProfile((prev) => ({
              ...prev,
              targetYear: profileData.target_exam_year ?? null,
            }))
          }
          if (profileData.current_level) {
            setProfile((prev) => ({
              ...prev,
              assessmentLevel: profileData.current_level as 'beginner' | 'intermediate' | 'advanced',
            }))
          }
          if (profileData.daily_study_hours !== undefined) {
            setProfile((prev) => ({
              ...prev,
              dailyStudyHours: profileData.daily_study_hours ?? 2,
            }))
          }
          if (profileData.gender) {
            setProfile((prev) => ({
              ...prev,
              gender: profileData.gender as 'male' | 'female',
            }))
          }
          if (profileData.fitness_level) {
            setProfile((prev) => ({
              ...prev,
              fitnessLevel: profileData.fitness_level as 'beginner' | 'intermediate' | 'advanced',
            }))
          }
        } catch {
          // Profile might not exist yet, that's fine
        }
      } catch {
        router.push('/login')
        return
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const saveProfile = async (data: Partial<OnboardingState>, setOnboardingComplete = false) => {
    setIsSaving(true)
    setError(null)
    
    try {
      await updateProfile({
        language_preference: data.language ?? profile.language ?? undefined,
        target_exam_year: data.targetYear ?? profile.targetYear ?? undefined,
        current_level: data.assessmentLevel ?? profile.assessmentLevel ?? undefined,
        daily_study_hours: data.dailyStudyHours ?? profile.dailyStudyHours ?? undefined,
        gender: data.gender ?? profile.gender ?? undefined,
        fitness_level: data.fitnessLevel ?? profile.fitnessLevel ?? undefined,
        onboarding_complete: setOnboardingComplete,
      })
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const handleNext = async () => {
    const currentStepName = STEPS[currentStep]
    
    // Validate current step
    if (currentStepName === 'year' && !profile.targetYear) {
      setError(t('onboarding.steps.year.error'))
      return
    }
    if (currentStepName === 'assessment' && !profile.assessmentLevel) {
      setError(t('onboarding.steps.assessment.error'))
      return
    }
    // Step 5 (fitness) requires gender and fitnessLevel
    if (currentStepName === 'fitness') {
      if (!profile.gender) {
        setError(t('onboarding.steps.fitness.genderRequired'))
        return
      }
      if (!profile.fitnessLevel) {
        setError(t('onboarding.steps.fitness.levelRequired'))
        return
      }
    }

    // Save progress (onboarding_complete only set to true on final step)
    const isLastStep = currentStep === STEPS.length - 1
    const success = await saveProfile({}, isLastStep)

    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1)
    } else if (success) {
      // Complete onboarding and redirect to dashboard
      router.push('/dashboard')
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSkip = async () => {
    // For optional steps, just proceed
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      await saveProfile({})
      router.push('/dashboard')
    }
  }

  const handleAssessmentComplete = (answers: Record<string, string>, level: 'beginner' | 'intermediate' | 'advanced') => {
    setProfile((prev) => ({ ...prev, assessmentLevel: level }))
    handleNext()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <BrandLogo href="/" size="md" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          {/* Progress */}
          <div className="mb-8">
            <OnboardingProgress
              currentStep={currentStep}
              totalSteps={STEPS.length}
              labels={stepLabels}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Step Content */}
          <div className="min-h-[400px]">
            {currentStep === 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('onboarding.steps.year.title')}
                </h2>
                <p className="text-gray-600 mb-6">
                  {t('onboarding.steps.year.subtitle')}
                </p>
                <YearSelector
                  value={profile.targetYear}
                  onChange={(value) => {
                    setProfile((prev) => ({ ...prev, targetYear: value }))
                    setError(null)
                  }}
                />
              </div>
            )}

            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('onboarding.steps.assessment.title')}
                </h2>
                <p className="text-gray-600 mb-6">
                  {t('onboarding.steps.assessment.subtitle')}
                </p>
                <DiagnosticQuiz onComplete={handleAssessmentComplete} />
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('onboarding.steps.studyHours.title')}
                </h2>
                <p className="text-gray-600 mb-6">
                  {t('onboarding.steps.studyHours.subtitle')}
                </p>
                <StudyHoursSlider
                  value={profile.dailyStudyHours}
                  onChange={(value) => setProfile((prev) => ({ ...prev, dailyStudyHours: value }))}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('onboarding.steps.fitness.title')}
                </h2>
                <p className="text-gray-600 mb-6">
                  {t('onboarding.steps.fitness.subtitle')}
                </p>
                <FitnessBaselineForm
                  gender={profile.gender}
                  fitnessLevel={profile.fitnessLevel}
                  onGenderChange={(value) => setProfile((prev) => ({ ...prev, gender: value }))}
                  onFitnessLevelChange={(value) => setProfile((prev) => ({ ...prev, fitnessLevel: value }))}
                />
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0}
              className={clsx(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              {t('common.previous')}
            </button>

            <div className="flex gap-3">
              {currentStep < STEPS.length - 1 && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  {t('common.skip')}
                </button>
              )}
              
              <button
                type="button"
                onClick={handleNext}
                disabled={isSaving}
                className={clsx(
                  'px-6 py-2 rounded-lg font-medium transition-colors',
                  isSaving
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                )}
              >
                {isSaving
                  ? t('common.loading')
                  : currentStep === STEPS.length - 1
                  ? t('onboarding.complete')
                  : t('common.next')}
              </button>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {t('onboarding.requiredFields')}{' '}
          <span className="text-primary-600">{t('onboarding.optionalFields')}</span>
        </p>
      </main>
    </div>
  )
}
