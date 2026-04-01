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

export default function DashboardPage() {
  const t = useTranslations()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState<string>('')
  const locale: 'en' = 'en'

  // Mock data for demonstration - in production, this would come from API
  const mockSubjects: SubjectProgress[] = [
    {
      id: '1',
      name: 'General Intelligence',
      code: 'general-intelligence',
      completionPercentage: 65,
      totalLessons: 50,
      completedLessons: 33,
    },
    {
      id: '2',
      name: 'Mathematics',
      code: 'mathematics',
      completionPercentage: 42,
      totalLessons: 45,
      completedLessons: 19,
    },
    {
      id: '3',
      name: 'General Knowledge',
      code: 'general-knowledge',
      completionPercentage: 78,
      totalLessons: 60,
      completedLessons: 47,
    },
    {
      id: '4',
      name: 'English',
      code: 'english',
      completionPercentage: 30,
      totalLessons: 40,
      completedLessons: 12,
    },
  ]

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Number Series',
      subject: 'Mathematics',
      topic: 'Quantitative Aptitude',
      type: 'lesson',
      status: 'pending',
    },
    {
      id: '2',
      title: 'Coding-Decoding',
      subject: 'General Intelligence',
      topic: 'Reasoning',
      type: 'test',
      status: 'in_progress',
    },
    {
      id: '3',
      title: 'Ancient History Revision',
      subject: 'General Knowledge',
      topic: 'History',
      type: 'revision',
      status: 'pending',
    },
  ]

  const mockWeakAreas: WeakArea[] = [
    {
      id: '1',
      topicName: 'Percentage',
      subjectName: 'Mathematics',
      accuracy: 45,
      totalQuestions: 20,
      correctAnswers: 9,
    },
    {
      id: '2',
      topicName: 'Blood Relations',
      subjectName: 'General Intelligence',
      accuracy: 38,
      totalQuestions: 15,
      correctAnswers: 6,
    },
    {
      id: '3',
      topicName: 'Active/Passive Voice',
      subjectName: 'English',
      accuracy: 52,
      totalQuestions: 25,
      correctAnswers: 13,
    },
  ]

  const mockActivities: Activity[] = [
    {
      id: '1',
      type: 'lesson_completed',
      title: 'Completed lesson: Profit & Loss',
      description: 'Mathematics • 45 mins',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    },
    {
      id: '2',
      type: 'test_completed',
      title: 'Scored 72% in Mock Test 5',
      description: 'General Intelligence • 45 mins',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    },
    {
      id: '3',
      type: 'streak_started',
      title: 'Started a 5-day streak!',
      metadata: { streakDays: 5 },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
    {
      id: '4',
      type: 'lesson_completed',
      title: 'Completed lesson: Ancient History',
      description: 'General Knowledge • 30 mins',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26), // 26 hours ago
    },
  ]

  // Mock exam date - 6 months from now
  const examDate = new Date()
  examDate.setMonth(examDate.getMonth() + 6)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await fetchCurrentUser()
        if (!user) {
          router.push('/login')
          return
        }

        setUserName(user.name || user.email?.split('@')[0] || 'Student')
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
            <ProgressCards subjects={mockSubjects} />

            {/* Second Row: Today's Tasks + Weak Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TodaysTasks tasks={mockTasks} locale={locale} />
              <WeakAreasWidget weakAreas={mockWeakAreas} locale={locale} />
            </div>

            {/* Third Row: Streak Counter + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <StreakCounter 
                  currentStreak={5}
                  longestStreak={12}
                  isActive={true}
                />
              </div>
              <div className="lg:col-span-2">
                <RecentActivity activities={mockActivities} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
