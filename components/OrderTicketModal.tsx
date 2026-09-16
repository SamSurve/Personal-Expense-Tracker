'use client'

import { useState, useEffect, useRef } from 'react'
import { Transaction } from '@/lib/types'
import { X, Plus, Edit2, AlertCircle, RefreshCw } from 'lucide-react'

interface OrderTicketModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (transaction: Omit<Transaction, 'balance'>) => void | Promise<void>
  editingTransaction?: Transaction | null
  currentLiquidity?: number
  userCategories?: string[]
}

const DEFAULT_CATEGORIES = [
  'Food & Dining',
  'Travel & Transport',
  'Groceries',
  'Housing & Rent',
  'Utilities & Bills',
  'Subscriptions',
  'Shopping & Retail',
  'Healthcare & Wellness',
  'General',
]

export function OrderTicketModal({
  isOpen,
  onClose,
  onSubmit,
  editingTransaction,
  userCategories = [],
}: OrderTicketModalProps) {
  const [title, setTitle] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [category, setCategory] = useState<string>('Groceries')
  const [date, setDate] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const titleInputRef = useRef<HTMLInputElement>(null)

  // Merge default categories with user's configured categories
  const categories = Array.from(new Set([...userCategories, ...DEFAULT_CATEGORIES]))

  // Helper for today's date YYYY-MM-DD
  const getTodayDateStr = () => {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  // Populate or reset form fields when modal opens or editingTransaction changes
  useEffect(() => {
    if (!isOpen) return

    setError(null)
    setSubmitting(false)

    if (editingTransaction) {
      setTitle(editingTransaction.merchant || '')
      setAmount(Math.abs(editingTransaction.amount).toString())
      setCategory(editingTransaction.category || 'Groceries')
      setDate(editingTransaction.timestamp ? editingTransaction.timestamp.slice(0, 10) : getTodayDateStr())
      setNotes(editingTransaction.notes || '')
    } else {
      setTitle('')
      setAmount('')
      setCategory(categories[0] || 'Groceries')
      setDate(getTodayDateStr())
      setNotes('')
    }

    // Auto-focus title input
    setTimeout(() => {
      titleInputRef.current?.focus()
    }, 50)
  }, [isOpen, editingTransaction])

  // ESC Key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !submitting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, submitting])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedTitle = title.trim()
    const numAmount = parseFloat(amount)

    if (!trimmedTitle) {
      setError('Please enter a valid expense title.')
      return
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than ₹0.')
      return
    }

    try {
      setSubmitting(true)
      const signedAmount = -Math.abs(numAmount)
      const txId = editingTransaction?.id || `TX-${Math.floor(100000 + Math.random() * 900000)}`
      const refHash = editingTransaction?.refHash || `0x${Math.random().toString(16).substring(2, 10)}`

      await onSubmit({
        id: txId,
        timestamp: date || getTodayDateStr(),
        type: 'EXPENSE',
        merchant: trimmedTitle,
        category,
        amount: signedAmount,
        account: 'Primary Account',
        status: 'SETTLED',
        notes: notes.trim(),
        refHash,
      })

      onClose()
    } catch (err: any) {
      console.error('Error submitting expense modal:', err)
      setError(err.message || 'Failed to record expense. Please check backend server.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => {
        if (!submitting) onClose()
      }}
    >
      <div
        className="bg-[var(--panel)] border border-[var(--border)] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col p-6 space-y-5 relative text-[var(--text)] transition-all max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="record-expense-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--border)] pb-4">
          <div>
            <h2 id="record-expense-title" className="text-base font-bold tracking-tight text-[var(--text)] flex items-center gap-2">
              {editingTransaction ? <Edit2 className="w-4 h-4 text-[var(--accent)]" /> : <Plus className="w-4 h-4 text-[var(--accent)]" />}
              <span>{editingTransaction ? 'Edit Expense' : 'Record Expense'}</span>
            </h2>
            <p className="text-xs text-[var(--text-muted)] font-light mt-0.5">
              {editingTransaction
                ? 'Modify your existing expense record in MySQL.'
                : 'Enter details to insert a new expense into your MySQL database.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Notification Alert */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Expense Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Expense Title */}
          <div className="space-y-1.5">
            <label htmlFor="expense-title" className="text-xs font-mono text-[var(--text-muted)] uppercase block">
              Expense Title <span className="text-red-400">*</span>
            </label>
            <input
              id="expense-title"
              ref={titleInputRef}
              type="text"
              required
              placeholder="e.g. Groceries, Coffee, Swiggy"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3.5 py-2 text-xs text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          {/* 2. Amount & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-1.5">
              <label htmlFor="expense-amount" className="text-xs font-mono text-[var(--text-muted)] uppercase block">
                Amount (₹) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[var(--text-muted)]">₹</span>
                <input
                  id="expense-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={submitting}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg pl-7 pr-3 py-2 text-xs font-mono text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label htmlFor="expense-category" className="text-xs font-mono text-[var(--text-muted)] uppercase block">
                Category
              </label>
              <select
                id="expense-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={submitting}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Date */}
          <div className="space-y-1.5">
            <label htmlFor="expense-date" className="text-xs font-mono text-[var(--text-muted)] uppercase block">
              Expense Date
            </label>
            <input
              id="expense-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={submitting}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3.5 py-2 text-xs font-mono text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          {/* 4. Notes */}
          <div className="space-y-1.5">
            <label htmlFor="expense-notes" className="text-xs font-mono text-[var(--text-muted)] uppercase block">
              Notes <span className="text-[var(--text-muted)] font-normal lowercase">(optional)</span>
            </label>
            <input
              id="expense-notes"
              type="text"
              placeholder="e.g. Weekly grocery shopping at supermarket"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={submitting}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3.5 py-2 text-xs text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          {/* Actions Footer */}
          <div className="pt-4 border-t border-[var(--border)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4.5 py-2 rounded-lg bg-[var(--accent)] text-black text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{submitting ? 'Saving...' : editingTransaction ? 'Update Expense' : 'Record Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
