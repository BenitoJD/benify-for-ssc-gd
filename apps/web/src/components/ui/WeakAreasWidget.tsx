'use client'

import { useTranslations } from 'next-intl'
import { clsx } from 'clsx'
import Link from 'next/link'
import { AlertTriangle, TrendingDown, ArrowRight } from 'lucide-react'

export interface WeakArea {
  id: string
  topicName: string
  subjectName: string
  accuracy: number
  totalQuestions: number
  correctAnswers: number
}

interface WeakAreasWidgetProps {
  weakAreas: WeakArea[]
  locale: 'en'
}

export function WeakAreasWidget({ weakAreas, locale }: WeakAreasWidgetProps) {
  const t = useTranslations('dashboard')

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 50) return 'text-yellow-600 bg-yellow-50'
    if (accuracy >= 40) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{t('weakAreas')}</h2>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          {t('viewAll')}
        </Link>
      </div>

      {weakAreas.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <TrendingDown className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-gray-600 font-medium">🎉 {t('noWeakAreas')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {weakAreas.map((area) => (
            <div
              key={area.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-red-200 hover:shadow-sm transition-all"
            >
              {/* Accuracy Badge */}
              <div className="flex-shrink-0">
                <div className={clsx(
                  'w-14 h-14 rounded-full flex flex-col items-center justify-center',
                  getAccuracyColor(area.accuracy)
                )}>
                  <span className="text-lg font-bold">{area.accuracy}%</span>
                </div>
              </div>

              {/* Topic Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{area.topicName}</h3>
                <p className="text-sm text-gray-500">{area.subjectName}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {area.correctAnswers}/{area.totalQuestions} correct
                </p>
              </div>

              {/* Practice CTA */}
              <Link
                href="/pyqs"
                className="flex-shrink-0 flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors"
              >
                {t('practiceNow')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
