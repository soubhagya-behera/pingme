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

messagingTemplate.convertAndSend(

        "/topic/messages/" + receiver.getId(),

        ChatMessage.builder()

        .receiverId(receiver.getId())

        .content(savedMessage.getContent())

        .sentAt(savedMessage.getSentAt())

        .build()

);

System.out.println("Message Saved & Broadcast Successfully");

    }

}