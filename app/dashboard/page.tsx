'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import NavBar from '@/components/NavBar'
import Link from 'next/link'
import { BookOpen, GraduationCap, Calendar, FileText } from 'lucide-react'

interface Stats {
  totalQuestions: number
  correctAnswers: number
  totalSessions: number
  upcomingTasks: Array<{
    id: number
    title: string
    due_date: string | null
  }>
}

export default function DashboardPage() {
  const supabase = createClient()
  const [stats, setStats] = useState<Stats>({
    totalQuestions: 0,
    correctAnswers: 0,
    totalSessions: 0,
    upcomingTasks: []
  })
  const [userName, setUserName] = useState<string>('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      setUserName(profile?.full_name || 'User')

      // Fetch session stats
      const { data: answers } = await supabase
        .from('session_answers')
        .select('is_correct')
        .eq('user_id', user.id)

      const totalQuestions = answers?.length || 0
      const correctAnswers = answers?.filter(a => a.is_correct).length || 0

      // Fetch total sessions
      const { data: sessions } = await supabase
        .from('sessions')
        .select('id')
        .eq('user_id', user.id)

      // Fetch upcoming tasks (incomplete, ordered by due date)
      const { data: tasks } = await supabase
        .from('study_plan')
        .select('id, title, due_date')
        .eq('user_id', user.id)
        .eq('completed', false)
        .order('due_date', { ascending: true })
        .limit(5)

      setStats({
        totalQuestions,
        correctAnswers,
        totalSessions: sessions?.length || 0,
        upcomingTasks: tasks || []
      })

      setLoading(false)
    }

    fetchDashboardData()
  }, [supabase])

  const percentage = stats.totalQuestions > 0
    ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100)
    : 0

  const quickLinks = [
    { href: '/qbank', label: 'Start Practice', icon: BookOpen, color: 'bg-blue-500' },
    { href: '/flashcards', label: 'Review Flashcards', icon: GraduationCap, color: 'bg-green-500' },
    { href: '/study-plan', label: 'Study Plan', icon: Calendar, color: 'bg-purple-500' },
    { href: '/notebook', label: 'Notebook', icon: FileText, color: 'bg-orange-500' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {userName}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here&apos;s your learning progress and upcoming tasks
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Questions Answered</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalQuestions}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Accuracy</h3>
            <p className="text-3xl font-bold text-gray-900">{percentage}%</p>
            <p className="text-sm text-gray-500 mt-1">
              {stats.correctAnswers} / {stats.totalQuestions} correct
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Practice Sessions</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalSessions}</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className={`${link.color} p-3 rounded-lg mr-4`}>
                  <link.icon className="h-6 w-6 text-white" />
                </div>
                <span className="font-medium text-gray-900">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Tasks</h2>
          {stats.upcomingTasks.length > 0 ? (
            <ul className="space-y-3">
              {stats.upcomingTasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <span className="text-gray-900">{task.title}</span>
                  {task.due_date && (
                    <span className="text-sm text-gray-500">
                      {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No upcoming tasks. <Link href="/study-plan" className="text-primary hover:underline">Create one</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
