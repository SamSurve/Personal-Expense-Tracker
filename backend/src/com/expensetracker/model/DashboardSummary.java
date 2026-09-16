package com.expensetracker.model;

import java.math.BigDecimal;
import java.util.List;

public class DashboardSummary {
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal remainingBalance;
    private BigDecimal savingsTarget;
    private double savingsProgressPercentage;
    private List<CategoryComparison> categoryComparisons;
    private List<DashboardInsight> insights;
    private SpendingPace spendingPace;
    private SpendingHealth spendingHealth;

    public DashboardSummary() {}

    public DashboardSummary(BigDecimal totalIncome, BigDecimal totalExpenses, BigDecimal remainingBalance, BigDecimal savingsTarget, double savingsProgressPercentage, List<CategoryComparison> categoryComparisons, List<DashboardInsight> insights) {
        this.totalIncome = totalIncome;
        this.totalExpenses = totalExpenses;
        this.remainingBalance = remainingBalance;
        this.savingsTarget = savingsTarget;
        this.savingsProgressPercentage = savingsProgressPercentage;
        this.categoryComparisons = categoryComparisons;
        this.insights = insights;
    }

    public DashboardSummary(BigDecimal totalIncome, BigDecimal totalExpenses, BigDecimal remainingBalance, BigDecimal savingsTarget, double savingsProgressPercentage, List<CategoryComparison> categoryComparisons, List<DashboardInsight> insights, SpendingPace spendingPace, SpendingHealth spendingHealth) {
        this.totalIncome = totalIncome;
        this.totalExpenses = totalExpenses;
        this.remainingBalance = remainingBalance;
        this.savingsTarget = savingsTarget;
        this.savingsProgressPercentage = savingsProgressPercentage;
        this.categoryComparisons = categoryComparisons;
        this.insights = insights;
        this.spendingPace = spendingPace;
        this.spendingHealth = spendingHealth;
    }

    public BigDecimal getTotalIncome() {
        return totalIncome;
    }

    public void setTotalIncome(BigDecimal totalIncome) {
        this.totalIncome = totalIncome;
    }

    public BigDecimal getTotalExpenses() {
        return totalExpenses;
    }

    public void setTotalExpenses(BigDecimal totalExpenses) {
        this.totalExpenses = totalExpenses;
    }

    public BigDecimal getRemainingBalance() {
        return remainingBalance;
    }

    public void setRemainingBalance(BigDecimal remainingBalance) {
        this.remainingBalance = remainingBalance;
    }

    public BigDecimal getSavingsTarget() {
        return savingsTarget;
    }

    public void setSavingsTarget(BigDecimal savingsTarget) {
        this.savingsTarget = savingsTarget;
    }

    public double getSavingsProgressPercentage() {
        return savingsProgressPercentage;
    }

    public void setSavingsProgressPercentage(double savingsProgressPercentage) {
        this.savingsProgressPercentage = savingsProgressPercentage;
    }

    public List<CategoryComparison> getCategoryComparisons() {
        return categoryComparisons;
    }

    public void setCategoryComparisons(List<CategoryComparison> categoryComparisons) {
        this.categoryComparisons = categoryComparisons;
    }

    public List<DashboardInsight> getInsights() {
        return insights;
    }

    public void setInsights(List<DashboardInsight> insights) {
        this.insights = insights;
    }

    public SpendingPace getSpendingPace() {
        return spendingPace;
    }

    public void setSpendingPace(SpendingPace spendingPace) {
        this.spendingPace = spendingPace;
    }

    public SpendingHealth getSpendingHealth() {
        return spendingHealth;
    }

    public void setSpendingHealth(SpendingHealth spendingHealth) {
        this.spendingHealth = spendingHealth;
    }
}
