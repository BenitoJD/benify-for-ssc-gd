'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/ui/Sidebar'
import { fetchCurrentUser } from '@/lib/auth'
import {
  getDiscussions,
  Discussion,
  TOPIC_TAGS,
  toggleDiscussionUpvote,
} from '@/lib/api/community'

export default function CommunityPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const locale = 'en' as const
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<string>('')
  const [answeredFilter, setAnsweredFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState<'created_at' | 'upvotes' | 'reply_count'>('created_at')
  
  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await fetchCurrentUser()
        if (!user) {
          router.replace('/login')
          return
        }
      } catch {
        router.replace('/login')
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
      return `${Math.floor(diffMs / (1000 * 60))} min ago`
    } else if (diffHours < 24) {
      return `${diffHours} hrs ago`
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }
  }

  const handleToggleUpvote = async (discussionId: string) => {
    const previousDiscussions = discussions

    const target = discussions.find((discussion) => discussion.id === discussionId)
    if (!target) return

    const optimisticUpvoted = !target.has_upvoted
    const optimisticCount = optimisticUpvoted ? target.upvotes + 1 : Math.max(target.upvotes - 1, 0)

    setDiscussions((current) =>
      current.map((discussion) =>
        discussion.id === discussionId
          ? {
              ...discussion,
              has_upvoted: optimisticUpvoted,
              upvotes: optimisticCount,
            }
          : discussion
      )
    )

    try {
      const response = await toggleDiscussionUpvote(discussionId)
      setDiscussions((current) =>
        current.map((discussion) =>
          discussion.id === discussionId
            ? {
                ...discussion,
                has_upvoted: response.upvoted,
                upvotes: response.upvotes,
              }
            : discussion
        )
      )
    } catch (error) {
      console.error('Failed to toggle upvote:', error)
      setDiscussions(previousDiscussions)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#111827]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] font-sans text-[var(--text-main)] flex flex-col md:flex-row">
      <Sidebar locale={locale} />
      
      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-10 pt-20 lg:pt-10 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6 mb-20">
            {/* Header */}
            <div className="flex items-center justify-between bg-yellow-50 p-8 rounded-3xl border-2 border-yellow-200 shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <h1 className="font-display text-4xl font-bold tracking-tight text-yellow-900">Community</h1>
                <p className="text-yellow-800 font-medium text-sm mt-2">Ask questions and help others</p>
              </div>
              <button
                onClick={() => router.push('/community/ask')}
                className="btn-3d btn-3d-blue px-6 py-3 rounded-full text-sm relative z-10"
              >
                + Ask Question
              </button>
            </div>

            {/* Filters */}
            <div className="card-brilliant p-6 space-y-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setPage(1)
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-[#EAEAEA] rounded-[8px] text-sm text-[#111827] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] transition-shadow"
                />
                <svg
                  className="absolute left-3 top-3 h-4 w-4 text-[#9CA3AF]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Filter Row */}
              <div className="flex flex-wrap gap-3">
                <select
                  value={selectedTopic}
                  onChange={(e) => { setSelectedTopic(e.target.value); setPage(1) }}
                  className="px-4 py-2 border-2 border-[var(--border-light)] hover:border-gray-300 rounded-xl font-bold text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--brilliant-blue)] bg-gray-50"
                >
                  <option value="">All Topics</option>
                  {TOPIC_TAGS.map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>

                <select
                  value={answeredFilter}
                  onChange={(e) => { setAnsweredFilter(e.target.value); setPage(1) }}
                  className="px-4 py-2 border-2 border-[var(--border-light)] hover:border-gray-300 rounded-xl font-bold text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--brilliant-blue)] bg-gray-50"
                >
                  <option value="">All Questions</option>
                  <option value="answered">Answered</option>
                  <option value="unanswered">Unanswered</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value as 'created_at' | 'upvotes' | 'reply_count'); setPage(1) }}
                  className="px-4 py-2 border-2 border-[var(--border-light)] hover:border-gray-300 rounded-xl font-bold text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--brilliant-blue)] bg-gray-50"
                >
                  <option value="created_at">Newest First</option>
                  <option value="upvotes">Most Upvoted</option>
                  <option value="reply_count">Most Replies</option>
                </select>
              </div>
            </div>

            {/* Discussion List */}
            <div className="space-y-4">
              {discussions.length === 0 ? (
                <div className="card-brilliant p-10 text-center">
                  <p className="font-bold text-[var(--text-muted)] text-sm">No questions found. Ask the first one!</p>
                </div>
              ) : (
                discussions.map((discussion) => (
                  <div
                    key={discussion.id}
                    className={`card-brilliant px-6 py-5 cursor-pointer ring-2 ring-transparent transition-all hover:ring-[var(--border-light)] ${
                      discussion.is_pinned ? 'border-l-4 border-l-[var(--brilliant-yellow)]' : ''
                    }`}
                    onClick={() => router.push(`/community/${discussion.id}`)}
                  >
                    <div className="flex gap-5">
                      {/* Vote/Upvote */}
                      <div className="flex flex-col items-center min-w-[56px] gap-1.5">
                        <button
                          className={`p-2 rounded-xl border-b-4 active:border-b-0 active:translate-y-1 transition-all ${
                            discussion.has_upvoted
                              ? 'bg-[var(--brilliant-blue)] text-white border-blue-700'
                              : 'bg-gray-100 border-gray-300 text-[var(--text-main)] hover:bg-white'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            void handleToggleUpvote(discussion.id)
                          }}
                          aria-label={discussion.has_upvoted ? 'Remove upvote' : 'Upvote discussion'}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <span className="font-extrabold text-[15px] text-[var(--text-main)]">{discussion.upvotes}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2.5">
                          {discussion.is_pinned && (
                            <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-bold tracking-widest uppercase rounded-lg">
                              📌 Pinned
                            </span>
                          )}
                          {discussion.is_answered && (
                            <span className="px-2.5 py-1 bg-green-100 text-green-800 text-[10px] font-bold tracking-widest uppercase rounded-lg flex items-center gap-1">
                              <span className="text-green-600">✓</span> Answered
                            </span>
                          )}
                          {discussion.topic_tag && (
                            <span className="px-2.5 py-1 bg-gray-100 border-2 border-[var(--border-light)] text-[var(--text-muted)] text-[10px] font-bold tracking-widest uppercase rounded-lg">
                              {discussion.topic_tag}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="font-display text-[18px] font-bold text-[var(--text-main)] mb-1.5 md:mb-2 line-clamp-2 tracking-tight group-hover:text-[var(--brilliant-blue)] transition-colors">
                          {discussion.title}
                        </h3>
                        
                        <p className="font-medium text-[var(--text-muted)] text-sm line-clamp-2 mb-4 leading-relaxed">
                          {discussion.content}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">
                          <span>{discussion.user_name || 'Anonymous'}</span>
                          <span className="text-gray-300">•</span>
                          <span>{formatDate(discussion.created_at)}</span>
                          <span className="text-gray-300">•</span>
                          <span>{discussion.reply_count} replies</span>
                          <span className="text-gray-300">•</span>
                          <span>{discussion.view_count} views</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-6 py-2 border-2 border-[var(--border-light)] bg-white rounded-full text-sm font-bold text-[var(--text-main)] disabled:opacity-40 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Previous
                </button>
                <span className="px-4 text-sm font-bold bg-gray-100 py-1.5 rounded-lg text-[var(--text-muted)]">
                  {`${page} / ${totalPages}`}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-6 py-2 border-2 border-[var(--border-light)] bg-white rounded-full text-sm font-bold text-[var(--text-main)] disabled:opacity-40 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </main>
    </div>
  )
}
