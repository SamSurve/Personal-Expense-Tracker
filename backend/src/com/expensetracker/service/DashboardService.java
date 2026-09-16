package com.expensetracker.service;

import com.expensetracker.dao.BudgetDAO;
import com.expensetracker.dao.ExpenseDAO;
import com.expensetracker.dao.SpendingProfileDAO;
import com.expensetracker.dao.impl.BudgetDAOImpl;
import com.expensetracker.dao.impl.ExpenseDAOImpl;
import com.expensetracker.dao.impl.SpendingProfileDAOImpl;
import com.expensetracker.model.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

public class DashboardService {

    private final SpendingProfileDAO profileDAO;
    private final BudgetDAO budgetDAO;
    private final ExpenseDAO expenseDAO;

    public DashboardService() {
        this.profileDAO = new SpendingProfileDAOImpl();
        this.budgetDAO = new BudgetDAOImpl();
        this.expenseDAO = new ExpenseDAOImpl();
    }

    public DashboardService(SpendingProfileDAO profileDAO, BudgetDAO budgetDAO, ExpenseDAO expenseDAO) {
        this.profileDAO = profileDAO;
        this.budgetDAO = budgetDAO;
        this.expenseDAO = expenseDAO;
    }

    public DashboardSummary getDashboardSummary(int userId) {
        // 1. Fetch User Spending Profile (Income & Savings Target)
        Optional<SpendingProfile> profileOpt = profileDAO.getProfileByUserId(userId);
        BigDecimal totalIncome = profileOpt.map(SpendingProfile::getMonthlyIncome).orElse(new BigDecimal("50000"));
        BigDecimal savingsTarget = profileOpt.map(SpendingProfile::getSavingsTarget).orElse(new BigDecimal("15000"));

        // 2. Fetch User Expenses & Budgets
        List<Expense> expenses = expenseDAO.getExpensesByUserId(userId);
        List<Budget> budgets = budgetDAO.getBudgetsByUserId(userId);

        Map<String, BigDecimal> budgetMap = new HashMap<>();
        for (Budget b : budgets) {
            budgetMap.put(b.getCategoryName(), b.getBaselineAmount());
        }

        // 3. Compute Category Totals & Overall Total Expenses
        BigDecimal totalExpenses = BigDecimal.ZERO;
        Map<String, BigDecimal> actualMap = new HashMap<>();

        for (Expense exp : expenses) {
            BigDecimal amt = exp.getAmount() != null ? exp.getAmount() : BigDecimal.ZERO;
            totalExpenses = totalExpenses.add(amt);

            String cat = exp.getCategoryName();
            actualMap.put(cat, actualMap.getOrDefault(cat, BigDecimal.ZERO).add(amt));
        }

        BigDecimal remainingBalance = totalIncome.subtract(totalExpenses);

        // 4. Calculate Category Comparisons
        Set<String> allCategories = new HashSet<>(actualMap.keySet());
        allCategories.addAll(budgetMap.keySet());

        List<CategoryComparison> categoryComparisons = new ArrayList<>();
        for (String cat : allCategories) {
            BigDecimal actual = actualMap.getOrDefault(cat, BigDecimal.ZERO);
            BigDecimal baseline = budgetMap.getOrDefault(cat, new BigDecimal("3000"));
            BigDecimal diff = actual.subtract(baseline);
            boolean isOver = diff.compareTo(BigDecimal.ZERO) > 0;

            double pct = 0.0;
            if (baseline.compareTo(BigDecimal.ZERO) > 0) {
                pct = actual.divide(baseline, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
            }

            categoryComparisons.add(new CategoryComparison(cat, actual, baseline, diff, Math.round(pct * 10.0) / 10.0, isOver));
        }

        // Sort by actual spending descending
        categoryComparisons.sort((a, b) -> b.getActualAmount().compareTo(a.getActualAmount()));

        // 5. Calculate Savings Goal Progress Percentage
        double savingsProgressPct = 0.0;
        if (savingsTarget.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal progressRatio = remainingBalance.max(BigDecimal.ZERO).divide(savingsTarget, 4, RoundingMode.HALF_UP);
            savingsProgressPct = Math.min(Math.round(progressRatio.doubleValue() * 1000.0) / 10.0, 100.0);
        }

        // 6. Calculate Feature 1 — Personal Spending Pace & Month-End Forecast
        LocalDate today = LocalDate.now();
        int daysElapsed = today.getDayOfMonth();
        int daysInMonth = today.lengthOfMonth();
        BigDecimal discretionaryCapacity = totalIncome.subtract(savingsTarget).max(BigDecimal.ZERO);
        BigDecimal actualSpentMonth = totalExpenses;
        BigDecimal idealPaceToday = discretionaryCapacity.multiply(new BigDecimal(daysElapsed))
                .divide(new BigDecimal(daysInMonth), 2, RoundingMode.HALF_UP);
        BigDecimal dailyAverage = daysElapsed > 0
                ? actualSpentMonth.divide(new BigDecimal(daysElapsed), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        BigDecimal projectedMonthSpend = dailyAverage.multiply(new BigDecimal(daysInMonth))
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal safeToSpend = discretionaryCapacity.subtract(actualSpentMonth).max(BigDecimal.ZERO);

        String paceStatus;
        BigDecimal upperPaceThreshold = idealPaceToday.multiply(new BigDecimal("1.05"));
        BigDecimal lowerPaceThreshold = idealPaceToday.multiply(new BigDecimal("0.90"));
        if (actualSpentMonth.compareTo(upperPaceThreshold) > 0) {
            paceStatus = "ABOVE PACE";
        } else if (actualSpentMonth.compareTo(lowerPaceThreshold) < 0) {
            paceStatus = "UNDER PACE";
        } else {
            paceStatus = "ON TRACK";
        }

        String paceExplanation = String.format(
            "At Day %d of %d, you've spent ₹%s out of your ₹%s monthly discretionary capacity. Your ideal pace today is ₹%s. Based on your current daily burn rate (₹%s/day), your projected month-end total is ₹%s, leaving ₹%s safe to spend.",
            daysElapsed, daysInMonth, actualSpentMonth, discretionaryCapacity, idealPaceToday, dailyAverage, projectedMonthSpend, safeToSpend
        );

        SpendingPace spendingPace = new SpendingPace(
            daysElapsed, daysInMonth, discretionaryCapacity, actualSpentMonth,
            idealPaceToday, dailyAverage, projectedMonthSpend, safeToSpend,
            paceStatus, paceExplanation
        );

        // 7. Calculate Feature 2 — Explainable Spending Health
        double capacityUsageRatio = discretionaryCapacity.compareTo(BigDecimal.ZERO) > 0
                ? actualSpentMonth.divide(discretionaryCapacity, 4, RoundingMode.HALF_UP).doubleValue()
                : (actualSpentMonth.compareTo(BigDecimal.ZERO) > 0 ? 1.0 : 0.0);
        double expectedRatioToday = (double) daysElapsed / (double) daysInMonth;

        double capacityScore = 40.0;
        if (capacityUsageRatio > expectedRatioToday) {
            double overRatio = capacityUsageRatio - expectedRatioToday;
            capacityScore = Math.max(0.0, 40.0 - (overRatio * 50.0));
        }

        long overCount = categoryComparisons.stream().filter(CategoryComparison::isOver).count();
        int totalCats = categoryComparisons.size();
        double categoryScore = 30.0;
        if (totalCats > 0 && overCount > 0) {
            categoryScore = Math.max(0.0, 30.0 * (1.0 - ((double) overCount / (double) totalCats)));
        }

        double savingsScore = 30.0 * (savingsProgressPct / 100.0);

        int totalHealthScore = Math.min(100, Math.max(0, (int) Math.round(capacityScore + categoryScore + savingsScore)));

        String healthLabel;
        if (totalHealthScore >= 85) {
            healthLabel = "Optimal pace";
        } else if (totalHealthScore >= 70) {
            healthLabel = "Healthy pace";
        } else if (totalHealthScore >= 50) {
            healthLabel = "Watch pace";
        } else {
            healthLabel = "High spend pace";
        }

        List<String> healthReasons = new ArrayList<>();
        healthReasons.add(String.format("%.0f%% of monthly discretionary capacity used so far (₹%s / ₹%s)", Math.min(100.0, capacityUsageRatio * 100.0), actualSpentMonth, discretionaryCapacity));
        healthReasons.add(String.format("%d of %d categories currently exceeding planned baseline", overCount, totalCats));
        healthReasons.add(String.format("Savings target progress currently at %.1f%%", savingsProgressPct));
        healthReasons.add(String.format("Projected month-end spend is ₹%s vs ₹%s discretionary capacity", projectedMonthSpend, discretionaryCapacity));

        SpendingHealth spendingHealth = new SpendingHealth(totalHealthScore, healthLabel, healthReasons);

        // 8. Generate Rule-Based Smart Insights
        List<DashboardInsight> insights = generateRuleBasedInsights(totalIncome, totalExpenses, remainingBalance, savingsTarget, categoryComparisons);

        return new DashboardSummary(
            totalIncome,
            totalExpenses,
            remainingBalance,
            savingsTarget,
            savingsProgressPct,
            categoryComparisons,
            insights,
            spendingPace,
            spendingHealth
        );
    }

    private List<DashboardInsight> generateRuleBasedInsights(
            BigDecimal totalIncome,
            BigDecimal totalExpenses,
            BigDecimal remainingBalance,
            BigDecimal savingsTarget,
            List<CategoryComparison> categoryComparisons) {

        List<DashboardInsight> insights = new ArrayList<>();

        // Rule 1: Category Overspending Alert
        Optional<CategoryComparison> overbudgetCat = categoryComparisons.stream().filter(CategoryComparison::isOver).findFirst();
        if (overbudgetCat.isPresent()) {
            CategoryComparison cat = overbudgetCat.get();
            long pctOver = Math.round(cat.getSpendingPercentage() - 100);
            insights.add(new DashboardInsight(
                "warning",
                "Category Budget Alert",
                cat.getCategoryName() + " spending is " + (pctOver > 0 ? pctOver + "%" : "") + " above your planned baseline (₹" + cat.getActualAmount() + " vs ₹" + cat.getBaselineAmount() + " target)."
            ));
        } else {
            insights.add(new DashboardInsight(
                "success",
                "Category Pacing Optimal",
                "All spending categories are currently within your target setup baselines."
            ));
        }

        // Rule 2: Overall Income Burn Rate Warning
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            double burnRatePct = totalExpenses.divide(totalIncome, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
            if (burnRatePct > 80.0) {
                insights.add(new DashboardInsight(
                    "warning",
                    "High Burn Rate Warning",
                    "You have spent " + Math.round(burnRatePct) + "% of your monthly income. Consider slowing discretionary purchases."
                ));
            } else {
                insights.add(new DashboardInsight(
                    "success",
                    "Spending Pace Normal",
                    "Your overall income burn rate is at " + Math.round(burnRatePct) + "%, leaving healthy liquidity."
                ));
            }
        }

        // Rule 3: Savings Target Comparison
        if (remainingBalance.compareTo(savingsTarget) >= 0) {
            insights.add(new DashboardInsight(
                "success",
                "Savings Goal Achieved",
                "Your remaining balance (₹" + remainingBalance + ") meets your monthly savings goal of ₹" + savingsTarget + "."
            ));
        } else {
            BigDecimal gap = savingsTarget.subtract(remainingBalance.max(BigDecimal.ZERO));
            insights.add(new DashboardInsight(
                "info",
                "Savings Target Projection",
                "You are ₹" + gap + " away from meeting your monthly savings goal of ₹" + savingsTarget + "."
            ));
        }

        return insights;
    }

    public WhatIfSimulation simulatePurchase(int userId, BigDecimal purchaseAmount, String categoryName) {
        DashboardSummary currentSummary = getDashboardSummary(userId);

        Optional<SpendingProfile> profileOpt = profileDAO.getProfileByUserId(userId);
        BigDecimal totalIncome = profileOpt.map(SpendingProfile::getMonthlyIncome).orElse(new BigDecimal("50000"));
        BigDecimal savingsTarget = profileOpt.map(SpendingProfile::getSavingsTarget).orElse(new BigDecimal("15000"));
        List<Expense> expenses = expenseDAO.getExpensesByUserId(userId);
        List<Budget> budgets = budgetDAO.getBudgetsByUserId(userId);

        List<Expense> simExpenses = new ArrayList<>(expenses);
        Expense simExpense = new Expense(userId, "Simulated Purchase", categoryName, purchaseAmount, new java.sql.Date(System.currentTimeMillis()), "Simulation");
        simExpenses.add(simExpense);

        Map<String, BigDecimal> budgetMap = new HashMap<>();
        for (Budget b : budgets) {
            budgetMap.put(b.getCategoryName(), b.getBaselineAmount());
        }

        BigDecimal simTotalExpenses = BigDecimal.ZERO;
        Map<String, BigDecimal> simActualMap = new HashMap<>();

        for (Expense exp : simExpenses) {
            BigDecimal amt = exp.getAmount() != null ? exp.getAmount() : BigDecimal.ZERO;
            simTotalExpenses = simTotalExpenses.add(amt);
            String cat = exp.getCategoryName();
            simActualMap.put(cat, simActualMap.getOrDefault(cat, BigDecimal.ZERO).add(amt));
        }

        BigDecimal simRemainingBalance = totalIncome.subtract(simTotalExpenses);

        Set<String> allCategories = new HashSet<>(simActualMap.keySet());
        allCategories.addAll(budgetMap.keySet());

        List<CategoryComparison> simCategoryComparisons = new ArrayList<>();
        for (String cat : allCategories) {
            BigDecimal actual = simActualMap.getOrDefault(cat, BigDecimal.ZERO);
            BigDecimal baseline = budgetMap.getOrDefault(cat, new BigDecimal("3000"));
            BigDecimal diff = actual.subtract(baseline);
            boolean isOver = diff.compareTo(BigDecimal.ZERO) > 0;
            double pct = 0.0;
            if (baseline.compareTo(BigDecimal.ZERO) > 0) {
                pct = actual.divide(baseline, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
            }
            simCategoryComparisons.add(new CategoryComparison(cat, actual, baseline, diff, Math.round(pct * 10.0) / 10.0, isOver));
        }

        double simSavingsProgressPct = 0.0;
        if (savingsTarget.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal progressRatio = simRemainingBalance.max(BigDecimal.ZERO).divide(savingsTarget, 4, RoundingMode.HALF_UP);
            simSavingsProgressPct = Math.min(Math.round(progressRatio.doubleValue() * 1000.0) / 10.0, 100.0);
        }

        LocalDate today = LocalDate.now();
        int daysElapsed = today.getDayOfMonth();
        int daysInMonth = today.lengthOfMonth();
        int daysRemaining = Math.max(1, daysInMonth - daysElapsed + 1);
        BigDecimal discretionaryCapacity = totalIncome.subtract(savingsTarget).max(BigDecimal.ZERO);
        BigDecimal simActualSpentMonth = simTotalExpenses;
        BigDecimal idealPaceToday = discretionaryCapacity.multiply(new BigDecimal(daysElapsed))
                .divide(new BigDecimal(daysInMonth), 2, RoundingMode.HALF_UP);
        BigDecimal simDailyAverage = daysElapsed > 0
                ? simActualSpentMonth.divide(new BigDecimal(daysElapsed), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        BigDecimal simProjectedMonthSpend = simDailyAverage.multiply(new BigDecimal(daysInMonth))
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal simSafeToSpend = discretionaryCapacity.subtract(simActualSpentMonth).max(BigDecimal.ZERO);

        String simPaceStatus;
        BigDecimal upperPaceThreshold = idealPaceToday.multiply(new BigDecimal("1.05"));
        BigDecimal lowerPaceThreshold = idealPaceToday.multiply(new BigDecimal("0.90"));
        if (simActualSpentMonth.compareTo(upperPaceThreshold) > 0) {
            simPaceStatus = "ABOVE PACE";
        } else if (simActualSpentMonth.compareTo(lowerPaceThreshold) < 0) {
            simPaceStatus = "UNDER PACE";
        } else {
            simPaceStatus = "ON TRACK";
        }

        SpendingPace currentPace = currentSummary.getSpendingPace();
        SpendingHealth currentHealth = currentSummary.getSpendingHealth();

        double simCapacityUsageRatio = discretionaryCapacity.compareTo(BigDecimal.ZERO) > 0
                ? simActualSpentMonth.divide(discretionaryCapacity, 4, RoundingMode.HALF_UP).doubleValue()
                : (simActualSpentMonth.compareTo(BigDecimal.ZERO) > 0 ? 1.0 : 0.0);
        double expectedRatioToday = (double) daysElapsed / (double) daysInMonth;

        double simCapacityScore = 40.0;
        if (simCapacityUsageRatio > expectedRatioToday) {
            double overRatio = simCapacityUsageRatio - expectedRatioToday;
            simCapacityScore = Math.max(0.0, 40.0 - (overRatio * 50.0));
        }

        long simOverCount = simCategoryComparisons.stream().filter(CategoryComparison::isOver).count();
        int simTotalCats = simCategoryComparisons.size();
        double simCategoryScore = 30.0;
        if (simTotalCats > 0 && simOverCount > 0) {
            simCategoryScore = Math.max(0.0, 30.0 * (1.0 - ((double) simOverCount / (double) simTotalCats)));
        }

        double simSavingsScore = 30.0 * (simSavingsProgressPct / 100.0);
        int simTotalHealthScore = Math.min(100, Math.max(0, (int) Math.round(simCapacityScore + simCategoryScore + simSavingsScore)));

        String simHealthLabel;
        if (simTotalHealthScore >= 85) {
            simHealthLabel = "Optimal pace";
        } else if (simTotalHealthScore >= 70) {
            simHealthLabel = "Healthy pace";
        } else if (simTotalHealthScore >= 50) {
            simHealthLabel = "Watch pace";
        } else {
            simHealthLabel = "High spend pace";
        }

        BigDecimal simDailySafeSpend = daysRemaining > 0 && simSafeToSpend.compareTo(BigDecimal.ZERO) > 0
                ? simSafeToSpend.divide(new BigDecimal(daysRemaining), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        WhatIfSimulation sim = new WhatIfSimulation();
        sim.setPurchaseAmount(purchaseAmount);
        sim.setCategoryName(categoryName);

        sim.setCurrentSafeToSpend(currentPace != null ? currentPace.getSafeToSpend() : BigDecimal.ZERO);
        sim.setSimulatedSafeToSpend(simSafeToSpend);
        sim.setSafeToSpendDelta(simSafeToSpend.subtract(sim.getCurrentSafeToSpend()));

        sim.setCurrentDailySafeSpend(currentPace != null ? currentPace.getDailySafeSpend() : BigDecimal.ZERO);
        sim.setSimulatedDailySafeSpend(simDailySafeSpend);
        sim.setDailySafeSpendDelta(simDailySafeSpend.subtract(sim.getCurrentDailySafeSpend()));

        sim.setCurrentPaceStatus(currentPace != null ? currentPace.getPaceStatus() : "ON TRACK");
        sim.setSimulatedPaceStatus(simPaceStatus);

        sim.setCurrentProjectedSpend(currentPace != null ? currentPace.getProjectedMonthSpend() : BigDecimal.ZERO);
        sim.setSimulatedProjectedSpend(simProjectedMonthSpend);

        sim.setCurrentHealthScore(currentHealth != null ? currentHealth.getScore() : 100);
        sim.setSimulatedHealthScore(simTotalHealthScore);
        sim.setHealthScoreDelta(simTotalHealthScore - sim.getCurrentHealthScore());

        sim.setCurrentHealthLabel(currentHealth != null ? currentHealth.getHealthLabel() : "Optimal pace");
        sim.setSimulatedHealthLabel(simHealthLabel);

        BigDecimal catCurrent = simActualMap.getOrDefault(categoryName, BigDecimal.ZERO).subtract(purchaseAmount);
        BigDecimal catBaseline = budgetMap.getOrDefault(categoryName, new BigDecimal("3000"));
        BigDecimal catSim = catCurrent.add(purchaseAmount);
        sim.setCategoryCurrentSpent(catCurrent);
        sim.setCategoryBaseline(catBaseline);
        sim.setCategorySimulatedSpent(catSim);
        sim.setCategoryExceeded(catSim.compareTo(catBaseline) > 0);

        StringBuilder narrative = new StringBuilder();
        narrative.append(String.format("If you spend ₹%s on %s: ", purchaseAmount, categoryName));
        if (sim.isCategoryExceeded()) {
            narrative.append(String.format("It will push your %s category budget over its baseline (₹%s vs ₹%s limit). ", categoryName, catSim, catBaseline));
        } else {
            narrative.append(String.format("Your %s spending remains within baseline target (₹%s / ₹%s). ", categoryName, catSim, catBaseline));
        }
        if (sim.getHealthScoreDelta() < 0) {
            narrative.append(String.format("Your Spending Health score drops by %d points (from %d to %d, '%s'). ", Math.abs(sim.getHealthScoreDelta()), sim.getCurrentHealthScore(), sim.getSimulatedHealthScore(), sim.getSimulatedHealthLabel()));
        } else {
            narrative.append(String.format("Your Spending Health score remains '%s' (%d/100). ", sim.getSimulatedHealthLabel(), sim.getSimulatedHealthScore()));
        }
        narrative.append(String.format("Daily safe allowance changes from ₹%s/day to ₹%s/day for the remaining %d days of the month.", sim.getCurrentDailySafeSpend(), sim.getSimulatedDailySafeSpend(), daysRemaining));

        sim.setImpactNarrative(narrative.toString());

        return sim;
    }
}
