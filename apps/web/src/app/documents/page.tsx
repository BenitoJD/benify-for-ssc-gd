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
  const [documentError, setDocumentError] = useState<string | null>(null)

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
    setDocumentError(null)
    try {
      const [checklists, docsData] = await Promise.all([
        getDocumentChecklists(currentStage),
        getMyDocuments(),
      ])
      setChecklistItems(checklists)
      setUserDocuments(docsData.documents)
    } catch (error) {
      console.error('Failed to load documents:', error)
      setDocumentError('We could not load your document checklist right now. Please try again.')
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
      setDocumentError('Upload failed. Please retry with the same file or choose a different one.')
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
      setDocumentError('We could not delete this document right now. Please try again.')
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
    <div className="min-h-screen bg-[var(--bg-page)] font-sans text-[var(--text-main)] flex flex-col md:flex-row">
      <Sidebar locale={locale} />

      <main className="flex-1 p-4 lg:p-10 pt-20 lg:pt-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto mb-20">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 text-[var(--text-muted)] hover:text-black rounded-full transition-colors border-2 border-[var(--border-light)]"
              aria-label="Back to dashboard"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--text-main)]">
              {t('documents.title')}
            </h1>
          </div>

          <div className="space-y-6">
            {successMessage && (
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-2 text-green-800 text-sm font-bold">
                <Check className="w-5 h-5" />
                {successMessage}
              </div>
            )}

            {documentError && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex flex-col gap-3 text-red-700 text-sm font-bold md:flex-row md:items-center md:justify-between">
                <span>{documentError}</span>
                <button
                  type="button"
                  onClick={() => void loadDocumentData()}
                  className="rounded-xl border-2 border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
                >
                  Retry
                </button>
              </div>
            )}

            <div className="card-brilliant p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold tracking-tight text-[var(--text-main)]">{t('documents.overallProgress')}</h2>
                <span className="text-3xl font-display font-extrabold tracking-tight text-[var(--brilliant-blue)]">{calculateCompletion()}%</span>
              </div>
              <div className="w-full bg-gray-100 border border-[var(--border-light)] rounded-full h-3 overflow-hidden">
                <div
                  className="bg-[var(--brilliant-green)] h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${calculateCompletion()}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all border-2 ${
                      activeTab === tab.id
                        ? 'bg-[var(--brilliant-blue)] text-white border-blue-600 shadow-md'
                        : 'bg-white border-[var(--border-light)] text-[var(--text-muted)] hover:bg-gray-50 hover:text-black'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {activeTab === 'checklist' && (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                    {stages.map((stage) => (
                      <button
                        key={stage.id}
                        onClick={() => setCurrentStage(stage.id)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
                          currentStage === stage.id
                            ? 'bg-[var(--text-main)] text-white border-black shadow-md'
                            : 'bg-white border-[var(--border-light)] text-[var(--text-muted)] hover:text-black hover:bg-gray-50'
                        }`}
                      >
                        {stage.label}
                      </button>
                    ))}
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
                          className="card-brilliant p-8 hover:shadow-md transition-all ring-2 ring-transparent hover:ring-[var(--border-light)]"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="font-display text-xl font-bold tracking-tight text-[var(--text-main)]">{item.title}</h3>
                                {item.is_required && (
                                  <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                                    {t('documents.required')}
                                  </span>
                                )}
                              </div>
                              <p className="text-[var(--text-muted)] font-medium text-[15px] mb-4">{item.description}</p>

                              {item.instructions && (
                                <p className="text-gray-500 text-xs mb-4 bg-yellow-50 border-2 border-yellow-200 p-4 rounded-xl">
                                  {item.instructions}
                                </p>
                              )}

                              <div className="flex gap-4 text-xs text-gray-500 font-bold mb-4">
                                <span className="bg-gray-100 px-3 py-1.5 rounded-lg">{t('documents.upload.acceptedFormats')}: {item.accepted_formats}</span>
                                <span className="bg-gray-100 px-3 py-1.5 rounded-lg">{t('documents.upload.maxSize')}: {item.max_file_size_mb}MB</span>
                              </div>

                              {userDoc?.deadline && deadlineStatus.is_warning && (
                                <div className="flex items-center gap-2 text-amber-600 text-sm mb-3">
                                  <Clock className="w-4 h-4" />
                                  <span>{t('documents.deadlineWarning', { days: deadlineStatus.days_remaining })}</span>
                                </div>
                              )}

                              {userDoc && (
                                <div className="flex items-center gap-3 mb-4">
                                  <span className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 border-2 ${
                                    userDoc.status === 'verified' ? 'bg-green-100 border-green-200 text-green-700' :
                                    userDoc.status === 'rejected' ? 'bg-red-100 border-red-200 text-red-700' :
                                    'bg-blue-50 border-blue-200 text-blue-700'
                                  }`}>
                                    {getStatusIcon(userDoc.status)}
                                    {t(`documents.status.${userDoc.status}`)}
                                  </span>
                                  {userDoc.original_filename && (
                                    <span className="text-xs text-[var(--text-muted)] font-bold">{userDoc.original_filename}</span>
                                  )}
                                </div>
                              )}

                              {userDoc?.status === 'rejected' && userDoc.rejection_reason && (
                                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm font-medium mb-4">
                                  <strong>{t('documents.rejectionReason')}:</strong> {userDoc.rejection_reason}
                                </div>
                              )}

                              {(!userDoc || userDoc.status === 'pending' || userDoc.status === 'rejected') && (
                                <div className="space-y-4">
                                  <div className="border-4 border-dashed border-gray-200 bg-gray-50 rounded-2xl p-8 text-center hover:border-[var(--brilliant-blue)] hover:bg-white transition-all cursor-pointer">
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
                                      <Upload className="w-8 h-8 text-gray-400 mb-3" />
                                      <span className="text-[15px] text-[var(--text-main)] font-bold">
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
                                      className="btn-3d btn-3d-green w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-[15px]"
                                    >
                                      {uploadForm.isUploading ? (
                                        <>
                                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                          {t('documents.upload.uploading')}
                                        </>
                                      ) : (
                                        <>
                                          <Upload className="w-5 h-5" />
                                          {t('documents.upload.submit')}
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                              )}

                              {userDoc?.uploaded_file_url && userDoc.status !== 'rejected' && (
                                <div className="flex gap-4 mt-6">
                                  <a
                                    href={userDoc.uploaded_file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-3d flex items-center gap-2 px-6 py-3 bg-white border-2 border-[var(--border-light)] text-[var(--text-main)] rounded-full hover:bg-gray-50 transition-colors text-sm font-bold shadow-[0_4px_0_var(--border-light)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
                                  >
                                    <Eye className="w-5 h-5" />
                                    {t('documents.viewDocument')}
                                  </a>
                                  <button
                                    onClick={() => handleDeleteDocument(userDoc.id)}
                                    className="btn-3d flex items-center gap-2 px-6 py-3 bg-red-50 border-2 border-red-200 text-red-600 rounded-full hover:bg-red-100 transition-colors text-sm font-bold shadow-[0_4px_0_rgb(254,202,202)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
                                  >
                                    <Trash2 className="w-5 h-5" />
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
        </div>
      </main>
    </div>
  )
}
