'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [meetings, setMeetings] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      fetchMeetings(user.id)
    }
    getUser()
  }, [])

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(meetings)
      return
    }
    const q = search.toLowerCase()
    setFiltered(
      meetings.filter((m) =>
        m.title?.toLowerCase().includes(q) ||
        m.department?.toLowerCase().includes(q) ||
        m.meeting_type?.toLowerCase().includes(q) ||
        m.participants?.some((p) => p.toLowerCase().includes(q)) ||
        m.ai_result?.executive_summary?.toLowerCase().includes(q) ||
        m.ai_result?.decisions_made?.some((d) => d.toLowerCase().includes(q)) ||
        m.ai_result?.action_items?.some((a) => a.task?.toLowerCase().includes(q))
      )
    )
  }, [search, meetings])

  const fetchMeetings = async (userId) => {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!error) {
      setMeetings(data)
      setFiltered(data)
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const deleteMeeting = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Delete this meeting?')) return
    await supabase.from('meetings').delete().eq('id', id)
    setMeetings(meetings.filter((m) => m.id !== id))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎙️</span>
            <span className="font-semibold text-gray-900">AI Meeting Assistant</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Meetings</h1>
            <p className="text-gray-500 text-sm mt-1">
              {filtered.length} of {meetings.length} meeting{meetings.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => router.push('/meetings/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + New Meeting
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, department, participant, or AI results..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            )}
          </div>
          {search && (
            <p className="text-xs text-gray-500 mt-2 ml-1">
              {filtered.length === 0
                ? 'No meetings found'
                : `Found ${filtered.length} meeting${filtered.length !== 1 ? 's' : ''} matching "${search}"`}
            </p>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-semibold text-gray-900">{meetings.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total Meetings</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-semibold text-green-600">
              {meetings.filter(m => m.ai_result).length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Analyzed</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-semibold text-blue-600">
              {meetings.reduce((acc, m) => acc + (m.ai_result?.action_items?.length || 0), 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Action Items</p>
          </div>
        </div>

        {/* Meetings List */}
        {filtered.length === 0 && !search ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-4">🎙️</div>
            <h3 className="text-gray-900 font-medium mb-2">No meetings yet</h3>
            <p className="text-gray-500 text-sm mb-6">
              Create your first meeting to get started
            </p>
            <button
              onClick={() => router.push('/meetings/new')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Create Meeting
            </button>
          </div>
        ) : filtered.length === 0 && search ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-gray-900 font-medium mb-2">No results found</h3>
            <p className="text-gray-500 text-sm">
              Try searching for a different term
            </p>
            <button
              onClick={() => setSearch('')}
              className="mt-4 text-blue-600 text-sm hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((meeting) => (
              <div
                key={meeting.id}
                onClick={() => router.push(`/meetings/${meeting.id}/analyze`)}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {meeting.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-xs text-gray-500">📅 {meeting.date}</span>
                      {meeting.department && (
                        <span className="text-xs text-gray-500">🏢 {meeting.department}</span>
                      )}
                      {meeting.meeting_type && (
                        <span className="text-xs text-gray-500">📋 {meeting.meeting_type}</span>
                      )}
                      {meeting.participants?.length > 0 && (
                        <span className="text-xs text-gray-500">
                          👥 {meeting.participants.slice(0, 3).join(', ')}
                          {meeting.participants.length > 3 && ` +${meeting.participants.length - 3}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      meeting.ai_result
                        ? 'bg-green-50 text-green-700'
                        : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      {meeting.ai_result ? '✅ Analyzed' : '⏳ Pending'}
                    </span>
                    <button
                      onClick={(e) => deleteMeeting(meeting.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all text-lg leading-none"
                    >
                      🗑
                    </button>
                  </div>
                </div>

                {meeting.ai_result && (
                  <p className="text-xs text-gray-500 mt-3 line-clamp-2 leading-relaxed">
                    {meeting.ai_result.executive_summary}
                  </p>
                )}

                {meeting.ai_result?.action_items?.length > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      {meeting.ai_result.action_items.length} action items
                    </span>
                    {meeting.ai_result?.risks?.length > 0 && (
                      <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full">
                        {meeting.ai_result.risks.length} risks
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  )
}