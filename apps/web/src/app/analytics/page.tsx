'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Clock3,
  Target,
  TrendingUp,
} from 'lucide-react'
import { Sidebar } from '@/components/ui/Sidebar'
import { fetchCurrentUser } from '@/lib/auth'
import { analyticsApi, type AnalyticsResponse, type ExamReadinessResponse, type StageReadinessResponse, type UserStats } from '@/lib/api/analytics'

export default function AnalyticsPage() {
  const router = useRouter()
  const locale = 'en' as const
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState('Student')
  const [stats, setStats] = useState<UserStats | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null)
  const [examReadiness, setExamReadiness] = useState<ExamReadinessResponse | null>(null)
  const [stageReadiness, setStageReadiness] = useState<StageReadinessResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await fetchCurrentUser()
        if (!user) {
          router.push('/login')
          return
        }

        setUserName(user.name || user.email.split('@')[0] || 'Student')
        const [userStats, userAnalytics, readiness, stage] = await Promise.all([
          analyticsApi.getUserStats(),
          analyticsApi.getUserAnalytics(),
          analyticsApi.getExamReadiness(),
          analyticsApi.getStageReadiness(),
        ])
        setStats(userStats)
        setAnalytics(userAnalytics)
        setExamReadiness(readiness)
        setStageReadiness(stage)
      } catch {
        setError('Analytics are unavailable right now.')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#111827]" />
      </div>
      )
  }

  const metricCards = analytics && stats ? [
    {
      label: 'Questions Attempted',
      value: analytics.overall.total_questions_attempted.toLocaleString(),
      note: `${analytics.weak_chapters.length} weak topics flagged`,
      icon: Target,
    },
    {
      label: 'Accuracy Rate',
      value: `${Math.round(analytics.overall.overall_accuracy)}%`,
      note: analytics.overall.improvement_percentage != null
        ? `${analytics.overall.improvement_percentage >= 0 ? '+' : ''}${analytics.overall.improvement_percentage.toFixed(1)}% vs previous period`
        : 'Based on your recorded attempts',
      icon: TrendingUp,
    },
    {
      label: 'Study Hours',
      value: `${stats.total_study_hours.toFixed(1)}h`,
      note: `${stats.total_lessons_completed} lessons completed`,
      icon: Clock3,
    },
    {
      label: 'Mock Tests Taken',
      value: analytics.overall.total_mocks_taken.toLocaleString(),
      note: `${stats.current_streak} day current streak`,
      icon: CalendarDays,
    },
  ] : []

  const subjectPerformance = analytics?.subject_accuracy ?? []
  const focusAreas = analytics?.weak_chapters.slice(0, 3) ?? []

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="flex">
        <Sidebar locale={locale} />

        <main className="flex-1 lg:ml-0 p-4 lg:p-8 pt-16 lg:pt-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <section className="bg-white border border-[#EAEAEA] rounded-[12px] p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">
                    {userName}&apos;s Analytics
                  </h1>
                  <p className="mt-2 text-sm text-[#6B7280]">
                    Review study volume, subject progress, and the areas that still need attention.
                  </p>
                </div>
                <Link
                  href="/pyqs"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#111827] text-white rounded-[8px] hover:bg-black transition-colors text-sm font-medium"
                >
                  Continue Practice
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </section>

            {error && (
              <section className="bg-white border border-[#EAEAEA] rounded-[12px] p-6 shadow-sm">
                <p className="text-sm text-[#6B7280]">{error}</p>
              </section>
            )}

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {metricCards.map((card) => {
                const Icon = card.icon
                return (
                  <div key={card.label} className="bg-white border border-[#EAEAEA] rounded-[12px] p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#6B7280]">{card.label}</span>
                      <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#FAFAFA] border border-[#EAEAEA]">
                        <Icon className="w-4 h-4 text-[#111827]" />
                      </div>
                    </div>
                    <p className="mt-4 text-3xl font-semibold tracking-tight text-[#111827]">{card.value}</p>
                    <p className="mt-2 text-sm text-[#6B7280]">{card.note}</p>
                  </div>
                )
              })}
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
              <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <BarChart3 className="w-4 h-4 text-[#6B7280]" />
                  <h2 className="text-base font-semibold tracking-tight text-[#111827]">Subject Performance</h2>
                </div>
                {subjectPerformance.length === 0 ? (
                  <p className="text-sm text-[#6B7280]">No subject-level analytics available yet.</p>
                ) : (
                  <div className="space-y-5">
                    {subjectPerformance.map((item) => (
                    <div key={item.subject_id}>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium text-[#111827]">{item.subject_name}</span>
                        <span className="text-[#6B7280]">{Math.round(item.accuracy)}%</span>
                      </div>
                      <div className="h-2.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#111827] rounded-full"
                          style={{ width: `${Math.min(Math.round(item.accuracy), 100)}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs font-medium text-[#6B7280]">
                        {item.correct_answers}/{item.total_questions} correct
                        {item.trend_percentage != null ? ` • ${item.trend_percentage >= 0 ? '+' : ''}${item.trend_percentage.toFixed(1)}% trend` : ''}
                      </p>
                    </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-6 shadow-sm">
                <h2 className="text-base font-semibold tracking-tight text-[#111827] mb-5">Priority Focus</h2>
                {focusAreas.length === 0 ? (
                  <p className="text-sm text-[#6B7280]">No weak areas identified from your recent activity.</p>
                ) : (
                  <div className="space-y-4">
                    {focusAreas.map((area) => (
                    <div key={area.topic_id} className="p-4 bg-[#FAFAFA] border border-[#EAEAEA] rounded-[10px]">
                      <h3 className="text-sm font-semibold text-[#111827]">{area.topic_name}</h3>
                      <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
                        {area.subject_name} accuracy is {Math.round(area.accuracy)}% across {area.questions_attempted} attempts with {area.questions_incorrect} incorrect responses.
                      </p>
                    </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {(examReadiness || stageReadiness) && (
              <section className="grid gap-6 lg:grid-cols-2">
                {examReadiness && (
                  <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-6 shadow-sm">
                    <h2 className="text-base font-semibold tracking-tight text-[#111827]">Exam Readiness</h2>
                    <p className="mt-4 text-3xl font-semibold tracking-tight text-[#111827]">
                      {Math.round(examReadiness.overall_readiness)}%
                    </p>
                    <p className="mt-2 text-sm text-[#6B7280] capitalize">
                      {examReadiness.readiness_label.replace(/_/g, ' ')}
                    </p>
                  </div>
                )}
                {stageReadiness && (
                  <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-6 shadow-sm">
                    <h2 className="text-base font-semibold tracking-tight text-[#111827]">Stage Readiness</h2>
                    <div className="mt-4 space-y-2 text-sm text-[#6B7280]">
                      <p>PST: {Math.round(stageReadiness.pst_readiness)}%</p>
                      <p>PET: {Math.round(stageReadiness.pet_readiness)}%</p>
                      <p>Documents: {Math.round(stageReadiness.document_readiness)}%</p>
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
