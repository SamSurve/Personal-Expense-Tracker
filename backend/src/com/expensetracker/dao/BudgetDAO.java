package com.expensetracker.dao;

import com.expensetracker.model.Budget;
import java.util.List;

public interface BudgetDAO {
    boolean saveBudget(Budget budget);
    List<Budget> getBudgetsByUserId(int userId);
    boolean deleteBudget(int budgetId, int userId);
}
