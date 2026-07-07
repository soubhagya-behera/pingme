package com.soubhagya.pingme.service;

import com.soubhagya.pingme.entity.User;

public interface EmailService {

    void sendActivationEmail(User user, String token);

    void sendForgotPasswordEmail(User user, String token);

}