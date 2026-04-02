'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await authApi.login({ email, password })
      router.push('/dashboard')
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { detail?: string } } }
        setError(axiosError.response?.data?.detail || 'Invalid credentials')
      } else {
        setError('Sign in failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex items-stretch">
      
      {/* Left Side: Educational Graphic */}
      <div className="hidden lg:flex w-1/2 bg-[var(--brilliant-green-shadow)] flex-col justify-center items-center relative overflow-hidden">
        <div className="relative z-10 text-center text-white px-12 max-w-lg">
          <div className="w-24 h-24 bg-white/20 rounded-3xl mx-auto mb-8 flex items-center justify-center backdrop-blur-sm">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="font-display text-4xl font-bold mb-4 tracking-tight">Master every topic.</h2>
          <p className="text-white/80 text-lg font-medium leading-relaxed">Login to continue your interactive daily practice and progress through the syllabus.</p>
        </div>
        {/* Background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[var(--brilliant-green)] rounded-full blur-[100px] opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[var(--brilliant-yellow)] rounded-full blur-[100px] opacity-40 pointer-events-none"></div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-12 py-12">
        <div className="w-full max-w-[420px]">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-[var(--text-main)] tracking-tight mb-2">Welcome back</h1>
            <p className="text-[var(--text-muted)] font-medium">Log in to your account</p>
          </div>

          <div className="card-brilliant p-8 sm:p-10 w-full mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm font-semibold flex items-center space-x-3">
                  <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-bold text-[var(--text-main)] pl-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-[var(--border-light)] rounded-2xl text-[var(--text-main)] font-medium placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition-colors"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-bold text-[var(--text-main)] pl-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-[var(--border-light)] rounded-2xl text-[var(--text-main)] font-medium placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-3d btn-3d-green py-4 rounded-2xl text-base disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>

          <div className="text-center font-bold text-[var(--text-muted)] space-y-4">
            <p>
              New here?{' '}
              <Link href="/signup" className="text-[var(--brilliant-blue)] hover:text-blue-700 transition-colors">
                Sign up
              </Link>
            </p>
            <p>
              Are you an admin?{' '}
              <Link href="/admin/login" className="text-gray-400 hover:text-black transition-colors">
                Open portal
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
