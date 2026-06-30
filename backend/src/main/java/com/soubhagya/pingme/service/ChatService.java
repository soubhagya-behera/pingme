package com.soubhagya.pingme.service;

import com.soubhagya.pingme.dto.chat.ChatMessage;

public interface ChatService {

    void sendMessage(
        ChatMessage message,
        String email
);

}