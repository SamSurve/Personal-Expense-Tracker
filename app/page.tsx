'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeToggle } from '@/components/ThemeToggle'
import { CinematicIntro } from '@/components/CinematicIntro'
import { ArrowRight, Activity, PieChart, Database, TrendingUp, ShieldCheck, Zap, Sparkles } from 'lucide-react'

export default function LandingPage() {
  const [hasEntered, setHasEntered] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('entered_experience') === 'true'
    }
    return false
  })

  useEffect(() => {
    // Check if user already entered in current session
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('entered_experience')
      if (stored === 'true') {
        setHasEntered(true)
      }
    }
  }, [])

  const handleEnterExperience = () => {
    setHasEntered(true)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('entered_experience', 'true')
    }
  }

  // Animation variants for hero sequence reveal
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25,
        delayChildren: 0.1,
      },
    },
  }

  const fadeInDown = {
    hidden: { opacity: 0, y: -24 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } 
    },
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 32 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    },
  }

  const scaleUp = {
    hidden: { opacity: 0, scale: 0.95, y: 25 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } 
    },
  }

  return (
    <AnimatePresence mode="wait">
      {!hasEntered ? (
        <motion.div
          key="intro"
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <CinematicIntro onEnter={handleEnterExperience} />
        </motion.div>
      ) : (
        <motion.div
          key="landing"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col font-sans transition-colors duration-200 overflow-x-hidden relative"
        >

          {/* Header / Navbar */}
          <motion.header 
            initial="hidden"
            animate="visible"
            variants={fadeInDown}
            className="border-b border-[var(--border)] sticky top-0 bg-[var(--bg)]/90 backdrop-blur-md z-50"
          >
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-black font-bold flex items-center justify-center font-mono text-sm tracking-tighter shadow-sm">
                  ET
                </div>
                <span className="font-semibold tracking-tight text-lg group-hover:opacity-80 transition-opacity">
                  Expense Tracker
                </span>
              </Link>

              <nav className="hidden md:flex items-center gap-8 text-sm text-[var(--text-muted)] font-medium">
                <a href="#features" className="hover:text-[var(--text)] transition-colors">Features</a>
                <a href="#telemetry" className="hover:text-[var(--text)] transition-colors">Telemetry</a>
                <a href="#architecture" className="hover:text-[var(--text)] transition-colors">Architecture</a>
              </nav>

              <div className="flex items-center gap-4">
                <ThemeToggle />
                <Link 
                  href="/login" 
                  className="text-sm font-medium px-4 py-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                >
                  Login
                </Link>
                <Link 
                  href="/signup" 
                  className="text-sm font-medium px-4 py-2 bg-[var(--text)] text-[var(--bg)] rounded-md hover:opacity-90 transition-opacity shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.header>

          {/* Hero Section */}
          <motion.section 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="py-20 px-6 max-w-5xl mx-auto text-center flex flex-col items-center relative z-10"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--border)] bg-[var(--panel)] text-xs font-mono text-[var(--text-muted)] mb-8 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                FINTECH EXECUTIVE TELEMETRY v2.0
              </div>
            </motion.div>

            {/* Hero Title */}
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight max-w-4xl leading-[1.08] mb-6"
            >
              Personal expense tracking, <br />
              <span className="text-[var(--text-muted)] font-normal italic">engineered for precision.</span>
            </motion.h1>

            {/* Hero Subtitle */}
            <motion.p 
              variants={fadeInUp}
              className="text-lg sm:text-xl text-[var(--text-muted)] max-w-2xl font-light mb-10 leading-relaxed"
            >
              A lightweight, high-performance financial ledger for real-time balance intelligence, spend analytics, and seamless Core Java + JDBC execution.
            </motion.p>

            {/* Action CTAs */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-3.5 bg-[var(--accent)] text-black rounded-md font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-lg"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-3.5 border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] rounded-md font-medium text-sm hover:bg-[var(--panel-hover)] hover:-translate-y-0.5 transition-all"
              >
                Account Login
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-3.5 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text)] transition-colors flex items-center justify-center gap-1"
              >
                LIVE DEMO →
              </Link>
            </motion.div>

            {/* Dashboard & Telemetry Reveal Card */}
            <motion.div 
              id="telemetry"
              variants={scaleUp}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] overflow-hidden shadow-2xl text-left backdrop-blur-sm"
            >
              {/* Card Topbar */}
              <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg)]/50">
                <div className="flex items-center gap-3 font-mono text-xs text-[var(--text-muted)]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
                  <span>LIVE FINANCIAL TELEMETRY</span>
                  <span className="hidden sm:inline text-[var(--border)]">|</span>
                  <span className="hidden sm:inline">JDBC POOL ACTIVE</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-[var(--accent)] font-semibold">₹84,291.60</span>
                  <span className="text-[var(--text-muted)]">SETTLED</span>
                </div>
              </div>

              {/* Telemetry Preview Grid */}
              <div className="p-6 grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">Net Asset Trajectory</span>
                      <div className="text-2xl font-bold font-mono tracking-tight mt-1 flex items-center gap-2">
                        ₹84,291.60
                        <span className="text-xs font-normal text-[var(--accent)] bg-[var(--accent-bg)] px-2 py-0.5 rounded border border-[var(--accent-border)] flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> +4.82%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono text-[var(--text-muted)]">MONTHLY BURN</span>
                      <div className="text-sm font-mono font-semibold text-[var(--text)]">₹12,450.00 / ₹50,000</div>
                    </div>
                  </div>

                  {/* Sparkline Visual */}
                  <div className="h-28 w-full relative pt-2">
                    <svg viewBox="0 0 500 80" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="landingSparkline" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0 60 Q 60 50 120 55 T 240 35 T 360 40 T 480 15 L 480 80 L 0 80 Z"
                        fill="url(#landingSparkline)"
                      />
                      <path
                        d="M 0 60 Q 60 50 120 55 T 240 35 T 360 40 T 480 15"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="2.5"
                      />
                      <circle cx="480" cy="15" r="4" fill="var(--bg)" stroke="var(--accent)" strokeWidth="2" />
                    </svg>
                  </div>
                </div>

                {/* Quick Activity Ticker */}
                <div className="border-t md:border-t-0 md:border-l border-[var(--border)] pt-4 md:pt-0 md:pl-6 space-y-3">
                  <span className="text-xs font-mono text-[var(--text-muted)] block uppercase tracking-wider mb-3">Recent Activity</span>
                  
                  <div className="p-2.5 rounded border border-[var(--border)] bg-[var(--bg)] flex items-center justify-between text-xs font-mono">
                    <div>
                      <div className="font-semibold text-[var(--text)]">Whole Foods</div>
                      <div className="text-[10px] text-[var(--text-muted)]">Groceries</div>
                    </div>
                    <span className="font-semibold text-[var(--danger)]">-₹86.42</span>
                  </div>

                  <div className="p-2.5 rounded border border-[var(--border)] bg-[var(--bg)] flex items-center justify-between text-xs font-mono">
                    <div>
                      <div className="font-semibold text-[var(--text)]">Acme Payroll</div>
                      <div className="text-[10px] text-[var(--accent)]">Income</div>
                    </div>
                    <span className="font-semibold text-[var(--accent)]">+₹50,000.00</span>
                  </div>

                  <div className="p-2.5 rounded border border-[var(--border)] bg-[var(--bg)] flex items-center justify-between text-xs font-mono">
                    <div>
                      <div className="font-semibold text-[var(--text)]">Vanguard Index</div>
                      <div className="text-[10px] text-[var(--text-muted)] font-mono">Transfer</div>
                    </div>
                    <span className="font-semibold text-[var(--text-muted)]">-₹15,000.00</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.section>

          {/* Features Grid */}
          <section id="features" className="py-20 border-t border-[var(--border)] bg-[var(--panel)]/40 px-6 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="text-center max-w-xl mx-auto mb-16">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Designed for clarity & control</h2>
                <p className="text-sm text-[var(--text-muted)]">No bloat or excessive motion. Pure, crisp financial telemetry.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--panel)] flex flex-col justify-between hover:border-[var(--text-muted)]/40 transition-colors">
                  <div>
                    <div className="w-10 h-10 rounded-lg border border-[var(--border)] bg-[var(--bg)] flex items-center justify-center mb-4 text-[var(--accent)]">
                      <Activity className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-semibold mb-2">Real-Time Ledger</h3>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      Chronological running balances with instantly calculated net flow and category metadata.
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--panel)] flex flex-col justify-between hover:border-[var(--text-muted)]/40 transition-colors">
                  <div>
                    <div className="w-10 h-10 rounded-lg border border-[var(--border)] bg-[var(--bg)] flex items-center justify-center mb-4 text-[var(--text)]">
                      <PieChart className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-semibold mb-2">Spend Allocation</h3>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      Dynamic visual breakdown of monthly burn across essential vs. discretionary categories.
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--panel)] flex flex-col justify-between hover:border-[var(--text-muted)]/40 transition-colors">
                  <div>
                    <div className="w-10 h-10 rounded-lg border border-[var(--border)] bg-[var(--bg)] flex items-center justify-center mb-4 text-[var(--accent)]">
                      <Database className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-semibold mb-2">Java + JDBC Native</h3>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      Engineered specifically to connect seamlessly to lightweight Java JDBC backend architectures.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-auto border-t border-[var(--border)] py-8 px-6 text-xs text-[var(--text-muted)] font-mono relative z-10">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                <span>EXPENSE TRACKER EXECUTIVE FOUNDATION</span>
              </div>
              <div className="flex items-center gap-6">
                <Link href="/login" className="hover:text-[var(--text)]">LOGIN</Link>
                <Link href="/signup" className="hover:text-[var(--text)]">SIGNUP</Link>
                <Link href="/dashboard" className="hover:text-[var(--text)]">DASHBOARD</Link>
              </div>
            </div>
            <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-[var(--border)] text-center flex items-center justify-center">
              <span>Developed by • Siddhant Surve • Yuvraj Singh • Tarak Desai • Yuvraj Tiwari</span>
            </div>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
