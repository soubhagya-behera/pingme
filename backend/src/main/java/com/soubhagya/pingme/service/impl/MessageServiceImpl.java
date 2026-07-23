package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.dto.response.MessageResponse;
import com.soubhagya.pingme.dto.response.RecentChatResponse;
import com.soubhagya.pingme.entity.Message;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.enums.MessageStatus;
import com.soubhagya.pingme.repository.FriendRepository;
import com.soubhagya.pingme.repository.MessageRepository;
import com.soubhagya.pingme.repository.UserRepository;
import com.soubhagya.pingme.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.soubhagya.pingme.entity.Friend;
import com.soubhagya.pingme.dto.response.ChatSidebarResponse;
import com.soubhagya.pingme.repository.HiddenMessageRepository;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;

    private final UserRepository userRepository;
    private final FriendRepository friendRepository;
    private final HiddenMessageRepository hiddenMessageRepository;

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

        messages = messages.stream()

        .filter(message ->

                !hiddenMessageRepository.existsByMessageAndUser(
                        message,
                        sender
                )

        )

        .toList();

        return messages.stream()

                .map(message -> MessageResponse.builder()

                        .id(message.getId())

                        .senderId(message.getSender().getId())

                        .receiverId(message.getReceiver().getId())

                        .content(message.getContent())

                        .imageUrl(message.getImageUrl())

                        .messageType(message.getMessageType().name())

                        .status(message.getStatus().name())

                        .sentAt(message.getSentAt())

                        .deletedForEveryone(message.getDeletedForEveryone())

                        .deletedAt(message.getDeletedAt())

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

@Override
public List<ChatSidebarResponse> getChatSidebar(String email) {

    User me = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    List<Friend> friendships = new ArrayList<>();

    friendships.addAll(

            friendRepository.findByUserOne(me)

    );

    friendships.addAll(

            friendRepository.findByUserTwo(me)

    );

    List<ChatSidebarResponse> sidebar = new ArrayList<>();

    for (Friend friendship : friendships) {

        User friend;

        if (friendship.getUserOne().getId().equals(me.getId())) {

            friend = friendship.getUserTwo();

        } else {

            friend = friendship.getUserOne();

        }

        List<Message> messages =
                messageRepository.findLatestConversationMessages(

                        me,

                        friend

                );

        Message latestMessage =

                messages.isEmpty()

                        ? null

                        : messages.get(0);

        long unreadCount =
        messageRepository.countBySenderAndReceiverAndStatus(

                friend,

                me,

                MessageStatus.DELIVERED

        );

        sidebar.add(

                ChatSidebarResponse.builder()

                        .id(friend.getId())

                        .fullName(friend.getFullName())

                        .profilePicture(friend.getProfilePicture())

                        .online(friend.getOnline())

                        .lastMessage(

                                latestMessage == null

                                        ? null

                                        : latestMessage.getContent()

                        )

                        .lastMessageTime(

                                latestMessage == null

                                        ? null

                                        : latestMessage.getSentAt()

                        )

                        .unreadCount(

                                (int) unreadCount

                        )

                        .build()

        );

    }

    sidebar.sort(

            (a, b) -> {

                if (a.getLastMessageTime() == null &&
                        b.getLastMessageTime() == null) {

                    return a.getFullName()

                            .compareToIgnoreCase(

                                    b.getFullName()

                            );

                }

                if (a.getLastMessageTime() == null)

                    return 1;

                if (b.getLastMessageTime() == null)

                    return -1;

                return b.getLastMessageTime()

                        .compareTo(

                                a.getLastMessageTime()

                        );

            }

    );

    return sidebar;

}

}
