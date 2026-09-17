import { NextRequest, NextResponse } from 'next/server'
import { getDbPool, ensureSchemaInitialized } from '@/lib/db'
import { computeDashboardSummary } from '@/lib/financialLogic'

export async function GET(request: NextRequest) {
  try {
    await ensureSchemaInitialized()
    const { searchParams } = new URL(request.url)
    const userId = Number(searchParams.get('userId') || '1')
    const timeframe = (searchParams.get('timeframe') || '1M').toUpperCase()

    const pool = getDbPool()

    // 1. Spending profile
    const [profileRows]: any = await pool.query(
      'SELECT monthly_income, savings_target FROM spending_profile WHERE user_id = ?',
      [userId]
    )
    const income = profileRows && profileRows.length > 0 ? Number(profileRows[0].monthly_income) : 50000
    const savingsTarget = profileRows && profileRows.length > 0 ? Number(profileRows[0].savings_target) : 15000

    // 2. All expenses
    const [expenseRows]: any = await pool.query(
      'SELECT expense_id, user_id, title, category_name, amount, expense_date FROM expenses WHERE user_id = ? ORDER BY expense_date ASC',
      [userId]
    )
    const allExpenses = expenseRows || []

    // 3. Budgets
    const [budgetRows]: any = await pool.query(
      'SELECT category_name, baseline_amount FROM budgets WHERE user_id = ?',
      [userId]
    )
    const budgets = budgetRows || []

    // Compute core summary
    const summary = computeDashboardSummary(income, savingsTarget, allExpenses, budgets)

    // Compute timeline based on timeframe
    const nowMs = Date.now()
    let cutoffMs = 0
    switch (timeframe) {
      case '1D':
        cutoffMs = nowMs - 1 * 24 * 3600 * 1000
        break
      case '1W':
        cutoffMs = nowMs - 7 * 24 * 3600 * 1000
        break
      case '1M':
        cutoffMs = nowMs - 30 * 24 * 3600 * 1000
        break
      case '3M':
        cutoffMs = nowMs - 90 * 24 * 3600 * 1000
        break
      case '1Y':
        cutoffMs = nowMs - 365 * 24 * 3600 * 1000
        break
      case 'ALL':
      default:
        cutoffMs = 0
        break
    }

    const filtered = allExpenses.filter((e: any) => {
      if (cutoffMs === 0) return true
      const d = new Date(e.expense_date).getTime()
      return d >= cutoffMs
    })

    let runningBalance = summary.totalIncome
    const timeline = filtered.map((e: any) => {
      const amt = Number(e.amount) || 0
      runningBalance = Number((runningBalance - amt).toFixed(2))
      let dateStr = ''
      if (e.expense_date instanceof Date) {
        dateStr = e.expense_date.toISOString().split('T')[0]
      } else {
        dateStr = String(e.expense_date || '')
      }
      return {
        date: dateStr,
        label: e.title || 'Expense',
        amount: amt,
        balance: runningBalance,
      }
    })

    return NextResponse.json(
      {
        ...summary,
        timeframe,
        timeline,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Dashboard summary error:', error)
    return NextResponse.json(
      {
        totalIncome: 50000,
        totalExpenses: 0,
        remainingBalance: 50000,
        savingsTarget: 15000,
        savingsProgressPercentage: 100,
        categoryComparisons: [],
        insights: [],
        spendingPace: null,
        spendingHealth: null,
        timeframe: '1M',
        timeline: [],
      },
      { status: 200 }
    )
  }
}
