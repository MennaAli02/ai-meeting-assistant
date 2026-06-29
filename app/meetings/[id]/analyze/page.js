'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AnalyzePage({ params }) {
  const unwrappedParams = use(params)
  const id = unwrappedParams.id
  const router = useRouter()
  const [meeting, setMeeting] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchMeeting()
  }, [id])

  const fetchMeeting = async () => {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', id)
      .single()
    if (error || !data) {
      router.push('/dashboard')
      return
    }
    setMeeting(data)
    if (data.ai_result) {
      setResult(data.ai_result)
      setSaved(true)
      setLoading(false)
    } else {
      setLoading(false)
      analyzeTranscript(data)
    }
  }

  const analyzeTranscript = async (meetingData) => {
    setAnalyzing(true)
    setError('')
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: meetingData.transcript,
          meetingInfo: {
            title: meetingData.title,
            date: meetingData.date,
            participants: meetingData.participants?.join(', '),
            department: meetingData.department,
            meeting_type: meetingData.meeting_type,
          }
        })
      })
      const data = await response.json()
      if (data.error) {
        setError(data.error)
        setAnalyzing(false)
        return
      }
      setResult(data.result)
      await saveResult(data.result)
    } catch (err) {
      setError('Something went wrong: ' + err.message)
    }
    setAnalyzing(false)
  }

  const saveResult = async (aiResult) => {
    await supabase
      .from('meetings')
      .update({ ai_result: aiResult })
      .eq('id', id)
    setSaved(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading meeting...</p>
      </div>
    )
  }

  if (analyzing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-3xl">🤖</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Analyzing your meeting...</h2>
          <p className="text-gray-500 text-sm">Gemini AI is reading the transcript and extracting insights</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-sm mb-3">{error || 'No results yet'}</p>
          <button
            onClick={() => analyzeTranscript(meeting)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-900 text-sm">
            ← Dashboard
          </button>
          <span className="font-semibold text-gray-900">{meeting?.title}</span>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${saved ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
            {saved ? '✅ Saved' : 'Not saved'}
          </span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
            {error}
            <button onClick={() => analyzeTranscript(meeting)} className="ml-3 underline font-medium">
              Try again
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm text-gray-500">📅 {meeting?.date}</span>
            <span className="text-sm text-gray-500">🏢 {meeting?.department}</span>
            <span className="text-sm text-gray-500">📋 {meeting?.meeting_type}</span>
            <span className="text-sm text-gray-500">👥 {meeting?.participants?.join(', ')}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-3">📝 Executive Summary</h2>
          <p className="text-gray-700 text-sm leading-relaxed">{result.executive_summary}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-3">💬 Key Discussion Points</h2>
          <ul className="space-y-2">
            {result.key_discussion_points?.map((point, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="text-blue-500 font-bold">•</span>{point}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-3">✅ Decisions Made</h2>
          <ul className="space-y-2">
            {result.decisions_made?.map((decision, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="text-green-500 font-bold">✓</span>{decision}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">🎯 Action Items</h2>
          <div className="space-y-3">
            {result.action_items?.map((item, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm font-medium text-gray-900">{item.task}</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
                    item.priority === 'High' ? 'bg-red-100 text-red-700' :
                    item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>{item.priority}</span>
                </div>
                <div className="flex gap-4 mt-2">
                  <span className="text-xs text-gray-500">👤 {item.owner}</span>
                  <span className="text-xs text-gray-500">📅 {item.due_date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-3">⚠️ Risks</h2>
          <ul className="space-y-2">
            {result.risks?.map((risk, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="text-yellow-500">⚠</span>{risk}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-3">❓ Open Questions</h2>
          <ul className="space-y-2">
            {result.open_questions?.map((q, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="text-purple-500">?</span>{q}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-3">📧 Follow-up Recommendations</h2>
          <ul className="space-y-2">
            {result.follow_up_recommendations?.map((rec, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="text-blue-500">→</span>{rec}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3 flex-wrap pb-8">
          <button
            onClick={() => analyzeTranscript(meeting)}
            className="border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Re-analyze
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

      </main>
    </div>
  )
}