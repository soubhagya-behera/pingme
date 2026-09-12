package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.repository.UserRepository;
import com.soubhagya.pingme.security.JwtService;
import com.soubhagya.pingme.service.LogoutService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LogoutServiceImpl implements LogoutService {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Override
    @Transactional
    public void logout(Authentication authentication, HttpServletRequest request) {
        String email = authentication != null ? authentication.getName() : null;
        if ((email == null || email.isBlank()) && request != null) {
            // Fall back to the bearer token subject when the filter did not establish auth
            // (e.g. already-revoked token still attempting logout).
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                try {
                    email = jwtService.extractUsername(header.substring(7));
                } catch (RuntimeException ignored) {
                    email = null;
                }
            }
        }
        if (email == null || email.isBlank()) {
            return;
        }
        final String resolvedEmail = email;
        userRepository.findByEmail(resolvedEmail).ifPresent(user -> {
            User managed = user;
            long current = managed.getTokenVersion() == null ? 0L : managed.getTokenVersion();
            managed.setTokenVersion(current + 1);
            userRepository.save(managed);
        });
    }
}
