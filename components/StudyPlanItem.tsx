'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StudyPlanItemProps {
  item: {
    id: number
    title: string
    due_date: string | null
    completed: boolean
  }
  onUpdate: () => void
}

export default function StudyPlanItem({ item, onUpdate }: StudyPlanItemProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const toggleCompleted = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('study_plan')
      .update({ completed: !item.completed })
      .eq('id', item.id)

    if (!error) {
      onUpdate()
    }
    setLoading(false)
  }

  const deleteItem = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return

    setLoading(true)
    const { error } = await supabase
      .from('study_plan')
      .delete()
      .eq('id', item.id)

    if (!error) {
      onUpdate()
    }
    setLoading(false)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className={cn(
      "flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm",
      item.completed && "bg-gray-50 opacity-75"
    )}>
      <div className="flex items-center flex-1 space-x-3">
        <input
          type="checkbox"
          checked={item.completed}
          onChange={toggleCompleted}
          disabled={loading}
          className="h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
        />
        <div className="flex-1">
          <p className={cn(
            "text-gray-900 font-medium",
            item.completed && "line-through text-gray-500"
          )}>
            {item.title}
          </p>
          <p className="text-sm text-gray-500">
            {formatDate(item.due_date)}
          </p>
        </div>
      </div>

      <button
        onClick={deleteItem}
        disabled={loading}
        className="ml-4 text-red-600 hover:text-red-800 disabled:opacity-50"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  )
}
