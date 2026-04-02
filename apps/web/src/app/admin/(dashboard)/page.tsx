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
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-black" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl text-sm font-bold flex items-center gap-3">
        {error}
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.total_users ?? 0,
      icon: Users,
      bgColor: 'bg-green-100 border-2 border-green-200',
      textColor: 'text-green-700',
    },
    {
      title: 'Active Subscriptions',
      value: stats?.active_subscriptions ?? 0,
      icon: CreditCard,
      bgColor: 'bg-blue-100 border-2 border-blue-200',
      textColor: 'text-blue-700',
    },
    {
      title: 'Daily Active Users',
      value: stats?.daily_active_users ?? 0,
      icon: Activity,
      bgColor: 'bg-yellow-100 border-2 border-yellow-200',
      textColor: 'text-yellow-800',
    },
    {
      title: 'Reports',
      value: stats?.reports_count ?? 0,
      icon: FileText,
      bgColor: 'bg-pink-100 border-2 border-pink-200',
      textColor: 'text-pink-700',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--text-main)] mb-2">Dashboard</h1>
        <p className="font-bold text-[var(--text-muted)] text-sm uppercase tracking-widest">Platform overview and statistics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.title}
              className="card-brilliant p-8 hover:-translate-y-1 transition-transform cursor-default"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">{card.title}</p>
                  <p className="font-display text-3xl font-extrabold tracking-tight text-[var(--text-main)]">{card.value.toLocaleString()}</p>
                </div>
                <div className={`${card.bgColor} p-3 rounded-2xl`}>
                  <Icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-brilliant p-8">
          <h2 className="font-display text-xl font-bold tracking-tight text-[var(--text-main)] mb-6 border-b-2 border-[var(--border-light)] pb-4">Learning Metrics</h2>
          <div className="space-y-5">
            <div className="flex justify-between items-center text-[15px]">
              <span className="text-[var(--text-muted)] font-bold">Total Lessons Completed</span>
              <span className="font-extrabold text-[var(--text-main)] bg-gray-50 px-3 py-1.5 rounded-lg border-2 border-[var(--border-light)]">
                {stats?.total_lessons_completed.toLocaleString() ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center text-[15px]">
              <span className="text-[var(--text-muted)] font-bold">Total Tests Taken</span>
              <span className="font-extrabold text-[var(--text-main)] bg-gray-50 px-3 py-1.5 rounded-lg border-2 border-[var(--border-light)]">
                {stats?.total_tests_taken.toLocaleString() ?? 0}
              </span>
            </div>
          </div>
        </div>

        <div className="card-brilliant p-8">
          <h2 className="font-display text-xl font-bold tracking-tight text-[var(--text-main)] mb-6 border-b-2 border-[var(--border-light)] pb-4">Platform Health</h2>
          <div className="space-y-5">
            <div className="flex justify-between items-center text-[15px]">
              <span className="text-[var(--text-muted)] font-bold">User Retention</span>
              <span className="font-extrabold text-[var(--text-main)] bg-green-50 px-3 py-1.5 rounded-lg border-2 border-green-200 text-green-800">
                {stats && stats.total_users > 0
                  ? ((stats.daily_active_users / stats.total_users) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center text-[15px]">
              <span className="text-[var(--text-muted)] font-bold">Premium Conversion</span>
              <span className="font-extrabold text-[var(--text-main)] bg-blue-50 px-3 py-1.5 rounded-lg border-2 border-blue-200 text-blue-800">
                {stats && stats.total_users > 0
                  ? ((stats.active_subscriptions / stats.total_users) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="card-brilliant p-8">
        <h2 className="font-display text-xl font-bold tracking-tight text-[var(--text-main)] mb-6 border-b-2 border-[var(--border-light)] pb-4">Recent Registrations</h2>
        {recentUsers.length === 0 ? (
          <p className="text-[var(--text-muted)] font-bold text-center py-10 bg-gray-50 border-2 border-[var(--border-light)] rounded-2xl text-sm">No recent registrations</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[11px] text-[var(--text-muted)] uppercase tracking-widest border-b-2 border-[var(--border-light)]">
                  <th className="pb-4 font-bold">Email</th>
                  <th className="pb-4 font-bold">Name</th>
                  <th className="pb-4 font-bold">Role</th>
                  <th className="pb-4 font-bold text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[var(--border-light)]">
                {recentUsers.map((user) => (
                  <tr key={user.id} className="text-[15px] transition-colors hover:bg-gray-50/50">
                    <td className="py-4 text-[var(--text-main)] font-bold">{user.email}</td>
                    <td className="py-4 text-[var(--text-muted)] font-bold">{user.name || '-'}</td>
                    <td className="py-4">
                      <span
                        className={`inline-block px-3 py-1 text-[10px] font-bold rounded-lg border-2 uppercase tracking-widest ${
                          user.role === 'admin' || user.role === 'super_admin'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            : 'bg-gray-50 text-[var(--text-muted)] border-[var(--border-light)]'
                        }`}
                      >
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 text-[var(--text-muted)] font-bold text-right">
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
