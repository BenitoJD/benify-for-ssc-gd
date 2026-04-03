'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, LogOut } from 'lucide-react'
import { logout } from '@/lib/auth'

interface PageHeaderProps {
  /** The title displayed in the header center */
  title?: string
  /** Override the back navigation target (default: router.back()) */
  backHref?: string
  /** Label for the back button */
  backLabel?: string
  /** Show the logout button on the right (for standalone pages not in sidebar layout) */
  showLogout?: boolean
  /** Right-side slot for extra content (e.g., action buttons) */
  actions?: React.ReactNode
  className?: string
}

/**
 * Reusable page header with a consistent Back button and optional Logout.
 * Use this in pages that render OUTSIDE the Sidebar layout
 * (e.g. exam mode, login-protected standalone views).
 */
export function PageHeader({
  title,
  backHref,
  backLabel = 'Back',
  showLogout = false,
  actions,
  className = '',
}: PageHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (backHref) {
      router.push(backHref)
    } else {
      router.back()
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      router.push('/login')
    }
  }

  return (
    <header
      className={`sticky top-0 z-30 bg-white border-b-2 border-[var(--border-light)] ${className}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Back button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[#FAFAFA] hover:bg-gray-100 border-2 border-[var(--border-light)] rounded-xl transition-all active:scale-95"
            aria-label={backLabel}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{backLabel}</span>
          </button>

          {title && (
            <h1 className="text-lg font-bold text-[var(--text-main)] truncate">{title}</h1>
          )}
        </div>

        {/* Right: actions + optional logout */}
        <div className="flex items-center gap-3">
          {actions}

          {showLogout && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-xl transition-all shadow-[0_3px_0_rgb(254,202,202)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
