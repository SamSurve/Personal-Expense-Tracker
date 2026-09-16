package com.expensetracker.dao.impl;

import com.expensetracker.dao.BudgetDAO;
import com.expensetracker.model.Budget;
import com.expensetracker.util.DatabaseConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class BudgetDAOImpl implements BudgetDAO {

    @Override
    public boolean saveBudget(Budget budget) {
        String sql = "INSERT INTO budgets (user_id, category_name, baseline_amount) VALUES (?, ?, ?) "
                   + "ON DUPLICATE KEY UPDATE baseline_amount = VALUES(baseline_amount)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, budget.getUserId());
            stmt.setString(2, budget.getCategoryName());
            stmt.setBigDecimal(3, budget.getBaselineAmount());

            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error saving budget: " + e.getMessage());
            return false;
        }
    }

    @Override
    public List<Budget> getBudgetsByUserId(int userId) {
        List<Budget> list = new ArrayList<>();
        String sql = "SELECT budget_id, user_id, category_name, baseline_amount, created_at FROM budgets WHERE user_id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    list.add(new Budget(
                        rs.getInt("budget_id"),
                        rs.getInt("user_id"),
                        rs.getString("category_name"),
                        rs.getBigDecimal("baseline_amount"),
                        rs.getTimestamp("created_at")
                    ));
                }
            }
        } catch (SQLException e) {
            System.err.println("Error fetching budgets: " + e.getMessage());
        }
        return list;
    }

    @Override
    public boolean deleteBudget(int budgetId, int userId) {
        String sql = "DELETE FROM budgets WHERE budget_id = ? AND user_id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, budgetId);
            stmt.setInt(2, userId);

            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error deleting budget: " + e.getMessage());
            return false;
        }
    }
}
