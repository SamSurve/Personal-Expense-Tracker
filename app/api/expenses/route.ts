import { NextRequest, NextResponse } from 'next/server'
import { getDbPool, ensureSchemaInitialized } from '@/lib/db'

// GET /api/expenses?userId=...
export async function GET(request: NextRequest) {
  try {
    await ensureSchemaInitialized()
    const { searchParams } = new URL(request.url)
    const userId = Number(searchParams.get('userId') || '1')

    const pool = getDbPool()
    const [rows]: any = await pool.query(
      'SELECT expense_id, user_id, title, category_name, amount, expense_date, notes FROM expenses WHERE user_id = ? ORDER BY expense_date DESC, expense_id DESC',
      [userId]
    )

    const expenses = (rows || []).map((row: any) => {
      let dateStr = ''
      if (row.expense_date instanceof Date) {
        dateStr = row.expense_date.toISOString().split('T')[0]
      } else {
        dateStr = String(row.expense_date || '')
      }
      return {
        expenseId: row.expense_id,
        userId: row.user_id,
        title: row.title,
        categoryName: row.category_name,
        amount: Number(row.amount),
        expenseDate: dateStr,
        notes: row.notes || '',
      }
    })

    return NextResponse.json(expenses, { status: 200 })
  } catch (error: any) {
    console.error('Fetch expenses error:', error)
    return NextResponse.json([], { status: 200 })
  }
}

// POST /api/expenses
export async function POST(request: NextRequest) {
  try {
    await ensureSchemaInitialized()
    const body = await request.json()
    const userId = Number(body.userId || 1)
    const title = (body.title || 'Expense').trim()
    const categoryName = (body.categoryName || 'General').trim()
    const amount = Number(body.amount || 0)
    let expenseDate = body.expenseDate ? String(body.expenseDate) : new Date().toISOString().split('T')[0]
    const notes = body.notes ? String(body.notes) : ''

    if (amount <= 0) {
      return NextResponse.json({ success: false, message: 'Amount must be greater than 0' }, { status: 400 })
    }

    const pool = getDbPool()
    await pool.query(
      'INSERT INTO expenses (user_id, title, category_name, amount, expense_date, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, title, categoryName, amount, expenseDate, notes]
    )

    return NextResponse.json({ success: true, message: 'Expense recorded' }, { status: 201 })
  } catch (error: any) {
    console.error('Add expense error:', error)
    return NextResponse.json({ success: false, message: `Failed to record expense: ${error.message}` }, { status: 400 })
  }
}

// PUT /api/expenses
export async function PUT(request: NextRequest) {
  try {
    await ensureSchemaInitialized()
    const body = await request.json()
    const expenseId = Number(body.expenseId || 0)
    const userId = Number(body.userId || 1)
    const title = (body.title || 'Expense').trim()
    const categoryName = (body.categoryName || 'General').trim()
    const amount = Number(body.amount || 0)
    let expenseDate = body.expenseDate ? String(body.expenseDate) : new Date().toISOString().split('T')[0]
    const notes = body.notes ? String(body.notes) : ''

    if (!expenseId || amount <= 0) {
      return NextResponse.json({ success: false, message: 'Invalid expense update data' }, { status: 400 })
    }

    const pool = getDbPool()
    const [result]: any = await pool.query(
      'UPDATE expenses SET title = ?, category_name = ?, amount = ?, expense_date = ?, notes = ? WHERE expense_id = ? AND user_id = ?',
      [title, categoryName, amount, expenseDate, notes, expenseId, userId]
    )

    if (result.affectedRows > 0) {
      return NextResponse.json({ success: true, message: 'Expense updated' }, { status: 200 })
    } else {
      return NextResponse.json({ success: false, message: 'Failed to update expense' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Update expense error:', error)
    return NextResponse.json({ success: false, message: `Failed to update expense: ${error.message}` }, { status: 400 })
  }
}

// DELETE /api/expenses?id=...&userId=...
export async function DELETE(request: NextRequest) {
  try {
    await ensureSchemaInitialized()
    const { searchParams } = new URL(request.url)
    const expenseId = Number(searchParams.get('id') || '0')
    const userId = Number(searchParams.get('userId') || '1')

    if (!expenseId || !userId) {
      return NextResponse.json({ success: false, message: 'Invalid delete parameters' }, { status: 400 })
    }

    const pool = getDbPool()
    const [result]: any = await pool.query('DELETE FROM expenses WHERE expense_id = ? AND user_id = ?', [
      expenseId,
      userId,
    ])

    if (result.affectedRows > 0) {
      return NextResponse.json({ success: true, message: 'Expense deleted' }, { status: 200 })
    } else {
      return NextResponse.json({ success: false, message: 'Failed to delete expense' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Delete expense error:', error)
    return NextResponse.json({ success: false, message: `Failed to delete expense: ${error.message}` }, { status: 400 })
  }
}
