'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Search, Filter, Bookmark, Clock, ChevronRight, Loader2 } from 'lucide-react'
import { pyqApi, PYQ, Subject, SubjectTopic, YearCount } from '@/lib/api/pyqs'

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
  useEffect(() => {
    fetchPYQs()
  }, [selectedYear, selectedSubject, selectedTopic, searchQuery, page])

  const fetchPYQs = async () => {
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
  }

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
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="bg-[#FAFAFA] border-b border-[#EAEAEA]">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">{t('pyq.title')}</h1>
          <p className="text-[#6B7280] mt-2 text-sm">{t('pyq.subtitle')}</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-[12px] shadow-sm p-5 border border-[#EAEAEA]">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-[15px] text-[#111827] tracking-tight">{t('pyq.filters')}</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-[#9CA3AF] hover:text-[#111827]"
                >
                  ✕
                </button>
              </div>

              {/* Year Filter */}
              <div className="mb-6">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-3">{t('pyq.examYear')}</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => handleYearFilter(null)}
                    className={`w-full text-left px-3 py-2 rounded-[8px] text-sm font-medium transition-colors ${
                      selectedYear === null
                        ? 'bg-[#111827] text-white'
                        : 'text-[#6B7280] hover:bg-[#FAFAFA] hover:text-[#111827]'
                    }`}
                  >
                    {t('pyq.allYears')}
                  </button>
                  {availableYears.map(({ year }) => (
                    <button
                      key={year}
                      onClick={() => handleYearFilter(year)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-[8px] text-sm font-medium transition-colors ${
                        selectedYear === year
                          ? 'bg-[#111827] text-white'
                          : 'text-[#6B7280] hover:bg-[#FAFAFA] hover:text-[#111827]'
                      }`}
                    >
                      <span>{year}</span>
                      <span className={`text-xs ${selectedYear === year ? 'text-white/70' : 'text-[#9CA3AF]'}`}>{getYearCount(year)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Filter */}
              <div className="mb-6">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-3">{t('pyq.subject')}</h3>
                <select
                  value={selectedSubject || ''}
                  onChange={(e) => handleSubjectFilter(e.target.value || null)}
                  className="w-full px-3 py-2 bg-white border border-[#EAEAEA] rounded-[8px] text-sm text-[#111827] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] transition-shadow"
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
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-3">{t('pyq.topic')}</h3>
                  <select
                    value={selectedTopic || ''}
                    onChange={(e) => {
                      setSelectedTopic(e.target.value || null)
                      setPage(1)
                    }}
                    className="w-full px-3 py-2 bg-white border border-[#EAEAEA] rounded-[8px] text-sm text-[#111827] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] transition-shadow"
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
                  className="w-full px-4 py-2 text-sm font-medium text-[#111827] border border-[#EAEAEA] bg-white rounded-[8px] hover:bg-[#FAFAFA] transition-colors"
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
            <div className="bg-white rounded-[12px] shadow-sm p-4 mb-6 border border-[#EAEAEA]">
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('pyq.searchPlaceholder')}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EAEAEA] rounded-[8px] text-sm text-[#111827] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] transition-shadow"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#111827] text-white text-sm font-medium rounded-[8px] hover:bg-black transition-colors"
                >
                  {t('pyq.search')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden px-4 py-2 border border-[#EAEAEA] rounded-[8px] hover:bg-[#FAFAFA]"
                >
                  <Filter className="w-5 h-5 text-[#111827]" />
                </button>
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
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#111827] animate-spin" />
              </div>
            ) : pyqs.length === 0 ? (
              <div className="bg-white rounded-[12px] shadow-sm p-12 text-center border border-[#EAEAEA]">
                <p className="text-[#6B7280]">{t('pyq.noResults')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pyqs.map((pyq) => (
                  <div
                    key={pyq.id}
                    className="bg-white rounded-[12px] p-6 shadow-sm border border-[#EAEAEA] hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-1 text-[10px] uppercase tracking-wider font-bold border border-[#EAEAEA] bg-[#FAFAFA] text-[#111827] rounded-[6px]">
                            {pyq.exam_year}
                          </span>
                          <span className="px-2 py-1 text-[10px] uppercase tracking-wider font-bold border border-[#EAEAEA] bg-[#FAFAFA] text-[#111827] rounded-[6px]">
                            {pyq.subject_name}
                          </span>
                          {pyq.topic_name && (
                            <span className="px-2 py-1 text-[10px] uppercase tracking-wider font-bold border border-[#EAEAEA] bg-[#FAFAFA] text-[#111827] rounded-[6px]">
                              {pyq.topic_name}
                            </span>
                          )}
                        </div>
                        <p className="text-[#111827] font-medium text-[15px] mb-4">{pyq.question_text}</p>
                        <div className="space-y-2">
                          {pyq.options.map((option, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-sm">
                              <span className="w-5 h-5 flex items-center justify-center rounded-sm bg-[#FAFAFA] border border-[#EAEAEA] font-semibold text-[11px] text-[#6B7280]">{String.fromCharCode(65 + idx)}</span>
                              <span className="text-[#6B7280]">{option}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleBookmark(pyq.id)}
                        className={`mt-1 p-2 rounded-[6px] hover:bg-[#FAFAFA] border border-transparent hover:border-[#EAEAEA] transition-colors ${
                          bookmarkedIds.has(pyq.id) ? 'text-[#111827]' : 'text-[#9CA3AF]'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${bookmarkedIds.has(pyq.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mt-5 pt-5 border-t border-[#EAEAEA]">
                      <Link
                        href={`/pyqs/${pyq.id}/practice?year=${selectedYear || ''}&subject=${selectedSubject || ''}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAFAFA] border border-[#EAEAEA] rounded-[6px] text-xs font-semibold text-[#111827] hover:bg-white hover:border-gray-300 transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {t('pyq.practice')}
                      </Link>
                      <Link
                        href={`/pyqs/${pyq.id}/exam?year=${selectedYear || ''}&subject=${selectedSubject || ''}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAFAFA] border border-[#EAEAEA] rounded-[6px] text-xs font-semibold text-[#111827] hover:bg-white hover:border-gray-300 transition-colors"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
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
