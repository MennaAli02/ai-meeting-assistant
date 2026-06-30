'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/TopNav'
import {
  FileText, Calendar, Users, Building2,
  Tag, Upload, CheckCircle, Loader
} from 'lucide-react'

export default function NewMeeting() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [transcript, setTranscript] = useState('')
  const [fileName, setFileName] = useState('')
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({
    title: '', date: '', participants: '', department: '', meeting_type: '',
  })

  useState(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
      else setUser(user)
    })
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => setTranscript(e.target.result)
    reader.readAsText(file)
  }

  const handleSubmit = async () => {
    if (!form.title || !form.date || !transcript) {
      setError('Please fill in title, date, and add a transcript.')
      return
    }
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const participantsArray = form.participants.split(',').map(p => p.trim()).filter(Boolean)
    const { data, error } = await supabase.from('meetings').insert({
      user_id: user.id,
      title: form.title,
      date: form.date,
      participants: participantsArray,
      department: form.department,
      meeting_type: form.meeting_type,
      transcript,
    }).select().single()

    if (error) { setError(error.message); setLoading(false); return }
    router.push(`/meetings/${data.id}/analyze`)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const inputClass = "w-full py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 bg-[#F8FAFF] transition-colors"
  const inputStyle = { borderColor: '#E5EAFF', '--tw-ring-color': '#4361EE', color: '#1A1F36' }

  return (
    <div className="min-h-screen" style={{ background: '#F0F4FF' }}>
      <TopNav userEmail={user?.email} onSignOut={handleSignOut} />

      <main className="pt-14 p-8">
        <div className="max-w-2xl">

          <div className="mb-7">
            <h1 className="text-2xl font-bold" style={{ color: '#1A1F36' }}>New Meeting</h1>
            <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
              Fill in the details and upload your transcript
            </p>
          </div>

          <div
            className="bg-white rounded-2xl p-8 shadow-sm space-y-5"
            style={{ border: '1px solid #F0F4FF' }}
          >

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>
                Meeting Title <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <FileText size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
                <input
                  type="text" name="title" value={form.title} onChange={handleChange}
                  placeholder="e.g. Q3 Planning Session"
                  className={`${inputClass} pl-9 pr-4`}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>
                Meeting Date <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
                <input
                  type="date" name="date" value={form.date} onChange={handleChange}
                  className={`${inputClass} pl-9 pr-4`}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Participants */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>
                Participants
              </label>
              <div className="relative">
                <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
                <input
                  type="text" name="participants" value={form.participants} onChange={handleChange}
                  placeholder="Ahmed, Sara, John (comma separated)"
                  className={`${inputClass} pl-9 pr-4`}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Department + Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>
                  Department
                </label>
                <div className="relative">
                  <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
                  <select
                    name="department" value={form.department} onChange={handleChange}
                    className={`${inputClass} pl-9 pr-4 appearance-none cursor-pointer`}
                    style={inputStyle}
                  >
                    <option value="">Select...</option>
                    <option>Engineering</option>
                    <option>Marketing</option>
                    <option>Sales</option>
                    <option>Product</option>
                    <option>HR</option>
                    <option>Finance</option>
                    <option>Operations</option>
                    <option>Management</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>
                  Meeting Type
                </label>
                <div className="relative">
                  <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
                  <select
                    name="meeting_type" value={form.meeting_type} onChange={handleChange}
                    className={`${inputClass} pl-9 pr-4 appearance-none cursor-pointer`}
                    style={inputStyle}
                  >
                    <option value="">Select...</option>
                    <option>Standup</option>
                    <option>Planning</option>
                    <option>Retrospective</option>
                    <option>Review</option>
                    <option>Brainstorming</option>
                    <option>Client Call</option>
                    <option>One on One</option>
                    <option>All Hands</option>
                  </select>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>
                Upload Transcript <span className="text-red-400">*</span>
              </label>
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  fileName
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-[#E5EAFF] hover:border-[#4361EE]/50 hover:bg-[#F0F4FF]'
                }`}
              >
                {fileName ? (
                  <div>
                    <CheckCircle size={24} className="text-emerald-500 mx-auto mb-2" />
                    <p className="text-emerald-700 font-semibold text-sm">{fileName}</p>
                    <p className="text-emerald-600 text-xs mt-1">{transcript.length.toLocaleString()} characters loaded</p>
                    <button
                      onClick={() => { setFileName(''); setTranscript('') }}
                      className="text-xs text-gray-400 hover:text-red-500 mt-2.5 underline transition-colors"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload size={22} className="mx-auto mb-2" style={{ color: '#9CA3AF' }} />
                    <p className="text-sm mb-3" style={{ color: '#9CA3AF' }}>Drop a .txt file or click to browse</p>
                    <label
                      style={{ background: '#4361EE' }}
                      className="cursor-pointer text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      Choose File
                      <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Paste option */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>
                Or paste transcript directly
              </label>
              <textarea
                value={transcript} onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste your meeting transcript here..."
                rows={5}
                className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 resize-none bg-[#F8FAFF] transition-colors"
                style={{ borderColor: '#E5EAFF', '--tw-ring-color': '#4361EE', color: '#1A1F36' }}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3.5 rounded-xl">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ background: '#4361EE' }}
              className="w-full text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 active:opacity-80 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 shadow-md shadow-blue-200"
            >
              {loading && <Loader size={16} className="animate-spin" />}
              {loading ? 'Saving...' : 'Save & Analyze with AI →'}
            </button>

          </div>
        </div>
      </main>
    </div>
  )
}