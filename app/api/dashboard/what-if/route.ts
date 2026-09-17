import { NextRequest, NextResponse } from 'next/server'
import { getDbPool, ensureSchemaInitialized } from '@/lib/db'
import { computeWhatIfSimulation } from '@/lib/financialLogic'

export async function POST(request: NextRequest) {
  try {
    await ensureSchemaInitialized()
    const body = await request.json()
    const userId = Number(body.userId || 1)
    const amount = Number(body.amount || 0)
    const category = (body.category || 'General').trim()

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

    const result = computeWhatIfSimulation(income, savingsTarget, expenseRows || [], budgetRows || [], amount, category)
    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('What-if simulation error:', error)
    return NextResponse.json(
      {
        purchaseAmount: 0,
        categoryName: 'General',
        currentSafeToSpend: 0,
        simulatedSafeToSpend: 0,
        safeToSpendDelta: 0,
        currentDailySafeSpend: 0,
        simulatedDailySafeSpend: 0,
        dailySafeSpendDelta: 0,
        currentPaceStatus: 'ON TRACK',
        simulatedPaceStatus: 'ON TRACK',
        currentProjectedSpend: 0,
        simulatedProjectedSpend: 0,
        currentHealthScore: 100,
        simulatedHealthScore: 100,
        healthScoreDelta: 0,
        currentHealthLabel: 'Optimal pace',
        simulatedHealthLabel: 'Optimal pace',
        categoryCurrentSpent: 0,
        categoryBaseline: 3000,
        categorySimulatedSpent: 0,
        categoryExceeded: false,
        impactNarrative: 'Simulation unavailable',
      },
      { status: 200 }
    )
  }
}
