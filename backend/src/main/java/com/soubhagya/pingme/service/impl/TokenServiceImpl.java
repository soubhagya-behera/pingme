package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.entity.PasswordResetToken;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.exception.InvalidTokenException;
import com.soubhagya.pingme.repository.PasswordResetTokenRepository;
import com.soubhagya.pingme.service.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
@Transactional
public class TokenServiceImpl implements TokenService {

    public static final int MAX_ATTEMPTS = 5;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final PasswordResetTokenRepository tokenRepository;

    @Override
    public PasswordResetToken createToken(User user) {

        // Reuse the existing single-row-per-user behavior, but rotate the OTP value,
        // reset attempts/lockout, and never persist the plaintext OTP.
        PasswordResetToken token = tokenRepository
                .findByUserId(user.getId())
                .orElse(new PasswordResetToken());

        String otp = String.format("%06d", SECURE_RANDOM.nextInt(1000000));

        token.setUser(user);
        token.setTokenHash(hash(otp));
        token.setAttempts(0);
        token.setLockedUntil(null);
        token.setExpiryDate(LocalDateTime.now().plusMinutes(10));

        PasswordResetToken saved = tokenRepository.save(token);
        // Transient only: returned to the caller so it can be emailed, never persisted.
        saved.setToken(otp);
        return saved;
    }

    @Override
    public PasswordResetToken validateToken(String token) {
        // Activation/set-password tokens are looked up by hash. Failed guesses are
        // indistinguishable (no per-token attempt oracle is exposed here).
        String normalized = normalize(token);
        PasswordResetToken passwordResetToken = tokenRepository
                .findByTokenHash(hash(normalized))
                .orElseThrow(() ->
                        new InvalidTokenException("Invalid activation link"));

        assertUsable(passwordResetToken);
        return passwordResetToken;
    }

    @Override
    public java.util.Optional<PasswordResetToken> verifyForUser(User user, String otp) {
        String normalized = normalize(otp);
        java.util.Optional<PasswordResetToken> candidate = tokenRepository.findByUserId(user.getId());
        if (candidate.isEmpty() || !matches(candidate.get(), normalized)) {
            candidate.ifPresent(this::recordFailedAttempt);
            return java.util.Optional.empty();
        }
        PasswordResetToken token = candidate.get();
        if (isLocked(token) || isExpired(token)) {
            return java.util.Optional.empty();
        }
        return java.util.Optional.of(token);
    }

    @Override
    public void recordFailedAttempt(PasswordResetToken token) {
        int attempts = token.getAttempts() + 1;
        token.setAttempts(attempts);
        if (attempts >= MAX_ATTEMPTS) {
            // Keep the existing 10-minute window semantics for lockout.
            token.setLockedUntil(LocalDateTime.now().plusMinutes(10));
        }
        tokenRepository.save(token);
    }

    @Override
    public void deleteToken(Long userId) {
        tokenRepository.deleteByUserId(userId);
    }

    static String hash(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (java.security.NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is not available", ex);
        }
    }

    private static boolean matches(PasswordResetToken token, String otp) {
        if (token.getTokenHash() == null) return false;
        return MessageDigest.isEqual(
                token.getTokenHash().getBytes(StandardCharsets.UTF_8),
                hash(otp).getBytes(StandardCharsets.UTF_8));
    }

    private static boolean isLocked(PasswordResetToken token) {
        return token.getLockedUntil() != null && token.getLockedUntil().isAfter(LocalDateTime.now());
    }

    private static boolean isExpired(PasswordResetToken token) {
        return token.getExpiryDate() != null && token.getExpiryDate().isBefore(LocalDateTime.now());
    }

    private static void assertUsable(PasswordResetToken token) {
        if (isLocked(token)) {
            throw new InvalidTokenException("Too many attempts. Please request a new OTP.");
        }
        if (isExpired(token)) {
            throw new InvalidTokenException("Activation link has expired");
        }
    }

    private static String normalize(String token) {
        return token == null ? "" : token.trim();
    }

}