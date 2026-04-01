'use client'

import { useEffect, useState } from 'react'
import { adminApi, AdminDashboardStats, AdminUser } from '@/lib/api/admin'
import { Users, CreditCard, Activity, FileText } from 'lucide-react'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await adminApi.getDashboard()
        setStats(data.stats)
        setRecentUsers(data.recent_registrations)
      } catch (err) {
        setError('Failed to load dashboard data')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#111827]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-[#FAFAFA] border border-red-200 text-red-600 px-4 py-3 rounded-[8px] text-sm font-medium">
        {error}
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.total_users ?? 0,
      icon: Users,
      bgColor: 'bg-[#FAFAFA] border border-[#EAEAEA]',
      textColor: 'text-[#111827]',
    },
    {
      title: 'Active Subscriptions',
      value: stats?.active_subscriptions ?? 0,
      icon: CreditCard,
      bgColor: 'bg-[#FAFAFA] border border-[#EAEAEA]',
      textColor: 'text-[#111827]',
    },
    {
      title: 'Daily Active Users',
      value: stats?.daily_active_users ?? 0,
      icon: Activity,
      bgColor: 'bg-[#FAFAFA] border border-[#EAEAEA]',
      textColor: 'text-[#111827]',
    },
    {
      title: 'Reports',
      value: stats?.reports_count ?? 0,
      icon: FileText,
      bgColor: 'bg-[#FAFAFA] border border-[#EAEAEA]',
      textColor: 'text-[#111827]',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">Dashboard</h1>
        <p className="text-[#6B7280] mt-1 text-sm">Platform overview and statistics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.title}
              className="bg-white rounded-[12px] shadow-sm p-6 border border-[#EAEAEA]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1">{card.title}</p>
                  <p className="text-3xl font-bold tracking-tight text-[#111827]">{card.value.toLocaleString()}</p>
                </div>
                <div className={`${card.bgColor} p-3 rounded-[8px]`}>
                  <Icon className={`w-5 h-5 ${card.textColor}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[12px] shadow-sm p-6 border border-[#EAEAEA]">
          <h2 className="text-[15px] font-semibold tracking-tight text-[#111827] mb-5">Learning Metrics</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#6B7280] font-medium">Total Lessons Completed</span>
              <span className="font-semibold text-[#111827]">
                {stats?.total_lessons_completed.toLocaleString() ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#6B7280] font-medium">Total Tests Taken</span>
              <span className="font-semibold text-[#111827]">
                {stats?.total_tests_taken.toLocaleString() ?? 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[12px] shadow-sm p-6 border border-[#EAEAEA]">
          <h2 className="text-[15px] font-semibold tracking-tight text-[#111827] mb-5">Platform Health</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#6B7280] font-medium">User Retention</span>
              <span className="font-semibold text-[#111827]">
                {stats && stats.total_users > 0
                  ? ((stats.daily_active_users / stats.total_users) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#6B7280] font-medium">Premium Conversion</span>
              <span className="font-semibold text-[#111827]">
                {stats && stats.total_users > 0
                  ? ((stats.active_subscriptions / stats.total_users) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="bg-white rounded-[12px] shadow-sm p-6 border border-[#EAEAEA]">
        <h2 className="text-[15px] font-semibold tracking-tight text-[#111827] mb-5">Recent Registrations</h2>
        {recentUsers.length === 0 ? (
          <p className="text-[#9CA3AF] text-center py-8 text-sm">No recent registrations</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-[#9CA3AF] uppercase tracking-wider border-b border-[#EAEAEA]">
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Name</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA]">
                {recentUsers.map((user) => (
                  <tr key={user.id} className="text-sm transition-colors hover:bg-[#FAFAFA]">
                    <td className="py-3 text-[#111827] font-medium">{user.email}</td>
                    <td className="py-3 text-[#6B7280]">{user.name || '-'}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-[4px] border uppercase tracking-widest ${
                          user.role === 'admin' || user.role === 'super_admin'
                            ? 'bg-[#111827] text-white border-[#111827]'
                            : 'bg-[#FAFAFA] text-[#111827] border-[#EAEAEA]'
                        }`}
                      >
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-[#9CA3AF]">
                      {new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
