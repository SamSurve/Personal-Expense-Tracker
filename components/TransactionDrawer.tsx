'use client'

import { useEffect, useState } from 'react'
import { Transaction } from '@/lib/types'
import { CATEGORY_COLORS } from '@/lib/mockData'

interface TransactionDrawerProps {
  transaction: Transaction | null
  onClose: () => void
  onEdit: (tx: Transaction) => void
  onDelete: (id: string) => void
}

export function TransactionDrawer({
  transaction,
  onClose,
  onEdit,
  onDelete
}: TransactionDrawerProps) {
  const [copied, setCopied] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Reset state on transaction change
  useEffect(() => {
    setCopied(false)
    setConfirmDelete(false)
  }, [transaction?.id])

  // ESC handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && transaction) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [transaction, onClose])

  if (!transaction) return null

  const handleCopyHash = () => {
    if (transaction.refHash) {
      navigator.clipboard.writeText(transaction.refHash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    onDelete(transaction.id)
    onClose()
  }

  const isPositive = transaction.amount > 0
  const categoryColor = CATEGORY_COLORS[transaction.category] || '#94a3b8'

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside
        className="transaction-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="drawer-title"
      >
        {/* Drawer Top Navigation */}
        <div className="drawer-header">
          <div className="drawer-header-left">
            <span className="eyebrow">ORDER CONFIRMATION</span>
            <div className="drawer-id-row">
              <h2 id="drawer-title" className="drawer-ticket-id mono">
                #{transaction.id}
              </h2>
              <span className={`drawer-status-pill ${transaction.status.toLowerCase()}`}>
                {transaction.status}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Close details"
          >
            ✕
          </button>
        </div>

        {/* Hero Amount Ticket Block */}
        <div className={`drawer-hero-ticket ${transaction.type.toLowerCase()}`}>
          <div className="hero-top-meta">
            <span className={`type-pill ${transaction.type.toLowerCase()}`}>
              {transaction.type}
            </span>
            <span className="drawer-time mono">{transaction.timestamp}</span>
          </div>
          <div className="hero-amount mono">
            <span className={isPositive ? 'positive' : 'negative'}>
              {isPositive ? '+' : '−'}$
              {Math.abs(transaction.amount).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </span>
          </div>
          <div className="hero-merchant">{transaction.merchant}</div>
        </div>

        {/* High-density Terminal Specifications Grid */}
        <div className="drawer-spec-list">
          <div className="spec-item">
            <span className="spec-label mono">CATEGORY</span>
            <div className="spec-value category-val">
              <span
                className="category-dot"
                style={{ backgroundColor: categoryColor, boxShadow: `0 0 6px ${categoryColor}88` }}
              />
              <span>{transaction.category}</span>
            </div>
          </div>

          <div className="spec-item">
            <span className="spec-label mono">SOURCE ACCOUNT</span>
            <span className="spec-value mono">{transaction.account}</span>
          </div>

          <div className="spec-item">
            <span className="spec-label mono">RUNNING BALANCE AT SETTLE</span>
            <span className="spec-value mono highlight-balance">
              ${transaction.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?? '18,420.18'}
            </span>
          </div>

          <div className="spec-item">
            <span className="spec-label mono">PAYMENT RAIL</span>
            <span className="spec-value mono">
              {transaction.type === 'INCOME'
                ? 'ACH DIRECT DEPOSIT (CLEARED)'
                : transaction.type === 'TRANSFER'
                ? 'FINANCIAL INSTITUTION WIRE'
                : 'CHIP & PIN CONTACTLESS / VISA NETWORK'}
            </span>
          </div>

          <div className="spec-item">
            <span className="spec-label mono">TRANSACTION HASH</span>
            <div className="spec-value hash-row mono">
              <code className="hash-code">{transaction.refHash}</code>
              <button
                type="button"
                className="copy-hash-btn"
                onClick={handleCopyHash}
                title="Copy hash"
              >
                {copied ? '✓ COPIED' : 'COPY'}
              </button>
            </div>
          </div>

          <div className="spec-item full-width">
            <span className="spec-label mono">MEMO / TRANSACTION NOTES</span>
            <div className="spec-notes">
              {transaction.notes ? (
                <p>{transaction.notes}</p>
              ) : (
                <span className="muted italic mono">No memo recorded for this entry.</span>
              )}
            </div>
          </div>

          <div className="spec-item full-width">
            <span className="spec-label mono">AUDIT TRAIL // RECONCILIATION</span>
            <div className="audit-box mono">
              <div className="audit-row">
                <span className="status-pulse" />
                <span>CRYPTOGRAPHIC VERIFICATION: OK</span>
              </div>
              <div className="audit-row">
                <span className="status-pulse" />
                <span>PLAID ENCRYPTED SYNC: VERIFIED</span>
              </div>
              <div className="audit-row">
                <span className="status-pulse" />
                <span>LEDGER TIMESTAMP: {transaction.timestamp} EST</span>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Actions */}
        <div className="drawer-footer">
          <button
            type="button"
            className="drawer-action-btn edit-btn mono"
            onClick={() => {
              onEdit(transaction)
              onClose()
            }}
          >
            ✎ EDIT TICKET
          </button>

          <button
            type="button"
            className={`drawer-action-btn delete-btn mono ${confirmDelete ? 'confirming' : ''}`}
            onClick={handleDelete}
          >
            {confirmDelete ? '⚠ CONFIRM DELETE?' : '🗑 DELETE ENTRY'}
          </button>
        </div>
      </aside>
    </div>
  )
}
