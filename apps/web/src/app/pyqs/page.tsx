'use client'

import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Search, Filter, Bookmark, Clock, ChevronRight, Loader2 } from 'lucide-react'
import { pyqApi, PYQ, Subject, SubjectTopic, YearCount } from '@/lib/api/pyqs'
import { PageHeader } from '@/components/ui/PageHeader'

function isUuid(value: string | null): value is string {
  if (!value) return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export default function PYQLibraryPage() {
  const t = useTranslations()
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [pyqs, setPyqs] = useState<PYQ[]>([])
  const [loading, setLoading] = useState(true)
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [availableYears, setAvailableYears] = useState<YearCount[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [topics, setTopics] = useState<SubjectTopic[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [yearsResponse, subjectResponse] = await Promise.all([
          pyqApi.getAvailableYears(),
          pyqApi.getSubjects(),
        ])
        setAvailableYears(yearsResponse.data)
        setSubjects(subjectResponse)
      } catch (error) {
        console.error('Failed to load PYQ filters:', error)
      }
    }

    loadFilters()
  }, [])

  useEffect(() => {
    const loadTopics = async () => {
      if (!isUuid(selectedSubject)) {
        setTopics([])
        return
      }

      try {
        const response = await pyqApi.getSubjectTopics(selectedSubject)
        setTopics(response.data)
      } catch (error) {
        console.error('Failed to load subject topics:', error)
        setTopics([])
      }
    }

    loadTopics()
  }, [selectedSubject])

  // Fetch PYQs when filters change
  const fetchPYQs = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const response = await pyqApi.getPYQs({
        year: selectedYear || undefined,
        subject_id: isUuid(selectedSubject) ? selectedSubject : undefined,
        topic_id: isUuid(selectedTopic) ? selectedTopic : undefined,
        search: searchQuery || undefined,
        page,
        limit: 20,
      })
      setPyqs(response.data)
      setTotalPages(response.meta.total_pages)
      setTotalCount(response.meta.total)
    } catch (error) {
      console.error('Failed to fetch PYQs:', error)
      setPyqs([])
      setTotalPages(1)
      setTotalCount(0)
      setLoadError('Unable to load previous year questions right now.')
    } finally {
      setLoading(false)
    }
  }, [page, searchQuery, selectedSubject, selectedTopic, selectedYear])

  useEffect(() => {
    void fetchPYQs()
  }, [fetchPYQs])

  const toggleBookmark = (id: string) => {
    setBookmarkedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchPYQs()
  }

  const handleYearFilter = (year: number | null) => {
    setSelectedYear(year)
    setSelectedTopic(null)
    setPage(1)
  }

  const handleSubjectFilter = (subjectId: string | null) => {
    setSelectedSubject(subjectId)
    setSelectedTopic(null)
    setPage(1)
  }

  const getYearCount = (year: number): number => {
    return availableYears.find((entry) => entry.year === year)?.count ?? 0
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] font-sans text-[var(--text-main)]">
      <PageHeader
        title={t('pyq.title')}
        backHref="/dashboard"
        backLabel="Dashboard"
        actions={
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden btn-3d btn-3d-white px-4 py-2 rounded-xl"
            aria-label={t('pyq.filters')}
          >
            <Filter className="w-5 h-5 text-black" />
          </button>
        }
      />

      <div className="container mx-auto px-4 py-6">
        <p className="text-[var(--text-muted)] font-medium mb-6 text-sm">{t('pyq.subtitle')}</p>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className={`lg:w-72 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="card-brilliant p-6 sticky top-28">
              <div className="flex items-center justify-between mb-6 border-b-2 border-[var(--border-light)] pb-4">
                <h2 className="font-display text-lg font-bold text-[var(--text-main)] tracking-tight">{t('pyq.filters')}</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-[var(--text-muted)] hover:text-black font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Year Filter */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">{t('pyq.examYear')}</h3>
                <div className="space-y-1.5">
                  <button
                    onClick={() => handleYearFilter(null)}
                    className={`w-full text-left px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                      selectedYear === null
                        ? 'bg-[var(--text-main)] text-white shadow-sm'
                        : 'text-[var(--text-muted)] hover:bg-gray-100 hover:text-black border-2 border-transparent'
                    }`}
                  >
                    {t('pyq.allYears')}
                  </button>
                  {availableYears.map(({ year }) => (
                    <button
                      key={year}
                      onClick={() => handleYearFilter(year)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                        selectedYear === year
                          ? 'bg-[var(--brilliant-blue)] text-white shadow-sm'
                          : 'text-[var(--text-muted)] hover:bg-gray-100 hover:text-black border-2 border-transparent'
                      }`}
                    >
                      <span>{year}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${selectedYear === year ? 'bg-white/20 text-white' : 'bg-gray-100 text-[var(--text-muted)]'}`}>{getYearCount(year)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Filter */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">{t('pyq.subject')}</h3>
                <select
                  value={selectedSubject || ''}
                  onChange={(e) => handleSubjectFilter(e.target.value || null)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-[var(--border-light)] rounded-2xl text-sm font-bold text-[var(--text-main)] focus:outline-none focus:border-black focus:bg-white transition-colors cursor-pointer"
                >
                  <option value="">{t('pyq.allSubjects')}</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic Filter */}
              {selectedSubject && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">{t('pyq.topic')}</h3>
                  <select
                    value={selectedTopic || ''}
                    onChange={(e) => {
                      setSelectedTopic(e.target.value || null)
                      setPage(1)
                    }}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-[var(--border-light)] rounded-2xl text-sm font-bold text-[var(--text-main)] focus:outline-none focus:border-black focus:bg-white transition-colors cursor-pointer"
                  >
                    <option value="">{t('pyq.allTopics')}</option>
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Clear Filters */}
              {(selectedYear || selectedSubject || selectedTopic) && (
                <button
                  onClick={() => {
                    setSelectedYear(null)
                    setSelectedSubject(null)
                    setSelectedTopic(null)
                    setPage(1)
                  }}
                  className="w-full mt-4 py-3 text-sm font-bold text-red-500 border-2 border-red-100 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors"
                >
                  {t('pyq.clearFilters')}
                </button>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {loadError && (
              <div className="bg-red-50 border border-red-200 rounded-[12px] px-4 py-3 mb-6 text-sm text-red-700">
                {loadError}
              </div>
            )}
            {/* Search Bar */}
            <div className="card-brilliant p-5 mb-8">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('pyq.searchPlaceholder')}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-[var(--border-light)] rounded-2xl text-sm font-bold text-[var(--text-main)] focus:outline-none focus:border-black focus:bg-white transition-colors"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="btn-3d btn-3d-green px-8 py-3 rounded-2xl focus:mt-0"
                  >
                    {t('pyq.search')}
                  </button>
                </div>
              </form>
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[#6B7280]">
                {t('pyq.showing')} <span className="font-semibold text-[#111827]">{pyqs.length}</span> {t('pyq.of')} <span className="font-semibold text-[#111827]">{totalCount}</span> {t('pyq.questions')}
              </p>
              {(selectedYear || selectedSubject || searchQuery) && (
                <div className="flex gap-2 flex-wrap">
                  {selectedYear && (
                    <span className="inline-flex items-center px-2 py-1.5 rounded-[6px] text-[10px] font-bold uppercase tracking-wider bg-[#FAFAFA] border border-[#EAEAEA] text-[#111827]">
                      {selectedYear}
                      <button
                        onClick={() => handleYearFilter(null)}
                        className="ml-1.5 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                  {selectedSubject && (
                    <span className="inline-flex items-center px-2 py-1.5 rounded-[6px] text-[10px] font-bold uppercase tracking-wider bg-[#FAFAFA] border border-[#EAEAEA] text-[#111827]">
                      {subjects.find((subject) => subject.id === selectedSubject)?.name ?? selectedSubject}
                      <button
                        onClick={() => handleSubjectFilter(null)}
                        className="ml-1.5 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="inline-flex items-center px-2 py-1.5 rounded-[6px] text-[10px] font-bold uppercase tracking-wider bg-[#FAFAFA] border border-[#EAEAEA] text-[#111827]">
                      &ldquo;{searchQuery}&rdquo;
                      <button
                        onClick={() => {
                          setSearchQuery('')
                          setPage(1)
                          fetchPYQs()
                        }}
                        className="ml-1.5 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* PYQ List */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-[var(--brilliant-green)] animate-spin" />
              </div>
            ) : pyqs.length === 0 ? (
              <div className="card-brilliant p-16 text-center border-none border-t-4 border-t-[var(--brilliant-yellow)]">
                <h3 className="font-display font-bold text-2xl mb-2 text-black">No questions found</h3>
                <p className="text-[var(--text-muted)] font-medium text-lg">{t('pyq.noResults')}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pyqs.map((pyq) => (
                  <div
                    key={pyq.id}
                    className="card-brilliant p-6 sm:p-8"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-2 mb-4">
                          <span className="px-3 py-1 text-xs uppercase tracking-wider font-extrabold bg-blue-100 text-blue-700 rounded-full">
                            {pyq.exam_year}
                          </span>
                          <span className="px-3 py-1 text-xs uppercase tracking-wider font-extrabold bg-green-100 text-green-700 rounded-full">
                            {pyq.subject_name}
                          </span>
                          {pyq.topic_name && (
                            <span className="px-3 py-1 text-xs uppercase tracking-wider font-extrabold bg-pink-100 text-pink-700 rounded-full">
                              {pyq.topic_name}
                            </span>
                          )}
                        </div>
                        <p className="text-[var(--text-main)] font-semibold text-lg leading-relaxed mb-6">{pyq.question_text}</p>
                        <div className="space-y-3">
                          {pyq.options.map((option, idx) => (
                            <div key={idx} className="flex items-center gap-4 text-base font-medium">
                              <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 border-2 border-[var(--border-light)] font-bold text-sm text-[var(--text-muted)] shrink-0 shadow-sm">{String.fromCharCode(65 + idx)}</span>
                              <span className="text-[var(--text-main)]">{option}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleBookmark(pyq.id)}
                        className={`mt-1 p-2.5 rounded-full hover:bg-gray-100 transition-colors ${
                          bookmarkedIds.has(pyq.id) ? 'text-[var(--brilliant-yellow)] bg-yellow-50' : 'text-gray-300'
                        }`}
                      >
                        <Bookmark className={`w-5 h-5 ${bookmarkedIds.has(pyq.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 mt-8 pt-6 border-t-2 border-[var(--border-light)]">
                      <Link
                        href={`/pyqs/${pyq.id}/practice?year=${selectedYear || ''}&subject=${selectedSubject || ''}`}
                        className="btn-3d btn-3d-white px-5 py-2.5 rounded-full text-xs"
                      >
                        <Clock className="w-4 h-4 mr-1.5" />
                        {t('pyq.practice')}
                      </Link>
                      <Link
                        href={`/pyqs/${pyq.id}/exam?year=${selectedYear || ''}&subject=${selectedSubject || ''}`}
                        className="btn-3d btn-3d-green px-5 py-2.5 rounded-full text-xs"
                      >
                        <ChevronRight className="w-4 h-4 mr-1" />
                        {t('pyq.examMode')}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-[#EAEAEA] bg-white rounded-[8px] text-sm font-medium text-[#111827] hover:bg-[#FAFAFA] disabled:opacity-50 transition-colors"
                >
                  {t('pyq.previous')}
                </button>
                <span className="px-4 py-2 text-sm text-[#6B7280] font-medium shadow-sm border border-[#EAEAEA] bg-white rounded-[8px]">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-[#EAEAEA] bg-white rounded-[8px] text-sm font-medium text-[#111827] hover:bg-[#FAFAFA] disabled:opacity-50 transition-colors"
                >
                  {t('pyq.next')}
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
