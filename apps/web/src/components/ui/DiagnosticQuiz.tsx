'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { clsx } from 'clsx'
import { submitAssessment } from '@/lib/api/users'

interface DiagnosticQuizProps {
  onComplete: (answers: Record<string, string>, level: 'beginner' | 'intermediate' | 'advanced') => void
}

// Sample diagnostic questions - in production these would come from the API
const diagnosticQuestions = [
  {
    id: 'q1',
    subject: 'reasoning',
    question: 'If APPLE is coded as ELPPA, how is MANGO coded?',
    options: [
      { id: 'a', text: 'OGNAM' },
      { id: 'b', text: 'OGNMA' },
      { id: 'c', text: 'AGMON' },
      { id: 'd', text: 'NGOMA' },
    ],
  },
  {
    id: 'q2',
    subject: 'reasoning',
    question: 'Find the missing number: 2, 6, 12, 20, 30, ?',
    options: [
      { id: 'a', text: '40' },
      { id: 'b', text: '42' },
      { id: 'c', text: '44' },
      { id: 'd', text: '46' },
    ],
  },
  {
    id: 'q3',
    subject: 'math',
    question: 'If 15% of a number is 45, what is the number?',
    options: [
      { id: 'a', text: '300' },
      { id: 'b', text: '250' },
      { id: 'c', text: '200' },
      { id: 'd', text: '350' },
    ],
  },
  {
    id: 'q4',
    subject: 'math',
    question: 'The average of first 10 natural numbers is:',
    options: [
      { id: 'a', text: '5.5' },
      { id: 'b', text: '6' },
      { id: 'c', text: '5' },
      { id: 'd', text: '4.5' },
    ],
  },
  {
    id: 'q5',
    subject: 'gk',
    question: 'Who is known as the Father of the Indian Constitution?',
    options: [
      { id: 'a', text: 'Mahatma Gandhi' },
      { id: 'b', text: 'Jawaharlal Nehru' },
      { id: 'c', text: 'Dr. B.R. Ambedkar' },
      { id: 'd', text: 'Sardar Patel' },
    ],
  },
  {
    id: 'q6',
    subject: 'gk',
    question: 'Which planet is known as the Red Planet?',
    options: [
      { id: 'a', text: 'Venus' },
      { id: 'b', text: 'Mars' },
      { id: 'c', text: 'Jupiter' },
      { id: 'd', text: 'Saturn' },
    ],
  },
  {
    id: 'q7',
    subject: 'english',
    question: 'Choose the correct synonym of "Abundant":',
    options: [
      { id: 'a', text: 'Scarce' },
      { id: 'b', text: 'Plentiful' },
      { id: 'c', text: 'Rare' },
      { id: 'd', text: 'Limited' },
    ],
  },
  {
    id: 'q8',
    subject: 'english',
    question: 'Fill in the blank: "The committee has ___ its decision."',
    options: [
      { id: 'a', text: 'made' },
      { id: 'b', text: 'did' },
      { id: 'c', text: 'make' },
      { id: 'd', text: 'doing' },
    ],
  },
  {
    id: 'q9',
    subject: 'gk',
    question: 'Which is the largest state in India by area?',
    options: [
      { id: 'a', text: 'Madhya Pradesh' },
      { id: 'b', text: 'Uttar Pradesh' },
      { id: 'c', text: 'Rajasthan' },
      { id: 'd', text: 'Maharashtra' },
    ],
  },
  {
    id: 'q10',
    subject: 'gk',
    question: 'Who was the first President of India?',
    options: [
      { id: 'a', text: 'Dr. Rajendra Prasad' },
      { id: 'b', text: 'Dr. B.R. Ambedkar' },
      { id: 'c', text: 'Jawaharlal Nehru' },
      { id: 'd', text: 'Sardar Vallabhbhai Patel' },
    ],
  },
]

export function DiagnosticQuiz({ onComplete }: DiagnosticQuizProps) {
  const t = useTranslations()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const question = diagnosticQuestions[currentQuestion]
  const totalQuestions = diagnosticQuestions.length
  const progress = ((currentQuestion + 1) / totalQuestions) * 100

  const handleSelectAnswer = (optionId: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }))
  }

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Submit answers to API and get calculated level
      const result = await submitAssessment(answers)
      const level = result.level as 'beginner' | 'intermediate' | 'advanced'
      onComplete(answers, level)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit assessment')
      setIsSubmitting(false)
    }
  }

  const canProceed = answers[question.id] !== undefined

  return (
    <div className="w-full">
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-[8px] text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-[#6B7280] font-medium mb-3">
          <span>{t('onboarding.steps.assessment.question')} {currentQuestion + 1} {t('onboarding.steps.assessment.of')} {totalQuestions}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-[#EAEAEA] rounded-full">
          <div
            className="h-1.5 bg-[#111827] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-[12px] border border-[#EAEAEA] p-6 mb-8 shadow-sm">
        <div className="mb-4">
          <span className="text-xs font-semibold text-[#111827] uppercase tracking-wider bg-[#FAFAFA] border border-[#EAEAEA] px-2.5 py-1 rounded-[6px]">
            {t(`onboarding.steps.assessment.subjects.${question.subject}`)}
          </span>
        </div>
        <h3 className="text-lg font-medium text-[#111827] mb-6 leading-relaxed">
          {question.question}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelectAnswer(option.id)}
              className={clsx(
                'w-full text-left p-4 rounded-[8px] border transition-all duration-200 flex items-center',
                answers[question.id] === option.id
                  ? 'border-[#111827] bg-[#FAFAFA] shadow-sm'
                  : 'border-[#EAEAEA] hover:border-gray-300 bg-white hover:bg-[#FAFAFA]'
              )}
            >
              <span className={clsx(
                'inline-flex items-center justify-center w-6 h-6 rounded border mr-4 text-xs font-medium transition-colors border-[#EAEAEA]',
                answers[question.id] === option.id
                  ? 'bg-[#111827] text-white border-[#111827]'
                  : 'bg-white text-gray-500'
              )}>
                {option.id.toUpperCase()}
              </span>
              <span className={clsx(
                'font-medium text-sm',
                answers[question.id] === option.id ? 'text-[#111827]' : 'text-gray-700'
              )}>
                {option.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-[#EAEAEA] mt-6">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className={clsx(
            'px-5 py-2.5 rounded-[8px] text-sm font-medium transition-colors border border-[#EAEAEA]',
            currentQuestion === 0
              ? 'text-gray-400 cursor-not-allowed opacity-50 bg-[#FAFAFA]'
              : 'text-[#111827] hover:bg-[#FAFAFA] bg-white'
          )}
        >
          {t('common.previous')}
        </button>

        {currentQuestion < totalQuestions - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed}
            className={clsx(
              'px-6 py-2.5 rounded-[8px] text-sm font-medium transition-colors border',
              canProceed
                ? 'bg-[#111827] text-white border-[#111827] hover:bg-black'
                : 'bg-[#FAFAFA] text-gray-400 border-[#EAEAEA] cursor-not-allowed'
            )}
          >
            {t('common.next')}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== totalQuestions || isSubmitting}
            className={clsx(
              'px-6 py-2.5 rounded-[8px] text-sm font-medium transition-colors border',
              Object.keys(answers).length === totalQuestions && !isSubmitting
                ? 'bg-[#111827] text-white border-[#111827] hover:bg-black'
                : 'bg-[#FAFAFA] text-gray-400 border-[#EAEAEA] cursor-not-allowed'
            )}
          >
            {isSubmitting ? t('common.loading') : t('onboarding.steps.assessment.submit')}
          </button>
        )}
      </div>
    </div>
  )
}
