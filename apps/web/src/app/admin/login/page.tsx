'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { adminApi } from '@/lib/api/admin'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await adminApi.login({ email, password })
      
      // Store the admin access token
      localStorage.setItem('admin_access_token', response.access_token)
      localStorage.setItem('admin_user', JSON.stringify(response.user))
      
      // Redirect to admin dashboard
      router.push('/admin')
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { detail?: string } } }
        setError(axiosError.response?.data?.detail || 'Invalid credentials')
      } else {
        setError('Login failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[440px] card-brilliant p-8 sm:p-12 mb-8">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--text-main)]">Admin Portal</h1>
          <p className="font-bold text-[var(--text-muted)] text-sm uppercase tracking-widest mt-2 mt-2">Sign in to access dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-bold flex items-start space-x-2">
              <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-[var(--text-main)] mb-2 uppercase tracking-wide">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border-2 border-[var(--border-light)] rounded-2xl text-[15px] font-semibold text-[var(--text-main)] placeholder-gray-400 focus:outline-none focus:border-[var(--brilliant-blue)] focus:ring-4 focus:ring-[var(--brilliant-blue)] focus:ring-opacity-20 transition-all"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-[var(--text-main)] mb-2 uppercase tracking-wide">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border-2 border-[var(--border-light)] rounded-2xl text-[15px] font-semibold text-[var(--text-main)] placeholder-gray-400 focus:outline-none focus:border-[var(--brilliant-blue)] focus:ring-4 focus:ring-[var(--brilliant-blue)] focus:ring-opacity-20 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[var(--text-main)] text-white mt-4 py-4 px-4 rounded-2xl font-bold text-lg hover:-translate-y-0.5 active:translate-y-1 shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none mt-8"
          >
            {isLoading ? 'Signing in...' : 'Sign In to Admin'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/login" className="inline-flex items-center justify-center gap-2 text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Return to Student Login
          </Link>
        </div>
      </div>
    </div>
  )
}
