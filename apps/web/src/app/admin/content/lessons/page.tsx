'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import DOMPurify from 'dompurify'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Video,
  Lock,
  Unlock,
  Upload,
  Clock,
  FileText
} from 'lucide-react'
import { adminApi, AdminLesson, AdminTopic, LessonCreateDTO } from '@/lib/api/admin'

type ModalMode = 'create' | 'edit' | 'view' | null

export default function AdminLessonsPage() {
  const searchParams = useSearchParams()
  const [lessons, setLessons] = useState<AdminLesson[]>([])
  const [topics, setTopics] = useState<AdminTopic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [topicFilter, setTopicFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || '')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  
  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedLesson, setSelectedLesson] = useState<AdminLesson | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState<LessonCreateDTO & { title: string; topic_id: string }>({
    topic_id: '',
    title: '',
    content: '',
    video_url: '',
    estimated_minutes: undefined,
    is_premium: false,
    order_index: 0,
    status: 'draft',
  })
  const sanitizedLessonContent = selectedLesson?.content ? DOMPurify.sanitize(selectedLesson.content) : null

  const fetchLessons = useCallback(async (
    searchTerm: string, 
    topicId: string, 
    status: string, 
    pageNum: number
  ) => {
    setIsLoading(true)
    setError('')
    try {
      const response = await adminApi.listLessons({
        page: pageNum,
        limit: 20,
        search: searchTerm || undefined,
        topic_id: topicId || undefined,
        status: status || undefined,
      })
      setLessons(response.data)
      setTotalPages(response.meta.pages)
      setTotal(response.meta.total)
      setPage(pageNum)
    } catch (err) {
      setError('Failed to load lessons')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchTopics = useCallback(async () => {
    try {
      const response = await adminApi.listTopics({ limit: 100 })
      setTopics(response.data)
    } catch (err) {
      console.error('Failed to load topics:', err)
    }
  }, [])

  useEffect(() => {
    fetchTopics()
  }, [fetchTopics])

  useEffect(() => {
    fetchLessons(search, topicFilter, statusFilter, page)
  }, [fetchLessons, search, topicFilter, statusFilter, page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchLessons(search, topicFilter, statusFilter, 1)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  const openCreateModal = () => {
    setFormData({
      topic_id: topicFilter || (topics[0]?.id || ''),
      title: '',
      content: '',
      video_url: '',
      estimated_minutes: undefined,
      is_premium: false,
      order_index: lessons.length,
      status: 'draft',
    })
    setSelectedLesson(null)
    setModalMode('create')
  }

  const openEditModal = (lesson: AdminLesson) => {
    setFormData({
      topic_id: lesson.topic_id,
      title: lesson.title,
      content: lesson.content || '',
      video_url: lesson.video_url || '',
      estimated_minutes: lesson.estimated_minutes,
      is_premium: lesson.is_premium,
      order_index: lesson.order_index,
      status: lesson.status,
    })
    setSelectedLesson(lesson)
    setModalMode('edit')
  }

  const openViewModal = (lesson: AdminLesson) => {
    setSelectedLesson(lesson)
    setModalMode('view')
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedLesson(null)
    setIsSubmitting(false)
    setIsUploading(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'content' | 'video') => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsUploading(true)
    try {
      const result = await adminApi.uploadFile(file, type === 'video' ? 'videos' : 'images')
      if (type === 'video') {
        setFormData({ ...formData, video_url: result.url })
      } else {
        // For images, append to content as markdown
        const imageMarkdown = `\n![${file.name}](${result.url})\n`
        setFormData({ ...formData, content: (formData.content || '') + imageMarkdown })
      }
    } catch (err) {
      console.error('Upload failed:', err)
      alert('Failed to upload file. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const { title, topic_id, content, video_url, estimated_minutes, is_premium, order_index, status } = formData
      const payload = { topic_id, title, content, video_url, estimated_minutes, is_premium, order_index, status }
      
      if (modalMode === 'create') {
        await adminApi.createLesson(payload)
      } else if (modalMode === 'edit' && selectedLesson) {
        await adminApi.updateLesson(selectedLesson.id, payload)
      }
      closeModal()
      fetchLessons(search, topicFilter, statusFilter, page)
    } catch (err) {
      console.error('Failed to save lesson:', err)
      alert('Failed to save lesson. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (lesson: AdminLesson) => {
    if (!confirm(`Are you sure you want to delete "${lesson.title}"?`)) {
      return
    }
    
    try {
      await adminApi.deleteLesson(lesson.id)
      fetchLessons(search, topicFilter, statusFilter, page)
    } catch (err) {
      console.error('Failed to delete lesson:', err)
      alert('Failed to delete lesson. Please try again.')
    }
  }

  const handleStatusChange = async (lesson: AdminLesson, newStatus: 'draft' | 'review' | 'published') => {
    try {
      await adminApi.updateLesson(lesson.id, { status: newStatus })
      fetchLessons(search, topicFilter, statusFilter, page)
    } catch (err) {
      console.error('Failed to update status:', err)
      alert('Failed to update status. Please try again.')
    }
  }

  const getTopicName = (topicId: string) => {
    return topics.find(t => t.id === topicId)?.name || 'Unknown'
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700'
      case 'review':
        return 'bg-yellow-100 text-yellow-700'
      case 'draft':
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--text-main)] mb-2">Lessons</h1>
          <p className="font-bold text-[var(--text-muted)] text-sm uppercase tracking-widest">Create lessons with rich text content, video URLs, and order</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--text-main)] text-white font-bold rounded-2xl hover:-translate-y-0.5 active:translate-y-1 shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Lesson
        </button>
      </div>

      {/* Filters */}
      <div className="card-brilliant p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lessons..."
              className="w-full pl-12 pr-4 py-3 border-2 border-[var(--border-light)] rounded-2xl focus:ring-4 focus:ring-[var(--brilliant-blue)] focus:ring-opacity-20 focus:border-[var(--brilliant-blue)] outline-none transition-all font-semibold text-[var(--text-main)]"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-50 border-2 border-[var(--border-light)] rounded-xl">
              <Filter className="w-5 h-5 text-[var(--text-muted)]" />
            </div>
            <select
              value={topicFilter}
              onChange={(e) => {
                setTopicFilter(e.target.value)
                setPage(1)
              }}
              className="px-4 py-3 border-2 border-[var(--border-light)] rounded-2xl focus:ring-4 focus:ring-[var(--brilliant-blue)] focus:ring-opacity-20 focus:border-[var(--brilliant-blue)] outline-none transition-all font-bold text-[var(--text-main)] bg-white cursor-pointer min-w-[150px]"
            >
              <option value="">All Topics</option>
              {topics.map(topic => (
                <option key={topic.id} value={topic.id}>{topic.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="px-4 py-3 border-2 border-[var(--border-light)] rounded-2xl focus:ring-4 focus:ring-[var(--brilliant-blue)] focus:ring-opacity-20 focus:border-[var(--brilliant-blue)] outline-none transition-all font-bold text-[var(--text-main)] bg-white cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="published">Published</option>
            </select>
          </div>
          
          <button
            type="submit"
            className="px-6 py-3 bg-[var(--text-main)] text-white font-bold rounded-2xl transition-all shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
          >
            Search
          </button>
        </form>
      </div>

      {/* Lessons Table */}
      <div className="card-brilliant overflow-hidden p-0">
        {isLoading ? (
          <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-black" />
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl text-sm font-bold">
              {error}
            </div>
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-16 text-[var(--text-muted)] font-bold text-sm bg-gray-50/50 flex flex-col items-center">
            <p>No lessons found</p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-6 py-3 bg-[var(--text-main)] text-white font-bold rounded-2xl hover:-translate-y-0.5 active:translate-y-1 shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none transition-all"
            >
              Create your first lesson
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest bg-gray-50 border-b-2 border-[var(--border-light)]">
                  <th className="px-6 py-4">Lesson</th>
                  <th className="px-6 py-4">Topic</th>
                  <th className="px-6 py-4 text-center">Duration</th>
                  <th className="px-6 py-4 text-center">Premium</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[var(--border-light)]">
                {lessons.map((lesson) => (
                  <tr key={lesson.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        {lesson.video_url ? (
                          <div className="w-12 h-12 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center justify-center shadow-sm">
                            <Video className="w-6 h-6 text-red-500" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-blue-50 border-2 border-blue-200 rounded-2xl flex items-center justify-center shadow-sm">
                            <FileText className="w-6 h-6 text-blue-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-[var(--text-main)] text-[15px]">{lesson.title}</p>
                          <p className="text-sm font-semibold text-[var(--text-muted)] truncate max-w-xs">
                            {lesson.content ? 'Has content' : 'No content'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-bold text-[var(--text-main)] text-[13px]">{getTopicName(lesson.topic_id)}</td>
                    <td className="px-6 py-5 text-center">
                      {lesson.estimated_minutes ? (
                        <span className="inline-flex items-center justify-center gap-1.5 text-blue-700 bg-blue-100 border-2 border-blue-200 px-3 py-1 rounded-lg font-bold text-sm mx-auto">
                          <Clock className="w-4 h-4" />
                          {lesson.estimated_minutes} min
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)] font-bold">-</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-center">
                      {lesson.is_premium ? (
                        <span title="Premium" className="inline-block p-2 bg-amber-50 rounded-lg border-2 border-amber-200"><Lock className="w-5 h-5 text-amber-500" /></span>
                      ) : (
                        <span title="Free" className="inline-block p-2 bg-gray-50 rounded-lg border-2 border-[var(--border-light)]"><Unlock className="w-5 h-5 text-[var(--text-muted)]" /></span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <select
                        value={lesson.status}
                        onChange={(e) => handleStatusChange(lesson, e.target.value as 'draft' | 'review' | 'published')}
                        className={`pl-3 pr-8 py-1.5 text-[10px] uppercase font-bold tracking-widest rounded-lg border-2 cursor-pointer transition-colors ${
                          lesson.status === 'published' ? 'bg-green-100 text-green-700 border-green-200' :
                          lesson.status === 'review' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                          'bg-gray-50 text-[var(--text-muted)] border-[var(--border-light)]'
                        }`}
                      >
                        <option value="draft">DRAFT</option>
                        <option value="review">REVIEW</option>
                        <option value="published">PUBLISHED</option>
                      </select>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openViewModal(lesson)}
                          className="p-2 border-2 border-transparent text-gray-400 hover:text-[var(--text-main)] hover:bg-gray-100 hover:border-[var(--border-light)] rounded-xl transition-all"
                          title="View"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openEditModal(lesson)}
                          className="p-2 border-2 border-transparent text-gray-400 hover:text-[var(--brilliant-blue)] hover:bg-blue-50 hover:border-blue-200 rounded-xl transition-all"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(lesson)}
                          className="p-2 border-2 border-transparent text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-[var(--text-muted)]">
            Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} lessons
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="p-3 bg-white border-2 border-[var(--border-light)] rounded-xl hover:-translate-y-0.5 active:translate-y-1 shadow-[0_4px_0_var(--border-light)] active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none text-[var(--text-main)]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 text-[15px] font-bold text-[var(--text-muted)]">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="p-3 bg-white border-2 border-[var(--border-light)] rounded-xl hover:-translate-y-0.5 active:translate-y-1 shadow-[0_4px_0_var(--border-light)] active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none text-[var(--text-main)]"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card-brilliant max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === 'create' && 'Create New Lesson'}
                {modalMode === 'edit' && 'Edit Lesson'}
                {modalMode === 'view' && 'Lesson Details'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalMode === 'view' && selectedLesson ? (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedLesson.title}</h3>
                  <p className="text-sm text-gray-500">{getTopicName(selectedLesson.topic_id)}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Video URL</p>
                    {selectedLesson.video_url ? (
                      <a href={selectedLesson.video_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                        {selectedLesson.video_url}
                      </a>
                    ) : (
                      <p className="text-gray-400">No video</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Duration</p>
                    <p className="text-gray-900">
                      {selectedLesson.estimated_minutes ? `${selectedLesson.estimated_minutes} minutes` : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Premium</p>
                    <p className="text-gray-900">{selectedLesson.is_premium ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(selectedLesson.status)}`}>
                      {selectedLesson.status}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Content</p>
                  <div className="bg-gray-50 rounded-lg p-4 prose prose-sm max-w-none">
                    {sanitizedLessonContent ? (
                      <div dangerouslySetInnerHTML={{ __html: sanitizedLessonContent }} />
                    ) : (
                      <p className="text-gray-400">No content</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => openEditModal(selectedLesson)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    Edit Lesson
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Topic *
                    </label>
                    <select
                      value={formData.topic_id}
                      onChange={(e) => setFormData({ ...formData, topic_id: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    >
                      <option value="">Select a topic</option>
                      {topics.map(topic => (
                        <option key={topic.id} value={topic.id}>{topic.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lesson Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="e.g., Introduction to Number System"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content (Rich Text / HTML)
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition text-sm">
                        <Upload className="w-4 h-4" />
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'content')}
                          disabled={isUploading}
                          className="hidden"
                        />
                      </label>
                      <span className="text-xs text-gray-500">Images will be inserted into content</span>
                    </div>
                  </div>
                  <textarea
                    value={formData.content || ''}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={12}
                    className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none font-mono text-sm"
                    placeholder="<h2>Lesson Title</h2>&#10;<p>Lesson content here...</p>&#10;<img src='https://...' />"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Video URL
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={formData.video_url || ''}
                        onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        placeholder="https://youtube.com/watch?v=..."
                      />
                      <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition">
                        {isUploading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
                        ) : (
                          <Video className="w-4 h-4" />
                        )}
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => handleFileUpload(e, 'video')}
                          disabled={isUploading}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">YouTube, Vimeo, or direct video URL</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Minutes
                    </label>
                    <input
                      type="number"
                      value={formData.estimated_minutes || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        estimated_minutes: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      min={1}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="e.g., 30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Premium
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_premium}
                        onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-600">Only for premium users</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order Index
                    </label>
                    <input
                      type="number"
                      value={formData.order_index}
                      onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                      min={0}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'review' | 'published' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    >
                      <option value="draft">Draft</option>
                      <option value="review">Review</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : modalMode === 'create' ? 'Create Lesson' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
