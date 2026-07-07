package com.soubhagya.pingme.service;

import com.soubhagya.pingme.dto.request.LoginRequest;
import com.soubhagya.pingme.dto.request.RegisterRequest;
import com.soubhagya.pingme.dto.request.SetPasswordRequest;
import com.soubhagya.pingme.dto.response.LoginResponse;
import com.soubhagya.pingme.dto.response.UserResponse;

public interface AuthService {

    UserResponse register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    boolean validateActivationToken(String token);

void setPassword(SetPasswordRequest request);
}