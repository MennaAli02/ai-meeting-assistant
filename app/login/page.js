'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Sparkles, Mail, Lock, Loader2, ArrowRight, Mic2, FileText, Zap } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleAuth = async () => {
    setLoading(true)
    setMessage('')
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Check your email to confirm your account!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-800 flex items-center justify-center px-4 py-10 relative overflow-hidden">

      {/* decorative blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-fuchsia-400/10 rounded-full blur-3xl"></div>

      <div className="relative w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
            <Sparkles size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">MeetingAI</h1>
          <p className="text-indigo-100 text-sm mt-2">
            {isSignUp ? 'Create your free account' : 'Turn meetings into action, automatically'}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="space-y-4">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {message && (
              <div className={`text-sm p-3 rounded-xl ${
                message.includes('Check') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
              }`}>
                {message}
              </div>
            )}

            <button
              onClick={handleAuth}
              disabled={loading || !email || !password}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-200"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>

            <p className="text-center text-sm text-gray-500">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => { setIsSignUp(!isSignUp); setMessage('') }}
                className="ml-1 text-violet-600 hover:underline font-semibold"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
          {[
            { icon: Mic2, label: 'Transcripts' },
            { icon: Zap, label: 'AI Analysis' },
            { icon: FileText, label: 'Auto Reports' },
          ].map((f) => {
            const Icon = f.icon
            return (
              <div key={f.label} className="flex items-center gap-1.5 text-indigo-100 text-xs bg-white/10 backdrop-blur px-3 py-1.5 rounded-full border border-white/10">
                <Icon size={13} />
                {f.label}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}