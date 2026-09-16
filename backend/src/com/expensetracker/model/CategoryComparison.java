package com.expensetracker.model;

import java.math.BigDecimal;

public class CategoryComparison {
    private String categoryName;
    private BigDecimal actualAmount;
    private BigDecimal baselineAmount;
    private BigDecimal difference;
    private double spendingPercentage;
    private boolean isOver;

    public CategoryComparison() {}

    public CategoryComparison(String categoryName, BigDecimal actualAmount, BigDecimal baselineAmount, BigDecimal difference, double spendingPercentage, boolean isOver) {
        this.categoryName = categoryName;
        this.actualAmount = actualAmount;
        this.baselineAmount = baselineAmount;
        this.difference = difference;
        this.spendingPercentage = spendingPercentage;
        this.isOver = isOver;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public BigDecimal getActualAmount() {
        return actualAmount;
    }

    public void setActualAmount(BigDecimal actualAmount) {
        this.actualAmount = actualAmount;
    }

    public BigDecimal getBaselineAmount() {
        return baselineAmount;
    }

    public void setBaselineAmount(BigDecimal baselineAmount) {
        this.baselineAmount = baselineAmount;
    }

    public BigDecimal getDifference() {
        return difference;
    }

    public void setDifference(BigDecimal difference) {
        this.difference = difference;
    }

    public double getSpendingPercentage() {
        return spendingPercentage;
    }

    public void setSpendingPercentage(double spendingPercentage) {
        this.spendingPercentage = spendingPercentage;
    }

    public boolean isOver() {
        return isOver;
    }

    public void setOver(boolean isOver) {
        this.isOver = isOver;
    }
}
