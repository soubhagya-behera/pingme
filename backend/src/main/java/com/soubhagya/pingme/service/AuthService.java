package com.soubhagya.pingme.service;

import com.soubhagya.pingme.dto.request.LoginRequest;
import com.soubhagya.pingme.dto.request.RegisterRequest;
import com.soubhagya.pingme.dto.response.LoginResponse;
import com.soubhagya.pingme.dto.response.UserResponse;

public interface AuthService {

    UserResponse register(RegisterRequest request);

    LoginResponse login(LoginRequest request);
}