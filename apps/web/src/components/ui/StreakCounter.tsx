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
    <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className={clsx(
          'relative',
          isActive && 'animate-pulse'
        )}>
          <Flame 
            className={clsx(
              'w-8 h-8',
              isActive ? 'text-orange-300' : 'text-orange-400'
            )} 
            fill={isActive ? 'currentColor' : 'none'}
          />
          {isActive && currentStreak >= 7 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-bounce" />
          )}
        </div>
        <h2 className="text-lg font-semibold">{t('streak')}</h2>
      </div>

      <div className="text-center mb-4">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-6xl font-bold">{currentStreak}</span>
          <span className="text-xl text-orange-100">{t('days')}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-orange-100">Longest:</span>
          <span className="font-semibold">{longestStreak} {t('days')}</span>
        </div>
        {isActive ? (
          <span className="flex items-center gap-1 text-orange-100">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            {t('streakFlame')}
          </span>
        ) : (
          <span className="text-orange-200">{t('streakLost')}</span>
        )}
      </div>

      {/* Streak milestones */}
      <div className="mt-4 pt-4 border-t border-orange-400/30">
        <div className="flex justify-between text-xs text-orange-100">
          {[7, 14, 30, 60, 100].map((milestone) => (
            <div 
              key={milestone}
              className={clsx(
                'flex flex-col items-center',
                currentStreak >= milestone && 'text-yellow-300'
              )}
            >
              <span className="font-semibold">{milestone}</span>
              <span>🔥</span>
            </div>
          ))}
        </div>
        {/* Progress bar to next milestone */}
        {currentStreak < 100 && (
          <div className="mt-2">
            <div className="h-1 bg-orange-400/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-300 rounded-full transition-all duration-500"
                style={{ width: `${(currentStreak % 100) / 100 * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
