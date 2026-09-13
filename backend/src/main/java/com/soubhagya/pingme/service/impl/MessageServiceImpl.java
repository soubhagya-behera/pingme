package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.dto.response.MessageResponse;
import com.soubhagya.pingme.dto.response.RecentChatResponse;
import com.soubhagya.pingme.entity.Message;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.enums.MessageStatus;
import com.soubhagya.pingme.enums.MessageType;
import com.soubhagya.pingme.repository.FriendRepository;
import com.soubhagya.pingme.repository.MessageRepository;
import com.soubhagya.pingme.repository.UserRepository;
import com.soubhagya.pingme.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import com.soubhagya.pingme.entity.ClearedConversation;
import com.soubhagya.pingme.entity.Friend;
import com.soubhagya.pingme.dto.response.ChatSidebarResponse;
import com.soubhagya.pingme.repository.ClearedConversationRepository;
import com.soubhagya.pingme.repository.HiddenMessageRepository;
import com.soubhagya.pingme.dto.chat.ReplyPreview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;

    private final UserRepository userRepository;
    private final FriendRepository friendRepository;
    private final HiddenMessageRepository hiddenMessageRepository;
    private final ClearedConversationRepository clearedConversationRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<MessageResponse> getChatHistory(

            String email,

            Long friendId,

            int page,

            int size

    ) {
        // H9: clamp pagination to prevent unbounded queries — defense in depth (controller also validates)
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);

        User sender =

                userRepository

                        .findByEmail(email)

                        .orElseThrow(

                                () ->

                                        new RuntimeException(

                                                "User not found"

                                        )

                        );

        User receiver =

                userRepository

                        .findById(friendId)

                        .orElseThrow(

                                () ->

                                        new RuntimeException(

                                                "Friend not found"

                                        )

                        );

        Pageable pageable =

                PageRequest.of(

                        safePage,

                        safeSize,

                        Sort.by("sentAt").descending()

                );

        java.util.Optional<ClearedConversation> clearedOpt = clearedConversationRepository.findByUserAndPeer(sender, receiver);
        java.time.LocalDateTime clearedAt = clearedOpt.map(ClearedConversation::getClearedAt).orElse(null);
        Page<Message> messages;
        if (clearedAt != null) {
            messages = messageRepository.getConversationAfter(sender, receiver, clearedAt, pageable);
        } else {
            messages = messageRepository.getConversation(sender, receiver, pageable);
        }

        List<MessageResponse> response =

                messages

                        .getContent()

                        .stream()

                        .filter(message ->
                                !Boolean.TRUE.equals(message.getDeletedForEveryone())
                        )

                        .filter(message ->

                                !hiddenMessageRepository.existsByMessageAndUser(

                                        message,

                                        sender

                                )

                        )

                        .map(this::toResponse)

                        .toList();

        return new PageImpl<>(

                response,

                pageable,

                messages.getTotalElements()

        );

    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageResponse> searchChatMessages(
            String email,
            Long friendId,
            String query,
            int limit
    ) {

        if (query == null || query.isBlank()) {
            return List.of();
        }

        User me =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "User not found"
                                        )
                        );

        User friend =
                userRepository
                        .findById(friendId)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Friend not found"
                                        )
                        );

        // Escape LIKE wildcards so user input is matched literally.
        String escaped = query.trim()
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");

        String pattern = "%" + escaped + "%";

        int safeLimit = Math.min(Math.max(limit, 1), 200);

        Pageable pageable =
                PageRequest.of(
                        0,
                        safeLimit,
                        Sort.by("sentAt").descending()
                );

        java.util.Optional<ClearedConversation> clearedOpt = clearedConversationRepository.findByUserAndPeer(me, friend);
        java.time.LocalDateTime clearedAt = clearedOpt.map(ClearedConversation::getClearedAt).orElse(null);
        List<Message> found;
        if (clearedAt != null) {
            found = messageRepository.searchConversationAfter(me, friend, pattern, clearedAt, pageable);
        } else {
            found = messageRepository.searchConversation(me, friend, pattern, pageable);
        }
        return found
                .stream()
                .filter(message ->
                        !hiddenMessageRepository.existsByMessageAndUser(
                                message,
                                me
                        )
                )
                .map(this::toResponse)
                .toList();

    }

    private MessageResponse toResponse(Message message) {

        return MessageResponse.builder()
                .id(
                        message.getId()
                )
                .clientMessageId(message.getClientMessageId())
                .senderId(
                        message.getSender().getId()
                )
                .receiverId(
                        message.getReceiver().getId()
                )
                .content(
                        message.getContent()
                )
                .attachmentUrl(
                        message.getAttachmentUrl()
                )
                .attachmentName(
                        message.getAttachmentName()
                )
                .attachmentSize(
                        message.getAttachmentSize()
                )
                .attachmentMimeType(
                        message.getAttachmentMimeType()
                )
                .attachmentDuration(
                        message.getAttachmentDuration()
                )
                .messageType(
                        message.getMessageType().name()
                )
                .status(
                        message.getStatus().name()
                )
                .sentAt(
                        message.getSentAt()
                )
                .reply(
                        message.getReplyTo() == null
                                ?
                                null
                                :
                                ReplyPreview.builder()
                                        .id(
                                                message.getReplyTo().getId()
                                        )
                                        .senderId(
                                                message.getReplyTo()
                                                        .getSender()
                                                        .getId()
                                        )
                                        .content(
                                                message.getReplyTo()
                                                        .getContent()
                                        )
                                        .attachmentUrl(
                                                message.getReplyTo()
                                                        .getAttachmentUrl()
                                        )
                                        .attachmentMimeType(
                                                message.getReplyTo()
                                                        .getAttachmentMimeType()
                                        )
                                        .build()
                )
                .edited(
                        message.getEdited()
                )
                .editedAt(
                        message.getEditedAt()
                )
                .deletedForEveryone(
                        message.getDeletedForEveryone()
                )
                .deletedAt(
                        message.getDeletedAt()
                )
                .forwarded(
message.getForwarded()
)

                .build();

    }


