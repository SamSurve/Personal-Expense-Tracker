'use client'

import React from 'react'
import { Doraemon3DCharacter } from './Doraemon3DCharacter'
import { DashboardSummaryDTO } from '@/lib/api'
import { X, ShieldCheck, Compass, Gauge, Wallet, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface ImpactDrawerProps {
  isOpen: boolean
  onClose: () => void
  summaryData: DashboardSummaryDTO | null
  lastExpenseTitle?: string
  lastExpenseAmount?: number
}

export function ImpactDrawer({
  isOpen,
  onClose,
  summaryData,
  lastExpenseTitle,
  lastExpenseAmount,
}: ImpactDrawerProps) {
  if (!isOpen || !summaryData) return null

  const pace = summaryData.spendingPace
  const health = summaryData.spendingHealth

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[var(--panel)] border border-[var(--border)] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col p-6 space-y-5 relative text-[var(--text)] transition-all max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="impact-drawer-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <Doraemon3DCharacter mood="normal" className="scale-75 origin-left" />
            <div>
              <h2 id="impact-drawer-title" className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Financial Impact Analysis
              </h2>
              <p className="text-[13px] text-slate-600 dark:text-slate-300 font-normal mt-0.5">
                Updated using your current financial data.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[var(--border)] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-[var(--bg)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Highlight Banner if last expense specified */}
        {lastExpenseTitle && lastExpenseAmount ? (
          <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300 block uppercase font-medium tracking-wide">
                LAST RECORDED EXPENSE
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block mt-0.5">
                {lastExpenseTitle}
              </span>
            </div>
            <span className="font-mono text-base font-bold text-[var(--danger)]">
              -₹{lastExpenseAmount.toLocaleString('en-IN')}
            </span>
          </div>
        ) : null}

        {/* 4 Impact Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* 1. Spending Pace */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1.5 font-medium tracking-wide">
                <Compass className="w-3.5 h-3.5 text-[var(--accent)]" /> Spending Pace
              </span>
              {pace && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  pace.paceStatus === 'ON TRACK'
                    ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20'
                    : pace.paceStatus === 'ABOVE PACE'
                    ? 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20'
                    : 'bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border-cyan-500/20'
                }`}>
                  {pace.paceStatus}
                </span>
              )}
            </div>
            <div className="text-[17px] font-bold font-mono text-slate-900 dark:text-slate-100 tracking-tight">
              ₹{pace?.actualSpentMonth?.toLocaleString('en-IN') || '0'}
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-300 block font-normal">
              Ideal pace today: ₹{pace?.idealPaceToday?.toLocaleString('en-IN') || '0'}
            </span>
          </div>

          {/* 2. Safe to Spend */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] space-y-1.5">
            <div className="text-[11px] font-mono text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1.5 font-medium tracking-wide">
              <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Safe to Spend
            </div>
            <div className="text-[17px] font-bold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
              ₹{pace?.safeToSpend?.toLocaleString('en-IN') || '0'}
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-300 block font-normal">
              Discretionary cushion
            </span>
          </div>

          {/* 3. Projected Month-End */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] space-y-1.5">
            <div className="text-[11px] font-mono text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1.5 font-medium tracking-wide">
              <Gauge className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Projected Month-End
            </div>
            <div className="text-[17px] font-bold font-mono text-slate-900 dark:text-slate-100 tracking-tight">
              ₹{pace?.projectedMonthSpend?.toLocaleString('en-IN') || '0'}
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-300 block font-normal">
              Based on daily burn rate
            </span>
          </div>

          {/* 4. Spending Health Score */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1.5 font-medium tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]" /> Health Score
              </span>
              {health && (
                <span className="text-[10px] font-mono font-bold text-[var(--accent)]">
                  {health.healthLabel}
                </span>
              )}
            </div>
            <div className="text-[17px] font-bold font-mono text-slate-900 dark:text-slate-100 flex items-baseline gap-1 tracking-tight">
              <span>{health?.score || 0}</span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">/ 100</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--panel)] rounded-full overflow-hidden border border-[var(--border)]">
              <div
                className="h-full bg-[var(--accent)] transition-all"
                style={{ width: `${health?.score || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Explanation Box */}
        {pace?.explanation && (
          <p className="text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed bg-[var(--bg)] p-4 rounded-xl border border-[var(--border)] font-normal">
            {pace.explanation}
          </p>
        )}

        {/* Footer Action */}
        <div className="pt-2 border-t border-[var(--border)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-[var(--accent)] text-black font-bold text-xs sm:text-[13px] hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
