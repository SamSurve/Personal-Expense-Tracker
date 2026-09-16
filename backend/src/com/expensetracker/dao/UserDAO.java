package com.expensetracker.dao;

import com.expensetracker.model.User;
import java.util.Optional;

public interface UserDAO {
    boolean createUser(User user);
    Optional<User> findByEmail(String email);
    Optional<User> findById(int userId);
    boolean updateUserName(int userId, String name);
}
