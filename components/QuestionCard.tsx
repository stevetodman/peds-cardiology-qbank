'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface QuestionOption {
  id: number
  option_text: string
  is_correct: boolean
}

interface QuestionCardProps {
  question: {
    id: number
    question_text: string
    explanation: string
  }
  options: QuestionOption[]
  onAnswer: (questionId: number, selectedOptionId: number, isCorrect: boolean) => void
  showExplanation?: boolean
}

export default function QuestionCard({
  question,
  options,
  onAnswer,
  showExplanation = false
}: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (selectedOption === null) return

    const selectedOpt = options.find(opt => opt.id === selectedOption)
    if (selectedOpt) {
      setSubmitted(true)
      onAnswer(question.id, selectedOption, selectedOpt.is_correct)
    }
  }

  const getOptionClassName = (option: QuestionOption) => {
    if (!submitted) {
      return cn(
        "p-4 border rounded-lg cursor-pointer transition-all",
        selectedOption === option.id
          ? "border-primary bg-primary/10"
          : "border-gray-300 hover:border-primary/50 hover:bg-gray-50"
      )
    }

    // After submission, show correct/incorrect
    if (option.is_correct) {
      return "p-4 border-2 border-green-500 bg-green-50 rounded-lg"
    }

    if (selectedOption === option.id && !option.is_correct) {
      return "p-4 border-2 border-red-500 bg-red-50 rounded-lg"
    }

    return "p-4 border border-gray-300 bg-gray-50 rounded-lg opacity-60"
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {question.question_text}
        </h2>
      </div>

      <div className="space-y-3 mb-6">
        {options.map((option, index) => (
          <div
            key={option.id}
            className={getOptionClassName(option)}
            onClick={() => !submitted && setSelectedOption(option.id)}
          >
            <div className="flex items-start">
              <span className="font-semibold mr-3 text-gray-700">
                {String.fromCharCode(65 + index)}.
              </span>
              <span className="flex-1 text-gray-900">{option.option_text}</span>
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={selectedOption === null}
          className="w-full py-3 px-4 bg-primary text-white rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Submit Answer
        </button>
      ) : (
        <div className="mt-6">
          {showExplanation && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <h3 className="font-semibold text-blue-900 mb-2">Explanation:</h3>
              <p className="text-blue-800">{question.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
