'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { WifiOff, Wifi, X } from 'lucide-react'
import { clsx } from 'clsx'

export function OfflineIndicator() {
  const t = useTranslations('dashboard')
  const [isOnline, setIsOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  const [showBanner, setShowBanner] = useState(() => (typeof navigator === 'undefined' ? false : !navigator.onLine))
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | null = null

    const handleOnline = () => {
      setIsOnline(true)
      setShowBanner(true)
      setDismissed(false)
      
      // Auto-hide after 3 seconds when back online
      hideTimer = setTimeout(() => {
        setShowBanner(false)
      }, 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowBanner(true)
      setDismissed(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      if (hideTimer) {
        clearTimeout(hideTimer)
      }
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showBanner || dismissed) {
    return null
  }

  return (
    <div
      className={clsx(
        'fixed top-0 left-0 right-0 z-[100] px-4 py-3 flex items-center justify-between transition-colors duration-300',
        isOnline 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white'
      )}
    >
      <div className="flex items-center gap-3">
        {isOnline ? (
          <>
            <Wifi className="w-5 h-5" />
            <span className="font-medium">{t('backOnline')}</span>
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5" />
            <span className="font-medium">{t('offlineMessage')}</span>
          </>
        )}
      </div>
      
      <button
        onClick={() => setDismissed(true)}
        className="p-1 hover:bg-white/20 rounded transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
