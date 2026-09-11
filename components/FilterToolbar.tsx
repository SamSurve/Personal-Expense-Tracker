'use client'

import { TransactionType } from '@/lib/types'
import { KNOWN_CATEGORIES } from '@/lib/mockData'

interface FilterToolbarProps {
  searchQuery: string
  onSearchChange: (val: string) => void
  typeFilter: 'ALL' | TransactionType
  onTypeFilterChange: (type: 'ALL' | TransactionType) => void
  categoryFilter: string
  onCategoryFilterChange: (cat: string) => void
  timeframe: string
  onTimeframeChange: (tf: string) => void
  totalCount: number
  filteredCount: number
  onExportCsv: () => void
  onOpenNewOrder: () => void
}

export function FilterToolbar({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  timeframe,
  onTimeframeChange,
  totalCount,
  filteredCount,
  onExportCsv,
  onOpenNewOrder
}: FilterToolbarProps) {
  const hasActiveFilters = searchQuery !== '' || typeFilter !== 'ALL' || categoryFilter !== 'ALL'

  const clearAllFilters = () => {
    onSearchChange('')
    onTypeFilterChange('ALL')
    onCategoryFilterChange('ALL')
  }

  return (
    <div className="filter-toolbar">
      {/* Top row: Search and primary execution CTAs */}
      <div className="filter-top-row">
        <div className="search-box">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            className="search-input mono"
            placeholder="Filter by counterparty, category, notes, or #TX..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
            >
              ✕
            </button>
          )}
          <span className="search-kbd-hint">ESC TO CLEAR</span>
        </div>

        <div className="filter-actions">
          <button
            type="button"
            className="action-btn new-order-btn"
            onClick={onOpenNewOrder}
          >
            <span className="btn-plus">+</span> RECORD TRANSACTION
          </button>
          <button
            type="button"
            className="action-btn export-btn"
            onClick={onExportCsv}
            title="Download CSV export"
          >
            EXPORT CSV <span>↗</span>
          </button>
        </div>
      </div>

      {/* Bottom row: Type pills, Category pills/dropdown, Timeframe & Active counts */}
      <div className="filter-bottom-row">
        {/* Transaction Type Pills */}
        <div className="type-toggle-group">
          {(['ALL', 'EXPENSE', 'INCOME', 'TRANSFER'] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={`type-filter-btn ${typeFilter === t ? 'active' : ''} ${t.toLowerCase()}`}
              onClick={() => onTypeFilterChange(t)}
            >
              {t === 'ALL' ? 'ALL FLOWS' : t}
            </button>
          ))}
        </div>

        <div className="filter-divider" />

        {/* Category Selector */}
        <div className="category-select-wrap">
          <label htmlFor="cat-filter" className="sr-only">Filter Category</label>
          <select
            id="cat-filter"
            className="category-dropdown mono"
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
          >
            <option value="ALL">ALL CATEGORIES</option>
            {KNOWN_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Timeframe Synced Toggles */}
        <div className="timeframe-group">
          {['1D', '1W', '1M', '1Y', 'ALL'].map((tf) => (
            <button
              key={tf}
              type="button"
              className={`timeframe-btn ${timeframe === tf ? 'active' : ''}`}
              onClick={() => onTimeframeChange(tf)}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Status / Reset */}
        <div className="filter-status-box mono">
          <span>
            {filteredCount} / {totalCount} ENTRIES
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              className="reset-filters-btn"
              onClick={clearAllFilters}
            >
              RESET ✕
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
