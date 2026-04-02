'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import {
  Activity,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Timer,
  Ruler,
  Weight,
  Award,
  Plus,
  ChevronRight,
  Dumbbell,
  Zap,
  Heart,
} from 'lucide-react'
import { Sidebar } from '@/components/ui/Sidebar'
import { PhysicalPlansSection } from '@/components/physical/PhysicalPlansSection'
import { fetchCurrentUser } from '@/lib/auth'
import { getProfile } from '@/lib/api/users'
import {
  getPhysicalPlans,
  getPhysicalReadiness,
  getPSTRequirements,
  getPETRequirements,
  getEnduranceData,
  logPhysicalProgress,
  calculateMockPET,
  type PhysicalPlan,
  type PhysicalReadiness,
  type PSTRequirements,
  type PETRequirements,
  type EnduranceDataPoint,
  type MockPETResult,
} from '@/lib/api/physical'

type TabType = 'overview' | 'plans' | 'progress' | 'mock-test'

interface ProgressLogForm {
  activity_type: string
  duration_minutes: string
  distance_km: string
  pace_min_per_km: string
  notes: string
}

interface MockTestForm {
  height_cm: string
  chest_cm: string
  weight_kg: string
  run_time_minutes: string
  run_time_seconds: string
  long_jump_m: string
  high_jump_m: string
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'detail' in error.response.data &&
    typeof error.response.data.detail === 'string'
  ) {
    return error.response.data.detail
  }

  return fallback
}

