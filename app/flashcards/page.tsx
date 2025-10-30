'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import NavBar from '@/components/NavBar'
import FlashcardCard from '@/components/FlashcardCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Flashcard {
  id: number
  front_text: string
  back_text: string
  category_id: number | null
}

interface Category {
  id: number
  name: string
}

export default function FlashcardsPage() {
  const supabase = createClient()
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (categoriesData) {
        setCategories(categoriesData)
      }

      // Fetch all flashcards initially
      const { data: flashcardsData } = await supabase
        .from('flashcards')
        .select('*')

      if (flashcardsData) {
        setFlashcards(flashcardsData)
      }

      setLoading(false)
    }

    fetchData()
  }, [supabase])

  useEffect(() => {
    async function fetchFilteredFlashcards() {
      if (selectedCategory === null) {
        // Fetch all flashcards
        const { data } = await supabase
          .from('flashcards')
          .select('*')

        if (data) {
          setFlashcards(data)
          setCurrentIndex(0)
        }
      } else {
        // Fetch flashcards for selected category
        const { data } = await supabase
          .from('flashcards')
          .select('*')
          .eq('category_id', selectedCategory)

        if (data) {
          setFlashcards(data)
          setCurrentIndex(0)
        }
      }
    }

    fetchFilteredFlashcards()
  }, [selectedCategory, supabase])

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const goToNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-lg text-gray-600">Loading flashcards...</p>
        </div>
      </div>
    )
  }

  const currentFlashcard = flashcards[currentIndex]

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Flashcards
        </h1>

        {/* Category Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Filter by Category
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {flashcards.length > 0 && currentFlashcard ? (
          <>
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Card {currentIndex + 1} of {flashcards.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Flashcard */}
            <FlashcardCard flashcard={currentFlashcard} />

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-200 text-gray-900 rounded-md font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Previous</span>
              </button>
              <button
                onClick={goToNext}
                disabled={currentIndex === flashcards.length - 1}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-lg text-gray-600">
              No flashcards found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
