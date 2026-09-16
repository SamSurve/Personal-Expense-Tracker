package com.expensetracker;

import com.expensetracker.model.*;
import com.expensetracker.service.*;

import java.math.BigDecimal;
import java.sql.Date;
import java.util.HashMap;
import java.util.Map;

public class MainTest {

    public static void main(String[] args) {
        System.out.println("====================================================");
        System.out.println("  Personal Expense Tracker — Core Java API & Telemetry");
        System.out.println("====================================================");

        AuthService authService = new AuthService();
        OnboardingService onboardingService = new OnboardingService();
        ExpenseService expenseService = new ExpenseService();
        DashboardService dashboardService = new DashboardService();

        // 1. Setup User & Profile
        AuthResult auth = authService.signup("Alexander Vance", "alex.vance@example.com", "secure123");
        int userId = (auth.getUser() != null) ? auth.getUser().getUserId() : 1;

        Map<String, BigDecimal> baselines = new HashMap<>();
        baselines.put("Food & Dining", new BigDecimal("5000"));
        baselines.put("Travel & Transport", new BigDecimal("2000"));
        onboardingService.saveOnboardingProfile(userId, new BigDecimal("50000"), new BigDecimal("15000"), baselines);

        // 2. Add Test Expenses
        Date today = new Date(System.currentTimeMillis());
        expenseService.addExpense(userId, "Whole Foods Market", "Food & Dining", new BigDecimal("5800.00"), today, "Overbudget test");
        expenseService.addExpense(userId, "Metro Transit Pass", "Travel & Transport", new BigDecimal("1800.00"), today, "Subway pass");

        // 3. Test Dashboard Telemetry & Rule-Based Smart Insights
        System.out.println("\n[1] Testing Dashboard Summary Telemetry...");
        DashboardSummary summary = dashboardService.getDashboardSummary(userId);
        System.out.println("  -> Total Income: ₹" + summary.getTotalIncome());
        System.out.println("  -> Total Expenses: ₹" + summary.getTotalExpenses());
        System.out.println("  -> Remaining Balance: ₹" + summary.getRemainingBalance());
        System.out.println("  -> Savings Target: ₹" + summary.getSavingsTarget());
        System.out.println("  -> Savings Progress Pct: " + summary.getSavingsProgressPercentage() + "%");

        System.out.println("\n[2] Testing Category Comparison Calculations...");
        for (CategoryComparison cat : summary.getCategoryComparisons()) {
            System.out.println("  -> " + cat.getCategoryName() + ": Actual ₹" + cat.getActualAmount() + " vs Target ₹" + cat.getBaselineAmount() + " (Over budget: " + cat.isOver() + ")");
        }

        System.out.println("\n[3] Testing Rule-Based Smart Insights Engine...");
        for (DashboardInsight insight : summary.getInsights()) {
            System.out.println("  -> [" + insight.getType().toUpperCase() + "] " + insight.getTitle() + ": " + insight.getMessage());
        }

        System.out.println("\n====================================================");
        System.out.println(" Core Java Backend Engine & HTTP Server Ready!");
        System.out.println("====================================================");
    }
}