export default function PhysicalPage() {
  const t = useTranslations()
  const router = useRouter()
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [userGender, setUserGender] = useState<'male' | 'female'>('male')
  const locale = 'en' as const
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  
  // Data states
  const [readiness, setReadiness] = useState<PhysicalReadiness | null>(null)
  const [pstRequirements, setPstRequirements] = useState<PSTRequirements | null>(null)
  const [petRequirements, setPetRequirements] = useState<PETRequirements | null>(null)
  const [plans, setPlans] = useState<PhysicalPlan[]>([])
  const [enduranceData, setEnduranceData] = useState<EnduranceDataPoint[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  
  // Form states
  const [progressForm, setProgressForm] = useState<ProgressLogForm>({
    activity_type: 'running',
    duration_minutes: '',
    distance_km: '',
    pace_min_per_km: '',
    notes: '',
  })
  const [mockTestForm, setMockTestForm] = useState<MockTestForm>({
    height_cm: '',
    chest_cm: '',
    weight_kg: '',
    run_time_minutes: '',
    run_time_seconds: '',
    long_jump_m: '',
    high_jump_m: '',
  })
  const [mockTestResult, setMockTestResult] = useState<MockPETResult | null>(null)
  const [isLoggingProgress, setIsLoggingProgress] = useState(false)
  const [isCalculatingMockTest, setIsCalculatingMockTest] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [progressError, setProgressError] = useState<string | null>(null)
  const [mockTestError, setMockTestError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await fetchCurrentUser()
        if (!user) {
          router.push('/login')
          return
        }

        // Get user profile for gender
        try {
          const profile = await getProfile()
          if (profile.gender === 'male' || profile.gender === 'female') {
            setUserGender(profile.gender)
          }
        } catch {
          // Use default gender
        }
      } catch {
        router.push('/login')
        return
      } finally {
        setIsAuthLoading(false)
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    const loadData = async () => {
      setIsDataLoading(true)
      setLoadError(null)

      try {
        const [readinessData, pstData, petData, plansData, endurance] = await Promise.allSettled([
          getPhysicalReadiness(),
          getPSTRequirements(),
          getPETRequirements(),
          getPhysicalPlans(),
          getEnduranceData(30),
        ])

        if (readinessData.status === 'fulfilled') {
          setReadiness(readinessData.value)
        }
        if (pstData.status === 'fulfilled') {
          setPstRequirements(pstData.value)
        }
        if (petData.status === 'fulfilled') {
          setPetRequirements(petData.value)
        }
        if (plansData.status === 'fulfilled') {
          setPlans(plansData.value)
        }
        if (endurance.status === 'fulfilled') {
          setEnduranceData(endurance.value)
        }

        if (
          readinessData.status === 'rejected' ||
          pstData.status === 'rejected' ||
          petData.status === 'rejected' ||
          plansData.status === 'rejected' ||
          endurance.status === 'rejected'
        ) {
          setLoadError('Some physical data could not be loaded. Available sections are still usable.')
        }
      } catch (error) {
        console.error('Failed to load physical data:', error)
        setLoadError('Physical data could not be loaded right now. Please refresh the page.')
      } finally {
        setIsDataLoading(false)
      }
    }
    
    if (!isAuthLoading) {
      loadData()
    }
  }, [isAuthLoading])

  const handleLogProgress = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoggingProgress(true)
    setSubmitSuccess(false)
    setProgressError(null)
    
    try {
      const duration = parseInt(progressForm.duration_minutes) || 0
      const distance = parseFloat(progressForm.distance_km) || 0
      const pace = parseFloat(progressForm.pace_min_per_km) || 0
      
      await logPhysicalProgress({
        activity_type: progressForm.activity_type,
        duration_minutes: duration || undefined,
        distance_km: distance || undefined,
        pace_min_per_km: pace || undefined,
        notes: progressForm.notes || undefined,
      })
      
      setSubmitSuccess(true)
      setProgressForm({
        activity_type: 'running',
        duration_minutes: '',
        distance_km: '',
        pace_min_per_km: '',
        notes: '',
      })
      
      // Refresh endurance data
      const newEndurance = await getEnduranceData(30)
      setEnduranceData(newEndurance)
    } catch (error) {
      console.error('Failed to log progress:', error)
      setProgressError(getErrorMessage(error, 'Training session could not be logged. Please check your values and try again.'))
    } finally {
      setIsLoggingProgress(false)
    }
  }

  const handleMockTest = async (e: FormEvent) => {
    e.preventDefault()
    setIsCalculatingMockTest(true)
    setMockTestResult(null)
    setMockTestError(null)
    
    try {
      const runMinutes = parseInt(mockTestForm.run_time_minutes) || 0
      const runSeconds = parseInt(mockTestForm.run_time_seconds) || 0
      const runTimeSeconds = runMinutes * 60 + runSeconds
      
      const result = await calculateMockPET({
        height_cm: parseFloat(mockTestForm.height_cm) || undefined,
        chest_cm: userGender === 'male' ? parseFloat(mockTestForm.chest_cm) || undefined : undefined,
        weight_kg: parseFloat(mockTestForm.weight_kg) || undefined,
        run_time_seconds: runTimeSeconds || undefined,
        long_jump_m: parseFloat(mockTestForm.long_jump_m) || undefined,
        high_jump_m: parseFloat(mockTestForm.high_jump_m) || undefined,
      })
      
      setMockTestResult(result)
    } catch (error) {
      console.error('Failed to calculate mock test:', error)
      setMockTestError(getErrorMessage(error, 'Mock test could not be calculated. Please review your inputs and try again.'))
    } finally {
      setIsCalculatingMockTest(false)
    }
  }

  const handleProgressFormChange = (field: keyof ProgressLogForm, value: string) => {
    setProgressError(null)
    setSubmitSuccess(false)
    setProgressForm(prev => ({ ...prev, [field]: value }))
  }

  const handleMockTestFormChange = (field: keyof MockTestForm, value: string) => {
    setMockTestError(null)
    setMockTestForm(prev => ({ ...prev, [field]: value }))
  }

  if (isAuthLoading || isDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#111827]" />
      </div>
    )
  }

  const maxDistance = enduranceData.reduce((max, point) => Math.max(max, point.distance_km), 0)
  const tabs = [
    { id: 'overview' as const, label: t('physical.tabs.overview'), icon: Activity },
    { id: 'plans' as const, label: t('physical.tabs.plans'), icon: Dumbbell },
    { id: 'progress' as const, label: t('physical.tabs.progress'), icon: TrendingUp },
    { id: 'mock-test' as const, label: t('physical.tabs.mockTest'), icon: Award },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg-page)] font-sans text-[var(--text-main)] flex flex-col md:flex-row">
      <Sidebar locale={locale} />
      
      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-10 pt-20 lg:pt-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto mb-20">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 text-[var(--text-muted)] hover:text-black rounded-full transition-colors border-2 border-[var(--border-light)]"
              aria-label="Back to dashboard"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--text-main)]">
              {t('physical.title')}
            </h1>
          </div>

          {loadError && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
              {loadError}
            </div>
          )}

          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all border-2 ${
                      activeTab === tab.id
                        ? 'bg-[var(--text-main)] text-white border-black shadow-md'
                        : 'bg-white border-[var(--border-light)] text-[var(--text-muted)] hover:bg-gray-50 hover:text-black'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Readiness Overview */}
                <div className="card-brilliant p-8">
                  <h2 className="font-display text-xl font-bold tracking-tight text-[var(--text-main)] mb-6">{t('physical.readiness.title')}</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl border-2 border-[var(--border-light)] bg-gray-50 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-[var(--text-main)] block mb-1">{t('physical.readiness.pst')}</span>
                        <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">
                          {readiness?.pst_complete ? t('common.completed') : t('common.pending')}
                        </p>
                      </div>
                      <div className={`p-2 rounded-xl ${readiness?.pst_complete ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-500'}`}>
                        {readiness?.pst_complete ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl border-2 border-[var(--border-light)] bg-gray-50 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-[var(--text-main)] block mb-1">{t('physical.readiness.pet')}</span>
                        <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">
                          {readiness?.pet_complete ? t('common.completed') : t('common.pending')}
                        </p>
                      </div>
                      <div className={`p-2 rounded-xl ${readiness?.pet_complete ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-500'}`}>
                        {readiness?.pet_complete ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl border-2 border-[var(--border-light)] bg-gray-50 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-[var(--text-main)] block mb-1">{t('physical.readiness.height')}</span>
                        <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">
                          {readiness?.height_measured ? t('common.measured') : t('common.notMeasured')}
                        </p>
                      </div>
                      <div className="p-2 rounded-xl bg-blue-50 text-blue-500">
                        <Ruler className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl border-2 border-[var(--border-light)] bg-gray-50 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-[var(--text-main)] block mb-1">{t('physical.readiness.weight')}</span>
                        <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">
                          {readiness?.weight_measured ? t('common.measured') : t('common.notMeasured')}
                        </p>
                      </div>
                      <div className="p-2 rounded-xl bg-purple-50 text-purple-500">
                        <Weight className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                  {readiness && (
                    <div className="mt-8 pt-6 border-t-2 border-[var(--border-light)]">
                      <div className="flex justify-between font-bold text-[var(--text-main)] mb-3">
                        <span className="text-[var(--text-muted)] uppercase tracking-wider">{t('physical.readiness.overall')}</span>
                        <span className="text-2xl font-display text-[var(--brilliant-blue)] leading-none">{readiness.overall_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-100 border border-[var(--border-light)] rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-[var(--brilliant-green)] h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${readiness.overall_percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* PST Requirements */}
                <div className="card-brilliant p-8">
                  <h2 className="font-display text-xl font-bold tracking-tight text-[var(--text-main)] mb-6">{t('physical.pst.title')}</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="card-brilliant p-6 border-none ring-2 ring-transparent bg-gray-50">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600"><Ruler className="w-5 h-5" /></div>
                        <span className="font-bold text-[var(--text-muted)]">{t('physical.pst.height')}</span>
                      </div>
                      <p className="text-3xl font-display font-bold tracking-tight text-[var(--text-main)]">
                        {pstRequirements?.height_cm_min} cm
                      </p>
                      <p className="text-xs font-bold bg-white inline-block px-2.5 py-1 mt-3 rounded border border-gray-200 text-gray-500 uppercase tracking-widest">{t('physical.pst.minimum')}</p>
                    </div>
                    {userGender === 'male' && pstRequirements?.chest_cm_min && (
                      <div className="card-brilliant p-6 border-none ring-2 ring-transparent bg-gray-50">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2.5 rounded-xl bg-green-100 text-green-600"><Activity className="w-5 h-5" /></div>
                          <span className="font-bold text-[var(--text-muted)]">{t('physical.pst.chest')}</span>
                        </div>
                        <p className="text-3xl font-display font-bold tracking-tight text-[var(--text-main)]">
                          {pstRequirements.chest_cm_min} cm
                        </p>
                        <p className="text-xs font-bold bg-white inline-block px-2.5 py-1 mt-3 rounded border border-gray-200 text-gray-500 uppercase tracking-widest">
                          + {pstRequirements.chest_expansion_cm} cm {t('physical.pst.expansion')}
                        </p>
                      </div>
                    )}
                    <div className="card-brilliant p-6 border-none ring-2 ring-transparent bg-gray-50">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600"><Weight className="w-5 h-5" /></div>
                        <span className="font-bold text-[var(--text-muted)]">{t('physical.pst.weight')}</span>
                      </div>
                      <p className="text-2xl md:text-3xl font-display font-bold tracking-tight text-[var(--text-main)]">
                        {pstRequirements?.weight_kg_note || t('physical.pst.proportionate')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* PET Requirements */}
                <div className="bg-white rounded-[12px] p-6 shadow-sm border border-[#EAEAEA]">
                  <h2 className="text-[15px] font-semibold tracking-tight text-[#111827] mb-5">{t('physical.pet.title')}</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="p-5 bg-white border border-[#EAEAEA] rounded-[8px] hover:border-gray-300 transition-colors">
                      <div className="flex items-center gap-2 mb-3">
                        <Timer className="w-4 h-4 text-[#9CA3AF]" />
                        <span className="font-medium text-sm text-[#6B7280]">{t('physical.pet.run')}</span>
                      </div>
                      <p className="text-2xl font-bold tracking-tight text-[#111827]">
                        {petRequirements?.run_distance_km} km
                      </p>
                      <p className="text-[11px] uppercase tracking-wider font-semibold text-[#9CA3AF] mt-1">
                        {t('physical.pet.maxTime')}: {Math.floor((petRequirements?.run_time_seconds_max || 0) / 60)}:{((petRequirements?.run_time_seconds_max || 0) % 60).toString().padStart(2, '0')}
                      </p>
                    </div>
                    <div className="p-5 bg-white border border-[#EAEAEA] rounded-[8px] hover:border-gray-300 transition-colors">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-[#9CA3AF]" />
                        <span className="font-medium text-sm text-[#6B7280]">{t('physical.pet.longJump')}</span>
                      </div>
                      <p className="text-2xl font-bold tracking-tight text-[#111827]">
                        {petRequirements?.long_jump_m_min} m
                      </p>
                      <p className="text-[11px] uppercase tracking-wider font-semibold text-[#9CA3AF] mt-1">{t('physical.pet.minimum')}</p>
                    </div>
                    <div className="p-5 bg-white border border-[#EAEAEA] rounded-[8px] hover:border-gray-300 transition-colors">
                      <div className="flex items-center gap-2 mb-3">
                        <Heart className="w-4 h-4 text-[#9CA3AF]" />
                        <span className="font-medium text-sm text-[#6B7280]">{t('physical.pet.highJump')}</span>
                      </div>
                      <p className="text-2xl font-bold tracking-tight text-[#111827]">
                        {petRequirements?.high_jump_m_min} m
                      </p>
                      <p className="text-[11px] uppercase tracking-wider font-semibold text-[#9CA3AF] mt-1">{t('physical.pet.minimum')}</p>
                    </div>
                    <div className="p-5 bg-white border border-[#EAEAEA] rounded-[8px] hover:border-gray-300 transition-colors">
                      <div className="flex items-center gap-2 mb-3">
                        <Activity className="w-4 h-4 text-[#9CA3AF]" />
                        <span className="font-medium text-sm text-[#6B7280]">{t('physical.pet.gender')}</span>
                      </div>
                      <p className="text-2xl font-bold tracking-tight text-[#111827] capitalize">
                        {userGender}
                      </p>
                      <p className="text-[11px] uppercase tracking-wider font-semibold text-[#9CA3AF] mt-1">{t('physical.pet.genderSpecific')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Plans Tab */}
            {activeTab === 'plans' && (
              <div className="space-y-6">
                <PhysicalPlansSection plans={plans} t={t} />
              </div>
            )}

            {/* Progress Tab */}
            {activeTab === 'progress' && (
              <div className="space-y-6">
                {/* Log Progress Form */}
                <div className="bg-white rounded-[12px] p-6 shadow-sm border border-[#EAEAEA]">
                  <h2 className="text-[15px] font-semibold tracking-tight text-[#111827] mb-5">{t('physical.progress.logSession')}</h2>
                  <form onSubmit={handleLogProgress} className="space-y-5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-2">
                          {t('physical.progress.activityType')}
                        </label>
                        <select
                          value={progressForm.activity_type}
                          onChange={(e) => handleProgressFormChange('activity_type', e.target.value)}
                          className="w-full px-3 py-2.5 bg-white border border-[#EAEAEA] rounded-[8px] text-sm text-[#111827] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] transition-shadow"
                        >
                          <option value="running">{t('physical.activity.running')}</option>
                          <option value="strength">{t('physical.activity.strength')}</option>
                          <option value="flexibility">{t('physical.activity.flexibility')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-2">
                          {t('physical.progress.duration')}
                        </label>
                        <input
                          type="number"
                          value={progressForm.duration_minutes}
                          onChange={(e) => handleProgressFormChange('duration_minutes', e.target.value)}
                          placeholder="30"
                          className="w-full px-3 py-2.5 bg-white border border-[#EAEAEA] rounded-[8px] text-sm text-[#111827] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] transition-shadow"
                        />
                      </div>
                      {progressForm.activity_type === 'running' && (
                        <>
                          <div>
                            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-2">
                              {t('physical.progress.distance')} (km)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={progressForm.distance_km}
                              onChange={(e) => handleProgressFormChange('distance_km', e.target.value)}
                              placeholder="5.0"
                              className="w-full px-3 py-2.5 bg-white border border-[#EAEAEA] rounded-[8px] text-sm text-[#111827] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] transition-shadow"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-2">
                              {t('physical.progress.pace')} (min/km)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={progressForm.pace_min_per_km}
                              onChange={(e) => handleProgressFormChange('pace_min_per_km', e.target.value)}
                              placeholder="6.0"
                              className="w-full px-3 py-2.5 bg-white border border-[#EAEAEA] rounded-[8px] text-sm text-[#111827] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] transition-shadow"
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-2">
                        {t('physical.progress.notes')}
                      </label>
                      <textarea
                        value={progressForm.notes}
                        onChange={(e) => handleProgressFormChange('notes', e.target.value)}
                        placeholder={t('physical.progress.notesPlaceholder')}
                        className="w-full px-3 py-2.5 bg-white border border-[#EAEAEA] rounded-[8px] text-sm text-[#111827] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] transition-shadow"
                        rows={3}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoggingProgress}
                      className="w-full py-2.5 bg-[#111827] text-white rounded-[8px] font-medium hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {isLoggingProgress ? t('common.submitting') : t('physical.progress.log')}
                    </button>
                    {submitSuccess && (
                      <p className="text-green-600 text-sm font-medium">{t('physical.progress.loggedSuccess')}</p>
                    )}
                    {progressError && (
                      <p className="text-sm font-medium text-red-600">{progressError}</p>
                    )}
                  </form>
                </div>

                {/* Endurance Chart */}
                <div className="card-brilliant p-8">
                  <h2 className="font-display text-xl font-bold tracking-tight text-[var(--text-main)] mb-6 border-b-2 border-[var(--border-light)] pb-4">{t('physical.progress.endurance.title')}</h2>
                  {enduranceData.length > 0 ? (
                    <div className="space-y-4">
                      {/* Simple chart representation */}
                      <div className="h-48 flex items-end gap-2 px-2">
                        {enduranceData.map((point, index) => (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-[var(--brilliant-blue)] hover:bg-[var(--brilliant-green)] rounded-t-xl transition-colors"
                              style={{
                                height: `${maxDistance > 0 ? Math.min((point.distance_km / maxDistance) * 100, 100) : 0}%`,
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-sm text-[var(--text-muted)] font-bold pt-4 px-2">
                        <span>{t('physical.progress.endurance.30days')}</span>
                        <span className="text-[var(--text-main)] font-extrabold bg-gray-100 px-3 py-1.5 rounded-lg border border-[var(--border-light)]">
                          {t('physical.progress.endurance.total')}: {enduranceData.reduce((sum, d) => sum + d.distance_km, 0).toFixed(1)} km
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="font-bold text-[var(--text-muted)] text-center py-10 bg-gray-50 border-2 border-[var(--border-light)] rounded-2xl">
                      {t('physical.progress.endurance.noData')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Mock Test Tab */}
            {activeTab === 'mock-test' && (
              <div className="space-y-6">
                {/* Mock Test Form */}
                <div className="bg-white rounded-[12px] p-6 shadow-sm border border-[#EAEAEA]">
                  <h2 className="text-[15px] font-semibold tracking-tight text-[#111827] mb-5">{t('physical.mockTest.title')}</h2>
                  <form onSubmit={handleMockTest} className="space-y-5">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-2">
                          {t('physical.mockTest.height')} (cm)
                        </label>
                        <input
                          type="number"
                          value={mockTestForm.height_cm}
                          onChange={(e) => handleMockTestFormChange('height_cm', e.target.value)}
                          placeholder={pstRequirements?.height_cm_min?.toString() || '170'}
                          className="w-full px-3 py-2.5 bg-white border border-[#EAEAEA] rounded-[8px] text-sm text-[#111827] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] transition-shadow"
                        />
                      </div>
                      {userGender === 'male' && (
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-2">
                            {t('physical.mockTest.chest')} (cm)
                          </label>
                          <input
                            type="number"
                            value={mockTestForm.chest_cm}
                            onChange={(e) => handleMockTestFormChange('chest_cm', e.target.value)}
                            placeholder={pstRequirements?.chest_cm_min?.toString() || '80'}
                            className="w-full px-3 py-2.5 bg-white border border-[#EAEAEA] rounded-[8px] text-sm text-[#111827] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] transition-shadow"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-2">
                          {t('physical.mockTest.weight')} (kg)
                        </label>
                        <input
                          type="number"
                          value={mockTestForm.weight_kg}
                          onChange={(e) => handleMockTestFormChange('weight_kg', e.target.value)}
                          placeholder="70"
                          className="w-full px-3 py-2.5 bg-white border border-[#EAEAEA] rounded-[8px] text-sm text-[#111827] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] transition-shadow"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-2">
                          {userGender === 'male' ? '1.5km' : '800m'} {t('physical.mockTest.runTime')}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={mockTestForm.run_time_minutes}
                            onChange={(e) => handleMockTestFormChange('run_time_minutes', e.target.value)}
                            placeholder={userGender === 'male' ? '7' : '4'}
                            className="w-full px-3 py-2.5 bg-white border border-[#EAEAEA] rounded-[8px] text-sm text-[#111827] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] transition-shadow"
                          />
                          <span className="self-center font-bold text-[#111827]">:</span>
                          <input
                            type="number"
                            value={mockTestForm.run_time_seconds}
                            onChange={(e) => handleMockTestFormChange('run_time_seconds', e.target.value)}
                            placeholder="0"
                            className="w-full px-3 py-2.5 bg-white border border-[#EAEAEA] rounded-[8px] text-sm text-[#111827] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] transition-shadow"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-2">
                          {t('physical.mockTest.longJump')} (m)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={mockTestForm.long_jump_m}
                          onChange={(e) => handleMockTestFormChange('long_jump_m', e.target.value)}
                          placeholder={petRequirements?.long_jump_m_min?.toString() || '2.65'}
                          className="w-full px-3 py-2.5 bg-white border border-[#EAEAEA] rounded-[8px] text-sm text-[#111827] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] transition-shadow"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-2">
                          {t('physical.mockTest.highJump')} (m)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={mockTestForm.high_jump_m}
                          onChange={(e) => handleMockTestFormChange('high_jump_m', e.target.value)}
                          placeholder={petRequirements?.high_jump_m_min?.toString() || '1.20'}
                          className="w-full px-3 py-2.5 bg-white border border-[#EAEAEA] rounded-[8px] text-sm text-[#111827] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] transition-shadow"
                        />
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isCalculatingMockTest}
                      className="w-full py-2.5 bg-[#111827] text-white rounded-[8px] font-medium hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Award className="w-4 h-4" />
                      {isCalculatingMockTest ? t('common.submitting') : t('physical.mockTest.calculate')}
                    </button>
                    {mockTestError && (
                      <p className="text-sm font-medium text-red-600">{mockTestError}</p>
                    )}
                  </form>
                </div>

                {/* Mock Test Results */}
                {mockTestResult && (
                  <div className="bg-white rounded-[12px] p-6 shadow-sm border border-[#EAEAEA]">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-[15px] font-semibold tracking-tight text-[#111827]">{t('physical.mockTest.results')}</h2>
                      <div className={`px-4 py-2 rounded-[8px] border ${mockTestResult.overall_passed ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        <span className="font-bold tracking-tight text-xl">{mockTestResult.score}%</span>
                        <span className="ml-2 font-medium text-sm">{mockTestResult.overall_passed ? t('common.passed') : t('common.failed')}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      {mockTestResult.stations.map((station, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-[8px] border flex items-center justify-between ${
                            station.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div>
                            <h3 className={`font-semibold text-sm ${station.passed ? 'text-green-800' : 'text-red-800'}`}>{station.station_name}</h3>
                            <p className={`text-xs mt-1 ${station.passed ? 'text-green-700' : 'text-red-700'}`}>{station.requirement}</p>
                          </div>
                          <div className="text-right">
                            {station.user_value !== undefined && (
                              <p className={`text-lg font-bold tracking-tight ${station.passed ? 'text-green-800' : 'text-red-800'}`}>
                                {station.user_value} {station.unit}
                              </p>
                            )}
                            {station.passed !== undefined && (
                              station.passed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto mt-1" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-600 ml-auto mt-1" />
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {mockTestResult.recommendations.length > 0 && (
                      <div className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-[8px] p-5">
                        <h3 className="font-semibold text-sm text-[#111827] mb-3">{t('physical.mockTest.recommendations')}</h3>
                        <ul className="list-disc list-inside space-y-2 text-sm text-[#6B7280]">
                          {mockTestResult.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
