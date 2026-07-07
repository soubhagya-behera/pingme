package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.entity.PasswordResetToken;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.exception.InvalidTokenException;
import com.soubhagya.pingme.repository.PasswordResetTokenRepository;
import com.soubhagya.pingme.service.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TokenServiceImpl implements TokenService {

    private final PasswordResetTokenRepository tokenRepository;

    @Override
    public PasswordResetToken createToken(User user) {

        PasswordResetToken token = tokenRepository
                .findByUserId(user.getId())
                .orElse(new PasswordResetToken());

        token.setUser(user);
        token.setToken(UUID.randomUUID().toString());
        token.setExpiryDate(LocalDateTime.now().plusHours(24));

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