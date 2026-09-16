package com.expensetracker.service;

import com.expensetracker.dao.UserDAO;
import com.expensetracker.dao.impl.UserDAOImpl;
import com.expensetracker.model.User;

import java.util.Optional;

public class AuthService {

    private final UserDAO userDAO;

    public AuthService() {
        this.userDAO = new UserDAOImpl();
    }

    public AuthService(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    /**
     * Registers a new user with validation.
     */
    public AuthResult signup(String name, String email, String password) {
        if (name == null || name.trim().isEmpty()) {
            return new AuthResult(false, "Name cannot be empty.");
        }
        if (email == null || !email.contains("@") || !email.contains(".")) {
            return new AuthResult(false, "Invalid email address format.");
        }
        if (password == null || password.length() < 6) {
            return new AuthResult(false, "Password must be at least 6 characters long.");
        }

        String cleanEmail = email.trim().toLowerCase();

        // Duplicate Email Validation
        Optional<User> existingUser = userDAO.findByEmail(cleanEmail);
        if (existingUser.isPresent()) {
            return new AuthResult(false, "Account with this email already exists.");
        }

        User newUser = new User(name.trim(), cleanEmail, password);
        boolean created = userDAO.createUser(newUser);

        if (!created) {
            String dbErr = UserDAOImpl.getLastSqlError();
            String detail = (dbErr != null && !dbErr.isEmpty()) ? " (" + dbErr + ")" : "";
            return new AuthResult(false, "Failed to register user due to database error" + detail + ".");
        }

        Optional<User> savedUser = userDAO.findByEmail(cleanEmail);
        return new AuthResult(true, "User registered successfully.", savedUser.orElse(newUser));
    }

    /**
     * Authenticates existing user.
     */
    public AuthResult login(String email, String password) {
        if (email == null || email.trim().isEmpty()) {
            return new AuthResult(false, "Email is required.");
        }
        if (password == null || password.isEmpty()) {
            return new AuthResult(false, "Password is required.");
        }

        String cleanEmail = email.trim().toLowerCase();
        Optional<User> userOpt = userDAO.findByEmail(cleanEmail);

        if (!userOpt.isPresent()) {
            return new AuthResult(false, "No user found with the provided email address.");
        }

        User user = userOpt.get();
        if (!user.getPassword().equals(password)) {
            return new AuthResult(false, "Invalid password credentials.");
        }

        return new AuthResult(true, "Login successful.", user);
    }

    public Optional<User> getUserByEmail(String email) {
        if (email == null) return Optional.empty();
        return userDAO.findByEmail(email.trim().toLowerCase());
    }

    public Optional<User> getUserById(int userId) {
        return userDAO.findById(userId);
    }
}
