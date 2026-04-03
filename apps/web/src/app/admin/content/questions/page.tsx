'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
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
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react'
import { adminApi, AdminQuestion, AdminTopic, QuestionCreateDTO } from '@/lib/api/admin'

type ModalMode = 'create' | 'edit' | 'view' | 'import' | null

const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
}

const QUESTION_TYPES = {
  mcq: 'MCQ',
  true_false: 'True/False',
}

export default function AdminQuestionsPage() {
  const searchParams = useSearchParams()
  const [questions, setQuestions] = useState<AdminQuestion[]>([])
  const [topics, setTopics] = useState<AdminTopic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [topicFilter, setTopicFilter] = useState<string>('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || '')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  
  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedQuestion, setSelectedQuestion] = useState<AdminQuestion | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state - question options
  const [formData, setFormData] = useState<QuestionCreateDTO & { topic_id: string; question_text: string; options: string[] }>({
    topic_id: '',
    question_text: '',
    question_type: 'mcq',
    options: ['', '', '', ''],
    correct_answer: 'A',
    explanation: '',
    difficulty: 'medium',
    marks: 1,
    negative_marks: 0.25,
    is_premium: false,
    source: '',
    exam_year: undefined,
    status: 'draft',
  })

  const fetchQuestions = useCallback(async (
    searchTerm: string, 
    topicId: string, 
    difficulty: string,
    status: string, 
    pageNum: number
  ) => {
    setIsLoading(true)
    setError('')
    try {
      const response = await adminApi.listQuestions({
        page: pageNum,
        limit: 20,
        search: searchTerm || undefined,
        topic_id: topicId || undefined,
        difficulty: difficulty || undefined,
        status: status || undefined,
      })
      setQuestions(response.data)
      setTotalPages(response.meta.pages)
      setTotal(response.meta.total)
      setPage(pageNum)
    } catch (err) {
      setError('Failed to load questions')
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
    fetchQuestions(search, topicFilter, difficultyFilter, statusFilter, page)
  }, [fetchQuestions, search, topicFilter, difficultyFilter, statusFilter, page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchQuestions(search, topicFilter, difficultyFilter, statusFilter, 1)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  const openCreateModal = () => {
    setFormData({
      topic_id: topicFilter || (topics[0]?.id || ''),
      question_text: '',
      question_type: 'mcq',
      options: ['', '', '', ''],
      correct_answer: 'A',
      explanation: '',
      difficulty: 'medium',
      marks: 1,
      negative_marks: 0.25,
      is_premium: false,
      source: '',
      exam_year: undefined,
      status: 'draft',
    })
    setSelectedQuestion(null)
    setModalMode('create')
  }

  const openEditModal = (question: AdminQuestion) => {
    const options = typeof question.options === 'string' ? JSON.parse(question.options) : question.options
    setFormData({
      topic_id: question.topic_id,
      question_text: question.question_text,
      question_type: question.question_type,
      options: options,
      correct_answer: question.correct_answer,
      explanation: question.explanation || '',
      difficulty: question.difficulty,
      marks: question.marks,
      negative_marks: question.negative_marks,
      is_premium: question.is_premium,
      source: question.source || '',
      exam_year: question.exam_year,
      status: question.status,
    })
    setSelectedQuestion(question)
    setModalMode('edit')
  }

  const openViewModal = (question: AdminQuestion) => {
    setSelectedQuestion(question)
    setModalMode('view')
  }

  const openImportModal = () => {
    setModalMode('import')
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedQuestion(null)
    setIsSubmitting(false)
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData({ ...formData, options: [...formData.options, ''] })
    }
  }

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index)
      setFormData({ ...formData, options: newOptions })
      // Adjust correct_answer if needed
      if (formData.correct_answer === String.fromCharCode(65 + index)) {
        setFormData({ ...formData, correct_answer: 'A' })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const { topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, marks, negative_marks, is_premium, source, exam_year, status } = formData
      const payload = { 
        topic_id, 
        question_text, 
        question_type: question_type as 'mcq' | 'true_false',
        options: options.filter(o => o.trim()), 
        correct_answer, 
        explanation, 
        difficulty: difficulty as 'easy' | 'medium' | 'hard', 
        marks, 
        negative_marks, 
        is_premium, 
        source, 
        exam_year, 
        status 
      }
      
      if (modalMode === 'create') {
        await adminApi.createQuestion(payload)
      } else if (modalMode === 'edit' && selectedQuestion) {
        await adminApi.updateQuestion(selectedQuestion.id, payload)
      }
      closeModal()
      fetchQuestions(search, topicFilter, difficultyFilter, statusFilter, page)
    } catch (err) {
      console.error('Failed to save question:', err)
      alert('Failed to save question. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (question: AdminQuestion) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return
    }
    
    try {
      await adminApi.deleteQuestion(question.id)
      fetchQuestions(search, topicFilter, difficultyFilter, statusFilter, page)
    } catch (err) {
      console.error('Failed to delete question:', err)
      alert('Failed to delete question. Please try again.')
    }
  }

  const handleStatusChange = async (question: AdminQuestion, newStatus: 'draft' | 'review' | 'published') => {
    try {
      await adminApi.updateQuestion(question.id, { status: newStatus })
      fetchQuestions(search, topicFilter, difficultyFilter, statusFilter, page)
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

  // Bulk import handlers
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importResult, setImportResult] = useState<{ imported: number; failed: number; errors?: Array<{ row: number; error: string }> } | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setImportFile(file)
        setImportResult(null)
      } else {
        alert('Please select a CSV file')
      }
    }
  }

  const handleImport = async () => {
    if (!importFile) return
    
    setIsImporting(true)
    setImportResult(null)
    
    try {
      // Parse CSV
      const text = await importFile.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        alert('CSV file is empty or has no data rows')
        return
      }
      
      lines[0].split(',').map(h => h.trim().toLowerCase())
      
      const questions: Array<{
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
      }> = []
      
      const errors: Array<{ row: number; error: string }> = []
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        
        if (values.length < 5) {
          errors.push({ row: i + 1, error: 'Insufficient columns' })
          continue
        }
        
        const [topic_id, question_text, correct_answer, optionsStr, difficulty] = values
        const optionValues = optionsStr.split('|')
        
        if (!topic_id || !question_text || !correct_answer || optionValues.length < 2) {
          errors.push({ row: i + 1, error: 'Missing required fields' })
          continue
        }
        
        questions.push({
          topic_id,
          question_text,
          question_type: 'mcq',
          options: optionValues,
          correct_answer,
          difficulty: (difficulty as 'easy' | 'medium' | 'hard') || 'medium',
        })
      }
      
      if (questions.length === 0) {
        alert('No valid questions found in CSV')
        return
      }
      
      const result = await adminApi.bulkImportQuestions({ questions })
      setImportResult({
        imported: result.imported,
        failed: result.failed || errors.length,
        errors: errors.length > 0 ? errors : undefined
      })
      
      if (result.imported > 0) {
        fetchQuestions(search, topicFilter, difficultyFilter, statusFilter, page)
      }
    } catch (err) {
      console.error('Import failed:', err)
      alert('Failed to import questions. Please check the CSV format.')
    } finally {
      setIsImporting(false)
    }
  }

  const downloadCSVTemplate = () => {
    const template = `topic_id,question_text,correct_answer,options (pipe-separated),difficulty,source,exam_year
uuid-here,What is 2+2?,B,1|2|3|4,medium,Mock Test,2024
uuid-here,The capital of India is,Delhi,New Delhi|Mumbai|Chennai|Kolkata,easy,SSC GD 2023,2023`
    
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'question_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--text-main)] mb-2">Question Bank</h1>
          <p className="font-bold text-[var(--text-muted)] text-sm uppercase tracking-widest">Create MCQ questions with options, difficulty, and explanations</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openImportModal}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--text-main)] text-white font-bold rounded-2xl hover:-translate-y-0.5 active:translate-y-1 shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none transition-all"
          >
            <Upload className="w-5 h-5" />
            Bulk Import
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--brilliant-blue)] text-white font-bold rounded-2xl hover:-translate-y-0.5 active:translate-y-1 shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Question
          </button>
        </div>
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
              placeholder="Search questions..."
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
              className="px-4 py-3 border-2 border-[var(--border-light)] rounded-2xl focus:ring-4 focus:ring-[var(--brilliant-blue)] focus:ring-opacity-20 focus:border-[var(--brilliant-blue)] outline-none transition-all font-bold text-[var(--text-main)] cursor-pointer bg-white max-w-[200px] truncate"
            >
              <option value="">All Topics</option>
              {topics.map(topic => (
                <option key={topic.id} value={topic.id}>{topic.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={difficultyFilter}
              onChange={(e) => {
                setDifficultyFilter(e.target.value)
                setPage(1)
              }}
              className="px-4 py-3 border-2 border-[var(--border-light)] rounded-2xl focus:ring-4 focus:ring-[var(--brilliant-blue)] focus:ring-opacity-20 focus:border-[var(--brilliant-blue)] outline-none transition-all font-bold text-[var(--text-main)] cursor-pointer bg-white"
            >
              <option value="">All Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="px-4 py-3 border-2 border-[var(--border-light)] rounded-2xl focus:ring-4 focus:ring-[var(--brilliant-blue)] focus:ring-opacity-20 focus:border-[var(--brilliant-blue)] outline-none transition-all font-bold text-[var(--text-main)] cursor-pointer bg-white"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="published">Published</option>
            </select>
          </div>
          
          <button
            type="submit"
            className="px-6 py-3 bg-[var(--text-main)] text-white font-bold rounded-2xl hover:-translate-y-0.5 active:translate-y-1 shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none transition-all"
          >
            Search
          </button>
        </form>
      </div>

      {/* Questions Table */}
      <div className="card-brilliant overflow-hidden p-0 border-0">
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
        ) : questions.length === 0 ? (
          <div className="text-center py-16 text-[var(--text-muted)] font-bold text-sm bg-gray-50/50 flex flex-col items-center">
            <p>No questions found</p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-6 py-3 bg-[var(--text-main)] text-white font-bold rounded-2xl hover:-translate-y-0.5 active:translate-y-1 shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none transition-all"
            >
              Create your first question
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest bg-gray-50 border-b-2 border-[var(--border-light)]">
                  <th className="px-6 py-4">Question</th>
                  <th className="px-6 py-4">Topic</th>
                  <th className="px-6 py-4 text-center">Type</th>
                  <th className="px-6 py-4 text-center">Difficulty</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[var(--border-light)]">
                {questions.map((question) => (
                  <tr key={question.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="max-w-md">
                        <p className="font-bold text-[var(--text-main)] text-[15px] line-clamp-2">
                          {question.question_text}
                        </p>
                        <p className="font-bold text-[10px] uppercase tracking-widest text-gray-500 mt-2">
                          {question.source && `SRC: ${question.source}`}
                          {question.source && question.exam_year && ` • `}
                          {question.exam_year && `YR: ${question.exam_year}`}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-[var(--text-muted)] font-bold text-sm">
                      {getTopicName(question.topic_id)}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-lg border-2 border-[var(--border-light)] font-bold text-xs uppercase tracking-wider">
                        {QUESTION_TYPES[question.question_type] || question.question_type}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`inline-block px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest rounded-lg border-2 ${
                        question.difficulty === 'easy' ? 'bg-green-100 text-green-700 border-green-200' :
                        question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                        'bg-red-100 text-red-700 border-red-200'
                      }`}>
                        {question.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <select
                        value={question.status}
                        onChange={(e) => handleStatusChange(question, e.target.value as 'draft' | 'review' | 'published')}
                        className={`pl-3 pr-8 py-1.5 text-[10px] uppercase font-bold tracking-widest rounded-lg border-2 cursor-pointer transition-colors ${
                          question.status === 'published' ? 'bg-green-100 text-green-700 border-green-200' :
                          question.status === 'review' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
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
                          onClick={() => openViewModal(question)}
                          className="p-2 border-2 border-transparent text-gray-400 hover:text-[var(--text-main)] hover:bg-gray-100 hover:border-[var(--border-light)] rounded-xl transition-all"
                          title="View"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openEditModal(question)}
                          className="p-2 border-2 border-transparent text-gray-400 hover:text-[var(--brilliant-blue)] hover:bg-blue-50 hover:border-blue-200 rounded-xl transition-all"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(question)}
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
            Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} questions
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

      {/* Create/Edit/View Modal */}
      {/* Modal */}
      {modalMode && modalMode !== 'import' && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="card-brilliant max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === 'create' && 'Create New Question'}
                {modalMode === 'edit' && 'Edit Question'}
                {modalMode === 'view' && 'Question Details'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalMode === 'view' && selectedQuestion ? (
              <div className="p-6 space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-lg font-medium text-gray-900">{selectedQuestion.question_text}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Options</p>
                  {(typeof selectedQuestion.options === 'string' ? JSON.parse(selectedQuestion.options) : selectedQuestion.options).map((opt: string, i: number) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border ${
                        opt === selectedQuestion.correct_answer
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 text-gray-700'
                      }`}
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                      {opt}
                      {opt === selectedQuestion.correct_answer && (
                        <CheckCircle className="w-4 h-4 inline ml-2" />
                      )}
                    </div>
                  ))}
                </div>

                {selectedQuestion.explanation && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Explanation</p>
                    <p className="text-gray-700">{selectedQuestion.explanation}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Topic</p>
                    <p className="text-gray-900">{getTopicName(selectedQuestion.topic_id)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Difficulty</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${DIFFICULTY_COLORS[selectedQuestion.difficulty]}`}>
                      {selectedQuestion.difficulty}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Marks</p>
                    <p className="text-gray-900">{selectedQuestion.marks}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(selectedQuestion.status)}`}>
                      {selectedQuestion.status}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => openEditModal(selectedQuestion)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    Edit Question
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                    Question Text *
                  </label>
                  <textarea
                    value={formData.question_text}
                    onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Enter the question text..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Options *
                    </label>
                    {formData.options.length < 6 && (
                      <button
                        type="button"
                        onClick={addOption}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        + Add Option
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-8 text-sm font-medium text-gray-500">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          required
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        />
                        <label className="flex items-center gap-1 text-sm">
                          <input
                            type="radio"
                            name="correct_answer"
                            checked={formData.correct_answer === String.fromCharCode(65 + index)}
                            onChange={() => setFormData({ ...formData, correct_answer: String.fromCharCode(65 + index) })}
                            className="text-primary-600 focus:ring-primary-500"
                          />
                          Correct
                        </label>
                        {formData.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Explanation
                  </label>
                  <textarea
                    value={formData.explanation || ''}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Explain the correct answer..."
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulty
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marks
                    </label>
                    <input
                      type="number"
                      value={formData.marks}
                      onChange={(e) => setFormData({ ...formData, marks: parseFloat(e.target.value) || 1 })}
                      min={0}
                      step={0.5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Negative Marks
                    </label>
                    <input
                      type="number"
                      value={formData.negative_marks}
                      onChange={(e) => setFormData({ ...formData, negative_marks: parseFloat(e.target.value) || 0 })}
                      min={0}
                      step={0.25}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Premium
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer mt-2">
                      <input
                        type="checkbox"
                        checked={formData.is_premium}
                        onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-600">Premium only</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Source
                    </label>
                    <input
                      type="text"
                      value={formData.source || ''}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="e.g., SSC GD 2023, Mock Test"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exam Year
                    </label>
                    <input
                      type="number"
                      value={formData.exam_year || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        exam_year: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      min={2015}
                      max={2030}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="e.g., 2024"
                    />
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
                    {isSubmitting ? 'Saving...' : modalMode === 'create' ? 'Create Question' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Import Modal */}
      {modalMode === 'import' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card-brilliant max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Bulk Import Questions</h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">CSV Format Required</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Upload a CSV file with columns: topic_id, question_text, correct_answer, options (pipe-separated), difficulty, source, exam_year
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={downloadCSVTemplate}
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Download CSV Template
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select CSV File
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv"
                  onChange={handleImportFileChange}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 transition"
                >
                  {importFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileSpreadsheet className="w-8 h-8 text-green-500" />
                      <span className="font-medium text-gray-900">{importFile.name}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Click to select CSV file</p>
                    </>
                  )}
                </div>
              </div>

              {importResult && (
                <div className={`border rounded-lg p-4 ${
                  importResult.failed === 0 ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
                }`}>
                  <div className="flex items-start gap-3">
                    {importResult.failed === 0 ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        Import Complete: {importResult.imported} succeeded, {importResult.failed} failed
                      </p>
                      {importResult.errors && importResult.errors.length > 0 && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p className="font-medium">Errors:</p>
                          <ul className="list-disc list-inside mt-1">
                            {importResult.errors.slice(0, 5).map((err, i) => (
                              <li key={i}>Row {err.row}: {err.error}</li>
                            ))}
                            {importResult.errors.length > 5 && (
                              <li>...and {importResult.errors.length - 5} more errors</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Close
                </button>
                <button
                  onClick={handleImport}
                  disabled={!importFile || isImporting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                >
                  {isImporting ? 'Importing...' : 'Import Questions'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
