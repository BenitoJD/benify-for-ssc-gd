'use client'

import { useEffect, useState } from 'react'
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

export default function PhysicalPage() {
  const t = useTranslations()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userGender, setUserGender] = useState<'male' | 'female'>('male')
  const locale: 'en' = 'en'
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  
  // Data states
  const [readiness, setReadiness] = useState<PhysicalReadiness | null>(null)
  const [pstRequirements, setPstRequirements] = useState<PSTRequirements | null>(null)
  const [petRequirements, setPetRequirements] = useState<PETRequirements | null>(null)
  const [plans, setPlans] = useState<PhysicalPlan[]>([])
  const [enduranceData, setEnduranceData] = useState<EnduranceDataPoint[]>([])
  
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

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
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Load data based on active tab
  useEffect(() => {
    const loadData = async () => {
      try {
        const [readinessData, pstData, petData, plansData, endurance] = await Promise.all([
          getPhysicalReadiness(),
          getPSTRequirements(),
          getPETRequirements(),
          getPhysicalPlans(),
          getEnduranceData(30),
        ])
        
        setReadiness(readinessData)
        setPstRequirements(pstData)
        setPetRequirements(petData)
        setPlans(plansData)
        setEnduranceData(endurance)
      } catch (error) {
        console.error('Failed to load physical data:', error)
      }
    }
    
    if (!isLoading) {
      loadData()
    }
  }, [isLoading])

  const handleLogProgress = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitSuccess(false)
    
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
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMockTest = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMockTestResult(null)
    
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
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProgressFormChange = (field: keyof ProgressLogForm, value: string) => {
    setProgressForm(prev => ({ ...prev, [field]: value }))
  }

  const handleMockTestFormChange = (field: keyof MockTestForm, value: string) => {
    setMockTestForm(prev => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  const tabs = [
    { id: 'overview' as const, label: t('physical.tabs.overview'), icon: Activity },
    { id: 'plans' as const, label: t('physical.tabs.plans'), icon: Dumbbell },
    { id: 'progress' as const, label: t('physical.tabs.progress'), icon: TrendingUp },
    { id: 'mock-test' as const, label: t('physical.tabs.mockTest'), icon: Award },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <div className="text-xl font-bold text-primary-600">
              {t('physical.title')}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <Sidebar locale={locale} />
        
        {/* Main Content */}
        <main className="flex-1 lg:ml-0 p-4 lg:p-8 pt-16 lg:pt-8">
          <div className="max-w-7xl mx-auto">
            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
                      activeTab === tab.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Readiness Overview */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">{t('physical.readiness.title')}</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className={`p-4 rounded-lg ${readiness?.pst_complete ? 'bg-green-50' : 'bg-yellow-50'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {readiness?.pst_complete ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-yellow-600" />
                        )}
                        <span className="font-medium">{t('physical.readiness.pst')}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {readiness?.pst_complete ? t('common.completed') : t('common.pending')}
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg ${readiness?.pet_complete ? 'bg-green-50' : 'bg-yellow-50'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {readiness?.pet_complete ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-yellow-600" />
                        )}
                        <span className="font-medium">{t('physical.readiness.pet')}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {readiness?.pet_complete ? t('common.completed') : t('common.pending')}
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg ${readiness?.height_measured ? 'bg-green-50' : 'bg-yellow-50'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Ruler className={`w-5 h-5 ${readiness?.height_measured ? 'text-green-600' : 'text-yellow-600'}`} />
                        <span className="font-medium">{t('physical.readiness.height')}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {readiness?.height_measured ? t('common.measured') : t('common.notMeasured')}
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg ${readiness?.weight_measured ? 'bg-green-50' : 'bg-yellow-50'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Weight className={`w-5 h-5 ${readiness?.weight_measured ? 'text-green-600' : 'text-yellow-600'}`} />
                        <span className="font-medium">{t('physical.readiness.weight')}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {readiness?.weight_measured ? t('common.measured') : t('common.notMeasured')}
                      </p>
                    </div>
                  </div>
                  {readiness && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{t('physical.readiness.overall')}</span>
                        <span className="font-medium">{readiness.overall_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{ width: `${readiness.overall_percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* PST Requirements */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">{t('physical.pst.title')}</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Ruler className="w-5 h-5 text-gray-600" />
                        <span className="font-medium">{t('physical.pst.height')}</span>
                      </div>
                      <p className="text-2xl font-bold text-primary-600">
                        {pstRequirements?.height_cm_min} cm
                      </p>
                      <p className="text-sm text-gray-500">{t('physical.pst.minimum')}</p>
                    </div>
                    {userGender === 'male' && pstRequirements?.chest_cm_min && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-5 h-5 text-gray-600" />
                          <span className="font-medium">{t('physical.pst.chest')}</span>
                        </div>
                        <p className="text-2xl font-bold text-primary-600">
                          {pstRequirements.chest_cm_min} cm
                        </p>
                        <p className="text-sm text-gray-500">
                          + {pstRequirements.chest_expansion_cm} cm {t('physical.pst.expansion')}
                        </p>
                      </div>
                    )}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Weight className="w-5 h-5 text-gray-600" />
                        <span className="font-medium">{t('physical.pst.weight')}</span>
                      </div>
                      <p className="text-lg font-bold text-primary-600">
                        {pstRequirements?.weight_kg_note || t('physical.pst.proportionate')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* PET Requirements */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">{t('physical.pet.title')}</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Timer className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">{t('physical.pet.run')}</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        {petRequirements?.run_distance_km} km
                      </p>
                      <p className="text-sm text-gray-600">
                        {t('physical.pet.maxTime')}: {Math.floor((petRequirements?.run_time_seconds_max || 0) / 60)}:{((petRequirements?.run_time_seconds_max || 0) % 60).toString().padStart(2, '0')}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-green-600" />
                        <span className="font-medium">{t('physical.pet.longJump')}</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {petRequirements?.long_jump_m_min} m
                      </p>
                      <p className="text-sm text-gray-500">{t('physical.pet.minimum')}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">{t('physical.pet.highJump')}</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">
                        {petRequirements?.high_jump_m_min} m
                      </p>
                      <p className="text-sm text-gray-500">{t('physical.pet.minimum')}</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-5 h-5 text-orange-600" />
                        <span className="font-medium">{t('physical.pet.gender')}</span>
                      </div>
                      <p className="text-2xl font-bold text-orange-600 capitalize">
                        {userGender}
                      </p>
                      <p className="text-sm text-gray-500">{t('physical.pet.genderSpecific')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Plans Tab */}
            {activeTab === 'plans' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">{t('physical.plans.title')}</h2>
                  <select className="border rounded-lg px-3 py-2">
                    <option value="">{t('physical.plans.allTypes')}</option>
                    <option value="running">{t('physical.plans.running')}</option>
                    <option value="strength">{t('physical.plans.strength')}</option>
                    <option value="flexibility">{t('physical.plans.flexibility')}</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {plans.map((plan) => (
                    <div key={plan.id} className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{plan.title}</h3>
                          <p className="text-sm text-gray-500">{plan.description}</p>
                        </div>
                        {plan.is_premium && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            Free Access
                          </span>
                        )}
                      </div>
                      <div className="flex gap-4 text-sm text-gray-600 mb-4">
                        <span className="flex items-center gap-1">
                          <Activity className="w-4 h-4" />
                          {plan.plan_type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Timer className="w-4 h-4" />
                          {plan.duration_weeks} {t('physical.plans.weeks')}
                        </span>
                        {plan.difficulty_level && (
                          <span className="flex items-center gap-1">
                            <Zap className="w-4 h-4" />
                            {plan.difficulty_level}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => router.push(`/physical/plans/${plan.id}`)}
                        className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition"
                      >
                        {t('physical.plans.viewPlan')}
                      </button>
                    </div>
                  ))}
                </div>
                
                {plans.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('physical.plans.noPlans')}</p>
                  </div>
                )}
              </div>
            )}

            {/* Progress Tab */}
            {activeTab === 'progress' && (
              <div className="space-y-6">
                {/* Log Progress Form */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">{t('physical.progress.logSession')}</h2>
                  <form onSubmit={handleLogProgress} className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('physical.progress.activityType')}
                        </label>
                        <select
                          value={progressForm.activity_type}
                          onChange={(e) => handleProgressFormChange('activity_type', e.target.value)}
                          className="w-full border rounded-lg px-3 py-2"
                        >
                          <option value="running">{t('physical.activity.running')}</option>
                          <option value="strength">{t('physical.activity.strength')}</option>
                          <option value="flexibility">{t('physical.activity.flexibility')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('physical.progress.duration')}
                        </label>
                        <input
                          type="number"
                          value={progressForm.duration_minutes}
                          onChange={(e) => handleProgressFormChange('duration_minutes', e.target.value)}
                          placeholder="30"
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                      {progressForm.activity_type === 'running' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t('physical.progress.distance')} (km)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={progressForm.distance_km}
                              onChange={(e) => handleProgressFormChange('distance_km', e.target.value)}
                              placeholder="5.0"
                              className="w-full border rounded-lg px-3 py-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t('physical.progress.pace')} (min/km)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={progressForm.pace_min_per_km}
                              onChange={(e) => handleProgressFormChange('pace_min_per_km', e.target.value)}
                              placeholder="6.0"
                              className="w-full border rounded-lg px-3 py-2"
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('physical.progress.notes')}
                      </label>
                      <textarea
                        value={progressForm.notes}
                        onChange={(e) => handleProgressFormChange('notes', e.target.value)}
                        placeholder={t('physical.progress.notesPlaceholder')}
                        className="w-full border rounded-lg px-3 py-2"
                        rows={3}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      {isSubmitting ? t('common.submitting') : t('physical.progress.log')}
                    </button>
                    {submitSuccess && (
                      <p className="text-green-600">{t('physical.progress.loggedSuccess')}</p>
                    )}
                  </form>
                </div>

                {/* Endurance Chart */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">{t('physical.progress.endurance.title')}</h2>
                  {enduranceData.length > 0 ? (
                    <div className="space-y-4">
                      {/* Simple chart representation */}
                      <div className="h-48 flex items-end gap-2">
                        {enduranceData.map((point, index) => (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-primary-500 rounded-t"
                              style={{
                                height: `${Math.min((point.distance_km / Math.max(...enduranceData.map(d => d.distance_km))) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{t('physical.progress.endurance.30days')}</span>
                        <span>
                          {t('physical.progress.endurance.total')}: {enduranceData.reduce((sum, d) => sum + d.distance_km, 0).toFixed(1)} km
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
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
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">{t('physical.mockTest.title')}</h2>
                  <form onSubmit={handleMockTest} className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('physical.mockTest.height')} (cm)
                        </label>
                        <input
                          type="number"
                          value={mockTestForm.height_cm}
                          onChange={(e) => handleMockTestFormChange('height_cm', e.target.value)}
                          placeholder={pstRequirements?.height_cm_min?.toString() || '170'}
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                      {userGender === 'male' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('physical.mockTest.chest')} (cm)
                          </label>
                          <input
                            type="number"
                            value={mockTestForm.chest_cm}
                            onChange={(e) => handleMockTestFormChange('chest_cm', e.target.value)}
                            placeholder={pstRequirements?.chest_cm_min?.toString() || '80'}
                            className="w-full border rounded-lg px-3 py-2"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('physical.mockTest.weight')} (kg)
                        </label>
                        <input
                          type="number"
                          value={mockTestForm.weight_kg}
                          onChange={(e) => handleMockTestFormChange('weight_kg', e.target.value)}
                          placeholder="70"
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {userGender === 'male' ? '1.5km' : '800m'} {t('physical.mockTest.runTime')}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={mockTestForm.run_time_minutes}
                            onChange={(e) => handleMockTestFormChange('run_time_minutes', e.target.value)}
                            placeholder={userGender === 'male' ? '7' : '4'}
                            className="w-full border rounded-lg px-3 py-2"
                          />
                          <span className="self-center">:</span>
                          <input
                            type="number"
                            value={mockTestForm.run_time_seconds}
                            onChange={(e) => handleMockTestFormChange('run_time_seconds', e.target.value)}
                            placeholder="0"
                            className="w-full border rounded-lg px-3 py-2"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('physical.mockTest.longJump')} (m)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={mockTestForm.long_jump_m}
                          onChange={(e) => handleMockTestFormChange('long_jump_m', e.target.value)}
                          placeholder={petRequirements?.long_jump_m_min?.toString() || '2.65'}
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('physical.mockTest.highJump')} (m)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={mockTestForm.high_jump_m}
                          onChange={(e) => handleMockTestFormChange('high_jump_m', e.target.value)}
                          placeholder={petRequirements?.high_jump_m_min?.toString() || '1.20'}
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                    >
                      <Award className="w-4 h-4" />
                      {isSubmitting ? t('common.submitting') : t('physical.mockTest.calculate')}
                    </button>
                  </form>
                </div>

                {/* Mock Test Results */}
                {mockTestResult && (
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold">{t('physical.mockTest.results')}</h2>
                      <div className={`px-4 py-2 rounded-lg ${mockTestResult.overall_passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        <span className="font-bold text-2xl">{mockTestResult.score}%</span>
                        <span className="ml-2">{mockTestResult.overall_passed ? t('common.passed') : t('common.failed')}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      {mockTestResult.stations.map((station, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg flex items-center justify-between ${
                            station.passed ? 'bg-green-50' : 'bg-red-50'
                          }`}
                        >
                          <div>
                            <h3 className="font-medium">{station.station_name}</h3>
                            <p className="text-sm text-gray-600">{station.requirement}</p>
                          </div>
                          <div className="text-right">
                            {station.user_value !== undefined && (
                              <p className="text-2xl font-bold">
                                {station.user_value} {station.unit}
                              </p>
                            )}
                            {station.passed !== undefined && (
                              station.passed ? (
                                <CheckCircle2 className="w-6 h-6 text-green-600 ml-auto" />
                              ) : (
                                <XCircle className="w-6 h-6 text-red-600 ml-auto" />
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {mockTestResult.recommendations.length > 0 && (
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <h3 className="font-medium mb-2">{t('physical.mockTest.recommendations')}</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm">
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
        </main>
      </div>
    </div>
  )
}
