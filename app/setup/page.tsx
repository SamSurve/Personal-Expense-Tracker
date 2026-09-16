'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ArrowLeft, ArrowRight, Check, DollarSign, User, ShieldCheck, PieChart, Layers } from 'lucide-react'

// Default available categories
const DEFAULT_CATEGORIES = [
  { id: 'food', name: 'Food & Dining', defaultAmount: '5000' },
  { id: 'travel', name: 'Travel & Transport', defaultAmount: '2000' },
  { id: 'shopping', name: 'Shopping & Retail', defaultAmount: '3000' },
  { id: 'housing', name: 'Housing & Rent', defaultAmount: '12000' },
  { id: 'utilities', name: 'Utilities & Bills', defaultAmount: '2500' },
  { id: 'subscriptions', name: 'Subscriptions', defaultAmount: '1000' },
  { id: 'healthcare', name: 'Healthcare & Wellness', defaultAmount: '1500' },
]

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Step 1 State: Name
  const [userName, setUserName] = useState('')

  // Step 2 State: Income & Savings
  const [monthlyIncome, setMonthlyIncome] = useState('50000')
  const [savingsTarget, setSavingsTarget] = useState('15000')

  // Step 3 State: Selected Categories & Monthly Budget Allocation
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(['food', 'travel', 'shopping'])
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, string>>({
    food: '5000',
    travel: '2000',
    shopping: '3000',
    housing: '12000',
    utilities: '2500',
    subscriptions: '1000',
    healthcare: '1500',
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('user_setup_name')
      if (storedName) {
        setUserName(storedName)
      }
    }
  }, [])

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleBudgetChange = (id: string, val: string) => {
    setCategoryBudgets((prev) => ({ ...prev, [id]: val }))
  }

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault()
    
    let userId = 1
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('user_id')
      if (storedId) userId = parseInt(storedId, 10) || 1

      localStorage.setItem('user_setup_completed', 'true')
      localStorage.setItem('user_setup_income', monthlyIncome)
      localStorage.setItem('user_setup_savings', savingsTarget)
      localStorage.setItem(
        'user_setup_categories',
        JSON.stringify(
          selectedCategoryIds.map((id) => ({
            id,
            name: DEFAULT_CATEGORIES.find((c) => c.id === id)?.name || id,
            budget: categoryBudgets[id] || '0',
          }))
        )
      )
    }

    const categoryMap: Record<string, number> = {}
    selectedCategoryIds.forEach((id) => {
      const name = DEFAULT_CATEGORIES.find((c) => c.id === id)?.name || id
      categoryMap[name] = parseFloat(categoryBudgets[id] || '0') || 0
    })

    const { apiSaveOnboarding } = await import('@/lib/api')
    await apiSaveOnboarding(
      userId,
      parseFloat(monthlyIncome) || 0,
      parseFloat(savingsTarget) || 0,
      categoryMap
    )

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col justify-between font-sans transition-colors duration-200">
      {/* Header */}
      <header className="p-6 flex items-center justify-between max-w-6xl w-full mx-auto">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          EXIT SETUP
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl bg-[var(--panel)] border border-[var(--border)] rounded-xl p-8 shadow-xl">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] mb-3">
              <span>STEP 0{step} OF 03</span>
              <span className="text-[var(--accent)] font-semibold">
                {step === 1 && 'PROFILE CONFIRMATION'}
                {step === 2 && 'INCOME & TARGETS'}
                {step === 3 && 'SPENDING ALLOCATION'}
              </span>
            </div>
            <div className="h-1.5 w-full bg-[var(--bg)] border border-[var(--border)] rounded-full overflow-hidden flex">
              <div
                className="h-full bg-[var(--accent)] transition-all duration-300 ease-out"
                style={{ width: step === 1 ? '33.3%' : step === 2 ? '66.6%' : '100%' }}
              />
            </div>
          </div>

          {/* STEP 1: Name Confirmation */}
          {step === 1 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-full border border-[var(--border)] bg-[var(--bg)] flex items-center justify-center mx-auto mb-4 text-[var(--accent)]">
                  <User className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome to Expense Tracker</h1>
                <p className="text-xs text-[var(--text-muted)]">
                  Confirm how you would like your name displayed on your executive ledger.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-mono text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md px-4 py-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!userName.trim()}
                  className="w-full bg-[var(--text)] text-[var(--bg)] rounded-md py-3 font-medium text-sm hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  Continue to Financial Targets
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Monthly Income & Savings Target */}
          {step === 2 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-full border border-[var(--border)] bg-[var(--bg)] flex items-center justify-center mx-auto mb-4 text-[var(--accent)]">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight mb-2">Financial Baseline</h1>
                <p className="text-xs text-[var(--text-muted)]">
                  Set your monthly net income and intended savings goal.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-mono text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                    Monthly Net Income (₹ / $)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-[var(--text-muted)]">
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                      placeholder="50000"
                      className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md pl-9 pr-4 py-2.5 text-sm text-[var(--text)] font-mono focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                    Monthly Savings Goal (₹ / $)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-[var(--text-muted)]">
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      value={savingsTarget}
                      onChange={(e) => setSavingsTarget(e.target.value)}
                      placeholder="15000"
                      className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md pl-9 pr-4 py-2.5 text-sm text-[var(--text)] font-mono focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] rounded-md py-3 font-medium text-sm hover:bg-[var(--panel-hover)] transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="w-2/3 bg-[var(--text)] text-[var(--bg)] rounded-md py-3 font-medium text-sm hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2"
                  >
                    Set Category Budgets
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Category Selection & Spending Amounts */}
          {step === 3 && (
            <form onSubmit={handleFinish}>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full border border-[var(--border)] bg-[var(--bg)] flex items-center justify-center mx-auto mb-4 text-[var(--accent)]">
                  <PieChart className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight mb-2">Category Allocations</h1>
                <p className="text-xs text-[var(--text-muted)]">
                  Select your spending categories and set your baseline monthly budget for each.
                </p>
              </div>

              {/* Category Toggles and Inputs */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1 mb-6">
                {DEFAULT_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategoryIds.includes(cat.id)
                  return (
                    <div
                      key={cat.id}
                      className={`p-3.5 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-[var(--accent-border)] bg-[var(--accent-bg)]'
                          : 'border-[var(--border)] bg-[var(--bg)]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <div
                            onClick={() => toggleCategory(cat.id)}
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--bg)]'
                                : 'border-[var(--border)] bg-[var(--panel)]'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="text-sm font-medium">{cat.name}</span>
                        </label>
                      </div>

                      {isSelected && (
                        <div className="pl-6 pt-1 flex items-center gap-2">
                          <span className="text-xs font-mono text-[var(--text-muted)]">Budget: ₹</span>
                          <input
                            type="number"
                            value={categoryBudgets[cat.id] || ''}
                            onChange={(e) => handleBudgetChange(cat.id, e.target.value)}
                            placeholder="0"
                            className="bg-[var(--panel)] border border-[var(--border)] rounded px-3 py-1 text-xs font-mono text-[var(--text)] w-32 focus:outline-none focus:border-[var(--accent)]"
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] rounded-md py-3 font-medium text-sm hover:bg-[var(--panel-hover)] transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-[var(--text)] text-[var(--bg)] rounded-md py-3 font-medium text-sm hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2"
                >
                  Complete Setup → Dashboard
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs font-mono text-[var(--text-muted)] space-y-2">
        <div>EXPENSE TRACKER EXECUTIVE ONBOARDING &copy; 2026</div>
        <div>Developed by • Siddhant Surve • Yuvraj Singh • Tarak Desai • Yuvraj Tiwari</div>
      </footer>
    </div>
  )
}
