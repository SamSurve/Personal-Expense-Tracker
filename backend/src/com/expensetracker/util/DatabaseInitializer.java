package com.expensetracker.util;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

public class DatabaseInitializer {

    private static final String CREATE_USERS_TABLE = 
        "CREATE TABLE IF NOT EXISTS users (" +
        "    user_id INT AUTO_INCREMENT PRIMARY KEY," +
        "    name VARCHAR(100) NOT NULL," +
        "    email VARCHAR(150) NOT NULL UNIQUE," +
        "    password VARCHAR(255) NOT NULL," +
        "    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
        ") ENGINE=InnoDB;";

    private static final String CREATE_SPENDING_PROFILE_TABLE = 
        "CREATE TABLE IF NOT EXISTS spending_profile (" +
        "    profile_id INT AUTO_INCREMENT PRIMARY KEY," +
        "    user_id INT NOT NULL UNIQUE," +
        "    monthly_income DECIMAL(12, 2) NOT NULL DEFAULT 0.00," +
        "    savings_target DECIMAL(12, 2) NOT NULL DEFAULT 0.00," +
        "    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
        "    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," +
        "    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE" +
        ") ENGINE=InnoDB;";

    private static final String CREATE_BUDGETS_TABLE = 
        "CREATE TABLE IF NOT EXISTS budgets (" +
        "    budget_id INT AUTO_INCREMENT PRIMARY KEY," +
        "    user_id INT NOT NULL," +
        "    category_name VARCHAR(100) NOT NULL," +
        "    baseline_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00," +
        "    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
        "    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE," +
        "    UNIQUE KEY uq_user_category (user_id, category_name)" +
        ") ENGINE=InnoDB;";

    private static final String CREATE_EXPENSES_TABLE = 
        "CREATE TABLE IF NOT EXISTS expenses (" +
        "    expense_id INT AUTO_INCREMENT PRIMARY KEY," +
        "    user_id INT NOT NULL," +
        "    title VARCHAR(150) NOT NULL," +
        "    category_name VARCHAR(100) NOT NULL," +
        "    amount DECIMAL(12, 2) NOT NULL," +
        "    expense_date DATE NOT NULL," +
        "    notes TEXT," +
        "    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
        "    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE" +
        ") ENGINE=InnoDB;";

    public static void initializeSchema() {
        System.out.println("[DatabaseInitializer] Starting automatic schema verification/initialization...");
        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement()) {

            stmt.execute(CREATE_USERS_TABLE);
            stmt.execute(CREATE_SPENDING_PROFILE_TABLE);
            stmt.execute(CREATE_BUDGETS_TABLE);
            stmt.execute(CREATE_EXPENSES_TABLE);

            System.out.println("[DatabaseInitializer] Database schema initialization complete. All required tables (users, spending_profile, budgets, expenses) verified.");
        } catch (SQLException e) {
            System.err.println("[DatabaseInitializer] CRITICAL: Automatic schema initialization failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
