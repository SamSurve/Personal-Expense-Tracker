'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { OrderTicketModal } from '@/components/OrderTicketModal'
import { Transaction } from '@/lib/types'
import {
  apiGetExpenses,
  apiGetDashboardSummary,
  apiGetUserProfile,
  apiAddExpense,
  apiUpdateExpense,
  apiDeleteExpense,
  apiUpdateSettings,
  apiSimulateWhatIf,
  apiLogout,
  DashboardSummaryDTO,
  UserProfileDTO,
  WhatIfSimulationDTO,
} from '@/lib/api'
import { computeWhatIfSimulation } from '@/lib/financialLogic'
import {
  Activity,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Info,
  Calendar,
  LogOut,
  CreditCard,
  User,
  Trash2,
  Edit2,
  Sparkles,
  LayoutDashboard,
  Receipt,
  Target,
  Lightbulb,
  Wallet,
  Settings,
  Search,
  Bell,
  Home,
  Tv,
  Zap,
  ShoppingBag,
  Utensils,
  Car,
  Check,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Server,
  Database,
  ArrowRight,
  Compass,
  Gauge,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  PieChart,
  Layers,
} from 'lucide-react'

// Category Icons Mapping
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Housing & Rent': <Home className="w-3.5 h-3.5 text-indigo-400" />,
  Housing: <Home className="w-3.5 h-3.5 text-indigo-400" />,
  Subscriptions: <Tv className="w-3.5 h-3.5 text-blue-400" />,
  'Utilities & Bills': <Zap className="w-3.5 h-3.5 text-amber-400" />,
  Utilities: <Zap className="w-3.5 h-3.5 text-amber-400" />,
  Groceries: <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />,
  'Shopping & Retail': <ShoppingBag className="w-3.5 h-3.5 text-pink-400" />,
  'Food & Dining': <Utensils className="w-3.5 h-3.5 text-purple-400" />,
  Dining: <Utensils className="w-3.5 h-3.5 text-purple-400" />,
  'Travel & Transport': <Car className="w-3.5 h-3.5 text-cyan-400" />,
  Transport: <Car className="w-3.5 h-3.5 text-cyan-400" />,
}

// Category Badge Color Mapping
const CATEGORY_COLORS: Record<string, string> = {
  'Housing & Rent': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Housing: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Subscriptions: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Utilities & Bills': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Utilities: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Groceries: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Shopping & Retail': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'Food & Dining': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Dining: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Travel & Transport': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Transport: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
}

const DEFAULT_CATEGORY_BENCHMARKS: Record<string, number> = {
  'Food & Dining': 5000,
  'Travel & Transport': 2000,
  'Shopping & Retail': 3000,
  'Housing & Rent': 12000,
  'Utilities & Bills': 2500,
  Subscriptions: 1000,
  'Healthcare & Wellness': 1500,
  Groceries: 5000,
}

import { WalkingDoraemon } from '@/components/WalkingDoraemon'
import { ImpactDrawer } from '@/components/ImpactDrawer'

