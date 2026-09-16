'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { DoraemonAvatar, DoraemonMood } from './DoraemonAvatar'
import { DashboardSummaryDTO } from '@/lib/api'
import { X, Sparkles, ArrowRight } from 'lucide-react'

interface DoraemonCompanionProps {
  summaryData: DashboardSummaryDTO | null
  lastExpenseTitle?: string
  lastExpenseAmount?: number
  triggerCounter: number
  onOpenImpact: () => void
}

export function DoraemonCompanion({
  summaryData,
  lastExpenseTitle,
  lastExpenseAmount,
  triggerCounter,
  onOpenImpact,
}: DoraemonCompanionProps) {
  const [isVisible, setIsVisible] = useState(false)

  // Trigger visibility whenever a new expense is successfully saved
  useEffect(() => {
    if (triggerCounter > 0 && summaryData) {
      setIsVisible(true)
      // Auto-hide after 12 seconds if not dismissed manually
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 12000)
      return () => clearTimeout(timer)
    }
  }, [triggerCounter, summaryData])

  // Deterministic Message & Mood Engine derived strictly from real database values
  const reaction = useMemo(() => {
    if (!summaryData) {
      return {
        mood: 'normal' as DoraemonMood,
        headline: 'Expense recorded!',
        message: 'Your spending data has been updated in MySQL.',
      }
    }

    const pace = summaryData.spendingPace
    const health = summaryData.spendingHealth
    const totalSpent = summaryData.totalExpenses || 0
    const income = summaryData.totalIncome || 1
    const overCat = summaryData.categoryComparisons?.find((c) => c.isOver)

    // Rule 1: Large single purchase impact (>20% of discretionary capacity)
    if (
      lastExpenseAmount &&
      pace?.discretionaryCapacity &&
      lastExpenseAmount >= pace.discretionaryCapacity * 0.15
    ) {
      return {
        mood: 'surprised' as DoraemonMood,
        headline: 'Whoa! Significant purchase.',
        message: `"${lastExpenseTitle || 'Expense'}" (₹${lastExpenseAmount.toLocaleString('en-IN')}) shifted your projected month-end spend to ₹${pace.projectedMonthSpend.toLocaleString('en-IN')}.`,
      }
    }

    // Rule 2: Spending Pace is Above Target
    if (pace?.paceStatus === 'ABOVE PACE') {
      return {
        mood: 'concerned' as DoraemonMood,
        headline: 'Pace warning!',
        message: `Your spending velocity is above your target pace for Day ${pace.daysElapsed} of ${pace.daysInMonth}.`,
      }
    }

    // Rule 3: Category Budget Exceeded
    if (overCat) {
      return {
        mood: 'concerned' as DoraemonMood,
        headline: 'Category alert!',
        message: `Spending in ${overCat.categoryName} is currently over your planned baseline of ₹${overCat.baselineAmount.toLocaleString('en-IN')}.`,
      }
    }

    // Rule 4: Optimal / Healthy Pace
    if (health?.score && health.score >= 80) {
      return {
        mood: 'happy' as DoraemonMood,
        headline: 'Healthy spending pace!',
        message: `Expense added! Your overall financial health score is optimal at ${health.score}/100.`,
      }
    }

    // Rule 5: Standard Normal Message
    const capacityPct = pace?.discretionaryCapacity && pace.discretionaryCapacity > 0
      ? Math.min(100, Math.round((totalSpent / pace.discretionaryCapacity) * 100))
      : Math.min(100, Math.round((totalSpent / income) * 100))

    return {
      mood: 'normal' as DoraemonMood,
      headline: 'Expense recorded!',
      message: `You've used ${capacityPct}% of your monthly discretionary capacity.`,
    }
  }, [summaryData, lastExpenseTitle, lastExpenseAmount])

  if (!isVisible || !summaryData) return null

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 max-w-sm w-[calc(100vw-2.5rem)] sm:w-96 animate-in slide-in-from-bottom-5 fade-in duration-300 font-sans">
      <div className="relative bg-[var(--panel)] border border-[var(--border)] rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-start gap-3.5 text-[var(--text)]">
        {/* Dismiss Close Button */}
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="absolute top-2.5 right-2.5 p-1 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
          title="Dismiss companion"
          aria-label="Dismiss companion"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Doraemon Visual Avatar */}
        <div className="pt-0.5 relative shrink-0">
          <DoraemonAvatar mood={reaction.mood} size={54} />
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] absolute -bottom-0.5 -right-0.5 ring-2 ring-[var(--panel)] animate-pulse" />
        </div>

        {/* Content & Speech Bubble Container */}
        <div className="flex-1 min-w-0 pr-4 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--accent)]">
              DORAEMON FINANCE COMPANION
            </span>
          </div>

          <h4 className="text-xs font-bold text-[var(--text)] leading-tight">
            {reaction.headline}
          </h4>

          <p className="text-[11px] text-[var(--text-muted)] font-light leading-relaxed">
            {reaction.message}
          </p>

          {/* Action CTA Button */}
          <div className="pt-1.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onOpenImpact()
              }}
              className="bg-[var(--accent)] text-black text-[11px] font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1 shadow-sm"
            >
              <span>View Impact</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
