'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'
import {
  adminApi,
  AdminDocumentChecklist,
  AdminDocumentChecklistCreateDTO,
  DocumentComplianceStats
} from '@/lib/api/admin'

type ModalMode = 'create' | 'edit' | 'view' | null

export default function AdminDocumentsPage() {
  const [checklists, setChecklists] = useState<AdminDocumentChecklist[]>([])
  const [compliance, setCompliance] = useState<DocumentComplianceStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [requiredFilter, setRequiredFilter] = useState<string>('')
  const [activeFilter, setActiveFilter] = useState<string>('')

  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedChecklist, setSelectedChecklist] = useState<AdminDocumentChecklist | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState<AdminDocumentChecklistCreateDTO>({
    title: '',
    description: '',
    stage: 'pst',
    document_type: '',
    is_required: true,
    is_required_for_all: true,
    is_required_for_gender: undefined,
    accepted_formats: 'PDF,JPG,PNG,JPEG',
    max_file_size_mb: 5,
    instructions: '',
    order_index: 0,
    is_active: true
  })

  const fetchChecklists = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await adminApi.listDocumentChecklists({
        search: search || undefined,
        stage: stageFilter || undefined,
        is_required: requiredFilter === '' ? undefined : requiredFilter === 'true',
        is_active: activeFilter === '' ? undefined : activeFilter === 'true'
      })
      setChecklists(response)
    } catch (err) {
      setError('Failed to load document checklists')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [search, stageFilter, requiredFilter, activeFilter])

  const fetchCompliance = useCallback(async () => {
    try {
      const stats = await adminApi.getDocumentCompliance()
      setCompliance(stats)
    } catch (err) {
      console.error('Failed to fetch compliance:', err)
    }
  }, [])

  useEffect(() => {
    fetchChecklists()
    fetchCompliance()
  }, [fetchChecklists, fetchCompliance])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchChecklists()
  }

  const openCreateModal = () => {
    setFormData({
      title: '',
      description: '',
      stage: 'pst',
      document_type: '',
      is_required: true,
      is_required_for_all: true,
      is_required_for_gender: undefined,
      accepted_formats: 'PDF,JPG,PNG,JPEG',
      max_file_size_mb: 5,
      instructions: '',
      order_index: checklists.length,
      is_active: true
    })
    setSelectedChecklist(null)
    setModalMode('create')
  }

  const openEditModal = (checklist: AdminDocumentChecklist) => {
    setFormData({
      title: checklist.title,
      description: checklist.description || '',
      stage: checklist.stage,
      document_type: checklist.document_type || '',
      is_required: checklist.is_required,
      is_required_for_all: checklist.is_required_for_all,
      is_required_for_gender: checklist.is_required_for_gender || undefined,
      accepted_formats: checklist.accepted_formats,
      max_file_size_mb: checklist.max_file_size_mb,
      instructions: checklist.instructions || '',
      order_index: checklist.order_index,
      is_active: checklist.is_active
    })
    setSelectedChecklist(checklist)
    setModalMode('edit')
  }

  const openViewModal = (checklist: AdminDocumentChecklist) => {
    setSelectedChecklist(checklist)
    setModalMode('view')
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedChecklist(null)
    setIsSubmitting(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      if (modalMode === 'create') {
        await adminApi.createDocumentChecklist(formData)
      } else if (modalMode === 'edit' && selectedChecklist) {
        await adminApi.updateDocumentChecklist(selectedChecklist.id, formData)
      }
      closeModal()
      fetchChecklists()
      fetchCompliance()
    } catch (err) {
      console.error('Failed to save checklist:', err)
      alert('Failed to save checklist. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (checklist: AdminDocumentChecklist) => {
    if (!confirm(`Are you sure you want to delete "${checklist.title}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      await adminApi.deleteDocumentChecklist(checklist.id)
      fetchChecklists()
      fetchCompliance()
    } catch {
      alert('Failed to delete checklist. Please try again.')
    }
  }

  const getStageBadgeClass = (stage: string) => {
    switch (stage) {
      case 'pst': return 'bg-blue-100 text-blue-700'
      case 'pet': return 'bg-green-100 text-green-700'
      case 'medical': return 'bg-purple-100 text-purple-700'
      case 'document_verification': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'pst': return 'PST'
      case 'pet': return 'PET'
      case 'medical': return 'Medical'
      case 'document_verification': return 'Document Verification'
      default: return stage
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--text-main)] mb-2">Document Checklists</h1>
          <p className="font-bold text-[var(--text-muted)] text-sm uppercase tracking-widest">Manage document requirements for each stage</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--text-main)] text-white font-bold rounded-2xl hover:-translate-y-0.5 active:translate-y-1 shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Checklist Item
        </button>
      </div>

      {/* Compliance Overview */}
      {compliance && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="card-brilliant p-4 hover:-translate-y-1 transition-transform">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl border-2 border-blue-200">
                <FileText className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">PST Complete</p>
                <p className="text-2xl font-bold text-[var(--text-main)] mt-1">{compliance.pst_complete_percentage}%</p>
              </div>
            </div>
          </div>
          <div className="card-brilliant p-4 hover:-translate-y-1 transition-transform">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl border-2 border-green-200">
                <CheckCircle className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">PET Complete</p>
                <p className="text-2xl font-bold text-[var(--text-main)] mt-1">{compliance.pet_complete_percentage}%</p>
              </div>
            </div>
          </div>
          <div className="card-brilliant p-4 hover:-translate-y-1 transition-transform">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl border-2 border-purple-200">
                <Clock className="w-6 h-6 text-purple-700" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Medical Complete</p>
                <p className="text-2xl font-bold text-[var(--text-main)] mt-1">{compliance.medical_complete_percentage}%</p>
              </div>
            </div>
          </div>
          <div className="card-brilliant p-4 hover:-translate-y-1 transition-transform">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-xl border-2 border-orange-200">
                <AlertTriangle className="w-6 h-6 text-orange-700" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">DV Complete</p>
                <p className="text-2xl font-bold text-[var(--text-main)] mt-1">{compliance.dv_complete_percentage}%</p>
              </div>
            </div>
          </div>
          <div className="card-brilliant p-4 hover:-translate-y-1 transition-transform">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[var(--text-main)] rounded-xl border-2 border-gray-900 border-opacity-20 text-white">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Fully Complete</p>
                <p className="text-2xl font-bold text-[var(--text-main)] mt-1">{compliance.fully_complete_percentage}%</p>
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
              placeholder="Search checklists..."
              className="w-full pl-12 pr-4 py-3 border-2 border-[var(--border-light)] rounded-2xl focus:ring-4 focus:ring-[var(--brilliant-blue)] focus:ring-opacity-20 focus:border-[var(--brilliant-blue)] outline-none transition-all font-semibold text-[var(--text-main)]"
            />
          </div>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-4 py-3 border-2 border-[var(--border-light)] rounded-2xl focus:ring-4 focus:ring-[var(--brilliant-blue)] focus:ring-opacity-20 focus:border-[var(--brilliant-blue)] outline-none transition-all font-bold text-[var(--text-main)] cursor-pointer bg-white"
          >
            <option value="">All Stages</option>
            <option value="pst">PST</option>
            <option value="pet">PET</option>
            <option value="medical">Medical</option>
            <option value="document_verification">Document Verification</option>
          </select>
          <select
            value={requiredFilter}
            onChange={(e) => setRequiredFilter(e.target.value)}
            className="px-4 py-3 border-2 border-[var(--border-light)] rounded-2xl focus:ring-4 focus:ring-[var(--brilliant-blue)] focus:ring-opacity-20 focus:border-[var(--brilliant-blue)] outline-none transition-all font-bold text-[var(--text-main)] cursor-pointer bg-white"
          >
            <option value="">All Requirements</option>
            <option value="true">Required</option>
            <option value="false">Optional</option>
          </select>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
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

      {/* Checklists Table */}
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
        ) : checklists.length === 0 ? (
          <div className="text-center py-16 text-[var(--text-muted)] font-bold text-sm bg-gray-50/50 flex flex-col items-center">
            <p>No document checklists found</p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-6 py-3 bg-[var(--text-main)] text-white font-bold rounded-2xl hover:-translate-y-0.5 active:translate-y-1 shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none transition-all"
            >
              Create your first checklist item
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest bg-gray-50 border-b-2 border-[var(--border-light)]">
                  <th className="px-6 py-4">Document</th>
                  <th className="px-6 py-4">Stage</th>
                  <th className="px-6 py-4">Required</th>
                  <th className="px-6 py-4">Gender</th>
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[var(--border-light)]">
                {checklists.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-bold text-[var(--text-main)] text-[15px]">{item.title}</p>
                        {item.description && (
                          <p className="text-sm font-semibold text-[var(--text-muted)] mt-1 truncate max-w-xs">{item.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-block px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest rounded-lg border-2 ${getStageBadgeClass(item.stage)} border-opacity-30`}>
                        {getStageLabel(item.stage)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {item.is_required ? (
                        <span className="inline-block px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-widest rounded-lg border-2 bg-red-100 text-red-700 border-red-200">Required</span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-widest rounded-lg border-2 bg-gray-100 text-gray-600 border-gray-200">Optional</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-bold text-sm text-[var(--text-muted)] uppercase tracking-widest">
                        {item.is_required_for_all ? 'All' : (item.is_required_for_gender || 'All')}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-bold text-[var(--text-main)] text-center">{item.order_index}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openViewModal(item)}
                          className="p-3 border-2 border-transparent text-gray-400 hover:text-[var(--text-main)] hover:bg-gray-100 hover:border-[var(--border-light)] rounded-xl transition-all"
                          title="View"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-3 border-2 border-transparent text-gray-400 hover:text-[var(--brilliant-blue)] hover:bg-blue-50 hover:border-blue-200 rounded-xl transition-all"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
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
                {modalMode === 'create' && 'Create Document Checklist Item'}
                {modalMode === 'edit' && 'Edit Document Checklist Item'}
                {modalMode === 'view' && 'Document Checklist Details'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalMode === 'view' && selectedChecklist ? (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedChecklist.title}</h3>
                  <p className="text-gray-600 mt-1">{selectedChecklist.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Stage</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStageBadgeClass(selectedChecklist.stage)}`}>
                      {getStageLabel(selectedChecklist.stage)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Required</p>
                    <p className="text-gray-900">{selectedChecklist.is_required ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Accepted Formats</p>
                    <p className="text-gray-900">{selectedChecklist.accepted_formats}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Max File Size</p>
                    <p className="text-gray-900">{selectedChecklist.max_file_size_mb} MB</p>
                  </div>
                </div>

                {selectedChecklist.instructions && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Instructions</p>
                    <p className="text-gray-900">{selectedChecklist.instructions}</p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => openEditModal(selectedChecklist)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    Edit Item
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="e.g., 10th Marksheet"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Brief description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stage *
                    </label>
                    <select
                      value={formData.stage}
                      onChange={(e) => setFormData({ ...formData, stage: e.target.value as AdminDocumentChecklist['stage'] })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    >
                      <option value="pst">PST</option>
                      <option value="pet">PET</option>
                      <option value="medical">Medical</option>
                      <option value="document_verification">Document Verification</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Document Type
                    </label>
                    <input
                      type="text"
                      value={formData.document_type}
                      onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="e.g., marksheet"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Accepted Formats
                    </label>
                    <input
                      type="text"
                      value={formData.accepted_formats}
                      onChange={(e) => setFormData({ ...formData, accepted_formats: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="PDF,JPG,PNG,JPEG"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max File Size (MB)
                    </label>
                    <input
                      type="number"
                      value={formData.max_file_size_mb}
                      onChange={(e) => setFormData({ ...formData, max_file_size_mb: parseInt(e.target.value) || 5 })}
                      min={1}
                      max={50}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_required}
                      onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Required</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_required_for_all}
                      onChange={(e) => setFormData({ ...formData, is_required_for_all: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Required for All</span>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions
                  </label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Specific instructions for this document..."
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
                    {isSubmitting ? 'Saving...' : modalMode === 'create' ? 'Create Item' : 'Save Changes'}
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
