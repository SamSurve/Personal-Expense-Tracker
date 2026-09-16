package com.expensetracker.dao.impl;

import com.expensetracker.dao.ExpenseDAO;
import com.expensetracker.model.Expense;
import com.expensetracker.util.DatabaseConnection;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class ExpenseDAOImpl implements ExpenseDAO {

    @Override
    public boolean addExpense(Expense expense) {
        String sql = "INSERT INTO expenses (user_id, title, category_name, amount, expense_date, notes) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, expense.getUserId());
            stmt.setString(2, expense.getTitle());
            stmt.setString(3, expense.getCategoryName());
            stmt.setBigDecimal(4, expense.getAmount());
            stmt.setDate(5, expense.getExpenseDate());
            stmt.setString(6, expense.getNotes());

            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error adding expense: " + e.getMessage());
            return false;
        }
    }

    @Override
    public Optional<Expense> getExpenseById(int expenseId, int userId) {
        String sql = "SELECT expense_id, user_id, title, category_name, amount, expense_date, notes, created_at FROM expenses WHERE expense_id = ? AND user_id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, expenseId);
            stmt.setInt(2, userId);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Expense exp = new Expense(
                        rs.getInt("expense_id"),
                        rs.getInt("user_id"),
                        rs.getString("title"),
                        rs.getString("category_name"),
                        rs.getBigDecimal("amount"),
                        rs.getDate("expense_date"),
                        rs.getString("notes"),
                        rs.getTimestamp("created_at")
                    );
                    return Optional.of(exp);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error finding expense by ID: " + e.getMessage());
        }
        return Optional.empty();
    }

    @Override
    public List<Expense> getExpensesByUserId(int userId) {
        List<Expense> list = new ArrayList<>();
        String sql = "SELECT expense_id, user_id, title, category_name, amount, expense_date, notes, created_at FROM expenses WHERE user_id = ? ORDER BY expense_date DESC";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    list.add(new Expense(
                        rs.getInt("expense_id"),
                        rs.getInt("user_id"),
                        rs.getString("title"),
                        rs.getString("category_name"),
                        rs.getBigDecimal("amount"),
                        rs.getDate("expense_date"),
                        rs.getString("notes"),
                        rs.getTimestamp("created_at")
                    ));
                }
            }
        } catch (SQLException e) {
            System.err.println("Error fetching expenses: " + e.getMessage());
        }
        return list;
    }

    @Override
    public boolean updateExpense(Expense expense) {
        String sql = "UPDATE expenses SET title = ?, category_name = ?, amount = ?, expense_date = ?, notes = ? WHERE expense_id = ? AND user_id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, expense.getTitle());
            stmt.setString(2, expense.getCategoryName());
            stmt.setBigDecimal(3, expense.getAmount());
            stmt.setDate(4, expense.getExpenseDate());
            stmt.setString(5, expense.getNotes());
            stmt.setInt(6, expense.getExpenseId());
            stmt.setInt(7, expense.getUserId());

            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error updating expense: " + e.getMessage());
            return false;
        }
    }

    @Override
    public boolean deleteExpense(int expenseId, int userId) {
        String sql = "DELETE FROM expenses WHERE expense_id = ? AND user_id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, expenseId);
            stmt.setInt(2, userId);

            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error deleting expense: " + e.getMessage());
            return false;
        }
    }

    @Override
    public List<Expense> getExpensesByCategory(int userId, String categoryName) {
        List<Expense> list = new ArrayList<>();
        String sql = "SELECT expense_id, user_id, title, category_name, amount, expense_date, notes, created_at FROM expenses WHERE user_id = ? AND category_name = ? ORDER BY expense_date DESC";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, userId);
            stmt.setString(2, categoryName);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    list.add(new Expense(
                        rs.getInt("expense_id"),
                        rs.getInt("user_id"),
                        rs.getString("title"),
                        rs.getString("category_name"),
                        rs.getBigDecimal("amount"),
                        rs.getDate("expense_date"),
                        rs.getString("notes"),
                        rs.getTimestamp("created_at")
                    ));
                }
            }
        } catch (SQLException e) {
            System.err.println("Error filtering expenses by category: " + e.getMessage());
        }
        return list;
    }

    @Override
    public List<Expense> getExpensesByDateRange(int userId, Date startDate, Date endDate) {
        List<Expense> list = new ArrayList<>();
        String sql = "SELECT expense_id, user_id, title, category_name, amount, expense_date, notes, created_at FROM expenses WHERE user_id = ? AND expense_date BETWEEN ? AND ? ORDER BY expense_date DESC";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, userId);
            stmt.setDate(2, startDate);
            stmt.setDate(3, endDate);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    list.add(new Expense(
                        rs.getInt("expense_id"),
                        rs.getInt("user_id"),
                        rs.getString("title"),
                        rs.getString("category_name"),
                        rs.getBigDecimal("amount"),
                        rs.getDate("expense_date"),
                        rs.getString("notes"),
                        rs.getTimestamp("created_at")
                    ));
                }
            }
        } catch (SQLException e) {
            System.err.println("Error filtering expenses by date range: " + e.getMessage());
        }
        return list;
    }
}
