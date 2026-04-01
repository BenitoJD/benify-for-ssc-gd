'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { adminApi, AdminUser } from '@/lib/api/admin'
import { ArrowLeft, User, Mail, Phone, Calendar, Shield, CreditCard, Activity, Award } from 'lucide-react'

interface UserDetail extends AdminUser {
  profile?: {
    first_name?: string
    last_name?: string
    phone?: string
    language_preference?: string
    target_exam_year?: number
    current_level?: string
    daily_study_hours?: number
    onboarding_complete?: boolean
  }
  stats?: {
    total_lessons_completed: number
    total_tests_taken: number
    total_study_hours: number
    current_streak: number
    longest_streak: number
    overall_progress: number
  }
}

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const router = useRouter()
  const [user, setUser] = useState<UserDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateMessage, setUpdateMessage] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await adminApi.getUser(id)
        setUser(data as UserDetail)
      } catch (err) {
        setError('Failed to load user details')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [id])

  const handleStatusToggle = async () => {
    if (!user) return

    setIsUpdating(true)
    setUpdateMessage('')

    try {
      const result = await adminApi.updateUserStatus(user.id, !user.is_active)
      setUser((prev) => (prev ? { ...prev, is_active: result.is_active } : null))
      setUpdateMessage(result.message)
      setTimeout(() => setUpdateMessage(''), 3000)
    } catch (err) {
      setUpdateMessage('Failed to update status')
      console.error(err)
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'User not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </Link>

        {updateMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg">
            {updateMessage}
          </div>
        )}
      </div>

      {/* User Header Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-gray-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{user.name || 'N/A'}</h1>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full capitalize ${
                  user.role === 'admin' || user.role === 'super_admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Shield className="w-3 h-3" />
                {user.role.replace('_', ' ')}
              </span>
              <span
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  user.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {user.is_active ? 'Active' : 'Suspended'}
              </span>
            </div>
            <p className="text-gray-500 mt-1">{user.email}</p>
            <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Joined {new Date(user.created_at).toLocaleDateString()}
              </div>
              {user.last_login_at && (
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Last login {new Date(user.last_login_at).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          <div>
            <button
              onClick={handleStatusToggle}
              disabled={isUpdating}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                user.is_active
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              } disabled:opacity-50`}
            >
              {isUpdating
                ? 'Updating...'
                : user.is_active
                ? 'Suspend User'
                : 'Activate User'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
            </div>
            {user.profile?.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{user.profile.phone}</p>
                </div>
              </div>
            )}
            {user.profile?.language_preference && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500 w-5">🌐</span>
                <div>
                  <p className="text-sm text-gray-500">Language</p>
                  <p className="font-medium text-gray-900 uppercase">
                    {user.profile.language_preference}
                  </p>
                </div>
              </div>
            )}
            {user.profile?.target_exam_year && (
              <div>
                <p className="text-sm text-gray-500">Target Exam Year</p>
                <p className="font-medium text-gray-900">{user.profile.target_exam_year}</p>
              </div>
            )}
            {user.profile?.current_level && (
              <div>
                <p className="text-sm text-gray-500">Current Level</p>
                <p className="font-medium text-gray-900 capitalize">{user.profile.current_level}</p>
              </div>
            )}
          </div>
        </div>

        {/* Subscription Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h2>
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-5 h-5 text-gray-400" />
            <span
              className={`inline-flex px-3 py-1 text-sm font-medium rounded-full capitalize ${
                user.subscription_status === 'premium'
                  ? 'bg-green-100 text-green-700'
                  : user.subscription_status === 'cancelled'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {user.subscription_status}
            </span>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Stats</h2>
          {user.stats ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Lessons Completed</span>
                <span className="font-semibold">{user.stats.total_lessons_completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tests Taken</span>
                <span className="font-semibold">{user.stats.total_tests_taken}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Study Hours</span>
                <span className="font-semibold">{user.stats.total_study_hours.toFixed(1)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current Streak</span>
                <span className="font-semibold">{user.stats.current_streak} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Longest Streak</span>
                <span className="font-semibold">{user.stats.longest_streak} days</span>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Overall Progress</span>
                  <span className="font-semibold text-primary-600">
                    {user.stats.overall_progress.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 rounded-full"
                    style={{ width: `${user.stats.overall_progress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No activity data available</p>
          )}
        </div>
      </div>

      {/* Badges placeholder */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Badges & Achievements
        </h2>
        <p className="text-gray-500 text-center py-4">
          Badge system coming soon
        </p>
      </div>
    </div>
  )
}
