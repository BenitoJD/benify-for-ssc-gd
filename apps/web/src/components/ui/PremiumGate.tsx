'use client'

interface PremiumGateProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  showUpgradeWall?: boolean
}

export function PremiumGate({ children, fallback }: PremiumGateProps) {
  return <>{children ?? fallback ?? null}</>
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
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
      Free
    </span>
  )
}

// Hook to check if content is premium
export function usePremiumAccess() {
  return { isPremium: true, loading: false }
}
