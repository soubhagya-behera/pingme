package com.soubhagya.pingme.service;

import com.soubhagya.pingme.dto.request.PasswordChangeRequest;
import com.soubhagya.pingme.dto.request.UpdateProfileRequest;
import com.soubhagya.pingme.dto.response.ProfileResponse;
import com.soubhagya.pingme.dto.response.UserSearchResponse;
import com.soubhagya.pingme.entity.User;

import java.util.List;

public interface UserService {

    List<User> getAllUsers();

    List<UserSearchResponse> searchUsers(

        String keyword,

        String loggedInEmail

);

    ProfileResponse getProfile(String email);

    ProfileResponse updateProfile(
            String email,
            UpdateProfileRequest request
    );

    void changePassword(
        String email,
        PasswordChangeRequest request
);

}