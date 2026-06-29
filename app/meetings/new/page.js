'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function NewMeeting() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [transcript, setTranscript] = useState('')
  const [fileName, setFileName] = useState('')

  const [form, setForm] = useState({
    title: '',
    date: '',
    participants: '',
    department: '',
    meeting_type: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

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
      setError('Please fill in the title, date, and upload a transcript.')
      return
    }

    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const participantsArray = form.participants
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)

    const { data, error } = await supabase
      .from('meetings')
      .insert({
        user_id: user.id,
        title: form.title,
        date: form.date,
        participants: participantsArray,
        department: form.department,
        meeting_type: form.meeting_type,
        transcript: transcript,
      })
      .select()
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(`/meetings/${data.id}/analyze`)
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
          >
            ← Back to Dashboard
          </button>
          <span className="font-semibold text-gray-900">New Meeting</span>
          <div className="w-24" />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">

          <h1 className="text-xl font-semibold text-gray-900 mb-6">
            Meeting Details
          </h1>

          <div className="space-y-5">

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Q3 Planning Session"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Participants */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Participants
              </label>
              <input
                type="text"
                name="participants"
                value={form.participants}
                onChange={handleChange}
                placeholder="Ahmed, Sara, John (comma separated)"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select department</option>
                <option value="Engineering">Engineering</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Product">Product</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="Management">Management</option>
              </select>
            </div>

            {/* Meeting Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Type
              </label>
              <select
                name="meeting_type"
                value={form.meeting_type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select type</option>
                <option value="Standup">Standup</option>
                <option value="Planning">Planning</option>
                <option value="Retrospective">Retrospective</option>
                <option value="Review">Review</option>
                <option value="Brainstorming">Brainstorming</option>
                <option value="Client Call">Client Call</option>
                <option value="One on One">One on One</option>
                <option value="All Hands">All Hands</option>
              </select>
            </div>

            {/* Transcript Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Transcript <span className="text-red-500">*</span>
              </label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                fileName ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-blue-300'
              }`}>
                {fileName ? (
                  <div>
                    <p className="text-green-700 font-medium text-sm">✅ {fileName}</p>
                    <p className="text-green-600 text-xs mt-1">
                      {transcript.length} characters loaded
                    </p>
                    <button
                      onClick={() => { setFileName(''); setTranscript('') }}
                      className="text-xs text-gray-500 hover:text-red-500 mt-2 underline"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500 text-sm mb-2">
                      Upload a .txt file with your meeting transcript
                    </p>
                    <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                      Choose File
                      <input
                        type="file"
                        accept=".txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Paste transcript option */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Or paste transcript directly
              </label>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste your meeting transcript here..."
                rows={6}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : 'Save & Analyze with AI →'}
            </button>

          </div>
        </div>
      </main>
    </div>
  )
}