import apiClient from './client'

// ============ Content Management Types ============

export interface ContentStatus {
  status: 'draft' | 'review' | 'published'
}

export interface AdminSubject {
  id: string
  name: string
  code: string
  description?: string
  icon_url?: string
  order_index: number
  topic_count: number
  status: ContentStatus['status']
  created_at: string
  updated_at: string
}

export interface AdminTopic {
  id: string
  subject_id: string
  subject_name?: string
  name: string
  description?: string
  order_index: number
  estimated_hours?: number
  lesson_count: number
  status: ContentStatus['status']
  created_at: string
  updated_at: string
}

export interface AdminLesson {
  id: string
  topic_id: string
  topic_name?: string
  subject_name?: string
  title: string
  content?: string
  video_url?: string
  order_index: number
  estimated_minutes?: number
  is_premium: boolean
  status: ContentStatus['status']
  created_at: string
  updated_at: string
}

export interface AdminQuestion {
  id: string
  topic_id: string
  topic_name?: string
  subject_name?: string
  question_text: string
  question_type: 'mcq' | 'true_false'
  options: string[]
  correct_answer: string
  explanation?: string
  difficulty: 'easy' | 'medium' | 'hard'
  marks: number
  negative_marks: number
  is_premium: boolean
  source?: string
  exam_year?: number
  status: ContentStatus['status']
  created_at: string
  updated_at: string
}

export interface AdminTestSeries {
  id: string
  title: string
  description?: string
  test_type: 'full_length' | 'sectional' | 'chapter' | 'quiz'
  duration_minutes: number
  total_questions: number
  marks_per_question: number
  negative_marking: boolean
  negative_marks_per_question: number
  is_premium: boolean
  is_active: boolean
  instructions?: string
  passing_percentage: number
  status: ContentStatus['status']
  created_at: string
  updated_at: string
}

// ============ Create/Update DTOs ============

export interface SubjectCreateDTO {
  name: string
  code: string
  description?: string
  icon_url?: string
  order_index?: number
  status?: ContentStatus['status']
}

export interface SubjectUpdateDTO extends Partial<SubjectCreateDTO> {}

export interface TopicCreateDTO {
  subject_id: string
  name: string
  description?: string
  estimated_hours?: number
  order_index?: number
  status?: ContentStatus['status']
}

export interface TopicUpdateDTO extends Partial<TopicCreateDTO> {}

export interface LessonCreateDTO {
  topic_id: string
  title: string
  content?: string
  video_url?: string
  estimated_minutes?: number
  is_premium?: boolean
  order_index?: number
  status?: ContentStatus['status']
}

export interface LessonUpdateDTO extends Partial<LessonCreateDTO> {}

export interface QuestionCreateDTO {
  topic_id: string
  question_text: string
  question_type?: 'mcq' | 'true_false'
  options: string[]
  correct_answer: string
  explanation?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  marks?: number
  negative_marks?: number
  is_premium?: boolean
  source?: string
  exam_year?: number
  status?: ContentStatus['status']
}

export interface QuestionUpdateDTO extends Partial<QuestionCreateDTO> {}

export interface TestSeriesCreateDTO {
  title: string
  description?: string
  test_type: 'full_length' | 'sectional' | 'chapter' | 'quiz'
  duration_minutes?: number
  total_questions?: number
  marks_per_question?: number
  negative_marking?: boolean
  negative_marks_per_question?: number
  is_premium?: boolean
  is_active?: boolean
  subject_ids?: string[]
  topic_ids?: string[]
  instructions?: string
  passing_percentage?: number
  status?: ContentStatus['status']
}

export interface TestSeriesUpdateDTO extends Partial<TestSeriesCreateDTO> {}

export interface BulkQuestionImportDTO {
  questions: Array<{
    topic_id: string
    question_text: string
    question_type?: 'mcq' | 'true_false'
    options: string[]
    correct_answer: string
    explanation?: string
    difficulty?: 'easy' | 'medium' | 'hard'
    marks?: number
    negative_marks?: number
    is_premium?: boolean
    source?: string
    exam_year?: number
  }>
}

// ============ Admin User Types ============

