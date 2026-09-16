package com.expensetracker.dao;

import com.expensetracker.model.SpendingProfile;
import java.util.Optional;

public interface SpendingProfileDAO {
    boolean saveOrUpdateProfile(SpendingProfile profile);
    Optional<SpendingProfile> getProfileByUserId(int userId);
}
