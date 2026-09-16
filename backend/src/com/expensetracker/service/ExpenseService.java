package com.expensetracker.service;

import com.expensetracker.dao.ExpenseDAO;
import com.expensetracker.dao.SpendingProfileDAO;
import com.expensetracker.dao.impl.ExpenseDAOImpl;
import com.expensetracker.dao.impl.SpendingProfileDAOImpl;
import com.expensetracker.model.Expense;
import com.expensetracker.model.SpendingProfile;

import java.math.BigDecimal;
import java.sql.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class ExpenseService {

    private final ExpenseDAO expenseDAO;
    private final SpendingProfileDAO profileDAO;

    public ExpenseService() {
        this.expenseDAO = new ExpenseDAOImpl();
        this.profileDAO = new SpendingProfileDAOImpl();
    }

    public ExpenseService(ExpenseDAO expenseDAO, SpendingProfileDAO profileDAO) {
        this.expenseDAO = expenseDAO;
        this.profileDAO = profileDAO;
    }

    public boolean addExpense(int userId, String title, String categoryName, BigDecimal amount, Date expenseDate, String notes) {
        if (userId <= 0 || title == null || title.trim().isEmpty() || categoryName == null || amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            System.err.println("Invalid input for adding expense.");
            return false;
        }

        Date validDate = expenseDate != null ? expenseDate : new Date(System.currentTimeMillis());
        Expense expense = new Expense(userId, title.trim(), categoryName.trim(), amount, validDate, notes);
        return expenseDAO.addExpense(expense);
    }

    public List<Expense> getUserExpenses(int userId) {
        return expenseDAO.getExpensesByUserId(userId);
    }

    public boolean updateExpense(Expense expense) {
        if (expense == null || expense.getExpenseId() <= 0 || expense.getUserId() <= 0 || expense.getAmount() == null || expense.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            System.err.println("Invalid input for updating expense.");
            return false;
        }
        return expenseDAO.updateExpense(expense);
    }

    public boolean deleteExpense(int expenseId, int userId) {
        if (expenseId <= 0 || userId <= 0) return false;
        return expenseDAO.deleteExpense(expenseId, userId);
    }

    public List<Expense> filterByCategory(int userId, String categoryName) {
        return expenseDAO.getExpensesByCategory(userId, categoryName);
    }

    public List<Expense> filterByDateRange(int userId, Date startDate, Date endDate) {
        return expenseDAO.getExpensesByDateRange(userId, startDate, endDate);
    }

    /**
     * Calculates total expenses for a user.
     */
    public BigDecimal calculateTotalExpenses(int userId) {
        List<Expense> expenses = expenseDAO.getExpensesByUserId(userId);
        BigDecimal total = BigDecimal.ZERO;
        for (Expense exp : expenses) {
            if (exp.getAmount() != null) {
                total = total.add(exp.getAmount());
            }
        }
        return total;
    }

    /**
     * Calculates category-wise total spending for a user.
     */
    public Map<String, BigDecimal> calculateCategoryWiseSpending(int userId) {
        List<Expense> expenses = expenseDAO.getExpensesByUserId(userId);
        Map<String, BigDecimal> map = new HashMap<>();

        for (Expense exp : expenses) {
            String category = exp.getCategoryName();
            BigDecimal amt = exp.getAmount() != null ? exp.getAmount() : BigDecimal.ZERO;

            map.put(category, map.getOrDefault(category, BigDecimal.ZERO).add(amt));
        }

        return map;
    }

    /**
     * Calculates remaining balance from monthly income minus total expenses.
     */
    public BigDecimal calculateRemainingBalance(int userId) {
        Optional<SpendingProfile> profileOpt = profileDAO.getProfileByUserId(userId);
        BigDecimal income = profileOpt.isPresent() ? profileOpt.get().getMonthlyIncome() : BigDecimal.ZERO;
        BigDecimal totalExpenses = calculateTotalExpenses(userId);

        return income.subtract(totalExpenses);
    }
}
