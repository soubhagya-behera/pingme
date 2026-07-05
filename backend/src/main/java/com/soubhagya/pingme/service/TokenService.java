package com.soubhagya.pingme.service;

import com.soubhagya.pingme.entity.PasswordResetToken;
import com.soubhagya.pingme.entity.User;

public interface TokenService {

    PasswordResetToken createToken(User user);

    PasswordResetToken validateToken(String token);

    void deleteToken(Long userId);

}