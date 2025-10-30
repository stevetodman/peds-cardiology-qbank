import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import StudyPlanItem from '../StudyPlanItem'
import { createClient } from '@/lib/supabase/client'

// Mock the Supabase client
jest.mock('@/lib/supabase/client')

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

const mockTask = {
  id: 1,
  title: 'Review Tetralogy of Fallot',
  due_date: '2025-11-01',
  completed: false,
}

const mockCompletedTask = {
  id: 2,
  title: 'Study VSD pathophysiology',
  due_date: '2025-10-25',
  completed: true,
}

describe('StudyPlanItem Component', () => {
  const mockOnUpdate = jest.fn()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any

  beforeEach(() => {
    mockOnUpdate.mockClear()

    mockSupabase = {
      from: jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      })),
    }

    mockCreateClient.mockReturnValue(mockSupabase)
  })

  it('should render task title', () => {
    render(<StudyPlanItem item={mockTask} onUpdate={mockOnUpdate} />)
    expect(screen.getByText(mockTask.title)).toBeInTheDocument()
  })

  it('should display formatted due date', () => {
    render(<StudyPlanItem item={mockTask} onUpdate={mockOnUpdate} />)
    expect(screen.getByText(/Nov 1, 2025/i)).toBeInTheDocument()
  })

  it('should show checkbox as unchecked for incomplete tasks', () => {
    render(<StudyPlanItem item={mockTask} onUpdate={mockOnUpdate} />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
  })

  it('should show checkbox as checked for completed tasks', () => {
    render(<StudyPlanItem item={mockCompletedTask} onUpdate={mockOnUpdate} />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('should have strike-through text for completed tasks', () => {
    render(<StudyPlanItem item={mockCompletedTask} onUpdate={mockOnUpdate} />)
    const title = screen.getByText(mockCompletedTask.title)
    expect(title).toHaveClass('line-through')
  })

  it('should not have strike-through text for incomplete tasks', () => {
    render(<StudyPlanItem item={mockTask} onUpdate={mockOnUpdate} />)
    const title = screen.getByText(mockTask.title)
    expect(title).not.toHaveClass('line-through')
  })

  it('should toggle task completion when checkbox is clicked', async () => {
    render(<StudyPlanItem item={mockTask} onUpdate={mockOnUpdate} />)

    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    // Wait for async operations
    await screen.findByRole('checkbox')

    expect(mockSupabase.from).toHaveBeenCalledWith('study_plan')
  })

  it('should show delete button', () => {
    render(<StudyPlanItem item={mockTask} onUpdate={mockOnUpdate} />)
    const deleteButton = screen.getByRole('button')
    expect(deleteButton).toBeInTheDocument()
  })

  it('should handle task with no due date', () => {
    const taskWithoutDueDate = { ...mockTask, due_date: null }
    render(<StudyPlanItem item={taskWithoutDueDate} onUpdate={mockOnUpdate} />)
    expect(screen.getByText(taskWithoutDueDate.title)).toBeInTheDocument()
    expect(screen.queryByText(/Nov 1, 2025/i)).not.toBeInTheDocument()
  })
})
