package com.expensetracker.model;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class SpendingProfile {
    private int profileId;
    private int userId;
    private BigDecimal monthlyIncome;
    private BigDecimal savingsTarget;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public SpendingProfile() {}

    public SpendingProfile(int profileId, int userId, BigDecimal monthlyIncome, BigDecimal savingsTarget, Timestamp createdAt, Timestamp updatedAt) {
        this.profileId = profileId;
        this.userId = userId;
        this.monthlyIncome = monthlyIncome;
        this.savingsTarget = savingsTarget;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public SpendingProfile(int userId, BigDecimal monthlyIncome, BigDecimal savingsTarget) {
        this.userId = userId;
        this.monthlyIncome = monthlyIncome;
        this.savingsTarget = savingsTarget;
    }

    public int getProfileId() {
        return profileId;
    }

    public void setProfileId(int profileId) {
        this.profileId = profileId;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public BigDecimal getMonthlyIncome() {
        return monthlyIncome;
    }

    public void setMonthlyIncome(BigDecimal monthlyIncome) {
        this.monthlyIncome = monthlyIncome;
    }

    public BigDecimal getSavingsTarget() {
        return savingsTarget;
    }

    public void setSavingsTarget(BigDecimal savingsTarget) {
        this.savingsTarget = savingsTarget;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }
}
