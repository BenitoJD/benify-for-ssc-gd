'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Clock, Check, X, AlertCircle, Loader2 } from 'lucide-react'
import { pyqApi, PYQ } from '@/lib/api/pyqs'

interface ExamState {
  currentIndex: number
  answers: Record<string, string>
  flagged: Set<string>
  timeRemaining: number // in seconds
  isSubmitted: boolean
}

export default function ExamModePage() {
  const t = useTranslations()
  const params = useParams()
  const searchParams = useSearchParams()
  const pyqId = params.id as string

  const [pyqs, setPyqs] = useState<PYQ[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [state, setState] = useState<ExamState>({
    currentIndex: 0,
    answers: {},
    flagged: new Set(),
    timeRemaining: 30 * 60, // 30 minutes default
    isSubmitted: false,
  })

  const [results, setResults] = useState<{
    correct: number
    incorrect: number
    unattempted: number
    total: number
    percentage: number
  } | null>(null)

  // Fetch PYQs based on filters
  useEffect(() => {
    fetchPYQs()
  }, [])

  // Timer effect
  useEffect(() => {
    if (state.isSubmitted || state.timeRemaining <= 0) return

    const timer = setInterval(() => {
      setState(prev => {
        if (prev.timeRemaining <= 1) {
          // Auto submit when time runs out
          handleSubmit()
          return { ...prev, timeRemaining: 0 }
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [state.timeRemaining, state.isSubmitted])

  const fetchPYQs = async () => {
    setLoading(true)
    try {
      const year = searchParams.get('year')
      const subject = searchParams.get('subject')
      const response = await pyqApi.getPYQs({
        year: year ? parseInt(year) : undefined,
        subject_id: subject || undefined,
        limit: 15, // Exam mode with fewer questions
      })
      setPyqs(response.data)
    } catch (error) {
      console.error('Failed to fetch PYQs:', error)
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
      {
        id: '4',
        topic_id: '4',
        topic_name: 'Grammar',
        subject_id: '4',
        subject_name: 'English/Hindi',
        question_text: 'Choose the correctly spelled word:',
        question_type: 'mcq',
        options: ['Accomodation', 'Accommodation', 'Acommodation', 'Acomodation'],
        correct_answer: 'B',
        explanation: 'The correct spelling is "Accommodation".',
        source: 'SSC GD 2021',
        exam_year: 2021,
        created_at: new Date().toISOString(),
      },
      {
        id: '5',
        topic_id: '1',
        topic_name: 'Blood Relations',
        subject_id: '1',
        subject_name: 'General Intelligence & Reasoning',
        question_text: 'Pointing to a man, a woman said, "His mother is the only daughter of my mother." How is the woman related to the man?',
        question_type: 'mcq',
        options: ['Mother', 'Daughter', 'Sister', 'Grandmother'],
        correct_answer: 'A',
        explanation: 'The only daughter of the woman\'s mother is the woman herself. So the woman is the man\'s mother.',
        source: 'SSC GD 2020',
        exam_year: 2020,
        created_at: new Date().toISOString(),
      },
    ]
  }

  const currentPYQ = pyqs.find(q => q.id === pyqId) || pyqs[0]
  const currentIndex = pyqs.findIndex(q => q.id === (currentPYQ?.id))

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSelectAnswer = (option: string) => {
    if (state.isSubmitted) return

    setSelectedAnswer(option)
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [currentPYQ.id]: option },
    }))
  }

  const handleToggleFlag = () => {
    setState(prev => {
      const newFlagged = new Set(prev.flagged)
      if (newFlagged.has(currentPYQ.id)) {
        newFlagged.delete(currentPYQ.id)
      } else {
        newFlagged.add(currentPYQ.id)
      }
      return { ...prev, flagged: newFlagged }
    })
  }

  const handleNext = () => {
    const nextIndex = Math.min(currentIndex + 1, pyqs.length - 1)
    if (nextIndex < pyqs.length) {
      const nextPYQ = pyqs[nextIndex]
      setSelectedAnswer(state.answers[nextPYQ.id] || null)
    }
  }

  const handlePrevious = () => {
    const prevIndex = Math.max(currentIndex - 1, 0)
    if (prevIndex >= 0) {
      const prevPYQ = pyqs[prevIndex]
      setSelectedAnswer(state.answers[prevPYQ.id] || null)
    }
  }

  const handleSubmit = useCallback(() => {
    if (isSubmitting) return

    setIsSubmitting(true)
    setShowSubmitConfirm(false)

    // Calculate results
    let correct = 0
    let incorrect = 0
    let unattempted = 0

    pyqs.forEach(pyq => {
      const answer = state.answers[pyq.id]
      if (answer === undefined) {
        unattempted++
      } else if (answer === pyq.correct_answer) {
        correct++
      } else {
        incorrect++
      }
    })

    const total = pyqs.length
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0

    setResults({ correct, incorrect, unattempted, total, percentage })
    setState(prev => ({ ...prev, isSubmitted: true }))
    setIsSubmitting(false)
  }, [pyqs, state.answers, isSubmitting])

  const getOptionClass = (option: string, _index: number) => {
    const baseClass = 'flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all'

    if (state.isSubmitted) {
      if (option === currentPYQ.correct_answer) {
        return `${baseClass} border-green-500 bg-green-50`
      }
      if (selectedAnswer === option && option !== currentPYQ.correct_answer) {
        return `${baseClass} border-red-500 bg-red-50`
      }
      return `${baseClass} border-gray-200 opacity-60`
    }

    return selectedAnswer === option
      ? `${baseClass} border-primary-500 bg-primary-50`
      : `${baseClass} border-gray-200 hover:border-primary-300 hover:bg-gray-50`
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

  const answeredCount = Object.keys(state.answers).length
  const unansweredCount = pyqs.length - answeredCount
  const flaggedCount = state.flagged.size

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!state.isSubmitted && (
                <Link href="/pyqs" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              )}
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{t('pyq.examMode')}</h1>
                <p className="text-sm text-gray-500">
                  {t('pyq.question')} {currentIndex + 1} {t('pyq.of')} {pyqs.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Timer */}
              {!state.isSubmitted && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${state.timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                  <Clock className="w-5 h-5" />
                  <span className="font-mono font-bold">{formatTime(state.timeRemaining)}</span>
                </div>
              )}

              {/* Progress */}
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg text-sm">
                <span className="text-green-600">{answeredCount} {t('pyq.answered')}</span>
                <span className="text-red-600">{unansweredCount} {t('pyq.unanswered')}</span>
                <span className="text-orange-600">{flaggedCount} {t('pyq.flagged')}</span>
              </div>
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

      {/* Results Screen */}
      {state.isSubmitted && results && (
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('pyq.examSubmitted')}</h2>
              <p className="text-gray-600 mb-6">{t('pyq.yourScore')}</p>

              <div className="flex items-center justify-center gap-8 mb-8">
                <div className="text-center">
                  <p className="text-5xl font-bold text-primary-600">{results.percentage}%</p>
                  <p className="text-sm text-gray-500 mt-1">{t('pyq.accuracy')}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">{results.correct}</p>
                  <p className="text-sm text-green-700">{t('pyq.correct')}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-3xl font-bold text-red-600">{results.incorrect}</p>
                  <p className="text-sm text-red-700">{t('pyq.incorrect')}</p>
                </div>
                <div className="p-4 bg-gray-100 rounded-lg">
                  <p className="text-3xl font-bold text-gray-600">{results.unattempted}</p>
                  <p className="text-sm text-gray-700">{t('pyq.unanswered')}</p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Link
                  href="/pyqs"
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t('pyq.backToLibrary')}
                </Link>
                <Link
                  href={`/pyqs/${currentPYQ.id}/practice`}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {t('pyq.reviewAnswers')}
                </Link>
              </div>
            </div>

            {/* Review Section */}
            <div className="mt-8 space-y-4">
              <h3 className="font-semibold text-gray-900">{t('pyq.reviewQuestions')}</h3>
              {pyqs.map((pyq, index) => {
                const userAnswer = state.answers[pyq.id]
                const isCorrect = userAnswer === pyq.correct_answer
                const isUnanswered = userAnswer === undefined

                return (
                  <div key={pyq.id} className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isCorrect ? 'bg-green-100 text-green-600' :
                        isUnanswered ? 'bg-gray-100 text-gray-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {isCorrect ? <Check className="w-5 h-5" /> :
                         isUnanswered ? <span className="text-sm">{index + 1}</span> :
                         <X className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 text-sm mb-2">{pyq.question_text}</p>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-gray-500">
                            Your answer: {userAnswer ? `${userAnswer}. ${pyq.options[userAnswer.charCodeAt(0) - 65]}` : 'Not answered'}
                          </span>
                          {!isUnanswered && (
                            <span className="text-gray-500">
                              Correct: {pyq.correct_answer}. {pyq.options[pyq.correct_answer.charCodeAt(0) - 65]}
                            </span>
                          )}
                        </div>
                        {pyq.explanation && (
                          <p className="mt-2 text-xs text-gray-600 p-2 bg-gray-50 rounded">
                            <strong>Explanation:</strong> {pyq.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </main>
      )}

      {/* Question Content */}
      {!state.isSubmitted && (
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
                {state.flagged.has(currentPYQ.id) && (
                  <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded">
                    {t('pyq.flagged')}
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
                    {selectedAnswer === String.fromCharCode(65 + index) && (
                      <Check className="w-5 h-5 text-primary-600" />
                    )}
                  </div>
                ))}
              </div>

              {/* Warning for no answer */}
              {state.answers[currentPYQ.id] === undefined && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg flex items-center gap-2 text-yellow-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{t('pyq.notAnsweredWarning')}</span>
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
                <button
                  onClick={handleToggleFlag}
                  className={`px-4 py-2 border rounded-lg ${state.flagged.has(currentPYQ.id)
                    ? 'border-orange-500 text-orange-600 bg-orange-50'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {state.flagged.has(currentPYQ.id) ? t('pyq.unflag') : t('pyq.flagForReview')}
                </button>

                {currentIndex === pyqs.length - 1 ? (
                  <button
                    onClick={() => setShowSubmitConfirm(true)}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {t('pyq.submitExam')}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    {t('pyq.next')}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Question Navigator */}
            <div className="mt-8 p-4 bg-white rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 mb-3">{t('pyq.questionNavigator')}</h3>
              <div className="flex flex-wrap gap-2">
                {pyqs.map((pyq, index) => {
                  const isAnswered = state.answers[pyq.id] !== undefined
                  const isCurrent = pyq.id === currentPYQ.id
                  const isFlagged = state.flagged.has(pyq.id)

                  let bgClass = 'bg-gray-100 hover:bg-gray-200'
                  if (isAnswered) {
                    bgClass = 'bg-green-100 hover:bg-green-200'
                  }
                  if (isFlagged) {
                    bgClass = 'bg-orange-100 hover:bg-orange-200'
                  }
                  if (isCurrent) {
                    bgClass = 'bg-primary-100 hover:bg-primary-200 ring-2 ring-primary-500'
                  }

                  return (
                    <button
                      key={pyq.id}
                      onClick={() => setSelectedAnswer(state.answers[pyq.id] || null)}
                      className={`w-8 h-8 rounded text-sm font-medium ${bgClass} transition-all relative`}
                    >
                      {index + 1}
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
                      )}
                    </button>
                  )
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-100 rounded border" />
                  <span>{t('pyq.unanswered')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-100 rounded border" />
                  <span>{t('pyq.answered')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-orange-100 rounded border" />
                  <span>{t('pyq.flagged')}</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  {t('pyq.submitExam')} ({answeredCount}/{pyqs.length} {t('pyq.answered')})
                </button>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('pyq.confirmSubmit')}</h3>
            <p className="text-gray-600 mb-4">
              {unansweredCount > 0 && (
                <span className="text-yellow-600">You have {unansweredCount} unanswered questions. </span>
              )}
              {t('pyq.submitWarning')}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('pyq.continueExam')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  t('pyq.submit')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
