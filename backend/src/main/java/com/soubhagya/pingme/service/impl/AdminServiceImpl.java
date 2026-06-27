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

}