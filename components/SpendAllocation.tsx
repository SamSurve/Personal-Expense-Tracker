'use client'

import { useMemo } from 'react'
import { Transaction } from '@/lib/types'
import { CATEGORY_COLORS } from '@/lib/mockData'

interface SpendAllocationProps {
  transactions: Transaction[]
  selectedCategory?: string
  onSelectCategory?: (category: string) => void
}

export function SpendAllocation({
  transactions,
  selectedCategory,
  onSelectCategory
}: SpendAllocationProps) {
  const allocation = useMemo(() => {
    // Only aggregate negative expense transactions
    const expenses = transactions.filter((t) => t.type === 'EXPENSE' && t.amount < 0)
    const totalExpense = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0)

    if (totalExpense === 0) return { totalExpense: 0, items: [] }

    const grouped: Record<string, number> = {}
    expenses.forEach((t) => {
      grouped[t.category] = (grouped[t.category] || 0) + Math.abs(t.amount)
    })

    const items = Object.entries(grouped)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalExpense) * 100,
        color: CATEGORY_COLORS[category] || '#94a3b8'
      }))
      .sort((a, b) => b.amount - a.amount)

    return { totalExpense, items }
  }, [transactions])

  return (
    <div className="allocation-widget">
      <div className="allocation-header">
        <div>
          <div className="eyebrow">ASSET ALLOCATION // EXPENDITURE</div>
          <h3>Category burn distribution</h3>
        </div>
        <div className="allocation-total mono">
          <span className="muted">AGGREGATE:</span>
          <strong className="negative">
            −${allocation.totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        </div>
      </div>

      {/* Multi-segment Neon Allocation Heat Bar */}
      <div className="allocation-heatbar-wrap" role="progressbar" aria-label="Spend allocation heat bar">
        <div className="allocation-heatbar">
          {allocation.items.map((item) => (
            <div
              key={item.category}
              className={`heatbar-segment ${selectedCategory === item.category ? 'active' : ''}`}
              style={{
                width: `${Math.max(item.percentage, 1.5)}%`,
                backgroundColor: item.color
              }}
              title={`${item.category}: ${item.percentage.toFixed(1)}% ($${item.amount.toFixed(2)})`}
              onClick={() => onSelectCategory?.(selectedCategory === item.category ? 'ALL' : item.category)}
            />
          ))}
        </div>
      </div>

      {/* High-density Terminal Category Grid */}
      <div className="allocation-grid">
        {allocation.items.map((item) => {
          const isSelected = selectedCategory === item.category
          return (
            <button
              key={item.category}
              type="button"
              className={`allocation-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectCategory?.(isSelected ? 'ALL' : item.category)}
            >
              <div className="item-header">
                <div className="item-label-group">
                  <span className="category-dot" style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}88` }} />
                  <span className="category-name">{item.category}</span>
                </div>
                <span className="category-pct mono">{item.percentage.toFixed(1)}%</span>
              </div>
              <div className="item-footer">
                <span className="category-amt mono">
                  ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <div className="mini-bar-bg">
                  <div
                    className="mini-bar-fill"
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
