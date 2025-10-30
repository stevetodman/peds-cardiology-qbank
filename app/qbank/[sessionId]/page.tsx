'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import NavBar from '@/components/NavBar'
import QuestionCard from '@/components/QuestionCard'
import { ChevronRight } from 'lucide-react'

interface Question {
  id: number
  question_text: string
  explanation: string
}

interface QuestionOption {
  id: number
  question_id: number
  option_text: string
  is_correct: boolean
}

interface Answer {
  id: number
  question_id: number
  selected_option_id: number | null
  is_correct: boolean | null
}

export default function SessionPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = Number(params.sessionId)
  const supabase = createClient()

  const [questions, setQuestions] = useState<Question[]>([])
  const [options, setOptions] = useState<QuestionOption[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [answered, setAnswered] = useState(false)

  useEffect(() => {
    async function fetchSessionData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch session answers to get the questions for this session
      const { data: sessionAnswers } = await supabase
        .from('session_answers')
        .select('id, question_id, selected_option_id, is_correct')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)

      if (!sessionAnswers || sessionAnswers.length === 0) {
        router.push('/qbank')
        return
      }

      setAnswers(sessionAnswers)

      // Fetch questions
      const questionIds = sessionAnswers.map(a => a.question_id)
      const { data: questionsData } = await supabase
        .from('questions')
        .select('*')
        .in('id', questionIds)

      // Fetch all options for these questions
      const { data: optionsData } = await supabase
        .from('question_options')
        .select('*')
        .in('question_id', questionIds)

      if (questionsData) setQuestions(questionsData)
      if (optionsData) setOptions(optionsData)

      setLoading(false)
    }

    fetchSessionData()
  }, [supabase, sessionId, router])

  const currentQuestion = questions[currentIndex]
  const currentOptions = options.filter(o => o.question_id === currentQuestion?.id)
  const currentAnswer = answers.find(a => a.question_id === currentQuestion?.id)

  const handleAnswer = async (questionId: number, selectedOptionId: number, isCorrect: boolean) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Update the session_answer
    await supabase
      .from('session_answers')
      .update({
        selected_option_id: selectedOptionId,
        is_correct: isCorrect
      })
      .eq('session_id', sessionId)
      .eq('question_id', questionId)
      .eq('user_id', user.id)

    // Update local state
    setAnswers(prev => prev.map(a =>
      a.question_id === questionId
        ? { ...a, selected_option_id: selectedOptionId, is_correct: isCorrect }
        : a
    ))

    setAnswered(true)
  }

  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setAnswered(false)
    } else {
      // Finish session
      finishSession()
    }
  }

  const finishSession = async () => {
    const correctCount = answers.filter(a => a.is_correct).length

    await supabase
      .from('sessions')
      .update({
        ended_at: new Date().toISOString(),
        correct_count: correctCount
      })
      .eq('id', sessionId)

    router.push(`/qbank/${sessionId}/results`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-lg text-gray-600">Loading questions...</p>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-lg text-gray-600">No questions found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-500">
              Session #{sessionId}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <QuestionCard
          question={currentQuestion}
          options={currentOptions}
          onAnswer={handleAnswer}
          showExplanation={answered}
        />

        {/* Next Button */}
        {answered && (
          <div className="mt-6">
            <button
              onClick={goToNext}
              className="w-full py-3 px-4 bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
            >
              {currentIndex < questions.length - 1 ? (
                <>
                  Next Question
                  <ChevronRight className="ml-2 h-5 w-5" />
                </>
              ) : (
                'Finish Quiz'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
