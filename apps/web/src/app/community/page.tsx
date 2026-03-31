'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/ui/Sidebar'
import { fetchCurrentUser } from '@/lib/auth'
import {
  getDiscussions,
  Discussion,
  TOPIC_TAGS
} from '@/lib/api/community'

export default function CommunityPage() {
  const t = useTranslations()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [locale, setLocale] = useState<'en' | 'hi'>('en')
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<string>('')
  const [answeredFilter, setAnsweredFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState<'created_at' | 'upvotes' | 'reply_count'>('created_at')
  
  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

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

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const params: Parameters<typeof getDiscussions>[0] = {
          page,
          limit: 20,
          sort_by: sortBy,
          sort_order: 'desc'
        }
        
        if (searchQuery) {
          params.search = searchQuery
        }
        if (selectedTopic) {
          params.topic_tag = selectedTopic
        }
        if (answeredFilter === 'answered') {
          params.is_answered = true
        } else if (answeredFilter === 'unanswered') {
          params.is_answered = false
        }
        
        const response = await getDiscussions(params)
        setDiscussions(response.data)
        setTotalPages(response.meta.pages)
        setTotalCount(response.meta.total)
      } catch (error) {
        console.error('Failed to fetch discussions:', error)
      }
    }

    if (!isLoading) {
      fetchDiscussions()
    }
  }, [isLoading, page, searchQuery, selectedTopic, answeredFilter, sortBy])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffHours < 1) {
      return `${Math.floor(diffMs / (1000 * 60))} ${locale === 'hi' ? 'मिनट पहले' : 'min ago'}`
    } else if (diffHours < 24) {
      return `${diffHours} ${locale === 'hi' ? 'घंटे पहले' : 'hrs ago'}`
    } else if (diffDays < 7) {
      return `${diffDays} ${locale === 'hi' ? 'दिन पहले' : 'days ago'}`
    } else {
      return date.toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar locale={locale} />
        
        {/* Main Content */}
        <main className="flex-1 lg:ml-0 p-4 lg:p-8 pt-16 lg:pt-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {locale === 'hi' ? 'समुदाय' : 'Community'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {locale === 'hi' 
                    ? 'अपने सवाल पूछें और दूसरों की मदद करें'
                    : 'Ask questions and help others'}
                </p>
              </div>
              <button
                onClick={() => router.push('/community/ask')}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {locale === 'hi' ? '+ नया सवाल' : '+ Ask Question'}
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder={locale === 'hi' ? 'सवाल खोजें...' : 'Search questions...'}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setPage(1)
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Filter Row */}
              <div className="flex flex-wrap gap-4">
                {/* Topic Filter */}
                <select
                  value={selectedTopic}
                  onChange={(e) => {
                    setSelectedTopic(e.target.value)
                    setPage(1)
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">{locale === 'hi' ? 'सभी विषय' : 'All Topics'}</option>
                  {TOPIC_TAGS.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>

                {/* Answered Filter */}
                <select
                  value={answeredFilter}
                  onChange={(e) => {
                    setAnsweredFilter(e.target.value)
                    setPage(1)
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">{locale === 'hi' ? 'सभी सवाल' : 'All Questions'}</option>
                  <option value="answered">{locale === 'hi' ? 'उत्तर दिए गए' : 'Answered'}</option>
                  <option value="unanswered">{locale === 'hi' ? 'बिना उत्तर' : 'Unanswered'}</option>
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as 'created_at' | 'upvotes' | 'reply_count')
                    setPage(1)
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="created_at">{locale === 'hi' ? 'नए सबसे पहले' : 'Newest First'}</option>
                  <option value="upvotes">{locale === 'hi' ? 'सबसे ज्यादा upvotes' : 'Most Upvoted'}</option>
                  <option value="reply_count">{locale === 'hi' ? 'सबसे ज्यादा replies' : 'Most Replies'}</option>
                </select>
              </div>
            </div>

            {/* Discussion List */}
            <div className="space-y-4">
              {discussions.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <p className="text-gray-500">
                    {locale === 'hi' 
                      ? 'कोई सवाल नहीं मिला। पहला सवाल पूछें!'
                      : 'No questions found. Ask the first one!'}
                  </p>
                </div>
              ) : (
                discussions.map((discussion) => (
                  <div
                    key={discussion.id}
                    className={`bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer ${
                      discussion.is_pinned ? 'border-2 border-primary-500' : ''
                    }`}
                    onClick={() => router.push(`/community/${discussion.id}`)}
                  >
                    <div className="flex gap-4">
                      {/* Vote/Upvote */}
                      <div className="flex flex-col items-center min-w-[60px]">
                        <button
                          className={`p-2 rounded-lg ${
                            discussion.has_upvoted
                              ? 'bg-primary-100 text-primary-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            // Upvote handled via API
                          }}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <span className="font-semibold text-gray-900 mt-1">{discussion.upvotes}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {discussion.is_pinned && (
                            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                              {locale === 'hi' ? 'Pinned' : '📌 Pinned'}
                            </span>
                          )}
                          {discussion.is_answered && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                              {locale === 'hi' ? '✓ Answered' : '✓ Answered'}
                            </span>
                          )}
                          {discussion.topic_tag && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {discussion.topic_tag}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-2">
                          {discussion.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                          {discussion.content}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{discussion.user_name || 'Anonymous'}</span>
                          <span>•</span>
                          <span>{formatDate(discussion.created_at)}</span>
                          <span>•</span>
                          <span>
                            {discussion.reply_count} {locale === 'hi' ? 'replies' : 'replies'}
                          </span>
                          <span>•</span>
                          <span>
                            {discussion.view_count} {locale === 'hi' ? 'views' : 'views'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  {locale === 'hi' ? 'पिछला' : 'Previous'}
                </button>
                <span className="px-4 py-2 text-gray-600">
                  {locale === 'hi' 
                    ? `पेज ${page} का ${totalPages}`
                    : `Page ${page} of ${totalPages}`}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  {locale === 'hi' ? 'अगला' : 'Next'}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
