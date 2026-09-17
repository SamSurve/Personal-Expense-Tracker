import { NextRequest, NextResponse } from 'next/server'
import { getDbPool, ensureSchemaInitialized } from '@/lib/db'
import { computeDashboardSummary } from '@/lib/financialLogic'

export async function GET(request: NextRequest) {
  try {
    await ensureSchemaInitialized()
    const { searchParams } = new URL(request.url)
    const userId = Number(searchParams.get('userId') || '1')

    const pool = getDbPool()

    const [profileRows]: any = await pool.query(
      'SELECT monthly_income, savings_target FROM spending_profile WHERE user_id = ?',
      [userId]
    )
    const income = profileRows && profileRows.length > 0 ? Number(profileRows[0].monthly_income) : 50000
    const savingsTarget = profileRows && profileRows.length > 0 ? Number(profileRows[0].savings_target) : 15000

    const [expenseRows]: any = await pool.query(
      'SELECT expense_id, user_id, title, category_name, amount, expense_date FROM expenses WHERE user_id = ?',
      [userId]
    )
    const [budgetRows]: any = await pool.query(
      'SELECT category_name, baseline_amount FROM budgets WHERE user_id = ?',
      [userId]
    )

    const summary = computeDashboardSummary(income, savingsTarget, expenseRows || [], budgetRows || [])
    return NextResponse.json(summary.insights, { status: 200 })
  } catch (error: any) {
    console.error('Dashboard insights error:', error)
    return NextResponse.json([], { status: 200 })
  }
}
