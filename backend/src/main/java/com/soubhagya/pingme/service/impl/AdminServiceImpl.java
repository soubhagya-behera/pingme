package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.dto.response.UserResponse;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.enums.UserStatus;
import com.soubhagya.pingme.repository.UserRepository;
import com.soubhagya.pingme.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;

    @Override
    public List<UserResponse> getPendingUsers() {

        List<User> users = userRepository.findByStatus(UserStatus.PENDING);

        return users.stream()
                .map(user -> UserResponse.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .profession(user.getProfession())
                        .bio(user.getBio())
                        .phone(user.getPhone())
                        .status(user.getStatus().name())
                        .build())
                .collect(Collectors.toList());

    }

    @Override
public UserResponse approveUser(Long id) {

    User user = userRepository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    user.setStatus(UserStatus.APPROVED);

    User updatedUser = userRepository.save(user);

    return UserResponse.builder()
            .id(updatedUser.getId())
            .fullName(updatedUser.getFullName())
            .email(updatedUser.getEmail())
            .profession(updatedUser.getProfession())
            .bio(updatedUser.getBio())
            .phone(updatedUser.getPhone())
            .status(updatedUser.getStatus().name())
            .build();
}

@Override
public UserResponse rejectUser(Long id) {

    User user = userRepository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    user.setStatus(UserStatus.REJECTED);

    User updatedUser = userRepository.save(user);

    return UserResponse.builder()
            .id(updatedUser.getId())
            .fullName(updatedUser.getFullName())
            .email(updatedUser.getEmail())
            .profession(updatedUser.getProfession())
            .bio(updatedUser.getBio())
            .phone(updatedUser.getPhone())
            .status(updatedUser.getStatus().name())
            .build();

}

}