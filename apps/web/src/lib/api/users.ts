import apiClient from './client'

export interface OnboardingData {
  language_preference?: 'en' | 'hi'
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

export async function updateProfile(data: OnboardingData): Promise<UserProfile> {
  const response = await apiClient.patch<UserProfile>('/users/me', data)
  return response.data
}

export async function getProfile(): Promise<UserProfile> {
  const response = await apiClient.get<UserProfile>('/users/me')
  return response.data
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
