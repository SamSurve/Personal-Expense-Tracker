package com.expensetracker.model;

import java.math.BigDecimal;

public class SpendingPace {
    private int daysElapsed;
    private int daysInMonth;
    private int daysRemaining;
    private BigDecimal discretionaryCapacity;
    private BigDecimal remainingDiscretionaryCapacity;
    private BigDecimal actualSpentMonth;
    private BigDecimal idealPaceToday;
    private BigDecimal dailyAverage;
    private BigDecimal projectedMonthSpend;
    private BigDecimal safeToSpend;
    private BigDecimal dailySafeSpend;
    private String paceStatus; // ON TRACK, ABOVE PACE, UNDER PACE
    private String explanation;

    public SpendingPace() {}

    public SpendingPace(int daysElapsed, int daysInMonth, BigDecimal discretionaryCapacity, BigDecimal actualSpentMonth, BigDecimal idealPaceToday, BigDecimal dailyAverage, BigDecimal projectedMonthSpend, BigDecimal safeToSpend, String paceStatus, String explanation) {
        this.daysElapsed = daysElapsed;
        this.daysInMonth = daysInMonth;
        this.daysRemaining = Math.max(1, daysInMonth - daysElapsed + 1);
        this.discretionaryCapacity = discretionaryCapacity;
        this.remainingDiscretionaryCapacity = discretionaryCapacity.subtract(actualSpentMonth);
        this.actualSpentMonth = actualSpentMonth;
        this.idealPaceToday = idealPaceToday;
        this.dailyAverage = dailyAverage;
        this.projectedMonthSpend = projectedMonthSpend;
        this.safeToSpend = safeToSpend;
        this.dailySafeSpend = this.daysRemaining > 0 && this.safeToSpend.compareTo(BigDecimal.ZERO) > 0
                ? this.safeToSpend.divide(new BigDecimal(this.daysRemaining), 2, java.math.RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        this.paceStatus = paceStatus;
        this.explanation = explanation;
    }

    public SpendingPace(int daysElapsed, int daysInMonth, int daysRemaining, BigDecimal discretionaryCapacity, BigDecimal remainingDiscretionaryCapacity, BigDecimal actualSpentMonth, BigDecimal idealPaceToday, BigDecimal dailyAverage, BigDecimal projectedMonthSpend, BigDecimal safeToSpend, BigDecimal dailySafeSpend, String paceStatus, String explanation) {
        this.daysElapsed = daysElapsed;
        this.daysInMonth = daysInMonth;
        this.daysRemaining = daysRemaining;
        this.discretionaryCapacity = discretionaryCapacity;
        this.remainingDiscretionaryCapacity = remainingDiscretionaryCapacity;
        this.actualSpentMonth = actualSpentMonth;
        this.idealPaceToday = idealPaceToday;
        this.dailyAverage = dailyAverage;
        this.projectedMonthSpend = projectedMonthSpend;
        this.safeToSpend = safeToSpend;
        this.dailySafeSpend = dailySafeSpend;
        this.paceStatus = paceStatus;
        this.explanation = explanation;
    }

    public int getDaysElapsed() { return daysElapsed; }
    public void setDaysElapsed(int daysElapsed) { this.daysElapsed = daysElapsed; }

    public int getDaysInMonth() { return daysInMonth; }
    public void setDaysInMonth(int daysInMonth) { this.daysInMonth = daysInMonth; }

    public int getDaysRemaining() { return daysRemaining; }
    public void setDaysRemaining(int daysRemaining) { this.daysRemaining = daysRemaining; }

    public BigDecimal getDiscretionaryCapacity() { return discretionaryCapacity; }
    public void setDiscretionaryCapacity(BigDecimal discretionaryCapacity) { this.discretionaryCapacity = discretionaryCapacity; }

    public BigDecimal getRemainingDiscretionaryCapacity() { return remainingDiscretionaryCapacity; }
    public void setRemainingDiscretionaryCapacity(BigDecimal remainingDiscretionaryCapacity) { this.remainingDiscretionaryCapacity = remainingDiscretionaryCapacity; }

    public BigDecimal getActualSpentMonth() { return actualSpentMonth; }
    public void setActualSpentMonth(BigDecimal actualSpentMonth) { this.actualSpentMonth = actualSpentMonth; }

    public BigDecimal getIdealPaceToday() { return idealPaceToday; }
    public void setIdealPaceToday(BigDecimal idealPaceToday) { this.idealPaceToday = idealPaceToday; }

    public BigDecimal getDailyAverage() { return dailyAverage; }
    public void setDailyAverage(BigDecimal dailyAverage) { this.dailyAverage = dailyAverage; }

    public BigDecimal getProjectedMonthSpend() { return projectedMonthSpend; }
    public void setProjectedMonthSpend(BigDecimal projectedMonthSpend) { this.projectedMonthSpend = projectedMonthSpend; }

    public BigDecimal getSafeToSpend() { return safeToSpend; }
    public void setSafeToSpend(BigDecimal safeToSpend) { this.safeToSpend = safeToSpend; }

    public BigDecimal getDailySafeSpend() { return dailySafeSpend; }
    public void setDailySafeSpend(BigDecimal dailySafeSpend) { this.dailySafeSpend = dailySafeSpend; }

    public String getPaceStatus() { return paceStatus; }
    public void setPaceStatus(String paceStatus) { this.paceStatus = paceStatus; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
