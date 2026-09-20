export interface CategoryComparisonData {
  categoryName: string
  actualAmount: number
  baselineAmount: number
  difference: number
  spendingPercentage: number
  isOver: boolean
}

export interface DashboardInsightData {
  type: 'warning' | 'success' | 'info'
  title: string
  message: string
}

export interface SpendingPaceData {
  daysElapsed: number
  daysInMonth: number
  daysRemaining: number
  discretionaryCapacity: number
  remainingDiscretionaryCapacity: number
  actualSpentMonth: number
  idealPaceToday: number
  dailyAverage: number
  projectedMonthSpend: number
  safeToSpend: number
  dailySafeSpend: number
  paceStatus: 'ON TRACK' | 'ABOVE PACE' | 'UNDER PACE'
  explanation: string
}

export interface SpendingHealthData {
  score: number
  healthLabel: string
  reasons: string[]
}

export interface DashboardSummaryData {
  totalIncome: number
  totalExpenses: number
  remainingBalance: number
  savingsTarget: number
  savingsProgressPercentage: number
  categoryComparisons: CategoryComparisonData[]
  insights: DashboardInsightData[]
  spendingPace: SpendingPaceData
  spendingHealth: SpendingHealthData
}

export interface WhatIfSimulationResult {
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

export function computeDashboardSummary(
  income: number,
  savingsTarget: number,
  expenses: Array<{ category_name: string; amount: number; expense_date: string | Date }>,
  budgets: Array<{ category_name: string; baseline_amount: number }>
): DashboardSummaryData {
  const budgetMap = new Map<string, number>()
  for (const b of budgets) {
    budgetMap.set(b.category_name, Number(b.baseline_amount) || 0)
  }

  let totalExpenses = 0
  const actualMap = new Map<string, number>()

  for (const exp of expenses) {
    const amt = Number(exp.amount) || 0
    totalExpenses += amt
    const cat = exp.category_name || 'General'
    actualMap.set(cat, (actualMap.get(cat) || 0) + amt)
  }

  const remainingBalance = Number((income - totalExpenses).toFixed(2))

  const allCategories = new Set<string>([...actualMap.keys(), ...budgetMap.keys()])
  const categoryComparisons: CategoryComparisonData[] = []

  for (const cat of allCategories) {
    const actual = Number((actualMap.get(cat) || 0).toFixed(2))
    const baseline = Number((budgetMap.get(cat) ?? 3000).toFixed(2))
    const diff = Number((actual - baseline).toFixed(2))
    const isOver = diff > 0
    let pct = 0
    if (baseline > 0) {
      pct = Math.round((actual / baseline) * 1000) / 10
    }
    categoryComparisons.push({
      categoryName: cat,
      actualAmount: actual,
      baselineAmount: baseline,
      difference: diff,
      spendingPercentage: pct,
      isOver,
    })
  }

  categoryComparisons.sort((a, b) => b.actualAmount - a.actualAmount)

  let savingsProgressPct = 0
  if (savingsTarget > 0) {
    const progressRatio = Math.max(0, remainingBalance) / savingsTarget
    savingsProgressPct = Math.min(Math.round(progressRatio * 1000) / 10, 100)
  }

  const today = new Date()
  const daysElapsed = today.getDate()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const daysRemaining = Math.max(1, daysInMonth - daysElapsed + 1)

  const discretionaryCapacity = Math.max(0, Number((income - savingsTarget).toFixed(2)))
  const actualSpentMonth = Number(totalExpenses.toFixed(2))
  const remainingDiscretionaryCapacity = Number((discretionaryCapacity - actualSpentMonth).toFixed(2))

  const idealPaceToday = Number(((discretionaryCapacity * daysElapsed) / daysInMonth).toFixed(2))
  const dailyAverage = daysElapsed > 0 ? Number((actualSpentMonth / daysElapsed).toFixed(2)) : 0
  const projectedMonthSpend = Number((dailyAverage * daysInMonth).toFixed(2))
  const safeToSpend = Math.max(0, Number((discretionaryCapacity - actualSpentMonth).toFixed(2)))

  const upperPaceThreshold = idealPaceToday * 1.05
  const lowerPaceThreshold = idealPaceToday * 0.9

  let paceStatus: 'ON TRACK' | 'ABOVE PACE' | 'UNDER PACE' = 'ON TRACK'
  if (actualSpentMonth > upperPaceThreshold) {
    paceStatus = 'ABOVE PACE'
  } else if (actualSpentMonth < lowerPaceThreshold) {
    paceStatus = 'UNDER PACE'
  }

  const dailySafeSpend = daysRemaining > 0 && safeToSpend > 0 ? Number((safeToSpend / daysRemaining).toFixed(2)) : 0

  const explanation = `At Day ${daysElapsed} of ${daysInMonth}, you've spent ₹${actualSpentMonth} out of your ₹${discretionaryCapacity} monthly discretionary capacity. Your ideal pace today is ₹${idealPaceToday}. Based on your current daily burn rate (₹${dailyAverage}/day), your projected month-end total is ₹${projectedMonthSpend}, leaving ₹${safeToSpend} safe to spend.`

  const spendingPace: SpendingPaceData = {
    daysElapsed,
    daysInMonth,
    daysRemaining,
    discretionaryCapacity,
    remainingDiscretionaryCapacity,
    actualSpentMonth,
    idealPaceToday,
    dailyAverage,
    projectedMonthSpend,
    safeToSpend,
    dailySafeSpend,
    paceStatus,
    explanation,
  }

  const capacityUsageRatio = discretionaryCapacity > 0 ? actualSpentMonth / discretionaryCapacity : actualSpentMonth > 0 ? 1 : 0
  const expectedRatioToday = daysElapsed / daysInMonth

  let capacityScore = 40.0
  if (capacityUsageRatio > expectedRatioToday) {
    const overRatio = capacityUsageRatio - expectedRatioToday
    capacityScore = Math.max(0, 40.0 - overRatio * 50.0)
  }

  const overCount = categoryComparisons.filter((c) => c.isOver).length
  const totalCats = categoryComparisons.length
  let categoryScore = 30.0
  if (totalCats > 0 && overCount > 0) {
    categoryScore = Math.max(0, 30.0 * (1.0 - overCount / totalCats))
  }

  const savingsScore = 30.0 * (savingsProgressPct / 100.0)
  const totalHealthScore = Math.min(100, Math.max(0, Math.round(capacityScore + categoryScore + savingsScore)))

  let healthLabel = 'Optimal pace'
  if (totalHealthScore >= 85) {
    healthLabel = 'Optimal pace'
  } else if (totalHealthScore >= 70) {
    healthLabel = 'Healthy pace'
  } else if (totalHealthScore >= 50) {
    healthLabel = 'Watch pace'
  } else {
    healthLabel = 'High spend pace'
  }

  const healthReasons: string[] = [
    `${Math.min(100, Math.round(capacityUsageRatio * 100))}% of monthly discretionary capacity used so far (₹${actualSpentMonth} / ₹${discretionaryCapacity})`,
    `${overCount} of ${totalCats} categories currently exceeding planned baseline`,
    `Savings target progress currently at ${savingsProgressPct}%`,
    `Projected month-end spend is ₹${projectedMonthSpend} vs ₹${discretionaryCapacity} discretionary capacity`,
  ]

  const spendingHealth: SpendingHealthData = {
    score: totalHealthScore,
    healthLabel,
    reasons: healthReasons,
  }

  const insights: DashboardInsightData[] = []
  const overbudgetCat = categoryComparisons.find((c) => c.isOver)
  if (overbudgetCat) {
    const pctOver = Math.round(overbudgetCat.spendingPercentage - 100)
    insights.push({
      type: 'warning',
      title: 'Category Budget Alert',
      message: `${overbudgetCat.categoryName} spending is ${pctOver > 0 ? pctOver + '% ' : ''}above your planned baseline (₹${overbudgetCat.actualAmount} vs ₹${overbudgetCat.baselineAmount} target).`,
    })
  } else {
    insights.push({
      type: 'success',
      title: 'Category Pacing Optimal',
      message: 'All spending categories are currently within your target setup baselines.',
    })
  }

  if (income > 0) {
    const burnRatePct = (totalExpenses / income) * 100
    if (burnRatePct > 80) {
      insights.push({
        type: 'warning',
        title: 'High Burn Rate Warning',
        message: `You have spent ${Math.round(burnRatePct)}% of your monthly income. Consider slowing discretionary purchases.`,
      })
    } else {
      insights.push({
        type: 'success',
        title: 'Spending Pace Normal',
        message: `Your overall income burn rate is at ${Math.round(burnRatePct)}%, leaving healthy liquidity.`,
      })
    }
  }

  if (remainingBalance >= savingsTarget) {
    insights.push({
      type: 'success',
      title: 'Savings Goal Achieved',
      message: `Your remaining balance (₹${remainingBalance}) meets your monthly savings goal of ₹${savingsTarget}.`,
    })
  } else {
    const gap = Number((savingsTarget - Math.max(0, remainingBalance)).toFixed(2))
    insights.push({
      type: 'info',
      title: 'Savings Target Projection',
      message: `You are ₹${gap} away from meeting your monthly savings goal of ₹${savingsTarget}.`,
    })
  }

  return {
    totalIncome: Number(income.toFixed(2)),
    totalExpenses: Number(totalExpenses.toFixed(2)),
    remainingBalance: Number(remainingBalance.toFixed(2)),
    savingsTarget: Number(savingsTarget.toFixed(2)),
    savingsProgressPercentage: savingsProgressPct,
    categoryComparisons,
    insights,
    spendingPace,
    spendingHealth,
  }
}

export function computeWhatIfSimulation(
  income: number,
  savingsTarget: number,
  currentExpenses: Array<{ category_name: string; amount: number; expense_date: string | Date }>,
  budgets: Array<{ category_name: string; baseline_amount: number }>,
  purchaseAmount: number,
  categoryName: string
): WhatIfSimulationResult {
  const currentSummary = computeDashboardSummary(income, savingsTarget, currentExpenses, budgets)

  const simulatedExpenses = [
    ...currentExpenses,
    {
      category_name: categoryName,
      amount: purchaseAmount,
      expense_date: new Date().toISOString().split('T')[0],
    },
  ]

  const simulatedSummary = computeDashboardSummary(income, savingsTarget, simulatedExpenses, budgets)

  const today = new Date()
  const daysElapsed = today.getDate()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const daysRemaining = Math.max(1, daysInMonth - daysElapsed + 1)

  const currentSafeToSpend = currentSummary.spendingPace.safeToSpend
  const simulatedSafeToSpend = simulatedSummary.spendingPace.safeToSpend
  const safeToSpendDelta = Number((simulatedSafeToSpend - currentSafeToSpend).toFixed(2))

  const currentDailySafeSpend = currentSummary.spendingPace.dailySafeSpend
  const simulatedDailySafeSpend = simulatedSummary.spendingPace.dailySafeSpend
  const dailySafeSpendDelta = Number((simulatedDailySafeSpend - currentDailySafeSpend).toFixed(2))

  const currentHealthScore = currentSummary.spendingHealth.score
  const simulatedHealthScore = simulatedSummary.spendingHealth.score
  const healthScoreDelta = simulatedHealthScore - currentHealthScore

  const budgetMap = new Map<string, number>()
  for (const b of budgets) {
    budgetMap.set(b.category_name, Number(b.baseline_amount) || 0)
  }

  let catCurrentSpent = 0
  for (const exp of currentExpenses) {
    if (exp.category_name === categoryName) {
      catCurrentSpent += Number(exp.amount) || 0
    }
  }

  const categoryBaseline = Number((budgetMap.get(categoryName) ?? 3000).toFixed(2))
  const categoryCurrentSpent = Number(catCurrentSpent.toFixed(2))
  const categorySimulatedSpent = Number((categoryCurrentSpent + purchaseAmount).toFixed(2))
  const categoryExceeded = categorySimulatedSpent > categoryBaseline

  let narrative = `If you spend ₹${purchaseAmount} on ${categoryName}: `
  if (categoryExceeded) {
    narrative += `It will push your ${categoryName} category budget over its baseline (₹${categorySimulatedSpent} vs ₹${categoryBaseline} limit). `
  } else {
    narrative += `Your ${categoryName} spending remains within baseline target (₹${categorySimulatedSpent} / ₹${categoryBaseline}). `
  }

  if (healthScoreDelta < 0) {
    narrative += `Your Spending Health score drops by ${Math.abs(healthScoreDelta)} points (from ${currentHealthScore} to ${simulatedHealthScore}, '${simulatedSummary.spendingHealth.healthLabel}'). `
  } else {
    narrative += `Your Spending Health score remains '${simulatedSummary.spendingHealth.healthLabel}' (${simulatedHealthScore}/100). `
  }

  narrative += `Daily safe allowance changes from ₹${currentDailySafeSpend}/day to ₹${simulatedDailySafeSpend}/day for the remaining ${daysRemaining} days of the month.`

  return {
    purchaseAmount,
    categoryName,
    currentSafeToSpend,
    simulatedSafeToSpend,
    safeToSpendDelta,
    currentDailySafeSpend,
    simulatedDailySafeSpend,
    dailySafeSpendDelta,
    currentPaceStatus: currentSummary.spendingPace.paceStatus,
    simulatedPaceStatus: simulatedSummary.spendingPace.paceStatus,
    currentProjectedSpend: currentSummary.spendingPace.projectedMonthSpend,
    simulatedProjectedSpend: simulatedSummary.spendingPace.projectedMonthSpend,
    currentHealthScore,
    simulatedHealthScore,
    healthScoreDelta,
    currentHealthLabel: currentSummary.spendingHealth.healthLabel,
    simulatedHealthLabel: simulatedSummary.spendingHealth.healthLabel,
    categoryCurrentSpent,
    categoryBaseline,
    categorySimulatedSpent,
    categoryExceeded,
    impactNarrative: narrative,
  }
}
