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
  const locale: 'en' = 'en'
  
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#111827]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="flex">
        <Sidebar locale={locale} />
        
        {/* Main Content */}
        <main className="flex-1 lg:ml-0 p-4 lg:p-8 pt-16 lg:pt-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[22px] font-semibold tracking-tight text-[#111827]">Community</h1>
                <p className="text-[#6B7280] text-sm mt-1">Ask questions and help others</p>
              </div>
              <button
                onClick={() => router.push('/community/ask')}
                className="px-4 py-2 bg-[#111827] text-white text-sm font-semibold rounded-[8px] hover:bg-black transition-colors"
              >
                + Ask Question
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-4 space-y-4">
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
                  className="px-3 py-2 border border-[#EAEAEA] rounded-[8px] text-sm text-[#111827] focus:outline-none focus:border-[#111827] bg-white"
                >
                  <option value="">All Topics</option>
                  {TOPIC_TAGS.map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>

                <select
                  value={answeredFilter}
                  onChange={(e) => { setAnsweredFilter(e.target.value); setPage(1) }}
                  className="px-3 py-2 border border-[#EAEAEA] rounded-[8px] text-sm text-[#111827] focus:outline-none focus:border-[#111827] bg-white"
                >
                  <option value="">All Questions</option>
                  <option value="answered">Answered</option>
                  <option value="unanswered">Unanswered</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value as 'created_at' | 'upvotes' | 'reply_count'); setPage(1) }}
                  className="px-3 py-2 border border-[#EAEAEA] rounded-[8px] text-sm text-[#111827] focus:outline-none focus:border-[#111827] bg-white"
                >
                  <option value="created_at">Newest First</option>
                  <option value="upvotes">Most Upvoted</option>
                  <option value="reply_count">Most Replies</option>
                </select>
              </div>
            </div>

            {/* Discussion List */}
            <div className="space-y-3">
              {discussions.length === 0 ? (
                <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-10 text-center">
                  <p className="text-[#6B7280] text-sm">No questions found. Ask the first one!</p>
                </div>
              ) : (
                discussions.map((discussion) => (
                  <div
                    key={discussion.id}
                    className={`bg-white border rounded-[12px] p-5 hover:border-gray-300 transition-colors cursor-pointer ${
                      discussion.is_pinned ? 'border-[#111827]' : 'border-[#EAEAEA]'
                    }`}
                    onClick={() => router.push(`/community/${discussion.id}`)}
                  >
                    <div className="flex gap-4">
                      {/* Vote/Upvote */}
                      <div className="flex flex-col items-center min-w-[48px] gap-1">
                        <button
                          className={`p-1.5 rounded-[6px] transition-colors ${
                            discussion.has_upvoted
                              ? 'bg-[#111827] text-white'
                              : 'bg-[#FAFAFA] border border-[#EAEAEA] text-[#6B7280] hover:border-gray-300'
                          }`}
                          onClick={(e) => { e.stopPropagation() }}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <span className="font-semibold text-sm text-[#111827]">{discussion.upvotes}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {discussion.is_pinned && (
                            <span className="px-2 py-0.5 bg-[#FAFAFA] border border-[#EAEAEA] text-[#111827] text-[10px] font-bold tracking-wider uppercase rounded-[4px]">
                              📌 Pinned
                            </span>
                          )}
                          {discussion.is_answered && (
                            <span className="px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold tracking-wider uppercase rounded-[4px]">
                              ✓ Answered
                            </span>
                          )}
                          {discussion.topic_tag && (
                            <span className="px-2 py-0.5 bg-[#FAFAFA] border border-[#EAEAEA] text-[#6B7280] text-[10px] font-bold tracking-wider uppercase rounded-[4px]">
                              {discussion.topic_tag}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-[15px] font-semibold text-[#111827] mb-1.5 line-clamp-2 tracking-tight">
                          {discussion.title}
                        </h3>
                        
                        <p className="text-[#6B7280] text-sm line-clamp-2 mb-3">
                          {discussion.content}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-[#9CA3AF] font-medium">
                          <span>{discussion.user_name || 'Anonymous'}</span>
                          <span>·</span>
                          <span>{formatDate(discussion.created_at)}</span>
                          <span>·</span>
                          <span>{discussion.reply_count} replies</span>
                          <span>·</span>
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
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-[#EAEAEA] rounded-[8px] text-sm font-medium text-[#111827] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#FAFAFA] transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-[#6B7280] font-medium">
                  {`${page} / ${totalPages}`}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-[#EAEAEA] rounded-[8px] text-sm font-medium text-[#111827] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#FAFAFA] transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
