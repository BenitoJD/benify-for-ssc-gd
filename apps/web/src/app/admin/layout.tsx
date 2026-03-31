'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { clsx } from 'clsx'
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Shield,
  BookOpen,
  List,
  FileCheck,
  HelpCircle,
  ClipboardList
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
]

const contentNavItems = [
  { href: '/admin/content', icon: BookOpen, label: 'Content', exact: true },
  { href: '/admin/content/subjects', icon: FileText, label: 'Subjects', exact: false },
  { href: '/admin/content/topics', icon: List, label: 'Topics', exact: false },
  { href: '/admin/content/lessons', icon: FileCheck, label: 'Lessons', exact: false },
  { href: '/admin/content/questions', icon: HelpCircle, label: 'Questions', exact: false },
  { href: '/admin/content/test-series', icon: ClipboardList, label: 'Test Series', exact: false },
]

const adminNavItems = [
  { href: '/admin/analytics', icon: BarChart3, label: 'Analytics', exact: false },
  { href: '/admin/settings', icon: Settings, label: 'Settings', exact: false },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for admin access token
    const token = localStorage.getItem('admin_access_token')
    const userStr = localStorage.getItem('admin_user')
    
    if (!token || !userStr) {
      router.push('/admin/login')
      return
    }

    try {
      const user = JSON.parse(userStr) as AdminUser
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        router.push('/admin/login')
        return
      }
      setAdminUser(user)
    } catch {
      router.push('/admin/login')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('admin_access_token')
    localStorage.removeItem('admin_user')
    router.push('/admin/login')
  }

  const isActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!adminUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
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
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <Link href="/admin" className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary-400" />
              <span className="text-xl font-bold">Admin Panel</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-800 rounded-lg"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Admin info */}
          <div className="p-4 border-b border-gray-800">
            <p className="text-sm text-gray-400">Logged in as</p>
            <p className="font-medium truncate">{adminUser.email}</p>
            <p className="text-xs text-gray-500 mt-1 capitalize">{adminUser.role.replace('_', ' ')}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
            {/* Main nav */}
            <div className="space-y-1">
              <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Main</p>
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href, item.exact)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                      active
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Content Management */}
            <div className="space-y-1">
              <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Content</p>
              {contentNavItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href, item.exact)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                      active
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Admin Tools */}
            <div className="space-y-1">
              <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Admin</p>
              {adminNavItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href, item.exact)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                      active
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
