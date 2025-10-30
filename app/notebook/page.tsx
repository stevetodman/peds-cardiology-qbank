'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import NavBar from '@/components/NavBar'
import { Plus, Trash2, Edit } from 'lucide-react'

interface Note {
  id: number
  title: string | null
  content: string | null
  question_id: number | null
  created_at: string
}

export default function NotebookPage() {
  const supabase = createClient()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchNotes = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      setNotes(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchNotes()
  }, [supabase])

  const handleNewNote = () => {
    setEditingNote(null)
    setNoteTitle('')
    setNoteContent('')
    setShowEditor(true)
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setNoteTitle(note.title || '')
    setNoteContent(note.content || '')
    setShowEditor(true)
  }

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (editingNote) {
      // Update existing note
      const { error } = await supabase
        .from('notes')
        .update({
          title: noteTitle,
          content: noteContent
        })
        .eq('id', editingNote.id)

      if (!error) {
        setShowEditor(false)
        fetchNotes()
      }
    } else {
      // Create new note
      const { error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title: noteTitle,
          content: noteContent,
          question_id: null
        })

      if (!error) {
        setShowEditor(false)
        setNoteTitle('')
        setNoteContent('')
        fetchNotes()
      }
    }

    setSaving(false)
  }

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)

    if (!error) {
      fetchNotes()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-lg text-gray-600">Loading notebook...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Notebook
          </h1>
          <button
            onClick={handleNewNote}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>New Note</span>
          </button>
        </div>

        {/* Note Editor */}
        {showEditor && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingNote ? 'Edit Note' : 'New Note'}
            </h2>
            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label htmlFor="note-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  id="note-title"
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Note title"
                />
              </div>
              <div>
                <label htmlFor="note-content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  id="note-content"
                  rows={8}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Write your notes here..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Note'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditor(false)
                    setNoteTitle('')
                    setNoteContent('')
                    setEditingNote(null)
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-900 rounded-md font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notes List */}
        {notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div key={note.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {note.title || 'Untitled Note'}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {note.content || 'No content'}
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    {new Date(note.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditNote(note)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="text-sm">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-lg text-gray-600 mb-4">
              You haven't created any notes yet.
            </p>
            <button
              onClick={handleNewNote}
              className="px-6 py-3 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              Create Your First Note
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
