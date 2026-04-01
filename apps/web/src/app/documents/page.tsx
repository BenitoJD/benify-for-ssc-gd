'use client'

import { useEffect, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import {
  FileText,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Bell,
  Trash2,
  File,
  ChevronRight,
  Eye,
  X,
  Calendar,
  Stethoscope,
  AlertTriangle,
  Check,
} from 'lucide-react'
import { Sidebar } from '@/components/ui/Sidebar'
import { fetchCurrentUser } from '@/lib/auth'
import {
  type DocumentStage,
  type DocumentStatus,
  type DocumentChecklistItem,
  type UserDocumentStatus,
  type MedicalGuideline,
  type Reminder,
  getDocumentChecklists,
  getMyDocuments,
  uploadDocument,
  deleteDocument,
  getMedicalGuidelines,
  getMedicalSelfAssessment,
  submitSelfAssessment,
  setReminder,
  getMyReminders,
  deleteReminder,
  isAcceptedFileType,
  isAcceptedFileSize,
  formatFileSize,
  getDeadlineStatus,
  type MedicalSelfAssessment as MedicalSelfAssessmentType,
  type SelfAssessmentResponse,
} from '@/lib/api/documents'

type TabType = 'checklist' | 'guidelines' | 'self-assessment' | 'reminders'

interface UploadFormState {
  itemId: string | null
  file: File | null
  isUploading: boolean
  error: string | null
}

export default function DocumentsPage() {
  const t = useTranslations()
  const documentsT = useTranslations('documents')
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const locale: 'en' = 'en'
  const [activeTab, setActiveTab] = useState<TabType>('checklist')
  
  // Document states
  const [currentStage, setCurrentStage] = useState<DocumentStage>('new_application')
  const [checklistItems, setChecklistItems] = useState<DocumentChecklistItem[]>([])
  const [userDocuments, setUserDocuments] = useState<UserDocumentStatus[]>([])
  const [isLoadingDocs, setIsLoadingDocs] = useState(false)
  
  // Upload states
  const [uploadForm, setUploadForm] = useState<UploadFormState>({
    itemId: null,
    file: null,
    isUploading: false,
    error: null,
  })
  
  // Medical guidelines states
  const [guidelines, setGuidelines] = useState<MedicalGuideline[]>([])
  const [selfAssessmentQuestions, setSelfAssessmentQuestions] = useState<MedicalSelfAssessmentType[]>([])
  const [selfAssessmentResponses, setSelfAssessmentResponses] = useState<Record<string, boolean>>({})
  const [selfAssessmentResult, setSelfAssessmentResult] = useState<{
    has_disqualifications: boolean
    disqualification_reasons: string[]
    can_proceed: boolean
  } | null>(null)
  
  // Reminder states
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [reminderForm, setReminderForm] = useState({
    itemId: '',
    reminderDate: '',
    reminderType: 'in_app' as 'email' | 'in_app' | 'both',
  })
  
  // Error/success states
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await fetchCurrentUser()
        if (!user) {
          router.push('/login')
          return
        }
      } catch {
        router.push('/login')
        return
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Load document data
  const loadDocumentData = useCallback(async () => {
    setIsLoadingDocs(true)
    try {
      const [checklists, docsData] = await Promise.all([
        getDocumentChecklists(currentStage),
        getMyDocuments(),
      ])
      setChecklistItems(checklists)
      setUserDocuments(docsData.documents)
    } catch (error) {
      console.error('Failed to load documents:', error)
    } finally {
      setIsLoadingDocs(false)
    }
  }, [currentStage])

  useEffect(() => {
    if (!isLoading) {
      loadDocumentData()
    }
  }, [isLoading, loadDocumentData])

  // Load medical data
  useEffect(() => {
    if (!isLoading && activeTab === 'guidelines') {
      getMedicalGuidelines()
        .then(setGuidelines)
        .catch(err => console.error('Failed to load guidelines:', err))
    }
    if (!isLoading && activeTab === 'self-assessment') {
      Promise.all([
        getMedicalSelfAssessment(),
        getMyReminders(),
      ]).then(([questions, reminderData]) => {
        setSelfAssessmentQuestions(questions)
        setReminders(reminderData)
      }).catch(err => console.error('Failed to load self-assessment:', err))
    }
    if (!isLoading && activeTab === 'reminders') {
      getMyReminders()
        .then(setReminders)
        .catch(err => console.error('Failed to load reminders:', err))
    }
  }, [isLoading, activeTab])

  const stages: { id: DocumentStage; label: string }[] = [
    { id: 'new_application', label: documentsT('stages.newApplication') },
    { id: 'admit_card_released', label: documentsT('stages.admitCardReleased') },
    { id: 'dv_scheduled', label: documentsT('stages.dvScheduled') },
  ]

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800'
      case 'uploaded':
      case 'under_verification':
        return 'bg-blue-100 text-blue-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="w-4 h-4" />
      case 'uploaded':
      case 'under_verification':
        return <Clock className="w-4 h-4" />
      case 'rejected':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getUserDocumentStatus = (itemId: string): UserDocumentStatus | undefined => {
    return userDocuments.find(d => d.checklist_item_id === itemId)
  }

  const handleFileSelect = (itemId: string, file: File) => {
    const item = checklistItems.find(i => i.id === itemId)
    if (!item) return

    if (!isAcceptedFileType(file, item.accepted_formats)) {
      setUploadForm({
        itemId,
        file: null,
        isUploading: false,
        error: t('documents.upload.errors.invalidType', {
          types: item.accepted_formats,
        }),
      })
      return
    }

    if (!isAcceptedFileSize(file, item.max_file_size_mb)) {
      setUploadForm({
        itemId,
        file: null,
        isUploading: false,
        error: t('documents.upload.errors.fileTooLarge', {
          maxSize: item.max_file_size_mb,
        }),
      })
      return
    }

    setUploadForm({
      itemId,
      file,
      isUploading: false,
      error: null,
    })
  }

  const handleUpload = async (itemId: string) => {
    const file = uploadForm.file
    if (!file) return

    setUploadForm(prev => ({ ...prev, isUploading: true, error: null }))

    try {
      await uploadDocument(itemId, file)
      setSuccessMessage(t('documents.upload.success'))
      setUploadForm({ itemId: null, file: null, isUploading: false, error: null })
      await loadDocumentData()
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      setUploadForm(prev => ({
        ...prev,
        isUploading: false,
        error: t('documents.upload.errors.uploadFailed'),
      }))
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await deleteDocument(documentId)
      setSuccessMessage(t('documents.delete.success'))
      await loadDocumentData()
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      console.error('Failed to delete document:', error)
    }
  }

  const handleSetReminder = async () => {
    if (!reminderForm.itemId || !reminderForm.reminderDate) return

    try {
      await setReminder(
        reminderForm.itemId,
        reminderForm.reminderDate,
        reminderForm.reminderType
      )
      setShowReminderModal(false)
      setReminderForm({ itemId: '', reminderDate: '', reminderType: 'in_app' })
      setSuccessMessage(t('documents.reminder.setSuccess'))
      const updatedReminders = await getMyReminders()
      setReminders(updatedReminders)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      console.error('Failed to set reminder:', error)
    }
  }

  const handleDeleteReminder = async (reminderId: string) => {
    try {
      await deleteReminder(reminderId)
      const updatedReminders = await getMyReminders()
      setReminders(updatedReminders)
      setSuccessMessage(t('documents.reminder.deleteSuccess'))
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      console.error('Failed to delete reminder:', error)
    }
  }

  const handleSelfAssessmentSubmit = async () => {
    const responses: SelfAssessmentResponse[] = Object.entries(selfAssessmentResponses).map(
      ([questionId, answer]) => ({
        id: '',
        question_id: questionId,
        answer,
      })
    )

    try {
      const result = await submitSelfAssessment(responses)
      setSelfAssessmentResult(result)
    } catch (error) {
      console.error('Failed to submit self-assessment:', error)
    }
  }

  // Calculate overall completion percentage
  const calculateCompletion = () => {
    const requiredDocs = checklistItems.filter(item => item.is_required)
    if (requiredDocs.length === 0) return 0
    
    const completedCount = requiredDocs.filter(item => {
      const userDoc = getUserDocumentStatus(item.id)
      return userDoc?.status === 'verified'
    }).length
    
    return Math.round((completedCount / requiredDocs.length) * 100)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  const tabs = [
    { id: 'checklist' as const, label: t('documents.tabs.checklist'), icon: FileText },
    { id: 'guidelines' as const, label: t('documents.tabs.guidelines'), icon: Stethoscope },
    { id: 'self-assessment' as const, label: t('documents.tabs.selfAssessment'), icon: AlertTriangle },
    { id: 'reminders' as const, label: t('documents.tabs.reminders'), icon: Bell },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <div className="text-xl font-bold text-primary-600">
              {t('documents.title')}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <Sidebar locale={locale} />
        
        {/* Main Content */}
        <main className="flex-1 lg:ml-0 p-4 lg:p-8 pt-16 lg:pt-8">
          <div className="max-w-7xl mx-auto">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
                <Check className="w-5 h-5" />
                {successMessage}
              </div>
            )}

            {/* Completion Progress */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{t('documents.overallProgress')}</h2>
                <span className="text-2xl font-bold text-primary-600">{calculateCompletion()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${calculateCompletion()}%` }}
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
                      activeTab === tab.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Checklist Tab */}
            {activeTab === 'checklist' && (
              <div className="space-y-6">
                {/* Stage Selector */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex gap-2">
                    {stages.map((stage) => (
                      <button
                        key={stage.id}
                        onClick={() => setCurrentStage(stage.id)}
                        className={`px-4 py-2 rounded-lg transition ${
                          currentStage === stage.id
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {stage.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Checklist Items */}
                {isLoadingDocs ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {checklistItems.map((item) => {
                      const userDoc = getUserDocumentStatus(item.id)
                      const deadlineStatus = getDeadlineStatus(userDoc?.deadline || null)
                      const isUploadingThis = uploadForm.itemId === item.id

                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-xl p-6 shadow-sm"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{item.title}</h3>
                                {item.is_required && (
                                  <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded">
                                    {t('documents.required')}
                                  </span>
                                )}
                                {item.is_required_for_gender && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                                    {item.is_required_for_gender === 'male' 
                                      ? t('documents.maleOnly')
                                      : t('documents.femaleOnly')}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm mb-3">
                                {item.description}
                              </p>
                              
                              {/* Instructions */}
                              {item.instructions && (
                                <p className="text-gray-500 text-xs mb-3 bg-gray-50 p-2 rounded">
                                  {item.instructions}
                                </p>
                              )}

                              {/* Accepted formats and size */}
                              <div className="flex gap-4 text-xs text-gray-500 mb-3">
                                <span>
                                  {t('documents.upload.acceptedFormats')}: {item.accepted_formats}
                                </span>
                                <span>
                                  {t('documents.upload.maxSize')}: {item.max_file_size_mb}MB
                                </span>
                              </div>

                              {/* Deadline Warning */}
                              {userDoc?.deadline && deadlineStatus.is_warning && (
                                <div className="flex items-center gap-2 text-amber-600 text-sm mb-3">
                                  <Clock className="w-4 h-4" />
                                  <span>
                                    {t('documents.deadlineWarning', {
                                      days: deadlineStatus.days_remaining,
                                    })}
                                  </span>
                                </div>
                              )}

                              {/* Status */}
                              {userDoc && (
                                <div className="flex items-center gap-2 mb-3">
                                  <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${getStatusColor(userDoc.status)}`}>
                                    {getStatusIcon(userDoc.status)}
                                    {t(`documents.status.${userDoc.status}`)}
                                  </span>
                                  {userDoc.original_filename && (
                                    <span className="text-sm text-gray-500">
                                      {userDoc.original_filename}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Rejection Reason */}
                              {userDoc?.status === 'rejected' && userDoc.rejection_reason && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-3">
                                  <strong>{t('documents.rejectionReason')}:</strong> {userDoc.rejection_reason}
                                </div>
                              )}

                              {/* Upload Area */}
                              {(!userDoc || userDoc.status === 'pending' || userDoc.status === 'rejected') && (
                                <div className="space-y-3">
                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-500 transition">
                                    <input
                                      type="file"
                                      id={`file-${item.id}`}
                                      className="hidden"
                                      accept={item.accepted_formats}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) handleFileSelect(item.id, file)
                                      }}
                                    />
                                    <label
                                      htmlFor={`file-${item.id}`}
                                      className="cursor-pointer flex flex-col items-center"
                                    >
                                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                      <span className="text-sm text-gray-600">
                                        {t('documents.upload.clickToUpload')}
                                      </span>
                                    </label>
                                  </div>

                                  {/* Selected File */}
                                  {isUploadingThis && uploadForm.file && (
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                      <div className="flex items-center gap-2">
                                        <File className="w-5 h-5 text-gray-500" />
                                        <span className="text-sm">
                                          {uploadForm.file.name}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          ({formatFileSize(uploadForm.file.size)})
                                        </span>
                                      </div>
                                      <button
                                        onClick={() => setUploadForm({ itemId: null, file: null, isUploading: false, error: null })}
                                        className="text-gray-400 hover:text-gray-600"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}

                                  {/* Upload Error */}
                                  {isUploadingThis && uploadForm.error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                                      <AlertCircle className="w-4 h-4" />
                                      {uploadForm.error}
                                    </div>
                                  )}

                                  {/* Upload Button */}
                                  {isUploadingThis && uploadForm.file && (
                                    <button
                                      onClick={() => handleUpload(item.id)}
                                      disabled={uploadForm.isUploading}
                                      className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                                    >
                                      {uploadForm.isUploading ? (
                                        <>
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                          {t('documents.upload.uploading')}
                                        </>
                                      ) : (
                                        <>
                                          <Upload className="w-4 h-4" />
                                          {t('documents.upload.submit')}
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                              )}

                              {/* View/Delete Buttons for uploaded documents */}
                              {userDoc?.uploaded_file_url && userDoc.status !== 'rejected' && (
                                <div className="flex gap-3 mt-3">
                                  <a
                                    href={userDoc.uploaded_file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                                  >
                                    <Eye className="w-4 h-4" />
                                    {t('documents.viewDocument')}
                                  </a>
                                  <button
                                    onClick={() => handleDeleteDocument(userDoc.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    {t('documents.replaceDocument')}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {checklistItems.length === 0 && (
                      <div className="bg-white rounded-xl p-12 text-center">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">{t('documents.noDocuments')}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Guidelines Tab */}
            {activeTab === 'guidelines' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Stethoscope className="w-6 h-6 text-primary-600" />
                    {t('documents.medicalGuidelines.title')}
                  </h2>
                  
                  {/* Vision Standards */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-primary-700">
                      {t('documents.medicalGuidelines.vision.title')}
                    </h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">{t('documents.medicalGuidelines.vision.nearVision')}</h4>
                        <p className="text-sm text-gray-600">
                          {t('documents.medicalGuidelines.vision.nearVisionDesc')}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">{t('documents.medicalGuidelines.vision.distanceVision')}</h4>
                        <p className="text-sm text-gray-600">
                          {t('documents.medicalGuidelines.vision.distanceVisionDesc')}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">{t('documents.medicalGuidelines.vision.colorVision')}</h4>
                        <p className="text-sm text-gray-600">
                          {t('documents.medicalGuidelines.vision.colorVisionDesc')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Physical Fitness */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-primary-700">
                      {t('documents.medicalGuidelines.physical.title')}
                    </h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">{t('documents.medicalGuidelines.physical.bloodPressure')}</h4>
                        <p className="text-sm text-gray-600">
                          {t('documents.medicalGuidelines.physical.bloodPressureDesc')}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">{t('documents.medicalGuidelines.physical.ear')}</h4>
                        <p className="text-sm text-gray-600">
                          {t('documents.medicalGuidelines.physical.earDesc')}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">{t('documents.medicalGuidelines.physical.skin')}</h4>
                        <p className="text-sm text-gray-600">
                          {t('documents.medicalGuidelines.physical.skinDesc')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Common Rejections */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-red-600 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      {t('documents.medicalGuidelines.commonRejections.title')}
                    </h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-medium mb-2 text-red-700">
                          {t('documents.medicalGuidelines.commonRejections.item1.title')}
                        </h4>
                        <p className="text-sm text-red-600">
                          {t('documents.medicalGuidelines.commonRejections.item1.desc')}
                        </p>
                      </div>
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-medium mb-2 text-red-700">
                          {t('documents.medicalGuidelines.commonRejections.item2.title')}
                        </h4>
                        <p className="text-sm text-red-600">
                          {t('documents.medicalGuidelines.commonRejections.item2.desc')}
                        </p>
                      </div>
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-medium mb-2 text-red-700">
                          {t('documents.medicalGuidelines.commonRejections.item3.title')}
                        </h4>
                        <p className="text-sm text-red-600">
                          {t('documents.medicalGuidelines.commonRejections.item3.desc')}
                        </p>
                      </div>
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-medium mb-2 text-red-700">
                          {t('documents.medicalGuidelines.commonRejections.item4.title')}
                        </h4>
                        <p className="text-sm text-red-600">
                          {t('documents.medicalGuidelines.commonRejections.item4.desc')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Self Assessment Tab */}
            {activeTab === 'self-assessment' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-primary-600" />
                    {t('documents.selfAssessment.title')}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {t('documents.selfAssessment.description')}
                  </p>

                  {selfAssessmentResult ? (
                    <div className={`p-6 rounded-xl ${
                      selfAssessmentResult.has_disqualifications
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-green-50 border border-green-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-4">
                        {selfAssessmentResult.has_disqualifications ? (
                          <XCircle className="w-8 h-8 text-red-600" />
                        ) : (
                          <CheckCircle2 className="w-8 h-8 text-green-600" />
                        )}
                        <h3 className={`text-lg font-semibold ${
                          selfAssessmentResult.has_disqualifications ? 'text-red-700' : 'text-green-700'
                        }`}>
                          {selfAssessmentResult.has_disqualifications
                            ? t('documents.selfAssessment.disqualified')
                            : t('documents.selfAssessment.qualified')}
                        </h3>
                      </div>
                      
                      {selfAssessmentResult.disqualification_reasons.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-red-700">
                            {t('documents.selfAssessment.reasons')}:
                          </h4>
                          <ul className="list-disc list-inside text-red-600">
                            {selfAssessmentResult.disqualification_reasons.map((reason, idx) => (
                              <li key={idx}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selfAssessmentQuestions.map((question, idx) => (
                        <div key={question.id} className="p-4 bg-gray-50 rounded-lg">
                          <p className="font-medium mb-3">
                            {idx + 1}. {question.question}
                          </p>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                checked={selfAssessmentResponses[question.id] === true}
                                onChange={() => setSelfAssessmentResponses(prev => ({
                                  ...prev,
                                  [question.id]: true,
                                }))}
                                className="w-4 h-4 text-primary-600"
                              />
                              <span>{t('documents.selfAssessment.yes')}</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                checked={selfAssessmentResponses[question.id] === false}
                                onChange={() => setSelfAssessmentResponses(prev => ({
                                  ...prev,
                                  [question.id]: false,
                                }))}
                                className="w-4 h-4 text-primary-600"
                              />
                              <span>{t('documents.selfAssessment.no')}</span>
                            </label>
                          </div>
                        </div>
                      ))}

                      {selfAssessmentQuestions.length > 0 && (
                        <button
                          onClick={handleSelfAssessmentSubmit}
                          disabled={Object.keys(selfAssessmentResponses).length !== selfAssessmentQuestions.length}
                          className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition"
                        >
                          {t('documents.selfAssessment.submit')}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reminders Tab */}
            {activeTab === 'reminders' && (
              <div className="space-y-6">
                {/* Set Reminder Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">{t('documents.reminder.setReminder')}</h2>
                    <button
                      onClick={() => setShowReminderModal(true)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
                    >
                      <Bell className="w-4 h-4" />
                      {t('documents.reminder.add')}
                    </button>
                  </div>

                  {/* Reminder List */}
                  <div className="space-y-3">
                    {reminders.map((reminder) => {
                      const item = checklistItems.find(i => i.id === reminder.document_item_id)
                      return (
                        <div
                          key={reminder.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-primary-600" />
                            <div>
                              <p className="font-medium">{item?.title || t('documents.reminder.unknownDocument')}</p>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(reminder.reminder_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 text-xs rounded ${
                              reminder.is_sent
                                ? 'bg-green-100 text-green-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {reminder.is_sent ? t('documents.reminder.sent') : t('documents.reminder.pending')}
                            </span>
                            <button
                              onClick={() => handleDeleteReminder(reminder.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}

                    {reminders.length === 0 && (
                      <p className="text-center text-gray-500 py-8">
                        {t('documents.reminder.noReminders')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('documents.reminder.setReminder')}</h3>
              <button
                onClick={() => setShowReminderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('documents.reminder.selectDocument')}
                </label>
                <select
                  value={reminderForm.itemId}
                  onChange={(e) => setReminderForm(prev => ({ ...prev, itemId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">{t('documents.reminder.selectDocumentPlaceholder')}</option>
                  {checklistItems.map((item) => (
                    <option key={item.id} value={item.id}>{item.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('documents.reminder.reminderDate')}
                </label>
                <input
                  type="date"
                  value={reminderForm.reminderDate}
                  onChange={(e) => setReminderForm(prev => ({ ...prev, reminderDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('documents.reminder.reminderType')}
                </label>
                <div className="flex gap-4">
                  {(['in_app', 'email', 'both'] as const).map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="reminderType"
                        checked={reminderForm.reminderType === type}
                        onChange={() => setReminderForm(prev => ({ ...prev, reminderType: type }))}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span>{t(`documents.reminder.types.${type}`)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowReminderModal(false)}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleSetReminder}
                  disabled={!reminderForm.itemId || !reminderForm.reminderDate}
                  className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition"
                >
                  {t('documents.reminder.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
