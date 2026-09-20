import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'
import { auth, db } from './firebase'
import { computeDashboardSummary, computeWhatIfSimulation } from './financialLogic'

export interface UserDTO {
  userId: number | string
  uid: string
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
  expenseId: number | string
  userId: number | string
  title: string
  categoryName: string
  amount: number
  expenseDate: string
  notes?: string
}

export interface UserProfileDTO {
  userId: number | string
  uid?: string
  name: string
  email: string
  monthlyIncome: number
  savingsTarget: number
  categories: Record<string, number>
}

// Helper to get active user ID
function getActiveUid(fallbackUserId?: number | string): string | null {
  if (auth.currentUser && auth.currentUser.uid) {
    return auth.currentUser.uid
  }
  if (typeof window !== 'undefined') {
    const storedUid = localStorage.getItem('firebase_uid')
    if (storedUid) return storedUid
    const storedId = localStorage.getItem('user_id')
    if (storedId) return String(storedId)
  }
  if (fallbackUserId) return String(fallbackUserId)
  return null
}

// Guard against duplicate concurrent signups for the same email
let inFlightSignupEmail: string | null = null

// 1. Signup API via Firebase Authentication
export async function apiSignup(name: string, email: string, password: string): Promise<AuthResponse> {
  const cleanEmail = email.trim().toLowerCase()
  const cleanName = name.trim()

  if (inFlightSignupEmail === cleanEmail) {
    return {
      success: false,
      message: 'Signup is already in progress. Please wait.',
    }
  }

  inFlightSignupEmail = cleanEmail

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password)
    const user = userCredential.user

    await updateProfile(user, { displayName: cleanName })

    // Create initial user document in Firestore: users/{uid}
    const userRef = doc(db, 'users', user.uid)
    await setDoc(
      userRef,
      {
        uid: user.uid,
        name: cleanName,
        email: cleanEmail,
        currency: 'INR',
        createdAt: serverTimestamp(),
      },
      { merge: true }
    )

    if (typeof window !== 'undefined') {
      localStorage.setItem('firebase_uid', user.uid)
      localStorage.setItem('user_id', user.uid)
      localStorage.setItem('user_setup_name', cleanName)
    }

    return {
      success: true,
      message: 'User registered successfully.',
      user: {
        userId: user.uid,
        uid: user.uid,
        name: cleanName,
        email: cleanEmail,
      },
    }
  } catch (error: any) {
    let msg = 'Signup failed. Please try again.'
    if (error.code === 'auth/email-already-in-use') {
      msg = 'An account with this email already exists. Please log in.'
    } else if (error.code === 'auth/invalid-email') {
      msg = 'Please enter a valid email address.'
    } else if (error.code === 'auth/weak-password') {
      msg = 'Password must be at least 6 characters long.'
    } else if (error.code === 'auth/network-request-failed') {
      msg = 'Network connection failed. Please check your internet connection.'
    } else if (error.message) {
      msg = error.message
    }
    return {
      success: false,
      message: msg,
    }
  } finally {
    inFlightSignupEmail = null
  }
}

// 2. Login API via Firebase Authentication
export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  try {
    const cleanEmail = email.trim().toLowerCase()
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password)
    const user = userCredential.user

    const userDocRef = doc(db, 'users', user.uid)
    const userDocSnap = await getDoc(userDocRef)
    const profileName = (userDocSnap.exists() && userDocSnap.data().name) || user.displayName || 'User'

    if (typeof window !== 'undefined') {
      localStorage.setItem('firebase_uid', user.uid)
      localStorage.setItem('user_id', user.uid)
      localStorage.setItem('user_setup_name', profileName)
    }

    return {
      success: true,
      message: 'Login successful.',
      user: {
        userId: user.uid,
        uid: user.uid,
        name: profileName,
        email: user.email || cleanEmail,
      },
    }
  } catch (error: any) {
    let msg = 'Invalid email or password credentials.'
    if (error.code === 'auth/user-not-found') {
      msg = 'No account found with this email address.'
    } else if (error.code === 'auth/wrong-password') {
      msg = 'Incorrect password. Please try again.'
    } else if (error.code === 'auth/invalid-credential') {
      msg = 'Invalid email or password credentials.'
    } else if (error.code === 'auth/invalid-email') {
      msg = 'Please enter a valid email address.'
    } else if (error.code === 'auth/too-many-requests') {
      msg = 'Access temporarily disabled due to many failed attempts. Try again later.'
    } else if (error.code === 'auth/network-request-failed') {
      msg = 'Network connection failed. Please check your internet connection.'
    }
    return {
      success: false,
      message: msg,
    }
  }
}

