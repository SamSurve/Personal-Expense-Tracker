package com.expensetracker.model;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class Budget {
    private int budgetId;
    private int userId;
    private String categoryName;
    private BigDecimal baselineAmount;
    private Timestamp createdAt;

    public Budget() {}

    public Budget(int budgetId, int userId, String categoryName, BigDecimal baselineAmount, Timestamp createdAt) {
        this.budgetId = budgetId;
        this.userId = userId;
        this.categoryName = categoryName;
        this.baselineAmount = baselineAmount;
        this.createdAt = createdAt;
    }

    public Budget(int userId, String categoryName, BigDecimal baselineAmount) {
        this.userId = userId;
        this.categoryName = categoryName;
        this.baselineAmount = baselineAmount;
    }

    public int getBudgetId() {
        return budgetId;
    }

    public void setBudgetId(int budgetId) {
        this.budgetId = budgetId;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public BigDecimal getBaselineAmount() {
        return baselineAmount;
    }

    public void setBaselineAmount(BigDecimal baselineAmount) {
        this.baselineAmount = baselineAmount;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}
