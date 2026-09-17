import { NextRequest, NextResponse } from 'next/server'
import { getDbPool, ensureSchemaInitialized } from '@/lib/db'

// GET /api/user/profile?userId=...
export async function GET(request: NextRequest) {
  try {
    await ensureSchemaInitialized()
    const { searchParams } = new URL(request.url)
    const userId = Number(searchParams.get('userId') || '1')

    const pool = getDbPool()

    const [userRows]: any = await pool.query('SELECT user_id, name, email FROM users WHERE user_id = ?', [userId])
    const name = userRows && userRows.length > 0 ? userRows[0].name : 'User'
    const email = userRows && userRows.length > 0 ? userRows[0].email : ''

    const [profileRows]: any = await pool.query(
      'SELECT monthly_income, savings_target FROM spending_profile WHERE user_id = ?',
      [userId]
    )
    const monthlyIncome = profileRows && profileRows.length > 0 ? Number(profileRows[0].monthly_income) : 50000
    const savingsTarget = profileRows && profileRows.length > 0 ? Number(profileRows[0].savings_target) : 15000

    const [budgetRows]: any = await pool.query(
      'SELECT category_name, baseline_amount FROM budgets WHERE user_id = ?',
      [userId]
    )
    const categories: Record<string, number> = {}
    for (const b of budgetRows || []) {
      categories[b.category_name] = Number(b.baseline_amount) || 0
    }

    return NextResponse.json(
      {
        userId,
        name,
        email,
        monthlyIncome,
        savingsTarget,
        categories,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('User profile fetch error:', error)
    return NextResponse.json(null, { status: 500 })
  }
}

// POST /api/user/profile (also used for updates)
export async function POST(request: NextRequest) {
  try {
    await ensureSchemaInitialized()
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const userId = Number(body.userId || searchParams.get('userId') || 1)

    const pool = getDbPool()

    if (body.name && typeof body.name === 'string' && body.name.trim() !== '') {
      await pool.query('UPDATE users SET name = ? WHERE user_id = ?', [body.name.trim(), userId])
    }

    const monthlyIncome = body.monthlyIncome !== undefined ? Math.max(0, Number(body.monthlyIncome) || 0) : null
    const savingsTarget = body.savingsTarget !== undefined ? Math.max(0, Number(body.savingsTarget) || 0) : null

    if (monthlyIncome !== null || savingsTarget !== null) {
      await pool.query(
        `INSERT INTO spending_profile (user_id, monthly_income, savings_target)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
           monthly_income = COALESCE(VALUES(monthly_income), monthly_income),
           savings_target = COALESCE(VALUES(savings_target), savings_target)`,
        [userId, monthlyIncome ?? 50000, savingsTarget ?? 15000]
      )
    }

    if (body.categories && typeof body.categories === 'object') {
      for (const [categoryName, baselineAmount] of Object.entries(body.categories)) {
        if (categoryName && categoryName.trim() !== '') {
          const amt = Math.max(0, Number(baselineAmount) || 0)
          await pool.query(
            `INSERT INTO budgets (user_id, category_name, baseline_amount)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE baseline_amount = VALUES(baseline_amount)`,
            [userId, categoryName.trim(), amt]
          )
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Profile updated successfully' }, { status: 200 })
  } catch (error: any) {
    console.error('User profile update error:', error)
    return NextResponse.json({ success: false, message: `Failed to update profile: ${error.message}` }, { status: 400 })
  }
}
