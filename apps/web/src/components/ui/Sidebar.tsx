'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  BarChart3, 
  Users, 
  User, 
  Menu, 
  X,
  Activity,
  FileCheck
} from 'lucide-react'

interface SidebarProps {
  locale: 'en'
}

const navItems = [
  { id: 'dashboard', href: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { id: 'study', href: '/pyqs', icon: BookOpen, labelKey: 'nav.study' },
  { id: 'tests', href: '/pyqs', icon: FileText, labelKey: 'nav.tests' },
  { id: 'physical', href: '/physical', icon: Activity, labelKey: 'nav.physical' },
  { id: 'documents', href: '/documents', icon: FileCheck, labelKey: 'nav.documents' },
  { id: 'analytics', href: '/dashboard', icon: BarChart3, labelKey: 'nav.analytics' },
  { id: 'community', href: '/community', icon: Users, labelKey: 'nav.community' },
  { id: 'profile', href: '/dashboard', icon: User, labelKey: 'nav.profile' },
]

export function Sidebar({ locale }: SidebarProps) {
  void locale
  const t = useTranslations()
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        aria-label={t('dashboard.menu')}
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
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#EAEAEA] transform transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#EAEAEA]">
            <BrandLogo href="/dashboard" size="md" />
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-2 hover:bg-[#FAFAFA] rounded-md transition-colors"
              aria-label={t('dashboard.closeMenu')}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-5 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <Link
                  key={item.id}
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
                  <span>{t(item.labelKey)}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-5 border-t border-[#EAEAEA]">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 text-[#6B7280] hover:text-[#111827] hover:bg-[#FAFAFA] rounded-[8px] transition-colors text-sm font-medium"
            >
              <span>{t('nav.logout')}</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}
