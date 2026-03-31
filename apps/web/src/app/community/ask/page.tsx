'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/ui/Sidebar'
import { fetchCurrentUser } from '@/lib/auth'
import {
  createDiscussion,
  TOPIC_TAGS
} from '@/lib/api/community'

export default function AskQuestionPage() {
  const t = useTranslations()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [locale, setLocale] = useState<'en' | 'hi'>('en')
  
  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [topicTag, setTopicTag] = useState('')
  
  // Error state
  const [errors, setErrors] = useState<{
    title?: string
    content?: string
  }>({})

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

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}
    
    if (title.trim().length < 10) {
      newErrors.title = locale === 'hi' 
        ? 'शीर्षक कम से कम 10 अक्षर का होना चाहिए'
        : 'Title must be at least 10 characters'
    }
    
    if (content.trim().length < 20) {
      newErrors.content = locale === 'hi'
        ? 'विवरण कम से कम 20 अक्षर का होना चाहिए'
        : 'Content must be at least 20 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const discussion = await createDiscussion({
        title: title.trim(),
        content: content.trim(),
        topic_tag: topicTag || undefined
      })
      
      router.push(`/community/${discussion.id}`)
    } catch (error) {
      console.error('Failed to create discussion:', error)
      setErrors({
        title: locale === 'hi' 
          ? 'सवाल बनाने में त्रुटि हुई'
          : 'Failed to create question'
      })
    } finally {
      setIsSubmitting(false)
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
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {locale === 'hi' ? 'वापस' : 'Back'}
              </button>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {locale === 'hi' ? 'नया सवाल पूछें' : 'Ask a Question'}
              </h1>
              <p className="text-gray-600 mt-1">
                {locale === 'hi'
                  ? 'अपना सवाल स्पष्ट और विस्तार से लिखें ताकि दूसरे आपकी मदद कर सकें'
                  : 'Write your question clearly so others can help'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'hi' ? 'सवाल का शीर्षक' : 'Question Title'}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={locale === 'hi' 
                    ? 'अपना सवाल संक्षेप में लिखें...'
                    : 'Summarize your question...'}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  {locale === 'hi'
                    ? `${title.length}/500 अक्षर (कम से कम 10 अक्षर)`
                    : `${title.length}/500 characters (minimum 10)`}
                </p>
              </div>

              {/* Topic Tag */}
              <div>
                <label htmlFor="topicTag" className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'hi' ? 'विषय' : 'Topic'}
                  <span className="text-gray-400 ml-1">({locale === 'hi' ? 'वैकल्पिक' : 'optional'})</span>
                </label>
                <select
                  id="topicTag"
                  value={topicTag}
                  onChange={(e) => setTopicTag(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">{locale === 'hi' ? 'विषय चुनें...' : 'Select a topic...'}</option>
                  {TOPIC_TAGS.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'hi' ? 'सवाल का विवरण' : 'Question Details'}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  placeholder={locale === 'hi'
                    ? 'अपना सवाल विस्तार से समझाएं। क्या आपने पहले कोशिश किया? क्या समस्या आ रही है?'
                    : 'Explain your question in detail. What have you tried? What problem are you facing?'}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.content ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  {locale === 'hi'
                    ? `${content.length} अक्षर (कम से कम 20 अक्षर)`
                    : `${content.length} characters (minimum 20)`}
                </p>
              </div>

              {/* Guidelines */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">
                  {locale === 'hi' ? 'सवाल पूछने के टिप्स' : 'Tips for asking a good question'}
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• {locale === 'hi' ? 'सवाल स्पष्ट और संक्षेप में लिखें' : 'Be clear and concise'}</li>
                  <li>• {locale === 'hi' ? 'संदर्भ जोड़ें (विषय, पिछली कोशिश)' : 'Add context (topic, previous attempts)'}</li>
                  <li>• {locale === 'hi' ? 'एक सवाल एक बार में पूछें' : 'Ask one question at a time'}</li>
                  <li>• {locale === 'hi' ? 'व्याकरण और वर्तनी की जांच करें' : 'Check grammar and spelling'}</li>
                </ul>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {locale === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {locale === 'hi' ? 'बना रहा है...' : 'Posting...'}
                    </span>
                  ) : (
                    locale === 'hi' ? 'सवाल पूछें' : 'Post Question'
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
