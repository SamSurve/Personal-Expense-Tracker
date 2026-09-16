'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ArrowLeft, Lock, Mail, User, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState('')

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation UI checks
    if (!fullName.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!agreeTerms) {
      setError('Please agree to the Terms of Service to proceed.')
      return
    }

    setLoading(true)
    const { apiSignup } = await import('@/lib/api')
    const res = await apiSignup(fullName.trim(), email.trim(), password)
    setLoading(false)

    if (!res.success) {
      setError(res.message || 'Signup failed. Please try again.')
      return
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('user_setup_name', fullName.trim())
      if (res.user?.userId) {
        localStorage.setItem('user_id', String(res.user.userId))
      }
    }
    router.push('/setup')
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col justify-between font-sans transition-colors duration-200">
      {/* Top Header */}
      <header className="p-6 flex items-center justify-between max-w-6xl w-full mx-auto">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK TO HOME
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Signup Card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[var(--panel)] border border-[var(--border)] rounded-xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-10 h-10 rounded-lg bg-[var(--text)] text-[var(--bg)] font-bold flex items-center justify-center font-mono text-base tracking-tighter mx-auto mb-4">
              ET
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">Create Account</h1>
            <p className="text-xs text-[var(--text-muted)] font-light">
              Start tracking your finances with precision
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-md bg-[var(--danger-bg)] border border-[var(--danger-border)] text-[var(--danger)] text-xs flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setError(''); }}
                  placeholder="Alexander Vance"
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md pl-10 pr-4 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="name@example.com"
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md pl-10 pr-4 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md pl-10 pr-10 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md pl-10 pr-4 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
            </div>

            <div className="pt-2 text-xs text-[var(--text-muted)]">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => { setAgreeTerms(e.target.checked); setError(''); }}
                  className="mt-0.5 rounded border-[var(--border)] bg-[var(--bg)] accent-[var(--accent)]"
                />
                <span className="leading-tight">
                  I agree to the <a href="#" className="underline text-[var(--text)]">Terms of Service</a> and <a href="#" className="underline text-[var(--text)]">Privacy Policy</a>.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-[var(--text)] text-[var(--bg)] rounded-md py-2.5 font-medium text-sm hover:opacity-90 transition-opacity shadow-sm mt-3"
            >
              Continue to Setup →
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[var(--border)] text-center text-xs text-[var(--text-muted)]">
            Already have an account?{' '}
            <Link href="/login" className="text-[var(--text)] font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs font-mono text-[var(--text-muted)] space-y-2">
        <div>EXPENSE TRACKER EXECUTIVE EDITION &copy; 2026</div>
        <div>Developed by • Siddhant Surve • Yuvraj Singh • Tarak Desai • Yuvraj Tiwari</div>
      </footer>
    </div>
  )
}
