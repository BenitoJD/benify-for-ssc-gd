'use client'

import { useTranslations } from 'next-intl'
import { clsx } from 'clsx'
import Link from 'next/link'
import { Crown, Check, Sparkles } from 'lucide-react'

interface SubscriptionWidgetProps {
  planName: 'free' | 'monthly' | 'quarterly' | 'yearly'
  renewalDate?: Date
  locale: 'en' | 'hi'
  isPremium: boolean
}

export function SubscriptionWidget({ 
  planName, 
  renewalDate, 
  locale,
  isPremium 
}: SubscriptionWidgetProps) {
  const t = useTranslations('dashboard')

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const premiumFeatures = [
    t('unlimitedTests'),
    t('aiRecommendations'),
    t('physicalTraining'),
    t('prioritySupport'),
  ]

  return (
    <div className={clsx(
      'rounded-2xl p-6',
      isPremium 
        ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white' 
        : 'bg-white shadow-sm border border-gray-100'
    )}>
      <div className="flex items-center gap-3 mb-4">
        {isPremium ? (
          <Crown className="w-6 h-6 text-yellow-400" />
        ) : (
          <Sparkles className="w-6 h-6 text-primary-600" />
        )}
        <h2 className="text-lg font-semibold">
          {isPremium ? t('premiumPlan') : t('currentPlan')}
        </h2>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">
            {planName === 'free' ? t('freePlan') : planName.charAt(0).toUpperCase() + planName.slice(1)}
          </span>
          {planName !== 'free' && (
            <span className={clsx(isPremium ? 'text-purple-200' : 'text-gray-500')}>
              /{planName === 'quarterly' ? '3mo' : planName === 'yearly' ? 'year' : 'mo'}
            </span>
          )}
        </div>
        {renewalDate && (
          <p className={clsx(
            'text-sm mt-1',
            isPremium ? 'text-purple-200' : 'text-gray-500'
          )}>
            {t('renewalDate')}: {formatDate(renewalDate)}
          </p>
        )}
      </div>

      {isPremium ? (
        <div className="space-y-2 mb-4">
          {premiumFeatures.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-400" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-4">
          <p className={clsx(
            'text-sm mb-3',
            isPremium ? 'text-purple-200' : 'text-gray-600'
          )}>
            Unlock premium features:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-1 text-gray-500">
                <span>✨</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isPremium && (
        <Link
          href={`/${locale}/pricing`}
          className="block w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-center font-semibold rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg shadow-purple-300"
        >
          {t('upgradeToPremium')}
        </Link>
      )}
    </div>
  )
}
