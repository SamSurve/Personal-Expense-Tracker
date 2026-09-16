'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ArrowLeft, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { apiLogin } = await import('@/lib/api')
    const res = await apiLogin(email.trim(), password)
    setLoading(false)

    if (!res.success) {
      setError(res.message || 'Login failed. Please check your credentials.')
      return
    }

    if (typeof window !== 'undefined') {
      if (res.user?.name) {
        localStorage.setItem('user_setup_name', res.user.name)
      }
      if (res.user?.userId) {
        localStorage.setItem('user_id', String(res.user.userId))
      }
    }
    router.push('/dashboard')
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

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[var(--panel)] border border-[var(--border)] rounded-xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-10 h-10 rounded-lg bg-[var(--text)] text-[var(--bg)] font-bold flex items-center justify-center font-mono text-base tracking-tighter mx-auto mb-4">
              ET
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome Back</h1>
            <p className="text-xs text-[var(--text-muted)] font-light">
              Enter your credentials to access your personal ledger
            </p>
          </div>
          {error && (
            <div className="mb-6 p-3 rounded-md bg-[var(--danger-bg)] border border-[var(--danger-border)] text-[var(--danger)] text-xs flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md pl-10 pr-4 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">
                  Password
                </label>
                <a href="#" className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md pl-10 pr-10 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
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

            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[var(--border)] bg-[var(--bg)] accent-[var(--accent)]"
                />
                <span>Remember this device</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-[var(--text)] text-[var(--bg)] rounded-md py-2.5 font-medium text-sm hover:opacity-90 transition-opacity shadow-sm mt-2"
            >
              Sign In to Ledger
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[var(--border)] text-center text-xs text-[var(--text-muted)]">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[var(--text)] font-semibold hover:underline">
              Create one now
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
