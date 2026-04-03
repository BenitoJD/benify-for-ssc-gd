'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { clsx } from 'clsx'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { adminApi } from '@/lib/api/admin'
import {
  LayoutDashboard,
  Users,
  FileText,
  Menu,
  X,
  LogOut,
  BookOpen,
  List,
  FileCheck,
  ClipboardList,
  Megaphone,
  Activity,
  FolderOpen
} from 'lucide-react'

interface AdminUser {
  id: string
  email: string
  name?: string
  role: string
}

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/admin/users', icon: Users, label: 'Users', exact: false },
  { href: '/admin/announcements', icon: Megaphone, label: 'Announcements', exact: false },
]

const contentNavItems = [
  { href: '/admin/content', icon: BookOpen, label: 'Content', exact: true },
  { href: '/admin/content/subjects', icon: FileText, label: 'Subjects', exact: false },
  { href: '/admin/content/topics', icon: List, label: 'Topics', exact: false },
  { href: '/admin/content/lessons', icon: FileCheck, label: 'Lessons', exact: false },
  { href: '/admin/content/questions', icon: FileText, label: 'Questions', exact: false },
  { href: '/admin/content/test-series', icon: ClipboardList, label: 'Test Series', exact: false },
]

const operationsNavItems = [
  { href: '/admin/documents', icon: FolderOpen, label: 'Documents', exact: false },
  { href: '/admin/physical', icon: Activity, label: 'Physical', exact: false },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const isLoginRoute = pathname === '/admin/login'

  useEffect(() => {
    let cancelled = false

    const bootAdmin = async () => {
      if (isLoginRoute) {
        setIsLoading(false)
        return
      }

      try {
        const user = await adminApi.getMe()
        if (user.role !== 'admin' && user.role !== 'super_admin') {
          throw new Error('Invalid admin role')
        }

        if (!cancelled) {
          setAdminUser(user)
        }
      } catch {
        if (!cancelled) {
          router.replace('/admin/login')
        }
        return
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void bootAdmin()

    return () => {
      cancelled = true
    }
  }, [isLoginRoute, router])

  const handleLogout = async () => {
    try {
      await adminApi.logout()
    } finally {
      router.replace('/admin/login')
    }
  }

  const isActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  if (isLoginRoute) {
    return <>{children}</>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    )
  }

  if (!adminUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] font-sans text-[var(--text-main)] flex">
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r-2 border-[var(--border-light)] transform transition-transform duration-300 ease-in-out flex flex-col',
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b-2 border-[var(--border-light)]">
            <BrandLogo
              href="/admin"
              size="md"
            />
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-2 hover:bg-[#FAFAFA] rounded-md transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6 border-b-2 border-[var(--border-light)]">
            <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Logged in as</p>
            <p className="font-bold text-sm truncate text-[var(--text-main)] mb-2">{adminUser.email}</p>
            <p className="text-[10px] text-yellow-800 uppercase tracking-widest font-bold px-2.5 py-1 bg-yellow-100 border-2 border-yellow-200 rounded-lg inline-block">{adminUser.role.replace('_', ' ')}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-5 space-y-8 overflow-y-auto">
            {/* Main nav */}
            <div className="space-y-1">
              <p className="px-3 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">Main</p>
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href, item.exact)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-bold border-2',
                      active
                        ? 'bg-[var(--text-main)] text-white border-black shadow-[0_4px_0_rgba(0,0,0,0.2)] -translate-y-0.5'
                        : 'border-transparent text-[var(--text-muted)] hover:bg-gray-50 hover:text-black hover:border-[var(--border-light)]'
                    )}
                  >
                    <Icon className={clsx('w-5 h-5', active ? 'text-white' : 'text-gray-400')} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Content Management */}
            <div className="space-y-1">
              <p className="px-3 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">Content</p>
              {contentNavItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href, item.exact)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-bold border-2',
                      active
                        ? 'bg-[var(--text-main)] text-white border-black shadow-[0_4px_0_rgba(0,0,0,0.2)] -translate-y-0.5'
                        : 'border-transparent text-[var(--text-muted)] hover:bg-gray-50 hover:text-black hover:border-[var(--border-light)]'
                    )}
                  >
                    <Icon className={clsx('w-5 h-5', active ? 'text-white' : 'text-gray-400')} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>

            <div className="space-y-1">
              <p className="px-3 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">Operations</p>
              {operationsNavItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href, item.exact)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-bold border-2',
                      active
                        ? 'bg-[var(--text-main)] text-white border-black shadow-[0_4px_0_rgba(0,0,0,0.2)] -translate-y-0.5'
                        : 'border-transparent text-[var(--text-muted)] hover:bg-gray-50 hover:text-black hover:border-[var(--border-light)]'
                    )}
                  >
                    <Icon className={clsx('w-5 h-5', active ? 'text-white' : 'text-gray-400')} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>

          </nav>

          {/* Footer */}
          <div className="p-5 overflow-visible">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-50 border-2 border-red-200 text-red-600 hover:bg-red-100 rounded-2xl transition-all text-sm font-bold shadow-[0_4px_0_rgb(254,202,202)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-10 pt-20 lg:pt-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto mb-20">
          {children}
        </div>
      </main>
    </div>
  )
}