export interface AdminUser {
  id: string
  email: string
  name?: string
  role: 'student' | 'instructor' | 'admin' | 'super_admin'
  subscription_status: 'free' | 'premium' | 'cancelled'
  created_at: string
  last_login_at?: string
  is_active: boolean
}

export interface AdminDashboardStats {
  total_users: number
  active_subscriptions: number
  daily_active_users: number
  reports_count: number
  total_lessons_completed: number
  total_tests_taken: number
}

export interface AdminLoginRequest {
  email: string
  password: string
}

export interface AdminLoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: {
    id: string
    email: string
    name?: string
    role: string
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export const adminApi = {
  login: async (data: AdminLoginRequest): Promise<AdminLoginResponse> => {
    const response = await apiClient.post<AdminLoginResponse>('/admin/login', data)
    return response.data
  },

  getDashboard: async (): Promise<{
    stats: AdminDashboardStats
    recent_registrations: AdminUser[]
    recent_activity: unknown[]
  }> => {
    const response = await apiClient.get('/admin/dashboard')
    return response.data
  },

  listUsers: async (params: {
    page?: number
    limit?: number
    search?: string
    role?: string
  }): Promise<PaginatedResponse<AdminUser>> => {
    const response = await apiClient.get('/admin/users', { params })
    return response.data
  },

  getUser: async (userId: string): Promise<AdminUser & { profile?: unknown; stats?: unknown }> => {
    const response = await apiClient.get(`/admin/users/${userId}`)
    return response.data
  },

  updateUserStatus: async (userId: string, isActive: boolean): Promise<{
    id: string
    is_active: boolean
    message: string
  }> => {
    const response = await apiClient.patch(`/admin/users/${userId}/status`, { is_active: isActive })
    return response.data
  },

  // ============ Content Management ============

  // Subjects
  listSubjects: async (params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
  }): Promise<PaginatedResponse<AdminSubject>> => {
    const response = await apiClient.get('/admin/subjects', { params })
    return response.data
  },

  getSubject: async (id: string): Promise<AdminSubject> => {
    const response = await apiClient.get(`/admin/subjects/${id}`)
    return response.data
  },

  createSubject: async (data: SubjectCreateDTO): Promise<AdminSubject> => {
    const response = await apiClient.post('/admin/subjects', data)
    return response.data
  },

  updateSubject: async (id: string, data: SubjectUpdateDTO): Promise<AdminSubject> => {
    const response = await apiClient.put(`/admin/subjects/${id}`, data)
    return response.data
  },

