'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Bell, X, Check, MessageCircle, Calendar, FileText, Clock } from 'lucide-react'
import { clsx } from 'clsx'
import {
  isPushSupported,
  getNotificationPermission,
  requestNotificationPermission,
  subscribeToPush,
  storeFCMToken,
} from '@/lib/fcm'

interface NotificationPermissionPromptProps {
  locale: 'en'
  onSubscriptionChange?: (subscribed: boolean) => void
}

interface NotificationTypeOption {
  id: string
  icon: React.ReactNode
  titleKey: string
  descriptionKey: string
  enabled: boolean
}

export function NotificationPermissionPrompt({
  onSubscriptionChange,
}: NotificationPermissionPromptProps) {
  const t = useTranslations('notifications')
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default')
  const [selectedTypes, setSelectedTypes] = useState<Record<string, boolean>>({
    streak_reminder: true,
    study_reminder: true,
    exam_alert: true,
    document_deadline: true,
  })

  // Check initial permission status
  useEffect(() => {
    const checkPermission = async () => {
      if (!isPushSupported()) {
        setPermissionStatus('unsupported')
        return
      }

      const permission = getNotificationPermission()
      setPermissionStatus(permission)
      
      if (permission === 'granted') {
        setIsSubscribed(true)
      }
    }

    checkPermission()
  }, [])

  // Show prompt if not yet decided
  useEffect(() => {
    const hasDecided = localStorage.getItem('notification_prompt_decided')
    if (!hasDecided && permissionStatus === 'default') {
      // Delay showing prompt to not interrupt initial load
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [permissionStatus])

  const handleClose = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
      localStorage.setItem('notification_prompt_decided', 'true')
    }, 300)
  }, [])

  const handleOptIn = useCallback(async () => {
    setIsLoading(true)
    try {
      const permission = await requestNotificationPermission()
      setPermissionStatus(permission)

      if (permission === 'granted') {
        const token = await subscribeToPush()
        if (token) {
          await storeFCMToken(token)
          setIsSubscribed(true)
          onSubscriptionChange?.(true)
        }
      }
    } catch (error) {
      console.error('Error opting in to notifications:', error)
    } finally {
      setIsLoading(false)
      handleClose()
    }
  }, [handleClose, onSubscriptionChange])

  const toggleNotificationType = useCallback((type: string) => {
    setSelectedTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }))
  }, [])

  // Don't render if unsupported, denied (and already decided), or granted (and prompt was dismissed)
  if (permissionStatus === 'unsupported' || permissionStatus === 'denied' || (permissionStatus === 'granted' && !isOpen)) {
    return null
  }

  // If granted and we're subscribed, show the manage panel in settings instead
  if (permissionStatus === 'granted' && isSubscribed && !isOpen) {
    return null
  }

  const notificationTypes: NotificationTypeOption[] = [
    {
      id: 'streak_reminder',
      icon: <Clock className="w-5 h-5" />,
      titleKey: 'types.streakReminder',
      descriptionKey: 'types.streakReminderDesc',
      enabled: selectedTypes.streak_reminder,
    },
    {
      id: 'study_reminder',
      icon: <MessageCircle className="w-5 h-5" />,
      titleKey: 'types.studyReminder',
      descriptionKey: 'types.studyReminderDesc',
      enabled: selectedTypes.study_reminder,
    },
    {
      id: 'exam_alert',
      icon: <Calendar className="w-5 h-5" />,
      titleKey: 'types.examAlert',
      descriptionKey: 'types.examAlertDesc',
      enabled: selectedTypes.exam_alert,
    },
    {
      id: 'document_deadline',
      icon: <FileText className="w-5 h-5" />,
      titleKey: 'types.documentDeadline',
      descriptionKey: 'types.documentDeadlineDesc',
      enabled: selectedTypes.document_deadline,
    },
  ]

  if (!isOpen) {
    return null
  }

  return (
    <div
      className={clsx(
        'fixed bottom-4 right-4 z-50 w-full max-w-md',
        'bg-white rounded-2xl shadow-2xl overflow-hidden',
        'border border-gray-100',
        'transform transition-all duration-300 ease-out',
        isClosing ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      )}
      role="dialog"
      aria-labelledby="notification-prompt-title"
      aria-describedby="notification-prompt-description"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 id="notification-prompt-title" className="text-lg font-semibold text-white">
                {t('promptTitle')}
              </h2>
              <p id="notification-prompt-description" className="text-sm text-white/80">
                {t('promptSubtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label={t('close')}
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Notification Types */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            {t('notificationTypes')}
          </h3>
          {notificationTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => toggleNotificationType(type.id)}
              className={clsx(
                'w-full flex items-center gap-3 p-3 rounded-xl transition-all',
                'border-2',
                type.enabled
                  ? 'border-primary-200 bg-primary-50'
                  : 'border-gray-100 bg-gray-50 hover:border-gray-200'
              )}
            >
              <div
                className={clsx(
                  'rounded-full p-2 transition-colors',
                  type.enabled ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-400'
                )}
              >
                {type.icon}
              </div>
              <div className="flex-1 text-left">
                <p className={clsx('font-medium', type.enabled ? 'text-gray-900' : 'text-gray-500')}>
                  {t(type.titleKey)}
                </p>
                <p className="text-sm text-gray-500">
                  {t(type.descriptionKey)}
                </p>
              </div>
              <div
                className={clsx(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
                  type.enabled
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-gray-300 bg-white'
                )}
              >
                {type.enabled && <Check className="w-4 h-4 text-white" />}
              </div>
            </button>
          ))}
        </div>

        {/* Info text */}
        <p className="text-sm text-gray-500 text-center">
          {t('privacyNote')}
        </p>
      </div>

      {/* Actions */}
      <div className="px-6 pb-6 flex gap-3">
        <button
          onClick={handleClose}
          disabled={isLoading}
          className={clsx(
            'flex-1 py-3 px-4 rounded-xl font-medium transition-colors',
            'border-2 border-gray-200 text-gray-600',
            'hover:bg-gray-50',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {t('notNow')}
        </button>
        <button
          onClick={handleOptIn}
          disabled={isLoading}
          className={clsx(
            'flex-1 py-3 px-4 rounded-xl font-medium transition-colors',
            'bg-primary-600 text-white',
            'hover:bg-primary-700',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t('enabling')}
            </span>
          ) : (
            t('enableNotifications')
          )}
        </button>
      </div>
    </div>
  )
}

export default NotificationPermissionPrompt
