package com.soubhagya.pingme.service;

import com.soubhagya.pingme.dto.chat.ChatMessage;
import com.soubhagya.pingme.dto.chat.TypingEvent;
import com.soubhagya.pingme.enums.MessageType;

import java.time.LocalDateTime;

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

void deleteForMe(
        Long messageId,
        String email
);

void forwardMessage(
        Long messageId,
        Long receiverId,
        String email
);

void setActiveConversation(
        Long friendId,
        String email
);

void createCallHistoryMessage(
        String callerEmail,
        String receiverEmail,
        MessageType messageType,
        String content,
        LocalDateTime endedAt
);

}
