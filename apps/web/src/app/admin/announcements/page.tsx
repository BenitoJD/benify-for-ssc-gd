'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Send,
  AlertTriangle,
  AlertCircle,
  Info,
  Bell
} from 'lucide-react'
import {
  adminApi,
  AdminAnnouncement,
  AdminAnnouncementCreateDTO,
} from '@/lib/api/admin'

type ModalMode = 'create' | 'edit' | 'view' | null

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [targetFilter, setTargetFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('')

  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AdminAnnouncement | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState<AdminAnnouncementCreateDTO>({
    title: '',
    content: '',
    priority: 'normal',
    target: 'all',
    start_date: undefined,
    end_date: undefined
  })

  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await adminApi.listAnnouncements({
        priority: priorityFilter || undefined,
        target: targetFilter || undefined,
        is_active: activeFilter === '' ? undefined : activeFilter === 'true'
      })
      setAnnouncements(response)
    } catch (err) {
      setError('Failed to load announcements')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [priorityFilter, targetFilter, activeFilter])

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  const openCreateModal = () => {
    setFormData({
      title: '',
      content: '',
      priority: 'normal',
      target: 'all',
      start_date: undefined,
      end_date: undefined
    })
    setSelectedAnnouncement(null)
    setModalMode('create')
  }

  const openEditModal = (announcement: AdminAnnouncement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      target: announcement.target,
      start_date: announcement.start_date,
      end_date: announcement.end_date
    })
    setSelectedAnnouncement(announcement)
    setModalMode('edit')
  }

  const openViewModal = (announcement: AdminAnnouncement) => {
    setSelectedAnnouncement(announcement)
    setModalMode('view')
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedAnnouncement(null)
    setIsSubmitting(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      if (modalMode === 'create') {
        await adminApi.createAnnouncement(formData)
      } else if (modalMode === 'edit' && selectedAnnouncement) {
        await adminApi.updateAnnouncement(selectedAnnouncement.id, formData)
      }
      closeModal()
      fetchAnnouncements()
    } catch (err) {
      console.error('Failed to save announcement:', err)
      alert('Failed to save announcement. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (announcement: AdminAnnouncement) => {
    if (!confirm(`Are you sure you want to delete "${announcement.title}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      await adminApi.deleteAnnouncement(announcement.id)
      fetchAnnouncements()
    } catch {
      alert('Failed to delete announcement. Please try again.')
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'high': return <AlertCircle className="w-4 h-4 text-orange-600" />
      case 'normal': return <Info className="w-4 h-4 text-blue-600" />
      case 'low': return <Bell className="w-4 h-4 text-gray-600" />
      default: return <Info className="w-4 h-4 text-blue-600" />
    }
  }

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700'
      case 'high': return 'bg-orange-100 text-orange-700'
      case 'normal': return 'bg-blue-100 text-blue-700'
      case 'low': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTargetLabel = (target: string) => {
    switch (target) {
      case 'all': return 'All Users'
      case 'male': return 'Male Only'
      case 'female': return 'Female Only'
      case 'premium': return 'Premium Users'
      case 'free': return 'Free Users'
      default: return target
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--text-main)] mb-2">Announcements</h1>
          <p className="font-bold text-[var(--text-muted)] text-sm uppercase tracking-widest">Broadcast notifications to users</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--text-main)] text-white font-bold rounded-2xl hover:-translate-y-0.5 active:translate-y-1 shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Announcement
        </button>
      </div>

      {/* Filters */}
      <div className="card-brilliant p-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-3 border-2 border-[var(--border-light)] rounded-2xl focus:ring-4 focus:ring-[var(--brilliant-blue)] focus:ring-opacity-20 focus:border-[var(--brilliant-blue)] outline-none transition-all font-bold text-[var(--text-main)] cursor-pointer bg-white"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
          <select
            value={targetFilter}
            onChange={(e) => setTargetFilter(e.target.value)}
            className="px-4 py-3 border-2 border-[var(--border-light)] rounded-2xl focus:ring-4 focus:ring-[var(--brilliant-blue)] focus:ring-opacity-20 focus:border-[var(--brilliant-blue)] outline-none transition-all font-bold text-[var(--text-main)] cursor-pointer bg-white"
          >
            <option value="">All Targets</option>
            <option value="all">All Users</option>
            <option value="male">Male Only</option>
            <option value="female">Female Only</option>
            <option value="premium">Premium Only</option>
            <option value="free">Free Only</option>
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
        </div>
      </div>

      {/* Announcements List */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="card-brilliant flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-black" />
          </div>
        ) : error ? (
          <div className="card-brilliant p-6">
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl text-sm font-bold">
              {error}
            </div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="card-brilliant text-center py-16 text-[var(--text-muted)] font-bold text-sm bg-gray-50/50 flex flex-col items-center">
            <p>No announcements found</p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-6 py-3 bg-[var(--text-main)] text-white font-bold rounded-2xl hover:-translate-y-0.5 active:translate-y-1 shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none transition-all"
            >
              Create your first announcement
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="card-brilliant p-6 hover:-translate-y-1 transition-transform cursor-default">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getPriorityIcon(announcement.priority)}
                      <h3 className="text-xl font-bold text-[var(--text-main)]">{announcement.title}</h3>
                      <span className={`px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest rounded-lg border-2 ${
                        announcement.priority === 'urgent' ? 'bg-red-100 text-red-700 border-red-200' :
                        announcement.priority === 'high' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                        announcement.priority === 'normal' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        {announcement.priority}
                      </span>
                      {announcement.is_active ? (
                        <span className="px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest rounded-lg border-2 bg-green-100 text-green-700 border-green-200">Active</span>
                      ) : (
                        <span className="px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest rounded-lg border-2 bg-gray-100 text-gray-700 border-gray-200">Inactive</span>
                      )}
                    </div>
                    <p className="text-[var(--text-muted)] font-medium mb-4 whitespace-pre-wrap">{announcement.content}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-gray-500 bg-gray-50 p-3 rounded-xl border-2 border-[var(--border-light)] w-max">
                      <span className="flex items-center gap-1"><Info className="w-4 h-4"/> Target: {getTargetLabel(announcement.target)}</span>
                      {announcement.start_date && (
                        <span>Starts: {new Date(announcement.start_date).toLocaleDateString()}</span>
                      )}
                      {announcement.end_date && (
                        <span>Ends: {new Date(announcement.end_date).toLocaleDateString()}</span>
                      )}
                      <span>By: {announcement.admin_name || 'Admin'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 self-center">
                    <button
                      onClick={() => openViewModal(announcement)}
                      className="p-3 border-2 border-transparent text-gray-400 hover:text-[var(--text-main)] hover:bg-gray-100 hover:border-[var(--border-light)] rounded-xl transition-all"
                      title="View"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => openEditModal(announcement)}
                      className="p-3 border-2 border-transparent text-gray-400 hover:text-[var(--brilliant-blue)] hover:bg-blue-50 hover:border-blue-200 rounded-xl transition-all"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement)}
                      className="p-3 border-2 border-transparent text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card-brilliant max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === 'create' && 'Create Announcement'}
                {modalMode === 'edit' && 'Edit Announcement'}
                {modalMode === 'view' && 'Announcement Details'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalMode === 'view' && selectedAnnouncement ? (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedAnnouncement.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadgeClass(selectedAnnouncement.priority)}`}>
                      {selectedAnnouncement.priority}
                    </span>
                    <span className="text-sm text-gray-500">
                      Target: {getTargetLabel(selectedAnnouncement.target)}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedAnnouncement.content}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Created By</p>
                    <p className="text-gray-900">{selectedAnnouncement.admin_name || 'Admin'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className="text-gray-900">{selectedAnnouncement.is_active ? 'Active' : 'Inactive'}</p>
                  </div>
                  {selectedAnnouncement.start_date && (
                    <div>
                      <p className="text-gray-500">Start Date</p>
                      <p className="text-gray-900">{new Date(selectedAnnouncement.start_date).toLocaleString()}</p>
                    </div>
                  )}
                  {selectedAnnouncement.end_date && (
                    <div>
                      <p className="text-gray-500">End Date</p>
                      <p className="text-gray-900">{new Date(selectedAnnouncement.end_date).toLocaleString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-500">Created At</p>
                    <p className="text-gray-900">{new Date(selectedAnnouncement.created_at).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => openEditModal(selectedAnnouncement)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    Edit Announcement
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Announcement title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Announcement content..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority *
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as AdminAnnouncement['priority'] })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Audience *
                    </label>
                    <select
                      value={formData.target}
                      onChange={(e) => setFormData({ ...formData, target: e.target.value as AdminAnnouncement['target'] })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    >
                      <option value="all">All Users</option>
                      <option value="male">Male Only</option>
                      <option value="female">Female Only</option>
                      <option value="premium">Premium Users Only</option>
                      <option value="free">Free Users Only</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date (optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.start_date || ''}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value || undefined })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date (optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.end_date || ''}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value || undefined })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>

                {formData.priority === 'urgent' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-medium">Urgent Priority</span>
                    </div>
                    <p className="text-sm text-red-600 mt-1">
                      This announcement will be sent immediately to all target users.
                    </p>
                  </div>
                )}

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
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      'Sending...'
                    ) : modalMode === 'create' ? (
                      <>
                        <Send className="w-4 h-4" />
                        Create & Broadcast
                      </>
                    ) : (
                      'Save Changes'
                    )}
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
