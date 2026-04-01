'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import { Sidebar } from '@/components/ui/Sidebar'
import { fetchCurrentUser } from '@/lib/auth'
import {
  getDiscussion,
  getReplies,
  toggleDiscussionUpvote,
  toggleReplyUpvote,
  acceptAnswer,
  createReply,
  deleteDiscussion,
  Discussion,
  Reply
} from '@/lib/api/community'

export default function DiscussionDetailPage() {
  const t = useTranslations()
  const router = useRouter()
  const params = useParams()
  const discussionId = params.id as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [discussion, setDiscussion] = useState<Discussion | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const locale: 'en' = 'en'
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)
  
  // Reply form
  const [replyContent, setReplyContent] = useState('')
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [replyError, setReplyError] = useState('')
  
  // Upvote states
  const [upvotingDiscussion, setUpvotingDiscussion] = useState(false)
  const [upvotingReply, setUpvotingReply] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await fetchCurrentUser()
        if (!user) {
          router.push('/login')
          return
        }
        setCurrentUserId(user.sub)
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
    const fetchData = async () => {
      try {
        const [discussionData, repliesData] = await Promise.all([
          getDiscussion(discussionId),
          getReplies(discussionId)
        ])
        setDiscussion(discussionData)
        setReplies(repliesData)
      } catch (error) {
        console.error('Failed to fetch discussion:', error)
        router.push('/community')
      }
    }

    if (!isLoading && discussionId) {
      fetchData()
    }
  }, [isLoading, discussionId, router])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleUpvoteDiscussion = async () => {
    if (!discussion || upvotingDiscussion) return
    
    setUpvotingDiscussion(true)
    try {
      const result = await toggleDiscussionUpvote(discussion.id)
      if (result.success) {
        setDiscussion({
          ...discussion,
          has_upvoted: result.upvoted,
          upvotes: result.upvotes
        })
      }
    } catch (error) {
      console.error('Failed to upvote:', error)
    } finally {
      setUpvotingDiscussion(false)
    }
  }

  const handleUpvoteReply = async (replyId: string) => {
    if (upvotingReply) return
    
    setUpvotingReply(replyId)
    try {
      const result = await toggleReplyUpvote(replyId)
      if (result.success) {
        setReplies(replies.map(r => 
          r.id === replyId 
            ? { ...r, has_upvoted: result.upvoted, upvotes: result.upvotes }
            : r
        ))
      }
    } catch (error) {
      console.error('Failed to upvote reply:', error)
    } finally {
      setUpvotingReply(null)
    }
  }

  const handleAcceptAnswer = async (replyId: string) => {
    try {
      const result = await acceptAnswer(discussionId, { reply_id: replyId })
      if (result.success) {
        setDiscussion({
          ...discussion!,
          is_answered: true,
          accepted_reply_id: replyId
        })
        setReplies(replies.map(r => ({
          ...r,
          is_accepted_answer: r.id === replyId
        })))
      }
    } catch (error) {
      console.error('Failed to accept answer:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return
    }
    
    try {
      await deleteDiscussion(discussionId)
      router.push('/community')
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (replyContent.trim().length < 10) {
      setReplyError('Reply must be at least 10 characters')
      return
    }
    
    setIsSubmittingReply(true)
    setReplyError('')
    
    try {
      const newReply = await createReply(discussionId, { content: replyContent.trim() })
      setReplies([...replies, newReply])
      setReplyContent('')
      setDiscussion({
        ...discussion!,
        reply_count: discussion!.reply_count + 1
      })
    } catch (error) {
      console.error('Failed to submit reply:', error)
      setReplyError('Failed to submit reply')
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const isAuthor = discussion?.user_id === currentUserId
  const isModerator = currentUserRole === 'admin' || currentUserRole === 'super_admin' || currentUserRole === 'moderator'

  if (isLoading || !discussion) {
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
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Back Button */}
            <button
              onClick={() => router.push('/community')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Community
            </button>

            {/* Discussion */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                {/* Upvote */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={handleUpvoteDiscussion}
                    disabled={upvotingDiscussion}
                    className={`p-2 rounded-lg transition-colors ${
                      discussion.has_upvoted
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <span className="font-semibold text-gray-900 mt-1">{discussion.upvotes}</span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {discussion.is_pinned && (
                      <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                        📌 Pinned
                      </span>
                    )}
                    {discussion.is_answered && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                        ✓ Answered
                      </span>
                    )}
                    {discussion.topic_tag && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {discussion.topic_tag}
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    {discussion.title}
                  </h1>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <span>{discussion.user_name || 'Anonymous'}</span>
                    <span>•</span>
                    <span>{formatDate(discussion.created_at)}</span>
                    <span>•</span>
                    <span>{discussion.view_count} views</span>
                  </div>
                  
                  <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                    {discussion.content}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between border-t pt-4 mt-4">
                <div className="flex items-center gap-4">
                  {/* Report button */}
                  <button className="text-sm text-gray-500 hover:text-gray-700">Report</button>
                  
                  {/* Delete (author or moderator) */}
                  {(isAuthor || isModerator) && (
                    <button 
                      onClick={handleDelete}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Replies */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {discussion.reply_count} Replies
              </h2>
              
              {replies.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
                  No replies yet. Be the first to answer!
                </div>
              ) : (
                replies.map((reply) => (
                  <div 
                    key={reply.id} 
                    className={`bg-white rounded-lg shadow-sm p-4 ${
                      reply.is_accepted_answer ? 'border-2 border-green-500' : ''
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Upvote */}
                      <div className="flex flex-col items-center min-w-[50px]">
                        <button
                          onClick={() => handleUpvoteReply(reply.id)}
                          disabled={upvotingReply === reply.id}
                          className={`p-1.5 rounded-lg transition-colors ${
                            reply.has_upvoted
                              ? 'bg-primary-100 text-primary-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <span className="font-medium text-gray-900 mt-1">{reply.upvotes}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        {reply.is_accepted_answer && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full mb-2">
                            ✓ Accepted Answer
                          </span>
                        )}
                        
                        <div className="prose max-w-none text-gray-700 whitespace-pre-wrap mb-2">
                          {reply.content}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{reply.user_name || 'Anonymous'}</span>
                            <span>•</span>
                            <span>{formatDate(reply.created_at)}</span>
                          </div>
                          
                          {/* Accept Answer (discussion author only, if not already answered) */}
                          {isAuthor && !discussion.is_answered && !reply.is_accepted_answer && (
                            <button
                              onClick={() => handleAcceptAnswer(reply.id)}
                              className="text-sm text-green-600 hover:text-green-800"
                            >
                              ✓ Mark as Answer
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Reply Form */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your Answer
              </h3>
              
              <form onSubmit={handleSubmitReply}>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={6}
                  placeholder="Write your answer in detail..."
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    replyError ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                
                {replyError && (
                  <p className="mt-1 text-sm text-red-600">{replyError}</p>
                )}
                
                <p className="mt-1 text-sm text-gray-500">
                  {`${replyContent.length} characters (minimum 10)`}
                </p>
                
                <div className="mt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingReply}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingReply ? (
                      'Submitting...'
                    ) : (
                      'Submit Reply'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