  deleteSubject: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/subjects/${id}`)
  },

  // Topics
  listTopics: async (params?: {
    page?: number
    limit?: number
    subject_id?: string
    status?: string
    search?: string
  }): Promise<PaginatedResponse<AdminTopic>> => {
    const response = await apiClient.get('/admin/topics', { params })
    return response.data
  },

  getTopic: async (id: string): Promise<AdminTopic> => {
    const response = await apiClient.get(`/admin/topics/${id}`)
    return response.data
  },

  createTopic: async (data: TopicCreateDTO): Promise<AdminTopic> => {
    const response = await apiClient.post('/admin/topics', data)
    return response.data
  },

  updateTopic: async (id: string, data: TopicUpdateDTO): Promise<AdminTopic> => {
    const response = await apiClient.put(`/admin/topics/${id}`, data)
    return response.data
  },

  deleteTopic: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/topics/${id}`)
  },

  // Lessons
  listLessons: async (params?: {
    page?: number
    limit?: number
    topic_id?: string
    status?: string
    search?: string
  }): Promise<PaginatedResponse<AdminLesson>> => {
    const response = await apiClient.get('/admin/lessons', { params })
    return response.data
  },

  getLesson: async (id: string): Promise<AdminLesson> => {
    const response = await apiClient.get(`/admin/lessons/${id}`)
    return response.data
  },

  createLesson: async (data: LessonCreateDTO): Promise<AdminLesson> => {
    const response = await apiClient.post('/admin/lessons', data)
    return response.data
  },

  updateLesson: async (id: string, data: LessonUpdateDTO): Promise<AdminLesson> => {
    const response = await apiClient.put(`/admin/lessons/${id}`, data)
    return response.data
  },

  deleteLesson: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/lessons/${id}`)
  },

  // Questions
  listQuestions: async (params?: {
    page?: number
    limit?: number
    topic_id?: string
    difficulty?: string
    status?: string
    search?: string
  }): Promise<PaginatedResponse<AdminQuestion>> => {
    const response = await apiClient.get('/admin/questions', { params })
    return response.data
  },

  getQuestion: async (id: string): Promise<AdminQuestion> => {
    const response = await apiClient.get(`/admin/questions/${id}`)
    return response.data
  },

  createQuestion: async (data: QuestionCreateDTO): Promise<AdminQuestion> => {
    const response = await apiClient.post('/admin/questions', data)
    return response.data
  },

  updateQuestion: async (id: string, data: QuestionUpdateDTO): Promise<AdminQuestion> => {
    const response = await apiClient.put(`/admin/questions/${id}`, data)
    return response.data
  },

  deleteQuestion: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/questions/${id}`)
  },

  bulkImportQuestions: async (data: BulkQuestionImportDTO): Promise<{
    imported: number
    failed: number
    errors?: Array<{ row: number; error: string }>
  }> => {
    const response = await apiClient.post('/admin/questions/bulk-import', data)
    return response.data
  },

  // Test Series
  listTestSeries: async (params?: {
    page?: number
    limit?: number
    test_type?: string
    status?: string
    search?: string
  }): Promise<PaginatedResponse<AdminTestSeries>> => {
    const response = await apiClient.get('/admin/test-series', { params })
    return response.data
  },

  getTestSeries: async (id: string): Promise<AdminTestSeries> => {
    const response = await apiClient.get(`/admin/test-series/${id}`)
    return response.data
  },

  createTestSeries: async (data: TestSeriesCreateDTO): Promise<AdminTestSeries> => {
    const response = await apiClient.post('/admin/test-series', data)
    return response.data
  },

  updateTestSeries: async (id: string, data: TestSeriesUpdateDTO): Promise<AdminTestSeries> => {
    const response = await apiClient.put(`/admin/test-series/${id}`, data)
    return response.data
  },

  deleteTestSeries: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/test-series/${id}`)
  },

  // File Upload (MinIO)
  uploadFile: async (file: File, folder: string = 'content'): Promise<{
    url: string
    filename: string
  }> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    const response = await apiClient.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  // Content Status Update
  updateContentStatus: async (
    type: 'subjects' | 'topics' | 'lessons' | 'questions' | 'test-series',
    id: string,
    status: ContentStatus['status']
  ): Promise<void> => {
    await apiClient.patch(`/admin/${type}/${id}/status`, { status })
  },

  // ============ Physical Training Management ============

  listPhysicalPlans: async (params?: {
    page?: number
    limit?: number
    target_gender?: string
    plan_type?: string
    is_active?: boolean
    search?: string
  }): Promise<AdminPhysicalPlan[]> => {
    const response = await apiClient.get('/admin/physical/plans', { params })
    return response.data
  },

  getPhysicalPlan: async (id: string): Promise<AdminPhysicalPlanDetail> => {
    const response = await apiClient.get(`/admin/physical/plans/${id}`)
    return response.data
  },

  createPhysicalPlan: async (data: AdminPhysicalPlanCreateDTO): Promise<AdminPhysicalPlan> => {
    const response = await apiClient.post('/admin/physical/plans', data)
    return response.data
  },

  updatePhysicalPlan: async (id: string, data: AdminPhysicalPlanUpdateDTO): Promise<AdminPhysicalPlan> => {
    const response = await apiClient.put(`/admin/physical/plans/${id}`, data)
    return response.data
  },

  deletePhysicalPlan: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/physical/plans/${id}`)
  },

  getPhysicalCompliance: async (): Promise<PhysicalComplianceStats> => {
    const response = await apiClient.get('/admin/physical/compliance')
    return response.data
  },

  getPhysicalComplianceByGender: async (): Promise<PhysicalComplianceByGender[]> => {
    const response = await apiClient.get('/admin/physical/compliance/by-gender')
    return response.data
  },

  // ============ Document Checklist Management ============

  listDocumentChecklists: async (params?: {
    page?: number
    limit?: number
    stage?: string
    is_required?: boolean
    is_active?: boolean
    search?: string
  }): Promise<AdminDocumentChecklist[]> => {
    const response = await apiClient.get('/admin/documents/checklists', { params })
    return response.data
  },

  getDocumentChecklist: async (id: string): Promise<AdminDocumentChecklist> => {
    const response = await apiClient.get(`/admin/documents/checklists/${id}`)
    return response.data
  },

  createDocumentChecklist: async (data: AdminDocumentChecklistCreateDTO): Promise<AdminDocumentChecklist> => {
    const response = await apiClient.post('/admin/documents/checklists', data)
    return response.data
  },

  updateDocumentChecklist: async (id: string, data: AdminDocumentChecklistUpdateDTO): Promise<AdminDocumentChecklist> => {
    const response = await apiClient.put(`/admin/documents/checklists/${id}`, data)
    return response.data
  },

  deleteDocumentChecklist: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/documents/checklists/${id}`)
  },

  // ============ Medical Guidelines Management ============

  listMedicalGuidelines: async (params?: {
    page?: number
    limit?: number
    category?: string
  }): Promise<AdminMedicalGuideline[]> => {
    const response = await apiClient.get('/admin/documents/medical/guidelines', { params })
    return response.data
  },

  createMedicalGuideline: async (data: AdminMedicalGuidelineCreateDTO): Promise<AdminMedicalGuideline> => {
    const response = await apiClient.post('/admin/documents/medical/guidelines', data)
    return response.data
  },

  updateMedicalGuideline: async (id: string, data: AdminMedicalGuidelineUpdateDTO): Promise<AdminMedicalGuideline> => {
    const response = await apiClient.put(`/admin/documents/medical/guidelines/${id}`, data)
    return response.data
  },

  deleteMedicalGuideline: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/documents/medical/guidelines/${id}`)
  },

  // ============ Document Compliance ============

  getDocumentCompliance: async (): Promise<DocumentComplianceStats> => {
    const response = await apiClient.get('/admin/documents/compliance')
    return response.data
  },

  getDocumentComplianceByGender: async (): Promise<DocumentComplianceByGender[]> => {
    const response = await apiClient.get('/admin/documents/compliance/by-gender')
    return response.data
  },

  // ============ Announcement Management ============

  listAnnouncements: async (params?: {
    page?: number
    limit?: number
    priority?: string
    target?: string
    is_active?: boolean
  }): Promise<AdminAnnouncement[]> => {
    const response = await apiClient.get('/admin/announcements', { params })
    return response.data
  },

  createAnnouncement: async (data: AdminAnnouncementCreateDTO): Promise<AdminAnnouncement> => {
    const response = await apiClient.post('/admin/announcements', data)
    return response.data
  },

  updateAnnouncement: async (id: string, data: AdminAnnouncementUpdateDTO): Promise<AdminAnnouncement> => {
    const response = await apiClient.put(`/admin/announcements/${id}`, data)
    return response.data
  },

  deleteAnnouncement: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/announcements/${id}`)
  },
}

// ============ Physical Training Types ============

export interface ExerciseItem {
  day?: string
  activity: string
  duration?: number
  sets?: number
  reps?: string
  description?: string
}

export interface AdminPhysicalPlan {
  id: string
  title: string
  description?: string
  plan_type: 'running' | 'strength' | 'flexibility' | 'mixed'
  target_gender: 'male' | 'female' | 'all'
  duration_weeks: number
  difficulty_level?: string
  is_premium: boolean
  is_active: boolean
  created_at: string
}

export interface AdminPhysicalPlanDetail extends AdminPhysicalPlan {
  exercises: ExerciseItem[]
  schedule?: Record<string, unknown>
  targets?: Record<string, unknown>
}

export interface AdminPhysicalPlanCreateDTO {
  title: string
  description?: string
  plan_type: 'running' | 'strength' | 'flexibility' | 'mixed'
  target_gender: 'male' | 'female' | 'all'
  duration_weeks?: number
  difficulty_level?: string
  exercises?: ExerciseItem[]
  schedule?: Record<string, unknown>
  targets?: Record<string, unknown>
  is_premium?: boolean
  is_active?: boolean
}

export interface AdminPhysicalPlanUpdateDTO {
  title?: string
  description?: string
  plan_type?: 'running' | 'strength' | 'flexibility' | 'mixed'
  target_gender?: 'male' | 'female' | 'all'
  duration_weeks?: number
  difficulty_level?: string
  exercises?: ExerciseItem[]
  schedule?: Record<string, unknown>
  targets?: Record<string, unknown>
  is_premium?: boolean
  is_active?: boolean
}

export interface PhysicalComplianceStats {
  total_users: number
  pst_ready_count: number
  pet_ready_count: number
  fully_ready_count: number
  pst_ready_percentage: number
  pet_ready_percentage: number
  fully_ready_percentage: number
}

export interface PhysicalComplianceByGender {
  gender: string
  total_users: number
  pst_ready_count: number
  pet_ready_count: number
  fully_ready_count: number
  pst_ready_percentage: number
  pet_ready_percentage: number
  fully_ready_percentage: number
}

// ============ Document Checklist Types ============

export interface AdminDocumentChecklist {
  id: string
  title: string
  description?: string
  stage: 'pst' | 'pet' | 'medical' | 'document_verification'
  document_type?: string
  is_required: boolean
  is_required_for_all: boolean
  is_required_for_gender?: string
  accepted_formats: string
  max_file_size_mb: number
  instructions?: string
  order_index: number
  is_active: boolean
  created_at: string
}

export interface AdminDocumentChecklistCreateDTO {
  title: string
  description?: string
  stage: 'pst' | 'pet' | 'medical' | 'document_verification'
  document_type?: string
  is_required?: boolean
  is_required_for_all?: boolean
  is_required_for_gender?: string
  accepted_formats?: string
  max_file_size_mb?: number
  instructions?: string
  order_index?: number
  is_active?: boolean
}

export interface AdminDocumentChecklistUpdateDTO {
  title?: string
  description?: string
  stage?: 'pst' | 'pet' | 'medical' | 'document_verification'
  document_type?: string
  is_required?: boolean
  is_required_for_all?: boolean
  is_required_for_gender?: string
  accepted_formats?: string
  max_file_size_mb?: number
  instructions?: string
  order_index?: number
  is_active?: boolean
}

// ============ Medical Guideline Types ============

export interface AdminMedicalGuideline {
  id: string
  title: string
  category: 'vision' | 'physical' | 'common_rejections'
  content: string
  order_index: number
  created_at: string
}

export interface AdminMedicalGuidelineCreateDTO {
  title: string
  category: 'vision' | 'physical' | 'common_rejections'
  content: string
  order_index?: number
}

export interface AdminMedicalGuidelineUpdateDTO {
  title?: string
  category?: 'vision' | 'physical' | 'common_rejections'
  content?: string
  order_index?: number
}

// ============ Document Compliance Types ============

export interface DocumentComplianceStats {
  total_users: number
  pst_complete_count: number
  pet_complete_count: number
  medical_complete_count: number
  dv_complete_count: number
  fully_complete_count: number
  pst_complete_percentage: number
  pet_complete_percentage: number
  medical_complete_percentage: number
  dv_complete_percentage: number
  fully_complete_percentage: number
}

export interface DocumentComplianceByGender {
  gender: string
  total_users: number
  pst_complete_count: number
  pet_complete_count: number
  medical_complete_count: number
  dv_complete_count: number
  fully_complete_count: number
  pst_complete_percentage: number
  pet_complete_percentage: number
  medical_complete_percentage: number
  dv_complete_percentage: number
  fully_complete_percentage: number
}

// ============ Announcement Types ============

export interface AdminAnnouncement {
  id: string
  title: string
  content: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  target: 'all' | 'male' | 'female' | 'premium' | 'free'
  admin_id: string
  admin_name?: string
  is_active: boolean
  start_date?: string
  end_date?: string
  created_at: string
}

export interface AdminAnnouncementCreateDTO {
  title: string
  content: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  target?: 'all' | 'male' | 'female' | 'premium' | 'free'
  start_date?: string
  end_date?: string
}

export interface AdminAnnouncementUpdateDTO {
  title?: string
  content?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  target?: 'all' | 'male' | 'female' | 'premium' | 'free'
  start_date?: string
  end_date?: string
  is_active?: boolean
}
