package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.dto.response.MessageResponse;
import com.soubhagya.pingme.dto.response.RecentChatResponse;
import com.soubhagya.pingme.entity.Message;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.repository.MessageRepository;
import com.soubhagya.pingme.repository.UserRepository;
import com.soubhagya.pingme.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import com.soubhagya.pingme.dto.response.RecentChatResponse;


@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;

    private final UserRepository userRepository;

    @Override
    public List<MessageResponse> getChatHistory(

        String email,

        Long friendId) {

        User sender =
        userRepository.findByEmail(email)

                .orElseThrow(() ->

                        new RuntimeException(

                                "User not found"

                        ));

        User receiver =
        userRepository.findById(friendId)

                .orElseThrow(() ->

                        new RuntimeException(

                                "Friend not found"

                        ));

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

                        .content(message.getContent())

                        .messageType(message.getMessageType().name())

                        .status(message.getStatus().name())

                        .sentAt(message.getSentAt())

                        .build())

                .collect(Collectors.toList());

    }


@Override
public List<RecentChatResponse> getRecentChats(String email) {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    List<Message> messages =
            messageRepository.findRecentMessages(user);

    List<RecentChatResponse> chats = new ArrayList<>();

    List<Long> addedUsers = new ArrayList<>();

    for (Message message : messages) {

        User friend;

        if (message.getSender().getId().equals(user.getId())) {

            friend = message.getReceiver();

        } else {

            friend = message.getSender();

        }

        if (addedUsers.contains(friend.getId())) {

            continue;

        }

        addedUsers.add(friend.getId());

        chats.add(

                RecentChatResponse.builder()

                        .id(friend.getId())

                        .fullName(friend.getFullName())

                        .profilePicture(friend.getProfilePicture())

                        .online(friend.getOnline())

                        .lastMessage(message.getContent())

                        .lastMessageTime(message.getSentAt())

                        .build()

        );

    }

    return chats;

}

}