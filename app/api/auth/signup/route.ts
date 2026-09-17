import { NextRequest, NextResponse } from 'next/server'
import { getDbPool, ensureSchemaInitialized } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    await ensureSchemaInitialized()
    const body = await request.json()
    const { name, email, password } = body

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ success: false, message: 'Name cannot be empty.', user: null }, { status: 400 })
    }
    if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ success: false, message: 'Invalid email address format.', user: null }, { status: 400 })
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ success: false, message: 'Password must be at least 6 characters long.', user: null }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanName = name.trim()
    const pool = getDbPool()

    // Check if email already exists
    const [existing]: any = await pool.query('SELECT user_id FROM users WHERE email = ?', [cleanEmail])
    if (existing && existing.length > 0) {
      return NextResponse.json({ success: false, message: 'Account with this email already exists.', user: null }, { status: 400 })
    }

    // Insert user
    const [result]: any = await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [
      cleanName,
      cleanEmail,
      password,
    ])

    const userId = result.insertId

    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully.',
        user: {
          userId,
          name: cleanName,
          email: cleanEmail,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json(
      {
        success: false,
        message: `Failed to register user due to database error: ${error.message}`,
        user: null,
      },
      { status: 400 }
    )
  }
}
