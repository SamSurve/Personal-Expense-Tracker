'use client'

import { useState, useMemo, useEffect } from 'react'
import { Transaction, TransactionType } from '@/lib/types'
import { INITIAL_TRANSACTIONS, calculateBalances } from '@/lib/mockData'
import { FilterToolbar } from '@/components/FilterToolbar'
import { SpendAllocation } from '@/components/SpendAllocation'
import { OrderTicketModal } from '@/components/OrderTicketModal'
import { TransactionDrawer } from '@/components/TransactionDrawer'
import { ThemeToggle } from '@/components/ThemeToggle'

const MONTHLY_BUDGET = 5000.00
const BASE_NET_WORTH = 84291.60

export default function Home() {
  // Master transactions list
  const [rawTransactions, setRawTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS)

  // Real-time ticking terminal clock
  const [currentTime, setCurrentTime] = useState<string>('')
  const [currentDate, setCurrentDate] = useState<string>('')

  // UI state
  const [range, setRange] = useState<string>('1M')
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<'ALL' | TransactionType>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')

  // Modals and Drawers
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [selectedDrawerTx, setSelectedDrawerTx] = useState<Transaction | null>(null)

  // Live ticking terminal clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      const timeStr = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      const dateStr = now.toLocaleDateString('en-US', {
        month: 'long',
        day: '2-digit',
        year: 'numeric'
      }).toUpperCase()

      setCurrentTime(`${timeStr} EST`)
      setCurrentDate(dateStr)
    }
    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [])

  // Calculate dynamic running balances
  const transactions = useMemo(() => {
    return calculateBalances(rawTransactions, 18420.18)
  }, [rawTransactions])

  // Total Liquidity (latest transaction running balance)
  const totalLiquidity = useMemo(() => {
    return transactions.length > 0 ? (transactions[0].balance ?? 18420.18) : 18420.18
  }, [transactions])

  // Monthly Burn: aggregate of all EXPENSE transactions
  const monthlyBurn = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'EXPENSE' && t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  }, [transactions])

  // Budget calculations
  const budgetPercentage = Math.min(Math.round((monthlyBurn / MONTHLY_BUDGET) * 1000) / 10, 100)
  const budgetRemaining = Math.max(MONTHLY_BUDGET - monthlyBurn, 0)

  // Filtered transactions for the ledger view
  const visibleTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type filter
      if (typeFilter !== 'ALL' && tx.type !== typeFilter) {
        return false
      }
      // Category filter
      if (categoryFilter !== 'ALL' && tx.category !== categoryFilter) {
        return false
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        const matchesMerchant = tx.merchant.toLowerCase().includes(q)
        const matchesCategory = tx.category.toLowerCase().includes(q)
        const matchesNotes = tx.notes ? tx.notes.toLowerCase().includes(q) : false
        const matchesId = tx.id.toLowerCase().includes(q)
        const matchesHash = tx.refHash.toLowerCase().includes(q)
        if (!matchesMerchant && !matchesCategory && !matchesNotes && !matchesId && !matchesHash) {
          return false
        }
      }
      // Timeframe filter
      if (range === '1D') {
        return tx.timestamp.startsWith('2026-09-11')
      } else if (range === '1W') {
        return (
          tx.timestamp.startsWith('2026-09-11') ||
          tx.timestamp.startsWith('2026-09-10') ||
          tx.timestamp.startsWith('2026-09-09') ||
          tx.timestamp.startsWith('2026-09-08') ||
          tx.timestamp.startsWith('2026-09-07')
        )
      }
      return true
    })
  }, [transactions, typeFilter, categoryFilter, searchQuery, range])

  // Handlers for Add/Edit/Delete
  const handleRecordTransaction = (newTxData: Omit<Transaction, 'balance'>) => {
    if (editingTransaction) {
      // Update existing
      setRawTransactions((prev) =>
        prev.map((t) => (t.id === editingTransaction.id ? { ...newTxData } : t))
      )
      setEditingTransaction(null)
    } else {
      // Prepend new transaction
      setRawTransactions((prev) => [newTxData, ...prev])
    }
  }

  const handleDeleteTransaction = (id: string) => {
    setRawTransactions((prev) => prev.filter((t) => t.id !== id))
    if (selectedDrawerTx?.id === id) {
      setSelectedDrawerTx(null)
    }
  }

  const handleEditFromDrawer = (tx: Transaction) => {
    setSelectedDrawerTx(null)
    setEditingTransaction(tx)
    setIsOrderModalOpen(true)
  }

  // Export visible transactions to CSV
  const handleExportCsv = () => {
    const headers = ['Transaction ID', 'Timestamp', 'Type', 'Merchant', 'Category', 'Amount', 'Account', 'Status', 'Notes', 'Ref Hash']
    const rows = visibleTransactions.map((t) => [
      t.id,
      t.timestamp,
      t.type,
      `"${t.merchant.replace(/"/g, '""')}"`,
      t.category,
      t.amount.toFixed(2),
      `"${t.account.replace(/"/g, '""')}"`,
      t.status,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      t.refHash
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `ledger_export_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Chart data points & labels based on range
  const { chartPoints, chartLabels, getTooltipText } = useMemo(() => {
    switch (range) {
      case '1D':
        return {
          chartPoints: [48, 46, 50, 49, 53, 51, 55, 54, 58, 56, 62, 61],
          chartLabels: ['08:00', '11:00', '14:00', '17:00', 'TODAY'],
          getTooltipText: () => 'TODAY · RECONCILED'
        }
      case '1W':
        return {
          chartPoints: [42, 40, 46, 44, 50, 48, 54, 52, 57, 55, 60, 61],
          chartLabels: ['SEP 06', 'SEP 08', 'SEP 10', 'SEP 11', 'TODAY'],
          getTooltipText: () => 'THIS WEEK · RECONCILED'
        }
      case '1Y':
        return {
          chartPoints: [10, 15, 12, 22, 18, 30, 25, 40, 35, 50, 45, 61],
          chartLabels: ['OCT', 'JAN', 'APR', 'JUL', 'SEP'],
          getTooltipText: () => 'THIS YEAR · RECONCILED'
        }
      case 'ALL':
        return {
          chartPoints: [5, 12, 8, 20, 15, 32, 25, 45, 38, 55, 48, 61],
          chartLabels: ['2023', 'Q3', '2024', 'Q3', '2026'],
          getTooltipText: () => 'HISTORICAL · RECONCILED'
        }
      case '1M':
      default:
        return {
          chartPoints: [8, 12, 10, 17, 15, 21, 19, 26, 24, 31, 28, 35, 32, 38, 36, 42, 39, 48, 45, 52, 49, 57, 54, 61],
          chartLabels: ['SEP 01', 'SEP 04', 'SEP 07', 'SEP 10', 'TODAY (SEP 12)'],
          getTooltipText: (i: number) => `SEP ${Math.max(1, 12 - Math.floor((23 - i) / 2))} · RECONCILED`
        }
    }
  }, [range])
  return (
    <main className="terminal-shell">
      {/* Top Bar with Live Indicator & Action Button */}
      <header className="topbar">
        <div className="brand-mark">
          <span className="brand-dot" /> LEDGER<span className="brand-muted">/PERSONAL</span>
        </div>

        <div className="market-status" aria-label="System status">
          <span className="status-pulse" />
          <span className="status-label">LEDGER LIVE</span>
          <span className="divider" />
          <span className="status-sync">PLAID SYNC ACTIVE</span>
          <span className="divider" />
          <span className="date-clock mono">{currentDate || 'SEPTEMBER 12, 2026'}</span>
          <span className="divider" />
          <span className="time-clock mono">{currentTime || '09:44:22 EST'}</span>
        </div>

        <div className="topbar-actions">
          <button
            type="button"
            className="topbar-record-btn mono"
            onClick={() => {
              setEditingTransaction(null)
              setIsOrderModalOpen(true)
            }}
          >
            <span className="plus-symbol">+</span> RECORD TRANSACTION
          </button>
          <ThemeToggle />
          <button className="avatar" aria-label="Yuvraj Singh profile">
            YS
          </button>
        </div>
      </header>

      {/* Hero Overview & Monthly Burn Rate Meter */}
      <section className="hero-grid" aria-label="Portfolio overview">
        <div className="hero-copy">
          <div className="eyebrow">
            PERSONAL BALANCE SHEET <span className="live-tag">LIVE LEDGER</span>
          </div>
          <h1>Good morning, YUVRAJ SINGH.</h1>
          <p>
            Your financial position is trending <strong>+4.82%</strong> this period with active reconciliation.
          </p>
        </div>

        {/* Total Liquidity */}
        <div className="metric-card primary">
          <span className="metric-label">TOTAL LIQUIDITY</span>
          <strong className="mono">
            ${totalLiquidity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
          <span className="metric-change positive">
            ▲ 2.41% <em>24H SETTLED</em>
          </span>
        </div>

        {/* Net Worth */}
        <div className="metric-card">
          <span className="metric-label">NET WORTH</span>
          <strong className="mono">
            ${BASE_NET_WORTH.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </strong>
          <span className="metric-change positive">
            ▲ 4.82% <em>YTD</em>
          </span>
        </div>

        {/* Monthly Burn with Cap & Progress Meter */}
        <div className="metric-card burn-card">
          <div className="burn-card-header">
            <span className="metric-label">MONTHLY BURN</span>
            <span className="budget-cap-badge mono">CAP: ${MONTHLY_BUDGET.toLocaleString()}</span>
          </div>
          <strong className="mono negative">
            ${monthlyBurn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>

          {/* Visual Budget Meter */}
          <div className="budget-meter-wrap">
            <div className="budget-meter-labels mono">
              <span>{budgetPercentage}% CONSUMED</span>
              <span>${budgetRemaining.toFixed(0)} REMAINING</span>
            </div>
            <div
              className="budget-meter-bar"
              role="progressbar"
              aria-valuenow={budgetPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`budget-meter-fill ${budgetPercentage > 85 ? 'warning' : ''}`}
                style={{ width: `${budgetPercentage}%` }}
              />
            </div>
            <div className="budget-meter-pacing mono">
              <span className="pacing-dot" />
              <span>CYCLE: 18 DAYS LEFT · PACING NORMAL</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Balance Timeline & Spend Allocation */}
      <div className="middle-dashboard-grid">
        {/* Performance Chart Panel */}
        <section className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">ACCOUNT PERFORMANCE</div>
              <h2>Balance timeline</h2>
            </div>
            <div className="range-tabs">
              {['1D', '1W', '1M', '1Y', 'ALL'].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={range === item ? 'active' : ''}
                  onClick={() => setRange(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="chart-meta">
            <span>AVAILABLE BALANCE</span>
            <strong className="mono">
              ${totalLiquidity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>
            <span className="positive mono">+ $846.27 (+4.82%)</span>
          </div>

          <div className="chart-wrap" role="img" aria-label="Balance performance chart">
            <div className="y-axis">
              <span>$22k</span>
              <span>$18k</span>
              <span>$14k</span>
              <span>$10k</span>
              <span>$6k</span>
            </div>
            <div className="chart-area">
              <div className="grid-lines" />
              <svg viewBox="0 0 900 280" preserveAspectRatio="none" className="line-chart">
                <defs>
                  <linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#39e58c" stopOpacity=".25" />
                    <stop offset="100%" stopColor="#39e58c" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={`M 0 260 ${chartPoints.map((p, i) => `L ${(i / (chartPoints.length - 1)) * 900} ${260 - p * 3.7}`).join(' ')} L 900 280 L 0 280 Z`}
                  fill="url(#areaFill)"
                />
                <path
                  d={`M 0 260 ${chartPoints.map((p, i) => `L ${(i / (chartPoints.length - 1)) * 900} ${260 - p * 3.7}`).join(' ')}`}
                  fill="none"
                  stroke="#39e58c"
                  strokeWidth="2.5"
                />
                {chartPoints.map((p, i) => (
                  <circle
                    key={i}
                    cx={(i / (chartPoints.length - 1)) * 900}
                    cy={260 - p * 3.7}
                    r={hoveredPoint === i ? 5 : 2.5}
                    fill="#0b1115"
                    stroke="#39e58c"
                    strokeWidth="2"
                    onMouseEnter={() => setHoveredPoint(i)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}
              </svg>
              {hoveredPoint !== null && (
                <div
                  className="chart-tooltip"
                  style={{
                    left: `${(hoveredPoint / (chartPoints.length - 1)) * 100}%`,
                    top: `${Math.max(8, 100 - (chartPoints[hoveredPoint] * 3.7) / 2.8)}%`
                  }}
                >
                  <b>${(14000 + chartPoints[hoveredPoint] * 95).toLocaleString()}</b>
                  <span>{getTooltipText(hoveredPoint)}</span>
                </div>
              )}
              <div className="x-axis">
                {chartLabels.map((label, idx) => (
                  <span key={idx}>{label}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio / Spend Allocation Widget */}
        <section className="panel allocation-panel">
          <SpendAllocation
            transactions={transactions}
            selectedCategory={categoryFilter}
            onSelectCategory={(cat) => setCategoryFilter(cat)}
          />
        </section>
      </div>

      {/* Transaction Ledger Panel */}
      <section className="panel ledger-panel">
        <div className="panel-heading ledger-heading">
          <div>
            <div className="eyebrow">ORDER BOOK // RECONCILED ACTIVITY</div>
            <h2>Transaction ledger</h2>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <FilterToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          timeframe={range}
          onTimeframeChange={setRange}
          totalCount={transactions.length}
          filteredCount={visibleTransactions.length}
          onExportCsv={handleExportCsv}
          onOpenNewOrder={() => {
            setEditingTransaction(null)
            setIsOrderModalOpen(true)
          }}
        />

        {/* Ledger Table */}
        <div className="ledger-scroll">
          <table>
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>TIMESTAMP (UTC)</th>
                <th>FLOW TYPE</th>
                <th>COUNTERPARTY / MERCHANT</th>
                <th>CATEGORY</th>
                <th>SOURCE ACCOUNT</th>
                <th className="align-right">FILLED AMOUNT</th>
                <th className="align-right">RUNNING BALANCE</th>
                <th className="align-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {visibleTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="empty-ledger-state mono">
                    NO TRANSACTIONS FOUND MATCHING CURRENT FILTER CRITERIA
                  </td>
                </tr>
              ) : (
                visibleTransactions.map((tx) => {
                  const isPositive = tx.amount > 0
                  return (
                    <tr
                      key={tx.id}
                      className="ledger-row"
                      onClick={() => setSelectedDrawerTx(tx)}
                      tabIndex={0}
                      role="button"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setSelectedDrawerTx(tx)
                      }}
                    >
                      <td className="mono order-id-cell">{tx.id}</td>
                      <td className="muted mono">{tx.timestamp}</td>
                      <td>
                        <span className={`type-pill ${tx.type.toLowerCase()}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="merchant">
                        <div className="merchant-name-wrap">
                          <span>{tx.merchant}</span>
                          {tx.status === 'PENDING' && (
                            <span className="pending-badge mono">PENDING</span>
                          )}
                        </div>
                      </td>
                      <td className="muted">{tx.category}</td>
                      <td className="muted mono">{tx.account}</td>
                      <td className={`amount align-right mono ${isPositive ? 'positive' : 'negative'}`}>
                        {isPositive ? '+' : '−'}$
                        {Math.abs(tx.amount).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </td>
                      <td className="align-right mono">
                        ${tx.balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="align-right action-cell" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="row-action-btn mono"
                          onClick={() => setSelectedDrawerTx(tx)}
                          title="Open order confirmation ticket"
                        >
                          DETAILS →
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="ledger-footer">
          <span className="mono">
            SHOWING {visibleTransactions.length} OF {transactions.length} RECONCILED TRANSACTIONS
          </span>
          <div className="footer-actions">
            <button
              type="button"
              className="footer-link-btn mono"
              onClick={() => {
                setTypeFilter('ALL')
                setCategoryFilter('ALL')
                setSearchQuery('')
                setRange('ALL')
              }}
            >
              RESET ALL FILTERS <span>↺</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer Audit Bar */}
      <footer>
        <span>LEDGER TERMINAL v2.5.0-PRO</span>
        <span>SHA-256 RECONCILIATION ACTIVE</span>
        <span>DATA REFRESHED {currentTime}</span>
        <span className="footer-right">
          ENCRYPTED LINK // PLAID CORE <span className="status-pulse" />
        </span>
      </footer>

      {/* Order Entry Modal */}
      <OrderTicketModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false)
          setEditingTransaction(null)
        }}
        onSubmit={handleRecordTransaction}
        editingTransaction={editingTransaction}
        currentLiquidity={totalLiquidity}
      />

      {/* Slide-over Transaction Details Drawer */}
      <TransactionDrawer
        transaction={selectedDrawerTx}
        onClose={() => setSelectedDrawerTx(null)}
        onEdit={handleEditFromDrawer}
        onDelete={handleDeleteTransaction}
      />
    </main>
  )
}
