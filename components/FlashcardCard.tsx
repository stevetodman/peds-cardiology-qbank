'use client'

import { useState } from 'react'
import { RotateCw } from 'lucide-react'

interface FlashcardCardProps {
  flashcard: {
    id: number
    front_text: string
    back_text: string
  }
}

export default function FlashcardCard({ flashcard }: FlashcardCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div className="bg-white shadow-lg rounded-lg p-8 max-w-2xl mx-auto min-h-[300px] flex flex-col justify-between">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500 mb-4">
            {isFlipped ? 'Back' : 'Front'}
          </p>
          <p className="text-xl text-gray-900 leading-relaxed">
            {isFlipped ? flashcard.back_text : flashcard.front_text}
          </p>
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors"
        >
          <RotateCw className="h-4 w-4" />
          <span>Flip Card</span>
        </button>
      </div>
    </div>
  )
}
