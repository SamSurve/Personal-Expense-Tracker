'use client'

import { useState, useEffect, useRef } from 'react'
import { Transaction, TransactionType } from '@/lib/types'
import { KNOWN_ACCOUNTS, KNOWN_CATEGORIES } from '@/lib/mockData'

interface OrderTicketModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (transaction: Omit<Transaction, 'balance'>) => void
  editingTransaction?: Transaction | null
  currentLiquidity: number
}

const QUICK_MERCHANTS: Record<TransactionType, string[]> = {
  EXPENSE: ['Whole Foods Market', 'Starbucks', 'Uber / Lyft', 'Amazon', 'Avalon Rent', 'Trader Joe’s'],
  INCOME: ['Acme Corp · Payroll', 'Consulting Client', 'Stripe Payout', 'Fidelity Dividend', 'Venmo Inflow'],
  TRANSFER: ['Vanguard Brokerage', 'Coinbase Deposit', 'High-Yield Savings', 'Checking Transfer']
}

export function OrderTicketModal({
  isOpen,
  onClose,
  onSubmit,
  editingTransaction,
  currentLiquidity
}: OrderTicketModalProps) {
  const [type, setType] = useState<TransactionType>('EXPENSE')
  const [amount, setAmount] = useState<string>('')
  const [merchant, setMerchant] = useState<string>('')
  const [category, setCategory] = useState<string>('Groceries')
  const [account, setAccount] = useState<string>(KNOWN_ACCOUNTS[0])
  const [timestamp, setTimestamp] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [status, setStatus] = useState<'SETTLED' | 'PENDING'>('SETTLED')

  const amountInputRef = useRef<HTMLInputElement>(null)

  // Reset or populate fields when modal opens or editing changes
  useEffect(() => {
    if (!isOpen) return

    if (editingTransaction) {
      setType(editingTransaction.type)
      setAmount(Math.abs(editingTransaction.amount).toFixed(2))
      setMerchant(editingTransaction.merchant)
      setCategory(editingTransaction.category)
      setAccount(editingTransaction.account)
      setTimestamp(editingTransaction.timestamp)
      setNotes(editingTransaction.notes || '')
      setStatus(editingTransaction.status)
    } else {
      const now = new Date()
      const pad = (n: number) => n.toString().padStart(2, '0')
      const isoNow = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`

      setType('EXPENSE')
      setAmount('')
      setMerchant('')
      setCategory('Groceries')
      setAccount(KNOWN_ACCOUNTS[0])
      setTimestamp(isoNow)
      setNotes('')
      setStatus('SETTLED')
    }

    setTimeout(() => {
      amountInputRef.current?.focus()
    }, 50)
  }, [isOpen, editingTransaction])

  // Adjust category default when switching type
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType)
    if (newType === 'INCOME') {
      setCategory('Income')
    } else if (newType === 'TRANSFER') {
      setCategory('Investments')
    } else {
      if (category === 'Income' || category === 'Investments') {
        setCategory('Groceries')
      }
    }
  }

  // Keyboard shortcut for ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const numAmount = parseFloat(amount) || 0
  const signedAmount = type === 'EXPENSE' ? -Math.abs(numAmount) : Math.abs(numAmount)
  const projectedLiquidity = currentLiquidity + signedAmount

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!merchant.trim() || numAmount <= 0) return

    const randomHash = editingTransaction?.refHash || `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`
    const txId = editingTransaction?.id || `TX-${Math.floor(100000 + Math.random() * 900000)}`

    onSubmit({
      id: txId,
      timestamp: timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19),
      type,
      merchant: merchant.trim(),
      category,
      amount: signedAmount,
      account,
      status,
      notes: notes.trim(),
      refHash: randomHash
    })

    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="order-ticket-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="order-ticket-title"
      >
        {/* Ticket Header */}
        <div className="ticket-header">
          <div>
            <div className="eyebrow">
              {editingTransaction ? `MODIFY ORDER // #${editingTransaction.id}` : 'LIMIT / MARKET ORDER ENTRY'}
            </div>
            <h2 id="order-ticket-title" className="ticket-title">
              {editingTransaction ? 'Edit Transaction Ticket' : 'Execute New Transaction'}
            </h2>
          </div>
          <div className="ticket-header-right">
            <span className="order-status-badge mono">
              <span className="status-pulse" /> ORDER DESK READY
            </span>
            <button type="button" className="close-ticket-btn" onClick={onClose} aria-label="Close modal">
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="ticket-form">
          {/* Order Side Selector */}
          <div className="order-side-selector">
            <span className="form-label mono">ORDER SIDE</span>
            <div className="side-button-grid">
              <button
                type="button"
                className={`side-btn expense ${type === 'EXPENSE' ? 'active' : ''}`}
                onClick={() => handleTypeChange('EXPENSE')}
              >
                ▼ EXPENSE / DEBIT
              </button>
              <button
                type="button"
                className={`side-btn income ${type === 'INCOME' ? 'active' : ''}`}
                onClick={() => handleTypeChange('INCOME')}
              >
                ▲ INCOME / CREDIT
              </button>
              <button
                type="button"
                className={`side-btn transfer ${type === 'TRANSFER' ? 'active' : ''}`}
                onClick={() => handleTypeChange('TRANSFER')}
              >
                ⇄ TRANSFER / MOVE
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="form-group amount-group">
            <label htmlFor="tx-amount" className="form-label mono">
              EXECUTION AMOUNT (USD)
            </label>
            <div className="amount-input-wrapper">
              <span className="currency-prefix mono">$</span>
              <input
                id="tx-amount"
                ref={amountInputRef}
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                className="amount-input mono"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <span className={`direction-indicator mono ${type.toLowerCase()}`}>
                {type === 'EXPENSE' ? 'OUTFLOW' : type === 'INCOME' ? 'INFLOW' : 'INTERNAL'}
              </span>
            </div>
          </div>

          {/* Merchant / Counterparty */}
          <div className="form-group">
            <div className="label-row">
              <label htmlFor="tx-merchant" className="form-label mono">
                COUNTERPARTY / MERCHANT
              </label>
              <span className="label-hint mono">REQUIRED</span>
            </div>
            <input
              id="tx-merchant"
              type="text"
              required
              placeholder="e.g., Whole Foods Market, Apple, Acme Corp"
              className="terminal-input"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
            />
            {/* Quick chips */}
            <div className="quick-chips">
              <span className="quick-chips-label mono">QUICK:</span>
              {QUICK_MERCHANTS[type].slice(0, 4).map((m) => (
                <button
                  key={m}
                  type="button"
                  className="chip-btn mono"
                  onClick={() => setMerchant(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Category & Account Split Row */}
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="tx-category" className="form-label mono">
                CATEGORY
              </label>
              <select
                id="tx-category"
                className="terminal-select mono"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {KNOWN_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tx-account" className="form-label mono">
                PAYMENT ACCOUNT
              </label>
              <select
                id="tx-account"
                className="terminal-select mono"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
              >
                {KNOWN_ACCOUNTS.map((acc) => (
                  <option key={acc} value={acc}>
                    {acc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Timestamp & Status Split Row */}
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="tx-timestamp" className="form-label mono">
                TIMESTAMP (ISO / UTC)
              </label>
              <input
                id="tx-timestamp"
                type="text"
                required
                className="terminal-input mono"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="tx-status" className="form-label mono">
                CLEARING STATUS
              </label>
              <select
                id="tx-status"
                className="terminal-select mono"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'SETTLED' | 'PENDING')}
              >
                <option value="SETTLED">SETTLED / RECONCILED</option>
                <option value="PENDING">PENDING / AUTHORIZATION</option>
              </select>
            </div>
          </div>

          {/* Notes / Memo */}
          <div className="form-group">
            <label htmlFor="tx-notes" className="form-label mono">
              MEMO / TRANSACTION NOTES (OPTIONAL)
            </label>
            <input
              id="tx-notes"
              type="text"
              placeholder="e.g. Receipt verified, quarterly business expense, tax deductible"
              className="terminal-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Impact Preview Box */}
          <div className="ticket-impact-box mono">
            <div className="impact-col">
              <span className="impact-label">FLOW DIRECTION</span>
              <strong className={type.toLowerCase()}>{type}</strong>
            </div>
            <div className="impact-col">
              <span className="impact-label">NET IMPACT</span>
              <strong className={signedAmount >= 0 ? 'positive' : 'negative'}>
                {signedAmount >= 0 ? '+' : '−'}${Math.abs(signedAmount).toFixed(2)}
              </strong>
            </div>
            <div className="impact-col">
              <span className="impact-label">EST. LIQUIDITY</span>
              <strong className="positive">${projectedLiquidity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
            </div>
          </div>

          {/* Ticket Footer Actions */}
          <div className="ticket-actions">
            <button type="button" className="btn-cancel mono" onClick={onClose}>
              CANCEL (ESC)
            </button>
            <button type="submit" className={`btn-submit mono ${type.toLowerCase()}`}>
              {editingTransaction ? 'UPDATE TICKET (↵)' : 'EXECUTE ORDER // RECORD (↵)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
