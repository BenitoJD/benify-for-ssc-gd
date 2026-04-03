'use client'

import { useEffect, useState, useCallback } from 'react'
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

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const user = await fetchCurrentUser()
      if (!user) {
        router.replace('/login')
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
  }, [router])

  useEffect(() => {
    void loadAnalytics()
  }, [loadAnalytics])

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
    <div className="min-h-screen bg-[var(--bg-page)] font-sans text-[var(--text-main)] flex flex-col md:flex-row">
      <Sidebar locale={locale} />

      <main className="flex-1 p-4 lg:p-10 pt-20 lg:pt-10 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8 mb-20">
            <section className="card-brilliant p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-main)]">
                    {userName}&apos;s Analytics
                  </h1>
                  <p className="mt-3 font-medium text-[var(--text-muted)]">
                    Review study volume, subject progress, and the areas that still need attention.
                  </p>
                </div>
                <Link
                  href="/pyqs"
                  className="btn-3d btn-3d-green px-8 py-3.5 rounded-full text-sm inline-flex items-center gap-2"
                >
                  Continue Practice
                  <ArrowUpRight className="w-5 h-5" />
                </Link>
              </div>
            </section>

            {error && (
              <section className="card-brilliant p-6 border-none border-t-4 border-t-red-500">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <p className="font-bold text-red-600">{error}</p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => void loadAnalytics()}
                      className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50"
                    >
                      Retry
                    </button>
                    <Link
                      href="/pyqs"
                      className="rounded-xl bg-[#111827] px-4 py-2 text-sm font-bold text-white hover:bg-black"
                    >
                      Go Practice
                    </Link>
                  </div>
                </div>
              </section>
            )}

            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {metricCards.map((card) => {
                const Icon = card.icon
                return (
                  <div key={card.label} className="card-brilliant py-6 px-7">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold tracking-wider uppercase text-[var(--text-muted)]">{card.label}</span>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 border-2 border-[var(--border-light)] transform -rotate-3">
                        <Icon className="w-6 h-6 text-[var(--text-main)]" />
                      </div>
                    </div>
                    <p className="text-4xl font-display font-bold tracking-tight text-[var(--text-main)]">{card.value}</p>
                    <p className="mt-3 font-medium text-sm text-[var(--brilliant-blue)] bg-blue-50/50 inline-block px-3 py-1.5 rounded-lg">{card.note}</p>
                  </div>
                )
              })}
            </section>

            <section className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
              <div className="card-brilliant p-8">
                <div className="flex items-center gap-3 mb-8 border-b-2 border-[var(--border-light)] pb-4">
                  <div className="bg-yellow-100 p-2.5 rounded-xl">
                    <BarChart3 className="w-5 h-5 text-yellow-600" />
                  </div>
                  <h2 className="font-display text-xl font-bold tracking-tight text-[var(--text-main)]">Subject Performance</h2>
                </div>
                {subjectPerformance.length === 0 ? (
                  <p className="text-sm font-medium text-[var(--text-muted)] bg-gray-50 p-4 rounded-xl border border-gray-100">No subject-level analytics available yet.</p>
                ) : (
                  <div className="space-y-6">
                    {subjectPerformance.map((item) => (
                    <div key={item.subject_id} className="group">
                      <div className="flex items-center justify-between text-[15px] mb-3">
                        <span className="font-bold text-[var(--text-main)]">{item.subject_name}</span>
                        <span className="font-extrabold text-[var(--text-main)]">{Math.round(item.accuracy)}%</span>
                      </div>
                      <div className="h-3.5 bg-gray-100 border border-[var(--border-light)] rounded-full overflow-hidden mb-2 relative">
                        <div
                          className="h-full bg-[var(--brilliant-green)] rounded-full absolute left-0 top-0 transition-all duration-1000"
                          style={{ width: `${Math.min(Math.round(item.accuracy), 100)}%` }}
                        />
                      </div>
                      <p className="text-xs font-bold text-[var(--text-muted)] group-hover:text-black transition-colors">
                        {item.correct_answers}/{item.total_questions} correct
                        {item.trend_percentage != null ? ` • ${item.trend_percentage >= 0 ? '+' : ''}${item.trend_percentage.toFixed(1)}% trend` : ''}
                      </p>
                    </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card-brilliant p-8">
                <h2 className="font-display text-xl font-bold tracking-tight text-[var(--text-main)] mb-8 border-b-2 border-[var(--border-light)] pb-4 flex items-center gap-3">
                  <span className="bg-pink-100 p-2.5 rounded-xl block"><Target className="w-5 h-5 text-pink-500" /></span>
                  Priority Focus
                </h2>
                {focusAreas.length === 0 ? (
                  <p className="text-sm font-medium text-[var(--text-muted)] bg-gray-50 p-4 rounded-xl border border-gray-100">No weak areas identified from your recent activity.</p>
                ) : (
                  <div className="space-y-4">
                    {focusAreas.map((area) => (
                    <div key={area.topic_id} className="p-5 bg-gray-50 border-2 border-[var(--border-light)] rounded-2xl hover:bg-white hover:shadow-sm transition-all group">
                      <h3 className="text-[15px] font-bold text-[var(--text-main)] mb-1.5">{area.topic_name}</h3>
                      <p className="text-sm font-medium text-[var(--text-muted)] leading-relaxed group-hover:text-black transition-colors">
                        <span className="font-bold">{area.subject_name}</span> accuracy is <span className="text-red-500 font-bold">{Math.round(area.accuracy)}%</span> across {area.questions_attempted} attempts with {area.questions_incorrect} incorrect.
                      </p>
                    </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {(examReadiness || stageReadiness) && (
              <section className="grid gap-8 lg:grid-cols-2">
                {examReadiness && (
                  <div className="card-brilliant p-8">
                    <h2 className="font-display text-xl font-bold tracking-tight text-[var(--text-main)] border-b-2 border-[var(--border-light)] pb-4 mb-6">Exam Readiness</h2>
                    <div className="flex items-end gap-4">
                      <p className="text-6xl font-display font-extrabold tracking-tight text-[var(--brilliant-blue)]">
                        {Math.round(examReadiness.overall_readiness)}%
                      </p>
                      <p className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] bg-gray-100 px-3 py-1.5 rounded-lg mb-2">
                        {examReadiness.readiness_label.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                )}
                {stageReadiness && (
                  <div className="card-brilliant p-8">
                    <h2 className="font-display text-xl font-bold tracking-tight text-[var(--text-main)] border-b-2 border-[var(--border-light)] pb-4 mb-6">Stage Readiness</h2>
                    <div className="space-y-4 text-[15px] font-bold text-[var(--text-main)]">
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-[var(--border-light)]">
                        <span>PST</span>
                        <span className="text-[var(--brilliant-green)]">{Math.round(stageReadiness.pst_readiness)}%</span>
                      </div>
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-[var(--border-light)]">
                        <span>PET</span>
                        <span className="text-[var(--brilliant-blue)]">{Math.round(stageReadiness.pet_readiness)}%</span>
                      </div>
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-[var(--border-light)]">
                        <span>Documents</span>
                        <span className="text-[var(--brilliant-pink)]">{Math.round(stageReadiness.document_readiness)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>
        </main>
    </div>
  )
}
