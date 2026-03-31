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
  HelpCircle,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { adminApi, AdminTestSeries, AdminSubject, TestSeriesCreateDTO } from '@/lib/api/admin'

type ModalMode = 'create' | 'edit' | 'view' | null

const TEST_TYPES = {
  full_length: { label: 'Full Length', color: 'bg-purple-100 text-purple-700' },
  sectional: { label: 'Sectional', color: 'bg-blue-100 text-blue-700' },
  chapter: { label: 'Chapter', color: 'bg-green-100 text-green-700' },
  quiz: { label: 'Quiz', color: 'bg-orange-100 text-orange-700' },
}

export default function AdminTestSeriesPage() {
  const searchParams = useSearchParams()
  const [testSeries, setTestSeries] = useState<AdminTestSeries[]>([])
  const [subjects, setSubjects] = useState<AdminSubject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || '')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  
  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedTest, setSelectedTest] = useState<AdminTestSeries | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState<TestSeriesCreateDTO & { title: string }>({
    title: '',
    description: '',
    test_type: 'full_length',
    duration_minutes: 90,
    total_questions: 100,
    marks_per_question: 1,
    negative_marking: true,
    negative_marks_per_question: 0.25,
    is_premium: false,
    is_active: true,
    subject_ids: [],
    topic_ids: [],
    instructions: '',
    passing_percentage: 35,
    status: 'draft',
  })

  const fetchTestSeries = useCallback(async (
    searchTerm: string, 
    testType: string,
    status: string, 
    pageNum: number
  ) => {
    setIsLoading(true)
    setError('')
    try {
      const response = await adminApi.listTestSeries({
        page: pageNum,
        limit: 20,
        search: searchTerm || undefined,
        test_type: testType || undefined,
        status: status || undefined,
      })
      setTestSeries(response.data)
      setTotalPages(response.meta.pages)
      setTotal(response.meta.total)
      setPage(pageNum)
    } catch (err) {
      setError('Failed to load test series')
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
    fetchTestSeries(search, typeFilter, statusFilter, page)
  }, [fetchTestSeries, search, typeFilter, statusFilter, page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchTestSeries(search, typeFilter, statusFilter, 1)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  const openCreateModal = () => {
    setFormData({
      title: '',
      description: '',
      test_type: 'full_length',
      duration_minutes: 90,
      total_questions: 100,
      marks_per_question: 1,
      negative_marking: true,
      negative_marks_per_question: 0.25,
      is_premium: false,
      is_active: true,
      subject_ids: [],
      topic_ids: [],
      instructions: '',
      passing_percentage: 35,
      status: 'draft',
    })
    setSelectedTest(null)
    setModalMode('create')
  }

  const openEditModal = (test: AdminTestSeries) => {
    setFormData({
      title: test.title,
      description: test.description || '',
      test_type: test.test_type,
      duration_minutes: test.duration_minutes,
      total_questions: test.total_questions,
      marks_per_question: test.marks_per_question,
      negative_marking: test.negative_marking,
      negative_marks_per_question: test.negative_marks_per_question,
      is_premium: test.is_premium,
      is_active: test.is_active,
      subject_ids: [],
      topic_ids: [],
      instructions: test.instructions || '',
      passing_percentage: test.passing_percentage,
      status: test.status,
    })
    setSelectedTest(test)
    setModalMode('edit')
  }

  const openViewModal = (test: AdminTestSeries) => {
    setSelectedTest(test)
    setModalMode('view')
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedTest(null)
    setIsSubmitting(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const payload = { ...formData }
      
      if (modalMode === 'create') {
        await adminApi.createTestSeries(payload)
      } else if (modalMode === 'edit' && selectedTest) {
        await adminApi.updateTestSeries(selectedTest.id, payload)
      }
      closeModal()
      fetchTestSeries(search, typeFilter, statusFilter, page)
    } catch (err) {
      console.error('Failed to save test series:', err)
      alert('Failed to save test series. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (test: AdminTestSeries) => {
    if (!confirm(`Are you sure you want to delete "${test.title}"?`)) {
      return
    }
    
    try {
      await adminApi.deleteTestSeries(test.id)
      fetchTestSeries(search, typeFilter, statusFilter, page)
    } catch (err) {
      console.error('Failed to delete test series:', err)
      alert('Failed to delete test series. Please try again.')
    }
  }

  const handleStatusChange = async (test: AdminTestSeries, newStatus: 'draft' | 'review' | 'published') => {
    try {
      await adminApi.updateTestSeries(test.id, { status: newStatus })
      fetchTestSeries(search, typeFilter, statusFilter, page)
    } catch (err) {
      console.error('Failed to update status:', err)
      alert('Failed to update status. Please try again.')
    }
  }

  const handleActiveToggle = async (test: AdminTestSeries) => {
    try {
      await adminApi.updateTestSeries(test.id, { is_active: !test.is_active })
      fetchTestSeries(search, typeFilter, statusFilter, page)
    } catch (err) {
      console.error('Failed to toggle active status:', err)
      alert('Failed to update. Please try again.')
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
          <h1 className="text-2xl font-bold text-gray-900">Test Series</h1>
          <p className="text-gray-600">Create mock tests with type, duration, question count, and negative marking</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <Plus className="w-5 h-5" />
          Create Test
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
              placeholder="Search tests..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="">All Types</option>
              <option value="full_length">Full Length</option>
              <option value="sectional">Sectional</option>
              <option value="chapter">Chapter</option>
              <option value="quiz">Quiz</option>
            </select>
          </div>

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
          
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Test Series Table */}
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
        ) : testSeries.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No test series found</p>
            <button
              onClick={openCreateModal}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              Create your first test
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 bg-gray-50 border-b">
                  <th className="px-6 py-3 font-medium">Test</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Duration</th>
                  <th className="px-6 py-3 font-medium">Questions</th>
                  <th className="px-6 py-3 font-medium">Active</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {testSeries.map((test) => (
                  <tr key={test.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{test.title}</p>
                        {test.description && (
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {test.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${TEST_TYPES[test.test_type]?.color}`}>
                        {TEST_TYPES[test.test_type]?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        {test.duration_minutes} min
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-gray-600">
                        <HelpCircle className="w-4 h-4" />
                        {test.total_questions}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleActiveToggle(test)}
                        className={`p-2 rounded-lg transition ${
                          test.is_active
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={test.is_active ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
                      >
                        {test.is_active ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={test.status}
                        onChange={(e) => handleStatusChange(test, e.target.value as 'draft' | 'review' | 'published')}
                        className={`px-2 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${getStatusBadgeClass(test.status)}`}
                      >
                        <option value="draft">Draft</option>
                        <option value="review">Review</option>
                        <option value="published">Published</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openViewModal(test)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(test)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(test)}
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
            Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} tests
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
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === 'create' && 'Create New Test'}
                {modalMode === 'edit' && 'Edit Test'}
                {modalMode === 'view' && 'Test Details'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalMode === 'view' && selectedTest ? (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedTest.title}</h3>
                  <p className="text-sm text-gray-500">{selectedTest.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Type</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${TEST_TYPES[selectedTest.test_type]?.color}`}>
                      {TEST_TYPES[selectedTest.test_type]?.label}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Duration</p>
                    <p className="text-gray-900">{selectedTest.duration_minutes} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Questions</p>
                    <p className="text-gray-900">{selectedTest.total_questions}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Passing %</p>
                    <p className="text-gray-900">{selectedTest.passing_percentage}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Marks/Question</p>
                    <p className="text-gray-900">{selectedTest.marks_per_question}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Negative Marking</p>
                    <p className="text-gray-900">
                      {selectedTest.negative_marking ? `Yes (-${selectedTest.negative_marks_per_question})` : 'No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Premium</p>
                    <p className="text-gray-900">{selectedTest.is_premium ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(selectedTest.status)}`}>
                      {selectedTest.status}
                    </span>
                  </div>
                </div>

                {selectedTest.instructions && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Instructions</p>
                    <p className="text-gray-700">{selectedTest.instructions}</p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => openEditModal(selectedTest)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    Edit Test
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="e.g., SSC GD Full Length Mock Test 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Brief description of the test..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Test Type *
                    </label>
                    <select
                      value={formData.test_type}
                      onChange={(e) => setFormData({ ...formData, test_type: e.target.value as 'full_length' | 'sectional' | 'chapter' | 'quiz' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    >
                      <option value="full_length">Full Length</option>
                      <option value="sectional">Sectional</option>
                      <option value="chapter">Chapter</option>
                      <option value="quiz">Quiz</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes) *
                    </label>
                    <input
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 90 })}
                      min={1}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Questions *
                    </label>
                    <input
                      type="number"
                      value={formData.total_questions}
                      onChange={(e) => setFormData({ ...formData, total_questions: parseInt(e.target.value) || 100 })}
                      min={1}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marks per Question
                    </label>
                    <input
                      type="number"
                      value={formData.marks_per_question}
                      onChange={(e) => setFormData({ ...formData, marks_per_question: parseFloat(e.target.value) || 1 })}
                      min={0}
                      step={0.5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.negative_marking}
                          onChange={(e) => setFormData({ ...formData, negative_marking: e.target.checked })}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Negative Marking</span>
                      </label>
                    </div>
                    {formData.negative_marking && (
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Negative Marks per Question</label>
                        <input
                          type="number"
                          value={formData.negative_marks_per_question}
                          onChange={(e) => setFormData({ ...formData, negative_marks_per_question: parseFloat(e.target.value) || 0.25 })}
                          min={0}
                          step={0.25}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Passing Percentage
                    </label>
                    <input
                      type="number"
                      value={formData.passing_percentage}
                      onChange={(e) => setFormData({ ...formData, passing_percentage: parseFloat(e.target.value) || 35 })}
                      min={0}
                      max={100}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
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
                      <span className="text-sm text-gray-600">Premium only</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Active
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-600">Available to students</span>
                    </label>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions
                  </label>
                  <textarea
                    value={formData.instructions || ''}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Instructions for students taking this test..."
                  />
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
                    {isSubmitting ? 'Saving...' : modalMode === 'create' ? 'Create Test' : 'Save Changes'}
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
