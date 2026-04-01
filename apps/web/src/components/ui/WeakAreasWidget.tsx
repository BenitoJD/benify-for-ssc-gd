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
    if (accuracy >= 50) return 'text-[#111827] border-[#EAEAEA] bg-[#FAFAFA]'
    if (accuracy >= 40) return 'text-[#111827] border-[#111827] bg-[#FAFAFA]'
    return 'text-white border-[#111827] bg-[#111827]'
  }

  return (
    <div className="bg-white rounded-[12px] p-6 shadow-sm border border-[#EAEAEA]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-[15px] font-semibold tracking-tight text-[#111827]">{t('weakAreas')}</h2>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-[#6B7280] hover:text-[#111827] font-medium transition-colors"
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
              className="flex items-center gap-4 p-4 rounded-[8px] border border-[#EAEAEA] hover:border-gray-300 hover:bg-[#FAFAFA] transition-all duration-200"
            >
              {/* Accuracy Badge */}
              <div className="flex-shrink-0">
                <div className={clsx(
                  'w-[52px] h-[52px] rounded-full flex flex-col items-center justify-center border',
                  getAccuracyColor(area.accuracy)
                )}>
                  <span className="text-sm font-bold tracking-tight">{area.accuracy}%</span>
                </div>
              </div>

              {/* Topic Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs text-[#6B7280] font-medium truncate">{area.subjectName}</span>
                </div>
                <h3 className="font-medium text-sm text-[#111827] truncate">{area.topicName}</h3>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  {area.correctAnswers}/{area.totalQuestions} correct
                </p>
              </div>

              {/* Practice CTA */}
              <Link
                href="/pyqs"
                className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 bg-white border border-[#EAEAEA] text-[#111827] text-xs font-semibold rounded-[6px] hover:bg-[#FAFAFA] hover:border-gray-300 transition-colors"
              >
                {t('practiceNow')}
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
