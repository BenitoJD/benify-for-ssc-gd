'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { clsx } from 'clsx'

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
    correctAnswer: 'a',
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
    correctAnswer: 'b',
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
    correctAnswer: 'a',
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
    correctAnswer: 'a',
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
    correctAnswer: 'c',
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
    correctAnswer: 'b',
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
    correctAnswer: 'b',
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
    correctAnswer: 'a',
  },
  {
    id: 'q9',
    subject: 'hindi',
    question: '"गुरु" शब्द का सही अर्थ क्या है?',
    options: [
      { id: 'a', text: 'शिक्षक' },
      { id: 'b', text: 'मित्र' },
      { id: 'c', text: 'शत्रु' },
      { id: 'd', text: 'राजा' },
    ],
    correctAnswer: 'a',
  },
  {
    id: 'q10',
    subject: 'hindi',
    question: 'निम्नलिखित में से कौन-सा सही वर्तनी है?',
    options: [
      { id: 'a', text: 'पुस्तकालय' },
      { id: 'b', text: 'पुस्तकालय' },
      { id: 'c', text: 'पुस्तकालय' },
      { id: 'd', text: 'पुस्तकालय' },
    ],
    correctAnswer: 'a',
  },
]

export function DiagnosticQuiz({ onComplete }: DiagnosticQuizProps) {
  const t = useTranslations()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleSubmit = () => {
    setIsSubmitting(true)
    
    // Calculate level based on correct answers
    let correctCount = 0
    diagnosticQuestions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++
      }
    })

    const percentage = (correctCount / totalQuestions) * 100
    let level: 'beginner' | 'intermediate' | 'advanced'
    
    if (percentage >= 70) {
      level = 'advanced'
    } else if (percentage >= 40) {
      level = 'intermediate'
    } else {
      level = 'beginner'
    }

    onComplete(answers, level)
    setIsSubmitting(false)
  }

  const canProceed = answers[question.id] !== undefined

  return (
    <div className="w-full">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{t('onboarding.steps.assessment.question')} {currentQuestion + 1} {t('onboarding.steps.assessment.of')} {totalQuestions}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-primary-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="mb-2">
          <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
            {t(`onboarding.steps.assessment.subjects.${question.subject}`)}
          </span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-6">
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
                'w-full text-left p-4 rounded-lg border-2 transition-all',
                answers[question.id] === option.id
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              )}
            >
              <span className={clsx(
                'inline-flex items-center justify-center w-6 h-6 rounded-full border mr-3 text-sm',
                answers[question.id] === option.id
                  ? 'border-primary-600 bg-primary-600 text-white'
                  : 'border-gray-300 text-gray-500'
              )}>
                {option.id.toUpperCase()}
              </span>
              <span className={answers[question.id] === option.id ? 'text-primary-700' : 'text-gray-700'}>
                {option.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className={clsx(
            'px-4 py-2 rounded-lg font-medium transition-colors',
            currentQuestion === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
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
              'px-6 py-2 rounded-lg font-medium transition-colors',
              canProceed
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
              'px-6 py-2 rounded-lg font-medium transition-colors',
              Object.keys(answers).length === totalQuestions && !isSubmitting
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
          >
            {isSubmitting ? t('common.loading') : t('onboarding.steps.assessment.submit')}
          </button>
        )}
      </div>
    </div>
  )
}
