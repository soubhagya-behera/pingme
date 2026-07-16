package com.soubhagya.pingme.service;

import com.soubhagya.pingme.dto.chat.ChatMessage;

public interface ChatService {

    void sendMessage(
        ChatMessage message,
        String email
);

void markAsDelivered(Long messageId, String receiverEmail);

void markAsRead(Long messageId, String receiverEmail);

void markConversationAsRead(
        Long friendId,
        String email
);

void replayUndeliveredMessages(String receiverEmail);



}
