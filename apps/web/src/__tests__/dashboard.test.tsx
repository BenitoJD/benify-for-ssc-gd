import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    const translations: Record<string, string> = {
      'dashboard.examCountdown': 'Exam Countdown',
      'dashboard.daysLeft': 'days left',
      'dashboard.hoursLeft': 'hours left',
      'dashboard.minutesLeft': 'minutes left',
      'dashboard.examDate': 'Exam Date',
      'dashboard.todayTasks': "Today's Tasks",
      'dashboard.progress': 'Your Progress',
      'dashboard.weakAreas': 'Areas to Improve',
      'dashboard.streak': 'Current Streak',
      'dashboard.days': 'days',
      'dashboard.recentActivity': 'Recent Activity',
      'dashboard.subscription': 'Subscription',
      'dashboard.practiceNow': 'Practice Now',
      'dashboard.viewAll': 'View All',
      'dashboard.noTasksToday': 'No tasks for today',
      'dashboard.noWeakAreas': 'Great job! No weak areas identified yet.',
      'dashboard.noRecentActivity': 'No recent activity yet. Start learning!',
      'dashboard.complete': 'Complete',
      'dashboard.inProgress': 'In Progress',
      'dashboard.pending': 'Pending',
      'dashboard.lesson': 'Lesson',
      'dashboard.test': 'Test',
      'dashboard.revision': 'Revision',
      'dashboard.upgradeToPremium': 'Upgrade to Premium',
      'dashboard.currentPlan': 'Current Plan',
      'dashboard.renewalDate': 'Renewal Date',
      'dashboard.freePlan': 'Free',
      'dashboard.premiumPlan': 'Premium',
      'dashboard.streakFlame': 'Keep your streak going!',
      'dashboard.streakLost': 'Start a new streak today!',
      'dashboard.today': 'Today',
      'dashboard.yesterday': 'Yesterday',
      'dashboard.daysAgo': '{days} days ago',
      'dashboard.completedLesson': 'Completed lesson',
      'dashboard.completedTest': 'Completed test',
      'dashboard.startedStreak': 'Started a {days}-day streak',
      'common.appName': 'Benify',
      'nav.dashboard': 'Dashboard',
      'nav.study': 'Study',
      'nav.tests': 'Tests',
      'nav.analytics': 'Analytics',
      'nav.community': 'Community',
      'nav.profile': 'Profile',
      'nav.logout': 'Logout',
      'dashboard.menu': 'Menu',
      'dashboard.closeMenu': 'Close Menu',
    }
    
    // Handle parameterized translations
    if (params && key.includes('.')) {
      if (key.includes('welcome')) {
        return `Welcome back, ${params.name || 'Student'}!`
      }
      if (key.includes('daysAgo')) {
        return `${params.days} days ago`
      }
      if (key.includes('startedStreak')) {
        return `Started a ${params.days}-day streak`
      }
    }
    
    return translations[key] || key
  },
}))

// Mock components
import { ExamCountdown } from '@/components/ui/ExamCountdown'
import { ProgressCards } from '@/components/ui/ProgressCards'
import { TodaysTasks } from '@/components/ui/TodaysTasks'
import { WeakAreasWidget } from '@/components/ui/WeakAreasWidget'
import { RecentActivity } from '@/components/ui/RecentActivity'
import { StreakCounter } from '@/components/ui/StreakCounter'
import { SubscriptionWidget } from '@/components/ui/SubscriptionWidget'
import { OfflineIndicator } from '@/components/ui/OfflineIndicator'

describe('ExamCountdown', () => {
  it('renders countdown timer', () => {
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 6)
    
    render(<ExamCountdown targetDate={futureDate} />)
    
    expect(screen.getByText('Exam Countdown')).toBeTruthy()
    expect(screen.getByText('days left')).toBeTruthy()
  })

  it('displays exam date', () => {
    const futureDate = new Date('2026-12-31')
    
    render(<ExamCountdown targetDate={futureDate} />)
    
    expect(screen.getByText(/Exam Date:/)).toBeTruthy()
  })
})

describe('ProgressCards', () => {
  const mockSubjects = [
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
  ]

  it('renders progress cards', () => {
    render(<ProgressCards subjects={mockSubjects} />)
    
    expect(screen.getByText('Your Progress')).toBeTruthy()
    expect(screen.getByText('General Intelligence')).toBeTruthy()
    expect(screen.getByText('Mathematics')).toBeTruthy()
  })

  it('displays completion percentages', () => {
    render(<ProgressCards subjects={mockSubjects} />)
    
    expect(screen.getByText('65%')).toBeTruthy()
    expect(screen.getByText('42%')).toBeTruthy()
  })
})

