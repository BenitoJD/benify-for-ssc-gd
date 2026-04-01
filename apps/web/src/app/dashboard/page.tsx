'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/ui/Sidebar'
import { ExamCountdown } from '@/components/ui/ExamCountdown'
import { ProgressCards, SubjectProgress } from '@/components/ui/ProgressCards'
import { TodaysTasks, Task } from '@/components/ui/TodaysTasks'
import { WeakAreasWidget, WeakArea } from '@/components/ui/WeakAreasWidget'
import { RecentActivity, Activity } from '@/components/ui/RecentActivity'
import { StreakCounter } from '@/components/ui/StreakCounter'
import { OfflineIndicator } from '@/components/ui/OfflineIndicator'
import { NotificationPermissionPrompt } from '@/components/ui/NotificationPermissionPrompt'
import { fetchCurrentUser } from '@/lib/auth'
import { getProfile } from '@/lib/api/users'
import { analyticsApi } from '@/lib/api/analytics'

function buildExamDate(targetExamYear?: number): Date {
  const today = new Date()
  const fallbackYear = today.getFullYear() + (today.getMonth() > 5 ? 1 : 0)
  return new Date(targetExamYear ?? fallbackYear, 11, 31, 23, 59, 59)
}

export default function DashboardPage() {
  const t = useTranslations()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState<string>('')
  const [subjects, setSubjects] = useState<SubjectProgress[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [currentStreak, setCurrentStreak] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)
  const [examDate, setExamDate] = useState<Date>(() => buildExamDate())
  const locale = 'en' as const

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await fetchCurrentUser()
        if (!user) {
          router.push('/login')
          return
        }

        setUserName(user.name || user.email?.split('@')[0] || 'Student')
        const [profile, stats, analytics] = await Promise.all([
          getProfile(),
          analyticsApi.getUserStats(),
          analyticsApi.getUserAnalytics(),
        ])

        setExamDate(buildExamDate(profile.target_exam_year))
        setCurrentStreak(stats.current_streak)
        setLongestStreak(stats.longest_streak)
        setSubjects(
          analytics.subject_accuracy.map((subject) => ({
            id: subject.subject_id,
            name: subject.subject_name,
            code: subject.subject_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            completionPercentage: Math.round(subject.accuracy),
            totalLessons: subject.total_questions,
            completedLessons: subject.correct_answers,
          }))
        )
        setWeakAreas(
          analytics.weak_chapters.slice(0, 5).map((chapter) => ({
            id: chapter.topic_id,
            topicName: chapter.topic_name,
            subjectName: chapter.subject_name,
            accuracy: Math.round(chapter.accuracy),
            totalQuestions: chapter.questions_attempted,
            correctAnswers: chapter.questions_attempted - chapter.questions_incorrect,
          }))
        )
        setTasks(
          analytics.recommendations.slice(0, 3).map((recommendation) => ({
            id: recommendation.topic_id,
            title: recommendation.topic_name,
            subject: recommendation.subject_name,
            topic: `${recommendation.questions_to_practice} questions recommended`,
            type: 'revision',
            status: recommendation.status === 'completed' ? 'completed' : 'pending',
          }))
        )
        setActivities(
          analytics.score_trend.slice(0, 4).map((attempt) => ({
            id: attempt.attempt_id,
            type: 'test_completed',
            title: attempt.test_title,
            description: `${Math.round(attempt.percentage)}% score`,
            timestamp: new Date(attempt.completed_at),
          }))
        )
      } catch {
        router.push('/login')
        return
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#111827]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#111827]">
      <OfflineIndicator />
      <NotificationPermissionPrompt locale={locale} />
      
      <div className="flex">
        <Sidebar locale={locale} />
        
        {/* Main Content */}
        <main className="flex-1 lg:ml-0 p-4 lg:p-8 pt-16 lg:pt-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-[#111827]">
                {t('dashboard.welcome', { name: userName })}
              </h1>
            </div>

            {/* Top Row: Exam Countdown + Access Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ExamCountdown targetDate={examDate} />
              </div>
              <div className="rounded-[12px] bg-white p-6 shadow-sm border border-[#EAEAEA]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#FAFAFA] border border-[#EAEAEA] text-[#111827]">
                    <span className="text-lg font-bold font-serif">F</span>
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-[#111827] tracking-tight">Full Access Enabled</h2>
                    <p className="text-sm text-[#6B7280]">All study tools are free to use</p>
                  </div>
                </div>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  Practice questions, physical training, documents, and community features are available without a paid plan.
                </p>
              </div>
            </div>

            {/* Progress Cards */}
            <ProgressCards subjects={subjects} />

            {/* Second Row: Today's Tasks + Weak Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TodaysTasks tasks={tasks} locale={locale} />
              <WeakAreasWidget weakAreas={weakAreas} locale={locale} />
            </div>

            {/* Third Row: Streak Counter + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <StreakCounter 
                  currentStreak={currentStreak}
                  longestStreak={longestStreak}
                  isActive={currentStreak > 0}
                />
              </div>
              <div className="lg:col-span-2">
                <RecentActivity activities={activities} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
