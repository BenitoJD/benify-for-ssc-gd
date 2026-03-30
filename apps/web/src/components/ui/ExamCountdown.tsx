'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Clock } from 'lucide-react'

interface ExamCountdownProps {
  targetDate: Date
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calculateTimeLeft(targetDate: Date): TimeLeft {
  const difference = targetDate.getTime() - new Date().getTime()
  
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  }
}

export function ExamCountdown({ targetDate }: ExamCountdownProps) {
  const t = useTranslations('dashboard')
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetDate))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate))
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-6 h-6" />
        <h2 className="text-lg font-semibold">{t('examCountdown')}</h2>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
          <div className="text-3xl font-bold">{timeLeft.days}</div>
          <div className="text-xs text-white/80">{t('daysLeft')}</div>
        </div>
        <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
          <div className="text-3xl font-bold">{timeLeft.hours}</div>
          <div className="text-xs text-white/80">{t('hoursLeft').split(' ')[0]}</div>
        </div>
        <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
          <div className="text-3xl font-bold">{timeLeft.minutes}</div>
          <div className="text-xs text-white/80">{t('minutesLeft').split(' ')[0]}</div>
        </div>
        <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
          <div className="text-3xl font-bold">{timeLeft.seconds}</div>
          <div className="text-xs text-white/80">sec</div>
        </div>
      </div>

      <p className="text-center text-sm text-white/80 mt-4">
        {t('examDate')}: {targetDate.toLocaleDateString()}
      </p>
    </div>
  )
}