export default function DashboardPage() {
  // User Profile & Financial baseline state (100% Real from Firestore/MySQL)
  const [userId, setUserId] = useState<number | string>(1)
  const [userName, setUserName] = useState<string>('User')
  const [userEmail, setUserEmail] = useState<string>('')
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0)
  const [savingsGoal, setSavingsGoal] = useState<number>(0)
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>({})

  // Transactions State (Initialized to empty - zero mock data)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summaryData, setSummaryData] = useState<DashboardSummaryDTO | null>(null)

  // Doraemon Companion State
  const [companionTriggerCount, setCompanionTriggerCount] = useState<number>(0)
  const [lastRecordedExpenseTitle, setLastRecordedExpenseTitle] = useState<string>('')
  const [lastRecordedExpenseAmount, setLastRecordedExpenseAmount] = useState<number>(0)
  const [isImpactDrawerOpen, setIsImpactDrawerOpen] = useState<boolean>(false)

  // Navigation & View State
  const [activeTab, setActiveTab] = useState<'Overview' | 'Transactions' | 'Budgets' | 'Insights' | 'Accounts' | 'Settings'>('Overview')
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'>('1M')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [greeting, setGreeting] = useState('Welcome back')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')

  // Feature 2: Explainable Spending Health "Why?" drawer toggle
  const [showHealthWhy, setShowHealthWhy] = useState<boolean>(true)

  // Feature 1: What-If Purchase Simulator State (100% In-Memory, Read-Only)
  const [whatIfAmount, setWhatIfAmount] = useState<string>('2000')
  const [whatIfCategory, setWhatIfCategory] = useState<string>('Shopping & Retail')
  const [whatIfResult, setWhatIfResult] = useState<WhatIfSimulationDTO | null>(null)
  const [whatIfLoading, setWhatIfLoading] = useState<boolean>(false)
  const [whatIfValidationMsg, setWhatIfValidationMsg] = useState<string | null>(null)
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false)
  const [customCategoryName, setCustomCategoryName] = useState<string>('')

  // Dynamically aggregated list of categories for What-If selector
  const availableWhatIfCategories = useMemo(() => {
    const set = new Set<string>()
    transactions.forEach((t) => {
      if (t.category && t.category.trim()) set.add(t.category.trim())
    })
    Object.keys(categoryBudgets).forEach((cat) => {
      if (cat.trim()) set.add(cat.trim())
    })
    Object.keys(DEFAULT_CATEGORY_BENCHMARKS).forEach((cat) => {
      set.add(cat)
    })
    return Array.from(set).sort()
  }, [transactions, categoryBudgets])

  const handleRunSimulation = () => {
    setWhatIfValidationMsg(null)
    const trimmed = whatIfAmount.trim()
    if (!trimmed) {
      setWhatIfValidationMsg('Enter a valid expense amount.')
      return
    }
    const amt = parseFloat(trimmed)
    if (isNaN(amt) || amt <= 0 || !isFinite(amt)) {
      setWhatIfValidationMsg('Enter a valid expense amount.')
      return
    }
    if (amt > 10000000) {
      setWhatIfValidationMsg('Amount cannot exceed ₹1,00,00,000.')
      return
    }

    const catName = isCustomCategory ? customCategoryName.trim() : whatIfCategory.trim()
    if (!catName) {
      setWhatIfValidationMsg('Please select or specify a category.')
      return
    }

    setWhatIfLoading(true)
    try {
      // In-memory computation using current logged-in user's real financial state
      const currentExpensesList = transactions.map((t) => ({
        category_name: t.category || 'General',
        amount: Math.abs(t.amount),
        expense_date: t.timestamp || new Date().toISOString().slice(0, 10),
      }))

      const budgetList = Object.entries(categoryBudgets).map(([cat, base]) => ({
        category_name: cat,
        baseline_amount: base,
      }))

      const res = computeWhatIfSimulation(
        monthlyIncome,
        savingsGoal,
        currentExpensesList,
        budgetList,
        amt,
        catName
      )
      setWhatIfResult(res)
    } catch (e) {
      console.error('Simulation error:', e)
      setWhatIfValidationMsg('Failed to compute simulation.')
    } finally {
      setWhatIfLoading(false)
    }
  }

  const handleResetSimulation = () => {
    setWhatIfResult(null)
    setWhatIfValidationMsg(null)
    setWhatIfAmount('')
  }

  // Settings Tab Editable Form State
  const [settingsName, setSettingsName] = useState('')
  const [settingsIncome, setSettingsIncome] = useState<string>('')
  const [settingsSavings, setSettingsSavings] = useState<string>('')
  const [settingsCategories, setSettingsCategories] = useState<Record<string, string>>({})
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryBaseline, setNewCategoryBaseline] = useState('')
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsFeedback, setSettingsFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Current Date display
  const [currentDateStr, setCurrentDateStr] = useState('')

  // 1. Data Loader connecting to Firestore / Backend API
  const loadDashboardData = useCallback(async (activeUserId: number | string, tf: string = timeframe) => {
    try {
      const [profile, summary, apiTxs] = await Promise.all([
        apiGetUserProfile(activeUserId),
        apiGetDashboardSummary(activeUserId, tf),
        apiGetExpenses(activeUserId),
      ])

      // Populate User Profile from MySQL
      if (profile) {
        if (profile.name) setUserName(profile.name)
        if (profile.email) setUserEmail(profile.email)
        if (profile.monthlyIncome !== undefined) setMonthlyIncome(profile.monthlyIncome)
        if (profile.savingsTarget !== undefined) setSavingsGoal(profile.savingsTarget)
        if (profile.categories) setCategoryBudgets(profile.categories)

        // Seed settings form
        setSettingsName(profile.name || '')
        setSettingsIncome(String(profile.monthlyIncome || ''))
        setSettingsSavings(String(profile.savingsTarget || ''))
        const strCats: Record<string, string> = {}
        Object.entries(profile.categories || {}).forEach(([cat, val]) => {
          strCats[cat] = String(val)
        })
        setSettingsCategories(strCats)
      }

      if (summary) {
        setSummaryData(summary)
        if (!profile && summary.totalIncome > 0) setMonthlyIncome(summary.totalIncome)
        if (!profile && summary.savingsTarget > 0) setSavingsGoal(summary.savingsTarget)
      }

      // Map Real Expenses from MySQL
      if (apiTxs) {
        const mapped: Transaction[] = apiTxs.map((e) => ({
          id: `TX-${e.expenseId}`,
          timestamp: e.expenseDate || new Date().toISOString().slice(0, 10),
          type: 'EXPENSE',
          merchant: e.title,
          category: e.categoryName,
          amount: -Math.abs(e.amount),
          account: 'Primary Account',
          status: 'SETTLED',
          notes: e.notes || '',
          refHash: `0x${e.expenseId}a92b`,
        }))
        setTransactions(mapped)
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }, [timeframe])

  // Initial Mount
  useEffect(() => {
    let resolvedUserId: string | number = 1
    if (typeof window !== 'undefined') {
      const storedUid = localStorage.getItem('firebase_uid')
      const storedId = localStorage.getItem('user_id')
      if (storedUid) {
        resolvedUserId = storedUid
        setUserId(storedUid)
      } else if (storedId) {
        resolvedUserId = storedId
        setUserId(storedId)
      }

      const storedName = localStorage.getItem('user_setup_name')
      if (storedName) {
        setUserName(storedName)
        setSettingsName(storedName)
      }

      // Static professional greeting
      setGreeting('Welcome back')

      // Formatted Date
      const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }
      setCurrentDateStr(new Date().toLocaleDateString('en-GB', options))
    }

    loadDashboardData(resolvedUserId, timeframe)
  }, [loadDashboardData, timeframe])

  // Handle Timeframe Change
  const handleTimeframeChange = async (tf: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL') => {
    setTimeframe(tf)
    setLoading(true)
    await loadDashboardData(userId, tf)
  }

  // 2. Dynamic Real Calculations (Income, Spent, Balance)
  const totalSpent = useMemo(() => {
    return transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
  }, [transactions])

  const remainingBalance = useMemo(() => {
    return monthlyIncome - totalSpent
  }, [monthlyIncome, totalSpent])

  const spendingPctUsed = useMemo(() => {
    if (monthlyIncome <= 0) return 0
    return Math.min(Math.round((totalSpent / monthlyIncome) * 100), 100)
  }, [totalSpent, monthlyIncome])

  const savingsProgressPct = useMemo(() => {
    if (savingsGoal <= 0) return 0
    const ratio = Math.max(0, remainingBalance) / savingsGoal
    return Math.min(Math.round(ratio * 100), 100)
  }, [remainingBalance, savingsGoal])

  // 3. Category Spending Aggregation
  const categorySpendList = useMemo(() => {
    const actualMap: Record<string, number> = {}
    transactions.forEach((t) => {
      const cat = t.category || 'General'
      actualMap[cat] = (actualMap[cat] || 0) + Math.abs(t.amount)
    })

    // Combine categories with user's configured baselines
    const allCatNames = Array.from(new Set([...Object.keys(actualMap), ...Object.keys(categoryBudgets)]))

    return allCatNames.map((cat) => {
      const actual = actualMap[cat] || 0
      const baseline = categoryBudgets[cat] || 3000
      const pct = baseline > 0 ? Math.min(Math.round((actual / baseline) * 100), 100) : 0
      const isOver = actual > baseline
      return {
        category: cat,
        actual,
        baseline,
        difference: actual - baseline,
        pct,
        isOver,
      }
    }).sort((a, b) => b.actual - a.actual)
  }, [transactions, categoryBudgets])

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        !searchQuery.trim() ||
        t.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [transactions, searchQuery, categoryFilter])

  // 3b. Category-wise Spending Breakdown (100% Real from transactions)
  const categoryWiseSpending = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {}
    let overallTotal = 0

    transactions.forEach((t) => {
      const amt = Math.abs(t.amount)
      if (amt > 0) {
        const cat = (t.category || 'General').trim()
        if (!map[cat]) {
          map[cat] = { total: 0, count: 0 }
        }
        map[cat].total += amt
        map[cat].count += 1
        overallTotal += amt
      }
    })

    return Object.entries(map)
      .map(([category, data]) => {
        const pct = overallTotal > 0 ? (data.total / overallTotal) * 100 : 0
        return {
          category,
          amount: data.total,
          count: data.count,
          percentage: Math.round(pct * 10) / 10,
        }
      })
      .sort((a, b) => b.amount - a.amount)
  }, [transactions])

  // 3c. Rule-Based Dynamic Financial Insights (100% Derived from Real Data)
  const financialInsightsList = useMemo(() => {
    const items: Array<{
      id: string
      type: 'warning' | 'success' | 'info'
      title: string
      message: string
      icon: React.ReactNode
    }> = []

    if (transactions.length === 0) {
      items.push({
        id: 'no-data',
        type: 'info',
        title: 'Awaiting Transactions',
        message: 'Record your first expenses to start generating personalized financial insights and pacing observations.',
        icon: <Info className="w-4 h-4 text-cyan-400" />,
      })
      return items
    }

    // 1. Weekend vs Weekday Spending Analysis
    let weekendTotal = 0
    let weekdayTotal = 0
    const weekendDays = new Set<string>()
    const weekdayDays = new Set<string>()

    transactions.forEach((t) => {
      const amt = Math.abs(t.amount)
      const d = new Date(t.timestamp)
      const dateStr = t.timestamp.slice(0, 10)
      const day = d.getDay() // 0 = Sunday, 6 = Saturday
      if (day === 0 || day === 6) {
        weekendTotal += amt
        weekendDays.add(dateStr)
      } else {
        weekdayTotal += amt
        weekdayDays.add(dateStr)
      }
    })

    const weekendCount = Math.max(1, weekendDays.size)
    const weekdayCount = Math.max(1, weekdayDays.size)
    const weekendDailyAvg = weekendTotal / weekendCount
    const weekdayDailyAvg = weekdayTotal / weekdayCount

    if (weekendTotal > 0 && weekendDailyAvg > weekdayDailyAvg * 1.25) {
      items.push({
        id: 'weekend-trend',
        type: 'warning',
        title: 'Weekend Spending Trend',
        message: `Your weekend spending is higher than your weekday spending (averaging ₹${Math.round(weekendDailyAvg).toLocaleString('en-IN')}/day on weekends vs ₹${Math.round(weekdayDailyAvg).toLocaleString('en-IN')}/day on weekdays).`,
        icon: <Calendar className="w-4 h-4 text-amber-400" />,
      })
    } else if (weekdayTotal > 0 && weekdayDailyAvg > weekendDailyAvg * 1.5 && weekendTotal > 0) {
      items.push({
        id: 'weekday-trend',
        type: 'info',
        title: 'Weekday Concentrated Spending',
        message: `The majority of your expenses occur during workdays (averaging ₹${Math.round(weekdayDailyAvg).toLocaleString('en-IN')}/day), with disciplined weekend spending.`,
        icon: <Calendar className="w-4 h-4 text-cyan-400" />,
      })
    }

    // 2. Category Above Baseline
    const overBaselineCat = categorySpendList.find((c) => c.isOver)
    if (overBaselineCat) {
      const excess = overBaselineCat.difference
      items.push({
        id: 'category-baseline-alert',
        type: 'warning',
        title: 'Category Spending Above Baseline',
        message: `Your ${overBaselineCat.category} spending (₹${overBaselineCat.actual.toLocaleString('en-IN')}) is ₹${excess.toLocaleString('en-IN')} above your planned baseline of ₹${overBaselineCat.baseline.toLocaleString('en-IN')}.`,
        icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
      })
    } else if (categorySpendList.length > 0) {
      items.push({
        id: 'category-baseline-ok',
        type: 'success',
        title: 'Budget Discipline',
        message: 'All active spending categories are currently within your planned baselines.',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      })
    }

    // 3. Savings Target Progress
    if (savingsGoal > 0) {
      if (remainingBalance >= savingsGoal) {
        items.push({
          id: 'savings-on-track',
          type: 'success',
          title: 'Savings Target On Track',
          message: `You are currently on track with your monthly savings target of ₹${savingsGoal.toLocaleString('en-IN')}.`,
          icon: <Target className="w-4 h-4 text-emerald-400" />,
        })
      } else if (remainingBalance > 0) {
        const gap = savingsGoal - remainingBalance
        items.push({
          id: 'savings-gap',
          type: 'info',
          title: 'Savings Opportunity',
          message: `You have a ₹${Math.round(gap).toLocaleString('en-IN')} gap to reach your planned savings target of ₹${savingsGoal.toLocaleString('en-IN')} for this billing cycle.`,
          icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
        })
      } else {
        items.push({
          id: 'savings-deficit',
          type: 'warning',
          title: 'Deficit Alert',
          message: 'Total spending has exceeded your configured income baseline, impacting monthly savings.',
          icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
        })
      }
    }

    // 4. High Spending Category Driver
    if (categoryWiseSpending.length > 0) {
      const topCat = categoryWiseSpending[0]
      if (topCat.percentage >= 35) {
        items.push({
          id: 'top-category',
          type: 'info',
          title: 'High Spending Category',
          message: `${topCat.category} is your largest expense driver, accounting for ${topCat.percentage}% of your total spending (₹${topCat.amount.toLocaleString('en-IN')}).`,
          icon: <TrendingUp className="w-4 h-4 text-cyan-400" />,
        })
      }
    }

    // 5. Spending Pace Observation
    if (summaryData?.spendingPace) {
      const pace = summaryData.spendingPace
      if (pace.paceStatus === 'ON TRACK') {
        items.push({
          id: 'pace-on-track',
          type: 'success',
          title: 'Pacing On Track',
          message: `Your current burn rate of ₹${pace.dailyAverage}/day is healthy, preserving ₹${pace.safeToSpend.toLocaleString('en-IN')} in safe spend cushion.`,
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
        })
      } else if (pace.paceStatus === 'ABOVE PACE') {
        items.push({
          id: 'pace-above',
          type: 'warning',
          title: 'Accelerated Burn Rate',
          message: `Your projected month-end spend of ₹${pace.projectedMonthSpend.toLocaleString('en-IN')} is trending above your discretionary capacity.`,
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
        })
      } else {
        items.push({
          id: 'pace-under',
          type: 'info',
          title: 'Conservative Spending Pace',
          message: `You have ₹${pace.safeToSpend.toLocaleString('en-IN')} in remaining safe cushion with a daily allowance of ₹${pace.dailySafeSpend}/day.`,
          icon: <Lightbulb className="w-4 h-4 text-cyan-400" />,
        })
      }
    }

    return items
  }, [transactions, categorySpendList, savingsGoal, remainingBalance, categoryWiseSpending, summaryData])

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current))
    }, 3500)
  }

  // 4. Add / Edit Expense Handler
  const handleSaveTransaction = async (txData: Omit<Transaction, 'balance'>) => {
    try {
      if (editingTx) {
        const rawExpenseId = editingTx.id.replace(/^TX-/, '')
        if (rawExpenseId) {
          const res = await apiUpdateExpense({
            expenseId: rawExpenseId,
            userId,
            title: txData.merchant,
            categoryName: txData.category,
            amount: Math.abs(txData.amount),
            expenseDate: txData.timestamp.slice(0, 10),
            notes: txData.notes,
          })
          if (res.success) {
            showToast(`Updated expense "${txData.merchant}" (₹${Math.abs(txData.amount)})`)
          } else {
            throw new Error(res.message || 'Failed to update expense')
          }
        }
      } else {
        const res = await apiAddExpense(
          userId,
          txData.merchant,
          txData.category,
          Math.abs(txData.amount),
          txData.timestamp.slice(0, 10),
          txData.notes
        )
        if (res.success) {
          showToast(`Recorded expense "${txData.merchant}" (₹${Math.abs(txData.amount)})`)
        } else {
          throw new Error(res.message || 'Failed to record expense')
        }
      }
      setIsAddModalOpen(false)
      setEditingTx(null)
      setLastRecordedExpenseTitle(txData.merchant)
      setLastRecordedExpenseAmount(Math.abs(txData.amount))
      await loadDashboardData(userId, timeframe)
      setCompanionTriggerCount((prev) => prev + 1)
    } catch (e: any) {
      console.error('Failed to save transaction:', e)
      throw e
    }
  }

  // 5. Delete Expense Handler
  const handleDeleteTransaction = async (id: string) => {
    const rawExpenseId = id.replace(/^TX-/, '')
    if (rawExpenseId) {
      try {
        const res = await apiDeleteExpense(rawExpenseId, userId)
        if (res.success) {
          showToast('Expense successfully removed from database')
        }
        await loadDashboardData(userId, timeframe)
      } catch (e) {
        console.error('Failed to delete expense:', e)
      }
    }
  }

  // 6. Settings Form Submit Handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSettingsSaving(true)
    setSettingsFeedback(null)

    try {
      const parsedIncome = parseFloat(settingsIncome) || 0
      const parsedSavings = parseFloat(settingsSavings) || 0
      const parsedCategories: Record<string, number> = {}

      Object.entries(settingsCategories).forEach(([cat, val]) => {
        const num = parseFloat(val)
        if (!isNaN(num)) parsedCategories[cat] = num
      })

      const res = await apiUpdateSettings(userId, {
        name: settingsName.trim() || userName,
        monthlyIncome: parsedIncome,
        savingsTarget: parsedSavings,
        categories: parsedCategories,
      })

      if (res.success) {
        setUserName(settingsName.trim() || userName)
        setMonthlyIncome(parsedIncome)
        setSavingsGoal(parsedSavings)
        setCategoryBudgets(parsedCategories)

        if (typeof window !== 'undefined') {
          localStorage.setItem('user_setup_name', settingsName.trim())
          localStorage.setItem('user_setup_income', String(parsedIncome))
          localStorage.setItem('user_setup_savings', String(parsedSavings))
          localStorage.setItem('user_setup_categories', JSON.stringify(
            Object.entries(parsedCategories).map(([name, budget]) => ({ name, budget: String(budget) }))
          ))
        }

        setSettingsFeedback({ type: 'success', message: 'Settings successfully updated in MySQL database.' })
        await loadDashboardData(userId, timeframe)
      } else {
        setSettingsFeedback({ type: 'error', message: res.message || 'Failed to update settings.' })
      }
    } catch (err: any) {
      setSettingsFeedback({ type: 'error', message: err.message || 'Network error updating settings.' })
    } finally {
      setSettingsSaving(false)
    }
  }

  // Add new category in settings
  const handleAddCategorySetting = () => {
    if (!newCategoryName.trim()) return
    const baseline = parseFloat(newCategoryBaseline) || 2000
    setSettingsCategories((prev) => ({ ...prev, [newCategoryName.trim()]: String(baseline) }))
    setNewCategoryName('')
    setNewCategoryBaseline('')
  }

  // Remove category from settings
  const handleRemoveCategorySetting = (catName: string) => {
    setSettingsCategories((prev) => {
      const copy = { ...prev }
      delete copy[catName]
      return copy
    })
  }

  // 7. Dynamic Timeline Coordinates Generator
  const timelinePoints = useMemo(() => {
    const rawPoints = summaryData?.timeline || []
    if (rawPoints.length === 0) {
      return []
    }

    // Determine scale
    const balances = rawPoints.map((p) => p.balance)
    const minBalance = Math.min(...balances, 0)
    const maxBalance = Math.max(...balances, monthlyIncome || 1000)
    const range = maxBalance - minBalance || 1

    const width = 600
    const height = 150
    const padding = 20

    return rawPoints.map((pt, idx) => {
      const x = rawPoints.length === 1 ? width / 2 : padding + (idx / (rawPoints.length - 1)) * (width - 2 * padding)
      const normalizedY = (pt.balance - minBalance) / range
      const y = height - padding - normalizedY * (height - 2 * padding)
      return { ...pt, x, y }
    })
  }, [summaryData?.timeline, monthlyIncome])

  // Generate SVG path for timeline
  const timelineSvgPath = useMemo(() => {
    if (timelinePoints.length === 0) return ''
    if (timelinePoints.length === 1) return `M 0 ${timelinePoints[0].y} L 600 ${timelinePoints[0].y}`

    let d = `M ${timelinePoints[0].x} ${timelinePoints[0].y}`
    for (let i = 1; i < timelinePoints.length; i++) {
      const prev = timelinePoints[i - 1]
      const curr = timelinePoints[i]
      const cpX = (prev.x + curr.x) / 2
      d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`
    }
    return d
  }, [timelinePoints])

  const timelineFillPath = useMemo(() => {
    if (timelinePoints.length === 0) return ''
    const linePath = timelineSvgPath
    const firstX = timelinePoints[0].x
    const lastX = timelinePoints[timelinePoints.length - 1].x
    return `${linePath} L ${lastX} 160 L ${firstX} 160 Z`
  }, [timelineSvgPath, timelinePoints])

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans flex transition-colors duration-200">
      {/* 1. Dark Sidebar Navigation - Polished Deep Navy / Charcoal */}
      <aside className="w-64 border-r border-[#1e293b] bg-[#0d141f] flex flex-col justify-between hidden lg:flex shrink-0">
        <div>
          {/* Logo Header */}
          <div className="p-6 border-b border-[#1e293b]">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-[var(--accent)] text-black font-bold flex items-center justify-center font-mono text-xs shadow-sm">
                ET
              </div>
              <div>
                <span className="font-bold text-sm tracking-wider uppercase block text-slate-100">LEDGER / PERSONAL</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                  <span className="text-[11px] font-mono text-[var(--accent)] font-semibold uppercase">LIVE</span>
                  <span className="text-[11px] font-mono text-slate-400">• Cloud Firestore</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation Tabs */}
          <nav className="p-4 space-y-1.5 text-xs font-medium font-sans">
            {[
              { id: 'Overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'Transactions', label: 'Transactions', icon: Receipt },
              { id: 'Budgets', label: 'Budgets', icon: Target },
              { id: 'Insights', label: 'Insights', icon: Lightbulb },
              { id: 'Accounts', label: 'Accounts', icon: Wallet },
              { id: 'Settings', label: 'Settings', icon: Settings },
            ].map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all ${
                    isActive
                      ? 'bg-[#1a2536] text-white font-semibold border-l-2 border-[var(--accent)] shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-[#141e2e]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--accent)]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Database & Architecture Telemetry Card */}
        <div className="p-4 m-4 rounded-xl border border-[#1e2e42] bg-[#121c29] space-y-2.5 text-xs">
          <div className="flex items-center gap-2 text-[var(--accent)] font-mono text-[11px] font-semibold">
            <Database className="w-3.5 h-3.5" />
            <span>CLOUD FIRESTORE PERSISTENCE</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Direct serverless database with per-user document isolation and subcollections.
          </p>
          <div className="pt-1 flex items-center gap-2 font-mono text-[11px] text-slate-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Zero mock / live synchronized</span>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-[var(--border)] bg-[var(--panel)]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            {/* Search Input */}
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions... (Ctrl K)"
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg pl-9 pr-4 py-1.5 text-xs text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[var(--text-muted)] hidden md:inline">
              {currentDateStr || 'Today'}
            </span>

            {/* Notification Bell */}
            <button type="button" className="p-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)] relative">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] absolute top-1.5 right-1.5" />
            </button>

            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-black font-bold font-mono text-xs flex items-center justify-center">
              {userName ? userName.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'U'}
            </div>

            {/* Record Transaction CTA Button */}
            <button
              type="button"
              onClick={() => {
                setEditingTx(null)
                setIsAddModalOpen(true)
              }}
              className="bg-[var(--accent)] text-black font-semibold text-xs px-3.5 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record transaction</span>
            </button>

            {/* Top-Right Light/Dark Theme Toggle */}
            <ThemeToggle />

            <button
              type="button"
              onClick={async () => {
                await apiLogout()
                window.location.href = '/login'
              }}
              className="p-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dashboard Content Body */}
        <main className="p-6 sm:p-8 space-y-8 flex-1 max-w-7xl w-full mx-auto">
          {/* Greeting Header & 3 Summary Cards (NO NET WORTH CARD) */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider block mb-1 font-medium">
                YOUR FINANCIAL OVERVIEW
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">
                Welcome back, <span className="text-[var(--text)]">{userName.split(' ')[0] || 'User'}</span>.
              </h1>
              <p className="text-xs sm:text-[13px] text-[var(--text-muted)] mt-1 flex items-center gap-2">
                Here’s your financial overview based on your recorded transactions.
              </p>
            </div>

            {/* 4 Summary Cards strictly calculated from real user data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {/* Card 1: Monthly Income */}
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--panel)]">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium mb-1">
                  <span>Monthly income</span>
                  <Wallet className="w-4 h-4 text-[var(--accent)]" />
                </div>
                <div className="text-xl font-bold font-mono tracking-tight text-[var(--text)]">
                  ₹{monthlyIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[11px] font-mono text-[var(--text-muted)] flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3 h-3 text-[var(--accent)]" /> Configured baseline
                </span>
              </div>

              {/* Card 2: Total Spent (Monthly Spending) */}
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--panel)]">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium mb-1">
                  <span>Total spent</span>
                  <CreditCard className="w-4 h-4 text-[var(--danger)]" />
                </div>
                <div className="text-xl font-bold font-mono tracking-tight text-[var(--danger)]">
                  ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-[var(--text-muted)]">
                    <span>{spendingPctUsed}% of income</span>
                    <span>{transactions.length} record{transactions.length === 1 ? '' : 's'}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--bg)] rounded-full overflow-hidden border border-[var(--border)]">
                    <div className="h-full bg-[var(--accent)] transition-all" style={{ width: `${spendingPctUsed}%` }} />
                  </div>
                </div>
              </div>

              {/* Card 3: Remaining Balance */}
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--panel)]">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium mb-1">
                  <span>Remaining balance</span>
                  <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
                </div>
                <div className={`text-xl font-bold font-mono tracking-tight ${remainingBalance < 0 ? 'text-[var(--danger)]' : 'text-[var(--accent)]'}`}>
                  ₹{remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[11px] font-mono text-[var(--text-muted)] flex items-center gap-1 mt-1">
                  Target: ₹{savingsGoal.toLocaleString('en-IN')} savings ({savingsProgressPct}%)
                </span>
              </div>

              {/* Card 4: Daily Safe Spend Allowance */}
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--panel)]">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium mb-1">
                  <span>Daily Safe Spend</span>
                  <Gauge className="w-4 h-4 text-emerald-400" />
                </div>
                <div className={`text-xl font-bold font-mono tracking-tight ${
                  (summaryData?.spendingPace?.dailySafeSpend ?? 0) <= 0 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  ₹{(summaryData?.spendingPace?.dailySafeSpend ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  <span className="text-xs font-normal text-[var(--text-muted)] ml-1">/ day</span>
                </div>
                <span className="text-[11px] font-mono text-[var(--text-muted)] flex items-center gap-1 mt-1">
                  {(summaryData?.spendingPace?.dailySafeSpend ?? 0) <= 0
                    ? '⚠️ Capacity limit reached'
                    : `Across ${summaryData?.spendingPace?.daysRemaining ?? 1} days left in month`}
                </span>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* TAB 1: OVERVIEW TAB */}
          {/* ============================================================ */}
          {activeTab === 'Overview' && (
            <div className="space-y-8">
              {/* 2-Column Main Layout Grid */}
              <div className="grid lg:grid-cols-3 gap-8 items-start">
                {/* Left Main Column (2/3 width) */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Balance Timeline Chart Card */}
                  <section className="p-6 rounded-xl border border-[var(--border)] bg-[var(--panel)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-base font-bold tracking-tight text-[var(--text)]">Balance timeline</h3>
                        <p className="text-xs text-[var(--text-muted)]">
                          Dynamic liquid balance trajectory filtered by <span className="font-mono text-[var(--accent)] font-semibold">{timeframe}</span>.
                        </p>
                      </div>
                      <div className="flex gap-1 bg-[var(--bg)] p-1 rounded-lg border border-[var(--border)] self-start">
                        {(['1D', '1W', '1M', '3M', '1Y', 'ALL'] as const).map((tf) => (
                          <button
                            key={tf}
                            type="button"
                            onClick={() => handleTimeframeChange(tf)}
                            className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                              timeframe === tf
                                ? 'bg-[var(--panel)] text-[var(--text)] font-semibold shadow-sm border border-[var(--border)]'
                                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                            }`}
                          >
                            {tf}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Smooth Dynamic Chart Canvas Visual */}
                    <div className="h-64 w-full relative pt-2">
                      {timelinePoints.length > 0 ? (
                        <>
                          <svg viewBox="0 0 600 160" className="w-full h-full overflow-visible">
                            <defs>
                              <linearGradient id="balanceTimelineGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
                                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            <line x1="0" y1="30" x2="600" y2="30" stroke="var(--border-subtle)" strokeDasharray="4 4" />
                            <line x1="0" y1="80" x2="600" y2="80" stroke="var(--border-subtle)" strokeDasharray="4 4" />
                            <line x1="0" y1="130" x2="600" y2="130" stroke="var(--border-subtle)" strokeDasharray="4 4" />

                            {/* Gradient Area Fill */}
                            <path d={timelineFillPath} fill="url(#balanceTimelineGrad)" />

                            {/* Main Curve Line */}
                            <path d={timelineSvgPath} fill="none" stroke="var(--accent)" strokeWidth="2.5" />

                            {/* Data points dots */}
                            {timelinePoints.map((pt, i) => (
                              <circle
                                key={i}
                                cx={pt.x}
                                cy={pt.y}
                                r={i === timelinePoints.length - 1 ? 5 : 3.5}
                                fill="var(--bg)"
                                stroke="var(--accent)"
                                strokeWidth={i === timelinePoints.length - 1 ? 3 : 2}
                              />
                            ))}
                          </svg>
                          <div className="flex justify-between text-[11px] font-mono text-[var(--text-muted)] border-t border-[var(--border)] pt-2 mt-2">
                            <span>{timelinePoints[0]?.date || 'Start'}</span>
                            <span>{timelinePoints[Math.floor(timelinePoints.length / 2)]?.date || 'Mid'}</span>
                            <span className="text-[var(--accent)] font-semibold">
                              Latest: ₹{remainingBalance.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-[var(--border)] rounded-xl bg-[var(--bg)]/40 space-y-2">
                          <Activity className="w-6 h-6 text-[var(--accent)] opacity-60" />
                          <span className="text-xs font-semibold text-[var(--text)]">Zero transactions in selected timeframe ({timeframe})</span>
                          <p className="text-[11px] text-[var(--text-muted)] max-w-sm">
                            Balance remains at your baseline income of ₹{monthlyIncome.toLocaleString('en-IN')}. Record an expense to see your dynamic timeline.
                          </p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Recent Transactions Table */}
                  <section className="p-6 rounded-xl border border-[var(--border)] bg-[var(--panel)] space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-base font-bold tracking-tight text-[var(--text)]">Recent transactions</h3>
                        <p className="text-xs text-[var(--text-muted)]">
                          Real expenses queried directly from MySQL.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveTab('Transactions')}
                          className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text)] transition-colors font-medium"
                        >
                          View all ({transactions.length})
                        </button>
                      </div>
                    </div>

                    {transactions.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-[var(--border)] rounded-xl bg-[var(--bg)]/30 space-y-3">
                        <Receipt className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
                        <h4 className="text-xs font-bold text-[var(--text)]">No transactions recorded yet</h4>
                        <p className="text-[11px] text-[var(--text-muted)] max-w-md mx-auto">
                          Click "Record transaction" in the top bar to record your first real expense into MySQL.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTx(null)
                            setIsAddModalOpen(true)
                          }}
                          className="px-3.5 py-2 bg-[var(--accent)] text-black font-semibold text-xs rounded-lg hover:opacity-90 transition-opacity inline-flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" /> Record your first expense
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-[var(--border)] text-[11px] font-mono text-[var(--text-muted)] uppercase font-medium">
                              <th className="py-3 px-4">Merchant / Title</th>
                              <th className="py-3 px-4">Category</th>
                              <th className="py-3 px-4">Date</th>
                              <th className="py-3 px-4 text-right">Amount</th>
                              <th className="py-3 px-4 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--border-subtle)] text-xs">
                            {filteredTransactions.slice(0, 6).map((tx) => {
                              const icon = CATEGORY_ICONS[tx.category] || <Receipt className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                              const badgeStyle = CATEGORY_COLORS[tx.category] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'

                              return (
                                <tr key={tx.id} className="hover:bg-[var(--bg)]/40 transition-colors">
                                  <td className="py-3.5 px-4 font-medium text-[var(--text)] flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] flex items-center justify-center shrink-0">
                                      {icon}
                                    </div>
                                    <div>
                                      <span className="block font-medium">{tx.merchant}</span>
                                      {tx.notes && <span className="text-[11px] text-[var(--text-muted)] block">{tx.notes}</span>}
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border ${badgeStyle}`}>
                                      {tx.category}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-[var(--text-muted)] font-mono">
                                    {tx.timestamp.slice(0, 10)}
                                  </td>
                                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-[var(--danger)]">
                                    -₹{Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                  </td>
                                  <td className="py-3.5 px-4 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingTx(tx)
                                          setIsAddModalOpen(true)
                                        }}
                                        className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                                        title="Edit expense"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteTransaction(tx.id)}
                                        className="p-1 rounded text-[var(--danger)] hover:bg-[var(--danger-bg)] transition-colors"
                                        title="Delete expense"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>

                  {/* Category-wise Spending Section */}
                  <section className="p-6 rounded-xl border border-[var(--border)] bg-[var(--panel)] space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--accent)]">
                          <PieChart className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold tracking-tight text-[var(--text)]">Category-wise Spending</h3>
                          <p className="text-xs text-[var(--text-muted)]">
                            Distribution across your recorded expenses
                          </p>
                        </div>
                      </div>
                      {totalSpent > 0 && (
                        <span className="text-xs font-mono font-semibold text-[var(--accent)] px-2.5 py-1 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)]">
                          ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Total
                        </span>
                      )}
                    </div>

                    {categoryWiseSpending.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-[var(--border)] rounded-xl bg-[var(--bg)]/30 space-y-2">
                        <ShoppingBag className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
                        <h4 className="text-xs font-bold text-[var(--text)]">No category spending recorded yet</h4>
                        <p className="text-[11px] text-[var(--text-muted)] max-w-sm mx-auto">
                          Add an expense with a category to see your live category distribution breakdown.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {categoryWiseSpending.map((item) => {
                          const icon = CATEGORY_ICONS[item.category] || <Receipt className="w-3.5 h-3.5 text-[var(--text-muted)]" />

                          return (
                            <div key={item.category} className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2.5">
                                  <div className="p-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] shrink-0">
                                    {icon}
                                  </div>
                                  <div>
                                    <span className="font-semibold text-[var(--text)] block">{item.category}</span>
                                    <span className="text-[11px] text-[var(--text-muted)] font-mono">
                                      {item.count} {item.count === 1 ? 'transaction' : 'transactions'}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right font-mono">
                                  <span className="font-bold text-[var(--text)] block">
                                    ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                  </span>
                                  <span className="text-[11px] text-[var(--accent)] font-semibold">
                                    {item.percentage}%
                                  </span>
                                </div>
                              </div>
                              {/* Horizontal distribution bar */}
                              <div className="h-2 w-full bg-[var(--bg)] rounded-full overflow-hidden border border-[var(--border)]">
                                <div
                                  className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min(100, Math.max(2, item.percentage))}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </section>

                  {/* Financial Insights Section */}
                  <section className="p-6 rounded-xl border border-[var(--border)] bg-[var(--panel)] space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--accent)]">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold tracking-tight text-[var(--text)]">Financial Insights</h3>
                          <p className="text-xs text-[var(--text-muted)]">
                            Data-driven intelligence from your real spending habits
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent-border)] font-semibold">
                        Deterministic Rules
                      </span>
                    </div>

                    <div className="space-y-3">
                      {financialInsightsList.map((insight) => {
                        const borderColor =
                          insight.type === 'warning'
                            ? 'border-amber-500/20 bg-amber-500/5'
                            : insight.type === 'success'
                            ? 'border-emerald-500/20 bg-emerald-500/5'
                            : 'border-[var(--border)] bg-[var(--bg)]/60'

                        return (
                          <div
                            key={insight.id}
                            className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${borderColor}`}
                          >
                            <div className="p-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] shrink-0 mt-0.5">
                              {insight.icon}
                            </div>
                            <div className="space-y-0.5 flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-[var(--text)]">{insight.title}</h4>
                              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                {insight.message}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </section>
                </div>

                {/* Right Main Column (1/3 width) */}
                <div className="space-y-8">
                  {/* FEATURE 1 — Personal Spending Pace + Month-End Forecast Card */}
                  <section className="p-6 rounded-xl border border-[var(--border)] bg-[var(--panel)] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Compass className="w-4 h-4 text-[var(--accent)]" />
                        <h3 className="text-base font-bold tracking-tight text-[var(--text)]">Spending pace</h3>
                      </div>
                      {summaryData?.spendingPace && (
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold border ${
                          summaryData.spendingPace.paceStatus === 'ON TRACK'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : summaryData.spendingPace.paceStatus === 'ABOVE PACE'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                        }`}>
                          {summaryData.spendingPace.paceStatus}
                        </span>
                      )}
                    </div>

                    {summaryData?.spendingPace ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                            <span className="text-[11px] font-mono text-[var(--text-muted)] block font-medium">Spent So Far</span>
                            <span className="text-sm font-bold font-mono text-[var(--text)]">
                              ₹{summaryData.spendingPace.actualSpentMonth.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                              Day {summaryData.spendingPace.daysElapsed} of {summaryData.spendingPace.daysInMonth}
                            </span>
                          </div>

                          <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                            <span className="text-[11px] font-mono text-[var(--text-muted)] block font-medium">Ideal Pace Today</span>
                            <span className="text-sm font-bold font-mono text-[var(--accent)]">
                              ₹{summaryData.spendingPace.idealPaceToday.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">Target capacity</span>
                          </div>

                          <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                            <span className="text-[11px] font-mono text-[var(--text-muted)] block font-medium">Projected Month-End</span>
                            <span className="text-sm font-bold font-mono text-[var(--text)]">
                              ₹{summaryData.spendingPace.projectedMonthSpend.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">Based on daily burn</span>
                          </div>

                          <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                            <span className="text-[11px] font-mono text-[var(--text-muted)] block font-medium">Safe to Spend</span>
                            <span className="text-sm font-bold font-mono text-emerald-400">
                              ₹{summaryData.spendingPace.safeToSpend.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">Remaining cushion</span>
                          </div>
                        </div>

                        <p className="text-xs text-[var(--text-muted)] leading-relaxed bg-[var(--bg)]/60 p-3 rounded-lg border border-[var(--border)]">
                          {summaryData.spendingPace.explanation}
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 text-xs text-[var(--text-muted)] font-mono">Calculating spending pace...</div>
                    )}
                  </section>

                  {/* FEATURE 2 — Explainable Spending Health Card */}
                  <section className="p-6 rounded-xl border border-[var(--border)] bg-[var(--panel)] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-[var(--accent)]" />
                        <h3 className="text-base font-bold tracking-tight text-[var(--text)]">Spending health</h3>
                      </div>
                      {summaryData?.spendingHealth && (
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent-border)]">
                          {summaryData.spendingHealth.healthLabel}
                        </span>
                      )}
                    </div>

                    {summaryData?.spendingHealth ? (
                      <div className="space-y-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-extrabold font-mono text-[var(--text)]">
                            {summaryData.spendingHealth.score}
                          </span>
                          <span className="text-sm font-mono text-[var(--text-muted)]">/ 100</span>
                        </div>

                        <div className="h-2 w-full bg-[var(--bg)] rounded-full overflow-hidden border border-[var(--border)]">
                          <div
                            className="h-full bg-[var(--accent)] transition-all"
                            style={{ width: `${summaryData.spendingHealth.score}%` }}
                          />
                        </div>

                        <div className="border border-[var(--border)] rounded-lg bg-[var(--bg)]/50 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setShowHealthWhy(!showHealthWhy)}
                            className="w-full flex items-center justify-between p-3 text-xs font-semibold text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
                          >
                            <div className="flex items-center gap-1.5 font-mono text-[11px]">
                              <HelpCircle className="w-3.5 h-3.5 text-[var(--accent)]" />
                              <span>Why this score?</span>
                            </div>
                            {showHealthWhy ? <ChevronUp className="w-3.5 h-3.5 text-[var(--text-muted)]" /> : <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
                          </button>

                          {showHealthWhy && (
                            <div className="px-3 pb-3 space-y-1.5 border-t border-[var(--border)]/50 pt-2">
                              {summaryData.spendingHealth.reasons.map((reason, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-[var(--text-muted)] leading-relaxed">
                                  <span className="text-[var(--accent)] font-mono text-xs">•</span>
                                  <span>{reason}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-xs text-[var(--text-muted)] font-mono">Computing health score...</div>
                    )}
                  </section>

                  {/* Spending by Category Card */}
                  <section className="p-6 rounded-xl border border-[var(--border)] bg-[var(--panel)] space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold tracking-tight text-[var(--text)]">Spending by category</h3>
                      <span className="text-xs font-mono text-[var(--text-muted)] font-medium">Actual vs Baseline</span>
                    </div>

                    {categorySpendList.length === 0 ? (
                      <p className="text-xs text-[var(--text-muted)] py-4">No categories configured or spent yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {categorySpendList.map((item) => (
                          <div key={item.category} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <div className="p-1 rounded bg-[var(--bg)] border border-[var(--border)]">
                                  {CATEGORY_ICONS[item.category] || <Receipt className="w-3 h-3" />}
                                </div>
                                <span className="font-semibold text-xs text-[var(--text)]">{item.category}</span>
                              </div>
                              <div className="font-mono text-right text-xs">
                                <span className={`font-semibold ${item.isOver ? 'text-[var(--danger)]' : 'text-[var(--text)]'}`}>
                                  ₹{item.actual.toLocaleString('en-IN')}
                                </span>
                                <span className="text-[var(--text-muted)] text-[11px] ml-1.5">/ ₹{item.baseline.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                            <div className="h-1.5 w-full bg-[var(--bg)] rounded-full overflow-hidden border border-[var(--border)]">
                              <div
                                className={`h-full ${item.isOver ? 'bg-[var(--danger)]' : 'bg-[var(--accent)]'}`}
                                style={{ width: `${item.pct}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* FEATURE 3 — What-If Purchase Simulator Card (100% In-Memory, Read-Only) */}
                  <section className="p-6 rounded-xl border border-[var(--border)] bg-[var(--panel)] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-[var(--accent)]" />
                        <h3 className="text-base font-bold tracking-tight text-[var(--text)]">What-if simulator</h3>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Read-only • No DB mutation
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      Simulate hypothetical purchases before spending to see their immediate impact on your safe cushion, daily allowance, pacing, and health score.
                    </p>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-mono text-[var(--text-muted)] block mb-1 font-medium">Amount (₹)</label>
                          <input
                            type="number"
                            value={whatIfAmount}
                            onChange={(e) => {
                              setWhatIfAmount(e.target.value)
                              if (whatIfValidationMsg) setWhatIfValidationMsg(null)
                            }}
                            placeholder="e.g. 2000"
                            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text)] font-mono focus:outline-none focus:border-[var(--accent)] transition-colors"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-mono text-[var(--text-muted)] block mb-1 font-medium">Category</label>
                          <select
                            value={isCustomCategory ? '__CUSTOM__' : whatIfCategory}
                            onChange={(e) => {
                              if (e.target.value === '__CUSTOM__') {
                                setIsCustomCategory(true)
                              } else {
                                setIsCustomCategory(false)
                                setWhatIfCategory(e.target.value)
                              }
                              if (whatIfValidationMsg) setWhatIfValidationMsg(null)
                            }}
                            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text)] font-mono focus:outline-none focus:border-[var(--accent)] transition-colors"
                          >
                            {availableWhatIfCategories.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                            <option value="__CUSTOM__">+ New Category</option>
                          </select>
                        </div>
                      </div>

                      {isCustomCategory && (
                        <div>
                          <label className="text-[11px] font-mono text-[var(--text-muted)] block mb-1 font-medium">Custom Category Name</label>
                          <input
                            type="text"
                            value={customCategoryName}
                            onChange={(e) => {
                              setCustomCategoryName(e.target.value)
                              if (whatIfValidationMsg) setWhatIfValidationMsg(null)
                            }}
                            placeholder="e.g. Electronics, Gifts..."
                            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text)] font-mono focus:outline-none focus:border-[var(--accent)] transition-colors"
                          />
                        </div>
                      )}

                      {whatIfValidationMsg && (
                        <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 font-mono">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>{whatIfValidationMsg}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleRunSimulation}
                          disabled={whatIfLoading}
                          className="flex-1 bg-[var(--accent)] text-black font-semibold text-xs py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                        >
                          {whatIfLoading ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                          <span>Simulate</span>
                        </button>

                        {whatIfResult && (
                          <button
                            type="button"
                            onClick={handleResetSimulation}
                            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--panel)] transition-colors text-xs font-mono font-medium"
                            title="Reset simulation"
                          >
                            Reset
                          </button>
                        )}
                      </div>

                      {whatIfResult && (
                        <div className="mt-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)]/70 space-y-3.5">
                          <div className="flex items-center justify-between border-b border-[var(--border)]/60 pb-2">
                            <div>
                              <span className="text-xs font-bold text-[var(--text)] block">Simulation: Before vs After</span>
                              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                                In-memory impact of ₹{whatIfResult.purchaseAmount.toLocaleString('en-IN')} on {whatIfResult.categoryName}
                              </span>
                            </div>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                              whatIfResult.healthScoreDelta < 0
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}>
                              Health {whatIfResult.healthScoreDelta >= 0 ? '+' : ''}{whatIfResult.healthScoreDelta} pts
                            </span>
                          </div>

                          {/* Comparison Grid */}
                          <div className="space-y-2 text-xs font-mono">
                            {/* 1. Safe to Spend */}
                            <div className="p-2.5 rounded-lg bg-[var(--panel)] border border-[var(--border)]">
                              <div className="flex justify-between text-[11px] text-[var(--text-muted)] mb-1 font-medium">
                                <span>SAFE TO SPEND</span>
                                <span className={whatIfResult.safeToSpendDelta < 0 ? 'text-red-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                                  Change: {whatIfResult.safeToSpendDelta < 0 ? '-' : '+'}₹{Math.abs(whatIfResult.safeToSpendDelta).toLocaleString('en-IN')}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px]">
                                <div>
                                  <span className="text-[var(--text-muted)]">Current: </span>
                                  <span className="font-medium text-[var(--text)]">₹{whatIfResult.currentSafeToSpend.toLocaleString('en-IN')}</span>
                                </div>
                                <ArrowRight className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                                <div>
                                  <span className="text-[var(--text-muted)]">After: </span>
                                  <span className="font-bold text-emerald-400">₹{whatIfResult.simulatedSafeToSpend.toLocaleString('en-IN')}</span>
                                </div>
                              </div>
                            </div>

                            {/* 2. Daily Safe Spend */}
                            <div className="p-2.5 rounded-lg bg-[var(--panel)] border border-[var(--border)]">
                              <div className="flex justify-between text-[11px] text-[var(--text-muted)] mb-1 font-medium">
                                <span>DAILY SAFE SPEND</span>
                                <span className={whatIfResult.dailySafeSpendDelta < 0 ? 'text-red-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                                  Change: {whatIfResult.dailySafeSpendDelta < 0 ? '-' : '+'}₹{Math.abs(whatIfResult.dailySafeSpendDelta).toLocaleString('en-IN')}/d
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px]">
                                <div>
                                  <span className="text-[var(--text-muted)]">Current: </span>
                                  <span className="font-medium text-[var(--text)]">₹{whatIfResult.currentDailySafeSpend.toLocaleString('en-IN')}/d</span>
                                </div>
                                <ArrowRight className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                                <div>
                                  <span className="text-[var(--text-muted)]">After: </span>
                                  <span className="font-bold text-emerald-400">₹{whatIfResult.simulatedDailySafeSpend.toLocaleString('en-IN')}/d</span>
                                </div>
                              </div>
                            </div>

                            {/* 3. Spending Health */}
                            <div className="p-2.5 rounded-lg bg-[var(--panel)] border border-[var(--border)]">
                              <div className="flex justify-between text-[11px] text-[var(--text-muted)] mb-1 font-medium">
                                <span>SPENDING HEALTH</span>
                                <span className={whatIfResult.healthScoreDelta < 0 ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                                  Change: {whatIfResult.healthScoreDelta >= 0 ? '+' : ''}{whatIfResult.healthScoreDelta}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px]">
                                <div>
                                  <span className="text-[var(--text-muted)]">Current: </span>
                                  <span className="font-medium text-[var(--text)]">{whatIfResult.currentHealthScore}/100</span>
                                </div>
                                <ArrowRight className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                                <div>
                                  <span className="text-[var(--text-muted)]">After: </span>
                                  <span className="font-bold text-[var(--accent)]">{whatIfResult.simulatedHealthScore}/100</span>
                                </div>
                              </div>
                            </div>

                            {/* 4. Spending Pace */}
                            <div className="p-2.5 rounded-lg bg-[var(--panel)] border border-[var(--border)]">
                              <div className="text-[11px] text-[var(--text-muted)] mb-1 font-medium">SPENDING PACE</div>
                              <div className="flex items-center justify-between text-[11px]">
                                <div>
                                  <span className="text-[var(--text-muted)]">Current: </span>
                                  <span className="font-medium text-[var(--text)]">{whatIfResult.currentPaceStatus}</span>
                                </div>
                                <ArrowRight className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                                <div>
                                  <span className="text-[var(--text-muted)]">After: </span>
                                  <span className={`font-bold ${whatIfResult.simulatedPaceStatus === 'ABOVE PACE' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                    {whatIfResult.simulatedPaceStatus}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* 5. Category Spending Impact */}
                            <div className="p-2.5 rounded-lg bg-[var(--panel)] border border-[var(--border)]">
                              <div className="flex justify-between text-[11px] text-[var(--text-muted)] mb-1 font-medium">
                                <span>{whatIfResult.categoryName.toUpperCase()} SPEND</span>
                                <span className={`font-semibold ${whatIfResult.categoryExceeded ? 'text-red-400' : 'text-emerald-400'}`}>
                                  {whatIfResult.categoryExceeded ? 'EXCEEDS BASELINE' : 'WITHIN BASELINE'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px]">
                                <div>
                                  <span className="text-[var(--text-muted)]">Current: </span>
                                  <span className="font-medium text-[var(--text)]">₹{whatIfResult.categoryCurrentSpent.toLocaleString('en-IN')}</span>
                                </div>
                                <ArrowRight className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                                <div>
                                  <span className="text-[var(--text-muted)]">After: </span>
                                  <span className={`font-bold ${whatIfResult.categoryExceeded ? 'text-red-400' : 'text-[var(--text)]'}`}>
                                    ₹{whatIfResult.categorySimulatedSpent.toLocaleString('en-IN')}
                                  </span>
                                  <span className="text-[11px] text-[var(--text-muted)] font-normal ml-1">/ ₹{whatIfResult.categoryBaseline.toLocaleString('en-IN')}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-[var(--text-muted)] leading-relaxed border-t border-[var(--border)]/60 pt-2">
                            {whatIfResult.impactNarrative}
                          </p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Savings Goals Card */}
                  <section className="p-6 rounded-xl border border-[var(--border)] bg-[var(--panel)] space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold tracking-tight text-[var(--text)]">Monthly savings goal</h3>
                      <span className="text-xs font-mono text-[var(--text-muted)] font-medium">{savingsProgressPct}%</span>
                    </div>

                    <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-[var(--text)]">Target Reserve</span>
                        <span className="font-mono text-[11px] text-[var(--text-muted)]">
                          ₹{Math.max(0, remainingBalance).toLocaleString('en-IN')} / ₹{savingsGoal.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[var(--panel)] rounded-full overflow-hidden border border-[var(--border)]">
                        <div className="h-full bg-[var(--accent)] transition-all" style={{ width: `${savingsProgressPct}%` }} />
                      </div>
                      <span className="text-[11px] font-mono text-[var(--text-muted)] block pt-1 font-medium">
                        {remainingBalance >= savingsGoal
                          ? '✓ Goal achieved for this billing cycle'
                          : `₹${(savingsGoal - Math.max(0, remainingBalance)).toLocaleString('en-IN')} remaining to reach target`}
                      </span>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: TRANSACTIONS TAB */}
          {/* ============================================================ */}
          {activeTab === 'Transactions' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Transactions ledger</h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    View, filter, edit, or remove all expense records persisted in MySQL.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Category Filter dropdown */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-[var(--panel)] border border-[var(--border)] text-xs rounded-lg px-3 py-2 text-[var(--text)] focus:outline-none"
                  >
                    <option value="ALL">All Categories</option>
                    {categorySpendList.map((c) => (
                      <option key={c.category} value={c.category}>{c.category}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingTx(null)
                      setIsAddModalOpen(true)
                    }}
                    className="bg-[var(--accent)] text-black font-semibold text-xs px-3.5 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add transaction</span>
                  </button>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] overflow-hidden">
                {filteredTransactions.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <Receipt className="w-10 h-10 text-[var(--text-muted)] mx-auto opacity-40" />
                    <h3 className="text-sm font-bold text-[var(--text)]">No transactions found</h3>
                    <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                      {searchQuery || categoryFilter !== 'ALL'
                        ? 'No transactions matched your search or category filter.'
                        : 'You haven\'t recorded any expenses yet.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--border)] text-[11px] font-mono text-[var(--text-muted)] uppercase bg-[var(--bg)]/50">
                          <th className="py-3.5 px-5">Merchant / Title</th>
                          <th className="py-3.5 px-5">Category</th>
                          <th className="py-3.5 px-5">Date</th>
                          <th className="py-3.5 px-5">Notes</th>
                          <th className="py-3.5 px-5 text-right">Amount</th>
                          <th className="py-3.5 px-5 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-subtle)] text-xs">
                        {filteredTransactions.map((tx) => {
                          const icon = CATEGORY_ICONS[tx.category] || <Receipt className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                          const badgeStyle = CATEGORY_COLORS[tx.category] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'

                          return (
                            <tr key={tx.id} className="hover:bg-[var(--bg)]/40 transition-colors">
                              <td className="py-3.5 px-5 font-medium text-[var(--text)] flex items-center gap-3">
                                <div className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] shrink-0">
                                  {icon}
                                </div>
                                <span>{tx.merchant}</span>
                              </td>
                              <td className="py-3.5 px-5">
                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border ${badgeStyle}`}>
                                  {tx.category}
                                </span>
                              </td>
                              <td className="py-3.5 px-5 text-[var(--text-muted)] font-mono">
                                {tx.timestamp.slice(0, 10)}
                              </td>
                              <td className="py-3.5 px-5 text-[var(--text-muted)] max-w-xs truncate">
                                {tx.notes || '—'}
                              </td>
                              <td className="py-3.5 px-5 text-right font-mono font-semibold text-[var(--danger)]">
                                -₹{Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-3.5 px-5 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingTx(tx)
                                      setIsAddModalOpen(true)
                                    }}
                                    className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
                                    title="Edit transaction"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTransaction(tx.id)}
                                    className="p-1.5 rounded text-[var(--danger)] hover:bg-[var(--danger-bg)] transition-colors"
                                    title="Delete transaction"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: BUDGETS TAB */}
          {/* ============================================================ */}
          {activeTab === 'Budgets' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Category budgets & baselines</h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Compare your real actual spending against your baseline targets configured during setup.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categorySpendList.map((cat) => {
                  const icon = CATEGORY_ICONS[cat.category] || <Receipt className="w-4 h-4 text-[var(--accent)]" />
                  return (
                    <div key={cat.category} className="p-6 rounded-xl border border-[var(--border)] bg-[var(--panel)] space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg border border-[var(--border)] bg-[var(--bg)]">
                            {icon}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[var(--text)]">{cat.category}</h4>
                            <span className="text-[10px] font-mono text-[var(--text-muted)]">Monthly Budget</span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${cat.isOver ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                          {cat.isOver ? 'OVER BUDGET' : 'ON TRACK'}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-[var(--text-muted)]">Spent: ₹{cat.actual.toLocaleString('en-IN')}</span>
                          <span className="text-[var(--text)] font-semibold">Target: ₹{cat.baseline.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="h-2 w-full bg-[var(--bg)] rounded-full overflow-hidden border border-[var(--border)]">
                          <div
                            className={`h-full transition-all ${cat.isOver ? 'bg-[var(--danger)]' : 'bg-[var(--accent)]'}`}
                            style={{ width: `${cat.pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)] pt-1">
                          <span>{cat.pct}% utilized</span>
                          <span>
                            {cat.difference > 0
                              ? `+₹${cat.difference.toLocaleString('en-IN')} over`
                              : `₹${Math.abs(cat.difference).toLocaleString('en-IN')} remaining`}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: INSIGHTS TAB */}
          {/* ============================================================ */}
          {activeTab === 'Insights' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Rule-based financial intelligence</h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Automated checks run on your MySQL database transactions by Core Java HTTP backend.
                </p>
              </div>

              <div className="space-y-4">
                {(summaryData?.insights && summaryData.insights.length > 0) ? (
                  summaryData.insights.map((ins, i) => (
                    <div
                      key={i}
                      className={`p-6 rounded-xl border flex items-start gap-4 ${
                        ins.type === 'warning'
                          ? 'border-amber-500/20 bg-amber-500/5'
                          : 'border-[var(--accent-border)] bg-[var(--accent-bg)]'
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] shrink-0">
                        {ins.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-400" /> : <CheckCircle2 className="w-5 h-5 text-[var(--accent)]" />}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-[var(--text)]">{ins.title}</h4>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">{ins.message}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[var(--text-muted)]">Record more transactions to unlock deeper behavioral insights.</p>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 5: ACCOUNTS TAB */}
          {/* ============================================================ */}
          {activeTab === 'Accounts' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Account & architecture</h2>
                <p className="text-xs text-[var(--text-muted)]">
                  User identity and connected backend infrastructure.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--panel)] space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b border-[var(--border)]">
                  <div className="w-14 h-14 rounded-full bg-[var(--accent)] text-black font-bold text-lg flex items-center justify-center font-mono">
                    {userName ? userName.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'U'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--text)]">{userName}</h3>
                    <span className="text-xs font-mono text-[var(--text-muted)]">{userEmail || 'Local Account'}</span>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        USER ID: #{userId}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)]">
                        CURRENCY: INR (₹)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-[var(--border-subtle)]">
                    <span className="text-[var(--text-muted)]">Connected Backend Server</span>
                    <span className="font-mono text-[var(--text)]">Core Java HTTP Server (Port 8080)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[var(--border-subtle)]">
                    <span className="text-[var(--text-muted)]">Database Engine</span>
                    <span className="font-mono text-[var(--text)]">MariaDB / MySQL (Port 3306)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[var(--border-subtle)]">
                    <span className="text-[var(--text-muted)]">Database Schema</span>
                    <span className="font-mono text-[var(--text)]">expense_tracker_db</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[var(--border-subtle)]">
                    <span className="text-[var(--text-muted)]">Driver Type</span>
                    <span className="font-mono text-[var(--text)]">JDBC (mysql-connector-j)</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-[var(--text-muted)]">Mock / Fallback Status</span>
                    <span className="font-mono text-emerald-400 font-semibold">Disabled (100% Real Data)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 6: SETTINGS TAB (EDIT NAME, INCOME, SAVINGS, CATEGORIES) */}
          {/* ============================================================ */}
          {activeTab === 'Settings' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Financial profile & settings</h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Update your name, income, savings target, and category baselines. Saves directly to MySQL.
                </p>
              </div>

              {settingsFeedback && (
                <div
                  className={`p-4 rounded-xl text-xs flex items-center gap-3 border ${
                    settingsFeedback.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}
                >
                  {settingsFeedback.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{settingsFeedback.message}</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="p-6 rounded-xl border border-[var(--border)] bg-[var(--panel)] space-y-6">
                {/* 1. Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[var(--text-muted)] uppercase block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsName}
                    onChange={(e) => setSettingsName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3.5 py-2 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>

                {/* 2. Monthly Income & Savings Target */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-[var(--text-muted)] uppercase block">
                      Monthly Income (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="500"
                      value={settingsIncome}
                      onChange={(e) => setSettingsIncome(e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3.5 py-2 text-xs font-mono text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-[var(--text-muted)] uppercase block">
                      Monthly Savings Target (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="500"
                      value={settingsSavings}
                      onChange={(e) => setSettingsSavings(e.target.value)}
                      placeholder="e.g. 15000"
                      className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3.5 py-2 text-xs font-mono text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                  </div>
                </div>

                {/* 3. Category Baselines */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-[var(--text-muted)] uppercase block">
                      Category Spending Baselines (₹)
                    </label>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">Target spending caps</span>
                  </div>

                  <div className="space-y-2.5">
                    {Object.entries(settingsCategories).map(([catName, budgetVal]) => (
                      <div key={catName} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-[var(--text)] w-40 truncate">{catName}</span>
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[var(--text-muted)]">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={budgetVal}
                            onChange={(e) => {
                              const val = e.target.value
                              setSettingsCategories((prev) => ({ ...prev, [catName]: val }))
                            }}
                            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg pl-7 pr-3 py-1.5 text-xs font-mono text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCategorySetting(catName)}
                          className="p-1.5 text-[var(--danger)] hover:bg-[var(--danger-bg)] rounded transition-colors"
                          title="Remove category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Category Row */}
                  <div className="pt-3 border-t border-[var(--border-subtle)] flex gap-2">
                    <input
                      type="text"
                      placeholder="New Category Name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text)] focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Baseline (₹)"
                      value={newCategoryBaseline}
                      onChange={(e) => setNewCategoryBaseline(e.target.value)}
                      className="w-28 bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs font-mono text-[var(--text)] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategorySetting}
                      className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs font-medium hover:text-[var(--text)] transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Submit CTA */}
                <div className="pt-4 border-t border-[var(--border)] flex justify-end">
                  <button
                    type="submit"
                    disabled={settingsSaving}
                    className="bg-[var(--accent)] text-black font-semibold text-xs px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {settingsSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{settingsSaving ? 'Saving to MySQL...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>

        {/* Developer Footer */}
        <footer className="py-6 border-t border-[var(--border)] text-center text-xs font-mono text-[var(--text-muted)] w-full">
          <div>Developed by • Siddhant Surve • Yuvraj Singh • Tarak Desai • Yuvraj Tiwari</div>
        </footer>
      </div>

      {/* Floating Success Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[var(--panel)] border border-[var(--accent-border)] text-[var(--text)] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-medium animate-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[var(--accent)] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Record / Edit Expense Modal */}
      <OrderTicketModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setEditingTx(null)
        }}
        onSubmit={handleSaveTransaction}
        editingTransaction={editingTx}
        currentLiquidity={remainingBalance}
        userCategories={Object.keys(categoryBudgets)}
      />

      {/* Doraemon Full-Body Walking Finance Companion */}
      <WalkingDoraemon
        summaryData={summaryData}
        lastExpenseTitle={lastRecordedExpenseTitle}
        lastExpenseAmount={lastRecordedExpenseAmount}
        triggerCounter={companionTriggerCount}
        onOpenImpact={() => setIsImpactDrawerOpen(true)}
      />

      {/* Impact Drawer Modal */}
      <ImpactDrawer
        isOpen={isImpactDrawerOpen}
        onClose={() => setIsImpactDrawerOpen(false)}
        summaryData={summaryData}
        lastExpenseTitle={lastRecordedExpenseTitle}
        lastExpenseAmount={lastRecordedExpenseAmount}
      />
    </div>
  )
}
