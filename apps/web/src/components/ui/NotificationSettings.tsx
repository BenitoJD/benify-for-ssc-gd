'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Bell, BellOff, Save, Check, X, MessageCircle, Calendar, FileText, Award } from 'lucide-react'
import { clsx } from 'clsx'
import {
  isPushSupported,
  getNotificationPermission,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  storeFCMToken,
  removeFCMToken,
} from '@/lib/fcm'

interface NotificationSettingsProps {
  locale: 'en' | 'hi'
  userId: string
}

export interface NotificationPreferences {
  streak_reminder: boolean
  study_reminder: boolean
  exam_alert: boolean
  document_deadline: boolean
  badge_earned: boolean
  reply_received: boolean
  answer_accepted: boolean
  upvote_milestone: boolean
  announcement: boolean
}

export function NotificationSettings({ locale, userId }: NotificationSettingsProps) {
  const t = useTranslations('notifications')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default')
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    streak_reminder: true,
    study_reminder: true,
    exam_alert: true,
    document_deadline: true,
    badge_earned: true,
    reply_received: true,
    answer_accepted: true,
    upvote_milestone: false,
    announcement: true,
  })

  // Load initial state
  useEffect(() => {
    const loadState = async () => {
      if (!isPushSupported()) {
        setPermissionStatus('unsupported')
        return
      }

      const permission = getNotificationPermission()
      setPermissionStatus(permission)
      
      if (permission === 'granted') {
        setIsSubscribed(true)
      }

      // Load saved preferences from backend
      try {
        const response = await fetch('/api/v1/users/me/notification-preferences')
        if (response.ok) {
          const data = await response.json()
          if (data.preferences) {
            setPreferences(data.preferences)
          }
        }
      } catch {
        // Use default preferences
      }
    }

    loadState()
  }, [])

  const handleToggleSubscription = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (isSubscribed) {
        // Unsubscribe
        await unsubscribeFromPush()
        await removeFCMToken()
        setIsSubscribed(false)
        setPermissionStatus('denied')
      } else {
        // Subscribe
        const permission = await requestNotificationPermission()
        setPermissionStatus(permission)

        if (permission === 'granted') {
          const token = await subscribeToPush()
          if (token) {
            await storeFCMToken(token)
            setIsSubscribed(true)
          }
        } else {
          setError(permission === 'denied' ? t('permissionDenied') : t('permissionError'))
        }
      }
    } catch (err) {
      setError(t('genericError'))
      console.error('Error toggling subscription:', err)
    } finally {
      setIsLoading(false)
    }
  }, [isSubscribed, t])

  const handleTogglePreference = useCallback((key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }, [])

  const handleSavePreferences = useCallback(async () => {
    setIsSaving(true)
    setError(null)
    setShowSuccess(false)

    try {
      const response = await fetch('/api/v1/users/me/notification-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      })

      if (!response.ok) {
        throw new Error('Failed to save preferences')
      }

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (err) {
      setError(t('saveError'))
      console.error('Error saving preferences:', err)
    } finally {
      setIsSaving(false)
    }
  }, [preferences, t])

  const notificationTypes = [
    {
      id: 'streak_reminder' as const,
      icon: <Bell className="w-5 h-5" />,
      titleKey: 'types.streakReminder',
      descriptionKey: 'types.streakReminderDesc',
    },
    {
      id: 'study_reminder' as const,
      icon: <MessageCircle className="w-5 h-5" />,
      titleKey: 'types.studyReminder',
      descriptionKey: 'types.studyReminderDesc',
    },
    {
      id: 'exam_alert' as const,
      icon: <Calendar className="w-5 h-5" />,
      titleKey: 'types.examAlert',
      descriptionKey: 'types.examAlertDesc',
    },
    {
      id: 'document_deadline' as const,
      icon: <FileText className="w-5 h-5" />,
      titleKey: 'types.documentDeadline',
      descriptionKey: 'types.documentDeadlineDesc',
    },
    {
      id: 'badge_earned' as const,
      icon: <Award className="w-5 h-5" />,
      titleKey: 'types.badgeEarned',
      descriptionKey: 'types.badgeEarnedDesc',
    },
  ]

  const communityTypes = [
    {
      id: 'reply_received' as const,
      icon: <MessageCircle className="w-5 h-5" />,
      titleKey: 'types.replyReceived',
      descriptionKey: 'types.replyReceivedDesc',
    },
    {
      id: 'answer_accepted' as const,
      icon: <Check className="w-5 h-5" />,
      titleKey: 'types.answerAccepted',
      descriptionKey: 'types.answerAcceptedDesc',
    },
    {
      id: 'upvote_milestone' as const,
      icon: <Bell className="w-5 h-5" />,
      titleKey: 'types.upvoteMilestone',
      descriptionKey: 'types.upvoteMilestoneDesc',
    },
  ]

  if (permissionStatus === 'unsupported') {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <BellOff className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('notSupported')}
        </h3>
        <p className="text-gray-500">
          {t('notSupportedDesc')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Push Subscription Toggle */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={clsx(
                  'rounded-full p-3 transition-colors',
                  isSubscribed ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'
                )}
              >
                {isSubscribed ? <Bell className="w-6 h-6" /> : <BellOff className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('pushNotifications')}
                </h3>
                <p className="text-sm text-gray-500">
                  {isSubscribed ? t('subscribedDesc') : t('notSubscribedDesc')}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleSubscription}
              disabled={isLoading || permissionStatus === 'denied'}
              className={clsx(
                'relative inline-flex h-8 w-14 items-center rounded-full transition-colors',
                isSubscribed ? 'bg-primary-600' : 'bg-gray-200',
                (isLoading || permissionStatus === 'denied') && 'opacity-50 cursor-not-allowed'
              )}
            >
              <span
                className={clsx(
                  'inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform',
                  isSubscribed ? 'translate-x-7' : 'translate-x-1'
                )}
              />
            </button>
          </div>
          
          {permissionStatus === 'denied' && (
            <p className="mt-4 text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
              {t('permissionDeniedHint')}
            </p>
          )}
        </div>
      </div>

      {/* Notification Preferences */}
      {isSubscribed && (
        <>
          {/* Study Notifications */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">
                {t('studyNotifications')}
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {notificationTypes.map((type) => (
                <div key={type.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-gray-400">{type.icon}</div>
                    <div>
                      <p className="font-medium text-gray-900">{t(type.titleKey)}</p>
                      <p className="text-sm text-gray-500">{t(type.descriptionKey)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTogglePreference(type.id)}
                    className={clsx(
                      'relative inline-flex h-6 w-10 items-center rounded-full transition-colors',
                      preferences[type.id] ? 'bg-primary-600' : 'bg-gray-200'
                    )}
                  >
                    <span
                      className={clsx(
                        'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                        preferences[type.id] ? 'translate-x-5' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Community Notifications */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">
                {t('communityNotifications')}
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {communityTypes.map((type) => (
                <div key={type.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-gray-400">{type.icon}</div>
                    <div>
                      <p className="font-medium text-gray-900">{t(type.titleKey)}</p>
                      <p className="text-sm text-gray-500">{t(type.descriptionKey)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTogglePreference(type.id)}
                    className={clsx(
                      'relative inline-flex h-6 w-10 items-center rounded-full transition-colors',
                      preferences[type.id] ? 'bg-primary-600' : 'bg-gray-200'
                    )}
                  >
                    <span
                      className={clsx(
                        'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                        preferences[type.id] ? 'translate-x-5' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Announcements */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">
                {t('platformNotifications')}
              </h3>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-gray-400">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('types.announcements')}</p>
                  <p className="text-sm text-gray-500">{t('types.announcementsDesc')}</p>
                </div>
              </div>
              <button
                onClick={() => handleTogglePreference('announcement')}
                className={clsx(
                  'relative inline-flex h-6 w-10 items-center rounded-full transition-colors',
                  preferences.announcement ? 'bg-primary-600' : 'bg-gray-200'
                )}
              >
                <span
                  className={clsx(
                    'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                    preferences.announcement ? 'translate-x-5' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between">
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            {showSuccess && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <Check className="w-4 h-4" />
                {t('saved')}
              </p>
            )}
            <button
              onClick={handleSavePreferences}
              disabled={isSaving}
              className={clsx(
                'ml-auto flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors',
                'bg-primary-600 text-white',
                'hover:bg-primary-700',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isSaving ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('saving')}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {t('savePreferences')}
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationSettings
