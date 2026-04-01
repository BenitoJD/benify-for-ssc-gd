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
  Trash2,
  File,
  ChevronRight,
  Eye,
  X,
  Stethoscope,
  Check,
} from 'lucide-react'
import { Sidebar } from '@/components/ui/Sidebar'
import { fetchCurrentUser } from '@/lib/auth'
import {
  type DocumentStage,
  type DocumentStatus,
  type DocumentChecklistItem,
  type UserDocumentStatus,
  getDocumentChecklists,
  getMyDocuments,
  uploadDocument,
  deleteDocument,
  isAcceptedFileType,
  isAcceptedFileSize,
  formatFileSize,
  getDeadlineStatus,
} from '@/lib/api/documents'

type TabType = 'checklist' | 'guidelines'

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
  const locale = 'en' as const
  const [activeTab, setActiveTab] = useState<TabType>('checklist')
  const [currentStage, setCurrentStage] = useState<DocumentStage>('new_application')
  const [checklistItems, setChecklistItems] = useState<DocumentChecklistItem[]>([])
  const [userDocuments, setUserDocuments] = useState<UserDocumentStatus[]>([])
  const [isLoadingDocs, setIsLoadingDocs] = useState(false)
  const [uploadForm, setUploadForm] = useState<UploadFormState>({
    itemId: null,
    file: null,
    isUploading: false,
    error: null,
  })
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

  const stages: { id: DocumentStage; label: string }[] = [
    { id: 'new_application', label: documentsT('stages.newApplication') },
    { id: 'admit_card_released', label: documentsT('stages.admitCardReleased') },
    { id: 'dv_scheduled', label: documentsT('stages.dvScheduled') },
  ]

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
    return userDocuments.find((document) => document.checklist_item_id === itemId)
  }

  const handleFileSelect = (itemId: string, file: File) => {
    const item = checklistItems.find((entry) => entry.id === itemId)
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

    setUploadForm((prev) => ({ ...prev, isUploading: true, error: null }))

    try {
      await uploadDocument(itemId, file)
      setSuccessMessage(t('documents.upload.success'))
      setUploadForm({ itemId: null, file: null, isUploading: false, error: null })
      await loadDocumentData()
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch {
      setUploadForm((prev) => ({
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

  const calculateCompletion = () => {
    const requiredDocs = checklistItems.filter((item) => item.is_required)
    if (requiredDocs.length === 0) return 0

    const completedCount = requiredDocs.filter((item) => {
      const userDoc = getUserDocumentStatus(item.id)
      return userDoc?.status === 'verified'
    }).length

    return Math.round((completedCount / requiredDocs.length) * 100)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#111827]" />
      </div>
    )
  }

  const tabs = [
    { id: 'checklist' as const, label: t('documents.tabs.checklist'), icon: FileText },
    { id: 'guidelines' as const, label: t('documents.tabs.guidelines'), icon: Stethoscope },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="bg-white border-b border-[#EAEAEA] sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-[#6B7280] hover:text-[#111827] p-1.5 hover:bg-[#FAFAFA] rounded-full transition-colors"
              aria-label="Back to dashboard"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <div className="text-[15px] font-semibold tracking-tight text-[#111827]">
              {t('documents.title')}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <Sidebar locale={locale} />

        <main className="flex-1 lg:ml-0 p-4 lg:p-8 pt-16 lg:pt-8">
          <div className="max-w-7xl mx-auto">
            {successMessage && (
              <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-[8px] flex items-center gap-2 text-green-800 text-sm font-medium">
                <Check className="w-4 h-4" />
                {successMessage}
              </div>
            )}

            <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-6 shadow-sm mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[15px] font-semibold tracking-tight text-[#111827]">{t('documents.overallProgress')}</h2>
                <span className="text-xl font-bold tracking-tight text-[#111827]">{calculateCompletion()}%</span>
              </div>
              <div className="w-full bg-[#EAEAEA] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#111827] h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${calculateCompletion()}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-[8px] text-sm font-medium whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#111827] text-white shadow-sm'
                        : 'bg-white border border-[#EAEAEA] text-[#6B7280] hover:bg-[#FAFAFA] hover:text-[#111827]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {activeTab === 'checklist' && (
              <div className="space-y-6">
                <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-4 shadow-sm">
                  <div className="flex gap-2">
                    {stages.map((stage) => (
                      <button
                        key={stage.id}
                        onClick={() => setCurrentStage(stage.id)}
                        className={`px-4 py-2 rounded-[8px] text-sm font-medium transition-all ${
                          currentStage === stage.id
                            ? 'bg-[#111827] text-white'
                            : 'bg-[#FAFAFA] border border-[#EAEAEA] text-[#6B7280] hover:text-[#111827]'
                        }`}
                      >
                        {stage.label}
                      </button>
                    ))}
                  </div>
                </div>

                {isLoadingDocs ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#111827]" />
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
                          className="bg-white border border-[#EAEAEA] rounded-[12px] p-6 shadow-sm hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-[15px] tracking-tight text-[#111827]">{item.title}</h3>
                                {item.is_required && (
                                  <span className="px-2 py-0.5 bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold uppercase tracking-wider rounded-[4px]">
                                    {t('documents.required')}
                                  </span>
                                )}
                              </div>
                              <p className="text-[#6B7280] text-sm mb-3">{item.description}</p>

                              {item.instructions && (
                                <p className="text-[#9CA3AF] text-xs mb-3 bg-[#FAFAFA] border border-[#EAEAEA] p-3 rounded-[6px]">
                                  {item.instructions}
                                </p>
                              )}

                              <div className="flex gap-4 text-xs text-[#9CA3AF] font-medium mb-3">
                                <span>{t('documents.upload.acceptedFormats')}: {item.accepted_formats}</span>
                                <span>{t('documents.upload.maxSize')}: {item.max_file_size_mb}MB</span>
                              </div>

                              {userDoc?.deadline && deadlineStatus.is_warning && (
                                <div className="flex items-center gap-2 text-amber-600 text-sm mb-3">
                                  <Clock className="w-4 h-4" />
                                  <span>{t('documents.deadlineWarning', { days: deadlineStatus.days_remaining })}</span>
                                </div>
                              )}

                              {userDoc && (
                                <div className="flex items-center gap-2 mb-3">
                                  <span className={`px-3 py-1 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 border ${
                                    userDoc.status === 'verified' ? 'bg-green-50 border-green-200 text-green-700' :
                                    userDoc.status === 'rejected' ? 'bg-red-50 border-red-200 text-red-700' :
                                    'bg-[#FAFAFA] border-[#EAEAEA] text-[#6B7280]'
                                  }`}>
                                    {getStatusIcon(userDoc.status)}
                                    {t(`documents.status.${userDoc.status}`)}
                                  </span>
                                  {userDoc.original_filename && (
                                    <span className="text-xs text-[#9CA3AF] font-medium">{userDoc.original_filename}</span>
                                  )}
                                </div>
                              )}

                              {userDoc?.status === 'rejected' && userDoc.rejection_reason && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-[8px] text-red-700 text-sm mb-3">
                                  <strong>{t('documents.rejectionReason')}:</strong> {userDoc.rejection_reason}
                                </div>
                              )}

                              {(!userDoc || userDoc.status === 'pending' || userDoc.status === 'rejected') && (
                                <div className="space-y-3">
                                  <div className="border-2 border-dashed border-[#EAEAEA] rounded-[8px] p-5 text-center hover:border-[#111827] transition-colors cursor-pointer">
                                    <input
                                      type="file"
                                      id={`file-${item.id}`}
                                      className="hidden"
                                      accept={item.accepted_formats}
                                      onChange={(event) => {
                                        const file = event.target.files?.[0]
                                        if (file) handleFileSelect(item.id, file)
                                      }}
                                    />
                                    <label htmlFor={`file-${item.id}`} className="cursor-pointer flex flex-col items-center">
                                      <Upload className="w-6 h-6 text-[#9CA3AF] mb-2" />
                                      <span className="text-sm text-[#6B7280] font-medium">
                                        {t('documents.upload.clickToUpload')}
                                      </span>
                                    </label>
                                  </div>

                                  {isUploadingThis && uploadForm.file && (
                                    <div className="flex items-center justify-between p-3 bg-[#FAFAFA] border border-[#EAEAEA] rounded-[8px]">
                                      <div className="flex items-center gap-2">
                                        <File className="w-4 h-4 text-[#9CA3AF]" />
                                        <span className="text-sm text-[#111827] font-medium">{uploadForm.file.name}</span>
                                        <span className="text-xs text-[#9CA3AF]">({formatFileSize(uploadForm.file.size)})</span>
                                      </div>
                                      <button
                                        onClick={() => setUploadForm({ itemId: null, file: null, isUploading: false, error: null })}
                                        className="text-[#9CA3AF] hover:text-[#111827] transition-colors"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}

                                  {isUploadingThis && uploadForm.error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-[8px] text-red-700 text-sm flex items-center gap-2">
                                      <AlertCircle className="w-4 h-4" />
                                      {uploadForm.error}
                                    </div>
                                  )}

                                  {isUploadingThis && uploadForm.file && (
                                    <button
                                      onClick={() => handleUpload(item.id)}
                                      disabled={uploadForm.isUploading}
                                      className="w-full py-2.5 bg-[#111827] text-white rounded-[8px] hover:bg-black disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
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

                              {userDoc?.uploaded_file_url && userDoc.status !== 'rejected' && (
                                <div className="flex gap-3 mt-4">
                                  <a
                                    href={userDoc.uploaded_file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-[#FAFAFA] border border-[#EAEAEA] text-[#111827] rounded-[8px] hover:bg-white hover:border-gray-300 transition-colors text-sm font-medium"
                                  >
                                    <Eye className="w-4 h-4" />
                                    {t('documents.viewDocument')}
                                  </a>
                                  <button
                                    onClick={() => handleDeleteDocument(userDoc.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-[8px] hover:bg-red-100 transition-colors text-sm font-medium"
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
                      <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-12 text-center">
                        <FileText className="w-10 h-10 text-[#EAEAEA] mx-auto mb-4" />
                        <p className="text-[#6B7280] text-sm">{t('documents.noDocuments')}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'guidelines' && (
              <div className="space-y-6">
                <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-6 shadow-sm">
                  <h2 className="text-[15px] font-semibold tracking-tight text-[#111827] mb-5 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-[#9CA3AF]" />
                    {t('documents.medicalGuidelines.title')}
                  </h2>
                  <div className="mb-6 rounded-[8px] border border-[#EAEAEA] bg-[#FAFAFA] px-4 py-3 text-sm text-[#6B7280]">
                    Self-assessment and document reminders are not available because the current backend does not expose those APIs.
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-4">
                      {t('documents.medicalGuidelines.vision.title')}
                    </h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-[#FAFAFA] border border-[#EAEAEA] rounded-[8px]">
                        <h4 className="font-semibold text-sm text-[#111827] mb-1.5">{t('documents.medicalGuidelines.vision.nearVision')}</h4>
                        <p className="text-sm text-[#6B7280]">{t('documents.medicalGuidelines.vision.nearVisionDesc')}</p>
                      </div>
                      <div className="p-4 bg-[#FAFAFA] border border-[#EAEAEA] rounded-[8px]">
                        <h4 className="font-semibold text-sm text-[#111827] mb-1.5">{t('documents.medicalGuidelines.vision.distanceVision')}</h4>
                        <p className="text-sm text-[#6B7280]">{t('documents.medicalGuidelines.vision.distanceVisionDesc')}</p>
                      </div>
                      <div className="p-4 bg-[#FAFAFA] border border-[#EAEAEA] rounded-[8px]">
                        <h4 className="font-semibold text-sm text-[#111827] mb-1.5">{t('documents.medicalGuidelines.vision.colorVision')}</h4>
                        <p className="text-sm text-[#6B7280]">{t('documents.medicalGuidelines.vision.colorVisionDesc')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-4">
                      {t('documents.medicalGuidelines.physical.title')}
                    </h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-[#FAFAFA] border border-[#EAEAEA] rounded-[8px]">
                        <h4 className="font-semibold text-sm text-[#111827] mb-1.5">{t('documents.medicalGuidelines.physical.bloodPressure')}</h4>
                        <p className="text-sm text-[#6B7280]">{t('documents.medicalGuidelines.physical.bloodPressureDesc')}</p>
                      </div>
                      <div className="p-4 bg-[#FAFAFA] border border-[#EAEAEA] rounded-[8px]">
                        <h4 className="font-semibold text-sm text-[#111827] mb-1.5">{t('documents.medicalGuidelines.physical.ear')}</h4>
                        <p className="text-sm text-[#6B7280]">{t('documents.medicalGuidelines.physical.earDesc')}</p>
                      </div>
                      <div className="p-4 bg-[#FAFAFA] border border-[#EAEAEA] rounded-[8px]">
                        <h4 className="font-semibold text-sm text-[#111827] mb-1.5">{t('documents.medicalGuidelines.physical.skin')}</h4>
                        <p className="text-sm text-[#6B7280]">{t('documents.medicalGuidelines.physical.skinDesc')}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-red-500 mb-4">
                      {t('documents.medicalGuidelines.commonRejections.title')}
                    </h3>
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((index) => (
                        <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-[8px]">
                          <h4 className="font-semibold text-sm text-red-700 mb-1">
                            {t(`documents.medicalGuidelines.commonRejections.item${index}.title`)}
                          </h4>
                          <p className="text-sm text-red-600">
                            {t(`documents.medicalGuidelines.commonRejections.item${index}.desc`)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
