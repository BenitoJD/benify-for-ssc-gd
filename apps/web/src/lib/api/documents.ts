/**
 * API client for document readiness module.
 */
import apiClient from './client'

// ============ Types ============

export type DocumentStage = 'new_application' | 'admit_card_released' | 'dv_scheduled'
export type DocumentStatus = 'pending' | 'uploaded' | 'under_verification' | 'verified' | 'rejected'

export interface DocumentChecklistItem {
  id: string
  title: string
  description: string
  stage: DocumentStage
  document_type: string
  is_required: boolean
  is_required_for_all: boolean
  is_required_for_gender: 'male' | 'female' | null
  accepted_formats: string
  max_file_size_mb: number
  instructions: string
  order_index: number
}

export interface UserDocumentStatus {
  id: string
  checklist_item_id: string
  status: DocumentStatus
  uploaded_file_url: string | null
  original_filename: string | null
  rejection_reason: string | null
  notes: string | null
  deadline: string | null
  updated_at: string
  checklist_item: DocumentChecklistItem
}

export interface DocumentReadinessSummary {
  stage: DocumentStage
  total_required: number
  total_uploaded: number
  total_verified: number
  total_rejected: number
  pending_count: number
  completion_percentage: number
}

export interface MedicalGuideline {
  id: string
  title: string
  category: 'vision' | 'physical' | 'common_rejections'
  content: string
  order_index: number
}

export interface MedicalSelfAssessment {
  id: string
  question: string
  category: string
  disqualifying_conditions: string[]
  order_index: number
}

export interface SelfAssessmentResponse {
  id: string
  question_id: string
  answer: boolean
  notes?: string
}

export interface Reminder {
  id: string
  document_item_id: string
  reminder_date: string
  reminder_type: 'email' | 'in_app' | 'both'
  is_sent: boolean
  created_at: string
}

export interface UploadDocumentRequest {
  checklist_item_id: string
  file: File
}

export interface UploadDocumentResponse {
  id: string
  checklist_item_id: string
  status: DocumentStatus
  uploaded_file_url: string
  original_filename: string
  message: string
}

// ============ API Functions ============

/**
 * Get all document checklists for a user's stage.
 */
export async function getDocumentChecklists(stage?: DocumentStage): Promise<DocumentChecklistItem[]> {
  const params = stage ? { stage } : {}
  const response = await apiClient.get<DocumentChecklistItem[]>('/documents/checklists', { params })
  return response.data
}

/**
 * Get a specific checklist with its items.
 */
export async function getChecklistWithItems(checklistId: string): Promise<DocumentChecklistItem[]> {
  const response = await apiClient.get<DocumentChecklistItem[]>(`/documents/checklists/${checklistId}/items`)
  return response.data
}

/**
 * Get current user's document status for all items.
 */
export async function getMyDocuments(): Promise<{
  documents: UserDocumentStatus[]
  readiness_summary: DocumentReadinessSummary[]
}> {
  const response = await apiClient.get<{
    documents: UserDocumentStatus[]
    readiness_summary: DocumentReadinessSummary[]
  }>('/documents/me')
  return response.data
}

/**
 * Get document readiness percentage.
 */
export async function getDocumentReadiness(): Promise<{
  overall_percentage: number
  stage_percentages: Record<DocumentStage, number>
  pending_items: UserDocumentStatus[]
  upcoming_deadlines: UserDocumentStatus[]
}> {
  const response = await apiClient.get('/documents/readiness')
  return response.data
}

/**
 * Update document status (for admin/reviewer actions).
 */
export async function updateDocumentStatus(
  itemId: string,
  status: DocumentStatus,
  rejectionReason?: string
): Promise<UserDocumentStatus> {
  const response = await apiClient.put<UserDocumentStatus>(`/documents/checklists/${itemId}/status`, {
    status,
    rejection_reason: rejectionReason,
  })
  return response.data
}

/**
 * Upload a document.
 */
export async function uploadDocument(
  checklistItemId: string,
  file: File
): Promise<UploadDocumentResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('checklist_item_id', checklistItemId)

  const response = await apiClient.post<UploadDocumentResponse>(
    '/documents/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )
  return response.data
}

/**
 * Delete/replace an uploaded document.
 */
export async function deleteDocument(documentId: string): Promise<{ success: boolean }> {
  const response = await apiClient.delete<{ success: boolean }>(`/documents/${documentId}`)
  return response.data
}

/**
 * Get medical guidelines.
 */
export async function getMedicalGuidelines(): Promise<MedicalGuideline[]> {
  const response = await apiClient.get<MedicalGuideline[]>('/documents/medical/guidelines')
  return response.data
}

/**
 * Get medical self-assessment questions.
 */
export async function getMedicalSelfAssessment(): Promise<MedicalSelfAssessment[]> {
  throw new Error('Medical self-assessment is not available in the current API.')
}

/**
 * Submit self-assessment responses.
 */
export async function submitSelfAssessment(
  responses: SelfAssessmentResponse[]
): Promise<{
  has_disqualifications: boolean
  disqualification_reasons: string[]
  can_proceed: boolean
}> {
  void responses
  throw new Error('Medical self-assessment is not available in the current API.')
}

/**
 * Set a reminder for a document deadline.
 */
export async function setReminder(
  documentItemId: string,
  reminderDate: string,
  reminderType: 'email' | 'in_app' | 'both' = 'in_app'
): Promise<Reminder> {
  void documentItemId
  void reminderDate
  void reminderType
  throw new Error('Document reminders are not available in the current API.')
}

/**
 * Get user's reminders.
 */
export async function getMyReminders(): Promise<Reminder[]> {
  throw new Error('Document reminders are not available in the current API.')
}

/**
 * Delete a reminder.
 */
export async function deleteReminder(reminderId: string): Promise<{ success: boolean }> {
  void reminderId
  throw new Error('Document reminders are not available in the current API.')
}

// ============ Utility Functions ============

/**
 * Check if a file type is accepted for document upload.
 */
export function isAcceptedFileType(file: File, acceptedFormats: string): boolean {
  const formats = acceptedFormats.split(',').map(f => f.trim().toLowerCase())
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''
  const mimeType = file.type.toLowerCase()
  
  return formats.some(format => {
    if (format.startsWith('.')) {
      return file.name.toLowerCase().endsWith(format)
    }
    return mimeType.includes(format) || fileExtension === format
  })
}

/**
 * Check if a file size is within limits.
 */
export function isAcceptedFileSize(file: File, maxSizeMB: number): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxBytes
}

/**
 * Format file size for display.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Get deadline status (days until deadline).
 */
export function getDeadlineStatus(deadline: string | null): {
  is_overdue: boolean
  days_remaining: number
  is_warning: boolean
} {
  if (!deadline) {
    return { is_overdue: false, days_remaining: Infinity, is_warning: false }
  }
  
  const deadlineDate = new Date(deadline)
  const now = new Date()
  const diffTime = deadlineDate.getTime() - now.getTime()
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return {
    is_overdue: daysRemaining < 0,
    days_remaining: daysRemaining,
    is_warning: daysRemaining >= 0 && daysRemaining <= 7,
  }
}
