'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import NavBar from '@/components/NavBar'
import Link from 'next/link'
import { CheckCircle, XCircle, Home } from 'lucide-react'

interface SessionResult {
  total_questions: number
  correct_count: number
  started_at: string
  ended_at: string
}

interface AnswerDetail {
  question_text: string
  explanation: string
  selected_option_text: string
  correct_option_text: string
  is_correct: boolean
}

export default function ResultsPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = Number(params.sessionId)
  const supabase = createClient()

  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null)
  const [answerDetails, setAnswerDetails] = useState<AnswerDetail[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchResults() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch session
      const { data: session } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single()

      if (!session) {
        router.push('/qbank')
        return
      }

      setSessionResult(session)

      // Fetch detailed answers
      const { data: answers } = await supabase
        .from('session_answers')
        .select(`
          is_correct,
          selected_option_id,
          questions (
            question_text,
            explanation
          )
        `)
        .eq('session_id', sessionId)
        .eq('user_id', user.id)

      if (answers) {
        const details: AnswerDetail[] = []

        for (const answer of answers) {
          // Get selected option text
          const { data: selectedOption } = await supabase
            .from('question_options')
            .select('option_text')
            .eq('id', answer.selected_option_id)
            .single()

          // Get correct option text
          const { data: options } = await supabase
            .from('question_options')
            .select('option_text, question_id')
            .eq('question_id', (answer as any).questions.id)
            .eq('is_correct', true)
            .single()

          // Fix type assertion
          const question = answer.questions as any

          details.push({
            question_text: question.question_text,
            explanation: question.explanation,
            selected_option_text: selectedOption?.option_text || '',
            correct_option_text: options?.option_text || '',
            is_correct: answer.is_correct || false
          })
        }

        setAnswerDetails(details)
      }

      setLoading(false)
    }

    fetchResults()
  }, [supabase, sessionId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-lg text-gray-600">Loading results...</p>
        </div>
      </div>
    )
  }

  if (!sessionResult) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-lg text-gray-600">Session not found</p>
        </div>
      </div>
    )
  }

  const percentage = Math.round((sessionResult.correct_count / sessionResult.total_questions) * 100)

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Summary */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Quiz Complete!
          </h1>
          <div className="text-center mb-6">
            <div className={`text-6xl font-bold mb-2 ${percentage >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
              {percentage}%
            </div>
            <p className="text-xl text-gray-600">
              {sessionResult.correct_count} out of {sessionResult.total_questions} correct
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <Link
              href="/qbank"
              className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              <span>Start New Quiz</span>
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 px-6 py-3 bg-gray-200 text-gray-900 rounded-md font-medium hover:bg-gray-300 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Detailed Review */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Question Review</h2>
          {answerDetails.map((detail, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start mb-4">
                {detail.is_correct ? (
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Question {index + 1}
                  </h3>
                  <p className="text-gray-800 mb-3">{detail.question_text}</p>

                  <div className="space-y-2">
                    {!detail.is_correct && (
                      <p className="text-sm">
                        <span className="font-medium text-red-700">Your answer: </span>
                        <span className="text-gray-700">{detail.selected_option_text}</span>
                      </p>
                    )}
                    <p className="text-sm">
                      <span className="font-medium text-green-700">Correct answer: </span>
                      <span className="text-gray-700">{detail.correct_option_text}</span>
                    </p>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded-md border-l-4 border-blue-500">
                    <h4 className="font-semibold text-blue-900 mb-1">Explanation:</h4>
                    <p className="text-blue-800 text-sm">{detail.explanation}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
