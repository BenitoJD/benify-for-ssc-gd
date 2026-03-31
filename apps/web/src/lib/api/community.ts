// Community API client
import apiClient from './client'

export interface Discussion {
  id: string
  user_id: string
  title: string
  content: string
  topic_tag?: string
  upvotes: number
  reply_count: number
  view_count: number
  is_answered: boolean
  is_pinned: boolean
  is_hidden: boolean
  accepted_reply_id?: string
  created_at: string
  updated_at: string
  user_name?: string
  user_avatar?: string
  has_upvoted: boolean
}

export interface Reply {
  id: string
  discussion_id: string
  user_id: string
  content: string
  upvotes: number
  is_accepted_answer: boolean
  created_at: string
  updated_at: string
  user_name?: string
  user_avatar?: string
  has_upvoted: boolean
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
}

export interface DiscussionListResponse {
  data: Discussion[]
  meta: PaginationMeta
}

export interface CreateDiscussionRequest {
  title: string
  content: string
  topic_tag?: string
}

export interface CreateReplyRequest {
  content: string
}

export interface AcceptAnswerRequest {
  reply_id: string
}

export interface UpvoteToggleResponse {
  success: boolean
  upvoted: boolean
  upvotes: number
}

export interface AcceptAnswerResponse {
  success: boolean
  accepted_reply_id: string
  discussion_id: string
  message: string
}

export interface PinDiscussionResponse {
  success: boolean
  is_pinned: boolean
  discussion_id: string
}

export interface HideDiscussionResponse {
  success: boolean
  discussion_id: string
  message: string
}

export interface DeleteDiscussionResponse {
  success: boolean
  discussion_id: string
  message: string
}

export interface ReportRequest {
  content_type: 'discussion' | 'reply'
  content_id: string
  reason: 'spam' | 'inappropriate' | 'harassment' | 'misinformation' | 'other'
  description?: string
}

export interface Report {
  id: string
  reporter_id: string
  content_type: string
  discussion_id?: string
  reply_id?: string
  reason: string
  description?: string
  status: string
  reviewed_by?: string
  reviewed_at?: string
  action_taken?: string
  created_at: string
}

// Get paginated list of discussions
export async function getDiscussions(params: {
  page?: number
  limit?: number
  topic_tag?: string
  is_answered?: boolean
  search?: string
  sort_by?: 'created_at' | 'upvotes' | 'reply_count'
  sort_order?: 'asc' | 'desc'
}): Promise<DiscussionListResponse> {
  const response = await apiClient.get<DiscussionListResponse>('/discussions', { params })
  return response.data
}

// Get a single discussion
export async function getDiscussion(discussionId: string): Promise<Discussion> {
  const response = await apiClient.get<Discussion>(`/discussions/${discussionId}`)
  return response.data
}

// Create a new discussion
export async function createDiscussion(data: CreateDiscussionRequest): Promise<Discussion> {
  const response = await apiClient.post<Discussion>('/discussions', data)
  return response.data
}

// Update a discussion (author only)
export async function updateDiscussion(
  discussionId: string,
  data: Partial<CreateDiscussionRequest>
): Promise<Discussion> {
  const response = await apiClient.patch<Discussion>(`/discussions/${discussionId}`, data)
  return response.data
}

// Delete a discussion
export async function deleteDiscussion(discussionId: string): Promise<DeleteDiscussionResponse> {
  const response = await apiClient.delete<DeleteDiscussionResponse>(`/discussions/${discussionId}`)
  return response.data
}

// Get replies for a discussion
export async function getReplies(discussionId: string): Promise<Reply[]> {
  const response = await apiClient.get<Reply[]>(`/discussions/${discussionId}/replies`)
  return response.data
}

// Create a reply
export async function createReply(
  discussionId: string,
  data: CreateReplyRequest
): Promise<Reply> {
  const response = await apiClient.post<Reply>(`/discussions/${discussionId}/replies`, data)
  return response.data
}

// Toggle upvote on a discussion
export async function toggleDiscussionUpvote(discussionId: string): Promise<UpvoteToggleResponse> {
  const response = await apiClient.post<UpvoteToggleResponse>(`/discussions/${discussionId}/upvote`)
  return response.data
}

// Toggle upvote on a reply
export async function toggleReplyUpvote(replyId: string): Promise<UpvoteToggleResponse> {
  const response = await apiClient.post<UpvoteToggleResponse>(`/discussions/replies/${replyId}/upvote`)
  return response.data
}

// Accept an answer (discussion author only)
export async function acceptAnswer(
  discussionId: string,
  data: AcceptAnswerRequest
): Promise<AcceptAnswerResponse> {
  const response = await apiClient.patch<AcceptAnswerResponse>(
    `/discussions/${discussionId}/accepted-answer`,
    data
  )
  return response.data
}

// Pin/unpin a discussion (moderator only)
export async function pinDiscussion(
  discussionId: string,
  isPinned: boolean = true
): Promise<PinDiscussionResponse> {
  const response = await apiClient.patch<PinDiscussionResponse>(
    `/discussions/${discussionId}/pin`,
    null,
    { params: { is_pinned: isPinned } }
  )
  return response.data
}

// Hide a discussion (moderator only)
export async function hideDiscussion(discussionId: string): Promise<HideDiscussionResponse> {
  const response = await apiClient.patch<HideDiscussionResponse>(`/discussions/${discussionId}/hide`)
  return response.data
}

// Report content
export async function reportContent(data: ReportRequest): Promise<Report> {
  const response = await apiClient.post<Report>('/discussions/reports', data)
  return response.data
}

// Get topic tags for filtering
export const TOPIC_TAGS = [
  'General Intelligence',
  'Reasoning',
  'Mathematics',
  'General Knowledge',
  'English',
  'Current Affairs',
  'Physical',
  'Interview',
  'Other'
]
