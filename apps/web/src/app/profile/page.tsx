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
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="flex">
        <Sidebar locale={locale} />

        <main className="flex-1 lg:ml-0 p-4 lg:p-8 pt-16 lg:pt-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <section className="bg-white border border-[#EAEAEA] rounded-[12px] p-6 shadow-sm">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FAFAFA] border border-[#EAEAEA]">
                    <UserCircle2 className="w-9 h-9 text-[#6B7280]" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">
                      {profile.name || profile.email.split('@')[0]}
                    </h1>
                    <div className="mt-3 flex flex-col gap-2 text-sm text-[#6B7280]">
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
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#111827] text-white rounded-[8px] hover:bg-black transition-colors text-sm font-medium"
                >
                  Update Preferences
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-6 shadow-sm">
                <h2 className="text-base font-semibold tracking-tight text-[#111827] mb-4">Study Profile</h2>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#6B7280] flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Target Exam Year
                    </span>
                    <span className="font-medium text-[#111827]">{profile.target_exam_year ?? 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#6B7280] flex items-center gap-2">
                      <Clock3 className="w-4 h-4" />
                      Daily Study Hours
                    </span>
                    <span className="font-medium text-[#111827]">{profile.daily_study_hours ?? 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#6B7280]">Current Level</span>
                    <span className="font-medium text-[#111827]">{formatLevel(profile.current_level)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#6B7280]">Fitness Level</span>
                    <span className="font-medium text-[#111827]">{formatLevel(profile.fitness_level)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#6B7280]">Gender</span>
                    <span className="font-medium text-[#111827] capitalize">{profile.gender ?? 'Not set'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-6 shadow-sm">
                <h2 className="text-base font-semibold tracking-tight text-[#111827] mb-4">Account</h2>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#6B7280]">Subscription</span>
                    <span className="font-medium text-[#111827] capitalize">
                      {profile.subscription_status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#6B7280]">Phone</span>
                    <span className="font-medium text-[#111827]">{profile.phone ?? 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#6B7280] flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Joined
                    </span>
                    <span className="font-medium text-[#111827]">{formatDate(profile.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#6B7280]">Last Updated</span>
                    <span className="font-medium text-[#111827]">{formatDate(profile.updated_at)}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <Link
                href="/pyqs"
                className="bg-white border border-[#EAEAEA] rounded-[12px] p-5 shadow-sm hover:bg-[#FCFCFC] transition-colors"
              >
                <h3 className="font-semibold text-[#111827] text-sm">Practice PYQs</h3>
                <p className="mt-2 text-sm text-[#6B7280]">Continue solving previous year questions.</p>
              </Link>
              <Link
                href="/physical"
                className="bg-white border border-[#EAEAEA] rounded-[12px] p-5 shadow-sm hover:bg-[#FCFCFC] transition-colors"
              >
                <h3 className="font-semibold text-[#111827] text-sm">Physical Readiness</h3>
                <p className="mt-2 text-sm text-[#6B7280]">Track PST and PET preparation.</p>
              </Link>
              <Link
                href="/documents"
                className="bg-white border border-[#EAEAEA] rounded-[12px] p-5 shadow-sm hover:bg-[#FCFCFC] transition-colors"
              >
                <h3 className="font-semibold text-[#111827] text-sm">Documents</h3>
                <p className="mt-2 text-sm text-[#6B7280]">Review checklist and medical readiness.</p>
              </Link>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