describe('TodaysTasks', () => {
  const mockTasks = [
    {
      id: '1',
      title: 'Number Series',
      subject: 'Mathematics',
      topic: 'Quantitative Aptitude',
      type: 'lesson' as const,
      status: 'pending' as const,
    },
    {
      id: '2',
      title: 'Coding-Decoding',
      subject: 'General Intelligence',
      topic: 'Reasoning',
      type: 'test' as const,
      status: 'in_progress' as const,
    },
  ]

  it('renders task list', () => {
    render(<TodaysTasks tasks={mockTasks} locale="en" />)
    
    expect(screen.getByText("Today's Tasks")).toBeTruthy()
    expect(screen.getByText('Number Series')).toBeTruthy()
    expect(screen.getByText('Coding-Decoding')).toBeTruthy()
  })

  it('shows empty state when no tasks', () => {
    render(<TodaysTasks tasks={[]} locale="en" />)
    
    expect(screen.getByText('No tasks for today')).toBeTruthy()
  })
})

describe('WeakAreasWidget', () => {
  const mockWeakAreas = [
    {
      id: '1',
      topicName: 'Percentage',
      subjectName: 'Mathematics',
      accuracy: 45,
      totalQuestions: 20,
      correctAnswers: 9,
    },
  ]

  it('renders weak areas', () => {
    render(<WeakAreasWidget weakAreas={mockWeakAreas} locale="en" />)
    
    expect(screen.getByText('Areas to Improve')).toBeTruthy()
    expect(screen.getByText('Percentage')).toBeTruthy()
    expect(screen.getByText('45%')).toBeTruthy()
  })

  it('shows empty state when no weak areas', () => {
    render(<WeakAreasWidget weakAreas={[]} locale="en" />)
    
    expect(screen.getByText(/Great job!/)).toBeTruthy()
  })
})

describe('RecentActivity', () => {
  const mockActivities = [
    {
      id: '1',
      type: 'lesson_completed' as const,
      title: 'Completed lesson: Profit & Loss',
      description: 'Mathematics • 45 mins',
      timestamp: new Date(),
    },
  ]

  it('renders activity feed', () => {
    render(<RecentActivity activities={mockActivities} />)
    
    expect(screen.getByText('Recent Activity')).toBeTruthy()
    expect(screen.getByText('Completed lesson')).toBeTruthy()
  })

  it('shows empty state when no activities', () => {
    render(<RecentActivity activities={[]} />)
    
    expect(screen.getByText('No recent activity yet. Start learning!')).toBeTruthy()
  })
})

describe('StreakCounter', () => {
  it('renders active streak', () => {
    render(<StreakCounter currentStreak={5} longestStreak={12} isActive={true} />)
    
    expect(screen.getByText('Current Streak')).toBeTruthy()
    expect(screen.getByText('5')).toBeTruthy()
    expect(screen.getByText('days')).toBeTruthy()
  })

  it('shows streak lost message when inactive', () => {
    render(<StreakCounter currentStreak={0} longestStreak={5} isActive={false} />)
    
    expect(screen.getByText('Start a new streak today!')).toBeTruthy()
  })
})

describe('SubscriptionWidget', () => {
  it('renders free plan', () => {
    render(<SubscriptionWidget 
      planName="free" 
      locale="en" 
      isPremium={false}
    />)
    
    expect(screen.getByText('Current Plan')).toBeTruthy()
    expect(screen.getByText('Free')).toBeTruthy()
    expect(screen.getByText('Upgrade to Premium')).toBeTruthy()
  })

  it('renders premium plan', () => {
    render(<SubscriptionWidget 
      planName="monthly"
      renewalDate={new Date()}
      locale="en"
      isPremium={true}
    />)
    
    expect(screen.getByText('Premium')).toBeTruthy()
  })
})

describe('OfflineIndicator', () => {
  it('renders offline message', () => {
    // Mock navigator.onLine as false
    const originalOnLine = navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true
    })
    
    render(<OfflineIndicator />)
    
    expect(screen.getByText('You are offline. Some features may not work.')).toBeTruthy()
    
    // Restore
    Object.defineProperty(navigator, 'onLine', {
      value: originalOnLine,
      writable: true
    })
  })
})
