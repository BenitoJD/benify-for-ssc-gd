'use client'

import { useTranslations } from 'next-intl'
import { clsx } from 'clsx'
import { BookOpen, FileText, Flame, Clock } from 'lucide-react'

export interface Activity {
  id: string
  type: 'lesson_completed' | 'test_completed' | 'streak_started'
  title: string
  description?: string
  timestamp: Date
  metadata?: Record<string, string | number>
}

interface RecentActivityProps {
  activities: Activity[]
}

const activityIcons = {
  lesson_completed: BookOpen,
  test_completed: FileText,
  streak_started: Flame,
}

const activityColors = {
  lesson_completed: 'bg-blue-100 text-blue-600',
  test_completed: 'bg-purple-100 text-purple-600',
  streak_started: 'bg-orange-100 text-orange-600',
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const t = useTranslations('dashboard')

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return t('today')
    } else if (diffDays === 1) {
      return t('yesterday')
    } else {
      return t('daysAgo', { days: diffDays })
    }
  }

  const getActivityTitle = (activity: Activity) => {
    switch (activity.type) {
      case 'lesson_completed':
        return t('completedLesson')
      case 'test_completed':
        return t('completedTest')
      case 'streak_started':
        return t('startedStreak', { days: activity.metadata?.streakDays || 1 })
      default:
        return activity.title
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">{t('recentActivity')}</h2>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">{t('noRecentActivity')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activityIcons[activity.type]
            const colorClass = activityColors[activity.type]
            const isLatest = index === 0

            return (
              <div key={activity.id} className="flex gap-4">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div className={clsx('p-2 rounded-lg', colorClass)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {index < activities.length - 1 && (
                    <div className="w-0.5 h-full min-h-[40px] bg-gray-100 my-1" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={clsx(
                        'font-medium text-gray-900',
                        isLatest && 'text-primary-700'
                      )}>
                        {getActivityTitle(activity)}
                      </p>
                      {activity.description && (
                        <p className="text-sm text-gray-500 mt-0.5">{activity.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
