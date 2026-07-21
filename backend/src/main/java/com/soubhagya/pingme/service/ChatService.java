package com.soubhagya.pingme.service;

import com.soubhagya.pingme.dto.chat.ChatMessage;
import com.soubhagya.pingme.dto.chat.TypingEvent;

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

void sendTypingEvent(

        TypingEvent event,

        String senderEmail

);

void editMessage(

        Long messageId,

        String content,

        String email

);

void deleteForEveryone(
        Long messageId,
        String email
);

}
