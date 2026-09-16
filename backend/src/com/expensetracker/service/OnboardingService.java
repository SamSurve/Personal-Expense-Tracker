package com.expensetracker.service;

import com.expensetracker.dao.BudgetDAO;
import com.expensetracker.dao.SpendingProfileDAO;
import com.expensetracker.dao.impl.BudgetDAOImpl;
import com.expensetracker.dao.impl.SpendingProfileDAOImpl;
import com.expensetracker.model.Budget;
import com.expensetracker.model.SpendingProfile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class OnboardingService {

    private final SpendingProfileDAO spendingProfileDAO;
    private final BudgetDAO budgetDAO;

    public OnboardingService() {
        this.spendingProfileDAO = new SpendingProfileDAOImpl();
        this.budgetDAO = new BudgetDAOImpl();
    }

    public OnboardingService(SpendingProfileDAO spendingProfileDAO, BudgetDAO budgetDAO) {
        this.spendingProfileDAO = spendingProfileDAO;
        this.budgetDAO = budgetDAO;
    }

    /**
     * Saves user onboarding baseline financial profile and category-wise budgets.
     */
    public boolean saveOnboardingProfile(int userId, BigDecimal monthlyIncome, BigDecimal savingsTarget, Map<String, BigDecimal> categoryBaselines) {
        if (userId <= 0) {
            System.err.println("Invalid user ID for onboarding setup.");
            return false;
        }

        BigDecimal income = (monthlyIncome != null && monthlyIncome.compareTo(BigDecimal.ZERO) >= 0) ? monthlyIncome : BigDecimal.ZERO;
        BigDecimal target = (savingsTarget != null && savingsTarget.compareTo(BigDecimal.ZERO) >= 0) ? savingsTarget : BigDecimal.ZERO;

        // 1. Save or Update Spending Profile
        SpendingProfile profile = new SpendingProfile(userId, income, target);
        boolean profileSaved = spendingProfileDAO.saveOrUpdateProfile(profile);

        if (!profileSaved) {
            System.err.println("Failed to save spending profile for user_id: " + userId);
            return false;
        }

        // 2. Save Category-wise Baseline Budgets
        if (categoryBaselines != null && !categoryBaselines.isEmpty()) {
            for (Map.Entry<String, BigDecimal> entry : categoryBaselines.entrySet()) {
                String categoryName = entry.getKey();
                BigDecimal baselineAmount = entry.getValue();

                if (categoryName != null && !categoryName.trim().isEmpty()) {
                    Budget budget = new Budget(userId, categoryName.trim(), baselineAmount != null ? baselineAmount : BigDecimal.ZERO);
                    budgetDAO.saveBudget(budget);
                }
            }
        }

        return true;
    }

    /**
     * Retrieves the spending profile for a user.
     */
    public Optional<SpendingProfile> getSpendingProfile(int userId) {
        return spendingProfileDAO.getProfileByUserId(userId);
    }

    /**
     * Retrieves all category-wise budgets for a user.
     */
    public List<Budget> getUserBudgets(int userId) {
        return budgetDAO.getBudgetsByUserId(userId);
    }
}
