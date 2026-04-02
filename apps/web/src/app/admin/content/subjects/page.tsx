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
  Image as ImageIcon
} from 'lucide-react'
import { adminApi, AdminSubject, SubjectCreateDTO } from '@/lib/api/admin'

type ModalMode = 'create' | 'edit' | 'view' | null

export default function AdminSubjectsPage() {
  const searchParams = useSearchParams()
  const [subjects, setSubjects] = useState<AdminSubject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || '')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  
  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedSubject, setSelectedSubject] = useState<AdminSubject | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState<SubjectCreateDTO>({
    name: '',
    code: '',
    description: '',
    icon_url: '',
    order_index: 0,
    status: 'draft',
  })

  const fetchSubjects = useCallback(async (searchTerm: string, status: string, pageNum: number) => {
    setIsLoading(true)
    setError('')
    try {
      const response = await adminApi.listSubjects({
        page: pageNum,
        limit: 20,
        search: searchTerm || undefined,
        status: status || undefined,
      })
      setSubjects(response.data)
      setTotalPages(response.meta.pages)
      setTotal(response.meta.total)
      setPage(pageNum)
    } catch (err) {
      setError('Failed to load subjects')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubjects(search, statusFilter, page)
  }, [fetchSubjects, search, statusFilter, page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchSubjects(search, statusFilter, 1)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  const openCreateModal = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      icon_url: '',
      order_index: subjects.length,
      status: 'draft',
    })
    setSelectedSubject(null)
    setModalMode('create')
  }

  const openEditModal = (subject: AdminSubject) => {
    setFormData({
      name: subject.name,
      code: subject.code,
      description: subject.description || '',
      icon_url: subject.icon_url || '',
      order_index: subject.order_index,
      status: subject.status,
    })
    setSelectedSubject(subject)
    setModalMode('edit')
  }

  const openViewModal = (subject: AdminSubject) => {
    setSelectedSubject(subject)
    setModalMode('view')
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedSubject(null)
    setIsSubmitting(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      if (modalMode === 'create') {
        await adminApi.createSubject(formData)
      } else if (modalMode === 'edit' && selectedSubject) {
        await adminApi.updateSubject(selectedSubject.id, formData)
      }
      closeModal()
      fetchSubjects(search, statusFilter, page)
    } catch (err) {
      console.error('Failed to save subject:', err)
      alert('Failed to save subject. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (subject: AdminSubject) => {
    if (!confirm(`Are you sure you want to delete "${subject.name}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      await adminApi.deleteSubject(subject.id)
      fetchSubjects(search, statusFilter, page)
    } catch (err) {
      console.error('Failed to delete subject:', err)
      alert('Failed to delete subject. Please try again.')
    }
  }

  const handleStatusChange = async (subject: AdminSubject, newStatus: 'draft' | 'review' | 'published') => {
    try {
      await adminApi.updateSubject(subject.id, { status: newStatus })
      fetchSubjects(search, statusFilter, page)
    } catch (err) {
      console.error('Failed to update status:', err)
      alert('Failed to update status. Please try again.')
    }
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
          <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--text-main)] mb-2">Subjects</h1>
          <p className="font-bold text-[var(--text-muted)] text-sm uppercase tracking-widest">Manage SSC GD subjects with name, code, description, and icon</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--text-main)] text-white font-bold rounded-2xl hover:-translate-y-0.5 active:translate-y-1 shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Subject
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
              placeholder="Search subjects..."
              className="w-full pl-12 pr-4 py-3 border-2 border-[var(--border-light)] rounded-2xl focus:ring-4 focus:ring-[var(--brilliant-blue)] focus:ring-opacity-20 focus:border-[var(--brilliant-blue)] outline-none transition-all font-semibold text-[var(--text-main)]"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-50 border-2 border-[var(--border-light)] rounded-xl">
              <Filter className="w-5 h-5 text-[var(--text-muted)]" />
            </div>
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

      {/* Subjects Table */}
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
        ) : subjects.length === 0 ? (
          <div className="text-center py-16 text-[var(--text-muted)] font-bold text-sm bg-gray-50/50 flex flex-col items-center">
            <p>No subjects found</p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-6 py-3 bg-[var(--text-main)] text-white font-bold rounded-2xl hover:-translate-y-0.5 active:translate-y-1 shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none transition-all"
            >
              Create your first subject
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest bg-gray-50 border-b-2 border-[var(--border-light)]">
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4 text-center">Topics</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Order</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[var(--border-light)]">
                {subjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        {subject.icon_url ? (
                          <img
                            src={subject.icon_url}
                            alt=""
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-[var(--border-light)] shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 border-2 border-[var(--border-light)] rounded-2xl flex items-center justify-center shadow-sm">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-[var(--text-main)] text-[15px]">{subject.name}</p>
                          {subject.description && (
                            <p className="text-sm font-semibold text-[var(--text-muted)] truncate max-w-xs">
                              {subject.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <code className="text-[11px] font-bold text-[var(--text-main)] uppercase tracking-widest bg-gray-100 border-2 border-[var(--border-light)] px-3 py-1 rounded-lg">{subject.code}</code>
                    </td>
                    <td className="px-6 py-5 text-center font-extrabold text-[var(--text-main)] text-xl">
                      {subject.topic_count}
                    </td>
                    <td className="px-6 py-5">
                      <select
                        value={subject.status}
                        onChange={(e) => handleStatusChange(subject, e.target.value as 'draft' | 'review' | 'published')}
                        className={`pl-3 pr-8 py-1.5 text-[10px] uppercase font-bold tracking-widest rounded-lg border-2 cursor-pointer transition-colors ${
                          subject.status === 'published' ? 'bg-green-100 text-green-700 border-green-200' :
                          subject.status === 'review' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                          'bg-gray-50 text-[var(--text-muted)] border-[var(--border-light)]'
                        }`}
                      >
                        <option value="draft">DRAFT</option>
                        <option value="review">REVIEW</option>
                        <option value="published">PUBLISHED</option>
                      </select>
                    </td>
                    <td className="px-6 py-5 text-center font-bold text-[var(--text-muted)] text-[15px]">{subject.order_index}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openViewModal(subject)}
                          className="p-2 border-2 border-transparent text-gray-400 hover:text-[var(--text-main)] hover:bg-gray-100 hover:border-[var(--border-light)] rounded-xl transition-all"
                          title="View"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openEditModal(subject)}
                          className="p-2 border-2 border-transparent text-gray-400 hover:text-[var(--brilliant-blue)] hover:bg-blue-50 hover:border-blue-200 rounded-xl transition-all"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(subject)}
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
            Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} subjects
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
          <div className="card-brilliant max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === 'create' && 'Create New Subject'}
                {modalMode === 'edit' && 'Edit Subject'}
                {modalMode === 'view' && 'Subject Details'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalMode === 'view' && selectedSubject ? (
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  {selectedSubject.icon_url ? (
                    <img
                      src={selectedSubject.icon_url}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedSubject.name}</h3>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{selectedSubject.code}</code>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
                  <p className="text-gray-900">{selectedSubject.description || 'No description'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(selectedSubject.status)}`}>
                      {selectedSubject.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Order Index</p>
                    <p className="text-gray-900">{selectedSubject.order_index}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Topic Count</p>
                    <p className="text-gray-900">{selectedSubject.topic_count}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Created</p>
                    <p className="text-gray-900">{selectedSubject.created_at ? new Date(selectedSubject.created_at).toLocaleDateString() : 'Not provided by API'}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => openEditModal(selectedSubject)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    Edit Subject
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="e.g., General Intelligence & Reasoning"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="e.g., GIR"
                  />
                  <p className="text-xs text-gray-500 mt-1">Unique identifier for the subject (e.g., GIR, GKA, EM, EH)</p>
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
                    placeholder="Brief description of the subject..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon URL
                  </label>
                  <input
                    type="url"
                    value={formData.icon_url || ''}
                    onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="https://example.com/icon.png"
                  />
                  <p className="text-xs text-gray-500 mt-1">URL to the subject icon image</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                    <p className="text-xs text-gray-500 mt-1">Display order on syllabus page</p>
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
                    {isSubmitting ? 'Saving...' : modalMode === 'create' ? 'Create Subject' : 'Save Changes'}
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
