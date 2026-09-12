package com.soubhagya.pingme.service;

import com.soubhagya.pingme.entity.PasswordResetToken;
import com.soubhagya.pingme.entity.User;

public interface TokenService {

    PasswordResetToken createToken(User user);

    PasswordResetToken validateToken(String token);

    /**
     * Verify a user-supplied OTP for a specific user without leaking which part failed.
     * Returns the token on success, or empty when invalid/expired/locked/mismatched.
     * Failed attempts are recorded (and may lock the OTP after 5 attempts).
     */
    java.util.Optional<PasswordResetToken> verifyForUser(User user, String otp);

    void recordFailedAttempt(PasswordResetToken token);

    void deleteToken(Long userId);

}