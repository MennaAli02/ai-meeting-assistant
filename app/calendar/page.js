'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/TopNav'
import { useTheme } from '@/lib/useTheme'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'

export default function CalendarPage() {
  const [user, setUser] = useState(null)
  const [meetings, setMeetings] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase.from('meetings').select('*').eq('user_id', user.id)
      setMeetings(data || [])
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = currentDate.toLocaleString('default', { month: 'long' })

  const meetingsByDate = {}
  meetings.forEach((m) => {
    if (!m.date) return
    if (!meetingsByDate[m.date]) meetingsByDate[m.date] = []
    meetingsByDate[m.date].push(m)
  })

  const formatDateKey = (day) => {
    const m = String(month + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    return `${year}-${m}-${d}`
  }

  const todayKey = new Date().toISOString().split('T')[0]

  const changeMonth = (delta) => {
    setCurrentDate(new Date(year, month + delta, 1))
    setSelectedDay(null)
  }

  const blanks = Array.from({ length: firstDayOfMonth })
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const selectedMeetings = selectedDay ? (meetingsByDate[formatDateKey(selectedDay)] || []) : []

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <TopNav userEmail={user?.email} onSignOut={handleSignOut} theme={theme} toggleTheme={toggleTheme} />

      <main className="pt-20 px-4 sm:px-8 pb-8 max-w-5xl mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Calendar</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            View your meetings by date
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Calendar grid */}
          <div
            className="lg:col-span-2 rounded-2xl p-4 sm:p-6 shadow-sm"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={() => changeMonth(-1)}
                className="p-2 rounded-lg hover:bg-black/5 transition-all"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ChevronLeft size={18} />
              </button>
              <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                {monthName} {year}
              </h2>
              <button
                onClick={() => changeMonth(1)}
                className="p-2 rounded-lg hover:bg-black/5 transition-all"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-center text-xs font-semibold py-2" style={{ color: 'var(--text-secondary)' }}>
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {blanks.map((_, i) => <div key={`b-${i}`} />)}
              {days.map((day) => {
                const dateKey = formatDateKey(day)
                const dayMeetings = meetingsByDate[dateKey] || []
                const isToday = dateKey === todayKey
                const isSelected = selectedDay === day

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className="aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all relative"
                    style={{
                      background: isSelected
                        ? 'linear-gradient(135deg, #6378FF, #A78BFA)'
                        : isToday
                        ? 'rgba(99,120,255,0.12)'
                        : 'transparent',
                      color: isSelected ? '#fff' : isToday ? '#6378FF' : 'var(--text-primary)',
                      fontWeight: isToday || isSelected ? 700 : 400,
                    }}
                  >
                    {day}
                    {dayMeetings.length > 0 && (
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-0.5"
                        style={{ background: isSelected ? '#fff' : '#6378FF' }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Side panel - meetings for selected day */}
          <div
            className="rounded-2xl p-5 shadow-sm"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          >
            <h3 className="font-bold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
              {selectedDay
                ? `${monthName} ${selectedDay}, ${year}`
                : 'Select a day'}
            </h3>

            {selectedDay && selectedMeetings.length === 0 && (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                No meetings on this day
              </p>
            )}

            <div className="space-y-3">
              {selectedMeetings.map((m) => (
                <div
                  key={m.id}
                  onClick={() => router.push(`/meetings/${m.id}/analyze`)}
                  className="p-3 rounded-xl cursor-pointer hover:opacity-80 transition-all"
                  style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)' }}
                >
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{m.title}</p>
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                    <Clock size={11} /> {m.meeting_type || 'Meeting'}
                  </p>
                </div>
              ))}
            </div>

            {!selectedDay && (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Click a date with a blue dot to see meetings scheduled that day.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}