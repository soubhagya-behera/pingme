package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.dto.chat.ChatMessage;
import com.soubhagya.pingme.entity.Message;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.enums.MessageStatus;
import com.soubhagya.pingme.enums.MessageType;
import com.soubhagya.pingme.repository.FriendRepository;
import com.soubhagya.pingme.repository.MessageRepository;
import com.soubhagya.pingme.repository.UserRepository;
import com.soubhagya.pingme.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.soubhagya.pingme.websocket.MessageStatusUpdate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final UserRepository userRepository;

    private final MessageRepository messageRepository;

    private final SimpMessagingTemplate messagingTemplate;

    private final FriendRepository friendRepository;
    
    @Override
    public void sendMessage(
        ChatMessage chatMessage,
        String email) {

                System.out.println("sendMessage() called");

        User sender = userRepository.findByEmail(email)
        .orElseThrow(() ->
                new RuntimeException("Sender not found"));

        User receiver = userRepository.findById(chatMessage.getReceiverId())
                .orElseThrow(() ->
                        new RuntimeException("Receiver not found"));

                        boolean areFriends =
        friendRepository
                .existsByUserOneAndUserTwoOrUserOneAndUserTwo(

                        sender,

                        receiver,

                        receiver,

                        sender

                );

if (!areFriends) {

    throw new RuntimeException(

            "You can only chat with accepted friends."

    );

}

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .content(chatMessage.getContent())
                .messageType(MessageType.TEXT)
                .status(MessageStatus.SENT)
                .sentAt(LocalDateTime.now())
                .build();

        Message savedMessage = messageRepository.save(message);

ChatMessage dto = ChatMessage.builder()

        .id(savedMessage.getId())

        // ⭐ NEW
        .clientId(chatMessage.getClientId())

        .senderId(sender.getId())

        .receiverId(receiver.getId())

        .content(savedMessage.getContent())

        .sentAt(savedMessage.getSentAt())

        .status(savedMessage.getStatus().name())

        .build();

messagingTemplate.convertAndSend(

        "/topic/messages/" + receiver.getId(),

        dto

);

messagingTemplate.convertAndSend(

        "/topic/messages/" + sender.getId(),

        dto

);

System.out.println("Message Saved & Broadcast Successfully");

    }

@Override
public void markAsDelivered(Long messageId) {

        System.out.println("markAsDelivered() called");
    System.out.println("DELIVER REQUEST : " + messageId);

    Message message = messageRepository.findById(messageId)
            .orElseThrow(() ->
                    new RuntimeException("Message not found"));

    System.out.println("Current Status : " + message.getStatus());

    if (message.getStatus() == MessageStatus.SENT) {

        System.out.println("Updating to DELIVERED");

        message.setStatus(MessageStatus.DELIVERED);

        messageRepository.save(message);

        messagingTemplate.convertAndSend(

                "/topic/status/" + message.getSender().getId(),

                MessageStatusUpdate.builder()

                        .messageId(message.getId())

                        .status("DELIVERED")

                        .build()

        );

        System.out.println("DELIVERED EVENT SENT");

    }

}

@Override
public void markAsRead(Long messageId) {

        System.out.println("markAsRead() called");
    Message message = messageRepository.findById(messageId)

            .orElseThrow(() ->
                    new RuntimeException("Message not found"));

    if(message.getStatus() != MessageStatus.READ){

        message.setStatus(MessageStatus.READ);

        messageRepository.save(message);

        messagingTemplate.convertAndSend(

                "/topic/status/" + message.getSender().getId(),

                MessageStatusUpdate.builder()

                        .messageId(message.getId())

                        .status("READ")

                        .build()

        );

    }

}

@Override
public void markConversationAsRead(
        Long friendId,
        String email
) {

    User receiver = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    User sender = userRepository.findById(friendId)
            .orElseThrow(() ->
                    new RuntimeException("Friend not found"));

    List<Message> unreadMessages =
            messageRepository.findBySenderAndReceiverAndStatus(
                    sender,
                    receiver,
                    MessageStatus.DELIVERED
            );

    for (Message message : unreadMessages) {

        message.setStatus(MessageStatus.READ);

        messageRepository.save(message);

        messagingTemplate.convertAndSend(
                "/topic/status/" + sender.getId(),
                MessageStatusUpdate.builder()
                        .messageId(message.getId())
                        .status("READ")
                        .build()
        );
    }
}

}