// 3. Logout API
export async function apiLogout(): Promise<void> {
  try {
    await signOut(auth)
  } catch (e) {
    console.error('Logout error:', e)
  } finally {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('firebase_uid')
      localStorage.removeItem('user_id')
      localStorage.removeItem('user_setup_name')
      localStorage.removeItem('user_setup_completed')
    }
  }
}

// 4. Onboarding API via Firestore
export async function apiSaveOnboarding(
  userId: number | string,
  income: number,
  savings: number,
  categories: Record<string, number>
): Promise<{ success: boolean; message: string }> {
  try {
    const uid = getActiveUid(userId)
    if (!uid) {
      return { success: false, message: 'User not authenticated' }
    }

    const monthlyIncome = Math.max(0, Number(income) || 0)
    const savingsTarget = Math.max(0, Number(savings) || 0)

    // Save spending profile: users/{uid}/spending_profile/main
    const profileRef = doc(db, 'users', uid, 'spending_profile', 'main')
    await setDoc(
      profileRef,
      {
        monthlyIncome,
        savingsTarget,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    // Save category budgets: users/{uid}/budgets/{category}
    if (categories && typeof categories === 'object') {
      for (const [categoryName, baselineAmount] of Object.entries(categories)) {
        if (categoryName && categoryName.trim() !== '') {
          const catClean = categoryName.trim()
          const catDocId = catClean.replace(/\//g, '_')
          const budgetRef = doc(db, 'users', uid, 'budgets', catDocId)
          await setDoc(
            budgetRef,
            {
              category_name: catClean,
              baseline_amount: Math.max(0, Number(baselineAmount) || 0),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          )
        }
      }
    }

    return { success: true, message: 'Onboarding profile saved' }
  } catch (error: any) {
    console.error('Onboarding error:', error)
    return { success: false, message: error.message || 'Failed to save onboarding profile' }
  }
}

// 5. User Profile & Settings APIs via Firestore
export async function apiGetUserProfile(userId: number | string): Promise<UserProfileDTO | null> {
  try {
    const uid = getActiveUid(userId)
    if (!uid) return null

    // User document
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)
    const name = (userSnap.exists() && userSnap.data().name) || auth.currentUser?.displayName || 'User'
    const email = (userSnap.exists() && userSnap.data().email) || auth.currentUser?.email || ''

    // Profile document
    const profileRef = doc(db, 'users', uid, 'spending_profile', 'main')
    const profileSnap = await getDoc(profileRef)
    const monthlyIncome = profileSnap.exists() ? Number(profileSnap.data().monthlyIncome) || 50000 : 50000
    const savingsTarget = profileSnap.exists() ? Number(profileSnap.data().savingsTarget) || 15000 : 15000

    // Budgets subcollection
    const budgetsCol = collection(db, 'users', uid, 'budgets')
    const budgetsSnap = await getDocs(budgetsCol)
    const categories: Record<string, number> = {}
    budgetsSnap.forEach((bDoc) => {
      const data = bDoc.data()
      if (data.category_name) {
        categories[data.category_name] = Number(data.baseline_amount) || 0
      }
    })

    return {
      userId: uid,
      uid,
      name,
      email,
      monthlyIncome,
      savingsTarget,
      categories,
    }
  } catch (error) {
    console.error('Fetch user profile error:', error)
    return null
  }
}

export async function apiUpdateSettings(
  userId: number | string,
  data: { name?: string; monthlyIncome?: number; savingsTarget?: number; categories?: Record<string, number> }
): Promise<{ success: boolean; message: string }> {
  try {
    const uid = getActiveUid(userId)
    if (!uid) return { success: false, message: 'User not authenticated' }

    if (data.name) {
      const userRef = doc(db, 'users', uid)
      await setDoc(userRef, { name: data.name.trim() }, { merge: true })
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: data.name.trim() })
      }
    }

    if (data.monthlyIncome !== undefined || data.savingsTarget !== undefined) {
      const profileRef = doc(db, 'users', uid, 'spending_profile', 'main')
      const updateData: any = { updatedAt: serverTimestamp() }
      if (data.monthlyIncome !== undefined) updateData.monthlyIncome = Math.max(0, Number(data.monthlyIncome) || 0)
      if (data.savingsTarget !== undefined) updateData.savingsTarget = Math.max(0, Number(data.savingsTarget) || 0)
      await setDoc(profileRef, updateData, { merge: true })
    }

    if (data.categories && typeof data.categories === 'object') {
      for (const [categoryName, baselineAmount] of Object.entries(data.categories)) {
        if (categoryName && categoryName.trim() !== '') {
          const catClean = categoryName.trim()
          const catDocId = catClean.replace(/\//g, '_')
          const budgetRef = doc(db, 'users', uid, 'budgets', catDocId)
          await setDoc(
            budgetRef,
            {
              category_name: catClean,
              baseline_amount: Math.max(0, Number(baselineAmount) || 0),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          )
        }
      }
    }

    return { success: true, message: 'Profile updated successfully' }
  } catch (error: any) {
    console.error('Update settings error:', error)
    return { success: false, message: error.message || 'Failed to update settings' }
  }
}

// 6. Expenses APIs via Firestore
export async function apiGetExpenses(userId: number | string): Promise<ExpenseDTO[]> {
  try {
    const uid = getActiveUid(userId)
    if (!uid) return []

    const expensesCol = collection(db, 'users', uid, 'expenses')
    const q = query(expensesCol, orderBy('expenseDate', 'desc'))
    const snap = await getDocs(q)

    const list: ExpenseDTO[] = []
    snap.forEach((docSnap) => {
      const data = docSnap.data()
      list.push({
        expenseId: docSnap.id,
        userId: uid,
        title: data.title || 'Expense',
        categoryName: data.categoryName || 'General',
        amount: Number(data.amount) || 0,
        expenseDate: data.expenseDate || new Date().toISOString().slice(0, 10),
        notes: data.notes || '',
      })
    })

    return list
  } catch (error) {
    console.error('Fetch expenses error:', error)
    return []
  }
}

export async function apiAddExpense(
  userId: number | string,
  title: string,
  categoryName: string,
  amount: number,
  date?: string,
  notes?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const uid = getActiveUid(userId)
    if (!uid) return { success: false, message: 'User not authenticated' }

    const numAmount = Number(amount) || 0
    if (numAmount <= 0) {
      return { success: false, message: 'Amount must be greater than 0' }
    }

    const expensesCol = collection(db, 'users', uid, 'expenses')
    await addDoc(expensesCol, {
      title: (title || 'Expense').trim(),
      categoryName: (categoryName || 'General').trim(),
      amount: numAmount,
      expenseDate: date || new Date().toISOString().slice(0, 10),
      notes: notes || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return { success: true, message: 'Expense recorded' }
  } catch (error: any) {
    console.error('Add expense error:', error)
    return { success: false, message: error.message || 'Failed to record expense' }
  }
}

export async function apiUpdateExpense(expense: {
  expenseId: number | string
  userId: number | string
  title: string
  categoryName: string
  amount: number
  expenseDate?: string
  notes?: string
}): Promise<{ success: boolean; message: string }> {
  try {
    const uid = getActiveUid(expense.userId)
    if (!uid || !expense.expenseId) return { success: false, message: 'Invalid expense reference' }

    const expenseRef = doc(db, 'users', uid, 'expenses', String(expense.expenseId))
    await updateDoc(expenseRef, {
      title: (expense.title || 'Expense').trim(),
      categoryName: (expense.categoryName || 'General').trim(),
      amount: Number(expense.amount) || 0,
      expenseDate: expense.expenseDate || new Date().toISOString().slice(0, 10),
      notes: expense.notes || '',
      updatedAt: serverTimestamp(),
    })

    return { success: true, message: 'Expense updated' }
  } catch (error: any) {
    console.error('Update expense error:', error)
    return { success: false, message: error.message || 'Failed to update expense' }
  }
}

export async function apiDeleteExpense(
  expenseId: number | string,
  userId: number | string
): Promise<{ success: boolean; message: string }> {
  try {
    const uid = getActiveUid(userId)
    if (!uid || !expenseId) return { success: false, message: 'Invalid expense reference' }

    const expenseRef = doc(db, 'users', uid, 'expenses', String(expenseId))
    await deleteDoc(expenseRef)

    return { success: true, message: 'Expense deleted' }
  } catch (error: any) {
    console.error('Delete expense error:', error)
    return { success: false, message: error.message || 'Failed to delete expense' }
  }
}

// 7. Fetch Dashboard Summary API via Firestore Data + Deterministic Financial Logic
export async function apiGetDashboardSummary(
  userId: number | string,
  timeframe: string = '1M'
): Promise<DashboardSummaryDTO | null> {
  try {
    const uid = getActiveUid(userId)
    if (!uid) return null

    // 1. Fetch Profile
    const profileRef = doc(db, 'users', uid, 'spending_profile', 'main')
    const profileSnap = await getDoc(profileRef)
    const income = profileSnap.exists() ? Number(profileSnap.data().monthlyIncome) || 50000 : 50000
    const savingsTarget = profileSnap.exists() ? Number(profileSnap.data().savingsTarget) || 15000 : 15000

    // 2. Fetch Budgets
    const budgetsCol = collection(db, 'users', uid, 'budgets')
    const budgetsSnap = await getDocs(budgetsCol)
    const budgets: Array<{ category_name: string; baseline_amount: number }> = []
    budgetsSnap.forEach((bDoc) => {
      const data = bDoc.data()
      if (data.category_name) {
        budgets.push({
          category_name: data.category_name,
          baseline_amount: Number(data.baseline_amount) || 0,
        })
      }
    })

    // 3. Fetch Expenses
    const expensesCol = collection(db, 'users', uid, 'expenses')
    const q = query(expensesCol, orderBy('expenseDate', 'asc'))
    const expSnap = await getDocs(q)
    const allExpenses: Array<{ category_name: string; amount: number; expense_date: string; title: string }> = []
    expSnap.forEach((eDoc) => {
      const data = eDoc.data()
      allExpenses.push({
        category_name: data.categoryName || 'General',
        amount: Number(data.amount) || 0,
        expense_date: data.expenseDate || new Date().toISOString().slice(0, 10),
        title: data.title || 'Expense',
      })
    })

    // 4. Compute Financial Summary via Pure Deterministic Engine
    const summary = computeDashboardSummary(income, savingsTarget, allExpenses, budgets)

    // 5. Compute Dynamic Timeline
    const nowMs = Date.now()
    let cutoffMs = 0
    switch (timeframe.toUpperCase()) {
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

    const filtered = allExpenses.filter((e) => {
      if (cutoffMs === 0) return true
      const d = new Date(e.expense_date).getTime()
      return d >= cutoffMs
    })

    let runningBalance = summary.totalIncome
    const timeline = filtered.map((e) => {
      runningBalance = Number((runningBalance - e.amount).toFixed(2))
      return {
        date: e.expense_date,
        label: e.title,
        amount: e.amount,
        balance: runningBalance,
      }
    })

    return {
      ...summary,
      timeframe,
      timeline,
    }
  } catch (error) {
    console.error('Fetch dashboard summary error:', error)
    return null
  }
}

// 8. What-If Simulation API via Firestore Data
export async function apiSimulateWhatIf(
  userId: number | string,
  amount: number,
  category: string
): Promise<WhatIfSimulationDTO | null> {
  try {
    const uid = getActiveUid(userId)
    if (!uid) return null

    // 1. Fetch Profile
    const profileRef = doc(db, 'users', uid, 'spending_profile', 'main')
    const profileSnap = await getDoc(profileRef)
    const income = profileSnap.exists() ? Number(profileSnap.data().monthlyIncome) || 50000 : 50000
    const savingsTarget = profileSnap.exists() ? Number(profileSnap.data().savingsTarget) || 15000 : 15000

    // 2. Fetch Budgets
    const budgetsCol = collection(db, 'users', uid, 'budgets')
    const budgetsSnap = await getDocs(budgetsCol)
    const budgets: Array<{ category_name: string; baseline_amount: number }> = []
    budgetsSnap.forEach((bDoc) => {
      const data = bDoc.data()
      if (data.category_name) {
        budgets.push({
          category_name: data.category_name,
          baseline_amount: Number(data.baseline_amount) || 0,
        })
      }
    })

    // 3. Fetch Expenses
    const expensesCol = collection(db, 'users', uid, 'expenses')
    const expSnap = await getDocs(expensesCol)
    const currentExpenses: Array<{ category_name: string; amount: number; expense_date: string }> = []
    expSnap.forEach((eDoc) => {
      const data = eDoc.data()
      currentExpenses.push({
        category_name: data.categoryName || 'General',
        amount: Number(data.amount) || 0,
        expense_date: data.expenseDate || new Date().toISOString().slice(0, 10),
      })
    })

    // 4. Compute Simulation In-Memory (Zero Database Mutations)
    const result = computeWhatIfSimulation(
      income,
      savingsTarget,
      currentExpenses,
      budgets,
      Number(amount) || 0,
      category || 'General'
    )

    return result
  } catch (error) {
    console.error('What-if simulation error:', error)
    return null
  }
}
