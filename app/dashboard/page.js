'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/TopNav'
import { useTheme } from '@/lib/useTheme'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import {
  Search, Plus, Trash2, CheckCircle2, Clock, Users,
  AlertTriangle, TrendingUp, X, Sparkles, ChevronLeft, ChevronRight, ListChecks
} from 'lucide-react'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [meetings, setMeetings] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [calDate, setCalDate] = useState(new Date())
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      fetchMeetings(user.id)
    }
    getUser()
  }, [])

  useEffect(() => {
    if (!search.trim()) { setFiltered(meetings); return }
    const q = search.toLowerCase()
    setFiltered(meetings.filter((m) =>
      m.title?.toLowerCase().includes(q) ||
      m.department?.toLowerCase().includes(q) ||
      m.meeting_type?.toLowerCase().includes(q) ||
      m.participants?.some((p) => p.toLowerCase().includes(q)) ||
      m.ai_result?.executive_summary?.toLowerCase().includes(q)
    ))
  }, [search, meetings])

  const fetchMeetings = async (userId) => {
    const { data, error } = await supabase
      .from('meetings').select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (!error) { setMeetings(data); setFiltered(data) }
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

  const totalActionItems = meetings.reduce((acc, m) => acc + (m.ai_result?.action_items?.length || 0), 0)
  const totalRisks = meetings.reduce((acc, m) => acc + (m.ai_result?.risks?.length || 0), 0)
  const analyzedCount = meetings.filter(m => m.ai_result).length

  // mini calendar logic
  const year = calDate.getFullYear()
  const month = calDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = calDate.toLocaleString('default', { month: 'long' })
  const todayKey = new Date().toISOString().split('T')[0]

  const meetingDates = new Set(meetings.map(m => m.date))
  const formatKey = (day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const recentAnalyzed = meetings.filter(m => m.ai_result).slice(0, 3)
  // Analytics: action items by priority
  const priorityCounts = { High: 0, Medium: 0, Low: 0 }
  meetings.forEach(m => {
    m.ai_result?.action_items?.forEach(item => {
      if (priorityCounts[item.priority] !== undefined) priorityCounts[item.priority]++
    })
  })
  const priorityData = [
    { name: 'High', value: priorityCounts.High },
    { name: 'Medium', value: priorityCounts.Medium },
    { name: 'Low', value: priorityCounts.Low },
  ]
  const PRIORITY_COLORS = ['#e0507a', '#f5b942', '#27ae60']

  // Analytics: meetings by department
  const deptCounts = {}
  meetings.forEach(m => {
    const dept = m.department || 'Other'
    deptCounts[dept] = (deptCounts[dept] || 0) + 1
  })
  const deptData = Object.entries(deptCounts).map(([name, count]) => ({ name, count }))

  // Analytics: meetings by type
  const typeCounts = {}
  meetings.forEach(m => {
    const type = m.meeting_type || 'Other'
    typeCounts[type] = (typeCounts[type] || 0) + 1
  })
  const typeData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }))
  const TYPE_COLORS = ['#6378FF', '#A78BFA', '#2196b8', '#27ae60', '#f5b942', '#e0507a', '#8b5cf6', '#06b6d4']

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border-color)', borderTopColor: '#6378FF' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <TopNav userEmail={user?.email} onSignOut={handleSignOut} theme={theme} toggleTheme={toggleTheme} />

      <main className="pt-20 px-4 sm:px-8 pb-8 max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Hi {user?.email?.split('@')[0]},</p>
            <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Welcome Back! 👋</h1>
          </div>
          <button
            onClick={() => router.push('/meetings/new')}
            className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'linear-gradient(135deg, #6378FF, #A78BFA)', boxShadow: '0 6px 16px rgba(99,120,255,0.3)' }}
          >
            <Plus size={16} />
            New Meeting
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* LEFT: Main content */}
          <div className="lg:col-span-2 space-y-5">

            {/* Stat cards - soft pastel */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Meetings', value: meetings.length, icon: TrendingUp, bg: 'var(--bg-soft-blue)', fg: '#2196b8' },
                { label: 'Analyzed', value: analyzedCount, icon: CheckCircle2, bg: 'var(--bg-soft-green)', fg: '#27ae60' },
                { label: 'Tasks', value: totalActionItems, icon: ListChecks, bg: 'var(--bg-soft-purple)', fg: '#6378FF' },
                { label: 'Risks', value: totalRisks, icon: AlertTriangle, bg: 'var(--bg-soft-pink)', fg: '#e0507a' },
              ].map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="rounded-2xl p-4 shadow-sm" style={{ background: stat.bg }}>
                    <Icon size={18} style={{ color: stat.fg }} className="mb-3" />
                    <p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
                  </div>
                )
              })}
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search meetings, participants, decisions..."
                className="w-full pl-10 pr-10 py-3 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }}>
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Meeting list */}
            {filtered.length === 0 ? (
              <div className="rounded-2xl p-12 text-center shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--bg-soft-purple)' }}>
                  <Sparkles size={24} style={{ color: '#6378FF' }} />
                </div>
                <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {search ? 'No results found' : 'No meetings yet'}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {search ? 'Try a different search term' : 'Create your first meeting to get started'}
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filtered.map((meeting) => (
                  <div
                    key={meeting.id}
                    onClick={() => router.push(`/meetings/${meeting.id}/analyze`)}
                    className="rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{meeting.title}</h3>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                            <Clock size={11} /> {meeting.date}
                          </span>
                          {meeting.department && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--bg-soft-purple)', color: '#6378FF' }}>
                              {meeting.department}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{
                          background: meeting.ai_result ? 'var(--bg-soft-green)' : 'var(--bg-soft-pink)',
                          color: meeting.ai_result ? '#27ae60' : '#e0507a'
                        }}>
                          {meeting.ai_result ? 'Analyzed' : 'Pending'}
                        </span>
                        <button
                          onClick={(e) => deleteMeeting(meeting.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all hover:bg-red-50"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Calendar + recent activity */}
          <div className="space-y-5">

            {/* Mini Calendar */}
            <div className="rounded-2xl p-5 shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{monthName} {year}</h3>
                <div className="flex gap-1">
                  <button onClick={() => setCalDate(new Date(year, month - 1, 1))} className="p-1 rounded-lg hover:bg-black/5" style={{ color: 'var(--text-secondary)' }}>
                    <ChevronLeft size={14} />
                  </button>
                  <button onClick={() => setCalDate(new Date(year, month + 1, 1))} className="p-1 rounded-lg hover:bg-black/5" style={{ color: 'var(--text-secondary)' }}>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1">
                {['S','M','T','W','T','F','S'].map((d, i) => (
                  <div key={i} className="text-center text-[10px] font-semibold py-1" style={{ color: 'var(--text-secondary)' }}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`b-${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const key = formatKey(day)
                  const hasMeeting = meetingDates.has(key)
                  const isToday = key === todayKey
                  return (
                    <button
                      key={day}
                      onClick={() => router.push('/calendar')}
                      className="aspect-square flex items-center justify-center rounded-lg text-xs relative"
                      style={{
                        background: isToday ? 'linear-gradient(135deg, #6378FF, #A78BFA)' : 'transparent',
                        color: isToday ? '#fff' : 'var(--text-primary)',
                        fontWeight: isToday ? 700 : 400,
                      }}
                    >
                      {day}
                      {hasMeeting && !isToday && (
                        <span className="absolute bottom-0.5 w-1 h-1 rounded-full" style={{ background: '#6378FF' }} />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Recent activity */}
            <div className="rounded-2xl p-5 shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Recent Analysis</h3>
                <button onClick={() => router.push('/dashboard')} className="text-xs font-medium" style={{ color: '#6378FF' }}>View all</button>
              </div>

              {recentAnalyzed.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>No analyzed meetings yet</p>
              ) : (
                <div className="space-y-3">
                  {recentAnalyzed.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => router.push(`/meetings/${m.id}/analyze`)}
                      className="flex items-center gap-3 cursor-pointer hover:opacity-80"
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-soft-blue)' }}>
                        <CheckCircle2 size={16} style={{ color: '#2196b8' }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{m.title}</p>
                        <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{m.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">

          {/* Bar chart: Meetings by Department */}
          <div className="rounded-2xl p-5 shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Meetings by Department</h3>
              <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'var(--bg-soft-green)', color: '#27ae60' }}>
                {meetings.length} total
              </span>
            </div>
            {deptData.length === 0 ? (
              <p className="text-xs py-8 text-center" style={{ color: 'var(--text-secondary)' }}>No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deptData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#6378FF" maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Donut chart: Action Items by Priority */}
          <div className="rounded-2xl p-5 shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Action Items by Priority</h3>
              <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'var(--bg-soft-purple)', color: '#6378FF' }}>
                {totalActionItems} total
              </span>
            </div>
            {totalActionItems === 0 ? (
              <p className="text-xs py-8 text-center" style={{ color: 'var(--text-secondary)' }}>No action items yet</p>
            ) : (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie
                      data={priorityData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={index} fill={PRIORITY_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2.5 flex-1">
                  {priorityData.map((p, i) => (
                    <div key={p.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: PRIORITY_COLORS[i] }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{p.name}</span>
                      </div>
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{p.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Donut chart: Meeting Types */}
          <div className="rounded-2xl p-5 shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Meeting Types Breakdown</h3>
            </div>
            {typeData.length === 0 ? (
              <p className="text-xs py-8 text-center" style={{ color: 'var(--text-secondary)' }}>No data yet</p>
            ) : (
              <div className="flex flex-col items-center gap-4">
                              <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={typeData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={index} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-1 gap-y-2 w-full">
                  {typeData.map((t, i) => (
                    <div key={t.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: TYPE_COLORS[i % TYPE_COLORS.length] }} />
                        <span className="truncate" style={{ color: 'var(--text-secondary)' }}>{t.name}</span>
                      </div>
                      <span className="font-semibold flex-shrink-0 ml-2" style={{ color: 'var(--text-primary)' }}>{t.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}