import { NextRequest, NextResponse } from 'next/server'
import { getDbPool, ensureSchemaInitialized } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    await ensureSchemaInitialized()
    const body = await request.json()
    const { userId, income, savingsTarget, categories } = body

    const uId = Number(userId)
    if (!uId || uId <= 0) {
      return NextResponse.json({ success: false, message: 'Invalid user ID' }, { status: 400 })
    }

    const monthlyIncome = Math.max(0, Number(income) || 0)
    const target = Math.max(0, Number(savingsTarget) || 0)

    const pool = getDbPool()

    // Save or update spending profile
    await pool.query(
      `INSERT INTO spending_profile (user_id, monthly_income, savings_target)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE monthly_income = VALUES(monthly_income), savings_target = VALUES(savings_target)`,
      [uId, monthlyIncome, target]
    )

    // Save or update category budgets
    if (categories && typeof categories === 'object') {
      for (const [categoryName, baselineAmount] of Object.entries(categories)) {
        if (categoryName && categoryName.trim() !== '') {
          const amt = Math.max(0, Number(baselineAmount) || 0)
          await pool.query(
            `INSERT INTO budgets (user_id, category_name, baseline_amount)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE baseline_amount = VALUES(baseline_amount)`,
            [uId, categoryName.trim(), amt]
          )
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Onboarding profile saved' }, { status: 200 })
  } catch (error: any) {
    console.error('Onboarding error:', error)
    return NextResponse.json({ success: false, message: `Failed to save onboarding profile: ${error.message}` }, { status: 400 })
  }
}
