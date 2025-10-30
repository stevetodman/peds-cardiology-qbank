import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import FlashcardCard from '../FlashcardCard'

const mockFlashcard = {
  id: 1,
  front_text: 'What is the most common congenital heart defect?',
  back_text: 'Ventricular Septal Defect (VSD)',
}

describe('FlashcardCard Component', () => {
  it('should render the front text initially', () => {
    render(<FlashcardCard flashcard={mockFlashcard} />)
    expect(screen.getByText(mockFlashcard.front_text)).toBeInTheDocument()
    expect(screen.getByText('Front')).toBeInTheDocument()
  })

  it('should not show back text initially', () => {
    render(<FlashcardCard flashcard={mockFlashcard} />)
    expect(screen.queryByText(mockFlashcard.back_text)).not.toBeInTheDocument()
  })

  it('should flip to back when flip button is clicked', () => {
    render(<FlashcardCard flashcard={mockFlashcard} />)

    const flipButton = screen.getByRole('button', { name: /flip card/i })
    fireEvent.click(flipButton)

    expect(screen.getByText(mockFlashcard.back_text)).toBeInTheDocument()
    expect(screen.getByText('Back')).toBeInTheDocument()
    expect(screen.queryByText(mockFlashcard.front_text)).not.toBeInTheDocument()
  })

  it('should flip back to front when clicked again', () => {
    render(<FlashcardCard flashcard={mockFlashcard} />)

    const flipButton = screen.getByRole('button', { name: /flip card/i })

    // Flip to back
    fireEvent.click(flipButton)
    expect(screen.getByText(mockFlashcard.back_text)).toBeInTheDocument()

    // Flip back to front
    fireEvent.click(flipButton)
    expect(screen.getByText(mockFlashcard.front_text)).toBeInTheDocument()
    expect(screen.queryByText(mockFlashcard.back_text)).not.toBeInTheDocument()
  })

  it('should have flip button visible', () => {
    render(<FlashcardCard flashcard={mockFlashcard} />)
    const flipButton = screen.getByRole('button', { name: /flip card/i })
    expect(flipButton).toBeInTheDocument()
  })
})
