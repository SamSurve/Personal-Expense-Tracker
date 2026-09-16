package com.expensetracker.dao.impl;

import com.expensetracker.dao.SpendingProfileDAO;
import com.expensetracker.model.SpendingProfile;
import com.expensetracker.util.DatabaseConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

public class SpendingProfileDAOImpl implements SpendingProfileDAO {

    @Override
    public boolean saveOrUpdateProfile(SpendingProfile profile) {
        String sql = "INSERT INTO spending_profile (user_id, monthly_income, savings_target) VALUES (?, ?, ?) "
                   + "ON DUPLICATE KEY UPDATE monthly_income = VALUES(monthly_income), savings_target = VALUES(savings_target)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, profile.getUserId());
            stmt.setBigDecimal(2, profile.getMonthlyIncome());
            stmt.setBigDecimal(3, profile.getSavingsTarget());

            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error saving spending profile: " + e.getMessage());
            return false;
        }
    }

    @Override
    public Optional<SpendingProfile> getProfileByUserId(int userId) {
        String sql = "SELECT profile_id, user_id, monthly_income, savings_target, created_at, updated_at FROM spending_profile WHERE user_id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    SpendingProfile profile = new SpendingProfile(
                        rs.getInt("profile_id"),
                        rs.getInt("user_id"),
                        rs.getBigDecimal("monthly_income"),
                        rs.getBigDecimal("savings_target"),
                        rs.getTimestamp("created_at"),
                        rs.getTimestamp("updated_at")
                    );
                    return Optional.of(profile);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error getting spending profile: " + e.getMessage());
        }
        return Optional.empty();
    }
}
