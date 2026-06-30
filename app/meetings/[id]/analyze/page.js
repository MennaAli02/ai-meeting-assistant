'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/TopNav'

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
  const [emailContent, setEmailContent] = useState('')
  const [showEmail, setShowEmail] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

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

  const generateEmail = async () => {
    setEmailLoading(true)
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingInfo: {
            title: meeting.title,
            date: meeting.date,
            participants: meeting.participants?.join(', '),
          },
          aiResult: result
        })
      })
      const data = await response.json()
      setEmailContent(data.email)
      setShowEmail(true)
    } catch (err) {
      setError('Failed to generate email')
    }
    setEmailLoading(false)
  }

  const downloadPDF = () => {
    window.print()
  }

  const copyResults = () => {
    const text = `
MEETING: ${meeting.title}
DATE: ${meeting.date}

EXECUTIVE SUMMARY:
${result.executive_summary}

ACTION ITEMS:
${result.action_items?.map(a => `• ${a.task} - ${a.owner} (${a.due_date})`).join('\n')}

DECISIONS:
${result.decisions_made?.join('\n')}

RISKS:
${result.risks?.join('\n')}
    `.trim()

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Loading states ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F0F4FF' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-[#4361EE]/30 border-t-[#4361EE] animate-spin" />
          <p className="text-sm text-gray-400">Loading meeting...</p>
        </div>
      </div>
    )
  }

  if (analyzing) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F0F4FF' }}>
        <div className="text-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 animate-pulse"
            style={{ background: '#EEF2FF' }}
          >
            <span className="text-4xl">🤖</span>
          </div>
          <h2 className="text-lg font-bold mb-2" style={{ color: '#1A1F36' }}>Analyzing your meeting...</h2>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>Gemini AI is reading the transcript and extracting insights</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F0F4FF' }}>
        <div className="text-center">
          <p className="text-red-500 text-sm mb-4">{error || 'No results yet'}</p>
          <button
            onClick={() => analyzeTranscript(meeting)}
            style={{ background: '#4361EE' }}
            className="text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // ── Section card helper ───────────────────────────────────────────────────
  const Card = ({ children, className = '' }) => (
    <div
      className={`bg-white rounded-2xl p-6 shadow-sm ${className}`}
      style={{ border: '1px solid #F0F4FF' }}
    >
      {children}
    </div>
  )

  const SectionTitle = ({ emoji, bg, label }) => (
    <h2 className="font-bold mb-4 flex items-center gap-2.5" style={{ color: '#1A1F36' }}>
      <span
        className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
        style={{ background: bg }}
      >
        {emoji}
      </span>
      {label}
    </h2>
  )

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: '#F0F4FF' }}>
      <TopNav userEmail={meeting?.user_id} onSignOut={handleSignOut} />

      <main id="report-content" className="pt-14 p-8 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1A1F36' }}>{meeting?.title}</h1>
            <div className="flex items-center gap-2.5 mt-2 flex-wrap">
              <span className="text-sm" style={{ color: '#9CA3AF' }}>📅 {meeting?.date}</span>
              {meeting?.department && (
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                  style={{ background: '#EEF2FF', color: '#4361EE' }}
                >
                  {meeting.department}
                </span>
              )}
              {meeting?.meeting_type && (
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                  style={{ background: '#F3F4F6', color: '#6B7280' }}
                >
                  {meeting.meeting_type}
                </span>
              )}
            </div>
          </div>
          <span className={`text-xs px-3 py-1.5 rounded-full font-semibold flex-shrink-0 mt-1 ${
            saved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          }`}>
            {saved ? '✅ Saved' : 'Saving...'}
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm">
            {error}
            <button onClick={() => analyzeTranscript(meeting)} className="ml-3 underline font-semibold">
              Try again
            </button>
          </div>
        )}

        {result && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Executive Summary — full width */}
              <Card className="col-span-2">
                <SectionTitle emoji="📝" bg="#EEF2FF" label="Executive Summary" />
                <p className="text-sm leading-relaxed" style={{ color: '#4B5563' }}>
                  {result.executive_summary}
                </p>
              </Card>

              {/* Key Discussion Points */}
              <Card>
                <SectionTitle emoji="💬" bg="#EFF6FF" label="Key Discussion Points" />
                <ul className="space-y-2.5">
                  {result.key_discussion_points?.map((point, i) => (
                    <li key={i} className="flex gap-2.5 text-sm" style={{ color: '#4B5563' }}>
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                        style={{ background: '#4361EE' }}
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Decisions Made */}
              <Card>
                <SectionTitle emoji="✅" bg="#ECFDF5" label="Decisions Made" />
                <ul className="space-y-2.5">
                  {result.decisions_made?.map((d, i) => (
                    <li key={i} className="flex gap-2.5 text-sm" style={{ color: '#4B5563' }}>
                      <span className="text-emerald-500 font-bold flex-shrink-0">✓</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </Card>

            </div>

            {/* Action Items */}
            <Card>
              <SectionTitle emoji="🎯" bg="#FFF7ED" label="Action Items" />
              <div className="space-y-2.5">
                {result.action_items?.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{ background: '#F8FAFF', border: '1px solid #F0F4FF' }}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: '#1A1F36' }}>{item.task}</p>
                      <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                        👤 {item.owner} &nbsp;·&nbsp; 📅 {item.due_date}
                      </p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ml-4 flex-shrink-0 ${
                      item.priority === 'High' ? 'bg-red-50 text-red-600' :
                      item.priority === 'Medium' ? 'bg-amber-50 text-amber-700' :
                      'bg-emerald-50 text-emerald-700'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Risks */}
              <Card>
                <SectionTitle emoji="⚠️" bg="#FEF2F2" label="Risks" />
                <ul className="space-y-2.5">
                  {result.risks?.map((risk, i) => (
                    <li key={i} className="flex gap-2.5 text-sm" style={{ color: '#4B5563' }}>
                      <span className="text-orange-400 flex-shrink-0 font-bold">▲</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Open Questions */}
              <Card>
                <SectionTitle emoji="❓" bg="#FAF5FF" label="Open Questions" />
                <ul className="space-y-2.5">
                  {result.open_questions?.map((q, i) => (
                    <li key={i} className="flex gap-2.5 text-sm" style={{ color: '#4B5563' }}>
                      <span className="text-purple-400 flex-shrink-0 font-bold">?</span>
                      {q}
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Follow-up Recommendations — full width */}
              <Card className="col-span-2">
                <SectionTitle emoji="📧" bg="#EFF6FF" label="Follow-up Recommendations" />
                <ul className="space-y-2.5">
                  {result.follow_up_recommendations?.map((rec, i) => (
                    <li key={i} className="flex gap-2.5 text-sm" style={{ color: '#4B5563' }}>
                      <span style={{ color: '#4361EE' }} className="flex-shrink-0 font-bold">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </Card>

            </div>

            {/* Export & Share */}
            <Card>
              <h2 className="font-bold mb-4" style={{ color: '#1A1F36' }}>Export &amp; Share</h2>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={downloadPDF}
                  style={{ background: '#4361EE' }}
                  className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-md shadow-blue-200"
                >
                  📄 Download PDF
                </button>
                <button
                  onClick={generateEmail}
                  disabled={emailLoading}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {emailLoading ? '⏳ Generating...' : '📧 Generate Email'}
                </button>
                <button
                  onClick={copyResults}
                  className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors hover:bg-gray-50"
                  style={{ border: '1px solid #E5EAFF', color: '#4B5563' }}
                >
                  {copied ? '✅ Copied!' : '📋 Copy Results'}
                </button>
                <button
                  onClick={() => analyzeTranscript(meeting)}
                  className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors hover:bg-gray-50"
                  style={{ border: '1px solid #E5EAFF', color: '#4B5563' }}
                >
                  🔄 Re-analyze
                </button>
              </div>
            </Card>

            {/* Email Modal */}
            {showEmail && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div
                  className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
                  style={{ border: '1px solid #E5EAFF' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg" style={{ color: '#1A1F36' }}>Follow-up Email</h3>
                    <button
                      onClick={() => setShowEmail(false)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors text-lg"
                    >
                      ✕
                    </button>
                  </div>
                  <pre
                    className="text-sm whitespace-pre-wrap p-4 rounded-xl"
                    style={{ background: '#F8FAFF', border: '1px solid #E5EAFF', color: '#4B5563' }}
                  >
                    {emailContent}
                  </pre>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(emailContent)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      }}
                      style={{ background: '#4361EE' }}
                      className="text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      {copied ? '✅ Copied!' : '📋 Copy Email'}
                    </button>
                    <button
                      onClick={() => setShowEmail(false)}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-gray-50"
                      style={{ border: '1px solid #E5EAFF', color: '#4B5563' }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="pb-8" />
          </>
        )}
      </main>
    </div>
  )
}
