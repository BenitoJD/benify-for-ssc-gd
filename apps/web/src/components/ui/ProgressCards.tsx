'use client'

import { useTranslations } from 'next-intl'
import { clsx } from 'clsx'
import { BookOpen, Calculator, Globe, Languages } from 'lucide-react'

export interface SubjectProgress {
  id: string
  name: string
  code: string
  completionPercentage: number
  totalLessons: number
  completedLessons: number
}

interface ProgressCardsProps {
  subjects: SubjectProgress[]
}

const subjectIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'general-intelligence': BookOpen,
  'mathematics': Calculator,
  'general-knowledge': Globe,
  'english': Languages,
}

const subjectColors: Record<string, string> = {
  'general-intelligence': 'from-blue-500 to-blue-600',
  'mathematics': 'from-purple-500 to-purple-600',
  'general-knowledge': 'from-green-500 to-green-600',
  'english': 'from-orange-500 to-orange-600',
}

export function ProgressCards({ subjects }: ProgressCardsProps) {
  const t = useTranslations('dashboard')

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">{t('progress')}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {subjects.map((subject) => {
          const Icon = subjectIcons[subject.code] || BookOpen
          const colorClass = subjectColors[subject.code] || 'from-gray-500 to-gray-600'
          const isComplete = subject.completionPercentage >= 100
          const isInProgress = subject.completionPercentage > 0 && subject.completionPercentage < 100

          return (
            <div
              key={subject.id}
              className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              {/* Subject Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={clsx('p-2 rounded-lg bg-gradient-to-br', colorClass)}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{subject.name}</h3>
                  <p className="text-xs text-gray-500">
                    {subject.completedLessons}/{subject.totalLessons} {t('complete').toLowerCase()}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">
                    {isComplete ? t('complete') : isInProgress ? t('inProgress') : t('pending')}
                  </span>
                  <span className="font-semibold text-gray-900">{subject.completionPercentage}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all duration-500',
                      isComplete ? 'bg-green-500' : colorClass
                    )}
                    style={{ width: `${Math.min(subject.completionPercentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
