package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.dto.request.RegisterRequest;
import com.soubhagya.pingme.dto.response.UserResponse;
import com.soubhagya.pingme.entity.PasswordResetToken;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.enums.UserRole;
import com.soubhagya.pingme.enums.UserStatus;
import com.soubhagya.pingme.exception.ResourceAlreadyExistsException;
import com.soubhagya.pingme.repository.PasswordResetTokenRepository;
import com.soubhagya.pingme.repository.UserRepository;
import com.soubhagya.pingme.service.AuthService;
import com.soubhagya.pingme.service.EmailService;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.soubhagya.pingme.dto.request.LoginRequest;
import com.soubhagya.pingme.dto.response.LoginResponse;

import com.soubhagya.pingme.security.JwtService;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import com.soubhagya.pingme.service.TokenService;
import com.soubhagya.pingme.dto.request.SetPasswordRequest;
import com.soubhagya.pingme.entity.PasswordResetToken;
import com.soubhagya.pingme.repository.PasswordResetTokenRepository;


@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;

    private final ModelMapper modelMapper;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;

    private final PasswordResetTokenRepository tokenRepository;

private final JwtService jwtService;

private final TokenService tokenService;

private final EmailService emailService;

    @Override
    public UserResponse register(RegisterRequest request) {

        if(userRepository.existsByEmail(request.getEmail())){

            throw new ResourceAlreadyExistsException("Email already exists");

        }

        User user = modelMapper.map(request,User.class);

user.setPassword(
        passwordEncoder.encode(
                "TEMP_PASSWORD_" + java.util.UUID.randomUUID()
        )
);

        user.setRole(UserRole.USER);

        user.setStatus(UserStatus.PENDING);

        user.setOnline(false);

        user.setMustChangePassword(true);

user.setEmailVerified(false);

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

    @Override
public LoginResponse login(LoginRequest request) {

    authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                    request.getEmail(),
                    request.getPassword()
            )
    );

    User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

    String token = jwtService.generateToken(user.getEmail());

    return LoginResponse.builder()
            .token(token)
            .id(user.getId())
            .fullName(user.getFullName())
            .email(user.getEmail())
            .role(user.getRole().name())
            .status(user.getStatus().name())
            .online(user.getOnline())
            .build();

}

@Override
public boolean validateActivationToken(String token) {

    tokenService.validateToken(token);

    return true;

}

@Override
public void setPassword(SetPasswordRequest request) {

    PasswordResetToken resetToken =
            tokenService.validateToken(request.getToken());

    User user = resetToken.getUser();

    user.setPassword(

            passwordEncoder.encode(request.getPassword())

    );

    user.setEmailVerified(true);

    user.setMustChangePassword(false);

    userRepository.save(user);

    tokenService.deleteToken(user.getId());

}

@Override
public void forgotPassword(String email) {

    User user = userRepository.findByEmail(email)

            .orElseThrow(() ->

                    new IllegalArgumentException("No account found with this email."));

    PasswordResetToken token =
            tokenService.createToken(user);

    emailService.sendForgotPasswordEmail(
            user,
            token.getToken()
    );

}

@Override
public void resetPassword(
        String email,
        String otp,
        String newPassword
) {

    User user = userRepository.findByEmail(email)

            .orElseThrow(() ->

                    new IllegalArgumentException("No account found with this email."));

    PasswordResetToken token =
            tokenService.validateToken(otp);

    if (!token.getUser().getId().equals(user.getId())) {

        throw new IllegalArgumentException("Invalid OTP.");

    }

    user.setPassword(

            passwordEncoder.encode(newPassword)

    );

    userRepository.save(user);

    tokenService.deleteToken(user.getId());

}

}