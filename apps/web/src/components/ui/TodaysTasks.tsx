'use client'

import { useTranslations } from 'next-intl'
import { clsx } from 'clsx'
import Link from 'next/link'
import { BookOpen, FileText, RefreshCw, CheckCircle } from 'lucide-react'

export interface Task {
  id: string
  title: string
  subject: string
  topic: string
  type: 'lesson' | 'test' | 'revision'
  status: 'pending' | 'in_progress' | 'completed'
  dueDate?: Date
}

interface TodaysTasksProps {
  tasks: Task[]
  locale: 'en'
  viewAllHref?: string
  emptyStateHref?: string
}

const taskTypeIcons = {
  lesson: BookOpen,
  test: FileText,
  revision: RefreshCw,
}

const taskTypeColors = {
  lesson: 'bg-[#FAFAFA] text-[#111827] border border-[#EAEAEA]',
  test: 'bg-[#FAFAFA] text-[#111827] border border-[#EAEAEA]',
  revision: 'bg-[#FAFAFA] text-[#111827] border border-[#EAEAEA]',
}

export function TodaysTasks({
  tasks,
  locale,
  viewAllHref = '/pyqs',
  emptyStateHref = '/pyqs',
}: TodaysTasksProps) {
  const t = useTranslations('dashboard')

  return (
    <div className="bg-white rounded-[12px] p-6 shadow-sm border border-[#EAEAEA]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[15px] font-semibold text-[#111827] tracking-tight">{t('todayTasks')}</h2>
        <Link
          href={viewAllHref}
          className="text-sm text-[#6B7280] hover:text-[#111827] font-medium transition-colors"
        >
          {t('viewAll')}
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">{t('noTasksToday')}</p>
          <Link
            href={emptyStateHref}
            className="inline-flex items-center justify-center rounded-[6px] bg-[#111827] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-black"
          >
            {t('practiceNow')}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const TypeIcon = taskTypeIcons[task.type]
            
            return (
              <div
                key={task.id}
                className={clsx(
                  'flex items-center gap-4 p-4 rounded-[8px] border transition-all duration-200',
                  task.status === 'completed' 
                    ? 'bg-[#FAFAFA] border-[#EAEAEA] opacity-75' 
                    : 'bg-white border-[#EAEAEA] hover:border-gray-300 hover:bg-[#FAFAFA]'
                )}
              >
                {/* Task Type Icon */}
                <div className="flex-shrink-0">
                  <div className={clsx('p-2.5 rounded-[6px]', taskTypeColors[task.type])}>
                    <TypeIcon className="w-4 h-4 text-[#111827]" />
                  </div>
                </div>

                {/* Task Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={clsx('px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider', taskTypeColors[task.type])}>
                      {t(task.type)}
                    </span>
                    <span className="text-xs text-[#6B7280] font-medium truncate">{task.subject}</span>
                  </div>
                  <h3 className={clsx(
                    'font-medium text-sm truncate',
                    task.status === 'completed' ? 'text-[#9CA3AF] line-through' : 'text-[#111827]'
                  )}>
                    {task.title}
                  </h3>
                  <p className="text-[#6B7280] text-xs truncate mt-0.5">{task.topic}</p>
                </div>

                {/* Action Button */}
                {task.status !== 'completed' && (
                  <Link
                    href="/pyqs"
                    className="flex-shrink-0 px-4 py-2 bg-[#111827] text-white text-xs font-semibold rounded-[6px] hover:bg-black transition-colors"
                  >
                    {task.status === 'in_progress' ? t('inProgress') : t('practiceNow')}
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
