package com.expensetracker.dao;

import com.expensetracker.model.Expense;
import java.sql.Date;
import java.util.List;
import java.util.Optional;

public interface ExpenseDAO {
    boolean addExpense(Expense expense);
    Optional<Expense> getExpenseById(int expenseId, int userId);
    List<Expense> getExpensesByUserId(int userId);
    boolean updateExpense(Expense expense);
    boolean deleteExpense(int expenseId, int userId);
    List<Expense> getExpensesByCategory(int userId, String categoryName);
    List<Expense> getExpensesByDateRange(int userId, Date startDate, Date endDate);
}
