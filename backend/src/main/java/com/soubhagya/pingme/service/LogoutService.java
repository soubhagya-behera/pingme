package com.soubhagya.pingme.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;

public interface LogoutService {

    void logout(Authentication authentication, HttpServletRequest request);
}
