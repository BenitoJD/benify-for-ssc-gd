import apiClient from './client'

export interface PYQ {
  id: string
  topic_id: string
  topic_name: string | null
  subject_id: string
  subject_name: string | null
  question_text: string
  question_type: 'mcq' | 'true_false'
  options: string[]
  correct_answer: string
  explanation: string | null
  source: string
  exam_year: number
  created_at: string
}

export interface PYQListResponse {
  data: PYQ[]
  meta: {
    total: number
    page: number
    limit: number
    total_pages: number
  }
}

export interface YearCount {
  year: number
  count: number
}

export interface YearListResponse {
  data: YearCount[]
}

export interface SubjectTopic {
  id: string
  name: string
  description: string | null
  question_count?: number
}

export interface SubjectTopicListResponse {
  data: SubjectTopic[]
}

export interface Subject {
  id: string
  name: string
  code?: string
  description?: string | null
}

export interface PYQFilters {
  year?: number
  subject_id?: string
  topic_id?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  search?: string
  page?: number
  limit?: number
}

export const pyqApi = {
  getPYQs: async (filters: PYQFilters = {}): Promise<PYQListResponse> => {
    const params: Record<string, string | number | undefined> = {}
    if (filters.year) params.year = filters.year
    if (filters.subject_id) params.subject_id = filters.subject_id
    if (filters.topic_id) params.topic_id = filters.topic_id
    if (filters.difficulty) params.difficulty = filters.difficulty
    if (filters.search) params.search = filters.search
    if (filters.page) params.page = filters.page
    if (filters.limit) params.limit = filters.limit
    
    const response = await apiClient.get<PYQListResponse>('/pyqs', { params })
    return response.data
  },

  getPYQ: async (pyqId: string): Promise<PYQ> => {
    const response = await apiClient.get<PYQ>(`/pyqs/${pyqId}`)
    return response.data
  },

  getAvailableYears: async (): Promise<YearListResponse> => {
    const response = await apiClient.get<YearListResponse>('/pyqs/years/list')
    return response.data
  },

  getSubjectTopics: async (subjectId: string): Promise<SubjectTopicListResponse> => {
    const response = await apiClient.get<SubjectTopicListResponse>(`/pyqs/subjects/${subjectId}/topics`)
    return response.data
  },

  getSubjects: async (): Promise<Subject[]> => {
    const response = await apiClient.get<Subject[]>('/subjects')
    return response.data
  },
}
