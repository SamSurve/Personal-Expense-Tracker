// API Integration Client connecting to same-origin /api routes (Vercel) or custom backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

export interface UserDTO {
  userId: number
  name: string
  email: string
}

export interface AuthResponse {
  success: boolean
  message: string
  user?: UserDTO
}

export interface CategoryComparisonDTO {
  categoryName: string
  actualAmount: number
  baselineAmount: number
  difference: number
  spendingPercentage: number
  isOver: boolean
}

export interface InsightDTO {
  type: 'warning' | 'success' | 'info'
  title: string
  message: string
}

export interface DashboardTimelinePoint {
  date: string
  label: string
  amount: number
  balance: number
}

export interface SpendingPaceDTO {
  daysElapsed: number
  daysInMonth: number
  daysRemaining?: number
  discretionaryCapacity: number
  remainingDiscretionaryCapacity?: number
  actualSpentMonth: number
  idealPaceToday: number
  dailyAverage: number
  projectedMonthSpend: number
  safeToSpend: number
  dailySafeSpend?: number
  paceStatus: 'ON TRACK' | 'ABOVE PACE' | 'UNDER PACE' | string
  explanation: string
}

export interface WhatIfSimulationDTO {
  purchaseAmount: number
  categoryName: string
  currentSafeToSpend: number
  simulatedSafeToSpend: number
  safeToSpendDelta: number
  currentDailySafeSpend: number
  simulatedDailySafeSpend: number
  dailySafeSpendDelta: number
  currentPaceStatus: string
  simulatedPaceStatus: string
  currentProjectedSpend: number
  simulatedProjectedSpend: number
  currentHealthScore: number
  simulatedHealthScore: number
  healthScoreDelta: number
  currentHealthLabel: string
  simulatedHealthLabel: string
  categoryCurrentSpent: number
  categoryBaseline: number
  categorySimulatedSpent: number
  categoryExceeded: boolean
  impactNarrative: string
}

export interface SpendingHealthDTO {
  score: number
  healthLabel: string
  reasons: string[]
}

export interface DashboardSummaryDTO {
  totalIncome: number
  totalExpenses: number
  remainingBalance: number
  savingsTarget: number
  savingsProgressPercentage: number
  timeframe?: string
  timeline?: DashboardTimelinePoint[]
  categoryComparisons: CategoryComparisonDTO[]
  insights: InsightDTO[]
  spendingPace?: SpendingPaceDTO
  spendingHealth?: SpendingHealthDTO
}

export interface ExpenseDTO {
  expenseId: number
  userId: number
  title: string
  categoryName: string
  amount: number
  expenseDate: string
  notes?: string
}

export interface UserProfileDTO {
  userId: number
  name: string
  email: string
  monthlyIncome: number
  savingsTarget: number
  categories: Record<string, number>
}

// 1. Signup API
export async function apiSignup(name: string, email: string, password: String): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    return await res.json()
  } catch (e) {
    return {
      success: false,
      message: 'Failed to connect to backend server',
    }
  }
}

// 2. Login API
export async function apiLogin(email: string, password: String): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    return await res.json()
  } catch (e) {
    return {
      success: false,
      message: 'Failed to connect to backend server',
    }
  }
}

// 3. Onboarding API
export async function apiSaveOnboarding(userId: number, income: number, savings: number, categories: Record<string, number>): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/onboarding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, income, savingsTarget: savings, categories }),
    })
    return await res.json()
  } catch (e) {
    return { success: false, message: 'Failed to save onboarding profile' }
  }
}

// 4. Fetch Dashboard Summary API (with real timeframe filtering)
export async function apiGetDashboardSummary(userId: number, timeframe: string = '1M'): Promise<DashboardSummaryDTO | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard/summary?userId=${userId}&timeframe=${timeframe}`)
    if (!res.ok) return null
    return await res.json()
  } catch (e) {
    return null
  }
}

// 5. User Profile & Settings APIs
export async function apiGetUserProfile(userId: number): Promise<UserProfileDTO | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/user/profile?userId=${userId}`)
    if (!res.ok) return null
    return await res.json()
  } catch (e) {
    return null
  }
}

export async function apiUpdateSettings(
  userId: number,
  data: { name?: string; monthlyIncome?: number; savingsTarget?: number; categories?: Record<string, number> }
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/user/profile?userId=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...data }),
    })
    return await res.json()
  } catch (e) {
    return { success: false, message: 'Failed to update settings' }
  }
}

// 6. Expenses APIs (Get, Add, Update, Delete)
export async function apiGetExpenses(userId: number): Promise<ExpenseDTO[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/expenses?userId=${userId}`)
    if (!res.ok) return []
    return await res.json()
  } catch (e) {
    return []
  }
}

export async function apiAddExpense(userId: number, title: string, categoryName: string, amount: number, date?: string, notes?: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, title, categoryName, amount, expenseDate: date, notes }),
    })
    return await res.json()
  } catch (e) {
    return { success: false, message: 'Failed to record expense' }
  }
}

export async function apiUpdateExpense(
  expense: { expenseId: number; userId: number; title: string; categoryName: string; amount: number; expenseDate?: string; notes?: string }
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    })
    return await res.json()
  } catch (e) {
    return { success: false, message: 'Failed to update expense' }
  }
}

export async function apiDeleteExpense(expenseId: number, userId: number): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/expenses?id=${expenseId}&userId=${userId}`, {
      method: 'DELETE',
    })
    return await res.json()
  } catch (e) {
    return { success: false, message: 'Failed to delete expense' }
  }
}

// 7. What-If Simulation API
export async function apiSimulateWhatIf(userId: number, amount: number, category: string): Promise<WhatIfSimulationDTO | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard/what-if`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount, category }),
    })
    if (!res.ok) return null
    return await res.json()
  } catch (e) {
    return null
  }
}
