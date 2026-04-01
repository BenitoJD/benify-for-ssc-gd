'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getFeatureGating } from '@/lib/api/subscriptions'

interface PremiumGateProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  showUpgradeWall?: boolean
}

export function PremiumGate({ children, fallback, showUpgradeWall = true }: PremiumGateProps) {
  const [isPremium, setIsPremium] = useState<boolean | null>(null)
  const [lockedFeatures, setLockedFeatures] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkPremiumStatus()
  }, [])

  async function checkPremiumStatus() {
    try {
      const gating = await getFeatureGating()
      setIsPremium(gating.is_premium)
      setLockedFeatures(gating.locked_features)
    } catch (error) {
      console.error('Failed to check premium status:', error)
      setIsPremium(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse p-4 bg-gray-100 rounded-lg">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    )
  }

  if (isPremium) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (!showUpgradeWall) {
    return null
  }

  return (
    <div className="relative">
      {/* Blurred content behind */}
      <div className="filter blur-sm opacity-50 pointer-events-none select-none">
        {children}
      </div>
      
      {/* Upgrade Wall Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/80 to-white">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Premium Content</h3>
          <p className="text-gray-600 mb-4">
            This content requires a premium subscription. Upgrade now to unlock all features.
          </p>
          <Link
            href="/pricing"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition"
          >
            Upgrade to Premium
          </Link>
        </div>
      </div>
    </div>
  )
}

// Component to show locked icon on features
export function LockedFeature({ featureName }: { featureName: string }) {
  return (
    <div className="flex items-center gap-2 text-gray-500">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <span className="text-sm">{featureName}</span>
    </div>
  )
}

// Component to show locked badge
export function PremiumBadge() {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-600">
      Premium
    </span>
  )
}

// Hook to check if content is premium
export function usePremiumAccess() {
  const [isPremium, setIsPremium] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkPremiumStatus()
  }, [])

  async function checkPremiumStatus() {
    try {
      const gating = await getFeatureGating()
      setIsPremium(gating.is_premium)
    } catch (error) {
      console.error('Failed to check premium status:', error)
      setIsPremium(false)
    } finally {
      setLoading(false)
    }
  }

  return { isPremium, loading }
}
