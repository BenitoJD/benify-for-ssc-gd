'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api/auth'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const trimmedName = name.trim()
  const passwordHasUppercase = /[A-Z]/.test(password)
  const passwordHasNumber = /\d/.test(password)
  const passwordIsLongEnough = password.length >= 8
  const passwordIsStrong = passwordHasUppercase && passwordHasNumber && passwordIsLongEnough
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (trimmedName.length > 80) {
      setError('Full name must be 80 characters or fewer')
      return
    }

    if (!passwordIsStrong) {
      setError('Password must be at least 8 characters and include 1 uppercase letter and 1 number')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      await authApi.register({ email: email.trim(), password, name: trimmedName || undefined })
      router.replace('/onboarding')
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { detail?: string } } }
        setError(axiosError.response?.data?.detail || 'Sign up failed')
      } else {
        setError('Sign up failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex items-stretch">
      
      {/* Left Side: Educational Graphic */}
      <div className="hidden lg:flex w-1/2 bg-[var(--brilliant-blue-shadow)] flex-col justify-center items-center relative overflow-hidden">
        <div className="relative z-10 text-center text-white px-12 max-w-lg">
          <div className="w-24 h-24 bg-white/20 rounded-3xl mx-auto mb-8 flex items-center justify-center backdrop-blur-sm">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="font-display text-4xl font-bold mb-4 tracking-tight">Start your journey.</h2>
          <p className="text-white/80 text-lg font-medium leading-relaxed">Join 10,000+ aspirants preparing for SSC GD the smart, interactive way.</p>
        </div>
        {/* Background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[var(--brilliant-blue)] rounded-full blur-[100px] opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[var(--brilliant-green)] rounded-full blur-[100px] opacity-40 pointer-events-none"></div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-12 py-12 overflow-y-auto">
        <div className="w-full max-w-[420px] py-8">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-[var(--text-main)] tracking-tight mb-2">Create Account</h1>
            <p className="text-[var(--text-muted)] font-medium">Free forever. No credit card needed.</p>
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
                <label htmlFor="name" className="block text-sm font-bold text-[var(--text-main)] pl-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value.slice(0, 80))}
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-[var(--border-light)] rounded-2xl text-[var(--text-main)] font-medium placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition-colors"
                  placeholder="Your name"
                />
                <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">{name.length}/80 characters</p>
              </div>

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
                  placeholder="At least 1 uppercase letter and 1 number"
                  required
                />
                <div className="mt-2 space-y-1 text-xs font-medium">
                  <p className={passwordIsLongEnough ? 'text-green-700' : 'text-[var(--text-muted)]'}>
                    At least 8 characters
                  </p>
                  <p className={passwordHasUppercase ? 'text-green-700' : 'text-[var(--text-muted)]'}>
                    Includes 1 uppercase letter
                  </p>
                  <p className={passwordHasNumber ? 'text-green-700' : 'text-[var(--text-muted)]'}>
                    Includes 1 number
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirm-password" className="block text-sm font-bold text-[var(--text-main)] pl-1">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-[var(--border-light)] rounded-2xl text-[var(--text-main)] font-medium placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition-colors"
                  placeholder="Repeat password"
                  required
                />
                {confirmPassword.length > 0 && (
                  <p className={`mt-2 text-xs font-medium ${passwordsMatch ? 'text-green-700' : 'text-red-600'}`}>
                    {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-3d btn-3d-green py-4 rounded-2xl text-base disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          </div>

          <div className="text-center font-bold text-[var(--text-muted)] space-y-4">
            <p>
              Already have an account?{' '}
              <Link href="/login" className="text-[var(--brilliant-blue)] hover:text-blue-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
