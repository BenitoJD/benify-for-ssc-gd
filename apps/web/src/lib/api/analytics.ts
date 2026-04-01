import apiClient from './client'

export interface UserStats {
  total_lessons_completed: number
  total_tests_taken: number
  total_study_hours: number
  current_streak: number
  longest_streak: number
  overall_progress: number
  weak_areas_count: number
}

export interface AnalyticsOverall {
  total_mocks_taken: number
  total_questions_attempted: number
  total_correct_answers: number
  overall_accuracy: number
  best_score?: number | null
  best_score_date?: string | null
  avg_score?: number | null
  avg_time_per_question?: number | null
  current_streak: number
  longest_streak: number
  avg_rank_percentile?: number | null
  improvement_percentage?: number | null
}

export interface SubjectAccuracy {
  subject_id: string
  subject_name: string
  accuracy: number
  total_questions: number
  correct_answers: number
  avg_time_per_question: number
  trend?: string | null
  trend_percentage?: number | null
}

export interface WeakChapter {
  topic_id: string
  topic_name: string
  subject_id: string
  subject_name: string
  accuracy: number
  error_rate: number
  total_attempts: number
  questions_attempted: number
  questions_incorrect: number
  is_highlighted: boolean
}

export interface AnalyticsResponse {
  date_range: string
  start_date?: string | null
  end_date?: string | null
  overall: AnalyticsOverall
  score_trend: Array<{
    attempt_id: string
    test_title: string
    completed_at: string
    total_score: number
    max_score: number
    percentage: number
    rank_percentile?: number | null
  }>
  subject_accuracy: SubjectAccuracy[]
  weak_chapters: WeakChapter[]
  mock_comparison: Array<{
    attempt_id: string
    test_title: string
    completed_at: string
    user_score: number
    user_percentage: number
    platform_average: number
    difference: number
    is_above_average: boolean
  }>
  time_analytics: Array<{
    subject_id: string
    subject_name: string
    avg_time_seconds: number
    total_questions: number
  }>
  recommendations: Array<{
    topic_id: string
    topic_name: string
    subject_id: string
    subject_name: string
    priority: number
    current_accuracy: number
    questions_to_practice: number
    pyq_filter_url: string
    status: string
  }>
  generated_at: string
}

export interface ExamReadinessResponse {
  overall_readiness: number
  academic_readiness: number
  physical_readiness: number
  academic_breakdown: Record<string, number>
  physical_breakdown: Record<string, number>
  readiness_label: string
  recommendations: string[]
}

export interface StageReadinessResponse {
  pst_readiness: number
  pet_readiness: number
  document_readiness: number
  overall_readiness: number
  pst_details: Record<string, unknown>
  pet_details: Record<string, unknown>
  document_details: Record<string, unknown>
  stage_status: Record<string, string>
}

export interface CohortComparisonResponse {
  cohort_name: string
  cohort_size: number
  cohort_start_date: string
  user_progress: number
  cohort_average_progress: number
  user_percentile: number
  progress_comparison: Record<string, unknown>
  user_averages: Record<string, unknown>
  cohort_distribution: Record<string, unknown>
}

export const analyticsApi = {
  getUserStats: async (): Promise<UserStats> => {
    const response = await apiClient.get<UserStats>('/users/me/stats')
    return response.data
  },

  getUserAnalytics: async (): Promise<AnalyticsResponse> => {
    const response = await apiClient.get<AnalyticsResponse>('/users/me/analytics')
    return response.data
  },

  getExamReadiness: async (): Promise<ExamReadinessResponse> => {
    const response = await apiClient.get<ExamReadinessResponse>('/users/me/analytics/exam-readiness')
    return response.data
  },

  getStageReadiness: async (): Promise<StageReadinessResponse> => {
    const response = await apiClient.get<StageReadinessResponse>('/users/me/analytics/stage-readiness')
    return response.data
  },

  getCohortComparison: async (): Promise<CohortComparisonResponse> => {
    const response = await apiClient.get<CohortComparisonResponse>('/users/me/analytics/cohort-comparison')
    return response.data
  },
}
