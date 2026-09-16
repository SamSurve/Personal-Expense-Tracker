package com.expensetracker.dao.impl;

import com.expensetracker.dao.UserDAO;
import com.expensetracker.model.User;
import com.expensetracker.util.DatabaseConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

public class UserDAOImpl implements UserDAO {

    private static volatile String lastSqlError = null;

    public static String getLastSqlError() {
        return lastSqlError;
    }

    @Override
    public boolean createUser(User user) {
        lastSqlError = null;
        String sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, java.sql.Statement.RETURN_GENERATED_KEYS)) {
            
            stmt.setString(1, user.getName());
            stmt.setString(2, user.getEmail());
            stmt.setString(3, user.getPassword());
            
            int affected = stmt.executeUpdate();
            if (affected > 0) {
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) {
                        user.setUserId(rs.getInt(1));
                    }
                }
                return true;
            }
            lastSqlError = "ExecuteUpdate returned 0 rows affected.";
            return false;
        } catch (SQLException e) {
            lastSqlError = e.getClass().getSimpleName() + ": " + e.getMessage();
            System.err.println("[UserDAO] Error creating user: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public Optional<User> findByEmail(String email) {
        String sql = "SELECT user_id, name, email, password, created_at FROM users WHERE email = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, email);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    User user = new User(
                        rs.getInt("user_id"),
                        rs.getString("name"),
                        rs.getString("email"),
                        rs.getString("password"),
                        rs.getTimestamp("created_at")
                    );
                    return Optional.of(user);
                }
            }
        } catch (SQLException e) {
            lastSqlError = e.getClass().getSimpleName() + ": " + e.getMessage();
            System.err.println("[UserDAO] Error finding user by email: " + e.getMessage());
            e.printStackTrace();
        }
        return Optional.empty();
    }

    @Override
    public Optional<User> findById(int userId) {
        String sql = "SELECT user_id, name, email, password, created_at FROM users WHERE user_id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    User user = new User(
                        rs.getInt("user_id"),
                        rs.getString("name"),
                        rs.getString("email"),
                        rs.getString("password"),
                        rs.getTimestamp("created_at")
                    );
                    return Optional.of(user);
                }
            }
        } catch (SQLException e) {
            lastSqlError = e.getClass().getSimpleName() + ": " + e.getMessage();
            System.err.println("[UserDAO] Error finding user by id: " + e.getMessage());
            e.printStackTrace();
        }
        return Optional.empty();
    }

    @Override
    public boolean updateUserName(int userId, String name) {
        lastSqlError = null;
        String sql = "UPDATE users SET name = ? WHERE user_id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, name);
            stmt.setInt(2, userId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            lastSqlError = e.getClass().getSimpleName() + ": " + e.getMessage();
            System.err.println("[UserDAO] Error updating user name: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}
