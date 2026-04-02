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

  const handleAssessmentComplete = async (
    _answers: Record<string, string>,
    level: 'beginner' | 'intermediate' | 'advanced'
  ) => {
    setProfile((prev) => ({ ...prev, assessmentLevel: level }))

    const success = await saveProfile({ assessmentLevel: level })
    if (!success) {
      return
    }

    setCurrentStep((prev) => prev + 1)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#111827]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] font-sans text-[var(--text-main)] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b-2 border-[var(--border-light)] shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-center sm:justify-start">
          <BrandLogo href="/" size="md" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 flex flex-col justify-center max-w-3xl">
        <div className="card-brilliant p-8 md:p-12">
          {/* Progress */}
          <div className="mb-10">
            <OnboardingProgress
              currentStep={currentStep}
              totalSteps={STEPS.length}
              labels={stepLabels}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 px-4 py-3 bg-red-50 border-2 border-red-200 rounded-2xl text-red-600 text-sm font-bold flex items-center space-x-3">
              <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Step Content */}
          <div className="min-h-[380px]">
            {currentStep === 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="font-display text-3xl font-bold tracking-tight mb-3">
                  {t('onboarding.steps.year.title')}
                </h2>
                <p className="text-base text-[var(--text-muted)] font-medium mb-10">
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
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="font-display text-3xl font-bold tracking-tight mb-3">
                  {t('onboarding.steps.assessment.title')}
                </h2>
                <p className="text-base text-[var(--text-muted)] font-medium mb-10">
                  {t('onboarding.steps.assessment.subtitle')}
                </p>
                <DiagnosticQuiz onComplete={handleAssessmentComplete} />
              </div>
            )}

            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="font-display text-3xl font-bold tracking-tight mb-3">
                  {t('onboarding.steps.studyHours.title')}
                </h2>
                <p className="text-base text-[var(--text-muted)] font-medium mb-10">
                  {t('onboarding.steps.studyHours.subtitle')}
                </p>
                <StudyHoursSlider
                  value={profile.dailyStudyHours}
                  onChange={(value) => setProfile((prev) => ({ ...prev, dailyStudyHours: value }))}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="font-display text-3xl font-bold tracking-tight mb-3">
                  {t('onboarding.steps.fitness.title')}
                </h2>
                <p className="text-base text-[var(--text-muted)] font-medium mb-10">
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
          <div className="flex justify-between items-center mt-12 pt-8 border-t-2 border-[var(--border-light)]">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0}
              className={clsx(
                'btn-3d px-6 py-3 rounded-full text-sm disabled:opacity-30 disabled:pointer-events-none',
                currentStep === 0 ? 'bg-transparent text-gray-400' : 'btn-3d-white'
              )}
            >
              Back
            </button>

            <div className="flex gap-4 items-center">
              {currentStep < STEPS.length - 1 && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="font-bold text-[var(--text-muted)] hover:text-black transition-colors px-2 py-2"
                >
                  Skip
                </button>
              )}
              
              <button
                type="button"
                onClick={handleNext}
                disabled={isSaving}
                className={clsx(
                  'btn-3d px-8 py-3 rounded-full text-base',
                  isSaving
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'btn-3d-green'
                )}
              >
                {isSaving
                  ? 'Saving...'
                  : currentStep === STEPS.length - 1
                  ? 'Complete'
                  : 'Continue'}
              </button>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center font-bold text-sm text-[var(--text-muted)] mt-8">
          Need help? <span className="text-[var(--brilliant-blue)] cursor-pointer">View onboarding guide</span>
        </p>
      </main>
    </div>
  )
}
