'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, X, Eye, EyeOff, Bookmark, Loader2, LogOut } from 'lucide-react'
import { pyqApi, PYQ } from '@/lib/api/pyqs'
import { clearStudentSession } from '@/lib/session'

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
  const router = useRouter()
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
    const baseClass = 'flex items-center gap-3 p-4 border rounded-[8px] cursor-pointer transition-all'

    if (!answeredCurrent && !answerRevealed) {
      return selectedAnswer === option
        ? `${baseClass} border-[#111827] bg-[#FAFAFA] ring-1 ring-[#111827]`
        : `${baseClass} border-[#EAEAEA] bg-white hover:border-gray-300 hover:bg-[#FAFAFA]`
    }

    if (answerRevealed) {
      if (option === currentPYQ.correct_answer) {
        return `${baseClass} border-green-500 bg-green-50`
      }
      if (selectedAnswer === option && option !== currentPYQ.correct_answer) {
        return `${baseClass} border-red-200 bg-red-50`
      }
    }

    return `${baseClass} border-[#EAEAEA] bg-white opacity-50`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="w-8 h-8 text-[#111827] animate-spin" />
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
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="bg-white border-b-2 border-[var(--border-light)] sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/pyqs"
                className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[#FAFAFA] hover:bg-gray-100 border-2 border-[var(--border-light)] rounded-xl transition-all active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">PYQ Library</span>
              </Link>
              <div>
                <h1 className="text-[15px] font-bold tracking-tight text-[var(--text-main)]">{t('pyq.practiceMode')}</h1>
                <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mt-0.5">
                  {t('pyq.question')} {currentIndex + 1} / {pyqs.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Score Display */}
              <div className="hidden sm:flex items-center gap-4 px-4 py-2 bg-[#FAFAFA] border-2 border-[var(--border-light)] rounded-xl">
                <div className="text-center">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[#9CA3AF] mb-0.5">{t('pyq.score')}</p>
                  <p className="text-sm font-bold text-green-600">{state.score.correct}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-transparent mb-0.5">-</p>
                  <p className="text-sm font-bold text-red-500">{state.score.incorrect}</p>
                </div>
                <div className="w-px h-6 bg-[var(--border-light)]" />
                <div className="text-center">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[#9CA3AF] mb-0.5">{t('pyq.accuracy')}</p>
                  <p className="text-sm font-bold text-[var(--text-main)]">{scorePercentage}%</p>
                </div>
              </div>
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-xl border-2 transition-all ${isBookmarked || state.bookmarked.has(currentPYQ.id) ? 'text-[var(--text-main)] bg-[#FAFAFA] border-[var(--border-light)]' : 'text-[#9CA3AF] border-transparent hover:bg-[#FAFAFA] hover:border-[var(--border-light)]'}`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked || state.bookmarked.has(currentPYQ.id) ? 'fill-current' : ''}`} />
              </button>
              {/* Logout */}
              <button
                onClick={() => { clearStudentSession(); router.push('/login') }}
                className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-xl transition-all shadow-[0_3px_0_rgb(254,202,202)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--brilliant-green)] transition-all duration-300 ease-out rounded-full"
              style={{ width: `${((currentIndex + 1) / pyqs.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Question Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Question Card */}
          <div className="bg-white rounded-[12px] shadow-sm p-8 mb-6 border border-[#EAEAEA]">
            <div className="flex items-center gap-2 mb-6">
              <span className="px-2 py-1 text-[10px] uppercase tracking-wider font-bold border border-[#EAEAEA] bg-[#FAFAFA] text-[#111827] rounded-[6px]">
                {currentPYQ.exam_year}
              </span>
              <span className="px-2 py-1 text-[10px] uppercase tracking-wider font-bold border border-[#EAEAEA] bg-[#FAFAFA] text-[#111827] rounded-[6px]">
                {currentPYQ.subject_name}
              </span>
              {currentPYQ.topic_name && (
                <span className="px-2 py-1 text-[10px] uppercase tracking-wider font-bold border border-[#EAEAEA] bg-[#FAFAFA] text-[#111827] rounded-[6px]">
                  {currentPYQ.topic_name}
                </span>
              )}
            </div>

            <p className="text-lg text-[#111827] font-medium leading-relaxed mb-8">{currentPYQ.question_text}</p>

            <div className="space-y-3">
              {currentPYQ.options.map((option, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectAnswer(String.fromCharCode(65 + index))}
                  className={getOptionClass(String.fromCharCode(65 + index), index)}
                >
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-[6px] bg-[#FAFAFA] border border-[#EAEAEA] font-semibold text-sm text-[#111827]">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1 text-[#111827] font-medium">{option}</span>
                  {answerRevealed && option === currentPYQ.correct_answer && (
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                  {answerRevealed && selectedAnswer === option && option !== currentPYQ.correct_answer && (
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                      <X className="w-4 h-4 text-red-600" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Feedback */}
            {answerRevealed && answeredCurrent && (
              <div className={`mt-8 p-5 rounded-[8px] border ${isCurrentCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-start gap-3">
                  {isCurrentCorrect ? (
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <X className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <p className={`text-sm font-semibold tracking-wide uppercase ${isCurrentCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {isCurrentCorrect ? t('pyq.correct') : t('pyq.incorrect')}
                    </p>
                    {currentPYQ.explanation && (
                      <p className="mt-2 text-sm text-[#111827] leading-relaxed">
                        <strong className="block mb-1 text-xs uppercase tracking-wider text-[#6B7280]">{t('pyq.explanation')}</strong>
                        {currentPYQ.explanation}
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
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#6B7280] hover:text-[#111827] bg-white border border-[#EAEAEA] rounded-[8px] hover:bg-[#FAFAFA] disabled:opacity-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('pyq.previous')}
            </button>

            <div className="flex items-center gap-3">
              {!answerRevealed && (
                <button
                  onClick={handleRevealAnswer}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#111827] border border-[#111827] rounded-[8px] hover:bg-[#FAFAFA] transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  {t('pyq.revealAnswer')}
                </button>
              )}
              {answerRevealed && (
                <button
                  onClick={handleRevealAnswer}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#6B7280] border border-[#EAEAEA] bg-white rounded-[8px] hover:bg-[#FAFAFA] transition-colors"
                >
                  <EyeOff className="w-4 h-4" />
                  {t('pyq.hideAnswer')}
                </button>
              )}
            </div>

            <button
              onClick={handleNext}
              disabled={currentIndex === pyqs.length - 1}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#111827] text-white rounded-[8px] hover:bg-black disabled:opacity-50 transition-colors"
            >
              {t('pyq.next')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Question Navigator */}
          <div className="mt-8 p-6 bg-white rounded-[12px] shadow-sm border border-[#EAEAEA]">
            <h3 className="text-sm font-semibold text-[#111827] mb-4">{t('pyq.questionNavigator')}</h3>
            <div className="flex flex-wrap gap-2">
              {pyqs.map((pyq, index) => {
                const isAnswered = state.answers[pyq.id] !== undefined
                const isCurrent = pyq.id === currentPYQ.id
                const isCorrect = state.answers[pyq.id] === pyq.correct_answer

                let bgClass = 'bg-[#FAFAFA] border border-[#EAEAEA] text-[#6B7280] hover:bg-white hover:border-gray-300'
                if (isAnswered) {
                  bgClass = isCorrect ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                }
                if (isCurrent) {
                  bgClass = 'bg-[#111827] border-[#111827] text-white'
                }

                return (
                  <button
                    key={pyq.id}
                    onClick={() => {
                      setSelectedAnswer(state.answers[pyq.id] || null)
                      setAnswerRevealed(state.revealed[pyq.id] || false)
                    }}
                    className={`w-9 h-9 rounded-[8px] text-sm font-semibold border ${bgClass} transition-colors flex items-center justify-center`}
                  >
                    {index + 1}
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-6 mt-6 pt-4 border-t border-[#EAEAEA] text-xs font-medium text-[#6B7280]">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#FAFAFA] border border-[#EAEAEA] rounded-[4px]" />
                <span>{t('pyq.unanswered')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-50 border border-green-200 rounded-[4px]" />
                <span>{t('pyq.correct')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-50 border border-red-200 rounded-[4px]" />
                <span>{t('pyq.incorrect')}</span>
              </div>
            </div>
          </div>

          {/* Session Summary */}
          {state.score.total > 0 && (
            <div className="mt-6 p-6 bg-white border border-[#EAEAEA] rounded-[12px] shadow-sm">
              <h3 className="text-sm font-semibold text-[#111827] mb-4">{t('pyq.sessionSummary')}</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-[#FAFAFA] rounded-[8px] border border-[#EAEAEA]">
                  <p className="text-2xl font-bold text-green-600">{state.score.correct}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] mt-1">{t('pyq.correct')}</p>
                </div>
                <div className="p-4 bg-[#FAFAFA] rounded-[8px] border border-[#EAEAEA]">
                  <p className="text-2xl font-bold text-red-500">{state.score.incorrect}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] mt-1">{t('pyq.incorrect')}</p>
                </div>
                <div className="p-4 bg-[#111827] rounded-[8px] text-white">
                  <p className="text-2xl font-bold">{scorePercentage}%</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/70 mt-1">{t('pyq.accuracy')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
