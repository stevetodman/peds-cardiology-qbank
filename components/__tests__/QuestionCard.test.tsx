import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import QuestionCard from '../QuestionCard'

const mockQuestion = {
  id: 1,
  question_text: 'What is a common symptom of Tetralogy of Fallot?',
  explanation: 'Cyanosis is a hallmark symptom due to right-to-left shunting.',
}

const mockOptions = [
  { id: 1, option_text: 'Cyanosis', is_correct: true },
  { id: 2, option_text: 'Hypertension', is_correct: false },
  { id: 3, option_text: 'Bradycardia', is_correct: false },
  { id: 4, option_text: 'Fever', is_correct: false },
]

describe('QuestionCard Component', () => {
  const mockOnAnswer = jest.fn()

  beforeEach(() => {
    mockOnAnswer.mockClear()
  })

  it('should render the question text', () => {
    render(
      <QuestionCard
        question={mockQuestion}
        options={mockOptions}
        onAnswer={mockOnAnswer}
      />
    )
    expect(screen.getByText(mockQuestion.question_text)).toBeInTheDocument()
  })

  it('should render all options', () => {
    render(
      <QuestionCard
        question={mockQuestion}
        options={mockOptions}
        onAnswer={mockOnAnswer}
      />
    )
    mockOptions.forEach((option) => {
      expect(screen.getByText(option.option_text)).toBeInTheDocument()
    })
  })

  it('should display options with letter labels (A, B, C, D)', () => {
    render(
      <QuestionCard
        question={mockQuestion}
        options={mockOptions}
        onAnswer={mockOnAnswer}
      />
    )
    expect(screen.getByText('A.')).toBeInTheDocument()
    expect(screen.getByText('B.')).toBeInTheDocument()
    expect(screen.getByText('C.')).toBeInTheDocument()
    expect(screen.getByText('D.')).toBeInTheDocument()
  })

  it('should have submit button disabled initially', () => {
    render(
      <QuestionCard
        question={mockQuestion}
        options={mockOptions}
        onAnswer={mockOnAnswer}
      />
    )
    const submitButton = screen.getByRole('button', { name: /submit answer/i })
    expect(submitButton).toBeDisabled()
  })

  it('should enable submit button after selecting an option', () => {
    render(
      <QuestionCard
        question={mockQuestion}
        options={mockOptions}
        onAnswer={mockOnAnswer}
      />
    )

    const firstOption = screen.getByText('Cyanosis')
    fireEvent.click(firstOption)

    const submitButton = screen.getByRole('button', { name: /submit answer/i })
    expect(submitButton).not.toBeDisabled()
  })

  it('should call onAnswer with correct parameters when submitted', () => {
    render(
      <QuestionCard
        question={mockQuestion}
        options={mockOptions}
        onAnswer={mockOnAnswer}
      />
    )

    // Select correct option
    const correctOption = screen.getByText('Cyanosis')
    fireEvent.click(correctOption)

    const submitButton = screen.getByRole('button', { name: /submit answer/i })
    fireEvent.click(submitButton)

    expect(mockOnAnswer).toHaveBeenCalledWith(1, 1, true)
  })

  it('should show explanation after submission when showExplanation is true', () => {
    render(
      <QuestionCard
        question={mockQuestion}
        options={mockOptions}
        onAnswer={mockOnAnswer}
        showExplanation={true}
      />
    )

    const firstOption = screen.getByText('Cyanosis')
    fireEvent.click(firstOption)

    const submitButton = screen.getByRole('button', { name: /submit answer/i })
    fireEvent.click(submitButton)

    expect(screen.getByText(mockQuestion.explanation)).toBeInTheDocument()
  })

  it('should not show explanation when showExplanation is false', () => {
    render(
      <QuestionCard
        question={mockQuestion}
        options={mockOptions}
        onAnswer={mockOnAnswer}
        showExplanation={false}
      />
    )

    const firstOption = screen.getByText('Cyanosis')
    fireEvent.click(firstOption)

    const submitButton = screen.getByRole('button', { name: /submit answer/i })
    fireEvent.click(submitButton)

    expect(screen.queryByText(mockQuestion.explanation)).not.toBeInTheDocument()
  })

  it('should prevent option selection after submission', () => {
    render(
      <QuestionCard
        question={mockQuestion}
        options={mockOptions}
        onAnswer={mockOnAnswer}
      />
    )

    // Select and submit first option
    const firstOption = screen.getByText('Cyanosis')
    fireEvent.click(firstOption)

    const submitButton = screen.getByRole('button', { name: /submit answer/i })
    fireEvent.click(submitButton)

    // Try to click another option
    const secondOption = screen.getByText('Hypertension')
    fireEvent.click(secondOption)

    // Should only have been called once
    expect(mockOnAnswer).toHaveBeenCalledTimes(1)
  })
})
