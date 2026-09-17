import { NextRequest, NextResponse } from 'next/server'
import { getDbPool, ensureSchemaInitialized } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    await ensureSchemaInitialized()
    const body = await request.json()
    const { email, password } = body

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return NextResponse.json({ success: false, message: 'Email is required.', user: null }, { status: 400 })
    }
    if (!password || typeof password !== 'string' || password === '') {
      return NextResponse.json({ success: false, message: 'Password is required.', user: null }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const pool = getDbPool()

    const [rows]: any = await pool.query('SELECT user_id, name, email, password FROM users WHERE email = ?', [cleanEmail])

    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: false, message: 'No user found with the provided email address.', user: null }, { status: 401 })
    }

    const user = rows[0]
    if (user.password !== password) {
      return NextResponse.json({ success: false, message: 'Invalid password credentials.', user: null }, { status: 401 })
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful.',
        user: {
          userId: user.user_id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      {
        success: false,
        message: `Failed to connect to backend server: ${error.message}`,
        user: null,
      },
      { status: 500 }
    )
  }
}
