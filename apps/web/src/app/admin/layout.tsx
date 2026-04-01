'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { clsx } from 'clsx'
import { BrandLogo } from '@/components/ui/BrandLogo'
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
  { href: '/admin/content/test-series', icon: ClipboardList, label: 'Test Series', exact: false },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const isLoginRoute = pathname === '/admin/login'

  useEffect(() => {
    if (isLoginRoute) {
      setIsLoading(false)
      return
    }

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
  }, [isLoginRoute, router])

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

  if (isLoginRoute) {
    return <>{children}</>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#111827]" />
      </div>
    )
  }

  if (!adminUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#111827] flex">
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
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#EAEAEA] transform transition-transform duration-300 ease-in-out flex flex-col',
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#EAEAEA]">
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

          {/* Admin info */}
          <div className="p-5 border-b border-[#EAEAEA]">
            <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider mb-1">Logged in as</p>
            <p className="font-semibold text-sm truncate">{adminUser.email}</p>
            <p className="text-xs text-[#6B7280] mt-1.5 capitalize font-medium px-2 py-0.5 bg-[#FAFAFA] border border-[#EAEAEA] rounded inline-block">{adminUser.role.replace('_', ' ')}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-5 space-y-8 overflow-y-auto">
            {/* Main nav */}
            <div className="space-y-1">
              <p className="px-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Main</p>
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href, item.exact)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-[8px] transition-colors text-sm',
                      active
                        ? 'bg-[#FAFAFA] text-[#111827] font-semibold'
                        : 'text-[#6B7280] hover:bg-[#FAFAFA] hover:text-[#111827] font-medium'
                    )}
                  >
                    <Icon className={clsx('w-[18px] h-[18px]', active ? 'text-[#111827]' : 'text-[#9CA3AF]')} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Content Management */}
            <div className="space-y-1">
              <p className="px-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Content</p>
              {contentNavItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href, item.exact)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-[8px] transition-colors text-sm',
                      active
                        ? 'bg-[#FAFAFA] text-[#111827] font-semibold'
                        : 'text-[#6B7280] hover:bg-[#FAFAFA] hover:text-[#111827] font-medium'
                    )}
                  >
                    <Icon className={clsx('w-[18px] h-[18px]', active ? 'text-[#111827]' : 'text-[#9CA3AF]')} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>

          </nav>

          {/* Footer */}
          <div className="p-5 border-t border-[#EAEAEA]">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-[#6B7280] hover:text-[#111827] hover:bg-[#FAFAFA] rounded-[8px] transition-colors text-sm font-medium"
            >
              <LogOut className="w-[18px] h-[18px]" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-8 pt-16 lg:pt-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
