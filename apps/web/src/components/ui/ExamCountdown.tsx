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
    <div className="bg-[#111827] rounded-[12px] p-6 text-white shadow-sm h-full flex flex-col justify-center">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-[18px] h-[18px] text-[#9CA3AF]" />
        <h2 className="text-[15px] font-semibold tracking-tight">{t('examCountdown')}</h2>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-[8px] p-3 text-center transition-colors hover:bg-white/10">
          <div className="text-3xl font-bold tracking-tight">{timeLeft.days}</div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[#9CA3AF] mt-1">{t('daysLeft')}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-[8px] p-3 text-center transition-colors hover:bg-white/10">
          <div className="text-3xl font-bold tracking-tight">{timeLeft.hours}</div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[#9CA3AF] mt-1">{t('hoursLeft').split(' ')[0]}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-[8px] p-3 text-center transition-colors hover:bg-white/10">
          <div className="text-3xl font-bold tracking-tight">{timeLeft.minutes}</div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[#9CA3AF] mt-1">{t('minutesLeft').split(' ')[0]}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-[8px] p-3 text-center transition-colors hover:bg-white/10">
          <div className="text-3xl font-bold tracking-tight">{timeLeft.seconds}</div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[#9CA3AF] mt-1">sec</div>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-white/10 flex justify-between items-center text-xs">
        <span className="text-[#9CA3AF] font-medium">{t('examDate')}</span>
        <span className="font-semibold">{targetDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
      </div>
    </div>
  )
}
