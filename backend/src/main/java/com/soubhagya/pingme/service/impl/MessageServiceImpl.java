package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.dto.response.MessageResponse;
import com.soubhagya.pingme.entity.Message;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.repository.MessageRepository;
import com.soubhagya.pingme.repository.UserRepository;
import com.soubhagya.pingme.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;

    private final UserRepository userRepository;

    @Override
    public List<MessageResponse> getChatHistory(
            Long senderId,
            Long receiverId) {

        User sender = userRepository.findById(senderId)
                .orElseThrow(() ->
                        new RuntimeException("Sender not found"));

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() ->
                        new RuntimeException("Receiver not found"));

        List<Message> messages =
        messageRepository.getConversation(
                sender,
                receiver
        );

        return messages.stream()

                .map(message -> MessageResponse.builder()

                        .id(message.getId())

                        .senderId(message.getSender().getId())

                        .receiverId(message.getReceiver().getId())

                        .message(message.getContent())

                        .messageType(message.getMessageType().name())

                        .status(message.getStatus().name())

                        .sentAt(message.getSentAt())

                        .build())

                .collect(Collectors.toList());

    }

}