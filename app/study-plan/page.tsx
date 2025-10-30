'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import NavBar from '@/components/NavBar'
import StudyPlanItem from '@/components/StudyPlanItem'
import { Plus } from 'lucide-react'

interface StudyTask {
  id: number
  title: string
  due_date: string | null
  completed: boolean
}

export default function StudyPlanPage() {
  const supabase = createClient()
  const [tasks, setTasks] = useState<StudyTask[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')
  const [adding, setAdding] = useState(false)

  const fetchTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('study_plan')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true, nullsFirst: false })

    if (data) {
      setTasks(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTasks()
  }, [supabase])

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    setAdding(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('study_plan')
      .insert({
        user_id: user.id,
        title: newTaskTitle,
        due_date: newTaskDueDate || null,
        completed: false
      })

    if (!error) {
      setNewTaskTitle('')
      setNewTaskDueDate('')
      setShowAddForm(false)
      fetchTasks()
    }

    setAdding(false)
  }

  const incompleteTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-lg text-gray-600">Loading study plan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Study Plan
          </h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Task</span>
          </button>
        </div>

        {/* Add Task Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              New Study Task
            </h2>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title
                </label>
                <input
                  id="task-title"
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Complete 10 Math questions"
                />
              </div>
              <div>
                <label htmlFor="task-due-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date (optional)
                </label>
                <input
                  id="task-due-date"
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {adding ? 'Adding...' : 'Add Task'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setNewTaskTitle('')
                    setNewTaskDueDate('')
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-900 rounded-md font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Incomplete Tasks */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            To Do ({incompleteTasks.length})
          </h2>
          {incompleteTasks.length > 0 ? (
            <div className="space-y-3">
              {incompleteTasks.map((task) => (
                <StudyPlanItem key={task.id} item={task} onUpdate={fetchTasks} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">
                No pending tasks. Click "Add Task" to create one.
              </p>
            </div>
          )}
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Completed ({completedTasks.length})
            </h2>
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <StudyPlanItem key={task.id} item={task} onUpdate={fetchTasks} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
