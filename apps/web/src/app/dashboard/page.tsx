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
    <div className="min-h-screen bg-[var(--bg-page)] font-sans text-[var(--text-main)] flex flex-col md:flex-row">
      <OfflineIndicator />
      <NotificationPermissionPrompt locale={locale} />
      
      <Sidebar locale={locale} />
        
      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-10 pt-20 lg:pt-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-10 mb-20">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-main)]">
              {t('dashboard.welcome', { name: userName })}
            </h1>
          </div>

          {/* Top Row: Exam Countdown + Access Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ExamCountdown targetDate={examDate} />
            </div>
            <div className="card-brilliant p-8">
              <div className="flex items-center gap-5 mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-600 shadow-sm shrink-0">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-[var(--text-main)] tracking-tight">Full Access</h2>
                  <p className="text-sm font-medium text-[var(--text-muted)] mt-0.5">All tools unlocked</p>
                </div>
              </div>
              <p className="text-sm text-[var(--text-muted)] font-medium leading-relaxed">
                Practice questions, physical training, documents, and community features are available without a paid plan. Go smash your goals!
              </p>
            </div>
          </div>

          {/* Progress Cards */}
          <ProgressCards subjects={subjects} />

          {/* Second Row: Today's Tasks + Weak Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TodaysTasks tasks={tasks} locale={locale} />
            <WeakAreasWidget weakAreas={weakAreas} locale={locale} />
          </div>

          {/* Third Row: Streak Counter + Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
  )
}
