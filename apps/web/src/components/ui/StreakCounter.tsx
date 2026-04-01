'use client'

import { useTranslations } from 'next-intl'
import { Flame } from 'lucide-react'
import { clsx } from 'clsx'

interface StreakCounterProps {
  currentStreak: number
  longestStreak: number
  isActive: boolean
}

export function StreakCounter({ currentStreak, longestStreak, isActive }: StreakCounterProps) {
  const t = useTranslations('dashboard')

  return (
    <div className="bg-white rounded-[12px] p-6 text-[#111827] border border-[#EAEAEA] shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[15px] font-semibold tracking-tight">{t('streak')}</h2>
        <div className={clsx(
          'p-2 rounded-[6px]',
          isActive ? 'bg-[#FAFAFA] border border-[#EAEAEA]' : 'bg-[#FAFAFA]'
        )}>
          <Flame 
            className={clsx(
              'w-[18px] h-[18px]',
              isActive ? 'text-[#111827]' : 'text-[#9CA3AF] grayscale'
            )} 
          />
        </div>
      </div>

      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center gap-1.5">
          <span className="text-6xl font-bold tracking-tight text-[#111827]">{currentStreak}</span>
          <span className="text-sm font-medium text-[#6B7280]">{t('days')}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-medium">
        <div className="flex items-center gap-1.5 text-[#6B7280]">
          <span>Longest:</span>
          <span className="text-[#111827]">{longestStreak} {t('days')}</span>
        </div>
        {isActive ? (
          <span className="flex items-center gap-1.5 text-[#111827]">
            <span className="w-1.5 h-1.5 bg-[#111827] rounded-full animate-pulse" />
            Active Streak
          </span>
        ) : (
          <span className="text-[#9CA3AF]">{t('streakLost')}</span>
        )}
      </div>

      {/* Streak milestones */}
      <div className="mt-8 pt-5 border-t border-[#EAEAEA]">
        <div className="flex justify-between text-[11px] font-semibold text-[#9CA3AF]">
          {[7, 14, 30, 60, 100].map((milestone) => (
            <div 
              key={milestone}
              className={clsx(
                'flex flex-col items-center gap-1',
                currentStreak >= milestone ? 'text-[#111827]' : ''
              )}
            >
              <span>{milestone}</span>
              <div className={clsx(
                "w-1 h-1 rounded-full",
                currentStreak >= milestone ? "bg-[#111827]" : "bg-[#EAEAEA]"
              )} />
            </div>
          ))}
        </div>
        {/* Progress bar to next milestone */}
        {currentStreak < 100 && (
          <div className="mt-3">
            <div className="h-1 bg-[#EAEAEA] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#111827] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStreak % 100) / 100 * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
