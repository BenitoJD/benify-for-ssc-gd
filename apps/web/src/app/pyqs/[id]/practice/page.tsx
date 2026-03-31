'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, X, Eye, EyeOff, Bookmark, Loader2 } from 'lucide-react'
import { pyqApi, PYQ } from '@/lib/api/pyqs'

interface PracticeState {
  currentIndex: number
  answers: Record<string, string>
  revealed: Record<string, boolean>
  score: { correct: number; incorrect: number; total: number }
  bookmarked: Set<string>
}

export default function PracticeModePage() {
  const t = useTranslations()
  const params = useParams()
  const searchParams = useSearchParams()
  const pyqId = params.id as string

  const [pyqs, setPyqs] = useState<PYQ[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [answerRevealed, setAnswerRevealed] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  const [state, setState] = useState<PracticeState>({
    currentIndex: 0,
    answers: {},
    revealed: {},
    score: { correct: 0, incorrect: 0, total: 0 },
    bookmarked: new Set(),
  })

  // Fetch PYQs based on filters
  useEffect(() => {
    fetchPYQs()
  }, [])

  const fetchPYQs = async () => {
    setLoading(true)
    try {
      const year = searchParams.get('year')
      const subject = searchParams.get('subject')
      const response = await pyqApi.getPYQs({
        year: year ? parseInt(year) : undefined,
        subject_id: subject || undefined,
        limit: 20,
      })
      setPyqs(response.data)
    } catch (error) {
      console.error('Failed to fetch PYQs:', error)
      // Use mock data
      setPyqs(generateMockPYQs())
    } finally {
      setLoading(false)
    }
  }

  const generateMockPYQs = (): PYQ[] => {
    return [
      {
        id: '1',
        topic_id: '1',
        topic_name: 'Analogy',
        subject_id: '1',
        subject_name: 'General Intelligence & Reasoning',
        question_text: 'Choose the correct option to complete the analogy: Book : Reading :: Food : ?',
        question_type: 'mcq',
        options: ['Hunger', 'Eating', 'Kitchen', 'Restaurant'],
        correct_answer: 'B',
        explanation: 'Just as reading is related to book, eating is related to food.',
        source: 'SSC GD 2023',
        exam_year: 2023,
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        topic_id: '2',
        topic_name: 'History',
        subject_id: '2',
        subject_name: 'General Knowledge & General Awareness',
        question_text: 'Who was the first Prime Minister of India?',
        question_type: 'mcq',
        options: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Sardar Patel', 'Dr. B.R. Ambedkar'],
        correct_answer: 'B',
        explanation: 'Jawaharlal Nehru was the first Prime Minister of India.',
        source: 'SSC GD 2022',
        exam_year: 2022,
        created_at: new Date().toISOString(),
      },
      {
        id: '3',
        topic_id: '3',
        topic_name: 'Average',
        subject_id: '3',
        subject_name: 'Elementary Mathematics',
        question_text: 'The average of first 10 natural numbers is:',
        question_type: 'mcq',
        options: ['5', '5.5', '6', '6.5'],
        correct_answer: 'B',
        explanation: 'Sum of first 10 natural numbers = 10*11/2 = 55. Average = 55/10 = 5.5',
        source: 'SSC GD 2023',
        exam_year: 2023,
        created_at: new Date().toISOString(),
      },
    ]
  }

  const currentPYQ = pyqs.find(q => q.id === pyqId) || pyqs[0]
  const currentIndex = pyqs.findIndex(q => q.id === (currentPYQ?.id))
  const answeredCurrent = state.answers[currentPYQ?.id] !== undefined
  const isCurrentCorrect = state.answers[currentPYQ?.id] === currentPYQ?.correct_answer

  const handleSelectAnswer = (option: string) => {
    if (answeredCurrent) return
    setSelectedAnswer(option)

    // Update state with the answer
    setState(prev => {
      const newAnswers = { ...prev.answers, [currentPYQ.id]: option }
      const isCorrect = option === currentPYQ.correct_answer
      const newScore = { ...prev.score }

      // Remove previous answer's score if exists
      if (prev.answers[currentPYQ.id] !== undefined) {
        if (prev.answers[currentPYQ.id] === currentPYQ.correct_answer) {
          newScore.correct--
        } else {
          newScore.incorrect--
        }
      }

      // Add new answer's score
      if (isCorrect) {
        newScore.correct++
      } else {
        newScore.incorrect++
      }
      newScore.total++

      return {
        ...prev,
        answers: newAnswers,
        score: newScore,
      }
    })
  }

  const handleRevealAnswer = () => {
    setAnswerRevealed(true)
    setState(prev => ({
      ...prev,
      revealed: { ...prev.revealed, [currentPYQ.id]: true },
    }))
  }

  const handleNext = () => {
    const nextIndex = Math.min(currentIndex + 1, pyqs.length - 1)
    if (nextIndex < pyqs.length) {
      const nextPYQ = pyqs[nextIndex]
      setSelectedAnswer(state.answers[nextPYQ.id] || null)
      setAnswerRevealed(state.revealed[nextPYQ.id] || false)
    }
  }

  const handlePrevious = () => {
    const prevIndex = Math.max(currentIndex - 1, 0)
    if (prevIndex >= 0) {
      const prevPYQ = pyqs[prevIndex]
      setSelectedAnswer(state.answers[prevPYQ.id] || null)
      setAnswerRevealed(state.revealed[prevPYQ.id] || false)
    }
  }

  const handleBookmark = () => {
    setState(prev => {
      const newBookmarked = new Set(prev.bookmarked)
      if (newBookmarked.has(currentPYQ.id)) {
        newBookmarked.delete(currentPYQ.id)
      } else {
        newBookmarked.add(currentPYQ.id)
      }
      return { ...prev, bookmarked: newBookmarked }
    })
    setIsBookmarked(!isBookmarked)
  }

  const getOptionClass = (option: string, _index: number) => {
    const baseClass = 'flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all'

    if (!answeredCurrent && !answerRevealed) {
      return selectedAnswer === option
        ? `${baseClass} border-primary-500 bg-primary-50`
        : `${baseClass} border-gray-200 hover:border-primary-300 hover:bg-gray-50`
    }

    if (answerRevealed) {
      if (option === currentPYQ.correct_answer) {
        return `${baseClass} border-green-500 bg-green-50`
      }
      if (selectedAnswer === option && option !== currentPYQ.correct_answer) {
        return `${baseClass} border-red-500 bg-red-50`
      }
    }

    return `${baseClass} border-gray-200 opacity-50`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  if (!currentPYQ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Question not found</p>
          <Link href="/pyqs" className="text-primary-600 hover:text-primary-700">
            Back to PYQ Library
          </Link>
        </div>
      </div>
    )
  }

  const scorePercentage = state.score.total > 0
    ? Math.round((state.score.correct / state.score.total) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/pyqs" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{t('pyq.practiceMode')}</h1>
                <p className="text-sm text-gray-500">
                  {t('pyq.question')} {currentIndex + 1} {t('pyq.of')} {pyqs.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Score Display */}
              <div className="flex items-center gap-4 px-4 py-2 bg-gray-100 rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-gray-500">{t('pyq.score')}</p>
                  <p className="text-lg font-bold text-green-600">{state.score.correct}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">&nbsp;</p>
                  <p className="text-lg font-bold text-red-600">{state.score.incorrect}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">{t('pyq.accuracy')}</p>
                  <p className="text-lg font-bold text-primary-600">{scorePercentage}%</p>
                </div>
              </div>
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-full ${isBookmarked || state.bookmarked.has(currentPYQ.id) ? 'text-primary-600 bg-primary-100' : 'text-gray-400 hover:bg-gray-100'}`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked || state.bookmarked.has(currentPYQ.id) ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 transition-all"
              style={{ width: `${((currentIndex + 1) / pyqs.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Question Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Question Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded">
                {currentPYQ.exam_year}
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                {currentPYQ.subject_name}
              </span>
              {currentPYQ.topic_name && (
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                  {currentPYQ.topic_name}
                </span>
              )}
            </div>

            <p className="text-lg text-gray-900 mb-6">{currentPYQ.question_text}</p>

            <div className="space-y-3">
              {currentPYQ.options.map((option, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectAnswer(String.fromCharCode(65 + index))}
                  className={getOptionClass(String.fromCharCode(65 + index), index)}
                >
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 font-medium text-gray-700">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1 text-gray-700">{option}</span>
                  {answerRevealed && option === currentPYQ.correct_answer && (
                    <Check className="w-5 h-5 text-green-600" />
                  )}
                  {answerRevealed && selectedAnswer === option && option !== currentPYQ.correct_answer && (
                    <X className="w-5 h-5 text-red-600" />
                  )}
                </div>
              ))}
            </div>

            {/* Feedback */}
            {answerRevealed && answeredCurrent && (
              <div className={`mt-6 p-4 rounded-lg ${isCurrentCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-start gap-3">
                  {isCurrentCorrect ? (
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <X className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-semibold ${isCurrentCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {isCurrentCorrect ? t('pyq.correct') : t('pyq.incorrect')}
                    </p>
                    {currentPYQ.explanation && (
                      <p className="mt-2 text-sm text-gray-600">
                        <strong>{t('pyq.explanation')}:</strong> {currentPYQ.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('pyq.previous')}
            </button>

            <div className="flex items-center gap-3">
              {!answerRevealed && (
                <button
                  onClick={handleRevealAnswer}
                  className="flex items-center gap-2 px-4 py-2 text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50"
                >
                  <Eye className="w-4 h-4" />
                  {t('pyq.revealAnswer')}
                </button>
              )}
              {answerRevealed && (
                <button
                  onClick={handleRevealAnswer}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <EyeOff className="w-4 h-4" />
                  {t('pyq.hideAnswer')}
                </button>
              )}
            </div>

            <button
              onClick={handleNext}
              disabled={currentIndex === pyqs.length - 1}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {t('pyq.next')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Question Navigator */}
          <div className="mt-8 p-4 bg-white rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-3">{t('pyq.questionNavigator')}</h3>
            <div className="flex flex-wrap gap-2">
              {pyqs.map((pyq, index) => {
                const isAnswered = state.answers[pyq.id] !== undefined
                const isCurrent = pyq.id === currentPYQ.id
                const isCorrect = state.answers[pyq.id] === pyq.correct_answer

                let bgClass = 'bg-gray-100 hover:bg-gray-200'
                if (isAnswered) {
                  bgClass = isCorrect ? 'bg-green-100 hover:bg-green-200' : 'bg-red-100 hover:bg-red-200'
                }
                if (isCurrent) {
                  bgClass = 'bg-primary-100 hover:bg-primary-200 ring-2 ring-primary-500'
                }

                return (
                  <button
                    key={pyq.id}
                    onClick={() => {
                      setSelectedAnswer(state.answers[pyq.id] || null)
                      setAnswerRevealed(state.revealed[pyq.id] || false)
                    }}
                    className={`w-8 h-8 rounded text-sm font-medium ${bgClass} transition-all`}
                  >
                    {index + 1}
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-100 rounded" />
                <span>{t('pyq.unanswered')}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-100 rounded" />
                <span>{t('pyq.correct')}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-100 rounded" />
                <span>{t('pyq.incorrect')}</span>
              </div>
            </div>
          </div>

          {/* Session Summary */}
          {state.score.total > 0 && (
            <div className="mt-6 p-4 bg-primary-50 rounded-lg">
              <h3 className="font-semibold text-primary-900 mb-2">{t('pyq.sessionSummary')}</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">{state.score.correct}</p>
                  <p className="text-xs text-primary-700">{t('pyq.correct')}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{state.score.incorrect}</p>
                  <p className="text-xs text-primary-700">{t('pyq.incorrect')}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary-600">{scorePercentage}%</p>
                  <p className="text-xs text-primary-700">{t('pyq.accuracy')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
