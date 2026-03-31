'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
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
  Clock,
  BookOpen
} from 'lucide-react'
import { adminApi, AdminTopic, AdminSubject, TopicCreateDTO } from '@/lib/api/admin'

type ModalMode = 'create' | 'edit' | 'view' | null

export default function AdminTopicsPage() {
  const searchParams = useSearchParams()
  const [topics, setTopics] = useState<AdminTopic[]>([])
  const [subjects, setSubjects] = useState<AdminSubject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || '')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  
  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedTopic, setSelectedTopic] = useState<AdminTopic | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState<TopicCreateDTO & { name: string; subject_id: string }>({
    subject_id: '',
    name: '',
    description: '',
    estimated_hours: undefined,
    order_index: 0,
    status: 'draft',
  })

  const fetchTopics = useCallback(async (
    searchTerm: string, 
    subjectId: string, 
    status: string, 
    pageNum: number
  ) => {
    setIsLoading(true)
    setError('')
    try {
      const response = await adminApi.listTopics({
        page: pageNum,
        limit: 20,
        search: searchTerm || undefined,
        subject_id: subjectId || undefined,
        status: status || undefined,
      })
      setTopics(response.data)
      setTotalPages(response.meta.pages)
      setTotal(response.meta.total)
      setPage(pageNum)
    } catch (err) {
      setError('Failed to load topics')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchSubjects = useCallback(async () => {
    try {
      const response = await adminApi.listSubjects({ limit: 100 })
      setSubjects(response.data)
    } catch (err) {
      console.error('Failed to load subjects:', err)
    }
  }, [])

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  useEffect(() => {
    fetchTopics(search, subjectFilter, statusFilter, page)
  }, [fetchTopics, search, subjectFilter, statusFilter, page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchTopics(search, subjectFilter, statusFilter, 1)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  const openCreateModal = () => {
    setFormData({
      subject_id: subjectFilter || (subjects[0]?.id || ''),
      name: '',
      description: '',
      estimated_hours: undefined,
      order_index: topics.length,
      status: 'draft',
    })
    setSelectedTopic(null)
    setModalMode('create')
  }

  const openEditModal = (topic: AdminTopic) => {
    setFormData({
      subject_id: topic.subject_id,
      name: topic.name,
      description: topic.description || '',
      estimated_hours: topic.estimated_hours,
      order_index: topic.order_index,
      status: topic.status,
    })
    setSelectedTopic(topic)
    setModalMode('edit')
  }

  const openViewModal = (topic: AdminTopic) => {
    setSelectedTopic(topic)
    setModalMode('view')
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedTopic(null)
    setIsSubmitting(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const { name, subject_id, description, estimated_hours, order_index, status } = formData
      const payload = { subject_id, name, description, estimated_hours, order_index, status }
      
      if (modalMode === 'create') {
        await adminApi.createTopic(payload)
      } else if (modalMode === 'edit' && selectedTopic) {
        await adminApi.updateTopic(selectedTopic.id, payload)
      }
      closeModal()
      fetchTopics(search, subjectFilter, statusFilter, page)
    } catch (err) {
      console.error('Failed to save topic:', err)
      alert('Failed to save topic. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (topic: AdminTopic) => {
    if (!confirm(`Are you sure you want to delete "${topic.name}"? This will also delete all lessons under this topic.`)) {
      return
    }
    
    try {
      await adminApi.deleteTopic(topic.id)
      fetchTopics(search, subjectFilter, statusFilter, page)
    } catch (err) {
      console.error('Failed to delete topic:', err)
      alert('Failed to delete topic. Please try again.')
    }
  }

  const handleStatusChange = async (topic: AdminTopic, newStatus: 'draft' | 'review' | 'published') => {
    try {
      await adminApi.updateTopic(topic.id, { status: newStatus })
      fetchTopics(search, subjectFilter, statusFilter, page)
    } catch (err) {
      console.error('Failed to update status:', err)
      alert('Failed to update status. Please try again.')
    }
  }

  const getSubjectName = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.name || 'Unknown'
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
          <h1 className="text-2xl font-bold text-gray-900">Topics</h1>
          <p className="text-gray-600">Create and manage topics with subject association</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <Plus className="w-5 h-5" />
          Add Topic
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search topics..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gray-400" />
            <select
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="published">Published</option>
            </select>
          </div>
          
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Topics Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : error ? (
          <div className="p-4">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No topics found</p>
            <button
              onClick={openCreateModal}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              Create your first topic
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 bg-gray-50 border-b">
                  <th className="px-6 py-3 font-medium">Topic</th>
                  <th className="px-6 py-3 font-medium">Subject</th>
                  <th className="px-6 py-3 font-medium">Lessons</th>
                  <th className="px-6 py-3 font-medium">Est. Hours</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Order</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topics.map((topic) => (
                  <tr key={topic.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{topic.name}</p>
                        {topic.description && (
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {topic.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{getSubjectName(topic.subject_id)}</td>
                    <td className="px-6 py-4 text-gray-600">{topic.lesson_count}</td>
                    <td className="px-6 py-4">
                      {topic.estimated_hours ? (
                        <span className="flex items-center gap-1 text-gray-600">
                          <Clock className="w-4 h-4" />
                          {topic.estimated_hours}h
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={topic.status}
                        onChange={(e) => handleStatusChange(topic, e.target.value as 'draft' | 'review' | 'published')}
                        className={`px-2 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${getStatusBadgeClass(topic.status)}`}
                      >
                        <option value="draft">Draft</option>
                        <option value="review">Review</option>
                        <option value="published">Published</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{topic.order_index}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openViewModal(topic)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(topic)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(topic)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
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
          <p className="text-sm text-gray-500">
            Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} topics
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === 'create' && 'Create New Topic'}
                {modalMode === 'edit' && 'Edit Topic'}
                {modalMode === 'view' && 'Topic Details'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalMode === 'view' && selectedTopic ? (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedTopic.name}</h3>
                  <p className="text-sm text-gray-500">{getSubjectName(selectedTopic.subject_id)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
                  <p className="text-gray-900">{selectedTopic.description || 'No description'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Estimated Hours</p>
                    <p className="text-gray-900">
                      {selectedTopic.estimated_hours ? `${selectedTopic.estimated_hours} hours` : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Lesson Count</p>
                    <p className="text-gray-900">{selectedTopic.lesson_count}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(selectedTopic.status)}`}>
                      {selectedTopic.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Order Index</p>
                    <p className="text-gray-900">{selectedTopic.order_index}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Created</p>
                    <p className="text-gray-900">{new Date(selectedTopic.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => openEditModal(selectedTopic)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    Edit Topic
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <select
                    value={formData.subject_id}
                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    <option value="">Select a subject</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="e.g., Number Series"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Brief description of the topic..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      value={formData.estimated_hours || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        estimated_hours: e.target.value ? parseFloat(e.target.value) : undefined 
                      })}
                      min={0}
                      step={0.5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="e.g., 5"
                    />
                    <p className="text-xs text-gray-500 mt-1">Expected time to complete this topic</p>
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
                    <p className="text-xs text-gray-500 mt-1">Display order within subject</p>
                  </div>
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
                    {isSubmitting ? 'Saving...' : modalMode === 'create' ? 'Create Topic' : 'Save Changes'}
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
