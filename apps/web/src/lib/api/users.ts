import apiClient from './client'

export interface OnboardingData {
  language_preference?: 'en'
  target_exam_year?: number
  current_level?: 'beginner' | 'intermediate' | 'advanced'
  daily_study_hours?: number
  gender?: 'male' | 'female'
  fitness_level?: 'beginner' | 'intermediate' | 'advanced'
  onboarding_complete?: boolean
}

export interface UserProfile extends OnboardingData {
  id: string
  email: string
  name?: string
  phone?: string
  avatar_url?: string
  role: string
  subscription_status: string
  created_at: string
  updated_at?: string
}

interface UserProfileEnvelope {
  id: string
  email: string
  name?: string
  role: string
  subscription_status: string
  created_at: string
  profile?: {
    id?: string
    user_id?: string
    language_preference?: 'en'
    target_exam_year?: number
    current_level?: 'beginner' | 'intermediate' | 'advanced'
    daily_study_hours?: number
    phone?: string
    avatar_url?: string
    gender?: 'male' | 'female'
    fitness_level?: 'beginner' | 'intermediate' | 'advanced'
    created_at?: string
    updated_at?: string
  } | null
}

function normalizeUserProfile(data: UserProfile | UserProfileEnvelope): UserProfile {
  if (!('profile' in data)) {
    return data
  }

  const profile = data.profile ?? {}

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    role: data.role,
    subscription_status: data.subscription_status,
    created_at: data.created_at,
    updated_at: profile.updated_at,
    language_preference: profile.language_preference,
    target_exam_year: profile.target_exam_year,
    current_level: profile.current_level,
    daily_study_hours: profile.daily_study_hours,
    phone: profile.phone,
    avatar_url: profile.avatar_url,
    gender: profile.gender,
    fitness_level: profile.fitness_level,
  }
}

export async function updateProfile(data: OnboardingData): Promise<UserProfile> {
  const response = await apiClient.patch<UserProfile | UserProfileEnvelope>('/users/me', data)
  return normalizeUserProfile(response.data)
}

export async function getProfile(): Promise<UserProfile> {
  const response = await apiClient.get<UserProfile | UserProfileEnvelope>('/users/me')
  return normalizeUserProfile(response.data)
}

export interface AssessmentResult {
  level: 'beginner' | 'intermediate' | 'advanced'
  score: number
  total_questions: number
}

export async function submitAssessment(answers: Record<string, string>): Promise<AssessmentResult> {
  const response = await apiClient.post<AssessmentResult>('/users/onboarding/assessment', { answers })
  return response.data
}