@Override
@Transactional(readOnly = true)
public List<RecentChatResponse> getRecentChats(String email) {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    List<Message> messages =
            messageRepository.findRecentMessages(user);

    // Build cleared map per peer for this user
    Map<Long, java.time.LocalDateTime> clearedMap = new HashMap<>();
    for (ClearedConversation cc : clearedConversationRepository.findByUser(user)) {
        clearedMap.put(cc.getPeer().getId(), cc.getClearedAt());
    }

    List<RecentChatResponse> chats = new ArrayList<>();

    List<Long> addedUsers = new ArrayList<>();

    for (Message message : messages) {
        // Skip messages that were cleared for this user
        Long peerId = message.getSender().getId().equals(user.getId()) ? message.getReceiver().getId() : message.getSender().getId();
        java.time.LocalDateTime clearedAt = clearedMap.get(peerId);
        if (clearedAt != null && !message.getSentAt().isAfter(clearedAt)) {
            continue;
        }


        User friend;

        if (message.getSender().getId().equals(user.getId())) {

            friend = message.getReceiver();

        } else {

            friend = message.getSender();

        }

        if (friend.getId().equals(user.getId())) {
            continue;
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
@Transactional(readOnly = true)
public List<ChatSidebarResponse> getChatSidebar(String email) {

    User me = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    List<Friend> friendships = friendRepository.findAllForUserWithUsers(me);
    List<Message> conversationMessages = messageRepository.findRecentMessages(me);
    Map<Long, java.time.LocalDateTime> clearedMapSidebar = new HashMap<>();
    for (ClearedConversation cc : clearedConversationRepository.findByUser(me)) {
        clearedMapSidebar.put(cc.getPeer().getId(), cc.getClearedAt());
    }
    Map<Long, Message> latestByFriend = new HashMap<>();
    Map<Long, Integer> unreadByFriend = new HashMap<>();

    for (Message message : conversationMessages) {
        User otherUser = message.getSender().getId().equals(me.getId())
                ? message.getReceiver() : message.getSender();
        if (otherUser.getId().equals(me.getId())) {
            continue;
        }
        java.time.LocalDateTime clearedAt = clearedMapSidebar.get(otherUser.getId());
        if (clearedAt != null && !message.getSentAt().isAfter(clearedAt)) {
            continue;
        }
        latestByFriend.putIfAbsent(otherUser.getId(), message);
        if (message.getReceiver().getId().equals(me.getId())
                && message.getStatus() == MessageStatus.DELIVERED) {
            unreadByFriend.merge(otherUser.getId(), 1, Integer::sum);
        }
    }

    List<ChatSidebarResponse> sidebar = new ArrayList<>();

    for (Friend friendship : friendships) {

        User friend;

        if (friendship.getUserOne().getId().equals(me.getId())) {

            friend = friendship.getUserTwo();

        } else {

            friend = friendship.getUserOne();

        }

        if (friend.getId().equals(me.getId())) {
            continue;
        }

        Message latestMessage = latestByFriend.get(friend.getId());
        int unreadCount = unreadByFriend.getOrDefault(friend.getId(), 0);

        sidebar.add(

                ChatSidebarResponse.builder()

                        .id(friend.getId())

                        .fullName(friend.getFullName())

                        .profilePicture(friend.getProfilePicture())

                        .online(friend.getOnline())

                        .lastSeen(friend.getLastSeen())

                        .lastMessage(

                                latestMessage == null

                                        ? null

                                        : sidebarPreview(latestMessage)

                        )

                        .lastMessageTime(

                                latestMessage == null

                                        ? null

                                        : latestMessage.getSentAt()

                        )

                        .unreadCount(

                                unreadCount

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

private String sidebarPreview(Message message) {
    if (message.getMessageType() == MessageType.AUDIO_CALL) return "📞 " + message.getContent();
    if (message.getMessageType() == MessageType.VIDEO_CALL) return "📹 " + message.getContent();
    if (message.getContent() != null && !message.getContent().isBlank()) return message.getContent();
    String mimeType = message.getAttachmentMimeType();
    if (mimeType == null || mimeType.isBlank()) return "";
    if (mimeType.startsWith("image/")) return "📷 Photo";
    if (mimeType.equals("application/pdf")) return "📄 PDF";
    if (mimeType.startsWith("audio/")) return "🎵 Audio";
    if (mimeType.startsWith("video/")) return "📹 Video";
    return "📁 File";
}

}
