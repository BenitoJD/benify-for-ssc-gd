'use client'

import { useEffect, useState, useCallback } from 'react'
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
  Dumbbell,
  Activity,
  CheckCircle,
  Users
} from 'lucide-react'
import apiClient from '@/lib/api/client'

// Types
interface ExerciseItem {
  day?: string
  activity: string
  duration?: number
  sets?: number
  reps?: string
  description?: string
}

interface AdminPhysicalPlan {
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

interface AdminPhysicalPlanDetail extends AdminPhysicalPlan {
  exercises: ExerciseItem[]
  schedule?: Record<string, unknown>
  targets?: Record<string, unknown>
}

interface PhysicalComplianceStats {
  total_users: number
  pst_ready_count: number
  pet_ready_count: number
  fully_ready_count: number
  pst_ready_percentage: number
  pet_ready_percentage: number
  fully_ready_percentage: number
}

interface PhysicalComplianceByGender {
  gender: string
  total_users: number
  pst_ready_count: number
  pet_ready_count: number
  fully_ready_count: number
  pst_ready_percentage: number
  pet_ready_percentage: number
  fully_ready_percentage: number
}

type ModalMode = 'create' | 'edit' | 'view' | null

// API Functions
async function fetchPhysicalPlans(params: {
  page?: number
  limit?: number
  target_gender?: string
  plan_type?: string
  is_active?: boolean
  search?: string
}): Promise<AdminPhysicalPlan[]> {
  const response = await apiClient.get<AdminPhysicalPlan[]>('/admin/physical/plans', {
    params,
  })
  return response.data
}

async function fetchPhysicalPlan(id: string): Promise<AdminPhysicalPlanDetail> {
  const response = await apiClient.get<AdminPhysicalPlanDetail>(`/admin/physical/plans/${id}`)
  return response.data
}

async function createPhysicalPlan(data: Partial<AdminPhysicalPlanDetail>): Promise<AdminPhysicalPlan> {
  const response = await apiClient.post<AdminPhysicalPlan>('/admin/physical/plans', data)
  return response.data
}

async function updatePhysicalPlan(id: string, data: Partial<AdminPhysicalPlanDetail>): Promise<AdminPhysicalPlan> {
  const response = await apiClient.put<AdminPhysicalPlan>(`/admin/physical/plans/${id}`, data)
  return response.data
}

async function deletePhysicalPlan(id: string): Promise<void> {
  await apiClient.delete(`/admin/physical/plans/${id}`)
}

async function fetchComplianceStats(): Promise<PhysicalComplianceStats> {
  const response = await apiClient.get<PhysicalComplianceStats>('/admin/physical/compliance')
  return response.data
}

async function fetchComplianceByGender(): Promise<PhysicalComplianceByGender[]> {
  const response = await apiClient.get<PhysicalComplianceByGender[]>('/admin/physical/compliance/by-gender')
  return response.data
}

export default function AdminPhysicalPage() {
  const [plans, setPlans] = useState<AdminPhysicalPlan[]>([])
  const [compliance, setCompliance] = useState<PhysicalComplianceStats | null>(null)
  const [complianceByGender, setComplianceByGender] = useState<PhysicalComplianceByGender[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedPlan, setSelectedPlan] = useState<AdminPhysicalPlanDetail | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState<{
    title: string
    description: string
    plan_type: 'running' | 'strength' | 'flexibility' | 'mixed'
    target_gender: 'male' | 'female' | 'all'
    duration_weeks: number
    difficulty_level: string
    exercises: ExerciseItem[]
    is_premium: boolean
    is_active: boolean
  }>({
    title: '',
    description: '',
    plan_type: 'running',
    target_gender: 'all',
    duration_weeks: 8,
    difficulty_level: '',
    exercises: [],
    is_premium: false,
    is_active: true
  })

  const fetchPlans = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const params: Parameters<typeof fetchPhysicalPlans>[0] = {
        page,
        limit: 20,
        search: search || undefined,
        target_gender: genderFilter || undefined,
        plan_type: typeFilter || undefined,
        is_active: activeFilter === '' ? undefined : activeFilter === 'true'
      }
      const response = await fetchPhysicalPlans(params)
      setPlans(response)
      setTotalPages(Math.ceil(response.length / 20) || 1)
      setTotal(response.length)
    } catch (err) {
      setError('Failed to load physical plans')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [page, search, genderFilter, typeFilter, activeFilter])

