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

// Replaced gradient backgrounds with a clean border look
const subjectColors: Record<string, string> = {
  'general-intelligence': 'text-[#111827]',
  'mathematics': 'text-[#111827]',
  'general-knowledge': 'text-[#111827]',
  'english': 'text-[#111827]',
}

export function ProgressCards({ subjects }: ProgressCardsProps) {
  const t = useTranslations('dashboard')

  return (
    <div className="bg-white rounded-[12px] p-6 shadow-sm border border-[#EAEAEA]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[15px] font-semibold text-[#111827] tracking-tight">{t('progress')}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {subjects.map((subject) => {
          const Icon = subjectIcons[subject.code] || BookOpen
          const colorClass = subjectColors[subject.code] || 'from-gray-500 to-gray-600'
          const isComplete = subject.completionPercentage >= 100
          const isInProgress = subject.completionPercentage > 0 && subject.completionPercentage < 100

          return (
            <div
              key={subject.id}
              className="border border-[#EAEAEA] rounded-[8px] p-5 hover:border-gray-300 hover:bg-[#FAFAFA] transition-all duration-200"
            >
              {/* Subject Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className={clsx('p-2.5 rounded-[6px] bg-[#FAFAFA] border border-[#EAEAEA]', colorClass)}>
                  <Icon className="w-5 h-5 text-[#111827]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[#111827] text-sm truncate">{subject.name}</h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    {subject.completedLessons}/{subject.totalLessons} {t('complete').toLowerCase()}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-1">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-[#6B7280] font-medium">
                    {isComplete ? t('complete') : isInProgress ? t('inProgress') : t('pending')}
                  </span>
                  <span className="font-semibold text-[#111827]">{subject.completionPercentage}%</span>
                </div>
                <div className="h-1.5 bg-[#EAEAEA] rounded-full overflow-hidden">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all duration-500 ease-out',
                      'bg-[#111827]'
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
