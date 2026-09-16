package com.expensetracker.model;

import java.util.List;

public class SpendingHealth {
    private int score;
    private String healthLabel;
    private List<String> reasons;

    public SpendingHealth() {}

    public SpendingHealth(int score, String healthLabel, List<String> reasons) {
        this.score = score;
        this.healthLabel = healthLabel;
        this.reasons = reasons;
    }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public String getHealthLabel() { return healthLabel; }
    public void setHealthLabel(String healthLabel) { this.healthLabel = healthLabel; }

    public List<String> getReasons() { return reasons; }
    public void setReasons(List<String> reasons) { this.reasons = reasons; }
}
