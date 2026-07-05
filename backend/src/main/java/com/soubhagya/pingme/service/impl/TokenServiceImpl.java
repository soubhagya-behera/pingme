package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.entity.PasswordResetToken;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.exception.InvalidTokenException;
import com.soubhagya.pingme.repository.PasswordResetTokenRepository;
import com.soubhagya.pingme.service.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class TokenServiceImpl implements TokenService {

    private final PasswordResetTokenRepository tokenRepository;

    @Override
    public PasswordResetToken createToken(User user) {

        tokenRepository.findByUserId(user.getId())
                .ifPresent(existing -> tokenRepository.delete(existing));

        PasswordResetToken token = PasswordResetToken.builder()
                .token(UUID.randomUUID().toString())
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(24))
                .build();

        return tokenRepository.save(token);
    }

    @Override
    public PasswordResetToken validateToken(String token) {

        PasswordResetToken passwordResetToken = tokenRepository
                .findByToken(token)
                .orElseThrow(() ->
                        new InvalidTokenException("Invalid activation link"));

        if (passwordResetToken.getExpiryDate().isBefore(LocalDateTime.now())) {

            throw new InvalidTokenException("Activation link has expired");
        }

        return passwordResetToken;
    }

    @Override
    public void deleteToken(Long userId) {

        tokenRepository.deleteByUserId(userId);

    }

}