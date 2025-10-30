'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import NavBar from '@/components/NavBar'

interface Category {
  id: number
  name: string
}

export default function QBankPage() {
  const router = useRouter()
  const supabase = createClient()
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [questionCount, setQuestionCount] = useState(10)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (data) {
        setCategories(data)
        // Select all by default
        setSelectedCategories(data.map(c => c.id))
      }
    }
    fetchCategories()
  }, [supabase])

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const startQuiz = async () => {
    if (selectedCategories.length === 0) {
      alert('Please select at least one category')
      return
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Create a new session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        total_questions: questionCount,
        correct_count: 0
      })
      .select()
      .single()

    if (sessionError || !session) {
      alert('Failed to create session')
      setLoading(false)
      return
    }

    // Fetch random questions from selected categories
    const { data: questions } = await supabase
      .from('questions')
      .select('id')
      .in('category_id', selectedCategories)
      .limit(questionCount)

    if (!questions || questions.length === 0) {
      alert('No questions found in selected categories')
      setLoading(false)
      return
    }

    // Create session_answers for each question (not yet answered)
    const sessionAnswers = questions.map(q => ({
      session_id: session.id,
      user_id: user.id,
      question_id: q.id,
      is_correct: null,
      selected_option_id: null
    }))

    await supabase
      .from('session_answers')
      .insert(sessionAnswers)

    // Navigate to session page
    router.push(`/qbank/${session.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Question Bank Practice
        </h1>

        {/* Categories Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Select Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                  className="h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <span className="text-gray-900">{category.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Question Count */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Number of Questions
          </h2>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-2xl font-bold text-primary w-12 text-center">
              {questionCount}
            </span>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={startQuiz}
          disabled={loading || selectedCategories.length === 0}
          className="w-full py-4 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Starting Quiz...' : 'Start Practice Quiz'}
        </button>
      </div>
    </div>
  )
}
