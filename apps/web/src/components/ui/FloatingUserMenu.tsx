'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, ChevronUp } from 'lucide-react'
import { fetchCurrentUser, logout } from '@/lib/auth'

/**
 * A floating action button pinned to the bottom-right corner.
 * Shows a user avatar and a popup menu with logout — always within thumb-reach.
 */
export function FloatingUserMenu() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false

    const loadCurrentUser = async () => {
      try {
        const user = await fetchCurrentUser()
        if (!cancelled) {
          setUsername(user?.name || user?.email || null)
        }
      } catch {
        if (!cancelled) {
          setUsername(null)
        }
      }
    }

    void loadCurrentUser()

    return () => {
      cancelled = true
    }
  }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      router.push('/login')
    }
  }

  const initials = username
    ? username
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'ME'

  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Popup menu */}
      {open && (
        <div className="card-brilliant p-3 w-52 mb-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
          {username && (
            <div className="px-2 pb-2 mb-2 border-b border-[var(--border-light)]">
              <p className="text-xs text-[var(--text-muted)] font-medium">Logged in as</p>
              <p className="text-sm font-bold text-[var(--text-main)] truncate">{username}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* FAB trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-14 h-14 rounded-full bg-[var(--text-main)] text-white flex items-center justify-center shadow-[0_6px_0_rgba(0,0,0,0.25)] hover:-translate-y-1 active:translate-y-0.5 active:shadow-[0_2px_0_rgba(0,0,0,0.25)] transition-all font-bold text-sm select-none"
        aria-label="User menu"
      >
        {open ? <ChevronUp className="w-5 h-5" /> : <span>{initials}</span>}
      </button>
    </div>
  )
}