  const fetchCompliance = useCallback(async () => {
    try {
      const [stats, byGender] = await Promise.all([
        fetchComplianceStats(),
        fetchComplianceByGender()
      ])
      setCompliance(stats)
      setComplianceByGender(byGender)
    } catch (err) {
      console.error('Failed to fetch compliance:', err)
    }
  }, [])

  useEffect(() => {
    fetchPlans()
    fetchCompliance()
  }, [fetchPlans, fetchCompliance])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchPlans()
  }

  const openCreateModal = () => {
    setFormData({
      title: '',
      description: '',
      plan_type: 'running',
      target_gender: 'all',
      duration_weeks: 8,
      difficulty_level: '',
      exercises: [],
      is_premium: false,
      is_active: true
    })
    setSelectedPlan(null)
    setModalMode('create')
  }

  const openEditModal = async (plan: AdminPhysicalPlan) => {
    try {
      const detail = await fetchPhysicalPlan(plan.id)
      setFormData({
        title: detail.title,
        description: detail.description || '',
        plan_type: detail.plan_type,
        target_gender: detail.target_gender,
        duration_weeks: detail.duration_weeks,
        difficulty_level: detail.difficulty_level || '',
        exercises: detail.exercises || [],
        is_premium: detail.is_premium,
        is_active: detail.is_active
      })
      setSelectedPlan(detail)
      setModalMode('edit')
    } catch (err) {
      alert('Failed to load plan details')
    }
  }

  const openViewModal = async (plan: AdminPhysicalPlan) => {
    try {
      const detail = await fetchPhysicalPlan(plan.id)
      setSelectedPlan(detail)
      setModalMode('view')
    } catch (err) {
      alert('Failed to load plan details')
    }
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedPlan(null)
    setIsSubmitting(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      if (modalMode === 'create') {
        await createPhysicalPlan(formData)
      } else if (modalMode === 'edit' && selectedPlan) {
        await updatePhysicalPlan(selectedPlan.id, formData)
      }
      closeModal()
      fetchPlans()
      fetchCompliance()
    } catch (err) {
      console.error('Failed to save plan:', err)
      alert('Failed to save plan. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (plan: AdminPhysicalPlan) => {
    if (!confirm(`Are you sure you want to delete "${plan.title}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      await deletePhysicalPlan(plan.id)
      fetchPlans()
      fetchCompliance()
    } catch (err) {
      alert('Failed to delete plan. Please try again.')
    }
  }

  const addExercise = () => {
    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, { activity: '', duration: 30 }]
    }))
  }

  const removeExercise = (index: number) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }))
  }

  const updateExercise = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) => 
        i === index ? { ...ex, [field]: value } : ex
      )
    }))
  }

  const getPlanTypeIcon = (type: string) => {
    switch (type) {
      case 'running': return <Activity className="w-5 h-5" />
      case 'strength': return <Dumbbell className="w-5 h-5" />
      default: return <CheckCircle className="w-5 h-5" />
    }
  }

  const getGenderBadgeClass = (gender: string) => {
    switch (gender) {
      case 'male': return 'bg-blue-100 text-blue-700'
      case 'female': return 'bg-pink-100 text-pink-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--text-main)] mb-2">Physical Training Plans</h1>
          <p className="font-bold text-[var(--text-muted)] text-sm uppercase tracking-widest">Manage running, strength, and flexibility training plans</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--text-main)] text-white font-bold rounded-2xl hover:-translate-y-0.5 active:translate-y-1 shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Plan
        </button>
      </div>

      {/* Compliance Overview */}
      {compliance && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card-brilliant p-4 hover:-translate-y-1 transition-transform">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl border-2 border-blue-200">
                <Users className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-[var(--text-main)] mt-1">{compliance.total_users}</p>
              </div>
            </div>
          </div>
          <div className="card-brilliant p-4 hover:-translate-y-1 transition-transform">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl border-2 border-green-200">
                <CheckCircle className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">PST Ready</p>
                <p className="text-2xl font-bold text-[var(--text-main)] mt-1">{compliance.pst_ready_percentage}%</p>
              </div>
            </div>
          </div>
          <div className="card-brilliant p-4 hover:-translate-y-1 transition-transform">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl border-2 border-purple-200">
                <Activity className="w-6 h-6 text-purple-700" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">PET Ready</p>
                <p className="text-2xl font-bold text-[var(--text-main)] mt-1">{compliance.pet_ready_percentage}%</p>
              </div>
            </div>
          </div>
          <div className="card-brilliant p-4 hover:-translate-y-1 transition-transform">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[var(--text-main)] rounded-xl border-2 border-gray-900 border-opacity-20 text-white">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Fully Ready</p>
                <p className="text-2xl font-bold text-[var(--text-main)] mt-1">{compliance.fully_ready_percentage}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card-brilliant p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plans..."
              className="w-full pl-12 pr-4 py-3 border-2 border-[var(--border-light)] rounded-2xl focus:ring-4 focus:ring-[var(--brilliant-blue)] focus:ring-opacity-20 focus:border-[var(--brilliant-blue)] outline-none transition-all font-semibold text-[var(--text-main)]"
            />
          </div>
          <select
            value={genderFilter}
            onChange={(e) => { setGenderFilter(e.target.value); setPage(1); }}
            className="px-4 py-3 border-2 border-[var(--border-light)] rounded-2xl focus:ring-4 focus:ring-[var(--brilliant-blue)] focus:ring-opacity-20 focus:border-[var(--brilliant-blue)] outline-none transition-all font-bold text-[var(--text-main)] cursor-pointer bg-white"
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="all">All</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-4 py-3 border-2 border-[var(--border-light)] rounded-2xl focus:ring-4 focus:ring-[var(--brilliant-blue)] focus:ring-opacity-20 focus:border-[var(--brilliant-blue)] outline-none transition-all font-bold text-[var(--text-main)] cursor-pointer bg-white"
          >
            <option value="">All Types</option>
            <option value="running">Running</option>
            <option value="strength">Strength</option>
            <option value="flexibility">Flexibility</option>
            <option value="mixed">Mixed</option>
          </select>
          <select
            value={activeFilter}
            onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
            className="px-4 py-3 border-2 border-[var(--border-light)] rounded-2xl focus:ring-4 focus:ring-[var(--brilliant-blue)] focus:ring-opacity-20 focus:border-[var(--brilliant-blue)] outline-none transition-all font-bold text-[var(--text-main)] cursor-pointer bg-white"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <button
            type="submit"
            className="px-6 py-3 bg-[var(--text-main)] text-white font-bold rounded-2xl hover:-translate-y-0.5 active:translate-y-1 shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none transition-all"
          >
            Search
          </button>
        </form>
      </div>

      {/* Plans Table */}
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
        ) : plans.length === 0 ? (
          <div className="text-center py-16 text-[var(--text-muted)] font-bold text-sm bg-gray-50/50 flex flex-col items-center">
            <p>No physical plans found</p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-6 py-3 bg-[var(--text-main)] text-white font-bold rounded-2xl hover:-translate-y-0.5 active:translate-y-1 shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none transition-all"
            >
              Create your first plan
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest bg-gray-50 border-b-2 border-[var(--border-light)]">
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Gender</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Premium</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[var(--border-light)]">
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-bold text-[var(--text-main)] text-[15px]">{plan.title}</p>
                        {plan.description && (
                          <p className="text-sm font-semibold text-[var(--text-muted)] mt-1 truncate max-w-xs">{plan.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 font-bold text-sm text-[var(--text-main)]">
                        <div className="p-1.5 bg-gray-100 rounded-lg border-2 border-[var(--border-light)]">
                          {getPlanTypeIcon(plan.plan_type)}
                        </div>
                        <span className="capitalize">{plan.plan_type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-block px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest rounded-lg border-2 border-opacity-30 ${getGenderBadgeClass(plan.target_gender)}`}>
                        {plan.target_gender}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-bold text-[var(--text-main)]">{plan.duration_weeks} weeks</td>
                    <td className="px-6 py-5">
                      {plan.is_premium ? (
                        <span className="inline-block px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-widest rounded-lg border-2 bg-yellow-100 text-yellow-700 border-yellow-200">Premium</span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-widest rounded-lg border-2 bg-gray-100 text-gray-600 border-gray-200">Free</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-block px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest rounded-lg border-2 ${
                        plan.is_active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openViewModal(plan)}
                          className="p-3 border-2 border-transparent text-gray-400 hover:text-[var(--text-main)] hover:bg-gray-100 hover:border-[var(--border-light)] rounded-xl transition-all"
                          title="View"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openEditModal(plan)}
                          className="p-3 border-2 border-transparent text-gray-400 hover:text-[var(--brilliant-blue)] hover:bg-blue-50 hover:border-blue-200 rounded-xl transition-all"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(plan)}
                          className="p-3 border-2 border-transparent text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl transition-all"
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

      {/* Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card-brilliant max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === 'create' && 'Create Physical Plan'}
                {modalMode === 'edit' && 'Edit Physical Plan'}
                {modalMode === 'view' && 'Plan Details'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalMode === 'view' && selectedPlan ? (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedPlan.title}</h3>
                  <p className="text-gray-600 mt-1">{selectedPlan.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Type</p>
                    <p className="text-gray-900 capitalize">{selectedPlan.plan_type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Target Gender</p>
                    <p className="text-gray-900 capitalize">{selectedPlan.target_gender}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Duration</p>
                    <p className="text-gray-900">{selectedPlan.duration_weeks} weeks</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Difficulty</p>
                    <p className="text-gray-900">{selectedPlan.difficulty_level || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Premium</p>
                    <p className="text-gray-900">{selectedPlan.is_premium ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-gray-900">{selectedPlan.is_active ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>

                {selectedPlan.exercises && selectedPlan.exercises.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Exercises</p>
                    <div className="space-y-2">
                      {selectedPlan.exercises.map((ex, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-3">
                          <p className="font-medium text-gray-900">{ex.activity}</p>
                          <p className="text-sm text-gray-500">
                            {ex.duration && `${ex.duration} min`}
                            {ex.sets && ` • ${ex.sets} sets`}
                            {ex.reps && ` × ${ex.reps}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => openEditModal(selectedPlan)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    Edit Plan
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="e.g., 5K Running Plan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Brief description of the plan..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plan Type *
                    </label>
                    <select
                      value={formData.plan_type}
                      onChange={(e) => setFormData({ ...formData, plan_type: e.target.value as any })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    >
                      <option value="running">Running</option>
                      <option value="strength">Strength</option>
                      <option value="flexibility">Flexibility</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Gender *
                    </label>
                    <select
                      value={formData.target_gender}
                      onChange={(e) => setFormData({ ...formData, target_gender: e.target.value as any })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    >
                      <option value="all">All</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (weeks) *
                    </label>
                    <input
                      type="number"
                      value={formData.duration_weeks}
                      onChange={(e) => setFormData({ ...formData, duration_weeks: parseInt(e.target.value) || 8 })}
                      required
                      min={1}
                      max={52}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulty Level
                    </label>
                    <select
                      value={formData.difficulty_level}
                      onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    >
                      <option value="">Not specified</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_premium}
                      onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Premium Plan</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>

                {/* Exercises Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Exercises
                    </label>
                    <button
                      type="button"
                      onClick={addExercise}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      + Add Exercise
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.exercises.map((exercise, index) => (
                      <div key={index} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={exercise.activity}
                            onChange={(e) => updateExercise(index, 'activity', e.target.value)}
                            placeholder="Exercise name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                          />
                        </div>
                        <div className="w-20">
                          <input
                            type="number"
                            value={exercise.duration || ''}
                            onChange={(e) => updateExercise(index, 'duration', parseInt(e.target.value) || 0)}
                            placeholder="Min"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:ring-primary-500 outline-none text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExercise(index)}
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
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
                    {isSubmitting ? 'Saving...' : modalMode === 'create' ? 'Create Plan' : 'Save Changes'}
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
