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
}

const taskTypeIcons = {
  lesson: BookOpen,
  test: FileText,
  revision: RefreshCw,
}

const taskTypeColors = {
  lesson: 'bg-blue-100 text-blue-600',
  test: 'bg-purple-100 text-purple-600',
  revision: 'bg-green-100 text-green-600',
}

export function TodaysTasks({ tasks, locale }: TodaysTasksProps) {
  const t = useTranslations('dashboard')

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">{t('todayTasks')}</h2>
        <Link
          href="/dashboard"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          {t('viewAll')}
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">{t('noTasksToday')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const TypeIcon = taskTypeIcons[task.type]
            
            return (
              <div
                key={task.id}
                className={clsx(
                  'flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-sm',
                  task.status === 'completed' 
                    ? 'bg-gray-50 border-gray-100' 
                    : 'bg-white border-gray-100 hover:border-primary-200'
                )}
              >
                {/* Task Type Icon */}
                <div className="flex-shrink-0">
                  <div className={clsx('p-2 rounded-lg', taskTypeColors[task.type])}>
                    <TypeIcon className="w-5 h-5" />
                  </div>
                </div>

                {/* Task Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', taskTypeColors[task.type])}>
                      {t(task.type)}
                    </span>
                    <span className="text-xs text-gray-500">{task.subject}</span>
                  </div>
                  <h3 className={clsx(
                    'font-medium truncate',
                    task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                  )}>
                    {task.title}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">{task.topic}</p>
                </div>

                {/* Action Button */}
                {task.status !== 'completed' && (
                  <Link
                    href="/pyqs"
                    className="flex-shrink-0 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
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
