'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  ChevronRight,
  Clock3,
  Mail,
  Shield,
  Target,
  UserCircle2,
} from 'lucide-react'
import { Sidebar } from '@/components/ui/Sidebar'
import { fetchCurrentUser } from '@/lib/auth'
import { getProfile, type UserProfile } from '@/lib/api/users'

function formatLevel(level?: string): string {
  if (!level) return 'Not set'
  return level.charAt(0).toUpperCase() + level.slice(1)
}

function formatDate(value?: string): string {
  if (!value) return 'Not available'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Not available'
  }

  return date.toLocaleDateString()
}

export default function ProfilePage() {
  const router = useRouter()
  const locale: 'en' = 'en'
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const currentUser = await fetchCurrentUser()
        if (!currentUser) {
          router.push('/login')
          return
        }

        const profileData = await getProfile()
        setProfile(profileData)
      } catch {
        setError('Unable to load your profile right now.')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#111827]" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <div className="flex">
          <Sidebar locale={locale} />
          <main className="flex-1 lg:ml-0 p-4 lg:p-8 pt-16 lg:pt-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-6 shadow-sm">
                <h1 className="text-xl font-semibold tracking-tight text-[#111827]">Profile</h1>
                <p className="mt-2 text-sm text-[#6B7280]">
                  {error ?? 'Profile information is currently unavailable.'}
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] font-sans text-[var(--text-main)] flex flex-col md:flex-row">
      <Sidebar locale={locale} />

      <main className="flex-1 p-4 lg:p-10 pt-20 lg:pt-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8 mb-20">
          <section className="card-brilliant p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100/50 border-2 border-[var(--border-light)] shrink-0">
                  <UserCircle2 className="w-8 h-8 text-[var(--text-muted)]" />
                </div>
                <div>
                  <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--text-main)]">
                    {profile.name || profile.email.split('@')[0]}
                  </h1>
                  <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--text-muted)] font-medium">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span className="capitalize">{profile.role.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href="/onboarding"
                className="btn-3d btn-3d-white px-6 py-3 rounded-full text-sm inline-flex items-center gap-2"
              >
                Update Preferences
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

          <section className="grid gap-8 lg:grid-cols-2">
            <div className="card-brilliant p-8">
              <h2 className="font-display text-xl font-bold tracking-tight text-[var(--text-main)] mb-6">Study Profile</h2>
              <div className="space-y-5 text-sm font-medium border-t-2 border-[var(--border-light)] pt-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--text-muted)] flex items-center gap-2">
                    <Target className="w-4 h-4 text-[var(--brilliant-green)]" />
                    Target Exam Year
                  </span>
                  <span className="font-bold text-[var(--text-main)] bg-gray-50 px-3 py-1 rounded-full border border-gray-100">{profile.target_exam_year ?? 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--text-muted)] flex items-center gap-2">
                    <Clock3 className="w-4 h-4 text-[var(--brilliant-blue)]" />
                    Daily Study Hours
                  </span>
                  <span className="font-bold text-[var(--text-main)] bg-gray-50 px-3 py-1 rounded-full border border-gray-100">{profile.daily_study_hours ?? 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--text-muted)]">Current Level</span>
                  <span className="font-bold text-[var(--text-main)] bg-gray-50 px-3 py-1 rounded-full border border-gray-100">{formatLevel(profile.current_level)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--text-muted)]">Fitness Level</span>
                  <span className="font-bold text-[var(--text-main)] bg-gray-50 px-3 py-1 rounded-full border border-gray-100">{formatLevel(profile.fitness_level)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--text-muted)]">Gender</span>
                  <span className="font-bold text-[var(--text-main)] capitalize bg-gray-50 px-3 py-1 rounded-full border border-gray-100">{profile.gender ?? 'Not set'}</span>
                </div>
              </div>
            </div>

            <div className="card-brilliant p-8">
              <h2 className="font-display text-xl font-bold tracking-tight text-[var(--text-main)] mb-6">Account Details</h2>
              <div className="space-y-5 text-sm font-medium border-t-2 border-[var(--border-light)] pt-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--text-muted)]">Subscription</span>
                  <span className="font-bold text-[var(--text-main)] capitalize bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full border border-yellow-200">
                    {profile.subscription_status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--text-muted)]">Phone</span>
                  <span className="font-bold text-[var(--text-main)] bg-gray-50 px-3 py-1 rounded-full border border-gray-100">{profile.phone ?? 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--text-muted)] flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Joined
                  </span>
                  <span className="font-bold text-[var(--text-main)] bg-gray-50 px-3 py-1 rounded-full border border-gray-100">{formatDate(profile.created_at)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--text-muted)]">Last Updated</span>
                  <span className="font-bold text-[var(--text-main)] bg-gray-50 px-3 py-1 rounded-full border border-gray-100">{formatDate(profile.updated_at)}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-3">
            <Link
              href="/pyqs"
              className="card-brilliant p-6 border-none hover:bg-gray-50 transition-colors flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-[var(--text-main)] text-base mb-1">Practice PYQs</h3>
              <p className="text-sm text-[var(--text-muted)] font-medium">Continue solving previous year questions.</p>
            </Link>
            
            <Link
              href="/physical"
              className="card-brilliant p-6 border-none hover:bg-gray-50 transition-colors flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-[var(--text-main)] text-base mb-1">Physical Readiness</h3>
              <p className="text-sm text-[var(--text-muted)] font-medium">Track PST and PET preparation.</p>
            </Link>

            <Link
              href="/documents"
              className="card-brilliant p-6 border-none hover:bg-gray-50 transition-colors flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-[var(--text-main)] text-base mb-1">Documents</h3>
              <p className="text-sm text-[var(--text-muted)] font-medium">Review checklist and medical readiness.</p>
            </Link>
          </section>
        </div>
      </main>
    </div>
  )
}
