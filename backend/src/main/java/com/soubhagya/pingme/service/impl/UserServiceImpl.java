package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.enums.UserStatus;
import com.soubhagya.pingme.repository.UserRepository;
import com.soubhagya.pingme.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

import com.soubhagya.pingme.dto.response.UserSearchResponse;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.dto.request.UpdateProfileRequest;
import com.soubhagya.pingme.dto.response.ProfileResponse;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public List<User> getAllUsers() {

        return userRepository.findAll();

    }

    @Override
public UserSearchResponse searchUser(String email) {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    if(user.getStatus() != UserStatus.APPROVED){

        throw new RuntimeException("User is not approved");

    }

    return UserSearchResponse.builder()
            .id(user.getId())
            .fullName(user.getFullName())
            .email(user.getEmail())
            .profession(user.getProfession())
            .profilePicture(user.getProfilePicture())
            .online(user.getOnline())
            .build();

}

@Override
public ProfileResponse getProfile(String email) {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    return ProfileResponse.builder()
            .id(user.getId())
            .fullName(user.getFullName())
            .email(user.getEmail())
            .profession(user.getProfession())
            .bio(user.getBio())
            .phone(user.getPhone())
            .profilePicture(user.getProfilePicture())
            .build();

}

@Override
public ProfileResponse updateProfile(

        String email,

        UpdateProfileRequest request) {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    user.setFullName(request.getFullName());

    user.setProfession(request.getProfession());

    user.setBio(request.getBio());

    user.setPhone(request.getPhone());

    User savedUser = userRepository.save(user);

    return ProfileResponse.builder()
            .id(savedUser.getId())
            .fullName(savedUser.getFullName())
            .email(savedUser.getEmail())
            .profession(savedUser.getProfession())
            .bio(savedUser.getBio())
            .phone(savedUser.getPhone())
            .profilePicture(savedUser.getProfilePicture())
            .build();

}

}