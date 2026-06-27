package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.dto.request.RegisterRequest;
import com.soubhagya.pingme.dto.response.UserResponse;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.enums.UserRole;
import com.soubhagya.pingme.enums.UserStatus;
import com.soubhagya.pingme.exception.ResourceAlreadyExistsException;
import com.soubhagya.pingme.repository.UserRepository;
import com.soubhagya.pingme.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;

    private final ModelMapper modelMapper;

    @Override
    public UserResponse register(RegisterRequest request) {

        if(userRepository.existsByEmail(request.getEmail())){

            throw new ResourceAlreadyExistsException("Email already exists");

        }

        User user = modelMapper.map(request,User.class);

        user.setRole(UserRole.USER);

        user.setStatus(UserStatus.PENDING);

        user.setOnline(false);

        User savedUser = userRepository.save(user);

        UserResponse response = UserResponse.builder()
        .id(savedUser.getId())
        .fullName(savedUser.getFullName())
        .email(savedUser.getEmail())
        .profession(savedUser.getProfession())
        .bio(savedUser.getBio())
        .phone(savedUser.getPhone())
        .status(savedUser.getStatus().name())
        .build();

return response;

    }

}