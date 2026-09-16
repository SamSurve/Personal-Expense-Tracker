package com.expensetracker.model;

import java.math.BigDecimal;

public class WhatIfSimulation {
    private BigDecimal purchaseAmount;
    private String categoryName;

    private BigDecimal currentSafeToSpend;
    private BigDecimal simulatedSafeToSpend;
    private BigDecimal safeToSpendDelta;

    private BigDecimal currentDailySafeSpend;
    private BigDecimal simulatedDailySafeSpend;
    private BigDecimal dailySafeSpendDelta;

    private String currentPaceStatus;
    private String simulatedPaceStatus;

    private BigDecimal currentProjectedSpend;
    private BigDecimal simulatedProjectedSpend;

    private int currentHealthScore;
    private int simulatedHealthScore;
    private int healthScoreDelta;

    private String currentHealthLabel;
    private String simulatedHealthLabel;

    private BigDecimal categoryCurrentSpent;
    private BigDecimal categoryBaseline;
    private BigDecimal categorySimulatedSpent;
    private boolean categoryExceeded;

    private String impactNarrative;

    public WhatIfSimulation() {}

    public BigDecimal getPurchaseAmount() { return purchaseAmount; }
    public void setPurchaseAmount(BigDecimal purchaseAmount) { this.purchaseAmount = purchaseAmount; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public BigDecimal getCurrentSafeToSpend() { return currentSafeToSpend; }
    public void setCurrentSafeToSpend(BigDecimal currentSafeToSpend) { this.currentSafeToSpend = currentSafeToSpend; }

    public BigDecimal getSimulatedSafeToSpend() { return simulatedSafeToSpend; }
    public void setSimulatedSafeToSpend(BigDecimal simulatedSafeToSpend) { this.simulatedSafeToSpend = simulatedSafeToSpend; }

    public BigDecimal getSafeToSpendDelta() { return safeToSpendDelta; }
    public void setSafeToSpendDelta(BigDecimal safeToSpendDelta) { this.safeToSpendDelta = safeToSpendDelta; }

    public BigDecimal getCurrentDailySafeSpend() { return currentDailySafeSpend; }
    public void setCurrentDailySafeSpend(BigDecimal currentDailySafeSpend) { this.currentDailySafeSpend = currentDailySafeSpend; }

    public BigDecimal getSimulatedDailySafeSpend() { return simulatedDailySafeSpend; }
    public void setSimulatedDailySafeSpend(BigDecimal simulatedDailySafeSpend) { this.simulatedDailySafeSpend = simulatedDailySafeSpend; }

    public BigDecimal getDailySafeSpendDelta() { return dailySafeSpendDelta; }
    public void setDailySafeSpendDelta(BigDecimal dailySafeSpendDelta) { this.dailySafeSpendDelta = dailySafeSpendDelta; }

    public String getCurrentPaceStatus() { return currentPaceStatus; }
    public void setCurrentPaceStatus(String currentPaceStatus) { this.currentPaceStatus = currentPaceStatus; }

    public String getSimulatedPaceStatus() { return simulatedPaceStatus; }
    public void setSimulatedPaceStatus(String simulatedPaceStatus) { this.simulatedPaceStatus = simulatedPaceStatus; }

    public BigDecimal getCurrentProjectedSpend() { return currentProjectedSpend; }
    public void setCurrentProjectedSpend(BigDecimal currentProjectedSpend) { this.currentProjectedSpend = currentProjectedSpend; }

    public BigDecimal getSimulatedProjectedSpend() { return simulatedProjectedSpend; }
    public void setSimulatedProjectedSpend(BigDecimal simulatedProjectedSpend) { this.simulatedProjectedSpend = simulatedProjectedSpend; }

    public int getCurrentHealthScore() { return currentHealthScore; }
    public void setCurrentHealthScore(int currentHealthScore) { this.currentHealthScore = currentHealthScore; }

    public int getSimulatedHealthScore() { return simulatedHealthScore; }
    public void setSimulatedHealthScore(int simulatedHealthScore) { this.simulatedHealthScore = simulatedHealthScore; }

    public int getHealthScoreDelta() { return healthScoreDelta; }
    public void setHealthScoreDelta(int healthScoreDelta) { this.healthScoreDelta = healthScoreDelta; }

    public String getCurrentHealthLabel() { return currentHealthLabel; }
    public void setCurrentHealthLabel(String currentHealthLabel) { this.currentHealthLabel = currentHealthLabel; }

    public String getSimulatedHealthLabel() { return simulatedHealthLabel; }
    public void setSimulatedHealthLabel(String simulatedHealthLabel) { this.simulatedHealthLabel = simulatedHealthLabel; }

    public BigDecimal getCategoryCurrentSpent() { return categoryCurrentSpent; }
    public void setCategoryCurrentSpent(BigDecimal categoryCurrentSpent) { this.categoryCurrentSpent = categoryCurrentSpent; }

    public BigDecimal getCategoryBaseline() { return categoryBaseline; }
    public void setCategoryBaseline(BigDecimal categoryBaseline) { this.categoryBaseline = categoryBaseline; }

    public BigDecimal getCategorySimulatedSpent() { return categorySimulatedSpent; }
    public void setCategorySimulatedSpent(BigDecimal categorySimulatedSpent) { this.categorySimulatedSpent = categorySimulatedSpent; }

    public boolean isCategoryExceeded() { return categoryExceeded; }
    public void setCategoryExceeded(boolean categoryExceeded) { this.categoryExceeded = categoryExceeded; }

    public String getImpactNarrative() { return impactNarrative; }
    public void setImpactNarrative(String impactNarrative) { this.impactNarrative = impactNarrative; }
}
