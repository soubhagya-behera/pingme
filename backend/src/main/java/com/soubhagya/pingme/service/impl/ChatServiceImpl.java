package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.dto.chat.ChatMessage;
import com.soubhagya.pingme.entity.Message;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.enums.MessageStatus;
import com.soubhagya.pingme.enums.MessageType;
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

    @Override
    public void sendMessage(ChatMessage chatMessage) {

        User sender = userRepository.findById(chatMessage.getSenderId())
                .orElseThrow(() ->
                        new RuntimeException("Sender not found"));

        User receiver = userRepository.findById(chatMessage.getReceiverId())
                .orElseThrow(() ->
                        new RuntimeException("Receiver not found"));

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .content(chatMessage.getContent())
                .messageType(MessageType.TEXT)
                .status(MessageStatus.SENT)
                .sentAt(LocalDateTime.now())
                .build();

        Message savedMessage = messageRepository.save(message);

messagingTemplate.convertAndSendToUser(

        receiver.getEmail(),

        "/queue/messages",

        ChatMessage.builder()

                .senderId(sender.getId())

                .receiverId(receiver.getId())

                .content(savedMessage.getContent())

                .build()

);

System.out.println("Message Saved & Delivered");

    }

}